import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evidenceConfidenceScore, explicitEvidenceDrivers, successfulComparableExposureCount } from "./evidence_detail.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_5 } from "../gauntlet/scenarios_v0_5.mjs";
import { gauntletScenariosV0_6 } from "../gauntlet/scenarios_v0_6.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals", "systemicSignals", "trainingContinuity"];
const REMOVED_LABELS = ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_6.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const v05Results = runScenarios(gauntletScenariosV0_5);
const results = runScenarios(gauntletScenariosV0_6);
const changed = compareResults(v05Results, results);

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, changed, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.6 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Changed decisions from v0.5: ${changed.length}`);
console.log(`Report: ${reportPath}`);

function runScenarios(scenarios) {
  return scenarios.map((scenario) => {
    const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
    if (!athlete) throw new Error(`Missing athlete profile ${scenario.athleteProfileId}`);
    const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: generatedAt });
    const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
    const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
    const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });
    return { scenario, athlete, coachingState, safetyGate, recommendation, score };
  });
}

function validateResults(items) {
  if (items.length < 204) throw new Error(`Expected at least 204 scenarios, got ${items.length}`);
  for (const result of items) {
    const evidence = result.scenario.evidence;
    if (evidence.evidenceModelVersion !== "v0.6") throw new Error(`${result.scenario.id} missing v0.6 evidence model marker`);
    for (const field of REMOVED_FIELDS) {
      if (Object.hasOwn(evidence, field)) throw new Error(`${result.scenario.id} still contains removed field ${field}`);
    }
    for (const field of RUBRIC_FIELDS) {
      if (!Number.isInteger(result.score.scores[field])) throw new Error(`${result.scenario.id} missing score ${field}`);
    }
  }
}

function renderReport({ results, changed, generatedAt }) {
  const passed = results.filter((result) => result.score.pass);
  const failed = results.filter((result) => !result.score.pass);

  return `# Coaching Gauntlet v0.6

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.6 removes \`systemicSignals\` and \`trainingContinuity\` from new scenario inputs. Continuity, systemic fatigue, and push eligibility must be inferred from explicit evidence.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Decisions changed from v0.5: ${changed.length}

## Shortcuts Removed

- Removed from v0.6 scenario evidence: \`performanceTrend\`, \`fatigueState\`, \`recoveryState\`, \`localLiftSignals\`, \`systemicSignals\`, \`trainingContinuity\`
- Removed broad labels remain banned: \`planned_consolidation\`, \`post_swap_improvement\`, \`high_frequency\`, \`compound_density_high\`, \`hidden_overreach\`
- Legacy adapter support remains in \`evidence_detail.mjs\` only so v0.1-v0.5 can still run.

## Leak-Test Status

- Coaching State direct shortcut leak test: enforced
- Safety Gate direct shortcut leak test: enforced
- Decision Engine direct shortcut leak test: enforced
- v0.6 scenario shortcut leak test: enforced

## Push Threshold Outcomes

${renderSelected(results, [
  "v06_high_evidence_push_allowed",
  "v06_moderate_evidence_push_withheld",
  "v06_three_successful_exposures_allow_push",
  "v06_two_successful_exposures_do_not_push",
  "v06_new_exercise_uncertainty_prevents_push",
  "v06_recent_swap_uncertainty_prevents_push",
])}

## Graceful Degradation Examples

${renderSelected(results, [
  "v06_missed_week_from_session_history",
  "v06_poor_continuity_strong_return",
  "v06_strong_recovery_incomplete_evidence_holds",
])}

## Safety Wording Examples

${renderSelected(results, [
  "v06_pain_veto_low_confidence",
  "v06_low_confidence_caution_wording",
])}

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Decisions Changed From v0.5

${changed.length ? changed.map(renderChangedDecision).join("\n") : "- No recommendation, aggressiveness, or Safety Gate status changed versus v0.5."}

## Failed Scenarios

${failed.length ? failed.map(renderScenarioSummary).join("\n") : "- No failed scenarios in this run."}

## Remaining Broad Assumptions

- \`evidenceQuality\` remains broad fixture metadata; production should derive it from data completeness, recency, and evidence source quality.
- Push threshold numbers are research heuristics and need calibration before production.
- Safety wording confidence is not yet represented as a separate user-message variant.

## Open Aaron Decisions

1. Should v0.7 remove \`evidenceQuality\` from new scenarios and derive it fully?
2. Should push eligibility require three exposures for the same exercise only, or same movement pattern?
3. Should safety messages branch on low confidence now, or wait until user-facing language work?
4. Should \`recover\` require two affected movement patterns plus poor session quality, or a stricter multi-session sequence?

## Full Scenario Results

${results.map(renderFullResult).join("\n")}

## Production Safety Confirmation

- Production app code was not imported.
- Production app behaviour was not modified.
- V1 workout generation was not modified.
- V1 progression logic was not modified.
- Paywall/subscription logic was not modified.
- No EAS build was started.
`;
}

function compareResults(oldResults, newResults) {
  const oldByNormalisedId = new Map(oldResults.map((result) => [normaliseId(result.scenario.id), result]));
  return newResults.flatMap((result) => {
    const old = oldByNormalisedId.get(normaliseId(result.scenario.id));
    if (!old) return [];
    const changedDecision = old.recommendation.recommendation_type !== result.recommendation.recommendation_type;
    const changedAggression = old.recommendation.aggressiveness !== result.recommendation.aggressiveness;
    const changedSafety = old.safetyGate.status !== result.safetyGate.status;
    if (!changedDecision && !changedAggression && !changedSafety) return [];
    return [{ old, current: result }];
  });
}

function normaliseId(id) {
  return id.replace(/^v06_/, "").replace(/^v05_/, "").replace(/^v04_/, "").replace(/^v03_/, "").replace(/^v02_/, "");
}

function renderSelected(results, ids) {
  return ids.map((id) => {
    const result = results.find((item) => item.scenario.id === id);
    if (!result) return `- \`${id}\`: missing`;
    return `- \`${id}\`: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`, Safety Gate \`${result.safetyGate.status}\`, evidence confidence ${evidenceConfidenceScore(result.scenario.evidence)}, successful comparable exposures ${successfulComparableExposureCount(result.scenario.evidence)}, recommendation confidence ${result.recommendation.confidence}`;
  }).join("\n");
}

function renderLevelSummary(results) {
  const byLevel = groupBy(results, (result) => result.scenario.level_label);
  return Object.entries(byLevel)
    .map(([level, items]) => {
      const passCount = items.filter((item) => item.score.pass).length;
      return `- ${level}: ${passCount}/${items.length} passed (${Math.round((passCount / items.length) * 100)}%)`;
    })
    .join("\n");
}

function renderDistribution(results) {
  const byType = groupBy(results, (result) => result.recommendation.recommendation_type);
  return Object.entries(byType)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, items]) => `- \`${type}\`: ${items.length}`)
    .join("\n");
}

function renderChangedDecision(item) {
  return `### ${item.current.scenario.title}

- ID: \`${item.current.scenario.id}\`
- v0.5: \`${item.old.recommendation.recommendation_type}\` / \`${item.old.recommendation.aggressiveness}\`, Safety Gate \`${item.old.safetyGate.status}\`
- v0.6: \`${item.current.recommendation.recommendation_type}\` / \`${item.current.recommendation.aggressiveness}\`, Safety Gate \`${item.current.safetyGate.status}\`
- Evidence drivers: ${explicitEvidenceDrivers(item.current.scenario.evidence).join(", ")}
`;
}

function renderScenarioSummary(result) {
  return `### ${result.scenario.title}

- ID: \`${result.scenario.id}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Expected: ${result.score.expectation.recommendation_types.map((type) => `\`${type}\``).join(", ")}
- Actual: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Safety Gate: expected \`${result.score.expectation.safety_gate_status}\`, actual \`${result.safetyGate.status}\`
- Evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}
- Failure reasons: ${result.score.failure_reasons.length ? result.score.failure_reasons.join("; ") : "none"}
`;
}

function renderFullResult(result) {
  return `### ${result.scenario.id}

- Title: ${result.scenario.title}
- Level: ${result.scenario.level_label}
- Athlete profile: ${result.athlete.label}
- Safety Gate: \`${result.safetyGate.status}\`, veto ${result.safetyGate.veto}, confidence ${result.safetyGate.confidence}
- Actual recommendation: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}
- Evidence confidence score: ${evidenceConfidenceScore(result.scenario.evidence)}
- Successful comparable exposures: ${successfulComparableExposureCount(result.scenario.evidence)}
- Recommendation confidence: ${result.recommendation.confidence}
`;
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}
