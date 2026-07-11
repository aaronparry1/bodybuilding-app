import { describe, expect, it } from "vitest";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { detectPersonalRecords } from "@/domain/training/personal-records";
import { defaultHypertrophySettings } from "@/domain/training/presets";

const settings = { ...defaultHypertrophySettings, requiredWorkSets: 3 };

describe("personal records", () => {
  it("marks first exposure as baseline instead of spammy PRs", () => {
    const records = detectPersonalRecords({
      sessions: [completedSession("first", [exercise("bench-press", "Bench Press", "ex-bench-press", 100, [8, 8, 8])])],
      currentSessionId: "first",
      includeBaselines: true,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.length).toBeGreaterThan(0);
    expect(records.every((record) => record.status === "baseline")).toBe(true);
  });

  it("detects load, rep, e1RM, and volume PRs after previous history exists", () => {
    const records = detectPersonalRecords({
      sessions: [
        completedSession("baseline", [exercise("bench-press", "Bench Press", "ex-bench-press", 100, [5, 5, 5])], "2026-06-01T12:00:00.000Z"),
        completedSession("current", [exercise("bench-press", "Bench Press", "ex-bench-press", 105, [6, 5, 5])], "2026-06-13T12:00:00.000Z"),
      ],
      currentSessionId: "current",
      includeBaselines: true,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.some((record) => record.status === "pr" && record.type === "load")).toBe(true);
    expect(records.some((record) => record.status === "pr" && record.type === "rep")).toBe(true);
    expect(records.some((record) => record.status === "pr" && record.type === "e1rm")).toBe(true);
    expect(records.some((record) => record.status === "pr" && record.type === "volume")).toBe(true);
  });

  it("ignores warm-ups and absent deleted rows", () => {
    const current = exercise("bench-press", "Bench Press", "ex-bench-press", 100, [5, 5]);
    const records = detectPersonalRecords({
      sessions: [
        completedSession("baseline", [exercise("bench-press", "Bench Press", "ex-bench-press", 100, [5, 5])], "2026-06-01T12:00:00.000Z"),
        completedSession(
          "current",
          [
            {
              ...current,
              removedFutureWorkSetNumbers: [3],
              sets: [
                { id: "warmup-big", setNumber: 1, reps: 20, load: 200, loggedAt: "2026-06-13T10:00:00.000Z", type: "warmup" },
                ...current.sets,
              ],
            },
          ],
          "2026-06-13T12:00:00.000Z",
        ),
      ],
      currentSessionId: "current",
      includeBaselines: false,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.some((record) => record.value === 200)).toBe(false);
    expect(records).toHaveLength(0);
  });

  it("deduplicates repeated achievements for the same exercise in one workout", () => {
    const records = detectPersonalRecords({
      sessions: [
        completedSession("baseline", [exercise("curl", "Cable Curl", "ex-cable-curl", 20, [10, 10, 10])], "2026-06-01T12:00:00.000Z"),
        completedSession("current", [exercise("curl", "Cable Curl", "ex-cable-curl", 20, [12, 12, 12])], "2026-06-13T12:00:00.000Z"),
      ],
      currentSessionId: "current",
      includeBaselines: false,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.filter((record) => record.type === "rep")).toHaveLength(1);
  });

  it("handles bodyweight exercises sensibly by surfacing rep PRs, not fake load PRs", () => {
    const records = detectPersonalRecords({
      sessions: [
        completedSession("baseline", [exercise("pull-up", "Pull-Up", "ex-pull-up", 0, [6, 6, 6])], "2026-06-01T12:00:00.000Z"),
        completedSession("current", [exercise("pull-up", "Pull-Up", "ex-pull-up", 0, [8, 7, 6])], "2026-06-13T12:00:00.000Z"),
      ],
      currentSessionId: "current",
      includeBaselines: false,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.some((record) => record.type === "rep" && record.status === "pr")).toBe(true);
    expect(records.some((record) => record.type === "load")).toBe(false);
  });

  it("marks primary-lift e1RM records with primary lift scope", () => {
    const records = detectPersonalRecords({
      sessions: [
        completedSession("baseline", [exercise("deadlift", "Deadlift", "ex-deadlift", 180, [3, 3, 3])], "2026-06-01T12:00:00.000Z"),
        completedSession("current", [exercise("deadlift", "Deadlift", "ex-deadlift", 185, [5, 4, 4])], "2026-06-13T12:00:00.000Z"),
      ],
      currentSessionId: "current",
      includeBaselines: false,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(records.some((record) => record.type === "e1rm" && record.scope === "primary_lift")).toBe(true);
  });
});

function completedSession(id: string, exercises: WorkoutExerciseLog[], completedAt = "2026-06-13T12:00:00.000Z"): WorkoutSession {
  return {
    id,
    userId: null,
    name: "Test Workout",
    startedAt: completedAt,
    completedAt,
    updatedAt: completedAt,
    syncState: "local",
    exercises,
  };
}

function exercise(id: string, name: string, exerciseId: string, load: number, reps: number[]): WorkoutExerciseLog {
  return {
    id,
    exerciseId,
    exerciseName: name,
    settings,
    load,
    loadKnown: true,
    status: "complete",
    sets: reps.map((repCount, index) => ({
      id: `${id}-set-${index + 1}`,
      setNumber: index + 1,
      reps: repCount,
      load,
      loggedAt: "2026-06-13T10:00:00.000Z",
      type: "work",
    })),
  };
}
