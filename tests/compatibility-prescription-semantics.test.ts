import { describe, expect, it } from "vitest";
import {
  COMPATIBILITY_PRESCRIPTION_REGISTRY,
  compatibilityRegistryFingerprint,
  copyCompatibilityPrescriptionSemantics,
  fingerprintCompatibilityPrescriptionSemantics,
  lookupCompatibilityPrescriptionSemantics,
  resolveCompatibilityPrescriptionSemantics,
  validateCompatibilityPrescriptionSemantics,
} from "@/domain/training/compatibility-prescription-semantics";

describe("coordinated compatibility prescription semantics", () => {
  it("represents each documented active branch exactly once", () => {
    expect(COMPATIBILITY_PRESCRIPTION_REGISTRY).toHaveLength(7);
    expect(new Set(COMPATIBILITY_PRESCRIPTION_REGISTRY.map((entry) => entry.branchId)).size).toBe(7);
    expect(new Set(COMPATIBILITY_PRESCRIPTION_REGISTRY.map((entry) => JSON.stringify(entry.branchKey))).size).toBe(7);
    expect(COMPATIBILITY_PRESCRIPTION_REGISTRY.every((entry) => validateCompatibilityPrescriptionSemantics(entry).length === 0)).toBe(true);
  });

  it("resolves only exact branch keys without wildcard fallback", () => {
    const key = COMPATIBILITY_PRESCRIPTION_REGISTRY[0].branchKey;
    const result = resolveCompatibilityPrescriptionSemantics(key);
    expect(result.status).toBe("resolved");
    expect(lookupCompatibilityPrescriptionSemantics({ ...key, historyState: "sparse" }).status).toBe("missing");
  });

  it("defensively copies nested semantics and keeps fingerprints semantic", () => {
    const original = COMPATIBILITY_PRESCRIPTION_REGISTRY[0];
    const copy = copyCompatibilityPrescriptionSemantics(original);
    expect(copy).toEqual(original);
    (copy.reasonCodes as string[]).push("caller_mutation");
    expect(original.reasonCodes).not.toContain("caller_mutation");
    expect(fingerprintCompatibilityPrescriptionSemantics(original)).toBe(original.fingerprint);
    expect(compatibilityRegistryFingerprint()).toBe(compatibilityRegistryFingerprint());
  });

  it("rejects contradictory aggregate semantics", () => {
    const invalid = { ...COMPATIBILITY_PRESCRIPTION_REGISTRY[0], suitability: { outcome: "suitable" as const, reasonCode: "bad", blocking: true } };
    expect(validateCompatibilityPrescriptionSemantics(invalid)).toContain("suitability_incoherent");
  });
});
