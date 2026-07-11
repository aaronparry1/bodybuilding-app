import { mesocycleById } from "@/domain/training/mesocycle-library";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";

export function planningSummary(plan: ActiveTrainingPlan, sessionIndex = 0) {
  const mesocycle = plan.currentMesocycleId ? mesocycleById(plan.currentMesocycleId) : undefined;
  const role = sessionRolesForPlan(plan)[sessionIndex] ?? "Planned session";
  return {
    macrocycle: title(plan.goal),
    mesocycle: mesocycle?.adaptation ?? "Current training phase",
    microcycle: plan.currentMicrocycle ? `Microcycle ${plan.currentMicrocycle.sequenceNumber} · ${plan.currentMicrocycle.priority}` : "Current training week",
    sessionRole: role,
  };
}

function title(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
