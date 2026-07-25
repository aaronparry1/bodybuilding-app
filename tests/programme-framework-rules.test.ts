import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildWeeklySessionSequence,
  customerFrameworkFrequencyPolicy,
  getCustomerFrameworksForFrequency,
  getFrameworkOptionsForGoal,
  getRecommendedCustomerFramework,
  getSelectableFrameworkOptionsForGoal,
  resolveCanonicalFrameworkMorph,
  resolveCanonicalProgrammeFramework,
} from "@/domain/training/programme-framework-rules";

describe("canonical customer programme framework rules", () => {
  it("exposes only the three plain-language framework preferences", () => {
    for (const goal of ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"] as const) {
      expect(getFrameworkOptionsForGoal(goal).map((option) => option.id)).toEqual(["full_body", "upper_lower", "push_pull_legs"]);
      expect(getFrameworkOptionsForGoal(goal).some((option) => ["asc_recommended", "body_part_split", "bench_squat_deadlift"].includes(option.id))).toBe(false);
    }
  });

  it("owns the final frequency truth table", () => {
    expect(customerFrameworkFrequencyPolicy.policyId).toBe("canonical_customer_framework_frequency_policy_v1");
    expect(getCustomerFrameworksForFrequency(2)).toEqual(["full_body", "upper_lower"]);
    expect(getCustomerFrameworksForFrequency(3)).toEqual(["full_body", "push_pull_legs"]);
    expect(getCustomerFrameworksForFrequency(4)).toEqual(["upper_lower", "push_pull_legs"]);
    expect(getCustomerFrameworksForFrequency(5)).toEqual(["push_pull_legs"]);
    expect(getCustomerFrameworksForFrequency(6)).toEqual(["push_pull_legs"]);
    expect(getCustomerFrameworksForFrequency(1)).toEqual([]);
  });

  it("preselects a valid choice instead of adding an ASC option", () => {
    for (const days of [2, 3, 4, 5, 6] as const) {
      const options = getSelectableFrameworkOptionsForGoal("build_muscle", days);
      const recommended = getRecommendedCustomerFramework("build_muscle", days);
      expect(options.length).toBeGreaterThanOrEqual(getCustomerFrameworksForFrequency(days).length);
      expect(options.filter((option) => option.isDefaultRecommendation).map((option) => option.id)).toEqual([recommended]);
    }
  });

  it("rejects incompatible public preferences before construction", () => {
    expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle", sessionsPerWeek: 6, requested: "upper_lower" })).toEqual({ status: "unsupported", reason: "unsupported_framework" });
    expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle", sessionsPerWeek: 2, requested: "push_pull_legs" })).toEqual({ status: "unsupported", reason: "unsupported_framework" });
    expect(resolveCanonicalProgrammeFramework({ goal: "build_strength", sessionsPerWeek: 4, requested: "bench_squat_deadlift" })).toEqual({ status: "unsupported", reason: "unsupported_framework" });
    expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle", sessionsPerWeek: 4, requested: "body_part_split" })).toEqual({ status: "unsupported", reason: "unsupported_framework" });
  });

  it("supports every canonical five-day hypertrophy framework the engine can execute", () => {
    expect(getSelectableFrameworkOptionsForGoal("build_muscle", 5).map((option) => option.id)).toEqual([
      "push_pull_legs",
      "upper_lower",
      "full_body",
      "body_part_split",
    ]);
    for (const requested of ["push_pull_legs", "upper_lower", "full_body", "body_part_split"] as const) {
      expect(resolveCanonicalProgrammeFramework({ goal: "build_muscle", sessionsPerWeek: 5, requested }).status).toBe("resolved");
    }
  });

  it("keeps four- and five-day PPL recognisable and rolling", () => {
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 4, sequenceNumber: 1 })).toEqual(["push", "pull", "legs", "push"]);
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 4, sequenceNumber: 2 })).toEqual(["pull", "legs", "push", "pull"]);
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 5, sequenceNumber: 1 })).toEqual(["push", "pull", "legs", "push", "pull"]);
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 5, sequenceNumber: 2 })).toEqual(["legs", "push", "pull", "legs", "push"]);
  });

  it("uses typed block morphs while retaining the athlete's preference", () => {
    expect(resolveCanonicalFrameworkMorph({ goal: "strength", phase: "strength_specific", publicPreference: "upper_lower", sessionsPerWeek: 4 })).toMatchObject({ publicPreference: "upper_lower", internalFramework: "bench_squat_deadlift", deliveryStrategy: "lift_emphasis_rotation", sessionIdentity: "lift_emphasis_preserving_preference" });
    expect(resolveCanonicalFrameworkMorph({ goal: "athletic_performance", phase: "athletic_power", publicPreference: "push_pull_legs", sessionsPerWeek: 4 })).toMatchObject({ publicPreference: "push_pull_legs", internalFramework: "push_pull_legs", deliveryStrategy: "athletic_asymmetric_rotation" });
    expect(resolveCanonicalFrameworkMorph({ goal: "hypertrophy", phase: "hypertrophy_volume", publicPreference: "push_pull_legs", sessionsPerWeek: 5 })).toMatchObject({ internalFramework: "push_pull_legs", deliveryStrategy: "classic_push_pull_legs_rotation", sessionIdentity: "recognisable_preference" });
  });

  it("keeps onboarding free of internal framework choices", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    const setup = readFileSync("src/application/training/canonical-onboarding-setup.ts", "utf8");
    expect(source).toContain("resolveExecutableOnboardingFrameworks");
    expect(setup).toContain("getSelectableFrameworkOptionsForGoal");
    expect(setup).toContain('label: "ASC Recommended"');
    expect(source).not.toContain("Bench/Squat/Deadlift");
  });

  it("rejects invalid frequencies and remains deterministic", () => {
    expect(() => buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 1 })).toThrow(/2-6/);
    const first = buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 5, sequenceNumber: 2 });
    expect(buildWeeklySessionSequence({ goal: "hypertrophy", framework: "push_pull_legs", sessionsPerWeek: 5, sequenceNumber: 2 })).toEqual(first);
  });
});
