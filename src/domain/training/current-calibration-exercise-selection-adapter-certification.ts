import type { CurrentProgrammeSessionTemplate } from "@/domain/training/current-programme-specification";
import type { CurrentExerciseSelectionJob } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";

export const CURRENT_CALIBRATION_ADAPTER_CERTIFICATION_ID = "hypertrophy_calibration_exercise_selection_adapter_v1" as const;
export type CurrentCalibrationExerciseSelectionAdapterCertificationResult = Readonly<{ status: "certified"; certificationId: typeof CURRENT_CALIBRATION_ADAPTER_CERTIFICATION_ID; trace: readonly string[] }> | Readonly<{ status: "missing_required_job" | "unexpected_job" | "semantic_translation_mismatch" | "guidance_mismatch" | "constraint_loss" | "invalid_requiredness" | "invalid_slot_count_reconciliation" | "invalid_source_trace" | "unsupported_selection_contract" | "invalid_input"; reason: string }>;

export function certifyCurrentCalibrationExerciseSelectionAdapter(input: Readonly<{ template: CurrentProgrammeSessionTemplate; jobs: readonly CurrentExerciseSelectionJob[]; programmeId: string; programmeVersion: number; sessionTemplateId: string }>): CurrentCalibrationExerciseSelectionAdapterCertificationResult {
  if (!input.template || input.template.programmeId !== input.programmeId || input.template.programmeVersion !== input.programmeVersion || input.template.id !== input.sessionTemplateId) return { status: "invalid_source_trace", reason: "template_parent_identity_invalid" };
  if (input.jobs.length !== input.template.prescriptionSlots.length) return { status: "invalid_slot_count_reconciliation", reason: "one_to_one_slot_mapping_required" };
  const sourceIds = input.template.prescriptionSlots.map((slot) => slot.id);
  const jobIds = input.jobs.map((job) => job.sourcePrescriptionSlotId);
  if (new Set(jobIds).size !== jobIds.length || sourceIds.some((id) => !jobIds.includes(id))) return { status: "missing_required_job", reason: "source_slot_not_represented_once" };
  for (const slot of input.template.prescriptionSlots) {
    const job = input.jobs.find((candidate) => candidate.sourcePrescriptionSlotId === slot.id);
    if (!job) return { status: "missing_required_job", reason: `missing:${slot.id}` };
    if (job.recommendedMinSets !== slot.recommendedMinSets || job.recommendedMaxSets !== slot.recommendedMaxSets) return { status: "guidance_mismatch", reason: slot.id };
    if (!job.required || job.sourceTrace.programmeId !== input.programmeId || job.sourceTrace.programmeVersion !== input.programmeVersion || job.sourceTrace.sessionTemplateId !== input.sessionTemplateId || job.sourceTrace.prescriptionSlotId !== slot.id || job.sourceTrace.targetVersion !== slot.targetVersion) return { status: "invalid_source_trace", reason: slot.id };
    if (job.targetId !== slot.targetId || job.ordinal !== slot.ordinal || job.selectionConstraints.length !== slot.selectionConstraints.length) return { status: "semantic_translation_mismatch", reason: slot.id };
  }
  return { status: "certified", certificationId: CURRENT_CALIBRATION_ADAPTER_CERTIFICATION_ID, trace: ["one_to_one_slot_mapping", "guidance_preserved", "constraints_preserved", "source_trace_complete", "no_selected_exercises"] };
}
