import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { buildWorkoutConflictCopy, getLatestOpenSession, isSameWorkoutStartTarget, workoutHasLoggedSets } from "@/domain/training/active-workout";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { defaultHypertrophySettings } from "@/domain/training/presets";
import { deleteLoggedSetFromSession, editLoggedSetInSession } from "@/domain/training/session-set-editing";

function loggedSet(id: string, setNumber: number, type: SetLog["type"], load: number, reps: number): SetLog {
  return {
    id,
    setNumber,
    type,
    load,
    reps,
    loggedAt: `2026-06-07T10:0${setNumber}:00.000Z`,
  };
}

function workoutExercise(): WorkoutExerciseLog {
  return {
    id: "exercise-log-bench",
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    settings: defaultHypertrophySettings,
    load: 95,
    loadKnown: true,
    sets: [
      loggedSet("warm-1", 1, "warmup", 60, 8),
      loggedSet("work-1", 1, "work", 95, 10),
    ],
    status: "active",
    origin: "planned",
  };
}

function activeWorkout(): WorkoutSession {
  return {
    id: "active-workout-persistence",
    userId: "guest-local",
    name: "Push",
    startedAt: "2026-06-07T10:00:00.000Z",
    updatedAt: "2026-06-07T10:05:00.000Z",
    syncState: "local",
    programmeId: "programme-push",
    templateId: "day-push",
    planSessionIndex: 0,
    sessionKind: "planned",
    exercises: [
      workoutExercise(),
      {
        ...workoutExercise(),
        id: "exercise-log-incline",
        exerciseId: "ex-incline-dumbbell-press",
        exerciseName: "Incline Dumbbell Press",
        sets: [],
      },
    ],
  };
}

describe("active workout persistence", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
  });

  it("persists warm-up, work, and edited set data after Home navigation and Continue Workout reload", () => {
    workoutSessionRepository.save(activeWorkout());

    const edited = editLoggedSetInSession(workoutSessionRepository.list()[0]!, 0, "work-1", {
      load: 80,
      reps: 12,
      type: "work",
    });
    workoutSessionRepository.save(edited);

    const homeNavigationRead = workoutSessionRepository.list();
    const continuedWorkout = getLatestOpenSession(homeNavigationRead);

    expect(continuedWorkout?.id).toBe("active-workout-persistence");
    expect(continuedWorkout?.exercises[0].sets).toEqual([
      expect.objectContaining({ id: "warm-1", type: "warmup", load: 60, reps: 8, setNumber: 1 }),
      expect.objectContaining({ id: "work-1", type: "work", load: 80, reps: 12, setNumber: 1 }),
    ]);
    expect(workoutSessionRepository.list().filter((session) => session.id === "active-workout-persistence")).toHaveLength(1);
  });

  it("keeps selected programme-day state from replacing an already open workout on route remount", () => {
    workoutSessionRepository.save(activeWorkout());
    programmeRepository.selectProgrammeDay({
      programmeId: "different-programme",
      dayId: "different-day",
      planSessionIndex: 3,
      sessionKind: "planned",
    });

    const remountedWorkout = getLatestOpenSession(workoutSessionRepository.list());

    expect(remountedWorkout?.id).toBe("active-workout-persistence");
    expect(remountedWorkout?.planSessionIndex).toBe(0);
    expect(remountedWorkout?.exercises[0].sets.find((set) => set.type === "warmup")).toBeTruthy();
    expect(remountedWorkout?.exercises[0].sets.find((set) => set.type === "work")).toBeTruthy();
    expect(workoutSessionRepository.list()).toHaveLength(1);
  });

  it("recognises the same planned active workout so Start Workout can resume it", () => {
    const open = activeWorkout();

    expect(
      isSameWorkoutStartTarget(open, {
        name: "Push",
        sessionKind: "planned",
        planSessionIndex: 0,
      }),
    ).toBe(true);
  });

  it("detects a different selected workout while another planned workout is active", () => {
    const open = activeWorkout();

    expect(
      isSameWorkoutStartTarget(open, {
        name: "Legs",
        sessionKind: "planned",
        planSessionIndex: 2,
      }),
    ).toBe(false);
  });

  it("uses stronger conflict copy when the active workout already has logged sets", () => {
    const open = activeWorkout();
    const copy = buildWorkoutConflictCopy(open, { name: "Legs", sessionKind: "planned", planSessionIndex: 2 });

    expect(workoutHasLoggedSets(open)).toBe(true);
    expect(copy.title).toBe("Workout already in progress");
    expect(copy.body).toBe("You have logged sets in this workout. Starting Legs will discard this in-progress workout.");
    expect(copy.continueLabel).toBe("Continue Push");
    expect(copy.discardLabel).toBe("Discard and Start Legs");
  });

  it("uses lighter conflict copy when the active workout has no logged sets", () => {
    const open = {
      ...activeWorkout(),
      exercises: activeWorkout().exercises.map((exercise) => ({ ...exercise, sets: [] })),
    };
    const copy = buildWorkoutConflictCopy(open, { name: "Legs", sessionKind: "planned", planSessionIndex: 2 });

    expect(workoutHasLoggedSets(open)).toBe(false);
    expect(copy.body).toBe("You already have a Push workout in progress. Starting Legs will discard the current workout.");
  });

  it("preserves edited warm-up/work designation and deletion state across route reloads", () => {
    workoutSessionRepository.save(activeWorkout());
    const movedWarmupToWork = editLoggedSetInSession(workoutSessionRepository.list()[0]!, 0, "warm-1", {
      load: 60,
      reps: 8,
      type: "work",
    });
    workoutSessionRepository.save(movedWarmupToWork);
    const deleted = deleteLoggedSetFromSession(workoutSessionRepository.list()[0]!, 0, "work-1");
    workoutSessionRepository.save(deleted);

    const reloaded = getLatestOpenSession(workoutSessionRepository.list());

    expect(reloaded?.exercises[0].sets).toEqual([
      expect.objectContaining({ id: "warm-1", type: "work", setNumber: 1, load: 60, reps: 8 }),
    ]);
  });

  it("only explicit cancel discards the active workout and explicit complete saves it", () => {
    workoutSessionRepository.save(activeWorkout());

    expect(getLatestOpenSession(workoutSessionRepository.list())?.id).toBe("active-workout-persistence");

    workoutSessionRepository.remove("active-workout-persistence");
    expect(getLatestOpenSession(workoutSessionRepository.list())).toBeNull();
    expect(workoutSessionRepository.list()).toEqual([]);

    const completed = {
      ...activeWorkout(),
      completedAt: "2026-06-07T11:00:00.000Z",
      updatedAt: "2026-06-07T11:00:00.000Z",
    };
    workoutSessionRepository.save(completed);

    expect(getLatestOpenSession(workoutSessionRepository.list())).toBeNull();
    expect(workoutSessionRepository.list()[0]).toMatchObject({
      id: "active-workout-persistence",
      completedAt: "2026-06-07T11:00:00.000Z",
    });
  });
});
