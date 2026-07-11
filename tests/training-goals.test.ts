import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { displayNameForTrainingSetupGoal, getTrainingGoal, isTrainingGoalId, trainingGoalIds, trainingGoals } from "@/domain/training/training-goals";

describe("training goals", () => {
  it("defines the five approved production goals", () => {
    expect(trainingGoalIds).toEqual(["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"]);
    expect(trainingGoals.map((goal) => goal.userDisplayName)).toEqual(["Build Muscle", "Get Stronger", "Build Muscle + Strength", "Athletic Performance", "Lose Fat"]);
  });

  it("rejects removed goal ids", () => {
    expect(isTrainingGoalId("general_fitness")).toBe(false);
    expect(isTrainingGoalId("hypertrophy")).toBe(false);
    expect(isTrainingGoalId("get_lean")).toBe(false);
    expect(isTrainingGoalId("get_leaner")).toBe(false);
    expect(isTrainingGoalId("maintenance")).toBe(false);
  });

  it("maps user goals to internal adaptation terminology", () => {
    expect(getTrainingGoal("build_muscle").internalAdaptation).toBe("hypertrophy");
    expect(getTrainingGoal("get_stronger").internalAdaptation).toBe("maximal_strength");
    expect(getTrainingGoal("build_muscle_strength").internalAdaptation).toBe("concurrent_strength_hypertrophy");
    expect(getTrainingGoal("athletic_performance").internalAdaptation).toBe("athletic_performance");
    expect(getTrainingGoal("lose_fat").internalAdaptation).toBe("body_composition_preservation");
  });

  it("keeps compatibility labels for existing saved setup ids", () => {
    expect(displayNameForTrainingSetupGoal("build_strength")).toBe("Get Stronger");
    expect(displayNameForTrainingSetupGoal("build_muscle_and_strength")).toBe("Build Muscle + Strength");
    expect(displayNameForTrainingSetupGoal("get_leaner")).toBe("Lose Fat");
    expect(displayNameForTrainingSetupGoal("build_muscle")).toBe("Build Muscle");
    expect(displayNameForTrainingSetupGoal("athletic_performance")).toBe("Athletic Performance");
  });

  it("is deterministic", () => {
    expect(getTrainingGoal("lose_fat")).toEqual(getTrainingGoal("lose_fat"));
    expect([...trainingGoals]).toEqual([...trainingGoals]);
  });

  it("does not use network or storage", () => {
    const source = readFileSync("src/domain/training/training-goals.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });
});
