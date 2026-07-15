import { beforeEach, describe, expect, it } from "vitest";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { queryCanonicalExerciseHistory, queryCanonicalMuscleSummaries } from "@/application/training/canonical-analytics-queries";

const session = { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "analytics-session", plannedSessionId: "planned", planId: "analytics-plan", startRevision: 1, macrocycleId: "macro", mesocycleId: "meso", microcycleId: "micro", role: "Primary", prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", slots: [{ id: "slot", exerciseId: "ex-bench-press", index: 0 }] }, prescriptionHash: "hash", provenance: { source: "test" }, athleteId: "athlete", version: 0, status: "pending" as const, createdAt: "2026-01-01T00:00:00.000Z" };

describe("canonical analytics queries", () => {
  beforeEach(() => canonicalRecordedSessionLedger.clear());
  it("derives exercise history from immutable performance events", () => {
    expect(canonicalRecordedSessionLedger.create(session, "create").status).toBe("saved");
    expect(canonicalRecordedSessionLedger.append(session.recordedSessionId, { eventId: "start", aggregateId: session.recordedSessionId, expectedVersion: 0, type: "started", occurredAt: "2026-01-01T00:01:00.000Z", operationId: "start", payload: {} }).status).toBe("saved");
    expect(canonicalRecordedSessionLedger.append(session.recordedSessionId, { eventId: "set", aggregateId: session.recordedSessionId, expectedVersion: 1, type: "performance", occurredAt: "2026-01-01T00:02:00.000Z", operationId: "set", payload: { exerciseId: "ex-bench-press", reps: 8, load: 80, unit: "kg", completion: "complete" } }).status).toBe("saved");
    expect(queryCanonicalExerciseHistory("analytics-plan", "ex-bench-press")).toMatchObject({ frequency: 1, totalSets: 1, loadTrend: [80], bestSetTrend: [8] });
    expect(queryCanonicalMuscleSummaries("analytics-plan").find((item) => item.muscleGroup === "chest")?.sets).toBe(1);
  });
  it("returns no history instead of consulting legacy stores", () => expect(queryCanonicalExerciseHistory("missing", "ex-bench-press")).toBeNull());
});
