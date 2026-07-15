import { describe, expect, it } from "vitest";
import { createCanonicalActivePlanStateStore } from "@/application/training/canonical-active-plan-state";
import { assembleCanonicalProductionPlanFacts } from "@/application/training/canonical-production-plan-facts";

describe("canonical active-plan state boundary", () => {
  it("starts empty and rejects incomplete factual input", () => {
    const store = createCanonicalActivePlanStateStore();
    expect(store.getState()).toEqual({ hydration: "empty", model: null });
    const result = assembleCanonicalProductionPlanFacts({ planId: "", createdAt: "", updatedAt: "", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: [], units: "kg", exercises: [] });
    expect(result).toEqual({ status: "invalid", reason: "invalid_identity" });
    expect(store.getState()).not.toHaveProperty("blocks");
  });
});
