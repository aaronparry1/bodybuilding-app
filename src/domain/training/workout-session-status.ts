import type { WorkoutExerciseLog } from "@/domain/training/models";
import { getRequiredSets } from "@/domain/training/set-prescription";
import { getWorkSets } from "@/domain/training/workout-sets";

export type WorkoutExerciseDisplayStatus = "not-started" | "active" | "completed" | "stopped" | "skipped" | "swapped";

export function getWorkoutExerciseDisplayStatus(
  exercise: WorkoutExerciseLog,
  index: number,
  activeIndex: number,
): WorkoutExerciseDisplayStatus {
  const workSetCount = getWorkSets(exercise.sets).length;
  const requiredWorkSets = getRequiredSets(exercise.settings);

  if (exercise.status === "swapped") return "swapped";
  if (exercise.status === "shutdown") return "stopped";
  if (exercise.status === "complete" && workSetCount === 0) return "skipped";
  if (exercise.status === "complete" && exercise.finishedManually) return "completed";
  if (workSetCount >= requiredWorkSets) return "completed";
  if (workSetCount > 0) return "active";
  return "not-started";
}
