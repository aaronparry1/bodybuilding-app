import type { ExerciseMeasurementType, SetLog, UnitSystem, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { getWorkSets } from "@/domain/training/workout-sets";

export type PersonalRecordType = "load" | "rep" | "e1rm" | "volume";
export type PersonalRecordStatus = "baseline" | "pr";
export type PersonalRecordScope = "primary_lift" | "exercise";

export interface PersonalRecordItem {
  id: string;
  type: PersonalRecordType;
  status: PersonalRecordStatus;
  scope: PersonalRecordScope;
  exerciseId: string;
  exerciseName: string;
  value: number;
  unit?: UnitSystem;
  measurementType?: ExerciseMeasurementType;
  reps?: number;
  load?: number;
  date: string;
  sessionId: string;
}

interface WorkSetEvidence {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  load: number;
  reps: number;
  e1rm: number | null;
  completedAt: string;
  unit: UnitSystem;
  measurementType: ExerciseMeasurementType;
}

interface ExerciseSessionEvidence {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: string;
  unit: UnitSystem;
  measurementType: ExerciseMeasurementType;
  workSets: WorkSetEvidence[];
  volumeLoad: number;
}

interface ExerciseBestState {
  bestLoad: number;
  bestE1rm: number;
  bestVolume: number;
  bestRepsByLoad: Map<number, number>;
  exposures: number;
}

const primaryLiftExerciseIds = new Set(["ex-bench-press", "ex-barbell-back-squat", "ex-deadlift", "ex-military-press"]);

export function calculateConservativeE1rm(load: number, reps: number): number | null {
  if (!Number.isFinite(load) || !Number.isFinite(reps) || load <= 0 || reps <= 0) return null;
  if (reps > 12) return null;
  return roundRecordValue(load * (1 + Math.min(reps, 10) / 36));
}

export function detectPersonalRecords({
  sessions,
  currentSessionId,
  now = new Date().toISOString(),
  recentDays = 90,
  includeBaselines = false,
  limit = 12,
}: {
  sessions: WorkoutSession[];
  currentSessionId?: string;
  now?: string;
  recentDays?: number;
  includeBaselines?: boolean;
  limit?: number;
}): PersonalRecordItem[] {
  const evidence = collectSessionEvidence(sessions);
  const stateByExercise = new Map<string, ExerciseBestState>();
  const records: PersonalRecordItem[] = [];
  const recentCutoff = new Date(now).getTime() - recentDays * 24 * 60 * 60 * 1000;

  for (const entry of evidence) {
    const state = stateByExercise.get(entry.exerciseId) ?? {
      bestLoad: 0,
      bestE1rm: 0,
      bestVolume: 0,
      bestRepsByLoad: new Map<number, number>(),
      exposures: 0,
    };
    const isCurrent = currentSessionId ? entry.sessionId === currentSessionId : true;
    const isRecent = new Date(entry.completedAt).getTime() >= recentCutoff;
    const shouldEmit = currentSessionId ? isCurrent : isRecent;
    const baseline = state.exposures === 0;

    if (shouldEmit && baseline && includeBaselines) {
      records.push(...baselineRecords(entry));
    } else if (shouldEmit && !baseline) {
      records.push(...prRecords(entry, state));
    }

    updateBestState(state, entry);
    stateByExercise.set(entry.exerciseId, state);
  }

  return dedupeRecords(records)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function collectPersonalRecordEvidence(sessions: WorkoutSession[]): WorkSetEvidence[] {
  return collectSessionEvidence(sessions).flatMap((entry) => entry.workSets);
}

function collectSessionEvidence(sessions: WorkoutSession[]): ExerciseSessionEvidence[] {
  return sessions
    .filter((session) => Boolean(session.completedAt) && !session.cardioLog)
    .flatMap((session) =>
      session.exercises
        .map((exercise) => exerciseSessionEvidence(session.id, session.completedAt!, exercise))
        .filter((entry): entry is ExerciseSessionEvidence => Boolean(entry)),
    )
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
}

function exerciseSessionEvidence(sessionId: string, completedAt: string, exercise: WorkoutExerciseLog): ExerciseSessionEvidence | null {
  const workSets = getWorkSets(exercise.sets)
    .map((set) => workSetEvidence(sessionId, completedAt, exercise, set))
    .filter((entry): entry is WorkSetEvidence => Boolean(entry));
  if (workSets.length === 0) return null;
  return {
    sessionId,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    completedAt,
    unit: exercise.settings.unit,
    measurementType: exercise.settings.measurementType ?? "reps",
    workSets,
    volumeLoad: workSets.reduce((sum, set) => sum + set.load * set.reps, 0),
  };
}

function workSetEvidence(sessionId: string, completedAt: string, exercise: WorkoutExerciseLog, set: SetLog): WorkSetEvidence | null {
  if (!Number.isFinite(set.load) || !Number.isFinite(set.reps) || set.reps <= 0) return null;
  return {
    sessionId,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    load: set.load,
    reps: set.reps,
    e1rm: (exercise.settings.measurementType ?? "reps") === "duration" ? null : calculateConservativeE1rm(set.load, set.reps),
    completedAt,
    unit: exercise.settings.unit,
    measurementType: exercise.settings.measurementType ?? "reps",
  };
}

function baselineRecords(entry: ExerciseSessionEvidence): PersonalRecordItem[] {
  const bestLoadSet = maxBy(entry.workSets, (set) => set.load);
  const bestRepSet = maxBy(entry.workSets, (set) => set.reps);
  const bestE1rmSet = maxBy(entry.workSets.filter((set) => set.e1rm != null), (set) => set.e1rm ?? 0);
  return [
    bestLoadSet && bestLoadSet.load > 0 ? recordFromSet("load", "baseline", bestLoadSet, bestLoadSet.load) : null,
    bestRepSet ? recordFromSet("rep", "baseline", bestRepSet, bestRepSet.reps, { reps: bestRepSet.reps, load: bestRepSet.load }) : null,
    bestE1rmSet && bestE1rmSet.e1rm != null ? recordFromSet("e1rm", "baseline", bestE1rmSet, bestE1rmSet.e1rm) : null,
    entry.volumeLoad > 0 ? recordFromExercise("volume", "baseline", entry, roundRecordValue(entry.volumeLoad)) : null,
  ].filter((record): record is PersonalRecordItem => Boolean(record));
}

function prRecords(entry: ExerciseSessionEvidence, state: ExerciseBestState): PersonalRecordItem[] {
  const bestLoadSet = maxBy(entry.workSets, (set) => set.load);
  const bestE1rmSet = maxBy(entry.workSets.filter((set) => set.e1rm != null), (set) => set.e1rm ?? 0);
  const repSet = entry.workSets.find((set) => set.reps > (state.bestRepsByLoad.get(set.load) ?? 0));
  const records = [
    bestLoadSet && bestLoadSet.load > state.bestLoad ? recordFromSet("load", "pr", bestLoadSet, bestLoadSet.load) : null,
    repSet ? recordFromSet("rep", "pr", repSet, repSet.reps, { reps: repSet.reps, load: repSet.load }) : null,
    bestE1rmSet && bestE1rmSet.e1rm != null && bestE1rmSet.e1rm > state.bestE1rm * 1.005 ? recordFromSet("e1rm", "pr", bestE1rmSet, bestE1rmSet.e1rm) : null,
    entry.volumeLoad > 0 && entry.volumeLoad > state.bestVolume * 1.01 ? recordFromExercise("volume", "pr", entry, roundRecordValue(entry.volumeLoad)) : null,
  ].filter((record): record is PersonalRecordItem => Boolean(record));
  return records;
}

function updateBestState(state: ExerciseBestState, entry: ExerciseSessionEvidence): void {
  for (const set of entry.workSets) {
    state.bestLoad = Math.max(state.bestLoad, set.load);
    state.bestE1rm = Math.max(state.bestE1rm, set.e1rm ?? 0);
    state.bestRepsByLoad.set(set.load, Math.max(state.bestRepsByLoad.get(set.load) ?? 0, set.reps));
  }
  state.bestVolume = Math.max(state.bestVolume, entry.volumeLoad);
  state.exposures += 1;
}

function recordFromSet(
  type: PersonalRecordType,
  status: PersonalRecordStatus,
  set: WorkSetEvidence,
  value: number,
  extras: Pick<PersonalRecordItem, "reps" | "load"> = {},
): PersonalRecordItem {
  return {
    id: `${set.sessionId}:${set.exerciseId}:${type}:${status}:${roundRecordValue(value)}`,
    type,
    status,
    scope: primaryLiftExerciseIds.has(set.exerciseId) ? "primary_lift" : "exercise",
    exerciseId: set.exerciseId,
    exerciseName: set.exerciseName,
    value: roundRecordValue(value),
    unit: set.unit,
    measurementType: set.measurementType,
    reps: extras.reps,
    load: extras.load,
    date: set.completedAt,
    sessionId: set.sessionId,
  };
}

function recordFromExercise(type: PersonalRecordType, status: PersonalRecordStatus, entry: ExerciseSessionEvidence, value: number): PersonalRecordItem {
  return {
    id: `${entry.sessionId}:${entry.exerciseId}:${type}:${status}:${roundRecordValue(value)}`,
    type,
    status,
    scope: primaryLiftExerciseIds.has(entry.exerciseId) ? "primary_lift" : "exercise",
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    value: roundRecordValue(value),
    unit: entry.unit,
    measurementType: entry.measurementType,
    date: entry.completedAt,
    sessionId: entry.sessionId,
  };
}

function dedupeRecords(records: PersonalRecordItem[]): PersonalRecordItem[] {
  const seen = new Set<string>();
  const deduped: PersonalRecordItem[] = [];
  const priority: Record<PersonalRecordType, number> = { e1rm: 0, load: 1, rep: 2, volume: 3 };
  for (const record of [...records].sort((a, b) => priority[a.type] - priority[b.type])) {
    const key =
      record.type === "rep"
        ? `${record.sessionId}:${record.exerciseId}:${record.type}:${record.load}:${record.reps}:${record.status}`
        : `${record.sessionId}:${record.exerciseId}:${record.type}:${record.status}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(record);
  }
  return deduped;
}

function maxBy<T>(values: T[], score: (value: T) => number): T | null {
  if (values.length === 0) return null;
  return values.reduce((best, value) => (score(value) > score(best) ? value : best), values[0]!);
}

function roundRecordValue(value: number): number {
  return Math.round(value * 10) / 10;
}
