import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseHistorySummary, SetLog, TrainingLane } from "@/domain/training/models";
import { getWorkSets } from "@/domain/training/workout-sets";

export type PowerQualityStatus = "sharp" | "acceptable" | "degrading" | "insufficient_data";
export type PowerQualityConfidence = "high" | "medium" | "low" | "insufficient_data";

export interface PowerQualityInput {
  repTarget: number;
  completedProductiveWorkSets?: SetLog[];
  recentExercisePerformance?: ExerciseHistorySummary[];
  targetWorkSets?: number;
  missedWorkCount?: number;
  shutdownDropOffRate?: number;
  fatigueSignal?: "low" | "moderate" | "high";
  qualitySetTrend?: "rising" | "stable" | "falling";
  trainingLane?: TrainingLane;
  currentBlock?: BlockType | null;
}

export interface PowerQualityResult {
  status: PowerQualityStatus;
  confidence: PowerQualityConfidence;
  reason: string;
  coachCopy: string;
  evidence: string[];
  metrics: {
    workSetsAnalysed: number;
    exposuresAnalysed: number;
    averageReps: number;
    consistencyDrop: number;
    missedWorkCount: number;
    shutdownDropOffRate: number;
    fatigueSignal: "low" | "moderate" | "high";
    trend: "rising" | "stable" | "falling";
  };
}

const minimumWorkSets = 2;
const minimumExposures = 2;

export function resolvePowerQuality(input: PowerQualityInput): PowerQualityResult {
  const target = Number.isFinite(input.repTarget) && input.repTarget > 0 ? input.repTarget : 3;
  const workSets = getWorkSets(input.completedProductiveWorkSets ?? []).filter((set) => Number.isFinite(set.reps) && set.reps > 0);
  const exposures = sortedEntries(input.recentExercisePerformance ?? []);
  const reps = workSets.length > 0 ? workSets.map((set) => set.reps) : exposureAverages(exposures);
  const workSetsAnalysed = workSets.length > 0 ? workSets.length : exposures.reduce((sum, entry) => sum + Math.max(0, entry.qualitySets), 0);
  const enoughData = workSets.length >= minimumWorkSets || exposures.length >= minimumExposures;
  const averageReps = average(reps);
  const consistencyDrop = consistencyDropFrom(reps, target);
  const shutdownDropOffRate = input.shutdownDropOffRate ?? rate(exposures, (entry) => entry.stoppedByDropOff);
  const missedWorkCount = input.missedWorkCount ?? missedWorkFrom({ workSets, exposures, target, targetWorkSets: input.targetWorkSets });
  const trend = input.qualitySetTrend ?? trendFrom(exposures);
  const fatigueSignal = input.fatigueSignal ?? fatigueFrom({ shutdownDropOffRate, trend, exposures });
  const isPowerContext = input.trainingLane === "power" || input.currentBlock === "power";

  const metrics = {
    workSetsAnalysed,
    exposuresAnalysed: exposures.length,
    averageReps: round1(averageReps),
    consistencyDrop: round2(consistencyDrop),
    missedWorkCount,
    shutdownDropOffRate: round2(shutdownDropOffRate),
    fatigueSignal,
    trend,
  };

  if (!isPowerContext || !enoughData) {
    return {
      status: "insufficient_data",
      confidence: "insufficient_data",
      reason: !isPowerContext ? "Power quality only applies to power-lane work." : "Not enough completed power work yet.",
      coachCopy: "Keep quality high.",
      evidence: [
        !isPowerContext ? "Training lane is not power." : null,
        `${workSets.length} current work set(s) and ${exposures.length} prior exposure(s) analysed.`,
        "Power quality needs repeated completed work, not a guess.",
      ].filter((item): item is string => Boolean(item)),
      metrics,
    };
  }

  const degradingSignals = [
    fatigueSignal === "high" ? "fatigue is high" : null,
    shutdownDropOffRate >= 0.34 ? "shutdown/drop-off is recurring" : null,
    missedWorkCount >= 2 ? "planned work is being missed" : null,
    trend === "falling" ? "recent output is falling" : null,
    consistencyDrop >= 0.35 ? "set-to-set output is dropping" : null,
  ].filter((item): item is string => Boolean(item));

  if (degradingSignals.length > 0) {
    return {
      status: "degrading",
      confidence: degradingSignals.length >= 2 || fatigueSignal === "high" ? "high" : "medium",
      reason: "Power output is fading from objective training signals.",
      coachCopy: "Speed is fading. Pull back.",
      evidence: [
        "Power lane: protect speed before chasing load or volume.",
        ...degradingSignals,
        evidenceLine(metrics),
      ],
      metrics,
    };
  }

  const acceptableSignals = [
    fatigueSignal === "moderate" ? "fatigue is moderate" : null,
    missedWorkCount === 1 ? "one planned work target was missed" : null,
    consistencyDrop >= 0.2 ? "minor set-to-set drop" : null,
  ].filter((item): item is string => Boolean(item));

  if (acceptableSignals.length > 0) {
    return {
      status: "acceptable",
      confidence: exposures.length >= 2 || workSets.length >= 3 ? "medium" : "low",
      reason: "Power work is completed, but quality is not sharp enough to push.",
      coachCopy: "Keep quality high.",
      evidence: [
        "Power lane work was completed with minor degradation.",
        ...acceptableSignals,
        evidenceLine(metrics),
      ],
      metrics,
    };
  }

  return {
    status: "sharp",
    confidence: exposures.length >= 2 || workSets.length >= 3 ? "high" : "medium",
    reason: "Power output looks stable and fatigue is low.",
    coachCopy: "Power looks sharp.",
    evidence: [
      "All analysed power work was completed.",
      "Set-to-set output stayed stable.",
      "Fatigue signal is low.",
      evidenceLine(metrics),
    ],
    metrics,
  };
}

function sortedEntries(entries: ExerciseHistorySummary[]): ExerciseHistorySummary[] {
  return [...entries].sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
}

function exposureAverages(entries: ExerciseHistorySummary[]): number[] {
  return entries
    .filter((entry) => entry.qualitySets > 0 && entry.repsCompleted > 0)
    .map((entry) => entry.repsCompleted / Math.max(1, entry.qualitySets));
}

function missedWorkFrom({
  workSets,
  exposures,
  target,
  targetWorkSets,
}: {
  workSets: SetLog[];
  exposures: ExerciseHistorySummary[];
  target: number;
  targetWorkSets?: number;
}): number {
  if (workSets.length > 0) {
    const missedReps = workSets.filter((set) => set.reps < target).length;
    const missedSets = targetWorkSets && targetWorkSets > workSets.length ? targetWorkSets - workSets.length : 0;
    return missedReps + missedSets;
  }
  return exposures.reduce((sum, entry) => {
    const expectedSets = targetWorkSets ?? entry.setsCompleted;
    const missedSets = Math.max(0, expectedSets - entry.qualitySets);
    const missedReps = entry.bestSetReps < target ? 1 : 0;
    return sum + missedSets + missedReps;
  }, 0);
}

function consistencyDropFrom(values: number[], target: number): number {
  if (values.length < 2) return 0;
  const best = Math.max(...values);
  const latest = values.at(-1) ?? best;
  return best <= 0 ? 0 : Math.max(0, (best - latest) / Math.max(target, best));
}

function trendFrom(entries: ExerciseHistorySummary[]): "rising" | "stable" | "falling" {
  if (entries.length < 3) return "stable";
  const values = entries.map((entry) => entry.qualitySets);
  if (strictlyDeclining(values) || strictlyDeclining(entries.map((entry) => entry.bestSetReps))) return "falling";
  if (strictlyRising(values) || strictlyRising(entries.map((entry) => entry.bestSetReps))) return "rising";
  return "stable";
}

function fatigueFrom({
  shutdownDropOffRate,
  trend,
  exposures,
}: {
  shutdownDropOffRate: number;
  trend: "rising" | "stable" | "falling";
  exposures: ExerciseHistorySummary[];
}): "low" | "moderate" | "high" {
  if (shutdownDropOffRate >= 0.34 || trend === "falling") return "high";
  if (shutdownDropOffRate > 0 || exposures.some((entry) => entry.qualitySets < entry.setsCompleted)) return "moderate";
  return "low";
}

function rate(entries: ExerciseHistorySummary[], predicate: (entry: ExerciseHistorySummary) => boolean): number {
  if (entries.length === 0) return 0;
  return entries.filter(predicate).length / entries.length;
}

function strictlyDeclining(values: number[]): boolean {
  return values.length >= 3 && values.every((value, index) => index === 0 || value < values[index - 1]!);
}

function strictlyRising(values: number[]): boolean {
  return values.length >= 3 && values.every((value, index) => index === 0 || value > values[index - 1]!);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evidenceLine(metrics: PowerQualityResult["metrics"]): string {
  return `${metrics.workSetsAnalysed} work set(s), ${metrics.exposuresAnalysed} prior exposure(s), ${Math.round(metrics.shutdownDropOffRate * 100)}% drop-off rate.`;
}

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}
