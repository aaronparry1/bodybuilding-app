import { generateSyntheticOutcomeEvents } from "./outcome_event_generator.mjs";

const WINDOWS = ["next_session", "two_week", "four_week", "eight_week"];
const PUSH_TYPES = ["micro_push", "volume_push", "load_push", "performance_push"];
const MIN_SAMPLE = 8;
const MIN_CONFIDENCE = 60;

export function runPushOutcomeLearningV0_2({ events = generateSyntheticOutcomeEvents() } = {}) {
  const pushEvents = events
    .filter((event) => event.recommendation_type === "push" && event.push_type)
    .map(enrichPushOutcome)
    .filter((event) => WINDOWS.includes(event.follow_up_window));

  const contextAnalyses = [
    ...analyseDimension(pushEvents, "push_type", (event) => event.push_type),
    ...analyseDimension(pushEvents, "goal", (event) => event.goal),
    ...analyseDimension(pushEvents, "follow_up_window", (event) => event.follow_up_window),
    ...analyseDimension(pushEvents, "evidence_quality_band", (event) => band(event.follow_up_evidence.evidence_quality_score, [70, 85, 90, 95])),
    ...analyseDimension(pushEvents, "recovery_capacity_band", (event) => band(event.follow_up_evidence.recovery_capacity, [60, 75, 85, 95])),
    ...analyseDimension(pushEvents, "momentum_band", (event) => band(event.follow_up_evidence.momentum, [60, 75, 85, 95])),
    ...analyseDimension(pushEvents, "adaptation_band", (event) => band(event.follow_up_evidence.adaptation, [60, 75, 85, 95])),
    ...analyseDimension(pushEvents, "same_exercise_exposures", (event) => exposureBand(event.follow_up_evidence.same_exercise_exposure_count)),
    ...analyseDimension(pushEvents, "load_ownership_state", (event) => event.follow_up_evidence.load_ownership_state),
    ...analyseDimension(pushEvents, "recent_shutdown_or_pain", (event) => String(event.follow_up_evidence.recent_shutdown_or_pain)),
    ...analyseDimension(pushEvents, "recent_missed_range", (event) => String(event.follow_up_evidence.recent_missed_range)),
    ...analyseCompositeContexts(pushEvents),
  ];

  return {
    generated_at: new Date().toISOString(),
    total_push_outcome_events: pushEvents.length,
    push_events: pushEvents,
    outcome_distribution_by_push_type: distributionBy(pushEvents, (event) => event.push_type),
    outcome_distribution_by_goal: distributionBy(pushEvents, (event) => event.goal),
    outcome_distribution_by_follow_up_window: distributionBy(pushEvents, (event) => event.follow_up_window),
    outcome_distribution_by_evidence_quality_band: distributionBy(pushEvents, (event) => band(event.follow_up_evidence.evidence_quality_score, [70, 85, 90, 95])),
    context_analyses: contextAnalyses,
    best_push_contexts: contextAnalyses
      .filter((item) => item.sample_size >= MIN_SAMPLE && item.unsafe === 0)
      .sort((a, b) => b.success_rate - a.success_rate || b.sample_size - a.sample_size)
      .slice(0, 12),
    worst_push_contexts: contextAnalyses
      .filter((item) => item.sample_size >= MIN_SAMPLE)
      .sort((a, b) => b.negative_or_unsafe_rate - a.negative_or_unsafe_rate || a.success_rate - b.success_rate)
      .slice(0, 12),
    advisory_threshold_candidates: buildAdvisoryThresholds(contextAnalyses),
    rejected_findings: rejectedFindings(contextAnalyses),
    sample_size_warnings: contextAnalyses.filter((item) => item.sample_size < MIN_SAMPLE),
    synthetic_limitations: [
      "All events come from synthetic Simulation v0.2/v0.3 outputs.",
      "The analysis is advisory and does not mutate Decision Engine rules.",
      "Outcome windows are weekly approximations, not real logged exposure timestamps.",
      "Population-level patterns cannot override individual athlete context.",
      "Unsafe outcomes are rejected even if short-term progress appears positive.",
    ],
  };
}

function enrichPushOutcome(event) {
  const f = event.follow_up_evidence;
  const progressDelta = valueDelta(f.follow_up_progress_score, f.current_v2_progress_score);
  const recoveryDelta = valueDelta(f.follow_up_recovery, f.current_recovery);
  const momentumDelta = valueDelta(f.follow_up_momentum, f.current_momentum);
  const unsafe = f.unsafe_push === true || event.outcome_classification === "unsafe";
  const recoveryCollapse = recoveryDelta <= -12;
  const momentumDrop = momentumDelta <= -8;
  const progressDrop = progressDelta <= -8;
  const preservedOrImproved = progressDelta >= -2 && recoveryDelta >= -6 && momentumDelta >= -5;
  const positive = !unsafe && preservedOrImproved && (progressDelta + recoveryDelta + momentumDelta >= 0);
  const negative = unsafe || recoveryCollapse || momentumDrop || progressDrop || event.outcome_classification === "negative";
  const push_outcome_classification = unsafe
    ? "unsafe"
    : negative
      ? "negative"
      : positive
        ? "positive"
        : f.follow_up_available
          ? "neutral"
          : "inconclusive";

  return {
    ...event,
    push_outcome_classification,
    push_outcome_deltas: {
      progress_delta: progressDelta,
      recovery_delta: recoveryDelta,
      momentum_delta: momentumDelta,
    },
  };
}

function analyseDimension(events, dimension, getKey) {
  return Object.entries(groupBy(events, getKey)).map(([key, items]) => contextSummary({ dimension, key, items }));
}

function analyseCompositeContexts(events) {
  return analyseDimension(events, "push_type_goal_window", (event) => `${event.push_type}:${event.goal}:${event.follow_up_window}`);
}

function contextSummary({ dimension, key, items }) {
  const distribution = pushDistribution(items);
  const avgConfidence = average(items.map((event) => event.confidence));
  return {
    dimension,
    key,
    sample_size: items.length,
    ...distribution,
    success_rate: percentage(distribution.positive, items.length),
    negative_or_unsafe_rate: percentage(distribution.negative + distribution.unsafe, items.length),
    average_confidence: avgConfidence,
    advisory_note: advisoryNoteFor({ sampleSize: items.length, distribution, avgConfidence }),
  };
}

function buildAdvisoryThresholds(contexts) {
  const candidates = [];
  const highQuality = contexts.find((item) => item.dimension === "evidence_quality_band" && item.key === "95+");
  const recoveryHigh = contexts.find((item) => item.dimension === "recovery_capacity_band" && item.key === "85-94");
  const recoveryVeryHigh = contexts.find((item) => item.dimension === "recovery_capacity_band" && item.key === "95+");
  const exposureHigh = contexts.find((item) => item.dimension === "same_exercise_exposures" && item.key === "5+");
  const loadOwned = contexts.find((item) => item.dimension === "load_ownership_state" && item.key === "owned");
  const missedRange = contexts.find((item) => item.dimension === "recent_missed_range" && item.key === "true");
  const pain = contexts.find((item) => item.dimension === "recent_shutdown_or_pain" && item.key === "true");

  candidates.push(threshold("micro_push", highQuality, "Keep micro_push evidence quality high; synthetic outcomes are mixed below stronger evidence bands."));
  candidates.push(threshold("volume_push", recoveryHigh ?? recoveryVeryHigh, "Volume push should remain tied to high recovery capacity and no density warning."));
  candidates.push(threshold("load_push", exposureHigh, "Load push should require repeated same-exercise exposures before another meaningful increase."));
  candidates.push(threshold("load_push", loadOwned, "Load push should prefer owned previous load; unknown ownership remains a limitation."));
  candidates.push(rejectionThreshold("all_push", missedRange, "Recent missed range should continue blocking push unless later evidence resolves it."));
  candidates.push(rejectionThreshold("all_push", pain, "Recent shutdown or pain should block push regardless of short-term performance."));

  return candidates.filter(Boolean);
}

function threshold(pushType, context, rationale) {
  if (!context) return null;
  return {
    push_type: pushType,
    context: `${context.dimension}:${context.key}`,
    sample_size: context.sample_size,
    success_rate: context.success_rate,
    negative_or_unsafe_rate: context.negative_or_unsafe_rate,
    confidence: context.average_confidence,
    advisory_threshold: context.sample_size >= MIN_SAMPLE && context.average_confidence >= MIN_CONFIDENCE && context.unsafe === 0
      ? "candidate"
      : "weak_or_rejected",
    rationale,
    binding: false,
  };
}

function rejectionThreshold(pushType, context, rationale) {
  if (!context) return null;
  return {
    push_type: pushType,
    context: `${context.dimension}:${context.key}`,
    sample_size: context.sample_size,
    success_rate: context.success_rate,
    negative_or_unsafe_rate: context.negative_or_unsafe_rate,
    confidence: context.average_confidence,
    advisory_threshold: "rejection_guardrail",
    rationale,
    binding: false,
  };
}

function rejectedFindings(contexts) {
  return contexts
    .filter((item) =>
      item.sample_size < MIN_SAMPLE ||
      item.average_confidence < MIN_CONFIDENCE ||
      item.unsafe > 0 ||
      item.advisory_note.includes("Reject")
    )
    .map((item) => ({
      dimension: item.dimension,
      key: item.key,
      sample_size: item.sample_size,
      confidence: item.average_confidence,
      unsafe: item.unsafe,
      reason: item.advisory_note,
    }));
}

function advisoryNoteFor({ sampleSize, distribution, avgConfidence }) {
  if (distribution.unsafe > 0) return "Reject: unsafe outcomes cannot support push aggression.";
  if (sampleSize < MIN_SAMPLE) return "Reject: sample size too low.";
  if (avgConfidence < MIN_CONFIDENCE) return "Reject: confidence too low.";
  const negativeRate = percentage(distribution.negative + distribution.unsafe, sampleSize);
  const successRate = percentage(distribution.positive, sampleSize);
  if (negativeRate >= 30) return "Review conservatively: negative/unsafe rate is high.";
  if (successRate >= 55 && negativeRate <= 15) return "Candidate: context may support push when Charter/Safety allow.";
  return "Neutral: keep observing before tuning.";
}

function distributionBy(events, getKey) {
  return Object.fromEntries(Object.entries(groupBy(events, getKey)).map(([key, items]) => {
    const distribution = pushDistribution(items);
    return [key, {
      total: items.length,
      ...distribution,
      success_rate: percentage(distribution.positive, items.length),
      negative_or_unsafe_rate: percentage(distribution.negative + distribution.unsafe, items.length),
      average_confidence: average(items.map((event) => event.confidence)),
    }];
  }));
}

function pushDistribution(events) {
  return {
    positive: events.filter((event) => event.push_outcome_classification === "positive").length,
    neutral: events.filter((event) => event.push_outcome_classification === "neutral").length,
    negative: events.filter((event) => event.push_outcome_classification === "negative").length,
    unsafe: events.filter((event) => event.push_outcome_classification === "unsafe").length,
    inconclusive: events.filter((event) => event.push_outcome_classification === "inconclusive").length,
  };
}

function exposureBand(value) {
  if (value <= 1) return "0-1";
  if (value === 2) return "2";
  if (value === 3) return "3";
  if (value === 4) return "4";
  return "5+";
}

function band(value, thresholds) {
  if (value < thresholds[0]) return `<${thresholds[0]}`;
  for (let i = 1; i < thresholds.length; i += 1) {
    if (value < thresholds[i]) return `${thresholds[i - 1]}-${thresholds[i] - 1}`;
  }
  return `${thresholds.at(-1)}+`;
}

function valueDelta(next, current) {
  if (!Number.isFinite(next) || !Number.isFinite(current)) return 0;
  return next - current;
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
