import { selectExerciseCandidateForSemanticJob, type GenerateWorkoutOptions } from "@/domain/training/ad-hoc-workout-generator";
import type { CurrentExerciseSelectionJob } from "@/domain/training/current-prescription-slot-exercise-selection-adapter";
import type { Equipment, Exercise, ExperienceLevel, MuscleGroup, WorkoutHistorySummary } from "@/domain/training/models";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";

export const SINGLE_JOB_EXERCISE_SELECTOR_VERSION = "single_job_exercise_selector_v1" as const;

export type ExerciseSelectionJobRequest = Readonly<{
  targetDomain: CurrentExerciseSelectionJob["targetDomain"];
  targetId: string;
  movementPattern: CurrentExerciseSelectionJob["movementPattern"];
  muscleTarget?: string;
  purpose: CurrentExerciseSelectionJob["purpose"];
  required: boolean;
  recommendedMinSets: number;
  recommendedMaxSets: number;
  selectionConstraints: readonly string[];
  substitutionPolicy: string;
  ordinal: string;
  sourceTrace: CurrentExerciseSelectionJob["sourceTrace"];
  selectorVersion: typeof SINGLE_JOB_EXERCISE_SELECTOR_VERSION;
}>;

export type ExerciseSelectionJobContext = Readonly<{
  exercises: readonly Exercise[];
  equipment?: readonly Equipment[];
  experienceLevel?: ExperienceLevel;
  history?: readonly WorkoutHistorySummary[];
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
  selectionSeed?: string;
}>;

export type SingleJobExerciseSelectionResult = Readonly<{
  status: "selected" | "no_eligible_candidate" | "invalid_job" | "unsupported_target";
  selectedExerciseId?: string;
  sourceTrace: ExerciseSelectionJobRequest["sourceTrace"];
  ordinal: string;
  selectionReason: string;
  guidanceSelectionNeutral: true;
}>;

const movementPatterns = {
  horizontal_push: "horizontal_push",
  horizontal_pull: "horizontal_pull",
  vertical_push: "vertical_push",
  vertical_pull: "vertical_pull",
  squat: "squat",
  hinge: "hinge",
} as const;

export function createExerciseSelectionJobRequest(job: CurrentExerciseSelectionJob): ExerciseSelectionJobRequest {
  return {
    targetDomain: job.targetDomain,
    targetId: job.targetId,
    movementPattern: job.movementPattern,
    muscleTarget: job.muscleTarget,
    purpose: job.purpose,
    required: job.required,
    recommendedMinSets: job.recommendedMinSets,
    recommendedMaxSets: job.recommendedMaxSets,
    selectionConstraints: [...job.selectionConstraints],
    substitutionPolicy: job.substitutionPolicy,
    ordinal: job.ordinal,
    sourceTrace: { ...job.sourceTrace },
    selectorVersion: SINGLE_JOB_EXERCISE_SELECTOR_VERSION,
  };
}

export function selectExerciseForJob(
  request: ExerciseSelectionJobRequest,
  context: ExerciseSelectionJobContext,
): SingleJobExerciseSelectionResult {
  if (!request.targetId || !request.ordinal || request.recommendedMinSets < 0 || request.recommendedMaxSets < request.recommendedMinSets) {
    return invalidResult(request, "invalid_job");
  }
  const movement = movementPatterns[request.movementPattern as keyof typeof movementPatterns];
  const muscles = resolveMuscles(request.muscleTarget, request.selectionConstraints, request.movementPattern);
  if (!movement && request.movementPattern !== "knee_flexion" && request.movementPattern !== "plantar_flexion" && request.movementPattern !== "shoulder_abduction") {
    return invalidResult(request, "unsupported_target");
  }
  const semanticExercises = context.exercises.filter((exercise) => {
    if (request.movementPattern === "knee_flexion" || request.movementPattern === "plantar_flexion" || request.movementPattern === "shoulder_abduction") {
      return exercise.movementPattern === "isolation";
    }
    return true;
  });
  const selected = selectExerciseCandidateForSemanticJob({
    allowedMuscles: muscles,
    movementPattern: movement,
    exerciseFamily: undefined,
    purpose: request.purpose,
    exerciseClass: request.purpose === "isolation" ? "isolation" : "compound",
  }, {
    exercises: semanticExercises,
    availableEquipment: context.equipment ? [...context.equipment] : undefined,
    experienceLevel: context.experienceLevel,
    history: context.history ? [...context.history] : undefined,
    exercisePreferences: context.exercisePreferences,
    variant: 0,
  });
  return {
    status: selected ? "selected" : "no_eligible_candidate",
    selectedExerciseId: selected?.id,
    sourceTrace: { ...request.sourceTrace },
    ordinal: request.ordinal,
    selectionReason: selected ? "shared_candidate_filter_and_rank" : "no_eligible_candidate",
    guidanceSelectionNeutral: true,
  };
}

function resolveMuscles(muscleTarget: string | undefined, constraints: readonly string[], movementPattern: string): MuscleGroup[] {
  const values = [muscleTarget, ...constraints].filter((value): value is string => Boolean(value));
  const map: Record<string, MuscleGroup> = { chest: "chest", back: "back", shoulders: "shoulders", quads: "quads", quadriceps: "quads", hamstrings: "hamstrings", calves: "calves", glutes: "glutes" };
  const inferred: Partial<Record<string, MuscleGroup[]>> = {
    horizontal_push: ["chest"], vertical_push: ["shoulders"], horizontal_pull: ["back"], vertical_pull: ["back"],
    squat: ["quads"], hinge: ["hamstrings", "glutes"], knee_flexion: ["hamstrings"], plantar_flexion: ["calves"], shoulder_abduction: ["shoulders"],
  };
  return [...new Set([...values.map((value) => map[value]), ...(inferred[movementPattern] ?? [])].filter((value): value is MuscleGroup => Boolean(value)))];
}

function invalidResult(request: ExerciseSelectionJobRequest, status: "invalid_job" | "unsupported_target"): SingleJobExerciseSelectionResult {
  return { status, sourceTrace: { ...request.sourceTrace }, ordinal: request.ordinal, selectionReason: status, guidanceSelectionNeutral: true };
}
