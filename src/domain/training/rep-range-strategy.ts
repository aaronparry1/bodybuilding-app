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

export type RepRangeAuthoritySource = "explicit_slot_override" | "block_compatibility" | "exercise_family_override" | "exercise_default" | "advanced_method" | "programme_default";
export type ResolvedRepRangeDecision = Readonly<{ status: "resolved"; value: RepRange; authoritySource: RepRangeAuthoritySource; appliedIdentity: string }>; 
export type ResolvedCompatibilityAdvancedMethodDecision = Readonly<{ status: "applied" | "not_applicable"; value?: RepRange; methodIdentity?: string; ownership: "rep" | "lane" | "both"; reasonCode: string }>;

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
  return resolveRepRangeDecision(input).value;
}

/** Internal rich result; the public façade above intentionally remains primitive. */
export function resolveRepRangeDecision(input: ResolveRepRangeInput): ResolvedRepRangeDecision {
  const explicit = normalizeRepRange(input.programmeSlotOverride);
  if (explicit) return { status: "resolved", value: explicit, authoritySource: "explicit_slot_override", appliedIdentity: "programme_slot_override" };

  const blockRoleRange = resolveBlockRoleRepRange(input.blockType, input.exerciseRole, input.exerciseFamily, input.movementPattern);
  if (blockRoleRange) return { status: "resolved", value: blockRoleRange, authoritySource: "block_compatibility", appliedIdentity: `block:${input.blockType ?? "default"}` };

  const familyRange = input.exerciseFamily ? normalizeRepRange(familyOverrides[input.exerciseFamily]) : null;
  if (familyRange) return { status: "resolved", value: familyRange, authoritySource: "exercise_family_override", appliedIdentity: `family:${input.exerciseFamily}` };

  const exerciseDefault = normalizeRepRange(input.exerciseDefault);
  if (exerciseDefault) return { status: "resolved", value: exerciseDefault, authoritySource: "exercise_default", appliedIdentity: "exercise_default_rep_range" };

  const advanced = resolveAdvancedMethodDecision(input);
  if (advanced.status === "applied" && advanced.value) return { status: "resolved", value: advanced.value, authoritySource: "advanced_method", appliedIdentity: advanced.methodIdentity ?? "user_advanced_override" };

  return { status: "resolved", value: safeFallback, authoritySource: "programme_default", appliedIdentity: "safe_fallback" };
}

function resolveAdvancedMethodDecision(input: ResolveRepRangeInput): ResolvedCompatibilityAdvancedMethodDecision {
  if (!input.userAdvancedOverride?.enabled) return { status: "not_applicable", ownership: "rep", reasonCode: "advanced_method_not_applicable" };
  const value = normalizeRepRange(input.userAdvancedOverride.repRange);
  if (!value) return { status: "not_applicable", ownership: "rep", reasonCode: "advanced_method_invalid" };
  return { status: "applied", value, methodIdentity: "user_advanced_override", ownership: "rep", reasonCode: "advanced_method_selected" };
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
