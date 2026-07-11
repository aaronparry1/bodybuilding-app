import type { WorkoutSession } from "@/domain/training/models";

export interface SyncEnvelope<T> {
  entity: T;
  localUpdatedAt: string;
  remoteUpdatedAt?: string;
  version: number;
}

export interface WorkoutSyncGateway {
  pushSession(session: WorkoutSession): Promise<SyncEnvelope<WorkoutSession>>;
  pullSessions(userId: string, since?: string): Promise<SyncEnvelope<WorkoutSession>[]>;
}

export class DeferredWorkoutSyncGateway implements WorkoutSyncGateway {
  async pushSession(session: WorkoutSession): Promise<SyncEnvelope<WorkoutSession>> {
    return { entity: { ...session, syncState: "queued" }, localUpdatedAt: session.updatedAt, version: 1 };
  }

  async pullSessions(): Promise<SyncEnvelope<WorkoutSession>[]> {
    return [];
  }
}
