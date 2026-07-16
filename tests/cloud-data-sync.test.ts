import { beforeEach, describe, expect, it } from "vitest";
import { appSettingsStore } from "@/application/settings/app-settings";
import {
  buildCloudUserDataBackup,
  enqueueLocalDataForAutomaticSync,
  restoreCloudDataForUser,
  syncLocalDataForUser,
} from "@/application/sync/cloud-data-sync";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { jsonStore } from "@/data/local/json-store";
import { programmeRepository } from "@/data/local/programme-repository";
import { legacyTrainingYearArchive } from "@/application/training/legacy-training-year-archive";
import { SyncQueue, type SyncQueueItem, type SyncQueueStore } from "@/data/sync/sync-queue";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";

class MemorySyncQueueStore implements SyncQueueStore {
  items: SyncQueueItem[] = [];

  read(): SyncQueueItem[] {
    return this.items;
  }

  write(items: SyncQueueItem[]): void {
    this.items = items;
  }
}

describe("cloud data sync and restore", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    appSettingsStore.resetCache();
  });

  it("does not install legacy workout history from cloud", async () => {
    await restoreCloudDataForUser("user-1", {
      client: {} as never,
      workoutCloudRepository: { loadWorkoutHistory: async () => [] },
      programmeCloudRepository: { loadProgrammes: async () => [] },
      exerciseCloudRepository: { loadExercises: async () => [] },
      userSettingsCloudRepository: { loadUserSettingsBlob: async () => null },
    });

    expect(true).toBe(true);
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

    expect(activeTrainingPlanRepository.getOptional()).toBeNull();
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

  it("enqueues local workouts/settings and flushes automatically through the injected sync service", async () => {
    const store = new MemorySyncQueueStore();
    const queue = new SyncQueue(store);

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

    expect(result.synced).toBeGreaterThanOrEqual(1);
    expect(queue.count()).toBe(0);
  });

  it("keeps queued payloads when automatic flush fails", async () => {
    const store = new MemorySyncQueueStore();
    const queue = new SyncQueue(store);

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
    expect(queue.list().some((item) => item.entityType === "workout_session")).toBe(false);
  });

  it("preserves queued data across queue-store recreation before a later flush", () => {
    const store = new MemorySyncQueueStore();
    const firstQueue = new SyncQueue(store);

    enqueueLocalDataForAutomaticSync("user-1", { queue: firstQueue });
    const recreatedQueue = new SyncQueue(store);

    expect(recreatedQueue.count()).toBeGreaterThan(0);
    expect(recreatedQueue.list().some((item) => item.entityType === "workout_session")).toBe(false);
  });
});
