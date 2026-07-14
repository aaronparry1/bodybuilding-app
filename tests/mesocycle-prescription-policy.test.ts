import { describe, expect, it } from "vitest";
import { allMesocyclePrescriptionPolicies, resolveMesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";
import { mesocycleLibrary } from "@/domain/training/mesocycle-library";

describe("canonical mesocycle prescription policy", () => {
  it("resolves exactly one deterministic policy for every library state", () => {
    const policies = allMesocyclePrescriptionPolicies();
    expect(policies).toHaveLength(mesocycleLibrary.length);
    expect(policies.map((policy) => policy.mesocycleId)).toEqual(mesocycleLibrary.map((spec) => spec.id));
    expect(allMesocyclePrescriptionPolicies()).toEqual(policies);
  });

  it("keeps workout decisions out of the policy", () => {
    const result = resolveMesocyclePrescriptionPolicy("powerbuilding_hypertrophy");
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.policy).not.toHaveProperty("blocks");
      expect(result.policy).not.toHaveProperty("sets");
      expect(result.policy).not.toHaveProperty("reps");
      expect(result.policy).not.toHaveProperty("exercises");
      expect(result.policy).not.toHaveProperty("sessionRoles");
      expect(result.policy.methods.permitted).toContain("straight_sets");
    }
  });

  it("enforces special-state fatigue boundaries", () => {
    const deload = resolveMesocyclePrescriptionPolicy("hypertrophy_consolidation");
    const taper = resolveMesocyclePrescriptionPolicy("strength_taper");
    expect(deload.status).toBe("resolved");
    expect(taper.status).toBe("resolved");
    if (deload.status === "resolved" && taper.status === "resolved") {
      expect(deload.policy.fatigue.boundary).toBe("recovery_first");
      expect(deload.policy.methods.prohibited).toContain("amrap");
      expect(taper.policy.methods.prohibited).toContain("amrap");
      expect(taper.policy.specialState).toBe("taper");
    }
  });

  it("rejects incompatible macrocycle engines", () => {
    expect(resolveMesocyclePrescriptionPolicy("strength_general", { goal: "build_muscle", engine: "hypertrophy" }).status).toBe("incompatible");
  });
});
