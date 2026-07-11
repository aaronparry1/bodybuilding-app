export function hasEvidenceDetail(evidence) {
  return Boolean(
    evidence.sessionHistory ||
    evidence.exerciseHistory ||
    evidence.swapHistory ||
    evidence.consolidationHistory ||
    evidence.frequencyStimulus ||
    evidence.safetyContext ||
    evidence.evidenceConfidence
  );
}

const LEGACY_PERFORMANCE_KEY = "performance" + "Trend";
const LEGACY_FATIGUE_KEY = "fatigue" + "State";
const LEGACY_RECOVERY_KEY = "recovery" + "State";
const LEGACY_LOCAL_KEY = "local" + "Lift" + "Signals";
const LEGACY_SYSTEMIC_KEY = "systemic" + "Signals";
const LEGACY_CONTINUITY_KEY = "training" + "Continuity";
const LEGACY_CONSOLIDATION_LABEL = "planned_" + "consolidation";
const LEGACY_SWAP_LABEL = "post_" + "swap_" + "improvement";
const LEGACY_FREQUENCY_LABEL = "high_" + "frequency";
const LEGACY_DENSITY_LABEL = "compound_" + "density_" + "high";
const LEGACY_OVERREACH_LABEL = "hidden_" + "overreach";

export function buildDetailedEvidence(evidence) {
  return {
    sessionHistory: evidence.sessionHistory ?? deriveSessionHistory(evidence),
    exerciseHistory: evidence.exerciseHistory ?? deriveExerciseHistory(evidence),
    swapHistory: evidence.swapHistory ?? deriveSwapHistory(evidence),
    consolidationHistory: evidence.consolidationHistory ?? deriveConsolidationHistory(evidence),
    frequencyStimulus: evidence.frequencyStimulus ?? deriveFrequencyStimulus(evidence),
    safetyContext: evidence.safetyContext ?? deriveSafetyContext(evidence),
    evidenceConfidence: evidence.evidenceConfidence ?? deriveEvidenceConfidence(evidence),
  };
}

export function explicitEvidenceDrivers(evidence) {
  if (!hasEvidenceDetail(evidence)) return [];
  const detail = buildDetailedEvidence(evidence);
  const quality = deriveEvidenceQuality(evidence);
  const drivers = [];
  drivers.push(`planned_sessions_completed:${detail.sessionHistory.plannedSessionsCompleted}`);
  drivers.push(`planned_sessions_missed:${detail.sessionHistory.plannedSessionsMissed}`);
  drivers.push(`completed_sets:${detail.sessionHistory.completedSets}`);
  drivers.push(`session_quality:${detail.sessionHistory.sessionCompletionQuality}`);
  drivers.push(`exercise_records:${detail.exerciseHistory.length}`);
  if (detail.swapHistory) drivers.push(`swap_exposures:${detail.swapHistory.exposuresSinceSwap}`);
  if (detail.consolidationHistory.plannedConsolidationDue) drivers.push("consolidation:planned_due");
  if (detail.frequencyStimulus.highFrequencyFatigue) drivers.push("stimulus:high_frequency_fatigue");
  if (detail.frequencyStimulus.compoundDensity === "high") drivers.push("stimulus:compound_density_high");
  if (detail.frequencyStimulus.lowFrequencyHighDensityWarning) drivers.push("stimulus:low_frequency_high_density");
  if (detail.safetyContext.safetyIssueScope !== "none") drivers.push(`safety_scope:${detail.safetyContext.safetyIssueScope}`);
  drivers.push(`continuity:${inferTrainingContinuity(evidence)}`);
  drivers.push(`data_completeness:${detail.evidenceConfidence.dataCompleteness}`);
  if (usesFullyDerivedQualityEvidence(evidence)) drivers.push(`derived_quality:${quality.final_score}`);
  return drivers;
}

export function hasPlannedConsolidation(evidence) {
  const detail = buildDetailedEvidence(evidence);
  if (usesSummaryShortcutFreeEvidence(evidence)) return detail.consolidationHistory.plannedConsolidationDue;
  return detail.consolidationHistory.plannedConsolidationDue || (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_CONSOLIDATION_LABEL);
}

export function hasPostSwapSingleExposure(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    (!usesSummaryShortcutFreeEvidence(evidence) && (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_SWAP_LABEL)) ||
    (detail.swapHistory &&
      detail.swapHistory.postSwapPerformance === "improved" &&
      detail.swapHistory.exposuresSinceSwap <= 1 &&
      !detail.swapHistory.improvementConfirmed)
  );
}

export function hasUnconfirmedRecentPush(evidence) {
  if (!usesSummaryShortcutFreeEvidence(evidence)) return false;
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.consolidationHistory.recentPushOccurred &&
    !detail.consolidationHistory.consolidationCompleted &&
    !detail.consolidationHistory.ownsNewLoad &&
    detail.consolidationHistory.repeatedSuccessfulExposuresAtNewLoad < 2 &&
    !hasSingleAboveRangeDetail(evidence)
  );
}

export function hasStimulusManagementDetail(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    (!usesSummaryShortcutFreeEvidence(evidence) && (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_FREQUENCY_LABEL)) ||
    (!usesSummaryShortcutFreeEvidence(evidence) && (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_DENSITY_LABEL)) ||
    detail.frequencyStimulus.highFrequencyFatigue ||
    detail.frequencyStimulus.lowFrequencyHighDensityWarning ||
    detail.frequencyStimulus.weeklyHardSetEstimate >= 22 ||
    detail.frequencyStimulus.hiddenOverreachRisk ||
    detail.frequencyStimulus.highFatigueMovementClustering === "high" ||
    (detail.frequencyStimulus.compoundDensity === "high" && detail.frequencyStimulus.sessionDensity === "high")
  );
}

export function hasStructuralStressManagementIssue(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.frequencyStimulus.highFrequencyFatigue ||
    detail.frequencyStimulus.lowFrequencyHighDensityWarning ||
    detail.frequencyStimulus.highFatigueMovementClustering === "high" ||
    detail.frequencyStimulus.weeklyHardSetEstimate >= 22 ||
    detail.frequencyStimulus.hiddenOverreachRisk ||
    (detail.frequencyStimulus.compoundDensity === "high" && detail.frequencyStimulus.sessionDensity === "high") ||
    (detail.frequencyStimulus.axialLoadingDensity === "high" && detail.frequencyStimulus.highFatigueMovementClustering === "high")
  );
}

export function hasSystemicFatiguePattern(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.sessionHistory.sessionCompletionQuality === "poor" &&
    detail.exerciseHistory.filter((item) => item.comparableLoadTrend === "declining" || item.belowMinimumEvents > 0 || item.shutdowns > 0).length >= 2
  );
}

export function hasHiddenOverreachDetail(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (!usesSummaryShortcutFreeEvidence(evidence) && (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_OVERREACH_LABEL)) || detail.frequencyStimulus.hiddenOverreachRisk;
}

export function hasLocalPainPriorityDetail(evidence, safetyGate) {
  const detail = buildDetailedEvidence(evidence);
  const flag = evidence.subjectiveContext?.safetyFlag ?? "none";
  const painPresent = ["pain", "injury_concern"].includes(flag) || ["mild", "moderate"].includes(detail.safetyContext.painSeverity);
  if (!painPresent) return false;
  if (detail.safetyContext.safetyIssueScope === "session_wide") return false;
  const movementAreas = safetyGate.affected_areas.filter((area) => area !== "systemic" && area !== "none");
  return movementAreas.length <= 1 || detail.safetyContext.safetyIssueScope === "movement_specific";
}

export function hasRepeatedAboveRangeDetail(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.some((item) => item.aboveRangeEvents >= 2 || item.repeatedSuccessfulExposuresAtLoad >= 2);
}

export function hasSingleAboveRangeDetail(evidence) {
  const detail = buildDetailedEvidence(evidence);
  const aboveRangeTotal = detail.exerciseHistory.reduce((sum, item) => sum + item.aboveRangeEvents, 0);
  const negativeTotal = detail.exerciseHistory.reduce((sum, item) => sum + item.belowMinimumEvents + item.shutdowns, 0);
  return aboveRangeTotal === 1 && negativeTotal === 0 && detail.evidenceConfidence.comparableExposureCount <= 1;
}

export function hasLowEvidenceConfidence(evidence) {
  if (!usesConfidenceWeightedEvidence(evidence)) return false;
  if (usesFullyDerivedQualityEvidence(evidence)) return evidenceConfidenceScore(evidence) < 60;
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.evidenceConfidence.dataCompleteness === "low" ||
    detail.evidenceConfidence.evidenceSourceQuality === "low" ||
    detail.evidenceConfidence.comparableExposureCount <= 1 ||
    detail.evidenceConfidence.plannedEvidenceCount <= 1 ||
    detail.evidenceConfidence.recency === "stale"
  );
}

export function hasHighEvidenceConfidence(evidence) {
  if (!usesConfidenceWeightedEvidence(evidence)) return true;
  if (usesDerivedStateFreeEvidence(evidence)) return evidenceConfidenceScore(evidence) >= 85;
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.evidenceConfidence.dataCompleteness === "high" &&
    detail.evidenceConfidence.evidenceSourceQuality === "high" &&
    detail.evidenceConfidence.comparableExposureCount >= 4 &&
    detail.evidenceConfidence.plannedEvidenceCount >= 4 &&
    detail.evidenceConfidence.recency === "recent"
  );
}

export function usesConfidenceWeightedEvidence(evidence) {
  return evidence.evidenceModelVersion === "v0.4" || evidence.evidenceModelVersion === "v0.5" || evidence.evidenceModelVersion === "v0.6" || evidence.evidenceModelVersion === "v0.7";
}

export function usesSummaryShortcutFreeEvidence(evidence) {
  return evidence.evidenceModelVersion === "v0.5" || evidence.evidenceModelVersion === "v0.6" || evidence.evidenceModelVersion === "v0.7";
}

export function usesDerivedStateFreeEvidence(evidence) {
  return evidence.evidenceModelVersion === "v0.6" || evidence.evidenceModelVersion === "v0.7";
}

export function usesFullyDerivedQualityEvidence(evidence) {
  return evidence.evidenceModelVersion === "v0.7";
}

export function inferPerformanceDirection(evidence) {
  if (!usesSummaryShortcutFreeEvidence(evidence)) return evidence[LEGACY_PERFORMANCE_KEY] ?? "stable";
  const detail = buildDetailedEvidence(evidence);
  let positive = 0;
  let negative = 0;

  for (const item of detail.exerciseHistory) {
    if (item.comparableLoadTrend === "improving") positive += 2;
    if (item.comparableLoadTrend === "stable" && item.withinRange) positive += 1;
    if (item.aboveRangeEvents > 0) positive += item.aboveRangeEvents;
    if (item.repeatedSuccessfulExposuresAtLoad >= 3) positive += 2;
    if (item.productiveFatigue) positive += 1;

    if (item.comparableLoadTrend === "declining") negative += 2;
    if (item.comparableLoadTrend === "sharp_drop") negative += 4;
    if (item.belowMinimumEvents > 0) negative += item.belowMinimumEvents * 2;
    if (item.shutdowns > 0) negative += item.shutdowns * 2;
    if (item.techniqueBreakdown && item.techniqueBreakdown !== "none") negative += 1;
  }

  if (positive >= negative + 3) return "improving";
  if (negative >= positive + 4) return "declining";
  if (negative > 0 && positive > 0) return "mixed";
  if (positive > 0) return "stable";
  return detail.evidenceConfidence.dataCompleteness === "low" ? "mixed" : "stable";
}

export function inferFatigueLevel(evidence) {
  if (!usesSummaryShortcutFreeEvidence(evidence)) return evidence[LEGACY_FATIGUE_KEY] ?? "moderate";
  const detail = buildDetailedEvidence(evidence);
  let pressure = 0;

  for (const item of detail.exerciseHistory) {
    if (item.belowMinimumEvents > 0) pressure += item.belowMinimumEvents;
    if (item.shutdowns > 0) pressure += item.shutdowns * 2;
    if (item.comparableLoadTrend === "declining") pressure += 1;
    if (item.comparableLoadTrend === "sharp_drop") pressure += 3;
    if (item.productiveFatigue) pressure += 0.5;
  }

  if (detail.sessionHistory.sessionSpacing === "compressed") pressure += 1;
  if (detail.sessionHistory.sessionCompletionQuality === "poor") pressure += 2;
  if (detail.frequencyStimulus.highFrequencyFatigue) pressure += 2;
  if (detail.frequencyStimulus.hiddenOverreachRisk) pressure += 2;
  if (detail.frequencyStimulus.highFatigueMovementClustering === "high") pressure += 1;
  if (detail.frequencyStimulus.axialLoadingDensity === "high") pressure += 1;

  if (pressure >= 5) return "high";
  if (pressure >= 2) return "moderate";
  return "low";
}

export function inferRecoveryStatus(evidence) {
  if (!usesSummaryShortcutFreeEvidence(evidence)) return evidence[LEGACY_RECOVERY_KEY] ?? "mixed";
  const detail = buildDetailedEvidence(evidence);
  const fatigue = inferFatigueLevel(evidence);
  if (detail.safetyContext.systemicRedFlags.length > 0) return "poor";
  if (detail.safetyContext.painTrend === "worsening") return "poor";
  if (fatigue === "high") return "poor";
  if (fatigue === "moderate" || detail.sessionHistory.sessionSpacing === "compressed") return "mixed";
  return "good";
}

export function inferLocalEvidenceSignals(evidence) {
  if (!usesSummaryShortcutFreeEvidence(evidence)) return evidence[LEGACY_LOCAL_KEY] ?? [];
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.map((item) => ({
    lift: item.exerciseName,
    signal: signalForExercise(item),
    severity: severityForExercise(item),
  }));
}

export function hasMultipleExerciseDecline(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.filter((item) => item.comparableLoadTrend === "declining" || item.comparableLoadTrend === "sharp_drop" || item.belowMinimumEvents > 0 || item.shutdowns > 0).length >= 2;
}

export function hasMissedPlannedSessions(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.sessionHistory.plannedSessionsMissed > 0;
}

export function inferTrainingContinuity(evidence) {
  if (!usesDerivedStateFreeEvidence(evidence)) return evidence[LEGACY_CONTINUITY_KEY] ?? "interrupted";
  const detail = buildDetailedEvidence(evidence);
  if (detail.sessionHistory.plannedSessionsMissed >= 3 || detail.sessionHistory.sessionSpacing === "extended") return "missed_week";
  if (detail.sessionHistory.plannedSessionsMissed > 0 || detail.sessionHistory.sessionSpacing === "irregular") return "interrupted";
  if (detail.sessionHistory.plannedSessionsCompleted >= 3 && detail.sessionHistory.sessionSpacing !== "compressed") return "consistent";
  if (detail.sessionHistory.plannedSessionsCompleted >= 2) return "interrupted";
  return "interrupted";
}

export function hasTimeConstraintEvidence(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.sessionHistory.sessionDurationMinutes !== null && detail.sessionHistory.sessionDurationMinutes <= 35;
}

export function hasGoodObjectiveReadiness(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return inferFatigueLevel(evidence) === "low" && detail.sessionHistory.sessionCompletionQuality === "good" && !hasMultipleExerciseDecline(evidence);
}

export function evidenceConfidenceScore(evidence) {
  if (usesFullyDerivedQualityEvidence(evidence)) return deriveEvidenceQuality(evidence).final_score;
  const detail = buildDetailedEvidence(evidence);
  let score = 0;
  score += detail.evidenceConfidence.dataCompleteness === "high" ? 25 : detail.evidenceConfidence.dataCompleteness === "moderate" ? 14 : 4;
  score += detail.evidenceConfidence.evidenceSourceQuality === "high" ? 25 : detail.evidenceConfidence.evidenceSourceQuality === "moderate" ? 14 : 4;
  score += detail.evidenceConfidence.recency === "recent" ? 20 : detail.evidenceConfidence.recency === "mixed" ? 10 : 2;
  score += Math.min(15, detail.evidenceConfidence.plannedEvidenceCount * 3);
  score += Math.min(15, detail.evidenceConfidence.comparableExposureCount * 3);
  return Math.max(0, Math.min(100, score));
}

export function successfulComparableExposureCount(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.reduce((max, item) => {
    const successCount = Math.max(
      item.repeatedSuccessfulExposuresAtLoad ?? 0,
      item.withinRange && item.belowMinimumEvents === 0 && item.shutdowns === 0 ? detail.evidenceConfidence.comparableExposureCount : 0
    );
    return Math.max(max, successCount);
  }, 0);
}

export function sameExerciseSuccessfulExposureCount(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.reduce((max, item) => {
    const directCount = item.repeatedSuccessfulExposuresAtLoad ?? 0;
    const fallbackCount = item.withinRange && item.belowMinimumEvents === 0 && item.shutdowns === 0 ? Math.min(1, Array.isArray(item.repsOrSeconds) ? item.repsOrSeconds.length : 0) : 0;
    return Math.max(max, directCount, fallbackCount);
  }, 0);
}

export function qualityLevelForEvidence(evidence) {
  if (usesFullyDerivedQualityEvidence(evidence)) return levelForScore(deriveEvidenceQuality(evidence).final_score);
  return evidence.evidenceQuality ?? buildDetailedEvidence(evidence).evidenceConfidence.evidenceSourceQuality ?? "low";
}

export function qualityScoreForEvidence(evidence) {
  if (usesFullyDerivedQualityEvidence(evidence)) return deriveEvidenceQuality(evidence).final_score;
  return evidenceConfidenceScore(evidence);
}

export function deriveEvidenceQuality(evidence) {
  const detail = buildDetailedEvidence(evidence);
  const plannedSessions = detail.sessionHistory.plannedSessionsCompleted;
  const plannedRatio = ratio(plannedSessions, plannedSessions + detail.sessionHistory.extraSessionsCompleted);
  const workingSetCompleteness = detail.sessionHistory.completedSets > 0 ? 1 : 0;
  const exerciseRecords = detail.exerciseHistory.length;
  const comparableExposures = sameExerciseSuccessfulExposureCount(evidence);
  const targetCompleteness = ratio(detail.exerciseHistory.filter((item) => item.targetRange && typeof item.withinRange === "boolean").length, Math.max(1, exerciseRecords));
  const safetyCompleteness = detail.safetyContext ? 1 : 0;

  const dataCompleteness = Math.round(
    100 * (
      0.22 * cap(plannedSessions / 4) +
      0.18 * cap(detail.sessionHistory.completedSets / 10) +
      0.18 * cap(exerciseRecords / 3) +
      0.18 * targetCompleteness +
      0.12 * workingSetCompleteness +
      0.12 * safetyCompleteness
    )
  );
  const recency = scoreRecency(detail.evidenceConfidence.recency, detail.sessionHistory.sessionSpacing);
  const plannedEvidence = Math.round(100 * (0.7 * cap(plannedSessions / 4) + 0.3 * plannedRatio));
  const comparableExposureScore = Math.round(100 * cap(comparableExposures / 3));
  const sourceQuality = scoreSourceQuality(detail.evidenceConfidence.evidenceSourceQuality, plannedRatio, workingSetCompleteness);
  const consistency = scoreConsistency(detail);
  const finalScore = Math.round(
    0.22 * dataCompleteness +
    0.14 * recency +
    0.20 * plannedEvidence +
    0.20 * comparableExposureScore +
    0.12 * sourceQuality +
    0.12 * consistency
  );

  return {
    data_completeness: dataCompleteness,
    recency,
    planned_evidence: plannedEvidence,
    comparable_exposures: comparableExposureScore,
    source_quality: sourceQuality,
    consistency,
    final_score: Math.max(0, Math.min(100, finalScore)),
  };
}

export function hasRecoverThresholdEvidence(evidence, state = null) {
  if (!usesFullyDerivedQualityEvidence(evidence)) return hasSystemicFatiguePattern(evidence);
  const detail = buildDetailedEvidence(evidence);
  const affectedPatterns = new Set(detail.exerciseHistory
    .filter((item) => item.comparableLoadTrend === "declining" || item.comparableLoadTrend === "sharp_drop" || item.belowMinimumEvents > 0 || item.shutdowns > 0)
    .map((item) => item.movementPattern));
  const shutdowns = detail.exerciseHistory.reduce((sum, item) => sum + item.shutdowns, 0);
  const belowMinimum = detail.exerciseHistory.reduce((sum, item) => sum + item.belowMinimumEvents, 0);
  const enoughQuality = deriveEvidenceQuality(evidence).final_score >= 70;
  const multiSession = detail.sessionHistory.plannedSessionsCompleted >= 3;
  const broadPattern = affectedPatterns.size >= 2;
  const poorAfterRest = detail.sessionHistory.sessionSpacing !== "compressed" && detail.sessionHistory.sessionCompletionQuality === "poor";
  const spacingAllowsRecovery = detail.sessionHistory.sessionSpacing !== "compressed";
  const repeatedEvents = shutdowns >= 2 || (belowMinimum >= 4 && poorAfterRest);
  const recoveryLow = state ? state.recovery_capacity <= 40 : inferRecoveryStatus(evidence) === "poor";
  const severeSafety = detail.safetyContext.systemicRedFlags.length > 0 || detail.safetyContext.safetyIssueScope === "session_wide";
  return severeSafety || (enoughQuality && multiSession && broadPattern && recoveryLow && spacingAllowsRecovery && (repeatedEvents || poorAfterRest));
}

export function hasRecentShutdownOrPain(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.exerciseHistory.some((item) => item.shutdowns > 0) ||
    detail.safetyContext.painSeverity !== "none" ||
    detail.safetyContext.painTrend === "worsening" ||
    detail.safetyContext.systemicRedFlags.length > 0
  );
}

export function hasRecentMissedMinimumRange(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.some((item) => item.belowMinimumEvents > 0);
}

export function hasRecoveryCompression(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.sessionHistory.sessionSpacing === "compressed" ||
    detail.sessionHistory.sessionCompletionQuality === "poor" ||
    detail.frequencyStimulus.hiddenOverreachRisk ||
    detail.frequencyStimulus.highFrequencyFatigue
  );
}

export function hasHighWorkloadDensityWarning(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.frequencyStimulus.lowFrequencyHighDensityWarning ||
    detail.frequencyStimulus.weeklyHardSetEstimate >= 22 ||
    detail.frequencyStimulus.highFatigueMovementClustering === "high" ||
    (detail.frequencyStimulus.compoundDensity === "high" && detail.frequencyStimulus.sessionDensity === "high")
  );
}

export function hasSwapOrNewExerciseUncertainty(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return (
    detail.exerciseHistory.some((item) => item.newExercise) ||
    Boolean(detail.swapHistory && (!detail.swapHistory.improvementConfirmed || detail.swapHistory.exposuresSinceSwap < 3))
  );
}

export function hasPositivePushSignal(evidence) {
  const detail = buildDetailedEvidence(evidence);
  return detail.exerciseHistory.some((item) =>
    item.comparableLoadTrend === "improving" ||
    item.aboveRangeEvents >= 2 ||
    item.productiveFatigue
  );
}

function deriveSessionHistory(evidence) {
  const continuity = evidence[LEGACY_CONTINUITY_KEY] ?? "interrupted";
  const systemic = evidence[LEGACY_SYSTEMIC_KEY] ?? [];
  const performance = evidence[LEGACY_PERFORMANCE_KEY] ?? "stable";
  return {
    plannedSessionsCompleted: continuity === "consistent" ? 4 : continuity === "interrupted" ? 2 : 0,
    plannedSessionsMissed: continuity === "missed_week" ? 3 : systemic.includes("missed_sessions") ? 1 : 0,
    extraSessionsCompleted: 0,
    sessionSpacing: systemic.includes("time_constraint") ? "compressed" : "normal",
    completedSets: Math.max(0, (evidence[LEGACY_LOCAL_KEY] ?? []).filter((signal) => signal.signal !== "none").length * 3),
    skippedExercises: systemic.includes("time_constraint") ? 1 : 0,
    sessionDurationMinutes: null,
    sessionCompletionQuality: performance === "declining" ? "poor" : performance === "mixed" ? "mixed" : "good",
  };
}

function deriveExerciseHistory(evidence) {
  const performance = evidence[LEGACY_PERFORMANCE_KEY] ?? "stable";
  return (evidence[LEGACY_LOCAL_KEY] ?? []).map((signal) => ({
    exerciseName: signal.lift,
    movementPattern: movementPatternFor(signal.lift),
    targetRange: signal.lift.includes("plank") ? { min: 30, max: 60, unit: "seconds" } : { min: 8, max: 12, unit: "reps" },
    loads: signal.lift === "all" ? [] : [100],
    repsOrSeconds: signal.signal === "below_range" ? [5] : signal.signal === "above_range" ? [13] : signal.signal === "productive_fatigue" ? [12, 10] : [10],
    withinRange: ["inside_range", "productive_fatigue", "above_range"].includes(signal.signal),
    comparableLoadTrend: signal.signal === "dropoff" ? "declining" : signal.signal === "same_load_collapse" ? "sharp_drop" : performance,
    loadEvents: signal.signal === "productive_fatigue" ? ["increase"] : [],
    shutdowns: signal.signal === "repeated_shutdown" ? 2 : 0,
    belowMinimumEvents: signal.signal === "below_range" ? 1 : 0,
    aboveRangeEvents: signal.signal === "above_range" ? 1 : 0,
    productiveFatigue: signal.signal === "productive_fatigue",
    newExercise: false,
    techniqueBreakdown: signal.signal === "technique_limit" ? signal.severity : "none",
    repeatedSuccessfulExposuresAtLoad: signal.signal === "above_range" && evidence.evidenceQuality === "high" ? 2 : 1,
  }));
}

function deriveSwapHistory(evidence) {
  if (!(evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_SWAP_LABEL)) return null;
  return {
    swappedFrom: "previous movement",
    swappedTo: "current movement",
    reason: "performance or comfort",
    postSwapPerformance: "improved",
    exposuresSinceSwap: 1,
    improvementConfirmed: false,
  };
}

function deriveConsolidationHistory(evidence) {
  const performance = evidence[LEGACY_PERFORMANCE_KEY] ?? "stable";
  return {
    recentPushOccurred: performance === "improving",
    plannedConsolidationDue: (evidence[LEGACY_SYSTEMIC_KEY] ?? []).includes(LEGACY_CONSOLIDATION_LABEL),
    consolidationCompleted: false,
    ownsNewLoad: hasRepeatedAboveRangeSignal(evidence),
    repeatedSuccessfulExposuresAtNewLoad: hasRepeatedAboveRangeSignal(evidence) ? 2 : 0,
  };
}

function deriveFrequencyStimulus(evidence) {
  const systemic = evidence[LEGACY_SYSTEMIC_KEY] ?? [];
  return {
    trainingDaysAvailable: systemic.includes("low_frequency") ? 3 : 4,
    currentFrequency: systemic.includes(LEGACY_FREQUENCY_LABEL) ? 6 : systemic.includes("low_frequency") ? 3 : 4,
    sessionDensity: systemic.includes("time_constraint") ? "high" : "moderate",
    compoundDensity: systemic.includes(LEGACY_DENSITY_LABEL) ? "high" : "moderate",
    weeklyHardSetEstimate: systemic.includes(LEGACY_DENSITY_LABEL) ? 24 : 14,
    axialLoadingDensity: (evidence[LEGACY_LOCAL_KEY] ?? []).some((signal) => ["squat", "deadlift"].includes(signal.lift)) ? "moderate" : "low",
    highFatigueMovementClustering: (evidence[LEGACY_LOCAL_KEY] ?? []).filter((signal) => ["squat", "deadlift"].includes(signal.lift)).length >= 2 ? "high" : "low",
    lowFrequencyHighDensityWarning: systemic.includes("low_frequency") && systemic.includes(LEGACY_DENSITY_LABEL),
    highFrequencyFatigue: systemic.includes(LEGACY_FREQUENCY_LABEL),
    hiddenOverreachRisk: systemic.includes(LEGACY_OVERREACH_LABEL) || hasHiddenOverreachPattern(evidence),
  };
}

function deriveSafetyContext(evidence) {
  const safetyFlag = evidence.subjectiveContext?.safetyFlag ?? "none";
  const localSignals = evidence[LEGACY_LOCAL_KEY] ?? [];
  const movementSignal = localSignals.find((signal) => signal.lift !== "all") ?? localSignals[0];
  return {
    affectedArea: movementSignal ? movementPatternFor(movementSignal.lift) : "none",
    affectedMovementPattern: movementSignal?.lift ?? "none",
    painTrend: safetyFlag === "worsening_pain" ? "worsening" : safetyFlag === "pain" ? "stable" : "none",
    painSeverity: safetyFlag === "severe_pain" ? "severe" : safetyFlag === "sharp_pain" ? "sharp" : safetyFlag === "pain" ? "mild" : "none",
    techniqueBreakdown: localSignals.some((signal) => signal.signal === "technique_limit"),
    systemicRedFlags: ["dizziness", "unusual_symptoms", "unsafe", "medical_red_flag"].includes(safetyFlag) ? [safetyFlag] : [],
    safetyIssueScope: ["dizziness", "unusual_symptoms", "unsafe", "medical_red_flag"].includes(safetyFlag) ? "session_wide" : safetyFlag !== "none" ? "movement_specific" : "none",
  };
}

function deriveEvidenceConfidence(evidence) {
  const continuity = evidence[LEGACY_CONTINUITY_KEY] ?? "interrupted";
  const plannedEvidenceCount = continuity === "consistent" ? 4 : continuity === "interrupted" ? 2 : 0;
  return {
    plannedEvidenceCount,
    comparableExposureCount: Math.max(1, (evidence[LEGACY_LOCAL_KEY] ?? []).length),
    recency: continuity === "missed_week" ? "stale" : "recent",
    dataCompleteness: evidence.evidenceQuality,
    evidenceSourceQuality: evidence.evidenceQuality,
  };
}

function ratio(value, total) {
  return total <= 0 ? 0 : Math.max(0, Math.min(1, value / total));
}

function cap(value) {
  return Math.max(0, Math.min(1, value));
}

function scoreRecency(recency, spacing) {
  if (recency === "recent") return spacing === "extended" ? 70 : 95;
  if (recency === "mixed") return 60;
  return 25;
}

function scoreSourceQuality(sourceQuality, plannedRatio, workingSetCompleteness) {
  const base = sourceQuality === "high" ? 90 : sourceQuality === "moderate" ? 65 : 35;
  return Math.round(base * 0.65 + plannedRatio * 25 + workingSetCompleteness * 10);
}

function scoreConsistency(detail) {
  let score = 75;
  if (detail.sessionHistory.plannedSessionsMissed > 0) score -= Math.min(25, detail.sessionHistory.plannedSessionsMissed * 8);
  if (detail.sessionHistory.sessionSpacing === "irregular") score -= 10;
  if (detail.sessionHistory.sessionSpacing === "extended") score -= 18;
  if (detail.sessionHistory.extraSessionsCompleted > detail.sessionHistory.plannedSessionsCompleted) score -= 18;
  if (detail.exerciseHistory.some((item) => item.comparableLoadTrend === "mixed")) score -= 8;
  if (detail.exerciseHistory.every((item) => item.withinRange && item.shutdowns === 0 && item.belowMinimumEvents === 0)) score += 12;
  return Math.max(0, Math.min(100, score));
}

function levelForScore(score) {
  if (score >= 80) return "high";
  if (score >= 55) return "moderate";
  return "low";
}

function movementPatternFor(lift) {
  const value = lift.toLowerCase();
  if (value.includes("squat") || value.includes("leg_press") || value.includes("hack")) return "squat/lower-body pattern";
  if (value.includes("deadlift") || value.includes("row")) return "hinge/pull pattern";
  if (value.includes("bench") || value.includes("press")) return "pressing pattern";
  if (value.includes("curl")) return "arm isolation";
  if (value.includes("plank")) return "core/bracing";
  if (value === "all") return "systemic";
  return lift.replaceAll("_", " ");
}

function hasRepeatedAboveRangeSignal(evidence) {
  return (evidence[LEGACY_LOCAL_KEY] ?? []).filter((signal) => signal.signal === "above_range").length >= 2;
}

function hasHiddenOverreachPattern(evidence) {
  const localSignals = evidence[LEGACY_LOCAL_KEY] ?? [];
  const performance = evidence[LEGACY_PERFORMANCE_KEY] ?? "stable";
  const fatigue = evidence[LEGACY_FATIGUE_KEY] ?? "moderate";
  const recovery = evidence[LEGACY_RECOVERY_KEY] ?? "mixed";
  const hasPositive = localSignals.some((signal) => ["above_range", "inside_range", "productive_fatigue"].includes(signal.signal));
  const hasFatigueCost = localSignals.some((signal) => ["dropoff", "same_load_collapse", "repeated_shutdown"].includes(signal.signal));
  return (
    performance === "improving" &&
    fatigue === "high" &&
    recovery === "poor" &&
    hasPositive &&
    hasFatigueCost
  );
}

function signalForExercise(item) {
  if (item.shutdowns > 0) return "repeated_shutdown";
  if (item.comparableLoadTrend === "sharp_drop") return "same_load_collapse";
  if (item.techniqueBreakdown && item.techniqueBreakdown !== "none") return "technique_limit";
  if (item.belowMinimumEvents > 0) return "below_range";
  if (item.comparableLoadTrend === "declining") return "dropoff";
  if (item.productiveFatigue) return "productive_fatigue";
  if (item.aboveRangeEvents > 0) return "above_range";
  if (item.withinRange) return "inside_range";
  return "none";
}

function severityForExercise(item) {
  if (item.shutdowns >= 2 || item.comparableLoadTrend === "sharp_drop" || item.techniqueBreakdown === "high") return "high";
  if (item.shutdowns === 1 || item.belowMinimumEvents >= 2 || item.comparableLoadTrend === "declining" || item.techniqueBreakdown === "moderate") return "moderate";
  if (signalForExercise(item) !== "none") return "low";
  return "none";
}
