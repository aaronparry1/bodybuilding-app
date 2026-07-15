import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-coverage-batch-4.json";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";

const input = {
  contractVersion: "canonical_current_progress_context_v1" as const, planId: "plan:evidence", planRevision: 1,
  macrocycle: { id: "macro:evidence", route: "build_muscle", strategy: "productive" },
  mesocycle: { id: "meso:evidence", purpose: "hypertrophy", policyId: "canonical_mesocycle_v1" },
  microcycle: { id: "micro:evidence", order: 1, priority: "normal", rotation: "retain", stress: "normal" },
  evaluation: { id: "eval:evidence", version: "canonical_progress_evaluation_v2", outcome: "insufficient_evidence", reasons: ["history_below_minimum"] },
  recordedProgress: { completedSessions: 1, performedSets: 2, evidencePending: false },
};

describe("canonical dashboard coverage batch 4", () => {
  it("selects the existing Progress evidence owner group", () => {
    expect(artifact.selectedOwnerGroup).toBe("progress_evidence_evaluation");
    expect(artifact.selectedCases).toHaveLength(2);
    expect(artifact.selectedCases.every((item) => item.ownerExists && !item.newPolicyRequired && !item.applicationBoundaryRequired)).toBe(true);
  });

  it("fails closed for insufficient evidence without mutation", () => {
    const result = projectCanonicalProgressDashboard({ ...input, evidence: { ids: ["evidence:insufficient"], freshness: "fresh", completeness: "incomplete" } });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.action.allowed).toBe(false);
  });

  it("accounts for all remaining cases and preserves the fixture partition", () => {
    expect(artifact.startingRemainingCases).toBe(11);
    expect(artifact.selectedCases.length + artifact.remainingCases.length).toBe(11);
    expect(artifact.fixturePartition).toEqual({ plan: 13, session: 30, progress: 35 });
  });
});
