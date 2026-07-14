import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";

describe("canonical v2 session orchestration", () => {
  it("rejects normal construction without canonical exercise inputs", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "plan",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      goal: "strength_hypertrophy",
      macrocycleGoal: "build_muscle_and_strength",
      experienceLevel: "intermediate",
      daysPerWeek: 5,
      preferredSplit: "upper_lower",
      equipment: ["barbell"],
      units: "kg",
      exercises: [],
    });
    expect(result).toEqual({ status: "invalid_input", reason: "missing_required_canonical_inputs" });
  });
});
