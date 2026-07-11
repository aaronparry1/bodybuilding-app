import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-28T00:00:00.000Z");

assert.ok(pushTypeScenariosV0_1.length >= 40, "Sprint 14 should validate at least 40 push-type scenarios");
assert.equal(new Set(pushTypeScenariosV0_1.map((scenario) => scenario.id)).size, pushTypeScenariosV0_1.length);

const results = pushTypeScenariosV0_1.map((scenario) => {
  const athlete = scenario.athlete ?? profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete ${scenario.athleteProfileId}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now: fixedNow });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  return { scenario, athlete, coachingState, safetyGate, recommendation };
});

const failures = [];
for (const result of results) {
  const { expected } = result.scenario;
  if (result.recommendation.recommendation_type !== expected.recommendation_type) {
    failures.push(`${result.scenario.id}: expected ${expected.recommendation_type}, got ${result.recommendation.recommendation_type}`);
    continue;
  }
  if (expected.push_category && result.recommendation.push_category !== expected.push_category) {
    failures.push(`${result.scenario.id}: expected ${expected.push_category}, got ${result.recommendation.push_category}`);
  }
}

assert.equal(failures.length, 0, failures.join("\n"));

for (const category of ["micro_push", "volume_push", "load_push", "performance_push"]) {
  assert.ok(results.some((result) => result.recommendation.push_category === category), `${category} should be exercised`);
}

assert.equal(resultFor("v14_volume_inappropriate_poor_recovery").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v14_load_inappropriate_pattern_only").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v14_performance_inappropriate_one_good_session").recommendation.recommendation_type, "hold");
assert.equal(resultFor("v14_performance_blocked_by_safety_caution").recommendation.recommendation_type, "stop_movement");
assert.equal(resultFor("v14_mixed_goal_specific_get_lean_blocks_volume").recommendation.recommendation_type, "hold");

console.log("Higher-risk push validation v0.1 smoke test passed");

function resultFor(id) {
  const result = results.find((item) => item.scenario.id === id);
  assert.ok(result, `missing result ${id}`);
  return result;
}
