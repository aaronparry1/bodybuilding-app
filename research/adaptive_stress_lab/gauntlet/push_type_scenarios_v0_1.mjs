const getLeanAthlete = {
  id: "push_v0_1_get_lean_context",
  label: "Push Validation Get Lean Context",
  goal: "get_lean",
  trainingAge: "intermediate",
  experienceLevel: "intermediate",
  daysPerWeek: 4,
  sessionTimeMinutes: 55,
  constraints: { time: "moderate", equipment: "commercial_gym", adherence: "strong", stress: "moderate" },
  recoveryContext: { sleepQuality: "good", soreness: "low", readiness: "high", fatigueTrend: "stable" },
};

export const pushTypeScenariosV0_1 = [
  ...volumePushScenarios(),
  ...loadPushScenarios(),
  ...performancePushScenarios(),
  ...mixedPushScenarios(),
];

function volumePushScenarios() {
  return [
    scenario("v14_volume_hypertrophy_high_tolerance", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 6, exposures: 4 }),
    scenario("v14_volume_quality_volume_rising", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 7, exposures: 5 }),
    scenario("v14_volume_stimulus_stalled_recovery_high", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 6, exposures: 4, qualitySetsTrend: "improving" }),
    scenario("v14_volume_after_recovery_week_return", "recovery_limited_lifter", "volume_push", { kind: "volume", planned: 6, exposures: 4, stress: "moderate", sleep: "good" }),
    scenario("v14_volume_powerbuilding_volume_bias", "intermediate_strength_hypertrophy", "volume_push", { kind: "volume", planned: 6, exposures: 4 }),
    scenario("v14_volume_more_quality_work_not_load", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 6, exposures: 4, topEnd: 1 }),
    scenario("v14_volume_high_volume_tolerance_accessory", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 8, exposures: 5, exercise: "cable_fly", pattern: "chest isolation" }),
    scenario("v14_volume_good_recovery_no_density_warning", "intermediate_strength_hypertrophy", "volume_push", { kind: "volume", planned: 6, exposures: 4, weeklySets: 15 }),
    scenario("v14_volume_inappropriate_poor_recovery", "recovery_limited_lifter", "hold", { kind: "volume", planned: 5, exposures: 4, sessionQuality: "mixed", spacing: "compressed", recoveryCost: "high" }),
    scenario("v14_volume_inappropriate_cut_low_confidence", "custom_get_lean", "hold", { kind: "volume", planned: 3, exposures: 3, athlete: getLeanAthlete, dataCompleteness: "moderate", qualityTrend: "stable" }),
    scenario("v14_volume_inappropriate_workload_density", "beginner_hypertrophy", "reduce", { kind: "volume", planned: 6, exposures: 4, weeklySets: 24, density: "high" }),
    scenario("v14_volume_inappropriate_recent_missed_range", "beginner_hypertrophy", "reduce", { kind: "volume", planned: 6, exposures: 4, belowMinimumEvents: 1, withinRange: false }),
  ];
}

function loadPushScenarios() {
  return [
    scenario("v14_load_strength_owns_top_range", "advanced_powerlifting", "load_push", { kind: "load", planned: 7, exposures: 4, topEnd: 4 }),
    scenario("v14_load_powerbuilding_ready", "intermediate_strength_hypertrophy", "load_push", { kind: "load", planned: 7, exposures: 4, topEnd: 4 }),
    scenario("v14_load_small_sensible_jump", "advanced_powerlifting", "load_push", { kind: "load", planned: 6, exposures: 3, topEnd: 3 }),
    scenario("v14_load_repeated_bench_top_end", "advanced_powerlifting", "load_push", { kind: "load", planned: 8, exposures: 5, topEnd: 5, exercise: "competition_bench_press", pattern: "pressing pattern" }),
    scenario("v14_load_repeated_squat_top_end", "advanced_powerlifting", "load_push", { kind: "load", planned: 8, exposures: 5, topEnd: 5, exercise: "competition_squat", pattern: "squat/lower-body pattern" }),
    scenario("v14_load_inappropriate_pattern_only", "advanced_powerlifting", "hold", { kind: "load", planned: 6, exposures: 2, topEnd: 4, exercise: "leg_press", strengthExercise: "competition_squat" }),
    scenario("v14_load_inappropriate_recent_swap", "intermediate_strength_hypertrophy", "consolidate", { kind: "load", planned: 7, exposures: 4, topEnd: 4, swap: true }),
    scenario("v14_load_inappropriate_shutdown", "advanced_powerlifting", "reduce", { kind: "load", planned: 7, exposures: 4, topEnd: 4, shutdowns: 1 }),
    scenario("v14_load_excessive_jump_blocked_to_micro", "advanced_powerlifting", "micro_push", { kind: "load", planned: 7, exposures: 4, topEnd: 4, loadJump: "excessive" }),
    scenario("v14_load_no_strength_support_micro", "advanced_powerlifting", "hold", { kind: "load", planned: 7, exposures: 4, topEnd: 4, strengthTrend: "stable" }),
    scenario("v14_load_recovery_compressed_consolidate", "advanced_powerlifting", "consolidate", { kind: "load", planned: 7, exposures: 4, topEnd: 4, spacing: "compressed" }),
    scenario("v14_load_pain_flag_blocks_push", "advanced_powerlifting", "stop_movement", { kind: "load", planned: 7, exposures: 4, topEnd: 4, pain: "sharp" }),
  ];
}

function performancePushScenarios() {
  return [
    scenario("v14_performance_planned_rep_pr", "advanced_powerlifting", "performance_push", { kind: "performance", planned: 10, exposures: 6, topEnd: 6 }),
    scenario("v14_performance_milestone_after_consolidation", "advanced_powerlifting", "performance_push", { kind: "performance", planned: 9, exposures: 6, topEnd: 5, consolidationCompleted: true }),
    scenario("v14_performance_long_stable_progression", "advanced_powerlifting", "performance_push", { kind: "performance", planned: 12, exposures: 7, topEnd: 6, stableBlockWeeks: 10 }),
    scenario("v14_performance_athletic_milestone", "custom_athletic", "performance_push", { kind: "performance", planned: 10, exposures: 6, topEnd: 5, athlete: athleticAthlete(), athleticTrend: "improving" }),
    scenario("v14_performance_inappropriate_one_good_session", "advanced_powerlifting", "hold", { kind: "performance", planned: 2, exposures: 1, topEnd: 1, stableBlockWeeks: 1 }),
    scenario("v14_performance_inappropriate_hidden_fatigue", "advanced_powerlifting", "consolidate", { kind: "performance", planned: 10, exposures: 6, topEnd: 5, hiddenOverreach: true }),
    scenario("v14_performance_blocked_by_safety_caution", "advanced_powerlifting", "stop_movement", { kind: "performance", planned: 10, exposures: 6, topEnd: 5, pain: "sharp" }),
    scenario("v14_performance_missing_milestone_load_push", "advanced_powerlifting", "load_push", { kind: "performance", planned: 10, exposures: 6, topEnd: 5, milestone: false }),
  ];
}

function mixedPushScenarios() {
  return [
    scenario("v14_mixed_choose_volume_over_load_hypertrophy", "beginner_hypertrophy", "volume_push", { kind: "volume", planned: 7, exposures: 5, topEnd: 5, loadJump: "small_sensible" }),
    scenario("v14_mixed_choose_load_over_volume_strength", "advanced_powerlifting", "load_push", { kind: "load", planned: 7, exposures: 5, topEnd: 5, qualityTrend: "improving" }),
    scenario("v14_mixed_micro_instead_of_volume_three_exposures", "beginner_hypertrophy", "micro_push", { kind: "volume", planned: 6, exposures: 3, topEnd: 2 }),
    scenario("v14_mixed_consolidate_after_recent_push", "intermediate_strength_hypertrophy", "consolidate", { kind: "load", planned: 7, exposures: 4, topEnd: 4, recentPush: true }),
    scenario("v14_mixed_goal_specific_get_lean_blocks_volume", "custom_get_lean", "hold", { kind: "volume", planned: 7, exposures: 5, athlete: getLeanAthlete }),
    scenario("v14_mixed_goal_specific_powerlifting_blocks_volume", "advanced_powerlifting", "micro_push", { kind: "volume", planned: 7, exposures: 5, topEnd: 1 }),
    scenario("v14_mixed_new_exercise_uncertainty_blocks_push", "intermediate_strength_hypertrophy", "hold", { kind: "load", planned: 7, exposures: 4, topEnd: 4, newExercise: true }),
    scenario("v14_mixed_post_swap_three_successes_load", "intermediate_strength_hypertrophy", "load_push", { kind: "load", planned: 8, exposures: 4, topEnd: 4, confirmedSwap: true }),
    scenario("v14_mixed_post_swap_one_exposure_consolidate", "intermediate_strength_hypertrophy", "consolidate", { kind: "load", planned: 7, exposures: 4, topEnd: 4, swap: true, swapExposures: 1 }),
    scenario("v14_mixed_micro_when_evidence_strong_not_exceptional", "intermediate_strength_hypertrophy", "micro_push", { kind: "micro", planned: 6, exposures: 3, topEnd: 2 }),
    scenario("v14_mixed_hold_when_quality_not_high_enough", "intermediate_strength_hypertrophy", "hold", { kind: "micro", planned: 3, exposures: 2, dataCompleteness: "low" }),
    scenario("v14_mixed_recover_not_push_systemic_decline", "advanced_powerlifting", "recover", { kind: "load", planned: 6, exposures: 4, systemicDecline: true }),
  ];
}

function scenario(id, athleteProfileId, expected, options = {}) {
  const exercise = options.exercise ?? (athleteProfileId === "advanced_powerlifting" ? "competition_bench_press" : "bench_press");
  const pattern = options.pattern ?? "pressing pattern";
  const evidence = evidenceFor({ id, athleteProfileId, exercise, pattern, ...options });
  return {
    id,
    level: "Sprint 14 - Higher-Risk Push Validation",
    athleteProfileId,
    athlete: options.athlete,
    evidence,
    expected: {
      recommendation_type: expected.endsWith("_push") ? "push" : expected,
      push_category: expected.endsWith("_push") ? expected : null,
    },
    rationale: `Sprint 14 fixture expecting ${expected}.`,
    confidence: "research_fixture",
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function evidenceFor(options) {
  const systemicDecline = options.systemicDecline === true;
  const belowMinimumEvents = options.belowMinimumEvents ?? 0;
  const shutdowns = options.shutdowns ?? 0;
  const withinRange = options.withinRange ?? belowMinimumEvents === 0;
  const stableBlockWeeks = options.stableBlockWeeks ?? (options.kind === "performance" ? 9 : 4);
  const planned = options.planned ?? 6;
  const exposures = options.exposures ?? 4;
  const topEnd = options.topEnd ?? (options.kind === "load" || options.kind === "performance" ? exposures : 2);
  const qualityTrend = options.qualityTrend ?? "improving";
  const strengthTrend = options.strengthTrend ?? "improving";
  const pain = options.pain ?? "none";
  const sessionQuality = systemicDecline ? "poor" : options.sessionQuality ?? "good";

  return {
    id: options.id,
    scenario: options.id.replaceAll("_", " "),
    athleteProfileId: options.athleteProfileId,
    evidenceModelVersion: "v0.7",
    status: "push_type_validation_fixture",
    sessionHistory: {
      plannedSessionsCompleted: planned,
      plannedSessionsMissed: 0,
      extraSessionsCompleted: 0,
      sessionSpacing: options.spacing ?? "normal",
      completedSets: planned * 4,
      skippedExercises: systemicDecline ? 2 : 0,
      sessionDurationMinutes: 60,
      sessionCompletionQuality: sessionQuality,
    },
    exerciseHistory: exerciseHistory({ ...options, exposures, topEnd, belowMinimumEvents, shutdowns, withinRange, strengthTrend, systemicDecline }),
    swapHistory: swapHistory(options),
    consolidationHistory: {
      recentPushOccurred: options.recentPush === true,
      plannedConsolidationDue: options.recentPush === true,
      consolidationCompleted: options.consolidationCompleted === true,
      ownsNewLoad: exposures >= 4 && options.recentPush !== true,
      repeatedSuccessfulExposuresAtNewLoad: exposures,
    },
    frequencyStimulus: {
      trainingDaysAvailable: 4,
      currentFrequency: 4,
      sessionDensity: options.density ?? "moderate",
      compoundDensity: options.density ?? "moderate",
      weeklyHardSetEstimate: options.weeklySets ?? 16,
      axialLoadingDensity: options.athleteProfileId === "advanced_powerlifting" ? "moderate" : "low",
      highFatigueMovementClustering: options.density === "high" ? "high" : "low",
      lowFrequencyHighDensityWarning: options.weeklySets >= 22 || options.density === "high",
      highFrequencyFatigue: false,
      hiddenOverreachRisk: options.hiddenOverreach === true,
    },
    safetyContext: {
      affectedArea: pain === "none" ? "none" : options.pattern,
      affectedMovementPattern: pain === "none" ? "none" : options.exercise,
      painTrend: pain === "none" ? "none" : "worsening",
      painSeverity: pain,
      techniqueBreakdown: false,
      systemicRedFlags: [],
      safetyIssueScope: pain === "none" ? "none" : "movement_specific",
    },
    evidenceConfidence: {
      plannedEvidenceCount: planned,
      comparableExposureCount: exposures,
      recency: "recent",
      dataCompleteness: options.dataCompleteness ?? "high",
      evidenceSourceQuality: "high",
    },
    subjectiveContext: pain === "none" ? undefined : { readiness: "mixed", stress: "moderate", sleep: "mixed", motivation: "moderate", soreness: "high", safetyFlag: "sharp_pain" },
    goalProgressEvidence: goalProgressEvidence({ ...options, qualityTrend, strengthTrend }),
    pushReadiness: {
      qualityVolumeTolerance: options.recoveryCost === "high" ? "low" : "high",
      topEndTargetRangeSuccesses: topEnd,
      loadJump: options.loadJump ?? (options.kind === "load" || options.kind === "performance" ? "small_sensible" : "none"),
      performanceMilestoneOpportunity: options.milestone ?? options.kind === "performance",
      stableBlockWeeks,
    },
    notes: ["Sprint 14 higher-risk push validation fixture; not production data."],
    approvalStatus: "draft_requires_aaron_approval",
  };
}

function exerciseHistory(options) {
  if (options.systemicDecline) {
    return [
      exercise("competition_squat", "squat/lower-body pattern", { comparableLoadTrend: "declining", withinRange: false, belowMinimumEvents: 2, shutdowns: 1, repeatedSuccessfulExposuresAtLoad: 1 }),
      exercise("competition_bench_press", "pressing pattern", { comparableLoadTrend: "declining", withinRange: false, belowMinimumEvents: 2, shutdowns: 1, repeatedSuccessfulExposuresAtLoad: 1 }),
    ];
  }
  const main = exercise(options.exercise, options.pattern, {
    comparableLoadTrend: options.strengthTrend === "stable" ? "stable" : "improving",
    withinRange: options.withinRange,
    aboveRangeEvents: options.topEnd,
    belowMinimumEvents: options.belowMinimumEvents,
    shutdowns: options.shutdowns,
    repeatedSuccessfulExposuresAtLoad: options.exposures,
    newExercise: options.newExercise === true,
    loadEvents: options.loadJump === "small_sensible" ? ["small_sensible_increase_available"] : [],
  });
  const support = exercise("machine_chest_press", "pressing pattern", {
    comparableLoadTrend: "improving",
    withinRange: true,
    aboveRangeEvents: Math.min(2, options.topEnd),
    repeatedSuccessfulExposuresAtLoad: Math.max(1, Math.min(options.exposures, 5)),
  });
  const accessory = exercise("lat_pulldown", "hinge/pull pattern", {
    comparableLoadTrend: "stable",
    withinRange: true,
    repeatedSuccessfulExposuresAtLoad: Math.max(1, Math.min(options.exposures, 5)),
  });
  return [main, support, accessory];
}

function exercise(exerciseName, movementPattern, overrides = {}) {
  return {
    exerciseName,
    movementPattern,
    targetRange: { min: 8, max: 12, unit: "reps" },
    loads: [100],
    repsOrSeconds: [10, 11, 12],
    withinRange: true,
    comparableLoadTrend: "stable",
    loadEvents: [],
    shutdowns: 0,
    belowMinimumEvents: 0,
    aboveRangeEvents: 0,
    productiveFatigue: false,
    newExercise: false,
    techniqueBreakdown: "none",
    repeatedSuccessfulExposuresAtLoad: 3,
    ...overrides,
  };
}

function swapHistory(options) {
  if (options.confirmedSwap) {
    return { swappedFrom: "barbell_row", swappedTo: options.exercise, reason: "fatigue management", postSwapPerformance: "improved", exposuresSinceSwap: 3, improvementConfirmed: true };
  }
  if (!options.swap) return null;
  return { swappedFrom: "barbell_row", swappedTo: options.exercise, reason: "fatigue management", postSwapPerformance: "improved", exposuresSinceSwap: options.swapExposures ?? 1, improvementConfirmed: false };
}

function goalProgressEvidence(options) {
  const strengthExercise = options.strengthExercise ?? (options.exercise?.startsWith("competition_") ? options.exercise : "competition_bench_press");
  return {
    strengthMetrics: [
      strengthMetric(strengthExercise, options.strengthTrend, options.exposures),
      strengthMetric("competition_squat", options.systemicDecline ? "declining" : options.strengthTrend, options.exposures),
      strengthMetric("competition_deadlift", options.systemicDecline ? "declining" : options.strengthTrend, options.exposures),
      strengthMetric("standing_overhead_press", options.strengthTrend === "improving" ? "stable" : options.strengthTrend, options.exposures),
    ],
    qualityVolume: {
      totalQualityVolumeTrend: options.qualityTrend,
      qualitySetsByMuscleTrend: options.qualitySetsTrend ?? options.qualityTrend,
      targetRangeCompletionRate: options.belowMinimumEvents ? 0.72 : 0.94,
      junkVolumeRatio: 0.03,
      plannedVolumeRatio: 1,
      plannedQualitySetCount: options.planned * 4,
      recoveryCost: options.recoveryCost ?? "moderate",
    },
    performancePreservation: {
      strengthTrend: options.strengthTrend === "declining" ? "declining" : "stable",
      qualityWorkRetainedTrend: options.qualityTrend === "declining" ? "declining" : "stable",
    },
    athleticMetrics: [
      { metricType: "power", exercise: "jump_squat", trend: options.athleticTrend ?? "stable", source: "programmed_performance" },
      { metricType: "dynamic_strength", exercise: "push_press", trend: options.athleticTrend ?? "stable", source: "programmed_performance" },
    ],
  };
}

function strengthMetric(exerciseName, trend = "improving", exposures = 4) {
  return {
    exercise: exerciseName,
    estimatedStrengthTrend: trend,
    ownedLoadTrend: trend,
    comparableLoadPerformance: trend,
    meaningfulRepPrCount: trend === "improving" ? 2 : 0,
    comparableExposures: exposures,
    outlierPr: false,
  };
}

function athleticAthlete() {
  return {
    id: "push_v0_1_athletic_context",
    label: "Push Validation Athletic Context",
    goal: "athletic_performance",
    trainingAge: "advanced",
    experienceLevel: "advanced",
    daysPerWeek: 5,
    sessionTimeMinutes: 75,
    constraints: { time: "moderate", equipment: "commercial_gym", adherence: "strong", stress: "moderate" },
    recoveryContext: { sleepQuality: "good", soreness: "low", readiness: "high", fatigueTrend: "stable" },
  };
}
