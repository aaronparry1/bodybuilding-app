import { describe, expect, it } from "vitest";
import { deriveCurrentMesocycleReadinessContext, deriveMesocycleExposure, evaluateMesocycleObjective, exposurePolicyFromMesocycle, resolveApprovedSuccessorContext } from "@/domain/training/current-mesocycle-readiness-context";
import { mesocycleById } from "@/domain/training/mesocycle-library";
import type { CurrentReadinessSnapshot } from "@/domain/training/current-readiness-snapshot";

const snapshot = (id: string, microcycleNumber: number, state: CurrentReadinessSnapshot["state"] = "ready", supersededSnapshotId?: string): CurrentReadinessSnapshot => ({
  schemaVersion: 1, id, planId: "plan", mesocycleId: "hypertrophy_base", microcycleNumber, createdAt: `2026-01-0${microcycleNumber}T00:00:00.000Z`, state, sourceFingerprint: `fp-${id}`,
  sourceWorkoutIds: [], sourceSessionIds: [], requiredRoles: [], completedRoles: [], unresolvedRoles: [], blockedRoles: [], approvedSuccessors: [], ...(supersededSnapshotId ? { supersededSnapshotId } : {}),
});
const policy = exposurePolicyFromMesocycle(mesocycleById("hypertrophy_base")!);

describe("current mesocycle readiness context", () => {
  it("counts only active ready snapshot attempts, not blocked or superseded history", () => {
    const result = deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 3, policy, snapshots: [snapshot("old", 1), snapshot("replacement", 1, "ready", "old"), snapshot("blocked", 2, "blocked")] });
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.evaluableMicrocyclesCompleted).toBe(1);
      expect(result.countedSnapshotIds).toEqual(["replacement"]);
      expect(result.excludedSnapshotIds).toEqual([{ id: "blocked", reason: "snapshot_blocked" }]);
      expect(result.minimumExposureReached).toBe(false);
    }
  });

  it("uses explicit policy only and rejects incoherent bounds", () => {
    expect(deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 1, snapshots: [] }).status).toBe("insufficient_policy");
    expect(deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 1, snapshots: [snapshot("one", 1)], policy: { ...policy, minimumEvaluableAttempts: 8, expectedAttempts: 2 } }).status).toBe("invalid_policy");
  });

  it("does not use block time and exposes expected/maximum context without deciding", () => {
    const result = deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 7, policy: { ...policy, minimumEvaluableAttempts: 1, expectedAttempts: 2, maximumEvaluableAttempts: 2 }, snapshots: [snapshot("one", 1), snapshot("two", 2)] });
    expect(result).toMatchObject({ status: "ready", expectedWindow: "within_expected", maximumExposureReached: true });
  });

  it("keeps competing active attempts explicit", () => {
    expect(deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 1, policy, snapshots: [snapshot("a", 1), snapshot("b", 1)] })).toMatchObject({ status: "invalid_history", reason: "competing_current_attempt" });
  });

  it("retains every approved successor without selecting by list order", () => {
    const result = resolveApprovedSuccessorContext({ currentMesocycleId: "hypertrophy_base", experienceLevel: "advanced" });
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.approvedCandidateIds).toEqual(["hypertrophy_volume", "hypertrophy_specialisation", "hypertrophy_consolidation"]);
      expect(result.eligibleCandidateIds).toEqual(result.approvedCandidateIds);
      expect("selectedCandidateId" in result).toBe(false);
      expect(result.lowStressMetadata).toBe("unavailable");
    }
  });

  it("distinguishes no eligible candidate and never infers a predecessor", () => {
    expect(resolveApprovedSuccessorContext({ currentMesocycleId: "hypertrophy_base", experienceLevel: "beginner" })).toMatchObject({ status: "ready", eligibleCandidateIds: ["hypertrophy_consolidation"] });
  });

  it("does not conclude an objective from exposure or improvement absent machine-evaluable policy", () => {
    const exposure = deriveMesocycleExposure({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 3, policy: { ...policy, minimumEvaluableAttempts: 1 }, snapshots: [snapshot("one", 1)] });
    expect(evaluateMesocycleObjective(undefined, exposure)).toMatchObject({ status: "insufficient_policy" });
  });

  it("composes pure exposure, successors, and objective boundary without a decision", () => {
    const result = deriveCurrentMesocycleReadinessContext({ planId: "plan", mesocycleId: "hypertrophy_base", currentAttempt: 1, snapshots: [snapshot("one", 1)], exposurePolicy: policy, experienceLevel: "advanced" });
    expect(result.exposure.status).toBe("ready");
    expect(result.successors.status).toBe("ready");
    expect(result.objective.status).toBe("insufficient_policy");
  });
});
