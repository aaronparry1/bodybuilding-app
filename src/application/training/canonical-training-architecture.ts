import { macrocycleEngineForGoal, type MacrocycleEngineId } from "@/domain/training/macrocycle-engine";
import { mesocycleById, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { WorkoutSession } from "@/domain/training/models";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";

/**
 * Application-facing read boundary for the canonical training architecture.
 * This module deliberately delegates; it does not select phases, roles, or
 * prescriptions itself.  Consumers should use this projection rather than
 * reaching into the individual engines.
 */
export interface CanonicalTrainingPlanningProjection {
  goal: ActiveTrainingPlan["goal"];
  macrocycleEngine: MacrocycleEngineId;
  currentMesocycle: MesocycleSpec | null;
  microcycle: { number: number; priority: string } | null;
  sessionRole: string;
  exactPrescribedTargets: Record<string, number[]>;
}

export function readCanonicalPlanningProjection(plan: ActiveTrainingPlan, session?: WorkoutSession | null): CanonicalTrainingPlanningProjection {
  const currentMesocycle = plan.currentMesocycleId ? mesocycleById(plan.currentMesocycleId) ?? null : null;
  const sessionIndex = session?.planSessionIndex ?? 0;
  return {
    goal: plan.goal,
    macrocycleEngine: macrocycleEngineForGoal(plan.goal),
    currentMesocycle,
    microcycle: plan.currentMicrocycle ? { number: plan.currentMicrocycle.sequenceNumber, priority: plan.currentMicrocycle.priority } : null,
    sessionRole: sessionRolesForPlan(plan)[sessionIndex] ?? "Planned session",
    exactPrescribedTargets: Object.fromEntries((session?.exercises ?? []).map((exercise) => [exercise.exerciseId, exercise.prescribedSetTargets ?? []])),
  };
}
