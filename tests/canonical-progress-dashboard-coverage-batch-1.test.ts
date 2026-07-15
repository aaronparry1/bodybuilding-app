import { describe, expect, it } from "vitest";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";

const base = {
  contractVersion: "canonical_current_progress_context_v1" as const,
  planId: "plan:dashboard-batch-1",
  planRevision: 4,
  macrocycle: { id: "macro:build", route: "build_muscle", strategy: "productive" },
  mesocycle: { id: "meso:hypertrophy", purpose: "hypertrophy", policyId: "canonical_mesocycle_v1" },
  microcycle: { id: "micro:upper:1", order: 1, priority: "normal", rotation: "retain", stress: "normal" },
  evidence: { ids: ["evidence:dashboard:1"], freshness: "fresh" as const, completeness: "complete" as const },
  evaluation: { id: "evaluation:dashboard:1", version: "canonical_progress_evaluation_v2", outcome: "continue", reasons: ["evidence_current"] },
  recordedProgress: { completedSessions: 0, performedSets: 0, evidencePending: false },
};

const project = (patch: Record<string, unknown> = {}) => projectCanonicalProgressDashboard({ ...base, ...patch } as never);

describe("canonical dashboard coverage batch 1", () => {
  it("batch1:current-context projects canonical context", () => expect(project().context.route).toBe("build_muscle"));
  it("batch1:zero-set-history remains factual", () => expect(project({ history: { windowId: "recent", recordedSessions: 1, completed: 0, partial: 0, missed: 1, performedSets: 0, prescribedSets: 4, substitutions: 0, evidencePending: 0 } }).history?.performedSets).toBe(0));
  it("batch1:recovery-warning projects factual recovery without mutation", () => expect(project({ recovery: { completeness: "complete", freshness: "fresh", recovery: "ready", capacity: "available", fatigue: "moderate", evidenceIds: ["evidence:dashboard:1"], reasonCodes: ["historical_warning"] } }).recovery?.fatigue).toBe("moderate"));
  it("batch1:productive-history projects persisted intervention", () => expect(project({ interventions: [{ interventionId: "intervention:dashboard:1", family: "volume_adjustment", policyId: "canonical_mesocycle_load_adjustment_policy_v1", policyVersion: "v1", disposition: "review", reasonCodes: ["manual_review_required"], application: "review_required", evidenceIds: ["evidence:dashboard:1"] }] }).interventions).toHaveLength(1));
  it("batch1:low-history projects insufficient evidence and no action", () => expect(project({ evidence: { ids: ["evidence:dashboard:low"], freshness: "fresh", completeness: "incomplete" }, recordedProgress: { completedSessions: 1, performedSets: 2, evidencePending: false } }).status).toBe("insufficient_evidence"));
  it("batch1:ledger-history projects work-set totals", () => expect(project({ history: { windowId: "recent", recordedSessions: 1, completed: 1, partial: 0, missed: 0, performedSets: 2, prescribedSets: 2, substitutions: 0, evidencePending: 0 } }).history?.performedSets).toBe(2));
  it("batch1:empty-history remains empty rather than creating placeholders", () => expect(project({ recordedProgress: { completedSessions: 0, performedSets: 0, evidencePending: false }, history: { windowId: "recent", recordedSessions: 0, completed: 0, partial: 0, missed: 0, performedSets: 0, prescribedSets: 0, substitutions: 0, evidencePending: 0 } }).history?.recordedSessions).toBe(0));
});
