import { jsonStore } from "@/data/local/json-store";
import type { SyncQueueItem, SyncQueueStore } from "@/data/sync/sync-queue";

export class LocalSyncQueueStore implements SyncQueueStore {
  private readonly key = "iron-logic.sync-queue";

  read(): SyncQueueItem[] {
    return jsonStore.get<SyncQueueItem[]>(this.key, []);
  }

  write(items: SyncQueueItem[]): void {
    jsonStore.set(this.key, items);
  }
}
