import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { buildAdvancedReports } from "@/domain/training/advanced-reporting";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { defaultHypertrophySettings, exerciseLibrary } from "@/domain/training/presets";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";

const settings = { ...defaultHypertrophySettings, requiredWorkSets: 3 };

describe("advanced reporting", () => {
  it("builds a Strength Report from primary lift history", () => {
    const sessions = [
      completedSession("old", "Push", "2026-05-01T12:00:00.000Z", [exercise("bench-old", "ex-bench-press", "Bench Press", 100, [5, 5, 5])]),
      completedSession("new", "Push", "2026-06-10T12:00:00.000Z", [exercise("bench-new", "ex-bench-press", "Bench Press", 110, [5, 5, 5])]),
    ];
    const reports = buildAdvancedReports({
      sessions,
      history: summarizeWorkoutHistory(sessions),
      exercises: exerciseLibrary,
      activePlan: plan(),
      date: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(reports.strength.title).toBe("Strength Report");
    expect(reports.strength.headline).toBe("Strength is trending up.");
    expect(reports.strength.details.some((detail) => detail.includes("Bench Press"))).toBe(true);
  });

  it("builds a Volume Report while excluding warm-ups, cardio, and removed future rows", () => {
    const bench = exercise("bench", "ex-bench-press", "Bench Press", 100, [10, 10, 10], [{ load: 140, reps: 30 }]);
    const sessions = [
      completedSession("lifting", "Push", "2026-06-10T12:00:00.000Z", [{ ...bench, removedFutureWorkSetNumbers: [4, 5] }]),
      cardioSession("cardio", "2026-06-11T12:00:00.000Z", "recovery_cardio"),
    ];
    const reports = buildAdvancedReports({
      sessions,
      history: summarizeWorkoutHistory(sessions),
      exercises: exerciseLibrary,
      activePlan: plan(),
      date: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(reports.volume.title).toBe("Volume Report");
    expect(reports.volume.keyMetric).toBe("3 productive sets this week");
    expect(reports.volume.keyMetric).not.toContain("4");
    expect(reports.volume.details.join(" ")).toContain("Chest");
  });

  it("builds a Recovery & Capacity Report from cardio logs and weekly targets", () => {
    const activePlan = plan("get_leaner");
    const sessions = [
      completedSession("upper", "Upper", "2026-06-09T12:00:00.000Z", [exercise("bench", "ex-bench-press", "Bench Press", 100, [10, 10, 10])]),
      completedSession("lower", "Lower", "2026-06-10T12:00:00.000Z", [exercise("squat", "ex-back-squat", "Back Squat", 120, [8, 8, 8])]),
      completedSession("pull", "Pull", "2026-06-11T12:00:00.000Z", [exercise("row", "ex-chest-supported-row", "Chest-Supported Row", 80, [10, 10, 10])]),
      cardioSession("recovery", "2026-06-10T12:00:00.000Z", "recovery_cardio"),
    ];
    const reports = buildAdvancedReports({
      sessions,
      history: summarizeWorkoutHistory(sessions),
      exercises: exerciseLibrary,
      activePlan,
      date: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(reports.recovery.title).toBe("Recovery & Capacity Report");
    expect(reports.recovery.details.some((detail) => detail.includes("Recovery sessions: 1"))).toBe(true);
  });

  it("builds a Consistency Report from planned workout completion", () => {
    const activePlan = plan("build_muscle_and_strength", 4);
    const sessions = [
      { ...completedSession("planned-1", "Upper", "2026-06-09T12:00:00.000Z", [exercise("bench", "ex-bench-press", "Bench Press", 100, [10, 10, 10])]), sessionKind: "planned" as const, planSessionIndex: 0 },
      { ...completedSession("extra", "Extra Upper", "2026-06-10T12:00:00.000Z", [exercise("row", "ex-chest-supported-row", "Chest-Supported Row", 80, [10, 10, 10])]), sessionKind: "extra_volume" as const },
    ];
    const reports = buildAdvancedReports({
      sessions,
      history: summarizeWorkoutHistory(sessions),
      exercises: exerciseLibrary,
      activePlan,
      date: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(reports.consistency.title).toBe("Consistency Report");
    expect(reports.consistency.workoutsThisWeek).toBe(2);
    expect(reports.consistency.plannedCompletedThisWeek).toBe(1);
    expect(reports.consistency.plannedTargetThisWeek).toBe(4);
    expect(reports.consistency.detail).toContain("Missed sessions happen");
  });

  it("uses building-data copy when history is insufficient", () => {
    const reports = buildAdvancedReports({
      sessions: [],
      history: [],
      exercises: exerciseLibrary,
      activePlan: plan(),
      date: new Date("2026-06-13T12:00:00.000Z"),
    });

    expect(reports.strength.headline).toContain("building");
    expect(reports.volume.headline).toContain("building");
    expect(reports.recovery.headline).toContain("building");
    expect(reports.consistency.headline).toContain("building");
  });
});

function plan(goal = "build_muscle_and_strength", daysPerWeek = 4) {
  return createActiveTrainingPlan(
    {
      goal: goal as Parameters<typeof createActiveTrainingPlan>[0]["goal"],
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
      recoveryCardioPreference: "recommended",
    },
    "2026-06-01T00:00:00.000Z",
  );
}

function completedSession(id: string, name: string, completedAt: string, exercises: WorkoutExerciseLog[]): WorkoutSession {
  return {
    id,
    userId: null,
    name,
    startedAt: "2026-06-13T10:00:00.000Z",
    completedAt,
    updatedAt: completedAt,
    syncState: "local",
    sessionKind: "planned",
    exercises,
  };
}

function cardioSession(id: string, completedAt: string, sessionType: NonNullable<WorkoutSession["cardioLog"]>["sessionType"]): WorkoutSession {
  return {
    id,
    userId: null,
    name: "Recovery Cardio",
    startedAt: completedAt,
    completedAt,
    updatedAt: completedAt,
    syncState: "local",
    sessionKind: sessionType,
    exercises: [],
    cardioLog: {
      sessionType,
      modality: "outdoor_walk",
      durationMinutes: 25,
      perceivedEase: "easy",
      loggedAt: completedAt,
    },
  };
}

function exercise(id: string, exerciseId: string, exerciseName: string, load: number, reps: number[], warmups: Array<{ load: number; reps: number }> = []): WorkoutExerciseLog {
  return {
    id,
    exerciseId,
    exerciseName,
    settings,
    load,
    loadKnown: true,
    status: "complete",
    sets: [
      ...warmups.map((set, index): SetLog => ({
        id: `${id}-warmup-${index}`,
        setNumber: index + 1,
        load: set.load,
        reps: set.reps,
        loggedAt: "2026-06-13T10:00:00.000Z",
        type: "warmup",
      })),
      ...reps.map((repCount, index): SetLog => ({
        id: `${id}-work-${index}`,
        setNumber: index + 1,
        load,
        reps: repCount,
        loggedAt: "2026-06-13T10:10:00.000Z",
        type: "work",
      })),
    ],
  };
}
