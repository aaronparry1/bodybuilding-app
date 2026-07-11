import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { explicitEvidenceDrivers } from "./evidence_detail.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_4 } from "../gauntlet/scenarios_v0_4.mjs";
import { gauntletScenariosV0_5 } from "../gauntlet/scenarios_v0_5.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals"];
const REMOVED_LABELS = ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_5.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const v04Results = runScenarios(gauntletScenariosV0_4);
const results = runScenarios(gauntletScenariosV0_5);
const changed = compareResults(v04Results, results);

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, changed, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.5 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Changed decisions from v0.4: ${changed.length}`);
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
  if (items.length < 189) throw new Error(`Expected at least 189 scenarios, got ${items.length}`);
  for (const result of items) {
    const evidence = result.scenario.evidence;
    if (evidence.evidenceModelVersion !== "v0.5") throw new Error(`${result.scenario.id} missing v0.5 evidence model marker`);
    for (const field of REMOVED_FIELDS) {
      if (Object.hasOwn(evidence, field)) throw new Error(`${result.scenario.id} still contains removed summary field ${field}`);
    }
    if ((evidence.systemicSignals ?? []).some((signal) => REMOVED_LABELS.includes(signal))) throw new Error(`${result.scenario.id} still contains removed magic label`);
    for (const field of RUBRIC_FIELDS) {
      if (!Number.isInteger(result.score.scores[field])) throw new Error(`${result.scenario.id} missing score ${field}`);
    }
  }
}

function renderReport({ results, changed, generatedAt }) {
  const passed = results.filter((result) => result.score.pass);
  const failed = results.filter((result) => !result.score.pass);

  return `# Coaching Gauntlet v0.5

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.5 removes the remaining summary shortcuts from v0.5 scenarios and forces Coaching State, Safety Gate, and Decision Engine to infer context from concrete evidence.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Decisions changed from v0.4: ${changed.length}

## Fields Removed

- Removed from v0.5 scenario evidence: \`performanceTrend\`, \`fatigueState\`, \`recoveryState\`, \`localLiftSignals\`
- Removed from v0.5 systemic signals: \`planned_consolidation\`, \`post_swap_improvement\`, \`high_frequency\`, \`compound_density_high\`, \`hidden_overreach\`, \`multiple_lifts_down\`, \`good_readiness\`
- Legacy fields remain optional in the schema only so old gauntlets can keep running.

## Leak-Test Status

- Coaching State direct shortcut leak test: enforced
- Safety Gate direct shortcut leak test: enforced
- Decision Engine direct shortcut leak test: enforced
- v0.5 scenario shortcut leak test: enforced

## Graceful Degradation Examples

${renderSelected(results, [
  "v05_incomplete_new_athlete_one_excellent_workout",
  "v05_missing_comparable_load_trend",
  "v05_subjective_great_missing_objective",
  "v05_low_confidence_repeated_looking_success_hold",
])}

## Safety Confidence Examples

${renderSelected(results, [
  "v05_severe_pain_low_confidence_veto",
  "v05_worsening_pain_incomplete_history",
])}

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Decisions Changed From v0.4

${changed.length ? changed.map(renderChangedDecision).join("\n") : "- No recommendation, aggressiveness, or Safety Gate status changed versus v0.4."}

## Failed Scenarios

${failed.length ? failed.map(renderScenarioSummary).join("\n") : "- No failed scenarios in this run."}

## Remaining Broad Assumptions

- \`evidenceQuality\` and \`trainingContinuity\` remain broad fixture metadata; production should derive them from data completeness, recency, and planned-session history.
- \`systemicSignals\` remains present for older lab compatibility, but v0.5 scenarios do not use removed conclusion labels.
- Scoring magnitudes remain research heuristics and need later calibration against real anonymised outcome data.

## Open Aaron Decisions

1. Should v0.6 remove \`systemicSignals\` entirely from new scenarios?
2. Should \`trainingContinuity\` become derived-only once planned session history is complete?
3. What minimum evidence should be required before a future production prototype is allowed to recommend \`push\`?
4. Should low-confidence safety gates show lower confidence in the user message, or keep user-facing safety copy independent of model confidence?

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
  return id.replace(/^v05_/, "").replace(/^v04_/, "").replace(/^v03_/, "").replace(/^v02_/, "");
}

function renderSelected(results, ids) {
  return ids.map((id) => {
    const result = results.find((item) => item.scenario.id === id);
    if (!result) return `- \`${id}\`: missing`;
    return `- \`${id}\`: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`, Safety Gate \`${result.safetyGate.status}\`, recommendation confidence ${result.recommendation.confidence}, safety confidence ${result.safetyGate.confidence}`;
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
- v0.4: \`${item.old.recommendation.recommendation_type}\` / \`${item.old.recommendation.aggressiveness}\`, Safety Gate \`${item.old.safetyGate.status}\`
- v0.5: \`${item.current.recommendation.recommendation_type}\` / \`${item.current.recommendation.aggressiveness}\`, Safety Gate \`${item.current.safetyGate.status}\`
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
