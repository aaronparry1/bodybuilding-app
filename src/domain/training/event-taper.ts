import type { BlockType } from "@/domain/training/annual-models";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { ExperienceLevel } from "@/domain/training/models";
import type { EventType, TrainingSetupGoal } from "@/domain/training/plan-setup";

export type EventPhase = "base" | "build" | "specificity" | "taper" | "event_week" | "post_event";
export type EventVolumeGuidance = "normal" | "slightly_reduced" | "reduced" | "minimal" | "reset";
export type EventIntensityGuidance = "normal" | "build" | "specific" | "maintain_quality" | "low_fatigue" | "reset";
export type EventNoveltyAllowance = "normal" | "limited" | "very_limited" | "none";
export type EventProgressionAggressiveness = "normal" | "conservative" | "suppressed" | "reset";

export interface EventTaperInput {
  eventType?: EventType | null;
  targetDate?: string | null;
  weeksUntilEvent?: number | null;
  currentBlock?: BlockType | null;
  fatigueClassification?: FatigueClassifierResult | null;
  readinessSignal?: "low" | "moderate" | "high" | null;
  progressSignal?: "declining" | "stable" | "improving" | null;
  goal?: TrainingSetupGoal | null;
  experienceLevel?: ExperienceLevel | null;
  referenceDate?: Date;
}

export interface EventTaperResult {
  eventPhase: EventPhase;
  weeksUntilEvent: number;
  eventType: EventType | "generic";
  volumeGuidance: EventVolumeGuidance;
  intensityGuidance: EventIntensityGuidance;
  noveltyAllowance: EventNoveltyAllowance;
  progressionAggressiveness: EventProgressionAggressiveness;
  readinessNote: string;
  evidence: string[];
}

export function resolveEventTaper(input: EventTaperInput): EventTaperResult {
  const weeksUntilEvent = normalizeWeeks(input.weeksUntilEvent ?? calculateWeeksUntilEvent(input.targetDate, input.referenceDate));
  const eventType = input.eventType ?? "generic";
  const eventPhase = phaseForWeeks(weeksUntilEvent);
  const fatigueSeverity = input.fatigueClassification?.classification && input.fatigueClassification.classification !== "insufficient_data"
    ? input.fatigueClassification.severity
    : "low";
  const stressed = fatigueSeverity === "high" || input.readinessSignal === "low" || input.progressSignal === "declining";
  const profile = profileFor(eventPhase, eventType, stressed);

  return {
    eventPhase,
    weeksUntilEvent,
    eventType,
    ...profile,
    evidence: [
      `${weeksUntilEvent} week${Math.abs(weeksUntilEvent) === 1 ? "" : "s"} until event.`,
      `Event phase: ${eventPhase.replaceAll("_", " ")}.`,
      `Event type: ${eventType.replaceAll("_", " ")}.`,
      input.currentBlock ? `Current block: ${input.currentBlock.replaceAll("_", " ")}.` : null,
      stressed ? "Readiness/fatigue signal makes the event plan more conservative." : null,
    ].filter((item): item is string => Boolean(item)),
  };
}

export function calculateWeeksUntilEvent(targetDate?: string | null, referenceDate: Date = new Date()): number {
  if (!targetDate) return 16;
  const target = new Date(targetDate).getTime();
  const reference = referenceDate.getTime();
  if (!Number.isFinite(target) || !Number.isFinite(reference)) return 16;
  return Math.ceil((target - reference) / 604_800_000);
}

export function isEventTaperRestrictive(result?: EventTaperResult | null): boolean {
  return Boolean(result && ["taper", "event_week", "post_event"].includes(result.eventPhase));
}

function phaseForWeeks(weeks: number): EventPhase {
  if (weeks < 0) return "post_event";
  if (weeks <= 1) return "event_week";
  if (weeks <= 3) return "taper";
  if (weeks <= 8) return "specificity";
  if (weeks <= 12) return "build";
  return "base";
}

function profileFor(
  phase: EventPhase,
  eventType: EventTaperResult["eventType"],
  stressed: boolean,
): Omit<EventTaperResult, "eventPhase" | "weeksUntilEvent" | "eventType" | "evidence"> {
  if (phase === "post_event") {
    return {
      volumeGuidance: "reset",
      intensityGuidance: "reset",
      noveltyAllowance: "limited",
      progressionAggressiveness: "reset",
      readinessNote: "Event done. Reset, review, and build the next block cleanly.",
    };
  }

  if (phase === "event_week") {
    return {
      volumeGuidance: "minimal",
      intensityGuidance: eventType === "powerlifting_meet" ? "maintain_quality" : "low_fatigue",
      noveltyAllowance: "none",
      progressionAggressiveness: "suppressed",
      readinessNote: eventType === "photoshoot" || eventType === "holiday" ? "Event week. Keep fatigue low and do not get cute." : "Event week. Stay sharp, stay fresh.",
    };
  }

  if (phase === "taper") {
    return {
      volumeGuidance: stressed ? "minimal" : "reduced",
      intensityGuidance: eventType === "powerlifting_meet" ? "maintain_quality" : "low_fatigue",
      noveltyAllowance: "none",
      progressionAggressiveness: "suppressed",
      readinessNote: eventType === "powerlifting_meet" ? "Taper. Keep specific work sharp and fatigue low." : "Taper. Reduce fatigue and keep the work clean.",
    };
  }

  if (phase === "specificity") {
    return {
      volumeGuidance: stressed ? "reduced" : "slightly_reduced",
      intensityGuidance: eventType === "powerlifting_meet" ? "specific" : eventType === "sport_season" ? "maintain_quality" : "normal",
      noveltyAllowance: "very_limited",
      progressionAggressiveness: stressed ? "suppressed" : "conservative",
      readinessNote:
        eventType === "powerlifting_meet"
          ? "Specificity is rising. Keep event-relevant lifts in the spotlight."
          : eventType === "photoshoot" || eventType === "holiday"
            ? "Specificity is rising. Manage fatigue and keep the look-good work recoverable."
            : "Specificity is rising. Less random novelty now.",
    };
  }

  if (phase === "build") {
    return {
      volumeGuidance: stressed ? "slightly_reduced" : "normal",
      intensityGuidance: "build",
      noveltyAllowance: "limited",
      progressionAggressiveness: stressed ? "conservative" : "normal",
      readinessNote: "Build phase. Keep useful work moving while the event gets closer.",
    };
  }

  return {
    volumeGuidance: stressed ? "slightly_reduced" : "normal",
    intensityGuidance: "normal",
    noveltyAllowance: "normal",
    progressionAggressiveness: stressed ? "conservative" : "normal",
    readinessNote: "Long runway. Build capacity now so the later work has somewhere to go.",
  };
}

function normalizeWeeks(value: number): number {
  if (!Number.isFinite(value)) return 16;
  return Math.max(-52, Math.min(104, Math.round(value)));
}
