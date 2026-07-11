import { jsonStore } from "@/data/local/json-store";
import type { CapacityFocusRecord } from "@/domain/training/capacity-focus";

const capacityFocusRecordsKey = "iron-logic.capacity-focus-records";

export interface CapacityFocusRepository {
  list(): CapacityFocusRecord[];
  save(record: CapacityFocusRecord): void;
  subscribe(listener: () => void): () => void;
}

export class LocalCapacityFocusRepository implements CapacityFocusRepository {
  list(): CapacityFocusRecord[] {
    return jsonStore.get<CapacityFocusRecord[]>(capacityFocusRecordsKey, []);
  }

  save(record: CapacityFocusRecord): void {
    jsonStore.set(capacityFocusRecordsKey, [record, ...this.list().filter((candidate) => candidate.id !== record.id)]);
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(capacityFocusRecordsKey, listener);
  }
}

export const capacityFocusRepository = new LocalCapacityFocusRepository();
