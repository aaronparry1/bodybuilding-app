import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateAthleteState } from "../src/athlete_state_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const scenarios = JSON.parse(await readFile(join(labRoot, "data", "scenarios.json"), "utf8"));
const fixedNow = new Date("2026-06-27T00:00:00.000Z");

const scoreFields = ["adaptation", "fatigue", "recovery", "momentum", "confidence", "evidence_quality"];

for (const scenario of scenarios) {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  const state = calculateAthleteState({ athlete, evidence: scenario, now: fixedNow });

  assert.equal(state.status, "draft_research_output");
  assert.equal(state.scenario_id, scenario.id);
  assert.equal(state.athlete_profile_id, athlete.id);
  assert.equal(state.last_updated, fixedNow.toISOString());
  assert.ok(state.evidence_count > 0);
  assert.ok(state.confidence_reason.length > 0);
  assert.ok(state.open_questions.length > 0);

  for (const field of scoreFields) {
    assert.ok(Number.isInteger(state[field]), `${field} must be integer`);
    assert.ok(state[field] >= 0, `${field} below range`);
    assert.ok(state[field] <= 100, `${field} above range`);
    assert.ok(state.score_explanations[field].length > 0, `${field} missing explanations`);
  }
}

const productiveScenario = scenarios.find((scenario) => scenario.id === "successful_load_progression_productive_fatigue");
const productiveAthlete = profiles.find((profile) => profile.id === productiveScenario.athleteProfileId);
const productiveState = calculateAthleteState({ athlete: productiveAthlete, evidence: productiveScenario, now: fixedNow });

assert.ok(productiveState.adaptation > 70, "productive load progression should show strong adaptation state");
assert.ok(productiveState.momentum > 70, "productive load progression should support momentum");
assert.ok(productiveState.fatigue < 70, "productive fatigue should not be treated as systemic fatigue");

const systemicScenario = scenarios.find((scenario) => scenario.id === "systemic_fatigue_across_multiple_lifts");
const systemicAthlete = profiles.find((profile) => profile.id === systemicScenario.athleteProfileId);
const systemicState = calculateAthleteState({ athlete: systemicAthlete, evidence: systemicScenario, now: fixedNow });

assert.ok(systemicState.fatigue >= 85, "systemic fatigue scenario should produce high fatigue state");
assert.ok(systemicState.recovery <= 25, "systemic fatigue scenario should produce low recovery state");
assert.ok(systemicState.adaptation < productiveState.adaptation, "systemic decline should not look more adaptive than productive progress");

console.log("Athlete State Engine smoke test passed");
