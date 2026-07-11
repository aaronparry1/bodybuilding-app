import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { createCoachingRecommendation } from "../src/decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";
import { gauntletScenariosV0_4 } from "../gauntlet/scenarios_v0_4.mjs";
import { RUBRIC_FIELDS, scoreGauntletDecision } from "../gauntlet/rubric.mjs";

const MAGIC_LABELS = ["planned_consolidation", "post_swap_improvement", "high_frequency", "compound_density_high", "hidden_overreach"];
const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(dirname(labRoot));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

assert.ok(gauntletScenariosV0_4.length >= 174, "v0.4 gauntlet should contain at least 174 scenarios");
assert.equal(new Set(gauntletScenariosV0_4.map((scenario) => scenario.id)).size, gauntletScenariosV0_4.length);

for (const scenario of gauntletScenariosV0_4) {
  assert.equal(scenario.evidence.evidenceModelVersion, "v0.4", `${scenario.id} missing v0.4 model marker`);
  assert.ok(!scenario.evidence.systemicSignals.some((signal) => MAGIC_LABELS.includes(signal)), `${scenario.id} contains magic label`);
  assertMandatoryEvidence(scenario.evidence, scenario.id);
}

await assertNoEngineLabelLeaks();

const results = gauntletScenariosV0_4.map((scenario) => {
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

assert.equal(results.filter((result) => !result.score.pass).length, 0, "v0.4 gauntlet should pass without magic labels");

assert.equal(results.find((result) => result.scenario.id === "v04_label_leak_single_good_exposure_hold").recommendation.recommendation_type, "hold");
assert.equal(results.find((result) => result.scenario.id === "v04_label_leak_repeated_good_exposures_push").recommendation.recommendation_type, "push");
assert.equal(results.find((result) => result.scenario.id === "v04_label_leak_one_post_swap_consolidate").recommendation.recommendation_type, "consolidate");
assert.equal(results.find((result) => result.scenario.id === "v04_label_leak_low_frequency_compound_dense_reduce").recommendation.recommendation_type, "reduce");
assert.ok(["hold", "consolidate"].includes(results.find((result) => result.scenario.id === "v04_label_leak_hidden_overreach_consolidate").recommendation.recommendation_type));

console.log("Coaching Gauntlet v0.4 smoke test passed");

function assertMandatoryEvidence(evidence, id) {
  assert.ok(Number.isInteger(evidence.sessionHistory.plannedSessionsCompleted), `${id} missing planned session history`);
  assert.ok(Array.isArray(evidence.exerciseHistory) && evidence.exerciseHistory.length > 0, `${id} missing exercise-level history`);
  for (const item of evidence.exerciseHistory) {
    assert.ok(item.comparableLoadTrend, `${id} missing comparable-load trend`);
    assert.equal(typeof item.withinRange, "boolean", `${id} missing target-range success`);
    assert.ok(Number.isInteger(item.belowMinimumEvents), `${id} missing missed-range events`);
    assert.ok(Number.isInteger(item.shutdowns), `${id} missing shutdowns`);
  }
  assert.ok(evidence.safetyContext, `${id} missing safety context`);
  assert.ok(evidence.evidenceConfidence, `${id} missing evidence confidence`);
}

async function assertNoEngineLabelLeaks() {
  const files = [
    "research/adaptive_stress_lab/src/coaching_state_engine.mjs",
    "research/adaptive_stress_lab/src/decision_engine_v0_2.mjs",
    "research/adaptive_stress_lab/src/safety_gate.mjs",
  ];
  for (const file of files) {
    const text = await readFile(join(repoRoot, file), "utf8");
    for (const label of MAGIC_LABELS) {
      assert.ok(!text.includes(label), `${file} directly references magic label ${label}`);
    }
  }
}
