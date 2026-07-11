import { jsonStore } from "@/data/local/json-store";
import {
  TRAINING_EVIDENCE_SCHEMA_VERSION,
  type TrainingEvidenceRecord,
} from "@/domain/training/training-evidence-record";

export interface ExerciseCalibrationRecord {
  exerciseId: string;
  establishedAt: string;
  load: number;
  prescribedTargets: number[];
}

type StoredEvidence = { evidence: TrainingEvidenceRecord[]; calibrations: Record<string, ExerciseCalibrationRecord> };
const key = "iron-logic.training-evidence";

export interface EvidenceAddResult {
  addedIds: string[];
  duplicateIds: string[];
}

export interface EvidenceResolution {
  records: TrainingEvidenceRecord[];
  missingIds: string[];
}

export const trainingEvidenceRepository = {
  get(): StoredEvidence {
    const stored = jsonStore.get<StoredEvidence>(key, { evidence: [], calibrations: {} });
    return cloneStoredEvidence(stored);
  },
  list(): TrainingEvidenceRecord[] {
    return this.get().evidence.sort(compareEvidence);
  },
  findById(id: string): TrainingEvidenceRecord | null {
    const record = this.list().find((candidate) => candidate.id === id);
    return record ? cloneRecord(record) : null;
  },
  resolve(ids: string[]): EvidenceResolution {
    const requestedIds = [...new Set(ids)];
    const byId = new Map(this.list().map((record) => [record.id, record]));
    const missingIds = requestedIds.filter((id) => !byId.has(id)).sort();
    const records = [...byId.values()]
      .filter((record) => requestedIds.includes(record.id))
      .sort(compareEvidence)
      .map(cloneRecord);
    return { records, missingIds };
  },
  add(records: TrainingEvidenceRecord[]): EvidenceAddResult {
    const current = this.get();
    const existingIds = new Set(current.evidence.map((record) => record.id));
    const accepted: TrainingEvidenceRecord[] = [];
    const duplicateIds: string[] = [];
    for (const record of records) {
      if (existingIds.has(record.id)) {
        duplicateIds.push(record.id);
        continue;
      }
      existingIds.add(record.id);
      accepted.push(normalizeRecord(record));
    }
    if (accepted.length > 0) {
      jsonStore.set(key, { ...current, evidence: [...current.evidence, ...accepted] });
    }
    return { addedIds: accepted.map((record) => record.id), duplicateIds: [...new Set(duplicateIds)].sort() };
  },
  saveCalibration(record: ExerciseCalibrationRecord) {
    const current = this.get();
    jsonStore.set(key, { ...current, calibrations: { ...current.calibrations, [record.exerciseId]: record } });
  },
  subscribe(listener: () => void) { return jsonStore.subscribe(key, listener); },
};

function normalizeRecord(record: TrainingEvidenceRecord): TrainingEvidenceRecord {
  return {
    ...cloneRecord(record),
    schemaVersion: record.schemaVersion ?? TRAINING_EVIDENCE_SCHEMA_VERSION,
    source: record.source ?? "completed_workout_loop",
    ruleIds: [...new Set(record.ruleIds ?? [])].sort(),
  };
}

function cloneStoredEvidence(value: StoredEvidence): StoredEvidence {
  return {
    evidence: value.evidence.map(normalizeRecord),
    calibrations: Object.fromEntries(
      Object.entries(value.calibrations).map(([exerciseId, calibration]) => [exerciseId, { ...calibration, prescribedTargets: [...calibration.prescribedTargets] }]),
    ),
  };
}

function cloneRecord(record: TrainingEvidenceRecord): TrainingEvidenceRecord {
  return { ...record, ruleIds: [...(record.ruleIds ?? [])], notes: [...(record.notes ?? [])] };
}

function compareEvidence(left: TrainingEvidenceRecord, right: TrainingEvidenceRecord): number {
  if (left.occurredAt !== right.occurredAt) return left.occurredAt.localeCompare(right.occurredAt);
  return left.id.localeCompare(right.id);
}
