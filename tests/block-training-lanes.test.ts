import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import {
  getBlockLaneComposition,
  getLanePrescriptionConstraints,
  recalibrateLoadForBlockTransition,
  resolveHeavyExposureBudget,
  resolveTrainingLane,
} from "@/domain/training/block-training-lanes";
import { generateWorkoutByFocus } from "@/domain/training/ad-hoc-workout-generator";
import { resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";

describe("block training lanes", () => {
  it("returns biased-blend lane composition for each block", () => {
    expect(getBlockLaneComposition("hypertrophy")).toMatchObject({ hypertrophy: "high", strength: "moderate", power: "low", peak: "none" });
    expect(getBlockLaneComposition("powerbuilding")).toMatchObject({ hypertrophy: "moderate_high", strength: "moderate_high" });
    expect(getBlockLaneComposition("strength")).toMatchObject({ strength: "high", hypertrophy: "moderate" });
    expect(getBlockLaneComposition("power")).toMatchObject({ power: "high", strength: "moderate", hypertrophy: "low" });
    expect(getBlockLaneComposition("peak")).toMatchObject({ peak: "high", hypertrophy: "maintenance" });
    expect(getBlockLaneComposition("deload")).toMatchObject({ recovery: "high", hypertrophy: "maintenance" });
  });

  it("assigns lanes to planned exercise roles by block", () => {
    expect(resolveTrainingLane({ blockType: "hypertrophy", exerciseRole: "primary_compound" })).toBe("hypertrophy_strength");
    expect(resolveTrainingLane({ blockType: "powerbuilding", exerciseRole: "primary_compound" })).toBe("strength");
    expect(resolveTrainingLane({ blockType: "strength", exerciseRole: "isolation" })).toBe("maintenance");
    expect(resolveTrainingLane({ blockType: "power", exerciseRole: "power" })).toBe("power");
    expect(resolveTrainingLane({ blockType: "peak", exerciseRole: "primary_compound", plannedOrder: 1 })).toBe("peak");
    expect(resolveTrainingLane({ blockType: "deload", exerciseRole: "primary_compound" })).toBe("maintenance");
  });

  it("exposes lane-specific prescription constraints", () => {
    expect(getLanePrescriptionConstraints("hypertrophy").volumeLearning).toBe("strong");
    expect(getLanePrescriptionConstraints("strength").softCapBias).toBe("lower");
    expect(getLanePrescriptionConstraints("power").progressionPriority).toBe("conservative");
    expect(getLanePrescriptionConstraints("peak").volumeLearning).toBe("suppressed");
    expect(getLanePrescriptionConstraints("recovery").progressionPriority).toBe("suppressed");
  });

  it("adds lane metadata to generated workouts", () => {
    const strengthProgramme = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("strength"),
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight", "bands"],
      experienceLevel: "intermediate",
      unit: "kg",
    });
    const lanes = strengthProgramme.days[0]!.exerciseSlots.map((slot) => slot.settings.trainingLane);
    expect(lanes).toContain("strength");
    expect(lanes).toContain("strength_support");
    expect(lanes).toContain("maintenance");
    expect(strengthProgramme.days[0]!.exerciseSlots.every((slot) => slot.settings.softCapSets != null)).toBe(true);
  });

  it("power and peak lanes keep heavy exposure budgets tighter than hypertrophy", () => {
    const hypertrophy = resolveHeavyExposureBudget({ blockType: "hypertrophy", experienceLevel: "intermediate" });
    const power = resolveHeavyExposureBudget({ blockType: "power", experienceLevel: "intermediate" });
    const peak = resolveHeavyExposureBudget({ blockType: "peak", experienceLevel: "intermediate" });
    expect(power.highIntensitySetsPerSession).toBeGreaterThanOrEqual(hypertrophy.highIntensitySetsPerSession);
    expect(peak.hardCompoundSetsPerWeek).toBeLessThan(hypertrophy.hardCompoundSetsPerWeek);
    expect(resolveHeavyExposureBudget({ blockType: "strength", experienceLevel: "beginner" }).heavyExposuresPerWeek).toBeLessThan(
      resolveHeavyExposureBudget({ blockType: "strength", experienceLevel: "advanced" }).heavyExposuresPerWeek,
    );
  });

  it("does not blindly reuse hypertrophy loads for strength targets", () => {
    const recalibrated = recalibrateLoadForBlockTransition({
      previousLoad: 100,
      previousBestReps: 12,
      targetRepRange: { min: 3, max: 5 },
      increment: 2.5,
      lane: "strength",
      blockType: "strength",
    });

    expect(recalibrated.changed).toBe(true);
    expect(recalibrated.load).toBeGreaterThan(100);
    expect(recalibrated.load % 2.5).toBe(0);
  });

  it("maps strength loads back to sensible hypertrophy targets", () => {
    const recalibrated = recalibrateLoadForBlockTransition({
      previousLoad: 120,
      previousBestReps: 5,
      targetRepRange: { min: 8, max: 12 },
      increment: 2.5,
      lane: "hypertrophy",
      blockType: "hypertrophy",
    });

    expect(recalibrated.changed).toBe(true);
    expect(recalibrated.load).toBeLessThan(120);
  });

  it("keeps unknown loads percentage-based because transition conversion needs work-set history", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: [],
      repRange: { min: 3, max: 5 },
      loadIncrement: 2.5,
      blockType: "strength",
      trainingLane: "strength",
    });

    expect(result.source).toBe("blank");
    expect(result.load).toBeUndefined();
  });

  it("recalibrates exact-history starting loads through production resolver", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
    const result = resolveStartingLoadRecommendation({
      targetExercise: bench,
      exercises: [bench],
      history: history([
        entry({
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          load: 100,
          bestSetReps: 12,
          nextRecommendedLoad: 100,
        }),
      ]),
      repRange: { min: 3, max: 5 },
      loadIncrement: 2.5,
      blockType: "strength",
      trainingLane: "strength",
      referenceDate: new Date("2026-05-02T12:00:00.000Z"),
    });

    expect(result.source).toBe("exact_history");
    expect(result.load).toBeGreaterThan(100);
    expect(result.recommendationEvidence?.summary).toContain("recalibrated");
  });
});

function entry(patch: Partial<ExerciseHistorySummary>): ExerciseHistorySummary {
  return {
    sessionId: "session-1",
    sessionName: "Push",
    completedAt: "2026-05-01T12:00:00.000Z",
    exerciseLogId: "log-1",
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 36,
    qualitySets: 3,
    bestSetReps: 12,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: true,
    nextRecommendedLoad: 100,
    volumeLoad: 3600,
    ...patch,
  };
}

function history(entries: ExerciseHistorySummary[]): WorkoutHistorySummary[] {
  return entries.map((exerciseEntry, index) => ({
    sessionId: `session-${index}`,
    sessionName: exerciseEntry.sessionName ?? "Push",
    startedAt: "2026-05-01T11:00:00.000Z",
    completedAt: exerciseEntry.completedAt ?? "2026-05-01T12:00:00.000Z",
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: exerciseEntry.setsCompleted,
    repsCompleted: exerciseEntry.repsCompleted,
    totalLoadVolume: exerciseEntry.volumeLoad,
    progressionHighlights: [],
    exerciseSummaries: [exerciseEntry],
  }));
}
