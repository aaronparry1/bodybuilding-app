import { describe, expect, it } from "vitest";
import {
  resolveExerciseTargetZone,
  targetZoneLabel,
  targetZoneMidpoint,
} from "@/domain/training/exercise-target-zone";
import type { Exercise, ExerciseHistorySummary, RepRange, SetLog } from "@/domain/training/models";

const repRange: RepRange = { min: 8, max: 12 };

function exercise(patch: Partial<Exercise> = {}): Exercise {
  return {
    id: "ex-bench",
    name: "Bench Press",
    category: "chest",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["barbell"],
    movementPattern: "horizontal_push",
    defaultRepRange: repRange,
    defaultLoadJump: 2.5,
    unitCompatibility: ["kg", "lb"],
    kind: "barbell",
    role: "primary_compound",
    roles: ["primary_compound"],
    family: "horizontal_press",
    tier: "A",
    fatigueCost: "high",
    jointStress: "moderate",
    suitability: ["beginner", "intermediate", "advanced"],
    isBeginnerFriendly: true,
    isAdvanced: false,
    notes: [],
    suitableBlocks: ["hypertrophy", "powerbuilding", "strength", "power", "peak", "deload"],
    swapTags: ["bench", "press"],
    isCustom: false,
    defaultSettings: {
      repRange,
      dropOffPercent: 15,
      loadIncrease: 2.5,
      requiredWorkSets: 3,
      unit: "kg",
    },
    ...patch,
  };
}

function entry(index: number, patch: Partial<ExerciseHistorySummary> = {}): ExerciseHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: "Push",
    completedAt: `2026-05-${String(index).padStart(2, "0")}T12:00:00.000Z`,
    exerciseLogId: `log-${index}`,
    exerciseId: "ex-bench",
    exerciseName: "Bench Press",
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 27,
    qualitySets: 3,
    bestSetReps: 9,
    dropOffThreshold: 15,
    stoppedByDropOff: false,
    progressionEarned: false,
    nextRecommendedLoad: 100,
    volumeLoad: 2700,
    ...patch,
  };
}

function workSet(id: string, reps: number, load: number, type: SetLog["type"] = "work"): SetLog {
  return { id, reps, load, type, setNumber: Number(id.replace(/\D/g, "")) || 1, loggedAt: "2026-06-14T12:00:00.000Z" };
}

describe("exercise-specific target zone learning", () => {
  it("uses role and block defaults before enough evidence exists", () => {
    expect(
      resolveExerciseTargetZone({
        exercise: exercise(),
        repRange,
        block: "hypertrophy",
      }),
    ).toMatchObject({
      state: "balanced_default",
      targetZone: { min: 9, max: 10 },
      evidenceQuality: "insufficient_data",
    });

    expect(
      resolveExerciseTargetZone({
        exercise: exercise(),
        repRange,
        block: "strength",
        exerciseRole: "primary_compound",
      }).targetZone,
    ).toEqual({ min: 8, max: 9 });

    expect(
      resolveExerciseTargetZone({
        exercise: exercise({ role: "isolation", family: "chest_isolation", movementPattern: "isolation" }),
        repRange: { min: 12, max: 20 },
        block: "hypertrophy",
      }).targetZone,
    ).toEqual({ min: 16, max: 18 });
  });

  it("keeps power, peak, and Recovery Window work quality-led instead of preference-led", () => {
    expect(resolveExerciseTargetZone({ exercise: exercise(), repRange, block: "power" }).guidance).toContain("Keep it sharp");
    expect(resolveExerciseTargetZone({ exercise: exercise(), repRange, block: "peak" }).guidance).toContain("Specificity first");
    expect(resolveExerciseTargetZone({ exercise: exercise(), repRange, block: "deload" }).guidance).toContain("Easy quality");
  });

  it("does not learn from one-sided low-only samples", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise(),
      repRange,
      recentExerciseHistory: [
        entry(1, { repsCompleted: 24, bestSetReps: 8, progressionEarned: true }),
        entry(2, { repsCompleted: 24, bestSetReps: 8, progressionEarned: true, load: 102.5 }),
        entry(3, { repsCompleted: 27, bestSetReps: 9, progressionEarned: true, load: 105 }),
      ],
    });

    expect(result.state).toBe("insufficient_data");
    expect(result.evidenceQuality).toBe("biased_low_only");
    expect(result.guidance).toContain("Stay at this load");
  });

  it("learns load-biased target zones from repeatable low-zone success with balanced evidence", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise(),
      repRange,
      recentExerciseHistory: [
        entry(1, { repsCompleted: 24, bestSetReps: 8, progressionEarned: true, load: 100 }),
        entry(2, { repsCompleted: 27, bestSetReps: 9, progressionEarned: true, load: 102.5 }),
        entry(3, { repsCompleted: 24, bestSetReps: 8, progressionEarned: true, load: 105 }),
        entry(4, { repsCompleted: 30, bestSetReps: 10, load: 105 }),
        entry(5, { repsCompleted: 36, bestSetReps: 12, load: 105 }),
      ],
    });

    expect(result.state).toBe("load_biased");
    expect(result.targetZone).toEqual({ min: 8, max: 9 });
    expect(result.guidance).toContain("Heavy-end work");
  });

  it("treats approved higher next-load decisions as progression success evidence", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise(),
      repRange,
      recentExerciseHistory: [
        entry(1, { repsCompleted: 24, bestSetReps: 8, nextLoadApprovalStatus: "approved", nextRecommendedLoad: 102.5, load: 100 }),
        entry(2, { repsCompleted: 27, bestSetReps: 9, nextLoadApprovalStatus: "approved", nextRecommendedLoad: 105, load: 102.5 }),
        entry(3, { repsCompleted: 24, bestSetReps: 8, nextLoadApprovalStatus: "approved", nextRecommendedLoad: 107.5, load: 105 }),
        entry(4, { repsCompleted: 30, bestSetReps: 10, load: 105 }),
        entry(5, { repsCompleted: 36, bestSetReps: 12, load: 105 }),
      ],
    });

    expect(result.state).toBe("load_biased");
    expect(result.targetZone).toEqual({ min: 8, max: 9 });
  });

  it("learns balanced target zones when middle-zone work is most repeatable", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise(),
      repRange,
      recentExerciseHistory: [
        entry(1, { repsCompleted: 24, bestSetReps: 8, load: 100 }),
        entry(2, { repsCompleted: 30, bestSetReps: 10, progressionEarned: true, load: 100 }),
        entry(3, { repsCompleted: 30, bestSetReps: 10, progressionEarned: true, load: 102.5 }),
        entry(4, { repsCompleted: 36, bestSetReps: 12, load: 102.5 }),
      ],
    });

    expect(result.state).toBe("balanced");
    expect(result.targetZone).toEqual({ min: 9, max: 10 });
  });

  it("learns rep-biased target zones from repeatable upper-zone success with balanced evidence", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise({ role: "isolation", family: "biceps_isolation", movementPattern: "isolation" }),
      repRange: { min: 12, max: 20 },
      recentExerciseHistory: [
        entry(1, { repsCompleted: 36, bestSetReps: 12, load: 20 }),
        entry(2, { repsCompleted: 48, bestSetReps: 16, progressionEarned: true, load: 20 }),
        entry(3, { repsCompleted: 54, bestSetReps: 18, progressionEarned: true, load: 20 }),
        entry(4, { repsCompleted: 60, bestSetReps: 20, progressionEarned: true, load: 22.5 }),
      ],
    });

    expect(result.state).toBe("rep_biased");
    expect(result.targetZone).toEqual({ min: 16, max: 18 });
    expect(result.guidance).toContain("Build reps first");
  });

  it("suppresses learning from fatigue, pain, equipment, and manual-finish confounds", () => {
    const confounded = [
      entry(1, { progressionEarned: true, stoppedByDropOff: true }),
      entry(2, { progressionEarned: true, finishedManually: true, finishReason: "pain_limitation" }),
      entry(3, { progressionEarned: true, finishedManually: true, finishReason: "equipment_unavailable" }),
      entry(4, { progressionEarned: true, finishedManually: true, finishReason: "taking_it_easy" }),
    ];
    const result = resolveExerciseTargetZone({ exercise: exercise(), repRange, recentExerciseHistory: confounded });

    expect(result.state).toBe("balanced_default");
    expect(result.exposures).toBe(0);
  });

  it("ignores warm-ups and deleted rows that are absent from work-set evidence", () => {
    const result = resolveExerciseTargetZone({
      exercise: exercise(),
      repRange,
      completedProductiveWorkSets: [
        workSet("warm-1", 8, 40, "warmup"),
        workSet("work-1", 10, 100),
      ],
    });

    expect(result.exposures).toBe(1);
    expect(result.productiveSets).toBe(1);
    expect(result.state).toBe("insufficient_data");
  });

  it("formats target zones for recommendation alignment", () => {
    const zone = { min: 16, max: 18 };
    expect(targetZoneLabel(zone)).toBe("16-18");
    expect(targetZoneMidpoint(zone)).toBe(17);
  });
});
