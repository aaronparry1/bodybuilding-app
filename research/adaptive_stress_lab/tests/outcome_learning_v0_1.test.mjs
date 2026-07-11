import assert from "node:assert/strict";
import { generateSyntheticOutcomeEvents, OUTCOME_WINDOWS } from "../src/outcome_event_generator.mjs";
import { outcomeLearningGuardrails, runOutcomeLearningV0_1 } from "../src/outcome_learning_v0_1.mjs";

const events = generateSyntheticOutcomeEvents();
const result = runOutcomeLearningV0_1({ events });

assert.ok(events.length > 1000, "outcome generator should create a meaningful synthetic dataset");
assert.equal(new Set(events.map((event) => event.follow_up_window)).size, OUTCOME_WINDOWS.length);
assert.ok(events.every((event) => ["positive", "neutral", "negative", "unsafe", "inconclusive"].includes(event.outcome_classification)));
assert.ok(events.every((event) => Number.isInteger(event.confidence) && event.confidence >= 0 && event.confidence <= 100));
assert.ok(events.some((event) => event.push_type === "load_push"), "load push outcomes should be represented");
assert.ok(events.some((event) => event.push_type === "volume_push"), "volume push outcomes should be represented");
assert.ok(events.some((event) => event.push_type === "performance_push"), "performance push outcomes should be represented");

assert.equal(result.total_events, events.length);
assert.ok(result.learning_records.length > 0);
assert.ok(result.sample_size_warnings.length > 0, "synthetic small groups should create sample-size warnings");
assert.ok(result.low_confidence_findings.length > 0, "synthetic inconclusive windows should create low-confidence findings");
assert.ok(result.rejected_signals.length > 0, "unsafe/low-confidence signals should be rejected");

for (const record of result.learning_records) {
  assert.ok(record.decision_context_signature);
  assert.ok(record.outcome_distribution);
  assert.ok(Number.isInteger(record.sample_size));
  assert.ok(Number.isInteger(record.confidence));
  assert.ok(Array.isArray(record.charter_guardrail_notes));
  assert.ok(record.charter_guardrail_notes.some((note) => note.includes("Advisory") || note.includes("Safety Gate")));
}

const guardrails = outcomeLearningGuardrails().join(" ");
assert.ok(guardrails.includes("does not override the Charter"));
assert.ok(guardrails.includes("Never reward unsafe decisions"));
assert.ok(guardrails.includes("Never mutate production rules automatically"));

assert.ok(result.learning_records.every((record) => record.suggested_adjustment !== "automatic_rule_update"));

console.log("Outcome Learning v0.1 test passed");
