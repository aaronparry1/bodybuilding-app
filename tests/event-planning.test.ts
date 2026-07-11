import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEventPlanSkeleton, type EventPlanPhase } from "@/domain/training/event-planning";
import { createProgrammeSkeleton } from "@/domain/training/programme-skeleton";

const startDate = "2026-01-01T00:00:00.000Z";

describe("adaptive event planning", () => {
  it("creates a 24-week powerlifting meet skeleton with accumulation, strength, specificity, and peak/taper", () => {
    const plan = meetPlan(24);

    expect(plan.status).toBe("ready");
    expect(plan.totalWeeks).toBe(24);
    expect(plan.phases.map((phase) => phase.trainingPhase)).toEqual([
      "accumulation",
      "strength_development",
      "intensification_specificity",
      "peak_taper",
    ]);
    expect(plan.phases.map((phase) => phase.durationWeeks)).toEqual([9, 8, 4, 3]);
    expect(plan.currentPhase?.trainingPhase).toBe("accumulation");
  });

  it("creates a 16-week powerlifting meet skeleton with strength accumulation, specificity, and peak/taper", () => {
    const plan = meetPlan(16);

    expect(plan.phases.map((phase) => phase.trainingPhase)).toEqual(["strength_accumulation", "intensification_specificity", "peak_taper"]);
    expect(plan.phases.map((phase) => phase.durationWeeks)).toEqual([6, 7, 3]);
  });

  it("creates a 10-week powerlifting meet skeleton with specificity and peak/taper", () => {
    const plan = meetPlan(10);

    expect(plan.phases.map((phase) => phase.trainingPhase)).toEqual(["intensification_specificity", "peak_taper"]);
    expect(plan.phases.map((phase) => phase.durationWeeks)).toEqual([7, 3]);
  });

  it("creates a short peak/taper warning for a 6-week meet prep", () => {
    const plan = meetPlan(6);

    expect(plan.status).toBe("ready");
    expect(plan.warnings).toContain("short_meet_prep_window");
    expect(plan.phases.map((phase) => phase.trainingPhase)).toEqual(["short_peak_taper"]);
    expect(plan.phases[0]).toMatchObject({ startWeek: 1, endWeek: 6, durationWeeks: 6 });
  });

  it("returns insufficient time and manual planning below four weeks", () => {
    const plan = meetPlan(3);

    expect(plan.status).toBe("not_enough_time");
    expect(plan.requiresManualPlanning).toBe(true);
    expect(plan.warnings).toContain("insufficient_meet_prep_time");
    expect(plan.phases).toEqual([]);
  });

  it("keeps peak/taper final for every valid multi-phase meet plan", () => {
    for (const weeks of [8, 10, 12, 16, 20, 24]) {
      const phases = meetPlan(weeks).phases;
      expect(phases.at(-1)?.trainingPhase).toBe("peak_taper");
      expect(phases.at(-1)?.mandatory).toBe(true);
      expect(phases.at(-1)?.adaptiveExecutionAllowed).toBe(true);
    }
  });

  it("covers total weeks without gaps", () => {
    for (const weeks of [6, 8, 10, 12, 16, 20, 24]) {
      assertGapless(meetPlan(weeks).phases, weeks);
    }
  });

  it("only treats powerlifting meet as compatible with Get Stronger and Build Muscle + Strength", () => {
    expect(meetPlan(16, "get_stronger").status).toBe("ready");
    expect(meetPlan(16, "build_muscle_strength").status).toBe("ready");

    for (const goal of ["build_muscle", "athletic_performance", "lose_fat"] as const) {
      const plan = meetPlan(16, goal);
      expect(plan.status).toBe("incompatible_goal_for_powerlifting_meet");
      expect(plan.requiresManualPlanning).toBe(true);
      expect(plan.warnings).toContain("incompatible_goal_for_powerlifting_meet");
    }
  });

  it("returns manual planning for unsupported event types", () => {
    const plan = createEventPlanSkeleton({
      trainingGoal: "athletic_performance",
      eventType: "athletic_event_or_season",
      targetDate: targetDateForWeeks(16),
      startDate,
      trainingDaysPerWeek: 4,
      trainingExperience: "intermediate",
    });

    expect(plan.status).toBe("unsupported_event_type");
    expect(plan.requiresManualPlanning).toBe(true);
    expect(plan.warnings).toContain("unsupported_event_type");
    expect(plan.phases).toEqual([]);
  });

  it("attaches a valid powerlifting event plan to programme skeleton", () => {
    const skeleton = createProgrammeSkeleton({
      trainingGoal: "get_stronger",
      trainingCommitment: {
        commitmentType: "event_driven",
        eventType: "powerlifting_meet",
        targetDate: targetDateForWeeks(16),
      },
      trainingDaysPerWeek: 4,
      frameworkPreference: "bench_squat_deadlift",
      trainingExperience: "intermediate",
      cardioPreference: "recommended",
      unitsPreference: "kg",
      createdAt: startDate,
    });

    expect(skeleton.eventPlan?.status).toBe("ready");
    expect(skeleton.eventPlan?.phases.map((phase) => phase.trainingPhase)).toEqual(["strength_accumulation", "intensification_specificity", "peak_taper"]);
    expect(skeleton.currentBlock.blockFocus).toBe("strength_accumulation");
    expect(skeleton.currentBlock.plannedWeeks).toBe(6);
    expect(skeleton.planningRequired).toBe(false);
  });

  it("marks programme skeleton as planning required for unsupported or invalid events", () => {
    const skeleton = createProgrammeSkeleton({
      trainingGoal: "athletic_performance",
      trainingCommitment: {
        commitmentType: "event_driven",
        eventType: "athletic_event_or_season",
        targetDate: targetDateForWeeks(16),
      },
      trainingDaysPerWeek: 4,
      frameworkPreference: "full_body",
      trainingExperience: "intermediate",
      cardioPreference: "recommended",
      unitsPreference: "kg",
      createdAt: startDate,
    });

    expect(skeleton.eventPlan?.status).toBe("unsupported_event_type");
    expect(skeleton.planningRequired).toBe(true);
    expect(skeleton.currentBlock.blockFocus).toBe("planning_required");
    expect(skeleton.warnings).toContain("unsupported_event_type");
  });

  it("leaves continuous development skeletons unchanged", () => {
    const skeleton = createProgrammeSkeleton({
      trainingGoal: "build_muscle",
      trainingCommitment: { commitmentType: "continuous_development" },
      trainingDaysPerWeek: 4,
      frameworkPreference: "upper_lower",
      trainingExperience: "intermediate",
      cardioPreference: "recommended",
      unitsPreference: "kg",
      createdAt: startDate,
    });

    expect(skeleton.commitmentMode).toBe("rolling");
    expect(skeleton.eventPlan).toBeUndefined();
    expect(skeleton.currentBlock.blockFocus).toBe("hypertrophy_accumulation");
  });

  it("is deterministic and does not use network, async, or storage", () => {
    expect(meetPlan(16)).toEqual(meetPlan(16));

    const source = readFileSync("src/domain/training/event-planning.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});

function meetPlan(weeks: number, trainingGoal: Parameters<typeof createEventPlanSkeleton>[0]["trainingGoal"] = "get_stronger") {
  return createEventPlanSkeleton({
    trainingGoal,
    eventType: "powerlifting_meet",
    targetDate: targetDateForWeeks(weeks),
    startDate,
    trainingDaysPerWeek: 4,
    trainingExperience: "intermediate",
  });
}

function targetDateForWeeks(weeks: number): string {
  const date = new Date(startDate);
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString();
}

function assertGapless(phases: EventPlanPhase[], totalWeeks: number) {
  expect(phases[0]?.startWeek).toBe(1);
  expect(phases.at(-1)?.endWeek).toBe(totalWeeks);
  phases.forEach((phase, index) => {
    expect(phase.durationWeeks).toBe(phase.endWeek - phase.startWeek + 1);
    if (index > 0) expect(phase.startWeek).toBe(phases[index - 1]!.endWeek + 1);
  });
}
