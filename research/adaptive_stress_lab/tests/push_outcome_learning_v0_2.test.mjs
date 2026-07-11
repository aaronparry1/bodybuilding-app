import assert from "node:assert/strict";
import { runPushOutcomeLearningV0_2 } from "../src/push_outcome_learning_v0_2.mjs";

const result = runPushOutcomeLearningV0_2();

assert.ok(result.total_push_outcome_events > 500, "push outcome analysis should include existing synthetic push events");

for (const type of ["micro_push", "volume_push", "load_push", "performance_push"]) {
  assert.ok(result.outcome_distribution_by_push_type[type], `${type} distribution missing`);
}

for (const window of ["next_session", "two_week", "four_week", "eight_week"]) {
  assert.ok(result.outcome_distribution_by_follow_up_window[window], `${window} distribution missing`);
}

assert.ok(Object.keys(result.outcome_distribution_by_goal).length >= 5, "should analyse multiple goals");
assert.ok(result.context_analyses.some((item) => item.dimension === "evidence_quality_band"));
assert.ok(result.context_analyses.some((item) => item.dimension === "recovery_capacity_band"));
assert.ok(result.context_analyses.some((item) => item.dimension === "momentum_band"));
assert.ok(result.context_analyses.some((item) => item.dimension === "adaptation_band"));
assert.ok(result.context_analyses.some((item) => item.dimension === "same_exercise_exposures"));
assert.ok(result.context_analyses.some((item) => item.dimension === "load_ownership_state"));
assert.ok(result.context_analyses.some((item) => item.dimension === "recent_shutdown_or_pain"));
assert.ok(result.context_analyses.some((item) => item.dimension === "recent_missed_range"));

assert.ok(result.best_push_contexts.length > 0, "best push contexts should be reported");
assert.ok(result.worst_push_contexts.length > 0, "worst push contexts should be reported");
assert.ok(result.advisory_threshold_candidates.length > 0, "advisory thresholds should be produced");
assert.ok(result.rejected_findings.length > 0, "weak or unsafe findings should be rejected");
assert.ok(result.sample_size_warnings.length > 0, "small synthetic groups should be warned");

for (const threshold of result.advisory_threshold_candidates) {
  assert.equal(threshold.binding, false, "thresholds must remain advisory");
}

assert.ok(result.rejected_findings.some((item) => item.reason.includes("unsafe") || item.reason.includes("sample") || item.reason.includes("confidence")));

console.log("Push Outcome Learning v0.2 test passed");
