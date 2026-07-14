import { describe, expect, it } from "vitest";
import { resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { resolveCanonicalLaneEnvelope, resolveCanonicalTargetEnvelope } from "@/domain/training/mesocycle-construction-input-resolvers";

describe("Mesocycle construction input resolvers", () => {
  it("resolves concrete lanes by role without block classification", () => {
    const policy = resolveMesocyclePrescriptionPolicy("powerbuilding_hypertrophy");
    expect(policy.status).toBe("resolved");
    if (policy.status === "resolved") {
      const result = resolveCanonicalLaneEnvelope(policy.policy, "primary", "primary_compound", "ready");
      expect(result.status).toBe("resolved");
      if (result.status === "resolved") expect(result.candidates).toContain("hypertrophy_strength");
    }
  });
  it("fails closed when a target requires established load", () => {
    const policy = resolveMesocyclePrescriptionPolicy("strength_taper");
    expect(policy.status).toBe("resolved");
    if (policy.status === "resolved") expect(resolveCanonicalTargetEnvelope(policy.policy, "primary", "peak", false).status).toBe("blocked");
  });
});
