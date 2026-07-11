import type { ExperienceLevel } from "@/domain/training/models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingCommitmentType, TrainingEventType } from "@/domain/training/training-commitment";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export type InitialBlockStrategyTrainingGoal = TrainingGoalId | TrainingSetupGoal;
export type InitialBlockStrategyId =
  | "hypertrophy_accumulation"
  | "strength_accumulation"
  | "concurrent_development"
  | "general_physical_preparation"
  | "muscle_strength_preservation"
  | "event_planning_required";

export interface InitialBlockStrategyInput {
  trainingGoal: InitialBlockStrategyTrainingGoal;
  trainingCommitment: TrainingCommitmentType | { commitmentType: TrainingCommitmentType };
  eventType?: TrainingEventType;
  targetDate?: string;
  trainingExperience: ExperienceLevel;
}

export interface InitialBlockStrategy {
  blockStrategyId: InitialBlockStrategyId;
  displayName: string;
  coachingObjective: string;
  scientificRationale: string;
  expectedPrimaryAdaptation: string;
  expectedSecondaryAdaptation: string;
  plannedDurationWeeks: number;
  defaultDurationWeeks: number;
  reviewWeek: number;
  minimumReviewWeek: number;
  blockStatus: "active";
  reviewOutcome: null;
  confidence: number;
  requiresFurtherPlanning?: boolean;
}

const continuousDevelopmentStrategies: Record<TrainingGoalId, InitialBlockStrategy> = {
  build_muscle: {
    blockStrategyId: "hypertrophy_accumulation",
    displayName: "Hypertrophy Accumulation",
    coachingObjective: "Maximise muscle growth, improve work capacity, and begin learning athlete response.",
    scientificRationale: "A muscle-building goal should begin with enough recoverable quality volume to establish productive hypertrophy stimulus.",
    expectedPrimaryAdaptation: "hypertrophy",
    expectedSecondaryAdaptation: "work_capacity",
    plannedDurationWeeks: 5,
    defaultDurationWeeks: 5,
    reviewWeek: 4,
    minimumReviewWeek: 4,
    blockStatus: "active",
    reviewOutcome: null,
    confidence: 84,
  },
  get_stronger: {
    blockStrategyId: "strength_accumulation",
    displayName: "Strength Accumulation",
    coachingObjective: "Improve technical consistency, increase the strength base, and build future intensification capacity.",
    scientificRationale: "Strength improves best when specific practice and force exposure are built before heavier expression phases.",
    expectedPrimaryAdaptation: "maximal_strength",
    expectedSecondaryAdaptation: "technical_consistency",
    plannedDurationWeeks: 6,
    defaultDurationWeeks: 6,
    reviewWeek: 5,
    minimumReviewWeek: 5,
    blockStatus: "active",
    reviewOutcome: null,
    confidence: 84,
  },
  build_muscle_strength: {
    blockStrategyId: "concurrent_development",
    displayName: "Concurrent Development",
    coachingObjective: "Use hypertrophy-biased strength development while establishing athlete response.",
    scientificRationale: "Concurrent strength and hypertrophy work should build muscle and strength support without aggressively pushing both stressors at once.",
    expectedPrimaryAdaptation: "hypertrophy_strength",
    expectedSecondaryAdaptation: "athlete_response_baseline",
    plannedDurationWeeks: 5,
    defaultDurationWeeks: 5,
    reviewWeek: 4,
    minimumReviewWeek: 4,
    blockStatus: "active",
    reviewOutcome: null,
    confidence: 82,
  },
  athletic_performance: {
    blockStrategyId: "general_physical_preparation",
    displayName: "General Physical Preparation",
    coachingObjective: "Build movement quality, general strength, work capacity, and an athletic foundation.",
    scientificRationale: "Athletic performance needs a base of movement quality, force production, and recoverable capacity before more specific expression.",
    expectedPrimaryAdaptation: "general_preparation",
    expectedSecondaryAdaptation: "movement_quality",
    plannedDurationWeeks: 4,
    defaultDurationWeeks: 4,
    reviewWeek: 3,
    minimumReviewWeek: 3,
    blockStatus: "active",
    reviewOutcome: null,
    confidence: 80,
  },
  lose_fat: {
    blockStrategyId: "muscle_strength_preservation",
    displayName: "Muscle & Strength Preservation",
    coachingObjective: "Preserve lean mass, preserve strength, and manage recovery during fat loss.",
    scientificRationale: "During fat loss, training should protect muscle and strength while avoiding unnecessary fatigue that competes with recovery.",
    expectedPrimaryAdaptation: "muscle_retention",
    expectedSecondaryAdaptation: "strength_preservation",
    plannedDurationWeeks: 4,
    defaultDurationWeeks: 4,
    reviewWeek: 3,
    minimumReviewWeek: 3,
    blockStatus: "active",
    reviewOutcome: null,
    confidence: 80,
  },
};

export function decideInitialBlockStrategy(input: InitialBlockStrategyInput): InitialBlockStrategy {
  if (commitmentTypeOf(input.trainingCommitment) === "event_driven") {
    return {
      blockStrategyId: "event_planning_required",
      displayName: "Event Planning Required",
      coachingObjective: "Hold block strategy selection until event-specific planning rules are available.",
      scientificRationale: "A fixed-date event should not guess a peaking or preparation strategy without dedicated event logic.",
      expectedPrimaryAdaptation: "pending_event_planning",
      expectedSecondaryAdaptation: "risk_control",
      plannedDurationWeeks: 0,
      defaultDurationWeeks: 0,
      reviewWeek: 0,
      minimumReviewWeek: 0,
      blockStatus: "active",
      reviewOutcome: null,
      confidence: 72,
      requiresFurtherPlanning: true,
    };
  }

  return { ...continuousDevelopmentStrategies[normalizeInitialBlockStrategyGoal(input.trainingGoal)] };
}

export function normalizeInitialBlockStrategyGoal(goal: InitialBlockStrategyTrainingGoal): TrainingGoalId {
  if (goal === "build_strength" || goal === "powerlifting_meet") return "get_stronger";
  if (goal === "build_muscle_and_strength") return "build_muscle_strength";
  if (goal === "get_leaner") return "lose_fat";
  if (goal === "build_muscle" || goal === "get_stronger" || goal === "build_muscle_strength" || goal === "athletic_performance" || goal === "lose_fat") {
    return goal;
  }
  return "build_muscle";
}

function commitmentTypeOf(commitment: InitialBlockStrategyInput["trainingCommitment"]): TrainingCommitmentType {
  return typeof commitment === "string" ? commitment : commitment.commitmentType;
}
