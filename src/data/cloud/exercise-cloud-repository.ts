import type { AppSupabaseClient } from "@/lib/supabase/client";
import { fromJson, toJson } from "@/data/supabase/json";
import type { Json } from "@/data/supabase/database.types";
import type {
  BlockCompatibility,
  Exercise,
  ExerciseFamily,
  ExerciseFatigueCost,
  ExerciseKind,
  ExerciseRole,
  ExerciseSuitability,
  ExerciseTier,
  JointStressEstimate,
  MovementPattern,
  MuscleGroup,
  ProgressionSettings,
  RepRange,
} from "@/domain/training/models";

type ExerciseRow = Record<string, unknown>;

const defaultSuitableBlocks: BlockCompatibility[] = ["hypertrophy", "powerbuilding", "strength_hypertrophy", "strength", "power", "peak", "deload"];
const defaultRepRange: RepRange = { min: 8, max: 12 };

export function mapExerciseRowToExercise(row: ExerciseRow): Exercise {
  const repRange = resolveRepRange(row);
  const kind = String(row.exercise_kind ?? row.kind ?? "other") as ExerciseKind;
  const category = String(row.category ?? "chest") as MuscleGroup;
  const movementPattern = String(row.movement_pattern ?? "isolation") as MovementPattern;
  const equipment = stringArray(row.equipment);
  const suitableBlocks = stringArray(row.suitable_blocks) as BlockCompatibility[];
  const roles = resolveExerciseRoles(row, movementPattern, kind);
  const role = resolveExerciseRole(row, roles);
  const family = resolveExerciseFamily(row, category, movementPattern, role);
  const tier = resolveExerciseTier(row, role);
  const fatigueCost = resolveFatigueCost(row, role);
  const jointStress = resolveJointStress(row, role);
  const suitability = resolveSuitability(row);
  const defaultSettings =
    row.default_settings == null
      ? buildDefaultSettings(repRange, Number(row.default_load_jump ?? 2.5))
      : fromJson<ProgressionSettings>(row.default_settings as Json);

  return {
    id: String(row.id),
    name: String(row.name),
    category,
    primaryMuscles: stringArray(row.primary_muscles) as Exercise["primaryMuscles"],
    secondaryMuscles: stringArray(row.secondary_muscles) as Exercise["secondaryMuscles"],
    equipment: equipment as Exercise["equipment"],
    movementPattern,
    defaultRepRange: repRange,
    defaultLoadJump: Number(row.default_load_jump ?? 2.5),
    unitCompatibility: (stringArray(row.unit_compatibility).length ? stringArray(row.unit_compatibility) : ["kg", "lb"]) as Exercise["unitCompatibility"],
    kind,
    role,
    roles,
    family,
    tier,
    fatigueCost,
    jointStress,
    suitability,
    isBeginnerFriendly: Boolean(row.is_beginner_friendly),
    isAdvanced: Boolean(row.is_advanced),
    notes: stringArray(row.notes),
    suitableBlocks: suitableBlocks.length ? suitableBlocks : defaultSuitableBlocks,
    swapTags: resolveSwapTags(row, category, movementPattern, kind, equipment, role, family, tier),
    createdByUserId: (row.created_by_user_id as string | null | undefined) ?? null,
    isCustom: Boolean(row.is_custom),
    defaultSettings: {
      ...defaultSettings,
      repRange: defaultSettings.repRange ?? repRange,
      loadIncrease: Number(defaultSettings.loadIncrease ?? row.default_load_jump ?? 2.5),
    },
  };
}

function resolveExerciseRoles(row: ExerciseRow, movementPattern: MovementPattern, kind: ExerciseKind): ExerciseRole[] {
  const roles = stringArray(row.exercise_roles) as ExerciseRole[];
  if (roles.length > 0) return roles;
  if (movementPattern === "isolation") return ["isolation"];
  if (movementPattern === "core" || movementPattern === "carry") return ["accessory", "corrective"];
  if (movementPattern === "hinge" && kind === "bodyweight") return ["accessory"];
  if (kind === "barbell" || movementPattern === "squat" || movementPattern === "hinge") return ["primary_compound"];
  return ["secondary_compound"];
}

function resolveExerciseRole(row: ExerciseRow, roles: ExerciseRole[]): ExerciseRole {
  const role = String(row.exercise_role ?? "") as ExerciseRole;
  if (isExerciseRole(role)) return role;
  return roles[0] ?? "isolation";
}

function resolveExerciseFamily(row: ExerciseRow, category: MuscleGroup, movementPattern: MovementPattern, role: ExerciseRole): ExerciseFamily {
  const family = String(row.exercise_family ?? row.family ?? "") as ExerciseFamily;
  if (isExerciseFamily(family)) return family;
  const name = String(row.name ?? "").toLowerCase();
  if (name.includes("back extension") || name.includes("reverse hyper")) return "hyperextension";
  if (role === "power") return movementPattern === "hinge" ? "olympic_power" : movementPattern === "squat" ? "jump_power" : "throw_power";
  if (category === "chest" && movementPattern === "isolation") return "chest_isolation";
  if ((category === "shoulders" || category === "rear_delts") && movementPattern === "isolation") return "shoulder_isolation";
  if (category === "biceps" && movementPattern === "isolation") return "biceps_isolation";
  if (category === "triceps" && movementPattern === "isolation") return "triceps_isolation";
  if (category === "quads" && movementPattern === "isolation") return "quad_isolation";
  if (category === "hamstrings" && movementPattern === "isolation") return "hamstring_isolation";
  if (category === "glutes" && movementPattern === "isolation") return "glute_isolation";
  if (category === "calves") return "calf_raise";
  if (category === "forearms") return "forearm";
  if (category === "traps") return "trap";
  if (category === "adductors") return "adductor";
  if (category === "abductors") return "abductor";
  if (movementPattern === "horizontal_push") return "horizontal_press";
  if (movementPattern === "vertical_push") return "vertical_press";
  if (movementPattern === "horizontal_pull") return "horizontal_pull";
  if (movementPattern === "vertical_pull") return "vertical_pull";
  if (movementPattern === "squat") return "squat_pattern";
  if (movementPattern === "hinge") return "hip_hinge";
  if (movementPattern === "hip_thrust") return "hip_thrust";
  if (movementPattern === "lunge") return "single_leg";
  if (movementPattern === "core") return "core_flexion";
  if (movementPattern === "carry") return "carry";
  return "other";
}

function resolveExerciseTier(row: ExerciseRow, role: ExerciseRole): ExerciseTier {
  const tier = String(row.exercise_tier ?? row.tier ?? "") as ExerciseTier;
  if (tier === "A" || tier === "B" || tier === "C") return tier;
  if (role === "primary_compound" || role === "power") return "A";
  if (role === "secondary_compound" || role === "accessory") return "B";
  return "C";
}

function resolveFatigueCost(row: ExerciseRow, role: ExerciseRole): ExerciseFatigueCost {
  const value = String(row.fatigue_cost ?? "") as ExerciseFatigueCost;
  if (value === "low" || value === "moderate" || value === "high") return value;
  if (role === "primary_compound" || role === "power") return "high";
  if (role === "secondary_compound" || role === "accessory") return "moderate";
  return "low";
}

function resolveJointStress(row: ExerciseRow, role: ExerciseRole): JointStressEstimate {
  const value = String(row.joint_stress ?? "") as JointStressEstimate;
  if (value === "low" || value === "moderate" || value === "high") return value;
  if (role === "primary_compound" || role === "power") return "high";
  if (role === "secondary_compound") return "moderate";
  return "low";
}

function resolveSuitability(row: ExerciseRow): ExerciseSuitability[] {
  const values = stringArray(row.suitability).filter(isExerciseSuitability);
  if (values.length > 0) return values;
  return Boolean(row.is_advanced) ? ["intermediate", "advanced"] : ["beginner", "intermediate", "advanced"];
}

export function buildExerciseUpsertPayload(userId: string, exercise: Exercise) {
  return {
    id: exercise.id,
    user_id: userId,
    created_by_user_id: userId,
    name: exercise.name,
    category: exercise.category,
    primary_muscles: exercise.primaryMuscles,
    secondary_muscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    movement_pattern: exercise.movementPattern,
    default_rep_range: toJson(exercise.defaultRepRange),
    default_rep_range_min: exercise.defaultRepRange.min,
    default_rep_range_max: exercise.defaultRepRange.max,
    default_load_jump: exercise.defaultLoadJump,
    unit_compatibility: exercise.unitCompatibility,
    kind: exercise.kind,
    exercise_kind: exercise.kind,
    exercise_role: exercise.role,
    exercise_roles: exercise.roles,
    exercise_family: exercise.family,
    exercise_tier: exercise.tier,
    fatigue_cost: exercise.fatigueCost,
    joint_stress: exercise.jointStress,
    suitability: exercise.suitability,
    is_beginner_friendly: exercise.isBeginnerFriendly,
    is_advanced: exercise.isAdvanced,
    notes: exercise.notes,
    suitable_blocks: exercise.suitableBlocks,
    swap_tags: exercise.swapTags,
    is_custom: true,
    default_settings: toJson(exercise.defaultSettings),
    updated_at: new Date().toISOString(),
  };
}

export class ExerciseCloudRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async loadExercises(userId: string): Promise<Exercise[]> {
    const { data, error } = await this.client
      .from("exercises")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order("name");

    if (error) throw error;

    return (data ?? []).map((row) => mapExerciseRowToExercise(row));
  }

  async saveCustomExercise(userId: string, exercise: Exercise): Promise<void> {
    const { error } = await this.client.from("exercises").upsert(buildExerciseUpsertPayload(userId, exercise));

    if (error) throw error;
  }

  async deleteCustomExercise(userId: string, exerciseId: string): Promise<void> {
    const { error } = await this.client.from("exercises").delete().eq("id", exerciseId).eq("user_id", userId);

    if (error) throw error;
  }
}

function resolveRepRange(row: ExerciseRow): RepRange {
  const min = Number(row.default_rep_range_min);
  const max = Number(row.default_rep_range_max);
  if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) return { min, max };
  if (row.default_rep_range != null) return fromJson<RepRange>(row.default_rep_range as Json);
  return defaultRepRange;
}

function resolveSwapTags(
  row: ExerciseRow,
  category: MuscleGroup,
  movementPattern: MovementPattern,
  kind: ExerciseKind,
  equipment: string[],
  role: ExerciseRole,
  family: ExerciseFamily,
  tier: ExerciseTier,
): string[] {
  const tags = stringArray(row.swap_tags);
  if (tags.length > 0) return tags;
  return [category, movementPattern, kind, role, family, tier, ...equipment].filter(Boolean);
}

function buildDefaultSettings(repRange: RepRange, loadIncrease: number): ProgressionSettings {
  return {
    repRange,
    dropOffPercent: 15,
    loadIncrease,
    unit: "kg",
    requiredWorkSets: 3,
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isExerciseRole(value: string): value is ExerciseRole {
  return ["primary_compound", "secondary_compound", "accessory", "isolation", "power", "recovery", "corrective", "resilience", "capacity"].includes(value);
}

function isExerciseFamily(value: string): value is ExerciseFamily {
  return [
    "horizontal_press",
    "vertical_press",
    "vertical_pull",
    "horizontal_pull",
    "squat_pattern",
    "hip_hinge",
    "hyperextension",
    "hip_thrust",
    "single_leg",
    "chest_isolation",
    "shoulder_isolation",
    "rear_delt_corrective",
    "triceps_isolation",
    "biceps_isolation",
    "calf_raise",
    "core_flexion",
    "core_stability",
    "carry",
    "olympic_power",
    "jump_power",
    "throw_power",
    "quad_isolation",
    "hamstring_isolation",
    "glute_isolation",
    "adductor",
    "abductor",
    "forearm",
    "trap",
    "other",
  ].includes(value);
}

function isExerciseSuitability(value: string): value is ExerciseSuitability {
  return ["beginner", "intermediate", "advanced"].includes(value);
}
