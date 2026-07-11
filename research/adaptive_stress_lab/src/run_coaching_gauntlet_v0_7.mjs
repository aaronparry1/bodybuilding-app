import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { deriveEvidenceQuality, evidenceConfidenceScore, explicitEvidenceDrivers, sameExerciseSuccessfulExposureCount } from "./evidence_detail.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { gauntletScenariosV0_6 } from "../gauntlet/scenarios_v0_6.mjs";
import { gauntletScenariosV0_7 } from "../gauntlet/scenarios_v0_7.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals", "systemicSignals", "trainingContinuity", "evidenceQuality"];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const reportPath = join(repoRoot, "reports", "adaptive_stress_lab", "coaching_gauntlet_v0_7.md");
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const generatedAt = new Date();

const v06Results = runScenarios(gauntletScenariosV0_6);
const results = runScenarios(gauntletScenariosV0_7);
const changed = compareResults(v06Results, results);

validateResults(results);

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, renderReport({ results, changed, generatedAt }), "utf8");

console.log("Coaching Gauntlet v0.7 complete");
console.log(`Scenarios: ${results.length}`);
console.log(`Passed: ${results.filter((result) => result.score.pass).length}`);
console.log(`Failed: ${results.filter((result) => !result.score.pass).length}`);
console.log(`Changed decisions from v0.6: ${changed.length}`);
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
  if (items.length < 224) throw new Error(`Expected at least 224 scenarios, got ${items.length}`);
  for (const result of items) {
    const evidence = result.scenario.evidence;
    if (evidence.evidenceModelVersion !== "v0.7") throw new Error(`${result.scenario.id} missing v0.7 evidence model marker`);
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

  return `# Coaching Gauntlet v0.7

Generated: ${generatedAt.toISOString()}

## Scope

The Coaching Gauntlet v0.7 removes supplied \`evidenceQuality\` from new scenario inputs. Evidence quality must be earned from explicit session history, exercise history, source quality, planned-vs-extra evidence, working-set completeness, recency, and consistency.

## Pass/Fail Summary

- Total scenarios: ${results.length}
- Passed: ${passed.length}
- Failed: ${failed.length}
- Pass rate: ${Math.round((passed.length / results.length) * 100)}%
- Decisions changed from v0.6: ${changed.length}

## Evidence Quality Derivation

Derived evidence quality uses:

- \`data_completeness\`
- \`recency\`
- \`planned_evidence\`
- \`comparable_exposures\`
- \`source_quality\`
- \`consistency\`
- \`final_score\`

${renderQualityExamples(results)}

## Push Threshold Examples

Push now requires high derived evidence quality, at least three successful comparable exposures of the same exercise, Safety Gate clear, strong recovery capacity, strong momentum, no recent shutdown/pain flags, no swap/new-exercise uncertainty, and a positive push signal.

${renderSelected(results, [
  "v07_pattern_improves_same_exercise_missing",
  "v07_same_exercise_three_successes_push",
  "v07_same_exercise_two_successes_hold",
  "v07_new_exercise_blocks_push",
  "v07_post_swap_one_exposure_blocks_push",
  "v07_post_swap_three_successes_permit_push",
])}

## Recover Threshold Examples

Recover now requires stricter systemic evidence. Thin, local, or compressed-spacing fatigue consolidates or reduces rather than becoming a whole-programme recovery recommendation.

${renderSelected(results, [
  "v07_systemic_fatigue_enough_evidence_recovers",
  "v07_systemic_looking_low_evidence_consolidates",
  "v07_local_decline_only_reduces",
  "v07_multiple_movement_declines_recover",
  "v07_poor_response_after_rest_recovers",
  "v07_recovery_request_without_objective_evidence_holds",
])}

## Safety Wording Examples

Safety vetoes are unchanged. Low confidence changes wording only.

${renderSelected(results, [
  "v07_low_confidence_safety_caution_wording",
  "v07_high_confidence_safety_caution_wording",
  "v07_severe_pain_low_evidence_veto",
  "v07_severe_pain_high_evidence_veto",
])}

## Level Summary

${renderLevelSummary(results)}

## Recommendation Distribution

${renderDistribution(results)}

## Decisions Changed From v0.6

${changed.length ? changed.map(renderChangedDecision).join("\n") : "- No recommendation, aggressiveness, or Safety Gate status changed versus v0.6."}

## Failed Scenarios

${failed.length ? failed.map(renderScenarioSummary).join("\n") : "- No failed scenarios in this run."}

## Remaining Broad Assumptions

- Evidence quality weights are transparent research heuristics, not validated production weights.
- Same-exercise push threshold is intentionally conservative and may need goal-specific calibration.
- Recover threshold now prefers under-recovery to be proven systemically; Aaron should approve whether this is conservative enough.
- Source quality still comes from explicit evidence-confidence factors in the lab; production must derive those factors from actual data provenance.

## Open Aaron Decisions

1. Are the v0.7 derived-quality weights acceptable as a research default?
2. Should push always require the exact same exercise, or can close variants earn partial future credit?
3. Should recover require shutdown evidence, or can repeated below-minimum events across patterns be enough when session spacing is normal?
4. Should low-confidence Safety Gate language be used in eventual user-facing copy, or kept internal for now?

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
  return id.replace(/^v07_/, "").replace(/^v06_/, "").replace(/^v05_/, "").replace(/^v04_/, "").replace(/^v03_/, "").replace(/^v02_/, "");
}

function renderQualityExamples(results) {
  return renderSelected(results, [
    "v07_high_quality_many_planned_sessions",
    "v07_low_quality_one_session",
    "v07_extra_session_noise_low_planned",
    "v07_warmup_only_low_quality",
  ]);
}

function renderSelected(results, ids) {
  return ids.map((id) => {
    const result = results.find((item) => item.scenario.id === id);
    if (!result) return `- \`${id}\`: missing`;
    const quality = deriveEvidenceQuality(result.scenario.evidence);
    return `- \`${id}\`: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`, Safety Gate \`${result.safetyGate.status}\`, quality ${quality.final_score} (data ${quality.data_completeness}, recency ${quality.recency}, planned ${quality.planned_evidence}, comparable ${quality.comparable_exposures}, source ${quality.source_quality}, consistency ${quality.consistency}), same-exercise successes ${sameExerciseSuccessfulExposureCount(result.scenario.evidence)}, recommendation confidence ${result.recommendation.confidence}`;
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
- v0.6: \`${item.old.recommendation.recommendation_type}\` / \`${item.old.recommendation.aggressiveness}\`, Safety Gate \`${item.old.safetyGate.status}\`
- v0.7: \`${item.current.recommendation.recommendation_type}\` / \`${item.current.recommendation.aggressiveness}\`, Safety Gate \`${item.current.safetyGate.status}\`
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
  const quality = deriveEvidenceQuality(result.scenario.evidence);
  return `### ${result.scenario.id}

- Title: ${result.scenario.title}
- Level: ${result.scenario.level_label}
- Athlete profile: ${result.athlete.label}
- Safety Gate: \`${result.safetyGate.status}\`, veto ${result.safetyGate.veto}, confidence ${result.safetyGate.confidence}
- Actual recommendation: \`${result.recommendation.recommendation_type}\` / \`${result.recommendation.aggressiveness}\`
- Pass: ${result.score.pass}
- Score: ${result.score.percentage}%
- Evidence drivers: ${explicitEvidenceDrivers(result.scenario.evidence).join(", ")}
- Evidence quality score: ${evidenceConfidenceScore(result.scenario.evidence)}
- Derived quality breakdown: data ${quality.data_completeness}, recency ${quality.recency}, planned ${quality.planned_evidence}, comparable ${quality.comparable_exposures}, source ${quality.source_quality}, consistency ${quality.consistency}, final ${quality.final_score}
- Same-exercise successful exposures: ${sameExerciseSuccessfulExposureCount(result.scenario.evidence)}
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
