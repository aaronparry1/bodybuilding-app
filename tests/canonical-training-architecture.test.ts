import { describe, expect, it } from "vitest";
import { canApplyLegacyBlockMutation, readCanonicalPlanningProjection } from "@/application/training/canonical-training-architecture";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

describe("canonical training application boundary", () => {
  it("projects canonical plan state without creating an independent decision", () => {
    const plan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const projection = readCanonicalPlanningProjection(plan);
    expect(projection.macrocycleEngine).toBe("hypertrophy");
    expect(projection.currentMesocycle).toBeTruthy();
    expect(projection.microcycle).toBeTruthy();
    expect(projection.sessionRole).toBeTypeOf("string");
  });

  it("does not expose legacy block state as a planning decision", () => {
    const plan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const projection = readCanonicalPlanningProjection(plan);
    expect(projection).not.toHaveProperty("blocks");
    expect(projection).not.toHaveProperty("activeBlockId");
  });

  it("fails closed instead of routing canonical plans through legacy block mutation", () => {
    const plan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    expect(canApplyLegacyBlockMutation(plan)).toBe(false);
  });
});
