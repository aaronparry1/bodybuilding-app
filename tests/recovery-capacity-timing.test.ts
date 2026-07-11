import { describe, expect, it } from "vitest";
import { resolveRecoveryCapacityTiming } from "@/domain/training/recovery-capacity-timing";

describe("recovery capacity timing guidance", () => {
  it("warns against hard conditioning before heavy lower context", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "capacity_cardio",
      nextWorkoutContext: "heavy_lower",
      goal: "build_strength",
    });

    expect(guidance.bestTimingGuidance).toContain("Rest days");
    expect(guidance.avoidGuidance.join(" ")).toContain("heavy lower");
    expect(guidance.startMessage).toContain("Heavy lower");
    expect(guidance.confidence).toBe("high");
  });

  it("warns before deadlift-focused work and favours easy recovery", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "recovery_cardio",
      nextWorkoutContext: "deadlift_focused",
      goal: "build_strength",
    });

    expect(guidance.bestTimingGuidance.join(" ")).toContain("Easy Recovery Cardio");
    expect(guidance.avoidGuidance.join(" ")).toContain("deadlift");
    expect(guidance.startMessage).toContain("Deadlift work is next");
  });

  it("treats upper-body context as a good recovery opportunity", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "recovery_cardio",
      nextWorkoutContext: "heavy_upper",
      goal: "build_muscle",
    });

    expect(guidance.bestTimingGuidance).toContain("Good opportunity today.");
    expect(guidance.startMessage).toContain("Good day");
  });

  it("uses recovery-only guidance during taper and event week", () => {
    const taper = resolveRecoveryCapacityTiming({
      recommendation: "performance_conditioning",
      nextWorkoutContext: "peak_or_taper",
      goal: "powerlifting_meet",
      eventTaperPhase: "taper",
    });
    const eventWeek = resolveRecoveryCapacityTiming({
      recommendation: "capacity_cardio",
      nextWorkoutContext: "event_week",
      goal: "powerlifting_meet",
      eventTaperPhase: "event_week",
    });

    expect(taper.bestTimingGuidance.join(" ")).toContain("Recovery first");
    expect(taper.avoidGuidance).toContain("Hard conditioning");
    expect(eventWeek.bestTimingGuidance.join(" ")).toContain("Recovery only");
    expect(eventWeek.startMessage).toContain("Meet week");
  });

  it("uses generic timing when context is unknown", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "recovery_cardio",
      nextWorkoutContext: "unknown",
      goal: "build_muscle_and_strength",
    });

    expect(guidance.bestTimingGuidance).toEqual(["Rest days", "After upper-body sessions"]);
    expect(guidance.confidence).toBe("low");
  });

  it("is less restrictive for athletic performance conditioning", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "performance_conditioning",
      nextWorkoutContext: "power_focused",
      goal: "athletic_performance",
    });

    expect(guidance.bestTimingGuidance.join(" ")).toContain("Conditioning is acceptable");
    expect(guidance.confidence).toBe("medium");
  });

  it("is conservative for powerlifting meet prep", () => {
    const guidance = resolveRecoveryCapacityTiming({
      recommendation: "capacity_cardio",
      nextWorkoutContext: "heavy_upper",
      goal: "powerlifting_meet",
    });

    expect(guidance.bestTimingGuidance.join(" ")).toContain("Recovery first");
    expect(guidance.avoidGuidance).toContain("Hard conditioning");
  });
});
