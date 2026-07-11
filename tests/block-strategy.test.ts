import { describe, expect, it } from "vitest";
import { decideInitialBlockStrategy } from "@/domain/training/block-strategy";

describe("initial block strategy", () => {
  it("maps Build Muscle to Hypertrophy Accumulation", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "build_muscle",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "hypertrophy_accumulation",
      displayName: "Hypertrophy Accumulation",
      expectedPrimaryAdaptation: "hypertrophy",
      plannedDurationWeeks: 5,
      defaultDurationWeeks: 5,
      reviewWeek: 4,
      minimumReviewWeek: 4,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.coachingObjective).toContain("Maximise muscle growth");
  });

  it("maps Get Stronger to Strength Accumulation", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "get_stronger",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "strength_accumulation",
      displayName: "Strength Accumulation",
      expectedPrimaryAdaptation: "maximal_strength",
      plannedDurationWeeks: 6,
      defaultDurationWeeks: 6,
      reviewWeek: 5,
      minimumReviewWeek: 5,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.coachingObjective).toContain("technical consistency");
  });

  it("maps Build Muscle + Strength to Concurrent Development", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "build_muscle_strength",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "concurrent_development",
      displayName: "Concurrent Development",
      expectedPrimaryAdaptation: "hypertrophy_strength",
      plannedDurationWeeks: 5,
      defaultDurationWeeks: 5,
      reviewWeek: 4,
      minimumReviewWeek: 4,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.coachingObjective).toContain("hypertrophy-biased strength development");
  });

  it("maps Athletic Performance to General Physical Preparation", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "athletic_performance",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "general_physical_preparation",
      displayName: "General Physical Preparation",
      expectedPrimaryAdaptation: "general_preparation",
      plannedDurationWeeks: 4,
      defaultDurationWeeks: 4,
      reviewWeek: 3,
      minimumReviewWeek: 3,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.coachingObjective).toContain("movement quality");
  });

  it("maps Lose Fat to Muscle & Strength Preservation", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "lose_fat",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "muscle_strength_preservation",
      displayName: "Muscle & Strength Preservation",
      expectedPrimaryAdaptation: "muscle_retention",
      plannedDurationWeeks: 4,
      defaultDurationWeeks: 4,
      reviewWeek: 3,
      minimumReviewWeek: 3,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.coachingObjective).toContain("Preserve lean mass");
  });

  it("returns planning required for event-driven commitments", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "get_stronger",
      trainingCommitment: { commitmentType: "event_driven" },
      eventType: "powerlifting_meet",
      targetDate: "2026-12-01",
      trainingExperience: "advanced",
    });

    expect(strategy).toMatchObject({
      blockStrategyId: "event_planning_required",
      displayName: "Event Planning Required",
      requiresFurtherPlanning: true,
      plannedDurationWeeks: 0,
      defaultDurationWeeks: 0,
      reviewWeek: 0,
      minimumReviewWeek: 0,
      blockStatus: "active",
      reviewOutcome: null,
    });
    expect(strategy.scientificRationale).toContain("should not guess");
  });

  it("accepts current onboarding goal ids as compatibility aliases", () => {
    expect(
      decideInitialBlockStrategy({
        trainingGoal: "build_strength",
        trainingCommitment: "continuous_development",
        trainingExperience: "intermediate",
      }).blockStrategyId,
    ).toBe("strength_accumulation");
    expect(
      decideInitialBlockStrategy({
        trainingGoal: "build_muscle_and_strength",
        trainingCommitment: "continuous_development",
        trainingExperience: "intermediate",
      }).blockStrategyId,
    ).toBe("concurrent_development");
    expect(
      decideInitialBlockStrategy({
        trainingGoal: "get_leaner",
        trainingCommitment: "continuous_development",
        trainingExperience: "intermediate",
      }).blockStrategyId,
    ).toBe("muscle_strength_preservation");
  });

  it("is deterministic", () => {
    const input = {
      trainingGoal: "build_muscle" as const,
      trainingCommitment: "continuous_development" as const,
      trainingExperience: "beginner" as const,
    };

    expect(decideInitialBlockStrategy(input)).toEqual(decideInitialBlockStrategy(input));
  });

  it("keeps review week reachable before the planned endpoint where possible", () => {
    for (const trainingGoal of ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"] as const) {
      const strategy = decideInitialBlockStrategy({
        trainingGoal,
        trainingCommitment: "continuous_development",
        trainingExperience: "intermediate",
      });

      expect(strategy.minimumReviewWeek).toBeGreaterThanOrEqual(1);
      expect(strategy.reviewWeek).toBeGreaterThanOrEqual(strategy.minimumReviewWeek);
      expect(strategy.plannedDurationWeeks).toBeGreaterThan(strategy.reviewWeek);
      expect(strategy.reviewWeek).toBeLessThanOrEqual(strategy.plannedDurationWeeks - 1);
    }
  });

  it("returns only block-strategy fields, not workout prescriptions", () => {
    const strategy = decideInitialBlockStrategy({
      trainingGoal: "build_muscle",
      trainingCommitment: "continuous_development",
      trainingExperience: "intermediate",
    });

    expect("exercise" in strategy).toBe(false);
    expect("reps" in strategy).toBe(false);
    expect("load" in strategy).toBe(false);
    expect("sets" in strategy).toBe(false);
    expect(strategy.reviewOutcome).toBeNull();
    expect("continueBlock" in strategy).toBe(false);
    expect("extendBlock" in strategy).toBe(false);
    expect("deload" in strategy).toBe(false);
  });
});
