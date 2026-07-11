import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { deriveEvidenceQuality, qualityScoreForEvidence, sameExerciseSuccessfulExposureCount } from "../src/evidence_detail.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_7 } from "../gauntlet/scenarios_v0_7.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const REMOVED_FIELDS = ["performanceTrend", "fatigueState", "recoveryState", "localLiftSignals", "systemicSignals", "trainingContinuity", "evidenceQuality"];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-28T00:00:00.000Z");

assert.ok(gauntletScenariosV0_7.length >= 224, "v0.7 gauntlet should contain at least 224 scenarios");
assert.equal(new Set(gauntletScenariosV0_7.map((scenario) => scenario.id)).size, gauntletScenariosV0_7.length);

for (const scenario of gauntletScenariosV0_7) {
  assert.equal(scenario.evidence.evidenceModelVersion, "v0.7", `${scenario.id} missing v0.7 model marker`);
  for (const field of REMOVED_FIELDS) {
    assert.ok(!Object.hasOwn(scenario.evidence, field), `${scenario.id} still contains removed field ${field}`);
  }
  assertMandatoryEvidence(scenario.evidence, scenario.id);
}

await assertNoDirectQualityLeaks();

const results = gauntletScenariosV0_7.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete ${scenario.athleteProfileId}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: fixedNow });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });

  for (const field of RUBRIC_FIELDS) {
    assert.ok(score.scores[field] >= 1 && score.scores[field] <= 5, `${scenario.id} invalid ${field}`);
  }
  return { scenario, recommendation, safetyGate, coachingState, score };
});

const failures = results.filter((result) => !result.score.pass);
assert.equal(failures.length, 0, `v0.7 gauntlet should pass; failures: ${failures.map((item) => item.scenario.id).join(", ")}`);

assert.equal(resultFor("v07_high_quality_many_planned_sessions").recommendation.recommendation_type, "push");
assert.equal(resultFor("v07_low_quality_one_session").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_extra_session_noise_low_planned").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_warmup_only_low_quality").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_pattern_improves_same_exercise_missing").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_same_exercise_three_successes_push").recommendation.recommendation_type, "push");
assert.equal(resultFor("v07_same_exercise_two_successes_hold").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_post_swap_one_exposure_blocks_push").recommendation.recommendation_type, "consolidate");
assert.equal(resultFor("v07_post_swap_three_successes_permit_push").recommendation.recommendation_type, "push");
assert.equal(resultFor("v07_systemic_fatigue_enough_evidence_recovers").recommendation.recommendation_type, "recover");
assert.notEqual(resultFor("v07_systemic_looking_low_evidence_consolidates").recommendation.recommendation_type, "recover");
assert.equal(resultFor("v07_local_decline_only_reduces").recommendation.recommendation_type, "reduce");
assert.equal(resultFor("v07_recovery_request_without_objective_evidence_holds").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v07_severe_pain_low_evidence_veto").safetyGate.status, "stop");
assert.equal(resultFor("v07_severe_pain_high_evidence_veto").safetyGate.status, "stop");
assert.ok(resultFor("v07_low_confidence_safety_caution_wording").safetyGate.recommended_user_message.includes("don't have enough history"));
assert.ok(resultFor("v07_high_confidence_safety_caution_wording").safetyGate.recommended_user_message.includes("clear pattern"));
assert.ok(qualityScoreForEvidence(resultFor("v07_high_quality_many_planned_sessions").scenario.evidence) >= 85);
assert.ok(qualityScoreForEvidence(resultFor("v07_low_quality_one_session").scenario.evidence) < 70);
assert.ok(sameExerciseSuccessfulExposureCount(resultFor("v07_same_exercise_three_successes_push").scenario.evidence) >= 3);

console.log("Coaching Gauntlet v0.7 smoke test passed");

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
  assert.ok(evidence.evidenceConfidence, `${id} missing evidence confidence factors`);
  const breakdown = deriveEvidenceQuality(evidence);
  for (const key of ["data_completeness", "recency", "planned_evidence", "comparable_exposures", "source_quality", "consistency", "final_score"]) {
    assert.ok(Number.isInteger(breakdown[key]), `${id} missing derived quality ${key}`);
  }
}

async function assertNoDirectQualityLeaks() {
  const files = [
    "research/adaptive_stress_lab/src/coaching_state_engine.mjs",
    "research/adaptive_stress_lab/src/decision_engine_v0_2.mjs",
    "research/adaptive_stress_lab/src/safety_gate.mjs",
  ];
  for (const file of files) {
    const text = await readFile(join(repoRoot, file), "utf8");
    assert.ok(!text.includes(".evidenceQuality"), `${file} directly reads supplied evidenceQuality`);
  }
}
