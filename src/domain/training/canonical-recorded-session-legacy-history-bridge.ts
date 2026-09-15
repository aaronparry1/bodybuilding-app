import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { calculateDurationMinutes } from "@/domain/training/workout-history";
import type { Exercise, ExerciseHistorySummary, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";

/**
 * Bridges the canonical recorded-session model (real, live workout data) into
 * the legacy WorkoutHistorySummary shape, which the exercise-selection scoring
 * engine (staleExercisePenalty, structuredVariabilityScore, progressionScore,
 * and the newer recentMicrocyclesExerciseUsage variety logic) has always
 * expected but never actually received on the live path.
 *
 * Field-by-field honesty: sessionId, exerciseId, load, reps, setsCompleted,
 * repsCompleted, volumeLoad, bestSetReps, durationMinutes, and the plan/
 * microcycle identity fields are computed from real recorded data using the
 * same event-parsing pattern already proven in canonical-workout-achievements.ts.
 * Fields this bridge cannot determine without guessing (progressionEarned,
 * stoppedByDropOff, dropOffThreshold, nextRecommendedLoad, qualitySets) are
 * set to conservative, non-claim-making defaults — see inline comments —
 * rather than fabricated values that could mislead the (currently dormant)
 * scoring functions that read them.
 */
export function buildWorkoutHistorySummaryFromCanonicalSession(
  aggregate: Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>,
  exercises: readonly Exercise[],
  units: UnitSystem,
): WorkoutHistorySummary | null {
  const { session, events } = aggregate;
  if (session.status !== "completed" && session.status !== "historical") return null;
  const completedAt = events.filter((event) => event.type === "completed").map((event) => event.occurredAt).sort().at(-1);
  if (!completedAt) return null;

  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? (snapshot.slots as Array<Record<string, unknown>>) : [];
  const slotsById = new Map(slots.map((slot) => [String(slot.id), slot]));
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  type SetFact = { load: number; reps: number };
  const grouped = new Map<string, { exerciseId: string; exerciseName: string; sets: SetFact[] }>();

  for (const event of effectiveCanonicalPerformedWork(events)) {
    if (event.payload.completion !== "complete") continue;
    const reps = Number(event.payload.reps);
    const load = Number(event.payload.load);
    const slot = slotsById.get(String(event.payload.slotId));
    const exerciseId = String(event.payload.exerciseId ?? "");
    if (!slot || String(slot.exerciseId ?? "") !== exerciseId || !exerciseId || !Number.isInteger(reps) || reps <= 0 || !Number.isFinite(load) || load < 0) continue;
    const exerciseName = exerciseById.get(exerciseId)?.name ?? String(slot.exerciseName ?? slot.name ?? exerciseId);
    const group = grouped.get(exerciseId) ?? { exerciseId, exerciseName, sets: [] };
    group.sets.push({ load, reps });
    grouped.set(exerciseId, group);
  }

  if (grouped.size === 0) return null;

  const exerciseSummaries: ExerciseHistorySummary[] = [...grouped.values()].map((group) => {
    const setsCompleted = group.sets.length;
    const repsCompleted = group.sets.reduce((total, set) => total + set.reps, 0);
    const volumeLoad = group.sets.reduce((total, set) => total + set.load * set.reps, 0);
    const bestSetReps = Math.max(...group.sets.map((set) => set.reps));
    const lastLoad = group.sets[group.sets.length - 1].load;
    return {
      sessionId: session.recordedSessionId,
      sessionName: session.role,
      completedAt,
      exerciseLogId: `${session.recordedSessionId}:${group.exerciseId}`,
      exerciseId: group.exerciseId,
      exerciseName: group.exerciseName,
      load: lastLoad,
      unit: units,
      setsCompleted,
      repsCompleted,
      qualitySets: setsCompleted, // No quality-set signal in canonical data; treat all completed sets as counting equally rather than guessing which were "quality".
      bestSetReps,
      dropOffThreshold: 0, // Not tracked in canonical data; 0 means no threshold claimed.
      stoppedByDropOff: false, // Conservative: never claim a drop-off occurred without real evidence.
      progressionEarned: false, // Conservative: determining this correctly needs the prior exposure's target, which this bridge does not attempt to resolve. False avoids fabricating a progress claim.
      nextRecommendedLoad: lastLoad, // No new recommendation computed here; carrying the last real load forward is a neutral "no claim" default, not a real recommendation.
      volumeLoad,
    };
  });

  const microcycleSequenceMatch = /:microcycle:(\d+)$/.exec(session.microcycleId);
  const planMicrocycleNumber = microcycleSequenceMatch ? Number(microcycleSequenceMatch[1]) : undefined;
  const startedAt = session.startedAt ?? session.createdAt;

  return {
    sessionId: session.recordedSessionId,
    programmeId: session.planId,
    planMesocycleId: session.mesocycleId,
    planMicrocycleNumber,
    sessionName: session.role,
    startedAt,
    completedAt,
    durationMinutes: calculateDurationMinutes(startedAt, completedAt),
    exercisesCompleted: exerciseSummaries.length,
    setsCompleted: exerciseSummaries.reduce((total, entry) => total + entry.setsCompleted, 0),
    repsCompleted: exerciseSummaries.reduce((total, entry) => total + entry.repsCompleted, 0),
    totalLoadVolume: exerciseSummaries.reduce((total, entry) => total + entry.volumeLoad, 0),
    progressionHighlights: [], // Not computed here; existing achievement/highlight logic owns this elsewhere and is unaffected by this bridge.
    exerciseSummaries,
  };
}

/** Converts every completed/historical session for a plan into legacy WorkoutHistorySummary entries, most-recent-last. */
export function buildWorkoutHistoryForPlan(
  aggregates: readonly Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>[],
  exercises: readonly Exercise[],
  units: UnitSystem,
): WorkoutHistorySummary[] {
  return aggregates
    .map((aggregate) => buildWorkoutHistorySummaryFromCanonicalSession(aggregate, exercises, units))
    .filter((summary): summary is WorkoutHistorySummary => summary !== null)
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}
