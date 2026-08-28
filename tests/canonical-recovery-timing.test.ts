import { beforeEach, describe, expect, it } from "vitest";
import { canonicalRecoveryTimingRepository } from "@/data/local/canonical-recovery-timing-repository";
import { adjustCanonicalRecoveryTiming, backgroundCanonicalRecoveryTiming, foregroundCanonicalRecoveryTiming, observeCanonicalRecoveryTiming, pauseCanonicalRecoveryTiming, resumeCanonicalRecoveryTiming, startCanonicalRecoveryTiming } from "@/application/training/canonical-recovery-timing";

describe("canonical superset recovery timing", () => {
  beforeEach(() => canonicalRecoveryTimingRepository.clear());

  it("records continuous foreground round recovery without another tap", () => {
    start(0, "between_round_recovery", 60, "slot-a", "row", 2);
    expect(observe(75_000, "slot-a", "row", 2)).toMatchObject({ timingConfidence: "reliable", timingReason: "continuous_foreground_timing", prescribedSeconds: 60, observedUsableSeconds: 75, backgroundSeconds: 0 });
  });

  it("separates background duration and refuses to call it usable rest", () => {
    start(0, "between_round_recovery", 60, "slot-a", "row", 2);
    backgroundCanonicalRecoveryTiming("workout", 20_000);
    foregroundCanonicalRecoveryTiming("workout", 80_000);
    expect(observe(100_000, "slot-a", "row", 2)).toMatchObject({ timingConfidence: "unreliable", timingReason: "app_background_duration_excluded", observedWallClockSeconds: 100, observedUsableSeconds: null, backgroundSeconds: 60 });
  });

  it("separates user-paused time and manual extension", () => {
    start(0, "between_round_recovery", 60, "slot-a", "row", 2);
    pauseCanonicalRecoveryTiming("workout", 20_000);
    adjustCanonicalRecoveryTiming("workout", 30);
    resumeCanonicalRecoveryTiming("workout", 50_000);
    expect(observe(90_000, "slot-a", "row", 2)).toMatchObject({ timingConfidence: "unreliable", timingReason: "user_paused_timer_duration_separated", pausedSeconds: 30, manualAdjustmentSeconds: 30, observedUsableSeconds: null });
  });

  it("detects out-of-order execution deterministically after restart", () => {
    start(1_000, "a_to_b_transition", 0, "slot-b", "press", 1);
    const serialized = JSON.stringify(canonicalRecoveryTimingRepository.get("workout"));
    canonicalRecoveryTimingRepository.clear();
    canonicalRecoveryTimingRepository.save(JSON.parse(serialized));
    expect(observe(8_000, "slot-a", "row", 2)).toMatchObject({ timingConfidence: "unreliable", timingReason: "out_of_order_execution", phase: "a_to_b_transition" });
  });

  it("does not let a substitution delay prove recovery sufficiency", () => {
    start(0, "a_to_b_transition", 0, "slot-b", "press", 1);
    expect(observeCanonicalRecoveryTiming({ workoutId: "workout", slotId: "slot-b", exerciseId: "press", setOrder: 1, occurredAt: new Date(5_000).toISOString(), substitutionId: "sub-1" })).toMatchObject({ timingConfidence: "unreliable", timingReason: "substitution_delay_not_attributable_to_recovery" });
  });
});

function start(startedAt: number, phase: "a_to_b_transition" | "between_round_recovery", prescribedSeconds: number, expectedSlotId: string, expectedExerciseId: string, expectedSetOrder: number) {
  startCanonicalRecoveryTiming({ workoutId: "workout", sourceSetId: "source-set", sourceSlotId: "source-slot", sourceExerciseId: "source-exercise", pairIdentity: "press::row", phase, expectedSlotId, expectedExerciseId, expectedSetOrder, prescribedSeconds, startedAt });
}

function observe(endedAt: number, slotId: string, exerciseId: string, setOrder: number) {
  return observeCanonicalRecoveryTiming({ workoutId: "workout", slotId, exerciseId, setOrder, occurredAt: new Date(endedAt).toISOString() });
}
