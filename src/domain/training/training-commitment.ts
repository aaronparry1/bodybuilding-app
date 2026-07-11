import type { TrainingGoalId } from "@/domain/training/training-goals";

export type { TrainingGoalId } from "@/domain/training/training-goals";

export type TrainingCommitmentType = "continuous_development" | "event_driven";
export type TrainingEventType = "powerlifting_meet" | "athletic_event_or_season" | "physique_event" | "holiday_or_photoshoot" | "custom";
export type InternalPlanningMode = "continuous_development" | "event_driven";
export type MacrocycleConstraint = "rolling" | "fixed_deadline";

export interface TrainingCommitmentInput {
  goalId: TrainingGoalId;
  commitmentType: TrainingCommitmentType;
  eventType?: TrainingEventType;
  targetDate?: string;
}

export interface TrainingCommitment {
  commitmentType: TrainingCommitmentType;
  eventType?: TrainingEventType;
  targetDate?: string;
  userFacingSummary: string;
  internalPlanningMode: InternalPlanningMode;
  macrocycleConstraint: MacrocycleConstraint;
  requiresTargetDate: boolean;
  coachingSummary: string;
}

const eventLabels: Record<TrainingEventType, string> = {
  powerlifting_meet: "Powerlifting meet",
  athletic_event_or_season: "Athletic event or season",
  physique_event: "Physique event",
  holiday_or_photoshoot: "Holiday or photoshoot",
  custom: "Custom target",
};

const compatibleEventGoals: Record<TrainingEventType, TrainingGoalId[]> = {
  powerlifting_meet: ["get_stronger", "build_muscle_strength"],
  athletic_event_or_season: ["athletic_performance"],
  physique_event: ["build_muscle", "lose_fat"],
  holiday_or_photoshoot: ["build_muscle", "lose_fat"],
  custom: ["build_muscle", "get_stronger", "build_muscle_strength", "athletic_performance", "lose_fat"],
};

export function deriveTrainingCommitment(input: TrainingCommitmentInput): TrainingCommitment {
  if (input.commitmentType === "continuous_development") {
    return {
      commitmentType: "continuous_development",
      userFacingSummary: "No — I just want to keep improving.",
      internalPlanningMode: "continuous_development",
      macrocycleConstraint: "rolling",
      requiresTargetDate: false,
      coachingSummary: "Use a rolling plan. The coach decides macro, meso, and micro structure as evidence develops.",
    };
  }

  const eventType = input.eventType;
  const targetDate = input.targetDate?.trim();
  if (!eventType) throw new Error("Event-driven training requires an event type.");
  if (!targetDate) throw new Error("Event-driven training requires a target date.");
  if (!isTrainingEventTypeCompatibleWithGoal(input.goalId, eventType)) {
    throw new Error(`${eventLabels[eventType]} is not a supported target for ${input.goalId}.`);
  }

  return {
    commitmentType: "event_driven",
    eventType,
    targetDate,
    userFacingSummary: `Yes — ${eventLabels[eventType]} on ${targetDate}.`,
    internalPlanningMode: "event_driven",
    macrocycleConstraint: "fixed_deadline",
    requiresTargetDate: true,
    coachingSummary: "Use a fixed deadline. The coach works backward from the date without exposing macrocycle length choices.",
  };
}

export function isTrainingEventTypeCompatibleWithGoal(goalId: TrainingGoalId, eventType: TrainingEventType): boolean {
  return compatibleEventGoals[eventType].includes(goalId);
}

export function getCompatibleTrainingEventTypes(goalId: TrainingGoalId): TrainingEventType[] {
  return (Object.keys(compatibleEventGoals) as TrainingEventType[]).filter((eventType) => isTrainingEventTypeCompatibleWithGoal(goalId, eventType));
}

export function labelForTrainingEventType(eventType: TrainingEventType): string {
  return eventLabels[eventType];
}
