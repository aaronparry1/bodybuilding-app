import { jsonStore } from "@/data/local/json-store";
import { createRecommendedAnnualPlan, normalizeActiveTrainingPlanEquipment, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { classifyRestrictedCalibrationPlanMetadata, copyRestrictedCalibrationMetadata } from "@/domain/training/restricted-calibration-programme-persistence";

const activeTrainingPlanKey = "iron-logic.active-training-plan";

export class LocalActiveTrainingPlanRepository {
  getOptional(): ActiveTrainingPlan | null {
    const plan = jsonStore.get<ActiveTrainingPlan | null>(activeTrainingPlanKey, null);
    if (!plan) return null;
    const classification = classifyRestrictedCalibrationPlanMetadata(plan);
    if (classification.status === "invalid_current_plan" || classification.status === "unsupported_schema") throw new Error(classification.reason);
    const normalized = normalizeActiveTrainingPlanEquipment(plan);
    if (!normalized.programmePolicyMetadata) return normalized;
    const metadata = copyRestrictedCalibrationMetadata(normalized.programmePolicyMetadata);
    return { ...normalized, programmePolicyMetadata: metadata, programmeSpecifications: metadata.programmeSpecifications, microcycleProgrammeReferences: metadata.microcycleProgrammeReferences };
  }

  get(): ActiveTrainingPlan {
    const plan = jsonStore.get<ActiveTrainingPlan>(activeTrainingPlanKey, createRecommendedAnnualPlan());
    const classification = classifyRestrictedCalibrationPlanMetadata(plan);
    if (classification.status === "invalid_current_plan" || classification.status === "unsupported_schema") throw new Error(classification.reason);
    const normalized = normalizeActiveTrainingPlanEquipment(plan);
    if (!normalized.programmePolicyMetadata) return normalized;
    const metadata = copyRestrictedCalibrationMetadata(normalized.programmePolicyMetadata);
    return { ...normalized, programmePolicyMetadata: metadata, programmeSpecifications: metadata.programmeSpecifications, microcycleProgrammeReferences: metadata.microcycleProgrammeReferences };
  }

  save(plan: ActiveTrainingPlan): void {
    const classification = classifyRestrictedCalibrationPlanMetadata(plan);
    if (classification.status === "invalid_current_plan" || classification.status === "unsupported_schema") throw new Error(classification.reason);
    jsonStore.set(activeTrainingPlanKey, normalizeActiveTrainingPlanEquipment(plan));
  }

  classify(plan: ActiveTrainingPlan | null) { return classifyRestrictedCalibrationPlanMetadata(plan); }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(activeTrainingPlanKey, listener);
  }
}

export const activeTrainingPlanRepository = new LocalActiveTrainingPlanRepository();
