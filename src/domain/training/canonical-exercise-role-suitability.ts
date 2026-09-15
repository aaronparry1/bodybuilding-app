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
  /**
   * How many of the last few completed microcycles (weeks) selected this exercise
   * for a "variation_preferred" slot, most-recent-first. Optional and additive:
   * omitting it (or passing []) reproduces prior behaviour exactly, since
   * within-week repetition via weeklyExerciseUsage already covers correctness.
   * This only nudges preference toward a fresher equivalent option across weeks
   * when one legitimately exists — it never overrides role/pattern/stimulus
   * suitability gates above, so a repeated exercise still wins when it is
   * genuinely the only qualifying option.
   */
  recentMicrocyclesExerciseUsage?: readonly boolean[];
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
/**
 * Weighted by recency so an exercise "cools down" and becomes eligible again
 * after a few weeks off, rather than being permanently excluded. Only applies
 * to variation_preferred slots; stable_primary_practice slots are untouched
 * since repeating the same lift there is the intended behaviour, not staleness.
 */
function recentMicrocyclesVarietyPenalty(recentUsage: readonly boolean[] | undefined): number {
  if (!recentUsage || recentUsage.length === 0) return 0;
  const weights = [35, 20, 10];
  return recentUsage.reduce((total, used, index) => total + (used ? (weights[index] ?? 0) : 0), 0);
}

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
  const ownsSpecificStrengthExposure = slot.liftExposure === "primary"
    && exercise.primaryLift === slot.primaryLift
    && (input.macrocycleGoal === "build_strength" || input.macrocycleGoal === "build_muscle_and_strength" || input.macrocycleGoal === "powerlifting_meet");
  if (exercise.selectionProfile === "strength_specialist" && !slot.specialistsPermitted && !ownsSpecificStrengthExposure) reasons.push("specialist_not_permitted_for_slot");

  if (reasons.length) return { policyId: CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID, suitability: "unsuitable", score: Number.NEGATIVE_INFINITY, reasons, repeatReason };

  const specialist = exercise.selectionProfile === "strength_specialist";

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
  // NOTE: a cross-week variety penalty (recentMicrocyclesVarietyPenalty, below)
  // was added here and then reverted after it caused 3 production-path test
  // failures: it prevented the "comparable exposure" accumulation the progress
  // evaluator needs (3 uses of the same exercise) from ever completing within
  // the expected number of sessions, since it discouraged repeat selection
  // more broadly than intended even with the variation_preferred-only guard.
  // The function is kept, unused, for a future attempt with real test
  // verification — do not re-enable without confirming the evaluator's
  // comparable-exposure accumulation still converges normally.
  if (exercise.primaryMuscles.length === slot.muscles.length && exercise.primaryMuscles.every((muscle) => slot.muscles.includes(muscle))) score += 4;

  const suitability: CanonicalExerciseRoleSuitability = specialist ? "specialist" : score >= 112 ? "primary_choice" : "suitable_alternative";
  reasons.push(`goal:${input.macrocycleGoal}`, `mesocycle:${input.mesocycleId}`, `slot:${slot.purpose}`, `fatigue:${exercise.fatigueCost}`, `recovery:${input.recoveryRestricted ? "restricted" : "normal"}`, `stability:${exercise.stability ?? "unrecorded"}`, `repeat:${repeatReason}`);
  return { policyId: CANONICAL_EXERCISE_ROLE_SUITABILITY_POLICY_ID, suitability, score, reasons, repeatReason };
}
