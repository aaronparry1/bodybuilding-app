import type { ExperienceLevel } from "@/domain/training/models";
import type { UserProgrammeFrameworkId } from "@/domain/training/programme-framework-rules";
import type { TrainingCommitmentType } from "@/domain/training/training-commitment";
import type { TrainingDaysPerWeek } from "@/domain/training/training-frequency";
import type { TrainingGoalId } from "@/domain/training/training-goals";

export type CoachingPriorConfidence = "very_low" | "low" | "medium" | "high" | "very_high";
export type CoachingPriorSource = "user_input" | "coach_estimate" | "observed_performance" | "future_response_model";

export type CoachingPriorId =
  | "training_experience"
  | "training_goal"
  | "training_days"
  | "preferred_framework"
  | "training_commitment";

export interface CoachingPrior<TValue = string | number> {
  id: CoachingPriorId;
  value: TValue;
  source: CoachingPriorSource;
  confidence: CoachingPriorConfidence;
  isUserPreference: boolean;
  canBeUpdatedFromEvidence: boolean;
}

export interface CreateInitialCoachingPriorsInput {
  trainingExperience: ExperienceLevel;
  trainingGoal: TrainingGoalId;
  trainingDays: TrainingDaysPerWeek;
  preferredFramework: UserProgrammeFrameworkId;
  trainingCommitment: TrainingCommitmentType;
}

export type InitialCoachingPrior =
  | CoachingPrior<ExperienceLevel>
  | CoachingPrior<TrainingGoalId>
  | CoachingPrior<TrainingDaysPerWeek>
  | CoachingPrior<UserProgrammeFrameworkId>
  | CoachingPrior<TrainingCommitmentType>;

export function createInitialCoachingPriors(input: CreateInitialCoachingPriorsInput): InitialCoachingPrior[] {
  return [
    {
      id: "training_experience",
      value: input.trainingExperience,
      source: "user_input",
      confidence: "medium",
      isUserPreference: false,
      canBeUpdatedFromEvidence: true,
    },
    {
      id: "training_goal",
      value: input.trainingGoal,
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    },
    {
      id: "training_days",
      value: input.trainingDays,
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    },
    {
      id: "preferred_framework",
      value: input.preferredFramework,
      source: "user_input",
      confidence: "high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    },
    {
      id: "training_commitment",
      value: input.trainingCommitment,
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    },
  ];
}
