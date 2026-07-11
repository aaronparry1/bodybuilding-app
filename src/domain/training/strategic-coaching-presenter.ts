import type { BlockType } from "@/domain/training/annual-models";
import type { DeloadProfile } from "@/domain/training/deload-prescription";
import type { Exercise, WorkoutHistorySummary } from "@/domain/training/models";
import {
  adaptHistoryToStrategicSignals,
  calculateBlockReadiness,
  calculateTrainingMomentum,
  createCoachingBlock,
  createCoachingPlan,
  recommendStrategicAction,
  type PlanningMode,
} from "@/domain/training/strategic-coaching";
import type { SuccessModelGoal } from "@/domain/training/success-model";

export interface StrategicCoachingViewModel {
  hasEnoughHistory: boolean;
  emptyMessage?: string;
  planningModeLabel: string;
  currentBlockLabel: string;
  readiness?: {
    score: number;
    band: string;
    label: string;
  };
  momentum?: {
    score: number;
    band: string;
    label: string;
  };
  recommendation?: {
    title: string;
    message: string;
    reasons: string[];
    deloadProfile?: DeloadProfile;
  };
}

export interface StrategicCoachingPresenterOptions {
  planningMode?: PlanningMode;
  currentBlockType?: BlockType;
  minimumSessions?: number;
  goal?: SuccessModelGoal;
}

const defaultPlanningMode: PlanningMode = "guided_annual";
const defaultBlockType: BlockType = "hypertrophy";

export function buildStrategicCoachingViewModel(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  options: StrategicCoachingPresenterOptions = {},
): StrategicCoachingViewModel {
  const planningMode = options.planningMode ?? defaultPlanningMode;
  const currentBlockType = options.currentBlockType ?? defaultBlockType;
  const minimumSessions = options.minimumSessions ?? 3;
  const planningModeLabel = titlePlanningMode(planningMode);
  const currentBlockLabel = titleBlock(currentBlockType);

  if (history.length < minimumSessions) {
    return {
      hasEnoughHistory: false,
      emptyMessage: "Log 3-5 completed workouts first. Then the coach can make useful calls.",
      planningModeLabel,
      currentBlockLabel,
    };
  }

  const plan = createCoachingPlan({
    mode: planningMode,
    goal: { type: "muscle_gain" },
    blocks: planningMode === "single_block" ? [createCoachingBlock(currentBlockType, 0)] : undefined,
  });
  const currentBlock = createCoachingBlock(currentBlockType, 0, {
    currentWeek: estimateCurrentBlockWeek(history),
    status: "active",
  });
  const signals = adaptHistoryToStrategicSignals(history, exercises, {
    currentBlockType,
    goal: options.goal,
  });
  const readiness = calculateBlockReadiness(signals);
  const momentum = calculateTrainingMomentum(signals);
  const recommendation = recommendStrategicAction({
    currentBlock,
    planningMode,
    readiness,
      plan,
      goal: options.goal,
    });

  return {
    hasEnoughHistory: true,
    planningModeLabel,
    currentBlockLabel,
    readiness: {
      score: readiness.score,
      band: titleReadinessBand(readiness.band),
      label: `${readiness.score} - ${titleReadinessBand(readiness.band)}`,
    },
    momentum: {
      score: momentum.score,
      band: momentum.band,
      label: `${momentum.score} - ${momentum.band}`,
    },
    recommendation: {
      title: titleRecommendation(recommendation.outcome),
      message: recommendation.message,
      reasons: buildPlainReasons(signals, recommendation.reasons),
      deloadProfile: recommendation.deloadProfile,
    },
  };
}

export function titleRecommendation(outcome: ReturnType<typeof recommendStrategicAction>["outcome"]): string {
  switch (outcome) {
    case "advance_block":
      return "Advance block";
    case "deload_then_continue":
      return "Use a Recovery Window, then continue";
    case "extend_block":
      return "Extend this block";
    case "increase_volume":
      return "Increase volume";
    case "reduce_volume":
      return "Reduce volume";
    case "repeat_block":
      return "Repeat this block";
    case "continue_block":
    default:
      return "Continue this block";
  }
}

function buildPlainReasons(
  signals: ReturnType<typeof adaptHistoryToStrategicSignals>,
  fallbackReasons: string[],
): string[] {
  const strategicReasons = fallbackReasons.filter((reason) =>
    /Build |Athletic Performance|Get Leaner|Powerlifting Meet|deload profile|Recovery Window|Goal:|prioriti[sz]es|protects|productive sets/i.test(reason),
  );
  const reasons: string[] = [];

  if (signals.progressionRate >= 0.3) reasons.push("Progression is still moving.");
  else if (signals.progressionRate > 0) reasons.push("Progression is present, but not flying.");
  else reasons.push("No recent progression has been earned yet.");

  if (signals.fatigueTrend === "low") reasons.push("Fatigue is low.");
  else if (signals.fatigueTrend === "moderate") reasons.push("Fatigue is creeping up.");
  else reasons.push("Fatigue is high.");
  if ((signals.shutdownEvidenceCounts?.productive_shutdown ?? 0) > 0) reasons.push("Hard productive work was capped cleanly.");
  if ((signals.shutdownEvidenceCounts?.expected_local_fatigue ?? 0) > 0) reasons.push("Local fatigue appeared after useful work.");

  if (signals.qualitySetTrend === "rising") reasons.push("Quality sets are rising.");
  else if (signals.qualitySetTrend === "flat") reasons.push("Quality sets are stable.");
  else if (signals.qualitySetTrend === "falling") reasons.push("Quality sets are falling.");

  if (signals.volumeTolerance === "rising") reasons.push("Volume tolerance is improving.");
  else if (signals.volumeTolerance === "declining") reasons.push("Volume tolerance is declining.");

  if (signals.stalledExercises.length > 0) {
    reasons.push(`${signals.stalledExercises.slice(0, 2).join(", ")} need watching.`);
  }

  return uniqueReasons([...strategicReasons, ...(reasons.length > 0 ? reasons : fallbackReasons)]).slice(0, 4);
}

function uniqueReasons(reasons: string[]): string[] {
  return reasons.filter((reason, index) => reasons.findIndex((candidate) => candidate === reason) === index);
}

function estimateCurrentBlockWeek(history: WorkoutHistorySummary[]): number {
  const dates = history
    .map((summary) => new Date(summary.completedAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (dates.length === 0) return 1;
  const elapsedDays = Math.max(0, (dates.at(-1)! - dates[0]) / 86_400_000);
  return Math.max(1, Math.floor(elapsedDays / 7) + 1);
}

function titlePlanningMode(mode: PlanningMode): string {
  if (mode === "guided_annual") return "Guided Annual";
  if (mode === "goal_event") return "Goal/Event";
  if (mode === "single_block") return "Single Block";
  return "Custom Sequence";
}

function titleBlock(blockType: BlockType): string {
  if (blockType === "strength_hypertrophy") return "Powerbuilding";
  return blockType.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleReadinessBand(band: ReturnType<typeof calculateBlockReadiness>["band"]): string {
  if (band === "deload_or_adjust") return "Recovery Window or adjust";
  return band.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
