import { describe, expect, it } from "vitest";
import { buildCurrentProgressRecoveryContext, isCurrentRecoveryPriority } from "@/domain/training/current-progress-recovery-context";
import type { CanonicalProgressContext } from "@/domain/training/canonical-progress-context";

const ready = (outcome: "continue" | "deload" = "continue"): CanonicalProgressContext => ({ status: "ready", planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber: 1, snapshotId: "snapshot", decisionId: "decision", decisionOutcome: outcome });
describe("current Progress recovery context", () => {
  it("prioritises only persisted deload or applied deload microcycle", () => {
    expect(buildCurrentProgressRecoveryContext(ready("deload"))).toMatchObject({ status: "recovery_recommended" });
    expect(buildCurrentProgressRecoveryContext(ready("continue"), "deload")).toMatchObject({ status: "recovery_active" });
    expect(isCurrentRecoveryPriority(buildCurrentProgressRecoveryContext(ready("continue")))).toBe(false);
  });
  it("does not turn blocked or unavailable assessment into recovery need", () => {
    expect(buildCurrentProgressRecoveryContext({ status: "blocked", planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber: 1, snapshotId: "snapshot" })).toMatchObject({ status: "assessment_unavailable" });
  });
  it("keeps historical fatigue warning and watch-level evidence non-actionable", () => {
    const warning = buildCurrentProgressRecoveryContext(ready("continue"), undefined, true);
    expect(warning).toMatchObject({ status: "watch", historicalWarning: "fatigue_pattern_observed" });
    expect(isCurrentRecoveryPriority(warning)).toBe(false);
  });
});
