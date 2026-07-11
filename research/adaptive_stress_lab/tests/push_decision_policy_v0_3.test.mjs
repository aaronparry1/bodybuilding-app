import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluatePushDecisionPolicy } from "../src/push_decision_policy_v0_3.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const now = new Date("2026-06-28T00:00:00.000Z");

assertPolicy("v14_volume_hypertrophy_high_tolerance", true, "volume_push");
assertPolicy("v14_load_strength_owns_top_range", true, "load_push");
assertPolicy("v14_performance_planned_rep_pr", true, "performance_push");
assertPolicy("v14_mixed_micro_when_evidence_strong_not_exceptional", true, "micro_push");

const getLean = outputFor("v14_mixed_goal_specific_get_lean_blocks_volume");
assert.equal(getLean.recommendation.recommendation_type, "hold");
assert.equal(getLean.policy.eligible, false);
assert.equal(getLean.policy.recommended_push_type, "none");

const pain = outputFor("v14_load_pain_flag_blocks_push");
assert.equal(pain.safetyGate.status, "stop");
assert.equal(pain.recommendation.recommendation_type, "stop_movement");

const owned = recommendationWithOwnership("owned");
const introduced = recommendationWithOwnership("introduced");
const unstable = recommendationWithOwnership("unstable");
assert.equal(owned.push_category, "load_push");
assert.equal(introduced.push_category, "micro_push");
assert.equal(unstable.push_category, "micro_push");

console.log("Push Decision Policy v0.3 test passed");

function assertPolicy(id, eligible, type) {
  const { policy, recommendation } = outputFor(id);
  assert.equal(policy.eligible, eligible, `${id} eligibility`);
  assert.equal(policy.recommended_push_type, type, `${id} push type`);
  assert.equal(recommendation.recommendation_type, eligible ? "push" : recommendation.recommendation_type);
  assert.ok(policy.rationale.length > 0);
  assert.ok(policy.advisory_notes.some((note) => note.includes("Synthetic") || note.includes("safe")));
}

function outputFor(id) {
  const scenario = pushTypeScenariosV0_1.find((item) => item.id === id);
  assert.ok(scenario, `missing scenario ${id}`);
  const athlete = scenario.athlete ?? profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario.evidence, now });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario.evidence, coachingState });
  const policy = evaluatePushDecisionPolicy({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario.evidence, coachingState, safetyGate });
  return { scenario, athlete, coachingState, safetyGate, policy, recommendation };
}

function recommendationWithOwnership(state) {
  const scenario = pushTypeScenariosV0_1.find((item) => item.id === "v14_load_strength_owns_top_range");
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const evidence = { ...scenario.evidence, id: `${scenario.evidence.id}_${state}`, loadOwnership: { state } };
  const coachingState = calculateCoachingState({ athlete, evidence, now });
  const safetyGate = evaluateSafetyGate({ athlete, evidence, coachingState });
  return createCoachingRecommendation({ athlete, evidence, coachingState, safetyGate });
}
