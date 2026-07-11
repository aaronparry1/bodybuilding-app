import { describe, expect, it } from "vitest";
import {
  calculateBestSet,
  calculateMinimumAllowedReps,
  calculateNextRecommendedLoad,
  calculateRepDropOffThreshold,
  defaultDropOffPercent,
  earnedLoadIncrease,
  evaluateExerciseProgression,
  formatLoad,
  getDefaultLoadIncrease,
  shouldContinueExercise,
  shouldStopExercise,
} from "@/domain/training/progression-engine";
import type { ProgressionSettings } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

const hypertrophyKg: ProgressionSettings = {
  repRange: { min: 8, max: 12 },
  dropOffPercent: 15,
  loadIncrease: 2.5,
  unit: "kg",
  requiredWorkSets: 3,
};

const hypertrophyLb: ProgressionSettings = {
  ...hypertrophyKg,
  loadIncrease: 5,
  unit: "lb",
};

describe("progression engine primitives", () => {
  it("calculates best set, drop-off threshold, and floored minimum allowed reps", () => {
    const sets = [{ reps: 12 }, { reps: 11 }, { reps: 10 }];

    expect(defaultDropOffPercent).toBe(15);
    expect(calculateBestSet(sets)).toBe(12);
    expect(calculateRepDropOffThreshold(12)).toBe(1.7999999999999998);
    expect(calculateMinimumAllowedReps(12)).toBe(10);
  });

  it("determines continue and stop decisions from logged reps only", () => {
    const passingSets = [{ reps: 12 }, { reps: 11 }, { reps: 10 }];
    const failedSets = [...passingSets, { reps: 8 }];

    expect(shouldContinueExercise(passingSets, 15)).toBe(true);
    expect(shouldStopExercise(passingSets, 15)).toBe(false);
    expect(shouldContinueExercise(failedSets, 15)).toBe(false);
    expect(shouldStopExercise(failedSets, 15)).toBe(true);
  });

  it("handles kg and lb default jumps plus custom load jumps", () => {
    expect(getDefaultLoadIncrease("kg")).toBe(2.5);
    expect(getDefaultLoadIncrease("lb")).toBe(5);
    expect(calculateNextRecommendedLoad({ currentLoad: 100, unit: "kg", earnedIncrease: true })).toBe(102.5);
    expect(calculateNextRecommendedLoad({ currentLoad: 225, unit: "lb", earnedIncrease: true })).toBe(230);
    expect(calculateNextRecommendedLoad({ currentLoad: 40, unit: "kg", earnedIncrease: true, customLoadJump: 1 })).toBe(41);
    expect(formatLoad(102.5, "kg")).toBe("102.5kg");
    expect(formatLoad(230, "lb")).toBe("230lb");
  });
});

describe("realistic progression examples", () => {
  it("successful progression: reaches top of range while staying inside drop-off", () => {
    const sets = [
      { setNumber: 1, reps: 12, load: 100 },
      { setNumber: 2, reps: 11, load: 100 },
      { setNumber: 3, reps: 10, load: 100 },
    ];

    const result = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets,
    });

    expect(earnedLoadIncrease(sets, hypertrophyKg)).toBe(true);
    expect(result.shouldShutdown).toBe(false);
    expect(result.shouldContinue).toBe(true);
    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(102.5);
    expect(result.recommendation).toContain("Increase load next time");
  });

  it("failed progression: enough work was not completed at the top of the range", () => {
    const sets = [
      { setNumber: 1, reps: 11, load: 100 },
      { setNumber: 2, reps: 10, load: 100 },
      { setNumber: 3, reps: 10, load: 100 },
    ];

    const result = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets,
    });

    expect(result.shouldShutdown).toBe(false);
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(100);
    expect(result.recommendation).toContain("Keep the load");
  });

  it("productive but sub-top performance keeps load and targets more reps next time", () => {
    const result = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 10, load: 100 },
        { setNumber: 2, reps: 10, load: 100 },
        { setNumber: 3, reps: 9, load: 100 },
      ],
    });

    expect(result.shouldShutdown).toBe(false);
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(100);
    expect(result.recommendation).toBe("Keep the load. Aim for more clean reps next time.");
  });

  it("exercise shutdown: latest set drops below the allowed minimum", () => {
    const result = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 11, load: 100 },
        { setNumber: 3, reps: 10, load: 100 },
        { setNumber: 4, reps: 8, load: 100 },
      ],
    });

    expect(result.bestSetReps).toBe(12);
    expect(result.minimumAcceptableReps).toBe(10);
    expect(result.shouldShutdown).toBe(true);
    expect(result.shouldContinue).toBe(false);
    expect(result.shutdownMessage).toContain("Performance dropped enough to move on from bench press today.");
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.recommendation).toContain("Stop this exercise");
  });

  it("bench press audit example: 12/11/10/8 shuts down and does not earn 105kg", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
    const result = evaluateExerciseProgression({
      exerciseName: bench.name,
      currentLoad: 100,
      settings: bench.defaultSettings,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 11, load: 100 },
        { setNumber: 3, reps: 10, load: 100 },
        { setNumber: 4, reps: 8, load: 100 },
      ],
    });

    expect(result.bestSetReps).toBe(12);
    expect(result.minimumAcceptableReps).toBe(10);
    expect(result.shouldShutdown).toBe(true);
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(100);
  });

  it("bench press audit example: 12/11/10/10 earns the seeded 5kg load jump", () => {
    const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
    const result = evaluateExerciseProgression({
      exerciseName: bench.name,
      currentLoad: 100,
      settings: bench.defaultSettings,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 11, load: 100 },
        { setNumber: 3, reps: 10, load: 100 },
        { setNumber: 4, reps: 10, load: 100 },
      ],
    });

    expect(result.shouldShutdown).toBe(false);
    expect(result.completedAcceptableSets).toBe(4);
    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(105);
  });

  it("beginner low-load example: small custom kg jump is supported", () => {
    const beginnerSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 10, max: 15 },
      loadIncrease: 1.25,
      requiredWorkSets: 2,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Dumbbell Curl",
      currentLoad: 7.5,
      settings: beginnerSettings,
      sets: [
        { setNumber: 1, reps: 15, load: 7.5 },
        { setNumber: 2, reps: 13, load: 7.5 },
      ],
    });

    expect(result.minimumAcceptableReps).toBe(12);
    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(8.75);
  });

  it("advanced high-load example: larger custom kg jump is supported", () => {
    const advancedSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 6, max: 10 },
      loadIncrease: 5,
      requiredWorkSets: 3,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Hack Squat",
      currentLoad: 220,
      settings: advancedSettings,
      sets: [
        { setNumber: 1, reps: 10, load: 220 },
        { setNumber: 2, reps: 9, load: 220 },
        { setNumber: 3, reps: 8, load: 220 },
      ],
    });

    expect(result.minimumAcceptableReps).toBe(8);
    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(225);
  });

  it("bodyweight exercise example: progression can be earned without adding load", () => {
    const bodyweightSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 8, max: 12 },
      loadIncrease: 0,
      requiredWorkSets: 3,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Pull-Up",
      currentLoad: 0,
      settings: bodyweightSettings,
      sets: [
        { setNumber: 1, reps: 12, load: 0 },
        { setNumber: 2, reps: 11, load: 0 },
        { setNumber: 3, reps: 10, load: 0 },
      ],
    });

    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(0);
  });

  it("treats heavier-load high-rep isolation work inside range as productive progression, not deterioration", () => {
    const spiderCurlSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 12, max: 25 },
      loadIncrease: 5,
      requiredWorkSets: 2,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Spider Curl",
      currentLoad: 10,
      settings: spiderCurlSettings,
      sets: [
        { setNumber: 1, reps: 25, load: 5 },
        { setNumber: 2, reps: 25, load: 5 },
        { setNumber: 3, reps: 25, load: 5 },
        { setNumber: 4, reps: 20, load: 10 },
        { setNumber: 5, reps: 16, load: 10 },
      ],
    });

    expect(result.shouldShutdown).toBe(false);
    expect(result.shouldContinue).toBe(true);
    expect(result.completedAcceptableSets).toBe(5);
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(10);
    expect(result.recommendation).toContain("Good load progression");
  });

  it("treats a heavier load below the prescribed range as too heavy", () => {
    const spiderCurlSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 12, max: 25 },
      loadIncrease: 5,
      requiredWorkSets: 2,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Spider Curl",
      currentLoad: 10,
      settings: spiderCurlSettings,
      sets: [
        { setNumber: 1, reps: 25, load: 5 },
        { setNumber: 2, reps: 25, load: 5 },
        { setNumber: 3, reps: 25, load: 5 },
        { setNumber: 4, reps: 8, load: 10 },
      ],
    });

    expect(result.shouldShutdown).toBe(true);
    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(10);
    expect(result.recommendation).toContain("Stop this exercise");
  });

  it("keeps same-load drop-off shutdown strict", () => {
    const spiderCurlSettings: ProgressionSettings = {
      ...hypertrophyKg,
      repRange: { min: 12, max: 25 },
      loadIncrease: 5,
      requiredWorkSets: 2,
    };

    const result = evaluateExerciseProgression({
      exerciseName: "Spider Curl",
      currentLoad: 10,
      settings: spiderCurlSettings,
      sets: [
        { setNumber: 1, reps: 20, load: 10 },
        { setNumber: 2, reps: 12, load: 10 },
        { setNumber: 3, reps: 8, load: 10 },
      ],
    });

    expect(result.shouldShutdown).toBe(true);
    expect(result.shouldIncreaseLoad).toBe(false);
  });

  it("preserves compound safety when a heavier load collapses below range", () => {
    const result = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 105,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 5, load: 105 },
      ],
    });

    expect(result.shouldShutdown).toBe(true);
    expect(result.shouldIncreaseLoad).toBe(false);
  });

  it("lb example: successful progression uses pound jumps", () => {
    const result = evaluateExerciseProgression({
      exerciseName: "Incline Press",
      currentLoad: 135,
      settings: hypertrophyLb,
      sets: [
        { setNumber: 1, reps: 12, load: 135 },
        { setNumber: 2, reps: 11, load: 135 },
        { setNumber: 3, reps: 10, load: 135 },
      ],
    });

    expect(result.shouldIncreaseLoad).toBe(true);
    expect(result.nextLoad).toBe(140);
  });
});

describe("recommendation transparency", () => {
  it("explains why increase, hold, and shutdown recommendations happen", () => {
    const increase = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 11, load: 100 },
        { setNumber: 3, reps: 10, load: 100 },
      ],
    });
    const hold = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 10, load: 100 },
        { setNumber: 2, reps: 10, load: 100 },
        { setNumber: 3, reps: 9, load: 100 },
      ],
    });
    const shutdown = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: hypertrophyKg,
      sets: [
        { setNumber: 1, reps: 12, load: 100 },
        { setNumber: 2, reps: 11, load: 100 },
        { setNumber: 3, reps: 8, load: 100 },
      ],
    });

    expect(increase.recommendation).toContain("Top-end reps");
    expect(hold.recommendation).toContain("Aim for more clean reps");
    expect(shutdown.recommendation).toContain("Stop this exercise");
  });
});

describe("edge cases", () => {
  it("does not stop before at least two sets are logged", () => {
    expect(shouldStopExercise([], 15)).toBe(false);
    expect(shouldStopExercise([{ reps: 4 }], 15)).toBe(false);
  });

  it("supports custom drop-off thresholds", () => {
    expect(calculateMinimumAllowedReps(12, 10)).toBe(10);
    expect(calculateMinimumAllowedReps(12, 25)).toBe(9);
  });

  it("rejects invalid logged reps, thresholds, and loads", () => {
    expect(() => calculateBestSet([{ reps: -1 }])).toThrow("Logged reps");
    expect(() => calculateMinimumAllowedReps(12, 101)).toThrow("Drop-off percent");
    expect(() =>
      calculateNextRecommendedLoad({ currentLoad: -20, unit: "kg", earnedIncrease: true }),
    ).toThrow("Load must");
    expect(() =>
      calculateNextRecommendedLoad({
        currentLoad: 20,
        unit: "kg",
        earnedIncrease: true,
        customLoadJump: -2.5,
      }),
    ).toThrow("Load jump");
  });
});
