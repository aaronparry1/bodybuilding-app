import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { exerciseDisplayName, loadingModeDisplayName, methodDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical production recovery boundaries", () => {
  it("creates only planned sessions and no performed evidence", () => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: "fresh-plan", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "let_app_choose", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(result.carrier.plannedSessions.every((session) => session.status === "planned")).toBe(true);
    expect(result.carrier.recordedSessionReferences ?? []).toHaveLength(0);
    expect(result.carrier.progress.revision).toBe(0);
  });

  it("keeps internal identifiers out of customer-facing label helpers", () => {
    expect(trainingGoalDisplayName("build_muscle_and_strength")).toBe("Build muscle and strength");
    expect(exerciseDisplayName("missing-exercise")).toBe("Exercise unavailable");
    expect(methodDisplayName("straight_sets")).toBe("Straight sets");
    expect(loadingModeDisplayName("bodyweight")).toBe("Bodyweight");
    expect(exerciseDisplayName("missing-exercise")).not.toContain("missing-exercise");
  });
});
