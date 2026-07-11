import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  deriveTrainingCommitment,
  getCompatibleTrainingEventTypes,
  isTrainingEventTypeCompatibleWithGoal,
  type TrainingGoalId,
} from "@/domain/training/training-commitment";

describe("training commitment", () => {
  it("supports continuous development without a target date", () => {
    const commitment = deriveTrainingCommitment({
      goalId: "build_muscle",
      commitmentType: "continuous_development",
    });

    expect(commitment).toMatchObject({
      commitmentType: "continuous_development",
      internalPlanningMode: "continuous_development",
      macrocycleConstraint: "rolling",
      requiresTargetDate: false,
    });
    expect(commitment.targetDate).toBeUndefined();
  });

  it("rejects event-driven training without a date", () => {
    expect(() =>
      deriveTrainingCommitment({
        goalId: "get_stronger",
        commitmentType: "event_driven",
        eventType: "powerlifting_meet",
      }),
    ).toThrow(/target date/i);
  });

  it("validates event type compatibility by goal", () => {
    expect(isTrainingEventTypeCompatibleWithGoal("get_stronger", "powerlifting_meet")).toBe(true);
    expect(isTrainingEventTypeCompatibleWithGoal("build_muscle_strength", "powerlifting_meet")).toBe(true);
    expect(isTrainingEventTypeCompatibleWithGoal("build_muscle", "powerlifting_meet")).toBe(false);

    expect(isTrainingEventTypeCompatibleWithGoal("athletic_performance", "athletic_event_or_season")).toBe(true);
    expect(isTrainingEventTypeCompatibleWithGoal("get_stronger", "athletic_event_or_season")).toBe(false);

    expect(isTrainingEventTypeCompatibleWithGoal("build_muscle", "physique_event")).toBe(true);
    expect(isTrainingEventTypeCompatibleWithGoal("lose_fat", "holiday_or_photoshoot")).toBe(true);
    expect(isTrainingEventTypeCompatibleWithGoal("athletic_performance", "physique_event")).toBe(false);
  });

  it("allows custom targets for every approved goal", () => {
    const goals: TrainingGoalId[] = ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"];

    for (const goalId of goals) {
      expect(isTrainingEventTypeCompatibleWithGoal(goalId, "custom")).toBe(true);
      expect(getCompatibleTrainingEventTypes(goalId)).toContain("custom");
      expect(
        deriveTrainingCommitment({
          goalId,
          commitmentType: "event_driven",
          eventType: "custom",
          targetDate: "2026-12-01",
        }).macrocycleConstraint,
      ).toBe("fixed_deadline");
    }
  });

  it("does not expose old plan style options in onboarding", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");

    expect(source).toContain("Are you training for something specific?");
    expect(source).toContain("No — I just want to keep improving.");
    expect(source).toContain("Yes — I have a target date.");
    expect(source).not.toContain("Recommended 12-month plan");
    expect(source).not.toContain("Single block only");
    expect(source).not.toContain("Choose your plan style");
    expect(source).not.toContain("Choose your block");
  });

  it("is deterministic", () => {
    const input = {
      goalId: "athletic_performance" as const,
      commitmentType: "event_driven" as const,
      eventType: "athletic_event_or_season" as const,
      targetDate: "2026-09-01",
    };

    expect(deriveTrainingCommitment(input)).toEqual(deriveTrainingCommitment(input));
    expect(getCompatibleTrainingEventTypes("lose_fat")).toEqual(getCompatibleTrainingEventTypes("lose_fat"));
  });

  it("does not use network or storage", () => {
    const source = readFileSync("src/domain/training/training-commitment.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });
});
