import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_RECORDED_SESSION_HISTORY_PROJECTION_VERSION = "canonical_recorded_session_history_projection_v1" as const;
type Entry = Readonly<{ session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }>;
export type CanonicalHistoryListResult = Readonly<{ status: "ready"; entries: readonly CanonicalHistoryListEntry[] } | { status: "unavailable" | "corrupt"; reason: string }>;
export type CanonicalHistoryListEntry = Readonly<{ recordedSessionId: string; completedAt: string; role: string; classification: "scheduled" | "extra"; exercisesCompleted: number; workSets: number; reps: number; navigation: Readonly<{ recordedSessionId: string }> }>;
function hasLegacy(value: unknown): boolean { if (!value || typeof value !== "object") return false; if (Array.isArray(value)) return value.some(hasLegacy); const object = value as Record<string, unknown>; if (["WorkoutSession", "WorkoutExerciseLog", "blocks", "activeBlockId", "TrainingYear", "currentBlock"].some((key) => key in object)) return true; return Object.values(object).some(hasLegacy); }
export function projectCanonicalRecordedSessionHistory(input: Readonly<{ athleteId: string; planId: string; sessions: readonly Entry[]; exerciseQuery?: string; fromDate?: string; toDate?: string }>): CanonicalHistoryListResult {
  if (!input.athleteId || !input.planId || input.sessions.some(hasLegacy)) return { status: "corrupt", reason: "invalid_canonical_history_input" };
  const from = input.fromDate ? Date.parse(input.fromDate) : -Infinity;
  const to = input.toDate ? Date.parse(input.toDate + "T23:59:59.999Z") : Infinity;
  if (Number.isNaN(from) || Number.isNaN(to)) return { status: "corrupt", reason: "invalid_history_window" };
  const entries = input.sessions.filter((entry) => entry.session.planId === input.planId && entry.session.athleteId === input.athleteId && (entry.session.status === "completed" || entry.session.status === "historical")).map((entry) => {
    const completedAt = entry.events.filter((event) => event.type === "completed" || event.type === "historical").map((event) => event.occurredAt).sort().at(-1) ?? entry.session.createdAt;
    const performances = entry.events.filter((event) => event.type === "performance" && event.payload.warmup !== true);
    const matching = input.exerciseQuery ? performances.filter((event) => String(event.payload.exerciseId ?? "").toLowerCase().includes(input.exerciseQuery!.toLowerCase())) : performances;
    const exercises = new Set(matching.map((event) => String(event.payload.exerciseId ?? "")));
    return { recordedSessionId: entry.session.recordedSessionId, completedAt, role: entry.session.role, classification: entry.session.role.startsWith("extra:") ? "extra" as const : "scheduled" as const, exercisesCompleted: exercises.size, workSets: matching.length, reps: matching.reduce((sum, event) => sum + Number(event.payload.reps ?? 0), 0), navigation: { recordedSessionId: entry.session.recordedSessionId } };
  }).filter((entry) => { const time = Date.parse(entry.completedAt); return time >= from && time <= to && (!input.exerciseQuery || entry.workSets > 0); }).sort((a, b) => (b.completedAt + ":" + b.recordedSessionId).localeCompare(a.completedAt + ":" + a.recordedSessionId));
  return { status: "ready", entries };
}
