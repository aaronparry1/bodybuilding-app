import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const scenarios = JSON.parse(await readFile(join(labRoot, "data", "scenarios.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

const validTypes = new Set(["push", "hold", "consolidate", "reduce", "recover", "substitute", "stop_movement", "stop_session"]);
const validAggressiveness = new Set(["very_low", "low", "moderate", "high"]);

for (const scenario of scenarios) {
  const { recommendation } = outputFor(scenario.id);
  assert.ok(validTypes.has(recommendation.recommendation_type), `${scenario.id} invalid type`);
  assert.ok(validAggressiveness.has(recommendation.aggressiveness), `${scenario.id} invalid aggressiveness`);
  assert.ok(recommendation.primary_intervention.length > 0);
  assert.ok(recommendation.rationale.length > 0);
  assert.ok(recommendation.user_message.length > 0);
  assert.ok(recommendation.confidence >= 0 && recommendation.confidence <= 100);
  assert.equal(recommendation.status, "draft_research_output");
  assert.equal(recommendation.safety_gate_status, outputFor(scenario.id).safetyGate.status);
}

assert.ok(["push", "hold"].includes(outputFor("safety_clear_strong_performance").recommendation.recommendation_type));
assert.ok(["moderate", "low"].includes(outputFor("safety_clear_strong_performance").recommendation.aggressiveness));

assert.notEqual(outputFor("poor_readiness_strong_performance").recommendation.recommendation_type, "recover");
assert.ok(["push", "hold"].includes(outputFor("poor_readiness_strong_performance").recommendation.recommendation_type));

assert.ok(["consolidate", "reduce", "recover"].includes(outputFor("feels_great_performance_declining").recommendation.recommendation_type));
assert.notEqual(outputFor("feels_great_performance_declining").recommendation.recommendation_type, "push");

assert.ok(["stop_movement", "stop_session"].includes(outputFor("severe_pain_safety_flag").recommendation.recommendation_type));
assert.equal(outputFor("severe_pain_safety_flag").recommendation.aggressiveness, "very_low");

assert.ok(["reduce", "substitute", "consolidate"].includes(outputFor("safety_repeated_same_load_collapse").recommendation.recommendation_type));
assert.notEqual(outputFor("safety_repeated_same_load_collapse").recommendation.recommendation_type, "push");

assert.ok(["hold", "consolidate"].includes(outputFor("safety_productive_fatigue_progression").recommendation.recommendation_type));
assert.notEqual(outputFor("safety_productive_fatigue_progression").recommendation.recommendation_type, "reduce");

assert.ok(["hold", "consolidate"].includes(outputFor("decision_low_evidence_new_athlete").recommendation.recommendation_type));
assert.notEqual(outputFor("decision_low_evidence_new_athlete").recommendation.recommendation_type, "push");

assert.equal(outputFor("decision_momentum_low_recovery_good").recommendation.recommendation_type, "hold");
assert.ok(outputFor("decision_momentum_low_recovery_good").recommendation.primary_intervention.includes("win"));

assert.equal(outputFor("performance_improving_fatigue_high").recommendation.recommendation_type, "consolidate");
assert.ok(["recover", "consolidate"].includes(outputFor("systemic_fatigue_across_multiple_lifts").recommendation.recommendation_type));

const localFailure = outputFor("one_local_lift_failing").recommendation;
assert.equal(localFailure.recommendation_type, "reduce");
assert.ok(localFailure.rationale.some((line) => line.includes("local")));

function outputFor(id) {
  const scenario = scenarios.find((item) => item.id === id);
  assert.ok(scenario, `missing scenario ${id}`);
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete for ${id}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario, now: fixedNow });
  const safetyGate = evaluateSafetyGate({ athlete, evidence: scenario, coachingState });
  const recommendation = createCoachingRecommendation({ athlete, evidence: scenario, coachingState, safetyGate });
  return { athlete, scenario, coachingState, safetyGate, recommendation };
}

console.log("Decision Engine v0.2 smoke test passed");
