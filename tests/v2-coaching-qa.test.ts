import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildV2CoachingQaOutput } from "@/domain/training/v2-coaching-qa";
import type { SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

describe("V2 coaching QA simulator wiring", () => {
  it("returns nothing when the QA flag is off", () => {
    const { session, exercise, metadata } = fixtureSession();

    expect(
      buildV2CoachingQaOutput({
        enabled: false,
        session,
        exercise,
        exerciseIndex: 0,
        metadata,
      }),
    ).toBeNull();
  });

  it("returns compact V2 QA chips when the QA flag is on", () => {
    const { session, exercise, metadata } = fixtureSession();

    const output = buildV2CoachingQaOutput({
      enabled: true,
      session,
      exercise,
      exerciseIndex: 0,
      metadata,
    });

    expect(output?.chips.exercise).toBe(metadata.name);
    expect(output?.chips.stimulus).toBeTruthy();
    expect(output?.chips.cycle).toBeTruthy();
    expect(output?.chips.intent).toContain("/");
    expect(output?.chips.reps).toBeTruthy();
    expect(output?.chips.load).toBeTruthy();
    expect(output?.chips.sets).toBeTruthy();
    expect(output?.confidence).toBeGreaterThan(0);
  });

  it("does not alter saved workout data or V1 prescription fields", () => {
    const { session, exercise, metadata } = fixtureSession();
    const before = JSON.stringify(session);

    buildV2CoachingQaOutput({
      enabled: true,
      session,
      exercise,
      exerciseIndex: 0,
      metadata,
    });

    expect(JSON.stringify(session)).toBe(before);
    expect(session.exercises[0]?.settings.repRange).toEqual({ min: 8, max: 12 });
    expect(session.exercises[0]?.load).toBe(80);
  });

  it("handles unsupported exercises as low-confidence fallback safely", () => {
    const { session } = fixtureSession();
    const unsupportedExercise: WorkoutExerciseLog = {
      ...session.exercises[0]!,
      id: "exercise-unsupported",
      exerciseId: "custom-unsupported",
      exerciseName: "Mystery Lift",
      loadKnown: false,
      load: 0,
      sets: [],
    };
    const unsupportedSession: WorkoutSession = { ...session, exercises: [unsupportedExercise] };

    const output = buildV2CoachingQaOutput({
      enabled: true,
      session: unsupportedSession,
      exercise: unsupportedExercise,
      exerciseIndex: 0,
    });

    expect(output?.loadPrescription.load_action).not.toBe("increase_load");
    expect(output?.confidence).toBeLessThan(75);
  });

  it("does not render the QA panel in the live Train screen", () => {
    const source = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");

    expect(source).not.toContain("V2CoachingQaPanel");
    expect(source).not.toContain("V2 QA");
    expect(source).not.toContain('label="Stimulus"');
  });

  it("does not use network APIs in the QA computation module", () => {
    const source = readFileSync("src/domain/training/v2-coaching-qa.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain("syncLocalDataForUser");
    expect(source).not.toContain("workoutSessionRepository.save");
  });
});

function fixtureSession() {
  const metadata = exerciseLibrary.find((candidate) => candidate.id === "ex-machine-chest-press")!;
  const exercise: WorkoutExerciseLog = {
    id: "workout-exercise-1",
    exerciseId: metadata.id,
    exerciseName: metadata.name,
    settings: { ...metadata.defaultSettings, repRange: { min: 8, max: 12 }, recommendedMinSets: 2, recommendedMaxSets: 4 },
    load: 80,
    loadKnown: true,
    sets: [workSet(1, 80, 12), workSet(2, 80, 11)],
    status: "active",
    origin: "planned",
  };
  const session: WorkoutSession = {
    id: "session-v2-qa",
    userId: "guest-local",
    sessionKind: "planned",
    name: "Push",
    startedAt: "2026-06-29T10:00:00.000Z",
    updatedAt: "2026-06-29T10:00:00.000Z",
    syncState: "local",
    exercises: [exercise],
  };
  return { session, exercise, metadata };
}

function workSet(setNumber: number, load: number, reps: number): SetLog {
  return {
    id: `set-${setNumber}`,
    setNumber,
    type: "work",
    load,
    reps,
    loggedAt: `2026-06-29T10:0${setNumber}:00.000Z`,
  };
}
