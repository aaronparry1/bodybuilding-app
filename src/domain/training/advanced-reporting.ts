import type { TrainingBlock } from "@/domain/training/annual-models";
import type { Exercise, MuscleGroup, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { buildRecoveryCapacityWeeklyTarget, type RecoveryCapacityWeeklyTarget } from "@/domain/training/recovery-capacity-delivery";
import { buildStrengthDashboard, type StrengthDashboard } from "@/domain/training/strength-dashboard";
import { startOfWeek } from "@/domain/training/training-session-selection";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";

export interface StrengthReport {
  title: "Strength Report";
  headline: string;
  keyMetric: string;
  detail: string;
  strongestLiftTrend: string;
  recentPrCount: number;
  details: string[];
}

export interface VolumeReport {
  title: "Volume Report";
  headline: string;
  keyMetric: string;
  detail: string;
  highestVolumeMuscles: string[];
  undertrainedMuscles: string[];
  details: string[];
}

export interface RecoveryCapacityReport {
  title: "Recovery & Capacity Report";
  headline: string;
  keyMetric: string;
  detail: string;
  details: string[];
}

export interface ConsistencyReport {
  title: "Consistency Report";
  headline: string;
  keyMetric: string;
  detail: string;
  workoutsThisWeek: number;
  plannedCompletedThisWeek: number;
  plannedTargetThisWeek: number;
  details: string[];
}

export interface AdvancedReports {
  strength: StrengthReport;
  volume: VolumeReport;
  recovery: RecoveryCapacityReport;
  consistency: ConsistencyReport;
}

export function buildAdvancedReports({
  sessions,
  history,
  exercises,
  activePlan,
  currentBlock,
  activeWorkout,
  date = new Date(),
}: {
  sessions: WorkoutSession[];
  history: WorkoutHistorySummary[];
  exercises: Exercise[];
  activePlan?: ActiveTrainingPlan | null;
  currentBlock?: TrainingBlock | null;
  activeWorkout?: WorkoutSession | null;
  date?: Date;
}): AdvancedReports {
  const strengthDashboard = buildStrengthDashboard({ sessions, goal: activePlan?.goal, now: date.toISOString() });
  const recoveryTarget = buildRecoveryCapacityWeeklyTarget({ activePlan, currentBlock, history, exercises, activeWorkout, date });
  return {
    strength: buildStrengthReport(strengthDashboard),
    volume: buildVolumeReport({ history, exercises, date }),
    recovery: buildRecoveryReport({ history, recoveryTarget, date }),
    consistency: buildConsistencyReport({ history, activePlan, date }),
  };
}

function buildStrengthReport(dashboard: StrengthDashboard): StrengthReport {
  const liftsWithData = dashboard.primaryLifts.filter((lift) => lift.currentE1rm != null);
  if (liftsWithData.length === 0) {
    return {
      title: "Strength Report",
      headline: "Strength data is building.",
      keyMetric: "No e1RM trend yet",
      detail: "Log completed work sets on the main lifts and this report will wake up.",
      strongestLiftTrend: "No trend yet",
      recentPrCount: 0,
      details: ["Bench, squat, deadlift, and standing press use conservative e1RM evidence."],
    };
  }

  const up = liftsWithData.filter((lift) => lift.trend === "up").length;
  const down = liftsWithData.filter((lift) => lift.trend === "down").length;
  const strongest = [...liftsWithData].sort((a, b) => (b.change30Day ?? -Infinity) - (a.change30Day ?? -Infinity))[0]!;
  const headline = up > down ? "Strength is trending up." : down > up ? "Strength has dipped recently." : "Strength is stable.";
  const thirtyDayTotal = liftsWithData.reduce((sum, lift) => sum + (lift.change30Day ?? 0), 0);
  const unit = liftsWithData[0]?.unit ?? "kg";

  return {
    title: "Strength Report",
    headline,
    keyMetric: `${formatSigned(thirtyDayTotal, unit)} over 30 days`,
    detail: dashboard.recentPrs.length > 0 ? `${dashboard.recentPrs.length} recent strength PR${dashboard.recentPrs.length === 1 ? "" : "s"} logged.` : "No recent PRs, but the trend still matters.",
    strongestLiftTrend: `${strongest.label}: ${trendLabel(strongest.trend)}${strongest.change30Day != null ? ` (${formatSigned(strongest.change30Day, strongest.unit)} 30d)` : ""}`,
    recentPrCount: dashboard.recentPrs.length,
    details: liftsWithData.map((lift) => `${lift.label}: ${trendLabel(lift.trend)} · 30d ${formatNullableSigned(lift.change30Day, lift.unit)} · 90d ${formatNullableSigned(lift.change90Day, lift.unit)}`),
  };
}

function buildVolumeReport({ history, exercises, date }: { history: WorkoutHistorySummary[]; exercises: Exercise[]; date: Date }): VolumeReport {
  const thisWeek = muscleSetsForWindow(history, exercises, startOfWeek(date), addDays(startOfWeek(date), 7));
  const previousWeekStart = addDays(startOfWeek(date), -7);
  const previousWeek = muscleSetsForWindow(history, exercises, previousWeekStart, startOfWeek(date));
  const fourWeekStart = addDays(startOfWeek(date), -28);
  const fourWeek = muscleSetsForWindow(history, exercises, fourWeekStart, addDays(startOfWeek(date), 7));
  const sortedCurrent = [...thisWeek.entries()].sort((a, b) => b[1] - a[1]);
  const highestVolumeMuscles = sortedCurrent.filter(([, sets]) => sets > 0).slice(0, 3).map(([muscle, sets]) => `${titleMuscle(muscle)} ${sets}`);
  const undertrainedMuscles = musclesWithRecentExposure(fourWeek)
    .filter((muscle) => (thisWeek.get(muscle) ?? 0) === 0)
    .slice(0, 3)
    .map(titleMuscle);
  const currentSets = sumMap(thisWeek);
  const previousSets = sumMap(previousWeek);
  const fourWeekAverage = Math.round(sumMap(fourWeek) / 4);
  const headline = currentSets === 0 ? "Volume data is building." : currentSets > previousSets ? "Productive volume is up this week." : currentSets < previousSets ? "Productive volume is down this week." : "Productive volume is stable.";

  return {
    title: "Volume Report",
    headline,
    keyMetric: `${currentSets} productive sets this week`,
    detail: `Previous week: ${previousSets}. Four-week average: ${fourWeekAverage}.`,
    highestVolumeMuscles,
    undertrainedMuscles,
    details: [
      highestVolumeMuscles.length > 0 ? `Highest volume: ${highestVolumeMuscles.join(", ")}.` : "No productive lifting sets this week yet.",
      undertrainedMuscles.length > 0 ? `${undertrainedMuscles.join(", ")} may need more consistent exposure.` : "No obvious muscle group gaps from recent exposure.",
    ],
  };
}

function buildRecoveryReport({ history, recoveryTarget, date }: { history: WorkoutHistorySummary[]; recoveryTarget?: RecoveryCapacityWeeklyTarget; date: Date }): RecoveryCapacityReport {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 7);
  const currentWeekCardio = history.filter((summary) => summary.cardioLog && inWindow(summary.completedAt, weekStart, weekEnd));
  const recoverySessions = currentWeekCardio.filter((summary) => summary.cardioLog?.sessionType === "recovery_cardio").length;
  const capacitySessions = currentWeekCardio.filter((summary) => summary.cardioLog?.sessionType === "capacity_cardio").length;
  const performanceSessions = currentWeekCardio.filter((summary) => summary.cardioLog?.sessionType === "performance_conditioning").length;

  if (!recoveryTarget) {
    return {
      title: "Recovery & Capacity Report",
      headline: "Recovery capacity evidence is still building.",
      keyMetric: `${currentWeekCardio.length} cardio sessions this week`,
      detail: "When the recommendation is confident enough, this report will show the weekly target.",
      details: [`Recovery: ${recoverySessions}`, `Capacity: ${capacitySessions}`, `Performance conditioning: ${performanceSessions}`],
    };
  }

  return {
    title: "Recovery & Capacity Report",
    headline: recoveryTarget.completedSessions >= recoveryTarget.targetSessions ? "Recovery target is on track." : "Recovery target is in progress.",
    keyMetric: `${recoveryTarget.completedSessions} / ${recoveryTarget.targetSessions} sessions completed`,
    detail:
      recoveryTarget.interference.verdict === "avoid"
        ? "Hard conditioning may interfere right now."
        : recoveryTarget.interference.verdict === "caution"
          ? "Cardio timing needs some care this week."
          : "Cardio is supporting the lifting plan.",
    details: [
      `Target: ${recoveryTarget.targetLabel}`,
      `Recovery sessions: ${recoverySessions}`,
      `Capacity sessions: ${capacitySessions}`,
      `Performance conditioning: ${performanceSessions}`,
      recoveryTarget.timingGuidance.avoidGuidance[0] ? `Avoid: ${recoveryTarget.timingGuidance.avoidGuidance[0]}` : "No major interference warning.",
    ],
  };
}

function buildConsistencyReport({ history, activePlan, date }: { history: WorkoutHistorySummary[]; activePlan?: ActiveTrainingPlan | null; date: Date }): ConsistencyReport {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 7);
  const currentWeek = history.filter((summary) => !summary.cardioLog && inWindow(summary.completedAt, weekStart, weekEnd));
  const planned = currentWeek.filter((summary) => summary.sessionKind === "planned");
  const plannedTarget = activePlan?.daysPerWeek ?? 0;
  const headline = currentWeek.length === 0 ? "Consistency data is building." : plannedTarget > 0 && planned.length >= plannedTarget ? "Planned training is on track." : "Consistency is building.";
  const missed = Math.max(0, plannedTarget - planned.length);

  return {
    title: "Consistency Report",
    headline,
    keyMetric: `${currentWeek.length} sessions completed this week`,
    detail: missed > 0 ? `${missed} planned session${missed === 1 ? "" : "s"} still available. Missed sessions happen. The plan adapts.` : "Current week completion looks good.",
    workoutsThisWeek: currentWeek.length,
    plannedCompletedThisWeek: planned.length,
    plannedTargetThisWeek: plannedTarget,
    details: [
      `Planned sessions: ${planned.length}/${plannedTarget || "not set"}`,
      `Extra lifting sessions: ${currentWeek.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned").length}`,
      "Cardio is tracked separately from lifting completion.",
    ],
  };
}

function muscleSetsForWindow(history: WorkoutHistorySummary[], exercises: Exercise[], start: Date, end: Date): Map<MuscleGroup, number> {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const sets = new Map<MuscleGroup, number>();
  for (const summary of history) {
    if (summary.cardioLog || !inWindow(summary.completedAt, start, end)) continue;
    for (const entry of summary.exerciseSummaries) {
      const exercise = exerciseById.get(entry.exerciseId);
      if (!exercise) continue;
      for (const muscle of exercise.primaryMuscles) {
        sets.set(muscle, (sets.get(muscle) ?? 0) + entry.qualitySets);
      }
    }
  }
  return sets;
}

function musclesWithRecentExposure(map: Map<MuscleGroup, number>): MuscleGroup[] {
  return [...map.entries()].filter(([, sets]) => sets > 0).map(([muscle]) => muscle);
}

function inWindow(completedAt: string, start: Date, end: Date): boolean {
  const time = new Date(completedAt).getTime();
  return time >= start.getTime() && time < end.getTime();
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sumMap(map: Map<unknown, number>): number {
  return [...map.values()].reduce((sum, value) => sum + value, 0);
}

function titleMuscle(muscle: MuscleGroup): string {
  return muscle.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function trendLabel(trend: "up" | "stable" | "down"): string {
  if (trend === "up") return "Up";
  if (trend === "down") return "Down";
  return "Stable";
}

function formatNullableSigned(value: number | null, unit: string): string {
  return value == null ? "No data" : formatSigned(value, unit);
}

function formatSigned(value: number, unit: string): string {
  if (value === 0) return `0${unit}`;
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${value > 0 ? "+" : ""}${formatted}${unit}`;
}
