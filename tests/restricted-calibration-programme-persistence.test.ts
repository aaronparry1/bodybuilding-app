import { beforeEach, describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { classifyRestrictedCalibrationPlanMetadata, findRestrictedCalibrationSlot } from "@/domain/training/restricted-calibration-programme-persistence";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { jsonStore } from "@/data/local/json-store";
import { readFileSync } from "node:fs";

const supported = { goal: "build_muscle" as const, planningChoice: "single_block" as const, equipmentPreset: "full_gym" as const, daysPerWeek: 4, preferredSplit: "upper_lower" as const, experienceLevel: "intermediate" as const };

describe("restricted D3 calibration programme persistence", () => {
  beforeEach(() => jsonStore.remove("iron-logic.active-training-plan"));
  it("attaches the certified immutable four-template metadata during supported new-plan creation", () => {
    const plan = createActiveTrainingPlan(supported, "2026-01-01T00:00:00.000Z");
    expect(plan.currentMesocycleId).toBe("hypertrophy_calibration");
    expect(plan.programmePolicyMetadata?.policyId).toBe("intermediate_upper_lower_hypertrophy_calibration_v1");
    expect(plan.programmeSpecifications).toHaveLength(1);
    expect(plan.programmeSpecifications?.[0]?.sessionTemplates.map((template) => template.orderingKey)).toEqual(["1-upper-a", "2-lower-a", "3-upper-b", "4-lower-b"]);
    expect(plan.programmeSpecifications?.[0]?.sessionTemplates.flatMap((template) => template.prescriptionSlots)).toHaveLength(18);
    expect(classifyRestrictedCalibrationPlanMetadata(plan).status).toBe("restricted_d3_current");
  });

  it("keeps unsupported families as compatibility plans without empty metadata", () => {
    const plan = createActiveTrainingPlan({ ...supported, experienceLevel: "beginner", daysPerWeek: 3, preferredSplit: "full_body" }, "2026-01-02T00:00:00.000Z");
    expect(plan.programmeSpecifications).toBeUndefined();
    expect(classifyRestrictedCalibrationPlanMetadata(plan)).toEqual({ status: "compatibility" });
  });

  it("round-trips metadata defensively through the existing local repository", () => {
    const plan = createActiveTrainingPlan(supported, "2026-01-03T00:00:00.000Z");
    activeTrainingPlanRepository.save(plan);
    const loaded = activeTrainingPlanRepository.getOptional();
    expect(loaded?.programmePolicyMetadata?.certificationId).toBe("hypertrophy_calibration_upper_lower_certification_v1");
    expect(loaded?.programmeSpecifications?.[0]?.version).toBe(1);
    expect(loaded?.microcycleProgrammeReferences?.[0]?.programmeVersion).toBe(1);
    expect(loaded?.programmeSpecifications).not.toBe(plan.programmeSpecifications);
    const metadata = loaded?.programmePolicyMetadata;
    if (!metadata) throw new Error("expected D3 metadata");
    const specification = metadata.programmeSpecifications[0]!;
    const template = specification.sessionTemplates[0]!;
    const slot = findRestrictedCalibrationSlot(metadata, specification.programmeId, 1, template.id, template.prescriptionSlots[0]!.id);
    expect(slot.status).toBe("found");
    expect(findRestrictedCalibrationSlot(metadata, "wrong-programme", 1, template.id, template.prescriptionSlots[0]!.id).status).toBe("not_found");
  });

  it("rejects malformed current metadata instead of downgrading it", () => {
    const plan = createActiveTrainingPlan(supported, "2026-01-04T00:00:00.000Z");
    const malformed = { ...plan, programmeSpecifications: [] };
    expect(classifyRestrictedCalibrationPlanMetadata(malformed).status).toBe("invalid_current_plan");
  });

  it("keeps D3 metadata out of runtime construction and adjustment authority", () => {
    const construction = readFileSync("src/domain/training/planned-workout.ts", "utf8");
    const sessionSelection = readFileSync("src/domain/training/training-session-selection.ts", "utf8");
    const adjustment = readFileSync("src/application/training/current-recommended-set-guidance-application-service.ts", "utf8");
    expect(construction).not.toContain("programmeSpecifications");
    expect(sessionSelection).not.toContain("programmeSpecifications");
    expect(adjustment).not.toContain("programmeSpecifications");
  });
});
