import type { BlockType } from "@/domain/training/annual-models";
import type { Equipment, Exercise, ExperienceLevel } from "@/domain/training/models";
import { normalizeTrainingSetupGoal, type TrainingSetupGoal } from "@/domain/training/plan-setup";

export type PrimaryLiftFamilyId = "bench_press" | "standing_overhead_press" | "squat" | "deadlift";
export type PrimaryLiftSpecificity = "high" | "medium" | "low";
export type PrimaryLiftCost = "low" | "medium" | "high";
export type PrimaryLiftVariationUse =
  | "weakness_target"
  | "overload"
  | "range_of_motion"
  | "technique"
  | "fatigue_management"
  | "hypertrophy_support";
export type PrimaryLiftVariationOutcome = "improved" | "neutral" | "worsened" | "unknown";
export type PrimaryLiftVariationStatus = "accepted" | "rejected" | "returned";

export interface PrimaryLiftVariationMetadata {
  canonicalFamily: PrimaryLiftFamilyId;
  exerciseId: string;
  variationPurpose: string;
  specificity: PrimaryLiftSpecificity;
  fatigueCost: PrimaryLiftCost;
  skillDemand: PrimaryLiftCost;
  equipmentRequirements: Equipment[];
  suggestedUse: PrimaryLiftVariationUse[];
  beginnerAllowed: boolean;
  strengthBlockAllowed: boolean;
  powerBlockAllowed: boolean;
  peakBlockAllowed: boolean;
  maxExposuresBeforeReturn: number;
  cooldownWeeks: number;
}

export interface PrimaryLiftFamilyDefinition {
  id: PrimaryLiftFamilyId;
  label: string;
  canonicalExerciseIds: string[];
  canonicalNameIncludes: string[];
  variations: PrimaryLiftVariationMetadata[];
}

export interface PrimaryLiftVariationDecisionRecord {
  canonicalFamily: PrimaryLiftFamilyId;
  originalExerciseId: string;
  chosenVariationId: string;
  reason: string;
  blockType?: BlockType;
  week?: number;
  decidedAt: string;
  exposureCount: number;
  status: PrimaryLiftVariationStatus;
  outcome: PrimaryLiftVariationOutcome;
  cooldownWeeks: number;
}

export interface PrimaryLiftVariationSelectionInput {
  currentExercise: Exercise;
  exercises: Exercise[];
  blockType?: BlockType;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  equipmentAvailable?: Equipment[];
  variationHistory?: PrimaryLiftVariationDecisionRecord[];
  currentWeek?: number;
}

export interface PrimaryLiftVariationSelection {
  family: PrimaryLiftFamilyDefinition;
  selectedExercise: Exercise;
  metadata: PrimaryLiftVariationMetadata;
  reason: string;
  evidenceSummary: string[];
  decisionRecord: Omit<PrimaryLiftVariationDecisionRecord, "decidedAt" | "status" | "outcome" | "exposureCount">;
}

export const primaryLiftFamilies: PrimaryLiftFamilyDefinition[] = [
  {
    id: "bench_press",
    label: "Bench Press",
    canonicalExerciseIds: ["ex-bench-press"],
    canonicalNameIncludes: ["bench press", "barbell bench press"],
    variations: [
      variation("bench_press", "ex-floor-press", "Reduced range pressing for lockout and triceps strength.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["weakness_target", "range_of_motion", "technique"],
        beginnerAllowed: true,
      }),
      variation("bench_press", "ex-paused-bench-press", "Specific bench variation for control and strength off the chest.", {
        specificity: "high",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: true,
      }),
      variation("bench_press", "ex-larsen-press", "Bench variation that reduces leg drive and keeps pressing honest.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "hypertrophy_support"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-close-grip-bench-press", "Close bench variation for triceps strength and pressing practice.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["weakness_target", "hypertrophy_support"],
        beginnerAllowed: true,
      }),
      variation("bench_press", "ex-incline-barbell-bench", "Specific barbell press variation with more shoulder and upper-chest demand.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "technique"],
        beginnerAllowed: true,
      }),
      variation("bench_press", "ex-board-press", "Overload and lockout-focused bench variation.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target", "range_of_motion"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-pin-press", "Paused press from pins for position-specific strength.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["weakness_target", "technique"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-spoto-press", "Paused-near-chest press for control and position.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-feet-up-bench-press", "Lower-drive bench support that keeps tension on the press.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "hypertrophy_support"],
        beginnerAllowed: true,
        peakBlockAllowed: false,
      }),
      variation("bench_press", "ex-slingshot-bench-press", "Overload bench variation for heavier exposures with assistance.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-bench-press-chains", "Accommodating-resistance bench variation for stronger lockout intent.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("bench_press", "ex-bench-press-bands", "Accommodating-resistance bench variation for speed and lockout practice.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "bands"],
        suggestedUse: ["overload", "technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
      variation("bench_press", "ex-speed-bench-press", "Power-biased bench variation for fast, crisp pressing.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
      variation("bench_press", "ex-decline-barbell-bench", "Specific horizontal press support with a slightly different line.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
      }),
      variation("bench_press", "ex-decline-press", "Lower-stress horizontal press support.", {
        specificity: "low",
        fatigueCost: "low",
        skillDemand: "low",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
      }),
    ],
  },
  {
    id: "standing_overhead_press",
    label: "Standing Overhead Press",
    canonicalExerciseIds: ["ex-military-press", "ex-standing-barbell-overhead-press", "ex-barbell-standing-overhead-press"],
    canonicalNameIncludes: ["standing barbell overhead press", "barbell overhead press", "military press"],
    variations: [
      variation("standing_overhead_press", "ex-seated-barbell-shoulder-press", "Specific overhead press variation with less whole-body demand.", {
        specificity: "high",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["weakness_target", "technique"],
        beginnerAllowed: true,
      }),
      variation("standing_overhead_press", "ex-push-press", "Power-biased overhead variation for stronger drive and lockout practice.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["overload", "technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
        peakBlockAllowed: true,
      }),
      variation("standing_overhead_press", "ex-standing-dumbbell-press", "Lower-specificity press variation with more side-to-side stability demand.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["dumbbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
      }),
      variation("standing_overhead_press", "ex-seated-dumbbell-press", "Dumbbell overhead support press.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["dumbbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
      }),
      variation("standing_overhead_press", "ex-plate-loaded-shoulder-press-machine", "Stable overhead press support with lower skill demand.", {
        specificity: "low",
        fatigueCost: "low",
        skillDemand: "low",
        equipmentRequirements: ["machine"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
        peakBlockAllowed: false,
      }),
      variation("standing_overhead_press", "ex-high-incline-press", "High-incline press support for shoulders and upper chest.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support"],
        beginnerAllowed: true,
      }),
    ],
  },
  {
    id: "squat",
    label: "Squat",
    canonicalExerciseIds: ["ex-barbell-back-squat", "ex-back-squat"],
    canonicalNameIncludes: ["barbell back squat", "back squat"],
    variations: [
      variation("squat", "ex-box-squat", "Box-guided squat variation for consistent depth and position.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-safety-squat-bar-squat", "Squat variation with upper-back and quad emphasis.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["weakness_target", "hypertrophy_support"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-safety-bar-squat", "Primary safety-bar squat variation for squat strength support.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["weakness_target", "hypertrophy_support"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-front-squat", "More upright squat variation with quad and trunk demand.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["weakness_target", "technique"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-pin-squat", "Position-specific squat variation from pins.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["weakness_target", "technique"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-anderson-squat", "Dead-stop squat variation for strength from the bottom position.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["weakness_target", "range_of_motion"],
        beginnerAllowed: false,
        peakBlockAllowed: false,
      }),
      variation("squat", "ex-hatfield-squat", "Supported specialty-bar squat variation for quad work with more stability.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: false,
        peakBlockAllowed: false,
      }),
      variation("squat", "ex-cambered-bar-squat", "Specialty-bar squat variation with extra control demand.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-zercher-squat", "Anterior-loaded squat support with high trunk demand.", {
        specificity: "low",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "technique"],
        beginnerAllowed: false,
        peakBlockAllowed: false,
      }),
      variation("squat", "ex-pause-squat", "Specific squat variation for control out of the bottom.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["weakness_target", "technique"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-tempo-squat", "Controlled squat variation for position and bracing practice.", {
        specificity: "high",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-squat-chains", "Accommodating-resistance squat variation for overload and intent.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("squat", "ex-squat-bands", "Accommodating-resistance squat variation for speed and lockout intent.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "bands"],
        suggestedUse: ["overload", "technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
      variation("squat", "ex-speed-squat", "Power-biased squat variation for fast, crisp reps.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
    ],
  },
  {
    id: "deadlift",
    label: "Deadlift",
    canonicalExerciseIds: ["ex-deadlift", "ex-conventional-deadlift", "ex-barbell-deadlift"],
    canonicalNameIncludes: ["conventional deadlift", "barbell deadlift"],
    variations: [
      variation("deadlift", "ex-rack-pull", "Overload and lockout-focused deadlift variation.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-deficit-deadlift", "Longer-range deadlift variation for starting strength.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["range_of_motion", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-snatch-grip-deadlift", "Longer-range deadlift variation with extra upper-back demand.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["range_of_motion", "hypertrophy_support"],
        beginnerAllowed: false,
        peakBlockAllowed: false,
      }),
      variation("deadlift", "ex-romanian-deadlift", "Hinge support for posterior-chain strength with less specificity.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: true,
        peakBlockAllowed: false,
      }),
      variation("deadlift", "ex-stiff-leg-deadlift", "Deadlift support variation with more hamstring and hinge demand.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["hypertrophy_support", "fatigue_management"],
        beginnerAllowed: false,
        peakBlockAllowed: false,
      }),
      variation("deadlift", "ex-block-pull", "Overload pull from blocks.", {
        specificity: "medium",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-pause-deadlift", "Specific deadlift variation for position control.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-tempo-deadlift", "Controlled deadlift variation for position and timing.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-deadlift-chains", "Accommodating-resistance deadlift variation for overload and lockout intent.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["overload", "weakness_target"],
        beginnerAllowed: false,
      }),
      variation("deadlift", "ex-deadlift-bands", "Accommodating-resistance deadlift variation for speed and lockout practice.", {
        specificity: "high",
        fatigueCost: "high",
        skillDemand: "high",
        equipmentRequirements: ["barbell", "bands"],
        suggestedUse: ["overload", "technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
      variation("deadlift", "ex-speed-deadlift", "Power-biased deadlift variation for fast, crisp pulls.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell"],
        suggestedUse: ["technique"],
        beginnerAllowed: false,
        powerBlockAllowed: true,
      }),
      variation("deadlift", "ex-trap-bar-deadlift", "Lower-skill pull variation that keeps heavy pulling in the plan.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: ["barbell", "other"],
        suggestedUse: ["fatigue_management", "hypertrophy_support"],
        beginnerAllowed: true,
        peakBlockAllowed: false,
      }),
    ],
  },
];

export function getPrimaryLiftFamilyForExercise(exercise: Exercise): PrimaryLiftFamilyDefinition | undefined {
  return primaryLiftFamilies.find((family) => isCanonicalExerciseForFamily(exercise, family) || family.variations.some((variation) => variation.exerciseId === exercise.id));
}

export function isCanonicalPrimaryLift(exercise: Exercise): boolean {
  return primaryLiftFamilies.some((family) => isCanonicalExerciseForFamily(exercise, family));
}

export function isStructuredPrimaryLiftVariation(exercise: Exercise): boolean {
  return primaryLiftFamilies.some((family) => family.variations.some((variation) => variation.exerciseId === exercise.id));
}

export function getVariationMetadata(exerciseId: string): PrimaryLiftVariationMetadata | undefined {
  return primaryLiftFamilies.flatMap((family) => family.variations).find((variation) => variation.exerciseId === exerciseId);
}

export function selectStructuredPrimaryLiftVariation(input: PrimaryLiftVariationSelectionInput): PrimaryLiftVariationSelection | undefined {
  if (!isCanonicalPrimaryLift(input.currentExercise)) return undefined;
  const family = getPrimaryLiftFamilyForExercise(input.currentExercise);
  if (!family) return undefined;

  const exerciseById = new Map(input.exercises.map((exercise) => [exercise.id, exercise]));
  const candidates = family.variations
    .map((metadata) => {
      const exercise = exerciseById.get(metadata.exerciseId);
      return exercise ? { metadata, exercise } : null;
    })
    .filter((candidate): candidate is { metadata: PrimaryLiftVariationMetadata; exercise: Exercise } => Boolean(candidate))
    .filter(({ exercise, metadata }) => exercise.id !== input.currentExercise.id && isAllowedForContext(metadata, exercise, input));

  const usableCandidates = candidates.filter(({ metadata }) => !isOnCooldown(metadata, input));
  const pool = usableCandidates.length > 0 ? usableCandidates : candidates;
  const selected = pool.sort((a, b) => scoreVariation(b, input) - scoreVariation(a, input))[0];
  if (!selected) return undefined;

  const block = input.blockType ?? "strength";
  const reason =
    block === "peak"
      ? `${family.label} has stalled, so use a close, specific variation without losing the main lift thread.`
      : `${family.label} has stalled. Try ${selected.exercise.name} for a short variation run, then come back to the main lift.`;

  return {
    family,
    selectedExercise: selected.exercise,
    metadata: selected.metadata,
    reason,
    evidenceSummary: [
      `${family.label} is a canonical primary strength lift.`,
      `${selected.exercise.name} is a structured ${family.label} variation.`,
      "No weak-point claim is made without stronger evidence.",
    ],
    decisionRecord: {
      canonicalFamily: family.id,
      originalExerciseId: input.currentExercise.id,
      chosenVariationId: selected.exercise.id,
      reason,
      blockType: input.blockType,
      week: input.currentWeek,
      cooldownWeeks: selected.metadata.cooldownWeeks,
    },
  };
}

export function recommendReturnToCanonicalPrimaryLift(input: PrimaryLiftVariationSelectionInput): PrimaryLiftVariationSelection | undefined {
  const family = getPrimaryLiftFamilyForExercise(input.currentExercise);
  if (!family || !isStructuredPrimaryLiftVariation(input.currentExercise)) return undefined;

  const matchingRecord = mostRecentVariationRecord(input.currentExercise.id, family.id, input.variationHistory);
  const exposureCount = matchingRecord?.exposureCount ?? 0;
  const shouldReturn = input.blockType === "peak" || input.blockType === "strength" && exposureCount >= maxExposureForVariation(input.currentExercise.id);
  if (!shouldReturn) return undefined;

  const canonical = family.canonicalExerciseIds
    .map((id) => input.exercises.find((exercise) => exercise.id === id))
    .find((exercise): exercise is Exercise => Boolean(exercise));
  if (!canonical) return undefined;

  const metadata = getVariationMetadata(input.currentExercise.id);
  const reason =
    input.blockType === "peak"
      ? `${family.label} specificity matters now. Return to the main lift.`
      : `${input.currentExercise.name} has had its variation run. Bring ${family.label} back as the main reference lift.`;

  return {
    family,
    selectedExercise: canonical,
    metadata:
      metadata ??
      variation(family.id, input.currentExercise.id, "Temporary primary lift variation.", {
        specificity: "medium",
        fatigueCost: "medium",
        skillDemand: "medium",
        equipmentRequirements: input.currentExercise.equipment,
        suggestedUse: ["technique"],
        beginnerAllowed: input.currentExercise.isBeginnerFriendly,
      }),
    reason,
    evidenceSummary: [`${input.currentExercise.name} is a temporary ${family.label} variation.`, "Primary lifts return for strength and peak specificity."],
    decisionRecord: {
      canonicalFamily: family.id,
      originalExerciseId: input.currentExercise.id,
      chosenVariationId: canonical.id,
      reason,
      blockType: input.blockType,
      week: input.currentWeek,
      cooldownWeeks: 0,
    },
  };
}

function variation(
  canonicalFamily: PrimaryLiftFamilyId,
  exerciseId: string,
  variationPurpose: string,
  options: {
    specificity: PrimaryLiftSpecificity;
    fatigueCost: PrimaryLiftCost;
    skillDemand: PrimaryLiftCost;
    equipmentRequirements: Equipment[];
    suggestedUse: PrimaryLiftVariationUse[];
    beginnerAllowed: boolean;
    strengthBlockAllowed?: boolean;
    powerBlockAllowed?: boolean;
    peakBlockAllowed?: boolean;
    maxExposuresBeforeReturn?: number;
    cooldownWeeks?: number;
  },
): PrimaryLiftVariationMetadata {
  return {
    canonicalFamily,
    exerciseId,
    variationPurpose,
    specificity: options.specificity,
    fatigueCost: options.fatigueCost,
    skillDemand: options.skillDemand,
    equipmentRequirements: options.equipmentRequirements,
    suggestedUse: options.suggestedUse,
    beginnerAllowed: options.beginnerAllowed,
    strengthBlockAllowed: options.strengthBlockAllowed ?? true,
    powerBlockAllowed: options.powerBlockAllowed ?? options.suggestedUse.includes("technique"),
    peakBlockAllowed: options.peakBlockAllowed ?? options.specificity === "high",
    maxExposuresBeforeReturn: options.maxExposuresBeforeReturn ?? 4,
    cooldownWeeks: options.cooldownWeeks ?? 4,
  };
}

function isCanonicalExerciseForFamily(exercise: Exercise, family: PrimaryLiftFamilyDefinition): boolean {
  const name = exercise.name.toLowerCase();
  return family.canonicalExerciseIds.includes(exercise.id) || family.canonicalNameIncludes.some((needle) => name === needle || name.includes(needle));
}

function isAllowedForContext(metadata: PrimaryLiftVariationMetadata, exercise: Exercise, input: PrimaryLiftVariationSelectionInput): boolean {
  const block = input.blockType;
  if (block === "strength" && !metadata.strengthBlockAllowed) return false;
  if (block === "power" && !metadata.powerBlockAllowed) return false;
  if (block === "peak" && !metadata.peakBlockAllowed) return false;
  if (block === "deload") return metadata.fatigueCost !== "high";
  if (input.experienceLevel === "beginner" && (!metadata.beginnerAllowed || exercise.isAdvanced)) return false;
  if (!input.equipmentAvailable?.length) return !metadata.equipmentRequirements.includes("other") || metadata.specificity !== "low";
  return metadata.equipmentRequirements.every((equipment) => input.equipmentAvailable?.includes(equipment));
}

function isOnCooldown(metadata: PrimaryLiftVariationMetadata, input: PrimaryLiftVariationSelectionInput): boolean {
  const currentWeek = input.currentWeek;
  if (typeof currentWeek !== "number") return false;
  const latest = mostRecentVariationRecord(metadata.exerciseId, metadata.canonicalFamily, input.variationHistory);
  if (!latest?.week) return false;
  return currentWeek - latest.week < latest.cooldownWeeks;
}

function mostRecentVariationRecord(
  variationId: string,
  familyId: PrimaryLiftFamilyId,
  records: PrimaryLiftVariationDecisionRecord[] = [],
): PrimaryLiftVariationDecisionRecord | undefined {
  return [...records]
    .filter((record) => record.canonicalFamily === familyId && record.chosenVariationId === variationId)
    .sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime())[0];
}

function maxExposureForVariation(exerciseId: string): number {
  return getVariationMetadata(exerciseId)?.maxExposuresBeforeReturn ?? 4;
}

function scoreVariation(candidate: { metadata: PrimaryLiftVariationMetadata; exercise: Exercise }, input: PrimaryLiftVariationSelectionInput): number {
  const goal = input.goal ? normalizeTrainingSetupGoal(input.goal) : undefined;
  let score = 0;
  score += candidate.metadata.specificity === "high" ? 30 : candidate.metadata.specificity === "medium" ? 22 : 10;
  score += candidate.metadata.fatigueCost === "low" ? 10 : candidate.metadata.fatigueCost === "medium" ? 6 : 0;
  score += candidate.metadata.skillDemand === "low" ? 6 : candidate.metadata.skillDemand === "medium" ? 3 : 0;
  score += candidate.exercise.tier === "B" ? 8 : candidate.exercise.tier === "A" ? 6 : 0;
  score += candidate.exercise.isBeginnerFriendly ? 4 : 0;

  if (input.blockType === "strength") score += candidate.metadata.specificity === "high" ? 14 : 8;
  if (input.blockType === "peak") score += candidate.metadata.specificity === "high" ? 28 : -20;
  if (input.blockType === "power") score += candidate.metadata.suggestedUse.includes("technique") ? 12 : 0;
  if (input.blockType === "hypertrophy") score += candidate.metadata.fatigueCost === "high" ? -8 : 8;

  if (goal === "build_strength") score += candidate.metadata.specificity === "high" ? 10 : 4;
  if (goal === "powerlifting_meet") score += candidate.metadata.specificity === "high" ? 16 : -4;
  if (goal === "build_muscle") score += candidate.metadata.suggestedUse.includes("hypertrophy_support") ? 10 : 0;
  if (goal === "get_leaner") score += candidate.metadata.fatigueCost === "high" ? -12 : candidate.metadata.skillDemand === "high" ? -8 : 6;
  if (goal === "athletic_performance") score += candidate.metadata.fatigueCost === "high" ? -12 : 5;
  if (candidate.metadata.suggestedUse.includes("overload")) score -= 16;

  if (input.experienceLevel === "advanced") score += candidate.metadata.specificity === "high" ? 6 : 0;
  if (input.experienceLevel === "intermediate") score += candidate.metadata.skillDemand === "high" ? -4 : 2;

  if (!input.equipmentAvailable?.length && candidate.metadata.equipmentRequirements.includes("other")) score -= 18;

  return score;
}
