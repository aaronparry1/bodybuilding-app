import { describe, expect, it } from "vitest";
import { defaultAppSettings } from "@/application/settings/app-settings";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import type { ExerciseInterventionRecord } from "@/domain/training/plan-setup";
import { resolveCurrentPlanningInput } from "@/domain/training/current-planning-input";
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
    const planning = resolveCurrentPlanningInput(activePlan, 0);
    if (planning.status !== "ready") throw new Error("Expected a current planning input.");
    const contract = constructSessionContract(planning.planning);

    expect(contract.role).toBe("upper");
    expect(contract.primaryTarget).toBe("upper-body pressing");
    expect(contract.requiredSlots.map((slot) => slot.pattern)).toEqual(["horizontal_push", "horizontal_pull", "vertical_push"]);
    expect(contract.workingSetBudget).toEqual({ min: 8, target: 10, max: 15 });
    expect(contract.removalOrder[0]).toBe("optional isolation");
  });

  it("constructs a valid session without using equipment as a restriction", () => {
    const activePlan = plan();
    const result = buildRecoveryWorkoutSession({
      id: "session-1", userId: "user-1", startedAt: "2026-07-11T09:00:00.000Z", activePlan,
      appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0,
    });

    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") throw new Error("Expected constructed session.");
    expect(result.session.notes).toContain("Session construction v1");
    expect(result.session.exercises).toHaveLength(3);
    expect(result.session.exercises.every((exercise) => exercise.notes?.includes("Stop for pain"))).toBe(true);
    expect(isValidRecoveryWorkout(result.session, "upper", exerciseLibrary)).toBe(true);
  });

  it("protects the primary lower-body slot and applies the strength prescription", () => {
    const activePlan = plan("build_strength");
    const result = buildRecoveryWorkoutSession({
      id: "session-2", startedAt: "2026-07-11T09:00:00.000Z", activePlan,
      appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0,
    });

    expect(result.status).toBe("constructed");
    if (result.status !== "constructed") throw new Error("Expected constructed session.");
    expect(result.session.exercises[0]?.notes).toContain("primary_strength · protected work");
    expect(result.session.exercises[0]?.settings.repRange).toEqual({ min: 3, max: 6 });
  });

  it("distinguishes intervention blocking from ordinary candidate absence", () => {
    const activePlan = plan();
    const firstSlotCandidates = exerciseLibrary.filter((exercise) => exercise.movementPattern === "horizontal_push" && exercise.suitability.includes(activePlan.experienceLevel));
    const interventions: ExerciseInterventionRecord[] = firstSlotCandidates.map((exercise) => ({
      exerciseId: exercise.id,
      decision: "replace",
      reason: "pain",
      evidence: [],
      decidedAt: "2026-07-11T09:00:00.000Z",
      reviewAfterExposures: 1,
    }));
    const blocked = buildRecoveryWorkoutSession({
      id: "blocked", startedAt: "2026-07-11T09:00:00.000Z", activePlan: { ...activePlan, recommendationState: { ...activePlan.recommendationState, exerciseInterventions: interventions } },
      appSettings: defaultAppSettings, exercises: exerciseLibrary, history: [], sessionIndex: 0,
    });
    const unavailable = buildRecoveryWorkoutSession({
      id: "unavailable", startedAt: "2026-07-11T09:00:00.000Z", activePlan,
      appSettings: defaultAppSettings, exercises: [], history: [], sessionIndex: 0,
    });

    expect(blocked.status).toBe("blocked_by_intervention");
    if (blocked.status === "blocked_by_intervention") expect(blocked.reason.excludedExerciseIds).toEqual(firstSlotCandidates.map((exercise) => exercise.id).sort());
    expect(unavailable).toEqual({ status: "no_eligible_candidate", reason: { slot: "upper-body pressing", candidatesConsidered: 0 } });
  });
});
