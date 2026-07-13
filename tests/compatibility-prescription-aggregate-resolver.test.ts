import { describe, expect, it } from "vitest";
import { COMPATIBILITY_PRESCRIPTION_REGISTRY } from "@/domain/training/compatibility-prescription-semantics";
import { buildCompatibilityPrescriptionResolutionInput, compatibilityResolverHasArithmeticDependencies, resolveCompatibilityPrescriptionAggregate } from "@/domain/training/compatibility-prescription-aggregate-resolver";

const inputFor = (entry: typeof COMPATIBILITY_PRESCRIPTION_REGISTRY[number]) => ({ ...entry.branchKey, registryVersion: "v1" as const, equipmentIncrementClass: "standard" as const, prescriptionState: entry.branchKey.historyState === "established" ? "evidence_rich" as const : "normal" as const, specialMethod: "standard" as const });

describe("D4E3C3 compatibility aggregate resolver", () => {
  it("resolves every characterized branch from normalized facts", () => {
    for (const entry of COMPATIBILITY_PRESCRIPTION_REGISTRY) {
      const result = resolveCompatibilityPrescriptionAggregate(inputFor(entry));
      expect(result.status).toBe("resolved");
      if (result.status === "resolved") expect(result.semantics.branchId).toBe(entry.branchId);
    }
  });
  it("projects exact facts and rejects unsupported or contradictory inputs", () => {
    const projected = buildCompatibilityPrescriptionResolutionInput(inputFor(COMPATIBILITY_PRESCRIPTION_REGISTRY[0]));
    expect(projected.status).toBe("projected");
    expect(resolveCompatibilityPrescriptionAggregate({ ...inputFor(COMPATIBILITY_PRESCRIPTION_REGISTRY[0]), blockClassification: "unknown" }).status).toBe("invalid_input");
    expect(resolveCompatibilityPrescriptionAggregate({ ...inputFor(COMPATIBILITY_PRESCRIPTION_REGISTRY[0]), registryVersion: "v9" as never }).status).toBe("unsupported_registry_version");
  });
  it("returns defensive aggregates and has no arithmetic dependency", () => {
    const result = resolveCompatibilityPrescriptionAggregate(inputFor(COMPATIBILITY_PRESCRIPTION_REGISTRY[0]));
    expect(result.status).toBe("resolved");
    expect(compatibilityResolverHasArithmeticDependencies()).toBe(false);
  });
});
