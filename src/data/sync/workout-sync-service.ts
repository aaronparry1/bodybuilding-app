import { WorkoutSessionCloudRepository } from "@/data/cloud/workout-session-cloud-repository";
import { ProgrammeCloudRepository } from "@/data/cloud/programme-cloud-repository";
import { ExerciseCloudRepository } from "@/data/cloud/exercise-cloud-repository";
import { UserSettingsCloudRepository } from "@/data/cloud/user-settings-cloud-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import type { AppSupabaseClient } from "@/lib/supabase/client";
import { canAccess, type SubscriptionState } from "@/application/billing/subscription";
import type { Exercise, Programme } from "@/domain/training/models";
import type { WorkoutSession } from "@/domain/training/models";

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function workoutIsComplete(remote: WorkoutSession, local: WorkoutSession): boolean {
  const remoteExercises = new Map(remote.exercises.map((exercise) => [exercise.id, exercise]));
  return local.exercises.every((exercise) => {
    const saved = remoteExercises.get(exercise.id);
    if (!saved) return false;
    const savedSetIds = new Set(saved.sets.map((set) => set.id));
    return exercise.sets.every((set) => savedSetIds.has(set.id));
  });
}

export class WorkoutSyncService {
  constructor(
    private readonly userId: string,
    client: AppSupabaseClient,
    private readonly queue = new SyncQueue(new LocalSyncQueueStore()),
    private readonly workoutRepository = new WorkoutSessionCloudRepository(client),
    private readonly programmeRepository = new ProgrammeCloudRepository(client),
    private readonly exerciseRepository = new ExerciseCloudRepository(client),
    private readonly userSettingsRepository = new UserSettingsCloudRepository(client),
    private readonly subscription: SubscriptionState = { status: "free", provider: "mock" },
    private readonly bypassEntitlement = false,
  ) {}

  async flushQueue(): Promise<{ synced: number; skipped: number; failed: number }> {
    if (!this.bypassEntitlement && !canAccess(this.subscription, "cloud_sync")) {
      return { synced: 0, skipped: this.queue.count(), failed: 0 };
    }

    let synced = 0;
    let skipped = 0;
    let failed = 0;
    const syncedIds: string[] = [];
    const failures = new Map<string, string>();
    for (const item of this.queue.list()) {
      if (item.ownerUserId && item.ownerUserId !== this.userId) {
        skipped += 1;
        continue;
      }

      try {
        if (item.entityType === "workout_session") {
          const payload = item.payload as WorkoutSession;
          await this.workoutRepository.saveWorkoutSession(this.userId, payload);
          const saved = (await this.workoutRepository.loadWorkoutHistory(this.userId)).find((session) => session.id === payload.id);
          if (!saved || !workoutIsComplete(saved, payload)) throw new Error("Workout backup verification failed.");
        } else if (item.entityType === "programme") {
          const payload = item.payload as Programme;
          await this.programmeRepository.saveProgramme(this.userId, payload);
          if (!(await this.programmeRepository.loadProgrammes(this.userId)).some((programme) => programme.id === payload.id)) {
            throw new Error("Programme backup verification failed.");
          }
        } else if (item.entityType === "custom_exercise") {
          const payload = item.payload as Exercise;
          await this.exerciseRepository.saveCustomExercise(this.userId, payload);
          if (!(await this.exerciseRepository.loadExercises(this.userId)).some((exercise) => exercise.id === payload.id)) {
            throw new Error("Exercise backup verification failed.");
          }
        } else if (item.entityType === "user_settings") {
          await this.userSettingsRepository.saveUserSettings(this.userId, item.payload);
          const saved = await this.userSettingsRepository.loadUserSettingsBlob(this.userId);
          if (stableJson(saved) !== stableJson(item.payload)) throw new Error("Account backup envelope verification failed.");
        } else {
          failures.set(item.id, "Unsupported backup entity type.");
          failed += 1;
          continue;
        }
        syncedIds.push(item.id);
        synced += 1;
      } catch {
        failures.set(item.id, "Sync failed. Check staging diagnostics for the failing entity.");
        failed += 1;
      }
    }

    this.queue.settle(syncedIds, failures);

    return { synced, skipped, failed };
  }
}
