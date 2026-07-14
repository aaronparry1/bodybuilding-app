import { readApprovedNextMesocycleStates, readCurrentPlanningInput } from "@/application/training/canonical-training-architecture";
import { mesocycleById, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { WorkoutSession } from "@/domain/training/models";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { displayNameForTrainingSetupGoal } from "@/domain/training/training-goals";

export type PlanPlanningStatus = "no_plan" | "ready" | "compatibility" | "incomplete";

export interface CurrentPlanMicrocycle {
  number: number;
  priority: string;
}

export interface ApprovedNextMesocycle {
  id: MesocycleId;
  purpose: MesocycleSpec["adaptation"];
}

export interface ExactTargetSummary {
  exerciseName: string;
  load: number;
  unit: string;
  targets: number[];
}

export interface PlanPageViewModel {
  status: PlanPlanningStatus;
  hasActivePlan: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  setupHref: string;
  editPlanHref: string;
  libraryHref: string;
  summary: {
    goal: string;
    macrocycle: string;
    schedule: string;
    split: string;
  };
  currentMesocyclePurpose: string | null;
  currentMicrocycle: CurrentPlanMicrocycle | null;
  currentSessionRole: string | null;
  approvedNextMesocycles: ApprovedNextMesocycle[];
  openPlannedWorkout: WorkoutSession | null;
  exactTargetSummary: ExactTargetSummary[];
  thisWeek: Array<{ label: string; status: "current" | "upcoming" }>;
}

export function buildPlanPageViewModel({
  activePlan,
  workouts = [],
}: {
  activePlan: ActiveTrainingPlan | null;
  workouts?: WorkoutSession[];
}): PlanPageViewModel {
  const setupHref = "/(protected)/onboarding";
  const editPlanHref = "/(protected)/settings";
  const libraryHref = "/(protected)/(tabs)/library";
  const emptySummary = { goal: "-", macrocycle: "-", schedule: "-", split: "-" };

  if (!activePlan) {
    return {
      status: "no_plan",
      hasActivePlan: false,
      emptyTitle: "Set up your training plan",
      emptyMessage: "Choose your goal and schedule before Plan has anything useful to show.",
      setupHref,
      editPlanHref,
      libraryHref,
      summary: emptySummary,
      currentMesocyclePurpose: null,
      currentMicrocycle: null,
      currentSessionRole: null,
      approvedNextMesocycles: [],
      openPlannedWorkout: null,
      exactTargetSummary: [],
      thisWeek: [],
    };
  }

  const openPlannedWorkout = selectOpenPlannedWorkout(workouts);
  const sessionIndex = openPlannedWorkout?.planSessionIndex ?? 0;
  const resolved = readCurrentPlanningInput(activePlan, sessionIndex);
  const planning = resolved.status === "ready" ? resolved.planning : null;
  const mesocycle = planning ? mesocycleById(planning.mesocycleId) : undefined;
  const status: PlanPlanningStatus = !planning ? "incomplete" : planning.source === "legacy_compatibility" ? "compatibility" : "ready";

  return {
    status,
    hasActivePlan: true,
    ...(status === "incomplete"
      ? {
          emptyTitle: "Plan details are being restored",
          emptyMessage: "Your saved plan needs current mesocycle and microcycle details before it can guide a new workout.",
        }
      : {}),
    setupHref,
    editPlanHref,
    libraryHref,
    summary: {
      goal: displayNameForTrainingSetupGoal(activePlan.goal) ?? titleValue(activePlan.goal),
      macrocycle: planning ? titleValue(planning.macrocycle) : "Unavailable",
      schedule: `${activePlan.daysPerWeek} days / week`,
      split: titleValue(activePlan.preferredSplit),
    },
    currentMesocyclePurpose: mesocycle?.adaptation ?? null,
    currentMicrocycle: planning ? { number: planning.microcycle.sequenceNumber, priority: planning.microcycle.priority } : null,
    currentSessionRole: planning?.sessionRole ?? null,
    approvedNextMesocycles: status === "ready" ? approvedMesocycles(activePlan) : [],
    openPlannedWorkout,
    exactTargetSummary: exactTargetSummary(openPlannedWorkout),
    thisWeek: planning
      ? planning.microcycle.sessionRoles.map((label, index) => ({ label, status: index === sessionIndex ? "current" : "upcoming" }))
      : [],
  };
}

function approvedMesocycles(activePlan: ActiveTrainingPlan): ApprovedNextMesocycle[] {
  return readApprovedNextMesocycleStates(activePlan).flatMap((id): ApprovedNextMesocycle[] => {
    const mesocycle = mesocycleById(id);
    return mesocycle ? [{ id, purpose: mesocycle.adaptation }] : [];
  });
}

function selectOpenPlannedWorkout(workouts: WorkoutSession[]): WorkoutSession | null {
  return workouts
    .filter((workout) => !workout.completedAt && workout.sessionKind === "planned")
    .sort(comparePlannedWorkoutOrder)[0] ?? null;
}

function comparePlannedWorkoutOrder(left: WorkoutSession, right: WorkoutSession): number {
  const sessionOrder = (left.planSessionIndex ?? Number.MAX_SAFE_INTEGER) - (right.planSessionIndex ?? Number.MAX_SAFE_INTEGER);
  if (sessionOrder !== 0) return sessionOrder;
  const startedAtOrder = left.startedAt.localeCompare(right.startedAt);
  return startedAtOrder !== 0 ? startedAtOrder : left.id.localeCompare(right.id);
}

function exactTargetSummary(workout: WorkoutSession | null): ExactTargetSummary[] {
  return (workout?.exercises ?? []).flatMap((exercise): ExactTargetSummary[] => {
    const targets = exercise.prescribedSetTargets ?? [];
    return targets.length ? [{ exerciseName: exercise.exerciseName, load: exercise.load, unit: exercise.settings.unit, targets: [...targets] }] : [];
  });
}

function titleValue(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
