import type { LiveSessionLayerId } from "./live-workout-coaching-engine";
import type { LiveWorkoutEvidenceFlag } from "./live-workout-coaching-engine";
import type { ExecutionQuality, QualityOfExecutionOutput } from "./quality-of-execution-engine";
import type { LiveSafetyPainPolicyOutput } from "./live-safety-pain-policy";
import type { LiveConstraintResolutionOutput } from "./live-constraint-resolution-engine";

export type TrainingEffectRemaining = "high" | "moderate" | "low" | "negligible" | "negative";
export type ProductiveExposureStatus =
  | "productive"
  | "objective_met"
  | "diminishing_returns"
  | "junk_volume_risk"
  | "recovery_budget_exhausted"
  | "unsafe";
export type ProductiveExposureAction =
  | "continue_training"
  | "complete_objective"
  | "reduce_exposure"
  | "terminate_exercise"
  | "terminate_session";

export type ProductiveExposureReasonCode =
  | "productive_exposure_gate"
  | "active_workout_only"
  | "permanent_learning_routes_to_9j"
  | "safety_overrides_productivity"
  | "pain_can_terminate_immediately"
  | "mission_objective_achieved"
  | "diminishing_training_effect"
  | "recovery_budget_exhausted"
  | "time_constraint_considered_last"
  | "lower_priority_layers_removed_first"
  | "poor_quality_work_reduces_exposure"
  | "effort_cap_respected"
  | "backoff_removed_before_primary_work"
  | "mission_critical_protected"
  | "junk_volume_not_rewarded"
  | "training_effect_over_completion_percentage";

export type ProductiveExposureSafetyFlag =
  | "safety_gate_stop"
  | "pain_stop"
  | "quality_breakdown"
  | "recovery_exhausted"
  | "effort_cap_reached";

export interface ProductiveRecoverySummary {
  recovery_status: "recovered" | "recovering" | "borderline" | "compromised" | "critical" | "insufficient_evidence";
  recommended_recovery_bias?: string;
  veto_flags?: string[];
}

export interface ProductiveAdaptationSummary {
  adaptation_status:
    | "adapting"
    | "likely_adapting"
    | "slowing"
    | "plateau_approaching"
    | "plateaued"
    | "saturated"
    | "regressing"
    | "insufficient_evidence";
  confidence: number;
}

export interface ProductiveMethodSummary {
  method_id: string;
  effort_cap: "easy" | "controlled" | "hard_cap" | "capped_amrap" | "no_grind";
  has_backoff_work: boolean;
}

export interface ProductiveLoadingSummary {
  primary_work_completed: boolean;
  backoff_sets_remaining: number;
  prescribed_work_sets: number;
  completed_work_sets: number;
}

export interface ProductiveResourceAllocationSummary {
  mission_critical_minimum_met: boolean;
  primary_support_minimum_met: boolean;
  lower_priority_layers_remaining: LiveSessionLayerId[];
}

export interface ProductiveExposureInput {
  qualityOfExecution: Pick<QualityOfExecutionOutput, "execution_quality" | "learning_weight" | "downstream_learning_permission">;
  recoveryManagement: ProductiveRecoverySummary;
  adaptationStatus: ProductiveAdaptationSummary;
  liveWorkoutCoachingAction?: string;
  sessionLayers: Array<{
    layer_id: LiveSessionLayerId;
    required: boolean;
    objective_achieved: boolean;
  }>;
  resourceAllocation: ProductiveResourceAllocationSummary;
  methodSelection: ProductiveMethodSummary;
  loadingPolicy: ProductiveLoadingSummary;
  liveConstraintResolution?: Pick<LiveConstraintResolutionOutput, "constraint_severity" | "selected_solution" | "safety_flags">;
  safetyPainPolicy?: Pick<LiveSafetyPainPolicyOutput, "safety_decision" | "severity" | "blocked_live_actions">;
  timeRemainingMinutes: number;
  workoutCompletionPercentage: number;
  repeatedPoorQualitySets?: number;
  amrapCapReached?: boolean;
  fatigueBasedMethodCapReached?: boolean;
}

export interface ProductiveExposureOutput {
  training_effect_remaining: TrainingEffectRemaining;
  productive_exposure_status: ProductiveExposureStatus;
  recommended_action: ProductiveExposureAction;
  affected_session_layers: LiveSessionLayerId[];
  reason_codes: ProductiveExposureReasonCode[];
  safety_flags: ProductiveExposureSafetyFlag[];
  evidence_flags_for_9J: LiveWorkoutEvidenceFlag[];
  active_workout_only: true;
  permanent_programming_change_allowed: false;
}

export function evaluateProductiveTrainingExposure(input: ProductiveExposureInput): ProductiveExposureOutput {
  const reasonCodes: ProductiveExposureReasonCode[] = [
    "productive_exposure_gate",
    "active_workout_only",
    "permanent_learning_routes_to_9j",
    "training_effect_over_completion_percentage",
  ];
  const safetyFlags: ProductiveExposureSafetyFlag[] = [];
  const evidenceFlags: LiveWorkoutEvidenceFlag[] = ["completed_sets_reps_load"];

  if (safetyRequiresStop(input)) {
    reasonCodes.push("safety_overrides_productivity", "pain_can_terminate_immediately");
    safetyFlags.push("safety_gate_stop", "pain_stop");
    evidenceFlags.push("pain_flag", "exercise_stopped");
    return output("negative", "unsafe", "terminate_exercise", missionAndAffectedLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (input.recoveryManagement.recovery_status === "critical") {
    reasonCodes.push("recovery_budget_exhausted");
    safetyFlags.push("recovery_exhausted");
    evidenceFlags.push("set_prescription_modified");
    return output("negative", "recovery_budget_exhausted", "terminate_session", nonMissionLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (input.amrapCapReached || input.fatigueBasedMethodCapReached) {
    reasonCodes.push("effort_cap_respected", "junk_volume_not_rewarded");
    safetyFlags.push("effort_cap_reached");
    evidenceFlags.push("set_prescription_modified");
    return output("negligible", "objective_met", "complete_objective", backoffAndLowerLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (input.repeatedPoorQualitySets && input.repeatedPoorQualitySets >= 2) {
    reasonCodes.push("poor_quality_work_reduces_exposure", "junk_volume_not_rewarded");
    safetyFlags.push("quality_breakdown");
    evidenceFlags.push("failed_sets", "set_prescription_modified");
    return output("negative", "junk_volume_risk", "reduce_exposure", backoffAndLowerLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (missionObjectiveAchieved(input)) {
    reasonCodes.push("mission_objective_achieved", "junk_volume_not_rewarded");
    if (input.loadingPolicy.backoff_sets_remaining > 0) {
      reasonCodes.push("backoff_removed_before_primary_work");
      evidenceFlags.push("set_prescription_modified");
    }
    return output("negligible", "objective_met", "complete_objective", backoffAndLowerLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (input.recoveryManagement.recovery_status === "compromised" || input.qualityOfExecution.execution_quality === "poor") {
    reasonCodes.push("recovery_budget_exhausted", "poor_quality_work_reduces_exposure");
    evidenceFlags.push("set_prescription_modified");
    return output("low", "recovery_budget_exhausted", "reduce_exposure", nonMissionLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (diminishingReturns(input)) {
    reasonCodes.push("diminishing_training_effect", "lower_priority_layers_removed_first", "mission_critical_protected");
    evidenceFlags.push("skipped_work");
    return output("low", "diminishing_returns", "reduce_exposure", nonMissionLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  if (input.timeRemainingMinutes <= 5) {
    reasonCodes.push("time_constraint_considered_last", "lower_priority_layers_removed_first");
    evidenceFlags.push("time_compression");
    return output("moderate", "productive", "reduce_exposure", nonMissionLayers(input), reasonCodes, safetyFlags, evidenceFlags);
  }

  return output("high", "productive", "continue_training", [], reasonCodes, safetyFlags, evidenceFlags);
}

function safetyRequiresStop(input: ProductiveExposureInput): boolean {
  return input.safetyPainPolicy?.safety_decision === "stop_workout" ||
    input.safetyPainPolicy?.safety_decision === "stop_exercise" ||
    input.safetyPainPolicy?.severity === "critical" ||
    input.liveConstraintResolution?.constraint_severity === "critical" ||
    (input.liveConstraintResolution?.safety_flags.length ?? 0) > 0;
}

function missionObjectiveAchieved(input: ProductiveExposureInput): boolean {
  return input.resourceAllocation.mission_critical_minimum_met &&
    input.loadingPolicy.primary_work_completed &&
    input.sessionLayers.filter((layer) => layer.required).every((layer) => layer.objective_achieved);
}

function diminishingReturns(input: ProductiveExposureInput): boolean {
  return input.resourceAllocation.mission_critical_minimum_met &&
    input.workoutCompletionPercentage >= 70 &&
    (input.adaptationStatus.adaptation_status === "adapting" || input.adaptationStatus.adaptation_status === "likely_adapting") &&
    input.recoveryManagement.recovery_status !== "recovered" &&
    input.resourceAllocation.lower_priority_layers_remaining.length > 0;
}

function missionAndAffectedLayers(input: ProductiveExposureInput): LiveSessionLayerId[] {
  const activeRequired = input.sessionLayers.filter((layer) => layer.required).map((layer) => layer.layer_id);
  return activeRequired.length ? activeRequired : ["mission_critical"];
}

function nonMissionLayers(input: ProductiveExposureInput): LiveSessionLayerId[] {
  const layers = input.resourceAllocation.lower_priority_layers_remaining.filter((layer) => layer !== "mission_critical");
  return layers.length ? layers : input.sessionLayers.filter((layer) => !layer.required).map((layer) => layer.layer_id);
}

function backoffAndLowerLayers(input: ProductiveExposureInput): LiveSessionLayerId[] {
  const layers = nonMissionLayers(input);
  return input.loadingPolicy.backoff_sets_remaining > 0 ? Array.from(new Set(["primary_support" as const, ...layers])) : layers;
}

function output(
  remaining: TrainingEffectRemaining,
  status: ProductiveExposureStatus,
  action: ProductiveExposureAction,
  affectedLayers: LiveSessionLayerId[],
  reasonCodes: ProductiveExposureReasonCode[],
  safetyFlags: ProductiveExposureSafetyFlag[],
  evidenceFlags: LiveWorkoutEvidenceFlag[],
): ProductiveExposureOutput {
  return {
    training_effect_remaining: remaining,
    productive_exposure_status: status,
    recommended_action: action,
    affected_session_layers: Array.from(new Set(affectedLayers)),
    reason_codes: Array.from(new Set(reasonCodes)),
    safety_flags: Array.from(new Set(safetyFlags)),
    evidence_flags_for_9J: Array.from(new Set(evidenceFlags)),
    active_workout_only: true,
    permanent_programming_change_allowed: false,
  };
}

export const productiveTrainingExposureArchitectureNotes = {
  decision_id: "10E",
  active_workout_only: true,
  permanent_programming_change_allowed: false,
  consumed_by_live_workout_coaching_engine: true,
  coaching_learning_routes_to_9j: true,
} as const;
