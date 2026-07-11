import type { WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { displayWorkoutName } from "@/domain/training/workout-name";

export function resolveRecommendedSessionIndex({
  activePlan,
  history,
  date = new Date(),
}: {
  activePlan: ActiveTrainingPlan;
  history: WorkoutHistorySummary[];
  date?: Date;
}): number {
  const split = sessionRolesForPlan(activePlan);
  if (split.length === 0) return 0;

  const completed = completedPlanSessionIndexes({ activePlan, split, history, date });
  for (let index = 0; index < split.length; index += 1) {
    if (!completed.has(index)) return index;
  }

  return 0;
}

export function hasCompletedAllPlanSessionsThisWeek({
  activePlan,
  history,
  date = new Date(),
}: {
  activePlan: ActiveTrainingPlan;
  history: WorkoutHistorySummary[];
  date?: Date;
}): boolean {
  const split = sessionRolesForPlan(activePlan);
  if (split.length === 0) return false;
  return completedPlanSessionIndexes({ activePlan, split, history, date }).size >= split.length;
}

export function shouldAdvanceTrainingWeekAfterCompletedSession({
  activePlan,
  completedSession,
  history,
  date = completedSession.completedAt ? new Date(completedSession.completedAt) : new Date(),
}: {
  activePlan: ActiveTrainingPlan;
  completedSession: WorkoutSession;
  history: WorkoutHistorySummary[];
  date?: Date;
}): boolean {
  if (!completedSession.completedAt || completedSession.sessionKind !== "planned") return false;
  const currentBlock = activePlan.blocks.find((block) => block.id === activePlan.activeBlockId);
  if (!currentBlock) return false;
  if (completedSession.planBlockId !== currentBlock.id || completedSession.planWeekNumber !== currentBlock.currentWeek) return false;

  return hasCompletedAllPlanSessionsThisWeek({ activePlan, history, date });
}

export function resolveSelectedSessionIndex({
  activePlan,
  history,
  selectedSessionIndex,
  date = new Date(),
}: {
  activePlan: ActiveTrainingPlan;
  history: WorkoutHistorySummary[];
  selectedSessionIndex?: number | null;
  date?: Date;
}): number {
  const split = sessionRolesForPlan(activePlan);
  if (split.length === 0) return 0;
  if (typeof selectedSessionIndex === "number" && selectedSessionIndex >= 0 && selectedSessionIndex < split.length) {
    return selectedSessionIndex;
  }
  return resolveRecommendedSessionIndex({ activePlan, history, date });
}

export function completedPlanSessionIndexes({
  activePlan,
  split,
  history,
  date = new Date(),
}: {
  activePlan: ActiveTrainingPlan;
  split: string[];
  history: WorkoutHistorySummary[];
  date?: Date;
}): Set<number> {
  const completed = new Set<number>();
  const currentBlock = activePlan.blocks.find((block) => block.id === activePlan.activeBlockId) ?? activePlan.blocks[0] ?? null;
  const currentWeekNumber = currentBlock?.currentWeek ?? 1;

  for (const summary of history) {
    if (!isPlannedSessionSummary(summary)) continue;
    if (!matchesCurrentTrainingWeek(summary, activePlan.activeBlockId, currentWeekNumber, date)) continue;
    if (typeof summary.planSessionIndex === "number" && summary.planSessionIndex >= 0 && summary.planSessionIndex < split.length) {
      completed.add(summary.planSessionIndex);
      continue;
    }

    const label = displayWorkoutName(summary.sessionName).toLowerCase();
    const fallbackIndex = split.findIndex((workout, index) => !completed.has(index) && label.includes(workout.toLowerCase()));
    if (fallbackIndex >= 0) completed.add(fallbackIndex);
  }

  return completed;
}

export function isPlannedSessionSummary(summary: WorkoutHistorySummary): boolean {
  if (summary.cardioLog) return false;
  if (summary.sessionKind && summary.sessionKind !== "planned") return false;
  if (!summary.sessionKind && /^(ai|extra)\b/i.test(summary.sessionName.trim())) return false;
  return true;
}

export function matchesCurrentTrainingWeek(
  summary: WorkoutHistorySummary,
  activeBlockId: string,
  currentWeekNumber: number,
  date = new Date(),
): boolean {
  const hasTrainingWeekIdentity = Boolean(summary.planBlockId) || typeof summary.planWeekNumber === "number";
  if (hasTrainingWeekIdentity) {
    return summary.planBlockId === activeBlockId && summary.planWeekNumber === currentWeekNumber;
  }

  return isLegacyCurrentCalendarWeek(summary.completedAt, date);
}

function isLegacyCurrentCalendarWeek(completedAtIso: string, date: Date): boolean {
  const completedAt = new Date(completedAtIso);
  const weekStart = startOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return completedAt >= weekStart && completedAt < weekEnd;
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}
