import { beforeEach, describe, expect, it } from "vitest";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { WorkoutSession } from "@/domain/training/models";
import { defaultHypertrophySettings, exerciseLibrary, presetProgrammes } from "@/domain/training/presets";

const completedSession: WorkoutSession = {
  id: "snapshot-session",
  userId: null,
  programmeId: undefined,
  templateId: undefined,
  name: "Snapshot Session",
  startedAt: "2026-06-01T10:00:00.000Z",
  completedAt: "2026-06-01T10:30:00.000Z",
  updatedAt: "2026-06-01T10:30:00.000Z",
  syncState: "local",
  exercises: [
    {
      id: "snapshot-exercise-log",
      exerciseId: "ex-bench-press",
      exerciseName: "Bench Press",
      load: 100,
      settings: defaultHypertrophySettings,
      status: "complete",
      sets: [{ id: "snapshot-set", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-01T10:05:00.000Z" }],
    },
  ],
};

describe("external store snapshots", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
  });

  it("keeps JSON snapshots referentially stable between unchanged reads", () => {
    jsonStore.set("iron-logic.snapshot-test", [{ id: "one" }]);

    const firstSnapshot = jsonStore.get("iron-logic.snapshot-test", []);
    const secondSnapshot = jsonStore.get("iron-logic.snapshot-test", []);

    expect(secondSnapshot).toBe(firstSnapshot);
  });

  it("keeps merged exercise library snapshots stable until custom exercises change", () => {
    const firstSnapshot = customExerciseRepository.listAll();
    const secondSnapshot = customExerciseRepository.listAll();

    customExerciseRepository.save({ ...exerciseLibrary[0], id: "custom-snapshot-exercise", name: "Snapshot Curl", isCustom: true });

    expect(secondSnapshot).toBe(firstSnapshot);
    expect(customExerciseRepository.listAll()).not.toBe(firstSnapshot);
  });

  it("keeps merged programme snapshots stable until custom programmes change", () => {
    const firstSnapshot = programmeRepository.listAll();
    const secondSnapshot = programmeRepository.listAll();

    programmeRepository.save({ ...presetProgrammes[0], id: "custom-snapshot-programme", name: "Snapshot Split", isCustom: true });

    expect(secondSnapshot).toBe(firstSnapshot);
    expect(programmeRepository.listAll()).not.toBe(firstSnapshot);
  });

  it("keeps completed workout history snapshots stable until sessions change", () => {
    const emptySnapshot = workoutHistoryRepository.listCompletedSessions();
    const secondEmptySnapshot = workoutHistoryRepository.listCompletedSessions();

    workoutSessionRepository.save(completedSession);

    expect(secondEmptySnapshot).toBe(emptySnapshot);
    expect(workoutHistoryRepository.listCompletedSessions()).not.toBe(emptySnapshot);
    expect(workoutHistoryRepository.listCompletedSessions()).toBe(workoutHistoryRepository.listCompletedSessions());
  });

  it("keeps missing-key fallback snapshots stable between unchanged reads", () => {
    const firstSnapshot = jsonStore.get("iron-logic.missing-snapshot", {});
    const secondSnapshot = jsonStore.get("iron-logic.missing-snapshot", {});

    jsonStore.set("iron-logic.missing-snapshot", { lastAttemptAt: "2026-06-01T12:00:00.000Z" });

    expect(secondSnapshot).toBe(firstSnapshot);
    expect(jsonStore.get("iron-logic.missing-snapshot", {})).not.toBe(firstSnapshot);
  });
});
