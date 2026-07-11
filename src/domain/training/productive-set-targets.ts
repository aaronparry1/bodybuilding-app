import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseFamily, ExerciseRole, MuscleGroup } from "@/domain/training/models";

export interface ProductiveSetTarget {
  min: number;
  targetMin: number;
  targetMax: number;
  softCap: number;
  hardCap?: number;
  reason: string;
}

export interface ProductiveSetTargetInput {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  primaryMuscles?: MuscleGroup[];
  setPrescription?: {
    recommendedMinSets?: number;
    recommendedMaxSets?: number;
    softCapSets?: number;
    hardCapSets?: number;
  };
}

export interface ProductiveSetGuidance {
  target: ProductiveSetTarget;
  targetText: string;
  softCapReached: boolean;
  softCapText?: string;
}

const smallMuscles = new Set<MuscleGroup>([
  "biceps",
  "triceps",
  "calves",
  "abs",
  "forearms",
  "rear_delts",
  "adductors",
  "abductors",
]);

export function resolveProductiveSetTarget(input: ProductiveSetTargetInput): ProductiveSetTarget {
  const blockType = normalizeBlockType(input.blockType);
  const roleGroup = getRoleGroup(input);
  const baseTarget = targetTable[blockType][roleGroup];
  const target = input.blockType === "deload" ? applyDeloadTargetReduction(baseTarget) : baseTarget;

  return {
    ...target,
    reason:
      input.blockType === "deload"
        ? "Recovery Window guidance lowers productive work. Fatigue and readiness decide how conservative the dose should be."
        : `${title(blockType)} ${roleGroup.replaceAll("_", " ")} guidance keeps volume useful without overriding drop-off.`,
  };
}

export function buildProductiveSetGuidance(
  input: ProductiveSetTargetInput & { productiveSets: number },
): ProductiveSetGuidance {
  const resolvedTarget = resolveProductiveSetTarget(input);
  const target: ProductiveSetTarget = {
    ...resolvedTarget,
    targetMin: positiveInteger(input.setPrescription?.recommendedMinSets, resolvedTarget.targetMin),
    targetMax: Math.max(
      positiveInteger(input.setPrescription?.recommendedMinSets, resolvedTarget.targetMin),
      positiveInteger(input.setPrescription?.recommendedMaxSets, resolvedTarget.targetMax),
    ),
    softCap: Math.max(
      positiveInteger(input.setPrescription?.recommendedMaxSets, resolvedTarget.targetMax),
      positiveInteger(input.setPrescription?.softCapSets, resolvedTarget.softCap),
    ),
    hardCap: input.setPrescription?.hardCapSets ?? resolvedTarget.hardCap,
  };
  const targetText = `Target: ${target.targetMin}-${target.targetMax} productive sets.`;
  const softCapReached = input.productiveSets >= target.softCap;

  return {
    target,
    targetText,
    softCapReached,
    softCapText: softCapReached
      ? `You've completed ${input.productiveSets} productive sets. Most lifters would move on here. Continue only if this is a priority lift.`
      : undefined,
  };
}

type BlockKey = "hypertrophy" | "powerbuilding" | "strength" | "power" | "peak";
type RoleGroup = "primary" | "secondary" | "isolation_accessory" | "small_muscle" | "power" | "maintenance";

const targetTable: Record<BlockKey, Record<RoleGroup, Omit<ProductiveSetTarget, "reason">>> = {
  hypertrophy: {
    primary: { min: 3, targetMin: 4, targetMax: 6, softCap: 8 },
    secondary: { min: 3, targetMin: 3, targetMax: 5, softCap: 7 },
    isolation_accessory: { min: 2, targetMin: 3, targetMax: 5, softCap: 6 },
    small_muscle: { min: 2, targetMin: 3, targetMax: 6, softCap: 8 },
    power: { min: 3, targetMin: 4, targetMax: 6, softCap: 8 },
    maintenance: { min: 2, targetMin: 3, targetMax: 5, softCap: 6 },
  },
  powerbuilding: {
    primary: { min: 3, targetMin: 3, targetMax: 5, softCap: 6 },
    secondary: { min: 2, targetMin: 3, targetMax: 4, softCap: 6 },
    isolation_accessory: { min: 2, targetMin: 2, targetMax: 4, softCap: 5 },
    small_muscle: { min: 2, targetMin: 2, targetMax: 4, softCap: 5 },
    power: { min: 3, targetMin: 3, targetMax: 5, softCap: 6 },
    maintenance: { min: 2, targetMin: 2, targetMax: 4, softCap: 5 },
  },
  strength: {
    primary: { min: 2, targetMin: 3, targetMax: 5, softCap: 6 },
    secondary: { min: 2, targetMin: 2, targetMax: 4, softCap: 5 },
    isolation_accessory: { min: 2, targetMin: 2, targetMax: 3, softCap: 4 },
    small_muscle: { min: 2, targetMin: 2, targetMax: 3, softCap: 4 },
    power: { min: 2, targetMin: 3, targetMax: 5, softCap: 6 },
    maintenance: { min: 2, targetMin: 2, targetMax: 3, softCap: 4 },
  },
  power: {
    primary: { min: 2, targetMin: 3, targetMax: 4, softCap: 5 },
    secondary: { min: 2, targetMin: 3, targetMax: 4, softCap: 5 },
    isolation_accessory: { min: 1, targetMin: 2, targetMax: 3, softCap: 4 },
    small_muscle: { min: 1, targetMin: 2, targetMax: 3, softCap: 4 },
    power: { min: 3, targetMin: 4, targetMax: 8, softCap: 10 },
    maintenance: { min: 1, targetMin: 2, targetMax: 3, softCap: 4 },
  },
  peak: {
    primary: { min: 1, targetMin: 1, targetMax: 3, softCap: 4, hardCap: 5 },
    secondary: { min: 1, targetMin: 1, targetMax: 2, softCap: 3, hardCap: 4 },
    isolation_accessory: { min: 1, targetMin: 1, targetMax: 2, softCap: 3, hardCap: 4 },
    small_muscle: { min: 1, targetMin: 1, targetMax: 2, softCap: 3, hardCap: 4 },
    power: { min: 1, targetMin: 1, targetMax: 3, softCap: 4, hardCap: 5 },
    maintenance: { min: 1, targetMin: 1, targetMax: 2, softCap: 3, hardCap: 4 },
  },
};

function normalizeBlockType(blockType?: BlockType | null): BlockKey {
  if (blockType === "powerbuilding" || blockType === "strength_hypertrophy") return "powerbuilding";
  if (blockType === "strength") return "strength";
  if (blockType === "power") return "power";
  if (blockType === "peak" || blockType === "deload") return "peak";
  return "hypertrophy";
}

function getRoleGroup(input: ProductiveSetTargetInput): RoleGroup {
  if (input.exerciseRole === "power" || input.exerciseFamily === "olympic_power" || input.exerciseFamily === "jump_power" || input.exerciseFamily === "throw_power") {
    return "power";
  }
  if (input.primaryMuscles?.length && input.primaryMuscles.every((muscle) => smallMuscles.has(muscle))) return "small_muscle";
  if (input.exerciseRole === "primary_compound") return "primary";
  if (input.exerciseRole === "secondary_compound") return "secondary";
  if (input.exerciseRole === "isolation" || input.exerciseRole === "accessory") return "isolation_accessory";
  if (input.exerciseRole === "corrective" || input.exerciseRole === "recovery" || input.exerciseRole === "resilience" || input.exerciseRole === "capacity") return "maintenance";
  return "isolation_accessory";
}

function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || value == null) return fallback;
  return Math.max(1, Math.round(value));
}

function applyDeloadTargetReduction(target: Omit<ProductiveSetTarget, "reason">): Omit<ProductiveSetTarget, "reason"> {
  return {
    min: Math.max(1, Math.floor(target.min * 0.55)),
    targetMin: Math.max(1, Math.floor(target.targetMin * 0.55)),
    targetMax: Math.max(1, Math.ceil(target.targetMax * 0.6)),
    softCap: Math.max(2, Math.ceil(target.softCap * 0.6)),
    hardCap: target.hardCap ? Math.max(2, Math.ceil(target.hardCap * 0.6)) : undefined,
  };
}
