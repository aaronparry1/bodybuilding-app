import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { migrateSavedActivePlan } from "@/application/training/saved-plan-migration";

describe("saved active-plan migration", () => {
  it("leaves canonical plans unchanged", () => {
    const plan = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 4, preferredSplit: "upper_lower", experienceLevel: "intermediate" }, "2026-01-01T00:00:00.000Z");
    const result = migrateSavedActivePlan(plan);
    expect(result.status).toBe("already_canonical");
    expect(result.plan).toEqual(plan);
  });

  it("reconstructs a legacy plan while retaining identity and canonical provenance", () => {
    const canonical = createActiveTrainingPlan({ goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 4, preferredSplit: "upper_lower", experienceLevel: "intermediate" }, "2026-01-01T00:00:00.000Z");
    const { authority: _authority, currentMesocycleId: _mesocycle, currentMicrocycle: _microcycle, ...legacy } = canonical;
    const result = migrateSavedActivePlan(legacy);
    expect(result.status).toBe("migrated_legacy");
    expect(result.plan.id).toBe(legacy.id);
    expect(result.plan.authority).toEqual({ kind: "canonical_modern", version: "canonical_plan_v1" });
  });
});
