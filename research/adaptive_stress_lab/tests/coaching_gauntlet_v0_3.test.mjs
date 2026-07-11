import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { explicitEvidenceDrivers } from "../src/evidence_detail.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_3 } from "../gauntlet/scenarios_v0_3.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenariosV0_3.length >= 150, "v0.3 gauntlet should contain at least 150 scenarios");
assert.equal(new Set(gauntletScenariosV0_3.map((scenario) => scenario.id)).size, gauntletScenariosV0_3.length);

const results = gauntletScenariosV0_3.map((scenario) => {
  assert.ok(scenario.evidence.sessionHistory, `${scenario.id} missing sessionHistory`);
  assert.ok(scenario.evidence.exerciseHistory, `${scenario.id} missing exerciseHistory`);
  assert.ok(scenario.evidence.consolidationHistory, `${scenario.id} missing consolidationHistory`);
  assert.ok(scenario.evidence.frequencyStimulus, `${scenario.id} missing frequencyStimulus`);
  assert.ok(scenario.evidence.safetyContext, `${scenario.id} missing safetyContext`);
  assert.ok(scenario.evidence.evidenceConfidence, `${scenario.id} missing evidenceConfidence`);
  assert.ok(explicitEvidenceDrivers(scenario.evidence).length > 0, `${scenario.id} missing explicit drivers`);

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

assert.equal(results.filter((result) => !result.score.pass).length, 0, "v0.3 gauntlet should preserve v0.2 behaviour while adding evidence detail");

const postSwap = results.find((result) => result.scenario.id === "v03_l3_swap_improves_performance");
assert.equal(postSwap.scenario.evidence.swapHistory.exposuresSinceSwap, 1);
assert.equal(postSwap.recommendation.recommendation_type, "consolidate");

const compoundDensity = results.find((result) => result.scenario.id === "v03_l4_too_many_compounds_low_frequency");
assert.equal(compoundDensity.scenario.evidence.frequencyStimulus.compoundDensity, "high");
assert.equal(compoundDensity.recommendation.recommendation_type, "reduce");

const movementStop = results.find((result) => result.scenario.id === "v03_l4_worsening_pain_no_systemic");
assert.equal(movementStop.scenario.evidence.safetyContext.safetyIssueScope, "movement_specific");
assert.equal(movementStop.recommendation.recommendation_type, "stop_movement");

console.log("Coaching Gauntlet v0.3 smoke test passed");
