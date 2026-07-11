import { generateWorkoutByFocus, type GeneratedWorkoutType } from "@/domain/training/ad-hoc-workout-generator";
import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import type { LoadIncrementProfile } from "@/domain/training/load-increment-strategy";
import type { TrainingSetupGoal } from "@/domain/training/plan-setup";
import type { Equipment, Exercise, ExperienceLevel, ProgramExercise, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import { detectRotationStall } from "@/domain/training/exercise-rotation";

export type ExerciseRotationFrequency = "never" | "every_4_weeks" | "every_block" | "when_stalled";

export interface PlannedExerciseSelectionInput {
  workoutType: GeneratedWorkoutType;
  block: TrainingBlock;
  weekNumber: number;
  exercises: Exercise[];
  equipment?: Equipment[];
  experienceLevel?: ExperienceLevel;
  rotationFrequency?: ExerciseRotationFrequency;
  previousSelections?: ProgramExercise[];
  stalledExerciseIds?: string[];
  history?: WorkoutHistorySummary[];
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: UnitSystem;
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
  goal?: TrainingSetupGoal;
  referenceDate?: Date;
  selectionSeed?: string;
}

export interface PlannedExerciseSelection {
  exerciseSlots: ProgramExercise[];
  rotationKey: string;
  rotated: boolean;
  reason: string;
}

export function selectPlannedExercisesForWeek(input: PlannedExerciseSelectionInput): PlannedExerciseSelection {
  const rotationFrequency = input.rotationFrequency ?? "every_4_weeks";
  const rotationKey = getExerciseRotationKey(input.block, input.weekNumber, rotationFrequency);
  const selectionKey = `${rotationKey}:${input.workoutType}:${input.selectionSeed ?? "default"}`;
  const previousSelections = input.previousSelections ?? [];
  const stalledExerciseIds = new Set([...(input.stalledExerciseIds ?? []), ...detectStalledExerciseIds(input)]);
  const stalled = previousSelections.some((slot) => stalledExerciseIds.has(slot.exerciseId));
  const shouldReuse =
    previousSelections.length > 0 &&
    (rotationFrequency === "never" ||
      (rotationFrequency === "every_4_weeks" && getExerciseRotationKey(input.block, Math.max(1, input.weekNumber - 1), rotationFrequency) === rotationKey) ||
      (rotationFrequency === "every_block" && input.weekNumber > 1) ||
      (rotationFrequency === "when_stalled" && !stalled));

  if (shouldReuse) {
    return {
      exerciseSlots: previousSelections.map((slot) => ({ ...slot })),
      rotationKey,
      rotated: false,
      reason: "Planned workout exercises stay consistent inside the current rotation window.",
    };
  }

  const generated = generateWorkoutByFocus(input.workoutType, {
    exercises: input.exercises,
    currentBlock: input.block,
    availableEquipment: input.equipment,
    experienceLevel: input.experienceLevel,
    history: input.history,
    variant: variantForRotationKey(selectionKey),
    recentExerciseIds: previousSelections.map((slot) => slot.exerciseId),
    stalledExerciseIds: [...stalledExerciseIds],
    stablePrimaryExerciseIds: stableTierAPrimaryIds(input),
    loadIncrementProfile: input.loadIncrementProfile,
    unit: input.unit,
    exercisePreferences: input.exercisePreferences,
    goal: input.goal,
    referenceDate: input.referenceDate,
  });

  return {
    exerciseSlots: generated.days[0]?.exerciseSlots ?? [],
    rotationKey,
    rotated: previousSelections.length > 0,
    reason:
      previousSelections.length === 0
        ? "Initial planned exercise selection created from the block template."
        : rotationFrequency === "when_stalled"
          ? "Exercise selection rotated because a planned lift stalled."
          : "Exercise selection rotated at the configured rotation point.",
  };
}

function stableTierAPrimaryIds(input: PlannedExerciseSelectionInput): string[] {
  const stalledIds = new Set([...(input.stalledExerciseIds ?? []), ...detectStalledExerciseIds(input)]);
  const historyEntries = input.history?.flatMap((summary) => summary.exerciseSummaries) ?? [];
  return (input.previousSelections ?? [])
    .map((slot) => input.exercises.find((exercise) => exercise.id === slot.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .filter((exercise) => exercise.tier === "A" && exercise.roles.includes("primary_compound"))
    .filter((exercise) => !stalledIds.has(exercise.id))
    .filter((exercise) => {
      const recent = historyEntries.filter((entry) => entry.exerciseId === exercise.id).slice(-3);
      return recent.length === 0 || recent.some((entry) => entry.progressionEarned);
    })
    .map((exercise) => exercise.id);
}

function detectStalledExerciseIds(input: PlannedExerciseSelectionInput): string[] {
  const entries = input.history?.flatMap((summary) => summary.exerciseSummaries) ?? [];
  const previousExerciseIds = new Set((input.previousSelections ?? []).map((slot) => slot.exerciseId));
  return [...previousExerciseIds].filter((exerciseId) => {
    const exerciseEntries = entries.filter((entry) => entry.exerciseId === exerciseId);
    return detectRotationStall(exerciseEntries).shouldRotate;
  });
}

export function getExerciseRotationKey(
  block: Pick<TrainingBlock, "id" | "type" | "currentWeek">,
  weekNumber: number,
  frequency: ExerciseRotationFrequency = "every_4_weeks",
): string {
  if (frequency === "never") return `${block.id}:locked`;
  if (frequency === "every_block") return `${block.id}:block`;
  if (frequency === "when_stalled") return `${block.id}:stall-sensitive`;
  const windowIndex = Math.floor((Math.max(1, weekNumber) - 1) / 4);
  return `${block.id}:weeks-${windowIndex * 4 + 1}-${windowIndex * 4 + 4}`;
}

function variantForRotationKey(rotationKey: string): number {
  let hash = 0;
  for (let index = 0; index < rotationKey.length; index += 1) {
    hash = (hash * 31 + rotationKey.charCodeAt(index)) % 997;
  }
  return hash;
}
