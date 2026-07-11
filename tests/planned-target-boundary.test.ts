import { describe, expect, it } from "vitest";
import { buildDefaultPostWorkoutReviewAnswers, buildQualityInputFromWorkoutSession } from "@/domain/training/first-shippable-coaching-loop";
import type { WorkoutSession } from "@/domain/training/models";
import { normalizePostWorkoutReviewAnswers } from "@/domain/training/post-workout-review-flow";
import { defaultAppSettings } from "@/application/settings/app-settings";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildRecoveryWorkoutSession } from "@/domain/training/recovery-workout-constructor";

function plannedSession(repRange: { min: number; max: number }, prescribedSetTargets?: number[]): WorkoutSession {
  return {
    id: "planned-session",
    name: "Planned session",
    sessionKind: "planned",
    startedAt: "2026-07-11T09:00:00.000Z",
    updatedAt: "2026-07-11T09:00:00.000Z",
    syncState: "local",
    exercises: [{
      id: "planned-exercise",
      exerciseId: "barbell-bench-press",
      exerciseName: "Barbell Bench Press",
      settings: { repRange, dropOffPercent: 15, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 2 },
      load: 80,
      ...(prescribedSetTargets ? { prescribedSetTargets } : {}),
      sets: [
        { id: "set-1", setNumber: 1, reps: 5, load: 80, loggedAt: "2026-07-11T09:10:00.000Z", type: "work" },
        { id: "set-2", setNumber: 2, reps: 6, load: 80, loggedAt: "2026-07-11T09:12:00.000Z", type: "work" },
      ],
      status: "complete",
      origin: "planned",
    }],
  };
}

describe("planned exact-target boundary", () => {
  it("uses stored exact planned targets rather than rep-range metadata during execution review", () => {
    const session = plannedSession({ min: 8, max: 12 }, [5, 6]);
    const quality = buildQualityInputFromWorkoutSession(session, normalizePostWorkoutReviewAnswers(buildDefaultPostWorkoutReviewAnswers(session)));

    expect(quality.sets.map((set) => set.prescribed_reps)).toEqual([5, 6]);
  });

  it("keeps a serialized exact planned prescription stable when compatibility range metadata changes", () => {
    const session = structuredClone(plannedSession({ min: 8, max: 12 }, [5, 6]));
    const exercise = session.exercises.at(0);
    if (!exercise) throw new Error("Test fixture requires one planned exercise.");
    exercise.settings.repRange = { min: 12, max: 20 };
    const quality = buildQualityInputFromWorkoutSession(session, normalizePostWorkoutReviewAnswers(buildDefaultPostWorkoutReviewAnswers(session)));

    expect(quality.sets.map((set) => set.prescribed_reps)).toEqual([5, 6]);
  });

  it("keeps range metadata as an explicit compatibility fallback only when a planned record has no exact targets", () => {
    const session = plannedSession({ min: 8, max: 12 });
    const quality = buildQualityInputFromWorkoutSession(session, normalizePostWorkoutReviewAnswers(buildDefaultPostWorkoutReviewAnswers(session)));

    expect(quality.sets.map((set) => set.prescribed_reps)).toEqual([12, 12]);
  });

  it("constructs deterministic exact targets for every required planned work set", () => {
    const activePlan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    }, "2026-07-11T09:00:00.000Z");
    const input = {
      userId: "user-1",
      startedAt: "2026-07-11T09:00:00.000Z",
      activePlan,
      currentBlock: activePlan.blocks[0],
      appSettings: defaultAppSettings,
      exercises: exerciseLibrary,
      history: [],
      sessionIndex: 0,
    };
    const first = buildRecoveryWorkoutSession({ id: "first", ...input });
    const second = buildRecoveryWorkoutSession({ id: "second", ...input });

    expect(first?.exercises.every((exercise) => exercise.prescribedSetTargets?.length === exercise.settings.requiredWorkSets)).toBe(true);
    expect(first?.exercises.map((exercise) => exercise.prescribedSetTargets)).toEqual(second?.exercises.map((exercise) => exercise.prescribedSetTargets));
  });
});
