export type LiveWorkoutAction =
  | "no_change"
  | "hold_load"
  | "increase_next_set_load"
  | "decrease_next_set_load"
  | "reduce_reps"
  | "reduce_sets"
  | "remove_backoff_sets"
  | "extend_rest"
  | "compress_lower_priority_layers"
  | "substitute_exercise"
  | "stop_exercise"
  | "stop_workout"
  | "flag_for_review";

export type LiveWorkoutReasonCode =
  | "live_engine_active_session_only"
  | "permanent_learning_routes_to_9j"
  | "safety_pain_overrides"
  | "single_poor_set_no_drastic_change"
  | "repeated_failed_sets_reduce_or_stop"
  | "strong_performance_conservative_increase"
  | "amrap_effort_cap_respected"
  | "backoffs_reduced_before_mission_critical"
  | "lower_priority_layers_compressed_first"
  | "density_and_resource_rules_used_for_time"
  | "rest_extended_for_recovery_between_efforts"
  | "no_permanent_programme_mutation";

export type LiveWorkoutSafetyFlag =
  | "pain_stop_required"
  | "unsafe_movement_stop_workout"
  | "amrap_cap_reached"
  | "repeated_failure"
  | "time_pressure"
  | "mission_critical_protected";

export type LiveWorkoutEvidenceFlag =
  | "completed_sets_reps_load"
  | "failed_sets"
  | "pain_flag"
  | "rest_modified"
  | "set_prescription_modified"
  | "load_modified"
  | "exercise_substituted"
  | "exercise_stopped"
  | "workout_stopped"
  | "time_compression"
  | "user_difficulty_reported"
  | "skipped_work";

export type RawCoachingEvidenceSignal =
  | "performance_improved"
  | "performance_declined"
  | "pain_reported"
  | "session_completed"
  | "exercise_substituted"
  | "early_termination"
  | "time_compressed"
  | "failed_sets"
  | "method_modified";

export interface GeneratedWorkoutPlanSummary {
  workout_id: string;
  session_name: string;
  planned_exercise_ids: string[];
}

export interface FinalCoachingPayloadSummary {
  action: string;
  scope: string;
  safety_flags?: string[];
}

export interface LiveMethodPrescription {
  method_id: string;
  effort_cap: "easy" | "controlled" | "hard_cap" | "capped_amrap" | "no_grind";
  allows_live_load_increase: boolean;
  has_backoff_work: boolean;
}

export interface LiveLoadingPrescription {
  prescribed_load: number | null;
  prescribed_sets: number;
  prescribed_reps_or_rep_range: string;
  backoff_loads: number[];
  minimum_load_increment: number;
}

export interface LiveWarmupPlanSummary {
  safety_flags: string[];
  warmup_complete: boolean;
}

export interface LiveRecoveryBetweenEffortsGuidance {
  recovery_objective: "full_recovery" | "substantial_recovery" | "moderate_recovery" | "minimal_recovery" | "transition_only";
  suggested_rest_range: {
    min_seconds: number;
    max_seconds: number;
  };
}

export interface LiveDensityPlanSummary {
  session_density_level: "very_low_density" | "low_density" | "moderate_density" | "high_density" | "very_high_density";
  time_compression_options: Array<{
    action: "increase_density" | "pair_accessories" | "use_alternating_sets" | "reduce_lower_priority_layers";
    target_layers: LiveSessionLayerId[];
  }>;
}

export type LiveSessionLayerId =
  | "mission_critical"
  | "primary_support"
  | "weakness_development"
  | "structural_balance"
  | "recovery_mobility_optional";

export interface LiveSessionCompositionLayer {
  layer_id: LiveSessionLayerId;
  exercise_ids: string[];
  required: boolean;
}

export interface LiveSetResult {
  exercise_id: string;
  set_number: number;
  reps: number;
  load: number | null;
  completed: boolean;
  failed: boolean;
  is_amrap?: boolean;
  exceeded_target?: boolean;
  hit_cap?: boolean;
  user_difficulty?: "easy" | "normal" | "hard" | "grind" | "unknown";
}

export interface LiveWorkoutCoachingInput {
  generatedWorkoutPlan: GeneratedWorkoutPlanSummary;
  finalCoachingDecisionPayload: FinalCoachingPayloadSummary;
  warmupPlan: LiveWarmupPlanSummary;
  loadingPrescription: LiveLoadingPrescription;
  methodPrescription: LiveMethodPrescription;
  recoveryBetweenEffortsGuidance: LiveRecoveryBetweenEffortsGuidance;
  densityPlan: LiveDensityPlanSummary;
  sessionCompositionLayers: LiveSessionCompositionLayer[];
  timeAvailableMinutes: number;
  actualCompletedSets: LiveSetResult[];
  failedSets: number;
  userReportedDifficulty: "easy" | "normal" | "hard" | "grind" | "unknown";
  painIssueFlag: "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
  skippedSets: number;
  skippedExercises: string[];
  substitutions: Array<{ from_exercise_id: string; to_exercise_id: string }>;
  restActuallyTakenSeconds: number[];
  sessionDurationMinutes: number;
  liveTimeRemainingMinutes: number;
  activeExerciseId: string;
  currentSetNumber: number;
}

export interface AdjustedLivePrescription {
  load: number | null;
  sets_remaining_delta: number;
  reps_target_delta: number;
  rest_seconds?: number;
  remove_backoff_sets: boolean;
  compressed_layers: LiveSessionLayerId[];
  substitute_exercise?: {
    from_exercise_id: string;
    instruction: "use_existing_safe_alternative" | "defer_to_existing_substitution_flow";
  };
}

export interface LiveWorkoutEvidenceFor9J {
  signal: RawCoachingEvidenceSignal;
  evidence_flags: LiveWorkoutEvidenceFlag[];
  reason_codes: LiveWorkoutReasonCode[];
  safety_related: boolean;
}

export interface LiveWorkoutCoachingOutput {
  active_session_adjustment: LiveWorkoutAction;
  adjusted_prescription: AdjustedLivePrescription;
  affected_exercises: string[];
  reason_codes: LiveWorkoutReasonCode[];
  safety_flags: LiveWorkoutSafetyFlag[];
  evidence_flags_for_9J: LiveWorkoutEvidenceFor9J[];
  user_facing_coaching_message: string;
  active_session_only: true;
  permanent_mutation_allowed: false;
}

export function coachLiveWorkout(input: LiveWorkoutCoachingInput): LiveWorkoutCoachingOutput {
  const reasons: LiveWorkoutReasonCode[] = ["live_engine_active_session_only", "permanent_learning_routes_to_9j", "no_permanent_programme_mutation"];
  const safetyFlags: LiveWorkoutSafetyFlag[] = [];
  const evidenceFlags: LiveWorkoutEvidenceFlag[] = ["completed_sets_reps_load"];
  const base = basePrescription(input);

  if (input.painIssueFlag === "unsafe" || input.painIssueFlag === "technical_breakdown") {
    reasons.push("safety_pain_overrides");
    safetyFlags.push("pain_stop_required", "unsafe_movement_stop_workout");
    evidenceFlags.push("pain_flag", "workout_stopped");
    return output("stop_workout", input, base, reasons, safetyFlags, evidenceFlags, "Stop the workout and get safe.");
  }

  if (input.painIssueFlag === "pain") {
    reasons.push("safety_pain_overrides");
    safetyFlags.push("pain_stop_required");
    evidenceFlags.push("pain_flag", "exercise_stopped");
    return output("stop_exercise", input, {
      ...base,
      substitute_exercise: {
        from_exercise_id: input.activeExerciseId,
        instruction: "defer_to_existing_substitution_flow",
      },
    }, reasons, safetyFlags, evidenceFlags, "Stop this exercise.");
  }

  if (amrapCapViolated(input)) {
    reasons.push("amrap_effort_cap_respected");
    safetyFlags.push("amrap_cap_reached");
    evidenceFlags.push("set_prescription_modified");
    return output("stop_exercise", input, { ...base, sets_remaining_delta: -remainingSets(input) }, reasons, safetyFlags, evidenceFlags, "AMRAP cap reached. Stop there.");
  }

  if (input.failedSets >= 2) {
    reasons.push("repeated_failed_sets_reduce_or_stop");
    safetyFlags.push("repeated_failure");
    evidenceFlags.push("failed_sets", "load_modified", "set_prescription_modified");
    const action: LiveWorkoutAction = input.failedSets >= 3 ? "stop_exercise" : "decrease_next_set_load";
    return output(action, input, reducePrescription(input, base), reasons, safetyFlags, evidenceFlags, action === "stop_exercise" ? "Stop this exercise for today." : "Reduce the next set.");
  }

  if (input.failedSets === 1 || input.userReportedDifficulty === "grind") {
    reasons.push("single_poor_set_no_drastic_change", "rest_extended_for_recovery_between_efforts");
    evidenceFlags.push("failed_sets", "rest_modified", "user_difficulty_reported");
    return output("extend_rest", input, {
      ...base,
      rest_seconds: input.recoveryBetweenEffortsGuidance.suggested_rest_range.max_seconds,
    }, reasons, safetyFlags, evidenceFlags, "Take more rest, then reassess.");
  }

  if (timePressure(input)) {
    reasons.push("density_and_resource_rules_used_for_time", "lower_priority_layers_compressed_first");
    safetyFlags.push("time_pressure", "mission_critical_protected");
    evidenceFlags.push("time_compression", "skipped_work");
    return output("compress_lower_priority_layers", input, {
      ...base,
      compressed_layers: lowerPriorityCompressionLayers(input),
      remove_backoff_sets: false,
    }, reasons, safetyFlags, evidenceFlags, "Trim lower-priority work first.");
  }

  if (shouldRemoveBackoffs(input)) {
    reasons.push("backoffs_reduced_before_mission_critical");
    evidenceFlags.push("set_prescription_modified");
    return output("remove_backoff_sets", input, {
      ...base,
      remove_backoff_sets: true,
      sets_remaining_delta: -Math.max(1, input.loadingPrescription.backoff_loads.length),
    }, reasons, safetyFlags, evidenceFlags, "Remove backoffs. Keep quality.");
  }

  if (strongPerformance(input)) {
    reasons.push("strong_performance_conservative_increase");
    evidenceFlags.push("load_modified");
    return output("increase_next_set_load", input, increasePrescription(input, base), reasons, safetyFlags, evidenceFlags, "Small increase is okay.");
  }

  return output("no_change", input, base, reasons, safetyFlags, evidenceFlags, "Keep going as planned.");
}

function basePrescription(input: LiveWorkoutCoachingInput): AdjustedLivePrescription {
  return {
    load: input.loadingPrescription.prescribed_load,
    sets_remaining_delta: 0,
    reps_target_delta: 0,
    remove_backoff_sets: false,
    compressed_layers: [],
  };
}

function output(
  action: LiveWorkoutAction,
  input: LiveWorkoutCoachingInput,
  prescription: AdjustedLivePrescription,
  reasons: LiveWorkoutReasonCode[],
  safetyFlags: LiveWorkoutSafetyFlag[],
  evidenceFlags: LiveWorkoutEvidenceFlag[],
  message: string,
): LiveWorkoutCoachingOutput {
  return {
    active_session_adjustment: action,
    adjusted_prescription: prescription,
    affected_exercises: unique([input.activeExerciseId, ...input.skippedExercises, ...input.substitutions.flatMap((item) => [item.from_exercise_id, item.to_exercise_id])]),
    reason_codes: unique(reasons),
    safety_flags: unique(safetyFlags),
    evidence_flags_for_9J: [evidenceFor9J(action, reasons, evidenceFlags, safetyFlags)],
    user_facing_coaching_message: message,
    active_session_only: true,
    permanent_mutation_allowed: false,
  };
}

function evidenceFor9J(
  action: LiveWorkoutAction,
  reasons: LiveWorkoutReasonCode[],
  flags: LiveWorkoutEvidenceFlag[],
  safetyFlags: LiveWorkoutSafetyFlag[],
): LiveWorkoutEvidenceFor9J {
  const signal: RawCoachingEvidenceSignal = safetyFlags.includes("pain_stop_required")
    ? "pain_reported"
    : flags.includes("failed_sets")
      ? "failed_sets"
      : flags.includes("time_compression")
        ? "time_compressed"
        : action === "increase_next_set_load"
          ? "performance_improved"
          : action === "stop_workout" || action === "stop_exercise"
            ? "early_termination"
            : "session_completed";
  return {
    signal,
    evidence_flags: unique(flags),
    reason_codes: unique(reasons),
    safety_related: safetyFlags.length > 0,
  };
}

function reducePrescription(input: LiveWorkoutCoachingInput, base: AdjustedLivePrescription): AdjustedLivePrescription {
  const currentLoad = input.loadingPrescription.prescribed_load;
  const reducedLoad = currentLoad === null ? null : Math.max(0, currentLoad - input.loadingPrescription.minimum_load_increment);
  return {
    ...base,
    load: reducedLoad,
    sets_remaining_delta: input.failedSets >= 3 ? -remainingSets(input) : -1,
    reps_target_delta: -1,
    remove_backoff_sets: input.methodPrescription.has_backoff_work,
  };
}

function increasePrescription(input: LiveWorkoutCoachingInput, base: AdjustedLivePrescription): AdjustedLivePrescription {
  const currentLoad = input.loadingPrescription.prescribed_load;
  return {
    ...base,
    load: currentLoad === null ? null : currentLoad + input.loadingPrescription.minimum_load_increment,
  };
}

function strongPerformance(input: LiveWorkoutCoachingInput): boolean {
  if (!input.methodPrescription.allows_live_load_increase) return false;
  if (input.methodPrescription.effort_cap === "capped_amrap" || input.methodPrescription.effort_cap === "no_grind") return false;
  if (input.failedSets > 0 || input.painIssueFlag !== "none") return false;
  const lastSet = input.actualCompletedSets.at(-1);
  return Boolean(lastSet?.completed && lastSet.exceeded_target && (lastSet.user_difficulty === "easy" || input.userReportedDifficulty === "easy"));
}

function amrapCapViolated(input: LiveWorkoutCoachingInput): boolean {
  return input.methodPrescription.effort_cap === "capped_amrap"
    && input.actualCompletedSets.some((set) => set.is_amrap && set.hit_cap);
}

function timePressure(input: LiveWorkoutCoachingInput): boolean {
  return input.liveTimeRemainingMinutes <= Math.max(8, input.timeAvailableMinutes * 0.15)
    && !activeExerciseIsMissionCritical(input);
}

function shouldRemoveBackoffs(input: LiveWorkoutCoachingInput): boolean {
  return input.methodPrescription.has_backoff_work
    && input.liveTimeRemainingMinutes <= Math.max(12, input.timeAvailableMinutes * 0.2)
    && activeExerciseIsMissionCritical(input);
}

function activeExerciseIsMissionCritical(input: LiveWorkoutCoachingInput): boolean {
  return input.sessionCompositionLayers.some((layer) => layer.layer_id === "mission_critical" && layer.exercise_ids.includes(input.activeExerciseId));
}

function lowerPriorityCompressionLayers(input: LiveWorkoutCoachingInput): LiveSessionLayerId[] {
  const fromDensity = input.densityPlan.time_compression_options.flatMap((option) => option.target_layers);
  const defaultOrder: LiveSessionLayerId[] = ["recovery_mobility_optional", "structural_balance", "weakness_development"];
  return unique([...fromDensity, ...defaultOrder]).filter((layer) => layer !== "mission_critical");
}

function remainingSets(input: LiveWorkoutCoachingInput): number {
  return Math.max(0, input.loadingPrescription.prescribed_sets - input.currentSetNumber);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
