import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { adaptCurrentPrescriptionSlotsForExerciseSelection } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";
import { certifyCurrentCalibrationExerciseSelectionAdapter } from "@/domain/training/current-calibration-exercise-selection-adapter-certification";

const setup = { goal: "build_muscle" as const, planningChoice: "single_block" as const, equipmentPreset: "full_gym" as const, daysPerWeek: 4, preferredSplit: "upper_lower" as const, experienceLevel: "intermediate" as const };

describe("D4B D3 prescription-slot exercise-selection adapter", () => {
  it.each([["upper-a", "Upper"], ["lower-a", "Lower"], ["upper-b", "Upper"], ["lower-b", "Lower"]] as const)("maps %s one-to-one with explicit source trace", (identity, role) => {
    const plan = createActiveTrainingPlan(setup, `2026-03-${identity === "upper-a" ? "01" : identity === "lower-a" ? "02" : identity === "upper-b" ? "03" : "04"}T00:00:00.000Z`);
    const metadata = plan.programmePolicyMetadata!;
    const specification = metadata.programmeSpecifications[0]!;
    const template = specification.sessionTemplates.find((candidate) => candidate.orderingKey.endsWith(`-${identity}`))!;
    const result = adaptCurrentPrescriptionSlotsForExerciseSelection({ planId: plan.id, mesocycleId: specification.mesocycleId, microcycleNumber: 1, programmeId: specification.programmeId, programmeVersion: 1, sessionTemplate: template, sessionIdentity: identity, policyVersion: metadata.policyId });
    expect(result.status).toBe("adapted");
    if (result.status === "adapted") {
      expect(result.jobs).toHaveLength(template.prescriptionSlots.length);
      expect(result.jobs.map((job) => job.sourcePrescriptionSlotId)).toEqual(template.prescriptionSlots.map((slot) => slot.id));
      expect(result.jobs.every((job) => job.required && !((job as any).selectedExerciseId))).toBe(true);
      expect(result.jobs.every((job) => job.sourceTrace.programmeId === specification.programmeId && job.sourceTrace.sessionTemplateId === template.id)).toBe(true);
      expect(result.jobs.every((job) => job.recommendedMinSets >= 1 && job.recommendedMaxSets >= job.recommendedMinSets)).toBe(true);
      expect(certifyCurrentCalibrationExerciseSelectionAdapter({ template, jobs: result.jobs, programmeId: specification.programmeId, programmeVersion: 1, sessionTemplateId: template.id }).status).toBe("certified");
    }
    void role;
  });

  it("rejects duplicate or missing translated jobs and altered guidance", () => {
    const plan = createActiveTrainingPlan(setup, "2026-03-07T00:00:00.000Z");
    const metadata = plan.programmePolicyMetadata!;
    const specification = metadata.programmeSpecifications[0]!;
    const template = specification.sessionTemplates[0]!;
    const adapted = adaptCurrentPrescriptionSlotsForExerciseSelection({ planId: plan.id, mesocycleId: specification.mesocycleId, microcycleNumber: 1, programmeId: specification.programmeId, programmeVersion: 1, sessionTemplate: template, sessionIdentity: "upper-a", policyVersion: metadata.policyId });
    if (adapted.status !== "adapted") throw new Error("expected adapter result");
    expect(certifyCurrentCalibrationExerciseSelectionAdapter({ template, jobs: adapted.jobs.slice(1), programmeId: specification.programmeId, programmeVersion: 1, sessionTemplateId: template.id }).status).toBe("invalid_slot_count_reconciliation");
    expect(certifyCurrentCalibrationExerciseSelectionAdapter({ template, jobs: adapted.jobs.map((job, index) => index === 0 ? { ...job, recommendedMinSets: job.recommendedMinSets + 1 } : job), programmeId: specification.programmeId, programmeVersion: 1, sessionTemplateId: template.id }).status).toBe("guidance_mismatch");
  });

  it("preserves intentional calibration omissions and never pads legacy accessory counts", () => {
    const plan = createActiveTrainingPlan(setup, "2026-03-05T00:00:00.000Z");
    const metadata = plan.programmePolicyMetadata!;
    const specification = metadata.programmeSpecifications[0]!;
    const template = specification.sessionTemplates[0]!;
    const result = adaptCurrentPrescriptionSlotsForExerciseSelection({ planId: plan.id, mesocycleId: specification.mesocycleId, microcycleNumber: 1, programmeId: specification.programmeId, programmeVersion: 1, sessionTemplate: template, sessionIdentity: "upper-a", policyVersion: metadata.policyId });
    expect(result.status).toBe("adapted");
    if (result.status === "adapted") {
      expect(result.slotCount).toMatchObject({ source: 5, adapted: 5 });
      expect(result.omittedSlotOrdinals).toEqual(["06-elbow-flexion", "07-elbow-extension"]);
    }
  });

  it("rejects a mismatched template parent instead of guessing", () => {
    const plan = createActiveTrainingPlan(setup, "2026-03-06T00:00:00.000Z");
    const metadata = plan.programmePolicyMetadata!;
    const template = { ...metadata.programmeSpecifications[0]!.sessionTemplates[0]!, programmeId: "wrong" };
    expect(adaptCurrentPrescriptionSlotsForExerciseSelection({ planId: plan.id, mesocycleId: "hypertrophy_calibration", microcycleNumber: 1, programmeId: metadata.programmeSpecifications[0]!.programmeId, programmeVersion: 1, sessionTemplate: template, sessionIdentity: "upper-a", policyVersion: metadata.policyId }).status).toBe("invalid_source_trace");
  });
});
