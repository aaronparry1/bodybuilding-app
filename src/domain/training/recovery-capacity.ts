import type { BlockType } from "@/domain/training/annual-models";
import { resolveCardioDose, type CardioDoseRecommendation } from "@/domain/training/cardio-dose";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { ExperienceLevel, WorkoutHistorySummary } from "@/domain/training/models";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";
import { normalizeTrainingSetupGoal, type EventType, type RecoveryCardioPreference, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingGapStatus } from "@/domain/training/training-gap-adjustment";

export type RecoveryStatus = "insufficient_data" | "fresh" | "managed" | "strained" | "under_recovered";
export type CapacityStatus = "insufficient_data" | "solid" | "could_improve" | "low";
export type RecoveryCapacityRecommendationType =
  | "none"
  | "recovery_cardio"
  | "capacity_cardio"
  | "performance_conditioning";
export type RecoveryCapacitySessionType = Exclude<RecoveryCapacityRecommendationType, "none">;
export type RecoveryCapacityConfidence = "insufficient_data" | "low" | "medium" | "high";

export interface RecoveryCapacityInput {
  goal?: TrainingSetupGoal | null;
  block?: BlockType | null;
  eventType?: EventType | null;
  fatigueClassification?: FatigueClassifierResult | null;
  personalisedVolumeState?: PersonalisedVolumeResult[];
  extraSessionWorkload?: number;
  trainingGapStatus?: TrainingGapStatus | null;
  recoveryCardioPreference?: RecoveryCardioPreference;
  weeklyTrainingVolume?: number;
  experienceLevel?: ExperienceLevel | null;
  completedWorkouts?: WorkoutHistorySummary[];
}

export interface RecoveryCapacityResult {
  recoveryStatus: RecoveryStatus;
  capacityStatus: CapacityStatus;
  recommendation: RecoveryCapacityRecommendationType;
  suggestedSessionType?: RecoveryCapacitySessionType;
  frequencySuggestion?: string;
  message?: string;
  dose?: CardioDoseRecommendation;
  confidence: RecoveryCapacityConfidence;
  evidence: string[];
}

export function resolveRecoveryCapacity(input: RecoveryCapacityInput): RecoveryCapacityResult {
  const preference = input.recoveryCardioPreference ?? "recommended";
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const completedCount = input.completedWorkouts?.filter((workout) => Boolean(workout.completedAt)).length ?? 0;
  const weeklyVolume = input.weeklyTrainingVolume ?? estimateWeeklyVolume(input.completedWorkouts);
  const extraWorkload = input.extraSessionWorkload ?? countExtraSessions(input.completedWorkouts);
  const currentWeeklyCardioSessions = countRecentCardioSessions(input.completedWorkouts);
  const fatigue = input.fatigueClassification;
  const volumeSignals = input.personalisedVolumeState ?? [];
  const highCostMuscles = volumeSignals.filter((signal) => signal.status === "high_cost" || signal.status === "overreaching").length;
  const deloadOrGap =
    input.block === "deload" ||
    fatigue?.classification === "systemic" ||
    fatigue?.classification === "mixed" ||
    input.trainingGapStatus === "long_gap" ||
    input.trainingGapStatus === "extended_gap";
  const athleticGoal = goal === "athletic_performance" || input.eventType === "sport_season";
  const eventConditioningGoal = goal === "athletic_performance" && input.eventType === "sport_season";
  const strengthEvent = goal === "powerlifting_meet" || input.eventType === "powerlifting_meet";
  const highWorkload = weeklyVolume >= volumeThreshold(input.experienceLevel) || extraWorkload >= 2 || highCostMuscles > 0;
  const limitedEvidence = completedCount > 0 && completedCount < 3 && !fatigue;

  const recoveryStatus = recoveryStatusFor({ fatigue, highCostMuscles, extraWorkload, deloadOrGap, completedCount });
  const capacityStatus = capacityStatusFor({ goal, weeklyVolume, extraWorkload, fatigue, completedCount });

  const baseEvidence = [
    completedCount > 0 ? `${completedCount} completed workout${completedCount === 1 ? "" : "s"} analysed.` : "No completed workout history yet.",
    fatigue ? `Fatigue signal: ${fatigue.classification.replaceAll("_", " ")} (${fatigue.severity}).` : null,
    weeklyVolume > 0 ? `${weeklyVolume} recent work set${weeklyVolume === 1 ? "" : "s"} counted toward workload.` : null,
    extraWorkload > 0 ? `${extraWorkload} extra session${extraWorkload === 1 ? "" : "s"} counted as real workload.` : null,
    highCostMuscles > 0 ? `${highCostMuscles} muscle-volume signal${highCostMuscles === 1 ? "" : "s"} marked high-cost or overreaching.` : null,
    input.trainingGapStatus && input.trainingGapStatus !== "current" ? `Training-gap status: ${input.trainingGapStatus.replaceAll("_", " ")}.` : null,
  ].filter((item): item is string => Boolean(item));
  const cardioDose = resolveCardioDose({
    goal,
    block: input.block,
    recoveryCardioPreference: preference,
    currentWeeklyCardioSessions,
    recentLiftingFatigueClassification: fatigue,
    extraLiftingWorkload: extraWorkload,
    trainingGapStatus: input.trainingGapStatus,
    experienceLevel: input.experienceLevel,
  });

  if (preference === "off") {
    return {
      recoveryStatus,
      capacityStatus,
      recommendation: "none",
      dose: cardioDose,
      confidence: completedCount >= 3 ? "medium" : "low",
      evidence: [...baseEvidence, "Recovery & Cardio is off, so user-facing cardio suggestions are suppressed."],
    };
  }

  if (limitedEvidence && preference === "minimal") {
    return noRecommendation(recoveryStatus, capacityStatus, "Minimal mode waits for a clearer signal.", baseEvidence);
  }

  if (deloadOrGap || recoveryStatus === "under_recovered") {
    return recommendation({
      recoveryStatus,
      capacityStatus,
      recommendation: "recovery_cardio",
      message: input.trainingGapStatus === "extended_gap" ? "Ease back in. Recovery supports progress." : "Workload is climbing. Add recovery, not more lifting.",
      frequencySuggestion: doseFrequency(cardioDose),
      dose: cardioDose,
      confidence: fatigue?.confidence === "high" || input.trainingGapStatus === "extended_gap" ? "high" : "medium",
      evidence: baseEvidence,
    });
  }

  if (strengthEvent && highWorkload) {
    return recommendation({
      recoveryStatus,
      capacityStatus,
      recommendation: "recovery_cardio",
      message: "Keep recovery high while event work gets specific.",
      frequencySuggestion: doseFrequency(cardioDose),
      dose: cardioDose,
      confidence: "medium",
      evidence: baseEvidence,
    });
  }

  if (goal === "get_leaner") {
    if (preference === "minimal" && !highWorkload && recoveryStatus !== "strained") {
      return noRecommendation(recoveryStatus, capacityStatus, "Minimal mode keeps Lose Fat cardio prompts quiet until recovery or workload asks for them.", baseEvidence);
    }
    return recommendation({
      recoveryStatus,
      capacityStatus,
      recommendation: "recovery_cardio",
      message: highWorkload ? "Preserve the work. Add recovery, not more lifting." : "Two easy walks this week would support the cut without stealing from lifting.",
      frequencySuggestion: doseFrequency(cardioDose),
      dose: cardioDose,
      confidence: completedCount >= 3 ? "medium" : "low",
      evidence: baseEvidence,
    });
  }

  if (athleticGoal || eventConditioningGoal) {
    if (preference === "minimal" && !highWorkload && capacityStatus !== "low") {
      return noRecommendation(recoveryStatus, capacityStatus, "Minimal mode is holding cardio prompts until workload or capacity clearly asks for it.", baseEvidence);
    }
    return recommendation({
      recoveryStatus,
      capacityStatus,
      recommendation: highWorkload ? "capacity_cardio" : "performance_conditioning",
      message: highWorkload ? "Build your engine without adding junk volume." : "Build your engine.",
      frequencySuggestion: doseFrequency(cardioDose),
      dose: cardioDose,
      confidence: completedCount >= 3 ? "medium" : "low",
      evidence: baseEvidence,
    });
  }

  if (highWorkload || capacityStatus === "low") {
    if (preference === "minimal" && recoveryStatus !== "strained" && highCostMuscles === 0) {
      return noRecommendation(recoveryStatus, capacityStatus, "Minimal mode reduced this to evidence only.", baseEvidence);
    }
    const isMuscleAndStrength = goal === "build_muscle_and_strength";
    return recommendation({
      recoveryStatus,
      capacityStatus,
      recommendation: isMuscleAndStrength && recoveryStatus !== "strained" ? "capacity_cardio" : "recovery_cardio",
      message: isMuscleAndStrength ? "Work capacity helps you recover from the work that matters." : "Two easy walks this week would help.",
      frequencySuggestion: doseFrequency(cardioDose),
      dose: cardioDose,
      confidence: completedCount >= 3 ? "medium" : "low",
      evidence: baseEvidence,
    });
  }

  return noRecommendation(recoveryStatus, capacityStatus, "Recovery capacity is currently managed. Keep lifting the main thing.", baseEvidence);
}

function recommendation(options: {
  recoveryStatus: RecoveryStatus;
  capacityStatus: CapacityStatus;
  recommendation: RecoveryCapacitySessionType;
  message: string;
  frequencySuggestion: string;
  dose?: CardioDoseRecommendation;
  confidence: RecoveryCapacityConfidence;
  evidence: string[];
}): RecoveryCapacityResult {
  return {
    recoveryStatus: options.recoveryStatus,
    capacityStatus: options.capacityStatus,
    recommendation: options.recommendation,
    suggestedSessionType: options.recommendation,
    frequencySuggestion: options.frequencySuggestion,
    message: options.message,
    dose: options.dose,
    confidence: options.confidence,
    evidence: [...options.evidence, options.dose?.reason, laneEvidence(options.recommendation), "Cardio is treated as recovery and capacity work for the lifting plan."].filter((item): item is string => Boolean(item)).slice(0, 8),
  };
}

function noRecommendation(recoveryStatus: RecoveryStatus, capacityStatus: CapacityStatus, reason: string, evidence: string[]): RecoveryCapacityResult {
  return {
    recoveryStatus,
    capacityStatus,
    recommendation: "none",
    confidence: evidence.length >= 3 ? "medium" : "low",
    evidence: [...evidence, reason].slice(0, 7),
  };
}

function recoveryStatusFor(input: {
  fatigue?: FatigueClassifierResult | null;
  highCostMuscles: number;
  extraWorkload: number;
  deloadOrGap: boolean;
  completedCount: number;
}): RecoveryStatus {
  if (input.completedCount === 0) return "insufficient_data";
  if (input.fatigue?.severity === "high" || input.deloadOrGap) return "under_recovered";
  if (input.fatigue?.severity === "moderate" || input.highCostMuscles > 0 || input.extraWorkload >= 3) return "strained";
  if (input.completedCount < 3) return "managed";
  return "fresh";
}

function capacityStatusFor(input: {
  goal?: TrainingSetupGoal | null;
  weeklyVolume: number;
  extraWorkload: number;
  fatigue?: FatigueClassifierResult | null;
  completedCount: number;
}): CapacityStatus {
  if (input.completedCount === 0) return "insufficient_data";
  if (input.fatigue?.severity === "high") return "low";
  if (input.goal === "athletic_performance" && input.completedCount < 4) return "could_improve";
  if (input.weeklyVolume >= 28 || input.extraWorkload >= 3) return "could_improve";
  return "solid";
}

function volumeThreshold(experienceLevel?: ExperienceLevel | null): number {
  if (experienceLevel === "beginner") return 18;
  if (experienceLevel === "advanced") return 30;
  return 24;
}

function estimateWeeklyVolume(history?: WorkoutHistorySummary[]): number {
  return (history ?? []).slice(0, 4).reduce((sum, workout) => sum + Math.max(0, workout.setsCompleted), 0);
}

function countExtraSessions(history?: WorkoutHistorySummary[]): number {
  return (history ?? [])
    .slice(0, 6)
    .filter((workout) => workout.sessionKind && workout.sessionKind !== "planned" && !workout.cardioLog).length;
}

function countRecentCardioSessions(history?: WorkoutHistorySummary[]): WorkoutHistorySummary[] {
  return (history ?? []).slice(0, 8).filter((workout) => Boolean(workout.cardioLog));
}

function doseFrequency(dose: CardioDoseRecommendation): string {
  const frequency =
    dose.recommendedWeeklyFrequency.min === dose.recommendedWeeklyFrequency.max
      ? `${dose.recommendedWeeklyFrequency.max} session${dose.recommendedWeeklyFrequency.max === 1 ? "" : "s"}`
      : `${dose.recommendedWeeklyFrequency.min}-${dose.recommendedWeeklyFrequency.max} sessions`;
  const duration =
    dose.recommendedDurationRange.min === dose.recommendedDurationRange.max
      ? `${dose.recommendedDurationRange.max} min`
      : `${dose.recommendedDurationRange.min}-${dose.recommendedDurationRange.max} min`;
  return `${frequency} x ${duration} ${dose.recommendedIntensityCategory} cardio this week.`;
}

function laneEvidence(lane: RecoveryCapacitySessionType): string {
  if (lane === "recovery_cardio") return "Suggested lane: Recovery Cardio - easy walk, easy bike, incline walk, or easy rower.";
  if (lane === "capacity_cardio") return "Suggested lane: Capacity Cardio - tempo row, sled pushes, assault bike intervals, or moderate conditioning.";
  return "Suggested lane: Performance Conditioning - event or sport-relevant conditioning.";
}
