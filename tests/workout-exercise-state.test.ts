import { describe, expect, it } from "vitest";
import type { WorkoutExerciseLog } from "@/domain/training/models";
import { canReopenExercise, reopenExercise } from "@/domain/training/workout-exercise-state";
import { defaultHypertrophySettings } from "@/domain/training/presets";

function exercise(status: WorkoutExerciseLog["status"]): WorkoutExerciseLog {
  return {
    id: `exercise-${status}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    settings: defaultHypertrophySettings,
    load: 100,
    loadKnown: true,
    sets: [{ id: "set-1", setNumber: 1, reps: 12, load: 100, type: "work", loggedAt: "2026-06-03T10:00:00.000Z" }],
    status,
    shutdownReason: status === "shutdown" ? "Performance dropped below threshold." : undefined,
  };
}

describe("workout exercise reopen state", () => {
  it("allows manually completed exercises to reopen easily", () => {
    const completed = exercise("complete");
    const reopened = reopenExercise(completed);

    expect(canReopenExercise(completed)).toBe(true);
    expect(reopened.status).toBe("active");
    expect(reopened.shutdownReason).toBeUndefined();
  });

  it("keeps drop-off shutdown protected unless explicitly reopened", () => {
    const shutdown = exercise("shutdown");

    expect(canReopenExercise(shutdown)).toBe(false);
    expect(reopenExercise(shutdown)).toBe(shutdown);
    expect(canReopenExercise(shutdown, { allowShutdown: true })).toBe(true);
    expect(reopenExercise(shutdown, { allowShutdown: true })).toMatchObject({
      status: "active",
      shutdownReason: "Reopened after drop-off shutdown. Use this only when the previous set was logged incorrectly.",
    });
  });
});
