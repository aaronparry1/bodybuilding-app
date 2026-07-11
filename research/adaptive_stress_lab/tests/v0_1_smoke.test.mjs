import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decideNextCoachingAction } from "../src/decision_engine.mjs";

const labRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const profiles = JSON.parse(await readFile(join(labRoot, "data", "athlete_profiles.json"), "utf8"));
const scenarios = JSON.parse(await readFile(join(labRoot, "data", "scenarios.json"), "utf8"));

assert.equal(profiles.length, 5);
assert.equal(scenarios.length, 25);

for (const scenario of scenarios) {
  const athlete = profiles.find((profile) => profile.id === scenario.athleteProfileId);
  assert.ok(athlete, `missing athlete for ${scenario.id}`);
  const decision = decideNextCoachingAction({ athlete, evidence: scenario });
  assert.equal(decision.status, "draft_research_output");
  assert.equal(decision.productionEligible, false);
  assert.ok(decision.interventions.length > 0);
  assert.ok(decision.openQuestions.length > 0);
  assert.ok(decision.validationScore.overallConfidence >= 1);
  assert.ok(decision.validationScore.overallConfidence <= 5);
}

console.log("Adaptive Stress Lab v0.1 smoke test passed");
