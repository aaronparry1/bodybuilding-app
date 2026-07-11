import { generateSyntheticOutcomeEvents } from "./outcome_event_generator.mjs";

const OUTCOME_TYPES = ["positive", "neutral", "negative", "unsafe", "inconclusive"];
const MIN_SAMPLE_FOR_ADVISORY_SIGNAL = 20;
const MIN_CONFIDENCE_FOR_ADVISORY_SIGNAL = 65;

export function runOutcomeLearningV0_1({ events = generateSyntheticOutcomeEvents() } = {}) {
  const learningRecords = buildLearningRecords(events);
  return {
    generated_at: new Date().toISOString(),
    total_events: events.length,
    events,
    outcome_distribution_by_recommendation: distributionBy(events, (event) => event.recommendation_type),
    outcome_distribution_by_push_type: distributionBy(events.filter((event) => event.push_type), (event) => event.push_type),
    outcome_distribution_by_goal: distributionBy(events, (event) => event.goal),
    learning_records: learningRecords,
    sample_size_warnings: learningRecords.filter((record) => record.sample_size < MIN_SAMPLE_FOR_ADVISORY_SIGNAL),
    low_confidence_findings: learningRecords.filter((record) => record.confidence < MIN_CONFIDENCE_FOR_ADVISORY_SIGNAL),
    candidate_learning_signals: learningRecords.filter((record) => record.suggested_adjustment !== "no_change" && record.confidence >= MIN_CONFIDENCE_FOR_ADVISORY_SIGNAL && record.sample_size >= MIN_SAMPLE_FOR_ADVISORY_SIGNAL),
    rejected_signals: learningRecords.filter((record) => record.charter_guardrail_notes.some((note) => note.startsWith("Rejected"))),
    guardrails: outcomeLearningGuardrails(),
  };
}

export function buildLearningRecords(events) {
  const grouped = groupBy(events, decisionContextSignature);
  return Object.entries(grouped).map(([signature, items]) => buildLearningRecord({ signature, events: items }));
}

export function outcomeLearningGuardrails() {
  return [
    "Outcome data informs the coach; it does not override the Charter.",
    "Never reward unsafe decisions.",
    "Never optimise for engagement over progress.",
    "Never reward excessive fatigue or short-term performance at the cost of long-term progress.",
    "Never treat population data as absolute truth.",
    "Never ignore individual athlete context.",
    "Never override Safety Gate.",
    "Never mutate production rules automatically.",
  ];
}

function buildLearningRecord({ signature, events }) {
  const distribution = distributionFor(events);
  const positiveRate = ratio(distribution.positive, events.length);
  const negativeRate = ratio(distribution.negative + distribution.unsafe, events.length);
  const confidence = confidenceForLearningRecord({ events, distribution });
  const first = events[0];
  const guardrails = guardrailNotes({ events, distribution, confidence });
  return {
    decision_context_signature: signature,
    recommendation_type: first.recommendation_type,
    push_type: first.push_type,
    outcome_distribution: distribution,
    sample_size: events.length,
    confidence,
    suggested_adjustment: suggestedAdjustment({ events, positiveRate, negativeRate, confidence, guardrails }),
    charter_guardrail_notes: guardrails,
  };
}

function suggestedAdjustment({ events, positiveRate, negativeRate, confidence, guardrails }) {
  if (guardrails.some((note) => note.startsWith("Rejected"))) return "no_change";
  if (events.length < MIN_SAMPLE_FOR_ADVISORY_SIGNAL) return "no_change";
  if (confidence < MIN_CONFIDENCE_FOR_ADVISORY_SIGNAL) return "no_change";
  const first = events[0];
  if (first.recommendation_type === "push" && first.push_type === "load_push" && negativeRate >= 0.25) return "review_load_ownership_thresholds";
  if (first.recommendation_type === "push" && first.push_type === "volume_push" && positiveRate >= 0.55) return "consider_preserving_volume_push_threshold";
  if (first.recommendation_type === "recover" && positiveRate < 0.45) return "review_recovery_week_trigger";
  if (first.recommendation_type === "hold" && positiveRate >= 0.65) return "review_missed_push_opportunity";
  if (positiveRate >= 0.65 && negativeRate <= 0.1) return "consider_preserving_rule";
  if (negativeRate >= 0.35) return "review_rule_conservatively";
  return "no_change";
}

function guardrailNotes({ events, distribution, confidence }) {
  const notes = [
    "Advisory only: does not mutate rules.",
    "Safety Gate and Charter remain higher authority than outcome frequency.",
  ];
  if (distribution.unsafe > 0) notes.push("Rejected unsafe signal: unsafe outcomes cannot be rewarded or used to increase aggression.");
  if (events.length < MIN_SAMPLE_FOR_ADVISORY_SIGNAL) notes.push("Rejected low-sample signal: sample size is too small for tuning.");
  if (confidence < MIN_CONFIDENCE_FOR_ADVISORY_SIGNAL) notes.push("Rejected low-confidence signal: outcome confidence is too low for tuning.");
  if (events.some((event) => event.recommendation_type === "push" && event.follow_up_evidence.follow_up_recovery !== null && event.follow_up_evidence.follow_up_recovery < event.follow_up_evidence.current_recovery - 12)) {
    notes.push("Rejected fatigue-cost signal: short-term performance with recovery collapse cannot justify more aggression.");
  }
  return notes;
}

function confidenceForLearningRecord({ events, distribution }) {
  const sampleComponent = Math.min(35, Math.round(events.length * 1.5));
  const eventConfidence = average(events.map((event) => event.confidence));
  const inconclusivePenalty = Math.round(ratio(distribution.inconclusive, events.length) * 25);
  const unsafeClarity = distribution.unsafe > 0 ? 8 : 0;
  return Math.max(0, Math.min(100, Math.round(sampleComponent + eventConfidence * 0.55 - inconclusivePenalty + unsafeClarity)));
}

function decisionContextSignature(event) {
  const push = event.push_type ? `:${event.push_type}` : "";
  return `${event.goal}:${event.recommendation_type}${push}:${event.follow_up_window}`;
}

function distributionBy(events, getKey) {
  return Object.fromEntries(Object.entries(groupBy(events, getKey)).map(([key, items]) => [key, {
    total: items.length,
    ...distributionFor(items),
    positive_rate: percentage(items.filter((item) => item.outcome_classification === "positive").length, items.length),
    negative_or_unsafe_rate: percentage(items.filter((item) => item.outcome_classification === "negative" || item.outcome_classification === "unsafe").length, items.length),
  }]));
}

function distributionFor(events) {
  return Object.fromEntries(OUTCOME_TYPES.map((type) => [type, events.filter((event) => event.outcome_classification === type).length]));
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length) : 0;
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function ratio(value, total) {
  return total ? value / total : 0;
}
