import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/application/auth/auth-context";
import { ExerciseCloudRepository } from "@/data/cloud/exercise-cloud-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { SyncQueue } from "@/data/sync/sync-queue";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { getOptionalSupabaseClient } from "@/lib/supabase/client";
import type { Equipment, Exercise, MovementPattern, MuscleGroup, ProgressionSettings, RepRange } from "@/domain/training/models";
import { filterExercises, type ExerciseFilters } from "@/domain/training/exercise-library";
import { defaultHypertrophySettings } from "@/domain/training/presets";

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const syncQueue = new SyncQueue(new LocalSyncQueueStore());
const defaultExerciseFilters: ExerciseFilters = {};

function kindForEquipment(equipment: Equipment): Exercise["kind"] {
  if (equipment === "barbell" || equipment === "dumbbell" || equipment === "machine" || equipment === "cable" || equipment === "bodyweight" || equipment === "smith") {
    return equipment;
  }

  return "other";
}

function familyForCustomExercise(category: MuscleGroup, movementPattern: MovementPattern): Exercise["family"] {
  if (movementPattern === "horizontal_push") return "horizontal_press";
  if (movementPattern === "vertical_push") return "vertical_press";
  if (movementPattern === "horizontal_pull") return "horizontal_pull";
  if (movementPattern === "vertical_pull") return "vertical_pull";
  if (movementPattern === "squat") return "squat_pattern";
  if (movementPattern === "hinge") return "hip_hinge";
  if (movementPattern === "lunge") return "single_leg";
  if (movementPattern === "hip_thrust") return "hip_thrust";
  if (movementPattern === "core") return "core_stability";
  if (movementPattern === "carry") return "carry";
  if (category === "chest") return "chest_isolation";
  if (category === "back") return "horizontal_pull";
  if (category === "shoulders") return "shoulder_isolation";
  if (category === "rear_delts") return "rear_delt_corrective";
  if (category === "biceps") return "biceps_isolation";
  if (category === "triceps") return "triceps_isolation";
  if (category === "quads") return "quad_isolation";
  if (category === "hamstrings") return "hamstring_isolation";
  if (category === "glutes") return "glute_isolation";
  if (category === "calves") return "calf_raise";
  if (category === "abs") return "core_flexion";
  if (category === "forearms") return "forearm";
  if (category === "traps") return "trap";
  if (category === "adductors") return "adductor";
  if (category === "abductors") return "abductor";
  return "other";
}

export interface CustomExerciseInput {
  name: string;
  category: MuscleGroup;
  movementPattern?: MovementPattern;
  equipment: Equipment;
  repRange: RepRange;
  loadJump: number;
  notes: string;
}

function roleForCustomExercise(movementPattern: MovementPattern): Exercise["role"] {
  if (movementPattern === "isolation") return "isolation";
  if (movementPattern === "core" || movementPattern === "carry") return "accessory";
  return "secondary_compound";
}

function createCustomExercise(input: CustomExerciseInput, userId: string | null, existing?: Exercise): Exercise {
  const movementPattern = input.movementPattern ?? existing?.movementPattern ?? "isolation";
  const role = roleForCustomExercise(movementPattern);
  const settings: ProgressionSettings = {
    ...defaultHypertrophySettings,
    repRange: input.repRange,
    loadIncrease: input.loadJump,
  };

  return {
    id: existing?.id ?? makeId("custom-exercise"),
    name: input.name.trim(),
    category: input.category,
    primaryMuscles: [input.category],
    secondaryMuscles: [],
    equipment: [input.equipment],
    movementPattern,
    defaultRepRange: input.repRange,
    defaultLoadJump: input.loadJump,
    unitCompatibility: ["kg", "lb"],
    kind: kindForEquipment(input.equipment),
    role,
    roles: [role],
    family: familyForCustomExercise(input.category, movementPattern),
    tier: "C",
    fatigueCost: "low",
    jointStress: "low",
    suitability: ["beginner", "intermediate", "advanced"],
    isBeginnerFriendly: false,
    isAdvanced: false,
    notes: input.notes
      .split("\n")
      .map((note) => note.trim())
      .filter(Boolean),
    suitableBlocks: ["hypertrophy", "powerbuilding", "strength_hypertrophy", "strength", "power", "peak", "deload"],
    swapTags: [input.category, input.equipment, movementPattern, "custom"],
    createdByUserId: existing?.createdByUserId ?? userId,
    isCustom: true,
    defaultSettings: settings,
  };
}

async function saveCustomExerciseToCloud(userId: string | undefined, exercise: Exercise) {
  if (!userId) return;
  const { client } = getOptionalSupabaseClient();
  if (client) {
    try {
      await new ExerciseCloudRepository(client).saveCustomExercise(userId, exercise);
      return;
    } catch {
      syncQueue.enqueue("custom_exercise", exercise.id, exercise, userId);
      return;
    }
  }
  syncQueue.enqueue("custom_exercise", exercise.id, exercise, userId);
}

export function useExerciseLibrary(filters: ExerciseFilters = defaultExerciseFilters) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState(() => customExerciseRepository.listAll());

  useEffect(
    () =>
      customExerciseRepository.subscribe(() => {
        setExercises(customExerciseRepository.listAll());
      }),
    [],
  );

  const filteredExercises = useMemo(() => filterExercises(exercises, filters), [exercises, filters]);

  const saveCustomExercise = useCallback(
    async (input: CustomExerciseInput) => {
      const exercise = createCustomExercise(input, user?.id ?? null);
      customExerciseRepository.save(exercise);

      await saveCustomExerciseToCloud(user?.id, exercise);

      return exercise;
    },
    [user?.id],
  );

  const updateCustomExercise = useCallback(
    async (id: string, input: CustomExerciseInput) => {
      const existing = customExerciseRepository.listCustom().find((exercise) => exercise.id === id);
      if (!existing) return null;
      const exercise = createCustomExercise(input, user?.id ?? existing.createdByUserId ?? null, existing);
      customExerciseRepository.save(exercise);
      await saveCustomExerciseToCloud(user?.id, exercise);
      return exercise;
    },
    [user?.id],
  );

  const deleteCustomExercise = useCallback(
    async (id: string) => {
      const deleted = customExerciseRepository.deleteCustomExercise(id);
      if (!deleted || !user?.id) return deleted;
      const { client } = getOptionalSupabaseClient();
      if (!client) return deleted;
      try {
        await new ExerciseCloudRepository(client).deleteCustomExercise(user.id, id);
      } catch {
        // Keep the local delete stable. Cloud restore can rehydrate later if the online delete fails.
      }
      return deleted;
    },
    [user?.id],
  );

  const selectExerciseForWorkout = useCallback((id: string) => {
    customExerciseRepository.setSelectedExerciseId(id);
  }, []);

  return {
    exercises,
    filteredExercises,
    saveCustomExercise,
    updateCustomExercise,
    deleteCustomExercise,
    selectExerciseForWorkout,
  };
}
