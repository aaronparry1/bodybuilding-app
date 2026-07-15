import type { CanonicalActivePlanCreateCommand } from "@/application/training/canonical-active-plan-application";

export type CanonicalProductionPlanFacts = Readonly<{ command: CanonicalActivePlanCreateCommand }>;
export type CanonicalProductionPlanFactsResult = Readonly<{ status: "ready"; facts: CanonicalProductionPlanFacts } | { status: "invalid"; reason: "missing_exercise_catalogue" | "missing_equipment" | "invalid_identity" }>;

/** Collects application facts only; it makes no Macrocycle/Mesocycle/Session decisions. */
export function assembleCanonicalProductionPlanFacts(command: CanonicalActivePlanCreateCommand): CanonicalProductionPlanFactsResult {
  if (!command.planId || !command.createdAt || !command.updatedAt) return { status: "invalid", reason: "invalid_identity" };
  if (!command.exercises.length) return { status: "invalid", reason: "missing_exercise_catalogue" };
  if (!command.equipment.length) return { status: "invalid", reason: "missing_equipment" };
  return { status: "ready", facts: { command } };
}
