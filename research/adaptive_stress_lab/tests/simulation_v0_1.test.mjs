import assert from "node:assert/strict";
import { runSimulation, simulationTracks } from "../src/run_simulation_v0_1.mjs";

const results = runSimulation();

assert.equal(results.length, 5, "simulation should run five athlete profiles");
assert.equal(simulationTracks.length, 5);

for (const track of results) {
  assert.equal(track.weeks.length, 12, `${track.athlete.label} should have 12 simulated weeks`);
  const weekNumbers = track.weeks.map((week) => week.week);
  assert.deepEqual(weekNumbers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  for (const week of track.weeks) {
    assert.ok(week.coachingState);
    assert.ok(week.safetyGate);
    assert.ok(week.recommendation);
    assert.ok(week.goalProgress);
    assert.ok(week.goalProgress.progress_score >= 0 && week.goalProgress.progress_score <= 100);
    assert.ok(week.goalProgress.confidence >= 0 && week.goalProgress.confidence <= 100);
    assert.ok(["improving", "stable", "declining", "insufficient_evidence"].includes(week.goalProgress.trend));
    assert.equal(week.evidence.evidenceModelVersion, "v0.7");
    assert.ok(!Object.hasOwn(week.evidence, "evidenceQuality"));
  }
}

const beginner = trackFor("beginner_hypertrophy");
assert.ok(beginner.weeks[0].goalProgress.confidence < beginner.weeks[11].goalProgress.confidence, "early phase should have lower confidence than later phase");

const powerlifter = trackFor("advanced_powerlifting");
assert.ok(["recover", "consolidate"].includes(powerlifter.weeks[7].recommendation.recommendation_type), "systemic fatigue week should not push");
assert.notEqual(powerlifter.weeks[7].recommendation.recommendation_type, "push");

const busyParent = trackFor("busy_parent_time_constrained");
assert.equal(busyParent.track.goal, "get_lean");
assert.ok(busyParent.weeks.some((week) => week.goalProgress.warnings.some((warning) => warning.includes("body fat percentage is missing"))));

const allRecommendations = results.flatMap((track) => track.weeks.map((week) => week.recommendation.recommendation_type));
assert.ok(allRecommendations.includes("hold"));
assert.ok(allRecommendations.includes("consolidate") || allRecommendations.includes("recover"));
assert.ok(allRecommendations.includes("reduce"));

console.log("Simulation v0.1 test passed");

function trackFor(profileId) {
  const track = results.find((item) => item.track.profileId === profileId);
  assert.ok(track, `missing track ${profileId}`);
  return track;
}
