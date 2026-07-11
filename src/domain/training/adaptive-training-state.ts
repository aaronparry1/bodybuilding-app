export type AdaptiveTrainingStateId =
  | "foundation"
  | "accumulation"
  | "intensification"
  | "realisation"
  | "pivot";

export type StatePerformanceTrend = "strong_up" | "up" | "flat" | "down" | "strong_down" | "unknown";
export type ProgressionVelocity = "fast" | "steady" | "slow" | "stalled" | "regressing" | "unknown";
export type FatigueRecoverySignal = "fresh" | "stable" | "strained" | "overreached" | "unknown";
export type CompletionQuality = "high" | "moderate" | "low" | "unknown";
export type RecentTrainingContinuity = "consistent" | "interrupted" | "returning" | "unknown";
export type StateReviewStatus = "continue_allowed" | "review_required" | "escalation_required" | "fallback_required";

export interface TrainingStateExposureRule {
  minimumWeeks: number;
  minimumSessions: number;
  maximumWeeks: number;
  maximumSessions: number;
}

export interface AdaptiveTrainingStateDefinition {
  stateId: AdaptiveTrainingStateId;
  displayName: string;
  internalOnly: true;
  exposure: TrainingStateExposureRule;
  traditionalEmphasisHints: string[];
  entryCriteria: string[];
  continuationCriteria: string[];
  exitCriteria: string[];
  fallbackCriteria: string[];
}

export interface AdaptiveTrainingStateEvidence {
  currentState: AdaptiveTrainingStateId;
  stateExposureWeeks: number;
  stateExposureSessions: number;
  performanceTrend: StatePerformanceTrend;
  progressionVelocity: ProgressionVelocity;
  fatigueRecoverySignal: FatigueRecoverySignal;
  completionQuality: CompletionQuality;
  recentTrainingContinuity: RecentTrainingContinuity;
  evidenceConfidence: number;
  recentStateChangeWeeks?: number;
  recentStateChangeSessions?: number;
}

export interface AdaptiveTrainingStateAssessment {
  currentState: AdaptiveTrainingStateId;
  stateDefinition: AdaptiveTrainingStateDefinition;
  reviewStatus: StateReviewStatus;
  canContinue: boolean;
  mustReview: boolean;
  escalationRequired: boolean;
  flipFlopGuardActive: boolean;
  minimumExposureSatisfied: boolean;
  maximumExposureReached: boolean;
  eligibleNextStates: AdaptiveTrainingStateId[];
  fallbackState: AdaptiveTrainingStateId | null;
  rationale: string[];
  confidence: number;
}

const stateDefinitions: Record<AdaptiveTrainingStateId, AdaptiveTrainingStateDefinition> = {
  foundation: {
    stateId: "foundation",
    displayName: "Foundation",
    internalOnly: true,
    exposure: {
      minimumWeeks: 2,
      minimumSessions: 4,
      maximumWeeks: 6,
      maximumSessions: 18,
    },
    traditionalEmphasisHints: ["technical base", "movement quality", "general preparation"],
    entryCriteria: [
      "New, returning, interrupted, or low-confidence training evidence.",
      "Technique, completion quality, or exercise ownership needs to be established.",
    ],
    continuationCriteria: [
      "Completion quality is improving or stable.",
      "Performance evidence is not clearly regressing.",
      "Minimum exposure has not yet been satisfied.",
    ],
    exitCriteria: [
      "Minimum exposure is satisfied and evidence confidence is high enough.",
      "Completion quality is high and progression velocity is steady or better.",
      "Maximum exposure is reached and escalation review is mandatory.",
    ],
    fallbackCriteria: [
      "Interruption, low completion quality, or poor evidence quality makes higher training states unreliable.",
    ],
  },
  accumulation: {
    stateId: "accumulation",
    displayName: "Accumulation",
    internalOnly: true,
    exposure: {
      minimumWeeks: 3,
      minimumSessions: 6,
      maximumWeeks: 8,
      maximumSessions: 32,
    },
    traditionalEmphasisHints: ["hypertrophy", "volume tolerance", "work capacity"],
    entryCriteria: [
      "Foundation is established or prior evidence supports productive volume.",
      "The athlete can complete planned work with stable recovery.",
    ],
    continuationCriteria: [
      "Performance is flat or improving while completion quality remains acceptable.",
      "Workload tolerance is stable enough to keep building productive training exposure.",
    ],
    exitCriteria: [
      "Progression velocity slows after minimum exposure.",
      "Objective evidence supports intensification.",
      "Maximum exposure is reached and escalation review is mandatory.",
    ],
    fallbackCriteria: [
      "Completion quality drops, fatigue/recovery becomes strained, or progression regresses.",
    ],
  },
  intensification: {
    stateId: "intensification",
    displayName: "Intensification",
    internalOnly: true,
    exposure: {
      minimumWeeks: 2,
      minimumSessions: 4,
      maximumWeeks: 6,
      maximumSessions: 24,
    },
    traditionalEmphasisHints: ["strength", "specificity", "load ownership"],
    entryCriteria: [
      "Accumulation has produced enough base adaptation or evidence supports more specific loading.",
      "Recovery and completion quality can support higher-intensity work.",
    ],
    continuationCriteria: [
      "Performance is stable or improving with acceptable fatigue/recovery signals.",
      "Progression velocity remains steady enough to justify specific work.",
    ],
    exitCriteria: [
      "Realisation is needed for a performance expression.",
      "Progression stalls, recovery becomes strained, or maximum exposure is reached.",
    ],
    fallbackCriteria: [
      "Strained recovery, repeated completion issues, or regressing performance requires a pivot candidate.",
    ],
  },
  realisation: {
    stateId: "realisation",
    displayName: "Realisation",
    internalOnly: true,
    exposure: {
      minimumWeeks: 1,
      minimumSessions: 2,
      maximumWeeks: 3,
      maximumSessions: 10,
    },
    traditionalEmphasisHints: ["peak", "performance expression", "specificity"],
    entryCriteria: [
      "A fixed performance target or strong objective readiness evidence justifies expression.",
      "The athlete has enough prior exposure to avoid guessing readiness.",
    ],
    continuationCriteria: [
      "Performance remains stable and fatigue/recovery is not overreached.",
      "The state has not exceeded its short exposure window.",
    ],
    exitCriteria: [
      "Performance target has been expressed.",
      "Recovery risk rises or maximum exposure is reached.",
    ],
    fallbackCriteria: [
      "Any overreached signal, poor completion quality, or regressing performance requires pivot review.",
    ],
  },
  pivot: {
    stateId: "pivot",
    displayName: "Pivot",
    internalOnly: true,
    exposure: {
      minimumWeeks: 1,
      minimumSessions: 2,
      maximumWeeks: 3,
      maximumSessions: 8,
    },
    traditionalEmphasisHints: ["recovery", "resensitisation", "technical reset"],
    entryCriteria: [
      "Training needs to reduce stress, restore completion quality, or reset stale stimulus.",
      "Fallback evidence from another state indicates continuing would be poor coaching.",
    ],
    continuationCriteria: [
      "Recovery and completion quality are improving but minimum exposure has not been satisfied.",
    ],
    exitCriteria: [
      "Completion quality and recovery are stable enough to return to productive development.",
      "Maximum exposure is reached and escalation review is mandatory.",
    ],
    fallbackCriteria: [
      "If pivot cannot restore basic training quality within the maximum exposure window, manual review is required.",
    ],
  },
};

const nextStateCandidates: Record<AdaptiveTrainingStateId, AdaptiveTrainingStateId[]> = {
  foundation: ["accumulation", "pivot"],
  accumulation: ["intensification", "pivot"],
  intensification: ["realisation", "pivot", "accumulation"],
  realisation: ["pivot", "accumulation"],
  pivot: ["foundation", "accumulation"],
};

export function getAdaptiveTrainingStateDefinitions(): AdaptiveTrainingStateDefinition[] {
  return [
    stateDefinitions.foundation,
    stateDefinitions.accumulation,
    stateDefinitions.intensification,
    stateDefinitions.realisation,
    stateDefinitions.pivot,
  ].map((definition) => cloneDefinition(definition));
}

export function getAdaptiveTrainingStateDefinition(stateId: AdaptiveTrainingStateId): AdaptiveTrainingStateDefinition {
  return cloneDefinition(stateDefinitions[stateId]);
}

export function assessAdaptiveTrainingState(evidence: AdaptiveTrainingStateEvidence): AdaptiveTrainingStateAssessment {
  const definition = stateDefinitions[evidence.currentState];
  const minimumExposureSatisfied = exposureMinimumSatisfied(evidence, definition.exposure);
  const maximumExposureReached = exposureMaximumReached(evidence, definition.exposure);
  const flipFlopGuardActive = isFlipFlopGuardActive(evidence, definition.exposure);
  const evidenceConfidence = clampConfidence(evidence.evidenceConfidence);
  const fallbackState = fallbackStateFor(evidence);
  const fallbackRequired = Boolean(fallbackState) && minimumExposureSatisfied && evidenceConfidence >= 65;
  const eligibleNextStates = eligibleNextStatesFor(evidence, {
    minimumExposureSatisfied,
    maximumExposureReached,
    flipFlopGuardActive,
    fallbackState,
    evidenceConfidence,
  });

  if (maximumExposureReached) {
    return buildAssessment(evidence, definition, {
      reviewStatus: "escalation_required",
      minimumExposureSatisfied,
      maximumExposureReached,
      flipFlopGuardActive,
      fallbackState,
      eligibleNextStates,
      rationale: [
        "Maximum exposure reached; no internal training state may continue indefinitely.",
        "Mandatory review/escalation is required before continuing this state.",
      ],
      confidence: Math.max(70, evidenceConfidence),
    });
  }

  if (fallbackRequired) {
    return buildAssessment(evidence, definition, {
      reviewStatus: "fallback_required",
      minimumExposureSatisfied,
      maximumExposureReached,
      flipFlopGuardActive,
      fallbackState,
      eligibleNextStates,
      rationale: [
        "Objective evidence meets fallback criteria for the current state.",
        "The architecture can propose a safer state candidate without deciding the full block outcome.",
      ],
      confidence: evidenceConfidence,
    });
  }

  if (!minimumExposureSatisfied || flipFlopGuardActive) {
    return buildAssessment(evidence, definition, {
      reviewStatus: "continue_allowed",
      minimumExposureSatisfied,
      maximumExposureReached,
      flipFlopGuardActive,
      fallbackState,
      eligibleNextStates: [],
      rationale: [
        "Minimum exposure or anti-flip-flop guard prevents premature state change.",
        "Continue gathering objective evidence before changing state.",
      ],
      confidence: evidenceConfidence,
    });
  }

  if (eligibleNextStates.length > 0 && evidenceConfidence >= 75) {
    return buildAssessment(evidence, definition, {
      reviewStatus: "review_required",
      minimumExposureSatisfied,
      maximumExposureReached,
      flipFlopGuardActive,
      fallbackState,
      eligibleNextStates,
      rationale: [
        "Minimum exposure is satisfied and evidence confidence is high enough for review.",
        "Eligible next states are candidates only; the future block decision engine must choose.",
      ],
      confidence: evidenceConfidence,
    });
  }

  return buildAssessment(evidence, definition, {
    reviewStatus: "continue_allowed",
    minimumExposureSatisfied,
    maximumExposureReached,
    flipFlopGuardActive,
    fallbackState,
    eligibleNextStates: [],
    rationale: [
      "Evidence does not yet justify a confident state review.",
      "The current state can continue while objective evidence accumulates.",
    ],
    confidence: evidenceConfidence,
  });
}

function exposureMinimumSatisfied(evidence: AdaptiveTrainingStateEvidence, exposure: TrainingStateExposureRule): boolean {
  return evidence.stateExposureWeeks >= exposure.minimumWeeks
    && evidence.stateExposureSessions >= exposure.minimumSessions;
}

function exposureMaximumReached(evidence: AdaptiveTrainingStateEvidence, exposure: TrainingStateExposureRule): boolean {
  return evidence.stateExposureWeeks >= exposure.maximumWeeks
    || evidence.stateExposureSessions >= exposure.maximumSessions;
}

function isFlipFlopGuardActive(evidence: AdaptiveTrainingStateEvidence, exposure: TrainingStateExposureRule): boolean {
  const weeksSinceChange = evidence.recentStateChangeWeeks ?? evidence.stateExposureWeeks;
  const sessionsSinceChange = evidence.recentStateChangeSessions ?? evidence.stateExposureSessions;
  return weeksSinceChange < exposure.minimumWeeks || sessionsSinceChange < exposure.minimumSessions;
}

function eligibleNextStatesFor(
  evidence: AdaptiveTrainingStateEvidence,
  context: {
    minimumExposureSatisfied: boolean;
    maximumExposureReached: boolean;
    flipFlopGuardActive: boolean;
    fallbackState: AdaptiveTrainingStateId | null;
    evidenceConfidence: number;
  },
): AdaptiveTrainingStateId[] {
  if (!context.minimumExposureSatisfied || context.flipFlopGuardActive) return [];
  if (context.fallbackState) return [context.fallbackState];
  if (context.evidenceConfidence < 75 && !context.maximumExposureReached) return [];

  const candidates = nextStateCandidates[evidence.currentState];
  if (evidence.currentState === "foundation" && developmentEvidenceIsPositive(evidence)) return ["accumulation"];
  if (evidence.currentState === "accumulation" && accumulationReadyToIntensify(evidence)) return ["intensification"];
  if (evidence.currentState === "intensification" && intensificationReadyToRealise(evidence)) return ["realisation"];
  if (evidence.currentState === "realisation") return ["pivot"];
  if (evidence.currentState === "pivot" && pivotReadyToExit(evidence)) return ["accumulation"];
  return context.maximumExposureReached ? candidates : [];
}

function fallbackStateFor(evidence: AdaptiveTrainingStateEvidence): AdaptiveTrainingStateId | null {
  if (evidence.fatigueRecoverySignal === "overreached") return "pivot";
  if (evidence.performanceTrend === "strong_down") return "pivot";
  if (evidence.completionQuality === "low" && evidence.fatigueRecoverySignal === "strained") return "pivot";
  if (evidence.currentState !== "foundation" && evidence.recentTrainingContinuity === "returning" && evidence.completionQuality === "low") return "foundation";
  return null;
}

function developmentEvidenceIsPositive(evidence: AdaptiveTrainingStateEvidence): boolean {
  return (evidence.performanceTrend === "up" || evidence.performanceTrend === "strong_up" || evidence.performanceTrend === "flat")
    && (evidence.progressionVelocity === "steady" || evidence.progressionVelocity === "fast")
    && (evidence.completionQuality === "high" || evidence.completionQuality === "moderate")
    && (evidence.fatigueRecoverySignal === "fresh" || evidence.fatigueRecoverySignal === "stable");
}

function accumulationReadyToIntensify(evidence: AdaptiveTrainingStateEvidence): boolean {
  return (evidence.performanceTrend === "up" || evidence.performanceTrend === "strong_up" || evidence.performanceTrend === "flat")
    && (evidence.progressionVelocity === "steady" || evidence.progressionVelocity === "slow")
    && evidence.completionQuality !== "low"
    && evidence.fatigueRecoverySignal !== "overreached";
}

function intensificationReadyToRealise(evidence: AdaptiveTrainingStateEvidence): boolean {
  return (evidence.performanceTrend === "up" || evidence.performanceTrend === "strong_up")
    && (evidence.progressionVelocity === "slow" || evidence.progressionVelocity === "steady")
    && evidence.completionQuality === "high"
    && (evidence.fatigueRecoverySignal === "fresh" || evidence.fatigueRecoverySignal === "stable");
}

function pivotReadyToExit(evidence: AdaptiveTrainingStateEvidence): boolean {
  return (evidence.fatigueRecoverySignal === "fresh" || evidence.fatigueRecoverySignal === "stable")
    && (evidence.completionQuality === "high" || evidence.completionQuality === "moderate")
    && evidence.recentTrainingContinuity !== "interrupted";
}

function buildAssessment(
  evidence: AdaptiveTrainingStateEvidence,
  definition: AdaptiveTrainingStateDefinition,
  result: {
    reviewStatus: StateReviewStatus;
    minimumExposureSatisfied: boolean;
    maximumExposureReached: boolean;
    flipFlopGuardActive: boolean;
    fallbackState: AdaptiveTrainingStateId | null;
    eligibleNextStates: AdaptiveTrainingStateId[];
    rationale: string[];
    confidence: number;
  },
): AdaptiveTrainingStateAssessment {
  return {
    currentState: evidence.currentState,
    stateDefinition: cloneDefinition(definition),
    reviewStatus: result.reviewStatus,
    canContinue: result.reviewStatus === "continue_allowed",
    mustReview: result.reviewStatus !== "continue_allowed",
    escalationRequired: result.reviewStatus === "escalation_required",
    flipFlopGuardActive: result.flipFlopGuardActive,
    minimumExposureSatisfied: result.minimumExposureSatisfied,
    maximumExposureReached: result.maximumExposureReached,
    eligibleNextStates: [...result.eligibleNextStates],
    fallbackState: result.fallbackState,
    rationale: result.rationale,
    confidence: clampConfidence(result.confidence),
  };
}

function cloneDefinition(definition: AdaptiveTrainingStateDefinition): AdaptiveTrainingStateDefinition {
  return {
    ...definition,
    exposure: { ...definition.exposure },
    traditionalEmphasisHints: [...definition.traditionalEmphasisHints],
    entryCriteria: [...definition.entryCriteria],
    continuationCriteria: [...definition.continuationCriteria],
    exitCriteria: [...definition.exitCriteria],
    fallbackCriteria: [...definition.fallbackCriteria],
  };
}

function clampConfidence(confidence: number): number {
  return Math.max(0, Math.min(100, Math.round(confidence)));
}
