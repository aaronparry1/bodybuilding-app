import { describe, expect, it } from "vitest";
import { createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";

const exercise = { id: "app-press", name: "App Press", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: [], equipment: ["barbell"], movementPattern: "horizontal_push", defaultRepRange: { min: 6, max: 12 }, defaultLoadJump: 2.5, unitCompatibility: ["kg"], kind: "barbell", role: "primary_compound", roles: ["primary_compound", "secondary_compound", "accessory", "isolation"], family: "horizontal_press", tier: "A", fatigueCost: "low", jointStress: "low", suitability: ["beginner", "intermediate", "advanced"], isBeginnerFriendly: true, isAdvanced: false, notes: [], suitableBlocks: [], swapTags: [], isCustom: false, defaultSettings: { repRange: { min: 6, max: 12 }, dropOffPercent: 0, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 } } as any;

describe("canonical active-plan application boundary", () => {
  it("creates and projects a canonical plan without legacy fields", () => {
    const result = createCanonicalActivePlan({ planId: "app-boundary", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: ["barbell"], units: "kg", exercises: [exercise], establishedLoads: { [exercise.id]: 80 }, history: [] });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.model.schemaVersion).toBe("canonical_active_plan_read_model_v1");
      expect(result.model.nextSession).not.toBeNull();
      expect(JSON.stringify(result.model)).not.toContain("blocks");
    }
  });
});
