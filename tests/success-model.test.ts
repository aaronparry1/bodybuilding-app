import { describe, expect, it } from "vitest";
import { getSuccessModel, successModels } from "@/domain/training/success-model";
import type { StrategicSignals } from "@/domain/training/strategic-coaching";

const baseSignals: StrategicSignals = {
  progressionRate: 0.1,
  qualitySetTrend: "flat",
  fatigueTrend: "moderate",
  volumeTolerance: "stable",
  exercisePerformanceTrend: "flat",
  recoveryTrend: "unknown",
  stalledExercises: [],
  progressingMuscles: [],
  undertrainedMuscles: [],
  overreachedMuscles: [],
  sessionsAnalyzed: 5,
  exerciseEntriesAnalyzed: 10,
  averageQualitySets: 3,
  shutdownRate: 0.1,
};

describe("goal-based success model", () => {
  it("defines success priorities for every setup goal", () => {
    expect(Object.keys(successModels)).toEqual([
      "build_strength",
      "build_muscle",
      "build_muscle_and_strength",
      "athletic_performance",
      "get_leaner",
      "powerlifting_meet",
    ]);

    for (const model of Object.values(successModels)) {
      expect(model.primarySuccess.length).toBeGreaterThan(0);
      expect(model.secondarySuccess.length).toBeGreaterThan(0);
      expect(model.coachingPriorities.length).toBeGreaterThan(0);
    }
  });

  it("prioritises different coaching levers by goal", () => {
    expect(getSuccessModel("build_strength").recommendationBias.protectMainLifts).toBe(true);
    expect(getSuccessModel("build_muscle").recommendationBias.volumeFirst).toBe(true);
    expect(getSuccessModel("athletic_performance").recommendationBias.deloadEarlier).toBe(true);
    expect(getSuccessModel("get_leaner").recommendationBias.deloadEarlier).toBe(true);
    expect(getSuccessModel("powerlifting_meet").recommendationBias.protectMainLifts).toBe(true);
  });

  it("provides a safe fallback model", () => {
    expect(getSuccessModel(undefined).goal).toBe("build_muscle_and_strength");
  });

  it("uses coach-readable success model reasons", () => {
    expect(getSuccessModel("build_strength").label).toBe("Get Stronger");
    expect(getSuccessModel("build_muscle").primarySuccess.join(" ")).toContain("productive");
    expect(getSuccessModel("athletic_performance").coachingPriorities.join(" ")).toContain("quality");
    expect(
      getSuccessModel("get_leaner").coachingPriorities.join(" ").includes("preserve strength") &&
        baseSignals.fatigueTrend === "moderate",
    ).toBe(true);
  });
});
