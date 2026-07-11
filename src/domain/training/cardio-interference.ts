import type { BlockType } from "@/domain/training/annual-models";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { CardioEase, CardioModality, CardioSessionKind } from "@/domain/training/models";
import type { EventPhase } from "@/domain/training/event-taper";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";

export type CardioInterferenceVerdict = "allowed" | "caution" | "avoid";
export type LiftingContext =
  | "none"
  | "unknown"
  | "heavy_lower"
  | "deadlift_focused"
  | "squat_focused"
  | "heavy_upper"
  | "power_focused"
  | "peak_or_taper"
  | "event_week";

export interface CardioInterferenceInput {
  sessionType: CardioSessionKind;
  modality?: CardioModality;
  perceivedEase?: CardioEase;
  goal?: TrainingSetupGoal | null;
  block?: BlockType | null;
  nextLiftingContext?: LiftingContext;
  recentLiftingFatigue?: FatigueClassifierResult | null;
  eventTaperPhase?: EventPhase | null;
}

export interface CardioInterferenceResult {
  verdict: CardioInterferenceVerdict;
  reason: string;
  suggestedAlternative?: string;
}

const lowerBodyConditioning = new Set<CardioModality>(["run", "sled_push", "assault_bike", "rower", "ski_erg"]);

export function evaluateCardioInterference(input: CardioInterferenceInput): CardioInterferenceResult {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const ease = input.perceivedEase ?? defaultEaseFor(input.sessionType);
  const hard = ease === "hard" || input.sessionType === "performance_conditioning";
  const fatigue = input.recentLiftingFatigue;
  const fatigueHigh = fatigue?.severity === "high";
  const tapering =
    input.eventTaperPhase === "taper" ||
    input.eventTaperPhase === "event_week" ||
    input.block === "peak" ||
    input.nextLiftingContext === "peak_or_taper" ||
    input.nextLiftingContext === "event_week";
  const athleticPriority = goal === "athletic_performance";
  const meetPriority = goal === "powerlifting_meet";
  const lowerBodyHard = hard && Boolean(input.modality && lowerBodyConditioning.has(input.modality));

  if (input.sessionType === "recovery_cardio" && ease === "easy" && !fatigueHigh) {
    return { verdict: "allowed", reason: "Recovery Cardio is low fatigue and can sit around lifting more freely." };
  }

  if (tapering && hard) {
    return {
      verdict: "avoid",
      reason: input.nextLiftingContext === "event_week" ? "Meet week. Recovery only." : "Taper week. Recovery only.",
      suggestedAlternative: "Easy walk or easy bike.",
    };
  }

  if (meetPriority && hard) {
    return {
      verdict: "avoid",
      reason: "Not the day for hard conditioning. Keep squat, bench, and deadlift readiness in charge.",
      suggestedAlternative: "Recovery Cardio: easy walk or easy bike.",
    };
  }

  const lowerContext = input.nextLiftingContext === "heavy_lower" || input.nextLiftingContext === "deadlift_focused" || input.nextLiftingContext === "squat_focused";

  if (lowerContext && input.sessionType === "performance_conditioning" && !athleticPriority) {
    return {
      verdict: "avoid",
      reason:
        input.nextLiftingContext === "deadlift_focused"
          ? "Deadlift work is coming. Save the hard conditioning."
          : input.nextLiftingContext === "squat_focused"
            ? "Heavy squats are next. Keep this easy."
            : "Heavy legs are next. Keep this easy.",
      suggestedAlternative: "Recovery Cardio: easy walk or easy bike.",
    };
  }

  if (lowerContext && input.sessionType === "capacity_cardio" && !lowerBodyHard && !athleticPriority) {
    return {
      verdict: "caution",
      reason:
        input.nextLiftingContext === "deadlift_focused"
          ? "Deadlift work is coming. Keep conditioning easy."
          : input.nextLiftingContext === "squat_focused"
            ? "Heavy squats are next. Keep conditioning easy."
            : "Heavy legs are next. Keep conditioning easy.",
      suggestedAlternative: "Recovery Cardio: easy walk or easy bike.",
    };
  }

  if (lowerContext && lowerBodyHard && !athleticPriority) {
    return {
      verdict: "avoid",
      reason:
        input.nextLiftingContext === "deadlift_focused"
          ? "Deadlift work is coming. Save the hard conditioning."
          : input.nextLiftingContext === "squat_focused"
            ? "Heavy squats are next. Keep this easy."
            : "Heavy legs are next. Keep this easy.",
      suggestedAlternative: "Recovery Cardio: easy walk or easy bike.",
    };
  }

  if (input.nextLiftingContext === "power_focused" && hard && !athleticPriority) {
    return {
      verdict: "caution",
      reason: "Power work needs speed. Hard conditioning can wait.",
      suggestedAlternative: "Recovery Cardio, easy enough to stay sharp.",
    };
  }

  if (fatigueHigh && input.sessionType !== "recovery_cardio") {
    return {
      verdict: "avoid",
      reason: "Lifting fatigue is already high. Save the hero cardio.",
      suggestedAlternative: "Recovery Cardio, easy enough to recover from.",
    };
  }

  if (input.sessionType === "capacity_cardio" && fatigue?.severity === "moderate") {
    return {
      verdict: "caution",
      reason: "Capacity work is useful, but systemic cost is rising.",
      suggestedAlternative: "Keep it moderate or use Recovery Cardio.",
    };
  }

  if (hard && !athleticPriority) {
    return {
      verdict: "caution",
      reason: "Hard conditioning can interfere with lifting if it piles up.",
      suggestedAlternative: "Keep it short, or swap to Recovery Cardio.",
    };
  }

  return {
    verdict: "allowed",
    reason: "Cardio dose fits the current lifting context.",
  };
}

function defaultEaseFor(sessionType: CardioSessionKind): CardioEase {
  if (sessionType === "recovery_cardio") return "easy";
  if (sessionType === "capacity_cardio") return "moderate";
  return "hard";
}
