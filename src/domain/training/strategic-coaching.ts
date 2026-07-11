import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import { createTrainingBlock, recommendNextBlock } from "@/domain/training/annual-planner";
import { defaultMuscleVolumeTargets } from "@/domain/training/analytics";
import type { Exercise, ExerciseHistorySummary, ID, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import { hasDeloadEvidence, resolveDeloadPrescription, type DeloadProfile } from "@/domain/training/deload-prescription";
import { getSuccessModel, successModelReason, type SuccessModelGoal } from "@/domain/training/success-model";
import { shutdownEvidenceCounts, shutdownRecoveryPressureRate, type ShutdownEvidenceClassification } from "@/domain/training/fatigue-evidence";

export type PlanningMode = "guided_annual" | "goal_event" | "single_block" | "custom_sequence";

export type CoachingGoalType =
  | "muscle_gain"
  | "strength"
  | "powerlifting_meet"
  | "photoshoot"
  | "holiday"
  | "sport_season"
  | "maintenance"
  | "custom";

export interface CoachingGoal {
  type: CoachingGoalType;
  targetDate?: string;
  description?: string;
}

export interface CoachingBlock {
  id: ID;
  type: BlockType;
  name: string;
  goal: TrainingBlock["goal"];
  minWeeks: number;
  maxWeeks: number;
  plannedWeeks?: number;
  currentWeek: number;
  status: "planned" | "active" | "completed" | "deloading";
  startedAt?: string;
  completedAt?: string;
}

export interface CoachingPlan {
  id: ID;
  userId?: ID | null;
  mode: PlanningMode;
  name: string;
  goal: CoachingGoal;
  blocks: CoachingBlock[];
  activeBlockId: ID;
  createdAt: string;
  updatedAt: string;
}

export type TrendDirection = "rising" | "flat" | "falling" | "insufficient_data";
export type FatigueTrend = "low" | "moderate" | "high";
export type VolumeToleranceTrend = "rising" | "stable" | "declining" | "insufficient_data";

export interface RecoverySignals {
  sleepIssueRate?: number;
  jointPainRate?: number;
  motivationIssueRate?: number;
}

export interface StrategicSignals {
  progressionRate: number;
  qualitySetTrend: TrendDirection;
  fatigueTrend: FatigueTrend;
  volumeTolerance: VolumeToleranceTrend;
  exercisePerformanceTrend: TrendDirection;
  recoveryTrend: "stable" | "strained" | "unknown";
  stalledExercises: string[];
  progressingMuscles: MuscleGroup[];
  undertrainedMuscles: MuscleGroup[];
  overreachedMuscles: MuscleGroup[];
  sessionsAnalyzed: number;
  exerciseEntriesAnalyzed: number;
  averageQualitySets: number;
  shutdownRate: number;
  rawShutdownRate?: number;
  shutdownEvidenceCounts?: Record<ShutdownEvidenceClassification, number>;
}

export interface ReadinessWeights {
  progression: number;
  qualitySets: number;
  fatigue: number;
  volumeTolerance: number;
  recovery: number;
}

export interface BlockReadiness {
  score: number;
  band: "ready" | "continue" | "monitor" | "deload_or_adjust";
  factors: {
    progression: number;
    qualitySets: number;
    fatigue: number;
    volumeTolerance: number;
    recovery: number;
  };
  signals: StrategicSignals;
  reasons: string[];
}

export type StrategicOutcome =
  | "continue_block"
  | "extend_block"
  | "deload_then_continue"
  | "advance_block"
  | "repeat_block"
  | "reduce_volume"
  | "increase_volume";

export interface StrategicRecommendation {
  outcome: StrategicOutcome;
  confidence: "low" | "medium" | "high";
  message: string;
  reasons: string[];
  nextBlockType?: BlockType;
  successModelGoal?: SuccessModelGoal;
  deloadProfile?: DeloadProfile;
}

export interface StrategicRecommendationInput {
  currentBlock: CoachingBlock | TrainingBlock;
  planningMode: PlanningMode;
  readiness: BlockReadiness;
  signals?: StrategicSignals;
  plan?: CoachingPlan;
  goal?: SuccessModelGoal;
}

export interface TrainingMomentum {
  score: number;
  band: "Strong" | "Stable" | "Slowing" | "Declining";
  reasons: string[];
}

export interface StrategicSignalsOptions {
  recentSessionWindow?: number;
  staleExerciseSessions?: number;
  recoverySignals?: RecoverySignals;
  referenceDate?: Date;
  currentBlockType?: BlockType;
  goal?: SuccessModelGoal;
}

export const defaultReadinessWeights: ReadinessWeights = {
  progression: 0.3,
  qualitySets: 0.25,
  fatigue: 0.25,
  volumeTolerance: 0.15,
  recovery: 0.05,
};

const guidedAnnualOrder: BlockType[] = ["hypertrophy", "powerbuilding", "strength", "power", "peak"];

export function createCoachingBlock(type: BlockType, index = 0, overrides: Partial<CoachingBlock> = {}): CoachingBlock {
  const block = createTrainingBlock(type);
  return {
    id: overrides.id ?? `coaching-block-${index + 1}-${type}`,
    type,
    name: overrides.name ?? block.name,
    goal: overrides.goal ?? block.goal,
    minWeeks: overrides.minWeeks ?? Math.max(1, Math.floor(block.durationWeeks * 0.67)),
    maxWeeks: overrides.maxWeeks ?? Math.max(block.durationWeeks, block.durationWeeks + 2),
    plannedWeeks: overrides.plannedWeeks ?? block.durationWeeks,
    currentWeek: overrides.currentWeek ?? 1,
    status: overrides.status ?? (index === 0 ? "active" : "planned"),
    startedAt: overrides.startedAt,
    completedAt: overrides.completedAt,
  };
}

export function createCoachingPlan({
  mode,
  goal,
  userId = null,
  blocks,
  createdAt = new Date().toISOString(),
}: {
  mode: PlanningMode;
  goal: CoachingGoal;
  userId?: ID | null;
  blocks?: CoachingBlock[];
  createdAt?: string;
}): CoachingPlan {
  const resolvedBlocks = blocks ?? defaultBlocksForMode(mode, goal);
  const activeBlock = resolvedBlocks.find((block) => block.status === "active") ?? resolvedBlocks[0];

  return {
    id: `coaching-plan-${mode}-${createdAt}`,
    userId,
    mode,
    name: labelPlan(mode, goal),
    goal,
    blocks: resolvedBlocks.map((block, index) => ({
      ...block,
      status: block.id === activeBlock?.id ? "active" : index === 0 && !activeBlock ? "active" : block.status,
    })),
    activeBlockId: activeBlock?.id ?? resolvedBlocks[0]?.id ?? "",
    createdAt,
    updatedAt: createdAt,
  };
}

export function adaptHistoryToStrategicSignals(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  options: StrategicSignalsOptions = {},
): StrategicSignals {
  const recentSessionWindow = options.recentSessionWindow ?? 12;
  const staleExerciseSessions = options.staleExerciseSessions ?? 3;
  const sessions = [...history]
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .slice(-recentSessionWindow);
  const entries = sessions.flatMap((session) => session.exerciseSummaries);
  const progressionRate = ratio(entries.filter((entry) => entry.progressionEarned).length, entries.length);
  const qualitySetTrend = trendFromValues(sessions.map((session) => session.exerciseSummaries.reduce((sum, entry) => sum + entry.qualitySets, 0)));
  const volumeTolerance = volumeToleranceFromTrend(qualitySetTrend);
  const rawShutdownRate = ratio(entries.filter((entry) => entry.stoppedByDropOff).length, entries.length);
  const shutdownRate = shutdownRecoveryPressureRate(entries, exercises, {
    block: options.currentBlockType,
    goal: options.goal,
  });
  const shutdownCounts = shutdownEvidenceCounts(entries, exercises, {
    block: options.currentBlockType,
    goal: options.goal,
  });
  const exercisePerformanceTrend = trendFromValues(entries.map((entry) => entry.bestSetReps));
  const fatigueTrend = deriveFatigueTrend(shutdownRate, qualitySetTrend, exercisePerformanceTrend);
  const recoveryTrend = deriveRecoveryTrend(options.recoverySignals);
  const stalledExercises = detectStalledExercises(entries, staleExerciseSessions);
  const muscleRates = calculateMuscleProgressionRates(entries, exercises);
  const progressingMuscles = muscleRates
    .filter((entry) => entry.progressionRate >= 0.35 && entry.samples >= 2)
    .map((entry) => entry.muscle);
  const undertrainedMuscles = calculateUndertrainedMuscles(sessions, exercises, options.referenceDate);
  const overreachedMuscles = calculateOverreachedMuscles(sessions, exercises, fatigueTrend);

  return {
    progressionRate,
    qualitySetTrend,
    fatigueTrend,
    volumeTolerance,
    exercisePerformanceTrend,
    recoveryTrend,
    stalledExercises,
    progressingMuscles,
    undertrainedMuscles,
    overreachedMuscles,
    sessionsAnalyzed: sessions.length,
    exerciseEntriesAnalyzed: entries.length,
    averageQualitySets: average(entries.map((entry) => entry.qualitySets)),
    shutdownRate,
    rawShutdownRate,
    shutdownEvidenceCounts: shutdownCounts,
  };
}

export function calculateBlockReadiness(
  signals: StrategicSignals,
  weights: ReadinessWeights = defaultReadinessWeights,
): BlockReadiness {
  const normalizedWeights = normalizeWeights(weights);
  const factors = {
    progression: scoreProgression(signals.progressionRate),
    qualitySets: scoreQualitySetTrend(signals.qualitySetTrend),
    fatigue: scoreFatigue(signals.fatigueTrend),
    volumeTolerance: scoreVolumeTolerance(signals.volumeTolerance),
    recovery: scoreRecovery(signals.recoveryTrend),
  };
  const score = clampScore(
    factors.progression * normalizedWeights.progression +
      factors.qualitySets * normalizedWeights.qualitySets +
      factors.fatigue * normalizedWeights.fatigue +
      factors.volumeTolerance * normalizedWeights.volumeTolerance +
      factors.recovery * normalizedWeights.recovery,
  );

  return {
    score,
    band: readinessBand(score),
    factors,
    signals,
    reasons: buildReadinessReasons(score, signals, factors),
  };
}

export function recommendStrategicAction(input: StrategicRecommendationInput): StrategicRecommendation {
  const signals = input.signals ?? input.readiness.signals;
  const successModel = getSuccessModel(input.goal);
  const currentBlockType = input.currentBlock.type;
  const nextBlockType = nextBlockForMode(input.planningMode, currentBlockType, input.plan);
  const hasMinimumDuration = input.currentBlock.currentWeek >= getMinWeeks(input.currentBlock);
  const atOrBeyondMax = input.currentBlock.currentWeek >= getMaxWeeks(input.currentBlock);
  const goalReason = successModelReason(successModel, signals);
  const deloadPrescription = resolveDeloadPrescription({ readiness: input.readiness, signals, currentBlockType });

  if (deloadPrescription && (input.readiness.score < 40 || signals.fatigueTrend === "high" || successModel.recommendationBias.deloadEarlier)) {
    return {
      outcome: "deload_then_continue",
      confidence: deloadPrescription.profile === "mild" ? "medium" : "high",
      message: deloadPrescription.coachCopy,
      reasons: [
        `${successModel.label}: ${goalReason}`,
        `${deloadPrescription.profile} deload profile: reduce productive sets ${deloadPrescription.productiveSetReductionPercent.min}-${deloadPrescription.productiveSetReductionPercent.max}%.`,
        ...input.readiness.reasons,
      ].slice(0, 5),
      nextBlockType: "deload",
      successModelGoal: successModel.goal,
      deloadProfile: deloadPrescription.profile,
    };
  }

  if (!hasDeloadEvidence(signals) && (input.readiness.score < 40 || signals.fatigueTrend === "high")) {
    return {
      outcome: "continue_block",
      confidence: "low",
      message: "Build more history first. The app is smart, not psychic.",
      reasons: [`${successModel.label}: ${goalReason}`, "Deloads need repeated completed-session evidence."].slice(0, 5),
      successModelGoal: successModel.goal,
    };
  }

  if (
    successModel.recommendationBias.volumeFirst &&
    signals.fatigueTrend === "low" &&
    signals.progressionRate < 0.2 &&
    (signals.undertrainedMuscles.length > 0 || signals.volumeTolerance === "stable")
  ) {
    return {
      outcome: "increase_volume",
      confidence: "medium",
      message: "Add a small amount of recoverable work.",
      reasons: [`${successModel.label}: ${goalReason}`, "Progress is flat while fatigue is low.", ...input.readiness.reasons].slice(0, 5),
      successModelGoal: successModel.goal,
    };
  }

  if (signals.volumeTolerance === "declining" || signals.overreachedMuscles.length > 0) {
    return {
      outcome: "reduce_volume",
      confidence: "medium",
      message: successModel.recommendationBias.keepSimple ? "Pull back a little before pushing again." : "Reduce volume before pushing the block forward.",
      reasons: [`${successModel.label}: ${goalReason}`, "Volume tolerance is declining or muscles look overreached.", ...input.readiness.reasons].slice(0, 5),
      successModelGoal: successModel.goal,
    };
  }

  if (!hasMinimumDuration) {
    return {
      outcome: input.readiness.score >= 85 && signals.volumeTolerance === "rising" ? "increase_volume" : "continue_block",
      confidence: "medium",
      message: "Continue the block until minimum exposure is reached.",
      reasons: [`${successModel.label}: ${goalReason}`, "Minimum block duration has not been reached.", ...input.readiness.reasons].slice(0, 5),
      successModelGoal: successModel.goal,
    };
  }

  if (input.readiness.score >= 85) {
    if (input.planningMode === "single_block") {
      return {
        outcome: "repeat_block",
        confidence: "high",
        message: `Repeat ${titleBlock(currentBlockType)} with the next loads earned from training history.`,
        reasons: [`${successModel.label}: ${goalReason}`, "Single Block mode repeats the chosen strategy instead of forcing a new phase.", ...input.readiness.reasons].slice(0, 5),
        nextBlockType: currentBlockType,
        successModelGoal: successModel.goal,
      };
    }

    return {
      outcome: "advance_block",
      confidence: "high",
      message: `${phaseVerb(input.planningMode)} ${titleBlock(nextBlockType)}.`,
      reasons: [`${successModel.label}: ${goalReason}`, "Readiness is high and fatigue is controlled.", ...input.readiness.reasons].slice(0, 5),
      nextBlockType,
      successModelGoal: successModel.goal,
    };
  }

  if (input.readiness.score >= 60) {
    return {
      outcome: atOrBeyondMax ? "extend_block" : "continue_block",
      confidence: "medium",
      message: atOrBeyondMax ? "Extend briefly or repeat before changing phase." : "Continue the current block.",
      reasons: [`${successModel.label}: ${goalReason}`, ...input.readiness.reasons].slice(0, 5),
      successModelGoal: successModel.goal,
    };
  }

  return {
    outcome: "extend_block",
    confidence: "medium",
    message: "Extend the block and monitor readiness.",
    reasons: [`${successModel.label}: ${goalReason}`, "Readiness is not low enough for a deload, but not high enough to advance.", ...input.readiness.reasons].slice(0, 5),
    successModelGoal: successModel.goal,
  };
}

export function calculateTrainingMomentum(signals: StrategicSignals): TrainingMomentum {
  const score = clampScore(
    scoreProgression(signals.progressionRate) * 0.35 +
      scoreVolumeTolerance(signals.volumeTolerance) * 0.25 +
      scoreFatigue(signals.fatigueTrend) * 0.25 +
      scoreQualitySetTrend(signals.qualitySetTrend) * 0.15,
  );
  const band = score >= 80 ? "Strong" : score >= 60 ? "Stable" : score >= 40 ? "Slowing" : "Declining";
  const reasons = [
    `Progression rate is ${Math.round(signals.progressionRate * 100)}%.`,
    `Quality set trend is ${signals.qualitySetTrend}.`,
    `Volume tolerance is ${signals.volumeTolerance}.`,
    `Fatigue trend is ${signals.fatigueTrend}.`,
  ];

  return { score, band, reasons };
}

function defaultBlocksForMode(mode: PlanningMode, goal: CoachingGoal): CoachingBlock[] {
  const blockTypes =
    mode === "guided_annual"
      ? guidedAnnualOrder
      : mode === "goal_event"
        ? blocksForGoal(goal)
        : mode === "single_block"
          ? [singleBlockForGoal(goal)]
          : guidedAnnualOrder;
  return blockTypes.map((type, index) => createCoachingBlock(type, index));
}

function blocksForGoal(goal: CoachingGoal): BlockType[] {
  if (goal.type === "powerlifting_meet") return ["powerbuilding", "strength", "peak"];
  if (goal.type === "holiday" || goal.type === "photoshoot") return ["hypertrophy", "hypertrophy", "deload"];
  if (goal.type === "sport_season") return ["powerbuilding", "power", "deload"];
  if (goal.type === "strength") return ["powerbuilding", "strength"];
  if (goal.type === "maintenance") return ["hypertrophy", "deload"];
  return ["hypertrophy", "powerbuilding", "strength"];
}

function singleBlockForGoal(goal: CoachingGoal): BlockType {
  if (goal.type === "strength" || goal.type === "powerlifting_meet") return "strength";
  if (goal.type === "maintenance") return "deload";
  return "hypertrophy";
}

function nextBlockForMode(mode: PlanningMode, currentBlockType: BlockType, plan?: CoachingPlan): BlockType {
  if (mode === "single_block") return currentBlockType;
  if (mode === "custom_sequence" && plan) {
    const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
    return plan.blocks[activeIndex + 1]?.type ?? currentBlockType;
  }
  if (mode === "goal_event" && plan) {
    const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
    return plan.blocks[activeIndex + 1]?.type ?? recommendNextBlock(createTrainingBlock(currentBlockType));
  }
  return recommendNextBlock(createTrainingBlock(currentBlockType));
}

function trendFromValues(values: number[]): TrendDirection {
  const clean = values.filter(Number.isFinite);
  if (clean.length < 3) return "insufficient_data";
  const midpoint = Math.floor(clean.length / 2);
  const early = average(clean.slice(0, midpoint));
  const late = average(clean.slice(midpoint));
  const delta = late - early;
  const tolerance = Math.max(0.5, Math.abs(early) * 0.08);
  if (delta > tolerance) return "rising";
  if (delta < -tolerance) return "falling";
  return "flat";
}

function volumeToleranceFromTrend(trend: TrendDirection): VolumeToleranceTrend {
  if (trend === "rising") return "rising";
  if (trend === "falling") return "declining";
  if (trend === "insufficient_data") return "insufficient_data";
  return "stable";
}

function deriveFatigueTrend(shutdownRate: number, qualitySetTrend: TrendDirection, performanceTrend: TrendDirection): FatigueTrend {
  let score = 0;
  if (shutdownRate >= 0.5) score += 3;
  else if (shutdownRate >= 0.35) score += 2;
  else if (shutdownRate >= 0.18) score += 1;
  if (qualitySetTrend === "falling") score += 1;
  if (performanceTrend === "falling") score += 1;
  return score >= 3 ? "high" : score >= 1 ? "moderate" : "low";
}

function deriveRecoveryTrend(recoverySignals?: RecoverySignals): StrategicSignals["recoveryTrend"] {
  if (!recoverySignals) return "unknown";
  const averageIssueRate = average([
    recoverySignals.sleepIssueRate ?? 0,
    recoverySignals.jointPainRate ?? 0,
    recoverySignals.motivationIssueRate ?? 0,
  ]);
  return averageIssueRate >= 0.35 ? "strained" : "stable";
}

function detectStalledExercises(entries: ExerciseHistorySummary[], staleSessions: number): string[] {
  const byExercise = groupBy(entries, (entry) => entry.exerciseId);
  return [...byExercise.values()]
    .filter((exerciseEntries) => exerciseEntries.length >= staleSessions)
    .filter((exerciseEntries) => exerciseEntries.slice(-staleSessions).every((entry) => !entry.progressionEarned))
    .map((exerciseEntries) => exerciseEntries.at(-1)?.exerciseName)
    .filter((name): name is string => Boolean(name));
}

function calculateMuscleProgressionRates(entries: ExerciseHistorySummary[], exercises: Exercise[]) {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const accumulator = new Map<MuscleGroup, { wins: number; samples: number }>();

  for (const entry of entries) {
    const exercise = exerciseById.get(entry.exerciseId);
    for (const muscle of exercise?.primaryMuscles ?? []) {
      const current = accumulator.get(muscle) ?? { wins: 0, samples: 0 };
      accumulator.set(muscle, {
        wins: current.wins + (entry.progressionEarned ? 1 : 0),
        samples: current.samples + 1,
      });
    }
  }

  return [...accumulator.entries()].map(([muscle, value]) => ({
    muscle,
    progressionRate: ratio(value.wins, value.samples),
    samples: value.samples,
  }));
}

function calculateUndertrainedMuscles(sessions: WorkoutHistorySummary[], exercises: Exercise[], referenceDate?: Date): MuscleGroup[] {
  const weeklySets = calculateRecentMuscleQualitySets(sessions, exercises, referenceDate);
  return Object.entries(defaultMuscleVolumeTargets)
    .filter(([muscle, target]) => (weeklySets.get(muscle as MuscleGroup) ?? 0) < target.min)
    .map(([muscle]) => muscle as MuscleGroup);
}

function calculateOverreachedMuscles(sessions: WorkoutHistorySummary[], exercises: Exercise[], fatigueTrend: FatigueTrend): MuscleGroup[] {
  const weeklySets = calculateRecentMuscleQualitySets(sessions, exercises);
  return Object.entries(defaultMuscleVolumeTargets)
    .filter(([muscle, target]) => (weeklySets.get(muscle as MuscleGroup) ?? 0) > target.max && fatigueTrend !== "low")
    .map(([muscle]) => muscle as MuscleGroup);
}

function calculateRecentMuscleQualitySets(sessions: WorkoutHistorySummary[], exercises: Exercise[], referenceDate?: Date): Map<MuscleGroup, number> {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const latestDate = referenceDate ?? new Date(sessions.at(-1)?.completedAt ?? Date.now());
  const from = new Date(latestDate);
  from.setDate(from.getDate() - 7);
  const sets = new Map<MuscleGroup, number>();

  for (const session of sessions) {
    const completedAt = new Date(session.completedAt);
    if (completedAt < from || completedAt > latestDate) continue;
    for (const summary of session.exerciseSummaries) {
      const exercise = exerciseById.get(summary.exerciseId);
      for (const muscle of exercise?.primaryMuscles ?? []) {
        sets.set(muscle, (sets.get(muscle) ?? 0) + summary.qualitySets);
      }
    }
  }

  return sets;
}

function scoreProgression(progressionRate: number): number {
  return clampScore(progressionRate * 140);
}

function scoreQualitySetTrend(trend: TrendDirection): number {
  if (trend === "rising") return 95;
  if (trend === "flat") return 72;
  if (trend === "falling") return 35;
  return 58;
}

function scoreFatigue(trend: FatigueTrend): number {
  if (trend === "low") return 95;
  if (trend === "moderate") return 58;
  return 18;
}

function scoreVolumeTolerance(trend: VolumeToleranceTrend): number {
  if (trend === "rising") return 95;
  if (trend === "stable") return 72;
  if (trend === "declining") return 30;
  return 58;
}

function scoreRecovery(trend: StrategicSignals["recoveryTrend"]): number {
  if (trend === "stable") return 90;
  if (trend === "strained") return 35;
  return 70;
}

function buildReadinessReasons(score: number, signals: StrategicSignals, factors: BlockReadiness["factors"]): string[] {
  const reasons = [`Readiness score is ${score}.`];
  reasons.push(`Progression rate is ${Math.round(signals.progressionRate * 100)}%.`);
  reasons.push(`Quality set trend is ${signals.qualitySetTrend}.`);
  reasons.push(`Fatigue is ${signals.fatigueTrend}.`);
  if (signals.volumeTolerance !== "insufficient_data") reasons.push(`Volume tolerance is ${signals.volumeTolerance}.`);
  if (factors.recovery < 50) reasons.push("Recovery placeholder signals are strained.");
  if (signals.stalledExercises.length > 0) reasons.push(`Stalled exercises: ${signals.stalledExercises.slice(0, 3).join(", ")}.`);
  return reasons.slice(0, 6);
}

function readinessBand(score: number): BlockReadiness["band"] {
  if (score >= 85) return "ready";
  if (score >= 60) return "continue";
  if (score >= 40) return "monitor";
  return "deload_or_adjust";
}

function normalizeWeights(weights: ReadinessWeights): ReadinessWeights {
  const total = weights.progression + weights.qualitySets + weights.fatigue + weights.volumeTolerance + weights.recovery;
  if (total <= 0) return defaultReadinessWeights;
  return {
    progression: weights.progression / total,
    qualitySets: weights.qualitySets / total,
    fatigue: weights.fatigue / total,
    volumeTolerance: weights.volumeTolerance / total,
    recovery: weights.recovery / total,
  };
}

function getMinWeeks(block: CoachingBlock | TrainingBlock): number {
  return "minWeeks" in block ? block.minWeeks : Math.max(1, Math.floor(block.durationWeeks * 0.67));
}

function getMaxWeeks(block: CoachingBlock | TrainingBlock): number {
  return "maxWeeks" in block ? block.maxWeeks : Math.max(block.durationWeeks, block.durationWeeks + 2);
}

function phaseVerb(mode: PlanningMode): string {
  if (mode === "goal_event") return "Move to";
  if (mode === "custom_sequence") return "Advance to";
  return "Advance to";
}

function labelPlan(mode: PlanningMode, goal: CoachingGoal): string {
  if (mode === "guided_annual") return "Guided Annual Plan";
  if (mode === "goal_event") return `${titleGoal(goal.type)} Plan`;
  if (mode === "single_block") return `${titleBlock(singleBlockForGoal(goal))} Single Block`;
  return "Custom Coaching Sequence";
}

function titleGoal(goal: CoachingGoalType): string {
  return goal.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleBlock(block: BlockType): string {
  return block === "strength_hypertrophy" ? "Powerbuilding" : block.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ratio(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : numerator / denominator;
}

function average(values: number[]): number {
  const clean = values.filter(Number.isFinite);
  return clean.length === 0 ? 0 : clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function groupBy<T, K>(values: T[], keyFor: (value: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const value of values) {
    const key = keyFor(value);
    map.set(key, [...(map.get(key) ?? []), value]);
  }
  return map;
}
