import { describe, expect, it } from "vitest";
import { certifyCurrentCalibrationExactTargetPolicy, copyCurrentExactTargetPolicy, resolveCurrentCalibrationExactTargetPolicy, type CurrentExactTargetPolicyResolutionInput } from "@/domain/training/current-calibration-exact-target-policy";

const input: CurrentExactTargetPolicyResolutionInput = { schemaVersion: "v1", policyRegistryVersion: "v1", goal: "build_muscle", experience: "intermediate", mesocyclePurpose: "hypertrophy_calibration", microcyclePriority: "normal_calibration", sessionIdentity: "upper-a", sessionRole: "Upper", slotPurpose: "primary_compound", targetId: "horizontal_press", movementPattern: "horizontal_push", selectedExerciseClass: "primary_compound", loadingCapability: "incremental", historyState: "no_usable_history", recommendedMinSets: 1, recommendedMaxSets: 2 };

describe("D4E2B calibration exact-target policy", () => {
  it("resolves the approved primary-compound policy without block semantics", () => {
    const result = resolveCurrentCalibrationExactTargetPolicy(input);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.policy.repStrategy.domain).toEqual({ min: 6, max: 10 });
      expect(result.policy.lane.id).toBe("primary_compound_calibration");
      expect(result.policy.setConstruction.initialCount).toBe("minimum");
      expect(result.policy.dropOff.thresholdPercent).toBe(15);
      expect(result.policy.shutdown.scope).toBe("exercise");
    }
  });

  it.each([["secondary_compound", { min: 8, max: 12 }], ["isolation", { min: 10, max: 15 }]] as const)("resolves approved %s domains", (selectedExerciseClass, domain) => {
    const result = resolveCurrentCalibrationExactTargetPolicy({ ...input, selectedExerciseClass, slotPurpose: selectedExerciseClass === "isolation" ? "isolation" : "secondary_compound" });
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") expect(result.policy.repStrategy.domain).toEqual(domain);
  });

  it("rejects block-derived or invalid policy inputs", () => {
    expect(resolveCurrentCalibrationExactTargetPolicy({ ...input, microcyclePriority: "normal_productive" as never }).status).toBe("unsupported_microcycle_priority");
    expect(resolveCurrentCalibrationExactTargetPolicy({ ...input, recommendedMinSets: 3, recommendedMaxSets: 1 }).status).toBe("invalid_guidance");
  });

  it("certifies a complete supported matrix and copies defensively", () => {
    const matrix: CurrentExactTargetPolicyResolutionInput[] = [input, { ...input, sessionIdentity: "lower-a", sessionRole: "Lower", slotPurpose: "secondary_compound", targetId: "hip_hinge", movementPattern: "hinge", selectedExerciseClass: "secondary_compound" }, { ...input, sessionIdentity: "upper-b", slotPurpose: "isolation", targetId: "lateral_deltoid", movementPattern: "shoulder_abduction", selectedExerciseClass: "isolation" }];
    const certification = certifyCurrentCalibrationExactTargetPolicy(matrix);
    expect(certification.status).toBe("certified");
    const resolved = resolveCurrentCalibrationExactTargetPolicy(input);
    if (resolved.status === "resolved") {
      const copy = copyCurrentExactTargetPolicy(resolved.policy);
      expect(copy).toEqual(resolved.policy);
      expect(copy).not.toBe(resolved.policy);
    }
  });
});
