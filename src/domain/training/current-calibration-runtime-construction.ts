import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveCurrentSessionConstructionSource } from "@/domain/training/current-session-construction-projection";
import { adaptCurrentPrescriptionSlotsForExerciseSelection } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";
import { certifyCurrentCalibrationExerciseSelectionAdapter } from "@/domain/training/current-calibration-exercise-selection-adapter-certification";
import { selectCurrentProgrammeJobs, type CurrentProgrammeJobSelectionBatchResult } from "@/domain/training/current-programme-job-selection";
import { exerciseLibrary } from "@/domain/training/presets";
import type { ExerciseSelectionJobContext } from "@/domain/training/single-job-exercise-selection";

export type CurrentCalibrationRuntimeConstructionResult = Readonly<{ status: "constructed_current_programme"; source: "current_programme_adapter"; planId: string; mesocycleId: string; microcycleNumber: number; programmeId: string; programmeVersion: number; sessionTemplateId: string; consumedPrescriptionSlotIds: readonly string[]; jobs: readonly unknown[]; selectedJobs: CurrentProgrammeJobSelectionBatchResult extends infer _T ? readonly unknown[] : readonly unknown[] }> | Readonly<{ status: "constructed_compatibility"; source: "compatibility_generated_guidance" }> | Readonly<{ status: "required_slot_unresolved" | "required_current_job_unresolved" | "current_selector_failure" | "invalid_programme_reference" | "invalid_session_template" | "adapter_not_certified" | "unsupported_current_policy" | "invalid_input"; reason: string }>;

export function resolveCurrentCalibrationRuntimeConstruction(input: Readonly<{ activePlan: ActiveTrainingPlan | null | undefined; sessionIdentity: "upper-a" | "lower-a" | "upper-b" | "lower-b"; sessionRole: "Upper" | "Lower"; selectionContext?: ExerciseSelectionJobContext }>): CurrentCalibrationRuntimeConstructionResult {
  const source = resolveCurrentSessionConstructionSource(input);
  if (source.status === "compatibility_generated_guidance") return { status: "constructed_compatibility", source: "compatibility_generated_guidance" };
  if (source.status !== "current_programme_specification") {
    const invalidReference = source.status === "missing_programme_reference" || source.status === "dangling_programme_reference";
    const invalidTemplate = source.status === "missing_session_template";
    return { status: invalidReference ? "invalid_programme_reference" : invalidTemplate ? "invalid_session_template" : source.status === "unsupported_current_policy" ? "unsupported_current_policy" : "invalid_input", reason: source.reason };
  }
  const guidance = source.guidance;
  const template = input.activePlan?.programmePolicyMetadata?.programmeSpecifications[0]?.sessionTemplates.find((candidate) => candidate.id === guidance.sessionTemplateId);
  if (!template) return { status: "invalid_session_template", reason: "projected_template_missing" };
  const adapted = adaptCurrentPrescriptionSlotsForExerciseSelection({ planId: guidance.planId, mesocycleId: guidance.mesocycleId, microcycleNumber: guidance.microcycleNumber, programmeId: guidance.programmeId, programmeVersion: guidance.programmeVersion, sessionTemplate: template, sessionIdentity: input.sessionIdentity, policyVersion: guidance.policyVersion });
  if (adapted.status !== "adapted") return { status: "required_slot_unresolved", reason: adapted.reason };
  const certified = certifyCurrentCalibrationExerciseSelectionAdapter({ template, jobs: adapted.jobs, programmeId: guidance.programmeId, programmeVersion: guidance.programmeVersion, sessionTemplateId: guidance.sessionTemplateId });
  if (certified.status !== "certified") return { status: "adapter_not_certified", reason: certified.reason };
  const selected = selectCurrentProgrammeJobs({ planId: guidance.planId, mesocycleId: guidance.mesocycleId, microcycleNumber: guidance.microcycleNumber, programmeId: guidance.programmeId, programmeVersion: guidance.programmeVersion, sessionTemplateId: guidance.sessionTemplateId, sessionIdentity: input.sessionIdentity, jobs: adapted.jobs, context: input.selectionContext ?? { exercises: exerciseLibrary, experienceLevel: "intermediate" } });
  if (selected.status !== "selected_all_required_jobs" && selected.status !== "selected_with_optional_omissions") return { status: selected.status === "required_job_unresolved" ? "required_current_job_unresolved" : "current_selector_failure", reason: "reason" in selected ? selected.reason : selected.status };
  return { status: "constructed_current_programme", source: "current_programme_adapter", planId: guidance.planId, mesocycleId: guidance.mesocycleId, microcycleNumber: guidance.microcycleNumber, programmeId: guidance.programmeId, programmeVersion: guidance.programmeVersion, sessionTemplateId: guidance.sessionTemplateId, consumedPrescriptionSlotIds: adapted.jobs.map((job) => job.sourcePrescriptionSlotId), jobs: adapted.jobs, selectedJobs: selected.selectedJobs };
}
