import { describe, expect, it } from "vitest";
import { formatMetricValue, formatTargetRange, getExerciseMeasurementType } from "@/domain/training/exercise-metrics";
import { formatSetLoadDisplay } from "@/domain/training/load-display";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { detectPersonalRecords } from "@/domain/training/personal-records";
import { buildPostWorkoutReview } from "@/domain/training/post-workout-review";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildPrSharePayload } from "@/domain/training/share-cards";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";

function builtIn(name: string) {
  const exercise = exerciseLibrary.find((candidate) => candidate.name === name);
  if (!exercise) throw new Error(`Missing built-in exercise: ${name}`);
  return exercise;
}

function exerciseLog(name: string, seconds: number): WorkoutExerciseLog {
  const exercise = builtIn(name);
  return {
    id: `${exercise.id}-log`,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    settings: exercise.defaultSettings,
    load: 0,
    loadKnown: true,
    sets: [{ id: "set-1", setNumber: 1, reps: seconds, load: 0, loggedAt: "2026-06-20T10:05:00.000Z", type: "work" }],
    status: "active",
  };
}

function completedSession(exercise: WorkoutExerciseLog): WorkoutSession {
  return {
    id: "duration-session",
    name: "Core Capacity",
    startedAt: "2026-06-20T10:00:00.000Z",
    completedAt: "2026-06-20T10:30:00.000Z",
    updatedAt: "2026-06-20T10:30:00.000Z",
    syncState: "local",
    exercises: [exercise],
  };
}

describe("time-based exercise support", () => {
  it("classifies built-in static holds as duration exercises", () => {
    const names = ["Plank", "Side Plank", "Dead Hang", "Farmer Carry", "Suitcase Carry", "Iso Hold Back Extension"];

    for (const name of names) {
      const exercise = builtIn(name);
      expect(exercise.measurementType).toBe("duration");
      expect(exercise.defaultSettings.measurementType).toBe("duration");
      expect(formatTargetRange(exercise.defaultRepRange, exercise.measurementType)).toContain("sec");
    }
  });

  it("leaves rep-based exercises on the normal rep model", () => {
    const bench = builtIn("Bench Press");

    expect(getExerciseMeasurementType(bench.defaultSettings)).toBe("reps");
    expect(formatTargetRange(bench.defaultRepRange, getExerciseMeasurementType(bench.defaultSettings))).toContain("reps");
  });

  it("formats logged duration sets as seconds in set display and history", () => {
    const plank = builtIn("Plank");
    const log = exerciseLog("Plank", 45);
    const session = completedSession(log);
    const summary = summarizeWorkoutSession(session);

    expect(formatSetLoadDisplay(log.sets[0]!, "kg", "kg", { exercise: log, metadata: plank })).toBe("Bodyweight × 45 sec");
    expect(summary?.exerciseSummaries[0]).toMatchObject({
      exerciseName: "Plank",
      measurementType: "duration",
      bestSetReps: 45,
      repsCompleted: 45,
    });
    expect(formatMetricValue(summary!.exerciseSummaries[0]!.bestSetReps, summary!.exerciseSummaries[0]!.measurementType)).toBe("45 sec");
  });

  it("progresses duration targets before adding load", () => {
    const plank = builtIn("Plank");
    const result = evaluateExerciseProgression({
      exerciseName: plank.name,
      currentLoad: 0,
      settings: plank.defaultSettings,
      sets: [
        { setNumber: 1, reps: 45, load: 0 },
        { setNumber: 2, reps: 45, load: 0 },
        { setNumber: 3, reps: 45, load: 0 },
      ],
    });

    expect(result.shouldIncreaseLoad).toBe(false);
    expect(result.nextLoad).toBe(0);
    expect(result.nextTargetRange).toEqual({ min: 35, max: 50 });
    expect(result.recommendation).toContain("Increase duration");
  });

  it("keeps duration PR and share-card copy in seconds without creating e1RM records", () => {
    const first = completedSession({ ...exerciseLog("Dead Hang", 30), id: "dead-hang-first" });
    const second = completedSession({ ...exerciseLog("Dead Hang", 45), id: "dead-hang-second" });
    const sessions = [
      { ...first, id: "duration-session-1", completedAt: "2026-06-20T10:30:00.000Z", updatedAt: "2026-06-20T10:30:00.000Z" },
      { ...second, id: "duration-session-2", completedAt: "2026-06-22T10:30:00.000Z", updatedAt: "2026-06-22T10:30:00.000Z" },
    ];

    const records = detectPersonalRecords({
      sessions,
      currentSessionId: "duration-session-2",
      now: "2026-06-22T11:00:00.000Z",
      includeBaselines: true,
    });
    const durationPr = records.find((record) => record.type === "rep" && record.exerciseName === "Dead Hang");

    expect(records.some((record) => record.type === "e1rm")).toBe(false);
    expect(durationPr).toMatchObject({ measurementType: "duration", reps: 45 });
    expect(buildPrSharePayload(durationPr!).metric).toBe("Bodyweight × 45 sec");
  });

  it("carries duration metrics into workout review records", () => {
    const review = buildPostWorkoutReview({
      session: completedSession(exerciseLog("Side Plank", 40)),
      previousSessions: [],
      completedAt: "2026-06-20T10:30:00.000Z",
    });

    expect(review.baselines.find((record) => record.exerciseName === "Side Plank" && record.type === "rep")).toMatchObject({
      measurementType: "duration",
      reps: 40,
    });
  });
});
