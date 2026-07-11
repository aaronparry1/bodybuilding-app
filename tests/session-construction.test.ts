import { describe, expect, it } from "vitest";
import { defaultAppSettings } from "@/application/settings/app-settings";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildRecoveryWorkoutSession, constructSessionContract, isValidRecoveryWorkout } from "@/domain/training/recovery-workout-constructor";

function plan(goal: "build_muscle" | "build_strength" = "build_muscle") {
  return createActiveTrainingPlan({
    goal,
    planningChoice: "recommended_12_month",
    equipmentPreset: "dumbbells_only",
    daysPerWeek: 4,
    preferredSplit: "upper_lower",
    experienceLevel: "intermediate",
  }, "2026-07-11T09:00:00.000Z");
}

describe("production session construction", () => {
  it("builds an ordered, bounded session contract from the microcycle role", () => {
    const activePlan = plan();
    const contract = constructSessionContract(activePlan, 0);

    expect(contract.role).toBe("upper");
    expect(contract.primaryTarget).toBe("upper-body pressing");
    expect(contract.requiredSlots.map((slot) => slot.pattern)).toEqual(["horizontal_push", "horizontal_pull", "vertical_push"]);
    expect(contract.workingSetBudget).toEqual({ min: 8, target: 10, max: 15 });
    expect(contract.removalOrder[0]).toBe("optional isolation");
  });

  it("constructs a valid session without using equipment as a restriction", () => {
    const activePlan = plan();
    const session = buildRecoveryWorkoutSession({
      id: "session-1", userId: "user-1", startedAt: "2026-07-11T09:00:00.000Z", activePlan,
      currentBlock: activePlan.blocks[0], appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0,
    });

    expect(session).not.toBeNull();
    expect(session?.notes).toContain("Session construction v1");
    expect(session?.exercises).toHaveLength(3);
    expect(session?.exercises.every((exercise) => exercise.notes?.includes("Stop for pain"))).toBe(true);
    expect(isValidRecoveryWorkout(session!, "upper", exerciseLibrary)).toBe(true);
  });

  it("protects the primary lower-body slot and applies the strength prescription", () => {
    const activePlan = plan("build_strength");
    const session = buildRecoveryWorkoutSession({
      id: "session-2", startedAt: "2026-07-11T09:00:00.000Z", activePlan,
      currentBlock: activePlan.blocks[0], appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0,
    });

    expect(session?.exercises[0]?.notes).toContain("primary_strength · protected work");
    expect(session?.exercises[0]?.settings.repRange).toEqual({ min: 3, max: 6 });
  });
});
