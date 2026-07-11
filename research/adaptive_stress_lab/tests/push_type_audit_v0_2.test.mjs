import assert from "node:assert/strict";
import { runCoachingOpportunityAuditV0_1 } from "../src/coaching_opportunity_audit_v0_1.mjs";
import { runSimulationV0_2 } from "../src/simulation_v0_2.mjs";

const simulation = runSimulationV0_2();
const audit = runCoachingOpportunityAuditV0_1({ simulation });
const pushTypes = audit.metrics.by_push_type;

for (const type of ["micro_push", "volume_push", "load_push", "performance_push"]) {
  assert.ok(pushTypes[type], `missing push type audit for ${type}`);
  assert.ok(Number.isInteger(pushTypes[type].total), `${type} missing total`);
  assert.ok(Number.isInteger(pushTypes[type].correct), `${type} missing correct count`);
  assert.ok(Number.isInteger(pushTypes[type].premature), `${type} missing premature count`);
  assert.ok(Number.isInteger(pushTypes[type].missed), `${type} missing missed count`);
  assert.ok(Array.isArray(pushTypes[type].common_failure_patterns), `${type} missing failure patterns`);
}

assert.ok(pushTypes.micro_push.total > 0, "simulation should still exercise micro_push");
assert.equal(pushTypes.micro_push.premature, 0, "micro_push should not be premature after v0.2 calibration");
assert.equal(pushTypes.load_push.total, 0, "simulation v0.2 should not use load_push until stronger evidence scenarios exist");
assert.equal(pushTypes.performance_push.total, 0, "performance_push should remain disabled in v0.2 calibration");
assert.equal(audit.metrics.high_confidence_wrong, 0, "high-confidence wrong decisions should stay at zero");
assert.ok(audit.metrics.by_recommendation.push.correctness_rate > 63, "push correctness should improve above v0.1 calibration");
assert.ok(audit.metrics.opportunity.missed_pushes < 40, "missed pushes should not explode");

console.log("Push type audit v0.2 test passed");
