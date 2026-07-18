import { beforeEach, describe, expect, it } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  completeCanonicalSession,
  discardCanonicalSessionAttempt,
  editCanonicalPerformedWork,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  resumeCanonicalSession,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { exerciseLibrary } from "@/domain/training/presets";

describe("canonical active Train lifecycle", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
    canonicalRestTimerRepository.clear();
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
    expect(evidence[0]?.observations).toMatchObject({ reps: 5, load: 77.5, exerciseId: slot.exerciseId, completion: "complete" });
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
function firstSlot(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown> { const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : []; if (!slots[0]) throw new Error("slot missing"); return slots[0]; }
