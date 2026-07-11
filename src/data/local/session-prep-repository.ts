import { jsonStore } from "@/data/local/json-store";
import type { SessionPrepRecord } from "@/domain/training/session-prep";

const sessionPrepRecordsKey = "iron-logic.session-prep-records";

export interface SessionPrepRepository {
  list(): SessionPrepRecord[];
  save(record: SessionPrepRecord): void;
  subscribe(listener: () => void): () => void;
}

export class LocalSessionPrepRepository implements SessionPrepRepository {
  list(): SessionPrepRecord[] {
    return jsonStore.get<SessionPrepRecord[]>(sessionPrepRecordsKey, []);
  }

  save(record: SessionPrepRecord): void {
    jsonStore.set(sessionPrepRecordsKey, [record, ...this.list().filter((candidate) => candidate.id !== record.id)]);
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(sessionPrepRecordsKey, listener);
  }
}

export const sessionPrepRepository = new LocalSessionPrepRepository();
