import { beforeEach, describe, expect, it } from "vitest";
import { completeCanonicalSession, pauseCanonicalSession, recordCanonicalPerformedWork, resumeCanonicalSession } from "@/application/training/canonical-recorded-session-application";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";

const session = { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "train-coverage", plannedSessionId: "planned-1", planId: "plan-1", startRevision: 1, macrocycleId: "macro", mesocycleId: "meso", microcycleId: "micro", role: "Primary", prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", sessionId: "planned-1", role: "Primary", slots: [{ id: "slot-1", index: 0, exerciseId: "exercise-1", lane: "hypertrophy", method: "straight_sets", settings: { targetReps: 8 }, rest: { seconds: 120 }, progression: { rule: "double_progression" }, stopRule: { kind: "prescription" }, loadingMode: "guided", substitutionConstraints: [], reason: "canonical" }], provenance: {} }, prescriptionHash: "hash", provenance: { constructionVersion: "v2" }, athleteId: "athlete", version: 0, status: "pending" as const, createdAt: "2026-01-01T00:00:00.000Z" };

function start() {
  canonicalRecordedSessionLedger.create(session, "create");
  return canonicalRecordedSessionLedger.append(session.recordedSessionId, { eventId: "started", aggregateId: session.recordedSessionId, expectedVersion: 0, type: "started", occurredAt: "2026-01-01T00:01:00.000Z", operationId: "start", payload: {} });
}

describe("canonical Train coverage reconciliation", () => {
  beforeEach(() => { canonicalRecordedSessionLedger.clear(); canonicalProgressEvidenceRepository.clear(); });

  it("persists performed work from the immutable snapshot", () => {
    start();
    const result = recordCanonicalPerformedWork({ planId: "plan-1", expectedPlanRevision: 1, recordedSessionId: session.recordedSessionId, expectedLedgerVersion: 1, operationId: "set-1", occurredAt: "2026-01-01T00:02:00.000Z", provenance: "canonical_train", slotId: "slot-1", exerciseId: "exercise-1", setId: "set-1", setOrder: 1, reps: 8, load: 60, unit: "kg", completion: "complete" });
    expect(result.status).toBe("applied");
    expect(result.reason).toBe("performed_work_recorded");
  });

  it("rejects stale ledger writes rather than mutating local UI authority", () => {
    start();
    expect(recordCanonicalPerformedWork({ planId: "plan-1", expectedPlanRevision: 1, recordedSessionId: session.recordedSessionId, expectedLedgerVersion: 0, operationId: "stale", occurredAt: "2026-01-01T00:02:00.000Z", provenance: "canonical_train", slotId: "slot-1", exerciseId: "exercise-1", setId: "set-1", setOrder: 1, reps: 8, load: 60, unit: "kg", completion: "complete" }).reason).toBe("stale_ledger_version");
  });

  it("supports pause and explicit resume lifecycle operations", () => {
    expect(start().status).toBe("saved");
    expect(pauseCanonicalSession({ planId: "missing", expectedPlanRevision: 1, recordedSessionId: session.recordedSessionId, expectedLedgerVersion: 1, operationId: "pause", occurredAt: "2026-01-01T00:02:00.000Z", provenance: "canonical_train" }).reason).toBe("canonical_plan_unavailable");
    expect(resumeCanonicalSession({ planId: "missing", expectedPlanRevision: 1, recordedSessionId: session.recordedSessionId, expectedLedgerVersion: 1, operationId: "resume", occurredAt: "2026-01-01T00:03:00.000Z", provenance: "canonical_train" }).reason).toBe("canonical_plan_unavailable");
  });

  it("keeps completion evidence pending when the canonical plan carrier is unavailable", () => {
    start();
    const result = completeCanonicalSession({ planId: "missing", expectedPlanRevision: 1, recordedSessionId: session.recordedSessionId, expectedLedgerVersion: 1, operationId: "complete", occurredAt: "2026-01-01T00:04:00.000Z", provenance: "canonical_train" });
    expect(result.reason).toBe("session_completed");
  });

  it("keeps canonical snapshot fields free of legacy prescription authority", () => {
    expect(JSON.stringify(session.prescriptionSnapshot)).not.toMatch(/blocks|activeBlockId|TrainingYear|currentBlock/);
    expect(session.prescriptionSnapshot.slots[0].rest).toEqual({ seconds: 120 });
    expect(session.prescriptionSnapshot.slots[0].stopRule).toEqual({ kind: "prescription" });
  });
});
