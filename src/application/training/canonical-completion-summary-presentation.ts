import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { methodDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
export type CanonicalCompletionSummaryPresentation = Readonly<{ title: "Workout complete"; workoutName: string; elapsedSeconds: number; completedWorkingSets: number; exercisesCompleted: number; totalVolume: number | null; methodsPerformed: readonly string[]; progressionWins: readonly string[]; coachingOutcome: string; nextWorkoutId: string | null }>;
export function projectCanonicalCompletionSummary(input: Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[]; nextWorkoutId?: string | null; coachingExplanation?: string; now?: number }>): CanonicalCompletionSummaryPresentation {
  const performance = effectiveCanonicalPerformedWork(input.events);
  const exercises = new Set(performance.map((event) => String(event.payload.exerciseId)));
  const performedSlots = new Set(performance.map((event) => String(event.payload.slotId)));
  const snapshot = (input.session.prescriptionSnapshot ?? {}) as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const methodsPerformed = [...new Set(slots.filter((slot) => performedSlots.has(String(slot.id))).map((slot) => methodDisplayName(String(slot.method))))];
  const weighted = performance.filter((event) => typeof event.payload.load === "number" && event.payload.load > 0 && event.payload.completion === "complete");
  const totalVolume = weighted.length ? weighted.reduce((sum, event) => sum + Number(event.payload.load) * Number(event.payload.reps ?? 0), 0) : null;
  const startedAt = input.session.startedAt ? Date.parse(input.session.startedAt) : Date.parse(input.session.createdAt);
  const completedAt = input.events.find((event) => event.type === "completed")?.occurredAt;
  const end = completedAt ? Date.parse(completedAt) : (input.now ?? Date.now());
  return { title: "Workout complete", workoutName: sessionRoleDisplayName(input.session.role), elapsedSeconds: Number.isFinite(startedAt) ? Math.max(0, Math.floor((end - startedAt) / 1000)) : 0, completedWorkingSets: performance.length, exercisesCompleted: exercises.size, totalVolume, methodsPerformed, progressionWins: [], coachingOutcome: input.coachingExplanation ?? "Training recorded. Your next session is ready when you are.", nextWorkoutId: input.nextWorkoutId ?? null };
}
