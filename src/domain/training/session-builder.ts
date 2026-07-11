import type { TrainingBlock } from "@/domain/training/annual-models";
import type { Exercise, ProgramExercise, Programme, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

export interface SessionBuildOptions {
  id: string;
  userId?: string | null;
  startedAt: string;
  /**
   * Deprecated rollback-only input. Builders must not infer load when a
   * CoachingPacket or planned slot omitted it.
   */
  defaultLoad?: number;
  planSessionIndex?: number;
  planBlockId?: string;
  planWeekNumber?: number;
  sessionKind?: WorkoutSession["sessionKind"];
}

export function createWorkoutExerciseLog(
  exercise: Exercise,
  options: {
    id: string;
    plannedSlot: ProgramExercise;
  },
): WorkoutExerciseLog {
  const settings = options.plannedSlot.settings;
  const load = exercise.kind === "bodyweight" ? 0 : options.plannedSlot.suggestedLoad ?? 0;

  return {
    id: options.id,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    settings,
    load,
    loadKnown: exercise.kind === "bodyweight" || options.plannedSlot.suggestedLoad != null,
    sets: [],
    status: "active",
    origin: "planned",
    notes: options.plannedSlot.notes,
  };
}

export function buildWorkoutSessionFromProgrammeDay(
  programme: Programme,
  dayId: string,
  exercises: Exercise[],
  options: SessionBuildOptions,
  currentBlock?: TrainingBlock | null,
): WorkoutSession | null {
  const day = programme.days.find((candidate) => candidate.id === dayId);
  if (!day) return null;

  const plannedExercises = [...day.exerciseSlots].sort((a, b) => a.plannedOrder - b.plannedOrder);
  if (plannedExercises.length === 0) return null;

  return {
    id: options.id,
    userId: options.userId ?? "guest-local",
    programmeId: programme.id,
    templateId: day.id,
    planSessionIndex: options.planSessionIndex,
    planBlockId: options.planBlockId,
    planWeekNumber: options.planWeekNumber,
    // Programme-builder and ad-hoc sessions are never main-plan sessions.
    // The recovery constructor is the sole owner of planned workouts.
    sessionKind: options.sessionKind && options.sessionKind !== "planned" ? options.sessionKind : "extra_full",
    name: `${programme.name} • ${day.name}`,
    startedAt: options.startedAt,
    exercises: plannedExercises.map((slot, index) => {
      const exercise = exercises.find((candidate) => candidate.id === slot.exerciseId);
      if (!exercise) {
        return {
          id: `${options.id}-missing-${index}`,
          exerciseId: slot.exerciseId,
          exerciseName: "Deleted exercise",
          settings: slot.settings,
          load: slot.suggestedLoad ?? 0,
          loadKnown: slot.suggestedLoad != null,
          sets: [],
          status: "active",
          origin: "planned",
          shutdownReason: "This exercise is no longer in the library, but the planned workout was preserved.",
          notes: slot.notes,
        };
      }

      return createWorkoutExerciseLog(exercise, {
        id: `${options.id}-exercise-${index + 1}`,
        plannedSlot: slot,
      });
    }),
    syncState: "local",
    updatedAt: options.startedAt,
  };
}
