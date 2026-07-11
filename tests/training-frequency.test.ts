import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deriveTrainingFrequency, isTrainingDaysPerWeek, trainingFrequencyOptions } from "@/domain/training/training-frequency";

describe("training frequency", () => {
  it("accepts 3 to 6 training days", () => {
    expect(trainingFrequencyOptions).toEqual([3, 4, 5, 6]);

    for (const days of trainingFrequencyOptions) {
      expect(isTrainingDaysPerWeek(days)).toBe(true);
      expect(deriveTrainingFrequency(days).daysPerWeek).toBe(days);
    }
  });

  it("rejects one-day and seven-day training weeks", () => {
    expect(isTrainingDaysPerWeek(1)).toBe(false);
    expect(isTrainingDaysPerWeek(7)).toBe(false);
    expect(() => deriveTrainingFrequency(1)).toThrow(/between 2 and 6/i);
    expect(() => deriveTrainingFrequency(7)).toThrow(/between 2 and 6/i);
  });

  it("uses weekly session budget wording", () => {
    const frequency = deriveTrainingFrequency(4);

    expect(frequency.userFacingSummary).toBe("4 days per week");
    expect(frequency.internalMeaning).toBe("Weekly session budget for programme distribution and structure.");
    expect(frequency.coachingSummary).toContain("not a measure of ambition");
  });

  it("is marked changeable during a cycle", () => {
    expect(deriveTrainingFrequency(3).canChangeDuringCycle).toBe(true);
  });

  it("updates onboarding wording without exposing one or seven day choices", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");

    expect(source).toContain("How many days can you realistically commit to training every week?");
    expect(source).toContain("Choose the number you can consistently achieve. You can change this later and ASC will adjust your programme.");
    expect(source).toContain("trainingFrequencyOptions.map");
    expect(source).not.toContain("[1, 2, 3, 4, 5, 6, 7]");
  });

  it("lets Settings update the stored weekly session budget only", () => {
    const source = readFileSync("app/(protected)/settings.tsx", "utf8");

    expect(source).toContain("Weekly training days");
    expect(source).toContain("updateTrainingDays");
    expect(source).toContain("activeTrainingPlanRepository.save(nextPlan)");
    expect(source).toContain("const nextPlan = { ...activePlan, daysPerWeek };");
    expect(source).not.toContain("createActiveTrainingPlan({");
  });

  it("does not use network or storage in the domain module", () => {
    const source = readFileSync("src/domain/training/training-frequency.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });
});
