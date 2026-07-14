import { readCanonicalPlanningProjection } from "@/application/training/canonical-training-architecture";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export function planningSummary(plan: ActiveTrainingPlan, sessionIndex = 0) {
  const projection = readCanonicalPlanningProjection(plan);
  const role = readCanonicalPlanningProjection(plan, null, sessionIndex).sessionRole;
  return {
    macrocycle: title(plan.goal),
    mesocycle: projection.currentMesocycle?.adaptation ?? "Current training phase",
    microcycle: projection.microcycle ? `Microcycle ${projection.microcycle.number} · ${projection.microcycle.priority}` : "Current training week",
    sessionRole: role,
  };
}

function title(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
