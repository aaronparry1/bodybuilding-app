import { describe, expect, it } from "vitest";
import type { WorkoutSession } from "@/domain/training/models";
import { resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { filterWorkoutHistory, getLastExercisePerformance, summarizeWorkoutHistory, summarizeWorkoutSession } from "@/domain/training/workout-history";
import { defaultHypertrophySettings, exerciseLibrary } from "@/domain/training/presets";

const completedSession: WorkoutSession = {
  id: "session-1",
  userId: null,
  programmeId: "programme-1",
  templateId: "day-1",
  name: "Upper A",
  startedAt: "2026-06-01T10:00:00.000Z",
  completedAt: "2026-06-01T10:45:00.000Z",
  updatedAt: "2026-06-01T10:45:00.000Z",
  syncState: "local",
  exercises: [
    {
      id: "performed-bench",
      exerciseId: "ex-bench-press",
      exerciseName: "Bench Press",
      load: 100,
      settings: defaultHypertrophySettings,
      status: "active",
      sets: [
        { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-01T10:05:00.000Z" },
        { id: "set-2", setNumber: 2, reps: 11, load: 100, loggedAt: "2026-06-01T10:10:00.000Z" },
        { id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-01T10:15:00.000Z" },
      ],
    },
  ],
};

describe("workout history summaries", () => {
  it("summarizes completed workout memory", () => {
    const summary = summarizeWorkoutSession(completedSession);

    expect(summary?.durationMinutes).toBe(45);
    expect(summary?.exercisesCompleted).toBe(1);
    expect(summary?.setsCompleted).toBe(3);
    expect(summary?.repsCompleted).toBe(33);
    expect(summary?.totalLoadVolume).toBe(3300);
    expect(summary?.exerciseSummaries[0]).toMatchObject({
      bestSetReps: 12,
      qualitySets: 3,
      volumeLoad: 3300,
      progressionEarned: true,
      nextRecommendedLoad: 102.5,
      loadIncrement: 2.5,
      loadIncrementSource: "session_settings",
      equipment: ["barbell"],
    });
  });

  it("preserves training-week identity for restore and current-week progression", () => {
    const summary = summarizeWorkoutSession({
      ...completedSession,
      planSessionIndex: 2,
      planBlockId: "block-hypertrophy-1",
      planWeekNumber: 3,
      sessionKind: "planned",
    });

    expect(summary).toMatchObject({
      planSessionIndex: 2,
      planBlockId: "block-hypertrophy-1",
      planWeekNumber: 3,
      sessionKind: "planned",
    });
  });

  it("filters by exercise, programme, and date range", () => {
    const summary = summarizeWorkoutSession(completedSession)!;

    expect(filterWorkoutHistory([summary], { exerciseId: "ex-bench-press" })).toHaveLength(1);
    expect(filterWorkoutHistory([summary], { programmeId: "programme-1" })).toHaveLength(1);
    expect(filterWorkoutHistory([summary], { fromDate: "2026-06-02" })).toHaveLength(0);
  });

  it("returns previous exercise performance excluding the current session", () => {
    const currentSession = { ...completedSession, id: "session-2", completedAt: undefined };
    const previous = getLastExercisePerformance([completedSession, currentSession], "session-2", "ex-bench-press");

    expect(previous?.load).toBe(100);
    expect(previous?.bestSetReps).toBe(12);
    expect(previous?.progressionEarned).toBe(true);
  });

  it("uses the actual logged load for each set when load changes mid-exercise", () => {
    const changedLoadSession: WorkoutSession = {
      ...completedSession,
      exercises: [
        {
          ...completedSession.exercises[0],
          load: 105,
          sets: [
            { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-01T10:05:00.000Z" },
            { id: "set-2", setNumber: 2, reps: 10, load: 105, loggedAt: "2026-06-01T10:10:00.000Z" },
            { id: "set-3", setNumber: 3, reps: 9, load: 105, loggedAt: "2026-06-01T10:15:00.000Z" },
          ],
        },
      ],
    };

    const summary = summarizeWorkoutSession(changedLoadSession)!;

    expect(summary.totalLoadVolume).toBe(12 * 100 + 10 * 105 + 9 * 105);
    expect(summary.exerciseSummaries[0].volumeLoad).toBe(3195);
    expect(changedLoadSession.exercises[0].sets.map((set) => set.load)).toEqual([100, 105, 105]);
  });

  it("does not punish productive high-rep isolation progression after a load increase", () => {
    const spiderCurl = exerciseLibrary.find((exercise) => exercise.id === "ex-spider-curl")!;
    const spiderSession: WorkoutSession = {
      ...completedSession,
      id: "spider-curl-progression",
      exercises: [
        {
          ...completedSession.exercises[0],
          id: "performed-spider-curl",
          exerciseId: spiderCurl.id,
          exerciseName: spiderCurl.name,
          load: 10,
          settings: {
            ...spiderCurl.defaultSettings,
            repRange: { min: 12, max: 25 },
            requiredWorkSets: 2,
            loadIncrease: 5,
          },
          status: "active",
          sets: [
            { id: "set-1", setNumber: 1, reps: 25, load: 5, type: "work", loggedAt: "2026-06-01T10:05:00.000Z" },
            { id: "set-2", setNumber: 2, reps: 25, load: 5, type: "work", loggedAt: "2026-06-01T10:10:00.000Z" },
            { id: "set-3", setNumber: 3, reps: 25, load: 5, type: "work", loggedAt: "2026-06-01T10:15:00.000Z" },
            { id: "set-4", setNumber: 4, reps: 20, load: 10, type: "work", loggedAt: "2026-06-01T10:20:00.000Z" },
            { id: "set-5", setNumber: 5, reps: 16, load: 10, type: "work", loggedAt: "2026-06-01T10:25:00.000Z" },
          ],
        },
      ],
    };

    const summary = summarizeWorkoutSession(spiderSession)!;
    const spiderSummary = summary.exerciseSummaries[0]!;

    expect(spiderSummary.stoppedByDropOff).toBe(false);
    expect(spiderSummary.qualitySets).toBe(5);
    expect(spiderSummary.progressionEarned).toBe(false);
    expect(spiderSummary.nextRecommendedLoad).toBe(10);
    expect(spiderSummary.notes ?? "").not.toMatch(/too demanding|reduce|shutdown|dropped/i);
  });

  it("excludes warm-up sets from progression, drop-off, and work volume summaries", () => {
    const warmupSession: WorkoutSession = {
      ...completedSession,
      exercises: [
        {
          ...completedSession.exercises[0],
          load: 100,
          sets: [
            { id: "warmup-1", setNumber: 1, reps: 8, load: 40, type: "warmup", loggedAt: "2026-06-01T10:01:00.000Z" },
            { id: "warmup-2", setNumber: 2, reps: 5, load: 70, type: "warmup", loggedAt: "2026-06-01T10:03:00.000Z" },
            { id: "work-1", setNumber: 1, reps: 12, load: 100, type: "work", loggedAt: "2026-06-01T10:05:00.000Z" },
            { id: "work-2", setNumber: 2, reps: 11, load: 100, type: "work", loggedAt: "2026-06-01T10:10:00.000Z" },
            { id: "work-3", setNumber: 3, reps: 10, load: 100, type: "work", loggedAt: "2026-06-01T10:15:00.000Z" },
          ],
        },
      ],
    };

    const summary = summarizeWorkoutSession(warmupSession)!;

    expect(warmupSession.exercises[0].sets.filter((set) => set.type === "warmup")).toHaveLength(2);
    expect(summary.setsCompleted).toBe(3);
    expect(summary.repsCompleted).toBe(33);
    expect(summary.totalLoadVolume).toBe(3300);
    expect(summary.exerciseSummaries[0].bestSetReps).toBe(12);
    expect(summary.exerciseSummaries[0].progressionEarned).toBe(true);
  });

  it("saves warm-up-only sessions without creating work-set coaching evidence", () => {
    const warmupOnlySession: WorkoutSession = {
      ...completedSession,
      id: "warmup-only-session",
      exercises: [
        {
          ...completedSession.exercises[0],
          load: 60,
          sets: [
            { id: "warmup-1", setNumber: 1, reps: 15, load: 40, type: "warmup", loggedAt: "2026-06-01T10:01:00.000Z" },
            { id: "warmup-2", setNumber: 2, reps: 12, load: 60, type: "warmup", loggedAt: "2026-06-01T10:03:00.000Z" },
          ],
        },
      ],
    };

    const summary = summarizeWorkoutSession(warmupOnlySession)!;

    expect(warmupOnlySession.exercises[0].sets).toHaveLength(2);
    expect(summary.exerciseSummaries[0].setsCompleted).toBe(0);
    expect(summary.exerciseSummaries[0].qualitySets).toBe(0);
    expect(summary.exerciseSummaries[0].volumeLoad).toBe(0);
    expect(summary.exerciseSummaries[0].progressionEarned).toBe(false);
    expect(summary.exerciseSummaries[0].stoppedByDropOff).toBe(false);
    expect(summary.setsCompleted).toBe(0);
    expect(summary.repsCompleted).toBe(0);
    expect(summary.totalLoadVolume).toBe(0);
    expect(summary.progressionHighlights).toEqual([]);
  });

  it("persists cardio logs without creating lifting progression evidence", () => {
    const cardioSession: WorkoutSession = {
      ...completedSession,
      id: "cardio-session",
      name: "Recovery Cardio",
      sessionKind: "recovery_cardio",
      exercises: [
        {
          ...completedSession.exercises[0],
          exerciseId: "ex-recovery-cardio",
          exerciseName: "Recovery Cardio",
          sets: [],
        },
      ],
      cardioLog: {
        sessionType: "recovery_cardio",
        modality: "incline_walk",
        durationMinutes: 20,
        perceivedEase: "easy",
        notes: "Felt better after.",
        loggedAt: "2026-06-01T10:25:00.000Z",
      },
    };

    const summary = summarizeWorkoutSession(cardioSession)!;

    expect(summary.cardioLog).toMatchObject({ sessionType: "recovery_cardio", durationMinutes: 20 });
    expect(summary.exerciseSummaries).toEqual([]);
    expect(summary.exercisesCompleted).toBe(0);
    expect(summary.setsCompleted).toBe(0);
    expect(summary.progressionHighlights).toEqual([]);
  });

  it("marks exercises added during the workout in history summaries", () => {
    const addedSession: WorkoutSession = {
      ...completedSession,
      exercises: [
        {
          ...completedSession.exercises[0],
          origin: "added_during_workout",
        },
      ],
    };

    const summary = summarizeWorkoutSession(addedSession)!;

    expect(summary.exerciseSummaries[0].addedDuringWorkout).toBe(true);
  });

  it("uses real completed history to create severity-banded rounded-down reduced-load recommendations after repeated decline", () => {
    const sessions = [
      decliningBenchSession(1, "2026-06-01T10:00:00.000Z", [10, 8]),
      decliningBenchSession(2, "2026-06-04T10:00:00.000Z", [9, 7]),
      decliningBenchSession(3, "2026-06-08T10:00:00.000Z", [8, 6]),
    ];

    const summaries = summarizeWorkoutHistory(sessions);
    const latestBench = summaries[0].exerciseSummaries[0];

    expect(latestBench.nextRecommendedLoad).toBe(90);
    expect(latestBench.nextRecommendedLoad).toBeLessThan(latestBench.load);
    expect(latestBench.notes).toContain("current load is too demanding");
  });

  it("does not reduce load in real history after one bad exposure", () => {
    const sessions = [
      decliningBenchSession(1, "2026-06-01T10:00:00.000Z", [12, 11, 10], "complete"),
      decliningBenchSession(2, "2026-06-04T10:00:00.000Z", [8, 4]),
    ];

    const summaries = summarizeWorkoutHistory(sessions);
    const latestBench = summaries[0].exerciseSummaries[0];

    expect(latestBench.nextRecommendedLoad).toBe(100);
    expect(latestBench.notes ?? "").not.toContain("current load is too demanding");
  });

  it("feeds reduced exact-history loads into the real starting-load resolver", () => {
    const targetExercise = exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!;
    const history = summarizeWorkoutHistory([
      decliningBenchSession(1, "2026-06-01T10:00:00.000Z", [10, 8]),
      decliningBenchSession(2, "2026-06-04T10:00:00.000Z", [9, 7]),
      decliningBenchSession(3, "2026-06-08T10:00:00.000Z", [8, 6]),
    ]);

    const recommendation = resolveStartingLoadRecommendation({
      targetExercise,
      exercises: exerciseLibrary,
      history,
      repRange: defaultHypertrophySettings.repRange,
      loadIncrement: 2.5,
      referenceDate: new Date("2026-06-09T12:00:00.000Z"),
    });

    expect(recommendation.source).toBe("exact_history");
    expect(recommendation.load).toBe(90);
  });

  it("uses stored load increment metadata for historical reductions when present", () => {
    const sessions = [
      decliningBenchSession(1, "2026-06-01T10:00:00.000Z", [10, 8], "shutdown", 5),
      decliningBenchSession(2, "2026-06-04T10:00:00.000Z", [9, 7], "shutdown", 5),
      decliningBenchSession(3, "2026-06-08T10:00:00.000Z", [8, 6], "shutdown", 5),
    ];

    const summaries = summarizeWorkoutHistory(sessions);
    const latestBench = summaries[0].exerciseSummaries[0];

    expect(latestBench.loadIncrement).toBe(5);
    expect(latestBench.nextRecommendedLoad % 5).toBe(0);
    expect(latestBench.nextRecommendedLoad).toBeLessThan(latestBench.load);
  });
});

function decliningBenchSession(
  index: number,
  startedAt: string,
  reps: number[],
  status: WorkoutSession["exercises"][number]["status"] = "shutdown",
  loadIncrease = 2.5,
): WorkoutSession {
  const started = new Date(startedAt);
  const completed = new Date(started.getTime() + 45 * 60 * 1000);
  return {
    ...completedSession,
    id: `decline-session-${index}`,
    startedAt: started.toISOString(),
    completedAt: completed.toISOString(),
    updatedAt: completed.toISOString(),
    exercises: [
      {
        ...completedSession.exercises[0],
        id: `decline-bench-${index}`,
        settings: { ...completedSession.exercises[0]!.settings, loadIncrease },
        status,
        shutdownReason: status === "shutdown" ? "Performance dropped below target." : undefined,
        sets: reps.map((setReps, setIndex) => ({
          id: `decline-${index}-${setIndex + 1}`,
          setNumber: setIndex + 1,
          reps: setReps,
          load: 100,
          type: "work",
          loggedAt: new Date(started.getTime() + (setIndex + 1) * 5 * 60 * 1000).toISOString(),
        })),
      },
    ],
  };
}
