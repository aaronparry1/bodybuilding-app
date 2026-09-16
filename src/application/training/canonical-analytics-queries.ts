import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { exerciseLibrary } from "@/domain/training/presets";
import type { MuscleGroup } from "@/domain/training/models";

export type CanonicalExerciseHistory = Readonly<{ exerciseId: string; exerciseName: string; frequency: number; totalSets: number; loadTrend: readonly number[]; bestSetTrend: readonly number[]; lastFive: readonly Readonly<{ sessionId: string; occurredAt: string; load: number; reps: number; unit: string; completion: string; substitution: boolean }>[] }>;
export type CanonicalMuscleSummary = Readonly<{ muscleGroup: MuscleGroup; sets: number }>;

function records(planId: string) { return canonicalRecordedSessionLedger.exportPlan(planId); }

// Indexed once; the library is an immutable module-level constant. Linear
// `find` inside the per-event loops below was O(events x library) on the
// Progress tab.
let exerciseIndex: Map<string, (typeof exerciseLibrary)[number]> | null = null;
function exerciseById(id: string) {
  if (!exerciseIndex) exerciseIndex = new Map(exerciseLibrary.map((item) => [item.id, item]));
  return exerciseIndex.get(id);
}

export function queryCanonicalExerciseHistory(planId: string, exerciseId: string): CanonicalExerciseHistory | null {
  const entries = records(planId).flatMap(({ session, events }) => effectiveCanonicalPerformedWork(events).filter((event) => String(event.payload.exerciseId) === exerciseId).map((event) => ({ sessionId: session.recordedSessionId, occurredAt: event.occurredAt, load: Number(event.payload.load ?? 0), reps: Number(event.payload.reps ?? 0), unit: String(event.payload.unit ?? "unknown"), completion: String(event.payload.completion ?? "partial"), substitution: Boolean(event.payload.substitutionId) })));
  if (!entries.length) return null;
  entries.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const exercise = exerciseById(exerciseId);
  return { exerciseId, exerciseName: exercise?.name ?? exerciseId, frequency: new Set(entries.map((entry) => entry.sessionId)).size, totalSets: entries.length, loadTrend: entries.map((entry) => entry.load), bestSetTrend: entries.map((entry) => entry.reps), lastFive: entries.slice(-5).reverse() };
}

export function queryCanonicalMuscleSummaries(planId: string): CanonicalMuscleSummary[] {
  const totals = new Map<MuscleGroup, number>();
  for (const { session, events } of records(planId)) for (const event of events) if (event.type === "performance" && event.payload.completion !== "skipped") {
    const exercise = exerciseById(String(event.payload.exerciseId));
    for (const muscle of exercise?.primaryMuscles ?? []) totals.set(muscle, (totals.get(muscle) ?? 0) + 1);
  }
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([muscleGroup, sets]) => ({ muscleGroup, sets }));
}
