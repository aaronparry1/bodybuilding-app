import { beforeEach, describe, expect, it } from "vitest";
import { appSettingsStore } from "@/application/settings/app-settings";
import {
  buildCloudUserDataBackup,
  enqueueLocalDataForAutomaticSync,
  mergeWorkoutSessions,
  restoreCloudDataForUser,
  syncLocalDataForUser,
} from "@/application/sync/cloud-data-sync";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { legacyTrainingYearArchive } from "@/application/training/legacy-training-year-archive";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { SyncQueue, type SyncQueueItem, type SyncQueueStore } from "@/data/sync/sync-queue";
import { buildStrengthDashboard } from "@/domain/training/strength-dashboard";
import type { WorkoutSession } from "@/domain/training/models";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { defaultHypertrophySettings, exerciseLibrary, presetProgrammes } from "@/domain/training/presets";

class MemorySyncQueueStore implements SyncQueueStore {
  items: SyncQueueItem[] = [];

  read(): SyncQueueItem[] {
    return this.items;
  }

  write(items: SyncQueueItem[]): void {
    this.items = items;
  }
}

function completedSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    id: "cloud-session-1",
    userId: "user-1",
    name: "Push",
    startedAt: "2026-06-10T10:00:00.000Z",
    completedAt: "2026-06-10T11:00:00.000Z",
    updatedAt: "2026-06-10T11:00:00.000Z",
    syncState: "synced",
    exercises: [
      {
        id: "bench-log-1",
        exerciseId: "ex-bench-press",
        exerciseName: "Bench Press",
        settings: defaultHypertrophySettings,
        load: 100,
        status: "complete",
        sets: [
          { id: "bench-set-1", setNumber: 1, reps: 8, load: 100, type: "work", loggedAt: "2026-06-10T10:10:00.000Z" },
        ],
      },
    ],
    ...overrides,
  };
}

describe("cloud data sync and restore", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    appSettingsStore.resetCache();
  });

  it("restores completed workout history from cloud and rebuilds Strength Dashboard inputs", async () => {
    await restoreCloudDataForUser("user-1", {
      client: {} as never,
      workoutCloudRepository: { loadWorkoutHistory: async () => [completedSession()] },
      programmeCloudRepository: { loadProgrammes: async () => [] },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => null },
    });

    expect(workoutSessionRepository.list()).toHaveLength(1);
    expect(workoutSessionRepository.list()[0]?.id).toBe("cloud-session-1");
    expect(buildStrengthDashboard({ sessions: workoutSessionRepository.list() }).hasData).toBe(true);
  });

  it("restores active plan, training year, and settings from the cloud backup envelope on fresh install", async () => {
    const cloudPlan = createActiveTrainingPlan(
      {
        goal: "build_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "advanced",
      },
      "2026-06-10T10:00:00.000Z",
    );
    const cloudYear = { id: "cloud-year", source: "legacy-test-payload" };
    const backup = {
      ...buildCloudUserDataBackup(),
      appSettings: { ...appSettingsStore.get(), onboardingCompleted: true, unit: "lb" as const },
      activeTrainingPlan: cloudPlan,
      trainingYear: cloudYear,
    };

    await restoreCloudDataForUser("user-1", {
      client: {} as never,
      workoutCloudRepository: { loadWorkoutHistory: async () => [] },
      programmeCloudRepository: { loadProgrammes: async () => [] },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => backup },
    });

    expect(activeTrainingPlanRepository.getOptional()?.goal).toBe("build_strength");
    expect((legacyTrainingYearArchive.read() as { id: string }).id).toBe(cloudYear.id);
    expect(appSettingsStore.get().unit).toBe("lb");
    expect(appSettingsStore.get().onboardingCompleted).toBe(true);
  });

  it("restores custom exercises and programmes from cloud without requiring derived report storage", async () => {
    const customExercise = { ...exerciseLibrary[0]!, id: "custom-cloud-curl", name: "Cloud Curl", isCustom: true, createdByUserId: "user-1" };
    const customProgramme = { ...presetProgrammes[0]!, id: "custom-cloud-programme", name: "Cloud Programme", isCustom: true, isPreset: false, createdByUserId: "user-1" };

    await restoreCloudDataForUser("user-1", {
      client: {} as never,
      workoutCloudRepository: { loadWorkoutHistory: async () => [] },
      programmeCloudRepository: { loadProgrammes: async () => [customProgramme] },
      exerciseCloudRepository: { loadExercises: async () => [customExercise] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => null },
    });

    expect(customExerciseRepository.listCustom().map((exercise) => exercise.id)).toContain("custom-cloud-curl");
    expect(programmeRepository.listCustom().map((programme) => programme.id)).toContain("custom-cloud-programme");
  });

  it("merges duplicate cloud/local workouts by stable ID without overwriting newer local unsynced data", () => {
    const local = completedSession({ updatedAt: "2026-06-12T10:00:00.000Z", exercises: [{ ...completedSession().exercises[0]!, load: 105 }] });
    const cloud = completedSession({ updatedAt: "2026-06-11T10:00:00.000Z", exercises: [{ ...completedSession().exercises[0]!, load: 100 }] });

    const merged = mergeWorkoutSessions([local], [cloud]);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.exercises[0]?.load).toBe(105);
  });

  it("enqueues local workouts/settings and flushes automatically through the injected sync service", async () => {
    const store = new MemorySyncQueueStore();
    const queue = new SyncQueue(store);
    workoutSessionRepository.save(completedSession({ syncState: "local" }));

    const result = await syncLocalDataForUser("user-1", { status: "active", provider: "mock" }, {
      client: {} as never,
      queue,
      workoutSyncService: {
        flushQueue: async () => {
          const count = queue.count();
          queue.clear();
          return { synced: count, skipped: 0, failed: 0 };
        },
      },
    });

    expect(result.synced).toBeGreaterThanOrEqual(2);
    expect(queue.count()).toBe(0);
  });

  it("keeps queued payloads when automatic flush fails", async () => {
    const store = new MemorySyncQueueStore();
    const queue = new SyncQueue(store);
    workoutSessionRepository.save(completedSession({ syncState: "local" }));

    const result = await syncLocalDataForUser("user-1", { status: "active", provider: "mock" }, {
      client: {} as never,
      queue,
      workoutSyncService: {
        flushQueue: async () => {
          throw new Error("network down");
        },
      },
    });

    expect(result.failed).toBe(queue.count());
    expect(queue.count()).toBeGreaterThan(0);
    expect(queue.list().some((item) => item.entityType === "workout_session")).toBe(true);
  });

  it("preserves queued data across queue-store recreation before a later flush", () => {
    const store = new MemorySyncQueueStore();
    const firstQueue = new SyncQueue(store);
    workoutSessionRepository.save(completedSession({ syncState: "local" }));

    enqueueLocalDataForAutomaticSync("user-1", { queue: firstQueue });
    const recreatedQueue = new SyncQueue(store);

    expect(recreatedQueue.count()).toBeGreaterThan(0);
    expect(recreatedQueue.list().some((item) => item.entityType === "workout_session")).toBe(true);
  });
});
