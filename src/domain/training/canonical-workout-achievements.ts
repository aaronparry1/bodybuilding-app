import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export type CanonicalWorkoutAggregate = Readonly<{
  session: CanonicalRecordedSession;
  events: readonly CanonicalRecordedSessionEvent[];
}>;

export type CanonicalWorkoutAchievementKind = "load" | "comparable_reps" | "estimated_strength" | "meaningful_volume" | "exercise_milestone" | "programme_milestone" | "consistency_milestone";

export type CanonicalWorkoutAchievement = Readonly<{
  id: string;
  kind: CanonicalWorkoutAchievementKind;
  title: string;
  detail: string;
  exerciseId?: string;
  exerciseName?: string;
  value?: number;
  previousValue?: number;
  unit?: string;
  load?: number;
  reps?: number;
}>;

type SetFact = Readonly<{
  exerciseId: string;
  exerciseName: string;
  loadingMode: string;
  load: number;
  reps: number;
}>;

type Exposure = Readonly<{
  sessionId: string;
  completedAt: string;
  exerciseId: string;
  exerciseName: string;
  loadingMode: string;
  sets: readonly SetFact[];
}>;

const PROGRAMME_MILESTONES = [10, 25, 50, 100, 250];
const EXERCISE_MILESTONES = [10, 25, 50, 100];

export function deriveCanonicalWorkoutAchievements(input: Readonly<{
  current: CanonicalWorkoutAggregate;
  history: readonly CanonicalWorkoutAggregate[];
  exerciseName?: (exerciseId: string) => string;
  limit?: number;
}>): readonly CanonicalWorkoutAchievement[] {
  const completion = completedAt(input.current);
  if (!completion || input.current.session.status !== "completed") return [];
  const athleteId = input.current.session.athleteId;
  const planId = input.current.session.planId;
  const currentExposures = exposures(input.current, input.exerciseName);
  if (!currentExposures.length) return [];
  const prior = input.history
    .filter((aggregate) => aggregate.session.recordedSessionId !== input.current.session.recordedSessionId)
    .filter((aggregate) => aggregate.session.athleteId === athleteId && aggregate.session.planId === planId)
    .filter((aggregate) => {
      const timestamp = completedAt(aggregate);
      return Boolean(timestamp && timestamp < completion);
    });
  const priorExposures = prior.flatMap((aggregate) => exposures(aggregate, input.exerciseName));
  const achievements: CanonicalWorkoutAchievement[] = [];

  for (const current of currentExposures) {
    const comparable = priorExposures.filter((entry) => entry.exerciseId === current.exerciseId && entry.loadingMode === current.loadingMode);
    if (!comparable.length) continue;
    const best = strongestExerciseAchievement(input.current.session.recordedSessionId, current, comparable);
    if (best) achievements.push(best);
    const exposureCount = comparable.length + 1;
    if (EXERCISE_MILESTONES.includes(exposureCount)) achievements.push({
      id: `${input.current.session.recordedSessionId}:${current.exerciseId}:exercise:${exposureCount}`,
      kind: "exercise_milestone",
      title: `${exposureCount} ${current.exerciseName} sessions`,
      detail: `A genuine ${exposureCount}-session training record for this exact exercise.`,
      exerciseId: current.exerciseId,
      exerciseName: current.exerciseName,
      value: exposureCount,
    });
  }

  const completedProgrammeSessions = prior.length + 1;
  if (PROGRAMME_MILESTONES.includes(completedProgrammeSessions)) achievements.push({
    id: `${input.current.session.recordedSessionId}:programme:${completedProgrammeSessions}`,
    kind: "programme_milestone",
    title: `${completedProgrammeSessions} programme sessions`,
    detail: `${completedProgrammeSessions} completed workouts retained in this programme.`,
    value: completedProgrammeSessions,
  });

  const streak = consecutiveTrainingWeeks([...prior, input.current], completion);
  if (streak >= 4 && [4, 8, 12, 26, 52].includes(streak)) achievements.push({
    id: `${input.current.session.recordedSessionId}:consistency:${streak}`,
    kind: "consistency_milestone",
    title: `${streak} consistent weeks`,
    detail: `At least one completed workout in each of the last ${streak} calendar weeks.`,
    value: streak,
  });

  return dedupe(achievements).slice(0, input.limit ?? 4);
}

function strongestExerciseAchievement(sessionId: string, current: Exposure, prior: readonly Exposure[]): CanonicalWorkoutAchievement | null {
  const priorSets = prior.flatMap((entry) => entry.sets);
  const currentBestLoad = Math.max(...current.sets.map((set) => set.load));
  const priorBestLoad = Math.max(...priorSets.map((set) => set.load));
  if (currentBestLoad > 0 && currentBestLoad > priorBestLoad) return achievement(sessionId, current, "load", "New load best", `${format(currentBestLoad)} kg is your heaviest completed work set for this exercise.`, currentBestLoad, priorBestLoad);

  const repCandidate = current.sets
    .filter((set) => priorSets.some((priorSet) => priorSet.load === set.load))
    .sort((left, right) => right.reps - left.reps || right.load - left.load)
    .find((set) => set.reps > Math.max(...priorSets.filter((priorSet) => priorSet.load === set.load).map((priorSet) => priorSet.reps)));
  if (repCandidate) {
    const priorReps = Math.max(...priorSets.filter((set) => set.load === repCandidate.load).map((set) => set.reps));
    return { ...achievement(sessionId, current, "comparable_reps", "New rep best", `${repCandidate.reps} reps at ${format(repCandidate.load)} kg beats your previous ${priorReps} at the same load.`, repCandidate.reps, priorReps), load: repCandidate.load, reps: repCandidate.reps };
  }

  if (supportsEstimatedStrength(current.loadingMode)) {
    const currentE1rm = Math.max(...current.sets.map(e1rm));
    const priorE1rm = Math.max(...priorSets.map(e1rm));
    if (currentE1rm > 0 && priorE1rm > 0 && currentE1rm > priorE1rm * 1.005) return achievement(sessionId, current, "estimated_strength", "Estimated strength best", `${format(currentE1rm)} kg estimated 1RM from completed comparable work.`, currentE1rm, priorE1rm);
  }

  const currentVolume = volume(current.sets);
  const priorBestVolume = Math.max(...prior.map((entry) => volume(entry.sets)));
  if (current.sets.length >= 3 && currentVolume > 0 && priorBestVolume > 0 && currentVolume >= priorBestVolume * 1.05) return achievement(sessionId, current, "meaningful_volume", "Meaningful volume best", `${format(currentVolume)} kg of completed load volume, at least 5% above your previous best.`, currentVolume, priorBestVolume);
  return null;
}

function achievement(sessionId: string, exposure: Exposure, kind: CanonicalWorkoutAchievementKind, title: string, detail: string, value: number, previousValue: number): CanonicalWorkoutAchievement {
  return { id: `${sessionId}:${exposure.exerciseId}:${kind}`, kind, title, detail, exerciseId: exposure.exerciseId, exerciseName: exposure.exerciseName, value: round(value), previousValue: round(previousValue), unit: "kg" };
}

function exposures(aggregate: CanonicalWorkoutAggregate, nameForExercise: ((exerciseId: string) => string) | undefined): Exposure[] {
  if (!completedAt(aggregate)) return [];
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const slotsById = new Map(slots.map((slot) => [String(slot.id), slot]));
  const grouped = new Map<string, { exerciseId: string; exerciseName: string; loadingMode: string; sets: SetFact[] }>();
  for (const event of effectiveCanonicalPerformedWork(aggregate.events)) {
    if (event.payload.completion !== "complete") continue;
    const reps = Number(event.payload.reps);
    const load = Number(event.payload.load);
    const slot = slotsById.get(String(event.payload.slotId));
    const exerciseId = String(event.payload.exerciseId ?? "");
    if (!slot || String(slot.exerciseId ?? "") !== exerciseId || !exerciseId || !Number.isInteger(reps) || reps <= 0 || !Number.isFinite(load) || load < 0) continue;
    const loadingMode = slotLoadingIdentity(slot);
    if (!loadingMode) continue;
    const exerciseName = nameForExercise?.(exerciseId) ?? String(slot.exerciseName ?? slot.name ?? exerciseId);
    const key = `${exerciseId}:${loadingMode}`;
    const group = grouped.get(key) ?? { exerciseId, exerciseName, loadingMode, sets: [] };
    group.sets.push({ exerciseId, exerciseName, loadingMode, load, reps });
    grouped.set(key, group);
  }
  return [...grouped.values()].map((entry) => ({ sessionId: aggregate.session.recordedSessionId, completedAt: completedAt(aggregate)!, ...entry }));
}

function completedAt(aggregate: CanonicalWorkoutAggregate): string | null {
  if (!['completed', 'historical'].includes(aggregate.session.status)) return null;
  return aggregate.events.filter((event) => event.type === "completed").map((event) => event.occurredAt).sort().at(-1) ?? null;
}

function slotLoadingIdentity(slot: Record<string, unknown>): string | null {
  const prescription = slot.loadPrescription && typeof slot.loadPrescription === "object" ? slot.loadPrescription as Record<string, unknown> : {};
  const mode = String(prescription.loadingMode ?? slot.loadingMode ?? "unavailable");
  const state = String(prescription.state ?? "unspecified");
  if (mode === "unavailable" || state === "calibration_required") return null;
  return `${mode}:${state}`;
}

function supportsEstimatedStrength(identity: string): boolean { return !["bodyweight", "assisted_bodyweight", "duration", "unavailable"].some((mode) => identity.startsWith(`${mode}:`)); }
function e1rm(set: SetFact): number { return set.load > 0 && set.reps <= 12 ? set.load * (1 + Math.min(set.reps, 10) / 36) : 0; }
function volume(sets: readonly SetFact[]): number { return sets.reduce((sum, set) => sum + set.load * set.reps, 0); }
function round(value: number): number { return Math.round(value * 10) / 10; }
function format(value: number): string { return Number.isInteger(round(value)) ? String(round(value)) : round(value).toFixed(1); }

function consecutiveTrainingWeeks(history: readonly CanonicalWorkoutAggregate[], currentCompletedAt: string): number {
  const weeks = new Set(history.map(completedAt).filter((value): value is string => Boolean(value)).map(weekKey));
  const cursor = startOfIsoWeek(new Date(currentCompletedAt));
  let count = 0;
  while (weeks.has(weekKey(cursor.toISOString()))) { count += 1; cursor.setUTCDate(cursor.getUTCDate() - 7); }
  return count;
}

function startOfIsoWeek(date: Date): Date { const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())); const day = next.getUTCDay() || 7; next.setUTCDate(next.getUTCDate() - day + 1); return next; }
function weekKey(value: string): string { return startOfIsoWeek(new Date(value)).toISOString().slice(0, 10); }
function dedupe(items: readonly CanonicalWorkoutAchievement[]): CanonicalWorkoutAchievement[] { const seen = new Set<string>(); return items.filter((item) => { const key = `${item.kind}:${item.exerciseId ?? "programme"}`; if (seen.has(key)) return false; seen.add(key); return true; }); }
