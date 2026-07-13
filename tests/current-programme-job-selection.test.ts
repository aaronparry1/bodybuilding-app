import { describe, expect, it } from "vitest";
import { exerciseLibrary } from "@/domain/training/presets";
import { selectCurrentProgrammeJobs } from "@/domain/training/current-programme-job-selection";
import type { CurrentExerciseSelectionJob } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";

function job(id: string, ordinal: string, movementPattern: CurrentExerciseSelectionJob["movementPattern"], required = true): CurrentExerciseSelectionJob {
  return { sourcePrescriptionSlotId: id, ordinal, targetDomain: "movement_pattern", targetId: movementPattern, movementPattern, purpose: movementPattern === "knee_flexion" || movementPattern === "plantar_flexion" ? "isolation" : "primary_compound", recommendedMinSets: 1, recommendedMaxSets: 2, required, omissionPolicy: required ? "never_omit" : "omit_when_equipment_unavailable", substitutionPolicy: "preserve_target_and_movement", selectionConstraints: ["preserve_target_and_movement"], sourceTrace: { programmeId: "p1", programmeVersion: 1, sessionTemplateId: "t1", prescriptionSlotId: id, targetVersion: 1, policyVersion: "p-v1", adapterVersion: "current_d3_calibration_slot_adapter_v1" } };
}

const base = { planId: "plan", mesocycleId: "meso", microcycleNumber: 1, programmeId: "p1", programmeVersion: 1, sessionTemplateId: "t1", sessionIdentity: "upper-a" as const, context: { exercises: exerciseLibrary, experienceLevel: "intermediate" as const } };

describe("D4D2 current programme job selection", () => {
  it("selects each ordered job once and preserves source slot order", () => {
    const result = selectCurrentProgrammeJobs({ ...base, jobs: [job("s1", "01", "horizontal_push"), job("s2", "02", "horizontal_pull"), job("s3", "03", "vertical_pull")] });
    expect(result.status).toBe("selected_all_required_jobs");
    if (result.status === "selected_all_required_jobs") {
      expect(result.selectedJobs.map((item) => item.prescriptionSlotId)).toEqual(["s1", "s2", "s3"]);
      expect(result.consumedPrescriptionSlotIds).toEqual(["s1", "s2", "s3"]);
      expect(result.selectedJobs.every((item) => item.sourceTrace.sessionTemplateId === "t1")).toBe(true);
    }
  });

  it("fails atomically when a required job has no candidate", () => {
    const result = selectCurrentProgrammeJobs({ ...base, jobs: [job("s1", "01", "horizontal_push"), job("s2", "02", "vertical_pull")], context: { exercises: [] } });
    expect(result.status).toBe("required_job_unresolved");
    if (result.status === "required_job_unresolved") expect(result.prescriptionSlotId).toBe("s1");
  });

  it("rejects duplicate slots and non-ordered jobs", () => {
    expect(selectCurrentProgrammeJobs({ ...base, jobs: [job("s1", "01", "horizontal_push"), job("s1", "02", "horizontal_pull")] }).status).toBe("duplicate_source_slot");
    expect(selectCurrentProgrammeJobs({ ...base, jobs: [job("s1", "02", "horizontal_push"), job("s2", "01", "horizontal_pull")] }).status).toBe("invalid_job_order");
  });

  it("records optional omissions without partial required success", () => {
    const result = selectCurrentProgrammeJobs({ ...base, jobs: [job("s1", "01", "horizontal_push"), job("s2", "02", "vertical_pull", false)], context: { exercises: exerciseLibrary.filter((exercise) => exercise.movementPattern === "horizontal_push") } });
    expect(result.status).toBe("selected_with_optional_omissions");
    if (result.status === "selected_with_optional_omissions") expect(result.optionalOmissions[0]?.prescriptionSlotId).toBe("s2");
  });
});
