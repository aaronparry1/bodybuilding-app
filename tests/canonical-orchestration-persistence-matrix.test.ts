import { beforeEach, describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { compareCanonicalActivePlans } from "@/domain/training/canonical-active-plan-carrier";
import { exerciseLibrary } from "@/domain/training/presets";

const incompleteCatalogueExercise = {
  id: "matrix-press", name: "Matrix Press", category: "chest", primaryMuscles: ["chest"], secondaryMuscles: [], equipment: ["barbell"], movementPattern: "horizontal_push", defaultRepRange: { min: 6, max: 12 }, defaultLoadJump: 2.5, unitCompatibility: ["kg"], kind: "barbell", role: "primary_compound", roles: ["primary_compound", "secondary_compound", "accessory", "isolation"], family: "horizontal_press", tier: "A", fatigueCost: "low", jointStress: "low", suitability: ["beginner", "intermediate", "advanced"], isBeginnerFriendly: true, isAdvanced: false, notes: [], suitableBlocks: [], swapTags: [], isCustom: false, defaultSettings: { repRange: { min: 6, max: 12 }, dropOffPercent: 0, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 },
} as any;

function construct(goal: "build_muscle" | "build_muscle_and_strength", daysPerWeek: 2 | 3 | 5) {
  return constructCanonicalActivePlanFromCanonicalInputs({ planId: `matrix-${goal}-${daysPerWeek}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: goal, experienceLevel: "intermediate", daysPerWeek, preferredSplit: daysPerWeek === 5 || daysPerWeek === 3 ? "push_pull_legs" : "upper_lower", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, history: [] });
}

describe("canonical orchestration persistence matrix", () => {
  beforeEach(() => canonicalActivePlanV2Repository.clear());

  it.each([["build_muscle", 2], ["build_muscle", 3], ["build_muscle_and_strength", 2], ["build_muscle_and_strength", 5]] as const)("constructs and round-trips %s/%s", (goal, days) => {
    const result = construct(goal, days);
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    const saved = canonicalActivePlanV2Repository.saveAtomically(result.carrier);
    expect(saved.status).toBe("saved");
    if (saved.status !== "saved") return;
    expect(compareCanonicalActivePlans(result.carrier, saved.carrier)).toEqual({ status: "equivalent" });
    expect(JSON.stringify(saved.carrier)).not.toContain("blocks");
  });

  it.each([["build_strength", 3], ["athletic_performance", 4], ["build_muscle", 6]] as const)("executes additional canonical route %s/%s without injected sessions", (goal, days) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `route-${goal}-${days}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: goal, experienceLevel: "intermediate", daysPerWeek: days, preferredSplit: days === 4 ? "upper_lower" : "push_pull_legs", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(result.status).toBe("constructed");
  });

  it("fails closed instead of using one exercise as a generic programme", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: "incomplete-catalogue", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: ["barbell"], units: "kg", exercises: [incompleteCatalogueExercise], establishedLoads: { [incompleteCatalogueExercise.id]: 80 }, history: [] });
    expect(result).toEqual({ status: "carrier_validation_failed", reason: "session_0:no_suitable_exercise" });
  });
});
