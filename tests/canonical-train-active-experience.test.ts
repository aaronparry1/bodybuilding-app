import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  completeCanonicalSession,
  discardCanonicalSessionAttempt,
  discardLatestCanonicalSessionAttempt,
  editCanonicalPerformedWork,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  resumeCanonicalSession,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { canonicalWorkoutDiscardIntentRepository } from "@/data/local/canonical-workout-discard-intent-repository";
import { jsonStore } from "@/data/local/json-store";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical active Train lifecycle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
    canonicalRestTimerRepository.clear();
    canonicalWorkoutDiscardIntentRepository.clear();
  });

  it("pauses and restores its persisted rest timer, then discards only the active attempt", () => {
    const first = startNext("first");
    const firstWork = recordFirstSet(first, "first-work", 80, 6);
    expect(completeCanonicalSession(command(first.planId, first.planRevision, first.recordedSessionId, firstWork.ledgerVersion!, "first-complete")).status).toBe("applied");
    const historical = canonicalRecordedSessionLedger.get(first.recordedSessionId);
    expect(historical.status === "found" && historical.session.status).toBe("completed");

    const second = startNext("second");
    const secondWork = recordFirstSet(second, "second-work", 55, 10);
    expect(canonicalRestTimerRepository.get(second.recordedSessionId)?.state).toBe("running");

    const paused = pauseCanonicalSession(command(second.planId, second.planRevision, second.recordedSessionId, secondWork.ledgerVersion!, "pause"));
    expect(paused.status).toBe("applied");
    expect(canonicalRestTimerRepository.get(second.recordedSessionId)?.state).toBe("paused");
    const resumed = resumeCanonicalSession(command(second.planId, paused.planRevision!, second.recordedSessionId, paused.ledgerVersion!, "resume"));
    expect(resumed.status).toBe("applied");
    expect(canonicalRestTimerRepository.get(second.recordedSessionId)?.state).toBe("running");

    const discarded = discardCanonicalSessionAttempt(command(second.planId, resumed.planRevision!, second.recordedSessionId, resumed.ledgerVersion!, "discard"));
    expect(discarded).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });
    expect(canonicalRecordedSessionLedger.get(second.recordedSessionId).status).toBe("not_found");
    expect(canonicalRestTimerRepository.get(second.recordedSessionId)).toBeNull();
    expect(canonicalProgressEvidenceRepository.list(second.planId).every((evidence) => evidence.sessionId !== second.recordedSessionId)).toBe(true);
    const model = canonicalActivePlanState.getReadModel();
    expect(model?.plannedSessions.some((session) => session.id === second.plannedSessionId && session.status === "planned")).toBe(true);
    const preserved = canonicalRecordedSessionLedger.get(first.recordedSessionId);
    expect(preserved.status === "found" && preserved.session.status).toBe("completed");
  });

  it("repairs one exact completed set without duplicating ledger, evidence, completion, or display facts", () => {
    const started = startNext("edit");
    const recorded = recordFirstSet(started, "edit-work", 80, 6);
    const before = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (before.status !== "found") throw new Error("missing recorded session");
    const slot = firstSlot(before.session.prescriptionSnapshot);
    const setId = `${String(slot.id)}:set:1`;
    const edited = editCanonicalPerformedWork({
      ...command(started.planId, started.planRevision, started.recordedSessionId, recorded.ledgerVersion!, "edit"),
      slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId, setOrder: 1, reps: 5, load: 77.5, unit: "kg", completion: "complete",
    });
    expect(edited.status).toBe("applied");
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (aggregate.status !== "found") throw new Error("missing edited session");
    expect(aggregate.events.filter((event) => event.type === "performance")).toHaveLength(1);
    expect(aggregate.events.filter((event) => event.type === "repair")).toHaveLength(1);
    const presentation = projectCanonicalWorkoutPresentation({ session: aggregate.session, snapshot: aggregate.session.prescriptionSnapshot, events: aggregate.events });
    expect(presentation.completedSets).toBe(1);
    expect(presentation.exercises[0]?.sets[0]).toMatchObject({ actualReps: 5, actualLoad: 77.5, state: "completed" });
    expect(deriveCanonicalCompletionSummary(aggregate.session, aggregate.events)).toMatchObject({ performedSets: 1, performedReps: 5, performedLoad: 77.5 });
    const evidence = canonicalProgressEvidenceRepository.list(started.planId).filter((item) => item.sessionId === started.recordedSessionId && item.kind === "performance");
    expect(evidence).toHaveLength(1);
    expect(evidence[0]?.observations).toMatchObject({ reps: 5, load: 77.5, exerciseId: slot.exerciseId, completion: "complete", method: slot.method, methodPolicyId: "canonical_training_method_policy_v1" });
  });

  it("treats an identical repeated set command as idempotent and rejects a conflicting duplicate", () => {
    const started = startNext("duplicate");
    const first = recordFirstSet(started, "duplicate-first", 70, 8);
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (aggregate.status !== "found") throw new Error("missing duplicate session");
    const slot = firstSlot(aggregate.session.prescriptionSnapshot);
    const base = { ...command(started.planId, started.planRevision, started.recordedSessionId, first.ledgerVersion!, "duplicate-retry"), slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${String(slot.id)}:set:1`, setOrder: 1, reps: 8, load: 70, unit: "kg", completion: "complete" as const };
    expect(recordCanonicalPerformedWork(base)).toMatchObject({ status: "idempotent", reason: "performed_work_already_recorded" });
    expect(recordCanonicalPerformedWork({ ...base, operationId: "duplicate-conflict", load: 72.5 })).toMatchObject({ status: "rejected", reason: "performed_set_conflict" });
    const after = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    expect(after.status === "found" && after.events.filter((event) => event.type === "performance")).toHaveLength(1);
  });

  it("discards a first-exposure attempt before performed work, remains idempotent, and survives rehydration", () => {
    const started = startNext("discard-empty");
    const first = discardLatestCanonicalSessionAttempt(latestDiscard(started, "discard-empty-confirm"));
    expect(first).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });
    const repeated = discardLatestCanonicalSessionAttempt(latestDiscard(started, "discard-empty-repeat"));
    expect(repeated).toMatchObject({ status: "idempotent", reason: "discard_already_applied" });
    canonicalActivePlanState.hydrate();
    const model = canonicalActivePlanState.getReadModel();
    expect(model?.activeRecordedSession).toBeNull();
    expect(model?.plannedSessions.filter((session) => session.id === started.plannedSessionId)).toHaveLength(1);
    expect(model?.plannedSessions.find((session) => session.id === started.plannedSessionId)?.status).toBe("planned");
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("not_found");
  });

  it("fails storage deletion safely without changing the active plan or hiding the attempt", () => {
    const started = startNext("discard-storage");
    const before = canonicalActivePlanState.getReadModel();
    vi.spyOn(canonicalRecordedSessionLedger, "deleteActive").mockReturnValueOnce({ status: "storage_failure", reason: "recorded_session_storage_write_failed" });
    const result = discardLatestCanonicalSessionAttempt(latestDiscard(started, "discard-storage-confirm"));
    expect(result).toEqual({ status: "retryable", reason: "recorded_session_storage_write_failed" });
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(before?.revision);
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession?.recordedSessionId).toBe(started.recordedSessionId);
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("found");
  });

  it("compensates the ledger exactly when the carrier CAS fails", () => {
    const started = startNext("discard-cas");
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (aggregate.status !== "found") throw new Error("recorded session missing");
    vi.spyOn(canonicalActivePlanV2Repository, "saveAtomically").mockReturnValueOnce({ status: "conflict", reason: "stale_revision" });
    const result = discardLatestCanonicalSessionAttempt(latestDiscard(started, "discard-cas-confirm"));
    expect(result).toEqual({ status: "retryable", reason: "discard_carrier_update_pending" });
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId)).toEqual(aggregate);
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession?.recordedSessionId).toBe(started.recordedSessionId);
  });

  it("reconciles a process interruption after ledger deletion and before carrier CAS", () => {
    const started = startNext("discard-crash-window");
    recordFirstSet(started, "discard-crash-work", 72.5, 8);
    const before = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (before.status !== "found") throw new Error("recorded session missing");

    vi.spyOn(canonicalActivePlanV2Repository, "saveAtomically").mockImplementationOnce(() => {
      throw new Error("simulated_process_interruption_after_ledger_delete");
    });
    expect(() =>
      discardLatestCanonicalSessionAttempt(latestDiscard(started, "discard-crash-confirm")),
    ).toThrow("simulated_process_interruption_after_ledger_delete");
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalWorkoutDiscardIntentRepository.get(started.recordedSessionId).status).toBe("found");
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({
      status: "saved",
      carrier: {
        revision: started.planRevision,
        recordedSessionReferences: expect.arrayContaining([
          expect.objectContaining({ sessionId: started.recordedSessionId }),
        ]),
      },
    });

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(canonicalWorkoutDiscardIntentRepository.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalProgressEvidenceRepository.list(started.planId).some(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toBe(false);
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).toBeNull();
    expect(canonicalActivePlanState.getReadModel()?.plannedSessions.filter(
      (session) => session.id === started.plannedSessionId,
    )).toHaveLength(1);
  });

  it("finishes cleanup after the carrier commits and cleanup is interrupted", () => {
    const started = startNext("discard-cleanup-window");
    recordFirstSet(started, "discard-cleanup-work", 60, 10);
    vi.spyOn(canonicalProgressEvidenceRepository, "removeSession").mockImplementation(() => {
      throw new Error("simulated_cleanup_interruption");
    });

    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "discard-cleanup-confirm"),
    )).toMatchObject({ status: "retryable", reason: "discard_cleanup_pending" });
    expect(canonicalWorkoutDiscardIntentRepository.get(started.recordedSessionId).status).toBe("found");
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).toBeNull();
    expect(canonicalActivePlanState.getReadModel()?.plannedSessions.some(
      (session) => session.id === started.plannedSessionId,
    )).toBe(true);

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(canonicalWorkoutDiscardIntentRepository.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalProgressEvidenceRepository.list(started.planId).some(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toBe(false);
    expect(canonicalRestTimerRepository.get(started.recordedSessionId)).toBeNull();
  });

  it("preserves the exact planned prescription after edited and substituted work is discarded", () => {
    const started = startNext("discard-edited-substituted");
    const beforePlan = canonicalActivePlanState.getPlannedSession(started.plannedSessionId);
    expect(beforePlan).toBeNull();
    const performed = recordFirstSet(started, "discard-edited-work", 65, 9);
    const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (aggregate.status !== "found") throw new Error("recorded session missing");
    const slot = firstSlot(aggregate.session.prescriptionSnapshot);
    const setId = `${String(slot.id)}:set:1`;
    expect(editCanonicalPerformedWork({
      ...command(started.planId, started.planRevision, started.recordedSessionId, performed.ledgerVersion!, "discard-edit"),
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId,
      setOrder: 1,
      reps: 8,
      load: 62.5,
      unit: "kg",
      completion: "complete",
      substitutionId: "replacement-exercise-evidence",
    }).status).toBe("applied");

    const immutableSnapshot = aggregate.session.prescriptionSnapshot;
    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "discard-edited-confirm"),
    )).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });
    const restored = canonicalActivePlanState.getPlannedSession(started.plannedSessionId);
    expect(restored?.prescriptionSnapshot).toEqual(immutableSnapshot);
    expect(canonicalProgressEvidenceRepository.list(started.planId).filter(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toHaveLength(0);
  });

  it("allows the same planned workout to start cleanly after discard without duplicate timeline entries", () => {
    const started = startNext("discard-restart-later");
    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "discard-restart-later-confirm"),
    ).status).toBe("applied");
    const model = canonicalActivePlanState.getReadModel();
    expect(model?.plannedSessions.filter(
      (session) => session.id === started.plannedSessionId,
    )).toHaveLength(1);

    const restarted = startNext("discard-restart-later-new-attempt");
    expect(restarted.plannedSessionId).toBe(started.plannedSessionId);
    expect(canonicalRecordedSessionLedger.get(restarted.recordedSessionId)).toMatchObject({
      status: "found",
      session: { status: "started", version: 1 },
    });
    expect(canonicalProgressEvidenceRepository.list(restarted.planId).filter(
      (evidence) => evidence.sessionId === restarted.recordedSessionId,
    )).toHaveLength(0);
  });

  it("rejects stale low-level revisions and never discards completed history", () => {
    const started = startNext("discard-stale");
    expect(discardCanonicalSessionAttempt(command(started.planId, started.planRevision - 1, started.recordedSessionId, 1, "discard-stale-confirm"))).toMatchObject({ status: "rejected", reason: "stale_plan_revision" });
    const recorded = recordFirstSet(started, "discard-complete-work", 60, 8);
    const completed = completeCanonicalSession(command(started.planId, started.planRevision, started.recordedSessionId, recorded.ledgerVersion!, "discard-complete"));
    expect(completed.status).toBe("applied");
    const current = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (current.status !== "found") throw new Error("completed session missing");
    const currentPlanRevision = canonicalActivePlanState.getReadModel()?.revision;
    if (currentPlanRevision === undefined) throw new Error("current plan missing");
    expect(discardCanonicalSessionAttempt(command(started.planId, currentPlanRevision, started.recordedSessionId, current.session.version, "discard-completed-history"))).toMatchObject({ status: "rejected", reason: "completed_history_cannot_be_discarded" });
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("found");
  });
});

function startNext(operation: string) {
  let model = canonicalActivePlanState.getReadModel();
  if (!model) {
    const created = canonicalActivePlanState.create({ planId: "train-active-test", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", goal: "strength_hypertrophy", macrocycleGoal: "build_muscle_and_strength", experienceLevel: "intermediate", daysPerWeek: 5, preferredSplit: "let_app_choose", equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"], units: "kg", exercises: exerciseLibrary, history: [] });
    if (created.hydration !== "hydrated" || !created.model) throw new Error(created.error ?? "plan creation failed");
    model = created.model;
  }
  const planned = model.plannedSessions.find((session) => session.status === "planned");
  if (!planned) throw new Error("planned session missing");
  const started = startCanonicalSession({ planId: model.planId, expectedPlanRevision: model.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.snapshot), operationId: operation, startedAt: `2026-01-01T0${model.revision}:00:00.000Z`, provenance: "canonical_train_test" });
  if (!started.recordedSessionId || started.planRevision === undefined) throw new Error(started.reason);
  return { planId: model.planId, planRevision: started.planRevision, plannedSessionId: planned.id, recordedSessionId: started.recordedSessionId };
}

function recordFirstSet(started: ReturnType<typeof startNext>, operationId: string, load: number, reps: number) {
  const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
  if (aggregate.status !== "found") throw new Error("recorded session missing");
  const slot = firstSlot(aggregate.session.prescriptionSnapshot);
  return recordCanonicalPerformedWork({
    ...command(started.planId, started.planRevision, started.recordedSessionId, aggregate.session.version, operationId),
    slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${String(slot.id)}:set:1`, setOrder: 1, reps, load, unit: "kg", completion: "complete",
  });
}

function command(planId: string, expectedPlanRevision: number, recordedSessionId: string, expectedLedgerVersion: number, operationId: string) { return { planId, expectedPlanRevision, recordedSessionId, expectedLedgerVersion, operationId, occurredAt: `2026-01-01T10:${String(expectedLedgerVersion).padStart(2, "0")}:00.000Z`, provenance: "canonical_train_test" }; }
function latestDiscard(started: ReturnType<typeof startNext>, operationId: string) { return { planId: started.planId, recordedSessionId: started.recordedSessionId, operationId, occurredAt: "2026-01-01T12:00:00.000Z", provenance: "canonical_train_test" }; }
function firstSlot(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown> { const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : []; if (!slots[0]) throw new Error("slot missing"); return slots[0]; }
