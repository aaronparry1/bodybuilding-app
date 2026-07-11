import type { BlockType } from "@/domain/training/annual-models";
import type { ProgrammeFrameworkId } from "@/domain/training/programme-framework-rules";

export type TrainingGoalId =
  | "build_muscle"
  | "get_stronger"
  | "build_muscle_strength"
  | "athletic_performance"
  | "lose_fat";

export type InternalAdaptation =
  | "hypertrophy"
  | "maximal_strength"
  | "concurrent_strength_hypertrophy"
  | "athletic_performance"
  | "body_composition_preservation";

export interface TrainingGoal {
  id: TrainingGoalId;
  userDisplayName: string;
  internalAdaptation: InternalAdaptation;
  primaryObjective: string;
  secondaryObjectives: string[];
  coachingSummary: string;
  scientificSummary: string;
  supportedFrameworks: ProgrammeFrameworkId[];
  supportedTrainingPhases: BlockType[];
}

export const trainingGoals: readonly TrainingGoal[] = [
  {
    id: "build_muscle",
    userDisplayName: "Build Muscle",
    internalAdaptation: "hypertrophy",
    primaryObjective: "Increase quality muscle-building stimulus over time.",
    secondaryObjectives: ["Improve recoverable training volume", "Maintain useful strength exposure", "Preserve momentum and consistency"],
    coachingSummary: "Prioritise productive muscle stimulus without rewarding junk volume.",
    scientificSummary: "Hypertrophy is driven by sufficient mechanical tension, quality volume, proximity managed intelligently, and recoverable progression.",
    supportedFrameworks: ["push_pull_legs", "upper_lower", "full_body", "chest_back_shoulders_arms_legs"],
    supportedTrainingPhases: ["hypertrophy", "powerbuilding", "strength_hypertrophy", "deload"],
  },
  {
    id: "get_stronger",
    userDisplayName: "Get Stronger",
    internalAdaptation: "maximal_strength",
    primaryObjective: "Increase force production in key compound patterns.",
    secondaryObjectives: ["Build technical consistency", "Preserve enough muscle to support strength", "Manage fatigue around high-output work"],
    coachingSummary: "Protect strength-specific work and progress only when the athlete owns the load.",
    scientificSummary: "Maximal strength depends on specific practice, high-force exposure, technical repeatability, and fatigue management.",
    supportedFrameworks: ["bench_squat_deadlift", "push_pull_legs", "upper_lower", "full_body"],
    supportedTrainingPhases: ["hypertrophy", "strength_hypertrophy", "strength", "peak", "deload"],
  },
  {
    id: "build_muscle_strength",
    userDisplayName: "Build Muscle + Strength",
    internalAdaptation: "concurrent_strength_hypertrophy",
    primaryObjective: "Improve strength and muscle-building outcomes together.",
    secondaryObjectives: ["Coordinate load and volume stress", "Preserve heavy anchors", "Use accessories to support adaptation economically"],
    coachingSummary: "Balance heavy work and quality volume without pushing both aggressively at once.",
    scientificSummary: "Concurrent strength and hypertrophy work requires managing interference between high-load specificity and recoverable volume.",
    supportedFrameworks: ["bench_squat_deadlift", "push_pull_legs", "upper_lower", "full_body"],
    supportedTrainingPhases: ["hypertrophy", "powerbuilding", "strength_hypertrophy", "strength", "deload"],
  },
  {
    id: "athletic_performance",
    userDisplayName: "Athletic Performance",
    internalAdaptation: "athletic_performance",
    primaryObjective: "Improve force production, power quality, and movement readiness.",
    secondaryObjectives: ["Preserve strength support", "Keep fatigue low enough for output quality", "Avoid bodybuilding work that does not support performance"],
    coachingSummary: "Prioritise high-quality power and strength-support work over fatigue accumulation.",
    scientificSummary: "Athletic performance benefits from strength, power, skill quality, and fatigue control without unvalidated velocity claims.",
    supportedFrameworks: ["bench_squat_deadlift", "push_pull_legs", "upper_lower", "full_body"],
    supportedTrainingPhases: ["hypertrophy", "strength", "power", "peak", "deload"],
  },
  {
    id: "lose_fat",
    userDisplayName: "Lose Fat",
    internalAdaptation: "body_composition_preservation",
    primaryObjective: "Preserve muscle, strength, and training consistency while body composition changes.",
    secondaryObjectives: ["Control fatigue", "Maintain quality lifting output", "Support recovery capacity"],
    coachingSummary: "Coach training for muscle and strength preservation, not calorie-chasing fatigue.",
    scientificSummary: "Fat loss cannot be proven from training data alone; lifting should preserve lean mass and performance while external body-composition evidence provides context.",
    supportedFrameworks: ["push_pull_legs", "upper_lower", "full_body", "chest_back_shoulders_arms_legs"],
    supportedTrainingPhases: ["hypertrophy", "powerbuilding", "strength_hypertrophy", "deload"],
  },
] as const;

export const trainingGoalIds = trainingGoals.map((goal) => goal.id) as TrainingGoalId[];

const setupGoalDisplayNames: Record<string, string> = {
  build_muscle: "Build Muscle",
  build_strength: "Get Stronger",
  build_muscle_and_strength: "Build Muscle + Strength",
  athletic_performance: "Athletic Performance",
  get_leaner: "Lose Fat",
};

export function getTrainingGoal(id: TrainingGoalId): TrainingGoal {
  const goal = trainingGoals.find((item) => item.id === id);
  if (!goal) throw new Error(`Unsupported training goal: ${id}`);
  return goal;
}

export function isTrainingGoalId(value: string): value is TrainingGoalId {
  return trainingGoals.some((goal) => goal.id === value);
}

export function displayNameForTrainingSetupGoal(value: string): string | null {
  return setupGoalDisplayNames[value] ?? null;
}
