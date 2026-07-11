import type { BlockType } from "@/domain/training/annual-models";
import type { CardioSessionKind } from "@/domain/training/models";
import type { EventPhase } from "@/domain/training/event-taper";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { LiftingContext } from "@/domain/training/cardio-interference";
import { normalizeTrainingSetupGoal, type RecoveryCardioPreference, type TrainingSetupGoal } from "@/domain/training/plan-setup";

export type RecoveryCapacityTimingConfidence = "high" | "medium" | "low";

export interface RecoveryCapacityTimingInput {
  recommendation?: CardioSessionKind | null;
  nextWorkoutContext?: LiftingContext | null;
  goal?: TrainingSetupGoal | null;
  block?: BlockType | null;
  fatigueClassification?: FatigueClassifierResult | null;
  eventTaperPhase?: EventPhase | null;
  recoveryCardioPreference?: RecoveryCardioPreference;
}

export interface RecoveryCapacityTimingGuidance {
  bestTimingGuidance: string[];
  avoidGuidance: string[];
  confidence: RecoveryCapacityTimingConfidence;
  startMessage: string;
}

export function resolveRecoveryCapacityTiming(input: RecoveryCapacityTimingInput): RecoveryCapacityTimingGuidance {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const recommendation = input.recommendation ?? "recovery_cardio";
  const context = input.nextWorkoutContext ?? "unknown";
  const tapering = input.eventTaperPhase === "taper" || input.eventTaperPhase === "event_week" || input.block === "peak" || context === "peak_or_taper" || context === "event_week";
  const highFatigue = input.fatigueClassification?.severity === "high";
  const athletic = goal === "athletic_performance";
  const meet = goal === "powerlifting_meet";

  if (input.recoveryCardioPreference === "off") {
    return guidance(["Cardio suggestions are off."], ["No cardio target is active."], "low", "Recovery & Cardio is off.");
  }

  if (tapering || meet) {
    const eventWeek = input.eventTaperPhase === "event_week" || context === "event_week";
    return guidance(
      [eventWeek ? "Recovery only this week." : "Recovery first this week.", "Easy walks or easy bike fit best."],
      ["Hard conditioning", "New conditioning stress"],
      "high",
      eventWeek ? "Meet week. Keep this recovery-only." : "Taper context. Keep this easy and boring on purpose.",
    );
  }

  if (highFatigue) {
    return guidance(
      ["Easy Recovery Cardio only.", "Rest days work best."],
      ["Capacity intervals", "Hard conditioning while lifting fatigue is high"],
      "high",
      "Lifting fatigue is high. Keep cardio easy enough to recover from.",
    );
  }

  if (context === "deadlift_focused") {
    return guidance(
      ["Easy Recovery Cardio today.", "Rest day if you have one."],
      ["Hard conditioning before deadlift work", "Lower-body intervals"],
      "high",
      "Deadlift work is next. Keep this easy.",
    );
  }

  if (context === "heavy_lower" || context === "squat_focused") {
    return guidance(
      ["Rest days", "After upper-body sessions"],
      ["Hard conditioning before heavy lower sessions", "Turning cardio into another leg day"],
      "high",
      context === "squat_focused" ? "Heavy squats are next. Keep this easy." : "Heavy lower work is next. Keep this easy.",
    );
  }

  if (context === "power_focused") {
    return guidance(
      athletic ? ["Conditioning is acceptable if recovery is under control.", "Keep power work sharp."] : ["Low-fatigue recovery work", "Rest days"],
      athletic ? ["Extra conditioning that makes power output sloppy"] : ["Hard conditioning before power work", "Grindy intervals"],
      athletic ? "medium" : "high",
      athletic ? "Conditioning is acceptable if recovery is under control." : "Power work needs speed. Keep this low fatigue.",
    );
  }

  if (context === "heavy_upper") {
    return guidance(
      recommendation === "recovery_cardio" ? ["Good opportunity today.", "After upper-body training"] : ["After upper-body sessions", "Away from heavy lower work"],
      ["Hard lower-body conditioning before heavy legs"],
      "medium",
      recommendation === "recovery_cardio" ? "Good day for easy recovery work." : "Good window, as long as it stays recoverable.",
    );
  }

  if (athletic && recommendation !== "recovery_cardio") {
    return guidance(
      ["Conditioning is acceptable if recovery is under control.", "Separate from the hardest lifting when possible."],
      ["Stacking hard conditioning on top of high lifting fatigue"],
      "medium",
      "Conditioning fits here. Keep the lifting quality intact.",
    );
  }

  if (goal === "get_leaner") {
    return guidance(
      ["Rest days", "After upper-body sessions", "Any easy slot you can repeat"],
      ["Hard conditioning before heavy lower sessions"],
      "medium",
      "Flexible timing is fine. Keep it easy enough to support lifting.",
    );
  }

  return guidance(
    ["Rest days", "After upper-body sessions"],
    ["Hard conditioning before heavy lower sessions"],
    context === "unknown" ? "low" : "medium",
    "Best on a rest day or after upper-body work.",
  );
}

function guidance(
  bestTimingGuidance: string[],
  avoidGuidance: string[],
  confidence: RecoveryCapacityTimingConfidence,
  startMessage: string,
): RecoveryCapacityTimingGuidance {
  return {
    bestTimingGuidance,
    avoidGuidance,
    confidence,
    startMessage,
  };
}
