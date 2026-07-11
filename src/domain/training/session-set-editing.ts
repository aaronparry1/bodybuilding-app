import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { getInSessionLoadDropSuggestion } from "@/domain/training/load-selection";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { getRequiredSets } from "@/domain/training/set-prescription";
import { manualExerciseFinishLabel } from "@/domain/training/workout-exercise-state";
import { getWorkSets } from "@/domain/training/workout-sets";

const shutdownCopy = "Exercise complete. Performance dropped enough to move on.";

export interface LoggedSetEdit {
  load: number;
  reps: number;
  type: SetLog["type"];
}

export function editLoggedSetInSession(
  session: WorkoutSession,
  exerciseIndex: number,
  setId: string,
  edit: LoggedSetEdit,
  options: { allowCompleted?: boolean } = {},
): WorkoutSession {
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || (session.completedAt && !options.allowCompleted)) return session;

  const nextSets = renumberSetsByType(
    exercise.sets.map((set) =>
      set.id === setId
        ? {
            ...set,
            load: normaliseLoad(edit.load),
            reps: normaliseReps(edit.reps),
            type: edit.type ?? "work",
          }
        : set,
    ),
  );

  return replaceExercise(session, exerciseIndex, recalculateExercise(exercise, nextSets, countsAsPlannedProgressionEvidence(session)));
}

export function deleteLoggedSetFromSession(
  session: WorkoutSession,
  exerciseIndex: number,
  setId: string,
  options: { allowCompleted?: boolean } = {},
): WorkoutSession {
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || (session.completedAt && !options.allowCompleted)) return session;

  const nextSets = renumberSetsByType(exercise.sets.filter((set) => set.id !== setId));
  return replaceExercise(session, exerciseIndex, recalculateExercise(exercise, nextSets, countsAsPlannedProgressionEvidence(session)));
}

export function removeFutureWorkSetFromSession(
  session: WorkoutSession,
  exerciseIndex: number,
  setNumber: number,
): WorkoutSession {
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || session.completedAt || exercise.status !== "active") return session;

  const normalizedSetNumber = normaliseSetNumber(setNumber);
  if (!normalizedSetNumber) return session;

  const workSets = getWorkSets(exercise.sets);
  const alreadyLogged = workSets.some((set) => set.setNumber === normalizedSetNumber);
  if (alreadyLogged) return session;

  const removedFutureWorkSetNumbers = Array.from(
    new Set([...(exercise.removedFutureWorkSetNumbers ?? []), normalizedSetNumber]),
  ).sort((a, b) => a - b);

  return replaceExercise(session, exerciseIndex, {
    ...exercise,
    removedFutureWorkSetNumbers,
  });
}

export function renumberSetsByType(sets: SetLog[]): SetLog[] {
  const counts: Record<NonNullable<SetLog["type"]>, number> = { warmup: 0, work: 0 };
  return sets.map((set) => {
    const type = set.type ?? "work";
    counts[type] += 1;
    return { ...set, type, setNumber: counts[type] };
  });
}

function recalculateExercise(exercise: WorkoutExerciseLog, sets: SetLog[], applyLoadDrop: boolean): WorkoutExerciseLog {
  const workSets = getWorkSets(sets);
  const latestWorkLoad = [...workSets].reverse().find((set) => Number.isFinite(set.load))?.load;
  const hasRemainingWorkLoadEvidence = workSets.some((set) => Number.isFinite(set.load) && set.load > 0);
  const noRemainingWorkSets = workSets.length === 0;
  const nextLoad =
    latestWorkLoad ??
    (noRemainingWorkSets && exercise.loadEstablishedFromLoggedWorkSet ? 0 : exercise.load);
  const loadDrop = applyLoadDrop
    ? getInSessionLoadDropSuggestion(sets, exercise.settings, nextLoad, exercise.settings.loadIncrease)
    : null;
  const correctedLoad = loadDrop?.shouldDrop ? loadDrop.suggestedLoad : nextLoad;
  const nextLoadKnown = noRemainingWorkSets && exercise.loadEstablishedFromLoggedWorkSet
    ? false
    : exercise.loadKnown !== false || hasRemainingWorkLoadEvidence;
  const progression = evaluateExerciseProgression({
    exerciseName: exercise.exerciseName,
    currentLoad: correctedLoad,
    settings: exercise.settings,
    sets: workSets,
  });
  const shouldShutdown = progression.shouldShutdown;
  const nextStatus =
    exercise.status === "swapped"
      ? exercise.status
      : shouldShutdown
        ? "shutdown"
        : exercise.status === "complete"
          ? exercise.finishedManually || workSets.length >= getRequiredSets(exercise.settings)
            ? "complete"
            : "active"
          : "active";

  return {
    ...exercise,
    sets,
    load: correctedLoad,
    loadKnown: nextLoadKnown,
    loadEstablishedFromLoggedWorkSet: noRemainingWorkSets ? undefined : exercise.loadEstablishedFromLoggedWorkSet,
    status: nextStatus,
    shutdownReason: shouldShutdown ? shutdownCopy : manualExerciseFinishLabel(exercise) ?? undefined,
  };
}

function countsAsPlannedProgressionEvidence(session: WorkoutSession): boolean {
  return session.sessionKind == null || session.sessionKind === "planned";
}

function replaceExercise(session: WorkoutSession, exerciseIndex: number, exercise: WorkoutExerciseLog): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map((candidate, index) => (index === exerciseIndex ? exercise : candidate)),
    updatedAt: new Date().toISOString(),
    syncState: "local",
  };
}

function normaliseLoad(load: number): number {
  return Number.isFinite(load) ? Number(Math.max(0, load).toFixed(2)) : 0;
}

function normaliseReps(reps: number): number {
  return Number.isFinite(reps) ? Math.max(0, Math.round(reps)) : 0;
}

function normaliseSetNumber(setNumber: number): number | null {
  if (!Number.isFinite(setNumber)) return null;
  const normalized = Math.round(setNumber);
  return normalized > 0 ? normalized : null;
}
