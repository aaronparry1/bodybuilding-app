import { gauntletScenariosV0_5 } from "./scenarios_v0_5.mjs";

export const gauntletScenariosV0_6 = [
  ...gauntletScenariosV0_5.map(migrateScenario),
  ...additionalDerivedStateCatchers(),
];

function migrateScenario(scenario) {
  const id = scenario.id.replace(/^v05_/, "v06_");
  const evidence = stripDerivedShortcuts({
    ...scenario.evidence,
    id,
    evidenceModelVersion: "v0.6",
    notes: [
      ...(scenario.evidence.notes ?? []),
      "V0.6 migration: systemic signals and training continuity removed; continuity and systemic state are inferred from explicit evidence.",
    ],
  });
  return { ...scenario, id, evidence };
}

function stripDerivedShortcuts(evidence) {
  const {
    systemicSignals,
    trainingContinuity,
    ...explicit
  } = evidence;
  return explicit;
}

function additionalDerivedStateCatchers() {
  return [
    scenario("v06_systemic_fatigue_from_multiple_declines", "Systemic fatigue inferred from multiple movement declines", "advanced_powerlifting", evidence({
      sessionHistory: sessions({ sessionCompletionQuality: "poor", completedSets: 8 }),
      exerciseHistory: [
        exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 2, withinRange: false }),
        exercise("bench_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false }),
      ],
    }), expect(["recover", "consolidate"], ["push", "stop_session"], ["very_low", "low"], "restrict", 50)),
    scenario("v06_local_fatigue_not_systemic", "Local fatigue only, no systemic recovery", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("overhead_press", "pressing pattern", { comparableLoadTrend: "declining", belowMinimumEvents: 1, withinRange: false })],
      evidenceConfidence: confidence({ comparableExposureCount: 3 }),
    }), expect(["reduce"], ["push", "recover", "stop_session"], ["low"], "caution", 45)),
    scenario("v06_missed_week_from_session_history", "Missed week inferred from session history", "busy_parent_time_constrained", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 0, plannedSessionsMissed: 4, sessionSpacing: "extended", completedSets: 0, sessionCompletionQuality: "mixed" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 0, comparableExposureCount: 0, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v06_inconsistent_attendance_from_spacing", "Inconsistent attendance inferred from session spacing", "busy_parent_time_constrained", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 2, plannedSessionsMissed: 1, sessionSpacing: "irregular", completedSets: 6 }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 2, comparableExposureCount: 2, dataCompleteness: "moderate" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v06_good_continuity_from_completed_sessions", "Good continuity inferred from completed planned sessions", "intermediate_strength_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 5, plannedSessionsMissed: 0, sessionSpacing: "normal", completedSets: 15 }),
      exerciseHistory: [exercise("leg_press", "squat/lower-body pattern", { withinRange: true, comparableLoadTrend: "stable", repeatedSuccessfulExposuresAtLoad: 3 })],
    }), expect(["hold"], ["recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v06_poor_continuity_strong_return", "Poor continuity but strong return performance", "intermediate_strength_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, plannedSessionsMissed: 3, sessionSpacing: "extended", completedSets: 3, sessionCompletionQuality: "good" }),
      exerciseHistory: [exercise("bench_press", "pressing pattern", { aboveRangeEvents: 1, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v06_high_evidence_push_allowed", "High evidence push allowed", "intermediate_strength_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 6, plannedSessionsMissed: 0, completedSets: 18 }),
      exerciseHistory: [exercise("hack_squat", "squat/lower-body pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 5 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 6 }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 60)),
    scenario("v06_moderate_evidence_push_withheld", "Moderate evidence push withheld", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("hack_squat", "squat/lower-body pattern", { aboveRangeEvents: 2, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 2 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 3, comparableExposureCount: 2, dataCompleteness: "moderate", evidenceSourceQuality: "moderate" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 40)),
    scenario("v06_three_successful_exposures_allow_push", "Three comparable successful exposures allow push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("lat_pulldown", "hinge/pull pattern", { aboveRangeEvents: 2, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 3 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 3 }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 55)),
    scenario("v06_two_successful_exposures_do_not_push", "Two successful exposures do not allow push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("lat_pulldown", "hinge/pull pattern", { aboveRangeEvents: 2, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 2 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 2 }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v06_new_exercise_uncertainty_prevents_push", "New exercise uncertainty prevents push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("machine_row", "hinge/pull pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4, newExercise: true })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 5 }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v06_recent_swap_uncertainty_prevents_push", "Recent swap uncertainty prevents push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("machine_chest_press", "pressing pattern", { aboveRangeEvents: 3, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 4 })],
      swapHistory: { swappedFrom: "barbell_bench_press", swappedTo: "machine_chest_press", reason: "comfort", postSwapPerformance: "improved", exposuresSinceSwap: 1, improvementConfirmed: false },
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 5 }),
    }), expect(["consolidate"], ["push", "recover", "stop_session"], ["low"], "clear", 45)),
    scenario("v06_pain_veto_low_confidence", "Safety pain veto with low evidence confidence", "advanced_powerlifting", evidence({
      exerciseHistory: [exercise("deadlift", "hinge/pull pattern", { withinRange: true })],
      safetyContext: safety({ affectedArea: "hinge/pull pattern", affectedMovementPattern: "deadlift", painSeverity: "sharp", painTrend: "stable", safetyIssueScope: "movement_specific" }),
      subjectiveContext: subjective({ safetyFlag: "sharp_pain" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low", evidenceSourceQuality: "low" }),
    }), expect(["stop_movement"], ["push", "recover"], ["very_low"], "stop", 45)),
    scenario("v06_low_confidence_caution_wording", "Low-confidence caution wording", "beginner_hypertrophy", evidence({
      exerciseHistory: [exercise("bench_press", "pressing pattern", { belowMinimumEvents: 1, comparableLoadTrend: "mixed", withinRange: false })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["reduce", "hold"], ["push", "recover", "stop_session"], ["low"], "caution", 35)),
    scenario("v06_strong_recovery_incomplete_evidence_holds", "Strong recovery but incomplete evidence still holds", "intermediate_strength_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, plannedSessionsMissed: 0, completedSets: 3, sessionCompletionQuality: "good" }),
      exerciseHistory: [exercise("leg_extension", "squat/lower-body pattern", { aboveRangeEvents: 1, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
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
    evidenceModelVersion: "v0.6",
    status: "research_fixture",
    evidenceQuality: overrides.evidenceQuality ?? "high",
    sessionHistory: overrides.sessionHistory ?? sessions(),
    exerciseHistory: overrides.exerciseHistory ?? [exercise("bench_press", "pressing pattern", { withinRange: true })],
    swapHistory: overrides.swapHistory ?? null,
    consolidationHistory: overrides.consolidationHistory ?? consolidation(),
    frequencyStimulus: overrides.frequencyStimulus ?? stimulus(),
    ...(overrides.safetyContext !== undefined ? { safetyContext: overrides.safetyContext } : { safetyContext: safety() }),
    evidenceConfidence: overrides.evidenceConfidence ?? confidence(),
    subjectiveContext: overrides.subjectiveContext,
    notes: ["V0.6 derived-state-shortcut catcher scenario."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: overrides.aboveRangeEvents ? [13] : overrides.belowMinimumEvents ? [6] : [10],
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

function subjective(values = {}) {
  return {
    readiness: values.readiness ?? "mixed",
    stress: values.stress ?? "moderate",
    sleep: values.sleep ?? "mixed",
    motivation: values.motivation ?? "moderate",
    soreness: values.soreness ?? "moderate",
    safetyFlag: values.safetyFlag ?? "none",
    notes: "V0.6 subjective context.",
  };
}

function expect(allowedTypes, forbiddenTypes, allowedAggressiveness, safetyStatus, confidenceMin = 45) {
  return {
    recommendation_types: allowedTypes,
    forbidden_recommendation_types: forbiddenTypes,
    aggressiveness: allowedAggressiveness,
    safety_gate_status: safetyStatus,
    confidence_min: confidenceMin,
    rationale: "Expected output should infer derived state from explicit evidence and use the smallest effective intervention.",
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
