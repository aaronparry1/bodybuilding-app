import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
import type { Exercise, UnitSystem } from "@/domain/training/models";

export const CANONICAL_EXERCISE_HISTORY_PROJECTION_VERSION = "canonical_exercise_history_projection_v1" as const;
type Entry = Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>;
export type CanonicalExerciseHistoryResult = Readonly<{ status: "ready"; projection: CanonicalExerciseHistoryProjection } | { status: "unavailable" | "corrupt"; reason: string }>;
export type CanonicalExerciseHistoryProjection = Readonly<{ contractVersion: typeof CANONICAL_EXERCISE_HISTORY_PROJECTION_VERSION; exerciseId: string; exerciseName: string; entries: ReadonlyArray<Readonly<{ recordedSessionId: string; completedAt: string; role: string; workSets: ReadonlyArray<Readonly<{ reps: number; load: number; unit: string; setId: string }>>; warmUpSets: number; bestReps: number | null; totalWorkSets: number; navigation: Readonly<{ recordedSessionId: string }> }>>; status: "complete" | "empty" }>;
function hasLegacy(value: unknown): boolean { if (!value || typeof value !== "object") return false; if (Array.isArray(value)) return value.some(hasLegacy); const object = value as Record<string, unknown>; if (["WorkoutSession", "WorkoutExerciseLog", "blocks", "activeBlockId", "TrainingYear", "currentBlock"].some((key) => key in object)) return true; return Object.values(object).some(hasLegacy); }
export function projectCanonicalExerciseHistory(input: Readonly<{ athleteId: string; planId: string; exerciseId: string; sessions: readonly Entry[]; exercises: readonly Exercise[]; unit: UnitSystem }>): CanonicalExerciseHistoryResult {
  if (!input.athleteId || !input.planId || !input.exerciseId || input.sessions.some(hasLegacy)) return { status: "corrupt", reason: "invalid_canonical_history_input" };
  const exercise = input.exercises.find((candidate) => candidate.id === input.exerciseId);
  if (!exercise) return { status: "unavailable", reason: "exercise_metadata_unavailable" };
  const entries = input.sessions.filter((entry) => entry.session.planId === input.planId && entry.session.athleteId === input.athleteId && (entry.session.status === "completed" || entry.session.status === "historical")).map((entry) => {
    const performances = entry.events.filter((event) => event.type === "performance" && String(event.payload.exerciseId) === input.exerciseId);
    const workSets = performances.filter((event) => event.payload.warmup !== true && Number.isFinite(Number(event.payload.reps)) && Number.isFinite(Number(event.payload.load))).map((event) => ({ reps: Number(event.payload.reps), load: Number(event.payload.load), unit: String(event.payload.unit ?? "unknown"), setId: String(event.payload.setId ?? event.eventId) }));
    return { recordedSessionId: entry.session.recordedSessionId, completedAt: entry.events.filter((event) => event.type === "completed" || event.type === "historical").map((event) => event.occurredAt).sort().at(-1) ?? entry.session.createdAt, role: entry.session.role, workSets, warmUpSets: performances.filter((event) => event.payload.warmup === true).length, bestReps: workSets.length ? Math.max(...workSets.map((set) => set.reps)) : null, totalWorkSets: workSets.length, navigation: { recordedSessionId: entry.session.recordedSessionId } };
  }).filter((entry) => entry.workSets.length > 0).sort((a, b) => (b.completedAt + ":" + b.recordedSessionId).localeCompare(a.completedAt + ":" + a.recordedSessionId));
  void input.unit;
  return { status: "ready", projection: { contractVersion: CANONICAL_EXERCISE_HISTORY_PROJECTION_VERSION, exerciseId: exercise.id, exerciseName: exercise.name, entries, status: entries.length ? "complete" : "empty" } };
}
