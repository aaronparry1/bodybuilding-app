export type AdaptationLevel = "exercise" | "movement_pattern" | "programme_system";
export type AdaptationStatus =
  | "adapting"
  | "likely_adapting"
  | "slowing"
  | "plateau_approaching"
  | "plateaued"
  | "saturated"
  | "regressing"
  | "insufficient_evidence";

export type AdaptationTrend = "strong_up" | "up" | "flat" | "down" | "strong_down" | "unknown";
export type CompletionTrend = "high" | "moderate" | "low" | "unknown";
export type SessionDifficultyTrend = "normal" | "rising" | "high" | "unknown";
export type RecoverySignal = "good" | "stable" | "strained" | "poor" | "unknown";
export type IssueFlag = "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
export type EvidenceNoise = "low" | "moderate" | "high";

export type AdaptationReasonCode =
  | "insufficient_evidence_window"
  | "single_poor_session_treated_as_noise"
  | "objective_performance_improving"
  | "performance_flat_with_normal_recovery"
  | "repeated_poor_exposures"
  | "poor_performance_with_high_fatigue"
  | "poor_performance_with_normal_recovery"
  | "multi_pattern_decline"
  | "exercise_age_high_with_flat_performance"
  | "failed_sets_increasing"
  | "pain_or_issue_flag_present"
  | "completion_quality_low"
  | "movement_pattern_supports_status"
  | "system_wide_supports_status";

export interface AdaptationDetectionEvidence {
  level: AdaptationLevel;
  evidenceWindowSessions: number;
  comparableExposureCount: number;
  bestSetTrend: AdaptationTrend;
  estimatedOneRepMaxTrend: AdaptationTrend;
  repPerformanceTrend: AdaptationTrend;
  loadTrend: AdaptationTrend;
  completedVsPlannedWork: CompletionTrend;
  failedSetFrequency: "none" | "occasional" | "repeated" | "unknown";
  sessionDifficulty: SessionDifficultyTrend;
  fatigueRecoverySignal: RecoverySignal;
  missedSessionCount: number;
  painOrIssueFlag: IssueFlag;
  exerciseAgeExposures: number;
  movementPatternPerformanceTrend: AdaptationTrend;
  systemWidePerformanceTrend: AdaptationTrend;
  poorExposureCount: number;
  evidenceNoise: EvidenceNoise;
}

export interface AdaptationDetectionResult {
  level: AdaptationLevel;
  status: AdaptationStatus;
  confidence: number;
  reasonCodes: AdaptationReasonCode[];
  summary: string;
  feedsFutureEngines: Array<
    | "progression_adjustment"
    | "exercise_rotation"
    | "method_selection"
    | "deloads"
    | "adaptive_training_state_transitions"
  >;
}

export function detectAdaptationStatus(evidence: AdaptationDetectionEvidence): AdaptationDetectionResult {
  const evidenceConfidence = calculateEvidenceConfidence(evidence);
  const reasonCodes: AdaptationReasonCode[] = [];

  if (evidenceConfidence < 45 || objectiveEvidenceIsInsufficient(evidence)) {
    return result(evidence, "insufficient_evidence", evidenceConfidence, [
      "insufficient_evidence_window",
    ]);
  }

  const highFatigue = evidence.fatigueRecoverySignal === "poor" || evidence.fatigueRecoverySignal === "strained" || evidence.sessionDifficulty === "high";
  const issuePresent = evidence.painOrIssueFlag === "pain" || evidence.painOrIssueFlag === "technical_breakdown" || evidence.painOrIssueFlag === "unsafe";
  const poorPerformance = poorPerformanceSignal(evidence);
  const improvingPerformance = improvingPerformanceSignal(evidence);
  const singlePoorSessionNoise = evidence.poorExposureCount <= 1
    && poorPerformance
    && !highFatigue
    && !issuePresent
    && evidence.evidenceWindowSessions >= 3;

  if (singlePoorSessionNoise) {
    reasonCodes.push("single_poor_session_treated_as_noise");
    return result(evidence, "likely_adapting", clampConfidence(evidenceConfidence - 8), reasonCodes);
  }

  if (issuePresent) reasonCodes.push("pain_or_issue_flag_present");
  if (evidence.failedSetFrequency === "repeated") reasonCodes.push("failed_sets_increasing");
  if (evidence.completedVsPlannedWork === "low") reasonCodes.push("completion_quality_low");

  if (evidence.level === "programme_system" && multiPatternDecline(evidence)) {
    reasonCodes.push("multi_pattern_decline");
    return result(evidence, highFatigue ? "regressing" : "plateaued", confidenceForStatus(evidenceConfidence, 82), reasonCodes);
  }

  if (poorPerformance && highFatigue) {
    reasonCodes.push("poor_performance_with_high_fatigue");
    return result(evidence, evidence.poorExposureCount >= 2 ? "regressing" : "slowing", confidenceForStatus(evidenceConfidence, 78), reasonCodes);
  }

  if (poorPerformance && !highFatigue) {
    reasonCodes.push("poor_performance_with_normal_recovery");
    if (evidence.poorExposureCount >= 3 || evidence.failedSetFrequency === "repeated") {
      reasonCodes.push("repeated_poor_exposures");
      return result(evidence, "plateaued", confidenceForStatus(evidenceConfidence, 82), reasonCodes);
    }
    return result(evidence, "plateau_approaching", confidenceForStatus(evidenceConfidence, 70), reasonCodes);
  }

  if (exerciseSaturation(evidence)) {
    reasonCodes.push("exercise_age_high_with_flat_performance");
    return result(evidence, "saturated", confidenceForStatus(evidenceConfidence, 76), reasonCodes);
  }

  if (improvingPerformance) {
    reasonCodes.push("objective_performance_improving");
    if (evidence.level !== "exercise" && evidence.movementPatternPerformanceTrend === "up") reasonCodes.push("movement_pattern_supports_status");
    if (evidence.level === "programme_system" && evidence.systemWidePerformanceTrend === "up") reasonCodes.push("system_wide_supports_status");
    return result(evidence, evidenceConfidence >= 75 ? "adapting" : "likely_adapting", confidenceForStatus(evidenceConfidence, 86), reasonCodes);
  }

  if (flatWithNormalRecovery(evidence)) {
    reasonCodes.push("performance_flat_with_normal_recovery");
    return result(evidence, evidence.poorExposureCount >= 2 ? "plateau_approaching" : "slowing", confidenceForStatus(evidenceConfidence, 68), reasonCodes);
  }

  return result(evidence, "likely_adapting", clampConfidence(evidenceConfidence - 5), reasonCodes);
}

function improvingPerformanceSignal(evidence: AdaptationDetectionEvidence): boolean {
  return [
    evidence.bestSetTrend,
    evidence.estimatedOneRepMaxTrend,
    evidence.repPerformanceTrend,
    evidence.loadTrend,
  ].some((trend) => trend === "strong_up" || trend === "up");
}

function poorPerformanceSignal(evidence: AdaptationDetectionEvidence): boolean {
  return [
    evidence.bestSetTrend,
    evidence.estimatedOneRepMaxTrend,
    evidence.repPerformanceTrend,
    evidence.loadTrend,
  ].some((trend) => trend === "strong_down" || trend === "down")
    || evidence.failedSetFrequency === "repeated";
}

function flatWithNormalRecovery(evidence: AdaptationDetectionEvidence): boolean {
  const flatPerformance = [
    evidence.bestSetTrend,
    evidence.estimatedOneRepMaxTrend,
    evidence.repPerformanceTrend,
    evidence.loadTrend,
  ].filter((trend) => trend === "flat").length >= 2;
  return flatPerformance && (evidence.fatigueRecoverySignal === "good" || evidence.fatigueRecoverySignal === "stable");
}

function exerciseSaturation(evidence: AdaptationDetectionEvidence): boolean {
  return evidence.level === "exercise"
    && evidence.exerciseAgeExposures >= 8
    && flatWithNormalRecovery(evidence)
    && evidence.poorExposureCount >= 2;
}

function multiPatternDecline(evidence: AdaptationDetectionEvidence): boolean {
  return evidence.systemWidePerformanceTrend === "down"
    || evidence.systemWidePerformanceTrend === "strong_down"
    || evidence.movementPatternPerformanceTrend === "down" && evidence.poorExposureCount >= 3;
}

function calculateEvidenceConfidence(evidence: AdaptationDetectionEvidence): number {
  const windowScore = exposureWindowScore(evidence.evidenceWindowSessions, evidence.comparableExposureCount);
  const completionScore = evidence.completedVsPlannedWork === "high" ? 90 : evidence.completedVsPlannedWork === "moderate" ? 70 : evidence.completedVsPlannedWork === "low" ? 40 : 45;
  const noisePenalty = evidence.evidenceNoise === "low" ? 0 : evidence.evidenceNoise === "moderate" ? 12 : 26;
  const missedPenalty = Math.min(20, Math.max(0, evidence.missedSessionCount) * 4);
  const unknownPenalty = unknownTrendCount(evidence) * 3;
  return clampConfidence(windowScore * 0.55 + completionScore * 0.25 + 20 - noisePenalty - missedPenalty - unknownPenalty);
}

function exposureWindowScore(sessions: number, comparableExposures: number): number {
  if (sessions >= 6 && comparableExposures >= 4) return 92;
  if (sessions >= 4 && comparableExposures >= 3) return 78;
  if (sessions >= 3 && comparableExposures >= 2) return 62;
  if (sessions >= 2 && comparableExposures >= 1) return 42;
  return 25;
}

function unknownTrendCount(evidence: AdaptationDetectionEvidence): number {
  return [
    evidence.bestSetTrend,
    evidence.estimatedOneRepMaxTrend,
    evidence.repPerformanceTrend,
    evidence.loadTrend,
    evidence.movementPatternPerformanceTrend,
    evidence.systemWidePerformanceTrend,
  ].filter((trend) => trend === "unknown").length;
}

function objectiveEvidenceIsInsufficient(evidence: AdaptationDetectionEvidence): boolean {
  const objectiveTrends = [
    evidence.bestSetTrend,
    evidence.estimatedOneRepMaxTrend,
    evidence.repPerformanceTrend,
    evidence.loadTrend,
  ];
  return evidence.comparableExposureCount < 2
    && objectiveTrends.every((trend) => trend === "unknown");
}

function confidenceForStatus(evidenceConfidence: number, ceiling: number): number {
  return clampConfidence(Math.min(ceiling, evidenceConfidence + 8));
}

function result(
  evidence: AdaptationDetectionEvidence,
  status: AdaptationStatus,
  confidence: number,
  reasonCodes: AdaptationReasonCode[],
): AdaptationDetectionResult {
  return {
    level: evidence.level,
    status,
    confidence: clampConfidence(confidence),
    reasonCodes: unique(reasonCodes),
    summary: summaryForStatus(status),
    feedsFutureEngines: [
      "progression_adjustment",
      "exercise_rotation",
      "method_selection",
      "deloads",
      "adaptive_training_state_transitions",
    ],
  };
}

function summaryForStatus(status: AdaptationStatus): string {
  switch (status) {
    case "adapting":
      return "Objective evidence indicates the current stimulus is producing adaptation.";
    case "likely_adapting":
      return "Evidence leans positive, but confidence is not high enough for a stronger classification.";
    case "slowing":
      return "Adaptation appears to be slowing, but the evidence does not yet show a plateau.";
    case "plateau_approaching":
      return "Repeated evidence suggests the current stimulus may be nearing a plateau.";
    case "plateaued":
      return "Objective evidence suggests adaptation has stalled.";
    case "saturated":
      return "The exercise appears saturated at this exposure and may need future rotation or method change.";
    case "regressing":
      return "Objective evidence indicates performance is moving backward.";
    case "insufficient_evidence":
      return "There is not enough reliable evidence to classify adaptation.";
  }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function clampConfidence(confidence: number): number {
  return Math.max(0, Math.min(100, Math.round(confidence)));
}
