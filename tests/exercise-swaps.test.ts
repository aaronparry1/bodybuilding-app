import { describe, expect, it } from "vitest";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { getExerciseSwapSuggestions, swapExerciseInSession } from "@/domain/training/exercise-swaps";
import { getWorkoutExerciseDisplayStatus } from "@/domain/training/workout-session-status";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { defaultHypertrophySettings, exerciseLibrary } from "@/domain/training/presets";

const bench = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
const machineChestPress = exerciseLibrary.find((exercise) => exercise.id === "ex-machine-chest-press")!;
const dips = exerciseLibrary.find((exercise) => exercise.id === "ex-dips")!;

function log(exerciseId: string, exerciseName: string, status: WorkoutExerciseLog["status"] = "active"): WorkoutExerciseLog {
  return {
    id: `${exerciseId}-log`,
    exerciseId,
    exerciseName,
    settings: defaultHypertrophySettings,
    load: 100,
    sets: [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-02T10:05:00.000Z" },
      { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-02T10:10:00.000Z" },
    ],
    status,
  };
}

function session(exercise: WorkoutExerciseLog): WorkoutSession {
  return {
    id: "session-1",
    userId: "user-1",
    name: "Push",
    startedAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-02T10:10:00.000Z",
    syncState: "local",
    exercises: [exercise],
  };
}

describe("exercise swaps", () => {
  it("prioritises same primary muscle and movement pattern", () => {
    const suggestions = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 5 });

    expect(suggestions[0]?.family).toBe("horizontal_press");
    expect(suggestions[0]?.primaryMuscles).toContain("chest");
    expect(suggestions.slice(0, 5).some((exercise) => exercise.movementPattern === bench.movementPattern)).toBe(true);
  });

  it("can recommend relevant new same-family variants for swaps", () => {
    const benchSuggestions = getExerciseSwapSuggestions(bench, exerciseLibrary, { limit: 40 });
    const squat = exerciseLibrary.find((exercise) => exercise.id === "ex-barbell-back-squat")!;
    const deadliftPattern = exerciseLibrary.find((exercise) => exercise.id === "ex-dumbbell-romanian-deadlift")!;
    const squatSuggestions = getExerciseSwapSuggestions(squat, exerciseLibrary, { limit: 20 });
    const hingeSuggestions = getExerciseSwapSuggestions(deadliftPattern, exerciseLibrary, { limit: 30 });

    expect(benchSuggestions.map((exercise) => exercise.id)).toContain("ex-floor-press");
    expect(benchSuggestions.map((exercise) => exercise.id)).toContain("ex-decline-press");
    expect(benchSuggestions.map((exercise) => exercise.id)).toContain("ex-paused-bench-press");
    expect(benchSuggestions.map((exercise) => exercise.id)).toContain("ex-speed-bench-press");
    expect(squatSuggestions.map((exercise) => exercise.id)).toContain("ex-safety-squat-bar-squat");
    expect(squatSuggestions.map((exercise) => exercise.id)).toContain("ex-tempo-squat");
    expect(hingeSuggestions.map((exercise) => exercise.id)).toContain("ex-rack-pull");
    expect(hingeSuggestions.map((exercise) => exercise.id)).toContain("ex-deadlift");
    expect(hingeSuggestions.map((exercise) => exercise.id)).toContain("ex-trap-bar-deadlift");
    expect(hingeSuggestions.map((exercise) => exercise.id)).toContain("ex-speed-deadlift");
  });

  it("can recommend coverage-update variants for sensible swap families", () => {
    const walkingLunge = exerciseLibrary.find((exercise) => exercise.id === "ex-walking-lunge")!;
    const hammerCurl = exerciseLibrary.find((exercise) => exercise.id === "ex-hammer-curl")!;
    const ropePushdown = exerciseLibrary.find((exercise) => exercise.id === "ex-rope-pushdown")!;
    const barbellShrug = exerciseLibrary.find((exercise) => exercise.id === "ex-barbell-shrug")!;
    const barbellRow = exerciseLibrary.find((exercise) => exercise.id === "ex-barbell-row")!;

    expect(getExerciseSwapSuggestions(walkingLunge, exerciseLibrary, { limit: 20 }).map((exercise) => exercise.id)).toEqual(
      expect.arrayContaining(["ex-reverse-lunge", "ex-lunge"]),
    );
    expect(getExerciseSwapSuggestions(hammerCurl, exerciseLibrary, { limit: 30 }).map((exercise) => exercise.id)).toEqual(
      expect.arrayContaining(["ex-alternating-hammer-curl", "ex-v-bar-cable-curl", "ex-thick-bar-cable-curl", "ex-barbell-curl"]),
    );
    expect(getExerciseSwapSuggestions(ropePushdown, exerciseLibrary, { limit: 20 }).map((exercise) => exercise.id)).toEqual(
      expect.arrayContaining(["ex-straight-bar-pushdown", "ex-single-arm-cable-pushdown"]),
    );
    expect(getExerciseSwapSuggestions(barbellShrug, exerciseLibrary, { limit: 10 }).map((exercise) => exercise.id)).toContain("ex-cable-shrug");
    expect(getExerciseSwapSuggestions(barbellRow, exerciseLibrary, { limit: 20 }).map((exercise) => exercise.id)).toContain("ex-pendlay-row");
  });

  it("prioritises the exercise category when a compound overlaps multiple muscles", () => {
    const suggestions = getExerciseSwapSuggestions(dips, exerciseLibrary, { limit: 5 });

    expect(suggestions.slice(0, 3).some((exercise) => exercise.category === "triceps" || exercise.primaryMuscles.includes("triceps"))).toBe(true);
    expect(suggestions[0]?.category).toBe("triceps");
  });

  it("preserves logged sets and inserts the replacement fresh", () => {
    const replacement = { ...log(machineChestPress.id, machineChestPress.name), sets: [] };
    const swapped = swapExerciseInSession(session(log(bench.id, bench.name)), 0, replacement);

    expect(swapped.exercises).toHaveLength(1);
    expect(swapped.exercises[0]).toMatchObject({
      exerciseId: machineChestPress.id,
      status: "active",
      swappedFromExerciseId: bench.id,
    });
    expect(swapped.exercises[0]?.sets).toHaveLength(0);
    expect(swapped.exercises[0]?.swapHistory?.[0]).toMatchObject({
      exerciseId: bench.id,
      swappedToExerciseId: machineChestPress.id,
    });
    expect(swapped.exercises[0]?.swapHistory?.[0]?.sets).toHaveLength(2);
  });

  it("shows swapped exercise in workout history", () => {
    const replacement = {
      ...log(machineChestPress.id, machineChestPress.name, "complete"),
      sets: [{ id: "set-3", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-02T10:15:00.000Z" }],
    };
    const swapped = {
      ...swapExerciseInSession(session(log(bench.id, bench.name)), 0, replacement),
      completedAt: "2026-06-02T10:45:00.000Z",
    };
    const summary = summarizeWorkoutSession(swapped);

    expect(summary?.exerciseSummaries[0]).toMatchObject({
      exerciseId: bench.id,
      swappedToExerciseId: machineChestPress.id,
    });
    expect(summary?.exerciseSummaries[1]).toMatchObject({
      exerciseId: machineChestPress.id,
      swappedFromExerciseId: bench.id,
    });
  });

  it("directly replaces an exercise with no work sets without leaving an old card", () => {
    const replacement = { ...log(machineChestPress.id, machineChestPress.name), sets: [] };
    const noSets = { ...log(bench.id, bench.name), sets: [] };
    const swapped = swapExerciseInSession(session(noSets), 0, replacement);

    expect(swapped.exercises).toHaveLength(1);
    expect(swapped.exercises[0]?.exerciseId).toBe(machineChestPress.id);
    expect(swapped.exercises[0]?.swapHistory).toBeUndefined();
  });

  it("directly replaces an exercise with warm-up sets only without preserving old clutter", () => {
    const replacement = { ...log(machineChestPress.id, machineChestPress.name), sets: [] };
    const warmupsOnly = {
      ...log(bench.id, bench.name),
      sets: [{ id: "warmup-1", setNumber: 1, reps: 8, load: 40, type: "warmup" as const, loggedAt: "2026-06-02T10:05:00.000Z" }],
    };
    const swapped = swapExerciseInSession(session(warmupsOnly), 0, replacement);

    expect(swapped.exercises).toHaveLength(1);
    expect(swapped.exercises[0]?.exerciseId).toBe(machineChestPress.id);
    expect(swapped.exercises[0]?.swapHistory).toBeUndefined();
  });

  it("returns session overview statuses from work-set progress, not warm-ups", () => {
    const noWorkSets = { ...log("empty", "Empty"), sets: [], status: "active" as const };
    const warmupsOnly = {
      ...log("warm", "Warm"),
      sets: [{ id: "warmup-1", setNumber: 1, reps: 8, load: 40, type: "warmup" as const, loggedAt: "2026-06-02T10:05:00.000Z" }],
      status: "active" as const,
    };
    const someWorkSets = {
      ...log("some", "Some"),
      sets: [{ id: "set-1", setNumber: 1, reps: 12, load: 100, type: "work" as const, loggedAt: "2026-06-02T10:05:00.000Z" }],
      status: "active" as const,
    };
    const allRequiredWorkSets = {
      ...log("done", "Done"),
      sets: [
        { id: "set-1", setNumber: 1, reps: 12, load: 100, type: "work" as const, loggedAt: "2026-06-02T10:05:00.000Z" },
        { id: "set-2", setNumber: 2, reps: 11, load: 100, type: "work" as const, loggedAt: "2026-06-02T10:10:00.000Z" },
        { id: "set-3", setNumber: 3, reps: 10, load: 100, type: "work" as const, loggedAt: "2026-06-02T10:15:00.000Z" },
        { id: "set-4", setNumber: 4, reps: 10, load: 100, type: "work" as const, loggedAt: "2026-06-02T10:20:00.000Z" },
      ],
      status: "active" as const,
    };
    const addedExercise = { ...allRequiredWorkSets, id: "added-log", origin: "added_during_workout" as const };

    expect(getWorkoutExerciseDisplayStatus(log(bench.id, bench.name, "swapped"), 0, 1)).toBe("swapped");
    expect(getWorkoutExerciseDisplayStatus({ ...allRequiredWorkSets, status: "shutdown" }, 1, 1)).toBe("stopped");
    expect(getWorkoutExerciseDisplayStatus({ ...noWorkSets, status: "complete" }, 1, 1)).toBe("skipped");
    expect(getWorkoutExerciseDisplayStatus(noWorkSets, 2, 2)).toBe("not-started");
    expect(getWorkoutExerciseDisplayStatus(warmupsOnly, 2, 2)).toBe("not-started");
    expect(getWorkoutExerciseDisplayStatus(someWorkSets, 2, 2)).toBe("active");
    expect(getWorkoutExerciseDisplayStatus(allRequiredWorkSets, 2, 2)).toBe("completed");
    expect(getWorkoutExerciseDisplayStatus(addedExercise, 2, 2)).toBe("completed");
  });
});
