import type { Equipment, Exercise, MovementPattern, MuscleGroup } from "@/domain/training/models";

export interface ExerciseFilters {
  query?: string;
  muscleGroup?: MuscleGroup | "all";
  equipment?: Equipment | "all";
}

export const muscleGroups: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "forearms",
  "traps",
  "rear_delts",
  "adductors",
  "abductors",
];

export const equipmentOptions: Equipment[] = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "smith",
  "bodyweight",
  "bands",
  "other",
];

export const movementPatternOptions: MovementPattern[] = [
  "horizontal_push",
  "vertical_push",
  "horizontal_pull",
  "vertical_pull",
  "squat",
  "hinge",
  "lunge",
  "hip_thrust",
  "isolation",
  "carry",
  "core",
];

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const muscleGroup = filters.muscleGroup ?? "all";
  const equipment = filters.equipment ?? "all";

  return exercises
    .filter((exercise) => {
      const matchesQuery =
        query.length === 0 ||
        [exercise.name, exercise.category, exercise.movementPattern, ...exercise.primaryMuscles, ...exercise.secondaryMuscles]
          .concat(exercise.swapTags, exercise.notes)
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesMuscle =
        muscleGroup === "all" ||
        exercise.category === muscleGroup ||
        exercise.primaryMuscles.includes(muscleGroup) ||
        exercise.secondaryMuscles.includes(muscleGroup);
      const matchesEquipment = equipment === "all" || exercise.equipment.includes(equipment);

      return matchesQuery && matchesMuscle && matchesEquipment;
    })
    .sort((a, b) => Number(b.isCustom) - Number(a.isCustom) || a.name.localeCompare(b.name));
}

export function findExerciseById(exercises: Exercise[], id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id);
}

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
