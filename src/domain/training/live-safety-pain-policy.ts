import type { LiveConstraintSignal, LiveConstraintSolutionAction } from "./live-constraint-resolution-engine";
import type { LiveWorkoutAction } from "./live-workout-coaching-engine";

export type LivePainSafetyCategory =
  | "no_issue"
  | "normal_training_discomfort"
  | "local_muscle_burn"
  | "joint_pain"
  | "sharp_pain"
  | "radiating_pain"
  | "worsening_pain"
  | "technique_breakdown"
  | "dizziness_or_medical_concern"
  | "equipment_safety_issue";

export type LivePainSafetySeverity = "low" | "moderate" | "high" | "critical";

export type LiveSafetyResponse =
  | "continue"
  | "monitor"
  | "reduce_load"
  | "reduce_range_of_motion"
  | "modify_grip_or_stance"
  | "slow_tempo"
  | "extend_rest"
  | "substitute_lower_stress_variation"
  | "stop_exercise"
  | "stop_workout"
  | "recommend_user_seek_professional_advice";

export type LiveSafetyReasonCode =
  | "live_safety_gate"
  | "no_medical_advice"
  | "safety_overrides_progression_density_method_objective"
  | "pain_vetoes_progression"
  | "sharp_radiating_worsening_pain_stops_exercise"
  | "medical_red_flag_stops_workout"
  | "muscle_discomfort_can_monitor"
  | "warmup_pain_conservative_modification"
  | "rom_specific_low_severity_can_reduce_rom"
  | "persistent_pain_requires_stop_or_substitute"
  | "high_risk_method_blocked_or_downgraded"
  | "pain_evidence_routes_to_9j"
  | "not_permanent_injury_assumption";

export type LiveSafetyEvidenceSignal =
  | "no_safety_issue"
  | "pain_reported"
  | "technique_issue_reported"
  | "medical_red_flag_reported"
  | "equipment_safety_issue_reported";

export interface LiveSafetyPainPolicyInput {
  pain_category: LivePainSafetyCategory;
  severity?: LivePainSafetySeverity;
  affected_movement_pattern?: string;
  during_warmup?: boolean;
  pain_only_at_specific_range_of_motion?: boolean;
  persists_after_load_rom_or_grip_modification?: boolean;
  high_risk_method_planned?: boolean;
  planned_live_action?: LiveWorkoutAction;
  medical_red_flag?: boolean;
}

export interface LiveSafetyEvidenceFor9J {
  signal: LiveSafetyEvidenceSignal;
  evidence_flags: string[];
  reason_codes: LiveSafetyReasonCode[];
  safety_related: boolean;
  update_safety_history: boolean;
}

export interface LiveSafetyPainPolicyOutput {
  safety_decision: LiveSafetyResponse;
  allowed_live_actions: LiveSafetyResponse[];
  blocked_live_actions: LiveWorkoutAction[];
  pain_category: LivePainSafetyCategory;
  severity: LivePainSafetySeverity;
  affected_movement_pattern?: string;
  recommended_constraint_solution: {
    constraint_signal: LiveConstraintSignal;
    preferred_action: LiveConstraintSolutionAction;
  };
  evidence_for_9J: LiveSafetyEvidenceFor9J[];
  user_facing_message: string;
  reason_codes: LiveSafetyReasonCode[];
}

export function evaluateLiveSafetyPain(input: LiveSafetyPainPolicyInput): LiveSafetyPainPolicyOutput {
  const severity = input.severity ?? inferSeverity(input);
  const reasonCodes = collectReasonCodes(input, severity);
  const safetyDecision = chooseSafetyDecision(input, severity);
  const allowedActions = allowedResponses(input, severity, safetyDecision);
  const blockedActions = blockedLiveWorkoutActions(input, severity);
  const constraintSolution = recommendedConstraintSolution(input, safetyDecision);

  return {
    safety_decision: safetyDecision,
    allowed_live_actions: allowedActions,
    blocked_live_actions: blockedActions,
    pain_category: input.pain_category,
    severity,
    affected_movement_pattern: input.affected_movement_pattern,
    recommended_constraint_solution: constraintSolution,
    evidence_for_9J: [buildEvidence(input, reasonCodes)],
    user_facing_message: userFacingMessage(safetyDecision),
    reason_codes: reasonCodes,
  };
}

function inferSeverity(input: LiveSafetyPainPolicyInput): LivePainSafetySeverity {
  if (input.medical_red_flag || input.pain_category === "dizziness_or_medical_concern") {
    return "critical";
  }
  if (["sharp_pain", "radiating_pain", "worsening_pain", "equipment_safety_issue"].includes(input.pain_category)) {
    return "high";
  }
  if (input.pain_category === "joint_pain" || input.pain_category === "technique_breakdown") {
    return "moderate";
  }
  return "low";
}

function collectReasonCodes(input: LiveSafetyPainPolicyInput, severity: LivePainSafetySeverity): LiveSafetyReasonCode[] {
  const reasons: LiveSafetyReasonCode[] = [
    "live_safety_gate",
    "no_medical_advice",
    "safety_overrides_progression_density_method_objective",
    "pain_evidence_routes_to_9j",
    "not_permanent_injury_assumption",
  ];

  if (isPainRisk(input.pain_category)) {
    reasons.push("pain_vetoes_progression");
  }
  if (["sharp_pain", "radiating_pain", "worsening_pain"].includes(input.pain_category) || (input.pain_category === "joint_pain" && severity === "high")) {
    reasons.push("sharp_radiating_worsening_pain_stops_exercise");
  }
  if (input.medical_red_flag || input.pain_category === "dizziness_or_medical_concern") {
    reasons.push("medical_red_flag_stops_workout");
  }
  if (input.pain_category === "normal_training_discomfort" || input.pain_category === "local_muscle_burn") {
    reasons.push("muscle_discomfort_can_monitor");
  }
  if (input.during_warmup && isPainRisk(input.pain_category)) {
    reasons.push("warmup_pain_conservative_modification");
  }
  if (input.pain_only_at_specific_range_of_motion && severity === "low") {
    reasons.push("rom_specific_low_severity_can_reduce_rom");
  }
  if (input.persists_after_load_rom_or_grip_modification) {
    reasons.push("persistent_pain_requires_stop_or_substitute");
  }
  if (input.high_risk_method_planned && isPainRisk(input.pain_category)) {
    reasons.push("high_risk_method_blocked_or_downgraded");
  }

  return Array.from(new Set(reasons));
}

function chooseSafetyDecision(input: LiveSafetyPainPolicyInput, severity: LivePainSafetySeverity): LiveSafetyResponse {
  if (input.medical_red_flag || input.pain_category === "dizziness_or_medical_concern") {
    return "stop_workout";
  }
  if (input.pain_category === "equipment_safety_issue") {
    return severity === "critical" ? "stop_workout" : "stop_exercise";
  }
  if (["sharp_pain", "radiating_pain", "worsening_pain"].includes(input.pain_category)) {
    return "stop_exercise";
  }
  if (input.persists_after_load_rom_or_grip_modification && isPainRisk(input.pain_category)) {
    return "stop_exercise";
  }
  if (input.high_risk_method_planned && isPainRisk(input.pain_category)) {
    return "substitute_lower_stress_variation";
  }
  if (input.pain_category === "joint_pain" && severity === "high") {
    return "stop_exercise";
  }
  if (input.pain_category === "joint_pain" && input.pain_only_at_specific_range_of_motion && severity === "low") {
    return "reduce_range_of_motion";
  }
  if (input.during_warmup && isPainRisk(input.pain_category)) {
    return "reduce_load";
  }
  if (input.pain_category === "technique_breakdown") {
    return severity === "high" ? "stop_exercise" : "reduce_load";
  }
  if (input.pain_category === "normal_training_discomfort" || input.pain_category === "local_muscle_burn") {
    return "monitor";
  }
  return "continue";
}

function allowedResponses(
  input: LiveSafetyPainPolicyInput,
  severity: LivePainSafetySeverity,
  decision: LiveSafetyResponse,
): LiveSafetyResponse[] {
  if (decision === "stop_workout") {
    return ["stop_workout", "recommend_user_seek_professional_advice"];
  }
  if (decision === "stop_exercise") {
    return ["stop_exercise", "substitute_lower_stress_variation", "recommend_user_seek_professional_advice"];
  }
  if (input.pain_category === "normal_training_discomfort" || input.pain_category === "local_muscle_burn") {
    return ["continue", "monitor", "extend_rest"];
  }
  if (severity === "low") {
    return ["monitor", "reduce_load", "reduce_range_of_motion", "modify_grip_or_stance", "slow_tempo", "extend_rest"];
  }
  return [decision, "extend_rest", "substitute_lower_stress_variation"];
}

function blockedLiveWorkoutActions(input: LiveSafetyPainPolicyInput, severity: LivePainSafetySeverity): LiveWorkoutAction[] {
  const blocked: LiveWorkoutAction[] = ["increase_next_set_load"];
  if (isPainRisk(input.pain_category) || severity === "high" || severity === "critical") {
    blocked.push("compress_lower_priority_layers");
  }
  if (severity === "high" || severity === "critical") {
    blocked.push("no_change", "hold_load");
  }
  if (input.high_risk_method_planned && isPainRisk(input.pain_category)) {
    blocked.push("increase_next_set_load", "no_change");
  }
  return Array.from(new Set(blocked));
}

function recommendedConstraintSolution(
  input: LiveSafetyPainPolicyInput,
  decision: LiveSafetyResponse,
): LiveSafetyPainPolicyOutput["recommended_constraint_solution"] {
  if (decision === "stop_workout") {
    return {
      constraint_signal: "medical_concern",
      preferred_action: "terminate_workout",
    };
  }
  if (decision === "stop_exercise") {
    return {
      constraint_signal: input.pain_category === "equipment_safety_issue" ? "equipment_failure" : "pain",
      preferred_action: "terminate_exercise",
    };
  }
  if (decision === "substitute_lower_stress_variation") {
    return {
      constraint_signal: "pain",
      preferred_action: "substitute_exercise",
    };
  }
  if (decision === "reduce_range_of_motion") {
    return {
      constraint_signal: "pain",
      preferred_action: "modify_rom",
    };
  }
  if (decision === "extend_rest") {
    return {
      constraint_signal: "fatigue_spike",
      preferred_action: "extend_recovery",
    };
  }
  return {
    constraint_signal: input.pain_category === "technique_breakdown" ? "technique_breakdown" : "pain",
    preferred_action: decision === "reduce_load" ? "modify_load" : "continue_unchanged",
  };
}

function buildEvidence(input: LiveSafetyPainPolicyInput, reasonCodes: LiveSafetyReasonCode[]): LiveSafetyEvidenceFor9J {
  return {
    signal: evidenceSignal(input),
    evidence_flags: [
      `safety_category:${input.pain_category}`,
      `severity:${input.severity ?? inferSeverity(input)}`,
    ],
    reason_codes: reasonCodes,
    safety_related: input.pain_category !== "no_issue",
    update_safety_history: input.pain_category !== "no_issue",
  };
}

function evidenceSignal(input: LiveSafetyPainPolicyInput): LiveSafetyEvidenceSignal {
  if (input.medical_red_flag || input.pain_category === "dizziness_or_medical_concern") {
    return "medical_red_flag_reported";
  }
  if (input.pain_category === "equipment_safety_issue") {
    return "equipment_safety_issue_reported";
  }
  if (input.pain_category === "technique_breakdown") {
    return "technique_issue_reported";
  }
  if (isPainRisk(input.pain_category) || input.pain_category === "normal_training_discomfort" || input.pain_category === "local_muscle_burn") {
    return "pain_reported";
  }
  return "no_safety_issue";
}

function userFacingMessage(decision: LiveSafetyResponse): string {
  switch (decision) {
    case "stop_workout":
      return "Stop the workout. If you feel unwell, seek appropriate help.";
    case "stop_exercise":
      return "Stop this exercise. Do not push through pain.";
    case "substitute_lower_stress_variation":
      return "Use a lower-stress option today.";
    case "reduce_range_of_motion":
      return "Use a smaller comfortable range today.";
    case "reduce_load":
      return "Reduce the load and keep it controlled.";
    case "modify_grip_or_stance":
      return "Adjust your setup and keep it controlled.";
    case "extend_rest":
      return "Rest longer before the next effort.";
    case "slow_tempo":
      return "Slow the movement and stay controlled.";
    case "monitor":
      return "Monitor it. Stop if it becomes pain.";
    case "continue":
      return "Continue as planned.";
    case "recommend_user_seek_professional_advice":
      return "Pause training and seek appropriate professional advice.";
  }
}

function isPainRisk(category: LivePainSafetyCategory): boolean {
  return ["joint_pain", "sharp_pain", "radiating_pain", "worsening_pain"].includes(category);
}

export const liveSafetyPainPolicyArchitectureNotes = {
  decision_id: "10C",
  hard_safety_gate: true,
  no_medical_diagnosis_or_advice: true,
  live_engines_must_obey_safety_flags: true,
  evidence_routes_to_9j: true,
} as const;
