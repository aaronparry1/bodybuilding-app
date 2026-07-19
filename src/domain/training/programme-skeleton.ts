import type { ExperienceLevel, UnitSystem } from "@/domain/training/models";
import {
  createEventPlanSkeleton,
  type EventPlanSkeleton,
  type EventPlanTrainingPhase,
  type EventPlanWarning,
} from "@/domain/training/event-planning";
import {
  buildWeeklySessionSequence,
  getCustomerFrameworksForFrequency,
  getRecommendedCustomerFramework,
  type ProgrammeFrameworkGoal,
  type ProgrammeFrameworkId,
  type ProgrammeFrameworkSessionType,
  type UserProgrammeFrameworkId,
} from "@/domain/training/programme-framework-rules";
import type { PreferredSplit, RecoveryCardioPreference, TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingCommitment, TrainingCommitmentType, TrainingEventType } from "@/domain/training/training-commitment";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export type ProgrammeSkeletonTrainingGoal = TrainingGoalId | TrainingSetupGoal;
export type ProgrammeSkeletonFrameworkPreference = UserProgrammeFrameworkId | PreferredSplit | ProgrammeFrameworkId;
export type ProgrammeSkeletonCommitmentInput =
  | TrainingCommitment
  | {
      commitmentType: TrainingCommitmentType;
      eventType?: TrainingEventType;
      targetDate?: string;
    };

export type ProgrammeSkeletonMacroMode = "rolling" | "fixed_deadline";
export type ProgrammeSkeletonBlockFocus =
  | "hypertrophy_accumulation"
  | "strength_accumulation"
  | "hypertrophy_strength_foundation"
  | "general_preparation"
  | "performance_preservation"
  | EventPlanTrainingPhase
  | "planning_required";
export type ProgrammeSkeletonTrainingPhase = "accumulation" | "preparation" | EventPlanTrainingPhase | "planning_required";
type ContinuousProgrammeSkeletonBlockFocus =
  | "hypertrophy_accumulation"
  | "strength_accumulation"
  | "hypertrophy_strength_foundation"
  | "general_preparation"
  | "performance_preservation";

export interface ProgrammeSkeletonInput {
  trainingGoal: ProgrammeSkeletonTrainingGoal;
  trainingCommitment: ProgrammeSkeletonCommitmentInput;
  trainingDaysPerWeek: number;
  frameworkPreference: ProgrammeSkeletonFrameworkPreference;
  trainingExperience: ExperienceLevel;
  cardioPreference: RecoveryCardioPreference;
  unitsPreference: UnitSystem;
  createdAt?: string;
}

export interface ProgrammeSkeleton {
  programmeId: string;
  goal: TrainingGoalId;
  commitmentMode: ProgrammeSkeletonMacroMode;
  framework: ProgrammeFrameworkId;
  macroGoal: string;
  currentBlock: CurrentBlock;
  currentWeek: number;
  scheduledSessions: ScheduledSession[];
  eventPlan?: EventPlanSkeleton;
  planningRequired?: boolean;
  warnings?: EventPlanWarning[];
  createdAt: string;
  version: 1;
  preferences: {
    trainingExperience: ExperienceLevel;
    cardioPreference: RecoveryCardioPreference;
    unitsPreference: UnitSystem;
  };
}

export interface CurrentBlock {
  blockNumber: number;
  blockFocus: ProgrammeSkeletonBlockFocus;
  blockPurpose: string;
  trainingPhase: ProgrammeSkeletonTrainingPhase;
  plannedWeeks: number;
  reviewAfterWeeks: number;
  confidence: number;
}

export interface ScheduledSession {
  weekNumber: number;
  sessionIndex: number;
  sessionType: ProgrammeFrameworkSessionType;
  sessionRole: string;
  isCompleted: boolean;
}

const blockFocusByGoal: Record<TrainingGoalId, ContinuousProgrammeSkeletonBlockFocus> = {
  build_muscle: "hypertrophy_accumulation",
  get_stronger: "strength_accumulation",
  build_muscle_strength: "hypertrophy_strength_foundation",
  athletic_performance: "general_preparation",
  lose_fat: "performance_preservation",
};

const blockPurposeByFocus: Record<ContinuousProgrammeSkeletonBlockFocus, string> = {
  hypertrophy_accumulation: "Build a recoverable base of quality muscle-building work.",
  strength_accumulation: "Establish repeatable strength practice before heavier intensification.",
  hypertrophy_strength_foundation: "Build muscle and strength support without pushing both aggressively at once.",
  general_preparation: "Develop strength, power readiness, and movement quality.",
  performance_preservation: "Preserve strength and muscle while managing fatigue.",
};

const frameworkGoalByTrainingGoal: Record<TrainingGoalId, ProgrammeFrameworkGoal> = {
  build_muscle: "hypertrophy",
  get_stronger: "strength",
  build_muscle_strength: "build_muscle_strength",
  athletic_performance: "athletic_performance",
  lose_fat: "get_lean",
};

const frameworkPreferenceMap: Record<string, ProgrammeFrameworkId | "asc_recommended"> = {
  asc_recommended: "asc_recommended",
  let_app_choose: "asc_recommended",
  push_pull_legs: "push_pull_legs",
  upper_lower: "upper_lower",
  full_body: "full_body",
  body_part_split: "chest_back_shoulders_arms_legs",
  chest_back_shoulders_arms_legs: "chest_back_shoulders_arms_legs",
  bench_squat_deadlift: "bench_squat_deadlift",
};

export function createProgrammeSkeleton(input: ProgrammeSkeletonInput): ProgrammeSkeleton {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const goal = normalizeProgrammeSkeletonGoal(input.trainingGoal);
  const commitmentMode = resolveCommitmentMode(input.trainingCommitment);
  const eventPlan = commitmentTypeOf(input.trainingCommitment) === "event_driven"
    ? createEventPlanSkeleton({
        trainingGoal: goal,
        eventType: eventTypeOf(input.trainingCommitment) ?? "custom",
        targetDate: targetDateOf(input.trainingCommitment) ?? "",
        startDate: createdAt,
        trainingDaysPerWeek: input.trainingDaysPerWeek,
        trainingExperience: input.trainingExperience,
      })
    : undefined;
  const framework = resolveProgrammeSkeletonFramework({
    goal,
    sessionsPerWeek: input.trainingDaysPerWeek,
    frameworkPreference: input.frameworkPreference,
  });
  const focus = blockFocusByGoal[goal];
  const currentBlock = eventPlan ? currentBlockForEventPlan(eventPlan, focus, goal) : currentBlockForFocus(focus, goal);
  const scheduledSessions = buildWeeklySessionSequence({
    goal: frameworkGoalByTrainingGoal[goal],
    framework,
    sessionsPerWeek: input.trainingDaysPerWeek,
  }).map((sessionType, index) => ({
    weekNumber: 1,
    sessionIndex: index + 1,
    sessionType,
    sessionRole: sessionRoleForSessionType(sessionType),
    isCompleted: false,
  }));

  return {
    programmeId: `programme-skeleton-${stableIdPart(goal)}-${stableIdPart(framework)}-${createdAt}`,
    goal,
    commitmentMode,
    framework,
    macroGoal: goal,
    currentBlock,
    currentWeek: 1,
    scheduledSessions,
    ...(eventPlan ? { eventPlan, planningRequired: eventPlan.requiresManualPlanning === true, warnings: eventPlan.warnings } : {}),
    createdAt,
    version: 1,
    preferences: {
      trainingExperience: input.trainingExperience,
      cardioPreference: input.cardioPreference,
      unitsPreference: input.unitsPreference,
    },
  };
}

export function normalizeProgrammeSkeletonGoal(goal: ProgrammeSkeletonTrainingGoal): TrainingGoalId {
  if (goal === "build_strength" || goal === "powerlifting_meet") return "get_stronger";
  if (goal === "build_muscle_and_strength") return "build_muscle_strength";
  if (goal === "get_leaner") return "lose_fat";
  if (goal === "build_muscle" || goal === "get_stronger" || goal === "build_muscle_strength" || goal === "athletic_performance" || goal === "lose_fat") {
    return goal;
  }
  return "build_muscle";
}

export function resolveProgrammeSkeletonFramework({
  goal,
  sessionsPerWeek,
  frameworkPreference,
}: {
  goal: TrainingGoalId;
  sessionsPerWeek: number;
  frameworkPreference: ProgrammeSkeletonFrameworkPreference;
}): ProgrammeFrameworkId {
  const mapped = frameworkPreferenceMap[frameworkPreference];
  if (!mapped || mapped === "asc_recommended") return recommendedFrameworkForGoal(goal, sessionsPerWeek);

  if (
    (mapped === "full_body" || mapped === "upper_lower" || mapped === "push_pull_legs") &&
    !getCustomerFrameworksForFrequency(sessionsPerWeek).includes(mapped)
  ) return recommendedFrameworkForGoal(goal, sessionsPerWeek);

  const frameworkGoal = frameworkGoalByTrainingGoal[goal];
  try {
    buildWeeklySessionSequence({ goal: frameworkGoal, framework: mapped, sessionsPerWeek });
    return mapped;
  } catch {
    return recommendedFrameworkForGoal(goal, sessionsPerWeek);
  }
}

function recommendedFrameworkForGoal(goal: TrainingGoalId, sessionsPerWeek: number): ProgrammeFrameworkId {
  return getRecommendedCustomerFramework(goal, sessionsPerWeek) ?? "full_body";
}

function resolveCommitmentMode(commitment: ProgrammeSkeletonCommitmentInput): ProgrammeSkeletonMacroMode {
  if (commitmentTypeOf(commitment) === "event_driven" && targetDateOf(commitment)) return "fixed_deadline";
  return "rolling";
}

function currentBlockForFocus(focus: ContinuousProgrammeSkeletonBlockFocus, goal: TrainingGoalId): CurrentBlock {
  return {
    blockNumber: 1,
    blockFocus: focus,
    blockPurpose: blockPurposeByFocus[focus],
    trainingPhase: focus === "general_preparation" ? "preparation" : "accumulation",
    plannedWeeks: plannedWeeksForGoal(goal),
    reviewAfterWeeks: reviewAfterWeeksForGoal(goal),
    confidence: 82,
  };
}

function currentBlockForEventPlan(eventPlan: EventPlanSkeleton, fallbackFocus: ContinuousProgrammeSkeletonBlockFocus, goal: TrainingGoalId): CurrentBlock {
  if (eventPlan.currentPhase) {
    return {
      blockNumber: 1,
      blockFocus: eventPlan.currentPhase.trainingPhase,
      blockPurpose: eventPlan.currentPhase.objective,
      trainingPhase: eventPlan.currentPhase.trainingPhase,
      plannedWeeks: eventPlan.currentPhase.durationWeeks,
      reviewAfterWeeks: eventPlan.currentPhase.endWeek,
      confidence: eventPlan.confidence,
    };
  }

  return {
    ...currentBlockForFocus(fallbackFocus, goal),
    blockFocus: "planning_required",
    blockPurpose: "Event-specific planning is required before ASC can select a meet-prep phase.",
    trainingPhase: "planning_required",
    plannedWeeks: 0,
    reviewAfterWeeks: 0,
    confidence: eventPlan.confidence,
  };
}

function commitmentTypeOf(commitment: ProgrammeSkeletonCommitmentInput): TrainingCommitmentType {
  return commitment.commitmentType;
}

function targetDateOf(commitment: ProgrammeSkeletonCommitmentInput): string | undefined {
  return commitment.targetDate;
}

function eventTypeOf(commitment: ProgrammeSkeletonCommitmentInput): TrainingEventType | undefined {
  return "eventType" in commitment ? commitment.eventType : undefined;
}

function plannedWeeksForGoal(goal: TrainingGoalId): number {
  if (goal === "athletic_performance") return 4;
  if (goal === "get_stronger" || goal === "build_muscle_strength") return 5;
  return 6;
}

function reviewAfterWeeksForGoal(goal: TrainingGoalId): number {
  return goal === "athletic_performance" ? 4 : plannedWeeksForGoal(goal);
}

function sessionRoleForSessionType(sessionType: ProgrammeFrameworkSessionType): string {
  const roles: Record<ProgrammeFrameworkSessionType, string> = {
    push: "Pressing, chest, shoulders, and triceps",
    pull: "Back, pulling, and biceps",
    legs: "Knee and hinge lower-body work",
    upper: "Balanced upper-body stimulus",
    lower: "Balanced lower-body stimulus",
    full_body: "Key movement patterns in one session",
    chest_back: "Chest and back emphasis",
    shoulders_arms: "Shoulders and arms emphasis",
    chest: "Chest emphasis",
    back: "Back emphasis",
    shoulders: "Shoulder emphasis",
    arms: "Arm emphasis",
    upper_strength: "Upper-body strength support",
    lower_strength: "Lower-body strength support",
    bench: "Bench-specific strength",
    squat: "Squat-specific strength",
    deadlift: "Deadlift-specific strength",
    full_body_strength: "Full-body strength support",
  };
  return roles[sessionType];
}

function stableIdPart(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}
