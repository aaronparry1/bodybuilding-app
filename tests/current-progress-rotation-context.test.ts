import { describe, expect, it } from "vitest";
import { buildCurrentProgressRotationContext } from "@/domain/training/current-progress-rotation-context";
import type { CanonicalProgressContext } from "@/domain/training/canonical-progress-context";

const ready: CanonicalProgressContext = { status: "ready", planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber: 1, snapshotId: "snapshot", decisionId: "decision", decisionOutcome: "continue" };

describe("current Progress rotation context", () => {
  it("treats immutable observation as supporting only", () => {
    expect(buildCurrentProgressRotationContext(ready, [], {}, true)).toEqual({ status: "rotation_observed", reason: "historical_exercise_observation" });
  });
  it("projects explicit intervention without selecting a replacement", () => {
    expect(buildCurrentProgressRotationContext(ready, [{ exerciseId: "bench", decision: "substitute", reason: "persistent_stall", evidence: [], decidedAt: "now", reviewAfterExposures: 3, replacementExerciseId: "press" }])).toMatchObject({ status: "rotation_authorised", exerciseId: "bench", replacementExerciseId: "press" });
  });
  it("gives an applied replacement precedence", () => {
    expect(buildCurrentProgressRotationContext(ready, [], { bench: { replacementExerciseId: "press" } }, true)).toMatchObject({ status: "rotation_applied", replacementExerciseId: "press" });
  });
});
