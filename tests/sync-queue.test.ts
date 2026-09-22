import { describe, expect, it } from "vitest";
import { SyncQueue, type SyncQueueItem, type SyncQueueStore } from "@/data/sync/sync-queue";

class MemorySyncQueueStore implements SyncQueueStore {
  private items: SyncQueueItem[] = [];

  read(): SyncQueueItem[] {
    return this.items;
  }

  write(items: SyncQueueItem[]): void {
    this.items = items;
  }
}

describe("SyncQueue", () => {
  it("enqueues and settles a backlog with one persisted write per batch", () => {
    class CountingStore extends MemorySyncQueueStore {
      writes = 0;
      override write(items: SyncQueueItem[]) { this.writes += 1; super.write(items); }
    }
    const store = new CountingStore();
    const queue = new SyncQueue(store);
    const items = queue.enqueueMany(Array.from({ length: 500 }, (_, index) => ({
      entityType: "custom_exercise" as const,
      entityId: `exercise-${index}`,
      payload: { index },
      ownerUserId: "user",
    })));
    expect(store.writes).toBe(1);
    queue.settle(items.map((item) => item.id), new Map());
    expect(store.writes).toBe(2);
    expect(queue.count()).toBe(0);
  });

  it("enqueues local-first work and removes it after sync", () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());
    const item = queue.enqueue("workout_session", "session-1", { id: "session-1" });

    expect(queue.list()).toHaveLength(1);
    expect(queue.list()[0]).toMatchObject({
      entityType: "workout_session",
      entityId: "session-1",
      attempts: 0,
    });

    queue.markSynced(item.id);

    expect(queue.list()).toHaveLength(0);
  });

  it("tracks failed attempts without dropping the payload", () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());
    const item = queue.enqueue("custom_exercise", "exercise-1", { name: "Cable Y-Raise" });

    queue.markFailed(item.id);

    expect(queue.list()[0]).toMatchObject({
      entityId: "exercise-1",
      attempts: 1,
      payload: { name: "Cable Y-Raise" },
    });
  });

  it("deduplicates queued writes for the same local entity", () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());

    queue.enqueue("workout_session", "session-1", { version: 1 });
    queue.enqueue("workout_session", "session-1", { version: 2 });

    expect(queue.list()).toHaveLength(1);
    expect(queue.list()[0]).toMatchObject({
      entityType: "workout_session",
      entityId: "session-1",
      payload: { version: 2 },
      attempts: 0,
    });
  });

  it("keeps ownership metadata for safe account switching", () => {
    const queue = new SyncQueue(new MemorySyncQueueStore());

    queue.enqueue("programme", "programme-1", { name: "Mine" }, "user-1");

    expect(queue.list()[0]).toMatchObject({
      entityType: "programme",
      entityId: "programme-1",
      ownerUserId: "user-1",
    });
  });
});
