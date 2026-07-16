import { describe, expect, it } from "vitest";
import { buildCurrentProgressStrategicSummary } from "@/domain/training/current-progress-strategic-summary";
import type { CanonicalProgressContext } from "@/domain/training/canonical-progress-context";

const ready = (outcome: "delay" | "continue" | "deload" | "advance" = "continue"): CanonicalProgressContext => ({ status: "ready", planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber: 2, snapshotId: "snapshot", decisionId: "decision", decisionOutcome: outcome, decisionLifecycle: "ready", ...(outcome === "advance" ? { advanceTargetMesocycleId: "hypertrophy_consolidation" } : {}) });

describe("current Progress strategic summary", () => {
  it("projects persisted current decisions without ranking successors", () => {
    const summary = buildCurrentProgressStrategicSummary(ready("advance"), [{ id: "history", kind: "stored_target_attainment", value: "maintained" }]);
    expect(summary).toMatchObject({ status: "available", decisionOutcome: "advance", advanceTargetMesocycleId: "hypertrophy_consolidation" });
    expect(summary).not.toHaveProperty("nextBlock");
    expect(summary).not.toHaveProperty("successorCandidates");
  });
  it("keeps blocked and compatibility states explicit", () => {
    expect(buildCurrentProgressStrategicSummary({ status: "blocked", planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber: 2, snapshotId: "snapshot" })).toMatchObject({ status: "blocked" });
    expect(buildCurrentProgressStrategicSummary({ status: "compatibility", reason: "legacy_plan" })).toEqual({ status: "compatibility", reason: "legacy_plan", historicalObservations: [] });
  });
  it("does not let historical observations change an authoritative decision", () => {
    expect(buildCurrentProgressStrategicSummary(ready("deload"), [{ id: "observation", kind: "exercise_progression", value: "strong" }])).toMatchObject({ decisionOutcome: "deload" });
  });
});
