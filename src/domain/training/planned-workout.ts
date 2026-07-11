import { generateWorkoutByFocus, type GeneratedWorkoutType } from "@/domain/training/ad-hoc-workout-generator";
import type { TrainingBlock } from "@/domain/training/annual-models";
import { selectPlannedExercisesForWeek } from "@/domain/training/exercise-selection";
import type { LoadIncrementProfile } from "@/domain/training/load-increment-strategy";
import type { Exercise, Programme, UnitSystem, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { applyPlanExerciseReplacements } from "@/domain/training/recommendation-actions";
import { sessionRolesForPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { resolveSelectedSessionIndex } from "@/domain/training/training-session-selection";
import { applyVolumeAdjustmentsToProgramme } from "@/domain/training/volume-adjustments";
export { displayWorkoutName } from "@/domain/training/workout-name";

export interface PlannedWorkoutOptions {
  activePlan: ActiveTrainingPlan;
  exercises: Exercise[];
  currentBlock?: TrainingBlock | null;
  date?: Date;
  variant?: number;
  createdByUserId?: string | null;
  workoutName?: string;
  loadIncrementProfile?: Partial<LoadIncrementProfile>;
  unit?: UnitSystem;
  history?: WorkoutHistorySummary[];
  selectedSessionIndex?: number | null;
}

export function buildPlannedWorkoutProgramme(options: PlannedWorkoutOptions): Programme | null {
  const sessionIndex = resolvePlanSessionIndex(options);
  const workoutName = options.workoutName ?? resolveNextTrainableWorkoutName(options.activePlan, options.date, options.history, sessionIndex);
  const workoutType = workoutTypeForName(workoutName);
  if (!workoutType) return null;

  const programme = generateWorkoutByFocus(workoutType, {
    exercises: options.exercises,
    currentBlock: options.currentBlock,
    availableEquipment: options.activePlan.equipment,
    experienceLevel: options.activePlan.experienceLevel,
    variant: options.variant ?? sessionIndex,
    createdByUserId: options.createdByUserId ?? null,
    name: workoutName,
    loadIncrementProfile: options.loadIncrementProfile,
    unit: options.unit,
    history: options.history,
    goal: options.activePlan.goal,
    referenceDate: options.date,
    exercisePreferences: options.activePlan.recommendationState?.exercisePreferences,
  });
  if (!programme) return null;

  const plannedExerciseSlots = options.currentBlock
    ? selectPlannedExercisesForWeek({
        workoutType,
        block: options.currentBlock,
        weekNumber: options.currentBlock.currentWeek,
        exercises: options.exercises,
        equipment: options.activePlan.equipment,
        experienceLevel: options.activePlan.experienceLevel,
        rotationFrequency: options.activePlan.rotationFrequency,
        history: options.history,
        loadIncrementProfile: options.loadIncrementProfile,
        unit: options.unit,
        exercisePreferences: options.activePlan.recommendationState?.exercisePreferences,
        goal: options.activePlan.goal,
        referenceDate: options.date,
        selectionSeed: [
          options.activePlan.id,
          options.currentBlock.id,
          sessionIndex,
          options.activePlan.goal,
          options.activePlan.experienceLevel,
        ].join(":"),
      }).exerciseSlots
    : programme.days[0]?.exerciseSlots;

  const replacedProgramme = {
    ...programme,
    days: programme.days.map((day) => ({
      ...day,
      exerciseSlots: applyPlanExerciseReplacements(plannedExerciseSlots ?? day.exerciseSlots, options.activePlan),
    })),
  };
  return applyVolumeAdjustmentsToProgramme(replacedProgramme, options.activePlan, options.exercises, options.currentBlock);
}

export function resolveNextTrainableWorkoutName(
  activePlan: ActiveTrainingPlan,
  date = new Date(),
  history: WorkoutHistorySummary[] = [],
  selectedSessionIndex?: number | null,
): string {
  const split = sessionRolesForPlan(activePlan);
  if (split.length === 0) return "Full Body";

  const startIndex = resolveSelectedSessionIndex({ activePlan, history, selectedSessionIndex, date });
  for (let offset = 0; offset < split.length; offset += 1) {
    const workout = split[(startIndex + offset) % split.length];
    if (workout && !isRestWorkout(workout)) return workout;
  }

  return split[0] ?? "Full Body";
}

export function currentPlanDayIndex(activePlan: ActiveTrainingPlan, date = new Date()): number {
  const split = sessionRolesForPlan(activePlan);
  void date;
  if (split.length === 0) return 0;
  return 0;
}

export function workoutTypeForName(name: string): GeneratedWorkoutType | null {
  const normalized = name.toLowerCase();
  if (normalized.includes("chest")) return "chest";
  if (normalized.includes("back")) return "back";
  if (normalized.includes("shoulder")) return "shoulders";
  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("legs")) return "legs";
  if (normalized.includes("upper")) return "upper";
  if (normalized.includes("lower")) return "lower";
  if (normalized.includes("full")) return "full_body";
  if (normalized.includes("arms")) return "arms";
  return null;
}

export function isLegacyPlaceholderWorkoutSession(session: WorkoutSession): boolean {
  return (
    session.name === "Push Priority" &&
    session.exercises.length === 2 &&
    !session.programmeId &&
    !session.templateId &&
    session.exercises.every((exercise) => exercise.sets.length === 0)
  );
}

function isRestWorkout(name: string): boolean {
  return name.toLowerCase().includes("rest");
}

function resolvePlanSessionIndex(options: PlannedWorkoutOptions): number {
  return resolveSelectedSessionIndex({
    activePlan: options.activePlan,
    history: options.history ?? [],
    selectedSessionIndex: options.selectedSessionIndex,
    date: options.date,
  });
}
