import { exerciseDisplayName, loadingModeDisplayName, methodDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export type WorkoutSetPresentation = Readonly<{
  id: string;
  number: number;
  target: string;
  prescribedLoad: number | null;
  loadLabel: string;
  unit: "kg";
  previous: string | null;
  restSeconds: number;
  actualReps: number | null;
  actualLoad: number | null;
  state: "current" | "completed" | "upcoming";
}>;

export type WorkoutExercisePresentation = Readonly<{
  id: string;
  order: number;
  name: string;
  method: string;
  groupType: "straight_set" | "superset" | "triset" | "giant_set" | "circuit";
  loadState: string;
  sets: readonly WorkoutSetPresentation[];
}>;

export type WorkoutPresentation = Readonly<{
  id: string;
  title: string;
  purpose: string;
  lifecycle: "planned" | "starting" | "active" | "paused" | "completed" | "unavailable";
  completedSets: number;
  totalSets: number;
  progressPercent: number;
  finishAllowed: boolean;
  finishBlockedReason: string | null;
  exercises: readonly WorkoutExercisePresentation[];
  estimatedDurationMinutes: number | null;
  elapsedSeconds: number;
}>;

type SnapshotSlot = Readonly<Record<string, unknown>>;

export function projectCanonicalWorkoutPresentation(input: Readonly<{
  session: CanonicalRecordedSession | null;
  snapshot: Readonly<Record<string, unknown>>;
  events?: readonly CanonicalRecordedSessionEvent[];
}>): WorkoutPresentation {
  const events = input.events ?? [];
  const performance = events.filter((event) => event.type === "performance");
  const slots = Array.isArray(input.snapshot.slots) ? input.snapshot.slots as SnapshotSlot[] : [];
  const exercises = slots.map((slot, index) => {
    const settings = object(slot.settings);
    const range = object(settings.repRange);
    const min = number(range.min, 1);
    const max = number(range.max, min);
    const requiredSets = Math.max(1, number(settings.requiredSets, 1));
    const restSeconds = number(object(slot.rest).seconds, 90);
    const loadingMode = String(slot.loadingMode ?? "unavailable");
    const prescribedLoad = numberOrNull(slot.prescribedLoad) ?? numberOrNull(object(slot.loadPrescription).prescribedBaseLoad);
    const actual = performance.filter((event) => String(object(event.payload).slotId) === String(slot.id));
    const sets = Array.from({ length: requiredSets }, (_, offset) => {
      const setNumber = offset + 1;
      const event = actual.find((candidate) => number(object(candidate.payload).setOrder, 0) === setNumber);
      const target = min === max ? `${min} reps` : `${min}–${max} reps`;
      return { id: `${String(slot.id)}:set:${setNumber}`, number: setNumber, target, prescribedLoad, loadLabel: prescribedLoad === null ? loadingModeDisplayName(loadingMode) : `${prescribedLoad} kg`, unit: "kg" as const, previous: null, restSeconds, actualReps: event ? numberOrNull(object(event.payload).reps) : null, actualLoad: event ? numberOrNull(object(event.payload).load) : null, state: event ? "completed" as const : performance.length === 0 && setNumber === 1 && index === 0 ? "current" as const : "upcoming" as const };
    });
    return { id: String(slot.id), order: index + 1, name: exerciseDisplayName(String(slot.exerciseId)), method: methodDisplayName(String(slot.method)), groupType: groupTypeForMethod(String(slot.method)), loadState: loadingModeDisplayName(loadingMode), sets };
  });
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const completedSets = exercises.reduce((sum, exercise) => sum + exercise.sets.filter((set) => set.state === "completed").length, 0);
  const lifecycle = input.session ? input.session.status === "started" ? "active" : input.session.status === "paused" ? "paused" : input.session.status === "completed" ? "completed" : "unavailable" : "planned";
  const startedAt = input.session?.startedAt ? Date.parse(input.session.startedAt) : NaN;
  const estimatedDurationMinutes = totalSets ? Math.max(1, Math.round((totalSets * 2 + exercises.reduce((sum, exercise) => sum + exercise.sets[0].restSeconds, 0) / 60) / 2)) : null;
  return { id: input.session?.recordedSessionId ?? String(input.snapshot.sessionId ?? "planned-workout"), title: sessionRoleDisplayName(String(input.snapshot.role ?? input.session?.role ?? "Training session")), purpose: "Follow the prescribed sets, then record what you actually completed.", lifecycle, completedSets, totalSets, progressPercent: totalSets ? Math.round((completedSets / totalSets) * 100) : 0, finishAllowed: completedSets > 0 && (lifecycle === "active" || lifecycle === "paused"), finishBlockedReason: completedSets > 0 ? null : "Complete at least one valid set before finishing.", exercises, estimatedDurationMinutes, elapsedSeconds: Number.isFinite(startedAt) ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0 };
}

function groupTypeForMethod(method: string): WorkoutExercisePresentation["groupType"] { if (/triset/i.test(method)) return "triset"; if (/super/i.test(method)) return "superset"; if (/giant/i.test(method)) return "giant_set"; if (/circuit/i.test(method)) return "circuit"; return "straight_set"; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function number(value: unknown, fallback: number): number { return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
function numberOrNull(value: unknown): number | null { return typeof value === "number" && Number.isFinite(value) ? value : null; }
