import { jsonStore } from "@/data/local/json-store";
import { createRecommendedAnnualPlan, normalizeActiveTrainingPlanEquipment, type ActiveTrainingPlan } from "@/domain/training/plan-setup";

const activeTrainingPlanKey = "iron-logic.active-training-plan";

export class LocalActiveTrainingPlanRepository {
  getOptional(): ActiveTrainingPlan | null {
    const plan = jsonStore.get<ActiveTrainingPlan | null>(activeTrainingPlanKey, null);
    return plan ? normalizeActiveTrainingPlanEquipment(plan) : null;
  }

  get(): ActiveTrainingPlan {
    return normalizeActiveTrainingPlanEquipment(jsonStore.get<ActiveTrainingPlan>(activeTrainingPlanKey, createRecommendedAnnualPlan()));
  }

  save(plan: ActiveTrainingPlan): void {
    jsonStore.set(activeTrainingPlanKey, normalizeActiveTrainingPlanEquipment(plan));
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(activeTrainingPlanKey, listener);
  }
}

export const activeTrainingPlanRepository = new LocalActiveTrainingPlanRepository();
