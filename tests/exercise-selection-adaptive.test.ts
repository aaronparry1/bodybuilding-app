import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { selectPlannedExercisesForWeek } from "@/domain/training/exercise-selection";
import { recommendExerciseRotation } from "@/domain/training/exercise-rotation";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExerciseHistorySummary, ProgramExercise, WorkoutHistorySummary } from "@/domain/training/models";

const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;

function previousBenchSlot(): ProgramExercise {
  return {
    id: "slot-bench",
    exerciseId: bench.id,
    plannedOrder: 1,
    settings: {
      repRange: { min: 6, max: 10 },
      dropOffPercent: 15,
      loadIncrease: 2.5,
      requiredWorkSets: 3,
      unit: "kg",
    },
  };
}

function entry(progressionEarned: boolean, index = 1, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: bench.id,
    exerciseName: bench.name,
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: progressionEarned ? 10 : 8,
    dropOffThreshold: 15,
    stoppedByDropOff: !progressionEarned,
    progressionEarned,
    nextRecommendedLoad: progressionEarned ? 102.5 : 100,
    volumeLoad: 3000,
    ...patch,
  };
}

function history(progressionEarned: boolean): WorkoutHistorySummary[] {
  const exerciseEntry = entry(progressionEarned);
  return [{
    sessionId: "session-1",
    sessionName: "Push",
    startedAt: "2026-05-01T11:00:00.000Z",
    completedAt: "2026-05-01T12:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: 3,
    repsCompleted: 30,
    totalLoadVolume: 3000,
    progressionHighlights: progressionEarned ? [`${bench.name} -> 102.5kg`] : [],
    exerciseSummaries: [exerciseEntry],
  }];
}

describe("adaptive exercise rotation", () => {
  it("keeps a progressing Tier A primary stable across rotation windows", () => {
    const selection = selectPlannedExercisesForWeek({
      workoutType: "push",
      block: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 5 }),
      weekNumber: 5,
      exercises: exerciseLibrary,
      rotationFrequency: "every_4_weeks",
      previousSelections: [previousBenchSlot()],
      history: history(true),
    });

    expect(selection.exerciseSlots.some((slot) => slot.exerciseId === bench.id)).toBe(true);
  });

  it("allows a stalled Tier A primary to rotate", () => {
    const selection = selectPlannedExercisesForWeek({
      workoutType: "push",
      block: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 5 }),
      weekNumber: 5,
      exercises: exerciseLibrary,
      rotationFrequency: "every_4_weeks",
      previousSelections: [previousBenchSlot()],
      stalledExerciseIds: [bench.id],
      history: history(false),
    });

    expect(selection.exerciseSlots[0]?.exerciseId).not.toBe(bench.id);
  });

  it("detects stalled Tier A lifts from history and recommends structured primary-lift variation first", () => {
    const entries = [1, 2, 3, 4].map((index) => entry(false, index));
    const recommendation = recommendExerciseRotation(bench, entries, exerciseLibrary);

    expect(recommendation.shouldRotate).toBe(true);
    expect(recommendation.reason).toContain("stalled");
    expect(recommendation.structuredPrimaryLiftVariation?.family.id).toBe("bench_press");
    expect(recommendation.suggestedReplacement?.family).toBe(bench.family);
    expect(["ex-floor-press", "ex-paused-bench-press", "ex-close-grip-bench-press", "ex-spoto-press"]).toContain(recommendation.suggestedReplacement?.id);
    expect(recommendation.optionToKeep).toContain("Keep anyway");
  });

  it("keeps a progressing Tier A lift stable", () => {
    const entries = [entry(false, 1), entry(false, 2), entry(true, 3)];
    const recommendation = recommendExerciseRotation(bench, entries, exerciseLibrary);

    expect(recommendation.shouldRotate).toBe(false);
    expect(recommendation.reason).toContain("Progress is still moving");
  });
});
