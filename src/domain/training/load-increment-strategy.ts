import type { Equipment, Exercise, ExerciseFamily, ExerciseRole, MuscleGroup, UnitSystem } from "@/domain/training/models";

export interface LoadIncrementProfile {
  barbellPlateLoadedKg: 1 | 2.5 | 5;
  dumbbellKg: 1 | 2 | 2.5 | 5;
  cableKg: 1 | 2.5 | 5;
  machineKg: 1 | 2.5 | 5;
  bodyweightExternalLoading: boolean;
}

export type LoadIncrementSource =
  | "exercise_override"
  | "equipment_profile"
  | "equipment_default"
  | "role_muscle_default"
  | "unit_fallback";

export interface LoadIncrementResolution {
  increment: number;
  source: LoadIncrementSource;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface ResolveLoadIncrementInput {
  exercise?: Exercise | null;
  unit?: UnitSystem;
  equipmentProfile?: Partial<LoadIncrementProfile> | null;
  exerciseOverride?: number | null;
  context?: "progression" | "estimate" | "manual_adjust" | "regression";
}

export const defaultLoadIncrementProfile: LoadIncrementProfile = {
  barbellPlateLoadedKg: 2.5,
  dumbbellKg: 2.5,
  cableKg: 5,
  machineKg: 5,
  bodyweightExternalLoading: false,
};

const lbDefaults = {
  barbellPlateLoaded: 5,
  dumbbell: 5,
  cable: 10,
  machine: 10,
  weightedBodyweight: 5,
  smallIsolation: 5,
  fallback: 5,
};

export function normalizeLoadIncrementProfile(profile?: Partial<LoadIncrementProfile> | null): LoadIncrementProfile {
  return {
    barbellPlateLoadedKg: oneOf(profile?.barbellPlateLoadedKg, [1, 2.5, 5], defaultLoadIncrementProfile.barbellPlateLoadedKg),
    dumbbellKg: oneOf(profile?.dumbbellKg, [1, 2, 2.5, 5], defaultLoadIncrementProfile.dumbbellKg),
    cableKg: oneOf(profile?.cableKg, [1, 2.5, 5], defaultLoadIncrementProfile.cableKg),
    machineKg: oneOf(profile?.machineKg, [1, 2.5, 5], defaultLoadIncrementProfile.machineKg),
    bodyweightExternalLoading: Boolean(profile?.bodyweightExternalLoading ?? defaultLoadIncrementProfile.bodyweightExternalLoading),
  };
}

export function resolveLoadIncrement(input: ResolveLoadIncrementInput): LoadIncrementResolution {
  const unit = input.unit ?? "kg";
  const exercise = input.exercise ?? null;
  const profile = normalizeLoadIncrementProfile(input.equipmentProfile);

  if (typeof input.exerciseOverride === "number" && Number.isFinite(input.exerciseOverride) && input.exerciseOverride >= 0) {
    return {
      increment: input.exerciseOverride,
      source: "exercise_override",
      confidence: "high",
      reason: "Using the exercise-specific increment.",
    };
  }

  if (exercise?.kind === "bodyweight" || exercise?.equipment.includes("bodyweight")) {
    if (!profile.bodyweightExternalLoading) {
      return {
        increment: 0,
        source: input.equipmentProfile ? "equipment_profile" : "equipment_default",
        confidence: "high",
        reason: "Bodyweight exercise. External loading is not enabled.",
      };
    }

    return {
      increment: unit === "kg" ? profile.barbellPlateLoadedKg : lbDefaults.weightedBodyweight,
      source: input.equipmentProfile ? "equipment_profile" : "equipment_default",
      confidence: "medium",
      reason: unit === "kg" ? "Rounded to your available plates." : "Rounded to your weighted-bodyweight jumps.",
    };
  }

  const equipment = primaryLoadableEquipment(exercise);
  if (unit === "kg") {
    const fromProfile = incrementFromKgProfile(equipment, profile);
    if (fromProfile != null) {
      const exerciseSpecific = exerciseDefaultOverride(exercise, fromProfile);
      if (exerciseSpecific != null) {
        return {
          increment: exerciseSpecific,
          source: "exercise_override",
          confidence: "high",
          reason: "Using the exercise-specific increment.",
        };
      }

      return {
        increment: adjustForSmallIsolation(fromProfile, exercise),
        source: input.equipmentProfile ? "equipment_profile" : "equipment_default",
        confidence: input.equipmentProfile ? "high" : "medium",
        reason: reasonForEquipment(equipment),
      };
    }
  }

  if (unit === "lb") {
    const fallback = lbIncrementForEquipment(equipment);
    if (fallback != null) {
      return {
        increment: fallback,
        source: input.equipmentProfile ? "equipment_profile" : "equipment_default",
        confidence: "medium",
        reason: reasonForEquipment(equipment),
      };
    }
  }

  const roleMuscleIncrement = roleMuscleDefault(exercise, unit);
  if (roleMuscleIncrement != null) {
    return {
      increment: roleMuscleIncrement,
      source: "role_muscle_default",
      confidence: "low",
      reason: "Using a conservative small-muscle progression jump.",
    };
  }

  return {
    increment: unit === "kg" ? defaultLoadIncrementProfile.barbellPlateLoadedKg : lbDefaults.fallback,
    source: "unit_fallback",
    confidence: "low",
    reason: "Using the safest default jump for the selected unit.",
  };
}

export function roundUpToIncrement(load: number, increment: number): number {
  if (!Number.isFinite(load)) return 0;
  if (!Number.isFinite(increment) || increment <= 0) return Number(load.toFixed(2));
  return Number((Math.ceil(load / increment) * increment).toFixed(2));
}

export function roundDownToIncrement(load: number, increment: number): number {
  if (!Number.isFinite(load)) return 0;
  if (!Number.isFinite(increment) || increment <= 0) return Number(load.toFixed(2));
  return Number((Math.floor(load / increment) * increment).toFixed(2));
}

export function incrementCopy(resolution: LoadIncrementResolution): string {
  return resolution.reason;
}

function primaryLoadableEquipment(exercise?: Exercise | null): Equipment | null {
  if (!exercise) return null;
  if (exercise.equipment.includes("barbell")) return "barbell";
  if (exercise.equipment.includes("smith")) return "smith";
  if (exercise.equipment.includes("dumbbell")) return "dumbbell";
  if (exercise.equipment.includes("cable")) return "cable";
  if (exercise.equipment.includes("machine")) return "machine";
  return exercise.equipment.find((equipment) => equipment !== "bodyweight" && equipment !== "bands") ?? null;
}

function incrementFromKgProfile(equipment: Equipment | null, profile: LoadIncrementProfile): number | null {
  if (equipment === "barbell" || equipment === "smith") return profile.barbellPlateLoadedKg;
  if (equipment === "dumbbell") return profile.dumbbellKg;
  if (equipment === "cable") return profile.cableKg;
  if (equipment === "machine") return profile.machineKg;
  if (equipment === "other") return profile.barbellPlateLoadedKg;
  return null;
}

function lbIncrementForEquipment(equipment: Equipment | null): number | null {
  if (equipment === "barbell" || equipment === "smith" || equipment === "other") return lbDefaults.barbellPlateLoaded;
  if (equipment === "dumbbell") return lbDefaults.dumbbell;
  if (equipment === "cable") return lbDefaults.cable;
  if (equipment === "machine") return lbDefaults.machine;
  return null;
}

function adjustForSmallIsolation(increment: number, exercise?: Exercise | null): number {
  if (!exercise) return increment;
  if (!isSmallIsolation(exercise)) return increment;
  if (exercise.equipment.includes("dumbbell")) return Math.min(increment, 2.5);
  if (exercise.equipment.includes("cable") || exercise.equipment.includes("machine")) return increment;
  return Math.min(increment, 2.5);
}

function exerciseDefaultOverride(exercise: Exercise | null, equipmentIncrement: number): number | null {
  if (!exercise) return null;
  if (!Number.isFinite(exercise.defaultLoadJump) || exercise.defaultLoadJump <= 0) return null;
  if (exercise.defaultLoadJump >= equipmentIncrement) return null;
  return isSmallIsolation(exercise) ? exercise.defaultLoadJump : null;
}

function roleMuscleDefault(exercise: Exercise | null, unit: UnitSystem): number | null {
  if (!exercise || !isSmallIsolation(exercise)) return null;
  return unit === "kg" ? 2.5 : lbDefaults.smallIsolation;
}

function isSmallIsolation(exercise: Exercise): boolean {
  const smallMuscles: MuscleGroup[] = ["biceps", "triceps", "calves", "forearms", "rear_delts", "adductors", "abductors", "abs"];
  const smallFamilies: ExerciseFamily[] = [
    "biceps_isolation",
    "triceps_isolation",
    "calf_raise",
    "forearm",
    "rear_delt_corrective",
    "adductor",
    "abductor",
    "core_flexion",
    "core_stability",
  ];
const isolationRoles: ExerciseRole[] = ["isolation", "corrective", "accessory", "resilience", "capacity"];
  return (
    isolationRoles.includes(exercise.role) &&
    (smallMuscles.includes(exercise.category) || exercise.primaryMuscles.some((muscle) => smallMuscles.includes(muscle)) || smallFamilies.includes(exercise.family))
  );
}

function reasonForEquipment(equipment: Equipment | null): string {
  if (equipment === "barbell" || equipment === "smith" || equipment === "other") return "Rounded to your available plates.";
  if (equipment === "dumbbell") return "Rounded to your dumbbell jumps.";
  if (equipment === "cable") return "Rounded to your cable stack.";
  if (equipment === "machine") return "Rounded to your machine stack.";
  return "Rounded to your available loads.";
}

function oneOf<T extends number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
