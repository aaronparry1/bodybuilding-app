import type { Exercise, ExerciseHistorySummary, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";

export interface MuscleVolumeTarget {
  min: number;
  max: number;
}

export interface MuscleGroupVolume {
  muscleGroup: MuscleGroup;
  sets: number;
  target: MuscleVolumeTarget;
  status: "undertrained" | "productive" | "excessive";
}

export interface ExerciseAnalytics {
  exerciseId: string;
  exerciseName: string;
  frequency: number;
  totalSets: number;
  progressionRate: number;
  loadTrend: number[];
  bestSetTrend: number[];
  progressionEarnedHistory: boolean[];
  lastFiveSessions: ExerciseHistorySummary[];
  currentRecommendedLoad: number | null;
  isStalled: boolean;
}

export interface AnalyticsDashboard {
  weeklyVolume: number;
  previousWeeklyVolume: number;
  weeklyVolumeChangePercent: number;
  estimatedVolumeLoad: number;
  setsPerMuscleGroup: MuscleGroupVolume[];
  hardSetsPerExercise: Record<string, number>;
  exerciseFrequency: Record<string, number>;
  recentPrs: ExerciseHistorySummary[];
  stalledExercises: ExerciseAnalytics[];
  musclesUndertrainedThisWeek: MuscleGroupVolume[];
  musclesOvertrainedThisWeek: MuscleGroupVolume[];
  missedSessions: number;
  programmeAdherence: number;
  insights: string[];
}

export const defaultMuscleVolumeTargets: Record<MuscleGroup, MuscleVolumeTarget> = {
  chest: { min: 8, max: 20 },
  back: { min: 10, max: 22 },
  shoulders: { min: 8, max: 20 },
  biceps: { min: 6, max: 16 },
  triceps: { min: 6, max: 16 },
  quads: { min: 8, max: 20 },
  hamstrings: { min: 6, max: 16 },
  glutes: { min: 6, max: 18 },
  calves: { min: 6, max: 16 },
  abs: { min: 4, max: 14 },
  forearms: { min: 0, max: 12 },
  traps: { min: 2, max: 12 },
  rear_delts: { min: 4, max: 16 },
  adductors: { min: 2, max: 12 },
  abductors: { min: 2, max: 12 },
};

function startOfWeek(date = new Date()): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function inRange(date: string, from: Date, to: Date): boolean {
  const time = new Date(date).getTime();
  return time >= from.getTime() && time < to.getTime();
}

function getExercise(exercises: Exercise[], exerciseId: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === exerciseId);
}

export function getWeeklySessions(history: WorkoutHistorySummary[], referenceDate = new Date()): WorkoutHistorySummary[] {
  const from = startOfWeek(referenceDate);
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  return history.filter((summary) => inRange(summary.completedAt, from, to));
}

export function calculateWeeklyTrainingVolume(history: WorkoutHistorySummary[], referenceDate = new Date()): number {
  return getWeeklySessions(history, referenceDate).reduce((sum, summary) => sum + summary.setsCompleted, 0);
}

export function calculateEstimatedVolumeLoad(history: WorkoutHistorySummary[]): number {
  return history.reduce((sum, summary) => sum + summary.totalLoadVolume, 0);
}

export function calculateSetsPerMuscleGroup(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  referenceDate = new Date(),
  targets = defaultMuscleVolumeTargets,
): MuscleGroupVolume[] {
  const weeklySessions = getWeeklySessions(history, referenceDate);
  const setsByMuscle = new Map<MuscleGroup, number>();

  for (const summary of weeklySessions) {
    for (const exerciseSummary of summary.exerciseSummaries) {
      const exercise = getExercise(exercises, exerciseSummary.exerciseId);
      const muscles = exercise?.primaryMuscles ?? [];
      for (const muscle of muscles) {
        setsByMuscle.set(muscle, (setsByMuscle.get(muscle) ?? 0) + exerciseSummary.setsCompleted);
      }
    }
  }

  return Object.entries(targets).map(([muscleGroup, target]) => {
    const sets = setsByMuscle.get(muscleGroup as MuscleGroup) ?? 0;
    return {
      muscleGroup: muscleGroup as MuscleGroup,
      sets,
      target,
      status: sets < target.min ? "undertrained" : sets > target.max ? "excessive" : "productive",
    };
  });
}

export function calculateHardSetsPerExercise(history: WorkoutHistorySummary[]): Record<string, number> {
  return history.reduce<Record<string, number>>((acc, summary) => {
    for (const exercise of summary.exerciseSummaries) {
      acc[exercise.exerciseId] = (acc[exercise.exerciseId] ?? 0) + exercise.setsCompleted;
    }
    return acc;
  }, {});
}

export function calculateExerciseFrequency(history: WorkoutHistorySummary[]): Record<string, number> {
  return history.reduce<Record<string, number>>((acc, summary) => {
    for (const exercise of summary.exerciseSummaries) {
      acc[exercise.exerciseId] = (acc[exercise.exerciseId] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export function getExerciseAnalytics(history: WorkoutHistorySummary[], exerciseId: string): ExerciseAnalytics | null {
  const entries = history
    .flatMap((summary) => summary.exerciseSummaries.filter((exercise) => exercise.exerciseId === exerciseId))
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());

  if (entries.length === 0) return null;

  const progressionWins = entries.filter((entry) => entry.progressionEarned).length;
  const lastThree = entries.slice(-3);
  const isStalled = lastThree.length >= 3 && lastThree.every((entry) => !entry.progressionEarned);

  return {
    exerciseId,
    exerciseName: entries.at(-1)?.exerciseName ?? exerciseId,
    frequency: entries.length,
    totalSets: entries.reduce((sum, entry) => sum + entry.setsCompleted, 0),
    progressionRate: progressionWins / entries.length,
    loadTrend: entries.map((entry) => entry.load),
    bestSetTrend: entries.map((entry) => entry.bestSetReps),
    progressionEarnedHistory: entries.map((entry) => entry.progressionEarned),
    lastFiveSessions: entries.slice(-5).reverse(),
    currentRecommendedLoad: entries.at(-1)?.nextRecommendedLoad ?? null,
    isStalled,
  };
}

export function getRecentPrs(history: WorkoutHistorySummary[], limit = 5): ExerciseHistorySummary[] {
  return history
    .flatMap((summary) => summary.exerciseSummaries)
    .filter((exercise) => exercise.progressionEarned)
    .sort((a, b) => new Date(b.completedAt ?? "").getTime() - new Date(a.completedAt ?? "").getTime())
    .slice(0, limit);
}

export function calculateMissedSessions(history: WorkoutHistorySummary[], plannedDaysPerWeek: number, referenceDate = new Date()): number {
  const completedThisWeek = new Set(getWeeklySessions(history, referenceDate).map((summary) => summary.sessionId)).size;
  return Math.max(0, plannedDaysPerWeek - completedThisWeek);
}

export function calculateProgrammeAdherence(history: WorkoutHistorySummary[], plannedDaysPerWeek: number, referenceDate = new Date()): number {
  if (plannedDaysPerWeek <= 0) return 1;
  const completedThisWeek = getWeeklySessions(history, referenceDate).length;
  return Math.min(1, completedThisWeek / plannedDaysPerWeek);
}

export function buildAnalyticsDashboard(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  plannedDaysPerWeek = 4,
  referenceDate = new Date(),
): AnalyticsDashboard {
  const currentWeekVolume = calculateWeeklyTrainingVolume(history, referenceDate);
  const previousReference = new Date(referenceDate);
  previousReference.setDate(previousReference.getDate() - 7);
  const previousWeekVolume = calculateWeeklyTrainingVolume(history, previousReference);
  const weeklyVolumeChangePercent =
    previousWeekVolume === 0 ? (currentWeekVolume > 0 ? 100 : 0) : Math.round(((currentWeekVolume - previousWeekVolume) / previousWeekVolume) * 100);
  const setsPerMuscleGroup = calculateSetsPerMuscleGroup(history, exercises, referenceDate);
  const hardSetsPerExercise = calculateHardSetsPerExercise(history);
  const exerciseFrequency = calculateExerciseFrequency(history);
  const exerciseAnalytics = Object.keys(exerciseFrequency)
    .map((exerciseId) => getExerciseAnalytics(history, exerciseId))
    .filter((analytics): analytics is ExerciseAnalytics => Boolean(analytics));
  const stalledExercises = exerciseAnalytics.filter((analytics) => analytics.isStalled);
  const musclesUndertrainedThisWeek = setsPerMuscleGroup.filter((volume) => volume.status === "undertrained");
  const musclesOvertrainedThisWeek = setsPerMuscleGroup.filter((volume) => volume.status === "excessive");
  const recentPrs = getRecentPrs(history);
  const missedSessions = calculateMissedSessions(history, plannedDaysPerWeek, referenceDate);
  const programmeAdherence = calculateProgrammeAdherence(history, plannedDaysPerWeek, referenceDate);

  return {
    weeklyVolume: currentWeekVolume,
    previousWeeklyVolume: previousWeekVolume,
    weeklyVolumeChangePercent,
    estimatedVolumeLoad: calculateEstimatedVolumeLoad(getWeeklySessions(history, referenceDate)),
    setsPerMuscleGroup,
    hardSetsPerExercise,
    exerciseFrequency,
    recentPrs,
    stalledExercises,
    musclesUndertrainedThisWeek,
    musclesOvertrainedThisWeek,
    missedSessions,
    programmeAdherence,
    insights: buildCoachingInsights({
      weeklyVolumeChangePercent,
      setsPerMuscleGroup,
      stalledExercises,
      recentPrs,
      programmeAdherence,
    }),
  };
}

function buildCoachingInsights({
  weeklyVolumeChangePercent,
  setsPerMuscleGroup,
  stalledExercises,
  recentPrs,
  programmeAdherence,
}: Pick<AnalyticsDashboard, "weeklyVolumeChangePercent" | "setsPerMuscleGroup" | "stalledExercises" | "recentPrs" | "programmeAdherence">): string[] {
  const insights: string[] = [];
  const chest = setsPerMuscleGroup.find((volume) => volume.muscleGroup === "chest");
  const back = setsPerMuscleGroup.find((volume) => volume.muscleGroup === "back");
  const neglected = setsPerMuscleGroup.find((volume) => volume.status === "undertrained" && volume.target.min > 0);

  if (weeklyVolumeChangePercent !== 0) {
    insights.push(`Training volume is ${weeklyVolumeChangePercent > 0 ? "up" : "down"} ${Math.abs(weeklyVolumeChangePercent)}% this week.`);
  }
  if (chest && chest.sets > chest.target.min) {
    insights.push(`Chest volume is in a productive range at ${chest.sets} sets.`);
  }
  if (neglected) {
    insights.push(`${titleMuscle(neglected.muscleGroup)} is under target this week. Do not let it become folklore.`);
  }
  if (back?.status === "productive") {
    insights.push("Back volume is consistent. Big lat energy.");
  }
  if (stalledExercises.length > 0) {
    insights.push(`${stalledExercises[0].exerciseName} has stalled for 3 sessions. Consider holding load next time.`);
  }
  if (recentPrs.length > 0) {
    insights.push(`${recentPrs[0].exerciseName} earned progression recently. Nice objective win.`);
  }
  if (programmeAdherence < 0.75) {
    insights.push("Adherence is below target this week. Fewer heroic plans, more completed sessions.");
  }

  return insights.slice(0, 5);
}

export function titleMuscle(muscle: MuscleGroup): string {
  return muscle.charAt(0).toUpperCase() + muscle.slice(1);
}
