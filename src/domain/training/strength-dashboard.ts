import type { SetLog, UnitSystem, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { calculateConservativeE1rm, detectPersonalRecords, type PersonalRecordItem } from "@/domain/training/personal-records";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import { getWorkSets } from "@/domain/training/workout-sets";

export type StrengthTrend = "up" | "stable" | "down";
export type StrengthPrType = "load" | "rep" | "e1rm";

export interface StrengthLiftDashboardItem {
  liftId: PrimaryStrengthLiftId;
  label: string;
  exerciseIds: string[];
  currentE1rm: number | null;
  bestE1rm: number | null;
  change30Day: number | null;
  change90Day: number | null;
  trend: StrengthTrend;
  evidence: string;
  unit: UnitSystem;
}

export interface StrengthTotalDashboard {
  currentTotal: number | null;
  bestTotal: number | null;
  changeInTotal: number | null;
  unit: UnitSystem;
}

export interface StrengthPrItem {
  id: string;
  type: StrengthPrType;
  exerciseName: string;
  value: number;
  unit?: UnitSystem;
  reps?: number;
  date: string;
}

export interface StrengthDashboard {
  generatedAt: string;
  primaryLifts: StrengthLiftDashboardItem[];
  powerliftingTotal: StrengthTotalDashboard | null;
  recentPrs: StrengthPrItem[];
  hasData: boolean;
}

export type PrimaryStrengthLiftId = "bench_press" | "squat" | "deadlift" | "standing_overhead_press";

interface LiftDefinition {
  id: PrimaryStrengthLiftId;
  label: string;
  exerciseIds: string[];
}

interface StrengthSetEvidence {
  liftId: PrimaryStrengthLiftId;
  exerciseId: string;
  exerciseName: string;
  load: number;
  reps: number;
  e1rm: number;
  completedAt: string;
  unit: UnitSystem;
}

const primaryLiftDefinitions: LiftDefinition[] = [
  { id: "bench_press", label: "Bench Press", exerciseIds: ["ex-bench-press"] },
  { id: "squat", label: "Squat", exerciseIds: ["ex-barbell-back-squat"] },
  { id: "deadlift", label: "Deadlift", exerciseIds: ["ex-deadlift"] },
  { id: "standing_overhead_press", label: "Standing Barbell Overhead Press", exerciseIds: ["ex-military-press"] },
];
export { calculateConservativeE1rm };

export function buildStrengthDashboard({
  sessions,
  goal,
  now = new Date().toISOString(),
}: {
  sessions: WorkoutSession[];
  goal?: TrainingSetupGoal;
  now?: string;
}): StrengthDashboard {
  const evidence = collectStrengthEvidence(sessions);
  const unit = evidence[0]?.unit ?? "kg";
  const primaryLifts = primaryLiftDefinitions.map((lift) => buildLiftDashboardItem(lift, evidence, now, unit));
  const normalizedGoal = goal ? normalizeTrainingSetupGoal(goal) : undefined;

  return {
    generatedAt: now,
    primaryLifts,
    powerliftingTotal: normalizedGoal === "powerlifting_meet" ? buildPowerliftingTotal(primaryLifts, unit) : null,
    recentPrs: detectPersonalRecords({ sessions, now, recentDays: 90, includeBaselines: false, limit: 8 })
      .filter((record) => record.scope === "primary_lift" && (record.type === "load" || record.type === "rep" || record.type === "e1rm"))
      .map(strengthPrFromRecord),
    hasData: primaryLifts.some((lift) => lift.currentE1rm != null || lift.bestE1rm != null),
  };
}

function collectStrengthEvidence(sessions: WorkoutSession[]): StrengthSetEvidence[] {
  const liftByExerciseId = new Map<string, LiftDefinition>();
  for (const lift of primaryLiftDefinitions) {
    for (const exerciseId of lift.exerciseIds) {
      liftByExerciseId.set(exerciseId, lift);
    }
  }

  return sessions
    .filter((session) => Boolean(session.completedAt) && !session.cardioLog)
    .flatMap((session) =>
      session.exercises.flatMap((exercise) => collectExerciseEvidence(session.completedAt!, exercise, liftByExerciseId)),
    )
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
}

function collectExerciseEvidence(completedAt: string, exercise: WorkoutExerciseLog, liftByExerciseId: Map<string, LiftDefinition>): StrengthSetEvidence[] {
  const lift = liftByExerciseId.get(exercise.exerciseId);
  if (!lift) return [];

  return getWorkSets(exercise.sets)
    .map((set) => setEvidenceFromSet(completedAt, exercise, set, lift))
    .filter((entry): entry is StrengthSetEvidence => Boolean(entry));
}

function setEvidenceFromSet(completedAt: string, exercise: WorkoutExerciseLog, set: SetLog, lift: LiftDefinition): StrengthSetEvidence | null {
  const e1rm = calculateConservativeE1rm(set.load, set.reps);
  if (e1rm == null) return null;
  return {
    liftId: lift.id,
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    load: set.load,
    reps: set.reps,
    e1rm,
    completedAt,
    unit: exercise.settings.unit,
  };
}

function buildLiftDashboardItem(lift: LiftDefinition, allEvidence: StrengthSetEvidence[], now: string, fallbackUnit: UnitSystem): StrengthLiftDashboardItem {
  const evidence = allEvidence.filter((entry) => entry.liftId === lift.id);
  const unit = evidence[0]?.unit ?? fallbackUnit;
  const currentWindow = entriesWithinDays(evidence, now, 30);
  const ninetyWindow = entriesWithinDays(evidence, now, 90);
  const currentE1rm = bestE1rm(currentWindow) ?? latestE1rm(evidence);
  const best = bestE1rm(evidence);
  const previous30 = bestE1rm(entriesBeforeDays(evidence, now, 30));
  const previous90 = bestE1rm(entriesBeforeDays(evidence, now, 90));
  const change30Day = currentE1rm != null && previous30 != null ? roundLoad(currentE1rm - previous30) : null;
  const change90Day = currentE1rm != null && previous90 != null ? roundLoad(currentE1rm - previous90) : null;

  return {
    liftId: lift.id,
    label: lift.label,
    exerciseIds: lift.exerciseIds,
    currentE1rm,
    bestE1rm: best,
    change30Day,
    change90Day,
    trend: calculateStrengthTrend(ninetyWindow.length > 0 ? ninetyWindow : evidence),
    evidence: currentE1rm == null ? "No completed work sets yet." : evidenceLabelForBest(currentWindow.length > 0 ? currentWindow : evidence, currentE1rm),
    unit,
  };
}

function buildPowerliftingTotal(lifts: StrengthLiftDashboardItem[], unit: UnitSystem): StrengthTotalDashboard {
  const totalLifts = lifts.filter((lift) => lift.liftId === "bench_press" || lift.liftId === "squat" || lift.liftId === "deadlift");
  const currentValues = totalLifts.map((lift) => lift.currentE1rm);
  const bestValues = totalLifts.map((lift) => lift.bestE1rm);
  const currentTotal = currentValues.every((value) => value != null) ? roundLoad(currentValues.reduce((sum, value) => sum + (value ?? 0), 0)) : null;
  const bestTotal = bestValues.every((value) => value != null) ? roundLoad(bestValues.reduce((sum, value) => sum + (value ?? 0), 0)) : null;

  return {
    currentTotal,
    bestTotal,
    changeInTotal: currentTotal != null && bestTotal != null ? roundLoad(currentTotal - bestTotal) : null,
    unit,
  };
}

function strengthPrFromRecord(record: PersonalRecordItem): StrengthPrItem {
  return {
    id: record.id,
    type: record.type as StrengthPrType,
    exerciseName: record.exerciseName,
    value: record.value,
    unit: record.unit,
    reps: record.reps,
    date: record.date,
  };
}

export function calculateStrengthTrend(evidence: Array<Pick<StrengthSetEvidence, "e1rm" | "completedAt">>): StrengthTrend {
  if (evidence.length < 2) return "stable";
  const sorted = [...evidence].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
  const midpoint = Math.max(1, Math.floor(sorted.length / 2));
  const early = bestE1rm(sorted.slice(0, midpoint));
  const late = bestE1rm(sorted.slice(midpoint));
  if (early == null || late == null) return "stable";
  const change = late - early;
  if (change >= 2.5) return "up";
  if (change <= -2.5) return "down";
  return "stable";
}

function entriesWithinDays<T extends { completedAt: string }>(entries: T[], now: string, days: number): T[] {
  const threshold = new Date(now).getTime() - days * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => new Date(entry.completedAt).getTime() >= threshold);
}

function entriesBeforeDays<T extends { completedAt: string }>(entries: T[], now: string, days: number): T[] {
  const threshold = new Date(now).getTime() - days * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => new Date(entry.completedAt).getTime() < threshold);
}

function bestE1rm(entries: Array<Pick<StrengthSetEvidence, "e1rm">>): number | null {
  if (entries.length === 0) return null;
  return roundLoad(Math.max(...entries.map((entry) => entry.e1rm)));
}

function latestE1rm(entries: StrengthSetEvidence[]): number | null {
  return entries.at(-1)?.e1rm ?? null;
}

function evidenceLabelForBest(entries: StrengthSetEvidence[], e1rm: number): string {
  const match = entries.find((entry) => entry.e1rm === e1rm) ?? entries.at(-1);
  if (!match) return "No completed work sets yet.";
  return `${match.load}${match.unit} x ${match.reps}`;
}

function roundLoad(value: number): number {
  return Math.round(value * 10) / 10;
}
