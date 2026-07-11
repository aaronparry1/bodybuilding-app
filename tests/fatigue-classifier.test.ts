import { describe, expect, it } from "vitest";
import { classifyFatigue } from "@/domain/training/fatigue-classifier";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

describe("fatigue classifier", () => {
  it("classifies repeated decline in one lift as exercise-specific fatigue", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1, { bestSetReps: 10, qualitySets: 3 })]),
        workout(2, [entry("ex-bench-press", "Bench Press", 2, { bestSetReps: 9, qualitySets: 2 })]),
        workout(3, [entry("ex-bench-press", "Bench Press", 3, { bestSetReps: 8, qualitySets: 1, stoppedByDropOff: true })]),
        workout(4, [entry("ex-bench-press", "Bench Press", 4, { bestSetReps: 7, qualitySets: 1, stoppedByDropOff: true })]),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("exercise_specific");
    expect(result.recommendedResponse).toContain("Do not deload the whole plan");
    expect(result.affectedExerciseIds).toContain("ex-bench-press");
  });

  it("classifies several declining exercises for one muscle as muscle-local fatigue", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1, { bestSetReps: 12 }), entry("ex-machine-chest-press", "Machine Chest Press", 1, { bestSetReps: 12 })]),
        workout(2, [entry("ex-bench-press", "Bench Press", 2, { bestSetReps: 10 }), entry("ex-machine-chest-press", "Machine Chest Press", 2, { bestSetReps: 10 })]),
        workout(3, [entry("ex-bench-press", "Bench Press", 3, { bestSetReps: 8, stoppedByDropOff: true }), entry("ex-machine-chest-press", "Machine Chest Press", 3, { bestSetReps: 8 })]),
        workout(4, [entry("ex-bench-press", "Bench Press", 4, { bestSetReps: 7, stoppedByDropOff: true }), entry("ex-machine-chest-press", "Machine Chest Press", 4, { bestSetReps: 7 })]),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("muscle_local");
    expect(result.affectedMuscles).toContain("chest");
    expect(result.recommendedResponse).toContain("Reduce local muscle volume");
  });

  it("classifies multiple unrelated declines as systemic fatigue", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1, { bestSetReps: 10 }), entry("ex-chest-supported-row", "Chest-Supported Row", 1, { bestSetReps: 12 }), entry("ex-barbell-back-squat", "Back Squat", 1, { bestSetReps: 8 })]),
        workout(2, [entry("ex-bench-press", "Bench Press", 2, { bestSetReps: 9 }), entry("ex-chest-supported-row", "Chest-Supported Row", 2, { bestSetReps: 10 }), entry("ex-barbell-back-squat", "Back Squat", 2, { bestSetReps: 7 })]),
        workout(3, [entry("ex-bench-press", "Bench Press", 3, { bestSetReps: 8, stoppedByDropOff: true }), entry("ex-chest-supported-row", "Chest-Supported Row", 3, { bestSetReps: 8, stoppedByDropOff: true }), entry("ex-barbell-back-squat", "Back Squat", 3, { bestSetReps: 6, stoppedByDropOff: true })]),
        workout(4, [entry("ex-bench-press", "Bench Press", 4, { bestSetReps: 7, stoppedByDropOff: true }), entry("ex-chest-supported-row", "Chest-Supported Row", 4, { bestSetReps: 7, stoppedByDropOff: true }), entry("ex-barbell-back-squat", "Back Squat", 4, { bestSetReps: 5, stoppedByDropOff: true })]),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("mixed");
    expect(result.severity).toBe("high");
    expect(result.recommendedResponse).toContain("broader fatigue");
  });

  it("does not convert repeated productive hypertrophy isolation shutdowns into systemic fatigue by count alone", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-cable-fly", "Cable Fly", 1, { load: 20, bestSetReps: 15, progressionEarned: true, stoppedByDropOff: true })]),
        workout(2, [entry("ex-cable-fly", "Cable Fly", 2, { load: 20, bestSetReps: 16, progressionEarned: true, stoppedByDropOff: true })]),
        workout(3, [entry("ex-cable-fly", "Cable Fly", 3, { load: 22.5, bestSetReps: 16, progressionEarned: true, stoppedByDropOff: true })]),
        workout(4, [entry("ex-cable-fly", "Cable Fly", 4, { load: 22.5, bestSetReps: 17, progressionEarned: true, stoppedByDropOff: true })]),
      ],
      exercises: exerciseLibrary,
      block: "hypertrophy",
      goal: "build_muscle",
    });

    expect(result.classification).not.toBe("systemic");
    expect(result.classification).not.toBe("mixed");
    expect(result.evidence.join(" ")).toContain("productive shutdown");
  });

  it("keeps true repeated compound regression eligible for systemic fatigue", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1, { bestSetReps: 10 }), entry("ex-barbell-back-squat", "Back Squat", 1, { bestSetReps: 8 }), entry("ex-deadlift", "Deadlift", 1, { bestSetReps: 6 })]),
        workout(2, [entry("ex-bench-press", "Bench Press", 2, { bestSetReps: 8, qualitySets: 2, stoppedByDropOff: true }), entry("ex-barbell-back-squat", "Back Squat", 2, { bestSetReps: 6, qualitySets: 2, stoppedByDropOff: true }), entry("ex-deadlift", "Deadlift", 2, { bestSetReps: 5, qualitySets: 2, stoppedByDropOff: true })]),
        workout(3, [entry("ex-bench-press", "Bench Press", 3, { bestSetReps: 6, qualitySets: 1, stoppedByDropOff: true }), entry("ex-barbell-back-squat", "Back Squat", 3, { bestSetReps: 5, qualitySets: 1, stoppedByDropOff: true }), entry("ex-deadlift", "Deadlift", 3, { bestSetReps: 4, qualitySets: 1, stoppedByDropOff: true })]),
      ],
      exercises: exerciseLibrary,
      block: "strength",
      goal: "build_strength",
    });

    expect(result.classification).toMatch(/systemic|mixed/);
    expect(result.evidence.join(" ")).toContain("regressive shutdown");
  });

  it("lets repeated extra sessions contribute to systemic fatigue", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1)], "extra_volume"),
        workout(2, [entry("ex-chest-supported-row", "Chest-Supported Row", 2)], "extra_volume"),
        workout(3, [entry("ex-barbell-back-squat", "Back Squat", 3)], "extra_full"),
        workout(4, [entry("ex-deadlift", "Deadlift", 4)], "planned"),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("systemic");
    expect(result.evidence.join(" ")).toContain("extra-session");
  });

  it("lets repeated hard cardio contribute to systemic fatigue without counting recovery walks", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1)]),
        cardioWorkout(2, "recovery_cardio", "easy"),
        cardioWorkout(3, "performance_conditioning", "hard"),
        cardioWorkout(4, "performance_conditioning", "hard"),
        cardioWorkout(5, "capacity_cardio", "hard"),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("systemic");
    expect(result.evidence.join(" ")).toContain("extra-session");
  });

  it("treats active deload as a broad fatigue override", () => {
    const result = classifyFatigue({
      workoutHistory: [workout(1, [entry("ex-bench-press", "Bench Press", 1)]), workout(2, [entry("ex-bench-press", "Bench Press", 2)]), workout(3, [entry("ex-bench-press", "Bench Press", 3)]), workout(4, [entry("ex-bench-press", "Bench Press", 4)])],
      exercises: exerciseLibrary,
      deloadActive: true,
    });

    expect(result.classification).toBe("systemic");
    expect(result.severity).toBe("high");
    expect(result.evidence.join(" ")).toContain("Deload state is active");
  });

  it("excludes zero-work warm-up-only rows and stays conservative on low data", () => {
    const result = classifyFatigue({
      workoutHistory: [
        workout(1, [entry("ex-bench-press", "Bench Press", 1, { setsCompleted: 0, qualitySets: 0, repsCompleted: 0 })]),
        workout(2, [entry("ex-bench-press", "Bench Press", 2, { setsCompleted: 0, qualitySets: 0, repsCompleted: 0 })]),
        workout(3, [entry("ex-bench-press", "Bench Press", 3, { setsCompleted: 0, qualitySets: 0, repsCompleted: 0 })]),
      ],
      exercises: exerciseLibrary,
    });

    expect(result.classification).toBe("insufficient_data");
    expect(result.confidence).toBe("insufficient_data");
  });
});

function workout(index: number, exerciseSummaries: ExerciseHistorySummary[], sessionKind: WorkoutHistorySummary["sessionKind"] = "planned"): WorkoutHistorySummary {
  return {
    sessionId: `session-${index}`,
    userId: "user-1",
    sessionKind,
    sessionName: "Workout",
    startedAt: `2026-06-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    completedAt: `2026-06-${String(index).padStart(2, "0")}T11:00:00.000Z`,
    durationMinutes: 60,
    exercisesCompleted: exerciseSummaries.length,
    setsCompleted: exerciseSummaries.reduce((sum, entry) => sum + entry.setsCompleted, 0),
    repsCompleted: exerciseSummaries.reduce((sum, entry) => sum + entry.repsCompleted, 0),
    totalLoadVolume: exerciseSummaries.reduce((sum, entry) => sum + entry.volumeLoad, 0),
    progressionHighlights: [],
    exerciseSummaries,
  };
}

function cardioWorkout(index: number, sessionKind: "recovery_cardio" | "capacity_cardio" | "performance_conditioning", perceivedEase: "easy" | "moderate" | "hard"): WorkoutHistorySummary {
  return {
    sessionId: `cardio-${index}`,
    sessionKind,
    sessionName: "Cardio",
    startedAt: `2026-06-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    completedAt: `2026-06-${String(index).padStart(2, "0")}T10:20:00.000Z`,
    durationMinutes: 20,
    exercisesCompleted: 0,
    setsCompleted: 0,
    repsCompleted: 0,
    totalLoadVolume: 0,
    progressionHighlights: [],
    exerciseSummaries: [],
    cardioLog: {
      sessionType: sessionKind,
      modality: sessionKind === "performance_conditioning" ? "run" : "bike",
      durationMinutes: 20,
      perceivedEase,
      loggedAt: `2026-06-${String(index).padStart(2, "0")}T10:20:00.000Z`,
    },
  };
}

function entry(exerciseId: string, exerciseName: string, index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Workout",
    completedAt: `2026-06-${String(index).padStart(2, "0")}T11:00:00.000Z`,
    exerciseLogId: `${exerciseId}-${index}`,
    exerciseId,
    exerciseName,
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
