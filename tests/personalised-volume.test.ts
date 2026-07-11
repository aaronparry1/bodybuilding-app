import { describe, expect, it } from "vitest";
import {
  analyzePersonalisedMuscleVolume,
  getPrimaryPersonalisedVolumeRecommendation,
  type VolumeLadderAction,
} from "@/domain/training/personalised-volume";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";

const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-0${Math.min(index, 6)}-02T10:00:00.000Z`,
    exerciseLogId: `entry-${index}`,
    exerciseId: bench.id,
    exerciseName: bench.name,
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
    equipment: bench.equipment,
    ...patch,
  };
}

function workout(index: number, entries: ExerciseHistorySummary[], patch: Partial<WorkoutHistorySummary> = {}): WorkoutHistorySummary {
  const date = new Date(Date.UTC(2026, 0, 5 + index * 7, 10, 0, 0)).toISOString();
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    startedAt: date,
    completedAt: date,
    durationMinutes: 60,
    exercisesCompleted: entries.length,
    setsCompleted: entries.reduce((sum, item) => sum + item.setsCompleted, 0),
    repsCompleted: entries.reduce((sum, item) => sum + item.repsCompleted, 0),
    totalLoadVolume: entries.reduce((sum, item) => sum + item.volumeLoad, 0),
    progressionHighlights: [],
    exerciseSummaries: entries.map((item) => ({ ...item, completedAt: date, sessionId: `session-${index}` })),
    ...patch,
  };
}

function history(weeklyQualitySets: number[], patch: Partial<ExerciseHistorySummary> = {}, previousActions: VolumeLadderAction[] = []) {
  return {
    completedWorkouts: weeklyQualitySets.map((qualitySets, index) =>
      workout(index + 1, [
        entry(index + 1, {
          qualitySets,
          setsCompleted: Math.max(qualitySets, 3),
          progressionEarned: false,
          ...patch,
        }),
      ]),
    ),
    previousActions,
  };
}

describe("personalised muscle-volume learning", () => {
  it("returns insufficient data until there are enough weeks, exposures, and productive work", () => {
    const input = history([3, 3]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("insufficient_data");
    expect(result.recommendedLadderAction).toBe("insufficient_data");
    expect(result.userCopy).toContain("smart, not psychic");
  });

  it("mild underdosing biases the user toward the top of the existing range first", () => {
    const input = history([7, 8, 9]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("underdosed");
    expect(result.recommendedLadderAction).toBe("bias_high");
    expect(result.userCopy).toContain("top of the range");
  });

  it("does not add volume when separated fatigue is systemic", () => {
    const input = history([7, 8, 9]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      fatigueClassification: {
        classification: "systemic",
        severity: "high",
        confidence: "high",
        evidence: ["Multiple unrelated lifts are declining."],
        recommendedResponse: "Hold broad progression and consider deload, re-entry, or a calmer week.",
        affectedExerciseIds: ["ex-bench-press", "ex-deadlift"],
        affectedMuscles: ["chest", "hamstrings"],
      },
    });

    expect(result.status).toBe("underdosed");
    expect(result.recommendedLadderAction).toBe("hold");
  });

  it("repeated underdosing raises the range after a previous bias-high nudge", () => {
    const input = history([6, 7, 7], {}, ["bias_high"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: input.previousActions,
    });

    expect(result.recommendedLadderAction).toBe("raise_range");
    expect(result.userCopy).toContain("Start one set higher");
  });

  it("persistent underdosing after a raised range adds a low-fatigue accessory slot", () => {
    const input = history([6, 7, 7], {}, ["bias_high", "raise_range"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: input.previousActions,
    });

    expect(result.recommendedLadderAction).toBe("add_exercise");
    expect(result.userCopy).toContain("low-fatigue accessory");
  });

  it("holds when productive sets are in range and fatigue is manageable", () => {
    const input = history([12, 12, 13], { progressionEarned: true });
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("productive");
    expect(result.recommendedLadderAction).toBe("hold");
  });

  it("mild high cost biases low before changing the plan structure", () => {
    const input = history([15, 14, 15], { stoppedByDropOff: true });
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("high_cost");
    expect(result.recommendedLadderAction).toBe("lower_range");
  });

  it("repeated high cost lowers the range after a previous low-end nudge", () => {
    const input = history([15, 16, 15], { stoppedByDropOff: true }, ["bias_low"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "get_leaner",
      previousLadderActions: input.previousActions,
    });

    expect(result.recommendedLadderAction).toBe("lower_range");
  });

  it("persistent high cost after a lowered range removes or swaps low-priority accessory work", () => {
    const input = history([17, 17, 16], { stoppedByDropOff: true }, ["bias_low", "lower_range"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: input.previousActions,
    });

    expect(result.recommendedLadderAction).toBe("remove_or_swap_exercise");
    expect(result.userCopy).toContain("Swap or remove");
  });

  it("overreaching returns deload caution or a reduce action instead of adding volume", () => {
    const input = history([20, 18, 16], { stoppedByDropOff: true, progressionEarned: false });
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("overreaching");
    expect(result.recommendedLadderAction).toBe("deload_caution");
  });

  it("excludes below-threshold sets by using productive quality sets only", () => {
    const input = history([0, 0, 0], { setsCompleted: 5, repsCompleted: 50 });
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.status).toBe("insufficient_data");
    expect(result.evidence.averageProductiveSetsPerWeek).toBe(0);
  });

  it("counts extra sessions as muscle workload without treating them as planned completion", () => {
    const extra = history([6, 6, 6]).completedWorkouts.map((session) => ({ ...session, sessionKind: "extra_volume" as const, planSessionIndex: undefined }));
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: extra,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(result.evidence.extraSessionExposures).toBe(3);
    expect(extra.every((session) => session.sessionKind === "extra_volume" && session.planSessionIndex == null)).toBe(true);
  });

  it("Build Muscle adds volume more readily than Build Strength", () => {
    const input = history([10, 10, 10]);
    const muscle = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: ["bias_high"],
    });
    const strength = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_strength",
      previousLadderActions: ["bias_high"],
    });

    expect(muscle.recommendedLadderAction).toBe("raise_range");
    expect(strength.recommendedLadderAction).toBe("hold");
  });

  it("Athletic Performance reduces sooner when fatigue rises", () => {
    const input = history([13, 13, 13], { stoppedByDropOff: true });
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "athletic_performance",
    });

    expect(["lower_range", "deload_caution"]).toContain(result.recommendedLadderAction);
  });

  it("Get Leaner prefers bias actions before structural changes", () => {
    const input = history([7, 7, 7]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "get_leaner",
    });

    expect(result.recommendedLadderAction).toBe("bias_high");
  });

  it("deload suppresses add-volume actions", () => {
    const input = history([6, 6, 6], {}, ["bias_high", "raise_range"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: input.previousActions,
      deloadActive: true,
    });

    expect(result.recommendedLadderAction).toBe("hold");
  });

  it("event taper suppresses add-volume actions", () => {
    const input = history([6, 6, 6], {}, ["bias_high", "raise_range"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "powerlifting_meet",
      previousLadderActions: input.previousActions,
      eventTaper: resolveEventTaper({ eventType: "powerlifting_meet", weeksUntilEvent: 2 }),
    });

    expect(result.recommendedLadderAction).toBe("hold");
  });

  it("does not use the exercise soft cap as a normal target", () => {
    const input = history([7, 8, 9], {}, ["bias_high"]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: input.previousActions,
    });

    expect(result.userCopy).toContain("Start one set higher");
    expect(result.userCopy).not.toContain("8 sets");
  });

  it("prioritises the highest-confidence recommendation for Progress/Home surfacing", () => {
    const under = analyzePersonalisedMuscleVolume({
      completedWorkouts: history([6, 6, 6, 6, 6]).completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
      previousLadderActions: ["bias_high"],
    });
    const highCost = analyzePersonalisedMuscleVolume({
      completedWorkouts: history([20, 19, 18, 17, 16], { stoppedByDropOff: true }).completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(getPrimaryPersonalisedVolumeRecommendation([under, highCost])?.recommendedLadderAction).toBe("deload_caution");
  });

  it("keeps user-facing copy free of MEV/MAV/MRV jargon", () => {
    const input = history([7, 7, 7]);
    const result = analyzePersonalisedMuscleVolume({
      completedWorkouts: input.completedWorkouts,
      exercises: exerciseLibrary,
      muscleGroup: "chest",
      goal: "build_muscle",
    });

    expect(`${result.userCopy} ${result.reason} ${result.evidence.summary.join(" ")}`).not.toMatch(/MEV|MAV|MRV/i);
  });
});
