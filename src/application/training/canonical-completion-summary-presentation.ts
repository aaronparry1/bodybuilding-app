import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
export type CanonicalCompletionSummaryPresentation = Readonly<{ title: "Workout complete"; workoutName: string; elapsedSeconds: number; completedWorkingSets: number; exercisesCompleted: number; totalVolume: number | null; progressionWins: readonly string[]; coachingOutcome: string; nextWorkoutId: string | null }>;
export function projectCanonicalCompletionSummary(input: Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[]; nextWorkoutId?: string | null; now?: number }>): CanonicalCompletionSummaryPresentation {
  const performance = effectiveCanonicalPerformedWork(input.events);
  const exercises = new Set(performance.map((event) => String(event.payload.exerciseId)));
  const weighted = performance.filter((event) => typeof event.payload.load === "number" && event.payload.load > 0 && event.payload.completion === "complete");
  const totalVolume = weighted.length ? weighted.reduce((sum, event) => sum + Number(event.payload.load) * Number(event.payload.reps ?? 0), 0) : null;
  const startedAt = input.session.startedAt ? Date.parse(input.session.startedAt) : Date.parse(input.session.createdAt);
  const completedAt = input.events.find((event) => event.type === "completed")?.occurredAt;
  const end = completedAt ? Date.parse(completedAt) : (input.now ?? Date.now());
  return { title: "Workout complete", workoutName: input.session.role, elapsedSeconds: Number.isFinite(startedAt) ? Math.max(0, Math.floor((end - startedAt) / 1000)) : 0, completedWorkingSets: performance.length, exercisesCompleted: exercises.size, totalVolume, progressionWins: [], coachingOutcome: "Training recorded. Your next session is ready when you are.", nextWorkoutId: input.nextWorkoutId ?? null };
}
