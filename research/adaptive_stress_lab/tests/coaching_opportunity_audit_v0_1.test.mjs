import assert from "node:assert/strict";
import { runCoachingOpportunityAuditV0_1 } from "../src/coaching_opportunity_audit_v0_1.mjs";

const audit = runCoachingOpportunityAuditV0_1();

assert.equal(audit.metrics.total_decisions, 1040);
assert.ok(audit.metrics.correct_decisions > 0);
assert.ok(audit.metrics.incorrect_decisions > 0, "audit should be able to expose imperfect decisions");
assert.ok(audit.metrics.correctness_rate >= 50 && audit.metrics.correctness_rate <= 100);

for (const key of [
  "missed_pushes",
  "missed_consolidations",
  "unnecessary_recovery",
  "premature_pushes",
  "correct_pushes",
  "correct_holds",
  "correct_recoveries",
  "correct_consolidations",
]) {
  assert.ok(Number.isInteger(audit.metrics.opportunity[key]), `missing opportunity metric ${key}`);
}

for (const key of ["too_conservative", "balanced", "too_aggressive"]) {
  assert.ok(Number.isInteger(audit.metrics.aggression[key]), `missing aggression metric ${key}`);
}

assert.equal(audit.metrics.aggression.too_conservative + audit.metrics.aggression.balanced + audit.metrics.aggression.too_aggressive, audit.metrics.total_decisions);
assert.equal(audit.metrics.confidence_calibration.length, 4);
assert.ok(audit.metrics.confidence_calibration.some((bucket) => bucket.bucket === "90-100"));
assert.ok(Array.isArray(audit.metrics.best_decisions));
assert.ok(Array.isArray(audit.metrics.worst_decisions));
assert.ok(Array.isArray(audit.metrics.most_expensive_mistakes));
assert.ok(audit.metrics.tuning_recommendations.length > 0);

const highConfidenceBucket = audit.metrics.confidence_calibration.find((bucket) => bucket.bucket === "90-100");
assert.ok(highConfidenceBucket.total > 0, "should audit high-confidence decisions");

for (const decision of audit.decisions.slice(0, 20)) {
  assert.ok(decision.athlete_id);
  assert.ok(decision.week >= 1 && decision.week <= 52);
  assert.ok(decision.recommendation);
  assert.ok(decision.ideal_recommendation);
  assert.ok(["too_conservative", "balanced", "too_aggressive"].includes(decision.aggression));
  assert.ok(Number.isFinite(decision.opportunity_cost));
  assert.ok(decision.four_week_outcome);
}

console.log("Coaching opportunity audit v0.1 test passed");
