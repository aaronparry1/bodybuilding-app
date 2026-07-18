import { describe, expect, it } from "vitest";
import { CANONICAL_HOME_PROJECTION_VERSION, projectCanonicalHome } from "@/application/training/canonical-home-projection";
import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";

describe("canonical Home projection", () => {
  it("projects the planned next action from an immutable canonical snapshot", () => {
    const model = plannedModel();
    const before = JSON.stringify(model);
    const result = projectCanonicalHome({ status: "ready", model, now: Date.parse("2026-01-02T10:00:00.000Z") });
    expect(result.contractVersion).toBe(CANONICAL_HOME_PROJECTION_VERSION);
    expect(result.primary).toMatchObject({ kind: "planned", title: "Upper", ctaLabel: "Start workout" });
    expect(result.actions[0]).toEqual({ type: "open_planned_session", planId: "p", planRevision: 2, sessionId: "s" });
    expect(result.programme).toMatchObject({ sessionPosition: "Session 1 of 2", completionLabel: "0 of 2 sessions completed" });
    expect(JSON.stringify(model)).toBe(before);
  });

  it("uses the same recorded facts as Train for active progress", () => {
    const model = { ...plannedModel(), plannedSessions: [], nextSession: null, activeRecordedSession: { recordedSessionId: "r", role: "Upper", macrocycleId: "ma", mesocycleId: "m", microcycleId: "mi", status: "paused", prescribedSlots: 1, performedSets: 1, performedReps: 8, performedLoad: 60, completedSlots: 1, partialSlots: 0, missedSlots: 0, substitutions: [], progressEvidence: "complete" as const, restorationIdentity: "canonical-recorded-session:r" } };
    const result = projectCanonicalHome({ status: "ready", model, activeAggregate: activeAggregate(), now: Date.parse("2026-01-01T10:10:00.000Z") });
    expect(result.primary).toMatchObject({ kind: "active", title: "Upper", detail: "1 of 2 working sets complete", ctaLabel: "Resume workout", workout: { lifecycle: "paused", completedSetCount: 1, workingSetCount: 2, progressPercent: 50 } });
    expect(result.actions[0]).toEqual({ type: "resume_recorded_session", planId: "p", planRevision: 2, sessionId: "r" });
  });

  it("distinguishes completed today, rest, empty, storage, and recoverable ledger states", () => {
    const completed = { recordedSessionId: "done", role: "Upper", macrocycleId: "ma", mesocycleId: "m", microcycleId: "mi", status: "completed", prescribedSlots: 1, performedSets: 2, performedReps: 16, performedLoad: 120, completedSlots: 1, partialSlots: 0, missedSlots: 0, substitutions: [], completedAt: "2026-01-02T09:00:00.000Z", progressEvidence: "complete" as const, restorationIdentity: "canonical-recorded-session:done" };
    const withHistory = { ...plannedModel(), historicalRecordedSessions: [completed] };
    expect(projectCanonicalHome({ status: "ready", model: withHistory, now: Date.parse("2026-01-02T10:00:00.000Z") }).primary?.kind).toBe("completed_today");
    expect(projectCanonicalHome({ status: "ready", model: { ...withHistory, plannedSessions: [], nextSession: null }, now: Date.parse("2026-01-03T10:00:00.000Z") }).primary?.kind).toBe("rest_day");
    expect(projectCanonicalHome({ status: "empty", model: null }).status).toBe("empty");
    expect(projectCanonicalHome({ status: "error", model: null }).status).toBe("storage_error");
    expect(projectCanonicalHome({ status: "ready", model: { ...plannedModel(), activeRecordedSession: { ...completed, status: "started" } }, activeAggregateStatus: "missing" }).status).toBe("recorded_history_recovery_required");
  });

  it("fails closed without raw legacy fields", () => {
    const serialized = JSON.stringify(projectCanonicalHome({ status: "ready", model: plannedModel() }));
    expect(serialized).not.toMatch(/blocks|activeBlockId|currentBlock|TrainingYear|progressionState/);
  });
});

function plannedModel(): CanonicalActivePlanReadModel {
  return { schemaVersion: "canonical_active_plan_read_model_v1", planId: "p", revision: 2, macrocycle: { goal: "hypertrophy", rolling: true }, mesocycle: { id: "m", position: 0, purpose: "hypertrophy" }, microcycle: { id: "mi", sequenceNumber: 1, trainingDays: 2, sessionRoles: ["Upper", "Lower"] }, plannedSessions: [{ id: "s", microcycleId: "mi", role: "Upper", planSessionIndex: 0, status: "planned", constructionVersion: "canonical_plan_v3", revision: 0, snapshot: snapshot() }], historicalRecordedSessions: [], nextSession: { id: "s", role: "Upper" }, progress: { evidenceVersion: "v1", revision: 2 } };
}

function snapshot() {
  return { schemaVersion: "canonical_session_snapshot_v3", sessionId: "s", role: "Upper", purpose: "Build controlled strength across the prescribed working sets.", planSessionIndex: 0, slots: [{ id: "slot", index: 0, exerciseId: "barbell-bench-press", method: "straight_sets", loadingMode: "guided", settings: { requiredSets: 2, repRange: { min: 8, max: 8 } }, targetReps: 8, rest: { seconds: 90 }, loadPrescription: { state: "established", loadingMode: "guided", prescribedBaseLoad: 60 } }] };
}

function activeAggregate() {
  return { session: { schemaVersion: "canonical_recorded_session_v1" as const, recordedSessionId: "r", plannedSessionId: "s", planId: "p", startRevision: 1, macrocycleId: "ma", mesocycleId: "m", microcycleId: "mi", role: "Upper", prescriptionSnapshot: snapshot(), prescriptionHash: "hash", provenance: {}, athleteId: "athlete", version: 3, status: "paused" as const, createdAt: "2026-01-01T10:00:00.000Z", startedAt: "2026-01-01T10:00:00.000Z" }, events: [{ eventId: "started", aggregateId: "r", expectedVersion: 0, type: "started" as const, occurredAt: "2026-01-01T10:00:00.000Z", operationId: "start", payload: {} }, { eventId: "set", aggregateId: "r", expectedVersion: 1, type: "performance" as const, occurredAt: "2026-01-01T10:02:00.000Z", operationId: "set", payload: { slotId: "slot", exerciseId: "barbell-bench-press", setId: "slot:set:1", setOrder: 1, reps: 8, load: 60, completion: "complete" } }, { eventId: "pause", aggregateId: "r", expectedVersion: 2, type: "paused" as const, occurredAt: "2026-01-01T10:03:00.000Z", operationId: "pause", payload: {} }] };
}
