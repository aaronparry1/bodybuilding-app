import { describe, expect, it } from "vitest";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { Exercise, ProgressionSettings, SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { getRestTimerDefault } from "@/domain/training/rest-timer";
import { swapExerciseInSession } from "@/domain/training/exercise-swaps";
import { summarizeWorkoutHistory, summarizeWorkoutSession } from "@/domain/training/workout-history";
import { buildAnalyticsDashboard } from "@/domain/training/analytics";
import { buildStrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";

const kgSettings = (exercise: Exercise, overrides: Partial<ProgressionSettings> = {}): ProgressionSettings => ({
  repRange: exercise.defaultRepRange,
  dropOffPercent: 15,
  loadIncrease: exercise.defaultLoadJump,
  unit: "kg",
  requiredWorkSets: 3,
  ...overrides,
});

function exercise(id: string): Exercise {
  const match = exerciseLibrary.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing exercise fixture: ${id}`);
  return match;
}

function setLog(setNumber: number, reps: number, load: number): SetLog {
  return {
    id: `set-${setNumber}-${reps}-${load}`,
    setNumber,
    reps,
    load,
    loggedAt: `2026-06-02T10:${String(setNumber).padStart(2, "0")}:00.000Z`,
  };
}

function logExercise(id: string, load: number, reps: number[], options: { loadEdits?: Record<number, number>; status?: WorkoutExerciseLog["status"] } = {}): WorkoutExerciseLog {
  const metadata = exercise(id);
  const sets = reps.map((repCount, index) => setLog(index + 1, repCount, options.loadEdits?.[index + 1] ?? load));
  const progression = evaluateExerciseProgression({
    exerciseName: metadata.name,
    currentLoad: sets.at(-1)?.load ?? load,
    settings: kgSettings(metadata),
    sets,
  });

  return {
    id: `log-${id}-${load}`,
    exerciseId: metadata.id,
    exerciseName: metadata.name,
    settings: kgSettings(metadata),
    load: sets.at(-1)?.load ?? load,
    sets,
    status: options.status ?? (progression.shouldShutdown ? "shutdown" : "complete"),
    shutdownReason: progression.shouldShutdown ? "Performance dropped below threshold." : undefined,
  };
}

function replacementLog(id: string, inheritedLoad: number): WorkoutExerciseLog {
  const metadata = exercise(id);
  return {
    id: `replacement-${id}`,
    exerciseId: metadata.id,
    exerciseName: metadata.name,
    settings: kgSettings(metadata),
    load: inheritedLoad,
    sets: [],
    status: "active",
  };
}

function session(index: number, name: string, exercises: WorkoutExerciseLog[]): WorkoutSession {
  const date = new Date("2026-05-22T09:00:00.000Z");
  date.setDate(date.getDate() + index * 2);
  const startedAt = date.toISOString();
  date.setMinutes(date.getMinutes() + 70);
  const completedAt = date.toISOString();

  return {
    id: `real-use-session-${index}`,
    userId: "guest-local",
    name,
    startedAt,
    completedAt,
    exercises,
    syncState: "local",
    updatedAt: completedAt,
  };
}

function swapAndFinish(base: WorkoutSession, activeExerciseIndex: number, replacementId: string, replacementReps: number[]): WorkoutSession {
  const openBase = { ...base, completedAt: undefined };
  const current = openBase.exercises[activeExerciseIndex];
  const swapped = swapExerciseInSession(openBase, activeExerciseIndex, replacementLog(replacementId, current.load));
  const replacement = logExercise(replacementId, current.load, replacementReps);

  return {
    ...swapped,
    completedAt: base.completedAt,
    exercises: swapped.exercises.map((candidate, index) =>
      index === activeExerciseIndex
        ? {
            ...replacement,
            id: candidate.id,
            swappedFromExerciseId: candidate.swappedFromExerciseId,
            swappedFromExerciseName: candidate.swappedFromExerciseName,
            swapHistory: candidate.swapHistory,
          }
        : candidate,
    ),
  };
}

describe("real-use training simulation QA", () => {
  it("logs five realistic workouts with shutdowns, load edits, swaps, history, analytics, and strategic direction", () => {
    const pushBase = session(1, "Push", [
      logExercise("ex-bench-press", 100, [12, 11, 10, 8]),
      logExercise("ex-incline-dumbbell-press", 35, [10, 10, 9], { loadEdits: { 2: 37.5 } }),
      logExercise("ex-cable-lateral-raise", 12, [15, 14, 13, 12]),
    ]);
    const push = swapAndFinish(pushBase, 1, "ex-machine-chest-press", [11, 10, 9]);

    const pullBase = session(2, "Pull", [
      logExercise("ex-lat-pulldown", 70, [12, 11, 10]),
      logExercise("ex-chest-supported-row", 80, [10, 10, 9, 8]),
      logExercise("ex-dumbbell-curl", 20, [12, 11, 10]),
    ]);
    const pull = swapAndFinish(pullBase, 2, "ex-cable-curl", [12, 11, 10]);

    const legsBase = session(3, "Legs", [
      logExercise("ex-hack-squat", 120, [12, 11, 10, 8]),
      logExercise("ex-romanian-deadlift", 100, [10, 9, 8]),
      logExercise("ex-seated-leg-curl", 55, [12, 11, 10]),
    ]);
    const legs = swapAndFinish(legsBase, 2, "ex-lying-leg-curl", [12, 11, 10]);

    const upperBase = session(4, "Upper", [
      logExercise("ex-dumbbell-bench-press", 42.5, [10, 10, 9]),
      logExercise("ex-seated-cable-row", 80, [12, 11, 9]),
      logExercise("ex-machine-shoulder-press", 55, [10, 9, 8]),
      logExercise("ex-lat-pulldown", 72.5, [11, 10, 9]),
      logExercise("ex-dumbbell-lateral-raise", 12, [16, 15, 14]),
    ]);
    const upper = swapAndFinish(upperBase, 2, "ex-smith-shoulder-press", [9, 8, 7]);

    const fullBodyBase = session(5, "Full Body", [
      logExercise("ex-barbell-back-squat", 120, [8, 8, 7]),
      logExercise("ex-bench-press", 102.5, [10, 9, 8]),
      logExercise("ex-chest-supported-row", 82.5, [11, 10, 9]),
      logExercise("ex-romanian-deadlift", 105, [9, 8, 7]),
      logExercise("ex-cable-lateral-raise", 14, [15, 14, 13]),
    ]);
    const fullBody = swapAndFinish(fullBodyBase, 0, "ex-leg-press", [12, 11, 10]);

    const sessions = [push, pull, legs, upper, fullBody];
    const summaries = summarizeWorkoutHistory(sessions);
    const dashboard = buildAnalyticsDashboard(summaries, exerciseLibrary, 4, new Date("2026-06-02T12:00:00.000Z"));
    const direction = buildStrategicCoachingViewModel(summaries, exerciseLibrary);
    const benchSummary = summarizeWorkoutSession(push)?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-bench-press");
    const editedLoadSummary = summarizeWorkoutSession(push)?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-incline-dumbbell-press");
    const pushSwapped = summarizeWorkoutSession(push)?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-incline-dumbbell-press");
    const pushReplacement = summarizeWorkoutSession(push)?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-machine-chest-press");

    expect(summaries).toHaveLength(5);
    expect(summaries.map((summary) => summary.sessionName)).toEqual(["Full Body", "Upper", "Legs", "Pull", "Push"]);
    expect(benchSummary?.bestSetReps).toBe(12);
    expect(benchSummary?.stoppedByDropOff).toBe(true);
    expect(benchSummary?.qualitySets).toBe(3);
    expect(benchSummary?.progressionEarned).toBe(false);
    expect(benchSummary?.nextRecommendedLoad).toBe(100);
    expect(
      evaluateExerciseProgression({
        exerciseName: "Bench Press",
        currentLoad: 100,
        settings: kgSettings(exercise("ex-bench-press")),
        sets: [12, 11, 10, 10].map((reps, index) => setLog(index + 1, reps, 100)),
      }).nextLoad,
    ).toBe(105);
    expect(editedLoadSummary?.volumeLoad).toBe(35 * 10 + 37.5 * 10 + 35 * 9);
    expect(editedLoadSummary?.setsCompleted).toBe(3);
    expect(push.exercises.find((entry) => entry.exerciseId === "ex-incline-dumbbell-press")).toBeUndefined();
    expect(pushSwapped?.swappedToExerciseName).toBe("Machine Chest Press");
    expect(pushReplacement?.swappedFromExerciseName).toBe("Incline Dumbbell Press");
    expect(pushReplacement?.setsCompleted).toBe(3);
    expect(push.exercises.find((entry) => entry.exerciseId === "ex-machine-chest-press")?.sets).toHaveLength(3);
    expect(sessions.every((completed) => Boolean(completed.completedAt))).toBe(true);
    expect(summaries.some((summary) => summary.exerciseSummaries.some((entry) => entry.stoppedByDropOff))).toBe(true);
    expect(dashboard.weeklyVolume).toBeGreaterThan(0);
    expect(dashboard.setsPerMuscleGroup.length).toBeGreaterThan(0);
    expect(direction.hasEnoughHistory).toBe(true);
    expect(direction.recommendation?.title).toBeTruthy();
    expect(direction.recommendation?.reasons.length).toBeGreaterThan(0);
  });

  it("keeps rest timer defaults and workout repository saves aligned with real-use expectations", () => {
    const bench = exercise("ex-bench-press");
    const lateralRaise = exercise("ex-cable-lateral-raise");
    const push = session(99, "Repository Save QA", [logExercise("ex-bench-press", 100, [12, 11, 10, 8])]);

    workoutSessionRepository.save(push);
    workoutSessionRepository.save({ ...push, notes: "saved twice without duplicate" });

    expect(workoutSessionRepository.list().filter((candidate) => candidate.id === push.id)).toHaveLength(1);
    expect(getRestTimerDefault({ blockType: "hypertrophy", roles: bench.roles, movementPattern: bench.movementPattern }).seconds).toBe(120);
    expect(getRestTimerDefault({ blockType: "hypertrophy", roles: lateralRaise.roles, movementPattern: lateralRaise.movementPattern }).seconds).toBe(75);
  });
});
