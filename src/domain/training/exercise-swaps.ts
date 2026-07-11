import type { Exercise, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { scoreExercisePreference, scoreReplacementPreference, type ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import { getWorkSets } from "@/domain/training/workout-sets";

export interface SwapSuggestionOptions {
  broad?: boolean;
  limit?: number;
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
}

export function getExerciseSwapSuggestions(
  currentExercise: Exercise,
  exercises: Exercise[],
  options: SwapSuggestionOptions = {},
): Exercise[] {
  const limit = options.limit ?? 8;
  return exercises
    .filter((exercise) => exercise.id !== currentExercise.id)
    .filter((exercise) => options.broad || sharesPrimaryMuscle(currentExercise, exercise) || exercise.movementPattern === currentExercise.movementPattern)
    .sort((a, b) => scoreSwap(b, currentExercise, options) - scoreSwap(a, currentExercise, options))
    .slice(0, limit);
}

export function swapExerciseInSession(
  session: WorkoutSession,
  activeExerciseIndex: number,
  replacement: WorkoutExerciseLog,
): WorkoutSession {
  const current = session.exercises[activeExerciseIndex];
  if (!current || session.completedAt) return session;

  const workSets = getWorkSets(current.sets);
  const shouldPreserveOldWork = workSets.length > 0;
  const replacementExercise: WorkoutExerciseLog = {
    ...replacement,
    origin: current.origin,
    swappedFromExerciseId: current.exerciseId,
    swappedFromExerciseName: current.exerciseName,
    swapHistory: shouldPreserveOldWork
      ? [
          ...(replacement.swapHistory ?? []),
          {
            exerciseId: current.exerciseId,
            exerciseName: current.exerciseName,
            settings: current.settings,
            load: current.load,
            loadKnown: current.loadKnown,
            sets: current.sets,
            status: "swapped",
            swappedToExerciseId: replacement.exerciseId,
            swappedToExerciseName: replacement.exerciseName,
            notes: `Swapped to ${replacement.exerciseName}. Logged work preserved in history.`,
          },
        ]
      : replacement.swapHistory,
  };
  const nextExercises = [
    ...session.exercises.slice(0, activeExerciseIndex),
    replacementExercise,
    ...session.exercises.slice(activeExerciseIndex + 1),
  ];

  return {
    ...session,
    exercises: nextExercises,
    syncState: "local",
    updatedAt: new Date().toISOString(),
  };
}

function scoreSwap(candidate: Exercise, current: Exercise, options: SwapSuggestionOptions = {}): number {
  const broad = options.broad ?? false;
  let score = 0;
  score += candidate.family === current.family ? 120 : 0;
  score += candidate.role === current.role ? 55 : 0;
  score += candidate.tier === current.tier ? 12 : 0;
  score += candidate.category === current.category ? 80 : 0;
  score += candidate.primaryMuscles.includes(current.category) ? 45 : 0;
  score += sharesPrimaryMuscle(current, candidate) ? 60 : 0;
  score += candidate.movementPattern === current.movementPattern ? 50 : 0;
  score += candidate.equipment.some((equipment) => current.equipment.includes(equipment)) ? 10 : 0;
  score += candidate.kind === "machine" ? 4 : 0;
  score += candidate.swapTags.some((tag) => current.swapTags.includes(tag)) ? 8 : 0;
  score += candidate.fatigueCost === "low" && current.fatigueCost === "high" ? 6 : 0;
  score += candidate.isBeginnerFriendly ? 3 : 0;
  score += candidate.isCustom ? 2 : 0;
  score += candidate.roles.includes("power") && !current.roles.includes("power") ? -35 : 0;
  score += !broad && candidate.family !== current.family && candidate.role !== current.role ? -55 : 0;
  score += !broad && current.category && !candidate.primaryMuscles.includes(current.category) && candidate.category !== current.category ? -45 : 0;
  score += broad ? 0 : candidate.movementPattern === "isolation" && current.movementPattern !== "isolation" ? -8 : 0;
  score += scoreReplacementPreference(current.id, candidate.id, options.exercisePreferences);
  score += scoreExercisePreference(candidate, options.exercisePreferences);
  return score;
}

function sharesPrimaryMuscle(current: Exercise, candidate: Exercise): boolean {
  return candidate.primaryMuscles.some((muscle) => current.primaryMuscles.includes(muscle));
}
