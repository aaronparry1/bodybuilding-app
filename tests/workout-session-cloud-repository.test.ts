import { describe, expect, it } from "vitest";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import {
  hydrateWorkoutSessionRow,
  mapPerformedExerciseForUpsert,
  mapPerformedSetForUpsert,
  type PerformedExerciseRow,
  type WorkoutSessionRow,
} from "@/data/cloud/workout-session-cloud-repository";
import { toJson } from "@/data/supabase/json";
import { defaultHypertrophySettings } from "@/domain/training/presets";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";

const userId = "user-1";
const sessionId = "session-1";
const now = "2026-06-03T10:00:00.000Z";

function exercise(overrides: Partial<WorkoutExerciseLog> = {}): WorkoutExerciseLog {
  return {
    id: "bench-log",
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    settings: defaultHypertrophySettings,
    load: 100,
    loadKnown: true,
    sets: [],
    status: "active",
    ...overrides,
  };
}

function row(overrides: Partial<PerformedExerciseRow> = {}): WorkoutSessionRow {
  return {
    id: sessionId,
    user_id: userId,
    template_id: null,
    programme_id: null,
    name: "Push",
    started_at: "2026-06-03T09:00:00.000Z",
    completed_at: "2026-06-03T10:00:00.000Z",
    updated_at: now,
    performed_exercises: [
      {
        id: "bench-log",
        exercise_id: "ex-bench-press",
        exercise_name: "Bench Press",
        settings: toJson(defaultHypertrophySettings),
        load: 100,
        load_known: true,
        status: "complete",
        shutdown_reason: null,
        exercise_order: 0,
        exercise_origin: "planned",
        swapped_from_exercise_id: null,
        swapped_from_exercise_name: null,
        swapped_to_exercise_id: null,
        swapped_to_exercise_name: null,
        archived_swapped_sets: toJson([]),
        added_at: null,
        swapped_at: null,
        metadata: toJson({}),
        performed_sets: [],
        ...overrides,
      },
    ],
  };
}

describe("workout session cloud metadata mapping", () => {
  it("round-trips warm-up and work set types", () => {
    const warmup = {
      id: "warmup-1",
      setNumber: 1,
      reps: 8,
      load: 40,
      type: "warmup" as const,
      loggedAt: "2026-06-03T09:05:00.000Z",
    };
    const work = {
      id: "work-1",
      setNumber: 2,
      reps: 12,
      load: 100,
      type: "work" as const,
      loggedAt: "2026-06-03T09:10:00.000Z",
    };

    expect(mapPerformedSetForUpsert(userId, "bench-log", warmup)).toMatchObject({ set_type: "warmup" });
    expect(mapPerformedSetForUpsert(userId, "bench-log", work)).toMatchObject({ set_type: "work" });

    const hydrated = hydrateWorkoutSessionRow(
      row({
        performed_sets: [
          { id: "warmup-1", set_number: 1, reps: 8, load: 40, set_type: "warmup", logged_at: warmup.loggedAt },
          { id: "work-1", set_number: 2, reps: 12, load: 100, set_type: "work", logged_at: work.loggedAt },
        ],
      }),
    );

    expect(hydrated.exercises[0]?.sets.map((set) => set.type)).toEqual(["warmup", "work"]);
  });

  it("round-trips exercises added during a workout", () => {
    const added = exercise({ origin: "added_during_workout", sets: [{ id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: now }] });
    const upsert = mapPerformedExerciseForUpsert(userId, sessionId, added, 2, now);

    expect(upsert).toMatchObject({
      exercise_origin: "added_during_workout",
      added_at: now,
    });

    const hydrated = hydrateWorkoutSessionRow(row({ exercise_origin: "added_during_workout", added_at: now }));
    expect(hydrated.exercises[0]?.origin).toBe("added_during_workout");
  });

  it("round-trips swapped exercise metadata without restoring an old active-session card", () => {
    const replacement = exercise({
      id: "machine-press-log",
      exerciseId: "ex-machine-chest-press",
      exerciseName: "Machine Chest Press",
      swappedFromExerciseId: "ex-bench-press",
      swappedFromExerciseName: "Bench Press",
      swapHistory: [
        {
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          settings: defaultHypertrophySettings,
          load: 100,
          loadKnown: true,
          status: "active",
          swappedToExerciseId: "ex-machine-chest-press",
          swappedToExerciseName: "Machine Chest Press",
          sets: [{ id: "old-work-1", setNumber: 1, reps: 12, load: 100, type: "work", loggedAt: now }],
        },
      ],
    });
    const upsert = mapPerformedExerciseForUpsert(userId, sessionId, replacement, 0, now);

    expect(upsert).toMatchObject({
      exercise_origin: "swapped_in",
      swapped_from_exercise_id: "ex-bench-press",
      swapped_from_exercise_name: "Bench Press",
      swapped_at: now,
    });

    const hydrated = hydrateWorkoutSessionRow(
      row({
        id: "machine-press-log",
        exercise_id: "ex-machine-chest-press",
        exercise_name: "Machine Chest Press",
        exercise_origin: "swapped_in",
        swapped_from_exercise_id: "ex-bench-press",
        swapped_from_exercise_name: "Bench Press",
        archived_swapped_sets: upsert.archived_swapped_sets,
        swapped_at: now,
      }),
    );

    expect(hydrated.exercises).toHaveLength(1);
    expect(hydrated.exercises[0]).toMatchObject({
      exerciseId: "ex-machine-chest-press",
      swappedFromExerciseId: "ex-bench-press",
    });
    expect(hydrated.exercises[0]?.swapHistory?.[0]).toMatchObject({
      exerciseId: "ex-bench-press",
      swappedToExerciseId: "ex-machine-chest-press",
    });
  });

  it("round-trips manual finish metadata through exercise metadata", () => {
    const finished = exercise({
      status: "complete",
      finishedManually: true,
      finishReason: "out_of_time",
      finishedAt: now,
      finishType: "manual_completion",
      shutdownReason: "Finished early: out of time.",
    });
    const upsert = mapPerformedExerciseForUpsert(userId, sessionId, finished, 0, now);

    expect(upsert.metadata).toMatchObject({
      finishedManually: true,
      finishReason: "out_of_time",
      finishedAt: now,
      finishType: "manual_completion",
    });

    const hydrated = hydrateWorkoutSessionRow(
      row({
        status: "complete",
        shutdown_reason: "Finished early: out of time.",
        metadata: upsert.metadata,
      }),
    );

    expect(hydrated.exercises[0]).toMatchObject({
      status: "complete",
      finishedManually: true,
      finishReason: "out_of_time",
      finishedAt: now,
      finishType: "manual_completion",
      shutdownReason: "Finished early: out of time.",
    });
  });

  it("round-trips removed future work rows through exercise metadata", () => {
    const adjusted = exercise({
      removedFutureWorkSetNumbers: [4, 5],
      loadEstablishedFromLoggedWorkSet: true,
    });
    const upsert = mapPerformedExerciseForUpsert(userId, sessionId, adjusted, 0, now);

    expect(upsert.metadata).toMatchObject({
      removedFutureWorkSetNumbers: [4, 5],
      loadEstablishedFromLoggedWorkSet: true,
    });

    const hydrated = hydrateWorkoutSessionRow(
      row({
        metadata: upsert.metadata,
      }),
    );

    expect(hydrated.exercises[0].removedFutureWorkSetNumbers).toEqual([4, 5]);
    expect(hydrated.exercises[0].loadEstablishedFromLoggedWorkSet).toBe(true);
  });

  it("hydrates old cloud rows with safe defaults", () => {
    const legacy = hydrateWorkoutSessionRow(
      row({
        load_known: undefined,
        exercise_origin: undefined,
        archived_swapped_sets: undefined,
        performed_sets: [{ id: "legacy-set", set_number: 1, reps: 10, load: 90, logged_at: now }],
      }),
    );

    expect(legacy.exercises[0]).toMatchObject({
      loadKnown: true,
      origin: "planned",
    });
    expect(legacy.exercises[0]?.sets[0]?.type).toBe("work");
    expect(legacy.exercises[0]?.swapHistory).toBeUndefined();
  });

  it("keeps warm-up sets out of history progression and volume after hydration", () => {
    const hydrated: WorkoutSession = hydrateWorkoutSessionRow(
      row({
        performed_sets: [
          { id: "warmup-1", set_number: 1, reps: 8, load: 40, set_type: "warmup", logged_at: "2026-06-03T09:05:00.000Z" },
          { id: "work-1", set_number: 2, reps: 12, load: 100, set_type: "work", logged_at: "2026-06-03T09:10:00.000Z" },
          { id: "work-2", set_number: 3, reps: 11, load: 100, set_type: "work", logged_at: "2026-06-03T09:15:00.000Z" },
        ],
      }),
    );
    const summary = summarizeWorkoutSession(hydrated);

    expect(summary?.setsCompleted).toBe(2);
    expect(summary?.repsCompleted).toBe(23);
    expect(summary?.totalLoadVolume).toBe(2300);
    expect(summary?.exerciseSummaries[0]?.bestSetReps).toBe(12);
  });
});
