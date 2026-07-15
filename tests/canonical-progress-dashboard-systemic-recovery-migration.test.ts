import { describe, expect, it } from "vitest";
import { projectCanonicalProgressDashboard } from "@/domain/training/canonical-progress-dashboard-projection";
import { resolveCanonicalMesocycleRecoveryPolicy } from "@/domain/training/canonical-mesocycle-recovery-policy";
import { evaluateCanonicalRecoveryPolicyIntervention } from "@/domain/training/canonical-recovery-phase-intervention-evaluator";

describe("canonical systemic recovery dashboard migration", () => {
  it("projects persisted review-only intervention and never creates a recovery action", () => {
    const policy = resolveCanonicalMesocycleRecoveryPolicy({ planId: "plan:systemic", mesocycleId: "meso:systemic", purpose: "hypertrophy_base", method: "standard", evidenceIds: ["e:systemic"], freshness: "fresh", completeness: "complete", fatigue: "systemic", recovery: "constrained" });
    const intervention = evaluateCanonicalRecoveryPolicyIntervention({ policy, evaluationId: "eval:systemic", operationId: "batch6:systemic-recovery-review-only", evidenceVersions: { "e:systemic": "v1" }, macrocycleId: "macro:systemic", microcycleId: "micro:systemic", planRevision: 2 });
    const projection = projectCanonicalProgressDashboard({ contractVersion: "canonical_current_progress_context_v1", planId: "plan:systemic", planRevision: 2, macrocycle: { id: "macro:systemic", route: "build_muscle", strategy: "productive" }, mesocycle: { id: "meso:systemic", purpose: "hypertrophy_base", policyId: "canonical_mesocycle_v1" }, microcycle: { id: "micro:systemic", order: 1, priority: "normal", rotation: "retain", stress: "normal" }, evidence: { ids: ["e:systemic"], freshness: "fresh", completeness: "complete" }, evaluation: { id: "eval:systemic", version: "canonical_progress_evaluation_v2", outcome: "review", reasons: ["systemic_recovery"] }, recordedProgress: { completedSessions: 4, performedSets: 12, evidencePending: false }, recoveryIntervention: intervention });
    expect(projection.recoveryIntervention?.decisionId).toBe("batch6:systemic-recovery-review-only");
    expect(projection.recoveryIntervention?.disposition).toBe("reduce_stress");
    expect(projection.action.allowed).toBe(false);
    expect(projection).not.toHaveProperty("successorId");
    expect(projection).not.toHaveProperty("sets");
  });
  it("rejects revision or policy linkage drift", () => {
    const base = { schemaVersion: "canonical_progress_intervention_v1", decisionId: "op", evaluationId: "eval", planId: "plan", planRevision: 1, macrocycleId: "macro", mesocycleId: "meso", microcycleId: "micro", evidenceIds: ["e"], evidenceVersions: { e: "v1" }, reason: "review", policyVersion: "canonical_mesocycle_recovery_policy_v1", applicationOwner: "Progress", provenance: ["p"], family: "recovery_action", disposition: "pause_review" } as const;
    expect(() => projectCanonicalProgressDashboard({ contractVersion: "canonical_current_progress_context_v1", planId: "plan", planRevision: 2, macrocycle: { id: "macro", route: "r", strategy: "s" }, mesocycle: { id: "meso", purpose: "p", policyId: "p" }, microcycle: { id: "micro", order: 1, priority: "p", rotation: "r", stress: "s" }, evidence: { ids: ["e"], freshness: "fresh", completeness: "complete" }, recordedProgress: { completedSessions: 0, performedSets: 0, evidencePending: false }, recoveryIntervention: base })).toThrow("invalid_canonical_dashboard_recovery_intervention");
  });
});
