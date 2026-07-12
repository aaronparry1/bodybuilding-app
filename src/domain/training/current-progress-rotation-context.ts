import type { CurrentProgressContext } from "@/domain/training/current-progress-context";
import type { ExerciseInterventionRecord } from "@/domain/training/plan-setup";

export type CurrentProgressRotationContext =
  | Readonly<{ status: "no_rotation" | "rotation_observed" | "rotation_authorised" | "rotation_applied"; reason: string; exerciseId?: string; replacementExerciseId?: string; interventionDecision?: ExerciseInterventionRecord["decision"] }>
  | Readonly<{ status: "assessment_unavailable" | "compatibility" | "invalid"; reason: string }>;

/** Pure read-only projection of persisted intervention facts; it never selects or applies a replacement. */
export function buildCurrentProgressRotationContext(context: CurrentProgressContext, interventions: readonly ExerciseInterventionRecord[] = [], appliedReplacements: Readonly<Record<string, { replacementExerciseId: string }>> = {}, historicalObservation = false): CurrentProgressRotationContext {
  if (context.status === "compatibility") return { status: "compatibility", reason: context.reason };
  if (context.status === "invalid") return { status: "invalid", reason: context.reason };
  if (context.status !== "ready") return { status: "assessment_unavailable", reason: "current_rotation_assessment_unavailable" };
  const applied = Object.entries(appliedReplacements)[0];
  if (applied) return { status: "rotation_applied", reason: "persisted_replacement_applied", exerciseId: applied[0], replacementExerciseId: applied[1].replacementExerciseId };
  const intervention = interventions.find((item) => item.decision !== "keep");
  if (intervention) return { status: "rotation_authorised", reason: intervention.reason, exerciseId: intervention.exerciseId, ...(intervention.replacementExerciseId ? { replacementExerciseId: intervention.replacementExerciseId } : {}), interventionDecision: intervention.decision };
  return historicalObservation ? { status: "rotation_observed", reason: "historical_exercise_observation" } : { status: "no_rotation", reason: "no_current_rotation" };
}
