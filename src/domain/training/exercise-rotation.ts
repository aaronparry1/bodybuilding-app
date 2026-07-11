import type { BlockType } from "@/domain/training/annual-models";
import type { Equipment, Exercise, ExerciseHistorySummary, ExperienceLevel } from "@/domain/training/models";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import { resolveLearnedExercisePreference } from "@/domain/training/preference-learning";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import { getExerciseSwapSuggestions } from "@/domain/training/exercise-swaps";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import {
  recommendReturnToCanonicalPrimaryLift,
  selectStructuredPrimaryLiftVariation,
  type PrimaryLiftVariationDecisionRecord,
  type PrimaryLiftVariationSelection,
} from "@/domain/training/primary-lift-variations";

export interface ExerciseRotationRecommendation {
  shouldRotate: boolean;
  currentExerciseId: string;
  currentExerciseName: string;
  reason: string;
  suggestedReplacement?: Exercise;
  structuredPrimaryLiftVariation?: PrimaryLiftVariationSelection;
  optionToKeep: string;
}

export interface ExerciseRotationOptions {
  blockType?: BlockType;
  goal?: TrainingSetupGoal;
  experienceLevel?: ExperienceLevel;
  equipmentAvailable?: Equipment[];
  variationHistory?: PrimaryLiftVariationDecisionRecord[];
  currentWeek?: number;
  fatigueClassification?: FatigueClassifierResult;
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
}

export function recommendExerciseRotation(
  currentExercise: Exercise,
  historyEntries: ExerciseHistorySummary[],
  exercises: Exercise[],
  options: ExerciseRotationOptions = {},
): ExerciseRotationRecommendation {
  const recent = [...historyEntries]
    .filter((entry) => entry.exerciseId === currentExercise.id && entry.setsCompleted > 0)
    .sort((a, b) => new Date(a.completedAt ?? "").getTime() - new Date(b.completedAt ?? "").getTime());
  const stall = detectRotationStall(recent);
  const learnedPreference = resolveLearnedExercisePreference(options.exercisePreferences?.[currentExercise.id], {
    exercise: currentExercise,
    referenceDate: new Date(),
  });
  const preferenceWarrantsRotation =
    learnedPreference &&
    !learnedPreference.temporary &&
    learnedPreference.confidence !== "low" &&
    (learnedPreference.reason === "pain_limitation" || learnedPreference.reason === "gym_lacks_equipment" || learnedPreference.count >= (currentExercise.tier === "A" ? 5 : 3));
  if (
    (options.fatigueClassification?.classification === "systemic" || options.fatigueClassification?.classification === "mixed") &&
    options.fatigueClassification.severity !== "low" &&
    !options.fatigueClassification.affectedExerciseIds.includes(currentExercise.id)
  ) {
    return {
      shouldRotate: false,
      currentExerciseId: currentExercise.id,
      currentExerciseName: currentExercise.name,
      reason: "Fatigue looks broader than this one lift. Hold or deload before rotating exercises.",
      optionToKeep: "Keep the exercise while broad fatigue settles.",
    };
  }
  const returnToCanonical = recommendReturnToCanonicalPrimaryLift({
    currentExercise,
    exercises,
    blockType: options.blockType,
    goal: options.goal,
    experienceLevel: options.experienceLevel,
    equipmentAvailable: options.equipmentAvailable,
    variationHistory: options.variationHistory,
    currentWeek: options.currentWeek,
  });
  const shouldRotate = isRotationAllowed(currentExercise, stall.shouldRotate) || Boolean(returnToCanonical) || Boolean(preferenceWarrantsRotation);
  const structuredPrimaryLiftVariation = shouldRotate
    ? returnToCanonical ??
      selectStructuredPrimaryLiftVariation({
        currentExercise,
        exercises,
        blockType: options.blockType,
        goal: options.goal,
        experienceLevel: options.experienceLevel,
        equipmentAvailable: options.equipmentAvailable,
        variationHistory: options.variationHistory,
        currentWeek: options.currentWeek,
      })
    : undefined;
  const suggestedReplacement = shouldRotate
    ? structuredPrimaryLiftVariation?.selectedExercise ?? getExerciseSwapSuggestions(currentExercise, exercises, { limit: 1, exercisePreferences: options.exercisePreferences })[0]
    : undefined;
  const reason = preferenceWarrantsRotation
    ? `${learnedPreference.evidence[0]} User preference evidence supports offering a replacement. ${stall.reason}`
    : structuredPrimaryLiftVariation
      ? `${structuredPrimaryLiftVariation.reason} ${stall.reason}`
      : stall.reason;

  return {
    shouldRotate,
    currentExerciseId: currentExercise.id,
    currentExerciseName: currentExercise.name,
    reason,
    suggestedReplacement,
    structuredPrimaryLiftVariation,
    optionToKeep: "Keep anyway if the lift still feels good and setup is available.",
  };
}

export function detectRotationStall(entries: ExerciseHistorySummary[]): { shouldRotate: boolean; reason: string } {
  const recentFour = entries.slice(-4);
  if (recentFour.length >= 4 && recentFour.every((entry) => !entry.progressionEarned)) {
    return {
      shouldRotate: true,
      reason: "This lift has stalled across 4 exposures without progression.",
    };
  }

  const recentThree = entries.slice(-3);
  if (recentThree.length >= 3 && recentThree.filter((entry) => entry.stoppedByDropOff && entry.qualitySets < 2).length >= 2) {
    return {
      shouldRotate: true,
      reason: "Repeated early shutdowns suggest this variation is not producing useful work right now.",
    };
  }

  if (recentThree.length >= 3 && recentThree.every((entry, index) => index === 0 || entry.bestSetReps < recentThree[index - 1]!.bestSetReps)) {
    return {
      shouldRotate: true,
      reason: "Best-set performance has regressed across 3 exposures.",
    };
  }

  return {
    shouldRotate: false,
    reason: "Progress is still moving. Keep the exercise stable.",
  };
}

function isRotationAllowed(exercise: Exercise, stalled: boolean): boolean {
  if (!stalled) return false;
  if (exercise.tier === "A") return true;
  return true;
}
