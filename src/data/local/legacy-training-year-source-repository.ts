import { jsonStore } from "@/data/local/json-store";

const legacyTrainingYearSourceKey = "iron-logic.training-year";

/** Opaque source-payload storage for migration/recovery only. */
export const legacyTrainingYearSourceRepository = {
  read(): unknown { return jsonStore.get<unknown | null>(legacyTrainingYearSourceKey, null); },
  write(payload: unknown): void { jsonStore.set(legacyTrainingYearSourceKey, payload); },
  clear(): void { jsonStore.remove(legacyTrainingYearSourceKey); },
};
