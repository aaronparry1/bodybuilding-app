import { beforeEach, describe, expect, it } from "vitest";
import { jsonStore } from "@/data/local/json-store";
import { trainingEvidenceRepository } from "@/data/local/training-evidence-repository";
import type { TrainingEvidenceRecord } from "@/domain/training/training-evidence-record";

function record(id: string, occurredAt = "2026-07-11T09:00:00.000Z"): TrainingEvidenceRecord {
  return {
    id,
    schemaVersion: 1,
    source: "completed_workout_loop",
    ruleIds: ["13a_first_shippable_coaching_loop"],
    sessionId: "session-1",
    occurredAt,
    kind: "adherence",
    value: 8,
    confidence: "high",
    notes: ["Completed workout evidence."],
  };
}

describe("training evidence repository", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.training-evidence");
    jsonStore.resetCache();
  });

  it("resolves known IDs in deterministic order while preserving provenance", () => {
    trainingEvidenceRepository.add([record("later", "2026-07-12T09:00:00.000Z"), record("earlier")]);

    expect(trainingEvidenceRepository.list().map((item) => item.id)).toEqual(["earlier", "later"]);
    expect(trainingEvidenceRepository.resolve(["later", "earlier", "later"])).toEqual({
      records: [record("earlier"), record("later", "2026-07-12T09:00:00.000Z")],
      missingIds: [],
    });
  });

  it("rejects duplicate IDs without changing the canonical record", () => {
    trainingEvidenceRepository.add([record("same")]);
    const result = trainingEvidenceRepository.add([{ ...record("same"), notes: ["Different record."] }]);

    expect(result.addedIds).toEqual([]);
    expect(result.duplicateIds).toEqual(["same"]);
    expect(trainingEvidenceRepository.findById("same")?.notes).toEqual(["Completed workout evidence."]);
  });

  it("reports unknown IDs explicitly and keeps returned records immutable from caller mutation", () => {
    trainingEvidenceRepository.add([record("known")]);
    const result = trainingEvidenceRepository.resolve(["missing", "known"]);
    result.records[0]!.notes.push("Caller mutation");

    expect(result.missingIds).toEqual(["missing"]);
    expect(trainingEvidenceRepository.findById("missing")).toBeNull();
    expect(trainingEvidenceRepository.findById("known")?.notes).toEqual(["Completed workout evidence."]);
  });
});
