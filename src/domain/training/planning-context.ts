import { macrocycleEngineForGoal } from "@/domain/training/macrocycle-engine";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import type { WorkoutSession } from "@/domain/training/models";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";

export interface PlanningContext {
  goal: ActiveTrainingPlan["goal"];
  macrocycleEngine: ReturnType<typeof macrocycleEngineForGoal>;
  mesocyclePurpose: string;
  microcycle: { number: number; priority: string } | null;
  sessionRole: string;
  exactPrescribedTargets: Record<string, number[]>;
}

export function createPlanningContext(plan: ActiveTrainingPlan, session?: WorkoutSession | null): PlanningContext {
  const mesocycle = plan.currentMesocycleId ? mesocycleById(plan.currentMesocycleId) : undefined;
  const sessionIndex = session?.planSessionIndex ?? 0;
  return {
    goal: plan.goal,
    macrocycleEngine: macrocycleEngineForGoal(plan.goal),
    mesocyclePurpose: mesocycle?.adaptation ?? "Current training phase",
    microcycle: plan.currentMicrocycle ? { number: plan.currentMicrocycle.sequenceNumber, priority: plan.currentMicrocycle.priority } : null,
    sessionRole: sessionRolesForPlan(plan)[sessionIndex] ?? "Planned session",
    exactPrescribedTargets: Object.fromEntries((session?.exercises ?? []).map((exercise) => [exercise.exerciseId, exercise.prescribedSetTargets ?? []])),
  };
}
