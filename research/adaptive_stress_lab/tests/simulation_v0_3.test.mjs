import assert from "node:assert/strict";
import { runCoachingOpportunityAuditV0_1 } from "../src/coaching_opportunity_audit_v0_1.mjs";
import { runSimulationV0_3 } from "../src/simulation_v0_3.mjs";

const simulation = runSimulationV0_3();
const audit = runCoachingOpportunityAuditV0_1({ simulation });

assert.equal(simulation.aggregate.total_athletes, 5);
assert.ok(simulation.aggregate.total_weeks >= 40);
assert.equal(simulation.aggregate.unsafe_pushes, 0);
assert.equal(simulation.aggregate.wrong_push_categories, 0);
assert.equal(simulation.aggregate.missed_expected_pushes, 0);

for (const category of ["micro_push", "volume_push", "load_push", "performance_push"]) {
  assert.ok(simulation.aggregate.by_push_type[category].total > 0, `${category} should be exercised in simulation v0.3`);
  assert.equal(simulation.aggregate.by_push_type[category].premature, 0, `${category} should not be premature`);
}

assert.equal(audit.metrics.opportunity.premature_pushes, 0);
assert.equal(audit.metrics.opportunity.missed_pushes, 0);
assert.equal(audit.metrics.high_confidence_wrong, 0);
assert.equal(audit.metrics.by_push_type.volume_push.correctness_rate, 100);
assert.equal(audit.metrics.by_push_type.load_push.correctness_rate, 100);
assert.equal(audit.metrics.by_push_type.performance_push.correctness_rate, 100);

console.log("Simulation v0.3 higher-risk push validation test passed");
