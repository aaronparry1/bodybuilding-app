import { describe, expect, it } from "vitest";
import {
  assessExerciseProgression,
  assessMuscleProgression,
  assessVolumeEvidence,
  recommendVolume,
} from "@/domain/training/progression-coach";
import type { Exercise, ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";

function exposure(overrides: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    exerciseLogId: "log",
    exerciseId: "bench",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 30,
    qualitySets: 3,
    bestSetReps: 10,
    dropOffThreshold: 2,
    stoppedByDropOff: false,
    progressionEarned: true,
    nextRecommendedLoad: 102.5,
    volumeLoad: 3000,
    ...overrides,
  };
}

function session(index: number, summary: ExerciseHistorySummary): WorkoutHistorySummary {
  const completedAt = `2026-08-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`;
  return {
    sessionId: `session-${index}`,
    sessionName: "Upper",
    startedAt: completedAt,
    completedAt,
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: summary.setsCompleted,
    repsCompleted: summary.repsCompleted,
    totalLoadVolume: summary.volumeLoad,
    progressionHighlights: [],
    exerciseSummaries: [{ ...summary, exerciseLogId: `log-${index}`, completedAt }],
  };
}

describe("progression coach volume safety", () => {
  it("does not add a set from a single successful exposure", () => {
    expect(recommendVolume([exposure()], {
      repeatedEarlyDropOffs: false,
      worseningPerformanceTrend: false,
      decliningVolumeTolerance: false,
      dropOffRate: 0,
    })).toBe("maintain_volume");
  });

  it("reports confidence from comparable exposure history rather than all exercise uses", () => {
    expect(assessVolumeEvidence([exposure({ equipmentSignature: "barbell" })]).confidence).toBe("insufficient");
    expect(assessVolumeEvidence([
      exposure({ equipmentSignature: "barbell" }),
      exposure({ equipmentSignature: "barbell" }),
    ]).confidence).toBe("emerging");
    expect(assessVolumeEvidence([
      exposure({ equipmentSignature: "machine" }),
      exposure({ equipmentSignature: "barbell" }),
      exposure({ equipmentSignature: "barbell" }),
    ])).toMatchObject({ confidence: "emerging", comparableExposures: 2, comparisonKey: "barbell" });
    expect(assessVolumeEvidence([
      exposure({ equipmentSignature: "barbell" }),
      exposure({ equipmentSignature: "barbell" }),
      exposure({ equipmentSignature: "barbell" }),
    ]).confidence).toBe("established");
  });

  it("changes load without also increasing volume after progression is earned", () => {
    const history = [0, 1, 2].map((index) => session(index, exposure()));
    const assessment = assessExerciseProgression(history, "bench");

    expect(assessment?.volumeRecommendation).toBe("add_set");
    expect(assessment?.coachActions).toContain("increase_load");
    expect(assessment?.coachActions).not.toContain("add_volume");
  });

  it("does not interpret multiple stalled exercises as evidence to add muscle volume", () => {
    const stalled = (exerciseId: string, exerciseName: string) => ({
      ...assessExerciseProgression(
        [0, 1, 2].map((index) => session(index, exposure({ exerciseId, exerciseName, progressionEarned: false }))),
        exerciseId,
      )!,
    });
    const exercises = ["bench", "fly"].map((id) => ({
      id,
      primaryMuscles: ["chest"],
    })) as unknown as Exercise[];

    const chest = assessMuscleProgression(
      [stalled("bench", "Bench Press"), stalled("fly", "Cable Fly")],
      exercises,
    ).find((assessment) => assessment.muscleGroup === "chest");

    expect(chest?.stalledExercises).toHaveLength(2);
    expect(chest?.recommendation).toBe("maintain");
  });
});
