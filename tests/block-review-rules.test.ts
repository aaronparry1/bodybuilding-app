import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEventPlanSkeleton } from "@/domain/training/event-planning";
import { getBlockReviewPlanningRules } from "@/domain/training/block-review-rules";

const continuousContext = {
  commitmentType: "continuous_development" as const,
  blockStrategyId: "hypertrophy_accumulation" as const,
  trainingGoal: "build_muscle" as const,
  currentWeek: 4,
  reviewWeek: 4,
  plannedDurationWeeks: 5,
};

describe("block review planning rules", () => {
  it("keeps continuous development reviews evidence-driven", () => {
    const rules = getBlockReviewPlanningRules(continuousContext);

    expect(rules).toMatchObject({
      reviewMode: "evidence_driven",
      calendarCanForceTransition: false,
      mandatoryPhasesProtected: false,
      highestOrderObjective: "long_term_progress",
      ruleSummary: "Review is evidence-driven; the calendar does not force a block change.",
    });
  });

  it("allows continuous review paths without letting the calendar force them", () => {
    const rules = getBlockReviewPlanningRules(continuousContext);

    expect(rules.allowedReviewOutcomes).toEqual([
      "continue",
      "extend",
      "transition",
      "recovery_block_required",
    ]);
    expect(rules.calendarCanForceTransition).toBe(false);
  });

  it("protects mandatory powerlifting meet phases", () => {
    const eventPlanSkeleton = createEventPlanSkeleton({
      trainingGoal: "get_stronger",
      eventType: "powerlifting_meet",
      targetDate: targetDateForWeeks(16),
      startDate: "2026-01-01T00:00:00.000Z",
      trainingDaysPerWeek: 4,
      trainingExperience: "intermediate",
    });

    const rules = getBlockReviewPlanningRules({
      commitmentType: "event_driven",
      eventType: "powerlifting_meet",
      blockStrategyId: "event_planning_required",
      trainingGoal: "get_stronger",
      currentWeek: 6,
      reviewWeek: 6,
      plannedDurationWeeks: 16,
      eventPlanSkeleton,
    });

    expect(rules).toMatchObject({
      reviewMode: "event_constrained",
      calendarCanForceTransition: true,
      mandatoryPhasesProtected: true,
      highestOrderObjective: "event_readiness",
      ruleSummary: "Event phases are mandatory; execution can adapt but required meet-prep phases cannot be skipped.",
    });
    expect(rules.allowedReviewOutcomes).toEqual([
      "phase_required_by_event",
      "transition",
      "recovery_block_required",
      "manual_planning_required",
    ]);
  });

  it("treats event-driven powerlifting as event-constrained even when inferred from the event plan", () => {
    const eventPlanSkeleton = createEventPlanSkeleton({
      trainingGoal: "build_muscle_strength",
      eventType: "powerlifting_meet",
      targetDate: targetDateForWeeks(10),
      startDate: "2026-01-01T00:00:00.000Z",
      trainingDaysPerWeek: 3,
      trainingExperience: "advanced",
    });

    const rules = getBlockReviewPlanningRules({
      commitmentType: "event_driven",
      trainingGoal: "build_muscle_strength",
      currentWeek: 7,
      reviewWeek: 7,
      plannedDurationWeeks: 10,
      eventPlanSkeleton,
    });

    expect(rules.reviewMode).toBe("event_constrained");
    expect(rules.mandatoryPhasesProtected).toBe(true);
    expect(rules.allowedReviewOutcomes).toContain("phase_required_by_event");
  });

  it("returns manual planning for unsupported event types", () => {
    const rules = getBlockReviewPlanningRules({
      commitmentType: "event_driven",
      eventType: "athletic_event_or_season",
      trainingGoal: "athletic_performance",
      currentWeek: 4,
      reviewWeek: 4,
      plannedDurationWeeks: 12,
    });

    expect(rules).toMatchObject({
      reviewMode: "event_constrained",
      calendarCanForceTransition: true,
      mandatoryPhasesProtected: true,
      highestOrderObjective: "manual_event_planning",
    });
    expect(rules.allowedReviewOutcomes).toEqual(["manual_planning_required"]);
  });

  it("does not implement the actual block review decision yet", () => {
    const source = readFileSync("src/domain/training/block-review-rules.ts", "utf8");

    expect(source).not.toMatch(/decideBlockReview|evaluateBlockReview|performanceSignal|fatigueSignal|continueBlock|extendBlock/i);
  });

  it("is deterministic and does not use network, storage, or async work", () => {
    expect(getBlockReviewPlanningRules(continuousContext)).toEqual(getBlockReviewPlanningRules(continuousContext));

    const source = readFileSync("src/domain/training/block-review-rules.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});

function targetDateForWeeks(weeks: number): string {
  const date = new Date("2026-01-01T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString();
}
