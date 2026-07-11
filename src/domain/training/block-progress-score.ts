import type { InitialBlockStrategyId } from "@/domain/training/block-strategy";

export type BlockProgressBand =
  | "strong_progress"
  | "useful_progress"
  | "unclear_neutral"
  | "poor_progress"
  | "regression";

export type BlockMetricTrend =
  | "strong_up"
  | "up"
  | "flat"
  | "down"
  | "strong_down"
  | "unknown";

export type VolumeToleranceTrend = "improved" | "maintained" | "reduced" | "unknown";
export type EvidenceNoise = "low" | "moderate" | "high";

export interface BlockProgressEvidence {
  blockStrategyId: InitialBlockStrategyId;
  completedWeeks: number;
  plannedWeeks: number;
  completedSessions: number;
  plannedSessions: number;
  comparableExerciseExposures: number;
  primaryMetricTrend: BlockMetricTrend;
  secondaryMetricTrend: BlockMetricTrend;
  volumeToleranceTrend: VolumeToleranceTrend;
  mainLiftTrend?: BlockMetricTrend;
  hypertrophyWorkTrend?: BlockMetricTrend;
  capacityTrend?: BlockMetricTrend;
  preservationTrend?: BlockMetricTrend;
  evidenceNoise: EvidenceNoise;
  missedSessionCount: number;
}

export interface BlockProgressScore {
  score: number;
  band: BlockProgressBand;
  primaryAdaptationScore: number;
  secondaryAdaptationScore: number;
  completionScore: number;
  evidenceQualityScore: number;
  summary: string;
  rationale: string[];
  confidence: number;
}

const supportedStrategies: InitialBlockStrategyId[] = [
  "hypertrophy_accumulation",
  "strength_accumulation",
  "concurrent_development",
  "general_physical_preparation",
  "muscle_strength_preservation",
];

export function calculateBlockProgressScore(evidence: BlockProgressEvidence): BlockProgressScore {
  if (!supportedStrategies.includes(evidence.blockStrategyId)) {
    return neutralProgressScore("Unsupported block strategy for progress scoring.");
  }

  const primaryAdaptationScore = clampScore(primaryScoreForStrategy(evidence));
  const secondaryAdaptationScore = clampScore(secondaryScoreForStrategy(evidence));
  const completionScore = clampScore(scoreCompletion(evidence));
  const evidenceQualityScore = clampScore(scoreEvidenceQuality(evidence));
  const weightedScore =
    primaryAdaptationScore * 0.5
      + secondaryAdaptationScore * 0.2
      + completionScore * 0.15
      + evidenceQualityScore * 0.15;
  const score = coreProgressEvidenceIsUnknown(evidence)
    ? clampScore(Math.max(45, Math.min(64, weightedScore)))
    : clampScore(weightedScore);
  const band = bandForScore(score);

  return {
    score,
    band,
    primaryAdaptationScore,
    secondaryAdaptationScore,
    completionScore,
    evidenceQualityScore,
    summary: summaryForBand(band),
    rationale: rationaleForScore(evidence, {
      primaryAdaptationScore,
      secondaryAdaptationScore,
      completionScore,
      evidenceQualityScore,
    }),
    confidence: clampScore(Math.round(evidenceQualityScore * 0.75 + completionScore * 0.25)),
  };
}

function primaryScoreForStrategy(evidence: BlockProgressEvidence): number {
  switch (evidence.blockStrategyId) {
    case "hypertrophy_accumulation":
      if (evidence.primaryMetricTrend === "down" || evidence.primaryMetricTrend === "strong_down" || evidence.hypertrophyWorkTrend === "down" || evidence.hypertrophyWorkTrend === "strong_down") {
        return averageScores([
          trendScore(evidence.primaryMetricTrend),
          trendScore(evidence.hypertrophyWorkTrend),
          volumeToleranceScore(evidence.volumeToleranceTrend),
        ]);
      }
      return maxScore([
        trendScore(evidence.primaryMetricTrend),
        trendScore(evidence.hypertrophyWorkTrend),
        volumeToleranceScore(evidence.volumeToleranceTrend),
        maintainedPerformanceWithVolume(evidence),
      ]);
    case "strength_accumulation":
      return maxScore([
        trendScore(evidence.mainLiftTrend),
        trendScore(evidence.primaryMetricTrend),
      ]);
    case "concurrent_development":
      return concurrentPrimaryScore(evidence);
    case "general_physical_preparation":
      return averageScores([
        trendScore(evidence.primaryMetricTrend),
        trendScore(evidence.capacityTrend),
        noStrengthCollapseScore(evidence),
      ]);
    case "muscle_strength_preservation":
      return preservationPrimaryScore(evidence);
    default:
      return 50;
  }
}

function secondaryScoreForStrategy(evidence: BlockProgressEvidence): number {
  switch (evidence.blockStrategyId) {
    case "hypertrophy_accumulation":
      return averageScores([
        trendScore(evidence.secondaryMetricTrend),
        volumeToleranceScore(evidence.volumeToleranceTrend),
      ]);
    case "strength_accumulation":
      return averageScores([
        trendScore(evidence.secondaryMetricTrend),
        trendScore(evidence.hypertrophyWorkTrend),
      ]);
    case "concurrent_development":
      return averageScores([
        trendScore(evidence.secondaryMetricTrend),
        volumeToleranceScore(evidence.volumeToleranceTrend),
      ]);
    case "general_physical_preparation":
      return averageScores([
        trendScore(evidence.secondaryMetricTrend),
        volumeToleranceScore(evidence.volumeToleranceTrend),
      ]);
    case "muscle_strength_preservation":
      return averageScores([
        trendScore(evidence.secondaryMetricTrend),
        trendScore(evidence.hypertrophyWorkTrend),
      ]);
    default:
      return 50;
  }
}

function concurrentPrimaryScore(evidence: BlockProgressEvidence): number {
  const strength = trendScore(evidence.mainLiftTrend ?? evidence.primaryMetricTrend);
  const hypertrophy = trendScore(evidence.hypertrophyWorkTrend ?? evidence.secondaryMetricTrend);
  const tradeOffPenalty = strength <= 30 && hypertrophy >= 70 ? 25 : 0;
  return averageScores([strength, hypertrophy]) - tradeOffPenalty;
}

function preservationPrimaryScore(evidence: BlockProgressEvidence): number {
  const preservation = evidence.preservationTrend ?? evidence.primaryMetricTrend;
  if (preservation === "flat") return 78;
  if (preservation === "up" || preservation === "strong_up") return 88;
  return trendScore(preservation);
}

function maintainedPerformanceWithVolume(evidence: BlockProgressEvidence): number {
  const maintained = evidence.primaryMetricTrend === "flat" || evidence.secondaryMetricTrend === "flat";
  if (maintained && evidence.volumeToleranceTrend === "improved") return 88;
  if (maintained && evidence.volumeToleranceTrend === "maintained") return 70;
  return 50;
}

function noStrengthCollapseScore(evidence: BlockProgressEvidence): number {
  const mainLift = evidence.mainLiftTrend ?? evidence.primaryMetricTrend;
  if (mainLift === "strong_down") return 10;
  if (mainLift === "down") return 35;
  if (mainLift === "flat") return 68;
  return trendScore(mainLift);
}

function trendScore(trend: BlockMetricTrend | undefined): number {
  switch (trend) {
    case "strong_up":
      return 94;
    case "up":
      return 78;
    case "flat":
      return 58;
    case "down":
      return 32;
    case "strong_down":
      return 12;
    case "unknown":
    case undefined:
      return 50;
  }
}

function volumeToleranceScore(trend: VolumeToleranceTrend): number {
  switch (trend) {
    case "improved":
      return 86;
    case "maintained":
      return 66;
    case "reduced":
      return 28;
    case "unknown":
      return 50;
  }
}

function scoreCompletion(evidence: BlockProgressEvidence): number {
  const plannedSessions = Math.max(0, evidence.plannedSessions);
  if (plannedSessions === 0) return 50;
  const sessionCompletion = evidence.completedSessions / plannedSessions;
  const weekCompletion = evidence.plannedWeeks > 0 ? evidence.completedWeeks / evidence.plannedWeeks : sessionCompletion;
  const missedPenalty = Math.min(25, Math.max(0, evidence.missedSessionCount) * 4);
  return Math.round(((sessionCompletion * 0.75 + weekCompletion * 0.25) * 100) - missedPenalty);
}

function scoreEvidenceQuality(evidence: BlockProgressEvidence): number {
  const exposureScore = exposureQualityScore(evidence.comparableExerciseExposures);
  const completionSignal = evidence.plannedSessions > 0
    ? Math.min(100, Math.round((evidence.completedSessions / evidence.plannedSessions) * 100))
    : 50;
  const noisePenalty = evidenceNoisePenalty(evidence.evidenceNoise);
  const unknownPenalty = unknownTrendPenalty(evidence);
  return Math.round(exposureScore * 0.55 + completionSignal * 0.3 + (100 - noisePenalty) * 0.15 - unknownPenalty);
}

function exposureQualityScore(exposures: number): number {
  if (exposures >= 8) return 94;
  if (exposures >= 5) return 82;
  if (exposures >= 3) return 68;
  if (exposures >= 1) return 45;
  return 25;
}

function evidenceNoisePenalty(noise: EvidenceNoise): number {
  switch (noise) {
    case "low":
      return 0;
    case "moderate":
      return 18;
    case "high":
      return 36;
  }
}

function unknownTrendPenalty(evidence: BlockProgressEvidence): number {
  const trends = [
    evidence.primaryMetricTrend,
    evidence.secondaryMetricTrend,
    evidence.volumeToleranceTrend,
    evidence.mainLiftTrend,
    evidence.hypertrophyWorkTrend,
    evidence.capacityTrend,
    evidence.preservationTrend,
  ];
  return Math.min(20, trends.filter((trend) => trend === "unknown" || trend === undefined).length * 3);
}

function bandForScore(score: number): BlockProgressBand {
  if (score >= 85) return "strong_progress";
  if (score >= 65) return "useful_progress";
  if (score >= 45) return "unclear_neutral";
  if (score >= 25) return "poor_progress";
  return "regression";
}

function coreProgressEvidenceIsUnknown(evidence: BlockProgressEvidence): boolean {
  return evidence.primaryMetricTrend === "unknown"
    && evidence.secondaryMetricTrend === "unknown"
    && evidence.volumeToleranceTrend === "unknown";
}

function summaryForBand(band: BlockProgressBand): string {
  switch (band) {
    case "strong_progress":
      return "Block produced strong objective progress toward its promised adaptation.";
    case "useful_progress":
      return "Block produced useful objective progress.";
    case "unclear_neutral":
      return "Progress signal is unclear or broadly neutral.";
    case "poor_progress":
      return "Block produced weak objective progress.";
    case "regression":
      return "Objective training performance regressed.";
  }
}

function rationaleForScore(
  evidence: BlockProgressEvidence,
  scores: Pick<BlockProgressScore, "primaryAdaptationScore" | "secondaryAdaptationScore" | "completionScore" | "evidenceQualityScore">,
): string[] {
  return [
    `Primary adaptation score: ${scores.primaryAdaptationScore}.`,
    `Secondary adaptation support score: ${scores.secondaryAdaptationScore}.`,
    `Completion score: ${scores.completionScore}.`,
    `Evidence quality score: ${scores.evidenceQualityScore}.`,
    `Comparable exposures: ${evidence.comparableExerciseExposures}; evidence noise: ${evidence.evidenceNoise}.`,
  ];
}

function neutralProgressScore(reason: string): BlockProgressScore {
  return {
    score: 50,
    band: "unclear_neutral",
    primaryAdaptationScore: 50,
    secondaryAdaptationScore: 50,
    completionScore: 50,
    evidenceQualityScore: 50,
    summary: "Progress signal is unclear or broadly neutral.",
    rationale: [reason],
    confidence: 40,
  };
}

function averageScores(scores: number[]): number {
  if (scores.length === 0) return 50;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function maxScore(scores: number[]): number {
  return Math.max(...scores);
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
