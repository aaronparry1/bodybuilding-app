import type { SubscriptionState } from "@/application/billing/subscription";
import { enqueueLocalDataForAutomaticSync, enqueueLocalDataForAutomaticSyncAsync } from "@/application/sync/cloud-data-sync";
import { jsonStore } from "@/data/local/json-store";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import { WorkoutSyncService } from "@/data/sync/workout-sync-service";
import { getOptionalSupabaseClient } from "@/lib/supabase/client";

export interface SyncDiagnosticsStatus {
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  lastSyncedCount?: number;
  lastSkippedCount?: number;
  lastFailedCount?: number;
}

const syncStatusKey = "iron-logic.sync-diagnostics-status";
const queue = new SyncQueue(new LocalSyncQueueStore());

export const syncDiagnosticsStore = {
  get(): SyncDiagnosticsStatus {
    return jsonStore.get<SyncDiagnosticsStatus>(syncStatusKey, {});
  },
  set(status: SyncDiagnosticsStatus): void {
    jsonStore.set(syncStatusKey, status);
  },
  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(syncStatusKey, listener);
  },
};

export function getUnsyncedQueueCount(): number {
  return queue.count();
}

export function enqueueLocalDataForSync(userId: string): number {
  return enqueueLocalDataForAutomaticSync(userId, { queue });
}

export async function runManualSync(userId: string, subscription: SubscriptionState) {
  const attemptedAt = new Date().toISOString();
  syncDiagnosticsStore.set({ ...syncDiagnosticsStore.get(), lastAttemptAt: attemptedAt, lastError: undefined });

  const { client, error } = getOptionalSupabaseClient();
  if (!client) {
    syncDiagnosticsStore.set({
      ...syncDiagnosticsStore.get(),
      lastAttemptAt: attemptedAt,
      lastError: error ?? "Supabase is not configured.",
    });
    return { synced: 0, skipped: 0, failed: queue.count() };
  }

  await enqueueLocalDataForAutomaticSyncAsync(userId, { queue });

  try {
    const result = await new WorkoutSyncService(userId, client, queue, undefined, undefined, undefined, undefined, subscription, true).flushQueue();
    const backupVerified = result.failed === 0 && result.skipped === 0 && queue.count() === 0;
    syncDiagnosticsStore.set({
      lastAttemptAt: attemptedAt,
      lastSuccessAt: backupVerified ? new Date().toISOString() : syncDiagnosticsStore.get().lastSuccessAt,
      lastSyncedCount: result.synced,
      lastSkippedCount: result.skipped,
      lastFailedCount: result.failed,
      lastError: backupVerified ? undefined : "Account backup is incomplete. Your local data is safe and retryable.",
    });
    return result;
  } catch (nextError) {
    const message = nextError instanceof Error ? nextError.message : "Manual sync failed.";
    syncDiagnosticsStore.set({ ...syncDiagnosticsStore.get(), lastAttemptAt: attemptedAt, lastError: message });
    return { synced: 0, skipped: 0, failed: queue.count() };
  }
}

export function clearLocalTestData(): void {
  jsonStore.clearByPrefix("iron-logic.");
}
