import { WorkoutSessionCloudRepository } from "@/data/cloud/workout-session-cloud-repository";
import { ProgrammeCloudRepository } from "@/data/cloud/programme-cloud-repository";
import { ExerciseCloudRepository } from "@/data/cloud/exercise-cloud-repository";
import { UserSettingsCloudRepository } from "@/data/cloud/user-settings-cloud-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import type { AppSupabaseClient } from "@/lib/supabase/client";
import { canAccess, type SubscriptionState } from "@/application/billing/subscription";
import type { Exercise, Programme } from "@/domain/training/models";

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
    for (const item of this.queue.list()) {
      if (item.ownerUserId && item.ownerUserId !== this.userId) {
        skipped += 1;
        continue;
      }

      try {
        if (item.entityType === "workout_session") {
          await this.workoutRepository.saveWorkoutSession(this.userId, item.payload as never);
        } else if (item.entityType === "programme") {
          await this.programmeRepository.saveProgramme(this.userId, item.payload as Programme);
        } else if (item.entityType === "custom_exercise") {
          await this.exerciseRepository.saveCustomExercise(this.userId, item.payload as Exercise);
        } else if (item.entityType === "user_settings") {
          await this.userSettingsRepository.saveUserSettings(this.userId, item.payload);
        } else {
          skipped += 1;
          continue;
        }
        this.queue.markSynced(item.id);
        synced += 1;
      } catch {
        this.queue.markFailed(item.id, "Sync failed. Check staging diagnostics for the failing entity.");
        failed += 1;
      }
    }

    return { synced, skipped, failed };
  }
}
