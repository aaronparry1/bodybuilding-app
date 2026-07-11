import { describe, expect, it } from "vitest";
import { buildStrengthDashboard, calculateConservativeE1rm, calculateStrengthTrend } from "@/domain/training/strength-dashboard";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { defaultHypertrophySettings } from "@/domain/training/presets";

describe("strength dashboard", () => {
  it("calculates conservative e1RM without requiring max testing", () => {
    expect(calculateConservativeE1rm(100, 5)).toBe(113.9);
    expect(calculateConservativeE1rm(100, 12)).toBe(127.8);
    expect(calculateConservativeE1rm(100, 13)).toBeNull();
    expect(calculateConservativeE1rm(0, 5)).toBeNull();
  });

  it("builds primary lift e1RM cards from completed work sets only", () => {
    const dashboard = buildStrengthDashboard({
      now: "2026-06-13T12:00:00.000Z",
      sessions: [
        session("old", "2026-04-01T12:00:00.000Z", [exercise("ex-bench-press", "Bench Press", [work(1, 100, 5)])]),
        session("recent", "2026-06-06T12:00:00.000Z", [
          exercise("ex-bench-press", "Bench Press", [warmup(1, 60, 5), work(2, 105, 5), work(3, 110, 13)]),
        ]),
      ],
    });

    const bench = dashboard.primaryLifts.find((lift) => lift.liftId === "bench_press");
    expect(bench?.currentE1rm).toBe(119.6);
    expect(bench?.bestE1rm).toBe(119.6);
    expect(bench?.change30Day).toBe(5.7);
    expect(bench?.evidence).toBe("105kg x 5");
  });

  it("calculates strength trends from recent evidence", () => {
    expect(
      calculateStrengthTrend([
        { completedAt: "2026-04-01T00:00:00.000Z", e1rm: 100 },
        { completedAt: "2026-04-08T00:00:00.000Z", e1rm: 101 },
        { completedAt: "2026-05-01T00:00:00.000Z", e1rm: 106 },
        { completedAt: "2026-05-08T00:00:00.000Z", e1rm: 108 },
      ]),
    ).toBe("up");
    expect(
      calculateStrengthTrend([
        { completedAt: "2026-04-01T00:00:00.000Z", e1rm: 110 },
        { completedAt: "2026-05-08T00:00:00.000Z", e1rm: 106 },
      ]),
    ).toBe("down");
    expect(
      calculateStrengthTrend([
        { completedAt: "2026-04-01T00:00:00.000Z", e1rm: 110 },
        { completedAt: "2026-05-08T00:00:00.000Z", e1rm: 111 },
      ]),
    ).toBe("stable");
  });

  it("detects recent load, rep, and e1RM PRs", () => {
    const dashboard = buildStrengthDashboard({
      now: "2026-06-13T12:00:00.000Z",
      sessions: [
        session("baseline", "2026-05-01T12:00:00.000Z", [exercise("ex-bench-press", "Bench Press", [work(1, 100, 5)])]),
        session("prs", "2026-06-01T12:00:00.000Z", [exercise("ex-bench-press", "Bench Press", [work(1, 102.5, 6)])]),
      ],
    });

    expect(dashboard.recentPrs.some((pr) => pr.type === "load" && pr.exerciseName === "Bench Press")).toBe(true);
    expect(dashboard.recentPrs.some((pr) => pr.type === "rep" && pr.exerciseName === "Bench Press")).toBe(true);
    expect(dashboard.recentPrs.some((pr) => pr.type === "e1rm" && pr.exerciseName === "Bench Press")).toBe(true);
  });

  it("adds a Powerlifting Meet total from squat, bench, and deadlift", () => {
    const dashboard = buildStrengthDashboard({
      goal: "powerlifting_meet",
      now: "2026-06-13T12:00:00.000Z",
      sessions: [
        session("sbd", "2026-06-01T12:00:00.000Z", [
          exercise("ex-bench-press", "Bench Press", [work(1, 100, 5)]),
          exercise("ex-barbell-back-squat", "Barbell Back Squat", [work(1, 150, 5)]),
          exercise("ex-deadlift", "Deadlift", [work(1, 180, 5)]),
        ]),
      ],
    });

    expect(dashboard.powerliftingTotal?.currentTotal).toBe(489.7);
    expect(dashboard.powerliftingTotal?.bestTotal).toBe(489.7);
  });

  it("does not show a meet total for non-meet goals", () => {
    const dashboard = buildStrengthDashboard({
      goal: "build_strength",
      sessions: [session("bench", "2026-06-01T12:00:00.000Z", [exercise("ex-bench-press", "Bench Press", [work(1, 100, 5)])])],
    });

    expect(dashboard.powerliftingTotal).toBeNull();
  });

  it("ignores deleted rows and warm-ups because only present work sets are evidence", () => {
    const deletedSetIsAbsent = session("deleted", "2026-06-01T12:00:00.000Z", [
      {
        ...exercise("ex-bench-press", "Bench Press", [warmup(1, 90, 5), work(2, 100, 5)]),
        removedFutureWorkSetNumbers: [3],
      },
    ]);
    const dashboard = buildStrengthDashboard({ now: "2026-06-13T12:00:00.000Z", sessions: [deletedSetIsAbsent] });
    const bench = dashboard.primaryLifts.find((lift) => lift.liftId === "bench_press");

    expect(bench?.currentE1rm).toBe(113.9);
    expect(bench?.evidence).toBe("100kg x 5");
  });
});

function session(id: string, completedAt: string, exercises: WorkoutExerciseLog[]): WorkoutSession {
  return {
    id,
    name: "Strength QA",
    startedAt: completedAt,
    completedAt,
    updatedAt: completedAt,
    exercises,
    syncState: "local",
  };
}

function exercise(exerciseId: string, exerciseName: string, sets: SetLog[]): WorkoutExerciseLog {
  return {
    id: `${exerciseId}-${Math.random().toString(16).slice(2)}`,
    exerciseId,
    exerciseName,
    load: sets.find((set) => set.type !== "warmup")?.load ?? 0,
    loadKnown: true,
    settings: { ...defaultHypertrophySettings, unit: "kg", loadIncrease: 2.5, repRange: { min: 3, max: 6 } },
    sets,
    status: "complete",
  };
}

function work(setNumber: number, load: number, reps: number): SetLog {
  return { id: `work-${setNumber}-${load}-${reps}`, setNumber, load, reps, type: "work", loggedAt: "2026-06-01T12:00:00.000Z" };
}

function warmup(setNumber: number, load: number, reps: number): SetLog {
  return { id: `warmup-${setNumber}-${load}-${reps}`, setNumber, load, reps, type: "warmup", loggedAt: "2026-06-01T12:00:00.000Z" };
}
