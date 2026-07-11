import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseHistorySummary, ExperienceLevel, RepRange, SetLog } from "@/domain/training/models";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import { getWorkSets } from "@/domain/training/workout-sets";

export type RepRangeOccupancyStyle = "heavy_biased" | "balanced" | "volume_biased" | "insufficient_data";
export type RepRangeOccupancyTrend = "rising" | "stable" | "falling" | "insufficient_data";
export type RepRangeOccupancyConfidence = "high" | "medium" | "low" | "insufficient_data";

export interface RepRangeOccupancyInput {
  exerciseId?: string;
  targetRepRange: RepRange;
  completedProductiveWorkSets?: SetLog[];
  recentExerciseHistory?: ExerciseHistorySummary[];
  block?: BlockType;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  fatigueSignal?: "low" | "moderate" | "high";
  progressionSignal?: "improving" | "stable" | "declining";
}

export interface RepRangeOccupancyResult {
  occupancyScore: number;
  averagePositionInRange: number;
  averageReps: number;
  trend: RepRangeOccupancyTrend;
  confidence: RepRangeOccupancyConfidence;
  style: RepRangeOccupancyStyle;
  exposures: number;
  productiveSets: number;
  evidence: string[];
}

interface OccupancyExposure {
  completedAt?: string;
  averageReps: number;
  productiveSets: number;
}

const MIN_EXPOSURES = 2;
const MIN_PRODUCTIVE_SETS = 6;

export function resolveRepRangeOccupancy(input: RepRangeOccupancyInput): RepRangeOccupancyResult {
  const exposures = buildExposures(input);
  const totalProductiveSets = exposures.reduce((sum, exposure) => sum + exposure.productiveSets, 0);
  if (!isUsableRange(input.targetRepRange) || exposures.length < MIN_EXPOSURES || totalProductiveSets < MIN_PRODUCTIVE_SETS) {
    return insufficient(input, exposures.length, totalProductiveSets);
  }

  const weightedAverageReps = weightedAverage(
    exposures.map((exposure) => exposure.averageReps),
    exposures.map((exposure) => exposure.productiveSets),
  );
  const averagePosition = positionInRange(weightedAverageReps, input.targetRepRange);
  const positions = exposures.map((exposure) => positionInRange(exposure.averageReps, input.targetRepRange));
  const trend = trendFromPositions(positions);
  const style = styleFromPosition(averagePosition);
  const confidence = confidenceFrom(exposures, totalProductiveSets, positions);

  return {
    occupancyScore: round(averagePosition),
    averagePositionInRange: round(averagePosition),
    averageReps: round(weightedAverageReps),
    trend,
    confidence,
    style,
    exposures: exposures.length,
    productiveSets: totalProductiveSets,
    evidence: [
      `${exposures.length} exercise exposure(s) analysed.`,
      `${totalProductiveSets} productive work set(s) analysed.`,
      `Average reps: ${round(weightedAverageReps)} in a ${input.targetRepRange.min}-${input.targetRepRange.max} range.`,
      evidenceForStyle(style, input),
      trend === "insufficient_data" ? null : `Rep-range trend: ${trend}.`,
    ].filter((item): item is string => Boolean(item)),
  };
}

export function canProgressFromHeavyRangeOccupancy(result: RepRangeOccupancyResult): boolean {
  return (
    result.style === "heavy_biased" &&
    (result.confidence === "medium" || result.confidence === "high") &&
    (result.trend === "stable" || result.trend === "rising")
  );
}

function buildExposures(input: RepRangeOccupancyInput): OccupancyExposure[] {
  const directSets = getWorkSets(input.completedProductiveWorkSets ?? []).filter((set) => Number.isFinite(set.reps) && set.reps > 0);
  if (directSets.length > 0) {
    return [
      {
        averageReps: average(directSets.map((set) => set.reps)),
        productiveSets: directSets.length,
      },
    ];
  }

  return (input.recentExerciseHistory ?? [])
    .filter((entry) => !input.exerciseId || entry.exerciseId === input.exerciseId)
    .filter((entry) => entry.qualitySets > 0 && entry.repsCompleted > 0)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime())
    .map((entry) => ({
      completedAt: entry.completedAt,
      averageReps: entry.repsCompleted / Math.max(1, entry.qualitySets),
      productiveSets: entry.qualitySets,
    }));
}

function insufficient(input: RepRangeOccupancyInput, exposures: number, productiveSets: number): RepRangeOccupancyResult {
  return {
    occupancyScore: 0,
    averagePositionInRange: 0,
    averageReps: 0,
    trend: "insufficient_data",
    confidence: "insufficient_data",
    style: "insufficient_data",
    exposures,
    productiveSets,
    evidence: [
      exposures < MIN_EXPOSURES ? `Need at least ${MIN_EXPOSURES} exposures for rep-range occupancy.` : null,
      productiveSets < MIN_PRODUCTIVE_SETS ? `Need at least ${MIN_PRODUCTIVE_SETS} productive work sets.` : null,
      !isUsableRange(input.targetRepRange) ? "Target range is not wide enough to classify occupancy." : null,
    ].filter((item): item is string => Boolean(item)),
  };
}

function isUsableRange(range: RepRange): boolean {
  return Number.isFinite(range.min) && Number.isFinite(range.max) && range.max > range.min;
}

function positionInRange(reps: number, range: RepRange): number {
  return clamp((reps - range.min) / (range.max - range.min), 0, 1);
}

function styleFromPosition(position: number): RepRangeOccupancyStyle {
  if (position <= 0.35) return "heavy_biased";
  if (position >= 0.65) return "volume_biased";
  return "balanced";
}

function trendFromPositions(positions: number[]): RepRangeOccupancyTrend {
  if (positions.length < 2) return "insufficient_data";
  const first = average(positions.slice(0, Math.max(1, Math.floor(positions.length / 2))));
  const last = average(positions.slice(Math.floor(positions.length / 2)));
  if (last >= first + 0.1) return "rising";
  if (last <= first - 0.1) return "falling";
  return "stable";
}

function confidenceFrom(exposures: OccupancyExposure[], productiveSets: number, positions: number[]): RepRangeOccupancyConfidence {
  if (exposures.length < MIN_EXPOSURES || productiveSets < MIN_PRODUCTIVE_SETS) return "insufficient_data";
  const spread = standardDeviation(positions);
  if (exposures.length >= 3 && productiveSets >= 9 && spread <= 0.25) return "high";
  return spread <= 0.35 ? "medium" : "low";
}

function evidenceForStyle(style: RepRangeOccupancyStyle, input: RepRangeOccupancyInput): string {
  if (style === "heavy_biased") return "Recent work usually sits near the heavy end of the range.";
  if (style === "volume_biased") return input.goal === "build_muscle"
    ? "Recent work consistently reaches the top end of the range."
    : "Recent work usually sits near the top end of the range.";
  if (style === "balanced") return "Recent work is spread through the middle of the range.";
  return "Not enough data to classify range behaviour.";
}

function weightedAverage(values: number[], weights: number[]): number {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  return values.reduce((sum, value, index) => sum + value * (weights[index] ?? 0), 0) / totalWeight;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number): number {
  return Number(value.toFixed(2));
}
