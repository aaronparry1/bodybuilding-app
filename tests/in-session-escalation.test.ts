import { describe, expect, it } from "vitest";
import { applyInSessionEscalationToFuturePrescription, hasFutureUncompletedWorkSetAfterLog } from "@/domain/training/in-session-escalation";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { defaultHypertrophySettings } from "@/domain/training/presets";

function workSet(id: string, setNumber: number, load: number, reps: number): SetLog {
  return {
    id,
    setNumber,
    load,
    reps,
    type: "work",
    loggedAt: `2026-06-08T10:0${setNumber}:00.000Z`,
  };
}

function warmupSet(id: string, setNumber: number, load: number, reps: number): SetLog {
  return {
    id,
    setNumber,
    load,
    reps,
    type: "warmup",
    loggedAt: `2026-06-08T09:5${setNumber}:00.000Z`,
  };
}

function exercise(id: string, name: string, load: number, sets: SetLog[]): WorkoutExerciseLog {
  return {
    id,
    exerciseId: `ex-${id}`,
    exerciseName: name,
    settings: defaultHypertrophySettings,
    load,
    loadKnown: true,
    sets,
    status: "active",
    origin: "planned",
  };
}

function session(): WorkoutSession {
  return {
    id: "session-escalation",
    userId: "guest-local",
    name: "Push",
    startedAt: "2026-06-08T10:00:00.000Z",
    updatedAt: "2026-06-08T10:00:00.000Z",
    syncState: "local",
    exercises: [
      exercise("bench-log", "Bench Press", 100, [
        warmupSet("warmup-1", 1, 60, 8),
        workSet("work-1", 1, 100, 12),
        workSet("work-2", 2, 100, 12),
        workSet("work-3", 3, 100, 12),
      ]),
      exercise("row-log", "Chest Supported Row", 80, [
        workSet("row-1", 1, 80, 10),
      ]),
    ],
  };
}

describe("in-session escalation application", () => {
  it("only allows an in-session prompt when a future work row remains after logging", () => {
    expect(hasFutureUncompletedWorkSetAfterLog(3, 6)).toBe(true);
    expect(hasFutureUncompletedWorkSetAfterLog(5, 6)).toBe(false);
    expect(hasFutureUncompletedWorkSetAfterLog(2, 3)).toBe(false);
  });

  it("accepting escalation updates only the target exercise future prescription", () => {
    const base = session();
    const updated = applyInSessionEscalationToFuturePrescription(base, 0, 102.5);

    expect(updated.exercises[0]).toMatchObject({ load: 102.5, loadKnown: true });
    expect(updated.exercises[0].sets).toEqual(base.exercises[0].sets);
    expect(updated.exercises[0].sets.map((set) => set.load)).toEqual([60, 100, 100, 100]);
    expect(updated.exercises[0].sets.map((set) => set.type)).toEqual(["warmup", "work", "work", "work"]);
    expect(updated.exercises[1]).toEqual(base.exercises[1]);
  });

  it("rejected escalation leaves future prescriptions and logged rows unchanged", () => {
    const base = session();

    expect(base.exercises[0].load).toBe(100);
    expect(base.exercises[0].sets.map((set) => set.load)).toEqual([60, 100, 100, 100]);
    expect(base.exercises[1].load).toBe(80);
  });

  it("does not apply escalation to completed workouts or inactive exercises", () => {
    const completed = { ...session(), completedAt: "2026-06-08T11:00:00.000Z" };
    const inactive = {
      ...session(),
      exercises: [{ ...session().exercises[0]!, status: "complete" as const }, session().exercises[1]!],
    };

    expect(applyInSessionEscalationToFuturePrescription(completed, 0, 102.5)).toBe(completed);
    expect(applyInSessionEscalationToFuturePrescription(inactive, 0, 102.5)).toBe(inactive);
  });
});
