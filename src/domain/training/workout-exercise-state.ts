import type { ManualExerciseFinishReason, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

const manualFinishCopy: Record<ManualExerciseFinishReason, string> = {
  completed_enough: "Finished for today.",
  fatigue_performance: "Finished early: fatigue/performance dropping.",
  pain_limitation: "Finished early: pain/limitation.",
  equipment_unavailable: "Finished early: equipment unavailable.",
  taking_it_easy: "Finished early: taking it easy today.",
  out_of_time: "Finished early: out of time.",
};

export function canReopenExercise(
  exercise: Pick<WorkoutExerciseLog, "status">,
  options: { allowShutdown?: boolean } = {},
): boolean {
  if (exercise.status === "complete") return true;
  if (exercise.status === "shutdown") return Boolean(options.allowShutdown);
  return false;
}

export function reopenExercise(
  exercise: WorkoutExerciseLog,
  options: { allowShutdown?: boolean } = {},
): WorkoutExerciseLog {
  if (!canReopenExercise(exercise, options)) return exercise;

  return {
    ...exercise,
    status: "active",
    finishedManually: undefined,
    finishReason: undefined,
    finishedAt: undefined,
    finishType: undefined,
    shutdownReason:
      exercise.status === "shutdown"
        ? "Reopened after drop-off shutdown. Use this only when the previous set was logged incorrectly."
        : undefined,
  };
}

export function finishExerciseManuallyInSession(
  session: WorkoutSession,
  exerciseIndex: number,
  reason: ManualExerciseFinishReason,
  finishedAt = new Date().toISOString(),
): WorkoutSession {
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || session.completedAt || exercise.status !== "active") return session;

  const finishType = reason === "fatigue_performance" ? "manual_shutdown" : "manual_completion";
  const nextExercise: WorkoutExerciseLog = {
    ...exercise,
    status: finishType === "manual_shutdown" ? "shutdown" : "complete",
    finishedManually: true,
    finishReason: reason,
    finishedAt,
    finishType,
    shutdownReason: manualFinishCopy[reason],
  };

  return {
    ...session,
    exercises: session.exercises.map((candidate, index) => (index === exerciseIndex ? nextExercise : candidate)),
    updatedAt: finishedAt,
    syncState: "local",
  };
}

export function manualExerciseFinishLabel(exercise: Pick<WorkoutExerciseLog, "finishedManually" | "finishReason" | "finishType" | "shutdownReason">): string | null {
  if (!exercise.finishedManually) return null;
  if (exercise.finishReason) return manualFinishCopy[exercise.finishReason];
  if (exercise.finishType === "manual_shutdown") return "Finished early: fatigue/performance dropping.";
  return exercise.shutdownReason ?? "Finished for today.";
}

export function manualFinishShouldSuppressLoadIncrease(reason: ManualExerciseFinishReason | undefined): boolean {
  return reason === "fatigue_performance" || reason === "pain_limitation" || reason === "equipment_unavailable" || reason === "taking_it_easy";
}
