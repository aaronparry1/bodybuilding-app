import { describe, expect, it } from "vitest";
import type { Programme, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { addExerciseToSession, removeAddedExerciseFromSession, removeExerciseForTodayFromSession } from "@/domain/training/session-editing";
import { deleteLoggedSetFromSession, editLoggedSetInSession, removeFutureWorkSetFromSession } from "@/domain/training/session-set-editing";
import { defaultHypertrophySettings } from "@/domain/training/presets";
import { getRequiredSets } from "@/domain/training/set-prescription";
import { finishExerciseManuallyInSession } from "@/domain/training/workout-exercise-state";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { getWorkSets } from "@/domain/training/workout-sets";

function exercise(id: string, name: string): WorkoutExerciseLog {
  return {
    id: `${id}-log`,
    exerciseId: id,
    exerciseName: name,
    settings: defaultHypertrophySettings,
    load: 0,
    loadKnown: false,
    sets: [],
    status: "active",
    origin: "added_during_workout",
  };
}

function session(): WorkoutSession {
  return {
    id: "session-1",
    userId: "guest-local",
    programmeId: "programme-1",
    templateId: "day-1",
    name: "Push",
    startedAt: "2026-06-03T10:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z",
    syncState: "local",
    exercises: [
      { ...exercise("ex-bench-press", "Bench Press"), origin: "planned" },
      { ...exercise("ex-incline-dumbbell-press", "Incline Dumbbell Press"), origin: "planned" },
    ],
  };
}

describe("active session editing", () => {
  it("adds an exercise after the current exercise", () => {
    const edited = addExerciseToSession(session(), exercise("ex-triceps-pushdown", "Triceps Pushdown"), {
      activeExerciseIndex: 0,
      position: "after_current",
    });

    expect(edited.exercises.map((entry) => entry.exerciseId)).toEqual([
      "ex-bench-press",
      "ex-triceps-pushdown",
      "ex-incline-dumbbell-press",
    ]);
    expect(edited.exercises[1]).toMatchObject({
      origin: "added_during_workout",
      loadKnown: false,
    });
  });

  it("adds an exercise to the end without altering the source programme", () => {
    const programme: Programme = {
      id: "programme-1",
      name: "Push Plan",
      description: "Original plan",
      goal: "hypertrophy",
      experienceLevel: "intermediate",
      daysPerWeek: 1,
      isCustom: true,
      isPreset: false,
      days: [
        {
          id: "day-1",
          name: "Push",
          equipmentAvailable: ["barbell"],
          exerciseSlots: [
            { id: "slot-1", exerciseId: "ex-bench-press", plannedOrder: 1, settings: defaultHypertrophySettings },
          ],
        },
      ],
    };
    const edited = addExerciseToSession(session(), exercise("ex-cable-fly", "Cable Fly"), {
      activeExerciseIndex: 0,
      position: "end",
    });

    expect(edited.exercises.at(-1)?.exerciseId).toBe("ex-cable-fly");
    expect(programme.days[0].exerciseSlots.map((slot) => slot.exerciseId)).toEqual(["ex-bench-press"]);
  });

  it("removes an accidentally added exercise without touching planned work", () => {
    const edited = addExerciseToSession(session(), exercise("ex-cable-fly", "Cable Fly"), {
      activeExerciseIndex: 0,
      position: "after_current",
    });
    const cleaned = removeAddedExerciseFromSession(edited, 1);
    const plannedAttempt = removeAddedExerciseFromSession(cleaned, 0);

    expect(cleaned.exercises.map((entry) => entry.exerciseId)).toEqual([
      "ex-bench-press",
      "ex-incline-dumbbell-press",
    ]);
    expect(plannedAttempt.exercises.map((entry) => entry.exerciseId)).toEqual([
      "ex-bench-press",
      "ex-incline-dumbbell-press",
    ]);
  });

  it("removes any exercise from the current workout without altering the programme", () => {
    const programme: Programme = {
      id: "programme-1",
      name: "Push Plan",
      description: "Original plan",
      goal: "hypertrophy",
      experienceLevel: "intermediate",
      daysPerWeek: 1,
      isCustom: true,
      isPreset: false,
      days: [
        {
          id: "day-1",
          name: "Push",
          equipmentAvailable: ["barbell"],
          exerciseSlots: [
            { id: "slot-1", exerciseId: "ex-bench-press", plannedOrder: 1, settings: defaultHypertrophySettings },
            { id: "slot-2", exerciseId: "ex-incline-dumbbell-press", plannedOrder: 2, settings: defaultHypertrophySettings },
          ],
        },
      ],
    };
    const edited = removeExerciseForTodayFromSession(session(), 0);

    expect(edited.exercises.map((entry) => entry.exerciseId)).toEqual(["ex-incline-dumbbell-press"]);
    expect(programme.days[0].exerciseSlots.map((slot) => slot.exerciseId)).toEqual(["ex-bench-press", "ex-incline-dumbbell-press"]);
  });

  it("does not remove the final exercise from a workout", () => {
    const singleExerciseSession = {
      ...session(),
      exercises: [session().exercises[0]!],
    };

    expect(removeExerciseForTodayFromSession(singleExerciseSession, 0)).toBe(singleExerciseSession);
  });

  it("edits a logged set and recalculates exercise status", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 8, load: 100, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
    ];
    base.exercises[0].status = "shutdown";

    const edited = editLoggedSetInSession(base, 0, "set-3", { load: 100, reps: 10, type: "work" });

    expect(edited.exercises[0].sets[2]).toMatchObject({ reps: 10, load: 100, type: "work", setNumber: 3 });
    expect(edited.exercises[0].status).toBe("active");
    expect(edited.syncState).toBe("local");
  });

  it("moves a logged set between warm-up and work history with clean numbering", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "warm-1", setNumber: 1, reps: 8, load: 60, loggedAt: "2026-06-03T10:01:00.000Z", type: "warmup" },
      { id: "work-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "warm-1", { load: 60, reps: 8, type: "work" });

    expect(edited.exercises[0].sets.map((set) => ({ id: set.id, type: set.type, setNumber: set.setNumber }))).toEqual([
      { id: "warm-1", type: "work", setNumber: 1 },
      { id: "work-1", type: "work", setNumber: 2 },
    ]);
  });

  it("edits warm-up sets without treating them as work for shutdown/progression", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "warm-1", setNumber: 1, reps: 20, load: 40, loggedAt: "2026-06-03T10:01:00.000Z", type: "warmup" },
      { id: "warm-2", setNumber: 2, reps: 4, load: 100, loggedAt: "2026-06-03T10:03:00.000Z", type: "warmup" },
    ];

    const edited = editLoggedSetInSession(base, 0, "warm-2", { load: 110, reps: 3, type: "warmup" });

    expect(edited.exercises[0].sets).toEqual([
      expect.objectContaining({ id: "warm-1", type: "warmup", setNumber: 1 }),
      expect.objectContaining({ id: "warm-2", type: "warmup", setNumber: 2, load: 110, reps: 3 }),
    ]);
    expect(edited.exercises[0].status).toBe("active");
    expect(edited.exercises[0].shutdownReason).toBeUndefined();
    expect(edited.exercises[0].load).toBe(0);
    expect(edited.exercises[0].loadKnown).toBe(false);
  });

  it("keeps unknown working load unknown after multiple warm-up edits", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "warm-1", setNumber: 1, reps: 12, load: 30, loggedAt: "2026-06-03T10:01:00.000Z", type: "warmup" },
      { id: "warm-2", setNumber: 2, reps: 10, load: 40, loggedAt: "2026-06-03T10:03:00.000Z", type: "warmup" },
      { id: "warm-3", setNumber: 3, reps: 8, load: 50, loggedAt: "2026-06-03T10:04:00.000Z", type: "warmup" },
    ];

    const edited = editLoggedSetInSession(base, 0, "warm-1", { load: 35, reps: 10, type: "warmup" });

    expect(edited.exercises[0].sets).toContainEqual(expect.objectContaining({ id: "warm-1", type: "warmup", load: 35 }));
    expect(edited.exercises[0].load).toBe(0);
    expect(edited.exercises[0].loadKnown).toBe(false);
  });

  it("lets the first work set establish working load for an unknown exercise", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "warm-1", setNumber: 1, reps: 12, load: 30, loggedAt: "2026-06-03T10:01:00.000Z", type: "warmup" },
      { id: "work-1", setNumber: 1, reps: 12, load: 70, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "work-1", { load: 72.5, reps: 12, type: "work" });

    expect(edited.exercises[0].sets).toContainEqual(expect.objectContaining({ id: "work-1", type: "work", load: 72.5 }));
    expect(edited.exercises[0].load).toBe(72.5);
    expect(edited.exercises[0].loadKnown).toBe(true);
  });

  it("does not let a known exercise warm-up edit overwrite the working load", () => {
    const base = session();
    base.exercises[0].load = 100;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "warm-1", setNumber: 1, reps: 8, load: 60, loggedAt: "2026-06-03T10:01:00.000Z", type: "warmup" },
    ];

    const edited = editLoggedSetInSession(base, 0, "warm-1", { load: 30, reps: 10, type: "warmup" });

    expect(edited.exercises[0].sets).toContainEqual(expect.objectContaining({ id: "warm-1", type: "warmup", load: 30 }));
    expect(edited.exercises[0].load).toBe(100);
    expect(edited.exercises[0].loadKnown).toBe(true);
  });

  it("reduces the active working load immediately after a work set misses the minimum range", () => {
    const base = session();
    base.exercises[0].load = 100;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 6, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "set-1", { load: 100, reps: 6, type: "work" });

    expect(edited.exercises[0].load).toBe(95);
    expect(edited.exercises[0].loadKnown).toBe(true);
    expect(edited.exercises[0].status).toBe("active");
  });

  it("reduces the active working load again after a second missed set", () => {
    const base = session();
    base.exercises[0].load = 95;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 6, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 7, load: 95, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "set-2", { load: 95, reps: 7, type: "work" });

    expect(edited.exercises[0].load).toBe(90);
  });

  it("does not reduce active working load when the minimum range is hit", () => {
    const base = session();
    base.exercises[0].load = 100;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 8, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "set-1", { load: 100, reps: 8, type: "work" });

    expect(edited.exercises[0].load).toBe(100);
  });

  it("keeps extra-session misses out of planned in-session load correction", () => {
    const base = { ...session(), sessionKind: "extra_full" as const };
    base.exercises[0].load = 100;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 6, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = editLoggedSetInSession(base, 0, "set-1", { load: 100, reps: 6, type: "work" });

    expect(edited.exercises[0].load).toBe(100);
  });

  it("deletes a logged set and keeps the workout valid", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-1");

    expect(edited.exercises[0].sets).toHaveLength(1);
    expect(edited.exercises[0].sets[0]).toMatchObject({ id: "set-2", setNumber: 1, type: "work" });
    expect(edited.exercises[0].status).toBe("active");
  });

  it("deletes a logged work set and recalculates the current working load from remaining work", () => {
    const base = session();
    base.exercises[0].load = 110;
    base.exercises[0].loadKnown = true;
    base.exercises[0].status = "complete";
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 105, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 10, load: 110, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-3");

    expect(edited.exercises[0].sets.map((set) => ({ id: set.id, setNumber: set.setNumber }))).toEqual([
      { id: "set-1", setNumber: 1 },
      { id: "set-2", setNumber: 2 },
    ]);
    expect(edited.exercises[0].load).toBe(105);
    expect(edited.exercises[0].loadKnown).toBe(true);
    expect(edited.exercises[0].status).toBe("active");
  });

  it("keeps a completed exercise complete when deleting an optional logged set still leaves required work", () => {
    const base = session();
    base.exercises[0].status = "complete";
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
      { id: "set-4", setNumber: 4, reps: 10, load: 100, loggedAt: "2026-06-03T10:11:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-4");

    expect(getWorkSets(edited.exercises[0].sets)).toHaveLength(getRequiredSets(edited.exercises[0].settings));
    expect(edited.exercises[0].status).toBe("complete");
  });

  it("returns an unknown exercise to unknown load when deleting its only load-establishing work set", () => {
    const base = session();
    base.exercises[0].load = 28;
    base.exercises[0].loadKnown = true;
    base.exercises[0].loadEstablishedFromLoggedWorkSet = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 20, load: 28, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-1");

    expect(edited.exercises[0].sets).toHaveLength(0);
    expect(edited.exercises[0].load).toBe(0);
    expect(edited.exercises[0].loadKnown).toBe(false);
    expect(edited.exercises[0].loadEstablishedFromLoggedWorkSet).toBeUndefined();
  });

  it("deletes bodyweight logged sets without turning bodyweight into failed load evidence", () => {
    const base = session();
    base.exercises[0].load = 0;
    base.exercises[0].loadKnown = true;
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 0, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-1");

    expect(edited.exercises[0].sets).toHaveLength(0);
    expect(edited.exercises[0].load).toBe(0);
    expect(edited.exercises[0].loadKnown).toBe(true);
  });

  it("can edit a current-week completed workout when explicitly allowed", () => {
    const base = session();
    base.completedAt = "2026-06-03T11:00:00.000Z";
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 10, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const blocked = editLoggedSetInSession(base, 0, "set-1", { load: 105, reps: 9, type: "work" });
    const edited = editLoggedSetInSession(base, 0, "set-1", { load: 105, reps: 9, type: "work" }, { allowCompleted: true });

    expect(blocked).toBe(base);
    expect(edited.exercises[0].sets[0]).toMatchObject({ load: 105, reps: 9, type: "work" });
    expect(edited.completedAt).toBe(base.completedAt);
  });

  it("can delete a set from a current-week completed workout when explicitly allowed", () => {
    const base = session();
    base.completedAt = "2026-06-03T11:00:00.000Z";
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 10, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = deleteLoggedSetFromSession(base, 0, "set-1", { allowCompleted: true });

    expect(edited.exercises[0].sets).toHaveLength(0);
    expect(edited.completedAt).toBe(base.completedAt);
  });

  it("removes a future unlogged work row without creating a fake set", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
      { id: "set-4", setNumber: 4, reps: 10, load: 100, loggedAt: "2026-06-03T10:11:00.000Z", type: "work" },
    ];

    const edited = removeFutureWorkSetFromSession(base, 0, 5);

    expect(edited.exercises[0].removedFutureWorkSetNumbers).toEqual([5]);
    expect(edited.exercises[0].sets).toHaveLength(4);
    expect(edited.exercises[0].sets.some((set) => set.setNumber === 5)).toBe(false);
    expect(edited.updatedAt).not.toBe(base.updatedAt);
  });

  it("does not delete logged work through the future-row deletion path", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = removeFutureWorkSetFromSession(base, 0, 1);

    expect(edited).toBe(base);
    expect(edited.exercises[0].sets).toHaveLength(1);
  });

  it("lets an optional deleted row stop blocking completion after required work", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
      { id: "set-4", setNumber: 4, reps: 10, load: 100, loggedAt: "2026-06-03T10:11:00.000Z", type: "work" },
    ];

    const edited = removeFutureWorkSetFromSession(base, 0, 5);
    const workSetCount = getWorkSets(edited.exercises[0].sets).length;

    expect(workSetCount).toBeGreaterThanOrEqual(getRequiredSets(edited.exercises[0].settings));
    expect(edited.exercises[0].removedFutureWorkSetNumbers).toEqual([5]);
  });

  it("does not falsely complete an exercise when a required future row is removed below minimum work", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
    ];

    const edited = removeFutureWorkSetFromSession(base, 0, 3);
    const workSetCount = getWorkSets(edited.exercises[0].sets).length;

    expect(workSetCount).toBeLessThan(getRequiredSets(edited.exercises[0].settings));
    expect(edited.exercises[0].status).toBe("active");
    expect(edited.exercises[0].removedFutureWorkSetNumbers).toEqual([3]);
  });

  it("keeps deleted optional future rows out of performance failure evidence", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-03T10:07:00.000Z", type: "work" },
      { id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-03T10:09:00.000Z", type: "work" },
    ];

    const edited = removeFutureWorkSetFromSession(base, 0, 4);
    const summary = summarizeWorkoutSession({ ...edited, completedAt: "2026-06-03T11:00:00.000Z" });

    expect(summary?.exerciseSummaries[0]).toMatchObject({
      exerciseId: "ex-bench-press",
      stoppedByDropOff: false,
      setsCompleted: 3,
    });
  });

  it("marks a manually finished exercise complete without creating fake sets", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 10, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
    ];

    const edited = finishExerciseManuallyInSession(base, 0, "completed_enough", "2026-06-03T10:10:00.000Z");

    expect(edited.exercises[0]).toMatchObject({
      status: "complete",
      finishedManually: true,
      finishReason: "completed_enough",
      finishedAt: "2026-06-03T10:10:00.000Z",
      finishType: "manual_completion",
      shutdownReason: "Finished for today.",
    });
    expect(edited.exercises[0].sets).toHaveLength(1);
    expect(edited.exercises[1].status).toBe("active");
  });

  it("records manual fatigue finish as shutdown evidence without deleting logged rows", () => {
    const base = session();
    base.exercises[0].sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      { id: "set-2", setNumber: 2, reps: 9, load: 100, loggedAt: "2026-06-03T10:08:00.000Z", type: "work" },
    ];

    const edited = finishExerciseManuallyInSession(base, 0, "fatigue_performance", "2026-06-03T10:10:00.000Z");
    const summary = summarizeWorkoutSession({ ...edited, completedAt: "2026-06-03T11:00:00.000Z" });

    expect(edited.exercises[0]).toMatchObject({
      status: "shutdown",
      finishedManually: true,
      finishReason: "fatigue_performance",
      finishType: "manual_shutdown",
    });
    expect(edited.exercises[0].sets).toHaveLength(2);
    expect(summary?.exerciseSummaries[0]).toMatchObject({
      stoppedByDropOff: true,
      finishReason: "fatigue_performance",
      finishedManually: true,
    });
  });

  it("keeps pain, equipment, and out-of-time manual finishes out of failed-performance evidence", () => {
    for (const reason of ["pain_limitation", "equipment_unavailable", "out_of_time"] as const) {
      const base = session();
      base.exercises[0].sets = [
        { id: `set-${reason}`, setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-03T10:05:00.000Z", type: "work" },
      ];

      const edited = finishExerciseManuallyInSession(base, 0, reason, "2026-06-03T10:10:00.000Z");
      const summary = summarizeWorkoutSession({ ...edited, completedAt: "2026-06-03T11:00:00.000Z" });

      expect(edited.exercises[0].status).toBe("complete");
      expect(summary?.exerciseSummaries[0]?.stoppedByDropOff).toBe(false);
    }
  });
});
