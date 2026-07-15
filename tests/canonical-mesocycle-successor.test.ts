import { describe, expect, it } from "vitest";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";

describe("canonical Mesocycle successor owner", () => {
  it("accepts an approved transition and returns its policy", () => {
    const result = resolveCanonicalMesocycleSuccessor({ macrocycleId: "macro", macrocycleEngine: "hypertrophy", currentMesocycleId: "hypertrophy_base", decisionId: "d", evaluationId: "e", evidenceIds: ["x"], outcome: "transition", successorMesocycleId: "hypertrophy_consolidation", sequenceNumber: 1, planRevision: 1 });
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") expect(result.policy.mesocycleId).toBe("hypertrophy_consolidation");
  });
  it("rejects an unapproved cross-engine successor", () => {
    expect(resolveCanonicalMesocycleSuccessor({ macrocycleId: "macro", macrocycleEngine: "hypertrophy", currentMesocycleId: "hypertrophy_base", decisionId: "d", evaluationId: "e", evidenceIds: [], outcome: "transition", successorMesocycleId: "strength_general" as any, sequenceNumber: 1, planRevision: 1 })).toEqual({ status: "rejected", reason: "successor_not_approved" });
  });
});
