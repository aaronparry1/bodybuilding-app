import type { WorkoutSession } from "@/domain/training/models";

export function hasFutureUncompletedWorkSetAfterLog(currentWorkSetCount: number, targetMax: number): boolean {
  if (!Number.isFinite(currentWorkSetCount) || !Number.isFinite(targetMax)) return false;
  return Math.max(0, currentWorkSetCount) + 1 < Math.max(1, targetMax);
}

export function applyInSessionEscalationToFuturePrescription(
  session: WorkoutSession,
  exerciseIndex: number,
  suggestedLoad: number,
): WorkoutSession {
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || session.completedAt || exercise.status !== "active" || !Number.isFinite(suggestedLoad) || suggestedLoad < 0) {
    return session;
  }

  const nextExercise = {
    ...exercise,
    load: Number(suggestedLoad.toFixed(2)),
    loadKnown: true,
  };

  return {
    ...session,
    exercises: session.exercises.map((candidate, index) => (index === exerciseIndex ? nextExercise : candidate)),
    updatedAt: new Date().toISOString(),
    syncState: "local",
  };
}
