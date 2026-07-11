import { gauntletScenariosV0_6 } from "./scenarios_v0_6.mjs";

export const gauntletScenariosV0_7 = [
  ...gauntletScenariosV0_6.map(migrateScenario),
  ...additionalDerivedQualityCatchers(),
];

function migrateScenario(scenario) {
  const id = scenario.id.replace(/^v06_/, "v07_");
  const evidence = stripQualityShortcut({
    ...scenario.evidence,
    id,
    evidenceModelVersion: "v0.7",
    notes: ["V0.7 migration: evidence quality is fully derived from explicit data and no longer supplied as a scenario field."],
  });
  return { ...scenario, id, evidence };
}

function stripQualityShortcut(evidence) {
  const {
    evidenceQuality,
    ...explicit
  } = evidence;
  return explicit;
}

function additionalDerivedQualityCatchers() {
  return [
    scenario("v07_high_quality_many_planned_sessions", "High-quality evidence from many planned sessions", "intermediate_strength_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 8, completedSets: 24 }),
      exerciseHistory: [exercise("bench_press", "pressing pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4 })],
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 60)),
    scenario("v07_low_quality_one_session", "Low-quality evidence from one session", "beginner_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, completedSets: 3 }),
      exerciseHistory: [exercise("bench_press", "pressing pattern", { aboveRangeEvents: 1, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low", evidenceSourceQuality: "moderate" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v07_extra_session_noise_low_planned", "High extra-session noise but low planned evidence", "busy_parent_time_constrained", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, extraSessionsCompleted: 7, completedSets: 18, sessionSpacing: "irregular" }),
      exerciseHistory: [exercise("lat_pulldown", "hinge/pull pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 4, dataCompleteness: "moderate" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v07_warmup_only_low_quality", "Warm-up-only data should not create high evidence quality", "beginner_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 3, completedSets: 0, sessionCompletionQuality: "mixed" }),
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { withinRange: true, repeatedSuccessfulExposuresAtLoad: 0, repsOrSeconds: [] })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 3, comparableExposureCount: 0, dataCompleteness: "low", evidenceSourceQuality: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v07_pattern_improves_same_exercise_missing", "Same movement pattern improves but same exercise lacks exposures", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [
        exercise("machine_chest_press", "pressing pattern", { aboveRangeEvents: 2, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 2 }),
        exercise("barbell_bench_press", "pressing pattern", { withinRange: true, comparableLoadTrend: "stable", repeatedSuccessfulExposuresAtLoad: 1 }),
      ],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 4 }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v07_same_exercise_three_successes_push", "Same exercise three successful exposures permits push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("barbell_bench_press", "pressing pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 3 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 3 }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 55)),
    scenario("v07_same_exercise_two_successes_hold", "Same exercise two successful exposures withholds push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("barbell_bench_press", "pressing pattern", { aboveRangeEvents: 2, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 2 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 2 }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v07_new_exercise_blocks_push", "New exercise uncertainty blocks push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("hack_squat", "squat/lower-body pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4, newExercise: true })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 4 }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v07_post_swap_one_exposure_blocks_push", "Post-swap one exposure blocks push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("machine_row", "hinge/pull pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4 })],
      swapHistory: swap({ exposuresSinceSwap: 1, improvementConfirmed: false }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 4 }),
    }), expect(["consolidate"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v07_post_swap_three_successes_permit_push", "Post-swap three successful exposures permits push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("machine_row", "hinge/pull pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 3 })],
      swapHistory: swap({ exposuresSinceSwap: 3, improvementConfirmed: true }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 3 }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 55)),
    scenario("v07_systemic_fatigue_enough_evidence_recovers", "Systemic fatigue with enough evidence permits recover", "advanced_powerlifting", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 6, completedSets: 16, sessionCompletionQuality: "poor" }),
      exerciseHistory: [
        exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, shutdowns: 1, withinRange: false }),
        exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, shutdowns: 1, withinRange: false }),
      ],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 4 }),
    }), expect(["recover"], ["push", "stop_session"], ["very_low"], "restrict", 55)),
    scenario("v07_systemic_looking_low_evidence_consolidates", "Systemic-looking fatigue with low evidence consolidates", "recovery_limited_lifter", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, completedSets: 5, sessionCompletionQuality: "poor" }),
      exerciseHistory: [
        exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false }),
        exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false }),
      ],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["reduce", "hold", "consolidate"], ["push", "recover", "stop_session"], ["low"], "restrict", 35)),
    scenario("v07_local_decline_only_reduces", "Local decline only reduces or substitutes", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("overhead_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, withinRange: false })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 4 }),
    }), expect(["reduce"], ["push", "recover", "stop_session"], ["low"], "restrict", 45)),
    scenario("v07_multiple_movement_declines_recover", "Multiple movement declines permit recover", "advanced_powerlifting", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 5, completedSets: 14, sessionCompletionQuality: "poor" }),
      exerciseHistory: [
        exercise("deadlift", "hinge/pull pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, shutdowns: 1, withinRange: false }),
        exercise("front_squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, withinRange: false }),
      ],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 4 }),
    }), expect(["recover"], ["push", "stop_session"], ["very_low"], "restrict", 55)),
    scenario("v07_poor_response_after_rest_recovers", "Poor response after rest permits recover", "recovery_limited_lifter", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 4, completedSets: 10, sessionSpacing: "extended", sessionCompletionQuality: "poor" }),
      exerciseHistory: [
        exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", shutdowns: 1, belowMinimumEvents: 1, withinRange: false }),
        exercise("leg_press", "squat/lower-body pattern", { comparableLoadTrend: "declining", shutdowns: 1, belowMinimumEvents: 1, withinRange: false }),
      ],
      evidenceConfidence: confidence({ plannedEvidenceCount: 4, comparableExposureCount: 4 }),
    }), expect(["recover"], ["push", "stop_session"], ["very_low"], "restrict", 55)),
    scenario("v07_low_confidence_safety_caution_wording", "Low-confidence safety caution wording", "beginner_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, completedSets: 2 }),
      exerciseHistory: [exercise("bench_press", "pressing pattern", { belowMinimumEvents: 1, withinRange: false })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low", evidenceSourceQuality: "low" }),
    }), expect(["reduce", "hold"], ["push", "recover", "stop_session"], ["low"], "caution", 30)),
    scenario("v07_high_confidence_safety_caution_wording", "High-confidence safety caution wording", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("bench_press", "pressing pattern", { belowMinimumEvents: 1, comparableLoadTrend: "declining", withinRange: false })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 4 }),
    }), expect(["reduce"], ["push", "recover", "stop_session"], ["low"], "caution", 45)),
    scenario("v07_severe_pain_low_evidence_veto", "Severe pain veto with low evidence", "advanced_powerlifting", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, completedSets: 3 }),
      exerciseHistory: [exercise("deadlift", "hinge/pull pattern", { withinRange: true })],
      safetyContext: safety({ affectedArea: "hinge/pull pattern", affectedMovementPattern: "deadlift", painSeverity: "sharp", painTrend: "stable", safetyIssueScope: "movement_specific" }),
      subjectiveContext: subjective({ safetyFlag: "sharp_pain" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["stop_movement"], ["push", "recover"], ["very_low"], "stop", 45)),
    scenario("v07_severe_pain_high_evidence_veto", "Severe pain veto with high evidence", "advanced_powerlifting", evidence({
      exerciseHistory: [exercise("deadlift", "hinge/pull pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4 })],
      safetyContext: safety({ affectedArea: "hinge/pull pattern", affectedMovementPattern: "deadlift", painSeverity: "severe", painTrend: "worsening", safetyIssueScope: "movement_specific" }),
      subjectiveContext: subjective({ safetyFlag: "worsening_pain" }),
    }), expect(["stop_movement"], ["push", "recover"], ["very_low"], "stop", 60)),
    scenario("v07_recovery_request_without_objective_evidence_holds", "Recovery request without objective evidence does not recover", "recovery_limited_lifter", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 4, completedSets: 12, sessionCompletionQuality: "good" }),
      exerciseHistory: [exercise("leg_press", "squat/lower-body pattern", { withinRange: true, comparableLoadTrend: "stable", repeatedSuccessfulExposuresAtLoad: 2 })],
      subjectiveContext: subjective({ readiness: "poor", stress: "high", sleep: "poor" }),
    }), expect(["hold", "consolidate"], ["push", "recover", "stop_session"], ["low"], "clear", 40)),
  ];
}

function scenario(id, title, athleteProfileId, evidence, expected) {
  return {
    id,
    level: 4,
    level_label: "Level 4 - Expert Coaching",
    title,
    athleteProfileId,
    evidence: { ...evidence, id, scenario: title, athleteProfileId },
    expected,
    rationale: expected.rationale,
    confidence: expected.confidence_min,
    charter_alignment: expected.charter_alignment,
  };
}

function evidence(overrides = {}) {
  return {
    evidenceModelVersion: "v0.7",
    status: "research_fixture",
    sessionHistory: overrides.sessionHistory ?? sessions(),
    exerciseHistory: overrides.exerciseHistory ?? [exercise("bench_press", "pressing pattern", { withinRange: true })],
    swapHistory: overrides.swapHistory ?? null,
    consolidationHistory: overrides.consolidationHistory ?? consolidation(),
    frequencyStimulus: overrides.frequencyStimulus ?? stimulus(),
    ...(overrides.safetyContext !== undefined ? { safetyContext: overrides.safetyContext } : { safetyContext: safety() }),
    evidenceConfidence: overrides.evidenceConfidence ?? confidence(),
    subjectiveContext: overrides.subjectiveContext,
    notes: ["V0.7 derived-quality catcher scenario."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: overrides.aboveRangeEvents ? [13, 13, 13] : overrides.belowMinimumEvents ? [6] : [10, 10, 10],
    withinRange: overrides.withinRange ?? true,
    comparableLoadTrend: overrides.comparableLoadTrend ?? "stable",
    loadEvents: [],
    shutdowns: 0,
    belowMinimumEvents: 0,
    aboveRangeEvents: 0,
    productiveFatigue: false,
    newExercise: false,
    techniqueBreakdown: "none",
    repeatedSuccessfulExposuresAtLoad: 1,
    ...overrides,
  };
}

function sessions(overrides = {}) {
  return {
    plannedSessionsCompleted: 4,
    plannedSessionsMissed: 0,
    extraSessionsCompleted: 0,
    sessionSpacing: "normal",
    completedSets: 12,
    skippedExercises: 0,
    sessionDurationMinutes: 60,
    sessionCompletionQuality: "good",
    ...overrides,
  };
}

function consolidation(overrides = {}) {
  return {
    recentPushOccurred: false,
    plannedConsolidationDue: false,
    consolidationCompleted: false,
    ownsNewLoad: false,
    repeatedSuccessfulExposuresAtNewLoad: 0,
    ...overrides,
  };
}

function stimulus(overrides = {}) {
  return {
    trainingDaysAvailable: 4,
    currentFrequency: 4,
    sessionDensity: "moderate",
    compoundDensity: "moderate",
    weeklyHardSetEstimate: 14,
    axialLoadingDensity: "moderate",
    highFatigueMovementClustering: "low",
    lowFrequencyHighDensityWarning: false,
    highFrequencyFatigue: false,
    hiddenOverreachRisk: false,
    ...overrides,
  };
}

function safety(overrides = {}) {
  return {
    affectedArea: "none",
    affectedMovementPattern: "none",
    painTrend: "none",
    painSeverity: "none",
    techniqueBreakdown: false,
    systemicRedFlags: [],
    safetyIssueScope: "none",
    ...overrides,
  };
}

function confidence(overrides = {}) {
  return {
    plannedEvidenceCount: 4,
    comparableExposureCount: 4,
    recency: "recent",
    dataCompleteness: "high",
    evidenceSourceQuality: "high",
    ...overrides,
  };
}

function swap(overrides = {}) {
  return {
    swappedFrom: "previous movement",
    swappedTo: "current movement",
    reason: "performance or comfort",
    postSwapPerformance: "improved",
    exposuresSinceSwap: 1,
    improvementConfirmed: false,
    ...overrides,
  };
}

function subjective(values = {}) {
  return {
    readiness: values.readiness ?? "mixed",
    stress: values.stress ?? "moderate",
    sleep: values.sleep ?? "mixed",
    motivation: values.motivation ?? "moderate",
    soreness: values.soreness ?? "moderate",
    safetyFlag: values.safetyFlag ?? "none",
    notes: "V0.7 subjective context.",
  };
}

function expect(allowedTypes, forbiddenTypes, allowedAggressiveness, safetyStatus, confidenceMin = 45) {
  return {
    recommendation_types: allowedTypes,
    forbidden_recommendation_types: forbiddenTypes,
    aggressiveness: allowedAggressiveness,
    safety_gate_status: safetyStatus,
    confidence_min: confidenceMin,
    rationale: "Expected output should derive evidence quality and use the smallest effective intervention.",
    charter_alignment: {
      long_term_progress: true,
      adaptation: true,
      recovery: true,
      confidence: true,
      enjoyment: true,
      momentum: true,
    },
  };
}
