import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_2 } from "../gauntlet/scenarios_v0_2.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenariosV0_2.length >= 150, "v0.2 gauntlet should contain at least 150 scenarios");
assert.equal(new Set(gauntletScenariosV0_2.map((scenario) => scenario.id)).size, gauntletScenariosV0_2.length);

for (const level of [1, 2, 3, 4]) {
  assert.ok(gauntletScenariosV0_2.filter((scenario) => scenario.level === level).length >= 25, `level ${level} needs at least 25 scenarios`);
}

const results = gauntletScenariosV0_2.map((scenario) => {
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

assert.ok(results.some((result) => result.score.pass), "v0.2 gauntlet should still include passing scenarios");

const singleAboveRange = results.find((result) => result.scenario.id === "v02_l1_single_rep_pr_hold");
assert.equal(singleAboveRange.recommendation.recommendation_type, "hold");

const movementStop = results.find((result) => result.scenario.id === "v02_l4_worsening_pain_no_systemic");
assert.equal(movementStop.safetyGate.status, "stop");
assert.equal(movementStop.recommendation.recommendation_type, "stop_movement");

const systemicStop = results.find((result) => result.scenario.id === "v02_l4_systemic_red_flag_good_performance");
assert.equal(systemicStop.safetyGate.status, "stop");
assert.equal(systemicStop.recommendation.recommendation_type, "stop_session");

console.log("Coaching Gauntlet v0.2 smoke test passed");
