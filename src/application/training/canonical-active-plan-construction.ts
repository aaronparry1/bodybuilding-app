import { createMacrocycle, macrocycleEngineForGoal } from "@/domain/training/macrocycle-engine";
import { selectMesocycles } from "@/domain/training/mesocycle-library";
import { createMicrocycle } from "@/domain/training/microcycle-scheduler";
import { assembleCanonicalActivePlan, type CanonicalActivePlanCarrier, type CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { Equipment, ExperienceLevel, ProgrammeGoal, UnitSystem } from "@/domain/training/models";

export type CanonicalConstructionInput = Readonly<{ planId: string; createdAt: string; updatedAt: string; goal: ProgrammeGoal; macrocycleGoal: Parameters<typeof createMacrocycle>[0]; experienceLevel: ExperienceLevel; daysPerWeek: 3 | 4 | 5 | 6; preferredSplit: Parameters<typeof createMicrocycle>[0]["split"]; equipment: readonly Equipment[]; units: UnitSystem; targetDate?: string; plannedSessions: readonly CanonicalPlannedSessionSnapshot[] }>;
export type CanonicalConstructionResult = Readonly<{ status: "constructed"; carrier: CanonicalActivePlanCarrier } | { status: "invalid_input" | "no_initial_mesocycle" | "session_role_mismatch" | "carrier_validation_failed"; reason: string }>;

/** Orchestrates existing owners; prescription snapshots must be supplied by Session Construction. */
export function constructCanonicalActivePlan(input: CanonicalConstructionInput): CanonicalConstructionResult {
  if (!input.planId || !input.createdAt || !input.updatedAt || input.equipment.length === 0) return { status: "invalid_input", reason: "missing_required_identity_or_equipment" };
  const macrocycle = createMacrocycle(input.macrocycleGoal, input.experienceLevel, input.targetDate, input.createdAt);
  const mesocycle = selectMesocycles(macrocycleEngineForGoal(input.macrocycleGoal), input.experienceLevel)[0];
  if (!mesocycle) return { status: "no_initial_mesocycle", reason: "no_eligible_initial_mesocycle" };
  const microcycle = createMicrocycle({ parentMesocycleId: mesocycle.id, trainingDays: input.daysPerWeek, split: input.preferredSplit });
  if (input.plannedSessions.some((session) => !microcycle.sessionRoles[session.planSessionIndex] || microcycle.sessionRoles[session.planSessionIndex] !== session.role)) return { status: "session_role_mismatch", reason: "planned_session_role_not_in_microcycle" };
  const assembled = assembleCanonicalActivePlan({ planId: input.planId, createdAt: input.createdAt, updatedAt: input.updatedAt, macrocycle, mesocycle, microcycle: { ...microcycle, id: `${input.planId}:microcycle:1`, constructionVersion: "microcycle_v1" }, plannedSessions: input.plannedSessions, progress: { evidenceVersion: "progress_v1", revision: 0 }, constraints: { goal: input.goal, experienceLevel: input.experienceLevel, daysPerWeek: input.daysPerWeek, preferredSplit: input.preferredSplit, equipment: [...input.equipment], units: input.units, targetDate: input.targetDate } });
  return assembled.status === "valid" ? { status: "constructed", carrier: assembled.carrier } : { status: "carrier_validation_failed", reason: assembled.reason };
}
