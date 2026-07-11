import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_6 } from "../gauntlet/scenarios_v0_6.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals", "systemicSignals", "trainingContinuity"];
const REMOVED_LABELS = ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"];
const ENGINE_FORBIDDEN_STRINGS = [...REMOVED_FIELDS, ...REMOVED_LABELS];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenariosV0_6.length >= 204, "v0.6 gauntlet should contain at least 204 scenarios");
assert.equal(new Set(gauntletScenariosV0_6.map((scenario) => scenario.id)).size, gauntletScenariosV0_6.length);

for (const scenario of gauntletScenariosV0_6) {
  assert.equal(scenario.evidence.evidenceModelVersion, "v0.6", `${scenario.id} missing v0.6 model marker`);
  for (const field of REMOVED_FIELDS) {
    assert.ok(!Object.hasOwn(scenario.evidence, field), `${scenario.id} still contains removed field ${field}`);
  }
  assertMandatoryEvidence(scenario.evidence, scenario.id);
}

await assertNoEngineShortcutLeaks();

const results = gauntletScenariosV0_6.map((scenario) => {
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

assert.equal(results.filter((result) => !result.score.pass).length, 0, "v0.6 gauntlet should pass without derived-state shortcuts");

assert.ok(["recover", "consolidate"].includes(resultFor("v06_systemic_fatigue_from_multiple_declines").recommendation.recommendation_type));
assert.equal(resultFor("v06_local_fatigue_not_systemic").recommendation.recommendation_type, "reduce");
assert.equal(resultFor("v06_missed_week_from_session_history").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v06_high_evidence_push_allowed").recommendation.recommendation_type, "push");
assert.equal(resultFor("v06_moderate_evidence_push_withheld").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v06_three_successful_exposures_allow_push").recommendation.recommendation_type, "push");
assert.equal(resultFor("v06_two_successful_exposures_do_not_push").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v06_new_exercise_uncertainty_prevents_push").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v06_recent_swap_uncertainty_prevents_push").recommendation.recommendation_type, "consolidate");
assert.equal(resultFor("v06_pain_veto_low_confidence").safetyGate.status, "stop");
assert.equal(resultFor("v06_pain_veto_low_confidence").recommendation.recommendation_type, "stop_movement");
assert.ok(["reduce", "hold"].includes(resultFor("v06_low_confidence_caution_wording").recommendation.recommendation_type));
assert.equal(resultFor("v06_strong_recovery_incomplete_evidence_holds").recommendation.recommendation_type, "hold");

console.log("Coaching Gauntlet v0.6 smoke test passed");

function resultFor(id) {
  const result = results.find((item) => item.scenario.id === id);
  assert.ok(result, `missing result ${id}`);
  return result;
}

function assertMandatoryEvidence(evidence, id) {
  assert.ok(Number.isInteger(evidence.sessionHistory.plannedSessionsCompleted), `${id} missing planned session history`);
  assert.ok(Number.isInteger(evidence.sessionHistory.plannedSessionsMissed), `${id} missing missed session history`);
  assert.ok(evidence.sessionHistory.sessionSpacing, `${id} missing session spacing`);
  assert.ok(Array.isArray(evidence.exerciseHistory) && evidence.exerciseHistory.length > 0, `${id} missing exercise-level history`);
  for (const item of evidence.exerciseHistory) {
    assert.ok(item.comparableLoadTrend, `${id} missing comparable-load trend`);
    assert.equal(typeof item.withinRange, "boolean", `${id} missing target-range success`);
    assert.ok(Number.isInteger(item.belowMinimumEvents), `${id} missing missed-range events`);
    assert.ok(Number.isInteger(item.shutdowns), `${id} missing shutdowns`);
  }
  assert.ok(evidence.safetyContext, `${id} missing safety context`);
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
