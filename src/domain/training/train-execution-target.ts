import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

export type TrainExecutionTargetResolution =
  | { source: "exact_planned_target"; reps: number }
  | { source: "planned_target_missing"; reps: null }
  | { source: "non_planned_boundary"; reps: number | null };

/**
 * Resolves the instruction Train may prefill for one work set. A planned
 * workout executes its stored set target only; a missing target remains a
 * compatibility state and is never reconstructed from boundary metadata.
 */
export function resolveTrainExecutionTarget(input: {
  sessionKind: WorkoutSession["sessionKind"];
  exercise: Pick<WorkoutExerciseLog, "settings" | "prescribedSetTargets">;
  workSetIndex: number;
}): TrainExecutionTargetResolution {
  const exact = input.exercise.prescribedSetTargets?.[input.workSetIndex];
  if (input.sessionKind === "planned") {
    return typeof exact === "number" && Number.isFinite(exact) && exact > 0
      ? { source: "exact_planned_target", reps: exact }
      : { source: "planned_target_missing", reps: null };
  }

  const { min, max } = input.exercise.settings.repRange;
  const reps = Number.isFinite(max) && max > 0 ? max : Number.isFinite(min) && min > 0 ? min : null;
  return { source: "non_planned_boundary", reps };
}
