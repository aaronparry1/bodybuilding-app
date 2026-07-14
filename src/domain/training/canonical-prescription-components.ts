import type { ExerciseRole, TrainingLane } from "@/domain/training/models";
import type { MesocyclePrescriptionPolicy, PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";

export type CanonicalRestInstruction = Readonly<{ seconds: number; unit: "seconds"; reason: string; provenance: readonly string[] }>;
export type CanonicalProgressionRule = Readonly<{ rule: "rep_progression" | "load_progression" | "velocity_intent" | "fatigue_reduction" | "expression"; success: string; repeat: string; adjustment: string; stop: string; evidenceRequired: boolean; staleRevision: string; provenance: readonly string[] }>;
export type CanonicalStopRule = Readonly<{ monitoring: "rep" | "velocity" | "recovery" | "none"; threshold: number | null; comparison: "minimum_rep_target" | "velocity_threshold" | "recovery_status" | "none"; trigger: string; action: "stop" | "reduce" | "change_target" | "none"; appliesTo: "all_work_sets" | "remaining_work_sets" | "session"; reason: string; provenance: readonly string[] }>;

export function resolveCanonicalRest(policy: MesocyclePrescriptionPolicy, lane: TrainingLane, method: PrescriptionMethodFamily, role: ExerciseRole): CanonicalRestInstruction {
  const seconds = lane === "power" || lane === "peak" || role === "primary_compound" ? 180 : lane === "strength" || method === "back_off_sets" ? 150 : policy.specialState === "deload" || policy.specialState === "transition" ? 60 : role === "isolation" ? 75 : 105;
  return { seconds, unit: "seconds", reason: `canonical_rest:${policy.specialState}:${lane}:${method}:${role}`, provenance: [`mesocycle:${policy.mesocycleId}`, `lane:${lane}`, `method:${method}`, `role:${role}`] };
}

export function resolveCanonicalProgression(policy: MesocyclePrescriptionPolicy, lane: TrainingLane, method: PrescriptionMethodFamily, revision: string): CanonicalProgressionRule {
  const rule = lane === "power" ? "velocity_intent" : policy.specialState === "deload" || policy.specialState === "transition" ? "fatigue_reduction" : lane === "peak" ? "expression" : method === "back_off_sets" || lane === "strength" ? "load_progression" : "rep_progression";
  return { rule, success: rule === "velocity_intent" ? "maintain prescribed velocity intent" : "complete all targets without triggering stop rule", repeat: "repeat the prescription when success evidence is incomplete", adjustment: rule === "load_progression" ? "increase load by the established increment after success" : rule === "fatigue_reduction" ? "reduce exposure when recovery evidence worsens" : "add reps within the target envelope before load", stop: rule === "expression" ? "do not add fatigue after the expression target" : "respect the resolved stop rule", evidenceRequired: policy.progression.evidenceRequired, staleRevision: revision, provenance: [`mesocycle:${policy.mesocycleId}`, `lane:${lane}`, `method:${method}`] };
}

export function resolveCanonicalStopRule(policy: MesocyclePrescriptionPolicy, lane: TrainingLane, role: ExerciseRole, targetMinimum: number): CanonicalStopRule {
  if (policy.dropOff.status === "prohibited") return { monitoring: "none", threshold: null, comparison: "none", trigger: "no_stop_rule_permitted", action: "none", appliesTo: "session", reason: "mesocycle_dropoff_prohibited", provenance: [`mesocycle:${policy.mesocycleId}`] };
  const monitoring = policy.dropOff.monitoring;
  const action = policy.dropOff.response === "reduce" ? "reduce" : policy.dropOff.response === "stop" ? "stop" : "change_target";
  return { monitoring, threshold: monitoring === "rep" ? targetMinimum : null, comparison: monitoring === "rep" ? "minimum_rep_target" : monitoring === "velocity" ? "velocity_threshold" : monitoring === "recovery" ? "recovery_status" : "none", trigger: monitoring === "rep" ? `work_set_reps_below_${targetMinimum}` : `policy_${policy.dropOff.thresholdPolicyId}`, action, appliesTo: role === "primary_compound" || lane === "peak" ? "all_work_sets" : "remaining_work_sets", reason: `canonical_stop:${policy.dropOff.thresholdPolicyId}`, provenance: [`mesocycle:${policy.mesocycleId}`, `lane:${lane}`, `role:${role}`] };
}
