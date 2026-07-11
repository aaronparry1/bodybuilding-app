import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCoachingState } from "../src/coaching_state_engine.mjs";
import { evaluateSafetyGate } from "../src/safety_gate.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const scenarios = JSON.parse(await readFile(join(labRoot, "data", "scenarios.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

for (const scenario of scenarios) {
  const output = gateFor(scenario.id);
  assert.ok(["clear", "caution", "restrict", "stop"].includes(output.status));
  assert.ok(["none", "low", "moderate", "high", "severe"].includes(output.severity));
  assert.equal(output.veto, output.status === "restrict" || output.status === "stop");
  assert.ok(output.reasons.length > 0);
  assert.ok(output.allowed_actions.length > 0);
  assert.ok(output.recommended_user_message.length > 0);
  assert.ok(output.confidence >= 0 && output.confidence <= 100);
  assert.ok(output.evidence_sources.length > 0);
}

assert.equal(gateFor("safety_clear_strong_performance").status, "clear");
assert.equal(gateFor("safety_clear_strong_performance").veto, false);

const poorReadiness = gateFor("safety_poor_readiness_strong_performance");
assert.ok(["clear", "caution"].includes(poorReadiness.status));
assert.equal(poorReadiness.veto, false);

const severePain = gateFor("safety_severe_pain_strong_performance");
assert.equal(severePain.status, "stop");
assert.equal(severePain.veto, true);
assert.ok(severePain.blocked_actions.includes("affected movement training today"));

const collapse = gateFor("safety_repeated_same_load_collapse");
assert.ok(["restrict", "stop"].includes(collapse.status));
assert.equal(collapse.veto, true);

const localFailure = gateFor("safety_local_below_range_failure");
assert.equal(localFailure.status, "caution");
assert.equal(localFailure.veto, false);

const sharpPain = gateFor("safety_sharp_pain_squat");
assert.equal(sharpPain.status, "stop");
assert.equal(sharpPain.veto, true);
assert.ok(sharpPain.affected_areas.includes("squat/lower-body pattern"));

const worseningPain = gateFor("safety_worsening_pain_multiple_sessions");
assert.ok(["restrict", "stop"].includes(worseningPain.status));
assert.equal(worseningPain.veto, true);

const productiveFatigue = gateFor("safety_productive_fatigue_progression");
assert.equal(productiveFatigue.status, "clear");
assert.equal(productiveFatigue.veto, false);

function gateFor(id) {
  const scenario = scenarios.find((item) => item.id === id);
  assert.ok(scenario, `missing scenario ${id}`);
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete for ${id}`);
  const coachingState = calculateCoachingState({ athlete, evidence: scenario, now: fixedNow });
  return evaluateSafetyGate({ athlete, evidence: scenario, coachingState });
}

console.log("Safety Gate v0.1 smoke test passed");
