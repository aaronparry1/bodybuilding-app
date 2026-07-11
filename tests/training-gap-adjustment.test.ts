import { describe, expect, it } from "vitest";
import { resolveTrainingGapAdjustment } from "@/domain/training/training-gap-adjustment";
import type { Exercise, ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";

const referenceDate = new Date("2026-06-08T12:00:00.000Z");

function exercise(id = "ex-bench"): Exercise {
  return {
    id,
    name: id === "ex-squat" ? "Squat" : "Bench Press",
    category: id === "ex-squat" ? "quads" : "chest",
    primaryMuscles: id === "ex-squat" ? ["quads"] : ["chest"],
    secondaryMuscles: id === "ex-squat" ? ["glutes"] : ["triceps", "shoulders"],
    equipment: ["barbell"],
    movementPattern: id === "ex-squat" ? "squat" : "horizontal_push",
    defaultRepRange: { min: 6, max: 10 },
    defaultLoadJump: 2.5,
    unitCompatibility: ["kg", "lb"],
    kind: "barbell",
    role: "primary_compound",
    roles: ["primary_compound"],
    family: id === "ex-squat" ? "squat_pattern" : "horizontal_press",
    tier: "A",
    fatigueCost: "high",
    jointStress: "moderate",
    suitability: ["beginner", "intermediate", "advanced"],
    isBeginnerFriendly: true,
    isAdvanced: false,
    notes: [],
    suitableBlocks: ["hypertrophy", "strength"],
    swapTags: [],
    isCustom: false,
    defaultSettings: {
      repRange: { min: 8, max: 12 },
      dropOffPercent: 15,
      loadIncrease: 2.5,
      requiredWorkSets: 3,
      unit: "kg",
    },
  };
}

function entry(exerciseId: string, completedAt: string, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${exerciseId}-${completedAt}`,
    sessionName: "Training",
    completedAt,
    exerciseLogId: `log-${exerciseId}`,
    exerciseId,
    exerciseName: exerciseId === "ex-squat" ? "Squat" : "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 10,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: true,
    nextRecommendedLoad: 100,
    volumeLoad: 3000,
    ...patch,
  };
}

function session(completedAt: string, summaries: ExerciseHistorySummary[]): WorkoutHistorySummary {
  return {
    sessionId: `session-${completedAt}`,
    userId: "user",
    sessionName: "Training",
    startedAt: completedAt,
    completedAt,
    durationMinutes: 60,
    exercisesCompleted: summaries.length,
    setsCompleted: summaries.reduce((sum, item) => sum + item.setsCompleted, 0),
    repsCompleted: summaries.reduce((sum, item) => sum + item.repsCompleted, 0),
    totalLoadVolume: summaries.reduce((sum, item) => sum + item.volumeLoad, 0),
    progressionHighlights: [],
    exerciseSummaries: summaries,
  };
}

describe("training gap adjustment", () => {
  it("does not adjust loads for 0-7 days away", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-06-03T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("current");
    expect(result.adjustment).toBe("none");
    expect(result.adjustedLoad).toBeUndefined();
  });

  it("shows an ease-in note only for 8-14 days away", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-05-28T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("short_gap");
    expect(result.adjustment).toBe("ease_in_note");
    expect(result.adjustedLoad).toBeUndefined();
    expect(result.reason).toContain("First session back");
  });

  it("applies a small rounded-down reduction for 15-21 days away", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-05-19T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("moderate_gap");
    expect(result.adjustment).toBe("reduce_load");
    expect(result.adjustedLoad).toBe(95);
  });

  it("applies a moderate rounded-down reduction for 22-35 days away", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-05-11T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("long_gap");
    expect(result.adjustedLoad).toBe(92.5);
  });

  it("recommends a return week after 36+ days away", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-04-20T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("extended_gap");
    expect(result.adjustment).toBe("return_week");
    expect(result.adjustedLoad).toBe(87.5);
    expect(result.reason).toContain("Re-entry week");
  });

  it("applies exercise-specific gaps without lowering recently trained exercises", () => {
    const benchOld = entry("ex-bench", "2026-05-11T12:00:00.000Z");
    const squatRecent = entry("ex-squat", "2026-06-06T12:00:00.000Z");
    const history = [session("2026-05-11T12:00:00.000Z", [benchOld]), session("2026-06-06T12:00:00.000Z", [squatRecent])];

    const bench = resolveTrainingGapAdjustment({
      history,
      exerciseHistory: [benchOld, squatRecent],
      targetExercise: exercise("ex-bench"),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });
    const squat = resolveTrainingGapAdjustment({
      history,
      exerciseHistory: [benchOld, squatRecent],
      targetExercise: exercise("ex-squat"),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(bench.scope).toBe("exercise");
    expect(bench.status).toBe("long_gap");
    expect(squat.status).toBe("current");
  });

  it("keeps unknown loads percentage-based during a gap", () => {
    const result = resolveTrainingGapAdjustment({
      lastCompletedWorkoutDate: "2026-04-20T12:00:00.000Z",
      targetExercise: exercise(),
      currentRecommendedLoad: undefined,
      increment: 2.5,
      referenceDate,
      loadKnown: false,
    });

    expect(result.status).toBe("extended_gap");
    expect(result.adjustment).toBe("return_week");
    expect(result.adjustedLoad).toBeUndefined();
  });

  it("successful recent return session clears the caution", () => {
    const oldBench = entry("ex-bench", "2026-05-01T12:00:00.000Z");
    const recentBench = entry("ex-bench", "2026-06-07T12:00:00.000Z");
    const result = resolveTrainingGapAdjustment({
      history: [session("2026-05-01T12:00:00.000Z", [oldBench]), session("2026-06-07T12:00:00.000Z", [recentBench])],
      exerciseHistory: [oldBench, recentBench],
      targetExercise: exercise(),
      currentRecommendedLoad: 100,
      increment: 2.5,
      referenceDate,
      loadKnown: true,
    });

    expect(result.status).toBe("current");
    expect(result.adjustment).toBe("none");
  });
});
