import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseFamily, ExerciseRole, MovementPattern, RepRange } from "@/domain/training/models";

export interface UserAdvancedRepRangeOverride {
  enabled: boolean;
  repRange?: RepRange;
}

export interface ResolveRepRangeInput {
  blockType?: BlockType | null;
  exerciseRole?: ExerciseRole | null;
  exerciseFamily?: ExerciseFamily | null;
  movementPattern?: MovementPattern | null;
  programmeSlotOverride?: RepRange | null;
  exerciseDefault?: RepRange | null;
  userAdvancedOverride?: UserAdvancedRepRangeOverride | null;
}

const safeFallback: RepRange = { min: 8, max: 12 };

const familyOverrides: Partial<Record<ExerciseFamily, RepRange>> = {
  calf_raise: { min: 10, max: 25 },
  rear_delt_corrective: { min: 12, max: 25 },
  core_flexion: { min: 10, max: 20 },
  core_stability: { min: 8, max: 15 },
  hyperextension: { min: 8, max: 15 },
  forearm: { min: 12, max: 25 },
  adductor: { min: 12, max: 25 },
  abductor: { min: 12, max: 25 },
  olympic_power: { min: 1, max: 3 },
  jump_power: { min: 1, max: 5 },
  throw_power: { min: 1, max: 5 },
};

const smallMuscleFamilies = new Set<ExerciseFamily>([
  "biceps_isolation",
  "triceps_isolation",
  "shoulder_isolation",
  "rear_delt_corrective",
  "calf_raise",
  "forearm",
  "adductor",
  "abductor",
]);

export function resolveRepRange(input: ResolveRepRangeInput): RepRange {
  const explicit = normalizeRepRange(input.programmeSlotOverride);
  if (explicit) return explicit;

  const blockRoleRange = resolveBlockRoleRepRange(input.blockType, input.exerciseRole, input.exerciseFamily, input.movementPattern);
  if (blockRoleRange) return blockRoleRange;

  const familyRange = input.exerciseFamily ? normalizeRepRange(familyOverrides[input.exerciseFamily]) : null;
  if (familyRange) return familyRange;

  const exerciseDefault = normalizeRepRange(input.exerciseDefault);
  if (exerciseDefault) return exerciseDefault;

  const advanced = input.userAdvancedOverride?.enabled ? normalizeRepRange(input.userAdvancedOverride.repRange) : null;
  if (advanced) return advanced;

  return safeFallback;
}

export function normalizeRepRange(range?: RepRange | null): RepRange | null {
  if (!range) return null;
  const min = Math.floor(Number(range.min));
  const max = Math.floor(Number(range.max));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < 1) return null;
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function resolveBlockRoleRepRange(
  blockType?: BlockType | null,
  role?: ExerciseRole | null,
  family?: ExerciseFamily | null,
  movementPattern?: MovementPattern | null,
): RepRange | null {
  if (!blockType) return null;
  const normalizedBlock = blockType === "strength_hypertrophy" ? "powerbuilding" : blockType;

  if (family === "olympic_power") return { min: 1, max: 3 };
  if (family === "jump_power" || family === "throw_power") return { min: 1, max: 5 };

  if (family && familyOverrides[family] && isSmallMuscleFamily(family)) {
    return familyOverrides[family]!;
  }

  const effectiveRole = role ?? inferRoleFromMovement(movementPattern);
  const smallMuscle = family ? isSmallMuscleFamily(family) : false;

  if (normalizedBlock === "hypertrophy") {
    if (effectiveRole === "primary_compound") return { min: 6, max: 10 };
    if (effectiveRole === "secondary_compound") return { min: 8, max: 12 };
    if (effectiveRole === "accessory") return { min: 10, max: 15 };
    if (effectiveRole === "isolation") return smallMuscle ? { min: 12, max: 25 } : { min: 10, max: 20 };
    if (effectiveRole === "corrective" || effectiveRole === "recovery" || effectiveRole === "resilience" || effectiveRole === "capacity") return { min: 12, max: 20 };
    if (effectiveRole === "power") return { min: 1, max: 3 };
  }

  if (normalizedBlock === "powerbuilding") {
    if (effectiveRole === "power") return { min: 1, max: 3 };
    if (effectiveRole === "primary_compound") return { min: 4, max: 8 };
    if (effectiveRole === "secondary_compound") return { min: 6, max: 10 };
    if (effectiveRole === "accessory") return { min: 8, max: 15 };
    if (effectiveRole === "isolation") return smallMuscle ? { min: 12, max: 20 } : { min: 10, max: 15 };
    if (effectiveRole === "corrective" || effectiveRole === "recovery" || effectiveRole === "resilience" || effectiveRole === "capacity") return { min: 12, max: 20 };
  }

  if (normalizedBlock === "strength") {
    if (effectiveRole === "primary_compound") return { min: 3, max: 5 };
    if (effectiveRole === "secondary_compound") return { min: 5, max: 8 };
    if (effectiveRole === "accessory") return { min: 8, max: 12 };
    if (effectiveRole === "isolation") return smallMuscle ? { min: 12, max: 20 } : { min: 10, max: 15 };
    if (effectiveRole === "corrective" || effectiveRole === "recovery" || effectiveRole === "resilience" || effectiveRole === "capacity") return { min: 10, max: 15 };
    if (effectiveRole === "power") return { min: 1, max: 3 };
  }

  if (normalizedBlock === "power") {
    if (effectiveRole === "power") return { min: 1, max: 3 };
    if (effectiveRole === "primary_compound") return { min: 3, max: 5 };
    if (effectiveRole === "secondary_compound") return { min: 5, max: 8 };
    if (effectiveRole === "accessory" || effectiveRole === "isolation") return smallMuscle ? { min: 10, max: 20 } : { min: 8, max: 12 };
    if (effectiveRole === "corrective" || effectiveRole === "recovery" || effectiveRole === "resilience" || effectiveRole === "capacity") return { min: 10, max: 20 };
  }

  if (normalizedBlock === "peak") {
    if (effectiveRole === "primary_compound" || effectiveRole === "power") return { min: 1, max: 3 };
    if (effectiveRole === "secondary_compound") return { min: 3, max: 5 };
    if (effectiveRole === "corrective" || effectiveRole === "recovery" || effectiveRole === "resilience" || effectiveRole === "capacity") return { min: 10, max: 15 };
    return { min: 8, max: 12 };
  }

  if (normalizedBlock === "deload") {
    if (effectiveRole === "primary_compound") return { min: 6, max: 10 };
    if (effectiveRole === "secondary_compound") return { min: 8, max: 12 };
    return { min: 10, max: 15 };
  }

  return null;
}

function isSmallMuscleFamily(family: ExerciseFamily): boolean {
  return smallMuscleFamilies.has(family);
}

function inferRoleFromMovement(movementPattern?: MovementPattern | null): ExerciseRole {
  if (movementPattern === "isolation" || movementPattern === "core") return "isolation";
  return "secondary_compound";
}
