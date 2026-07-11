import type { RawEvidenceSignal } from "./coaching-evidence-engine";

export type ExecutionQuality = "excellent" | "good" | "acceptable" | "questionable" | "poor" | "invalid";
export type ExecutionLearningWeight = "full" | "high" | "moderate" | "low" | "minimal" | "none";
export type EvidenceReliability = "very_high" | "high" | "moderate" | "low" | "very_low" | "none";
export type DownstreamLearningPermission =
  | "allow_full_learning"
  | "allow_weighted_learning"
  | "safety_only"
  | "block_learning";

export type ExecutionQualityReasonCode =
  | "quality_of_execution_gate"
  | "directly_observed_evidence_only"
  | "validated_user_input_only"
  | "explicit_inference_label_required"
  | "unobservable_technique_not_inferred"
  | "prescription_completed_as_planned"
  | "minor_deviation_reduced_confidence"
  | "significant_deviation_low_weight"
  | "invalid_session_blocks_learning"
  | "safety_event_always_propagates"
  | "single_poor_quality_session_limited"
  | "future_sensor_ready"
  | "independent_from_progression_recovery_loading_intervention";

export type InvalidEvidenceFlag =
  | "accidental_logging"
  | "corrupted_session"
  | "unrealistic_performance"
  | "missing_core_execution_data"
  | "early_termination"
  | "safety_limited_session"
  | "excessive_unexplained_deviation"
  | "unvalidated_user_input";

export type RecommendedExecutionReview =
  | "none"
  | "coach_review_optional"
  | "coach_review_recommended"
  | "safety_review_required"
  | "do_not_learn_from_performance";

export type FutureEvidenceSource =
  | "bar_velocity"
  | "computer_vision"
  | "wearables"
  | "heart_rate"
  | "rom_estimation";

export interface ExecutionSetEvidence {
  prescribed_load: number | null;
  completed_load: number | null;
  prescribed_reps: number | null;
  completed_reps: number | null;
  completed: boolean;
  failed?: boolean;
}

export interface QualityOfExecutionInput {
  sessionId: string;
  prescribed_sets: number;
  completed_sets: number;
  sets: ExecutionSetEvidence[];
  skipped_sets?: number;
  skipped_exercises?: number;
  substitutions?: number;
  exercise_order_changes?: number;
  prescribed_rest_seconds?: number[];
  actual_rest_seconds?: number[];
  prescribed_duration_minutes?: number;
  workout_duration_minutes?: number;
  early_termination?: boolean;
  session_compression?: boolean;
  pain_flag?: "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
  dizziness?: boolean;
  equipment_constraints?: boolean;
  recovery_effort_input?: "easy" | "normal" | "hard" | "grind" | "unknown";
  recovery_effort_input_validated?: boolean;
  user_notes?: string;
  invalid_reason?: "accidental_logging" | "corrupted_session" | "unrealistic_performance";
  explicitly_labelled_inferences?: string[];
  future_evidence_sources_available?: FutureEvidenceSource[];
}

export interface QualityEvidenceFor9J {
  sessionId: string;
  signal: RawEvidenceSignal;
  learning_weight: ExecutionLearningWeight;
  safety_related: boolean;
  permitted_for_learning: boolean;
  reason_codes: ExecutionQualityReasonCode[];
}

export interface QualityOfExecutionOutput {
  execution_quality: ExecutionQuality;
  quality_confidence: number;
  learning_weight: ExecutionLearningWeight;
  quality_reason_codes: ExecutionQualityReasonCode[];
  invalid_evidence_flags: InvalidEvidenceFlag[];
  evidence_reliability: EvidenceReliability;
  recommended_review: RecommendedExecutionReview;
  downstream_learning_permission: DownstreamLearningPermission;
  evidence_for_9J: QualityEvidenceFor9J[];
  explicitly_labelled_inferences: string[];
  future_evidence_sources_available: FutureEvidenceSource[];
}

export function assessQualityOfExecution(input: QualityOfExecutionInput): QualityOfExecutionOutput {
  const reasonCodes: ExecutionQualityReasonCode[] = [
    "quality_of_execution_gate",
    "directly_observed_evidence_only",
    "validated_user_input_only",
    "explicit_inference_label_required",
    "unobservable_technique_not_inferred",
    "future_sensor_ready",
    "independent_from_progression_recovery_loading_intervention",
  ];
  const invalidFlags = invalidEvidenceFlags(input);
  const safetyEvent = hasSafetyEvent(input);

  if (invalidFlags.includes("accidental_logging") || invalidFlags.includes("corrupted_session") || invalidFlags.includes("unrealistic_performance")) {
    reasonCodes.push("invalid_session_blocks_learning");
    if (safetyEvent) reasonCodes.push("safety_event_always_propagates");
    return output(input, "invalid", reasonCodes, invalidFlags, safetyEvent);
  }

  const deviationScore = calculateDeviationScore(input);
  const quality = classifyQuality(input, deviationScore, invalidFlags);

  if (quality === "excellent") reasonCodes.push("prescription_completed_as_planned");
  if (quality === "good" || quality === "acceptable") reasonCodes.push("minor_deviation_reduced_confidence");
  if (quality === "questionable" || quality === "poor") reasonCodes.push("significant_deviation_low_weight", "single_poor_quality_session_limited");
  if (quality === "invalid") reasonCodes.push("invalid_session_blocks_learning");
  if (safetyEvent) reasonCodes.push("safety_event_always_propagates");

  return output(input, quality, reasonCodes, invalidFlags, safetyEvent);
}

function invalidEvidenceFlags(input: QualityOfExecutionInput): InvalidEvidenceFlag[] {
  const flags: InvalidEvidenceFlag[] = [];
  if (input.invalid_reason) flags.push(input.invalid_reason);
  if (input.prescribed_sets <= 0 || input.sets.length === 0) flags.push("missing_core_execution_data");
  if (input.early_termination) flags.push("early_termination");
  if (hasSafetyEvent(input)) flags.push("safety_limited_session");
  if (unrealisticLoadOrRepEntry(input)) flags.push("unrealistic_performance");
  if (largeUnexplainedDeviation(input)) flags.push("excessive_unexplained_deviation");
  if (input.recovery_effort_input && input.recovery_effort_input !== "unknown" && !input.recovery_effort_input_validated) {
    flags.push("unvalidated_user_input");
  }
  return Array.from(new Set(flags));
}

function classifyQuality(
  input: QualityOfExecutionInput,
  deviationScore: number,
  invalidFlags: InvalidEvidenceFlag[],
): ExecutionQuality {
  if (invalidFlags.includes("missing_core_execution_data") || invalidFlags.includes("excessive_unexplained_deviation")) {
    return "invalid";
  }
  if (input.early_termination && input.completed_sets === 0) {
    return "invalid";
  }
  if (input.early_termination || input.pain_flag === "unsafe" || input.dizziness) {
    return "poor";
  }
  if (input.completed_sets < Math.ceil(input.prescribed_sets * 0.5)) {
    return "poor";
  }
  if (deviationScore === 0) return "excellent";
  if (deviationScore <= 8) return "good";
  if (deviationScore <= 15) return "acceptable";
  if (deviationScore <= 24) return "questionable";
  return "poor";
}

function calculateDeviationScore(input: QualityOfExecutionInput): number {
  let score = 0;
  const skippedSets = input.skipped_sets ?? Math.max(0, input.prescribed_sets - input.completed_sets);
  score += skippedSets * 4;
  score += (input.skipped_exercises ?? 0) * 8;
  score += (input.substitutions ?? 0) * 5;
  score += (input.exercise_order_changes ?? 0) * 3;
  score += input.session_compression ? 5 : 0;
  score += (input.equipment_constraints ?? false) ? 4 : 0;
  score += input.sets.filter((set) => set.failed).length * 5;

  for (const set of input.sets) {
    if (!set.completed) score += 4;
    if (set.prescribed_reps !== null && set.completed_reps !== null) {
      const repDelta = Math.abs(set.prescribed_reps - set.completed_reps);
      score += Math.min(6, repDelta);
    }
    if (set.prescribed_load !== null && set.completed_load !== null && set.prescribed_load > 0) {
      const loadDelta = Math.abs(set.prescribed_load - set.completed_load) / set.prescribed_load;
      score += loadDelta > 0.1 ? 4 : loadDelta > 0.05 ? 2 : 0;
    }
  }

  score += restDeviationScore(input.prescribed_rest_seconds ?? [], input.actual_rest_seconds ?? []);
  score += durationDeviationScore(input);
  return score;
}

function restDeviationScore(prescribed: number[], actual: number[]): number {
  if (!prescribed.length || !actual.length) return 0;
  const count = Math.min(prescribed.length, actual.length);
  let score = 0;
  for (let index = 0; index < count; index += 1) {
    const target = prescribed[index] ?? 0;
    const observed = actual[index] ?? target;
    if (target <= 0) continue;
    const delta = Math.abs(target - observed) / target;
    score += delta > 0.5 ? 3 : delta > 0.25 ? 1 : 0;
  }
  return score;
}

function durationDeviationScore(input: QualityOfExecutionInput): number {
  if (!input.prescribed_duration_minutes || !input.workout_duration_minutes) return 0;
  const delta = Math.abs(input.prescribed_duration_minutes - input.workout_duration_minutes) / input.prescribed_duration_minutes;
  return delta > 0.5 ? 5 : delta > 0.25 ? 2 : 0;
}

function output(
  input: QualityOfExecutionInput,
  quality: ExecutionQuality,
  reasonCodes: ExecutionQualityReasonCode[],
  invalidFlags: InvalidEvidenceFlag[],
  safetyEvent: boolean,
): QualityOfExecutionOutput {
  return {
    execution_quality: quality,
    quality_confidence: confidenceFor(quality, invalidFlags),
    learning_weight: learningWeightFor(quality),
    quality_reason_codes: Array.from(new Set(reasonCodes)),
    invalid_evidence_flags: invalidFlags,
    evidence_reliability: reliabilityFor(quality),
    recommended_review: reviewFor(quality, safetyEvent),
    downstream_learning_permission: permissionFor(quality, safetyEvent),
    evidence_for_9J: evidenceFor9J(input, quality, reasonCodes, safetyEvent),
    explicitly_labelled_inferences: input.explicitly_labelled_inferences ?? [],
    future_evidence_sources_available: input.future_evidence_sources_available ?? [],
  };
}

function learningWeightFor(quality: ExecutionQuality): ExecutionLearningWeight {
  switch (quality) {
    case "excellent": return "full";
    case "good": return "high";
    case "acceptable": return "moderate";
    case "questionable": return "low";
    case "poor": return "minimal";
    case "invalid": return "none";
  }
}

function reliabilityFor(quality: ExecutionQuality): EvidenceReliability {
  switch (quality) {
    case "excellent": return "very_high";
    case "good": return "high";
    case "acceptable": return "moderate";
    case "questionable": return "low";
    case "poor": return "very_low";
    case "invalid": return "none";
  }
}

function permissionFor(quality: ExecutionQuality, safetyEvent: boolean): DownstreamLearningPermission {
  if (quality === "invalid") return safetyEvent ? "safety_only" : "block_learning";
  if (quality === "poor" && safetyEvent) return "safety_only";
  if (quality === "excellent") return "allow_full_learning";
  return "allow_weighted_learning";
}

function confidenceFor(quality: ExecutionQuality, invalidFlags: InvalidEvidenceFlag[]): number {
  const base = {
    excellent: 95,
    good: 86,
    acceptable: 72,
    questionable: 54,
    poor: 35,
    invalid: 15,
  } satisfies Record<ExecutionQuality, number>;
  return Math.max(5, base[quality] - Math.min(20, invalidFlags.length * 4));
}

function reviewFor(quality: ExecutionQuality, safetyEvent: boolean): RecommendedExecutionReview {
  if (safetyEvent) return "safety_review_required";
  if (quality === "invalid") return "do_not_learn_from_performance";
  if (quality === "poor" || quality === "questionable") return "coach_review_recommended";
  if (quality === "acceptable") return "coach_review_optional";
  return "none";
}

function evidenceFor9J(
  input: QualityOfExecutionInput,
  quality: ExecutionQuality,
  reasonCodes: ExecutionQualityReasonCode[],
  safetyEvent: boolean,
): QualityEvidenceFor9J[] {
  const primarySignal: RawEvidenceSignal = quality === "excellent" || quality === "good"
    ? "session_completed"
    : quality === "invalid"
      ? "early_termination"
      : "time_compressed";
  const evidence: QualityEvidenceFor9J[] = [
    {
      sessionId: input.sessionId,
      signal: primarySignal,
      learning_weight: learningWeightFor(quality),
      safety_related: false,
      permitted_for_learning: permissionFor(quality, safetyEvent) !== "block_learning",
      reason_codes: Array.from(new Set(reasonCodes)),
    },
  ];

  if (safetyEvent) {
    evidence.push({
      sessionId: input.sessionId,
      signal: input.dizziness ? "early_termination" : "pain_reported",
      learning_weight: "high",
      safety_related: true,
      permitted_for_learning: true,
      reason_codes: Array.from(new Set([...reasonCodes, "safety_event_always_propagates"])),
    });
  }

  return evidence;
}

function hasSafetyEvent(input: QualityOfExecutionInput): boolean {
  return input.dizziness === true || (input.pain_flag !== undefined && input.pain_flag !== "none");
}

function unrealisticLoadOrRepEntry(input: QualityOfExecutionInput): boolean {
  return input.sets.some((set) => (
    (set.completed_reps !== null && (set.completed_reps < 0 || set.completed_reps > 200)) ||
    (set.completed_load !== null && set.completed_load < 0)
  ));
}

function largeUnexplainedDeviation(input: QualityOfExecutionInput): boolean {
  if (input.early_termination || input.equipment_constraints || hasSafetyEvent(input)) return false;
  return input.prescribed_sets >= 3 && input.completed_sets === 0;
}

export const qualityOfExecutionArchitectureNotes = {
  decision_id: "10D",
  gates_coaching_learning: true,
  evaluates_execution_quality_not_lifting_technique: true,
  raw_workouts_must_pass_quality_gate_before_9j_learning: true,
  future_sensor_sources_are_optional_extensions: true,
} as const;
