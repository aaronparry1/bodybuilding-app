import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

export type AddExercisePosition = "after_current" | "end";

export function addExerciseToSession(
  session: WorkoutSession,
  exercise: WorkoutExerciseLog,
  options: { activeExerciseIndex: number; position: AddExercisePosition },
): WorkoutSession {
  if (session.completedAt) return session;

  const insertionIndex =
    options.position === "after_current"
      ? Math.min(session.exercises.length, Math.max(0, options.activeExerciseIndex + 1))
      : session.exercises.length;

  const addedExercise: WorkoutExerciseLog = {
    ...exercise,
    origin: "added_during_workout",
  };

  return {
    ...session,
    exercises: [
      ...session.exercises.slice(0, insertionIndex),
      addedExercise,
      ...session.exercises.slice(insertionIndex),
    ],
    syncState: "local",
    updatedAt: new Date().toISOString(),
  };
}

export function removeAddedExerciseFromSession(
  session: WorkoutSession,
  exerciseIndex: number,
): WorkoutSession {
  if (session.completedAt) return session;

  const exercise = session.exercises[exerciseIndex];
  if (!exercise || exercise.origin !== "added_during_workout") return session;

  return {
    ...session,
    exercises: session.exercises.filter((_, index) => index !== exerciseIndex),
    syncState: "local",
    updatedAt: new Date().toISOString(),
  };
}

export function removeExerciseForTodayFromSession(
  session: WorkoutSession,
  exerciseIndex: number,
): WorkoutSession {
  if (session.completedAt) return session;
  if (session.exercises.length <= 1) return session;
  if (!session.exercises[exerciseIndex]) return session;

  return {
    ...session,
    exercises: session.exercises.filter((_, index) => index !== exerciseIndex),
    syncState: "local",
    updatedAt: new Date().toISOString(),
  };
}
