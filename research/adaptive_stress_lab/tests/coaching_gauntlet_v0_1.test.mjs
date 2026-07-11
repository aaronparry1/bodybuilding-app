import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenarios } from "../gauntlet/scenarios.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenarios.length >= 50);
assert.equal(new Set(gauntletScenarios.map((scenario) => scenario.id)).size, gauntletScenarios.length);

for (const level of [1, 2, 3, 4]) {
  assert.ok(gauntletScenarios.filter((scenario) => scenario.level === level).length >= 10, `level ${level} needs at least 10 scenarios`);
}

const results = gauntletScenarios.map((scenario) => {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete ${scenario.athleteProfileId}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: fixedNow });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  const score = scoreGauntletDecision({ scenario, recommendation, safetyGate });

  for (const field of RUBRIC_FIELDS) {
    assert.ok(score.scores[field] >= 1 && score.scores[field] <= 5, `${scenario.id} invalid ${field}`);
  }

  assert.ok(score.percentage >= 0 && score.percentage <= 100);
  assert.ok(Array.isArray(score.failure_reasons));
  assert.ok(scenario.expected.recommendation_types.length > 0);
  assert.ok(scenario.rationale.length > 0);
  assert.ok(scenario.confidence >= 0 && scenario.confidence <= 100);
  assert.ok(scenario.charter_alignment.long_term_progress);

  return { scenario, recommendation, safetyGate, score };
});

assert.ok(results.some((result) => result.score.pass), "gauntlet should have at least one pass");
assert.equal(results.filter((result) => !result.score.pass).length, 0, "gauntlet should pass after Sprint 3B failure fixes");

const singleAboveRange = results.find((result) => result.scenario.id === "l1_above_range_first_signal");
assert.equal(singleAboveRange.recommendation.recommendation_type, "hold");

const worseningPain = results.find((result) => result.scenario.id === "l3_worsening_pain");
assert.equal(worseningPain.safetyGate.status, "stop");
assert.equal(worseningPain.recommendation.recommendation_type, "stop_movement");

const sharpPain = results.find((result) => result.scenario.id === "l3_sharp_pain_movement");
assert.equal(sharpPain.safetyGate.status, "stop");
assert.ok(["stop_movement", "stop_session"].includes(sharpPain.recommendation.recommendation_type));

const productiveFatigue = results.find((result) => result.scenario.id === "l1_productive_heavier_load");
assert.notEqual(productiveFatigue.recommendation.recommendation_type, "reduce");
assert.notEqual(productiveFatigue.recommendation.recommendation_type, "recover");

console.log("Coaching Gauntlet v0.1 smoke test passed");
