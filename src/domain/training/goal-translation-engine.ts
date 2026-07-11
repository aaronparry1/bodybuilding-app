import type { TrainingGoalId } from "@/domain/training/training-goals";

export type UserStatedGoal =
  | "build_muscle"
  | "get_stronger"
  | "lose_fat"
  | "improve_athletic_performance"
  | "improve_general_fitness"
  | "train_for_sport"
  | "improve_confidence"
  | "stay_healthy"
  | "return_after_time_off"
  | "maintain_strength"
  | "improve_conditioning"
  | string;

export type CoachFacingGoal =
  | TrainingGoalId
  | "general_fitness"
  | "sport_training"
  | "confidence_and_consistency"
  | "health_maintenance"
  | "return_to_training"
  | "strength_maintenance"
  | "conditioning_development";

export type GoalTranslationReasonCode =
  | "goal_translation_engine"
  | "user_outcome_translated_to_training_objectives"
  | "primary_user_priority_preserved"
  | "vague_goal_made_measurable"
  | "conflicting_goals_resolved_safely"
  | "fat_loss_does_not_force_excess_conditioning"
  | "strength_biases_loadable_measurable_progression"
  | "hypertrophy_biases_recoverable_stimulus"
  | "athletic_biases_transfer_power_movement_quality"
  | "general_fitness_biases_sustainable_breadth"
  | "return_after_layoff_biases_foundation_reentry"
  | "downstream_engines_use_translated_objectives";

export type SessionPriorityBias =
  | "strength_first"
  | "hypertrophy_first"
  | "balanced_development"
  | "performance_transfer"
  | "fat_loss_preservation"
  | "conditioning_capacity"
  | "health_consistency"
  | "reentry_foundation";

export type ProgressionExpectation =
  | "conservative_reentry"
  | "steady_skill_and_volume"
  | "loadable_progression_when_owned"
  | "recoverable_volume_progression"
  | "performance_quality_progression"
  | "maintenance_and_consistency"
  | "conditioning_progression_without_lifting_interference";

export type RecoveryPriority = "low" | "moderate" | "high" | "critical";

export type SuccessMetric =
  | "strength_progress"
  | "hypertrophy_progress"
  | "performance_transfer"
  | "conditioning_capacity"
  | "body_composition_preservation"
  | "session_consistency"
  | "pain_free_training_continuity"
  | "confidence_and_adherence"
  | "movement_quality";

export interface GoalTranslationInput {
  user_stated_goal: UserStatedGoal;
  secondary_user_goals?: UserStatedGoal[];
  training_age?: "new" | "returning" | "beginner" | "intermediate" | "advanced" | "unknown";
  current_strength_level?: "low" | "moderate" | "high" | "unknown";
  bodyweight_goal?: "lose_weight" | "gain_weight" | "maintain_weight" | "unknown";
  sport?: string;
  available_equipment?: string[];
  preferred_schedule?: {
    days_per_week?: number;
    minutes_per_session?: number;
  };
  available_time?: "limited" | "normal" | "ample" | "unknown";
  injury_pain_restrictions?: string[];
  adherence_history?: "strong" | "mixed" | "poor" | "unknown";
  living_athlete_model_summary?: {
    recovery_capacity?: "low" | "moderate" | "high" | "unknown";
    learned_strength_bias?: boolean;
    learned_hypertrophy_bias?: boolean;
  };
  coaching_evidence_summary?: {
    confidence?: "low" | "moderate" | "high";
    recurring_pain_flags?: string[];
    successful_goal_biases?: CoachFacingGoal[];
  };
}

export interface GoalTranslationOutput {
  primary_training_goal: CoachFacingGoal;
  secondary_training_goals: CoachFacingGoal[];
  long_term_objective: string;
  current_phase_objective: string;
  session_priority_bias: SessionPriorityBias;
  recommended_training_states: Array<"Foundation" | "Accumulation" | "Intensification" | "Realisation" | "Pivot">;
  progression_expectations: ProgressionExpectation[];
  support_function_priorities: string[];
  energy_system_priorities: string[];
  recovery_priority: RecoveryPriority;
  contraindicated_emphases: string[];
  success_metrics: SuccessMetric[];
  confidence: number;
  reason_codes: GoalTranslationReasonCode[];
  raw_user_goal_consumed: true;
  builds_workouts: false;
}

interface GoalProfile {
  primary: CoachFacingGoal;
  longTerm: string;
  phase: string;
  bias: SessionPriorityBias;
  states: GoalTranslationOutput["recommended_training_states"];
  progression: ProgressionExpectation[];
  support: string[];
  energy: string[];
  recovery: RecoveryPriority;
  contraindicated: string[];
  metrics: SuccessMetric[];
  confidence: number;
  reasons: GoalTranslationReasonCode[];
}

export function translateUserGoalToCoachObjectives(input: GoalTranslationInput): GoalTranslationOutput {
  const primaryProfile = profileFor(input.user_stated_goal);
  const reasons = uniqueReasons([
    "goal_translation_engine",
    "user_outcome_translated_to_training_objectives",
    "primary_user_priority_preserved",
    "downstream_engines_use_translated_objectives",
    ...primaryProfile.reasons,
  ]);

  const secondaryGoals = (input.secondary_user_goals ?? [])
    .map((goal) => profileFor(goal).primary)
    .filter((goal) => goal !== primaryProfile.primary);

  const adjusted = applyContext(input, primaryProfile, reasons);
  const resolvedSecondaries = resolveSecondaryGoals(primaryProfile.primary, secondaryGoals, reasons);

  return {
    primary_training_goal: primaryProfile.primary,
    secondary_training_goals: resolvedSecondaries,
    long_term_objective: adjusted.longTerm,
    current_phase_objective: adjusted.phase,
    session_priority_bias: adjusted.bias,
    recommended_training_states: adjusted.states,
    progression_expectations: adjusted.progression,
    support_function_priorities: adjusted.support,
    energy_system_priorities: adjusted.energy,
    recovery_priority: adjusted.recovery,
    contraindicated_emphases: adjusted.contraindicated,
    success_metrics: adjusted.metrics,
    confidence: adjusted.confidence,
    reason_codes: uniqueReasons(reasons),
    raw_user_goal_consumed: true,
    builds_workouts: false,
  };
}

function profileFor(goal: UserStatedGoal): GoalProfile {
  const normalized = normalizeGoal(goal);
  if (normalized === "build_muscle") {
    return {
      primary: "build_muscle",
      longTerm: "Increase lean muscle through recoverable target-muscle stimulus and consistent progression.",
      phase: "Build quality volume and repeatable hypertrophy stimulus.",
      bias: "hypertrophy_first",
      states: ["Foundation", "Accumulation", "Intensification"],
      progression: ["recoverable_volume_progression", "steady_skill_and_volume"],
      support: ["target_muscle_stimulus", "structural_balance", "joint_health"],
      energy: ["recovery_capacity"],
      recovery: "moderate",
      contraindicated: ["max_effort_chasing", "uncontrolled_failure", "junk_volume"],
      metrics: ["hypertrophy_progress", "session_consistency", "pain_free_training_continuity"],
      confidence: 88,
      reasons: ["hypertrophy_biases_recoverable_stimulus"],
    };
  }
  if (normalized === "get_stronger") {
    return {
      primary: "get_stronger",
      longTerm: "Improve measurable strength in loadable movement patterns.",
      phase: "Prioritise technical consistency, owned loads, and specific strength exposure.",
      bias: "strength_first",
      states: ["Foundation", "Accumulation", "Intensification", "Realisation"],
      progression: ["loadable_progression_when_owned", "steady_skill_and_volume"],
      support: ["primary_strength", "technical_practice", "weak_point_support"],
      energy: ["none"],
      recovery: "high",
      contraindicated: ["excess_conditioning_interference", "high_fatigue_novelty", "unowned_load_jumps"],
      metrics: ["strength_progress", "movement_quality", "session_consistency"],
      confidence: 88,
      reasons: ["strength_biases_loadable_measurable_progression"],
    };
  }
  if (normalized === "lose_fat") {
    return {
      primary: "lose_fat",
      longTerm: "Preserve muscle, strength, and training consistency while body composition changes.",
      phase: "Use lifting to preserve performance and manage fatigue rather than chase calorie burn.",
      bias: "fat_loss_preservation",
      states: ["Foundation", "Accumulation", "Pivot"],
      progression: ["maintenance_and_consistency", "conditioning_progression_without_lifting_interference"],
      support: ["strength_preservation", "hypertrophy_preservation", "recovery_capacity"],
      energy: ["recovery_capacity", "aerobic_base"],
      recovery: "high",
      contraindicated: ["excess_conditioning_interference", "junk_volume", "fatigue_chasing"],
      metrics: ["body_composition_preservation", "strength_progress", "session_consistency"],
      confidence: 84,
      reasons: ["fat_loss_does_not_force_excess_conditioning"],
    };
  }
  if (normalized === "athletic_performance" || normalized === "sport_training") {
    return {
      primary: normalized === "sport_training" ? "sport_training" : "athletic_performance",
      longTerm: "Improve transferable force, power, movement quality, and sport-relevant capacity.",
      phase: "Build strength and power qualities that transfer without burying output under fatigue.",
      bias: "performance_transfer",
      states: ["Foundation", "Accumulation", "Intensification", "Realisation"],
      progression: ["performance_quality_progression", "loadable_progression_when_owned"],
      support: ["power", "speed_strength", "movement_quality", "strength_support"],
      energy: ["alactic_power", "sport_specific_conditioning", "aerobic_base"],
      recovery: "high",
      contraindicated: ["bodybuilding_fatigue_as_primary_goal", "lactate_work_when_recovery_poor", "low_transfer_work_as_main_stimulus"],
      metrics: ["performance_transfer", "movement_quality", "conditioning_capacity"],
      confidence: normalized === "sport_training" ? 76 : 86,
      reasons: ["athletic_biases_transfer_power_movement_quality"],
    };
  }
  if (normalized === "general_fitness") {
    return {
      primary: "general_fitness",
      longTerm: "Improve sustainable strength, movement quality, conditioning, and training consistency.",
      phase: "Build broad, recoverable training capacity with simple measurable progress.",
      bias: "balanced_development",
      states: ["Foundation", "Accumulation", "Pivot"],
      progression: ["steady_skill_and_volume", "conditioning_progression_without_lifting_interference"],
      support: ["movement_balance", "general_strength", "conditioning_capacity", "joint_health"],
      energy: ["aerobic_base", "general_work_capacity", "recovery_capacity"],
      recovery: "moderate",
      contraindicated: ["single_quality_overemphasis", "unnecessary_complexity", "max_effort_chasing"],
      metrics: ["session_consistency", "conditioning_capacity", "movement_quality", "strength_progress"],
      confidence: 78,
      reasons: ["vague_goal_made_measurable", "general_fitness_biases_sustainable_breadth"],
    };
  }
  if (normalized === "return_to_training") {
    return {
      primary: "return_to_training",
      longTerm: "Rebuild training continuity, confidence, and tolerance after time away.",
      phase: "Use conservative re-entry to establish clean exposures and recovery response.",
      bias: "reentry_foundation",
      states: ["Foundation", "Pivot", "Accumulation"],
      progression: ["conservative_reentry", "steady_skill_and_volume"],
      support: ["technical_practice", "joint_health", "movement_balance"],
      energy: ["recovery_capacity"],
      recovery: "critical",
      contraindicated: ["testing_strength_too_early", "high_fatigue_methods", "rapid_volume_spikes"],
      metrics: ["session_consistency", "pain_free_training_continuity", "confidence_and_adherence"],
      confidence: 82,
      reasons: ["return_after_layoff_biases_foundation_reentry"],
    };
  }
  if (normalized === "maintain_strength") {
    return {
      primary: "strength_maintenance",
      longTerm: "Maintain strength and training continuity with economical recoverable work.",
      phase: "Preserve key movement performance without unnecessary fatigue.",
      bias: "strength_first",
      states: ["Foundation", "Accumulation", "Intensification"],
      progression: ["maintenance_and_consistency"],
      support: ["primary_strength", "structural_balance"],
      energy: ["recovery_capacity"],
      recovery: "moderate",
      contraindicated: ["excess_volume_without_need", "unnecessary_testing"],
      metrics: ["strength_progress", "session_consistency", "pain_free_training_continuity"],
      confidence: 80,
      reasons: ["strength_biases_loadable_measurable_progression"],
    };
  }
  if (normalized === "improve_conditioning") {
    return {
      primary: "conditioning_development",
      longTerm: "Improve conditioning while preserving strength, movement quality, and recovery.",
      phase: "Develop aerobic base or work capacity without letting conditioning hijack lifting quality.",
      bias: "conditioning_capacity",
      states: ["Foundation", "Accumulation", "Pivot"],
      progression: ["conditioning_progression_without_lifting_interference", "steady_skill_and_volume"],
      support: ["conditioning_capacity", "movement_balance", "strength_preservation"],
      energy: ["aerobic_base", "general_work_capacity", "recovery_capacity"],
      recovery: "moderate",
      contraindicated: ["conditioning_that_compromises_strength_quality", "uncontrolled_lactate_fatigue"],
      metrics: ["conditioning_capacity", "session_consistency", "pain_free_training_continuity"],
      confidence: 80,
      reasons: ["vague_goal_made_measurable"],
    };
  }
  return {
    primary: "confidence_and_consistency",
    longTerm: "Build training confidence through sustainable, measurable training continuity.",
    phase: "Start with clear wins, simple execution, and evidence gathering.",
    bias: "health_consistency",
    states: ["Foundation", "Accumulation"],
    progression: ["steady_skill_and_volume", "maintenance_and_consistency"],
    support: ["movement_balance", "joint_health", "confidence_and_adherence"],
    energy: ["recovery_capacity"],
    recovery: "moderate",
    contraindicated: ["unnecessary_complexity", "max_effort_chasing"],
    metrics: ["confidence_and_adherence", "session_consistency", "movement_quality"],
    confidence: 62,
    reasons: ["vague_goal_made_measurable"],
  };
}

function normalizeGoal(goal: UserStatedGoal): string {
  const value = goal.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (value === "hypertrophy" || value === "build_muscle") return "build_muscle";
  if (value === "strength" || value === "maximal_strength" || value === "get_stronger" || value === "build_strength") return "get_stronger";
  if (value === "get_lean" || value === "get_leaner" || value === "lose_fat" || value === "fat_loss") return "lose_fat";
  if (value === "athletic_performance" || value === "improve_athletic_performance") return "athletic_performance";
  if (value === "train_for_sport" || value === "sport") return "sport_training";
  if (value === "general_fitness" || value === "improve_general_fitness" || value === "stay_healthy") return "general_fitness";
  if (value === "return_after_time_off" || value === "returning" || value === "comeback") return "return_to_training";
  if (value === "maintain_strength" || value === "maintenance") return "maintain_strength";
  if (value === "improve_conditioning" || value === "conditioning") return "improve_conditioning";
  return value;
}

function applyContext(input: GoalTranslationInput, profile: GoalProfile, reasons: GoalTranslationReasonCode[]): GoalProfile {
  const adjusted: GoalProfile = {
    ...profile,
    states: [...profile.states],
    progression: [...profile.progression],
    support: [...profile.support],
    energy: [...profile.energy],
    contraindicated: [...profile.contraindicated],
    metrics: [...profile.metrics],
    reasons: [...profile.reasons],
  };

  if (input.training_age === "new" || input.training_age === "returning" || input.adherence_history === "poor") {
    adjusted.states = prependUnique(adjusted.states, "Foundation");
    adjusted.progression = prependUnique(adjusted.progression, "conservative_reentry");
    adjusted.recovery = maxRecovery(adjusted.recovery, "high");
    adjusted.confidence = Math.min(adjusted.confidence, 78);
    reasons.push("return_after_layoff_biases_foundation_reentry");
  }

  if ((input.injury_pain_restrictions?.length ?? 0) > 0 || (input.coaching_evidence_summary?.recurring_pain_flags?.length ?? 0) > 0) {
    adjusted.states = prependUnique(adjusted.states, "Foundation");
    adjusted.recovery = maxRecovery(adjusted.recovery, "critical");
    adjusted.contraindicated = uniqueStrings([...adjusted.contraindicated, "pain_aggravating_patterns", "high_risk_loading"]);
    adjusted.metrics = uniqueStrings([...adjusted.metrics, "pain_free_training_continuity"]);
    adjusted.confidence = Math.min(adjusted.confidence, 74);
    reasons.push("conflicting_goals_resolved_safely");
  }

  if (input.bodyweight_goal === "lose_weight" && profile.primary !== "lose_fat") {
    adjusted.energy = uniqueStrings([...adjusted.energy, "recovery_capacity"]);
    adjusted.contraindicated = uniqueStrings([...adjusted.contraindicated, "fatigue_chasing"]);
    reasons.push("fat_loss_does_not_force_excess_conditioning", "conflicting_goals_resolved_safely");
  }

  if (input.sport && (profile.primary === "athletic_performance" || profile.primary === "sport_training")) {
    adjusted.support = uniqueStrings([...adjusted.support, "sport_transfer"]);
    adjusted.metrics = uniqueStrings([...adjusted.metrics, "performance_transfer"]);
  }

  if (input.available_time === "limited" || (input.preferred_schedule?.minutes_per_session ?? 60) < 40) {
    adjusted.contraindicated = uniqueStrings([...adjusted.contraindicated, "unnecessary_complexity", "low_value_optional_work"]);
    adjusted.confidence -= 4;
  }

  adjusted.confidence = clamp(adjusted.confidence, 45, 92);
  return adjusted;
}

function resolveSecondaryGoals(primary: CoachFacingGoal, secondary: CoachFacingGoal[], reasons: GoalTranslationReasonCode[]): CoachFacingGoal[] {
  const unique = uniqueStrings(secondary);
  if (primary === "lose_fat" && unique.includes("conditioning_development")) {
    reasons.push("fat_loss_does_not_force_excess_conditioning");
  }
  if (unique.length > 1) reasons.push("conflicting_goals_resolved_safely");
  return unique.slice(0, 3);
}

function prependUnique<T extends string>(values: T[], value: T): T[] {
  return [value, ...values.filter((item) => item !== value)];
}

function maxRecovery(current: RecoveryPriority, next: RecoveryPriority): RecoveryPriority {
  const order: RecoveryPriority[] = ["low", "moderate", "high", "critical"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}

function uniqueReasons(reasons: GoalTranslationReasonCode[]): GoalTranslationReasonCode[] {
  return [...new Set(reasons)];
}

function uniqueStrings<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export const goalTranslationArchitectureNotes = {
  decisionId: "11A",
  name: "Goal Translation Engine",
  buildsWorkouts: false,
  downstreamEnginesConsumeTranslatedObjectives: true,
  rawUserWordingIsNotAPlan: true,
} as const;
