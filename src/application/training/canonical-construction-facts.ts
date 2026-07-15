import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import type { CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import type { Exercise, Equipment } from "@/domain/training/models";

export const CANONICAL_CONSTRUCTION_INPUTS_SCHEMA = "canonical_construction_inputs_v1" as const;
export type CanonicalConstructionInputReferences = Readonly<{ schemaVersion: typeof CANONICAL_CONSTRUCTION_INPUTS_SCHEMA; athleteId: string; exerciseCatalogueSource: string; equipmentSource: string; limitationsSource: string; preferencesSource: string; progressEvidenceScope: string; establishedLoadSource: string }>;
export type CanonicalConstructionFacts = Readonly<{ references: CanonicalConstructionInputReferences; exercises: readonly Exercise[]; equipment: readonly Equipment[]; limitations: readonly string[]; history: readonly never[]; establishedLoads: Readonly<Record<string, number>> }>;

export function canonicalConstructionReferencesForPlan(plan: CanonicalActivePlanCarrier): CanonicalConstructionInputReferences {
  return plan.constructionInputs ?? { schemaVersion: CANONICAL_CONSTRUCTION_INPUTS_SCHEMA, athleteId: "local-athlete", exerciseCatalogueSource: "custom-exercise-repository:v1", equipmentSource: `plan-constraints:${plan.constraints.equipment.join(",")}`, limitationsSource: "app-settings:limitations:v1", preferencesSource: "app-settings:preferences:v1", progressEvidenceScope: `${plan.planId}:microcycle:${plan.microcycle.id}`, establishedLoadSource: "canonical-progress-evidence:v1" };
}

export function resolveCanonicalConstructionFacts(plan: CanonicalActivePlanCarrier): { status: "ready"; facts: CanonicalConstructionFacts } | { status: "unavailable"; reason: "canonical_exercise_catalogue_unavailable" | "canonical_equipment_unavailable" } {
  const exercises = customExerciseRepository.listAll();
  const equipment = plan.constraints.equipment;
  if (!exercises.length) return { status: "unavailable", reason: "canonical_exercise_catalogue_unavailable" };
  if (!equipment.length) return { status: "unavailable", reason: "canonical_equipment_unavailable" };
  return { status: "ready", facts: { references: canonicalConstructionReferencesForPlan(plan), exercises, equipment, limitations: [], history: [], establishedLoads: Object.fromEntries(canonicalProgressEvidenceRepository.list(plan.planId).flatMap((item) => typeof item.observations.load === "number" && item.slotId ? [[item.slotId, item.observations.load] as const] : [])) } };
}
