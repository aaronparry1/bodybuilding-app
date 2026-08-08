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

export class SyncQueue {
  constructor(private readonly store: SyncQueueStore) {}

  enqueue<TPayload>(
    entityType: SyncEntityType,
    entityId: string,
    payload: TPayload,
    ownerUserId?: string | null,
  ): SyncQueueItem<TPayload> {
    const item: SyncQueueItem<TPayload> = {
      id: `${entityType}-${entityId}-${ownerUserId ?? "unowned"}-${Date.now()}`,
      entityType,
      entityId,
      ownerUserId: ownerUserId ?? null,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };

    const existingItems = this.store.read();
    const withoutDuplicate = existingItems.filter(
      (existing) =>
        !(
          existing.entityType === entityType &&
          existing.entityId === entityId &&
          (existing.ownerUserId ?? null) === (ownerUserId ?? null)
        ),
    );
    this.store.write([...withoutDuplicate, item]);
    return item;
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
}
