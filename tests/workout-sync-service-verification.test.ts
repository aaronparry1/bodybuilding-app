import { describe, expect, it } from "vitest";
import { WorkoutSyncService } from "@/data/sync/workout-sync-service";
import { SyncQueue, type SyncQueueItem, type SyncQueueStore } from "@/data/sync/sync-queue";

class MemorySyncQueueStore implements SyncQueueStore {
  items: SyncQueueItem[] = [];
  read() { return this.items; }
  write(items: SyncQueueItem[]) { this.items = items; }
}

function serviceFor(remoteValue: unknown, queue: SyncQueue) {
  return new WorkoutSyncService(
    "user-1",
    {} as never,
    queue,
    {} as never,
    {} as never,
    {} as never,
    {
      saveUserSettings: async () => undefined,
      loadUserSettingsBlob: async () => remoteValue,
    } as never,
    { status: "active", provider: "mock", isPremium: true },
    true,
  );
}

describe("verified account-backup queue acknowledgement", () => {
  it("acknowledges the envelope only after an exact owner-scoped readback", async () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());
    const envelope = { schema: "adaptive-strength-coach-cloud-backup", version: 1, nested: { sessions: ["one"] } };
    queue.enqueue("user_settings", "user-1", envelope, "user-1");

    const result = await serviceFor({ version: 1, nested: { sessions: ["one"] }, schema: "adaptive-strength-coach-cloud-backup" }, queue).flushQueue();

    expect(result).toEqual({ synced: 1, skipped: 0, failed: 0 });
    expect(queue.count()).toBe(0);
  });

  it("retains a partial remote envelope for retry instead of claiming success", async () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());
    queue.enqueue("user_settings", "user-1", { schema: "adaptive-strength-coach-cloud-backup", version: 1, sessions: ["one"] }, "user-1");

    const result = await serviceFor({ schema: "adaptive-strength-coach-cloud-backup", version: 1, sessions: [] }, queue).flushQueue();

    expect(result).toEqual({ synced: 0, skipped: 0, failed: 1 });
    expect(queue.list()[0]).toMatchObject({ attempts: 1 });
  });

  it("does not attach queued data to a different authenticated owner", async () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());
    queue.enqueue("user_settings", "user-2", { settings: true }, "user-2");

    const result = await serviceFor({ settings: true }, queue).flushQueue();

    expect(result).toEqual({ synced: 0, skipped: 1, failed: 0 });
    expect(queue.count()).toBe(1);
  });
});
