import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const scenarios = JSON.parse(await readFile(join(labRoot, "data", "scenarios.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

const scoreFields = ["adaptation", "recovery_capacity", "momentum", "confidence", "evidence_quality", "coaching_opportunity"];

for (const scenario of scenarios) {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const state = calculateCoachingState({ athlete, evidence: scenario, now: fixedNow });

  assert.equal(state.status, "draft_research_output");
  assert.equal(state.scenario_id, scenario.id);
  assert.equal(state.athlete_profile_id, athlete.id);
  assert.equal(state.last_updated, fixedNow.toISOString());
  assert.ok(state.evidence_count > 0);
  assert.ok(state.confidence_reason.length > 0);
  assert.ok(state.authority_summary.length > 0);
  assert.ok(state.subjective_context_handling.length > 0);
  assert.ok(state.open_questions.length > 0);

  for (const field of scoreFields) {
    assert.ok(Number.isInteger(state[field]), `${field} must be integer`);
    assert.ok(state[field] >= 0, `${field} below range`);
    assert.ok(state[field] <= 100, `${field} above range`);
    assert.ok(state.score_explanations[field].length > 0, `${field} missing explanations`);
  }
}

const poorReadinessStrongPerformance = stateFor("poor_readiness_strong_performance");
assert.ok(poorReadinessStrongPerformance.adaptation >= 80, "strong objective performance should preserve adaptation");
assert.ok(poorReadinessStrongPerformance.recovery_capacity >= 70, "poor subjective readiness should not dominate recovery capacity");
assert.ok(poorReadinessStrongPerformance.coaching_opportunity >= 70, "poor subjective readiness should only soften opportunity");
assert.equal(poorReadinessStrongPerformance.safety_flags.length, 0);

const feelsGreatDeclining = stateFor("feels_great_performance_declining");
assert.ok(feelsGreatDeclining.adaptation <= 20, "objective decline should reduce adaptation despite feeling great");
assert.ok(feelsGreatDeclining.recovery_capacity <= 25, "objective decline should reduce recovery capacity despite subjective optimism");
assert.ok(feelsGreatDeclining.momentum <= 35, "objective decline should reduce momentum despite high motivation");
assert.equal(feelsGreatDeclining.safety_flags.length, 0);

const highStressStable = stateFor("high_stress_objective_stable");
assert.ok(highStressStable.adaptation >= 60, "stable objective evidence should remain constructive despite stress");
assert.ok(highStressStable.recovery_capacity >= 40, "high stress should soften but not collapse recovery capacity");
assert.equal(highStressStable.safety_flags.length, 0);

const lowMotivationConsistent = stateFor("low_motivation_consistent_sessions");
assert.ok(lowMotivationConsistent.momentum >= 70, "consistent completed sessions should outrank low motivation");
assert.ok(lowMotivationConsistent.confidence >= 55, "low motivation should not erase positive objective evidence");

const severePain = stateFor("severe_pain_safety_flag");
assert.deepEqual(severePain.safety_flags, ["subjective_severe_pain"]);
assert.ok(severePain.recovery_capacity <= 50, "severe safety flag should be allowed to reduce recovery capacity");
assert.ok(severePain.coaching_opportunity <= 35, "severe safety flag should constrain coaching opportunity");
assert.ok(
  severePain.subjective_context_handling.some((line) => line.includes("Severe pain/safety flag")),
  "severe safety handling should be explicit",
);

function stateFor(id) {
  const scenario = scenarios.find((item) => item.id === id);
  assert.ok(scenario, `missing scenario ${id}`);
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete for ${id}`);
  return calculateCoachingState({ athlete, evidence: scenario, now: fixedNow });
}

console.log("Coaching State objective-first smoke test passed");
