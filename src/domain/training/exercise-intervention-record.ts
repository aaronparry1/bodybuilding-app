import type { ExerciseInterventionRecord } from "@/domain/training/plan-setup";

export function isExerciseInterventionActive(record: ExerciseInterventionRecord, input: { currentMesocycleId?: string; comparableExposuresSinceDecision: number; painResolved?: boolean }): boolean {
  if (record.reason === "pain") return !input.painResolved;
  if (record.reason === "phase_specificity") return input.currentMesocycleId != null;
  return input.comparableExposuresSinceDecision < record.reviewAfterExposures;
}

export function decideExerciseIntervention(input: { exerciseId: string; pain?: boolean; productive?: boolean; repeatedStall?: boolean; phaseRequiresSpecificity?: boolean; replacementExerciseId?: string; now?: string }): ExerciseInterventionRecord {
  const decidedAt = input.now ?? new Date().toISOString();
  if (input.pain) return { exerciseId: input.exerciseId, decision: "replace", reason: "pain", evidence: ["Pain reported; do not progress through it."], decidedAt, reviewAfterExposures: 1, replacementExerciseId: input.replacementExerciseId };
  if (input.repeatedStall) return { exerciseId: input.exerciseId, decision: "substitute", reason: "persistent_stall", evidence: ["Repeated comparable stalled exposures."], decidedAt, reviewAfterExposures: 3, replacementExerciseId: input.replacementExerciseId };
  if (input.phaseRequiresSpecificity) return { exerciseId: input.exerciseId, decision: "rotate_at_phase_boundary", reason: "phase_specificity", evidence: ["The next phase requires greater specificity."], decidedAt, reviewAfterExposures: 1, replacementExerciseId: input.replacementExerciseId };
  return { exerciseId: input.exerciseId, decision: "keep", reason: "productive", evidence: [input.productive === false ? "No replacement evidence yet; retain continuity." : "Comfortable, productive, and phase-appropriate."], decidedAt, reviewAfterExposures: 4 };
}
