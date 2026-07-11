import { gauntletScenariosV0_3 } from "./scenarios_v0_3.mjs";

const MAGIC_LABELS = new Set([
  "planned_consolidation",
  "post_swap_improvement",
  "high_frequency",
  "compound_density_high",
  "hidden_overreach",
]);

export const gauntletScenariosV0_4 = [
  ...gauntletScenariosV0_3.map(migrateScenario),
  ...additionalLeakCatchers(),
];

function migrateScenario(scenario) {
  const id = scenario.id.replace(/^v03_/, "v04_");
  const evidence = {
    ...scenario.evidence,
    id,
    evidenceModelVersion: "v0.4",
    ...legacyPushStateOverride(id),
    systemicSignals: (scenario.evidence.systemicSignals ?? []).filter((signal) => !MAGIC_LABELS.has(signal)),
    evidenceConfidence: upgradeConfidence(scenario.evidence),
    notes: [
      ...(scenario.evidence.notes ?? []),
      "V0.4 migration: magic labels removed from systemicSignals; explicit evidence fields are authoritative.",
    ],
  };
  return { ...scenario, id, evidence };
}

function legacyPushStateOverride(id) {
  if (!["v04_l1_clear_repeated_success", "v04_l4_long_run_of_success"].includes(id)) return {};
  return {
    performanceTrend: "improving",
    fatigueState: "low",
    recoveryState: "good",
    trainingContinuity: "consistent",
    evidenceQuality: "high",
    localLiftSignals: [
      { lift: "bench_press", signal: "above_range", severity: "low" },
      { lift: "squat", signal: "above_range", severity: "low" },
      { lift: "row", signal: "inside_range", severity: "low" },
    ],
  };
}

function upgradeConfidence(evidence) {
  const current = evidence.evidenceConfidence;
  const highConfidence = evidence.evidenceQuality === "high" && evidence.trainingContinuity === "consistent";
  return {
    ...current,
    plannedEvidenceCount: highConfidence ? Math.max(current.plannedEvidenceCount, 4) : current.plannedEvidenceCount,
    comparableExposureCount: highConfidence ? Math.max(current.comparableExposureCount, 4) : current.comparableExposureCount,
    recency: evidence.trainingContinuity === "missed_week" ? "stale" : current.recency,
    dataCompleteness: current.dataCompleteness,
    evidenceSourceQuality: current.evidenceSourceQuality,
  };
}

function additionalLeakCatchers() {
  return [
    scenario(4, "v04_label_leak_single_good_exposure_hold", "Single good exposure should not push", "intermediate_strength_hypertrophy", baseEvidence({
      performanceTrend: "improving",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("bench_press", "pressing pattern", { aboveRangeEvents: 1, repeatedSuccessfulExposuresAtLoad: 1 })],
      evidenceConfidence: confidence({ comparableExposureCount: 1, dataCompleteness: "low" }),
    }), expect(["hold"], ["push", "recover", "stop_session"], ["low"], "clear")),
    scenario(4, "v04_label_leak_repeated_good_exposures_push", "Repeated good exposures can push", "intermediate_strength_hypertrophy", baseEvidence({
      performanceTrend: "improving",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("bench_press", "pressing pattern", { aboveRangeEvents: 3, repeatedSuccessfulExposuresAtLoad: 4 })],
      evidenceConfidence: confidence({ comparableExposureCount: 5, dataCompleteness: "high" }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear")),
    scenario(4, "v04_label_leak_one_post_swap_consolidate", "One post-swap improvement should consolidate", "intermediate_strength_hypertrophy", baseEvidence({
      performanceTrend: "improving",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "moderate",
      exerciseHistory: [exercise("machine_chest_press", "pressing pattern", { withinRange: true })],
      swapHistory: { swappedFrom: "barbell_bench_press", swappedTo: "machine_chest_press", reason: "comfort", postSwapPerformance: "improved", exposuresSinceSwap: 1, improvementConfirmed: false },
      evidenceConfidence: confidence({ comparableExposureCount: 1, dataCompleteness: "moderate" }),
    }), expect(["consolidate"], ["push", "recover", "stop_session"], ["low"], "clear")),
    scenario(4, "v04_label_leak_repeated_post_swap_push", "Repeated post-swap success can push", "intermediate_strength_hypertrophy", baseEvidence({
      performanceTrend: "improving",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("machine_chest_press", "pressing pattern", { aboveRangeEvents: 2, repeatedSuccessfulExposuresAtLoad: 4 })],
      swapHistory: { swappedFrom: "barbell_bench_press", swappedTo: "machine_chest_press", reason: "comfort", postSwapPerformance: "improved", exposuresSinceSwap: 4, improvementConfirmed: true },
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["push"], ["recover", "stop_session"], ["moderate"], "clear")),
    scenario(4, "v04_label_leak_high_frequency_good_recovery_continue", "High frequency with good recovery can continue", "advanced_powerlifting", baseEvidence({
      performanceTrend: "stable",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { withinRange: true })],
      frequencyStimulus: stimulus({ currentFrequency: 6, highFrequencyFatigue: false, compoundDensity: "moderate" }),
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["hold", "push"], ["recover", "stop_session"], ["low", "moderate"], "clear")),
    scenario(4, "v04_label_leak_high_frequency_declining_recovery", "High frequency with declining recovery should consolidate or reduce", "advanced_powerlifting", baseEvidence({
      performanceTrend: "mixed",
      fatigueState: "high",
      recoveryState: "mixed",
      evidenceQuality: "high",
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining" }), exercise("deadlift", "hinge/pull pattern", { comparableLoadTrend: "declining" })],
      frequencyStimulus: stimulus({ currentFrequency: 6, highFrequencyFatigue: true, highFatigueMovementClustering: "high" }),
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["reduce", "consolidate"], ["push", "recover", "stop_session"], ["low"], "caution")),
    scenario(4, "v04_label_leak_low_frequency_compound_dense_reduce", "Low-frequency compound-dense plan should reduce density", "busy_parent_time_constrained", baseEvidence({
      performanceTrend: "mixed",
      fatigueState: "high",
      recoveryState: "mixed",
      evidenceQuality: "high",
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { comparableLoadTrend: "declining" }), exercise("deadlift", "hinge/pull pattern", { comparableLoadTrend: "declining" })],
      frequencyStimulus: stimulus({ trainingDaysAvailable: 3, currentFrequency: 3, compoundDensity: "high", lowFrequencyHighDensityWarning: true, axialLoadingDensity: "high", highFatigueMovementClustering: "high" }),
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["reduce", "consolidate"], ["push", "recover", "stop_session"], ["low"], "caution")),
    scenario(4, "v04_label_leak_low_frequency_balanced_hold", "Low-frequency balanced plan should not be punished", "busy_parent_time_constrained", baseEvidence({
      performanceTrend: "stable",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("full_body", "full-body pattern", { withinRange: true })],
      frequencyStimulus: stimulus({ trainingDaysAvailable: 3, currentFrequency: 3, compoundDensity: "moderate", lowFrequencyHighDensityWarning: false }),
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["hold"], ["recover", "stop_session"], ["low"], "clear")),
    scenario(4, "v04_label_leak_hidden_overreach_consolidate", "Hidden overreach should consolidate", "advanced_powerlifting", baseEvidence({
      performanceTrend: "improving",
      fatigueState: "high",
      recoveryState: "poor",
      evidenceQuality: "high",
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { aboveRangeEvents: 1 }), exercise("deadlift", "hinge/pull pattern", { comparableLoadTrend: "declining" })],
      frequencyStimulus: stimulus({ currentFrequency: 5, sessionDensity: "high", hiddenOverreachRisk: true, highFatigueMovementClustering: "high" }),
      subjectiveContext: subjective({ readiness: "great", sleep: "mixed" }),
      evidenceConfidence: confidence({ comparableExposureCount: 4, dataCompleteness: "high" }),
    }), expect(["consolidate", "hold"], ["push", "recover", "stop_session"], ["low"], "caution")),
    scenario(4, "v04_label_leak_high_workload_good_recovery_not_overreach", "Stable high workload with good recovery is not overreach", "advanced_powerlifting", baseEvidence({
      performanceTrend: "stable",
      fatigueState: "low",
      recoveryState: "good",
      evidenceQuality: "high",
      exerciseHistory: [exercise("squat", "squat/lower-body pattern", { withinRange: true }), exercise("bench_press", "pressing pattern", { withinRange: true })],
      frequencyStimulus: stimulus({ currentFrequency: 5, sessionDensity: "high", compoundDensity: "moderate", hiddenOverreachRisk: false, highFatigueMovementClustering: "moderate" }),
      evidenceConfidence: confidence({ comparableExposureCount: 5, dataCompleteness: "high" }),
    }), expect(["hold", "push"], ["recover", "stop_session"], ["low", "moderate"], "clear")),
  ];
}

function scenario(level, id, title, athleteProfileId, evidence, expected) {
  return {
    id,
    level,
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

function baseEvidence(overrides) {
  const exerciseHistory = overrides.exerciseHistory ?? [exercise("bench_press", "pressing pattern", { withinRange: true })];
  return {
    evidenceModelVersion: "v0.4",
    status: "research_fixture",
    performanceTrend: overrides.performanceTrend,
    fatigueState: overrides.fatigueState,
    recoveryState: overrides.recoveryState,
    evidenceQuality: overrides.evidenceQuality,
    trainingContinuity: "consistent",
    localLiftSignals: exerciseHistory.map(toLocalLiftSignal),
    systemicSignals: overrides.systemicSignals ?? ["good_readiness"],
    sessionHistory: overrides.sessionHistory ?? sessionHistory(),
    exerciseHistory,
    swapHistory: overrides.swapHistory ?? null,
    consolidationHistory: overrides.consolidationHistory ?? consolidation(),
    frequencyStimulus: overrides.frequencyStimulus ?? stimulus(),
    safetyContext: overrides.safetyContext ?? safety(),
    evidenceConfidence: overrides.evidenceConfidence,
    subjectiveContext: overrides.subjectiveContext,
    notes: ["V0.4 label-leak catcher scenario."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: overrides.aboveRangeEvents ? [13] : [10],
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

function toLocalLiftSignal(item) {
  let signal = "inside_range";
  let severity = "low";
  if (item.aboveRangeEvents > 0) signal = "above_range";
  if (item.belowMinimumEvents > 0) signal = "below_range";
  if (item.comparableLoadTrend === "declining") signal = "dropoff";
  if (item.techniqueBreakdown !== "none") signal = "technique_limit";
  if (item.shutdowns > 0) signal = "repeated_shutdown";
  if (item.comparableLoadTrend === "sharp_drop") signal = "same_load_collapse";
  if (item.comparableLoadTrend === "declining") severity = "moderate";
  if (item.techniqueBreakdown === "high" || item.shutdowns > 1) severity = "high";
  return { lift: item.exerciseName, signal, severity };
}

function sessionHistory(overrides = {}) {
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

function subjective(values) {
  return {
    readiness: values.readiness ?? "mixed",
    stress: values.stress ?? "moderate",
    sleep: values.sleep ?? "mixed",
    motivation: values.motivation ?? "moderate",
    soreness: values.soreness ?? "moderate",
    safetyFlag: values.safetyFlag ?? "none",
    notes: "V0.4 subjective context.",
  };
}

function expect(allowedTypes, forbiddenTypes, allowedAggressiveness, safetyStatus, overrides = {}) {
  return {
    recommendation_types: allowedTypes,
    forbidden_recommendation_types: forbiddenTypes,
    aggressiveness: allowedAggressiveness,
    safety_gate_status: safetyStatus,
    confidence_min: overrides.confidence_min ?? 45,
    rationale: overrides.rationale ?? "Expected output should follow the Charter, prioritise explicit evidence, and use the smallest effective intervention.",
    charter_alignment: overrides.charter_alignment ?? {
      long_term_progress: true,
      adaptation: true,
      recovery: true,
      confidence: true,
      enjoyment: true,
      momentum: true,
    },
  };
}
