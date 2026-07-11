import type { BlockType } from "@/domain/training/annual-models";
import type { BlockReadiness, StrategicSignals } from "@/domain/training/strategic-coaching";
import { evidence, insufficientEvidence, type RecommendationEvidence } from "@/domain/training/recommendation-evidence";

export type DeloadProfile = "mild" | "clear" | "severe";

export interface DeloadPrescription {
  profile: DeloadProfile;
  durationWeeks: 1;
  productiveSetReductionPercent: {
    min: number;
    max: number;
  };
  loadReductionPercent: {
    min: number;
    max: number;
  };
  lowerSoftCaps: boolean;
  suppressEscalationPrompts: boolean;
  suppressAggressiveProgression: boolean;
  exerciseSelection: string;
  coachCopy: string;
  evidence: RecommendationEvidence;
}

export interface DeloadPrescriptionInput {
  readiness: BlockReadiness;
  signals?: StrategicSignals;
  currentBlockType?: BlockType;
}

export const MIN_DELOAD_PLANNED_SESSIONS = 4;
export const MIN_DELOAD_EXERCISE_ENTRIES = 4;

const profileDefaults: Record<DeloadProfile, Omit<DeloadPrescription, "profile" | "evidence">> = {
  mild: {
    durationWeeks: 1,
    productiveSetReductionPercent: { min: 30, max: 40 },
    loadReductionPercent: { min: 5, max: 10 },
    lowerSoftCaps: false,
    suppressEscalationPrompts: true,
    suppressAggressiveProgression: true,
    exerciseSelection: "Keep familiar main patterns and remove low-priority extras.",
    coachCopy: "Pull back before pushing again.",
  },
  clear: {
    durationWeeks: 1,
    productiveSetReductionPercent: { min: 40, max: 60 },
    loadReductionPercent: { min: 10, max: 15 },
    lowerSoftCaps: true,
    suppressEscalationPrompts: true,
    suppressAggressiveProgression: true,
    exerciseSelection: "Favor stable, low-risk exercises and keep the work easy to recover from.",
    coachCopy: "Performance is dropping and fatigue is rising. Take a lighter week, then push again.",
  },
  severe: {
    durationWeeks: 1,
    productiveSetReductionPercent: { min: 50, max: 70 },
    loadReductionPercent: { min: 15, max: 25 },
    lowerSoftCaps: true,
    suppressEscalationPrompts: true,
    suppressAggressiveProgression: true,
    exerciseSelection: "Remove high-fatigue extras and use conservative prescriptions.",
    coachCopy: "Pull back hard. Get output back before chasing more.",
  },
};

export function buildDeloadPrescription(profile: DeloadProfile, dataPoints: string[] = []): DeloadPrescription {
  const defaults = profileDefaults[profile];
  return {
    profile,
    ...defaults,
    evidence: evidence({
      type: "deload_prescription",
      confidence: profile === "mild" ? "medium" : "high",
      source: "history",
      summary: `${titleProfile(profile)} deload prescription.`,
      dataPoints: dataPoints.length > 0 ? dataPoints : [`${titleProfile(profile)} fatigue profile selected.`],
      reason: defaults.coachCopy,
      actionAllowed: true,
    }),
  };
}

export function resolveDeloadPrescription(input: DeloadPrescriptionInput): DeloadPrescription | null {
  const signals = input.signals ?? input.readiness.signals;
  if (!hasDeloadEvidence(signals)) return null;

  const severe =
    input.readiness.score < 30 ||
    (signals.fatigueTrend === "high" && signals.qualitySetTrend === "falling" && signals.exercisePerformanceTrend === "falling") ||
    (signals.shutdownRate >= 0.5 && signals.averageQualitySets <= 2);
  const clear =
    input.readiness.score < 40 ||
    signals.fatigueTrend === "high" ||
    (signals.volumeTolerance === "declining" && signals.exercisePerformanceTrend === "falling");

  if (severe) return buildDeloadPrescription("severe", deloadDataPoints(signals, input.readiness.score));
  if (clear) return buildDeloadPrescription("clear", deloadDataPoints(signals, input.readiness.score));
  if (signals.fatigueTrend === "moderate" && signals.volumeTolerance === "declining") {
    return buildDeloadPrescription("mild", deloadDataPoints(signals, input.readiness.score));
  }
  return null;
}

export function hasDeloadEvidence(signals: StrategicSignals): boolean {
  if (signals.sessionsAnalyzed < MIN_DELOAD_PLANNED_SESSIONS || signals.exerciseEntriesAnalyzed < MIN_DELOAD_EXERCISE_ENTRIES) return false;
  const repeatedShutdownPressure = signals.shutdownRate >= 0.35;
  if (!repeatedShutdownPressure) return false;
  return signals.fatigueTrend === "high" || signals.volumeTolerance === "declining" || signals.qualitySetTrend === "falling";
}

export function insufficientDeloadEvidence(): RecommendationEvidence {
  return insufficientEvidence("deload", "Deloads need repeated completed-session evidence, not one bad workout.");
}

function deloadDataPoints(signals: StrategicSignals, readinessScore: number): string[] {
  return [
    `${signals.sessionsAnalyzed} completed workouts analysed`,
    `Readiness score ${readinessScore}`,
    `Fatigue is ${signals.fatigueTrend}`,
    `Quality set trend is ${signals.qualitySetTrend}`,
    `Regressive shutdown pressure ${Math.round(signals.shutdownRate * 100)}%`,
  ];
}

function titleProfile(profile: DeloadProfile): string {
  return profile === "clear" ? "Clear fatigue" : profile.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
