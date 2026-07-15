import { describe, expect, it } from "vitest";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";

const input = {
  contractVersion: "canonical_current_progress_context_v1" as const,
  planId: "p", planRevision: 2,
  macrocycle: { id: "macro:p", route: "build_muscle", strategy: "productive" },
  mesocycle: { id: "meso:p", purpose: "hypertrophy", policyId: "canonical_mesocycle_v1" },
  microcycle: { id: "micro:p:1", order: 1, priority: "normal", rotation: "retain", stress: "normal" },
  evidence: { ids: ["e1"], freshness: "fresh" as const, completeness: "complete" as const },
  evaluation: { id: "eval:p", version: "canonical_progress_evaluation_v2", outcome: "continue", reasons: ["evidence_current"] },
  intervention: { family: "none", disposition: "maintain", reasonCodes: ["no_change"] },
  decision: { id: "d:p", kind: "continue", status: "current" },
  recordedProgress: { completedSessions: 2, performedSets: 8, evidencePending: false },
};

describe("canonical Progress dashboard projection", () => {
  it("projects only canonical context and persisted decision state", () => {
    const result = projectCanonicalProgressDashboard(input);
    expect(result.contractVersion).toBe("canonical_progress_dashboard_projection_v1");
    expect(result.status).toBe("ready");
    expect(result.context).toMatchObject({ id: "micro:p:1", purpose: "hypertrophy", route: "build_muscle" });
    expect(result.action.allowed).toBe(true);
  });

  it("fails closed for stale/incomplete evidence", () => {
    const result = projectCanonicalProgressDashboard({ ...input, evidence: { ids: [], freshness: "stale", completeness: "incomplete" } });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.action.allowed).toBe(false);
  });

  it("rejects legacy-shaped inputs recursively", () => {
    expect(() => projectCanonicalProgressDashboard({ ...input, microcycle: { ...input.microcycle, legacy: { blocks: [] } } as never })).toThrow("invalid_canonical_progress_dashboard_input");
  });

  it("projects factual recovery, interventions, ledger history, and a persisted action", () => {
    const result = projectCanonicalProgressDashboard({ ...input, recovery: { completeness: "complete", freshness: "fresh", recovery: "ready", capacity: "available", fatigue: "low", evidenceIds: ["e1"], reasonCodes: ["factual_signal"] }, interventions: [{ interventionId: "i1", family: "volume_adjustment", policyId: "meso-load-v1", policyVersion: "v1", disposition: "review", reasonCodes: ["unsupported_magnitude"], application: "review_required", evidenceIds: ["e1"] }], history: { windowId: "current-cycle", recordedSessions: 2, completed: 1, partial: 1, missed: 0, performedSets: 8, prescribedSets: 10, substitutions: 0, evidencePending: 0 } });
    expect(result.recovery?.fatigue).toBe("low");
    expect(result.interventions[0]?.family).toBe("volume_adjustment");
    expect(result.history?.partial).toBe(1);
    expect(result.action.expectedPlanRevision).toBe(2);
  });

  it("rejects malformed intervention evidence and negative history", () => {
    expect(() => projectCanonicalProgressDashboard({ ...input, interventions: [{ interventionId: "", family: "microcycle_rotation", policyId: "", policyVersion: "", disposition: "review", reasonCodes: [], application: "review_required", evidenceIds: [] }] })).toThrow("invalid_canonical_dashboard_intervention");
    expect(() => projectCanonicalProgressDashboard({ ...input, history: { windowId: "", recordedSessions: -1, completed: 0, partial: 0, missed: 0, performedSets: 0, prescribedSets: 0, substitutions: 0, evidencePending: 0 } })).toThrow("invalid_canonical_dashboard_history");
  });
});
