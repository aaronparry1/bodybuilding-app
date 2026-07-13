import type { CurrentExerciseSelectionJob } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";
import { createExerciseSelectionJobRequest, selectExerciseForJob, type ExerciseSelectionJobContext } from "@/domain/training/single-job-exercise-selection";

export type CurrentProgrammeJobSelectionBatchInput = Readonly<{
  planId: string;
  mesocycleId: string;
  microcycleNumber: number;
  programmeId: string;
  programmeVersion: number;
  sessionTemplateId: string;
  sessionIdentity: "upper-a" | "lower-a" | "upper-b" | "lower-b";
  jobs: readonly CurrentExerciseSelectionJob[];
  context: ExerciseSelectionJobContext;
}>;

export type CurrentProgrammeJobSelectionBatchResult = Readonly<{
  status: "selected_all_required_jobs" | "selected_with_optional_omissions";
  sessionIdentity: CurrentProgrammeJobSelectionBatchInput["sessionIdentity"];
  selectedJobs: readonly Readonly<{ prescriptionSlotId: string; ordinal: string; selectedExerciseId: string; sourceTrace: CurrentExerciseSelectionJob["sourceTrace"] }>[];
  optionalOmissions: readonly Readonly<{ prescriptionSlotId: string; ordinal: string; reason: string; sourceTrace: CurrentExerciseSelectionJob["sourceTrace"] }>[];
  consumedPrescriptionSlotIds: readonly string[];
}> | Readonly<{
  status: "required_job_unresolved" | "invalid_job_order" | "duplicate_source_slot" | "invalid_source_trace" | "selector_failure" | "invalid_context" | "invalid_input";
  reason: string;
  prescriptionSlotId?: string;
  sourceTrace?: CurrentExerciseSelectionJob["sourceTrace"];
}>;

export function selectCurrentProgrammeJobs(input: CurrentProgrammeJobSelectionBatchInput): CurrentProgrammeJobSelectionBatchResult {
  if (!input.planId || !input.mesocycleId || !input.programmeId || !input.sessionTemplateId || input.microcycleNumber < 1 || input.programmeVersion < 1 || input.jobs.length === 0) return { status: "invalid_input", reason: "batch_identity_or_jobs_invalid" };
  if (!input.context.exercises) return { status: "invalid_context", reason: "exercise_context_missing" };
  const seen = new Set<string>();
  let previousOrdinal = "";
  const selectedJobs: Array<{ prescriptionSlotId: string; ordinal: string; selectedExerciseId: string; sourceTrace: CurrentExerciseSelectionJob["sourceTrace"] }> = [];
  const optionalOmissions: Array<{ prescriptionSlotId: string; ordinal: string; reason: string; sourceTrace: CurrentExerciseSelectionJob["sourceTrace"] }> = [];
  for (const job of input.jobs) {
    if (seen.has(job.sourcePrescriptionSlotId)) return { status: "duplicate_source_slot", reason: "duplicate_prescription_slot", prescriptionSlotId: job.sourcePrescriptionSlotId, sourceTrace: { ...job.sourceTrace } };
    if (previousOrdinal && job.ordinal <= previousOrdinal) return { status: "invalid_job_order", reason: "job_ordinals_not_strictly_increasing", prescriptionSlotId: job.sourcePrescriptionSlotId, sourceTrace: { ...job.sourceTrace } };
    if (job.sourceTrace.prescriptionSlotId !== job.sourcePrescriptionSlotId || job.sourceTrace.sessionTemplateId !== input.sessionTemplateId || job.sourceTrace.programmeId !== input.programmeId || job.sourceTrace.programmeVersion !== input.programmeVersion) return { status: "invalid_source_trace", reason: "job_trace_parent_mismatch", prescriptionSlotId: job.sourcePrescriptionSlotId, sourceTrace: { ...job.sourceTrace } };
    seen.add(job.sourcePrescriptionSlotId);
    previousOrdinal = job.ordinal;
    const result = selectExerciseForJob(createExerciseSelectionJobRequest(job), input.context);
    if (result.status === "selected" && result.selectedExerciseId) {
      selectedJobs.push({ prescriptionSlotId: job.sourcePrescriptionSlotId, ordinal: job.ordinal, selectedExerciseId: result.selectedExerciseId, sourceTrace: { ...result.sourceTrace } });
      continue;
    }
    if (!job.required && result.status === "no_eligible_candidate") {
      optionalOmissions.push({ prescriptionSlotId: job.sourcePrescriptionSlotId, ordinal: job.ordinal, reason: result.selectionReason, sourceTrace: { ...result.sourceTrace } });
      continue;
    }
    return { status: result.status === "no_eligible_candidate" ? "required_job_unresolved" : "selector_failure", reason: result.selectionReason, prescriptionSlotId: job.sourcePrescriptionSlotId, sourceTrace: { ...result.sourceTrace } };
  }
  return { status: optionalOmissions.length ? "selected_with_optional_omissions" : "selected_all_required_jobs", sessionIdentity: input.sessionIdentity, selectedJobs, optionalOmissions, consumedPrescriptionSlotIds: [...seen] };
}
