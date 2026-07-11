import type { BlockType } from "@/domain/training/annual-models";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { CardioEase, CardioSessionKind, ExperienceLevel, WorkoutHistorySummary } from "@/domain/training/models";
import type { EventPhase } from "@/domain/training/event-taper";
import { normalizeTrainingSetupGoal, type RecoveryCardioPreference, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { TrainingGapStatus } from "@/domain/training/training-gap-adjustment";

export type CardioDoseAction = "start" | "hold" | "add_duration" | "add_session" | "reduce" | "pause";
export type CardioIntensityCategory = CardioEase;

export interface CardioDoseInput {
  goal?: TrainingSetupGoal | null;
  block?: BlockType | null;
  recoveryCardioPreference?: RecoveryCardioPreference;
  currentWeeklyCardioSessions?: WorkoutHistorySummary[];
  recentLiftingFatigueClassification?: FatigueClassifierResult | null;
  extraLiftingWorkload?: number;
  trainingGapStatus?: TrainingGapStatus | null;
  eventTaperPhase?: EventPhase | null;
  experienceLevel?: ExperienceLevel | null;
}

export interface CardioDoseRecommendation {
  recommendedWeeklyFrequency: { min: number; max: number };
  recommendedDurationRange: { min: number; max: number };
  recommendedIntensityCategory: CardioIntensityCategory;
  suggestedSessionType?: CardioSessionKind;
  progressionAction: CardioDoseAction;
  reason: string;
  evidence: string[];
}

export function resolveCardioDose(input: CardioDoseInput): CardioDoseRecommendation {
  const preference = input.recoveryCardioPreference ?? "recommended";
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const recentCardio = input.currentWeeklyCardioSessions ?? [];
  const cardioCount = recentCardio.length;
  const hardCardioCount = recentCardio.filter(isHardCardio).length;
  const fatigue = input.recentLiftingFatigueClassification;
  const systemicFatigue = fatigue?.classification === "systemic" || fatigue?.classification === "mixed";
  const highFatigue = fatigue?.severity === "high" || systemicFatigue || (input.extraLiftingWorkload ?? 0) >= 3;
  const tapering = input.eventTaperPhase === "taper" || input.eventTaperPhase === "event_week" || input.block === "peak";

  if (preference === "off") {
    return {
      recommendedWeeklyFrequency: { min: 0, max: 0 },
      recommendedDurationRange: { min: 0, max: 0 },
      recommendedIntensityCategory: "easy",
      progressionAction: "pause",
      reason: "Recovery & Cardio is off, so user-facing cardio dose suggestions are suppressed.",
      evidence: ["Cardio preference: off."],
    };
  }

  const base = baseDoseForGoal(goal, input.experienceLevel, input.eventTaperPhase);

  if (preference === "minimal" && !highFatigue && goal !== "athletic_performance") {
    return {
      ...base,
      recommendedWeeklyFrequency: { min: 0, max: Math.min(1, base.recommendedWeeklyFrequency.max) },
      progressionAction: "hold",
      reason: "Minimal mode waits until recovery or workload clearly asks for cardio.",
      evidence: ["Cardio preference: minimal.", `${cardioCount} recent cardio session${cardioCount === 1 ? "" : "s"}.`],
    };
  }

  if (tapering) {
    return {
      ...base,
      suggestedSessionType: "recovery_cardio",
      recommendedWeeklyFrequency: { min: 1, max: Math.min(2, base.recommendedWeeklyFrequency.max) },
      recommendedIntensityCategory: "easy",
      progressionAction: hardCardioCount > 0 ? "reduce" : "hold",
      reason: "Event and peak work need low fatigue. Keep conditioning easy.",
      evidence: ["Taper/peak context suppresses hard conditioning.", `${hardCardioCount} hard cardio session${hardCardioCount === 1 ? "" : "s"} found recently.`],
    };
  }

  if (highFatigue) {
    return {
      ...base,
      suggestedSessionType: "recovery_cardio",
      recommendedWeeklyFrequency: { min: 1, max: Math.min(2, base.recommendedWeeklyFrequency.max) },
      recommendedIntensityCategory: "easy",
      progressionAction: hardCardioCount > 0 ? "reduce" : "hold",
      reason: "Hold cardio dose. Lifting stress is already high.",
      evidence: [
        fatigue ? `Fatigue signal: ${fatigue.classification.replaceAll("_", " ")} (${fatigue.severity}).` : "Extra lifting workload is high.",
        hardCardioCount > 0 ? `${hardCardioCount} hard cardio session${hardCardioCount === 1 ? "" : "s"} added stress.` : "Recovery cardio stays low fatigue.",
      ],
    };
  }

  if (cardioCount === 0) {
    return {
      ...base,
      recommendedWeeklyFrequency: { min: Math.min(base.recommendedWeeklyFrequency.min, 2), max: Math.min(base.recommendedWeeklyFrequency.max, 2) },
      recommendedDurationRange: { min: Math.min(base.recommendedDurationRange.min, 20), max: Math.min(base.recommendedDurationRange.max, 20) },
      progressionAction: "start",
      reason: "Start low. Build the engine without hijacking the lifting plan.",
      evidence: ["No recent cardio sessions logged.", "Dose starts conservatively."],
    };
  }

  const averageDuration = averageCardioDuration(recentCardio);
  if (averageDuration < base.recommendedDurationRange.max && cardioCount >= base.recommendedWeeklyFrequency.min) {
    return {
      ...base,
      progressionAction: "add_duration",
      reason: "Add a little duration before adding more sessions.",
      evidence: [`Average cardio duration is ${averageDuration} minutes.`, "Duration progresses before frequency."],
    };
  }

  if (cardioCount < base.recommendedWeeklyFrequency.max) {
    return {
      ...base,
      progressionAction: "add_session",
      reason: "Cardio dose is tolerated. Add one session before making anything harder.",
      evidence: [`${cardioCount} recent cardio session${cardioCount === 1 ? "" : "s"} logged.`, "Frequency cap remains conservative."],
    };
  }

  return {
    ...base,
    progressionAction: "hold",
    reason: "Cardio dose is in the useful range. Keep it recoverable.",
    evidence: [`${cardioCount} recent cardio session${cardioCount === 1 ? "" : "s"} logged.`, "More lifting is not always the answer."],
  };
}

function baseDoseForGoal(goal?: TrainingSetupGoal | null, experienceLevel?: ExperienceLevel | null, eventTaperPhase?: EventPhase | null): CardioDoseRecommendation {
  goal = goal ? normalizeTrainingSetupGoal(goal) : undefined;
  if (goal === "athletic_performance") {
    return base("performance_conditioning", { min: 3, max: experienceLevel === "beginner" ? 4 : 5 }, { min: 20, max: 35 }, "moderate", "Athletic goals can use more conditioning when lifting fatigue is controlled.");
  }
  if (goal === "powerlifting_meet") {
    return base("recovery_cardio", { min: 1, max: 3 }, { min: 15, max: 25 }, "easy", "Powerlifting meet prep favours recovery cardio so squat, bench, and deadlift stay sharp.");
  }
  if (goal === "build_strength") {
    return base("recovery_cardio", { min: 2, max: 3 }, { min: 15, max: 25 }, "easy", "Strength work gets enough easy conditioning to recover better without stealing heavy output.");
  }
  if (goal === "build_muscle_and_strength") {
    return base("recovery_cardio", { min: 2, max: 4 }, { min: 20, max: 30 }, "easy", "Recovery and capacity support both sides of the plan.");
  }
  if (goal === "get_leaner") {
    return base("recovery_cardio", { min: 2, max: 4 }, { min: 20, max: 35 }, "easy", "Lose Fat uses easy cardio to support recovery capacity while preserving lifting output.");
  }
  return base("recovery_cardio", { min: 2, max: 4 }, { min: 20, max: 30 }, "easy", "Muscle-building cardio stays mostly recovery-focused.");
}

function base(
  suggestedSessionType: CardioSessionKind,
  recommendedWeeklyFrequency: { min: number; max: number },
  recommendedDurationRange: { min: number; max: number },
  recommendedIntensityCategory: CardioIntensityCategory,
  reason: string,
): CardioDoseRecommendation {
  return {
    suggestedSessionType,
    recommendedWeeklyFrequency,
    recommendedDurationRange,
    recommendedIntensityCategory,
    progressionAction: "hold",
    reason,
    evidence: [],
  };
}

function isHardCardio(workout: WorkoutHistorySummary): boolean {
  return workout.cardioLog?.perceivedEase === "hard" || workout.sessionKind === "performance_conditioning";
}

function averageCardioDuration(workouts: WorkoutHistorySummary[]): number {
  if (workouts.length === 0) return 0;
  const total = workouts.reduce((sum, workout) => sum + (workout.cardioLog?.durationMinutes ?? workout.durationMinutes), 0);
  return Math.round(total / workouts.length);
}
