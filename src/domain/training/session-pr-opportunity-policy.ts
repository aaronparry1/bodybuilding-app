import type { RawEvidenceSignal } from "./coaching-evidence-engine";

export type SessionPrType =
  | "load_pr"
  | "rep_pr"
  | "estimated_1rm_pr"
  | "volume_pr"
  | "density_pr"
  | "set_quality_pr"
  | "consistency_pr"
  | "exercise_variation_pr"
  | "recovery_friendly_pr";

export type SessionPrRiskLevel = "low" | "moderate" | "high" | "blocked";

export type SessionPrReasonCode =
  | "session_pr_opportunity_policy"
  | "progress_not_pressure"
  | "supports_session_objective"
  | "small_realistic_target"
  | "low_cost_pr_for_limited_recovery"
  | "taxing_pr_requires_recovery_adaptation_safety"
  | "unsafe_pr_blocked"
  | "deload_or_pivot_uses_recovery_friendly_pr"
  | "method_effort_cap_respected"
  | "live_workout_coaching_final_gate"
  | "productive_exposure_final_gate"
  | "pr_outcome_routes_to_9j"
  | "no_direct_programming_change";

export interface SessionPrExerciseHistory {
  exercise_id: string;
  exercise_name: string;
  movement_pattern: string;
  last_load?: number;
  best_load?: number;
  best_reps_at_load?: number;
  best_estimated_1rm?: number;
  best_volume?: number;
  best_density_work_per_minute?: number;
  recent_consistency_streak?: number;
  variation_recently_introduced?: boolean;
}

export interface SessionPrInput {
  session_objective: string;
  training_state: "Foundation" | "Accumulation" | "Intensification" | "Realisation" | "Pivot" | "Deload";
  selected_method: {
    method_id: string;
    effort_cap: "easy" | "controlled" | "hard_cap" | "capped_amrap" | "no_grind";
    allows_taxing_pr: boolean;
  };
  loading_prescription: {
    target_exercise_id: string;
    prescribed_load?: number;
    prescribed_reps?: number;
    prescribed_sets?: number;
  };
  exercise_history: SessionPrExerciseHistory[];
  recent_pr_history: Array<{
    pr_type: SessionPrType;
    exercise_id: string;
    achieved_at: string;
  }>;
  adaptation_status: "adapting" | "likely_adapting" | "slowing" | "plateau_approaching" | "plateaued" | "saturated" | "regressing" | "insufficient_evidence";
  recovery_status: "recovered" | "recovering" | "borderline" | "compromised" | "critical" | "insufficient_evidence";
  pain_safety_flags: string[];
  execution_quality_history: Array<"excellent" | "good" | "acceptable" | "questionable" | "poor" | "invalid">;
  athlete_model_summary?: {
    experience?: "beginner" | "intermediate" | "advanced";
    recovery_capacity?: "low" | "moderate" | "high" | "unknown";
  };
  intervention_outputs?: {
    selected_intervention?: string;
    reason_codes?: string[];
  };
}

export interface SelectedPrOpportunity {
  pr_type: SessionPrType;
  target_exercise: string;
  target_metric: string;
  target_threshold: string;
}

export interface SessionPrOpportunityOutput {
  selected_pr_opportunity: SelectedPrOpportunity | null;
  pr_type: SessionPrType | "none";
  target_exercise: string | null;
  target_metric: string | null;
  target_threshold: string | null;
  confidence: number;
  risk_level: SessionPrRiskLevel;
  reason_codes: SessionPrReasonCode[];
  fallback_pr_option: SelectedPrOpportunity | null;
  user_facing_message: string;
  evidence_flags_for_9J: RawEvidenceSignal[];
  live_workout_coaching_must_confirm: true;
  productive_exposure_must_confirm: true;
  direct_programming_change_allowed: false;
}

export function chooseSessionPrOpportunity(input: SessionPrInput): SessionPrOpportunityOutput {
  const reasons: SessionPrReasonCode[] = [
    "session_pr_opportunity_policy",
    "progress_not_pressure",
    "live_workout_coaching_final_gate",
    "productive_exposure_final_gate",
    "pr_outcome_routes_to_9j",
    "no_direct_programming_change",
  ];
  const target = targetExercise(input);
  const fallback = fallbackOpportunity(input, target);

  if (unsafeForPhysicalPr(input)) {
    reasons.push("unsafe_pr_blocked");
    if (fallback) {
      reasons.push("deload_or_pivot_uses_recovery_friendly_pr", "low_cost_pr_for_limited_recovery");
      return buildOutput(fallback, fallback, "low", 72, reasons, "Small progress target. No pressure today.");
    }
    return noOpportunity(reasons);
  }

  if (recoveryLimited(input)) {
    reasons.push("low_cost_pr_for_limited_recovery");
    if (!fallback) return noOpportunity(reasons);
    return buildOutput(fallback, fallback, "low", 76, reasons, "Aim for a clean, low-cost win today.");
  }

  if (!methodAllowsTaxingPr(input)) {
    reasons.push("method_effort_cap_respected");
    if (!fallback) return noOpportunity(reasons);
    return buildOutput(fallback, fallback, "low", 78, reasons, "Progress target stays within today's effort cap.");
  }

  const taxing = taxingOpportunity(input, target);
  if (taxing) {
    reasons.push("supports_session_objective", "small_realistic_target", "taxing_pr_requires_recovery_adaptation_safety");
    return buildOutput(taxing, fallback, riskFor(taxing.pr_type), 84, reasons, "Small PR opportunity if it feels there.");
  }

  if (fallback) {
    reasons.push("supports_session_objective", "small_realistic_target");
    return buildOutput(fallback, fallback, "low", 74, reasons, "Look for a small quality win today.");
  }

  return noOpportunity(reasons);
}

function targetExercise(input: SessionPrInput): SessionPrExerciseHistory | undefined {
  return input.exercise_history.find((exercise) => exercise.exercise_id === input.loading_prescription.target_exercise_id) ??
    input.exercise_history[0];
}

function unsafeForPhysicalPr(input: SessionPrInput): boolean {
  return input.recovery_status === "critical" ||
    input.pain_safety_flags.length > 0 ||
    input.execution_quality_history.slice(-2).some((quality) => quality === "poor" || quality === "invalid");
}

function recoveryLimited(input: SessionPrInput): boolean {
  return input.recovery_status === "borderline" ||
    input.recovery_status === "compromised" ||
    input.training_state === "Deload" ||
    input.training_state === "Pivot";
}

function methodAllowsTaxingPr(input: SessionPrInput): boolean {
  return input.selected_method.allows_taxing_pr &&
    input.selected_method.effort_cap !== "easy" &&
    input.selected_method.effort_cap !== "no_grind";
}

function taxingOpportunity(input: SessionPrInput, target?: SessionPrExerciseHistory): SelectedPrOpportunity | null {
  if (!target) return null;
  const load = input.loading_prescription.prescribed_load;
  const reps = input.loading_prescription.prescribed_reps;
  const sets = input.loading_prescription.prescribed_sets;

  if ((input.training_state === "Intensification" || input.training_state === "Realisation") && load && target.best_load && load >= target.best_load) {
    return {
      pr_type: "load_pr",
      target_exercise: target.exercise_name,
      target_metric: "load",
      target_threshold: `match or beat ${target.best_load} with crisp execution`,
    };
  }

  if (reps && target.best_reps_at_load && load && target.last_load === load) {
    return {
      pr_type: "rep_pr",
      target_exercise: target.exercise_name,
      target_metric: "reps at load",
      target_threshold: `${target.best_reps_at_load + 1} reps at ${load}`,
    };
  }

  if (sets && reps && load && input.training_state === "Accumulation") {
    return {
      pr_type: "volume_pr",
      target_exercise: target.exercise_name,
      target_metric: "quality volume",
      target_threshold: `${sets * reps * load} total load with no missed sets`,
    };
  }

  return null;
}

function fallbackOpportunity(input: SessionPrInput, target?: SessionPrExerciseHistory): SelectedPrOpportunity | null {
  if (!target) return null;
  if (input.pain_safety_flags.length > 0 ||
    input.recovery_status === "borderline" ||
    input.recovery_status === "compromised" ||
    input.recovery_status === "critical" ||
    input.training_state === "Deload" ||
    input.training_state === "Pivot") {
    return {
      pr_type: "recovery_friendly_pr",
      target_exercise: target.exercise_name,
      target_metric: "recovery-friendly completion",
      target_threshold: "complete clean work without chasing fatigue",
    };
  }
  if (target.variation_recently_introduced) {
    return {
      pr_type: "exercise_variation_pr",
      target_exercise: target.exercise_name,
      target_metric: "variation ownership",
      target_threshold: "complete the planned work cleanly",
    };
  }
  if (input.execution_quality_history.slice(-3).every((quality) => quality === "excellent" || quality === "good")) {
    return {
      pr_type: "consistency_pr",
      target_exercise: target.exercise_name,
      target_metric: "consistency",
      target_threshold: "stack another clean session",
    };
  }
  return {
    pr_type: "set_quality_pr",
    target_exercise: target.exercise_name,
    target_metric: "set quality",
    target_threshold: "complete all target sets without technical grind",
  };
}

function riskFor(type: SessionPrType): SessionPrRiskLevel {
  if (type === "load_pr" || type === "estimated_1rm_pr") return "moderate";
  if (type === "volume_pr" || type === "density_pr") return "moderate";
  return "low";
}

function buildOutput(
  selected: SelectedPrOpportunity,
  fallback: SelectedPrOpportunity | null,
  risk: SessionPrRiskLevel,
  confidence: number,
  reasons: SessionPrReasonCode[],
  message: string,
): SessionPrOpportunityOutput {
  return {
    selected_pr_opportunity: selected,
    pr_type: selected.pr_type,
    target_exercise: selected.target_exercise,
    target_metric: selected.target_metric,
    target_threshold: selected.target_threshold,
    confidence,
    risk_level: risk,
    reason_codes: Array.from(new Set(reasons)),
    fallback_pr_option: fallback,
    user_facing_message: message,
    evidence_flags_for_9J: ["performance_improved"],
    live_workout_coaching_must_confirm: true,
    productive_exposure_must_confirm: true,
    direct_programming_change_allowed: false,
  };
}

function noOpportunity(reasons: SessionPrReasonCode[]): SessionPrOpportunityOutput {
  return {
    selected_pr_opportunity: null,
    pr_type: "none",
    target_exercise: null,
    target_metric: null,
    target_threshold: null,
    confidence: 70,
    risk_level: "blocked",
    reason_codes: Array.from(new Set([...reasons, "unsafe_pr_blocked"])),
    fallback_pr_option: null,
    user_facing_message: "No PR target today. Train clean and safe.",
    evidence_flags_for_9J: [],
    live_workout_coaching_must_confirm: true,
    productive_exposure_must_confirm: true,
    direct_programming_change_allowed: false,
  };
}

export const sessionPrOpportunityArchitectureNotes = {
  decision_id: "10H",
  identifies_pr_opportunity_only: true,
  live_workout_coaching_final_gate: true,
  productive_exposure_final_gate: true,
  direct_programming_change_allowed: false,
  reason_codes: ["session_pr_opportunity_policy", "progress_not_pressure"] satisfies SessionPrReasonCode[],
} as const;
