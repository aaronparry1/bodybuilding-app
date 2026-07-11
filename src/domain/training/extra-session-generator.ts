import { createTrainingBlock } from "@/domain/training/annual-planner";
import { generateWorkoutByFocus, type GeneratedWorkoutType } from "@/domain/training/ad-hoc-workout-generator";
import { getCapacityRoutine, type CapacityFocusArea } from "@/domain/training/capacity-focus";
import { resolveLoadIncrement, type LoadIncrementProfile } from "@/domain/training/load-increment-strategy";
import type { BlockType } from "@/domain/training/annual-models";
import type { Equipment, Exercise, ExperienceLevel, MuscleGroup, Programme, ProgramExercise, ProgressionSettings, UnitSystem, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import { withSetPrescription } from "@/domain/training/set-prescription";

export type ExtraSessionKind = NonNullable<WorkoutSession["sessionKind"]>;
export type ExtraFullSessionType = Exclude<GeneratedWorkoutType, "custom" | "arms"> | "arms";
export type ExtraVolumeSessionType = "upper" | "lower" | "push" | "pull" | "legs";
export type RecoveryCapacityExtraSessionType = "recovery_cardio" | "capacity_cardio" | "performance_conditioning";

export function buildExtraFullSessionProgramme(options: {
  type: ExtraFullSessionType;
  blockType: BlockType;
  exercises: Exercise[];
  availableEquipment?: Equipment[];
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
  history?: WorkoutHistorySummary[];
}): Programme {
  return markExtraProgramme(
    generateWorkoutByFocus(options.type, {
      exercises: options.exercises,
      currentBlock: createTrainingBlock(options.blockType),
      availableEquipment: options.availableEquipment,
      experienceLevel: options.experienceLevel ?? "intermediate",
      name: options.type === "full_body" ? "Extra Full Body" : `Extra ${titleWorkout(options.type)}`,
      createdByUserId: options.createdByUserId ?? null,
      loadIncrementProfile: options.loadIncrementProfile,
      unit: options.unit,
      history: options.history,
      referenceDate: new Date(),
    }),
    "extra_full",
  );
}

export function buildExtraVolumeSessionProgramme(options: {
  type: ExtraVolumeSessionType;
  exercises: Exercise[];
  availableEquipment?: Equipment[];
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  const muscles = musclesForExtraVolume(options.type);
  const candidates = options.exercises
    .filter((exercise) => matchesEquipment(exercise, options.availableEquipment))
    .filter((exercise) => touchesMuscle(exercise, muscles))
    .filter((exercise) => !exercise.roles.includes("primary_compound") && !exercise.roles.includes("power"))
    .filter((exercise) => exercise.fatigueCost !== "high")
    .filter((exercise) => exercise.tier !== "A")
    .sort((a, b) => scoreExtraVolumeExercise(b) - scoreExtraVolumeExercise(a));
  const selected = uniqueByFamily(candidates).slice(0, extraVolumeCountForExperience(options.type, options.experienceLevel));
  const timestamp = new Date().toISOString();
  const slots = selected.map((exercise, index) =>
    createSlot(exercise, index + 1, {
      loadIncrementProfile: options.loadIncrementProfile,
      unit: options.unit,
      note: "Extra volume: low-fatigue work that does not alter the main plan.",
      requiredWorkSets: options.experienceLevel === "advanced" ? 3 : 2,
    }),
  );

  return {
    id: `extra-volume-${options.type}-${timestamp}`,
    name: `Extra Volume ${titleWorkout(options.type)}`,
    description: "Optional low-fatigue work. Machines, cables, isolation, and easy-to-recover accessories are preferred.",
    goal: "hypertrophy",
    experienceLevel: options.experienceLevel ?? "intermediate",
    daysPerWeek: 1,
    notes: "Extra volume does not alter the active training plan.",
    createdByUserId: options.createdByUserId ?? null,
    isCustom: true,
    isPreset: false,
    days: [
      {
        id: `extra-volume-${options.type}-day-${timestamp}`,
        name: `Extra ${titleWorkout(options.type)}`,
        equipmentAvailable: options.availableEquipment ?? [],
        notes: "Keep this recovery-friendly. Avoid turning extra work into a second main session.",
        exerciseSlots: slots,
      },
    ],
  };
}

export function buildCapacitySessionProgramme(options: {
  area: CapacityFocusArea;
  exercises: Exercise[];
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  const routine = getCapacityRoutine(options.area, options.area === "low_back" ? 2 : 1);
  const timestamp = new Date().toISOString();
  const slots = routine.exercises
    .map((routineExercise, index) => {
      const exercise = findExerciseByRoutineName(options.exercises, routineExercise.name);
      return exercise
        ? createSlot(exercise, index + 1, {
            loadIncrementProfile: options.loadIncrementProfile,
            unit: options.unit,
            note: `${routineExercise.dose}. ${routineExercise.note} Progression: ${routineExercise.progression}`,
            requiredWorkSets: 1,
          })
        : null;
    })
    .filter((slot): slot is ProgramExercise => Boolean(slot));
  const fallbackSlots = slots.length > 0 ? slots : options.exercises
    .filter((exercise) => exercise.roles.includes("capacity") || exercise.roles.includes("corrective") || exercise.roles.includes("resilience"))
    .slice(0, 4)
    .map((exercise, index) =>
      createSlot(exercise, index + 1, {
        loadIncrementProfile: options.loadIncrementProfile,
        unit: options.unit,
        note: "Low Back Capacity: controlled training-tolerance work.",
        requiredWorkSets: 1,
      }),
    );

  return {
    id: `extra-capacity-${options.area}-${timestamp}`,
    name: `${titleWorkout(options.area)} Capacity`,
    description: "Optional capacity work for trunk control, hip support, and load tolerance. This is general training support, not medical advice.",
    goal: "hypertrophy",
    experienceLevel: options.experienceLevel ?? "intermediate",
    daysPerWeek: 1,
    notes: "Capacity sessions are separate from the main plan and do not affect progression, PRs, fatigue evidence, or training-week advancement.",
    createdByUserId: options.createdByUserId ?? null,
    isCustom: true,
    isPreset: false,
    days: [
      {
        id: `extra-capacity-${options.area}-day-${timestamp}`,
        name: `${titleWorkout(options.area)} Capacity`,
        equipmentAvailable: [],
        notes: routine.purpose,
        exerciseSlots: fallbackSlots,
      },
    ],
  };
}

export function buildRecoveryCardioSessionProgramme(options: {
  exercises: Exercise[];
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  return buildCardioSessionProgramme({
    type: "recovery_cardio",
    name: "Recovery Cardio",
    description: "Easy aerobic work for recovery, work capacity, and general health.",
    notes: "Incline walk, brisk walk, easy bike, or easy rower. Keep it easy enough that tomorrow still improves.",
    exerciseId: "ex-recovery-cardio",
    exercises: options.exercises,
    unit: options.unit,
    experienceLevel: options.experienceLevel,
    createdByUserId: options.createdByUserId,
  });
}

export function buildCapacityCardioSessionProgramme(options: {
  exercises: Exercise[];
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  return buildCardioSessionProgramme({
    type: "capacity_cardio",
    name: "Capacity Cardio",
    description: "Moderate conditioning for work capacity. Build your engine without hijacking the lifting plan.",
    notes: "Tempo row, sled pushes, assault bike intervals, or moderate conditioning. Hard enough to matter, not hard enough to wreck the week.",
    exerciseId: "ex-capacity-cardio",
    exercises: options.exercises,
    unit: options.unit,
    experienceLevel: options.experienceLevel,
    createdByUserId: options.createdByUserId,
  });
}

export function buildPerformanceConditioningSessionProgramme(options: {
  exercises: Exercise[];
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  return buildCardioSessionProgramme({
    type: "performance_conditioning",
    name: "Performance Conditioning",
    description: "Event or sport-relevant conditioning. Useful for athletic goals, not a sneaky calorie tracker.",
    notes: "Running, sport conditioning, or event-specific conditioning. Keep it purposeful and recoverable.",
    exerciseId: "ex-performance-conditioning",
    exercises: options.exercises,
    unit: options.unit,
    experienceLevel: options.experienceLevel,
    createdByUserId: options.createdByUserId,
  });
}

function buildCardioSessionProgramme(options: {
  type: RecoveryCapacityExtraSessionType;
  name: string;
  description: string;
  notes: string;
  exerciseId: string;
  exercises: Exercise[];
  unit?: UnitSystem;
  experienceLevel?: ExperienceLevel;
  createdByUserId?: string | null;
}): Programme {
  const timestamp = new Date().toISOString();
  const exercise = options.exercises.find((candidate) => candidate.id === options.exerciseId);
  const exerciseSlots = exercise
    ? [
        createSlot(exercise, 1, {
          unit: options.unit,
          note: options.notes,
          requiredWorkSets: 1,
        }),
      ]
    : [];

  return {
    id: `${options.type}-${timestamp}`,
    name: options.name,
    description: options.description,
    goal: "hypertrophy",
    experienceLevel: options.experienceLevel ?? "intermediate",
    daysPerWeek: 1,
    notes: `${options.name} is an extra session. It does not complete a planned workout slot.`,
    createdByUserId: options.createdByUserId ?? null,
    isCustom: true,
    isPreset: false,
    days: [
      {
        id: `${options.type}-day-${timestamp}`,
        name: options.name,
        equipmentAvailable: [],
        notes: options.notes,
        exerciseSlots,
      },
    ],
  };
}

function markExtraProgramme(programme: Programme, kind: ExtraSessionKind): Programme {
  return {
    ...programme,
    id: programme.id.replace(/^generated-/, `${kind}-`),
    description: `${programme.description} This extra session is separate from the main plan.`,
    notes: `${programme.notes ?? ""} Extra session: does not alter the active plan.`.trim(),
  };
}

function createSlot(
  exercise: Exercise,
  plannedOrder: number,
  options: {
    loadIncrementProfile?: Partial<LoadIncrementProfile>;
    unit?: UnitSystem;
    note: string;
    requiredWorkSets: number;
  },
): ProgramExercise {
  const loadIncrement = resolveLoadIncrement({
    exercise,
    equipmentProfile: options.loadIncrementProfile,
    unit: options.unit ?? exercise.defaultSettings.unit,
    context: "estimate",
  });
  const settings: ProgressionSettings = withSetPrescription({
    ...exercise.defaultSettings,
    repRange:
      (exercise.defaultSettings.measurementType ?? exercise.measurementType) === "duration"
        ? exercise.defaultRepRange
        : resolveRepRange({
            blockType: "hypertrophy",
            exerciseRole: exercise.role,
            exerciseFamily: exercise.family,
            movementPattern: exercise.movementPattern,
            exerciseDefault: exercise.defaultRepRange,
          }),
    loadIncrease: loadIncrement.increment,
    requiredWorkSets: options.requiredWorkSets,
    unit: options.unit ?? exercise.defaultSettings.unit,
  }, {
    blockType: "hypertrophy",
    exerciseRole: exercise.role,
    exerciseFamily: exercise.family,
    primaryMuscles: exercise.primaryMuscles,
  }, {
    source: "generated",
  });

  return {
    id: `extra-slot-${plannedOrder}-${exercise.id}`,
    exerciseId: exercise.id,
    plannedOrder,
    settings,
    notes: options.note,
  };
}

function musclesForExtraVolume(type: ExtraVolumeSessionType): MuscleGroup[] {
  if (type === "push") return ["chest", "shoulders", "triceps"];
  if (type === "pull") return ["back", "biceps", "rear_delts"];
  if (type === "legs" || type === "lower") return ["quads", "hamstrings", "glutes", "calves"];
  return ["chest", "back", "shoulders", "biceps", "triceps"];
}

function extraVolumeCountForExperience(type: ExtraVolumeSessionType, experienceLevel?: ExperienceLevel): number {
  const base = type === "upper" ? 6 : 5;
  if (experienceLevel === "beginner") return Math.max(3, base - 1);
  if (experienceLevel === "advanced") return Math.min(7, base + 1);
  return base;
}

function scoreExtraVolumeExercise(exercise: Exercise): number {
  let score = 0;
  if (exercise.equipment.includes("cable") || exercise.equipment.includes("machine")) score += 24;
  if (exercise.roles.includes("isolation")) score += 22;
  if (exercise.roles.includes("accessory")) score += 12;
  if (exercise.fatigueCost === "low") score += 16;
  if (exercise.tier === "C") score += 10;
  if (exercise.roles.includes("secondary_compound")) score -= 10;
  return score;
}

function uniqueByFamily(exercises: Exercise[]): Exercise[] {
  const selected: Exercise[] = [];
  const familyCounts = new Map<string, number>();
  for (const exercise of exercises) {
    const count = familyCounts.get(exercise.family) ?? 0;
    if (count >= 2) continue;
    selected.push(exercise);
    familyCounts.set(exercise.family, count + 1);
  }
  return selected;
}

function matchesEquipment(exercise: Exercise, availableEquipment?: Equipment[]): boolean {
  if (!availableEquipment || availableEquipment.length === 0) return true;
  return exercise.equipment.some((equipment) => availableEquipment.includes(equipment));
}

function touchesMuscle(exercise: Exercise, muscles: MuscleGroup[]): boolean {
  return [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles].some((muscle) => muscles.includes(muscle));
}

function findExerciseByRoutineName(exercises: Exercise[], name: string): Exercise | null {
  const normalized = normalize(name);
  const aliases: Record<string, string[]> = {
    "m cgill curl up": ["mcgill curl up"],
    "back extension hold": ["iso hold back extension"],
    "side plank": ["front plank"],
    "cat camel": ["bird dog"],
  };
  return exercises.find((exercise) => normalize(exercise.name) === normalized) ??
    exercises.find((exercise) => aliases[normalized]?.includes(normalize(exercise.name))) ??
    null;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function titleWorkout(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
