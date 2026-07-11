import type { BlockType } from "@/domain/training/annual-models";
import type { EventTaperResult } from "@/domain/training/event-taper";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { ExerciseFamily, ExerciseHistorySummary, ExerciseRole, ExperienceLevel, RepRange, TrainingLane } from "@/domain/training/models";
import { resolvePowerQuality, type PowerQualityResult } from "@/domain/training/power-quality";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import {
  canProgressFromHeavyRangeOccupancy,
  resolveRepRangeOccupancy,
  type RepRangeOccupancyResult,
} from "@/domain/training/rep-range-occupancy";
import { getSuccessModel } from "@/domain/training/success-model";
import type { TrainingGapStatus } from "@/domain/training/training-gap-adjustment";

export type ProgressionThrottleDecision = "push" | "hold" | "pull_back";
export type ProgressionThrottleConfidence = "high" | "medium" | "low" | "insufficient_data";
export type ProgressionThrottleSuggestedAction = "increase_load" | "hold_load" | "reduce_load" | "deload_or_volume_caution";

export interface ProgressionThrottleInput {
  exerciseRole?: ExerciseRole;
  exerciseFamily?: ExerciseFamily;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  currentBlock?: BlockType;
  targetRepRange: RepRange;
  recentExercisePerformance?: ExerciseHistorySummary[];
  recentShutdownDropOffRate?: number;
  recentQualitySetTrend?: "rising" | "stable" | "falling";
  recentVolumeFatigueSignal?: "low" | "moderate" | "high";
  progressionEarned: boolean;
  isDeload?: boolean;
  isExtraSession?: boolean;
  trainingGapStatus?: TrainingGapStatus;
  trainingLane?: TrainingLane;
  repRangeOccupancy?: RepRangeOccupancyResult;
  fatigueClassification?: FatigueClassifierResult;
  eventTaper?: EventTaperResult | null;
}

export interface ProgressionThrottleResult {
  decision: ProgressionThrottleDecision;
  confidence: ProgressionThrottleConfidence;
  reason: string;
  evidence: string[];
  suggestedAction: ProgressionThrottleSuggestedAction;
}

export function resolveProgressionThrottle(input: ProgressionThrottleInput): ProgressionThrottleResult {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  const entries = sortedEntries(input.recentExercisePerformance ?? []);
  const recent = entries.slice(-3);
  const model = getSuccessModel(goal);
  const isMainCompound = input.exerciseRole === "primary_compound" || input.exerciseRole === "power";
  const isIsolation = input.exerciseRole === "isolation" || input.exerciseFamily?.includes("isolation") || input.targetRepRange.max >= 15;
  const dropOffRate = input.recentShutdownDropOffRate ?? rate(recent, (entry) => entry.stoppedByDropOff);
  const qualityTrend = input.recentQualitySetTrend ?? qualityTrendFrom(recent);
  const fatigue = input.isDeload ? "high" : input.recentVolumeFatigueSignal ?? fatigueFrom(recent, dropOffRate, qualityTrend);
  const decline = repeatedDecline(recent);
  const lane = input.trainingLane;
  const powerQuality = resolvePowerQuality({
    repTarget: input.targetRepRange.max,
    recentExercisePerformance: entries,
    shutdownDropOffRate: dropOffRate,
    fatigueSignal: fatigue,
    qualitySetTrend: qualityTrend,
    trainingLane: lane,
    currentBlock: input.currentBlock,
  });
  const occupancy = input.repRangeOccupancy ?? resolveRepRangeOccupancy({
    targetRepRange: input.targetRepRange,
    recentExerciseHistory: entries,
    block: input.currentBlock,
    goal,
    experienceLevel: input.experienceLevel,
    fatigueSignal: fatigue,
    progressionSignal: qualityTrend === "falling" ? "declining" : qualityTrend === "rising" ? "improving" : "stable",
  });
  const evidence = buildEvidence(input, recent, fatigue, qualityTrend, dropOffRate, occupancy, powerQuality);
  const powerContext = lane === "power" || input.currentBlock === "power";

  if (input.isDeload) {
    return {
      decision: "hold",
      confidence: entries.length >= 2 ? "high" : "medium",
      reason: "Pull back before pushing again.",
      evidence: ["Deload block is active.", ...evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (lane === "recovery" || lane === "peak") {
    return {
      decision: "hold",
      confidence: entries.length >= 2 ? "high" : "medium",
      reason: lane === "peak" ? "Hold the weight. Express strength without adding noise." : "Hold the weight. Low fatigue is the point.",
      evidence: [`Training lane: ${lane}.`, ...evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (input.trainingGapStatus === "moderate_gap" || input.trainingGapStatus === "long_gap" || input.trainingGapStatus === "extended_gap") {
    return {
      decision: "hold",
      confidence: input.trainingGapStatus === "extended_gap" ? "high" : "medium",
      reason: input.trainingGapStatus === "extended_gap" ? "Re-entry week. Build back in, don't prove a point." : "Ease back in.",
      evidence: [`Training gap status: ${input.trainingGapStatus.replaceAll("_", " ")}.`, ...evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (input.eventTaper && ["taper", "event_week", "post_event"].includes(input.eventTaper.eventPhase)) {
    return {
      decision: "hold",
      confidence: input.eventTaper.eventPhase === "event_week" || input.eventTaper.eventPhase === "post_event" ? "high" : "medium",
      reason: input.eventTaper.eventPhase === "post_event" ? "Event done. Reset before chasing more." : "Hold the weight. Readiness matters now.",
      evidence: [input.eventTaper.readinessNote, ...input.eventTaper.evidence].slice(0, 5),
      suggestedAction: input.eventTaper.eventPhase === "post_event" ? "deload_or_volume_caution" : "hold_load",
    };
  }

  if (
    input.eventTaper?.eventPhase === "specificity" &&
    input.eventTaper.progressionAggressiveness === "suppressed" &&
    input.progressionEarned
  ) {
    return {
      decision: "hold",
      confidence: "medium",
      reason: "Hold the weight. Specificity is rising and fatigue is the enemy.",
      evidence: [input.eventTaper.readinessNote, ...input.eventTaper.evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (input.fatigueClassification && input.fatigueClassification.classification !== "insufficient_data") {
    const separatedFatigue = input.fatigueClassification;
    if ((separatedFatigue.classification === "systemic" || separatedFatigue.classification === "mixed") && separatedFatigue.severity !== "low") {
      return {
        decision: "hold",
        confidence: separatedFatigue.confidence === "insufficient_data" ? "medium" : separatedFatigue.confidence,
        reason: separatedFatigue.classification === "mixed" ? "Hold the weight. Fatigue is not just one lift." : "Hold broad progression. Fatigue is spreading.",
        evidence: separatedFatigue.evidence.slice(0, 5),
        suggestedAction: "deload_or_volume_caution",
      };
    }
    if (separatedFatigue.classification === "muscle_local" && separatedFatigue.severity === "high") {
      return {
        decision: "hold",
        confidence: separatedFatigue.confidence === "insufficient_data" ? "medium" : separatedFatigue.confidence,
        reason: "Hold the weight. Local volume is getting expensive.",
        evidence: separatedFatigue.evidence.slice(0, 5),
        suggestedAction: "deload_or_volume_caution",
      };
    }
    if (separatedFatigue.classification === "exercise_specific" && separatedFatigue.severity !== "low") {
      return {
        decision: input.progressionEarned ? "hold" : "pull_back",
        confidence: separatedFatigue.confidence === "insufficient_data" ? "medium" : separatedFatigue.confidence,
        reason: input.progressionEarned ? "Hold the weight. This lift needs cleaner evidence." : "Back it down. This looks lift-specific.",
        evidence: separatedFatigue.evidence.slice(0, 5),
        suggestedAction: input.progressionEarned ? "hold_load" : "reduce_load",
      };
    }
  }

  if (powerContext && powerQuality.status === "degrading") {
    return {
      decision: "pull_back",
      confidence: powerQuality.confidence === "insufficient_data" ? "low" : powerQuality.confidence,
      reason: "Speed is fading. Pull back.",
      evidence: [powerQuality.coachCopy, ...powerQuality.evidence].slice(0, 5),
      suggestedAction: "reduce_load",
    };
  }

  if (powerContext && powerQuality.status === "acceptable") {
    return {
      decision: "hold",
      confidence: powerQuality.confidence === "insufficient_data" ? "low" : powerQuality.confidence,
      reason: "Keep quality high.",
      evidence: [powerQuality.coachCopy, ...powerQuality.evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (powerContext && powerQuality.status === "insufficient_data" && input.progressionEarned) {
    return {
      decision: "hold",
      confidence: "insufficient_data",
      reason: "Keep quality high.",
      evidence: ["Power work needs more completed evidence before pushing load.", ...powerQuality.evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (decline) {
    return {
      decision: "pull_back",
      confidence: recent.length >= 3 ? "high" : "medium",
      reason: "Back it down.",
      evidence: ["Repeated decline in recent work.", ...evidence].slice(0, 5),
      suggestedAction: "reduce_load",
    };
  }

  if (!input.progressionEarned) {
    if (shouldPushFromOccupancy(input, occupancy, fatigue, qualityTrend, entries.length, isMainCompound)) {
      return {
        decision: "push",
        confidence: occupancy.confidence === "high" ? "high" : "medium",
        reason: "You earned more weight from the heavy end.",
        evidence: [
          "Performance is trending well without living at the top of the range.",
          ...occupancy.evidence,
          fatigue === "low" ? "Fatigue is under control." : null,
          model.label,
        ].filter((item): item is string => Boolean(item)).slice(0, 5),
        suggestedAction: "increase_load",
      };
    }

    return {
      decision: entries.length < 2 ? "hold" : "hold",
      confidence: entries.length < 2 ? "insufficient_data" : "medium",
      reason: entries.length < 2 ? "Log a few sessions first. The app is smart, not psychic." : "Hold the weight. Earn cleaner reps first.",
      evidence: entries.length < 2 ? ["Fewer than 2 recent exposures."] : evidence,
      suggestedAction: "hold_load",
    };
  }

  if (fatigue === "high") {
    const protectMainLift = model.recommendationBias.protectMainLifts && isMainCompound && (goal === "build_strength" || goal === "powerlifting_meet" || goal === "get_leaner");
    return {
      decision: "hold",
      confidence: entries.length >= 2 ? "high" : "medium",
      reason: protectMainLift ? "Hold the weight. Trim the cost around the main lift first." : "Hold the weight. Recent work is getting expensive.",
      evidence: [model.label, "Progression was earned, but fatigue/volume cost is high.", ...evidence].slice(0, 5),
      suggestedAction: protectMainLift ? "deload_or_volume_caution" : "hold_load",
    };
  }

  if (fatigue === "moderate" && shouldHoldUnderModerateFatigue(input, isIsolation, isMainCompound)) {
    return {
      decision: "hold",
      confidence: entries.length >= 2 ? "medium" : "low",
      reason: holdReasonForGoal(input.goal, isIsolation),
      evidence: [model.label, "Progression was earned, but recent cost is rising.", ...evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if ((lane === "maintenance" || lane === "power") && fatigue !== "low") {
    return {
      decision: "hold",
      confidence: entries.length >= 2 ? "medium" : "low",
      reason: lane === "power" ? "Hold the weight. Move it fast, no grinders." : "Hold the weight. Keep the quality alive.",
      evidence: [`Training lane: ${lane}.`, "Progression was earned, but this lane is conservative under fatigue.", ...evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  if (input.experienceLevel === "advanced" && isIsolation && recent.length < 3) {
    return {
      decision: "hold",
      confidence: "low",
      reason: "Hold the weight. Advanced isolation work needs stronger evidence before load jumps.",
      evidence: ["Isolation target range is high.", "Fewer than 3 recent exposures."],
      suggestedAction: "hold_load",
    };
  }

  if (occupancy.style === "volume_biased" && occupancy.trend === "falling" && goal !== "build_strength") {
    return {
      decision: "hold",
      confidence: occupancy.confidence === "high" ? "medium" : "low",
      reason: "Hold the weight. Top-end reps are slipping.",
      evidence: ["Progression was earned, but range occupancy is drifting down.", ...occupancy.evidence].slice(0, 5),
      suggestedAction: "hold_load",
    };
  }

  return {
    decision: "push",
    confidence: entries.length >= 2 ? "high" : input.experienceLevel === "beginner" ? "medium" : "low",
    reason: "You earned more weight.",
    evidence: [
      "Top of the range across productive work.",
      powerContext && powerQuality.status === "sharp" ? "Power looks sharp." : null,
      lane ? `Training lane: ${lane}.` : null,
      fatigue === "low" ? "Fatigue is under control." : "No repeated decline signal.",
      input.experienceLevel === "advanced" ? "Advanced progression stays conservative." : `${model.label} allows this push.`,
      input.isExtraSession ? "Extra-session evidence contributes, but does not force planned progression." : null,
    ].filter((item): item is string => Boolean(item)),
    suggestedAction: "increase_load",
  };
}

function shouldHoldUnderModerateFatigue(input: ProgressionThrottleInput, isIsolation: boolean, isMainCompound: boolean): boolean {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  if (input.experienceLevel === "beginner" && isMainCompound && goal === "build_strength") return false;
  if (input.experienceLevel === "advanced") return true;
  if (goal === "athletic_performance" || goal === "powerlifting_meet" || goal === "get_leaner") return true;
  if (goal === "build_muscle" && isIsolation) return true;
  if (goal === "build_muscle" && input.targetRepRange.max >= 12) return true;
  return false;
}

function holdReasonForGoal(goal: TrainingSetupGoal | undefined, isIsolation: boolean): string {
  goal = goal ? normalizeTrainingSetupGoal(goal) : undefined;
  if (goal === "build_muscle") return isIsolation ? "Hold the weight. Build cleaner reps before chasing load." : "Hold the weight. Useful volume beats noisy jumps.";
  if (goal === "athletic_performance") return "Hold the weight. Quality beats grind.";
  if (goal === "powerlifting_meet") return "Hold the weight. Meet readiness matters more than a jump right now.";
  if (goal === "get_leaner") return "Hold the weight. Preserve strength without adding unnecessary fatigue.";
  return "Hold the weight. Earn cleaner reps first.";
}

function shouldPushFromOccupancy(
  input: ProgressionThrottleInput,
  occupancy: RepRangeOccupancyResult,
  fatigue: "low" | "moderate" | "high",
  qualityTrend: "rising" | "stable" | "falling",
  exposureCount: number,
  isMainCompound: boolean,
): boolean {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  if (!canProgressFromHeavyRangeOccupancy(occupancy)) return false;
  if (fatigue !== "low" || qualityTrend === "falling") return false;
  if (input.isDeload || input.trainingLane === "recovery" || input.trainingLane === "peak") return false;
  if (input.eventTaper && ["specificity", "taper", "event_week", "post_event"].includes(input.eventTaper.eventPhase)) return false;
  if (goal === "get_leaner" && exposureCount < 3) return false;
  if (goal === "build_strength" && isMainCompound) return true;
  if (goal === "athletic_performance") return input.trainingLane === "power" || isMainCompound;
  if (goal === "powerlifting_meet") return exposureCount >= 3 && isMainCompound;
  if (goal === "build_muscle") return occupancy.trend === "rising" && exposureCount >= 3;
  if (goal === "build_muscle_and_strength") return exposureCount >= 2;
  return exposureCount >= 3;
}

function sortedEntries(entries: ExerciseHistorySummary[]): ExerciseHistorySummary[] {
  return [...entries].sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
}

function rate(entries: ExerciseHistorySummary[], predicate: (entry: ExerciseHistorySummary) => boolean): number {
  if (entries.length === 0) return 0;
  return entries.filter(predicate).length / entries.length;
}

function qualityTrendFrom(entries: ExerciseHistorySummary[]): "rising" | "stable" | "falling" {
  if (entries.length < 3) return "stable";
  const values = entries.map((entry) => entry.qualitySets);
  if (strictlyDeclining(values)) return "falling";
  if (strictlyRising(values)) return "rising";
  return "stable";
}

function fatigueFrom(
  entries: ExerciseHistorySummary[],
  dropOffRate: number,
  qualityTrend: "rising" | "stable" | "falling",
): "low" | "moderate" | "high" {
  if (dropOffRate >= 0.5 || qualityTrend === "falling") return "high";
  if (dropOffRate > 0 || entries.some((entry) => entry.qualitySets <= 1)) return "moderate";
  return "low";
}

function repeatedDecline(entries: ExerciseHistorySummary[]): boolean {
  if (entries.length < 3) return false;
  const earlyShutdowns = entries.filter((entry) => entry.stoppedByDropOff && entry.qualitySets < 2).length;
  return earlyShutdowns >= 2 || strictlyDeclining(entries.map((entry) => entry.bestSetReps));
}

function buildEvidence(
  input: ProgressionThrottleInput,
  recent: ExerciseHistorySummary[],
  fatigue: string,
  qualityTrend: string,
  dropOffRate: number,
  occupancy: RepRangeOccupancyResult,
  powerQuality: PowerQualityResult,
): string[] {
  return [
    `${recent.length} recent exposure(s) analysed.`,
    `Target range ${input.targetRepRange.min}-${input.targetRepRange.max}.`,
    `Fatigue signal: ${fatigue}.`,
    `Quality set trend: ${qualityTrend}.`,
    `Shutdown/drop-off rate: ${Math.round(dropOffRate * 100)}%.`,
    input.eventTaper ? `Event phase: ${input.eventTaper.eventPhase.replaceAll("_", " ")}.` : null,
    powerQuality.status !== "insufficient_data" ? `Power quality: ${powerQuality.status}.` : null,
    occupancy.style !== "insufficient_data" ? occupancy.evidence.at(-2) ?? occupancy.evidence.at(-1) : null,
    input.isExtraSession ? "Extra-session evidence contributes, but does not force planned progression." : null,
  ].filter((item): item is string => Boolean(item));
}

function strictlyDeclining(values: number[]): boolean {
  return values.length >= 3 && values.every((value, index) => index === 0 || value < values[index - 1]!);
}

function strictlyRising(values: number[]): boolean {
  return values.length >= 3 && values.every((value, index) => index === 0 || value > values[index - 1]!);
}
