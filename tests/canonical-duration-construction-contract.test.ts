import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { defaultCanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { resolveCanonicalPlanningRestSeconds } from "@/domain/training/canonical-session-duration";
import { exerciseLibrary } from "@/domain/training/presets";

const fullGym = ["barbell", "dumbbell", "machine", "cable", "bodyweight"] as const;
const establishedIntakeWithoutExerciseLoads = {
  ...defaultCanonicalStartingVolumeContext(3),
  history: "established_productive" as const,
  loadConfidence: "established" as const,
  dosageConfidence: "canonical_productive_history" as const,
  workCapacity: "demonstrated_high" as const,
};

describe("canonical allocation and exact-construction duration contract", () => {
  it("owns conservative pre-selection rest for competition lifts and accessories", () => {
    expect(resolveCanonicalPlanningRestSeconds({ constructionRole: "primary", primaryLift: "deadlift", liftExposure: "primary" })).toBe(240);
    expect(resolveCanonicalPlanningRestSeconds({ constructionRole: "primary", primaryLift: "squat", liftExposure: "primary" })).toBe(210);
    expect(resolveCanonicalPlanningRestSeconds({ constructionRole: "accessory" })).toBe(120);
  });

  it.each([
    ["powerbuilding-45-ppl", 45, "push_pull_legs"],
    ["powerbuilding-30-full-body", 30, "full_body"],
  ] as const)("constructs %s after allocation reserves exact calibration and rest time", (planId, availableSessionMinutes, preferredSplit) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId,
      createdAt: "2026-08-23T08:00:00.000Z",
      updatedAt: "2026-08-23T08:00:00.000Z",
      goal: "hypertrophy",
      macrocycleGoal: "build_muscle_and_strength",
      experienceLevel: "intermediate",
      daysPerWeek: 3,
      preferredSplit,
      equipment: fullGym,
      units: "kg",
      availableSessionMinutes,
      startingVolumeContext: establishedIntakeWithoutExerciseLoads,
      exercises: exerciseLibrary,
    });
    expect(result.status, result.status === "constructed" ? undefined : result.reason).toBe("constructed");
    if (result.status !== "constructed") return;
    expect(result.carrier.plannedSessions.every((session) => Number(session.prescriptionSnapshot.estimatedDurationMinutes) <= availableSessionMinutes)).toBe(true);
  });
});
