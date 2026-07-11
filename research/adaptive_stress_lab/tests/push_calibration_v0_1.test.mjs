import assert from "node:assert/strict";
import { runCoachingOpportunityAuditV0_1 } from "../src/coaching_opportunity_audit_v0_1.mjs";
import { runSimulationV0_2 } from "../src/simulation_v0_2.mjs";

const simulation = runSimulationV0_2();
const audit = runCoachingOpportunityAuditV0_1({ simulation });

const pushStats = audit.metrics.by_recommendation.push;
assert.ok(pushStats, "audit should include push decisions");
assert.ok(pushStats.correctness_rate > 45, `push correctness should improve materially above baseline 45%, got ${pushStats.correctness_rate}%`);
assert.ok(audit.metrics.opportunity.premature_pushes < 118, `premature pushes should drop below baseline 118, got ${audit.metrics.opportunity.premature_pushes}`);
assert.ok(audit.metrics.high_confidence_wrong < 198, `high-confidence wrong decisions should drop below baseline 198, got ${audit.metrics.high_confidence_wrong}`);
assert.ok(audit.metrics.correctness_rate >= 74, `overall correctness should not regress below baseline 74%, got ${audit.metrics.correctness_rate}%`);

const pushDecisions = audit.decisions.filter((item) => item.recommendation === "push");
assert.ok(pushDecisions.length > 0, "push count should not collapse to zero");
assert.ok(pushDecisions.every((item) => item.confidence <= 85), "push confidence should be capped at 85 or lower");

const highConfidenceWrong = audit.decisions.filter((item) => item.confidence >= 90 && !item.correct);
assert.equal(highConfidenceWrong.length, 0, "high-confidence wrong decisions should be eliminated in this calibration pass");

const simulationPushes = simulation.athletes.flatMap((athlete) => athlete.weeks.filter((week) => week.v2Recommendation.recommendation_type === "push"));
assert.ok(simulationPushes.every((week) => week.v2Recommendation.push_category), "push decisions should include an internal push category");
assert.ok(simulationPushes.some((week) => week.v2Recommendation.push_category === "micro_push"), "default push category should include micro_push");

console.log("Push calibration v0.1 test passed");
