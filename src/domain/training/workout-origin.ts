import type { WorkoutSession, WorkoutSessionKind } from "@/domain/training/models";

export type NonPlannedSessionKind = Exclude<NonNullable<WorkoutSession["sessionKind"]>, "planned">;

export function isNonPlannedSessionKind(kind: WorkoutSessionKind | undefined): kind is NonPlannedSessionKind {
  return kind != null && kind !== "planned";
}

export function isAuthoritativePlannedWorkout(session: Pick<WorkoutSession, "sessionKind">): boolean {
  return session.sessionKind === "planned";
}

export function isNonPlannedWorkout(session: Pick<WorkoutSession, "sessionKind">): boolean {
  return isNonPlannedSessionKind(session.sessionKind);
}

/**
 * Resolves an open planned workout without allowing custom or extra sessions to
 * impersonate the active plan. General resume behaviour remains in
 * `getLatestOpenSession` because a user may still resume a custom workout.
 */
export function getOpenPlannedWorkout(sessions: WorkoutSession[]): WorkoutSession | null {
  return sessions
    .filter((session) => !session.completedAt && isAuthoritativePlannedWorkout(session))
    .sort(comparePlannedWorkoutOrder)[0] ?? null;
}

function comparePlannedWorkoutOrder(left: WorkoutSession, right: WorkoutSession): number {
  const leftIndex = left.planSessionIndex ?? Number.MAX_SAFE_INTEGER;
  const rightIndex = right.planSessionIndex ?? Number.MAX_SAFE_INTEGER;
  if (leftIndex !== rightIndex) return leftIndex - rightIndex;
  if (left.startedAt !== right.startedAt) return left.startedAt.localeCompare(right.startedAt);
  return left.id.localeCompare(right.id);
}
