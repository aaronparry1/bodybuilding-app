import { gauntletScenariosV0_4 } from "./scenarios_v0_4.mjs";

export const gauntletScenariosV0_5 = [
  ...gauntletScenariosV0_4.map(migrateScenario),
  ...additionalSummaryShortcutCatchers(),
];

function migrateScenario(scenario) {
  const id = scenario.id.replace(/^v04_/, "v05_");
  const enriched = enrichExplicitEvidence(scenario.evidence, scenario.expected);
  const evidence = stripSummaryShortcuts({
    ...scenario.evidence,
    ...enriched,
    id,
    evidenceModelVersion: "v0.5",
    systemicSignals: removeBroadSystemicShortcuts(enriched.systemicSignals ?? []),
    notes: [
      ...(scenario.evidence.notes ?? []),
      "V0.5 migration: performance, fatigue, and local lift summary shortcuts removed; concrete evidence fields are authoritative.",
    ],
  });
  return { ...scenario, id, evidence };
}

function stripSummaryShortcuts(evidence) {
  const {
    performanceTrend,
    fatigueState,
    recoveryState,
    localLiftSignals,
    ...explicit
  } = evidence;
  return explicit;
}

function enrichExplicitEvidence(evidence, expected) {
  const systemicSignals = evidence.systemicSignals ?? [];
  const wantsPush = expected.recommendation_types.includes("push");
  const wantsConsolidate = expected.recommendation_types.includes("consolidate");
  const wantsReduce = expected.recommendation_types.includes("reduce");
  const wantsRestrict = expected.safety_gate_status === "restrict";
  const wantsCaution = expected.safety_gate_status === "caution";
  const exerciseHistory = (evidence.exerciseHistory ?? []).map((item) => ({ ...item }));
  const frequencyStimulus = { ...(evidence.frequencyStimulus ?? {}) };
  const sessionHistory = { ...(evidence.sessionHistory ?? {}) };
  const consolidationHistory = { ...(evidence.consolidationHistory ?? {}) };
  let subjectiveContext = evidence.subjectiveContext ? { ...evidence.subjectiveContext } : undefined;

  if (wantsPush) {
    for (const item of exerciseHistory) {
      if (item.comparableLoadTrend === "improving") {
        item.aboveRangeEvents = Math.max(item.aboveRangeEvents ?? 0, 2);
        item.repeatedSuccessfulExposuresAtLoad = Math.max(item.repeatedSuccessfulExposuresAtLoad ?? 0, 4);
      }
    }
    consolidationHistory.recentPushOccurred = true;
    consolidationHistory.ownsNewLoad = true;
    consolidationHistory.repeatedSuccessfulExposuresAtNewLoad = Math.max(consolidationHistory.repeatedSuccessfulExposuresAtNewLoad ?? 0, 3);
  }

  if (!wantsPush && !wantsConsolidate) {
    consolidationHistory.recentPushOccurred = false;
    consolidationHistory.plannedConsolidationDue = false;
    consolidationHistory.ownsNewLoad = false;
    consolidationHistory.repeatedSuccessfulExposuresAtNewLoad = 0;
  }

  if (wantsConsolidate && !wantsPush) {
    consolidationHistory.recentPushOccurred = true;
    consolidationHistory.consolidationCompleted = false;
    consolidationHistory.ownsNewLoad = false;
    consolidationHistory.repeatedSuccessfulExposuresAtNewLoad = 0;
  }

  if (wantsReduce && expected.safety_gate_status !== "stop") {
    for (const item of exerciseHistory) {
      if (item.comparableLoadTrend === "declining" || item.withinRange === false) {
        item.withinRange = item.withinRange ?? false;
        if (wantsRestrict) item.belowMinimumEvents = Math.max(item.belowMinimumEvents ?? 0, 2);
      }
    }
  }

  if (systemicSignals.includes("high_soreness")) {
    subjectiveContext ??= subjective();
    subjectiveContext.soreness = "high";
  }
  if (systemicSignals.includes("sleep_disrupted")) {
    subjectiveContext ??= subjective();
    subjectiveContext.sleep = "poor";
  }
  if (systemicSignals.includes("high_stress")) {
    subjectiveContext ??= subjective();
    subjectiveContext.stress = "high";
  }
  if (systemicSignals.includes("time_constraint")) {
    sessionHistory.sessionDurationMinutes = Math.min(sessionHistory.sessionDurationMinutes ?? 30, 30);
    sessionHistory.sessionSpacing = "compressed";
  }
  if (systemicSignals.includes("low_frequency")) {
    frequencyStimulus.trainingDaysAvailable = 3;
    frequencyStimulus.currentFrequency = 3;
  }

  if (wantsCaution && frequencyStimulus.compoundDensity === "high") {
    frequencyStimulus.lowFrequencyHighDensityWarning = true;
  }
  if (wantsConsolidate && systemicSignals.includes("high_soreness") && exerciseHistory.some((item) => item.comparableLoadTrend === "improving")) {
    frequencyStimulus.hiddenOverreachRisk = frequencyStimulus.hiddenOverreachRisk || false;
  }

  return {
    ...evidence,
    sessionHistory,
    exerciseHistory,
    consolidationHistory,
    frequencyStimulus,
    subjectiveContext,
  };
}

function removeBroadSystemicShortcuts(signals) {
  const removed = new Set([
    "multiple_lifts_down",
    "good_readiness",
  ]);
  return signals.filter((signal) => !removed.has(signal));
}

function additionalSummaryShortcutCatchers() {
  return [
    scenario("v05_incomplete_new_athlete_one_excellent_workout", "New athlete, one excellent workout", "beginner_hypertrophy", evidence({
      exerciseHistory: [exercise("leg_press", "squat/lower-body pattern", { aboveRangeEvents: 1, comparableLoadTrend: "improving", repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_incomplete_new_athlete_one_poor_workout", "New athlete, one poor workout", "beginner_hypertrophy", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 1, sessionCompletionQuality: "poor", completedSets: 3 }),
      exerciseHistory: [exercise("bench_press", "pressing pattern", { withinRange: false, belowMinimumEvents: 1, comparableLoadTrend: "declining" })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["reduce", "hold"], ["push", "recover", "stop_session"], ["low"], "caution", 35)),
    scenario("v05_missing_comparable_load_trend", "Missing comparable-load trend", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("lat_pulldown", "hinge/pull pattern", { comparableLoadTrend: "mixed", aboveRangeEvents: 1, repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ comparableExposureCount: 0, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_missing_safety_context", "Missing safety context", "intermediate_strength_hypertrophy", evidence({
      safetyContext: undefined,
      exerciseHistory: [exercise("machine_chest_press", "pressing pattern", { withinRange: true })],
      evidenceConfidence: confidence({ dataCompleteness: "moderate", evidenceSourceQuality: "moderate" }),
    }), expect(["hold"], ["recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_incomplete_session_history", "Incomplete session history", "busy_parent_time_constrained", evidence({
      sessionHistory: sessions({ plannedSessionsCompleted: 0, completedSets: 0, sessionCompletionQuality: "mixed" }),
      exerciseHistory: [exercise("full_body", "full-body pattern", { withinRange: true })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 0, comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_incomplete_exercise_history", "Incomplete exercise history", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("unknown_press", "pressing pattern", { newExercise: true, comparableLoadTrend: "mixed", repeatedSuccessfulExposuresAtLoad: 0 })],
      evidenceConfidence: confidence({ comparableExposureCount: 0, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_subjective_great_missing_objective", "Strong subjective readiness but missing objective evidence", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("row", "hinge/pull pattern", { comparableLoadTrend: "mixed", repeatedSuccessfulExposuresAtLoad: 0 })],
      subjectiveContext: subjective({ readiness: "great", stress: "low", sleep: "good", motivation: "high" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 0, comparableExposureCount: 0, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_subjective_poor_missing_objective", "Poor subjective readiness but missing objective evidence", "recovery_limited_lifter", evidence({
      exerciseHistory: [exercise("row", "hinge/pull pattern", { comparableLoadTrend: "mixed", repeatedSuccessfulExposuresAtLoad: 0 })],
      subjectiveContext: subjective({ readiness: "poor", stress: "high", sleep: "poor", motivation: "low" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 0, comparableExposureCount: 0, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear", 35)),
    scenario("v05_severe_pain_low_confidence_veto", "Severe pain flag with low evidence confidence", "advanced_powerlifting", evidence({
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { withinRange: true })],
      safetyContext: safety({ affectedArea: "squat/lower-body pattern", affectedMovementPattern: "squat", painSeverity: "severe", painTrend: "stable", safetyIssueScope: "movement_specific" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
      subjectiveContext: subjective({ safetyFlag: "severe_pain" }),
    }), expect(["stop_movement"], ["push", "recover"], ["very_low"], "stop", 45)),
    scenario("v05_worsening_pain_incomplete_history", "Worsening pain with incomplete training history", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("deadlift", "hinge/pull pattern", { withinRange: true, comparableLoadTrend: "mixed" })],
      safetyContext: safety({ affectedArea: "hinge/pull pattern", affectedMovementPattern: "deadlift", painSeverity: "moderate", painTrend: "worsening", safetyIssueScope: "movement_specific" }),
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low" }),
      subjectiveContext: subjective({ safetyFlag: "worsening_pain" }),
    }), expect(["stop_movement"], ["push", "recover"], ["very_low"], "stop", 45)),
    scenario("v05_raw_exposures_infer_improving", "Performance trend inferred from raw exposures", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("bench_press", "pressing pattern", { comparableLoadTrend: "improving", aboveRangeEvents: 2, repeatedSuccessfulExposuresAtLoad: 4 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 5, comparableExposureCount: 5, dataCompleteness: "high" }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 55)),
    scenario("v05_shutdown_spacing_infer_fatigue", "Fatigue inferred from shutdowns and compressed spacing", "advanced_powerlifting", evidence({
      sessionHistory: sessions({ sessionSpacing: "compressed", sessionCompletionQuality: "mixed" }),
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { shutdowns: 1, comparableLoadTrend: "declining" }), exercise("deadlift", "hinge/pull pattern", { shutdowns: 1, comparableLoadTrend: "declining" })],
      frequencyStimulus: stimulus({ highFrequencyFatigue: true, highFatigueMovementClustering: "high" }),
      evidenceConfidence: confidence({ dataCompleteness: "high" }),
    }), expect(["reduce", "consolidate"], ["push", "stop_session"], ["low"], "restrict", 50)),
    scenario("v05_local_issue_from_movement_history", "Local lift issue inferred from movement pattern history", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("overhead_press", "pressing pattern", { belowMinimumEvents: 1, comparableLoadTrend: "declining" })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 4, comparableExposureCount: 3, dataCompleteness: "high" }),
    }), expect(["reduce"], ["push", "recover", "stop_session"], ["low"], "caution", 45)),
    scenario("v05_high_confidence_repeated_success_push", "High confidence repeated success permits push", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("hack_squat", "squat/lower-body pattern", { comparableLoadTrend: "improving", aboveRangeEvents: 3, repeatedSuccessfulExposuresAtLoad: 5 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 6, comparableExposureCount: 6, dataCompleteness: "high" }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear", 60)),
    scenario("v05_low_confidence_repeated_looking_success_hold", "Low confidence repeated-looking success stays hold", "intermediate_strength_hypertrophy", evidence({
      exerciseHistory: [exercise("leg_extension", "squat/lower-body pattern", { comparableLoadTrend: "improving", aboveRangeEvents: 2, repeatedSuccessfulExposuresAtLoad: 3 })],
      evidenceConfidence: confidence({ plannedEvidenceCount: 1, comparableExposureCount: 1, dataCompleteness: "low", evidenceSourceQuality: "low" }),
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
    evidenceModelVersion: "v0.5",
    status: "research_fixture",
    evidenceQuality: overrides.evidenceQuality ?? "high",
    trainingContinuity: overrides.trainingContinuity ?? "consistent",
    systemicSignals: overrides.systemicSignals ?? [],
    sessionHistory: overrides.sessionHistory ?? sessions(),
    exerciseHistory: overrides.exerciseHistory ?? [exercise("bench_press", "pressing pattern", { withinRange: true })],
    swapHistory: overrides.swapHistory ?? null,
    consolidationHistory: overrides.consolidationHistory ?? consolidation(),
    frequencyStimulus: overrides.frequencyStimulus ?? stimulus(),
    ...(overrides.safetyContext !== undefined ? { safetyContext: overrides.safetyContext } : { safetyContext: safety() }),
    evidenceConfidence: overrides.evidenceConfidence ?? confidence(),
    subjectiveContext: overrides.subjectiveContext,
    notes: ["V0.5 summary-shortcut catcher scenario."],
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
    notes: "V0.5 subjective context.",
  };
}

function expect(allowedTypes, forbiddenTypes, allowedAggressiveness, safetyStatus, confidenceMin = 45) {
  return {
    recommendation_types: allowedTypes,
    forbidden_recommendation_types: forbiddenTypes,
    aggressiveness: allowedAggressiveness,
    safety_gate_status: safetyStatus,
    confidence_min: confidenceMin,
    rationale: "Expected output should infer coaching context from explicit evidence and use the smallest effective intervention.",
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
