export type ReserveLevel =
  | "high_reserve"
  | "moderate_reserve"
  | "low_reserve"
  | "no_reserve"
  | "unknown";

export type ReserveStressAction =
  | "progress_normally"
  | "progress_carefully"
  | "hold_or_consolidate"
  | "reduce_or_recover"
  | "gather_more_evidence";

export type ReserveEvidenceQuality = "high" | "moderate" | "low";
export type ReservePerformanceTrend = "strong_up" | "up" | "flat" | "down" | "strong_down" | "unknown";
export type WorkloadToleranceTrend = "improved" | "maintained" | "reduced" | "unknown";
export type SetDropOffTrend = "normal" | "increasing" | "severe" | "unknown";
export type MissedTargetTrend = "none" | "occasional" | "repeated" | "unknown";
export type ReserveEvidenceNoise = "low" | "moderate" | "high";

export interface RecoverableReserveEvidence {
  completedWeeks: number;
  plannedWeeks: number;
  completedSessions: number;
  plannedSessions: number;
  performanceTrend: ReservePerformanceTrend;
  workloadToleranceTrend: WorkloadToleranceTrend;
  setDropOffTrend: SetDropOffTrend;
  missedTargetTrend: MissedTargetTrend;
  shutdownEvents: number;
  comparableExposureCount: number;
  evidenceNoise: ReserveEvidenceNoise;
}

export interface RecoverableReserveAssessment {
  reserve: ReserveLevel;
  canAddStress: boolean;
  recommendedStressAction: ReserveStressAction;
  rationale: string[];
  evidenceQuality: ReserveEvidenceQuality;
  confidence: number;
}

export function assessRecoverableReserve(evidence: RecoverableReserveEvidence): RecoverableReserveAssessment {
  const evidenceQuality = assessEvidenceQuality(evidence);

  if (evidenceQuality === "low" && hasUnknownReserveSignals(evidence)) {
    return assessment({
      reserve: "unknown",
      evidenceQuality,
      rationale: [
        "Comparable exposure or logging quality is insufficient.",
        "Recoverable reserve should not be inferred aggressively from incomplete evidence.",
      ],
      confidence: 38,
    });
  }

  if (hasNoReserve(evidence)) {
    return assessment({
      reserve: "no_reserve",
      evidenceQuality,
      rationale: [
        "Performance and tolerance evidence show reserve is exhausted.",
        "Additional training stress has not been earned from objective training evidence.",
      ],
      confidence: confidenceFor(evidenceQuality, 84),
    });
  }

  if (hasLowReserve(evidence)) {
    return assessment({
      reserve: "low_reserve",
      evidenceQuality,
      rationale: [
        "Performance or workload tolerance is under strain.",
        "Stress should be held or consolidated until reserve improves.",
      ],
      confidence: confidenceFor(evidenceQuality, 76),
    });
  }

  if (hasHighReserve(evidence, evidenceQuality)) {
    return assessment({
      reserve: "high_reserve",
      evidenceQuality,
      rationale: [
        "Performance is improving and workload is being tolerated.",
        "Objective training evidence suggests the athlete has earned more stress.",
      ],
      confidence: confidenceFor(evidenceQuality, 88),
    });
  }

  if (hasModerateReserve(evidence)) {
    return assessment({
      reserve: "moderate_reserve",
      evidenceQuality,
      rationale: [
        "Performance is holding or improving without clear reserve exhaustion.",
        "Stress can progress carefully if future evidence remains stable.",
      ],
      confidence: confidenceFor(evidenceQuality, 74),
    });
  }

  return assessment({
    reserve: "unknown",
    evidenceQuality,
    rationale: [
      "Reserve signals are mixed or incomplete.",
      "Gather more objective evidence before adding training stress.",
    ],
    confidence: confidenceFor(evidenceQuality, 52),
  });
}

function hasHighReserve(evidence: RecoverableReserveEvidence, evidenceQuality: ReserveEvidenceQuality): boolean {
  return evidenceQuality !== "low"
    && (evidence.performanceTrend === "strong_up" || evidence.performanceTrend === "up")
    && (evidence.workloadToleranceTrend === "improved" || evidence.workloadToleranceTrend === "maintained")
    && evidence.setDropOffTrend === "normal"
    && (evidence.missedTargetTrend === "none" || evidence.missedTargetTrend === "occasional")
    && evidence.shutdownEvents === 0;
}

function hasModerateReserve(evidence: RecoverableReserveEvidence): boolean {
  return (evidence.performanceTrend === "up" || evidence.performanceTrend === "flat")
    && evidence.workloadToleranceTrend === "maintained"
    && (evidence.setDropOffTrend === "normal" || evidence.setDropOffTrend === "increasing")
    && evidence.missedTargetTrend !== "repeated"
    && evidence.shutdownEvents <= 1;
}

function hasLowReserve(evidence: RecoverableReserveEvidence): boolean {
  return (evidence.performanceTrend === "flat" || evidence.performanceTrend === "down")
    && (evidence.workloadToleranceTrend === "reduced" || evidence.setDropOffTrend === "increasing" || evidence.missedTargetTrend === "occasional" || evidence.missedTargetTrend === "repeated")
    && evidence.shutdownEvents <= 2;
}

function hasNoReserve(evidence: RecoverableReserveEvidence): boolean {
  return evidence.performanceTrend === "strong_down"
    || (evidence.performanceTrend === "down" && evidence.workloadToleranceTrend === "reduced")
    || evidence.setDropOffTrend === "severe"
    || evidence.missedTargetTrend === "repeated" && evidence.shutdownEvents >= 2
    || evidence.shutdownEvents >= 3;
}

function assessEvidenceQuality(evidence: RecoverableReserveEvidence): ReserveEvidenceQuality {
  const completionRatio = evidence.plannedSessions > 0 ? evidence.completedSessions / evidence.plannedSessions : 0;
  const weekRatio = evidence.plannedWeeks > 0 ? evidence.completedWeeks / evidence.plannedWeeks : completionRatio;
  const exposures = evidence.comparableExposureCount;

  if (evidence.evidenceNoise === "high" || exposures < 2 || completionRatio < 0.5 || weekRatio < 0.5) {
    return "low";
  }

  if (evidence.evidenceNoise === "low" && exposures >= 5 && completionRatio >= 0.85 && weekRatio >= 0.75) {
    return "high";
  }

  return "moderate";
}

function hasUnknownReserveSignals(evidence: RecoverableReserveEvidence): boolean {
  return evidence.performanceTrend === "unknown"
    || evidence.workloadToleranceTrend === "unknown"
    || evidence.setDropOffTrend === "unknown"
    || evidence.missedTargetTrend === "unknown"
    || evidence.comparableExposureCount < 2
    || evidence.evidenceNoise === "high";
}

function assessment(input: {
  reserve: ReserveLevel;
  evidenceQuality: ReserveEvidenceQuality;
  rationale: string[];
  confidence: number;
}): RecoverableReserveAssessment {
  return {
    reserve: input.reserve,
    canAddStress: canAddStressForReserve(input.reserve),
    recommendedStressAction: stressActionForReserve(input.reserve),
    rationale: input.rationale,
    evidenceQuality: input.evidenceQuality,
    confidence: clampConfidence(input.confidence),
  };
}

function canAddStressForReserve(reserve: ReserveLevel): boolean {
  return reserve === "high_reserve" || reserve === "moderate_reserve";
}

function stressActionForReserve(reserve: ReserveLevel): ReserveStressAction {
  switch (reserve) {
    case "high_reserve":
      return "progress_normally";
    case "moderate_reserve":
      return "progress_carefully";
    case "low_reserve":
      return "hold_or_consolidate";
    case "no_reserve":
      return "reduce_or_recover";
    case "unknown":
      return "gather_more_evidence";
  }
}

function confidenceFor(evidenceQuality: ReserveEvidenceQuality, base: number): number {
  if (evidenceQuality === "high") return base;
  if (evidenceQuality === "moderate") return base - 12;
  return base - 30;
}

function clampConfidence(confidence: number): number {
  return Math.max(0, Math.min(100, Math.round(confidence)));
}
