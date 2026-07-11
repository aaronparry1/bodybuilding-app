import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_5 } from "../gauntlet/scenarios_v0_5.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals"];
const REMOVED_LABELS = ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"];
const ENGINE_FORBIDDEN_STRINGS = [...REMOVED_FIELDS, ...REMOVED_LABELS];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenariosV0_5.length >= 189, "v0.5 gauntlet should contain at least 189 scenarios");
assert.equal(new Set(gauntletScenariosV0_5.map((scenario) => scenario.id)).size, gauntletScenariosV0_5.length);

for (const scenario of gauntletScenariosV0_5) {
  assert.equal(scenario.evidence.evidenceModelVersion, "v0.5", `${scenario.id} missing v0.5 model marker`);
  for (const field of REMOVED_FIELDS) {
    assert.ok(!Object.hasOwn(scenario.evidence, field), `${scenario.id} still contains removed summary field ${field}`);
  }
  assert.ok(!scenario.evidence.systemicSignals.some((signal) => REMOVED_LABELS.includes(signal)), `${scenario.id} contains removed magic label`);
  assertMandatoryEvidence(scenario.evidence, scenario.id);
}

await assertNoEngineShortcutLeaks();

const results = gauntletScenariosV0_5.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete ${scenario.athleteProfileId}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: fixedNow });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });

  for (const field of RUBRIC_FIELDS) {
    assert.ok(score.scores[field] >= 1 && score.scores[field] <= 5, `${scenario.id} invalid ${field}`);
  }
  return { scenario, recommendation, safetyGate, score };
});

assert.equal(results.filter((result) => !result.score.pass).length, 0, "v0.5 gauntlet should pass without summary shortcuts");

assert.equal(resultFor("v05_incomplete_new_athlete_one_excellent_workout").recommendation.recommendation_type, "hold");
assert.ok(["reduce", "hold"].includes(resultFor("v05_incomplete_new_athlete_one_poor_workout").recommendation.recommendation_type));
assert.equal(resultFor("v05_missing_comparable_load_trend").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v05_subjective_great_missing_objective").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v05_severe_pain_low_confidence_veto").safetyGate.status, "stop");
assert.equal(resultFor("v05_severe_pain_low_confidence_veto").recommendation.recommendation_type, "stop_movement");
assert.equal(resultFor("v05_worsening_pain_incomplete_history").safetyGate.status, "stop");
assert.equal(resultFor("v05_raw_exposures_infer_improving").recommendation.recommendation_type, "push");
assert.ok(["reduce", "consolidate"].includes(resultFor("v05_shutdown_spacing_infer_fatigue").recommendation.recommendation_type));
assert.equal(resultFor("v05_local_issue_from_movement_history").recommendation.recommendation_type, "reduce");
assert.equal(resultFor("v05_high_confidence_repeated_success_push").recommendation.recommendation_type, "push");
assert.equal(resultFor("v05_low_confidence_repeated_looking_success_hold").recommendation.recommendation_type, "hold");

console.log("Coaching Gauntlet v0.5 smoke test passed");

function resultFor(id) {
  const result = results.find((item) => item.scenario.id === id);
  assert.ok(result, `missing result ${id}`);
  return result;
}

function assertMandatoryEvidence(evidence, id) {
  assert.ok(Number.isInteger(evidence.sessionHistory.plannedSessionsCompleted), `${id} missing planned session history`);
  assert.ok(Array.isArray(evidence.exerciseHistory) && evidence.exerciseHistory.length > 0, `${id} missing exercise-level history`);
  for (const item of evidence.exerciseHistory) {
    assert.ok(item.comparableLoadTrend, `${id} missing comparable-load trend`);
    assert.equal(typeof item.withinRange, "boolean", `${id} missing target-range success`);
    assert.ok(Number.isInteger(item.belowMinimumEvents), `${id} missing missed-range events`);
    assert.ok(Number.isInteger(item.shutdowns), `${id} missing shutdowns`);
  }
  assert.ok(evidence.evidenceConfidence, `${id} missing evidence confidence`);
}

async function assertNoEngineShortcutLeaks() {
  const files = [
    "research/adaptive_stress_lab/src/coaching_state_engine.mjs",
    "research/adaptive_stress_lab/src/decision_engine_v0_2.mjs",
    "research/adaptive_stress_lab/src/safety_gate.mjs",
  ];
  for (const file of files) {
    const text = await readFile(join(repoRoot, file), "utf8");
    for (const label of ENGINE_FORBIDDEN_STRINGS) {
      assert.ok(!text.includes(label), `${file} directly references removed shortcut ${label}`);
    }
  }
}
