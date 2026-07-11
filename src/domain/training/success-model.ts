import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { ReadinessWeights, StrategicSignals } from "@/domain/training/strategic-coaching";

export type SuccessModelGoal = TrainingSetupGoal;

export interface SuccessModel {
  goal: SuccessModelGoal;
  label: string;
  primarySuccess: string[];
  secondarySuccess: string[];
  progressIndicators: string[];
  failureIndicators: string[];
  coachingPriorities: string[];
  readinessWeights: ReadinessWeights;
  recommendationBias: {
    deloadEarlier: boolean;
    volumeFirst: boolean;
    protectMainLifts: boolean;
    keepSimple: boolean;
  };
}

export const successModels: Record<SuccessModelGoal, SuccessModel> = {
  build_strength: {
    goal: "build_strength",
    label: "Get Stronger",
    primarySuccess: ["Tier A compound lift progression", "estimated strength trend"],
    secondarySuccess: ["low-rep consistency", "fewer failed exposures", "planned session completion"],
    progressIndicators: ["main lift load rising", "same load produces more reps", "fewer shutdowns"],
    failureIndicators: ["best-set regression", "early shutdowns on main lifts", "missed lower-rep targets"],
    coachingPriorities: ["protect main lifts", "reduce volume before abandoning load", "rotate Tier A only when truly stalled"],
    readinessWeights: { progression: 0.38, qualitySets: 0.18, fatigue: 0.27, volumeTolerance: 0.1, recovery: 0.07 },
    recommendationBias: { deloadEarlier: true, volumeFirst: false, protectMainLifts: true, keepSimple: false },
  },
  build_muscle: {
    goal: "build_muscle",
    label: "Build Muscle",
    primarySuccess: ["productive muscle-building work progressing", "weekly volume inside a recoverable range"],
    secondarySuccess: ["muscle coverage", "accessory progression", "stable performance"],
    progressIndicators: ["productive sets inside target zone", "accessory reps or loads rising", "stable shutdown rate"],
    failureIndicators: ["high volume with flat progress", "repeated shutdowns", "undertrained priority muscles"],
    coachingPriorities: ["adjust volume first", "rotate stale accessories", "keep fatigue manageable"],
    readinessWeights: { progression: 0.24, qualitySets: 0.3, fatigue: 0.2, volumeTolerance: 0.21, recovery: 0.05 },
    recommendationBias: { deloadEarlier: false, volumeFirst: true, protectMainLifts: false, keepSimple: false },
  },
  build_muscle_and_strength: {
    goal: "build_muscle_and_strength",
    label: "Build Muscle + Strength",
    primarySuccess: ["compound progression", "productive muscle-building volume"],
    secondarySuccess: ["main and accessory improvement", "balanced fatigue"],
    progressIndicators: ["main lifts moving up", "enough productive weekly volume", "manageable fatigue"],
    failureIndicators: ["strength progress crushes volume", "volume crushes main lift output", "fatigue blocks both"],
    coachingPriorities: ["balance load progression and muscle-building work", "avoid letting one crush the other"],
    readinessWeights: { progression: 0.3, qualitySets: 0.25, fatigue: 0.25, volumeTolerance: 0.15, recovery: 0.05 },
    recommendationBias: { deloadEarlier: false, volumeFirst: false, protectMainLifts: true, keepSimple: false },
  },
  athletic_performance: {
    goal: "athletic_performance",
    label: "Athletic Performance",
    primarySuccess: ["quality strength and power output", "readiness"],
    secondarySuccess: ["movement balance", "low fatigue cost", "session completion"],
    progressIndicators: ["power work stays sharp", "strength support improves", "fatigue stays controlled"],
    failureIndicators: ["output quality drops", "junk volume rises", "shutdowns repeat"],
    coachingPriorities: ["quality over grind", "avoid junk volume", "deload earlier when output drops"],
    readinessWeights: { progression: 0.28, qualitySets: 0.16, fatigue: 0.36, volumeTolerance: 0.12, recovery: 0.08 },
    recommendationBias: { deloadEarlier: true, volumeFirst: false, protectMainLifts: true, keepSimple: false },
  },
  get_leaner: {
    goal: "get_leaner",
    label: "Lose Fat",
    primarySuccess: ["strength maintained where possible", "muscle-building work remains recoverable", "training consistency"],
    secondarySuccess: ["recovery capacity improves", "fatigue stays controlled", "productive work stays sustainable"],
    progressIndicators: ["loads or reps are maintained", "sessions stay consistent", "recovery cardio supports workload"],
    failureIndicators: ["strength falls repeatedly", "fatigue climbs from too much volume", "consistency drops"],
    coachingPriorities: ["preserve muscle", "preserve strength", "bias recovery capacity", "avoid unnecessary fatigue"],
    readinessWeights: { progression: 0.22, qualitySets: 0.24, fatigue: 0.28, volumeTolerance: 0.16, recovery: 0.1 },
    recommendationBias: { deloadEarlier: true, volumeFirst: false, protectMainLifts: true, keepSimple: false },
  },
  powerlifting_meet: {
    goal: "powerlifting_meet",
    label: "Powerlifting Meet",
    primarySuccess: ["squat, bench, and deadlift readiness", "fatigue reduced near meet day"],
    secondarySuccess: ["specificity", "block completion", "consistent competition-lift exposure"],
    progressIndicators: ["competition lifts stay strong", "fatigue falls near meet week", "sessions stay specific"],
    failureIndicators: ["missed key sessions", "fatigue high late", "competition-lift performance down near meet day"],
    coachingPriorities: ["squat bench deadlift specificity", "fatigue reduction near meet", "avoid novelty late"],
    readinessWeights: { progression: 0.24, qualitySets: 0.18, fatigue: 0.34, volumeTolerance: 0.12, recovery: 0.12 },
    recommendationBias: { deloadEarlier: true, volumeFirst: false, protectMainLifts: true, keepSimple: false },
  },
};

export function getSuccessModel(goal: SuccessModelGoal | undefined | null): SuccessModel {
  return successModels[goal ? normalizeTrainingSetupGoal(goal) : "build_muscle_and_strength"] ?? successModels.build_muscle_and_strength;
}

export function successModelReason(model: SuccessModel, signals: StrategicSignals): string {
  if (model.recommendationBias.keepSimple) return "The goal is simple sustainable progress, so recommendations stay conservative.";
  if (model.recommendationBias.deloadEarlier && signals.fatigueTrend !== "low") return `${model.label} prioritises output quality, so fatigue gets handled early.`;
  if (model.goal === "get_leaner" && signals.fatigueTrend === "low") return "Lose Fat prioritises strength and muscle retention with recoverable work.";
  if (model.goal === "powerlifting_meet") return "Powerlifting Meet protects squat, bench, deadlift readiness.";
  if (model.recommendationBias.volumeFirst && signals.fatigueTrend === "low") return `${model.label} prioritises productive recoverable volume.`;
  if (model.recommendationBias.protectMainLifts) return `${model.label} protects important lifts while performance is still moving.`;
  return `${model.label} balances performance, volume, and fatigue.`;
}
