import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deriveSessionResponsibility } from "@/domain/training/session-responsibility";
import type { ProgrammeFrameworkId, ProgrammeFrameworkSessionType } from "@/domain/training/programme-framework-rules";

describe("session responsibility", () => {
  it("defines Push as pressing/chest/triceps and excludes primary legs/back", () => {
    const plan = responsibility("push");
    const required = ids(plan.requiredResponsibilities);
    const excluded = ids(plan.excludedResponsibilities);

    expect(required).toEqual(["primary_press", "chest_pressing_stimulus", "triceps_pressing_support"]);
    expect(excluded).toContain("primary_leg_stimulus");
    expect(excluded).toContain("primary_back_stimulus");
  });

  it("defines Pull as pull/back/biceps and excludes pressing/legs", () => {
    const plan = responsibility("pull");
    const required = ids(plan.requiredResponsibilities);
    const excluded = ids(plan.excludedResponsibilities);

    expect(required).toEqual(["primary_pull_or_row", "back_stimulus", "biceps_support"]);
    expect(excluded).toContain("primary_pressing_stimulus");
    expect(excluded).toContain("primary_leg_stimulus");
  });

  it("defines Legs with knee-dominant and hinge/posterior-chain responsibilities", () => {
    const plan = responsibility("legs");

    expect(ids(plan.requiredResponsibilities)).toEqual(["knee_dominant_stimulus", "hip_hinge_or_posterior_chain_stimulus"]);
    expect(plan.requiredResponsibilities.map((item) => item.movementPattern)).toContain("knee_dominant");
    expect(plan.requiredResponsibilities.map((item) => item.targetRegion)).toContain("posterior_chain");
  });

  it("defines Full Body as lower plus upper push plus upper pull", () => {
    const plan = responsibility("full_body");

    expect(ids(plan.requiredResponsibilities)).toEqual(["lower_body_stimulus", "upper_push_stimulus", "upper_pull_stimulus"]);
    expect(plan.excludedResponsibilities).toEqual([]);
  });

  it("preserves Bench, Squat, and Deadlift specificity", () => {
    const bench = responsibility("bench", { goal: "strength", framework: "bench_squat_deadlift" });
    const squat = responsibility("squat", { goal: "strength", framework: "bench_squat_deadlift" });
    const deadlift = responsibility("deadlift", { goal: "strength", framework: "bench_squat_deadlift" });

    expect(bench.requiredResponsibilities[0]).toMatchObject({ id: "bench_specific_strength", specificityRequirement: "competition_specific" });
    expect(squat.requiredResponsibilities[0]).toMatchObject({ id: "squat_specific_strength", specificityRequirement: "competition_specific" });
    expect(deadlift.requiredResponsibilities[0]).toMatchObject({ id: "deadlift_specific_strength", specificityRequirement: "competition_specific" });
  });

  it("does not output exercise count, stress, dropped-slot, recovery, time, selection, rep, load, or set fields", () => {
    const plan = responsibility("upper") as unknown as Record<string, unknown>;

    expect(plan).not.toHaveProperty("targetExerciseCount");
    expect(plan).not.toHaveProperty("minimumExerciseCount");
    expect(plan).not.toHaveProperty("maximumExerciseCount");
    expect(plan).not.toHaveProperty("stressBias");
    expect(plan).not.toHaveProperty("droppedSlots");
    expect(plan).not.toHaveProperty("requiredSlots");
    expect(plan).not.toHaveProperty("importantSlots");
    expect(plan).not.toHaveProperty("optionalSlots");
  });

  it("keeps source free of later-decision logic", () => {
    const source = readFileSync("src/domain/training/session-responsibility.ts", "utf8");

    expect(source).not.toMatch(/targetExerciseCount|minimumExerciseCount|maximumExerciseCount|droppedSlots|stressBias/);
    expect(source).not.toMatch(/recoveryFlag|timeAvailable|knownLimitations|recentPerformanceSignal/);
    expect(source).not.toMatch(/selected_exercise|exercise_id|target_reps|suggested_load|recommendedMaxSets|set_allocation/i);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });

  it("is deterministic", () => {
    const first = responsibility("deadlift", { goal: "strength", framework: "bench_squat_deadlift" });
    const second = responsibility("deadlift", { goal: "strength", framework: "bench_squat_deadlift" });

    expect(first).toEqual(second);
  });
});

function responsibility(
  sessionType: ProgrammeFrameworkSessionType,
  overrides: Partial<Parameters<typeof deriveSessionResponsibility>[0]> = {},
) {
  return deriveSessionResponsibility({
    goal: "hypertrophy",
    framework: "push_pull_legs" as ProgrammeFrameworkId,
    sessionType,
    trainingPhase: "accumulation",
    ...overrides,
  });
}

function ids(items: { id: string }[]) {
  return items.map((item) => item.id);
}
