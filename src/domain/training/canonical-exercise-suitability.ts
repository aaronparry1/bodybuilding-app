import type { Exercise, ExerciseRole, Equipment } from "@/domain/training/models";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

export type FactualExerciseMetadata = Readonly<Pick<Exercise, "id" | "roles" | "movementPattern" | "kind" | "equipment" | "fatigueCost" | "isAdvanced"> & { stability: "low" | "moderate" | "high"; technicalComplexity: "low" | "moderate" | "high"; specificity: "general" | "mixed" | "specific"; loadability: "low" | "moderate" | "high"; velocitySuitable: boolean }>;
export type SuitabilityResult = Readonly<{ status: "eligible" | "conditionally_eligible" | "ineligible"; reason: "role_supported" | "special_state_requires_stable_exercise" | "fatigue_cost_exceeds_policy" | "technical_complexity_exceeds_policy" | "velocity_unsuitable" | "equipment_unavailable" | "role_not_supported" }>;

export function factualExerciseMetadata(exercise: Exercise): FactualExerciseMetadata {
  return { id: exercise.id, roles: exercise.roles, movementPattern: exercise.movementPattern, kind: exercise.kind, equipment: exercise.equipment, fatigueCost: exercise.fatigueCost, isAdvanced: exercise.isAdvanced, stability: exercise.tier === "A" ? "high" : exercise.tier === "B" ? "moderate" : "low", technicalComplexity: exercise.isAdvanced ? "high" : exercise.isBeginnerFriendly ? "low" : "moderate", specificity: exercise.roles.includes("primary_compound") ? "specific" : "mixed", loadability: exercise.kind === "barbell" || exercise.kind === "smith" ? "high" : "moderate", velocitySuitable: exercise.roles.includes("power") };
}

export function matchExerciseToMesocyclePolicy(exercise: FactualExerciseMetadata, policy: MesocyclePrescriptionPolicy, role: ExerciseRole, equipment: readonly Equipment[]): SuitabilityResult {
  if (!exercise.equipment.some((item) => equipment.includes(item))) return { status: "ineligible", reason: "equipment_unavailable" };
  if (!policy.exerciseSuitability.roles.includes(role as never)) return { status: "ineligible", reason: "role_not_supported" };
  if (policy.exerciseSuitability.stability === "high" && exercise.stability !== "high") return { status: "conditionally_eligible", reason: "special_state_requires_stable_exercise" };
  if (policy.exerciseSuitability.fatigueCost === "low" && exercise.fatigueCost !== "low") return { status: "ineligible", reason: "fatigue_cost_exceeds_policy" };
  if (policy.exerciseSuitability.technicalComplexity === "low" && exercise.technicalComplexity !== "low") return { status: "ineligible", reason: "technical_complexity_exceeds_policy" };
  if (policy.specialStateScoring.velocityRequired && !exercise.velocitySuitable) return { status: "ineligible", reason: "velocity_unsuitable" };
  return { status: "eligible", reason: "role_supported" };
}
