import { describe, expect, it } from "vitest";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { recordCanonicalPerformedWork } from "@/application/training/canonical-recorded-session-application";

describe("canonical post-set coaching", () => {
  it("returns one athlete-facing next instruction after valid work", () => {
    canonicalRecordedSessionLedger.clear();
    const session: any = { schemaVersion: "canonical_recorded_session_v1", recordedSessionId: "coach-session", plannedSessionId: "planned", planId: "plan", startRevision: 1, macrocycleId: "macro", mesocycleId: "meso", microcycleId: "micro", role: "Push", prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", slots: [{ id: "slot", exerciseId: "press", settings: { requiredSets: 2 }, rest: { seconds: 90 } }] }, prescriptionHash: "hash", provenance: {}, athleteId: "athlete", version: 0, status: "started", createdAt: "2026-01-01T00:00:00.000Z" };
    canonicalRecordedSessionLedger.create(session, "create");
    canonicalRecordedSessionLedger.append("coach-session", { eventId: "started", aggregateId: "coach-session", expectedVersion: 0, type: "started", occurredAt: "2026-01-01T00:00:00.000Z", operationId: "start", payload: {} });
    const result = recordCanonicalPerformedWork({ planId: "plan", expectedPlanRevision: 1, recordedSessionId: "coach-session", expectedLedgerVersion: 0, operationId: "set", occurredAt: "2026-01-01T00:01:00.000Z", provenance: "test", slotId: "slot", exerciseId: "press", setId: "set", setOrder: 1, reps: 8, load: 80, unit: "kg", completion: "complete" });
    expect(result.nextInstruction).toBe("Rest 90 sec, then repeat 80 kg × 8");
  });
});
