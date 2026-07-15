import { describe, expect, it } from "vitest";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";
import { resolveCanonicalMesocycleRecoveryPolicy } from "@/domain/training/canonical-mesocycle-recovery-policy";

const base = { contractVersion: "canonical_current_progress_context_v1" as const, planId: "plan:recovery", planRevision: 2, macrocycle: { id: "macro:recovery", route: "build_muscle", strategy: "productive" }, mesocycle: { id: "meso:recovery", purpose: "hypertrophy_base", policyId: "canonical_mesocycle_v1" }, microcycle: { id: "micro:recovery", order: 1, priority: "normal", rotation: "retain", stress: "normal" }, evidence: { ids: ["e:recovery"], freshness: "fresh" as const, completeness: "complete" as const }, evaluation: { id: "eval:recovery", version: "canonical_progress_evaluation_v2", outcome: "review", reasons: ["recovery_policy"] }, recordedProgress: { completedSessions: 4, performedSets: 12, evidencePending: false } };

describe("canonical recovery policy dashboard migration", () => {
  it("projects review-only recovery dispositions without mutation", () => {
    for (const fatigue of ["local", "systemic", "conflicting"] as const) {
      const policy = resolveCanonicalMesocycleRecoveryPolicy({ planId: base.planId, mesocycleId: base.mesocycle.id, purpose: "hypertrophy_base", method: "standard", evidenceIds: ["e:recovery"], freshness: "fresh", completeness: "complete", fatigue, recovery: fatigue === "conflicting" ? "unknown" : "constrained" });
      const result = projectCanonicalProgressDashboard({ ...base, recoveryPolicy: policy });
      expect(result.recoveryPolicy?.policyId).toBe("canonical_mesocycle_recovery_policy_v1");
      expect(result.action.allowed).toBe(false);
      expect(result).not.toHaveProperty("sets");
    }
  });
  it("fails closed for unsupported or stale recovery policy input", () => {
    const policy = resolveCanonicalMesocycleRecoveryPolicy({ planId: base.planId, mesocycleId: base.mesocycle.id, purpose: "unsupported", method: "standard", evidenceIds: ["e:recovery"], freshness: "fresh", completeness: "complete", fatigue: "stable", recovery: "ready" });
    expect(projectCanonicalProgressDashboard({ ...base, recoveryPolicy: policy }).recoveryPolicy?.disposition).toBe("unsupported_policy");
    expect(() => projectCanonicalProgressDashboard({ ...base, recoveryPolicy: { ...policy, planId: "other" } })).toThrow("invalid_canonical_dashboard_recovery_policy");
  });
});
