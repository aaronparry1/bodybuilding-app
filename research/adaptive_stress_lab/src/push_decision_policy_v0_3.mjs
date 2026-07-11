import {
  buildDetailedEvidence,
  evidenceConfidenceScore,
  hasHighWorkloadDensityWarning,
  hasPositivePushSignal,
  hasRecentMissedMinimumRange,
  hasRecentShutdownOrPain,
  hasRecoveryCompression,
  hasSwapOrNewExerciseUncertainty,
  sameExerciseSuccessfulExposureCount,
} from "./evidence_detail.mjs";
import { meaningfulLoadPushAllowed } from "./load_ownership_v0_1.mjs";

const PUSH_TYPES = new Set(["none", "micro_push", "volume_push", "load_push", "performance_push"]);

export function evaluatePushDecisionPolicy({ athlete, evidence, coachingState, safetyGate }) {
  const blocked = baseBlockedReasons({ evidence, coachingState, safetyGate });
  const advisory = advisoryNotesFor({ athlete, evidence });
  if (blocked.length > 0) {
    return policyResult({
      eligible: false,
      recommended_push_type: "none",
      confidence: confidenceForPolicy({ evidence, coachingState, blocked }),
      blocked_reasons: blocked,
      rationale: ["Push blocked by base safety/evidence policy.", ...blocked],
      advisory_notes: advisory,
    });
  }

  const goal = athlete?.goal ?? "unknown";
  const typeChecks = [
    performancePushPolicy({ athlete, evidence, coachingState }),
    loadPushPolicy({ athlete, evidence, coachingState }),
    volumePushPolicy({ athlete, evidence, coachingState }),
    microPushPolicy({ athlete, evidence, coachingState }),
  ];
  const selected = typeChecks.find((item) => item.eligible);
  if (!selected) {
    const reasons = typeChecks.flatMap((item) => item.blocked_reasons).slice(0, 8);
    return policyResult({
      eligible: false,
      recommended_push_type: "none",
      confidence: confidenceForPolicy({ evidence, coachingState, blocked: reasons }),
      blocked_reasons: reasons,
      rationale: [`${goal} context did not earn any push type.`, "Downgrade to hold or consolidate."],
      advisory_notes: advisory,
    });
  }

  return policyResult({
    eligible: true,
    recommended_push_type: selected.recommended_push_type,
    confidence: selected.confidence,
    blocked_reasons: [],
    rationale: selected.rationale,
    advisory_notes: [...advisory, ...selected.advisory_notes],
  });
}

export function fallbackForPushPolicy(policy) {
  const reasons = policy.blocked_reasons.join(" ");
  if (/recovery|workload|shutdown|pain|missed|ownership|density/i.test(reasons)) return "consolidate";
  return "hold";
}

function baseBlockedReasons({ evidence, coachingState, safetyGate }) {
  const reasons = [];
  const evidenceScore = evidenceConfidenceScore(evidence);
  const exposures = sameExerciseSuccessfulExposureCount(evidence);
  if (safetyGate.status !== "clear") reasons.push("Safety Gate is not clear.");
  if (evidenceScore < 90) reasons.push(`Evidence quality ${evidenceScore} is below the push floor of 90.`);
  if (exposures < 3) reasons.push(`Same-exercise successful exposures ${exposures} is below 3.`);
  if (coachingState.recovery_capacity < 80) reasons.push(`Recovery capacity ${coachingState.recovery_capacity} is below 80.`);
  if (coachingState.momentum < 75) reasons.push(`Momentum ${coachingState.momentum} is below 75.`);
  if (coachingState.adaptation < 75) reasons.push(`Adaptation ${coachingState.adaptation} is below 75.`);
  if (coachingState.confidence < 70) reasons.push(`Confidence ${coachingState.confidence} is below 70.`);
  if (!hasPositivePushSignal(evidence)) reasons.push("No repeated positive push signal.");
  if (hasRecentShutdownOrPain(evidence)) reasons.push("Recent shutdown or pain evidence exists.");
  if (hasRecentMissedMinimumRange(evidence)) reasons.push("Recent missed-range evidence exists.");
  if (hasSwapOrNewExerciseUncertainty(evidence)) reasons.push("Swap or new-exercise uncertainty exists.");
  if (hasRecoveryCompression(evidence)) reasons.push("Recent recovery compression exists.");
  if (hasHighWorkloadDensityWarning(evidence)) reasons.push("High workload-density warning exists.");
  return reasons;
}

function performancePushPolicy({ athlete, evidence, coachingState }) {
  const goal = athlete?.goal ?? "unknown";
  const readiness = evidence.pushReadiness ?? {};
  const goalEvidence = evidence.goalProgressEvidence ?? {};
  const allowedGoal = ["strength", "powerlifting", "athletic_performance"].includes(goal);
  const dynamicEvidence = (goalEvidence.athleticMetrics ?? []).some((item) => item.trend === "improving");
  const strengthEvidence = (goalEvidence.strengthMetrics ?? []).some((item) => item.estimatedStrengthTrend === "improving" && (item.comparableExposures ?? 0) >= 5);
  const reasons = [];
  if (!allowedGoal) reasons.push("Performance push is only available for strength, powerlifting, or athletic-performance contexts.");
  if (readiness.performanceMilestoneOpportunity !== true) reasons.push("No explicit milestone opportunity.");
  if ((readiness.stableBlockWeeks ?? 0) < 8) reasons.push("Stable block is shorter than 8 weeks.");
  if (sameExerciseSuccessfulExposureCount(evidence) < 5) reasons.push("Performance push needs at least 5 same-exercise exposures.");
  if (evidenceConfidenceScore(evidence) < 97) reasons.push("Evidence quality is below performance-push threshold.");
  if (coachingState.recovery_capacity < 90 || coachingState.momentum < 88 || coachingState.confidence < 78) reasons.push("State is not exceptional enough for a milestone push.");
  if (!dynamicEvidence && !strengthEvidence) reasons.push("No explicit power/dynamic or high-specificity strength evidence.");
  if (!loadOwnershipAllows(evidence, { allowUnknown: true })) reasons.push("Load ownership blocks performance push.");

  return candidate({
    type: "performance_push",
    reasons,
    confidence: 82,
    rationale: ["Performance push is a planned milestone, not a reaction to one good exposure.", "Exceptional evidence and clear safety allow a rare performance push."],
    advisory_notes: ["Synthetic outcome learning still shows performance_push has non-trivial risk; keep it rare."],
  });
}

function loadPushPolicy({ athlete, evidence, coachingState }) {
  const goal = athlete?.goal ?? "unknown";
  const detail = buildDetailedEvidence(evidence);
  const readiness = evidence.pushReadiness ?? {};
  const strengthMetrics = evidence.goalProgressEvidence?.strengthMetrics ?? [];
  const reasons = [];
  const topEnd = Math.max(readiness.topEndTargetRangeSuccesses ?? 0, ...detail.exerciseHistory.map((item) => item.aboveRangeEvents ?? 0), 0);
  const sensibleJump = readiness.loadJump === "small_sensible" || detail.exerciseHistory.some((item) => (item.loadEvents ?? []).includes("small_sensible_increase_available"));
  const strengthSupport = strengthMetrics.some((item) =>
    ["competition_squat", "competition_bench_press", "competition_deadlift", "standing_overhead_press"].includes(item.exercise) &&
    item.estimatedStrengthTrend === "improving" &&
    (item.comparableExposures ?? 0) >= 3
  );

  if (!["strength", "powerlifting", "build_muscle_strength", "strength_hypertrophy"].includes(goal)) reasons.push("Goal does not prioritise load pushing.");
  if (evidenceConfidenceScore(evidence) < 96) reasons.push("Evidence quality is below load-push threshold.");
  if (sameExerciseSuccessfulExposureCount(evidence) < 3) reasons.push("Load push requires 3+ same-exercise successful exposures.");
  if (topEnd < 3) reasons.push("Load push requires repeated top-end target-range success.");
  if (!sensibleJump) reasons.push("No small sensible load jump is available.");
  if (!strengthSupport) reasons.push("Strength goal-progress evidence does not support load push.");
  if (!loadOwnershipAllows(evidence, { allowUnknown: true })) reasons.push("Previous load is not owned enough for another load push.");
  if (coachingState.recovery_capacity < 82 || coachingState.momentum < 78) reasons.push("Recovery or momentum is too low for load push.");

  return candidate({
    type: "load_push",
    reasons,
    confidence: 78,
    rationale: ["Load push is selected because strength-specific evidence and top-end same-exercise success are present.", "The policy avoids pushing load without ownership, sensible jumps, and clear safety."],
    advisory_notes: ["Outcome learning suggests load_push is promising but still synthetic; ownership should become stricter in future validation."],
  });
}

function volumePushPolicy({ athlete, evidence, coachingState }) {
  const goal = athlete?.goal ?? "unknown";
  const detail = buildDetailedEvidence(evidence);
  const readiness = evidence.pushReadiness ?? {};
  const quality = evidence.goalProgressEvidence?.qualityVolume ?? {};
  const targetCompletion = quality.targetRangeCompletionRate ?? targetRangeCompletionRate(detail);
  const reasons = [];

  if (!["build_muscle", "hypertrophy", "build_muscle_strength", "strength_hypertrophy"].includes(goal)) reasons.push("Goal does not prioritise volume push.");
  if (goal === "strength_hypertrophy" && loadPushPolicy({ athlete, evidence, coachingState }).eligible) reasons.push("Load push is a better fit than volume push for this strength-hypertrophy context.");
  if (evidenceConfidenceScore(evidence) < 95) reasons.push("Evidence quality is below volume-push threshold.");
  if (sameExerciseSuccessfulExposureCount(evidence) < 4) reasons.push("Volume push requires 4+ same-exercise successful exposures.");
  if (coachingState.recovery_capacity < 84 || coachingState.momentum < 78) reasons.push("Recovery or momentum is too low for volume push.");
  if ((readiness.qualityVolumeTolerance !== "high") && quality.totalQualityVolumeTrend !== "improving") reasons.push("Quality-volume tolerance is not high.");
  if (targetCompletion < 0.88) reasons.push("Target-range completion is too low for more volume.");
  if (quality.recoveryCost === "high") reasons.push("Quality volume currently carries high recovery cost.");

  return candidate({
    type: "volume_push",
    reasons,
    confidence: 76,
    rationale: ["Volume push is selected because quality work is rising and recovery is strong.", "The policy prefers volume over load for muscle-building contexts when load ownership is not the limiting factor."],
    advisory_notes: ["Outcome learning v0.2 showed volume_push had lower synthetic negative/unsafe rate than micro_push, but this remains advisory."],
  });
}

function microPushPolicy({ athlete, evidence, coachingState }) {
  const goal = athlete?.goal ?? "unknown";
  const reasons = [];
  if (goal === "get_lean" && evidence.pushReadiness?.performancePreservationExcellent !== true) reasons.push("Get Lean push requires explicit excellent performance-preservation evidence.");
  if (goal === "athletic_performance" && evidence.pushReadiness?.performanceMilestoneOpportunity !== true) reasons.push("Athletic Performance push needs explicit dynamic/milestone evidence.");
  if (evidenceConfidenceScore(evidence) < 90) reasons.push("Evidence quality is too low for even micro-push.");
  if (coachingState.recovery_capacity < 80) reasons.push("Recovery capacity is too low for micro-push.");

  return candidate({
    type: "micro_push",
    reasons,
    confidence: 72,
    rationale: ["Micro push is allowed only when stronger push types are not a fit but objective evidence still earns a small step.", "Micro push is not assumed safe by default."],
    advisory_notes: ["Outcome learning v0.2 found micro_push outcomes mixed; keep the push small and context-specific."],
  });
}

function candidate({ type, reasons, confidence, rationale, advisory_notes }) {
  return {
    eligible: reasons.length === 0,
    recommended_push_type: reasons.length === 0 ? type : "none",
    confidence: reasons.length === 0 ? confidence : Math.max(35, confidence - 18),
    blocked_reasons: reasons,
    rationale,
    advisory_notes,
  };
}

function policyResult(result) {
  if (!PUSH_TYPES.has(result.recommended_push_type)) throw new Error(`Invalid push type ${result.recommended_push_type}`);
  return result;
}

function advisoryNotesFor({ athlete, evidence }) {
  const notes = [
    "Synthetic outcome findings are advisory only and do not mutate policy.",
    "No push type is automatically safe.",
  ];
  const goal = athlete?.goal ?? "unknown";
  if (goal === "get_lean") notes.push("Get Lean push should prioritise performance preservation.");
  if (goal === "athletic_performance") notes.push("No bar-speed or power claims without explicit power/dynamic evidence.");
  if ((evidence.loadOwnership?.state ?? "unknown") === "unknown") notes.push("Load ownership is unknown; future validation should make this explicit.");
  return notes;
}

function confidenceForPolicy({ evidence, coachingState, blocked }) {
  let confidence = 45;
  confidence += Math.round(evidenceConfidenceScore(evidence) * 0.22);
  confidence += Math.round(coachingState.recovery_capacity * 0.12);
  confidence -= Math.min(24, blocked.length * 4);
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function loadOwnershipAllows(evidence, { allowUnknown }) {
  const state = evidence.loadOwnership?.state;
  if (!state) return allowUnknown;
  return meaningfulLoadPushAllowed({ ownership: { state } });
}

function targetRangeCompletionRate(detail) {
  const records = detail.exerciseHistory.filter((item) => typeof item.withinRange === "boolean");
  if (!records.length) return 0;
  return records.filter((item) => item.withinRange && item.belowMinimumEvents === 0 && item.shutdowns === 0).length / records.length;
}
