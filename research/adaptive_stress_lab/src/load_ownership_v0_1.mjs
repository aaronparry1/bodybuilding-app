import { buildDetailedEvidence, deriveEvidenceQuality, evidenceConfidenceScore } from "./evidence_detail.mjs";

export const LOAD_OWNERSHIP_STATES = new Set(["not_attempted", "introduced", "unstable", "stabilising", "owned"]);

export function assessLoadOwnership({ attempt }) {
  const observations = attempt.observations ?? [];
  const introduced = attempt.loadIncreaseIntroduced === true;
  if (!introduced) {
    return ownershipResult({
      attempt,
      state: "not_attempted",
      confidence: 80,
      reasons: ["No load increase has been introduced."],
      transition: "No ownership process started.",
    });
  }

  if (observations.length === 0) {
    return ownershipResult({
      attempt,
      state: "introduced",
      confidence: 55,
      reasons: ["New load was introduced, but no follow-up exposure exists yet."],
      transition: "Wait for comparable exposures before considering another meaningful load push.",
    });
  }

  const summary = summariseOwnershipEvidence(observations);
  if (summary.safetyIssues > 0 || summary.shutdowns >= 2 || summary.belowMinimumEvents >= 3 || summary.recoveryCostHigh >= 2) {
    return ownershipResult({
      attempt,
      state: "unstable",
      confidence: confidenceForSummary(summary),
      reasons: [
        "The new load produced repeated negative evidence.",
        `Shutdowns: ${summary.shutdowns}; below-minimum events: ${summary.belowMinimumEvents}; safety issues: ${summary.safetyIssues}.`,
      ],
      transition: "Do not push load again. Reduce, hold, or consolidate locally.",
      summary,
    });
  }

  if (summary.successfulComparableExposures >= 3 && summary.targetRangeSuccessRate >= 0.85 && summary.recoveryCostHigh === 0 && summary.safetyIssues === 0 && summary.trendStableOrBetter) {
    return ownershipResult({
      attempt,
      state: "owned",
      confidence: confidenceForSummary(summary),
      reasons: [
        "The athlete has repeated successful comparable exposures at the new load.",
        `Target-range success rate: ${Math.round(summary.targetRangeSuccessRate * 100)}%.`,
      ],
      transition: "The load is owned. Another meaningful load push may be considered if the broader Coaching State allows it.",
      summary,
    });
  }

  return ownershipResult({
    attempt,
    state: "stabilising",
    confidence: confidenceForSummary(summary),
    reasons: [
      "The new load is trending acceptably but ownership is not fully proven.",
      `Successful comparable exposures: ${summary.successfulComparableExposures}; target-range success rate: ${Math.round(summary.targetRangeSuccessRate * 100)}%.`,
    ],
    transition: "Consolidate the new load before another meaningful load push.",
    summary,
  });
}

export function meaningfulLoadPushAllowed({ ownership }) {
  return ownership.state === "not_attempted" || ownership.state === "owned";
}

export function runLoadOwnershipValidation({ attempts = loadOwnershipValidationAttempts() } = {}) {
  const results = attempts.map((attempt) => {
    const ownership = assessLoadOwnership({ attempt });
    const recommendationQuality = scoreRecommendationQuality({ attempt, ownership });
    return {
      attempt,
      ownership,
      recommendationQuality,
      unnecessary_load_push: attempt.nextRecommendation?.push_category === "load_push" && !meaningfulLoadPushAllowed({ ownership }),
      delayed_load_push: attempt.nextRecommendation?.recommendation_type !== "push" && ownership.state === "owned" && attempt.expectedNextAction === "load_push_allowed",
      failed_ownership_attempt: ["unstable"].includes(ownership.state),
    };
  });

  return {
    attempts: results,
    statistics: summariseValidation(results),
  };
}

export function loadOwnershipValidationAttempts() {
  return [
    attempt("owned_after_three_exposures", "owned", "load_push_allowed", [
      observation("week_1", { withinRange: true, trend: "stable" }),
      observation("week_2", { withinRange: true, trend: "improving" }),
      observation("week_3", { withinRange: true, trend: "improving" }),
      observation("week_4", { withinRange: true, trend: "stable" }),
    ]),
    attempt("introduced_no_follow_up", "introduced", "hold", []),
    attempt("stabilising_two_good_exposures", "stabilising", "consolidate", [
      observation("week_1", { withinRange: true, trend: "stable" }),
      observation("week_2", { withinRange: true, trend: "stable" }),
    ]),
    attempt("unstable_below_range_repeated", "unstable", "reduce", [
      observation("week_1", { withinRange: false, belowMinimumEvents: 1, trend: "declining" }),
      observation("week_2", { withinRange: false, belowMinimumEvents: 1, trend: "declining" }),
      observation("week_3", { withinRange: false, belowMinimumEvents: 1, trend: "sharp_drop" }),
    ]),
    attempt("unstable_shutdowns", "unstable", "reduce", [
      observation("week_1", { withinRange: true, trend: "stable" }),
      observation("week_2", { withinRange: false, shutdowns: 1, trend: "declining" }),
      observation("week_3", { withinRange: false, shutdowns: 1, trend: "declining" }),
    ]),
    attempt("stabilising_recovery_cost", "stabilising", "consolidate", [
      observation("week_1", { withinRange: true, trend: "stable", recoveryCost: "high" }),
      observation("week_2", { withinRange: true, trend: "stable", recoveryCost: "moderate" }),
      observation("week_3", { withinRange: true, trend: "stable", recoveryCost: "moderate" }),
    ]),
    attempt("owned_slow_four_weeks", "owned", "load_push_allowed", [
      observation("week_1", { withinRange: true, trend: "stable" }),
      observation("week_2", { withinRange: true, trend: "stable" }),
      observation("week_3", { withinRange: true, trend: "stable" }),
      observation("week_4", { withinRange: true, trend: "improving" }),
    ]),
    attempt("not_attempted_baseline", "not_attempted", "micro_push_allowed", [], { loadIncreaseIntroduced: false }),
    attempt("safety_blocks_ownership", "unstable", "stop_movement", [
      observation("week_1", { withinRange: true, trend: "stable" }),
      observation("week_2", { withinRange: true, trend: "stable", painSeverity: "sharp" }),
    ]),
    attempt("mixed_evidence_stabilising", "stabilising", "consolidate", [
      observation("week_1", { withinRange: true, trend: "improving" }),
      observation("week_2", { withinRange: false, belowMinimumEvents: 1, trend: "mixed" }),
      observation("week_3", { withinRange: true, trend: "stable" }),
    ]),
  ];
}

function attempt(id, expectedState, expectedNextAction, observations, overrides = {}) {
  return {
    id,
    exerciseName: overrides.exerciseName ?? "competition_bench_press",
    previousLoad: overrides.previousLoad ?? 100,
    introducedLoad: overrides.introducedLoad ?? 102.5,
    loadIncreaseIntroduced: overrides.loadIncreaseIntroduced ?? true,
    expectedState,
    expectedNextAction,
    observations,
    nextRecommendation: recommendationForExpected(expectedNextAction),
  };
}

function recommendationForExpected(expectedNextAction) {
  if (expectedNextAction === "load_push_allowed") return { recommendation_type: "push", push_category: "load_push" };
  if (expectedNextAction === "micro_push_allowed") return { recommendation_type: "push", push_category: "micro_push" };
  if (expectedNextAction === "reduce") return { recommendation_type: "reduce", push_category: null };
  if (expectedNextAction === "stop_movement") return { recommendation_type: "stop_movement", push_category: null };
  if (expectedNextAction === "consolidate") return { recommendation_type: "consolidate", push_category: null };
  return { recommendation_type: "hold", push_category: null };
}

function observation(id, overrides = {}) {
  const withinRange = overrides.withinRange ?? true;
  const belowMinimumEvents = overrides.belowMinimumEvents ?? 0;
  const shutdowns = overrides.shutdowns ?? 0;
  const recoveryCost = overrides.recoveryCost ?? "moderate";
  const painSeverity = overrides.painSeverity ?? "none";
  const trend = overrides.trend ?? "stable";
  return {
    id,
    evidenceModelVersion: "v0.7",
    sessionHistory: {
      plannedSessionsCompleted: 1,
      plannedSessionsMissed: 0,
      extraSessionsCompleted: 0,
      sessionSpacing: "normal",
      completedSets: 4,
      skippedExercises: shutdowns > 0 ? 1 : 0,
      sessionDurationMinutes: 60,
      sessionCompletionQuality: shutdowns > 0 || belowMinimumEvents > 0 ? "mixed" : "good",
    },
    exerciseHistory: [{
      exerciseName: "competition_bench_press",
      movementPattern: "pressing pattern",
      targetRange: { min: 8, max: 12, unit: "reps" },
      loads: [102.5],
      repsOrSeconds: withinRange ? [9, 9, 8] : [6, 5, 5],
      withinRange,
      comparableLoadTrend: trend,
      loadEvents: ["new_load_exposure"],
      shutdowns,
      belowMinimumEvents,
      aboveRangeEvents: 0,
      productiveFatigue: false,
      newExercise: false,
      techniqueBreakdown: "none",
      repeatedSuccessfulExposuresAtLoad: withinRange && belowMinimumEvents === 0 && shutdowns === 0 ? 1 : 0,
    }],
    frequencyStimulus: {
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
    },
    safetyContext: {
      affectedArea: painSeverity === "none" ? "none" : "pressing pattern",
      affectedMovementPattern: painSeverity === "none" ? "none" : "competition_bench_press",
      painTrend: painSeverity === "none" ? "none" : "worsening",
      painSeverity,
      techniqueBreakdown: false,
      systemicRedFlags: [],
      safetyIssueScope: painSeverity === "none" ? "none" : "movement_specific",
    },
    evidenceConfidence: {
      plannedEvidenceCount: 1,
      comparableExposureCount: 1,
      recency: "recent",
      dataCompleteness: "high",
      evidenceSourceQuality: "high",
    },
    goalProgressEvidence: {
      strengthMetrics: [{
        exercise: "competition_bench_press",
        estimatedStrengthTrend: trend === "sharp_drop" ? "declining" : trend,
        ownedLoadTrend: trend === "sharp_drop" ? "declining" : trend,
        comparableLoadPerformance: trend,
        meaningfulRepPrCount: 0,
        comparableExposures: 1,
        outlierPr: false,
      }],
      qualityVolume: {
        totalQualityVolumeTrend: withinRange ? "stable" : "declining",
        qualitySetsByMuscleTrend: withinRange ? "stable" : "declining",
        targetRangeCompletionRate: withinRange ? 0.9 : 0.45,
        junkVolumeRatio: 0.02,
        plannedVolumeRatio: 1,
        plannedQualitySetCount: withinRange ? 12 : 4,
        recoveryCost,
      },
    },
  };
}

function summariseOwnershipEvidence(observations) {
  const details = observations.map(buildDetailedEvidence);
  const exerciseItems = details.flatMap((detail) => detail.exerciseHistory);
  const successfulComparableExposures = exerciseItems.filter((item) => item.withinRange && item.belowMinimumEvents === 0 && item.shutdowns === 0).length;
  const targetRangeSuccessRate = observations.length ? successfulComparableExposures / observations.length : 0;
  const shutdowns = exerciseItems.reduce((sum, item) => sum + item.shutdowns, 0);
  const belowMinimumEvents = exerciseItems.reduce((sum, item) => sum + item.belowMinimumEvents, 0);
  const safetyIssues = details.filter((detail) => detail.safetyContext.painSeverity !== "none" || detail.safetyContext.systemicRedFlags.length > 0).length;
  const recoveryCostHigh = observations.filter((item) => item.goalProgressEvidence?.qualityVolume?.recoveryCost === "high").length;
  const trendStableOrBetter = exerciseItems.every((item) => ["stable", "improving"].includes(item.comparableLoadTrend));
  const evidenceQuality = Math.round(observations.reduce((sum, item) => sum + deriveEvidenceQuality(item).final_score, 0) / Math.max(1, observations.length));
  const confidenceScore = Math.round(observations.reduce((sum, item) => sum + evidenceConfidenceScore(item), 0) / Math.max(1, observations.length));
  return {
    observations: observations.length,
    successfulComparableExposures,
    targetRangeSuccessRate,
    shutdowns,
    belowMinimumEvents,
    safetyIssues,
    recoveryCostHigh,
    trendStableOrBetter,
    evidenceQuality,
    confidenceScore,
  };
}

function confidenceForSummary(summary) {
  let confidence = 45;
  confidence += Math.min(25, summary.observations * 7);
  confidence += Math.round(summary.evidenceQuality * 0.22);
  if (summary.safetyIssues > 0 || summary.shutdowns > 0 || summary.belowMinimumEvents > 0) confidence += 8;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function ownershipResult({ attempt, state, confidence, reasons, transition, summary = null }) {
  if (!LOAD_OWNERSHIP_STATES.has(state)) throw new Error(`Invalid LoadOwnership state ${state}`);
  return {
    attempt_id: attempt.id,
    exerciseName: attempt.exerciseName,
    previousLoad: attempt.previousLoad,
    introducedLoad: attempt.introducedLoad,
    state,
    confidence,
    reasons,
    transition,
    evidence_summary: summary,
  };
}

function scoreRecommendationQuality({ attempt, ownership }) {
  const expectedStateMatch = ownership.state === attempt.expectedState;
  const actionAllowed = attempt.nextRecommendation?.push_category !== "load_push" || meaningfulLoadPushAllowed({ ownership });
  let score = 50;
  if (expectedStateMatch) score += 25;
  if (actionAllowed) score += 20;
  if (ownership.state === "owned" && attempt.expectedNextAction === "load_push_allowed") score += 5;
  if (ownership.state === "unstable" && ["reduce", "stop_movement"].includes(attempt.expectedNextAction)) score += 5;
  return Math.max(0, Math.min(100, score));
}

function summariseValidation(results) {
  const owned = results.filter((item) => item.ownership.state === "owned");
  const failed = results.filter((item) => item.failed_ownership_attempt);
  const ownershipWeeks = owned.map((item) => item.ownership.evidence_summary?.observations ?? 0);
  const confidenceDeltas = results.map((item) => confidenceDeltaFor(item.ownership.state));
  return {
    total_attempts: results.length,
    ownership_success_rate: percentage(owned.length, results.length),
    failed_ownership_rate: percentage(failed.length, results.length),
    average_ownership_time_weeks: average(ownershipWeeks),
    failed_ownership_attempts: failed.length,
    unnecessary_load_pushes: results.filter((item) => item.unnecessary_load_push).length,
    delayed_load_pushes: results.filter((item) => item.delayed_load_push).length,
    average_recommendation_quality: average(results.map((item) => item.recommendationQuality)),
    average_confidence_change_proxy: average(confidenceDeltas),
    long_term_goal_progress_proxy: average(results.map((item) => progressProxyFor(item.ownership.state))),
    state_counts: Object.fromEntries(Array.from(LOAD_OWNERSHIP_STATES).map((state) => [state, results.filter((item) => item.ownership.state === state).length])),
  };
}

function progressProxyFor(state) {
  if (state === "owned") return 85;
  if (state === "stabilising") return 68;
  if (state === "introduced") return 55;
  if (state === "not_attempted") return 60;
  return 38;
}

function confidenceDeltaFor(state) {
  if (state === "owned") return 6;
  if (state === "stabilising") return 2;
  if (state === "introduced") return 0;
  if (state === "not_attempted") return 0;
  return -8;
}

function average(values) {
  const clean = values.filter(Number.isFinite);
  return clean.length ? Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length) : 0;
}

function percentage(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}
