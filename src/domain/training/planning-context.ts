import { readCanonicalPlanningProjection } from "@/application/training/canonical-training-architecture";
import type { MacrocycleEngineId } from "@/domain/training/macrocycle-engine";
import type { WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export interface PlanningContext {
  goal: ActiveTrainingPlan["goal"];
  macrocycleEngine: MacrocycleEngineId;
  mesocyclePurpose: string;
  microcycle: { number: number; priority: string } | null;
  sessionRole: string;
  exactPrescribedTargets: Record<string, number[]>;
}

export function createPlanningContext(plan: ActiveTrainingPlan, session?: WorkoutSession | null): PlanningContext {
  const projection = readCanonicalPlanningProjection(plan, session);
  return {
    goal: projection.goal,
    macrocycleEngine: projection.macrocycleEngine,
    mesocyclePurpose: projection.currentMesocycle?.adaptation ?? "Current training phase",
    microcycle: projection.microcycle,
    sessionRole: projection.sessionRole,
    exactPrescribedTargets: projection.exactPrescribedTargets,
  };
}
