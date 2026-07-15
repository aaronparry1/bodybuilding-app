import { describe, expect, it } from "vitest";
import { resolveCanonicalProgressDashboardEvidence } from "@/domain/training/canonical-progress-dashboard-evidence-contract";

const input = { planId: "plan:evidence", planRevision: 1, cycleIds: ["macro:1", "meso:1", "micro:1"], completedSessions: 1, plannedSessions: 2, extraSessions: 3, requiredCompletedSessions: 2, freshness: "fresh" as const, completeness: "complete" as const };

describe("canonical dashboard evidence contract", () => {
  it("returns deterministic insufficient evidence for history below the supplied requirement", () => {
    const result = resolveCanonicalProgressDashboardEvidence(input);
    expect(result.status).toBe("insufficient_evidence");
    expect(result.contractVersion).toBe("canonical_progress_dashboard_evidence_v1");
  });
  it("accepts sufficient factual evidence without authoring a decision", () => {
    const result = resolveCanonicalProgressDashboardEvidence({ ...input, completedSessions: 2 });
    expect(result.status).toBe("sufficient");
    expect(result.reasonCodes).toEqual(["evidence_sufficient"]);
  });
  it("fails closed for stale, conflicting, mismatched, and legacy-shaped input", () => {
    expect(resolveCanonicalProgressDashboardEvidence({ ...input, freshness: "stale" }).status).toBe("insufficient_evidence");
    expect(resolveCanonicalProgressDashboardEvidence({ ...input, completeness: "conflicting" }).status).toBe("review_required");
    expect(resolveCanonicalProgressDashboardEvidence({ ...input, plannedSessions: 1, completedSessions: 2 }).status).toBe("review_required");
    expect(() => resolveCanonicalProgressDashboardEvidence({ ...input, legacy: { blocks: [] } } as never)).toThrow("invalid_canonical_progress_dashboard_evidence");
  });
});
