import { describe, expect, it } from "vitest";
import { exerciseLibrary } from "@/domain/training/presets";
import { createExerciseSelectionJobRequest, selectExerciseForJob } from "@/domain/training/single-job-exercise-selection";
import type { CurrentExerciseSelectionJob } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";

function job(movementPattern: CurrentExerciseSelectionJob["movementPattern"], purpose: CurrentExerciseSelectionJob["purpose"] = "primary_compound"): CurrentExerciseSelectionJob {
  return {
    sourcePrescriptionSlotId: `slot-${movementPattern}`,
    ordinal: "01",
    targetDomain: "movement_pattern",
    targetId: movementPattern,
    movementPattern,
    purpose,
    recommendedMinSets: 1,
    recommendedMaxSets: 2,
    required: true,
    omissionPolicy: "never_omit",
    substitutionPolicy: "preserve_target_and_movement",
    selectionConstraints: ["preserve_target_and_movement"],
    sourceTrace: { programmeId: "programme-1", programmeVersion: 1, sessionTemplateId: "template-1", prescriptionSlotId: `slot-${movementPattern}`, targetVersion: 1, policyVersion: "policy-v1", adapterVersion: "current_d3_calibration_slot_adapter_v1" },
  };
}

describe("single-job exercise-selection seam", () => {
  it.each([
    ["horizontal_push", "ex-bench-press"],
    ["vertical_pull", "ex-pull-up"],
    ["hinge", "ex-deadlift"],
    ["knee_flexion", "ex-seated-leg-curl"],
    ["plantar_flexion", "ex-standing-calf-raise"],
  ] as const)("selects only the semantic %s family", (movement, expectedId) => {
    const purpose = movement === "knee_flexion" || movement === "plantar_flexion" ? "isolation" : "primary_compound";
    const result = selectExerciseForJob(createExerciseSelectionJobRequest(job(movement, purpose)), { exercises: exerciseLibrary, experienceLevel: "intermediate" });
    expect(result.status).toBe("selected");
    expect(result.selectedExerciseId).toBe(expectedId);
  });

  it("preserves trace and keeps guidance selection-neutral", () => {
    const request = createExerciseSelectionJobRequest(job("horizontal_pull"));
    const result = selectExerciseForJob({ ...request, recommendedMinSets: 99, recommendedMaxSets: 100 }, { exercises: exerciseLibrary });
    expect(result.sourceTrace).toEqual(request.sourceTrace);
    expect(result.guidanceSelectionNeutral).toBe(true);
  });

  it("returns no eligible candidate without generic fallback", () => {
    const result = selectExerciseForJob(createExerciseSelectionJobRequest(job("knee_flexion")), { exercises: [] });
    expect(result.status).toBe("no_eligible_candidate");
    expect(result.selectedExerciseId).toBeUndefined();
  });
});
