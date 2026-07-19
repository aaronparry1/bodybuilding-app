import { describe, expect, it } from "vitest";
import { createCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical active-plan application boundary", () => {
  it("creates and projects a canonical plan without legacy fields", () => {
    const result = createCanonicalActivePlan({ planId: "app-boundary", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "intermediate", daysPerWeek: 3, preferredSplit: "push_pull_legs", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, establishedLoads: Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 80])), history: [] });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.model.schemaVersion).toBe("canonical_active_plan_read_model_v1");
      expect(result.model.nextSession).not.toBeNull();
      expect(result.model.activeRecordedSession).toBeNull();
      expect(result.model.historicalRecordedSessions).toEqual([]);
      expect(JSON.stringify(result.model)).not.toContain("blocks");
    }
  });
});
