import { describe, expect, it } from "vitest";
import { resolveCanonicalMesocycleRecoveryPolicy } from "@/domain/training/canonical-mesocycle-recovery-policy";
import { evaluateCanonicalRecoveryPolicyIntervention } from "@/domain/training/canonical-recovery-phase-intervention-evaluator";
import { validateCanonicalProgressIntervention } from "@/domain/training/canonical-progress-intervention";

describe("canonical recovery intervention boundary", () => {
  it("persists a bounded recovery_action linkage without mutation fields", () => {
    const policy = resolveCanonicalMesocycleRecoveryPolicy({ planId: "plan:systemic", mesocycleId: "meso:systemic", purpose: "hypertrophy_base", method: "standard", evidenceIds: ["e:systemic"], freshness: "fresh", completeness: "complete", fatigue: "systemic", recovery: "constrained" });
    const intervention = evaluateCanonicalRecoveryPolicyIntervention({ policy, evaluationId: "eval:systemic", operationId: "op:systemic", evidenceVersions: { "e:systemic": "v1" }, macrocycleId: "macro:systemic", microcycleId: "micro:systemic" });
    expect(intervention.disposition).toBe("reduce_stress");
    expect(validateCanonicalProgressIntervention(intervention).status).toBe("valid");
    expect(intervention).not.toHaveProperty("exactLoad");
    expect(intervention).not.toHaveProperty("successorId");
  });
  it("keeps unsupported and insufficient outcomes non-mutating", () => {
    const policy = resolveCanonicalMesocycleRecoveryPolicy({ planId: "plan:systemic", mesocycleId: "meso:systemic", purpose: "unsupported", method: "standard", evidenceIds: ["e:systemic"], freshness: "fresh", completeness: "complete", fatigue: "stable", recovery: "ready" });
    const intervention = evaluateCanonicalRecoveryPolicyIntervention({ policy, evaluationId: "eval:systemic", operationId: "op:systemic", evidenceVersions: { "e:systemic": "v1" }, macrocycleId: "macro:systemic", microcycleId: "micro:systemic" });
    expect(intervention.disposition).toBe("insufficient_evidence");
    expect(intervention.applicationOwner).toBe("Progress");
  });
});
