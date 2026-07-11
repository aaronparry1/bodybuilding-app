import type { AdaptationStatus } from "@/domain/training/adaptation-detection-engine";
import type { AdaptiveTrainingStateId } from "@/domain/training/adaptive-training-state";
import type { Equipment, ExperienceLevel, MovementPattern, MuscleGroup } from "@/domain/training/models";

export type RotationScope = "exercise" | "variation_family" | "movement_pattern";
export type RotationTrainingMethod = "hypertrophy" | "strength" | "power" | "skill" | "recovery" | "maintenance";
export type RotationTrend = "strong_up" | "up" | "flat" | "down" | "strong_down" | "unknown";
export type RotationFatigueRecoveryStatus = "good" | "normal" | "strained" | "poor" | "unknown";
export type RotationPainIssueFlag = "none" | "minor" | "pain" | "technical_breakdown" | "unsafe";
export type RotationSkillLevel = "beginner" | "intermediate" | "advanced";
export type RotationScoreLevel = "low" | "moderate" | "high";
export type RotationRangeProfile = "full" | "reduced" | "lengthened" | "paused" | "tempo" | "partial" | "unknown";
export type RotationForceDirection = "horizontal" | "vertical" | "axial" | "hip_extension" | "knee_extension" | "mixed" | "unknown";
export type RotationStrengthQuality = "max_strength" | "hypertrophy" | "power" | "skill" | "recovery" | "unknown";
export type LimitingFactorTag =
  | "bottom_range"
  | "mid_range"
  | "lockout"
  | "stability"
  | "upper_back"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "grip"
  | "core_bracing";

export type RotationReasonCode =
  | "movement_pattern_preserved"
  | "training_intent_preserved"
  | "smallest_meaningful_variation"
  | "primary_lift_transfer_protected"
  | "pain_safer_variation"
  | "equipment_respected"
  | "experience_level_respected"
  | "training_state_matched"
  | "limiting_factor_addressed"
  | "recent_saturation_avoided"
  | "cooldown_respected"
  | "measurable_loadable_primary"
  | "lower_fatigue_selected"
  | "no_rotation_needed"
  | "no_valid_candidate";

/** Legacy intervention reasons are retained as plain evidence labels only. */
export type InterventionReasonCode = string;

export interface ExerciseRotationCandidate {
  id: string;
  name: string;
  movement_pattern: MovementPattern;
  primary_muscles: MuscleGroup[];
  secondary_muscles: MuscleGroup[];
  equipment_required: Equipment[];
  skill_level: RotationSkillLevel;
  setup_complexity: RotationScoreLevel;
  loadability: RotationScoreLevel;
  measurability: RotationScoreLevel;
  joint_stress_profile: RotationScoreLevel;
  range_of_motion_profile: RotationRangeProfile;
  stability_demand: RotationScoreLevel;
  axial_loading: RotationScoreLevel;
  fatigue_cost: RotationScoreLevel;
  hypertrophy_bias: RotationScoreLevel;
  strength_bias: RotationScoreLevel;
  power_bias: RotationScoreLevel;
  transfer_tags: string[];
  variation_family: string;
  progression_compatibility: RotationScoreLevel;
  force_direction?: RotationForceDirection;
  strength_quality?: RotationStrengthQuality;
}

export interface ExerciseRotationHistoryItem {
  exerciseId: string;
  exposureCount: number;
  saturatedRecently?: boolean;
  lastUsedSessionOffset?: number;
}

export interface UserRotationPreferences {
  dislikedExerciseIds?: string[];
  dislikedVariationFamilies?: string[];
}

export interface ExerciseRotationPolicyInput {
  currentExercise: ExerciseRotationCandidate;
  movementPattern: MovementPattern;
  targetRegion: MuscleGroup;
  trainingState: AdaptiveTrainingStateId;
  trainingMethod: RotationTrainingMethod;
  interventionReasonCodes: InterventionReasonCode[];
  adaptationStatus: AdaptationStatus;
  adaptationConfidence: number;
  exerciseExposureCount: number;
  exerciseHistory: ExerciseRotationHistoryItem[];
  recentPerformanceTrend: RotationTrend;
  fatigueRecoveryStatus: RotationFatigueRecoveryStatus;
  painIssueFlag: RotationPainIssueFlag;
  userEquipment: Equipment[];
  userExperienceLevel: ExperienceLevel;
  userPreferences?: UserRotationPreferences;
  availableExerciseLibrary: ExerciseRotationCandidate[];
  limitingFactorTags?: LimitingFactorTag[];
  rotationCooldownSessions?: number;
}

export interface RejectedRotationCandidate {
  exercise: ExerciseRotationCandidate;
  reasons: string[];
}

export interface ExerciseRotationPolicyDecision {
  selected_replacement_exercise: ExerciseRotationCandidate | null;
  rejected_candidates: RejectedRotationCandidate[];
  rotation_scope: RotationScope;
  confidence: number;
  reason_codes: RotationReasonCode[];
  recommended_loading_adjustment: string;
  review_after_sessions: number;
  cooldown_before_reusing_previous_exercise: number;
}

export function selectExerciseRotation(input: ExerciseRotationPolicyInput): ExerciseRotationPolicyDecision {
  const cooldownSessions = input.rotationCooldownSessions ?? defaultCooldownFor(input.currentExercise);

  if (adaptationStillOccurring(input) && input.painIssueFlag === "none") {
    return {
      selected_replacement_exercise: null,
      rejected_candidates: [],
      rotation_scope: "exercise",
      confidence: 82,
      reason_codes: ["no_rotation_needed"],
      recommended_loading_adjustment: "Keep current exercise; rotation is not justified while adaptation is occurring.",
      review_after_sessions: 2,
      cooldown_before_reusing_previous_exercise: 0,
    };
  }

  const rejected: RejectedRotationCandidate[] = [];
  const scored = input.availableExerciseLibrary
    .filter((candidate) => candidate.id !== input.currentExercise.id)
    .map((candidate) => {
      const rejectionReasons = rejectionReasonsFor(candidate, input, cooldownSessions);
      if (rejectionReasons.length > 0) {
        rejected.push({ exercise: candidate, reasons: rejectionReasons });
        return null;
      }
      return {
        candidate,
        score: scoreCandidate(candidate, input),
      };
    })
    .filter((item): item is { candidate: ExerciseRotationCandidate; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name));

  const selected = scored[0]?.candidate ?? null;
  if (!selected) {
    return {
      selected_replacement_exercise: null,
      rejected_candidates: rejected,
      rotation_scope: "exercise",
      confidence: 40,
      reason_codes: ["no_valid_candidate"],
      recommended_loading_adjustment: "Keep current exercise or route to manual review; no valid replacement met constraints.",
      review_after_sessions: 1,
      cooldown_before_reusing_previous_exercise: cooldownSessions,
    };
  }

  const reasonCodes = reasonCodesFor(selected, input);
  const scope = rotationScopeFor(selected, input);

  return {
    selected_replacement_exercise: selected,
    rejected_candidates: rejected,
    rotation_scope: scope,
    confidence: confidenceFor(selected, input),
    reason_codes: reasonCodes,
    recommended_loading_adjustment: loadingAdjustmentFor(selected, input),
    review_after_sessions: reviewWindowFor(input),
    cooldown_before_reusing_previous_exercise: cooldownSessions,
  };
}

function rejectionReasonsFor(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput, cooldownSessions: number): string[] {
  const reasons: string[] = [];
  if (!candidate.equipment_required.every((equipment) => input.userEquipment.includes(equipment))) reasons.push("Required equipment is unavailable.");
  if (!experienceAllowed(candidate, input.userExperienceLevel)) reasons.push("Setup or skill demand is not appropriate for experience level.");
  if (input.userPreferences?.dislikedExerciseIds?.includes(candidate.id)) reasons.push("User preference indicates this exercise should be avoided.");
  if (input.userPreferences?.dislikedVariationFamilies?.includes(candidate.variation_family)) reasons.push("User preference indicates this variation family should be avoided.");
  if (recentlySaturated(candidate, input)) reasons.push("Candidate was recently saturated.");
  if (recentlyUsed(candidate, input, cooldownSessions)) reasons.push("Candidate is still inside rotation cooldown.");
  if (isPrimaryLift(input.currentExercise) && !safetyRequiresLargerChange(input) && lowTransferAccessory(candidate, input)) {
    reasons.push("Low-transfer accessory is not an appropriate replacement for a primary lift.");
  }
  if (input.painIssueFlag !== "none" && candidate.joint_stress_profile === "high") reasons.push("Joint stress is too high for current pain or issue flag.");
  if (input.fatigueRecoveryStatus === "poor" && candidate.fatigue_cost === "high") reasons.push("Fatigue cost is too high for current recovery status.");
  return reasons;
}

function scoreCandidate(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): number {
  let score = 0;
  if (candidate.movement_pattern === input.movementPattern) score += 30;
  if (candidate.primary_muscles.includes(input.targetRegion)) score += 18;
  if (candidate.variation_family === input.currentExercise.variation_family) score += smallestUsefulVariationPreferred(input) ? 16 : 6;
  if (intentBias(candidate, input.trainingMethod) === "high") score += 16;
  if (intentBias(candidate, input.trainingMethod) === "moderate") score += 8;
  if (candidate.transfer_tags.some((tag) => input.currentExercise.transfer_tags.includes(tag))) score += 10;
  if (input.limitingFactorTags?.some((tag) => candidate.transfer_tags.includes(tag))) score += 12;
  if (input.painIssueFlag !== "none") score += lowStressScore(candidate);
  if (input.fatigueRecoveryStatus === "poor" || input.fatigueRecoveryStatus === "strained") score += lowFatigueScore(candidate);
  score += trainingStateScore(candidate, input);
  score += primaryLiftTransferScore(candidate, input);
  score += correspondenceScore(candidate, input.currentExercise);
  return score;
}

function reasonCodesFor(selected: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): RotationReasonCode[] {
  const codes: RotationReasonCode[] = [];
  if (selected.movement_pattern === input.movementPattern) codes.push("movement_pattern_preserved");
  if (intentBias(selected, input.trainingMethod) !== "low") codes.push("training_intent_preserved");
  if (selected.variation_family === input.currentExercise.variation_family) codes.push("smallest_meaningful_variation");
  if (isPrimaryLift(input.currentExercise) && selected.loadability === "high" && selected.measurability === "high") codes.push("measurable_loadable_primary");
  if (isPrimaryLift(input.currentExercise) && !lowTransferAccessory(selected, input)) codes.push("primary_lift_transfer_protected");
  if (input.painIssueFlag !== "none" && selected.joint_stress_profile !== "high") codes.push("pain_safer_variation");
  if (selected.equipment_required.every((equipment) => input.userEquipment.includes(equipment))) codes.push("equipment_respected");
  if (experienceAllowed(selected, input.userExperienceLevel)) codes.push("experience_level_respected");
  codes.push("training_state_matched");
  if (input.limitingFactorTags?.some((tag) => selected.transfer_tags.includes(tag))) codes.push("limiting_factor_addressed");
  if (!recentlySaturated(selected, input)) codes.push("recent_saturation_avoided");
  if (!recentlyUsed(selected, input, input.rotationCooldownSessions ?? defaultCooldownFor(input.currentExercise))) codes.push("cooldown_respected");
  if ((input.fatigueRecoveryStatus === "poor" || input.fatigueRecoveryStatus === "strained") && selected.fatigue_cost !== "high") codes.push("lower_fatigue_selected");
  return unique(codes);
}

function rotationScopeFor(selected: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): RotationScope {
  if (selected.movement_pattern !== input.movementPattern) return "movement_pattern";
  if (selected.variation_family !== input.currentExercise.variation_family) return "variation_family";
  return "exercise";
}

function adaptationStillOccurring(input: ExerciseRotationPolicyInput): boolean {
  if (input.adaptationStatus === "adapting" && input.adaptationConfidence >= 70) return true;
  return input.adaptationStatus === "likely_adapting"
    && input.adaptationConfidence >= 70
    && !input.interventionReasonCodes.includes("exercise_age_high_with_flat_performance");
}

function experienceAllowed(candidate: ExerciseRotationCandidate, experience: ExperienceLevel): boolean {
  if (experience === "advanced") return true;
  if (experience === "intermediate") return candidate.skill_level !== "advanced" || candidate.setup_complexity !== "high";
  return candidate.skill_level === "beginner" && candidate.setup_complexity !== "high";
}

function recentlySaturated(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): boolean {
  return input.exerciseHistory.some((item) => item.exerciseId === candidate.id && item.saturatedRecently);
}

function recentlyUsed(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput, cooldownSessions: number): boolean {
  return input.exerciseHistory.some((item) => item.exerciseId === candidate.id && item.lastUsedSessionOffset !== undefined && item.lastUsedSessionOffset < cooldownSessions);
}

function isPrimaryLift(exercise: ExerciseRotationCandidate): boolean {
  return exercise.loadability === "high"
    && exercise.measurability === "high"
    && (exercise.strength_bias === "high" || exercise.transfer_tags.includes("competition_lift") || exercise.transfer_tags.includes("primary_lift"));
}

function safetyRequiresLargerChange(input: ExerciseRotationPolicyInput): boolean {
  return input.painIssueFlag === "pain" || input.painIssueFlag === "technical_breakdown" || input.painIssueFlag === "unsafe";
}

function lowTransferAccessory(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): boolean {
  return candidate.loadability === "low"
    || candidate.measurability === "low"
    || candidate.movement_pattern !== input.movementPattern
    || candidate.transfer_tags.includes("isolation_accessory");
}

function smallestUsefulVariationPreferred(input: ExerciseRotationPolicyInput): boolean {
  return input.painIssueFlag === "none" && input.fatigueRecoveryStatus !== "poor";
}

function intentBias(candidate: ExerciseRotationCandidate, method: RotationTrainingMethod): RotationScoreLevel {
  if (method === "hypertrophy") return candidate.hypertrophy_bias;
  if (method === "strength") return candidate.strength_bias;
  if (method === "power") return candidate.power_bias;
  if (method === "skill") return candidate.measurability === "high" ? "high" : "moderate";
  if (method === "recovery") return candidate.fatigue_cost === "low" ? "high" : "low";
  return candidate.progression_compatibility;
}

function lowStressScore(candidate: ExerciseRotationCandidate): number {
  if (candidate.joint_stress_profile === "low") return 36;
  if (candidate.joint_stress_profile === "moderate") return -4;
  return -24;
}

function lowFatigueScore(candidate: ExerciseRotationCandidate): number {
  if (candidate.fatigue_cost === "low") return 16;
  if (candidate.fatigue_cost === "moderate") return 8;
  return -12;
}

function trainingStateScore(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): number {
  switch (input.trainingState) {
    case "foundation":
      return candidate.skill_level === "beginner" && candidate.stability_demand !== "high" ? 16 : 0;
    case "accumulation":
      return candidate.hypertrophy_bias !== "low" && candidate.fatigue_cost !== "high" ? 14 : 0;
    case "intensification":
      return candidate.loadability === "high" && candidate.strength_bias !== "low" ? 16 : 0;
    case "realisation":
      return candidate.measurability === "high" && candidate.loadability === "high" ? 18 : 0;
    case "pivot":
      return candidate.fatigue_cost === "low" || candidate.joint_stress_profile === "low" ? 16 : 0;
  }
}

function primaryLiftTransferScore(candidate: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): number {
  if (!isPrimaryLift(input.currentExercise)) return 0;
  if (candidate.movement_pattern !== input.movementPattern) return -30;
  if (candidate.loadability === "high" && candidate.measurability === "high") return 18;
  if (candidate.loadability === "moderate" && candidate.measurability !== "low") return 8;
  return -20;
}

function correspondenceScore(candidate: ExerciseRotationCandidate, current: ExerciseRotationCandidate): number {
  let score = 0;
  if (candidate.range_of_motion_profile === current.range_of_motion_profile) score += 5;
  if (candidate.force_direction && candidate.force_direction === current.force_direction) score += 5;
  if (candidate.strength_quality && candidate.strength_quality === current.strength_quality) score += 5;
  return score;
}

function loadingAdjustmentFor(selected: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): string {
  if (input.painIssueFlag !== "none") return "Start conservatively and prioritise pain-free execution.";
  if (input.fatigueRecoveryStatus === "poor" || selected.fatigue_cost === "low") return "Use a conservative load and rebuild comparable performance.";
  if (selected.loadability === "high" && selected.measurability === "high") return "Use a conservative comparable load and re-establish progression.";
  return "Use conservative starting effort until performance is measurable.";
}

function reviewWindowFor(input: ExerciseRotationPolicyInput): number {
  if (input.trainingState === "realisation") return 1;
  if (input.trainingState === "foundation" || input.trainingState === "pivot") return 2;
  return 3;
}

function defaultCooldownFor(currentExercise: ExerciseRotationCandidate): number {
  return isPrimaryLift(currentExercise) ? 4 : 3;
}

function confidenceFor(selected: ExerciseRotationCandidate, input: ExerciseRotationPolicyInput): number {
  let confidence = Math.min(88, input.adaptationConfidence + 8);
  if (selected.movement_pattern !== input.movementPattern) confidence -= 18;
  if (selected.equipment_required.some((equipment) => !input.userEquipment.includes(equipment))) confidence -= 25;
  if (input.painIssueFlag !== "none" && selected.joint_stress_profile === "low") confidence += 4;
  if (input.exerciseHistory.length === 0) confidence -= 4;
  return clamp(confidence);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
