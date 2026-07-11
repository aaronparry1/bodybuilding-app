import { macrocycleEngineForGoal, type MacrocycleEngineId } from "@/domain/training/macrocycle-engine";
import { mesocycleById, selectMesocycles, type MesocycleId } from "@/domain/training/mesocycle-library";
import { createMicrocycle, type MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export type CurrentPlanningInput = {
  source: "current" | "legacy_compatibility";
  planId: string;
  goal: ActiveTrainingPlan["goal"];
  macrocycle: MacrocycleEngineId;
  mesocycleId: MesocycleId;
  microcycle: MicrocyclePlan;
  sessionRole: string;
  sessionIndex: number;
};

export type CurrentPlanningResolution =
  | { status: "ready"; planning: CurrentPlanningInput }
  | { status: "incomplete"; missing: Array<"mesocycle" | "microcycle" | "session_role"> };

export function resolveCurrentPlanningInput(plan: ActiveTrainingPlan, sessionIndex: number): CurrentPlanningResolution {
  const current = resolveCurrent(plan, sessionIndex);
  if (current) return { status: "ready", planning: current };

  const compatibility = resolveLegacyCompatibility(plan, sessionIndex);
  return compatibility ? { status: "ready", planning: compatibility } : { status: "incomplete", missing: missingCurrentPlanningFields(plan, sessionIndex) };
}

function resolveCurrent(plan: ActiveTrainingPlan, sessionIndex: number): CurrentPlanningInput | null {
  const mesocycleId = plan.currentMesocycleId;
  const microcycle = plan.currentMicrocycle;
  const sessionRole = microcycle?.sessionRoles[sessionIndex];
  if (!mesocycleId || !mesocycleById(mesocycleId) || !microcycle || microcycle.parentMesocycleId !== mesocycleId || !sessionRole) return null;
  return { source: "current", planId: plan.id, goal: plan.goal, macrocycle: macrocycleEngineForGoal(plan.goal), mesocycleId, microcycle, sessionRole, sessionIndex };
}

function resolveLegacyCompatibility(plan: ActiveTrainingPlan, sessionIndex: number): CurrentPlanningInput | null {
  if (plan.currentMesocycleId || plan.currentMicrocycle) return null;
  const mesocycle = selectMesocycles(macrocycleEngineForGoal(plan.goal), plan.experienceLevel)[0];
  if (!mesocycle) return null;
  const trainingDays = compatibleTrainingDays(plan.daysPerWeek);
  if (!trainingDays) return null;
  const microcycle = createMicrocycle({ parentMesocycleId: mesocycle.id, trainingDays, split: plan.preferredSplit });
  const sessionRole = microcycle.sessionRoles[sessionIndex];
  if (!sessionRole) return null;
  return { source: "legacy_compatibility", planId: plan.id, goal: plan.goal, macrocycle: macrocycleEngineForGoal(plan.goal), mesocycleId: mesocycle.id, microcycle, sessionRole, sessionIndex };
}

function compatibleTrainingDays(daysPerWeek: number): 3 | 4 | 5 | 6 | null {
  return daysPerWeek === 3 || daysPerWeek === 4 || daysPerWeek === 5 || daysPerWeek === 6 ? daysPerWeek : null;
}

function missingCurrentPlanningFields(plan: ActiveTrainingPlan, sessionIndex: number): Array<"mesocycle" | "microcycle" | "session_role"> {
  const missing: Array<"mesocycle" | "microcycle" | "session_role"> = [];
  if (!plan.currentMesocycleId || !mesocycleById(plan.currentMesocycleId)) missing.push("mesocycle");
  if (!plan.currentMicrocycle) missing.push("microcycle");
  if (!plan.currentMicrocycle?.sessionRoles[sessionIndex]) missing.push("session_role");
  return missing;
}
