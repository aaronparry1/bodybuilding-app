import assert from "node:assert/strict";
import { runSimulationV0_2, virtualAthletesV0_2 } from "../src/simulation_v0_2.mjs";

const result = runSimulationV0_2();

assert.equal(virtualAthletesV0_2.length, 20, "v0.2 should define at least 20 virtual athletes");
assert.equal(result.aggregate.total_athletes, 20);
assert.equal(result.aggregate.total_weeks, 1040);

const goals = new Set(virtualAthletesV0_2.map((athlete) => athlete.goal));
assert.deepEqual([...goals].sort(), ["athletic_performance", "build_muscle", "build_muscle_strength", "get_lean", "strength"].sort());
for (const goal of goals) {
  assert.equal(virtualAthletesV0_2.filter((athlete) => athlete.goal === goal).length, 4, `${goal} should have four athletes`);
}

for (const athlete of result.athletes) {
  assert.equal(athlete.weeks.length, 52, `${athlete.athlete.id} should have 52 weeks`);
  assert.ok(Number.isFinite(athlete.summary.final_v1_progress));
  assert.ok(Number.isFinite(athlete.summary.final_v2_progress));
  assert.ok(Number.isFinite(athlete.summary.average_v2_decision_confidence));
  for (const week of athlete.weeks) {
    assert.ok(week.evidence);
    assert.ok(week.coachingState);
    assert.ok(week.safetyGate);
    assert.ok(week.v2Recommendation);
    assert.ok(week.v1Decision);
    assert.ok(week.goalProgress);
    assert.equal(week.evidence.evidenceModelVersion, "v0.7");
    assert.ok(!Object.hasOwn(week.evidence, "evidenceQuality"));
    assert.ok(week.v1.progress_score >= 0 && week.v1.progress_score <= 100);
    assert.ok(week.v2.progress_score >= 0 && week.v2.progress_score <= 100);
  }
}

assert.equal(result.aggregate.v2_missed_unsafe_pain_responses, 0, "V2 should not miss unsafe pain responses");
assert.ok(result.aggregate.v2_over_aggressive_pushes < result.aggregate.v1_over_aggressive_pushes, "V2 should reduce over-aggressive pushes");
assert.ok(result.aggregate.v2_unnecessary_recovery_weeks <= result.aggregate.v1_unnecessary_recovery_weeks, "V2 should not create more unnecessary recovery weeks");
assert.ok(result.aggregate.average_v2_progress >= result.aggregate.average_v1_progress, "V2 should match or beat average progress");
assert.ok(result.aggregate.final_v2_momentum > result.aggregate.final_v1_momentum, "V2 should improve momentum proxy");
assert.ok(["promising", "inconclusive", "not ready"].includes(result.aggregate.verdict));
assert.equal(result.aggregate.verdict, "promising");

console.log("Simulation v0.2 test passed");
