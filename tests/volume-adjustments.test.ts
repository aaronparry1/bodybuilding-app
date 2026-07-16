import { describe, expect, it } from "vitest";
import { resolveCanonicalMesocycleVolumePolicy } from "@/domain/training/canonical-mesocycle-volume-policy";

const base = {
  planId: "volume-canonical-plan",
  mesocycleId: "meso:accumulation",
  purpose: "hypertrophy",
  evidenceIds: ["evidence:1"],
  evidenceState: "fresh" as const,
  fatigue: "stable" as const,
  policyProgression: "hold" as const,
  recoveryAdjustment: "prohibited" as const,
};

describe("canonical Mesocycle volume policy boundary", () => {
  it("resolves a supported hold without authoring exact prescription values", () => {
    const result = resolveCanonicalMesocycleVolumePolicy(base);
    expect(result.disposition).toBe("maintain");
    expect(result.applicationOwner).toBe("Mesocycle");
    expect(result.numericRules).toEqual([]);
    expect(result).not.toHaveProperty("sets");
    expect(result).not.toHaveProperty("reps");
  });

  it("fails closed for unsupported automatic magnitude", () => {
    const result = resolveCanonicalMesocycleVolumePolicy({ ...base, policyProgression: "increase" });
    expect(result.disposition).toBe("review_required");
    expect(result.reasonCodes).toContain("volume_magnitude_not_approved");
  });

  it("fails closed for stale or conflicting evidence", () => {
    expect(resolveCanonicalMesocycleVolumePolicy({ ...base, evidenceState: "stale" }).disposition).toBe("review_required");
    expect(resolveCanonicalMesocycleVolumePolicy({ ...base, fatigue: "conflicting" }).disposition).toBe("review_required");
  });

  it("rejects legacy-shaped policy input", () => {
    expect(() => resolveCanonicalMesocycleVolumePolicy({ ...base, blocks: [] } as never)).toThrow();
  });
});
