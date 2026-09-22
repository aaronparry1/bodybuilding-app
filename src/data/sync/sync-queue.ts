import type { WorkoutSession } from "@/domain/training/models";

export type SyncEntityType = "workout_session" | "custom_exercise" | "programme" | "user_settings";

export interface SyncQueueItem<TPayload = unknown> {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  ownerUserId?: string | null;
  payload: TPayload;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export interface SyncQueueStore {
  read(): SyncQueueItem[];
  write(items: SyncQueueItem[]): void;
}

export interface SyncQueueInput<TPayload = unknown> {
  entityType: SyncEntityType;
  entityId: string;
  ownerUserId?: string | null;
  payload: TPayload;
}

export class SyncQueue {
  constructor(private readonly store: SyncQueueStore) {}

  enqueue<TPayload>(
    entityType: SyncEntityType,
    entityId: string,
    payload: TPayload,
    ownerUserId?: string | null,
  ): SyncQueueItem<TPayload> {
    return this.enqueueMany([{ entityType, entityId, payload, ownerUserId }])[0] as SyncQueueItem<TPayload>;
  }

  enqueueMany(inputs: readonly SyncQueueInput[]): SyncQueueItem[] {
    if (!inputs.length) return [];
    const createdAt = new Date().toISOString();
    const suffix = Date.now();
    const items = inputs.map((input, index): SyncQueueItem => ({
      id: `${input.entityType}-${input.entityId}-${input.ownerUserId ?? "unowned"}-${suffix}-${index}`,
      entityType: input.entityType,
      entityId: input.entityId,
      ownerUserId: input.ownerUserId ?? null,
      payload: input.payload,
      createdAt,
      attempts: 0,
    }));
    const replacementKeys = new Set(items.map((item) => `${item.entityType}\u0000${item.entityId}\u0000${item.ownerUserId ?? ""}`));
    const retained = this.store.read().filter((item) => !replacementKeys.has(`${item.entityType}\u0000${item.entityId}\u0000${item.ownerUserId ?? ""}`));
    this.store.write([...retained, ...items]);
    return items;
  }

  enqueueWorkoutSession(session: WorkoutSession, ownerUserId?: string | null): SyncQueueItem<WorkoutSession> {
    return this.enqueue("workout_session", session.id, session, ownerUserId ?? session.userId ?? null);
  }

  list(): SyncQueueItem[] {
    return this.store.read();
  }

  markSynced(id: string): void {
    this.store.write(this.store.read().filter((item) => item.id !== id));
  }

  count(): number {
    return this.store.read().length;
  }

  clear(): void {
    this.store.write([]);
  }

  markFailed(id: string, error?: string): void {
    this.store.write(
      this.store
        .read()
        .map((item) => (item.id === id ? { ...item, attempts: item.attempts + 1, lastError: error } : item)),
    );
  }


  settle(syncedIds: readonly string[], failures: ReadonlyMap<string, string>): void {
    if (!syncedIds.length && !failures.size) return;
    const synced = new Set(syncedIds);
    this.store.write(this.store.read().flatMap((item) => {
      if (synced.has(item.id)) return [];
      const error = failures.get(item.id);
      return error === undefined ? [item] : [{ ...item, attempts: item.attempts + 1, lastError: error }];
    }));
  }
}
