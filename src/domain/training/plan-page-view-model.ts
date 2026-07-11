import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import { displayBlockName, displayBlockType, displayPlanStyle, totalPlanWeeks } from "@/domain/training/block-display";
import { currentPlanDayIndex } from "@/domain/training/planned-workout";
import type { MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import { getApprovedNextMesocycleStates, weeklySplitForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { createPlanningContext } from "@/domain/training/planning-context";
import { mesocycleById, type MesocycleId, type MesocycleSpec } from "@/domain/training/mesocycle-library";
import type { WorkoutSession } from "@/domain/training/models";
import { displayNameForTrainingSetupGoal } from "@/domain/training/training-goals";

export type RoadmapStatus = "done" | "current" | "upcoming";

export interface CurrentPlanMicrocycle {
  number: MicrocyclePlan["sequenceNumber"];
  priority: MicrocyclePlan["priority"];
}

export interface ApprovedNextMesocycle {
  id: MesocycleId;
  purpose: MesocycleSpec["adaptation"];
}

export interface PlanPageViewModel {
  hasActivePlan: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  setupHref: string;
  createSessionHref: string;
  editPlanHref: string;
  libraryHref: string;
  summary: {
    goal: string;
    planStyle: string;
    schedule: string;
    split: string;
    currentPhase: string;
    week: string;
    planDuration: string;
    currentDay: string;
  };
  currentMesocyclePurpose: string | null;
  currentMicrocycle: CurrentPlanMicrocycle | null;
  currentSessionRole: string | null;
  approvedNextMesocycles: ApprovedNextMesocycle[];
  openPlannedWorkout: WorkoutSession | null;
  thisWeek: Array<{
    label: string;
    status: "current" | "upcoming";
  }>;
  roadmap: Array<{
    id: string;
    label: string;
    type: BlockType;
    status: RoadmapStatus;
    displayStatus: "Complete" | "Current" | "Next" | "Later";
    purpose: string;
    duration: string;
  }>;
  roadmapSummary: {
    title: string;
    currentPhase: string;
    goal: string;
    copy: string;
  };
  roadmapStages: Array<{
    id: string;
    title: string;
    focus: string;
    blocks: PlanPageViewModel["roadmap"];
  }>;
}

export function buildPlanPageViewModel({
  activePlan,
  currentBlock,
  workouts = [],
  date = new Date(),
}: {
  activePlan: ActiveTrainingPlan | null;
  currentBlock?: TrainingBlock | null;
  workouts?: WorkoutSession[];
  date?: Date;
}): PlanPageViewModel {
  const setupHref = "/(protected)/onboarding";
  const createSessionHref = "/(protected)/programmes/ai";
  const editPlanHref = "/(protected)/settings";
  const libraryHref = "/(protected)/(tabs)/library";

  if (!activePlan) {
    return {
      hasActivePlan: false,
      emptyTitle: "Set up your training plan",
      emptyMessage: "Choose your goal, schedule, and starting block before Plan has anything useful to show.",
      setupHref,
      createSessionHref,
      editPlanHref,
      libraryHref,
      summary: {
        goal: "-",
        planStyle: "-",
        schedule: "-",
        split: "-",
        currentPhase: "-",
        week: "-",
        planDuration: "-",
        currentDay: "-",
      },
      currentMesocyclePurpose: null,
      currentMicrocycle: null,
      currentSessionRole: null,
      approvedNextMesocycles: [],
      openPlannedWorkout: null,
      thisWeek: [],
      roadmap: [],
      roadmapSummary: {
        title: "Your training year",
        currentPhase: "-",
        goal: "-",
        copy: "Set up your plan to see the journey.",
      },
      roadmapStages: [],
    };
  }

  const activeBlock = resolveActiveBlock(activePlan, currentBlock);
  const week = weeklySplitForPlan(activePlan.daysPerWeek, activePlan.preferredSplit);
  const currentDayIndex = currentPlanDayIndex(activePlan, date);
  const roadmap = buildRoadmap(activePlan, activeBlock);
  const activeIndex = roadmap.findIndex((block) => block.status === "current");
  const goal = titleValue(activePlan.goal);
  const openPlannedWorkout = selectOpenPlannedWorkout(workouts);
  const planning = createPlanningContext(activePlan, openPlannedWorkout);
  const approvedNextMesocycles = getApprovedNextMesocycleStates(activePlan).flatMap((id): ApprovedNextMesocycle[] => {
    const mesocycle = mesocycleById(id);
    return mesocycle ? [{ id, purpose: mesocycle.adaptation }] : [];
  });

  return {
    hasActivePlan: true,
    setupHref,
    createSessionHref,
    editPlanHref,
    libraryHref,
    summary: {
      goal,
      planStyle: displayPlanStyle(activePlan),
      schedule: `${activePlan.daysPerWeek} days / week`,
      split: titleValue(activePlan.preferredSplit),
      currentPhase: planning.mesocyclePurpose,
      week: planning.microcycle ? `Microcycle ${planning.microcycle.number}` : "Current training week",
      planDuration: `${totalPlanWeeks(activePlan)} weeks`,
      currentDay: week[currentDayIndex] ?? week[0] ?? "-",
    },
    currentMesocyclePurpose: activePlan.currentMesocycleId ? planning.mesocyclePurpose : null,
    currentMicrocycle: planning.microcycle,
    currentSessionRole: activePlan.currentMicrocycle ? planning.sessionRole : null,
    approvedNextMesocycles,
    openPlannedWorkout,
    thisWeek: week.map((label, index) => ({
      label,
      status: index === currentDayIndex ? "current" : "upcoming",
    })),
    roadmap,
    roadmapSummary: {
      title: "Your training year",
      currentPhase: planning.mesocyclePurpose,
      goal,
      copy: roadmapJourneyCopy(activePlan.goal),
    },
    roadmapStages: buildRoadmapStages(roadmap),
  };
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

function resolveActiveBlock(activePlan: ActiveTrainingPlan, currentBlock?: TrainingBlock | null): TrainingBlock | null {
  return activePlan.blocks.find((block) => block.id === activePlan.activeBlockId) ?? activePlan.blocks.find((block) => block.type === currentBlock?.type) ?? activePlan.blocks[0] ?? null;
}

function buildRoadmap(activePlan: ActiveTrainingPlan, activeBlock: TrainingBlock | null): PlanPageViewModel["roadmap"] {
  const activeIndex = Math.max(
    0,
    activePlan.blocks.findIndex((block) => block.id === activePlan.activeBlockId || block.id === activeBlock?.id),
  );

  const statuses = activePlan.blocks.map((block, index) =>
    block.status === "completed" || index < activeIndex ? "done" : block.status === "active" || index === activeIndex ? "current" : "upcoming",
  );
  const nextIndex = statuses.findIndex((status, index) => status === "upcoming" && index > activeIndex);

  return activePlan.blocks.map((block, index) => {
    const status = statuses[index] ?? "upcoming";
    return {
      id: block.id,
      label: displayBlockName(block),
      type: block.type,
      status,
      displayStatus: status === "done" ? "Complete" : status === "current" ? "Current" : index === nextIndex ? "Next" : "Later",
      purpose: blockPurpose(block.type),
      duration: `${block.durationWeeks} ${block.durationWeeks === 1 ? "week" : "weeks"}`,
    };
  });
}

function buildRoadmapStages(roadmap: PlanPageViewModel["roadmap"]): PlanPageViewModel["roadmapStages"] {
  const stageSize = 3;
  const stages: PlanPageViewModel["roadmapStages"] = [];

  for (let index = 0; index < roadmap.length; index += stageSize) {
    const blocks = roadmap.slice(index, index + stageSize);
    stages.push({
      id: `stage-${stages.length + 1}`,
      title: stageTitle(blocks, stages.length),
      focus: stageFocus(blocks),
      blocks,
    });
  }

  return stages;
}

function stageTitle(blocks: PlanPageViewModel["roadmap"], index: number): string {
  if (blocks.some((block) => block.type === "power" || block.type === "peak")) return `Stage ${index + 1} - Perform`;
  if (blocks.some((block) => block.type === "strength")) return `Stage ${index + 1} - Strength`;
  if (blocks.some((block) => block.type === "powerbuilding")) return `Stage ${index + 1} - Build`;
  if (blocks.some((block) => block.type === "deload")) return `Stage ${index + 1} - Recover`;
  return `Stage ${index + 1} - Base`;
}

function stageFocus(blocks: PlanPageViewModel["roadmap"]): string {
  const labels = blocks.map((block) => block.label).join(" · ");
  if (blocks.some((block) => block.status === "current")) return `Current focus: ${labels}`;
  if (blocks.some((block) => block.type === "deload")) return `Planned path: ${labels}`;
  return `Next focus: ${labels}`;
}

function blockPurpose(type: BlockType): string {
  switch (type) {
    case "hypertrophy":
      return "Build muscle and work capacity.";
    case "powerbuilding":
    case "strength_hypertrophy":
      return "Bridge muscle into heavier strength work.";
    case "strength":
      return "Drive main lift performance.";
    case "power":
      return "Move fast and keep output sharp.";
    case "peak":
      return "Express strength with lower fatigue.";
    case "deload":
      return "Reduce fatigue and keep progress moving.";
    default:
      return "Keep the plan moving.";
  }
}

function roadmapJourneyCopy(goal: ActiveTrainingPlan["goal"]): string {
  switch (goal) {
    case "build_muscle":
      return "Build muscle first, then manage fatigue so progress keeps compounding.";
    case "build_strength":
      return "Build the base, sharpen the main lifts, and recover before the next push.";
    case "build_muscle_and_strength":
      return "Build muscle first, then turn it into stronger performance.";
    case "get_leaner":
      return "Keep strength and muscle supported while fatigue stays under control.";
    case "athletic_performance":
      return "Build strength, convert it into power, and keep recovery in the plan.";
    case "powerlifting_meet":
      return "Build the lifts, peak with specificity, and protect readiness for meet day.";
    default:
      return "Progress through focused phases while the app adjusts the dose.";
  }
}

function titleValue(value: string): string {
  const goalName = displayNameForTrainingSetupGoal(value);
  if (goalName) return goalName;
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
