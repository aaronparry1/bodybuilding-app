import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { exerciseDisplayName, loadingModeDisplayName, methodDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { exerciseLibrary } from "@/domain/training/presets";

function movementPatternsForTest(role: string): readonly string[] {
  const value = role.toLowerCase();
  if (value.includes("bench") || value.includes("upper")) return ["horizontal_push", "vertical_push"];
  if (value.includes("squat") || value.includes("lower") || value.includes("leg")) return ["squat", "lunge", "hip_thrust"];
  if (value.includes("deadlift") || value.includes("back")) return ["hinge", "horizontal_pull", "vertical_pull"];
  return [];
}

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

  it.each([2, 3, 4, 5, 6] as const)("constructs deterministic role-compatible sessions at %s days", (days) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({ planId: `days-${days}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: days, preferredSplit: "let_app_choose", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, history: [] });
    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") return;
    for (const session of result.carrier.plannedSessions) {
      expect(session.status).toBe("planned");
      const slots = session.prescriptionSnapshot.slots as readonly Record<string, unknown>[];
      expect(new Set(slots.map((slot) => String(slot.id))).size).toBe(slots.length);
      expect(slots.every((slot) => typeof slot.exerciseId === "string" && slot.exerciseId.length > 0)).toBe(true);
      expect(slots.every((slot) => Number((slot.settings as Record<string, unknown>).requiredSets) >= 1)).toBe(true);
      const lead = slots[0];
      if (lead && movementPatternsForTest(session.role).length) expect(movementPatternsForTest(session.role)).toContain(exerciseLibrary.find((exercise) => exercise.id === lead.exerciseId)?.movementPattern);
    }
  });
});
