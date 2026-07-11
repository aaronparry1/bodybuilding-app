import type { BlockType } from "@/domain/training/annual-models";
import type {
  ExerciseFamily,
  ExerciseKind,
  ExerciseRole,
  ExperienceLevel,
  MuscleGroup,
  MovementPattern,
  TrainingLane,
} from "@/domain/training/models";

export type SlotPrescriptionRole =
  | "primary_compound"
  | "secondary_compound"
  | "unilateral"
  | "machine_compound"
  | "isolation"
  | "core_bracing"
  | "calves"
  | "small_muscle_accessory"
  | "power_movement"
  | "specific_peak_lift"
  | "recovery_movement";

export type FatigueSensitivity = "low" | "moderate" | "high";
export type ProgressionAggressiveness = "none" | "conservative" | "moderate";

export interface SlotPrescriptionInput {
  blockType?: BlockType | null;
  slotRole?: string | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  movementPattern?: MovementPattern | null;
  primaryMuscles?: MuscleGroup[];
  exerciseKind?: ExerciseKind | null;
  trainingLane?: TrainingLane | null;
  experienceLevel?: ExperienceLevel;
  slotSets?: number;
}

export interface EvidenceBasedSlotPrescription {
  role: SlotPrescriptionRole;
  requiredSets: number;
  recommendedMinSets: number;
  recommendedMaxSets: number;
  softCapSets: number;
  hardCapSets?: number;
  repRangeNote: string;
  fatigueSensitivity: FatigueSensitivity;
  progressionAggressiveness: ProgressionAggressiveness;
  canAddVolume: boolean;
  canReduceVolume: boolean;
}

interface MatrixSpec {
  requiredSets: number;
  recommendedMinSets: number;
  recommendedMaxSets: number;
  softCapSets: number;
  hardCapSets?: number;
  repRangeNote: string;
  fatigueSensitivity: FatigueSensitivity;
  progressionAggressiveness: ProgressionAggressiveness;
  canAddVolume: boolean;
  canReduceVolume: boolean;
}

type PrescriptionBlock = "hypertrophy" | "powerbuilding" | "strength" | "power" | "peak" | "recovery_window";

const smallMuscles = new Set<MuscleGroup>(["biceps", "triceps", "forearms", "rear_delts", "traps"]);

const matrix: Record<PrescriptionBlock, Record<SlotPrescriptionRole, MatrixSpec>> = {
  hypertrophy: {
    primary_compound: spec(3, 3, 5, 6, "6-10 or 8-12", "high", "moderate", true),
    secondary_compound: spec(2, 2, 4, 5, "8-12", "moderate", "moderate", true),
    unilateral: spec(2, 2, 4, 4, "8-15", "moderate", "moderate", true),
    machine_compound: spec(2, 2, 4, 5, "8-15", "moderate", "moderate", true),
    isolation: spec(2, 2, 4, 5, "10-20", "low", "moderate", true),
    core_bracing: spec(2, 2, 3, 4, "8-20 reps or timed holds", "moderate", "conservative", true),
    calves: spec(2, 2, 5, 6, "10-25", "low", "moderate", true),
    small_muscle_accessory: spec(2, 2, 5, 6, "10-20", "low", "moderate", true),
    power_movement: spec(2, 2, 3, 3, "1-5 crisp reps", "high", "conservative", false),
    specific_peak_lift: spec(2, 2, 4, 4, "3-6", "high", "conservative", false),
    recovery_movement: spec(1, 1, 2, 3, "easy quality work", "low", "none", false),
  },
  powerbuilding: {
    primary_compound: spec(3, 3, 5, 5, "3-8", "high", "conservative", false),
    secondary_compound: spec(2, 2, 4, 4, "6-10", "moderate", "moderate", true),
    unilateral: spec(2, 2, 3, 4, "8-12", "moderate", "conservative", true),
    machine_compound: spec(2, 2, 4, 4, "8-12", "moderate", "moderate", true),
    isolation: spec(2, 2, 4, 5, "10-20", "low", "moderate", true),
    core_bracing: spec(2, 2, 3, 4, "8-20 reps or timed holds", "moderate", "conservative", true),
    calves: spec(2, 2, 4, 5, "10-25", "low", "moderate", true),
    small_muscle_accessory: spec(2, 2, 4, 5, "10-20", "low", "moderate", true),
    power_movement: spec(2, 2, 4, 4, "1-5 crisp reps", "high", "conservative", false),
    specific_peak_lift: spec(2, 2, 4, 4, "2-6", "high", "conservative", false),
    recovery_movement: spec(1, 1, 2, 3, "easy quality work", "low", "none", false),
  },
  strength: {
    primary_compound: spec(3, 3, 5, 5, "2-6", "high", "conservative", false),
    secondary_compound: spec(2, 2, 4, 4, "3-8", "moderate", "conservative", false),
    unilateral: spec(2, 2, 3, 3, "6-10", "moderate", "conservative", false),
    machine_compound: spec(2, 2, 3, 4, "6-10", "moderate", "conservative", false),
    isolation: spec(2, 2, 3, 4, "8-15", "low", "conservative", true),
    core_bracing: spec(2, 2, 3, 3, "6-15 reps or timed holds", "moderate", "conservative", false),
    calves: spec(1, 1, 3, 4, "8-20", "low", "conservative", true),
    small_muscle_accessory: spec(2, 2, 3, 4, "8-15", "low", "conservative", true),
    power_movement: spec(2, 2, 3, 4, "1-5 crisp reps", "high", "conservative", false),
    specific_peak_lift: spec(2, 2, 4, 4, "1-4", "high", "conservative", false),
    recovery_movement: spec(1, 1, 2, 3, "easy quality work", "low", "none", false),
  },
  power: {
    primary_compound: spec(2, 2, 4, 4, "2-5 fast reps", "high", "conservative", false),
    secondary_compound: spec(2, 2, 3, 4, "3-6", "moderate", "conservative", false),
    unilateral: spec(1, 1, 3, 3, "5-8", "moderate", "conservative", false),
    machine_compound: spec(1, 1, 3, 3, "5-8", "low", "conservative", false),
    isolation: spec(1, 1, 3, 3, "8-15", "low", "conservative", false),
    core_bracing: spec(2, 2, 3, 3, "bracing quality or anti-rotation", "moderate", "conservative", false),
    calves: spec(1, 1, 3, 3, "8-20", "low", "conservative", false),
    small_muscle_accessory: spec(1, 1, 3, 3, "8-15", "low", "conservative", false),
    power_movement: spec(3, 3, 5, 5, "1-5 crisp reps", "high", "conservative", false),
    specific_peak_lift: spec(2, 2, 4, 4, "1-4", "high", "conservative", false),
    recovery_movement: spec(1, 1, 2, 3, "easy quality work", "low", "none", false),
  },
  peak: {
    primary_compound: spec(2, 2, 4, 4, "1-4", "high", "conservative", false),
    secondary_compound: spec(1, 1, 3, 3, "2-5", "moderate", "conservative", false),
    unilateral: spec(1, 1, 2, 2, "5-8", "moderate", "none", false),
    machine_compound: spec(1, 1, 2, 2, "5-8", "low", "none", false),
    isolation: spec(1, 1, 2, 2, "8-12", "low", "none", false),
    core_bracing: spec(1, 1, 2, 2, "low-fatigue bracing", "moderate", "none", false),
    calves: spec(1, 1, 2, 2, "8-15", "low", "none", false),
    small_muscle_accessory: spec(1, 1, 2, 2, "8-12", "low", "none", false),
    power_movement: spec(2, 2, 3, 3, "1-3 crisp reps", "high", "conservative", false),
    specific_peak_lift: spec(2, 2, 4, 4, "1-4", "high", "conservative", false),
    recovery_movement: spec(1, 1, 2, 2, "easy quality work", "low", "none", false),
  },
  recovery_window: {
    primary_compound: spec(1, 1, 3, 3, "easy technique work", "moderate", "none", false),
    secondary_compound: spec(1, 1, 3, 3, "easy technique work", "low", "none", false),
    unilateral: spec(1, 1, 2, 2, "easy quality work", "low", "none", false),
    machine_compound: spec(1, 1, 2, 3, "easy quality work", "low", "none", false),
    isolation: spec(1, 1, 2, 2, "easy pump or movement quality", "low", "none", false),
    core_bracing: spec(1, 1, 2, 2, "easy bracing practice", "low", "none", false),
    calves: spec(1, 1, 2, 2, "easy quality work", "low", "none", false),
    small_muscle_accessory: spec(1, 1, 2, 2, "easy quality work", "low", "none", false),
    power_movement: spec(1, 1, 2, 2, "low-skill crisp work only", "moderate", "none", false),
    specific_peak_lift: spec(1, 1, 3, 3, "easy technique work", "moderate", "none", false),
    recovery_movement: spec(1, 1, 2, 2, "easy recovery work", "low", "none", false),
  },
};

export function classifySlotPrescriptionRole(input: SlotPrescriptionInput): SlotPrescriptionRole {
  const block = normalizeBlock(input.blockType);
  const primaryMuscles = input.primaryMuscles ?? [];
  const slotRole = input.slotRole ?? "";
  const family = input.exerciseFamily;
  const movementPattern = input.movementPattern;
  const exerciseRole = input.exerciseRole;

  if (block === "peak" && (slotRole === "heavy_primary" || input.trainingLane === "peak")) return "specific_peak_lift";
  if (input.trainingLane === "recovery" || exerciseRole === "recovery") return "recovery_movement";
  if (
    input.trainingLane === "power" ||
    exerciseRole === "power" ||
    family === "olympic_power" ||
    family === "jump_power" ||
    family === "throw_power"
  ) {
    return "power_movement";
  }
  if (movementPattern === "core" || family === "core_flexion" || family === "core_stability" || primaryMuscles.includes("abs")) {
    return "core_bracing";
  }
  if (family === "calf_raise" || primaryMuscles.length > 0 && primaryMuscles.every((muscle) => muscle === "calves")) return "calves";
  if (family === "single_leg" || movementPattern === "lunge") return "unilateral";
  if (slotRole === "heavy_primary" || slotRole === "primary_compound") return "primary_compound";
  if ((input.exerciseKind === "machine" || input.exerciseKind === "smith") && (exerciseRole === "primary_compound" || exerciseRole === "secondary_compound")) {
    return "machine_compound";
  }
  if (primaryMuscles.length > 0 && primaryMuscles.every((muscle) => smallMuscles.has(muscle))) return "small_muscle_accessory";
  if (exerciseRole === "primary_compound") return "primary_compound";
  if (slotRole === "heavy_secondary" || slotRole === "strength" || exerciseRole === "secondary_compound") return "secondary_compound";
  return "isolation";
}

export function resolveEvidenceBasedSlotPrescription(input: SlotPrescriptionInput): EvidenceBasedSlotPrescription {
  const block = normalizeBlock(input.blockType);
  const role = classifySlotPrescriptionRole(input);
  const base = matrix[block][role];
  const experienced = applyExperience(base, input.experienceLevel, block, role);
  const slotAdjusted = applySlotSetConstraint(experienced, input.slotSets);

  return {
    role,
    ...slotAdjusted,
  };
}

function normalizeBlock(blockType?: BlockType | null): PrescriptionBlock {
  if (blockType === "powerbuilding" || blockType === "strength_hypertrophy") return "powerbuilding";
  if (blockType === "strength") return "strength";
  if (blockType === "power") return "power";
  if (blockType === "peak") return "peak";
  if (blockType === "deload") return "recovery_window";
  return "hypertrophy";
}

function spec(
  requiredSets: number,
  recommendedMinSets: number,
  recommendedMaxSets: number,
  softCapSets: number,
  repRangeNote: string,
  fatigueSensitivity: FatigueSensitivity,
  progressionAggressiveness: ProgressionAggressiveness,
  canAddVolume: boolean,
): MatrixSpec {
  return {
    requiredSets,
    recommendedMinSets,
    recommendedMaxSets,
    softCapSets,
    hardCapSets: Math.max(softCapSets, recommendedMaxSets),
    repRangeNote,
    fatigueSensitivity,
    progressionAggressiveness,
    canAddVolume,
    canReduceVolume: true,
  };
}

function applyExperience(
  base: MatrixSpec,
  experienceLevel: ExperienceLevel | undefined,
  block: PrescriptionBlock,
  role: SlotPrescriptionRole,
): MatrixSpec {
  if (experienceLevel === "beginner") {
    const protectPrimary = role === "primary_compound" || role === "specific_peak_lift" || role === "power_movement";
    const requiredSets = protectPrimary ? Math.max(2, Math.min(base.requiredSets, 3)) : Math.max(1, base.requiredSets - 1);
    const recommendedMinSets = Math.min(base.recommendedMinSets, requiredSets);
    const recommendedMaxSets = Math.max(recommendedMinSets, base.recommendedMaxSets - 1);
    const softCapSets = Math.max(recommendedMaxSets, base.softCapSets - 1);
    return {
      ...base,
      requiredSets,
      recommendedMinSets,
      recommendedMaxSets,
      softCapSets,
      hardCapSets: Math.min(base.hardCapSets ?? softCapSets, softCapSets),
    };
  }

  const advancedCanExpand =
    experienceLevel === "advanced" &&
    base.canAddVolume &&
    (block === "hypertrophy" || block === "powerbuilding") &&
    role !== "primary_compound";

  if (!advancedCanExpand) return base;

  return {
    ...base,
    recommendedMaxSets: base.recommendedMaxSets + 1,
    softCapSets: base.softCapSets + 1,
    hardCapSets: (base.hardCapSets ?? base.softCapSets) + 1,
  };
}

function applySlotSetConstraint(base: MatrixSpec, slotSets: number | undefined): Omit<EvidenceBasedSlotPrescription, "role"> {
  if (!Number.isFinite(slotSets) || slotSets == null || slotSets > base.requiredSets) {
    return base;
  }

  const requiredSets = Math.max(1, Math.round(slotSets));
  const recommendedMinSets = Math.min(base.recommendedMinSets, requiredSets);
  const recommendedMaxSets = Math.max(recommendedMinSets, Math.min(base.recommendedMaxSets, requiredSets + 2));
  const softCapSets = Math.max(recommendedMaxSets, Math.min(base.softCapSets, recommendedMaxSets + 1));

  return {
    ...base,
    requiredSets,
    recommendedMinSets,
    recommendedMaxSets,
    softCapSets,
    hardCapSets: Math.min(base.hardCapSets ?? softCapSets, softCapSets),
  };
}
