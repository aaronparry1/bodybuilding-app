import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { assessLoadOwnership, loadOwnershipValidationAttempts, runLoadOwnershipValidation } from "../src/load_ownership_v0_1.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { pushTypeScenariosV0_1 } from "../gauntlet/push_type_scenarios_v0_1.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const attempts = loadOwnershipValidationAttempts();
const validation = runLoadOwnershipValidation({ attempts });

assert.equal(attempts.length, 10);
assert.equal(validation.statistics.unnecessary_load_pushes, 0);
assert.equal(validation.statistics.delayed_load_pushes, 0);
assert.ok(validation.statistics.ownership_success_rate > 0);
assert.ok(validation.statistics.failed_ownership_rate > 0);
assert.ok(validation.statistics.average_ownership_time_weeks >= 3);

for (const attempt of attempts) {
  const ownership = assessLoadOwnership({ attempt });
  assert.equal(ownership.state, attempt.expectedState, `${attempt.id} ownership state`);
  assert.ok(Number.isInteger(ownership.confidence));
  assert.ok(ownership.reasons.length > 0);
}

const loadPushScenario = pushTypeScenariosV0_1.find((scenario) => scenario.id === "v14_load_strength_owns_top_range");
assert.ok(loadPushScenario, "missing load push fixture");

assert.equal(recommendationForOwnership("owned").push_category, "load_push");
assert.equal(recommendationForOwnership("introduced").push_category, "micro_push");
assert.equal(recommendationForOwnership("stabilising").push_category, "micro_push");
assert.equal(recommendationForOwnership("unstable").push_category, "micro_push");

console.log("Load ownership v0.1 test passed");

function recommendationForOwnership(state) {
  const athlete = profiles.find((profile) => profile.id === loadPushScenario.athleteProfileId);
  const evidence = {
    ...loadPushScenario.evidence,
    id: `${loadPushScenario.evidence.id}_${state}`,
    loadOwnership: { state },
  };
  const coachingState = calculateCoachingState({ athlete, evidence, now: new Date("2026-06-28T00:00:00.000Z") });
  const safetyGate = evaluateSafetyGate({ athlete, evidence, coachingState });
  return createCoachingRecommendation({ athlete, evidence, coachingState, safetyGate });
}
