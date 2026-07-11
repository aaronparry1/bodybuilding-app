import type { WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { resolveCurrentPlanningInput } from "@/domain/training/current-planning-input";
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
  const split = sessionRolesForCurrentPlanning(activePlan);
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
  const split = sessionRolesForCurrentPlanning(activePlan);
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
  const currentMesocycleId = activePlan.currentMesocycleId;
  const currentMicrocycleNumber = activePlan.currentMicrocycle?.sequenceNumber;
  const hasCurrentIdentity = Boolean(currentMesocycleId) && typeof currentMicrocycleNumber === "number";
  if (hasCurrentIdentity) {
    if (completedSession.planMesocycleId !== currentMesocycleId || completedSession.planMicrocycleNumber !== currentMicrocycleNumber) return false;
  } else if (!matchesLegacyPlanningCompatibility(completedSession, activePlan)) {
    return false;
  }

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
  const split = sessionRolesForCurrentPlanning(activePlan);
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
  const currentMesocycleId = activePlan.currentMesocycleId;
  const currentMicrocycleNumber = activePlan.currentMicrocycle?.sequenceNumber;

  for (const summary of history) {
    if (!isPlannedSessionSummary(summary)) continue;
    if (!matchesCurrentPlanningCycle(summary, activePlan, currentMesocycleId, currentMicrocycleNumber, date)) continue;
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

export function matchesCurrentPlanningCycle(
  summary: WorkoutHistorySummary,
  activePlan: ActiveTrainingPlan,
  currentMesocycleId: string | undefined,
  currentMicrocycleNumber: number | undefined,
  date = new Date(),
): boolean {
  const hasCurrentPlanningIdentity = Boolean(summary.planMesocycleId) || typeof summary.planMicrocycleNumber === "number";
  if (hasCurrentPlanningIdentity) {
    return summary.planMesocycleId === currentMesocycleId && summary.planMicrocycleNumber === currentMicrocycleNumber;
  }

  if (matchesLegacyPlanningCompatibility(summary, activePlan)) return true;
  return isLegacyCurrentCalendarWeek(summary.completedAt, date);
}

function matchesLegacyPlanningCompatibility(summary: Pick<WorkoutHistorySummary, "planBlockId" | "planWeekNumber">, activePlan: ActiveTrainingPlan): boolean {
  if (!summary.planBlockId || typeof summary.planWeekNumber !== "number") return false;
  const activeBlock = activePlan.blocks.find((block) => block.id === activePlan.activeBlockId);
  return activeBlock?.id === summary.planBlockId && activeBlock.currentWeek === summary.planWeekNumber;
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

function sessionRolesForCurrentPlanning(activePlan: ActiveTrainingPlan): string[] {
  const resolved = resolveCurrentPlanningInput(activePlan, 0);
  if (resolved.status === "ready") return resolved.planning.microcycle.sessionRoles;
  // Compatibility-only: older persisted plans may not yet have a microcycle.
  return sessionRolesForPlan(activePlan);
}
