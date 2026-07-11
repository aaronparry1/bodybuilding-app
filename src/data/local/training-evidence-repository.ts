import { jsonStore } from "@/data/local/json-store";
import type { TrainingEvidenceRecord } from "@/domain/training/training-evidence-record";

export interface ExerciseCalibrationRecord {
  exerciseId: string;
  establishedAt: string;
  load: number;
  prescribedTargets: number[];
}

type StoredEvidence = { evidence: TrainingEvidenceRecord[]; calibrations: Record<string, ExerciseCalibrationRecord> };
const key = "iron-logic.training-evidence";

export const trainingEvidenceRepository = {
  get(): StoredEvidence { return jsonStore.get<StoredEvidence>(key, { evidence: [], calibrations: {} }); },
  add(records: TrainingEvidenceRecord[]) {
    const current = this.get();
    jsonStore.set(key, { ...current, evidence: [...current.evidence, ...records] });
  },
  saveCalibration(record: ExerciseCalibrationRecord) {
    const current = this.get();
    jsonStore.set(key, { ...current, calibrations: { ...current.calibrations, [record.exerciseId]: record } });
  },
  subscribe(listener: () => void) { return jsonStore.subscribe(key, listener); },
};
