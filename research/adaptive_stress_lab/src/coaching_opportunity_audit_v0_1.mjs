import { runSimulationV0_2 } from "./simulation_v0_2.mjs";

const AGGRESSION_ORDER = {
  stop_session: 0,
  stop_movement: 0,
  recover: 1,
  reduce: 2,
  substitute: 2,
  consolidate: 3,
  hold: 4,
  push: 5,
};

export function runCoachingOpportunityAuditV0_1({ simulation = runSimulationV0_2() } = {}) {
  const decisions = simulation.athletes.flatMap((athleteResult) => auditAthlete(athleteResult));
  const metrics = summariseAudit(decisions);
  return {
    generated_at: new Date().toISOString(),
    simulation_summary: simulation.aggregate,
    decisions,
    metrics,
  };
}

function auditAthlete(athleteResult) {
  return athleteResult.weeks.map((week, index, weeks) => {
    const fourWeek = weeks[index + 4] ?? null;
    const ideal = idealActionFor(week);
    const actual = week.v2Recommendation.recommendation_type;
    const actualPushCategory = week.v2Recommendation.push_category ?? (actual === "push" ? "uncategorized_push" : null);
    const idealPushCategory = ideal.type === "push" ? idealPushCategoryFor(week) : null;
    const correctness = isCorrect({ actual, ideal, week });
    const aggression = calibrateAggression({ actual, ideal, week });
    const future = fourWeekOutcome({ week, fourWeek });
    const opportunityCost = estimateOpportunityCost({ actual, ideal, correctness, aggression, future, week });
    return {
      athlete_id: athleteResult.athlete.id,
      athlete_label: athleteResult.athlete.label,
      goal: athleteResult.athlete.goal,
      week: week.week,
      event: week.event.type,
      recommendation: actual,
      push_category: actualPushCategory,
      ideal_recommendation: ideal.type,
      ideal_push_category: idealPushCategory,
      ideal_reason: ideal.reason,
      confidence: week.v2Recommendation.confidence,
      correct: correctness.correct,
      correctness_reason: correctness.reason,
      aggression,
      opportunity_cost: opportunityCost,
      four_week_outcome: future,
      safety_gate_status: week.safetyGate.status,
      goal_progress_score: week.goalProgress.progress_score,
      goal_progress_confidence: week.goalProgress.confidence,
    };
  });
}

function idealActionFor(week) {
  const event = week.event.type;
  const safety = week.safetyGate.status;
  const confidence = week.goalProgress.confidence;
  const trend = week.goalProgress.trend;
  const state = week.coachingState;

  if (event.startsWith("higher_risk_")) {
    return {
      type: week.event.expectedRecommendation ?? "hold",
      reason: "Higher-risk push validation uses explicit scenario expectations.",
    };
  }
  if (safety === "stop") return { type: week.safetyGate.affected_areas.includes("systemic") ? "stop_session" : "stop_movement", reason: "Safety Gate stop has veto priority." };
  if (event === "injury_pain_event") return { type: "stop_movement", reason: "Pain event should stop or restrict the affected movement." };
  if (safety === "restrict" && event === "systemic_fatigue") return { type: "recover", reason: "Systemic fatigue with restricted safety needs recovery." };
  if (event === "illness") return { type: "recover", reason: "Illness should bias toward recovery." };
  if (event === "local_lift_stall") return { type: "reduce", reason: "Local lift stall should be handled locally." };
  if (event === "post_swap_improvement") return { type: "consolidate", reason: "One post-swap improvement should consolidate before pushing." };
  if (event === "productive_fatigue") return { type: "consolidate", reason: "Productive fatigue should be allowed to stick before more stress." };
  if (event === "low_evidence_early_phase") return { type: "hold", reason: "Low evidence should not trigger aggressive decisions." };
  if (["missed_sessions", "holiday", "poor_sleep_stress"].includes(event)) return { type: "hold", reason: "Disruption should preserve momentum without forcing stress." };
  if (trend === "improving" && confidence >= 85 && state.recovery_capacity >= 75 && state.momentum >= 70) return { type: "push", reason: "High-confidence improving state can earn a controlled push." };
  if (trend === "improving" && confidence >= 70) return { type: "hold", reason: "Progress is present but not enough to demand a push." };
  if (trend === "declining" && safety === "clear") return { type: "consolidate", reason: "Decline without safety restriction should consolidate before recovery." };
  return { type: "hold", reason: "Default smallest effective intervention is hold." };
}

function isCorrect({ actual, ideal, week }) {
  if (actual === ideal.type) return { correct: true, reason: "Exact match to retrospective ideal action." };
  const acceptable = acceptableAlternatives(ideal.type, week);
  if (acceptable.includes(actual)) return { correct: true, reason: `Acceptable alternative to ${ideal.type}.` };
  return { correct: false, reason: `Expected ${ideal.type}, got ${actual}.` };
}

function acceptableAlternatives(type, week) {
  if (type === "stop_movement") return ["reduce", "substitute"];
  if (type === "recover" && week.event.type === "systemic_fatigue") return ["consolidate"];
  if (type === "consolidate") return ["hold"];
  if (type === "hold") return ["consolidate"];
  return [];
}

function calibrateAggression({ actual, ideal }) {
  const actualScore = AGGRESSION_ORDER[actual] ?? 4;
  const idealScore = AGGRESSION_ORDER[ideal.type] ?? 4;
  const delta = actualScore - idealScore;
  if (delta >= 2) return "too_aggressive";
  if (delta <= -2) return "too_conservative";
  return "balanced";
}

function fourWeekOutcome({ week, fourWeek }) {
  if (!fourWeek) {
    return {
      available: false,
      adaptation_delta: null,
      progress_delta: null,
      momentum_delta: null,
      confidence_delta: null,
      recovery_delta: null,
      improved_four_week: null,
    };
  }
  const adaptationDelta = fourWeek.coachingState.adaptation - week.coachingState.adaptation;
  const progressDelta = fourWeek.v2.progress_score - week.v2.progress_score;
  const momentumDelta = fourWeek.v2.momentum - week.v2.momentum;
  const confidenceDelta = fourWeek.coachingState.confidence - week.coachingState.confidence;
  const recoveryDelta = fourWeek.v2.recovery - week.v2.recovery;
  return {
    available: true,
    adaptation_delta: adaptationDelta,
    progress_delta: progressDelta,
    momentum_delta: momentumDelta,
    confidence_delta: confidenceDelta,
    recovery_delta: recoveryDelta,
    improved_four_week: adaptationDelta + progressDelta + momentumDelta + recoveryDelta >= 0,
  };
}

function estimateOpportunityCost({ correctness, aggression, future, week }) {
  if (correctness.correct) return 0;
  let cost = 4;
  if (aggression === "too_aggressive") cost += 4;
  if (aggression === "too_conservative") cost += 2;
  if (week.safetyGate.status !== "clear" && week.v2Recommendation.recommendation_type === "push") cost += 10;
  if (week.v2Recommendation.recommendation_type === "recover" && week.goalProgress.confidence < 55) cost += 3;
  if (future.available && future.progress_delta < 0) cost += Math.min(8, Math.abs(future.progress_delta));
  if (future.available && future.momentum_delta < 0) cost += Math.min(5, Math.abs(future.momentum_delta));
  return Math.round(cost);
}

function summariseAudit(decisions) {
  const byType = groupBy(decisions, (item) => item.recommendation);
  const confidenceBuckets = confidenceCalibration(decisions);
  const opportunity = {
    missed_pushes: decisions.filter((item) => item.ideal_recommendation === "push" && item.recommendation !== "push").length,
    missed_consolidations: decisions.filter((item) => item.ideal_recommendation === "consolidate" && !["consolidate", "hold"].includes(item.recommendation)).length,
    unnecessary_recovery: decisions.filter((item) => item.recommendation === "recover" && item.ideal_recommendation !== "recover").length,
    premature_pushes: decisions.filter((item) => item.recommendation === "push" && item.ideal_recommendation !== "push").length,
    correct_pushes: decisions.filter((item) => item.recommendation === "push" && item.correct).length,
    correct_holds: decisions.filter((item) => item.recommendation === "hold" && item.correct).length,
    correct_recoveries: decisions.filter((item) => item.recommendation === "recover" && item.correct).length,
    correct_consolidations: decisions.filter((item) => item.recommendation === "consolidate" && item.correct).length,
  };
  const aggression = {
    too_conservative: decisions.filter((item) => item.aggression === "too_conservative").length,
    balanced: decisions.filter((item) => item.aggression === "balanced").length,
    too_aggressive: decisions.filter((item) => item.aggression === "too_aggressive").length,
  };
  const correct = decisions.filter((item) => item.correct);
  const incorrect = decisions.filter((item) => !item.correct);
  return {
    total_decisions: decisions.length,
    correct_decisions: correct.length,
    incorrect_decisions: incorrect.length,
    correctness_rate: percentage(correct.length, decisions.length),
    opportunity,
    aggression,
    by_recommendation: Object.fromEntries(Object.entries(byType).map(([type, items]) => [type, {
      total: items.length,
      correct: items.filter((item) => item.correct).length,
      correctness_rate: percentage(items.filter((item) => item.correct).length, items.length),
      average_confidence: average(items.map((item) => item.confidence)),
      average_opportunity_cost: average(items.map((item) => item.opportunity_cost)),
    }])),
    by_push_type: pushTypeBreakdown(decisions),
    confidence_calibration: confidenceBuckets,
    high_confidence_wrong: decisions.filter((item) => item.confidence >= 90 && !item.correct).length,
    low_confidence_correct: decisions.filter((item) => item.confidence < 70 && item.correct).length,
    average_opportunity_cost: average(decisions.map((item) => item.opportunity_cost)),
    total_opportunity_cost: decisions.reduce((sum, item) => sum + item.opportunity_cost, 0),
    four_week_positive_rate: percentage(decisions.filter((item) => item.four_week_outcome.improved_four_week === true).length, decisions.filter((item) => item.four_week_outcome.available).length),
    best_decisions: correct
      .filter((item) => item.four_week_outcome.available)
      .sort((a, b) => fourWeekScore(b) - fourWeekScore(a))
      .slice(0, 10),
    worst_decisions: incorrect
      .sort((a, b) => b.opportunity_cost - a.opportunity_cost)
      .slice(0, 10),
    most_expensive_mistakes: incorrect
      .filter((item) => item.opportunity_cost > 0)
      .sort((a, b) => b.opportunity_cost - a.opportunity_cost)
      .slice(0, 10),
    tuning_recommendations: tuningRecommendations({ opportunity, aggression, confidenceBuckets, incorrect }),
  };
}

function idealPushCategoryFor(week) {
  const readiness = week.evidence?.pushReadiness ?? {};
  const goal = week.athlete?.goal ?? week.goal;
  const topEnd = readiness.topEndTargetRangeSuccesses ?? 0;
  const stableBlockWeeks = readiness.stableBlockWeeks ?? 0;

  if (
    readiness.performanceMilestoneOpportunity === true &&
    stableBlockWeeks >= 8 &&
    ["strength", "powerlifting", "athletic_performance"].includes(goal)
  ) {
    return "performance_push";
  }
  if (
    readiness.loadJump === "small_sensible" &&
    topEnd >= 3 &&
    ["strength", "powerlifting", "build_muscle_strength", "strength_hypertrophy"].includes(goal)
  ) {
    return "load_push";
  }
  if (
    readiness.qualityVolumeTolerance === "high" &&
    ["build_muscle", "hypertrophy", "build_muscle_strength", "strength_hypertrophy"].includes(goal)
  ) {
    return "volume_push";
  }
  if (week.coachingState.recovery_capacity >= 88 && week.coachingState.momentum >= 85 && week.goalProgress.confidence >= 95) return "volume_push";
  return "micro_push";
}

function pushTypeBreakdown(decisions) {
  const categories = ["micro_push", "volume_push", "load_push", "performance_push", "uncategorized_push"];
  return Object.fromEntries(categories.map((category) => {
    const actual = decisions.filter((item) => item.recommendation === "push" && item.push_category === category);
    const missed = decisions.filter((item) => item.ideal_recommendation === "push" && item.recommendation !== "push" && item.ideal_push_category === category);
    const correct = actual.filter((item) => item.correct);
    const incorrect = actual.filter((item) => !item.correct);
    const withOutcome = actual.filter((item) => item.four_week_outcome.available);
    return [category, {
      total: actual.length,
      correct: correct.length,
      incorrect: incorrect.length,
      correctness_rate: percentage(correct.length, actual.length),
      premature: actual.filter((item) => item.ideal_recommendation !== "push").length,
      missed: missed.length,
      average_confidence: average(actual.map((item) => item.confidence)),
      average_opportunity_cost: average(actual.map((item) => item.opportunity_cost)),
      four_week_outcome_rate: percentage(withOutcome.filter((item) => item.four_week_outcome.improved_four_week === true).length, withOutcome.length),
      common_failure_patterns: commonFailurePatterns(incorrect),
    }];
  }));
}

function commonFailurePatterns(items) {
  const counts = items.reduce((acc, item) => {
    const key = `${item.goal}:${item.event}:ideal_${item.ideal_recommendation}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pattern, count]) => ({ pattern, count }));
}

function confidenceCalibration(decisions) {
  const buckets = [
    { label: "0-59", min: 0, max: 59 },
    { label: "60-74", min: 60, max: 74 },
    { label: "75-89", min: 75, max: 89 },
    { label: "90-100", min: 90, max: 100 },
  ];
  return buckets.map((bucket) => {
    const items = decisions.filter((item) => item.confidence >= bucket.min && item.confidence <= bucket.max);
    const correct = items.filter((item) => item.correct).length;
    return {
      bucket: bucket.label,
      total: items.length,
      correct,
      incorrect: items.length - correct,
      correctness_rate: percentage(correct, items.length),
      average_opportunity_cost: average(items.map((item) => item.opportunity_cost)),
    };
  });
}

function tuningRecommendations({ opportunity, aggression, confidenceBuckets, incorrect }) {
  const recs = [];
  if (opportunity.missed_pushes > opportunity.premature_pushes * 2) recs.push("Review push threshold: missed pushes materially exceed premature pushes.");
  if (opportunity.unnecessary_recovery > 0) recs.push("Audit recover gate: recovery should remain systemic and high-confidence.");
  if (aggression.too_conservative > aggression.too_aggressive * 2) recs.push("Coach is biased conservative in this simulation; inspect high-confidence holds and consolidations.");
  if (aggression.too_aggressive > 0) recs.push("Aggressive mistakes remain; inspect push/recover recommendations under disruption.");
  const highConfidence = confidenceBuckets.find((bucket) => bucket.bucket === "90-100");
  if (highConfidence && highConfidence.incorrect > 0) recs.push("High-confidence wrong decisions exist; confidence calibration needs tightening.");
  if (incorrect.some((item) => item.recommendation === "recover" && item.goal === "get_lean")) recs.push("Get Lean recover decisions can be training-correct while body-composition confidence is low; separate training recovery confidence from goal-progress confidence.");
  if (recs.length === 0) recs.push("No urgent tuning issue from this audit; expand scenario realism before production inference.");
  return recs;
}

function fourWeekScore(item) {
  const outcome = item.four_week_outcome;
  if (!outcome.available) return 0;
  return outcome.adaptation_delta + outcome.progress_delta + outcome.momentum_delta + outcome.confidence_delta + outcome.recovery_delta;
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
  if (!clean.length) return 0;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
