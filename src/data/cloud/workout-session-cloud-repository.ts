import type { AppSupabaseClient } from "@/lib/supabase/client";
import { fromJson, toJson } from "@/data/supabase/json";
import type { Json } from "@/data/supabase/database.types";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";

export type PerformedSetRow = {
  id: string;
  set_number: number;
  reps: number;
  load: number;
  set_type?: string | null;
  logged_at: string;
  metadata?: Json | null;
};

export type PerformedExerciseRow = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  settings: Parameters<typeof fromJson>[0];
  load: number;
  load_known?: boolean | null;
  status: string;
  shutdown_reason: string | null;
  exercise_order: number;
  exercise_origin?: string | null;
  swapped_from_exercise_id?: string | null;
  swapped_from_exercise_name?: string | null;
  swapped_to_exercise_id?: string | null;
  swapped_to_exercise_name?: string | null;
  archived_swapped_sets?: Json | null;
  added_at?: string | null;
  swapped_at?: string | null;
  metadata?: Json | null;
  performed_sets?: PerformedSetRow[];
};

export type WorkoutSessionRow = {
  id: string;
  user_id: string;
  template_id: string | null;
  programme_id: string | null;
  name: string;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
  performed_exercises?: PerformedExerciseRow[];
};

export function mapPerformedExerciseForUpsert(
  userId: string,
  sessionId: string,
  exercise: WorkoutExerciseLog,
  exerciseOrder: number,
  updatedAt: string,
) {
  const hasSwapMetadata =
    Boolean(exercise.swappedFromExerciseId) ||
    Boolean(exercise.swappedToExerciseId) ||
    Boolean(exercise.swapHistory?.length);

  return {
    id: exercise.id,
    user_id: userId,
    workout_session_id: sessionId,
    exercise_id: exercise.exerciseId,
    exercise_name: exercise.exerciseName,
    settings: toJson(exercise.settings),
    load: exercise.load,
    load_known: exercise.loadKnown ?? true,
    status: exercise.status,
    shutdown_reason: exercise.shutdownReason ?? null,
    exercise_order: exerciseOrder,
    exercise_origin: exercise.swappedFromExerciseId ? "swapped_in" : exercise.origin ?? "planned",
    swapped_from_exercise_id: exercise.swappedFromExerciseId ?? null,
    swapped_from_exercise_name: exercise.swappedFromExerciseName ?? null,
    swapped_to_exercise_id: exercise.swappedToExerciseId ?? null,
    swapped_to_exercise_name: exercise.swappedToExerciseName ?? null,
    archived_swapped_sets: toJson(exercise.swapHistory ?? []),
    added_at: exercise.origin === "added_during_workout" ? exercise.sets[0]?.loggedAt ?? updatedAt : null,
    swapped_at: hasSwapMetadata ? updatedAt : null,
    metadata: toJson({
      finishedManually: exercise.finishedManually,
      finishReason: exercise.finishReason,
      finishedAt: exercise.finishedAt,
      finishType: exercise.finishType,
      removedFutureWorkSetNumbers: exercise.removedFutureWorkSetNumbers,
      loadEstablishedFromLoggedWorkSet: exercise.loadEstablishedFromLoggedWorkSet,
    }),
    updated_at: updatedAt,
  };
}

export function mapPerformedSetForUpsert(userId: string, performedExerciseId: string, set: SetLog) {
  return {
    id: set.id,
    user_id: userId,
    performed_exercise_id: performedExerciseId,
    set_number: set.setNumber,
    reps: set.reps,
    load: set.load,
    set_type: set.type ?? "work",
    logged_at: set.loggedAt,
    metadata: toJson({}),
  };
}

export function hydrateWorkoutSessionRow(session: WorkoutSessionRow): WorkoutSession {
  return {
    id: session.id,
    userId: session.user_id,
    templateId: session.template_id ?? undefined,
    programmeId: session.programme_id ?? undefined,
    name: session.name,
    startedAt: session.started_at,
    completedAt: session.completed_at ?? undefined,
    syncState: "synced",
    updatedAt: session.updated_at,
    exercises: [...(session.performed_exercises ?? [])]
      .sort((a, b) => a.exercise_order - b.exercise_order)
      .map(hydratePerformedExerciseRow),
  };
}

function hydratePerformedExerciseRow(exercise: PerformedExerciseRow): WorkoutExerciseLog {
  const origin = exercise.exercise_origin === "added_during_workout" ? "added_during_workout" : "planned";
  const swapHistory = fromJson<WorkoutExerciseLog["swapHistory"]>(exercise.archived_swapped_sets ?? toJson([]));
  const metadata =
    fromJson<
      Partial<
        Pick<
          WorkoutExerciseLog,
          "finishedManually" | "finishReason" | "finishedAt" | "finishType" | "removedFutureWorkSetNumbers" | "loadEstablishedFromLoggedWorkSet"
        >
      >
    >(exercise.metadata ?? toJson({}));

  return {
    id: exercise.id,
    exerciseId: exercise.exercise_id,
    exerciseName: exercise.exercise_name,
    settings: fromJson<WorkoutExerciseLog["settings"]>(exercise.settings),
    load: Number(exercise.load),
    loadKnown: exercise.load_known ?? true,
    status: exercise.status as WorkoutExerciseLog["status"],
    origin,
    shutdownReason: exercise.shutdown_reason ?? undefined,
    swappedFromExerciseId: exercise.swapped_from_exercise_id ?? undefined,
    swappedFromExerciseName: exercise.swapped_from_exercise_name ?? undefined,
    swappedToExerciseId: exercise.swapped_to_exercise_id ?? undefined,
    swappedToExerciseName: exercise.swapped_to_exercise_name ?? undefined,
    swapHistory: Array.isArray(swapHistory) && swapHistory.length > 0 ? swapHistory : undefined,
    finishedManually: metadata.finishedManually,
    finishReason: metadata.finishReason,
    finishedAt: metadata.finishedAt,
    finishType: metadata.finishType,
    removedFutureWorkSetNumbers: metadata.removedFutureWorkSetNumbers,
    loadEstablishedFromLoggedWorkSet: metadata.loadEstablishedFromLoggedWorkSet,
    sets: [...(exercise.performed_sets ?? [])]
      .sort((a, b) => a.set_number - b.set_number)
      .map((set) => ({
        id: set.id,
        setNumber: set.set_number,
        reps: set.reps,
        load: Number(set.load),
        type: set.set_type === "warmup" ? "warmup" : "work",
        loggedAt: set.logged_at,
      })),
  };
}

export class WorkoutSessionCloudRepository {
  constructor(private readonly client: AppSupabaseClient) {}

  async saveWorkoutSession(userId: string, session: WorkoutSession): Promise<void> {
    const { error: sessionError } = await this.client.from("workout_sessions").upsert({
      id: session.id,
      user_id: userId,
      template_id: session.templateId ?? null,
      programme_id: session.programmeId ?? null,
      name: session.name,
      started_at: session.startedAt,
      completed_at: session.completedAt ?? null,
      sync_state: "synced",
      updated_at: session.updatedAt,
    });
    if (sessionError) throw sessionError;

    for (const [exerciseOrder, exercise] of session.exercises.entries()) {
      const { error: exerciseError } = await this.client
        .from("performed_exercises")
        .upsert(mapPerformedExerciseForUpsert(userId, session.id, exercise, exerciseOrder, session.updatedAt));
      if (exerciseError) throw exerciseError;

      if (exercise.sets.length > 0) {
        const { error: setsError } = await this.client.from("performed_sets").upsert(
          exercise.sets.map((set) => mapPerformedSetForUpsert(userId, exercise.id, set)),
        );
        if (setsError) throw setsError;
      }
    }
  }

  async loadWorkoutHistory(userId: string): Promise<WorkoutSession[]> {
    const { data, error } = await this.client
      .from("workout_sessions")
      .select(
        "*, performed_exercises(*, performed_sets(*))",
      )
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as unknown as WorkoutSessionRow[]).map(hydrateWorkoutSessionRow);
  }
}
