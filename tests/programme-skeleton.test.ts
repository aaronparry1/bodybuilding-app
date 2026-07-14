import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createProgrammeSkeleton,
  resolveProgrammeSkeletonFramework,
  type ProgrammeSkeletonInput,
} from "@/domain/training/programme-skeleton";
import type { TrainingGoalId } from "@/domain/training/training-goals";

const baseInput: ProgrammeSkeletonInput = {
  trainingGoal: "build_muscle",
  trainingCommitment: { commitmentType: "continuous_development" },
  trainingDaysPerWeek: 4,
  frameworkPreference: "upper_lower",
  trainingExperience: "intermediate",
  cardioPreference: "recommended",
  unitsPreference: "kg",
  createdAt: "2026-07-03T10:00:00.000Z",
};

describe("programme skeleton", () => {
  it("generates a skeleton for all five production goals", () => {
    const goals: TrainingGoalId[] = ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"];

    for (const goal of goals) {
      const skeleton = createProgrammeSkeleton({ ...baseInput, trainingGoal: goal, frameworkPreference: "asc_recommended" });

      expect(skeleton.goal).toBe(goal);
      expect(skeleton.programmeId).toContain("programme-skeleton");
      expect(skeleton.currentBlock.blockNumber).toBe(1);
      expect(skeleton.currentWeek).toBe(1);
      expect(skeleton.version).toBe(1);
      expect(skeleton.scheduledSessions).toHaveLength(4);
    }
  });

  it("uses a rolling macro for continuous development", () => {
    const skeleton = createProgrammeSkeleton(baseInput);

    expect(skeleton.commitmentMode).toBe("rolling");
    expect(skeleton.macroGoal).toBe("build_muscle");
  });

  it("uses a fixed deadline macro when an event target date exists", () => {
    const skeleton = createProgrammeSkeleton({
      ...baseInput,
      trainingGoal: "get_stronger",
      trainingCommitment: {
        commitmentType: "event_driven",
        eventType: "powerlifting_meet",
        targetDate: "2026-12-01",
        userFacingSummary: "Yes — Powerlifting meet on 2026-12-01.",
        internalPlanningMode: "event_driven",
        macrocycleConstraint: "fixed_deadline",
        requiresTargetDate: true,
        coachingSummary: "Fixed deadline.",
      },
      frameworkPreference: "bench_squat_deadlift",
    });

    expect(skeleton.commitmentMode).toBe("fixed_deadline");
    expect(skeleton.framework).toBe("bench_squat_deadlift");
  });

  it("applies approved first block defaults by goal", () => {
    expect(createProgrammeSkeleton({ ...baseInput, trainingGoal: "build_muscle" }).currentBlock.blockFocus).toBe("hypertrophy_accumulation");
    expect(createProgrammeSkeleton({ ...baseInput, trainingGoal: "get_stronger", frameworkPreference: "bench_squat_deadlift" }).currentBlock.blockFocus).toBe(
      "strength_accumulation",
    );
    expect(createProgrammeSkeleton({ ...baseInput, trainingGoal: "build_muscle_strength" }).currentBlock.blockFocus).toBe(
      "hypertrophy_strength_foundation",
    );
    expect(createProgrammeSkeleton({ ...baseInput, trainingGoal: "athletic_performance" }).currentBlock.blockFocus).toBe("general_preparation");
    expect(createProgrammeSkeleton({ ...baseInput, trainingGoal: "lose_fat" }).currentBlock.blockFocus).toBe("performance_preservation");
  });

  it("resolves ASC Recommended from goal and schedule suitability", () => {
    expect(resolveProgrammeSkeletonFramework({ goal: "build_muscle", sessionsPerWeek: 5, frameworkPreference: "asc_recommended" })).toBe(
      "push_pull_legs",
    );
    expect(resolveProgrammeSkeletonFramework({ goal: "get_stronger", sessionsPerWeek: 3, frameworkPreference: "asc_recommended" })).toBe(
      "bench_squat_deadlift",
    );
    expect(resolveProgrammeSkeletonFramework({ goal: "athletic_performance", sessionsPerWeek: 4, frameworkPreference: "let_app_choose" })).toBe(
      "full_body",
    );
    expect(resolveProgrammeSkeletonFramework({ goal: "lose_fat", sessionsPerWeek: 2, frameworkPreference: "asc_recommended" })).toBe("full_body");
  });

  it("matches scheduled sessions to selected framework and days", () => {
    expect(
      createProgrammeSkeleton({
        ...baseInput,
        trainingDaysPerWeek: 5,
        frameworkPreference: "push_pull_legs",
      }).scheduledSessions.map((session) => session.sessionType),
    ).toEqual(["push", "pull", "legs", "upper", "lower"]);

    expect(
      createProgrammeSkeleton({
        ...baseInput,
        trainingGoal: "get_stronger",
        trainingDaysPerWeek: 4,
        frameworkPreference: "bench_squat_deadlift",
      }).scheduledSessions.map((session) => session.sessionType),
    ).toEqual(["bench", "squat", "deadlift", "full_body_strength"]);
  });

  it("does not generate exercises, reps, load, or sets", () => {
    const skeleton = createProgrammeSkeleton(baseInput);
    const serialized = JSON.stringify(skeleton);

    expect(serialized).not.toMatch(/exerciseId|selectedExercise|target_reps|rep_range|load_strategy|setRange|sets/i);
    expect(skeleton.scheduledSessions.every((session) => !("exerciseId" in session))).toBe(true);
  });

  it("wires onboarding persistence and passive home overview without changing generation", () => {
    const onboardingSource = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    const homeSource = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");

    expect(onboardingSource).toContain('step === "review" ? "Your Programme" : "Welcome"');
    expect(homeSource).toContain("programmeSkeletonRepository.getOptional()");
    expect(homeSource).toContain('SectionList title="Programme Overview"');
    expect(homeSource.indexOf("programmeSkeletonRepository.getOptional()")).toBeGreaterThanOrEqual(0);
  });

  it("does not use network, async, or storage in the domain module", () => {
    const source = readFileSync("src/domain/training/programme-skeleton.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});
