import {
  explicitEvidenceDrivers,
  buildDetailedEvidence,
  evidenceConfidenceScore,
  hasRecoverThresholdEvidence,
  hasHiddenOverreachDetail,
  hasHighEvidenceConfidence,
  hasHighWorkloadDensityWarning,
  hasLocalPainPriorityDetail,
  hasLowEvidenceConfidence,
  hasMultipleExerciseDecline,
  hasPositivePushSignal,
  hasRecentMissedMinimumRange,
  hasRecentShutdownOrPain,
  hasPlannedConsolidation,
  hasPostSwapSingleExposure,
  hasRecoveryCompression,
  hasRepeatedAboveRangeDetail,
  hasSingleAboveRangeDetail,
  hasSwapOrNewExerciseUncertainty,
  hasStructuralStressManagementIssue,
  hasStimulusManagementDetail,
  hasUnconfirmedRecentPush,
  inferFatigueLevel,
  inferLocalEvidenceSignals,
  inferPerformanceDirection,
  qualityLevelForEvidence,
  sameExerciseSuccessfulExposureCount,
  successfulComparableExposureCount,
  usesDerivedStateFreeEvidence,
  usesFullyDerivedQualityEvidence,
} from "./evidence_detail.mjs";
import { meaningfulLoadPushAllowed } from "./load_ownership_v0_1.mjs";
import { evaluatePushDecisionPolicy, fallbackForPushPolicy } from "./push_decision_policy_v0_3.mjs";

const RECOMMENDATION_TYPES = new Set(["push", "hold", "consolidate", "reduce", "recover", "substitute", "stop_movement", "stop_session"]);
const AGGRESSIVENESS = new Set(["very_low", "low", "moderate", "high"]);

export function createCoachingRecommendation({ athlete, evidence, coachingState, safetyGate }) {
  const draft = chooseRecommendation({ athlete, evidence, coachingState, safetyGate });
  const recommendation = {
    scenario_id: evidence.id,
    athlete_profile_id: athlete.id,
    status: "draft_research_output",
    recommendation_type: draft.recommendation_type,
    aggressiveness: draft.aggressiveness,
    push_category: draft.push_category ?? null,
    primary_intervention: draft.primary_intervention,
    secondary_interventions: draft.secondary_interventions,
    blocked_interventions: buildBlockedInterventions({ safetyGate, draft }),
    rationale: buildRationale({ athlete, evidence, coachingState, safetyGate, draft }),
    user_message: userMessageFor(draft.recommendation_type),
    confidence: confidenceFor({ evidence, coachingState, safetyGate, draft }),
    charter_alignment: buildCharterAlignment(draft.recommendation_type),
    safety_gate_status: safetyGate.status,
    evidence_sources: buildEvidenceSources({ evidence, coachingState, safetyGate, draft }),
    open_questions: buildOpenQuestions({ evidence, draft }),
  };

  validateRecommendation(recommendation);
  return recommendation;
}

function chooseRecommendation({ athlete, evidence, coachingState, safetyGate }) {
  if (safetyGate.status === "stop") {
    const sessionWide = shouldStopSession(evidence, safetyGate);
    return {
      recommendation_type: sessionWide ? "stop_session" : "stop_movement",
      aggressiveness: "very_low",
      primary_intervention: sessionWide ? "Stop the session and avoid further training today." : "Stop the affected movement or pattern for today.",
      secondary_interventions: [
        "Keep any remaining work limited to unaffected, comfortable movement only.",
        "Use calm safety guidance and avoid medical diagnosis.",
      ],
    };
  }

  if (safetyGate.status === "restrict") {
    if (isHiddenOverreach(evidence) && inferPerformanceDirection(evidence) !== "declining") {
      return {
        recommendation_type: "consolidate",
        aggressiveness: "low",
        primary_intervention: "Hold the recent progress and stop adding stress for now.",
        secondary_interventions: ["Hidden overreach means do not push.", "Do not reduce aggressively unless objective performance clearly declines."],
      };
    }
    if (hasLocalPainPriority(evidence, safetyGate)) {
      return {
        recommendation_type: "reduce",
        aggressiveness: "low",
        primary_intervention: "Localise the response to the painful movement before changing the whole programme.",
        secondary_interventions: ["Reduce or substitute the affected pattern.", "Avoid treating local pain as generic systemic fatigue."],
      };
    }
    if (hasRecoverThresholdEvidence(evidence, coachingState)) {
      return {
        recommendation_type: "recover",
        aggressiveness: "very_low",
        primary_intervention: "Use a recovery-biased prescription because fatigue is systemic, not local.",
        secondary_interventions: ["Preserve movement quality.", "Do not chase load or volume while multiple patterns are down."],
      };
    }
    if (usesFullyDerivedQualityEvidence(evidence) && hasMultipleExerciseDecline(evidence)) {
      return {
        recommendation_type: "consolidate",
        aggressiveness: "low",
        primary_intervention: "Consolidate instead of prescribing full recovery until systemic evidence is stronger.",
        secondary_interventions: ["Multiple patterns need caution.", "Thin or compressed evidence should not trigger whole-programme recovery."],
      };
    }
    if (hasRepeatedCollapse(evidence) || hasTechniqueLimit(evidence)) {
      return {
        recommendation_type: hasTechniqueLimit(evidence) ? "substitute" : "reduce",
        aggressiveness: hasTechniqueLimit(evidence) ? "very_low" : "low",
        primary_intervention: hasTechniqueLimit(evidence)
          ? "Use a conservative substitution for the affected movement pattern."
          : "Reduce the affected movement stress and keep the correction local.",
        secondary_interventions: ["Block load increases for the affected area.", "Keep unaffected work controlled."],
      };
    }
    if (hasStimulusManagementIssue(evidence)) {
      return {
        recommendation_type: "reduce",
        aggressiveness: "low",
        primary_intervention: "Reduce the stress cost of the current training structure.",
        secondary_interventions: ["Trim compound density or high-frequency exposure.", "Use lower-fatigue choices before treating this as a recovery emergency."],
      };
    }
    if (safetyGate.affected_areas.includes("systemic") && (!usesFullyDerivedQualityEvidence(evidence) || hasRecoverThresholdEvidence(evidence, coachingState))) {
      return {
        recommendation_type: "recover",
        aggressiveness: "very_low",
        primary_intervention: "Use a recovery-biased prescription and avoid aggressive training stress.",
        secondary_interventions: ["Block PR attempts and affected-pattern load increases.", "Prefer lower-fatigue work if training continues."],
      };
    }
    return {
      recommendation_type: "reduce",
      aggressiveness: "very_low",
      primary_intervention: "Reduce stress for the affected area and avoid aggressive progression.",
      secondary_interventions: ["Use conservative alternatives if needed.", "Monitor the next comparable workload."],
    };
  }

  if (coachingState.evidence_quality < 45 || qualityLevelForEvidence(evidence) === "low") {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Hold the prescription and collect clearer evidence.",
      secondary_interventions: ["Keep the session simple.", "Avoid major coaching changes from sparse evidence."],
    };
  }

  if (safetyGate.status === "caution") {
    if (isLocalLiftFailure(evidence)) {
      return {
        recommendation_type: "reduce",
        aggressiveness: "low",
        primary_intervention: "Adjust the local movement only and keep unrelated training stable.",
        secondary_interventions: ["Avoid load increases for the affected lift.", "Monitor the next comparable set or session."],
      };
    }
    if (hasHighTechniqueLimit(evidence)) {
      return {
        recommendation_type: "substitute",
        aggressiveness: "low",
        primary_intervention: "Use a lower-risk alternative or technique-focused exposure for the affected movement.",
        secondary_interventions: ["Do not push load while technique is limiting the lift.", "Keep the issue local rather than rewriting the whole programme."],
      };
    }
    if (hasTechniqueLimit(evidence)) {
      return {
        recommendation_type: "reduce",
        aggressiveness: "low",
        primary_intervention: "Keep the movement conservative while technique quality catches up.",
        secondary_interventions: ["Avoid load increases for the affected lift.", "Use a simpler exposure before changing the whole exercise."],
      };
    }
    if (isHiddenOverreach(evidence) && inferPerformanceDirection(evidence) !== "declining") {
      return {
        recommendation_type: "consolidate",
        aggressiveness: "low",
        primary_intervention: "Hold the progress steady and avoid adding stress while fatigue signals settle.",
        secondary_interventions: ["Hidden overreach means do not push.", "Avoid a heavy back-off unless performance clearly declines."],
      };
    }
    if (hasStimulusManagementIssue(evidence)) {
      return {
        recommendation_type: "reduce",
        aggressiveness: "low",
        primary_intervention: "Reduce the stress cost of the current training structure.",
        secondary_interventions: ["Trim compound density or high-frequency exposure.", "Use lower-fatigue choices before treating this as a recovery emergency."],
      };
    }
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Keep the work controlled while monitoring the concern.",
      secondary_interventions: ["Avoid aggressive progression today.", "Let objective evidence confirm the next step."],
    };
  }

  if (needsConsolidationBeforePush(evidence)) {
    return {
      recommendation_type: "consolidate",
      aggressiveness: "low",
      primary_intervention: "Consolidate the recent change before adding more stress.",
      secondary_interventions: ["One improved exposure proves the change helped, not that acceleration is earned.", "Let the next comparable session confirm it."],
    };
  }

  if (coachingState.adaptation >= 70 && coachingState.recovery_capacity < 45) {
    return {
      recommendation_type: "consolidate",
      aggressiveness: "low",
      primary_intervention: "Hold recent progress steady and let recovery capacity catch up.",
      secondary_interventions: ["Avoid adding load or volume.", "Use controlled execution as the win."],
    };
  }

  if (hasProductiveFatigue(evidence)) {
    return {
      recommendation_type: "consolidate",
      aggressiveness: "low",
      primary_intervention: "Recognise the heavier-load progress and consolidate at the new level.",
      secondary_interventions: ["Do not classify expected fatigue as failure.", "Avoid another aggressive jump immediately."],
    };
  }

  if (hasStructuralStressManagementIssue(evidence)) {
    return {
      recommendation_type: "reduce",
      aggressiveness: "low",
      primary_intervention: "Reduce the stress density without treating it as a whole-programme recovery emergency.",
      secondary_interventions: ["Trim high-fatigue clustering or compound density.", "Keep the intervention local to the training structure."],
    };
  }

  if (hasLowEvidenceConfidence(evidence) && safetyGate.status === "clear") {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Hold the prescription until the evidence is clearer.",
      secondary_interventions: ["Low evidence confidence blocks aggressive action.", "Collect another comparable exposure before pushing or backing off."],
    };
  }

  if (isSystemicFatigue(evidence, coachingState)) {
    return {
      recommendation_type: "recover",
      aggressiveness: "very_low",
      primary_intervention: "Use recovery-biased training to reduce accumulated fatigue.",
      secondary_interventions: ["Preserve movement quality.", "Do not chase load or volume while systemic evidence is down."],
    };
  }

  if (coachingState.momentum < 45 && coachingState.recovery_capacity >= 65) {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Create a clear, manageable win without forcing load.",
      secondary_interventions: ["Use an achievable rep or technique target.", "Keep the session finishable."],
    };
  }

  if (coachingState.confidence < 45 && ["stable", "mixed"].includes(inferPerformanceDirection(evidence))) {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Simplify the next exposure and build a clean success.",
      secondary_interventions: ["Avoid big deloads unless objective evidence worsens.", "Keep feedback positive and specific."],
    };
  }

  if (isSingleAboveRangeSignal(evidence)) {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Hold the prescription until above-range performance repeats.",
      secondary_interventions: ["Treat one above-range set as promising, not enough to push.", "Let stronger evidence earn the next progression."],
    };
  }

  if (isExcellentState(coachingState) && safetyGate.status === "clear") {
    const pushCheck = pushEligibility({ athlete, evidence, coachingState, safetyGate });
    if (!pushCheck.eligible) {
      return {
        recommendation_type: pushCheck.fallback,
        aggressiveness: "low",
        primary_intervention: "Hold until excellent performance is backed by enough comparable evidence.",
        secondary_interventions: [
          "Push requires high-confidence repeated same-exercise success.",
          `Push withheld: ${pushCheck.reasons.join("; ")}.`,
          "Let the evidence earn the next increase.",
        ],
        push_withheld_reasons: pushCheck.reasons,
      };
    }
    const pushPolicy = evaluatePushDecisionPolicy({ athlete, evidence, coachingState, safetyGate });
    if (!pushPolicy.eligible) {
      return {
        recommendation_type: fallbackForPushPolicy(pushPolicy),
        aggressiveness: "low",
        primary_intervention: "Hold until the push is goal-specific, context-specific, and evidence-earned.",
        secondary_interventions: [
          "Push Decision Policy blocked a generic push.",
          `Policy blocked: ${pushPolicy.blocked_reasons.join("; ")}.`,
          "No push type is automatically safe.",
        ],
        push_withheld_reasons: pushPolicy.blocked_reasons,
        push_policy: pushPolicy,
      };
    }
    return {
      recommendation_type: "push",
      aggressiveness: "moderate",
      push_category: pushPolicy.recommended_push_type,
      primary_intervention: primaryInterventionForPush(pushPolicy.recommended_push_type),
      secondary_interventions: [...secondaryInterventionsForPush(pushPolicy.recommended_push_type), ...pushPolicy.advisory_notes],
      push_policy: pushPolicy,
    };
  }

  if (coachingState.adaptation >= 65 && coachingState.recovery_capacity >= 55) {
    return {
      recommendation_type: "hold",
      aggressiveness: "low",
      primary_intervention: "Own the current work before adding more stress.",
      secondary_interventions: ["Let repeatable performance confirm the next push.", "Protect confidence and momentum."],
    };
  }

  return {
    recommendation_type: "hold",
    aggressiveness: "low",
    primary_intervention: "Hold and gather clearer evidence.",
    secondary_interventions: ["Avoid unnecessary changes.", "Keep the next session simple and finishable."],
  };
}

function shouldStopSession(evidence, safetyGate) {
  const flag = evidence.subjectiveContext?.safetyFlag ?? "none";
  const hasWholeBodyStop = inferLocalEvidenceSignals(evidence).some((signal) => signal.lift === "all" && safetyGate.status === "stop");
  return hasWholeBodyStop || ["dizziness", "unusual_symptoms", "unsafe", "medical_red_flag"].includes(flag);
}

function buildBlockedInterventions({ safetyGate, draft }) {
  const blocked = new Set(safetyGate.blocked_actions);

  if (draft.recommendation_type !== "push") {
    blocked.add("aggressive load increase");
  }
  if (safetyGate.status === "restrict") {
    blocked.add("extra volume");
    blocked.add("high-fatigue movement selection");
  }
  if (safetyGate.status === "stop") {
    blocked.add("progression for affected movement");
    blocked.add("affected-pattern loading");
  }

  return Array.from(blocked);
}

function buildRationale({ athlete, evidence, coachingState, safetyGate, draft }) {
  const rationale = [
    `Athlete profile: ${athlete.label}.`,
    `Coaching State: adaptation ${coachingState.adaptation}, recovery_capacity ${coachingState.recovery_capacity}, momentum ${coachingState.momentum}, confidence ${coachingState.confidence}, opportunity ${coachingState.coaching_opportunity}.`,
    `Safety Gate is ${safetyGate.status}${safetyGate.veto ? " with veto active" : ""}.`,
  ];

  if (safetyGate.status === "stop") rationale.push("Safety Gate has priority over otherwise productive training evidence.");
  if (safetyGate.status === "restrict") rationale.push("Restrict blocks aggressive actions while still allowing conservative alternatives.");
  if (draft.recommendation_type === "push") rationale.push("Excellent state and clear safety allow a small controlled push.");
  if (draft.push_category) rationale.push(`Push category: ${draft.push_category}.`);
  if (draft.push_policy?.rationale?.length) rationale.push(`Push Decision Policy: ${draft.push_policy.rationale.join(" ")}`);
  if (draft.push_withheld_reasons?.length) rationale.push(`Push withheld because ${draft.push_withheld_reasons.join("; ")}.`);
  if (draft.recommendation_type === "consolidate") rationale.push("The goal is to keep progress while avoiding unnecessary fatigue.");
  if (draft.recommendation_type === "recover") rationale.push("Systemic fatigue evidence is broader than one local lift.");
  if (draft.recommendation_type === "reduce") rationale.push("The issue is local enough to adjust the affected movement without rewriting the whole programme.");
  if (draft.recommendation_type === "hold") rationale.push("Holding is the smallest effective intervention while evidence clarifies.");
  if (hasProductiveFatigue(evidence)) rationale.push("Productive fatigue inside range is recognised as progress, not failure.");
  if (evidence.subjectiveContext) rationale.push("Subjective context was considered but did not dominate objective training evidence unless safety-relevant.");

  return rationale;
}

function userMessageFor(type) {
  switch (type) {
    case "push":
      return "You're adapting well. We'll make a small push today and keep it controlled.";
    case "consolidate":
      return "You've earned the progress. We'll hold steady and let it stick.";
    case "reduce":
      return "This looks too heavy for today. We'll reduce the load and keep the work productive.";
    case "recover":
      return "Your recent training suggests fatigue is building. A lighter approach should help keep momentum moving.";
    case "substitute":
      return "We'll avoid pushing this area today and choose a safer option.";
    case "stop_movement":
      return "Stop this movement for today. We'll avoid pushing this area.";
    case "stop_session":
      return "Stop training for today. If symptoms are sharp, worsening or unusual, seek professional advice.";
    case "hold":
    default:
      return "You're progressing. Today is about owning the work, not forcing more.";
  }
}

function confidenceFor({ evidence, coachingState, safetyGate, draft }) {
  const quality = qualityLevelForEvidence(evidence);
  let confidence = 35;
  confidence += Math.round(coachingState.evidence_quality * 0.28);
  confidence += Math.round(safetyGate.confidence * 0.18);
  if (quality === "high") confidence += 12;
  if (quality === "low") confidence -= 10;
  if (safetyGate.status === "stop" || safetyGate.status === "restrict") confidence += 8;
  if (draft.recommendation_type === "hold") confidence += 4;
  if (hasLowEvidenceConfidence(evidence)) confidence -= 14;
  if (hasHighEvidenceConfidence(evidence)) confidence += 8;
  if (draft.recommendation_type === "push") {
    const evidenceScore = evidenceConfidenceScore(evidence);
    confidence = Math.min(confidence, evidenceScore >= 95 ? 85 : 75);
  }
  if (draft.push_withheld_reasons?.length) confidence = Math.min(confidence, 82);
  return Math.max(0, Math.min(100, confidence));
}

function buildCharterAlignment(type) {
  const shared = {
    long_term_progress: "prioritised",
    adaptation: "supported without treating performance as the only objective",
    recovery: "protected by avoiding unnecessary fatigue cost",
    confidence: "protected through manageable next steps",
    enjoyment: "protected by keeping the recommendation simple and non-dramatic",
    momentum: "protected by preserving a clear path forward",
    notes: [],
  };

  if (type === "push") shared.notes.push("Push remains small and earned.");
  if (type === "recover") shared.notes.push("Recovery is treated as productive when systemic evidence warrants it.");
  if (type === "stop_movement" || type === "stop_session") shared.notes.push("Safety veto protects long-term training integrity.");
  if (type === "consolidate") shared.notes.push("Progress is allowed to stick before adding more stress.");
  if (type === "reduce" || type === "substitute") shared.notes.push("Local problems are handled locally when possible.");
  if (type === "hold") shared.notes.push("The smallest effective intervention is no unnecessary change.");

  return shared;
}

function buildEvidenceSources({ evidence, coachingState, safetyGate, draft }) {
  return [
    `scenario:${evidence.id}`,
    `coaching_state:adaptation:${coachingState.adaptation}`,
    `coaching_state:recovery_capacity:${coachingState.recovery_capacity}`,
    `coaching_state:momentum:${coachingState.momentum}`,
    `coaching_state:confidence:${coachingState.confidence}`,
    `coaching_state:evidence_quality:${coachingState.evidence_quality}`,
    `safety_gate:${safetyGate.status}`,
    ...safetyGate.evidence_sources,
    ...explicitEvidenceDrivers(evidence).map((driver) => `explicit:${driver}`),
    `decision_rule:${draft.recommendation_type}`,
  ];
}

function buildOpenQuestions({ evidence, draft }) {
  return [
    "Aaron approval required: are these recommendation_type labels the right durable internal vocabulary?",
    "Aaron approval required: should stop_session include severe/worsening pain by default, or reserve session stop only for systemic symptoms?",
    "Aaron approval required: should push ever reach high aggressiveness in V2, or should high be unavailable until much later validation?",
    `Research question: what production evidence threshold is required before '${draft.recommendation_type}' could affect real users?`,
    `Research question: does ${evidence.id} need a human-review state before production automation?`,
  ];
}

function isExcellentState(state) {
  return (
    state.adaptation >= 75 &&
    state.recovery_capacity >= 80 &&
    state.momentum >= 75 &&
    state.confidence >= 70 &&
    state.coaching_opportunity >= 70
  );
}

function hasPushThresholdEvidence({ athlete = null, evidence, coachingState, safetyGate }) {
  return pushEligibility({ athlete, evidence, coachingState, safetyGate }).eligible;
}

function pushEligibility({ athlete, evidence, coachingState, safetyGate }) {
  const reasons = [];
  const evidenceScore = evidenceConfidenceScore(evidence);
  const sameExerciseExposures = sameExerciseSuccessfulExposureCount(evidence);
  const comparableExposures = usesFullyDerivedQualityEvidence(evidence) ? sameExerciseExposures : successfulComparableExposureCount(evidence);

  if (safetyGate.status !== "clear") reasons.push("Safety Gate is not clear");
  if (evidenceScore < 90) reasons.push(`evidence quality ${evidenceScore} is below 90`);
  if (sameExerciseExposures < 3) reasons.push(`same-exercise successful exposures ${sameExerciseExposures} is below 3`);
  if (comparableExposures < 3) reasons.push(`successful comparable exposures ${comparableExposures} is below 3`);
  if (hasRecentShutdownOrPain(evidence)) reasons.push("recent shutdown or pain flag exists");
  if (hasRecentMissedMinimumRange(evidence)) reasons.push("recent missed minimum range exists");
  if (hasSwapOrNewExerciseUncertainty(evidence)) reasons.push("swap or new-exercise uncertainty exists");
  if (coachingState.recovery_capacity < 80) reasons.push(`recovery capacity ${coachingState.recovery_capacity} is below 80`);
  if (coachingState.momentum < 75) reasons.push(`momentum ${coachingState.momentum} is below 75`);
  if (coachingState.adaptation < 75) reasons.push(`adaptation ${coachingState.adaptation} is below 75`);
  if (coachingState.confidence < 70) reasons.push(`confidence ${coachingState.confidence} is below 70`);
  if (!hasPositivePushSignal(evidence)) reasons.push("no repeated positive push signal");
  if (!goalProgressSupportsPush({ athlete, evidence })) reasons.push("goal-progress evidence is not strong enough to support a push");
  if (hasRecoveryCompression(evidence)) reasons.push("recent recovery compression exists");
  if (hasHighWorkloadDensityWarning(evidence)) reasons.push("high workload density warning exists");

  const fallback = reasons.some((reason) =>
    reason.includes("recovery") ||
    reason.includes("workload") ||
    reason.includes("shutdown") ||
    reason.includes("pain") ||
    reason.includes("missed minimum")
  ) ? "consolidate" : "hold";

  return { eligible: reasons.length === 0, reasons, fallback };
}

function goalProgressSupportsPush({ athlete, evidence }) {
  const goal = athlete?.goal ?? "unknown";
  const goalEvidence = evidence.goalProgressEvidence;
  if (!goalEvidence) return true;

  if (goal === "get_lean") {
    return false;
  }

  if (goal === "build_muscle" || goal === "hypertrophy") {
    return goalEvidence.qualityVolume?.totalQualityVolumeTrend === "improving";
  }

  if (goal === "build_muscle_strength" || goal === "strength_hypertrophy") {
    const strengthImproving = (goalEvidence.strengthMetrics ?? []).some((item) => item.estimatedStrengthTrend === "improving");
    const qualityImproving = goalEvidence.qualityVolume?.totalQualityVolumeTrend === "improving";
    return strengthImproving && qualityImproving;
  }

  if (goal === "athletic_performance") {
    return evidence.pushReadiness?.performanceMilestoneOpportunity === true &&
      (goalEvidence.athleticMetrics ?? []).some((item) => item.trend === "improving");
  }

  if (goal === "strength" || goal === "powerlifting") {
    const primary = new Set(["competition_squat", "competition_bench_press", "competition_deadlift"]);
    return (goalEvidence.strengthMetrics ?? []).some((item) => primary.has(item.exercise) && item.estimatedStrengthTrend === "improving");
  }

  return true;
}

function pushCategoryFor({ athlete, evidence, coachingState }) {
  const evidenceScore = evidenceConfidenceScore(evidence);
  const sameExerciseExposures = sameExerciseSuccessfulExposureCount(evidence);
  if (isPerformancePushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures })) return "performance_push";
  if (isLoadPushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures })) return "load_push";
  if (isVolumePushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures })) return "volume_push";
  return "micro_push";
}

function primaryInterventionForPush(category) {
  if (category === "performance_push") return "Schedule a controlled milestone attempt with clear stop rules.";
  if (category === "load_push") return "Increase the actual load by the smallest sensible jump.";
  if (category === "volume_push") return "Add a small amount of productive work without increasing load.";
  return "Make the smallest effective push.";
}

function secondaryInterventionsForPush(category) {
  if (category === "performance_push") {
    return ["Keep the attempt deliberate, not reactive.", "Stop if performance or safety evidence changes.", "Do not turn the whole session into a max-out."];
  }
  if (category === "load_push") {
    return ["Use the smallest available load jump.", "Keep volume stable.", "Require the new load to be owned before pushing again."];
  }
  if (category === "volume_push") {
    return ["Add one small productive exposure.", "Keep workload density controlled.", "Do not add volume if recovery pressure appears."];
  }
  return ["Default to a micro-push.", "Load pushes require exceptional evidence.", "Keep the push controlled."];
}

function isVolumePushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures }) {
  const goal = athlete?.goal ?? "unknown";
  const detail = buildDetailedEvidence(evidence);
  const readiness = evidence.pushReadiness ?? {};
  const quality = evidence.goalProgressEvidence?.qualityVolume ?? {};
  const goalAllowsVolume = ["build_muscle", "hypertrophy", "build_muscle_strength", "strength_hypertrophy"].includes(goal);
  const volumeToleranceHigh = readiness.qualityVolumeTolerance === "high" || quality.totalQualityVolumeTrend === "improving";
  const targetCompletion = quality.targetRangeCompletionRate ?? targetRangeCompletionRate(detail);
  const recoveryCostAcceptable = quality.recoveryCost !== "high";

  return (
    goalAllowsVolume &&
    evidenceScore >= 95 &&
    sameExerciseExposures >= 4 &&
    coachingState.recovery_capacity >= 84 &&
    coachingState.momentum >= 78 &&
    volumeToleranceHigh &&
    targetCompletion >= 0.88 &&
    recoveryCostAcceptable &&
    !hasHighWorkloadDensityWarning(evidence) &&
    !hasRecoveryCompression(evidence)
  );
}

function isLoadPushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures }) {
  const goal = athlete?.goal ?? "unknown";
  const detail = buildDetailedEvidence(evidence);
  const readiness = evidence.pushReadiness ?? {};
  const goalAllowsLoad = ["strength", "powerlifting", "build_muscle_strength", "strength_hypertrophy"].includes(goal);
  const topEndSuccesses = maxTopEndSuccesses(detail, readiness);
  const sensibleJump = readiness.loadJump === "small_sensible" || detail.exerciseHistory.some((item) => (item.loadEvents ?? []).includes("small_sensible_increase_available"));
  const strengthSupport = (evidence.goalProgressEvidence?.strengthMetrics ?? []).some((item) =>
    ["competition_squat", "competition_bench_press", "competition_deadlift", "standing_overhead_press"].includes(item.exercise) &&
    item.estimatedStrengthTrend === "improving" &&
    (item.comparableExposures ?? 0) >= 3
  );

  return (
    goalAllowsLoad &&
    evidenceScore >= 96 &&
    sameExerciseExposures >= 3 &&
    topEndSuccesses >= 3 &&
    sensibleJump &&
    strengthSupport &&
    loadOwnershipAllowsMeaningfulPush(evidence) &&
    coachingState.recovery_capacity >= 82 &&
    coachingState.momentum >= 78 &&
    !hasHighWorkloadDensityWarning(evidence) &&
    !hasRecoveryCompression(evidence)
  );
}

function isPerformancePushEligible({ athlete, evidence, coachingState, evidenceScore, sameExerciseExposures }) {
  const readiness = evidence.pushReadiness ?? {};
  const goal = athlete?.goal ?? "unknown";
  const goalAllowsPerformance = ["strength", "powerlifting", "athletic_performance"].includes(goal);
  const stableBlockWeeks = readiness.stableBlockWeeks ?? 0;
  const milestone = readiness.performanceMilestoneOpportunity === true;
  const longBlock = stableBlockWeeks >= 8;
  const exceptionalState = coachingState.recovery_capacity >= 90 && coachingState.momentum >= 88 && coachingState.confidence >= 78;

  return (
    goalAllowsPerformance &&
    milestone &&
    longBlock &&
    evidenceScore >= 97 &&
    sameExerciseExposures >= 5 &&
    exceptionalState &&
    loadOwnershipAllowsMeaningfulPush(evidence) &&
    !hasHighWorkloadDensityWarning(evidence) &&
    !hasRecoveryCompression(evidence)
  );
}

function loadOwnershipAllowsMeaningfulPush(evidence) {
  const state = evidence.loadOwnership?.state;
  if (!state) return true;
  return meaningfulLoadPushAllowed({ ownership: { state } });
}

function targetRangeCompletionRate(detail) {
  const records = detail.exerciseHistory.filter((item) => typeof item.withinRange === "boolean");
  if (!records.length) return 0;
  return records.filter((item) => item.withinRange && item.belowMinimumEvents === 0 && item.shutdowns === 0).length / records.length;
}

function maxTopEndSuccesses(detail, readiness) {
  const explicit = readiness.topEndTargetRangeSuccesses ?? 0;
  const fromExercises = detail.exerciseHistory.reduce((max, item) => Math.max(max, item.aboveRangeEvents ?? 0, item.repeatedSuccessfulExposuresAtLoad ?? 0), 0);
  return Math.max(explicit, fromExercises);
}

function isSystemicFatigue(evidence, state) {
  if (usesFullyDerivedQualityEvidence(evidence)) return hasRecoverThresholdEvidence(evidence, state);
  return (
    hasMultipleExerciseDecline(evidence) ||
    (state.recovery_capacity <= 25 && state.momentum <= 35) ||
    (inferPerformanceDirection(evidence) === "declining" && inferFatigueLevel(evidence) === "high")
  );
}

function isLocalLiftFailure(evidence) {
  return inferLocalEvidenceSignals(evidence).some((signal) => signal.signal === "below_range") && !hasMultipleExerciseDecline(evidence);
}

function hasProductiveFatigue(evidence) {
  return inferLocalEvidenceSignals(evidence).some((signal) => signal.signal === "productive_fatigue");
}

function isSingleAboveRangeSignal(evidence) {
  if (evidence.exerciseHistory || evidence.evidenceConfidence) return hasSingleAboveRangeDetail(evidence) && !hasRepeatedAboveRangeDetail(evidence);
  const meaningfulSignals = inferLocalEvidenceSignals(evidence).filter((signal) => signal.signal && signal.signal !== "none");
  const aboveRangeSignals = meaningfulSignals.filter((signal) => signal.signal === "above_range");
  return (
    aboveRangeSignals.length === 1 &&
    meaningfulSignals.length === 1 &&
    !hasMultipleExerciseDecline(evidence)
  );
}

function hasRepeatedCollapse(evidence) {
  return inferLocalEvidenceSignals(evidence).some((signal) => signal.signal === "same_load_collapse" || signal.signal === "repeated_shutdown");
}

function hasTechniqueLimit(evidence) {
  return inferLocalEvidenceSignals(evidence).some((signal) => signal.signal === "technique_limit");
}

function hasHighTechniqueLimit(evidence) {
  return inferLocalEvidenceSignals(evidence).some((signal) => signal.signal === "technique_limit" && signal.severity === "high");
}

function needsConsolidationBeforePush(evidence) {
  return hasPlannedConsolidation(evidence) || hasPostSwapSingleExposure(evidence) || hasUnconfirmedRecentPush(evidence);
}

function hasStimulusManagementIssue(evidence) {
  return hasStimulusManagementDetail(evidence);
}

function isHiddenOverreach(evidence) {
  return hasHiddenOverreachDetail(evidence);
}

function hasLocalPainPriority(evidence, safetyGate) {
  return hasLocalPainPriorityDetail(evidence, safetyGate);
}

function validateRecommendation(item) {
  if (!RECOMMENDATION_TYPES.has(item.recommendation_type)) throw new Error(`Invalid recommendation_type ${item.recommendation_type}`);
  if (!AGGRESSIVENESS.has(item.aggressiveness)) throw new Error(`Invalid aggressiveness ${item.aggressiveness}`);
  if (!Number.isInteger(item.confidence) || item.confidence < 0 || item.confidence > 100) throw new Error(`Invalid confidence ${item.confidence}`);
  if (!item.primary_intervention) throw new Error("Missing primary intervention");
  if (!item.user_message) throw new Error("Missing user message");
  if (!Array.isArray(item.rationale) || item.rationale.length === 0) throw new Error("Missing rationale");
}
