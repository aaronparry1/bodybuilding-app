import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-coverage-batch-3.json";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";

const canonicalHistoryInput = {
  contractVersion: "canonical_current_progress_context_v1" as const,
  planId: "plan:ledger", planRevision: 1,
  macrocycle: { id: "macro:ledger", route: "build_muscle", strategy: "productive" },
  mesocycle: { id: "meso:ledger", purpose: "hypertrophy", policyId: "canonical_mesocycle_v1" },
  microcycle: { id: "micro:ledger", order: 1, priority: "normal", rotation: "retain", stress: "normal" },
  evidence: { ids: ["evidence:ledger"], freshness: "fresh" as const, completeness: "complete" as const },
  evaluation: { id: "evaluation:ledger", version: "canonical_progress_evaluation_v2", outcome: "continue", reasons: ["ledger_current"] },
  recordedProgress: { completedSessions: 1, performedSets: 2, evidencePending: false },
};

describe("canonical dashboard coverage batch 3", () => {
  it("selects only the existing recorded-session owner group", () => {
    expect(artifact.selectedOwnerGroup).toBe("canonical_recorded_session_ledger_history");
    expect(artifact.selectedCases).toHaveLength(2);
    expect(artifact.selectedCases.every((item) => item.ownerExists && !item.newPolicyRequired && !item.applicationBoundaryRequired)).toBe(true);
  });

  it("accounts for all remaining cases without changing the fixture partition", () => {
    expect(artifact.startingRemainingCases).toBe(13);
    expect(artifact.selectedCases.length + artifact.remainingCases.length).toBe(13);
    expect(artifact.fixturePartition).toEqual({ plan: 13, session: 30, progress: 35 });
  });

  it("batch3:ledger-work-set-aggregation projects performed work facts", () => {
    const result = projectCanonicalProgressDashboard({ ...canonicalHistoryInput, history: { windowId: "recent", recordedSessions: 1, completed: 1, partial: 0, missed: 0, performedSets: 2, prescribedSets: 2, substitutions: 0, evidencePending: 0 } });
    expect(result.history?.performedSets).toBe(2);
  });

  it("batch3:ledger-warmup-only-visibility projects no performed work", () => {
    const result = projectCanonicalProgressDashboard({ ...canonicalHistoryInput, recordedProgress: { completedSessions: 1, performedSets: 0, evidencePending: false }, history: { windowId: "recent", recordedSessions: 1, completed: 0, partial: 0, missed: 1, performedSets: 0, prescribedSets: 2, substitutions: 0, evidencePending: 0 } });
    expect(result.history?.performedSets).toBe(0);
    expect(result.history?.completed).toBe(0);
  });
});
