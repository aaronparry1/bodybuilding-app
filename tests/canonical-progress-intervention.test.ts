import { describe, expect, it } from "vitest";
import { validateCanonicalProgressIntervention } from "@/domain/training/canonical-progress-intervention";
const base = { schemaVersion: "canonical_progress_intervention_v1" as const, decisionId: "d", evaluationId: "e", planId: "p", planRevision: 1, macrocycleId: "m", mesocycleId: "me", microcycleId: "mi", evidenceIds: ["ev"], evidenceVersions: { ev: "v1" }, reason: "canonical", policyVersion: "policy", applicationOwner: "Mesocycle" as const, provenance: ["canonical"] };
describe("canonical Progress interventions", () => {
  it.each([["load_adjustment", "reduce"], ["volume_adjustment", "review"], ["microcycle_rotation", "retain"], ["recovery_action", "deload"], ["goal_or_phase_review", "transition"]] as const)("validates %s", (family, disposition) => expect(validateCanonicalProgressIntervention({ ...base, family, disposition }).status).toBe("valid"));
  it("rejects exact prescription authority", () => expect(validateCanonicalProgressIntervention({ ...base, family: "load_adjustment", disposition: "increase", exactLoad: 100 }).status).toBe("invalid"));
});
