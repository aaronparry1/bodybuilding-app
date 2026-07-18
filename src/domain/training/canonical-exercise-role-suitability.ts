import type { AllocatedSlot } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { Exercise, ExperienceLevel } from "@/domain/training/models";

export const CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID = "canonical_exercise_role_suitability_v1" as const;

export type CanonicalExerciseRoleSuitability = "primary_choice" | "suitable_alternative" | "specialist" | "unsuitable";

export type CanonicalExerciseRoleSuitabilityInput = Readonly<{
  exercise: Exercise;
  slot: AllocatedSlot;
  macrocycleGoal: string;
  mesocycleId: string;
  experience: ExperienceLevel;
  sessionExerciseIds: readonly string[];
  weeklyExerciseUsage: Readonly<Record<string, number>>;
  sessionHighFatigueSets: number;
  recoveryRestricted?: boolean;
}>;

export type CanonicalExerciseRoleSuitabilityResult = Readonly<{
  policyId: typeof CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID;
  suitability: CanonicalExerciseRoleSuitability;
  score: number;
  reasons: readonly string[];
  repeatReason: "not_repeated" | "stable_primary_practice" | "only_equivalent_available" | "variation_preferred";
}>;

/**
 * Ranks factual exercise metadata for an already-owned Microcycle slot. It never
 * creates a slot, volume target, lift exposure, or exercise classification.
 */
export function assessCanonicalExerciseRoleSuitability(input: CanonicalExerciseRoleSuitabilityInput): CanonicalExerciseRoleSuitabilityResult {
  const { exercise, slot } = input;
  const reasons: string[] = [];
  const repeated = (input.weeklyExerciseUsage[exercise.id] ?? 0) > 0;
  const repeatReason = !repeated ? "not_repeated" : slot.repeatPolicy === "stable_primary_practice" && exercise.primaryLift === slot.primaryLift ? "stable_primary_practice" : slot.repeatPolicy === "variation_preferred" ? "variation_preferred" : "only_equivalent_available";

  if (!exercise.roles.includes(slot.exerciseRole)) reasons.push("slot_role_not_supported");
  if (!slot.movementPatterns.includes(exercise.movementPattern)) reasons.push("required_movement_pattern_not_supported");
  if (!slot.requiredStimuli.every((region) => exercise.stimulusProfile?.direct.includes(region))) reasons.push("required_direct_stimulus_not_supported");
  if (!exercise.suitability.includes(input.experience)) reasons.push("experience_not_supported");
  if (input.sessionExerciseIds.includes(exercise.id)) reasons.push("duplicate_within_session");
  if (slot.liftExposure === "primary" && exercise.primaryLift !== slot.primaryLift) reasons.push("competition_pattern_required");
  if (slot.liftExposure === "secondary_variation" && exercise.primaryLift === slot.primaryLift) reasons.push("secondary_variation_must_not_duplicate_primary_lift");
  if (input.recoveryRestricted && exercise.fatigueCost === "high" && slot.constructionRole !== "primary") reasons.push("recovery_restriction_excludes_high_fatigue_support_work");

  if (reasons.length) return { policyId: CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID, suitability: "unsuitable", score: Number.NEGATIVE_INFINITY, reasons, repeatReason };

  const specialist = exercise.selectionProfile === "strength_specialist";
  if (specialist && !slot.specialistsPermitted) reasons.push("specialist_not_default_for_slot");

  let score = 100;
  if (exercise.roles[0] === slot.exerciseRole) score += 6;
  if (exercise.stability === "high" && slot.constructionRole !== "primary") score += 12;
  if (exercise.selectionProfile === "stable_hypertrophy" && slot.constructionRole !== "primary") score += 12;
  if (exercise.selectionProfile === "technique_variation" && slot.liftExposure === "secondary_variation") score += 14;
  if (slot.preferredHypertrophyBias && exercise.hypertrophyBias === slot.preferredHypertrophyBias) score += 20;
  if (exercise.loadability === "high" && slot.liftExposure) score += 8;
  if (exercise.skillDemand === "high" && slot.constructionRole !== "primary") score -= 12;
  if (exercise.fatigueCost === "high" && input.sessionHighFatigueSets > 0) score -= 25;
  if (input.recoveryRestricted && exercise.fatigueCost === "high") score -= 15;
  if (repeated && repeatReason === "variation_preferred") score -= 60;
  if (specialist && !slot.specialistsPermitted) score -= 80;
  if (exercise.primaryMuscles.length === slot.muscles.length && exercise.primaryMuscles.every((muscle) => slot.muscles.includes(muscle))) score += 4;

  const suitability: CanonicalExerciseRoleSuitability = specialist ? "specialist" : score >= 112 ? "primary_choice" : "suitable_alternative";
  reasons.push(`goal:${input.macrocycleGoal}`, `mesocycle:${input.mesocycleId}`, `slot:${slot.purpose}`, `fatigue:${exercise.fatigueCost}`, `recovery:${input.recoveryRestricted ? "restricted" : "normal"}`, `stability:${exercise.stability ?? "unrecorded"}`, `repeat:${repeatReason}`);
  return { policyId: CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID, suitability, score, reasons, repeatReason };
}
