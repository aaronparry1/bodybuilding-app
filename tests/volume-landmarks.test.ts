import { describe, expect, it } from "vitest";
import { analyzeMuscleVolumeLandmarks, getPrimaryVolumeRecommendation, getStartingVolumeLandmarks } from "@/domain/training/volume-landmarks";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-06-0${Math.min(index + 1, 7)}T10:00:00.000Z`,
    exerciseLogId: `entry-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 10,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 100,
    volumeLoad: 3000,
    ...patch,
  };
}

function workout(index: number, entries: ExerciseHistorySummary[]): WorkoutHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    startedAt: `2026-06-0${Math.min(index + 1, 7)}T09:00:00.000Z`,
    completedAt: `2026-06-0${Math.min(index + 1, 7)}T10:00:00.000Z`,
    durationMinutes: 60,
    exercisesCompleted: entries.length,
    setsCompleted: entries.reduce((sum, item) => sum + item.setsCompleted, 0),
    repsCompleted: entries.reduce((sum, item) => sum + item.repsCompleted, 0),
    totalLoadVolume: entries.reduce((sum, item) => sum + item.volumeLoad, 0),
    progressionHighlights: [],
    exerciseSummaries: entries,
  };
}

describe("volume landmarks", () => {
  it("provides broad starting volume landmarks by muscle size", () => {
    expect(getStartingVolumeLandmarks("chest")).toEqual({
      mev: { min: 6, max: 8 },
      mav: { min: 10, max: 16 },
      mrv: { min: 18, max: 22 },
    });
    expect(getStartingVolumeLandmarks("biceps")).toEqual({
      mev: { min: 4, max: 6 },
      mav: { min: 8, max: 14 },
      mrv: { min: 16, max: 20 },
    });
  });

  it("counts productive work sets by primary muscle and excludes below-threshold quality loss", () => {
    const history = [workout(1, [entry(1, { qualitySets: 2, setsCompleted: 4 })])];
    const landmarks = analyzeMuscleVolumeLandmarks(history, exerciseLibrary, new Date("2026-06-07T12:00:00.000Z"));
    const chest = landmarks.find((item) => item.muscleGroup === "chest")!;

    expect(chest.weeklyProductiveSets).toBe(2);
  });

  it("recommends volume increase when volume is low, fatigue is low, and progress is flat", () => {
    const history = [workout(1, [entry(1, { qualitySets: 3, progressionEarned: false, stoppedByDropOff: false })])];
    const landmarks = analyzeMuscleVolumeLandmarks(history, exerciseLibrary, new Date("2026-06-07T12:00:00.000Z"));
    const chest = landmarks.find((item) => item.muscleGroup === "chest")!;

    expect(chest.recommendation).toBe("increase_volume");
    expect(chest.reason).toContain("below the productive volume zone");
  });

  it("recommends volume reduction when volume is high and fatigue is high", () => {
    const history = [
      workout(1, [
        entry(1, { qualitySets: 6, stoppedByDropOff: true, bestSetReps: 12 }),
        entry(2, { qualitySets: 6, stoppedByDropOff: true, bestSetReps: 10 }),
        entry(3, { qualitySets: 5, stoppedByDropOff: false, bestSetReps: 8 }),
      ]),
    ];
    const landmarks = analyzeMuscleVolumeLandmarks(history, exerciseLibrary, new Date("2026-06-07T12:00:00.000Z"));
    const primary = getPrimaryVolumeRecommendation(landmarks);

    expect(primary?.muscleGroup).toBe("chest");
    expect(primary?.recommendation).toBe("reduce_volume");
    expect(primary?.reason).toContain("Shutdowns are rising");
  });
});
