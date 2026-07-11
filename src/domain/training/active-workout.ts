import type { WorkoutSession } from "@/domain/training/models";
import { isLegacyPlaceholderWorkoutSession } from "@/domain/training/planned-workout";

export interface WorkoutStartTarget {
  name: string;
  sessionKind?: WorkoutSession["sessionKind"];
  planSessionIndex?: number;
  planBlockId?: string;
  planWeekNumber?: number;
}

export interface WorkoutConflictCopy {
  title: string;
  body: string;
  continueLabel: string;
  discardLabel: string;
}

export function getLatestOpenSession(sessions: WorkoutSession[]): WorkoutSession | null {
  return sessions.find((candidate) => !candidate.completedAt && !isLegacyPlaceholderWorkoutSession(candidate)) ?? null;
}

export function workoutHasLoggedSets(session: WorkoutSession): boolean {
  return session.exercises.some((exercise) => exercise.sets.length > 0);
}

export function isSameWorkoutStartTarget(activeWorkout: WorkoutSession, target: WorkoutStartTarget): boolean {
  if (activeWorkout.completedAt) return false;
  if (activeWorkout.sessionKind && target.sessionKind && activeWorkout.sessionKind !== target.sessionKind) return false;

  const matchingPlannedSession =
    activeWorkout.sessionKind === "planned" &&
    target.sessionKind === "planned" &&
    typeof activeWorkout.planSessionIndex === "number" &&
    typeof target.planSessionIndex === "number" &&
    activeWorkout.planSessionIndex === target.planSessionIndex &&
    valuesMatchWhenPresent(activeWorkout.planBlockId, target.planBlockId) &&
    valuesMatchWhenPresent(activeWorkout.planWeekNumber, target.planWeekNumber);

  if (matchingPlannedSession) return true;

  return normalizeWorkoutName(activeWorkout.name) === normalizeWorkoutName(target.name);
}

export function buildWorkoutConflictCopy(activeWorkout: WorkoutSession, target: WorkoutStartTarget): WorkoutConflictCopy {
  const currentName = activeWorkout.name.trim() || "your current";
  const nextName = target.name.trim() || "the selected";
  const hasLoggedSets = workoutHasLoggedSets(activeWorkout);

  return {
    title: "Workout already in progress",
    body: hasLoggedSets
      ? `You have logged sets in this workout. Starting ${nextName} will discard this in-progress workout.`
      : `You already have a ${currentName} workout in progress. Starting ${nextName} will discard the current workout.`,
    continueLabel: `Continue ${currentName}`,
    discardLabel: `Discard and Start ${nextName}`,
  };
}

function valuesMatchWhenPresent<T>(current: T | undefined, target: T | undefined): boolean {
  return current === undefined || target === undefined || current === target;
}

function normalizeWorkoutName(name: string): string {
  return name.trim().toLowerCase();
}
