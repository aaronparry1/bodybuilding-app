import { calculateCoachingState } from "./coaching_state_engine.mjs";
import { createCoachingRecommendation } from "./decision_engine_v0_2.mjs";
import { evaluateSafetyGate } from "./safety_gate.mjs";
import { calculateGoalProgress } from "./goal_progress_metrics.mjs";

export const virtualAthletesV0_2 = buildVirtualAthletes();

export function runSimulationV0_2({ weeks = 52, athletes = virtualAthletesV0_2 } = {}) {
  const athleteResults = athletes.map((athlete) => runAthleteTimeline({ athlete, weeks }));
  const aggregate = aggregateComparison(athleteResults);
  return { athletes: athleteResults, aggregate };
}

function runAthleteTimeline({ athlete, weeks }) {
  let previousProgress = null;
  let v1Momentum = 62 + athlete.momentumTendency;
  let v2Momentum = 62 + athlete.momentumTendency;
  let v1Recovery = startingRecoveryFor(athlete);
  let v2Recovery = startingRecoveryFor(athlete);
  const timeline = [];

  for (let week = 1; week <= weeks; week += 1) {
    const event = eventForWeek(athlete, week);
    const evidence = buildEvidence({ athlete, week, event });
    const coachingState = calculateCoachingState({ athlete, evidence, now: dateForWeek(week) });
    const safetyGate = evaluateSafetyGate({ athlete, evidence, coachingState });
    const v2Recommendation = createCoachingRecommendation({ athlete, evidence, coachingState, safetyGate });
    const goalProgress = calculateGoalProgress({ goal: athlete.goal, evidence, previousProgress, now: dateForWeek(week) });
    const v1Decision = baselineDecision({ evidence, event });
    const v2Outcome = scoreOutcome({ baseProgress: goalProgress.progress_score, decision: v2Recommendation.recommendation_type, safetyGate, event, engine: "v2" });
    const v1Outcome = scoreOutcome({ baseProgress: goalProgress.progress_score, decision: v1Decision.type, safetyGate, event, engine: "v1" });
    v1Momentum = updateMomentum({ previous: v1Momentum, outcome: v1Outcome, decision: v1Decision.type, event });
    v2Momentum = updateMomentum({ previous: v2Momentum, outcome: v2Outcome, decision: v2Recommendation.recommendation_type, event });
    v1Recovery = updateRecovery({ previous: v1Recovery, decision: v1Decision.type, event });
    v2Recovery = updateRecovery({ previous: v2Recovery, decision: v2Recommendation.recommendation_type, event });

    const comparison = classifyWeekComparison({ event, safetyGate, v1Decision, v2Recommendation, goalProgress, v1Outcome, v2Outcome });
    timeline.push({
      week,
      event,
      evidence,
      coachingState,
      safetyGate,
      v2Recommendation,
      v1Decision,
      goalProgress,
      v1: { progress_score: v1Outcome, momentum: Math.round(v1Momentum), recovery: Math.round(v1Recovery) },
      v2: { progress_score: v2Outcome, momentum: Math.round(v2Momentum), recovery: Math.round(v2Recovery) },
      comparison,
    });
    previousProgress = goalProgress;
  }

  return {
    athlete,
    weeks: timeline,
    summary: summariseAthleteTimeline(timeline),
  };
}

function baselineDecision({ evidence, event }) {
  const exercises = evidence.exerciseHistory ?? [];
  const below = exercises.reduce((sum, item) => sum + item.belowMinimumEvents, 0);
  const above = exercises.reduce((sum, item) => sum + item.aboveRangeEvents, 0);
  const shutdowns = exercises.reduce((sum, item) => sum + item.shutdowns, 0);
  const pain = evidence.safetyContext?.painSeverity ?? "none";
  if (["severe", "sharp"].includes(pain) && event.type === "injury_pain_event") {
    return { type: "reduce", rationale: "V1 baseline only reduces for pain; it has no movement-specific Safety Gate." };
  }
  if (below > 0 || shutdowns > 0) return { type: "reduce", rationale: "V1 reduces when target range is missed." };
  if (event.type === "systemic_fatigue" && shutdowns >= 2) return { type: "recover", rationale: "V1 uses simple deload handling when shutdowns are obvious." };
  if (above > 0 || exercises.every((item) => item.withinRange)) return { type: "push", rationale: "V1 progresses mainly from target-range success." };
  return { type: "hold", rationale: "V1 holds when evidence is unclear." };
}

function scoreOutcome({ baseProgress, decision, safetyGate, event, engine }) {
  let score = baseProgress;
  const unsafePain = event.type === "injury_pain_event" && !["stop_movement", "stop_session", "reduce", "substitute"].includes(decision);
  const systemic = event.type === "systemic_fatigue" || event.type === "illness";
  const disruption = ["missed_sessions", "holiday", "poor_sleep_stress"].includes(event.type);

  if (decision === "push") score += event.positive ? 4 : -8;
  if (decision === "hold") score += disruption ? 2 : 0;
  if (decision === "consolidate") score += systemic || disruption || event.type === "productive_fatigue" ? 5 : 2;
  if (decision === "reduce") score += event.localProblem || unsafePain ? 4 : -2;
  if (decision === "recover") score += systemic ? 7 : -7;
  if (decision === "stop_movement") score += event.type === "injury_pain_event" ? 6 : -3;
  if (decision === "stop_session") score += event.systemicSafety ? 7 : -6;
  if (decision === "substitute") score += event.localProblem ? 5 : 0;
  if (unsafePain) score -= 18;
  if (safetyGate.status === "restrict" && decision === "push") score -= 16;
  if (engine === "v1" && decision === "push" && event.type === "post_swap_improvement") score -= 5;
  return clamp(score);
}

function classifyWeekComparison({ event, safetyGate, v1Decision, v2Recommendation, goalProgress, v1Outcome, v2Outcome }) {
  const v1UnsafePain = event.type === "injury_pain_event" && !["stop_movement", "stop_session", "reduce", "substitute"].includes(v1Decision.type);
  const v2UnsafePain = event.type === "injury_pain_event" && !["stop_movement", "stop_session", "reduce", "substitute"].includes(v2Recommendation.recommendation_type);
  const v1OverPush = v1Decision.type === "push" && (safetyGate.status !== "clear" || ["low_evidence_early_phase", "systemic_fatigue", "poor_sleep_stress", "post_swap_improvement"].includes(event.type));
  const v2OverPush = v2Recommendation.recommendation_type === "push" && (safetyGate.status !== "clear" || ["low_evidence_early_phase", "systemic_fatigue", "poor_sleep_stress", "post_swap_improvement"].includes(event.type));
  const v1UnnecessaryRecover = v1Decision.type === "recover" && !["systemic_fatigue", "illness"].includes(event.type);
  const v2UnnecessaryRecover = v2Recommendation.recommendation_type === "recover" && !["systemic_fatigue", "illness"].includes(event.type);
  const v2UnderHold = v2Recommendation.recommendation_type === "hold" && goalProgress.trend === "improving" && goalProgress.confidence >= 85 && event.positive;
  const v1UnderHold = v1Decision.type === "hold" && goalProgress.trend === "improving" && goalProgress.confidence >= 85 && event.positive;
  return {
    v1UnsafePain,
    v2UnsafePain,
    v1OverPush,
    v2OverPush,
    v1UnnecessaryRecover,
    v2UnnecessaryRecover,
    v1UnderHold,
    v2UnderHold,
    v2Win: v2Outcome > v1Outcome,
    v1Win: v1Outcome > v2Outcome,
  };
}

function summariseAthleteTimeline(weeks) {
  const v1Scores = weeks.map((week) => week.v1.progress_score);
  const v2Scores = weeks.map((week) => week.v2.progress_score);
  return {
    final_v1_progress: v1Scores.at(-1),
    final_v2_progress: v2Scores.at(-1),
    average_v1_progress: average(v1Scores),
    average_v2_progress: average(v2Scores),
    v1_weeks_improving: weeks.filter((week) => trendForScore(week.v1.progress_score) === "improving").length,
    v2_weeks_improving: weeks.filter((week) => trendForScore(week.v2.progress_score) === "improving").length,
    v1_weeks_stable: weeks.filter((week) => trendForScore(week.v1.progress_score) === "stable").length,
    v2_weeks_stable: weeks.filter((week) => trendForScore(week.v2.progress_score) === "stable").length,
    v1_weeks_declining: weeks.filter((week) => trendForScore(week.v1.progress_score) === "declining").length,
    v2_weeks_declining: weeks.filter((week) => trendForScore(week.v2.progress_score) === "declining").length,
    v1_unnecessary_recovery_weeks: weeks.filter((week) => week.comparison.v1UnnecessaryRecover).length,
    v2_unnecessary_recovery_weeks: weeks.filter((week) => week.comparison.v2UnnecessaryRecover).length,
    v1_missed_unsafe_pain_responses: weeks.filter((week) => week.comparison.v1UnsafePain).length,
    v2_missed_unsafe_pain_responses: weeks.filter((week) => week.comparison.v2UnsafePain).length,
    v1_over_aggressive_pushes: weeks.filter((week) => week.comparison.v1OverPush).length,
    v2_over_aggressive_pushes: weeks.filter((week) => week.comparison.v2OverPush).length,
    v1_under_aggressive_holds: weeks.filter((week) => week.comparison.v1UnderHold).length,
    v2_under_aggressive_holds: weeks.filter((week) => week.comparison.v2UnderHold).length,
    final_v1_momentum: weeks.at(-1).v1.momentum,
    final_v2_momentum: weeks.at(-1).v2.momentum,
    average_v1_recovery: average(weeks.map((week) => week.v1.recovery)),
    average_v2_recovery: average(weeks.map((week) => week.v2.recovery)),
    average_v2_decision_confidence: average(weeks.map((week) => week.v2Recommendation.confidence)),
    weird_decisions: weeks.filter((week) => weirdDecision(week)).map((week) => ({ week: week.week, event: week.event.type, recommendation: week.v2Recommendation.recommendation_type, reason: weirdDecision(week) })),
    safety_events: weeks.filter((week) => week.safetyGate.status === "restrict" || week.safetyGate.status === "stop").length,
  };
}

function aggregateComparison(results) {
  const summaries = results.map((result) => result.summary);
  const byGoal = groupBy(results, (result) => result.athlete.goal);
  const aggregate = {
    total_athletes: results.length,
    total_weeks: results.reduce((sum, result) => sum + result.weeks.length, 0),
    final_v1_progress: average(summaries.map((item) => item.final_v1_progress)),
    final_v2_progress: average(summaries.map((item) => item.final_v2_progress)),
    average_v1_progress: average(summaries.map((item) => item.average_v1_progress)),
    average_v2_progress: average(summaries.map((item) => item.average_v2_progress)),
    v1_over_aggressive_pushes: sum(summaries, "v1_over_aggressive_pushes"),
    v2_over_aggressive_pushes: sum(summaries, "v2_over_aggressive_pushes"),
    v1_unnecessary_recovery_weeks: sum(summaries, "v1_unnecessary_recovery_weeks"),
    v2_unnecessary_recovery_weeks: sum(summaries, "v2_unnecessary_recovery_weeks"),
    v1_missed_unsafe_pain_responses: sum(summaries, "v1_missed_unsafe_pain_responses"),
    v2_missed_unsafe_pain_responses: sum(summaries, "v2_missed_unsafe_pain_responses"),
    v1_under_aggressive_holds: sum(summaries, "v1_under_aggressive_holds"),
    v2_under_aggressive_holds: sum(summaries, "v2_under_aggressive_holds"),
    final_v1_momentum: average(summaries.map((item) => item.final_v1_momentum)),
    final_v2_momentum: average(summaries.map((item) => item.final_v2_momentum)),
    average_v1_recovery: average(summaries.map((item) => item.average_v1_recovery)),
    average_v2_recovery: average(summaries.map((item) => item.average_v2_recovery)),
    average_v2_decision_confidence: average(summaries.map((item) => item.average_v2_decision_confidence)),
    weird_decisions: summaries.flatMap((summary, index) => summary.weird_decisions.map((item) => ({ athlete: results[index].athlete.id, ...item }))),
    safety_events: sum(summaries, "safety_events"),
    by_goal: Object.fromEntries(Object.entries(byGoal).map(([goal, items]) => [goal, aggregateGoal(items)])),
  };
  aggregate.verdict = verdictFor(aggregate);
  return aggregate;
}

function aggregateGoal(items) {
  const summaries = items.map((item) => item.summary);
  return {
    athletes: items.length,
    final_v1_progress: average(summaries.map((item) => item.final_v1_progress)),
    final_v2_progress: average(summaries.map((item) => item.final_v2_progress)),
    average_v1_progress: average(summaries.map((item) => item.average_v1_progress)),
    average_v2_progress: average(summaries.map((item) => item.average_v2_progress)),
    v1_over_aggressive_pushes: sum(summaries, "v1_over_aggressive_pushes"),
    v2_over_aggressive_pushes: sum(summaries, "v2_over_aggressive_pushes"),
    v1_unnecessary_recovery_weeks: sum(summaries, "v1_unnecessary_recovery_weeks"),
    v2_unnecessary_recovery_weeks: sum(summaries, "v2_unnecessary_recovery_weeks"),
    v1_missed_unsafe_pain_responses: sum(summaries, "v1_missed_unsafe_pain_responses"),
    v2_missed_unsafe_pain_responses: sum(summaries, "v2_missed_unsafe_pain_responses"),
    final_v1_momentum: average(summaries.map((item) => item.final_v1_momentum)),
    final_v2_momentum: average(summaries.map((item) => item.final_v2_momentum)),
  };
}

function verdictFor(aggregate) {
  if (aggregate.v2_missed_unsafe_pain_responses > 0) return "not ready";
  if (aggregate.average_v2_progress < aggregate.average_v1_progress) return "not ready";
  if (aggregate.v2_over_aggressive_pushes > aggregate.v1_over_aggressive_pushes) return "not ready";
  if (aggregate.v2_unnecessary_recovery_weeks > aggregate.v1_unnecessary_recovery_weeks) return "inconclusive";
  if (aggregate.final_v2_momentum <= aggregate.final_v1_momentum) return "inconclusive";
  return "promising";
}

function buildVirtualAthletes() {
  const goals = ["strength", "build_muscle", "build_muscle_strength", "get_lean", "athletic_performance"];
  return goals.flatMap((goal, goalIndex) => Array.from({ length: 4 }, (_, index) => {
    const profileIndex = goalIndex * 4 + index + 1;
    const trainingAge = index === 0 ? "beginner" : index === 3 ? "advanced" : "intermediate";
    return {
      id: `vathlete_${profileIndex}_${goal}`,
      label: `Virtual ${goal.replaceAll("_", " ")} athlete ${index + 1}`,
      status: "research_fixture",
      goal,
      trainingAge,
      experienceLevel: trainingAge,
      daysPerWeek: [3, 4, 4, 5][index],
      sessionTimeMinutes: [45, 60, 55, 75][index],
      recoveryProfile: ["robust", "average", "limited", "volatile"][index],
      consistencyProfile: ["steady", "steady", "variable", "variable"][index],
      progressionPotential: [0.78, 0.64, 0.58, 0.50][index],
      disruptionRisk: [1, 2, 3, 3][index],
      safetyRisk: [1, 1, 2, 3][index],
      momentumTendency: [8, 4, -2, -5][index],
      constraints: {
        time: index === 0 ? "moderate" : index === 3 ? "high" : "moderate",
        equipment: "commercial_gym",
        adherence: index >= 2 ? "moderate" : "strong",
        stress: index >= 2 ? "high" : "moderate",
      },
      recoveryContext: {
        sleepQuality: index >= 2 ? "mixed" : "good",
        soreness: index >= 2 ? "moderate" : "low",
        readiness: "moderate",
        fatigueTrend: "stable",
      },
      notes: ["Simulation v0.2 virtual athlete; not production data."],
      approvalStatus: "draft_requires_aaron_approval",
    };
  }));
}

function eventForWeek(athlete, week) {
  if (week === 1) return event("low_evidence_early_phase", { positive: false });
  if (week % 17 === 0 && athlete.disruptionRisk >= 2) return event("illness", { systemic: true });
  if (week % 13 === 0 && athlete.disruptionRisk >= 2) return event("holiday", { disruption: true });
  if (week % 11 === 0 && athlete.safetyRisk >= 2) return event("injury_pain_event", { localProblem: true });
  if (week % 9 === 0 && athlete.recoveryProfile !== "robust") return event("systemic_fatigue", { systemic: true });
  if (week % 8 === 0 && athlete.consistencyProfile === "variable") return event("missed_sessions", { disruption: true });
  if (week % 7 === 0 && athlete.recoveryProfile !== "robust") return event("poor_sleep_stress", { disruption: true });
  if (week % 6 === 0) return event("post_swap_improvement", { positive: true });
  if (week % 5 === 0) return event("local_lift_stall", { localProblem: true });
  if (week % 4 === 0) return event("productive_fatigue", { positive: true });
  if (week % 3 === 0) return event("wave_progress", { positive: true });
  return event("normal_progress", { positive: true });
}

function event(type, flags = {}) {
  return { type, positive: false, systemic: false, disruption: false, localProblem: false, systemicSafety: false, ...flags };
}

function buildEvidence({ athlete, week, event }) {
  const sessionHistory = sessionHistoryFor(athlete, event);
  const exerciseHistory = exerciseHistoryFor(athlete, week, event);
  return {
    id: `${athlete.id}_week_${week}`,
    scenario: `${athlete.label} week ${week}: ${event.type}`,
    athleteProfileId: athlete.id,
    evidenceModelVersion: "v0.7",
    status: "simulation_v0_2_fixture",
    sessionHistory,
    exerciseHistory,
    swapHistory: event.type === "post_swap_improvement" ? { swappedFrom: "barbell_row", swappedTo: "chest_supported_row", reason: "fatigue management", postSwapPerformance: "improved", exposuresSinceSwap: 1, improvementConfirmed: false } : null,
    consolidationHistory: consolidationHistoryFor(week, event),
    frequencyStimulus: frequencyStimulusFor(athlete, event),
    safetyContext: safetyContextFor(event),
    evidenceConfidence: evidenceConfidenceFor(sessionHistory, exerciseHistory, event),
    subjectiveContext: subjectiveContextFor(athlete, event),
    goalProgressEvidence: goalProgressEvidenceFor(athlete, week, event),
    notes: ["Simulation v0.2 synthetic evidence; not production data."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function sessionHistoryFor(athlete, event) {
  const planned = event.type === "low_evidence_early_phase" ? 1 : event.type === "missed_sessions" || event.type === "holiday" || event.type === "illness" ? Math.max(0, athlete.daysPerWeek - 2) : athlete.daysPerWeek;
  return {
    plannedSessionsCompleted: planned,
    plannedSessionsMissed: event.type === "missed_sessions" ? 2 : event.type === "holiday" || event.type === "illness" ? 3 : 0,
    extraSessionsCompleted: event.type === "productive_fatigue" ? 1 : 0,
    sessionSpacing: event.type === "missed_sessions" || event.type === "holiday" || event.type === "illness" ? "extended" : event.type === "poor_sleep_stress" ? "compressed" : "normal",
    completedSets: event.type === "missed_sessions" || event.type === "holiday" ? planned * 2 : planned * 4,
    skippedExercises: event.type === "systemic_fatigue" || event.type === "poor_sleep_stress" ? 1 : 0,
    sessionDurationMinutes: athlete.sessionTimeMinutes,
    sessionCompletionQuality: event.type === "systemic_fatigue" || event.type === "illness" ? "poor" : event.type === "missed_sessions" ? "mixed" : "good",
  };
}

function exerciseHistoryFor(athlete, week, event) {
  if (event.type === "systemic_fatigue" || event.type === "illness") {
    return [
      exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, shutdowns: 1, withinRange: false, repeatedSuccessfulExposuresAtLoad: 1 }),
      exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, shutdowns: 1, withinRange: false, repeatedSuccessfulExposuresAtLoad: 1 }),
    ];
  }
  if (event.type === "injury_pain_event") return [exercise("deadlift", "hinge/pull pattern", { comparableLoadTrend: "stable", withinRange: true, repeatedSuccessfulExposuresAtLoad: 3 })];
  if (event.type === "local_lift_stall") return [exercise("overhead_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false, repeatedSuccessfulExposuresAtLoad: 1 })];
  if (event.type === "low_evidence_early_phase") return [exercise("bench_press", "pressing pattern", { repeatedSuccessfulExposuresAtLoad: 1, aboveRangeEvents: 1 })];
  if (event.type === "post_swap_improvement") return [exercise("chest_supported_row", "hinge/pull pattern", { comparableLoadTrend: "improving", aboveRangeEvents: 2, repeatedSuccessfulExposuresAtLoad: 2 })];
  const successCount = week >= 12 ? 3 : 2;
  return [
    exercise("bench_press", "pressing pattern", { comparableLoadTrend: event.positive ? "improving" : "stable", aboveRangeEvents: event.positive && week >= 12 ? 2 : 0, productiveFatigue: event.type === "productive_fatigue", repeatedSuccessfulExposuresAtLoad: successCount }),
    exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: event.positive ? "improving" : "stable", repeatedSuccessfulExposuresAtLoad: successCount }),
  ];
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: overrides.belowMinimumEvents ? [6] : [10, 10, 10],
    withinRange: true,
    comparableLoadTrend: "stable",
    loadEvents: overrides.productiveFatigue ? ["increase"] : [],
    shutdowns: 0,
    belowMinimumEvents: 0,
    aboveRangeEvents: 0,
    productiveFatigue: false,
    newExercise: false,
    techniqueBreakdown: "none",
    repeatedSuccessfulExposuresAtLoad: 2,
    ...overrides,
  };
}

function consolidationHistoryFor(week, event) {
  return {
    recentPushOccurred: event.type === "productive_fatigue",
    plannedConsolidationDue: event.type === "productive_fatigue" || event.type === "post_swap_improvement",
    consolidationCompleted: week % 4 === 1,
    ownsNewLoad: week >= 16,
    repeatedSuccessfulExposuresAtNewLoad: week >= 16 ? 3 : 1,
  };
}

function frequencyStimulusFor(athlete, event) {
  return {
    trainingDaysAvailable: athlete.daysPerWeek,
    currentFrequency: athlete.daysPerWeek,
    sessionDensity: event.type === "systemic_fatigue" || event.type === "poor_sleep_stress" ? "high" : "moderate",
    compoundDensity: athlete.goal === "strength" ? "high" : "moderate",
    weeklyHardSetEstimate: event.type === "systemic_fatigue" ? 24 : 14,
    axialLoadingDensity: athlete.goal === "strength" ? "high" : "moderate",
    highFatigueMovementClustering: event.type === "systemic_fatigue" ? "high" : "low",
    lowFrequencyHighDensityWarning: athlete.daysPerWeek <= 3 && event.type === "systemic_fatigue",
    highFrequencyFatigue: athlete.daysPerWeek >= 5 && event.type === "systemic_fatigue",
    hiddenOverreachRisk: event.type === "poor_sleep_stress" || event.type === "systemic_fatigue",
  };
}

function safetyContextFor(event) {
  return {
    affectedArea: event.type === "injury_pain_event" ? "hinge/pull pattern" : "none",
    affectedMovementPattern: event.type === "injury_pain_event" ? "deadlift" : "none",
    painTrend: event.type === "injury_pain_event" ? "worsening" : "none",
    painSeverity: event.type === "injury_pain_event" ? "sharp" : "none",
    techniqueBreakdown: false,
    systemicRedFlags: [],
    safetyIssueScope: event.type === "injury_pain_event" ? "movement_specific" : "none",
  };
}

function evidenceConfidenceFor(sessionHistory, exerciseHistory, event) {
  const count = Math.max(0, ...exerciseHistory.map((item) => item.repeatedSuccessfulExposuresAtLoad ?? 0));
  return {
    plannedEvidenceCount: sessionHistory.plannedSessionsCompleted,
    comparableExposureCount: count,
    recency: event.type === "holiday" || event.type === "missed_sessions" ? "stale" : "recent",
    dataCompleteness: event.type === "low_evidence_early_phase" || event.type === "holiday" ? "low" : "high",
    evidenceSourceQuality: "high",
  };
}

function subjectiveContextFor(athlete, event) {
  if (event.type === "injury_pain_event") return { readiness: "mixed", stress: "moderate", sleep: "mixed", motivation: "moderate", soreness: "high", safetyFlag: "sharp_pain", notes: "Simulation v0.2 safety context." };
  if (["poor_sleep_stress", "systemic_fatigue", "illness"].includes(event.type)) return { readiness: "poor", stress: "high", sleep: "poor", motivation: "moderate", soreness: "high", safetyFlag: "none", notes: "Simulation v0.2 context." };
  if (athlete.consistencyProfile === "variable") return { readiness: "mixed", stress: "high", sleep: "mixed", motivation: "moderate", soreness: "moderate", safetyFlag: "none", notes: "Simulation v0.2 context." };
  return undefined;
}

function goalProgressEvidenceFor(athlete, week, event) {
  const strengthTrend = ["systemic_fatigue", "illness"].includes(event.type) ? "declining" : event.type === "local_lift_stall" ? "mixed" : week >= 6 ? "improving" : "stable";
  const qualityTrend = ["missed_sessions", "holiday", "illness", "systemic_fatigue"].includes(event.type) ? "declining" : event.type === "wave_progress" ? "mixed" : "improving";
  const base = {
    strengthMetrics: [
      strengthMetric("competition_squat", strengthTrend, week),
      strengthMetric("competition_bench_press", strengthTrend, week),
      strengthMetric("competition_deadlift", event.type === "injury_pain_event" ? "mixed" : strengthTrend, week),
      strengthMetric("standing_overhead_press", event.type === "local_lift_stall" ? "declining" : "stable", week),
      strengthMetric("bent_over_row", strengthTrend === "declining" ? "stable" : strengthTrend, week),
    ],
    qualityVolume: {
      totalQualityVolumeTrend: qualityTrend,
      qualitySetsByMuscleTrend: qualityTrend,
      targetRangeCompletionRate: ["systemic_fatigue", "illness"].includes(event.type) ? 0.55 : event.type === "missed_sessions" ? 0.35 : 0.84,
      junkVolumeRatio: event.type === "systemic_fatigue" ? 0.2 : 0.04,
      plannedVolumeRatio: ["missed_sessions", "holiday"].includes(event.type) ? 0.35 : 1,
      plannedQualitySetCount: ["missed_sessions", "holiday"].includes(event.type) ? 4 : 16,
      recoveryCost: event.type === "systemic_fatigue" ? "high" : "moderate",
    },
    performancePreservation: {
      strengthTrend: strengthTrend === "declining" ? "declining" : "stable",
      qualityWorkRetainedTrend: qualityTrend === "declining" ? "declining" : "stable",
    },
    athleticMetrics: [
      { metricType: "power", exercise: "jump_squat", trend: event.type === "systemic_fatigue" ? "declining" : week >= 10 ? "improving" : "stable", source: "programmed_performance" },
      { metricType: "dynamic_strength", exercise: "push_press", trend: strengthTrend, source: "programmed_performance" },
    ],
  };
  if (athlete.goal === "get_lean") {
    base.bodyComposition = athlete.disruptionRisk >= 3
      ? { bodyWeightTrendKg: -0.2 * Math.floor(week / 4) }
      : { bodyFatTrendPct: -0.15 * Math.floor(week / 4), bodyWeightTrendKg: -0.2 * Math.floor(week / 4) };
  }
  return base;
}

function strengthMetric(exerciseName, trend, week) {
  return {
    exercise: exerciseName,
    estimatedStrengthTrend: trend,
    ownedLoadTrend: trend === "mixed" ? "stable" : trend,
    comparableLoadPerformance: trend,
    meaningfulRepPrCount: trend === "improving" && week >= 8 ? 1 : 0,
    comparableExposures: Math.min(4, Math.max(1, week - 1)),
    outlierPr: false,
  };
}

function updateMomentum({ previous, outcome, decision, event }) {
  let next = previous + (outcome >= 65 ? 2 : outcome <= 42 ? -4 : 0);
  if (decision === "push" && event.positive) next += 2;
  if (decision === "recover" && event.type !== "systemic_fatigue" && event.type !== "illness") next -= 3;
  if (decision === "stop_movement" && event.type === "injury_pain_event") next += 2;
  if (event.type === "missed_sessions" || event.type === "holiday") next -= 3;
  return clamp(next);
}

function updateRecovery({ previous, decision, event }) {
  let next = previous;
  if (decision === "push") next -= 2;
  if (decision === "recover") next += 10;
  if (decision === "consolidate") next += 6;
  if (decision === "reduce" || decision === "stop_movement") next += 4;
  if (event.type === "systemic_fatigue" || event.type === "poor_sleep_stress" || event.type === "illness") next -= 6;
  if (event.type === "holiday") next += 4;
  return clamp(next);
}

function startingRecoveryFor(athlete) {
  const risk = { robust: 1, average: 2, limited: 3, volatile: 4 }[athlete.recoveryProfile] ?? 2;
  return 76 - risk * 6;
}

function weirdDecision(week) {
  if (week.comparison.v2UnsafePain) return "unsafe pain response";
  if (week.comparison.v2OverPush) return "over-aggressive push";
  if (week.comparison.v2UnnecessaryRecover) return "unnecessary recovery";
  if (week.v2Recommendation.recommendation_type === "recover" && week.goalProgress.confidence < 55) return "recover with low goal-progress confidence";
  return null;
}

function dateForWeek(week) {
  const date = new Date("2026-01-05T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);
  return date;
}

function trendForScore(score) {
  if (score >= 65) return "improving";
  if (score <= 42) return "declining";
  return "stable";
}

function sum(items, key) {
  return items.reduce((total, item) => total + item[key], 0);
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? Math.round(clean.reduce((total, value) => total + value, 0) / clean.length) : 0;
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {});
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
 
