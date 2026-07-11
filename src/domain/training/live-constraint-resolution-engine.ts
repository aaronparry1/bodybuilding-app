import type {
  LiveDensityPlanSummary,
  LiveRecoveryBetweenEffortsGuidance,
  LiveSessionCompositionLayer,
} from "./live-workout-coaching-engine";

export type LiveConstraintCategory =
  | "safety"
  | "equipment"
  | "environment"
  | "time"
  | "performance"
  | "user_choice";

export type LiveConstraintSeverity = "none" | "low" | "moderate" | "high" | "critical";

export type LiveConstraintSignal =
  | "none"
  | "pain"
  | "injury"
  | "dizziness"
  | "equipment_failure"
  | "medical_concern"
  | "equipment_unavailable"
  | "machine_occupied"
  | "rack_unavailable"
  | "missing_equipment"
  | "home_gym_limitation"
  | "crowded_gym"
  | "travel"
  | "limited_space"
  | "unexpected_interruption"
  | "gym_closing"
  | "session_running_long"
  | "user_interruption"
  | "shortened_availability"
  | "repeated_failed_sets"
  | "technique_breakdown"
  | "fatigue_spike"
  | "unexpected_weakness"
  | "dislike"
  | "skip_request"
  | "preference"
  | "manual_override";

export type LiveConstraintSolutionLevel =
  | "level_1_continue_unchanged"
  | "level_2_modify_prescription"
  | "level_3_reorder_or_compress"
  | "level_4_substitute_exercise"
  | "level_5_restructure_remaining_session"
  | "level_6_terminate";

export type LiveConstraintSolutionAction =
  | "continue_unchanged"
  | "modify_load"
  | "modify_reps"
  | "modify_rom"
  | "modify_tempo"
  | "modify_grip"
  | "extend_recovery"
  | "reorder_exercises"
  | "compress_density"
  | "increase_pairing"
  | "remove_lower_priority_work"
  | "substitute_exercise"
  | "restructure_remaining_session"
  | "terminate_exercise"
  | "terminate_workout";

export type LiveConstraintReasonCode =
  | "constraint_classified"
  | "active_session_only_no_programme_mutation"
  | "lowest_cost_solution_first"
  | "primary_objective_preserved"
  | "safety_overrides_all"
  | "time_uses_density_and_composition_first"
  | "equipment_reorder_before_substitution"
  | "performance_load_recovery_before_substitution"
  | "substitution_requires_exercise_matching_engine"
  | "coaching_evidence_emitted"
  | "no_independent_matching_logic"
  | "user_override_respected_with_guardrails";

export type LiveConstraintSafetyFlag =
  | "pain_or_medical_stop"
  | "dizziness_or_medical_concern"
  | "unsafe_equipment"
  | "technique_breakdown"
  | "mission_critical_at_risk";

export type LiveConstraintEvidenceSignal =
  | "pain_reported"
  | "exercise_substituted"
  | "time_compressed"
  | "failed_sets"
  | "early_termination"
  | "method_modified"
  | "session_completed";

export type LiveConstraintCost = "none" | "low" | "moderate" | "high" | "critical";

export interface LiveConstraintResolutionInput {
  activeExerciseId: string;
  sessionObjective: string;
  primaryObjectiveExerciseIds: string[];
  constraintSignal: LiveConstraintSignal;
  painIssueFlag?: "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
  failedSets?: number;
  techniqueBreakdown?: boolean;
  fatigueSpike?: boolean;
  equipmentIssueCanBeSolvedLater?: boolean;
  availableAlternativeSameObjective?: boolean;
  exerciseMatchingAvailable?: boolean;
  densityPlan?: Pick<LiveDensityPlanSummary, "time_compression_options">;
  sessionCompositionLayers?: LiveSessionCompositionLayer[];
  recoveryBetweenEffortsGuidance?: LiveRecoveryBetweenEffortsGuidance;
  liveTimeRemainingMinutes?: number;
  remainingExerciseIds?: string[];
  blockedExerciseIds?: string[];
  userOverrideAllowed?: boolean;
}

export interface RankedLiveConstraintSolutionOption {
  level: LiveConstraintSolutionLevel;
  action: LiveConstraintSolutionAction;
  preserves_session_objective: boolean;
  requires_exercise_matching_engine: boolean;
  estimated_cost: LiveConstraintCost;
  rationale: string;
}

export interface RequiredExerciseSubstitution {
  required: boolean;
  handoff_to_exercise_matching_engine: boolean;
  blocked_exercise_id?: string;
  required_support_function_or_objective?: string;
}

export interface LiveConstraintEvidenceFor9J {
  signal: LiveConstraintEvidenceSignal;
  evidence_flags: string[];
  reason_codes: LiveConstraintReasonCode[];
  safety_related: boolean;
}

export interface LiveConstraintResolutionOutput {
  identified_constraint: {
    category: LiveConstraintCategory;
    signal: LiveConstraintSignal;
  };
  constraint_severity: LiveConstraintSeverity;
  ranked_solution_options: RankedLiveConstraintSolutionOption[];
  selected_solution: RankedLiveConstraintSolutionOption;
  if_required_exercise_substitution: RequiredExerciseSubstitution;
  confidence: number;
  reason_codes: LiveConstraintReasonCode[];
  safety_flags: LiveConstraintSafetyFlag[];
  evidence_for_9J: LiveConstraintEvidenceFor9J[];
  active_session_only: true;
  permanent_mutation_allowed: false;
}

export function resolveLiveWorkoutConstraint(input: LiveConstraintResolutionInput): LiveConstraintResolutionOutput {
  const category = classifyConstraint(input.constraintSignal);
  const severity = determineSeverity(input, category);
  const safetyFlags = collectSafetyFlags(input, category, severity);
  const reasonCodes = collectReasonCodes(input, category);
  const rankedOptions = rankSolutions(input, category, severity);
  const selectedSolution = rankedOptions[0] ?? option(
    "level_1_continue_unchanged",
    "continue_unchanged",
    true,
    false,
    "none",
    "No live constraint needs a coaching change.",
  );
  const substitutionRequired = selectedSolution.action === "substitute_exercise";
  const evidence = buildEvidence(input, category, selectedSolution, reasonCodes, safetyFlags.length > 0);

  return {
    identified_constraint: {
      category,
      signal: input.constraintSignal,
    },
    constraint_severity: severity,
    ranked_solution_options: rankedOptions,
    selected_solution: selectedSolution,
    if_required_exercise_substitution: {
      required: substitutionRequired,
      handoff_to_exercise_matching_engine: substitutionRequired,
      blocked_exercise_id: substitutionRequired ? input.activeExerciseId : undefined,
      required_support_function_or_objective: substitutionRequired ? input.sessionObjective : undefined,
    },
    confidence: determineConfidence(input, category, severity, rankedOptions),
    reason_codes: reasonCodes,
    safety_flags: safetyFlags,
    evidence_for_9J: evidence,
    active_session_only: true,
    permanent_mutation_allowed: false,
  };
}

function classifyConstraint(signal: LiveConstraintSignal): LiveConstraintCategory {
  if (["pain", "injury", "dizziness", "equipment_failure", "medical_concern"].includes(signal)) {
    return "safety";
  }
  if (["equipment_unavailable", "machine_occupied", "rack_unavailable", "missing_equipment", "home_gym_limitation"].includes(signal)) {
    return "equipment";
  }
  if (["crowded_gym", "travel", "limited_space", "unexpected_interruption"].includes(signal)) {
    return "environment";
  }
  if (["gym_closing", "session_running_long", "user_interruption", "shortened_availability"].includes(signal)) {
    return "time";
  }
  if (["repeated_failed_sets", "technique_breakdown", "fatigue_spike", "unexpected_weakness"].includes(signal)) {
    return "performance";
  }
  if (["dislike", "skip_request", "preference", "manual_override"].includes(signal)) {
    return "user_choice";
  }
  return "performance";
}

function determineSeverity(input: LiveConstraintResolutionInput, category: LiveConstraintCategory): LiveConstraintSeverity {
  if (input.constraintSignal === "none") {
    return "none";
  }
  if (input.painIssueFlag === "unsafe" || input.constraintSignal === "dizziness" || input.constraintSignal === "medical_concern") {
    return "critical";
  }
  if (input.painIssueFlag === "pain" || input.constraintSignal === "injury") {
    return "high";
  }
  if (input.constraintSignal === "equipment_failure") {
    return "high";
  }
  if (input.techniqueBreakdown || input.constraintSignal === "technique_breakdown") {
    return "high";
  }
  if ((input.failedSets ?? 0) >= 2 || input.constraintSignal === "repeated_failed_sets") {
    return "high";
  }
  if (category === "time" && (input.liveTimeRemainingMinutes ?? 999) <= 5) {
    return "high";
  }
  if (category === "time" && (input.liveTimeRemainingMinutes ?? 999) <= 15) {
    return "moderate";
  }
  if (category === "safety" || category === "performance") {
    return "moderate";
  }
  if (category === "equipment" || category === "environment") {
    return "moderate";
  }
  return "low";
}

function collectReasonCodes(input: LiveConstraintResolutionInput, category: LiveConstraintCategory): LiveConstraintReasonCode[] {
  const reasons: LiveConstraintReasonCode[] = [
    "constraint_classified",
    "active_session_only_no_programme_mutation",
    "lowest_cost_solution_first",
    "coaching_evidence_emitted",
  ];

  if (category === "safety") {
    reasons.push("safety_overrides_all");
  }
  if (category === "time") {
    reasons.push("time_uses_density_and_composition_first");
  }
  if (category === "equipment" || category === "environment") {
    reasons.push("equipment_reorder_before_substitution");
  }
  if (category === "performance") {
    reasons.push("performance_load_recovery_before_substitution");
  }
  if (category === "user_choice") {
    reasons.push("user_override_respected_with_guardrails");
  }
  if (input.exerciseMatchingAvailable || input.availableAlternativeSameObjective) {
    reasons.push("substitution_requires_exercise_matching_engine", "no_independent_matching_logic");
  }
  if (isPrimaryObjectiveExercise(input)) {
    reasons.push("primary_objective_preserved");
  }

  return unique(reasons);
}

function collectSafetyFlags(
  input: LiveConstraintResolutionInput,
  category: LiveConstraintCategory,
  severity: LiveConstraintSeverity,
): LiveConstraintSafetyFlag[] {
  const flags: LiveConstraintSafetyFlag[] = [];
  if (input.painIssueFlag === "pain" || input.painIssueFlag === "unsafe" || input.constraintSignal === "pain" || input.constraintSignal === "injury") {
    flags.push("pain_or_medical_stop");
  }
  if (input.constraintSignal === "dizziness" || input.constraintSignal === "medical_concern") {
    flags.push("dizziness_or_medical_concern");
  }
  if (input.constraintSignal === "equipment_failure") {
    flags.push("unsafe_equipment");
  }
  if (input.techniqueBreakdown || input.constraintSignal === "technique_breakdown") {
    flags.push("technique_breakdown");
  }
  if (category === "time" && severity === "high" && isPrimaryObjectiveExercise(input)) {
    flags.push("mission_critical_at_risk");
  }
  return unique(flags);
}

function rankSolutions(
  input: LiveConstraintResolutionInput,
  category: LiveConstraintCategory,
  severity: LiveConstraintSeverity,
): RankedLiveConstraintSolutionOption[] {
  if (severity === "none") {
    return [option("level_1_continue_unchanged", "continue_unchanged", true, false, "none", "No constraint is present.")];
  }

  if (category === "safety") {
    return rankSafetySolutions(input);
  }
  if (category === "equipment" || category === "environment") {
    return rankEquipmentEnvironmentSolutions(input);
  }
  if (category === "time") {
    return rankTimeSolutions(input);
  }
  if (category === "performance") {
    return rankPerformanceSolutions(input);
  }
  return rankUserChoiceSolutions(input);
}

function rankSafetySolutions(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption[] {
  if (input.constraintSignal === "dizziness" || input.constraintSignal === "medical_concern" || input.painIssueFlag === "unsafe") {
    return [
      option("level_6_terminate", "terminate_workout", false, false, "critical", "Safety constraint requires stopping the workout."),
      option("level_6_terminate", "terminate_exercise", false, false, "high", "Stopping only the exercise is rejected when the whole session is unsafe."),
    ];
  }
  if (input.constraintSignal === "equipment_failure") {
    return [
      option("level_6_terminate", "terminate_exercise", true, false, "high", "Unsafe equipment means this exercise must stop."),
      substitutionOption(input),
      option("level_5_restructure_remaining_session", "restructure_remaining_session", true, false, "moderate", "Restructure remaining work if the equipment cannot be used safely."),
    ];
  }
  return [
    option("level_6_terminate", "terminate_exercise", true, false, "high", "Pain or injury stops the affected exercise."),
    substitutionOption(input),
    option("level_2_modify_prescription", "modify_rom", true, false, "moderate", "Range adjustment is lower priority after a pain flag."),
  ];
}

function rankEquipmentEnvironmentSolutions(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption[] {
  const solutions: RankedLiveConstraintSolutionOption[] = [];
  if (input.equipmentIssueCanBeSolvedLater !== false && (input.remainingExerciseIds?.length ?? 0) > 0) {
    solutions.push(option("level_3_reorder_or_compress", "reorder_exercises", true, false, "low", "Do other compatible work first and return later."));
  }
  solutions.push(option("level_3_reorder_or_compress", "remove_lower_priority_work", true, false, "moderate", "Remove lower-priority work only if the constraint persists."));
  if (input.exerciseMatchingAvailable && input.availableAlternativeSameObjective) {
    solutions.push(substitutionOption(input));
  }
  solutions.push(option("level_5_restructure_remaining_session", "restructure_remaining_session", true, false, "high", "Restructure the session only after lower-cost options fail."));
  return solutions;
}

function rankTimeSolutions(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption[] {
  const solutions: RankedLiveConstraintSolutionOption[] = [];
  if ((input.densityPlan?.time_compression_options.length ?? 0) > 0) {
    solutions.push(option("level_3_reorder_or_compress", "compress_density", true, false, "low", "Use the Session Density plan before cutting core work."));
  }
  if (hasRemovableLowerPriorityLayer(input.sessionCompositionLayers ?? [])) {
    solutions.push(option("level_3_reorder_or_compress", "remove_lower_priority_work", true, false, "moderate", "Remove lower-priority layers before touching mission-critical work."));
  }
  solutions.push(option("level_5_restructure_remaining_session", "restructure_remaining_session", true, false, "high", "Restructure remaining work if compression cannot preserve the objective."));
  solutions.push(option("level_6_terminate", "terminate_workout", false, false, "critical", "Terminate only if time or safety prevents useful remaining work."));
  return solutions;
}

function rankPerformanceSolutions(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption[] {
  if (input.techniqueBreakdown || input.constraintSignal === "technique_breakdown") {
    return [
      option("level_2_modify_prescription", "modify_load", true, false, "low", "Reduce load before changing the exercise."),
      option("level_2_modify_prescription", "extend_recovery", true, false, "low", "Extend recovery to protect technique."),
      option("level_6_terminate", "terminate_exercise", true, false, "high", "Stop the exercise if technique remains unsafe."),
    ];
  }
  if (input.fatigueSpike || input.constraintSignal === "fatigue_spike") {
    return [
      option("level_2_modify_prescription", "extend_recovery", true, false, "low", "Use the Recovery Between Efforts guidance first."),
      option("level_2_modify_prescription", "modify_reps", true, false, "low", "Reduce reps before substituting the exercise."),
      option("level_3_reorder_or_compress", "remove_lower_priority_work", true, false, "moderate", "Protect mission-critical work by removing lower-priority fatigue."),
    ];
  }
  return [
    option("level_2_modify_prescription", "modify_load", true, false, "low", "Repeated failure should reduce load before substitution."),
    option("level_2_modify_prescription", "extend_recovery", true, false, "low", "Recovery adjustment is a smaller intervention than substitution."),
    option("level_2_modify_prescription", "modify_reps", true, false, "moderate", "Reduce reps if load and recovery adjustments are insufficient."),
    option("level_6_terminate", "terminate_exercise", true, false, "high", "Stop the exercise only if repeated failure continues."),
  ];
}

function rankUserChoiceSolutions(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption[] {
  if (!input.userOverrideAllowed) {
    return [option("level_1_continue_unchanged", "continue_unchanged", true, false, "none", "Manual change is not allowed for this live context.")];
  }
  const solutions: RankedLiveConstraintSolutionOption[] = [
    option("level_2_modify_prescription", "modify_grip", true, false, "low", "Try a small preference-compatible adjustment first."),
    option("level_2_modify_prescription", "modify_tempo", true, false, "low", "Technique feel can be adjusted without changing the exercise."),
  ];
  if (input.constraintSignal === "skip_request") {
    solutions.unshift(option("level_3_reorder_or_compress", "remove_lower_priority_work", !isPrimaryObjectiveExercise(input), false, "moderate", "Skip lower-priority work only when it does not remove the session objective."));
  }
  if (input.exerciseMatchingAvailable && input.availableAlternativeSameObjective) {
    solutions.push(substitutionOption(input));
  }
  return solutions;
}

function substitutionOption(input: LiveConstraintResolutionInput): RankedLiveConstraintSolutionOption {
  return option(
    "level_4_substitute_exercise",
    "substitute_exercise",
    true,
    true,
    "moderate",
    input.exerciseMatchingAvailable
      ? "Substitution requires Exercise Matching to preserve the objective."
      : "Substitution is blocked until Exercise Matching provides a safe candidate.",
  );
}

function option(
  level: LiveConstraintSolutionLevel,
  action: LiveConstraintSolutionAction,
  preservesObjective: boolean,
  requiresExerciseMatching: boolean,
  cost: LiveConstraintCost,
  rationale: string,
): RankedLiveConstraintSolutionOption {
  return {
    level,
    action,
    preserves_session_objective: preservesObjective,
    requires_exercise_matching_engine: requiresExerciseMatching,
    estimated_cost: cost,
    rationale,
  };
}

function buildEvidence(
  input: LiveConstraintResolutionInput,
  category: LiveConstraintCategory,
  selected: RankedLiveConstraintSolutionOption,
  reasonCodes: LiveConstraintReasonCode[],
  safetyRelated: boolean,
): LiveConstraintEvidenceFor9J[] {
  const signal = evidenceSignal(input, category, selected);
  return [
    {
      signal,
      evidence_flags: [
        `constraint:${category}`,
        `signal:${input.constraintSignal}`,
        `selected:${selected.action}`,
      ],
      reason_codes: reasonCodes,
      safety_related: safetyRelated,
    },
  ];
}

function evidenceSignal(
  input: LiveConstraintResolutionInput,
  category: LiveConstraintCategory,
  selected: RankedLiveConstraintSolutionOption,
): LiveConstraintEvidenceSignal {
  if (category === "safety" && (input.constraintSignal === "pain" || input.constraintSignal === "injury")) {
    return "pain_reported";
  }
  if (selected.action === "substitute_exercise") {
    return "exercise_substituted";
  }
  if (selected.action === "compress_density" || selected.action === "remove_lower_priority_work") {
    return "time_compressed";
  }
  if (category === "performance") {
    return "failed_sets";
  }
  if (selected.action === "terminate_exercise" || selected.action === "terminate_workout") {
    return "early_termination";
  }
  if (selected.action !== "continue_unchanged") {
    return "method_modified";
  }
  return "session_completed";
}

function determineConfidence(
  input: LiveConstraintResolutionInput,
  category: LiveConstraintCategory,
  severity: LiveConstraintSeverity,
  rankedOptions: RankedLiveConstraintSolutionOption[],
): number {
  let confidence = 72;
  if (severity === "critical" || severity === "high") confidence += 10;
  if (category === "safety") confidence += 8;
  if (rankedOptions.length > 1) confidence += 4;
  if (input.exerciseMatchingAvailable === false && rankedOptions.some((solution) => solution.requires_exercise_matching_engine)) confidence -= 18;
  if (input.constraintSignal === "none") confidence = 88;
  return clamp(confidence, 35, 95);
}

function hasRemovableLowerPriorityLayer(layers: LiveSessionCompositionLayer[]): boolean {
  return layers.some((layer) => !layer.required && layer.layer_id !== "mission_critical");
}

function isPrimaryObjectiveExercise(input: LiveConstraintResolutionInput): boolean {
  return input.primaryObjectiveExerciseIds.includes(input.activeExerciseId);
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const liveConstraintResolutionArchitectureNotes = {
  decision_id: "10B",
  owns_live_constraint_resolution: true,
  active_session_only: true,
  permanent_mutation_allowed: false,
  exercise_substitution_requires_exercise_matching_engine: true,
  loading_recovery_density_and_composition_are_orchestrated_not_reimplemented: true,
} as const;
