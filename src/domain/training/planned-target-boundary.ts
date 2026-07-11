import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

export type ExecutableTargetResolution =
  | { source: "exact_planned_target"; reps: number }
  | { source: "compatibility_rep_range"; reps: number | null };

/**
 * Resolves a set's executable target without allowing boundary metadata to
 * overwrite an exact target stored on the workout itself.
 */
export function resolveExecutableTargetReps(input: {
  sessionKind: WorkoutSession["sessionKind"];
  exercise: Pick<WorkoutExerciseLog, "settings" | "prescribedSetTargets">;
  workSetIndex: number;
}): ExecutableTargetResolution {
  const exact = input.exercise.prescribedSetTargets?.[input.workSetIndex];
  if (input.sessionKind === "planned" && typeof exact === "number" && Number.isFinite(exact) && exact > 0) {
    return { source: "exact_planned_target", reps: exact };
  }

  const { min, max } = input.exercise.settings.repRange;
  const reps = Number.isFinite(max) && max > 0 ? max : Number.isFinite(min) && min > 0 ? min : null;
  return { source: "compatibility_rep_range", reps };
}
