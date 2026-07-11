import { jsonStore } from "@/data/local/json-store";
import type { CardioSessionKind } from "@/domain/training/models";

const recoveryCapacityIgnoreKey = "iron-logic.recovery-capacity-ignore";

export interface RecoveryCapacityIgnoreRecord {
  ignoredRecoveryCapacityWeekId: string;
  ignoredAt: string;
  activePlanId?: string;
  sessionType?: CardioSessionKind;
}

export function isRecoveryCapacityIgnoredForWeek(
  record: RecoveryCapacityIgnoreRecord | null | undefined,
  options: { weekId: string; activePlanId?: string | null },
): boolean {
  if (!record || record.ignoredRecoveryCapacityWeekId !== options.weekId) return false;
  if (!record.activePlanId || !options.activePlanId) return true;
  return record.activePlanId === options.activePlanId;
}

export class LocalRecoveryCapacityIgnoreRepository {
  get(): RecoveryCapacityIgnoreRecord | null {
    return jsonStore.get<RecoveryCapacityIgnoreRecord | null>(recoveryCapacityIgnoreKey, null);
  }

  save(record: RecoveryCapacityIgnoreRecord): void {
    jsonStore.set(recoveryCapacityIgnoreKey, record);
  }

  clear(): void {
    jsonStore.remove(recoveryCapacityIgnoreKey);
  }

  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(recoveryCapacityIgnoreKey, listener);
  }
}

export const recoveryCapacityIgnoreRepository = new LocalRecoveryCapacityIgnoreRepository();
