import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { readCanonicalPlanPresentation } from "@/application/training/canonical-plan-presentation";
import {
  discardLatestCanonicalSessionAttempt,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  resumeCanonicalSession,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalTrainSession } from "@/application/training/canonical-train-session-boundary";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { canonicalWorkoutDiscardIntentRepository } from "@/data/local/canonical-workout-discard-intent-repository";
import { jsonStore } from "@/data/local/json-store";
import { exerciseLibrary } from "@/domain/training/presets";

describe("Build 45 workout lifecycle certification", () => {
  beforeEach(() => {
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
    canonicalProgressDecisionRepository.clear();
    canonicalCoachingAttemptRepository.clear();
    canonicalRestTimerRepository.clear();
    canonicalWorkoutDiscardIntentRepository.clear();
  });

  it("requires a separate destructive confirmation and cancellation cannot invoke Discard", () => {
    const source = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
    expect(source).toContain('testID="train-request-discard"');
    expect(source).toContain('testID="train-discard-cancel"');
    expect(source).toContain('accessibilityLabel="Cancel discard" onPress={onContinue}');
    expect(source).toContain('testID="train-discard-confirm"');
    expect(source).toContain('accessibilityLabel="Discard workout" disabled={busy} onPress={onDiscard}');
  });

  it("discards multiple completed sets without creating coaching evidence or decisions", () => {
    const started = startNext("multiple-set-discard");
    const first = recordSet(started, 1, 62.5, 10, "multiple-set-1");
    expect(first.status).toBe("applied");
    const second = recordSet(started, 2, 62.5, 9, "multiple-set-2");
    expect(second.status).toBe("applied");
    expect(canonicalProgressEvidenceRepository.list(started.planId).filter(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toHaveLength(2);

    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "multiple-set-discard-confirm"),
    )).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });

    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalProgressEvidenceRepository.list(started.planId).filter(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toHaveLength(0);
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(0);
    expect(canonicalCoachingAttemptRepository.list(started.planId)).toHaveLength(0);
  });

  it("converges duplicate confirmation and rapid repeated delivery with one revision", () => {
    const started = startNext("repeated-discard");
    const first = discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "repeated-discard-confirm"),
    );
    const second = discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "repeated-discard-confirm"),
    );
    const rapidThird = discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "repeated-discard-another-delivery"),
    );

    expect(first).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });
    expect(second).toMatchObject({ status: "idempotent", reason: "discard_already_applied" });
    expect(rapidThird).toMatchObject({ status: "idempotent", reason: "discard_already_applied" });
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(started.planRevision + 1);
    expect(canonicalActivePlanState.getReadModel()?.plannedSessions.filter(
      (session) => session.id === started.plannedSessionId,
    )).toHaveLength(1);
  });

  it("survives restart before confirmation and removes every ghost after confirmation", () => {
    const started = startNext("restart-before-confirmation");
    recordSet(started, 1, 75, 8, "restart-before-confirmation-work");

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession?.recordedSessionId)
      .toBe(started.recordedSessionId);

    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "restart-after-confirmation"),
    )).toMatchObject({ status: "applied", reason: "session_attempt_discarded" });

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(canonicalActivePlanState.getReadModel()?.activeRecordedSession).toBeNull();
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId).status).toBe("not_found");
    expect(canonicalWorkoutDiscardIntentRepository.get(started.recordedSessionId).status)
      .toBe("not_found");
  });

  it("discards an old restored paused workout and clears its paused timer", () => {
    const started = startNext("old-recovered-attempt");
    const performed = recordSet(started, 1, 70, 8, "old-recovered-work");
    expect(canonicalRestTimerRepository.get(started.recordedSessionId)?.state).toBe("running");
    const paused = pauseCanonicalSession(lifecycle(
      started,
      performed.ledgerVersion!,
      "old-recovered-pause",
    ));
    expect(paused.status).toBe("applied");

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    const resumed = resumeCanonicalSession({
      ...lifecycle(started, paused.ledgerVersion!, "old-recovered-resume"),
      expectedPlanRevision: paused.planRevision!,
    });
    expect(resumed.status).toBe("applied");
    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "old-recovered-discard"),
    ).status).toBe("applied");
    expect(canonicalRestTimerRepository.get(started.recordedSessionId)).toBeNull();
  });

  it("restores the exact planned timeline and makes Home, Plan and Train agree", () => {
    const before = ensurePlan();
    const beforeTimeline = before.plannedSessions.map((session) => ({
      id: session.id,
      planSessionIndex: session.planSessionIndex,
      role: session.role,
      snapshot: session.snapshot,
    }));
    const started = startExisting(before, "projection-discard");
    recordSet(started, 1, 67.5, 9, "projection-discard-work", "replacement-exercise");

    expect(discardLatestCanonicalSessionAttempt(
      latestDiscard(started, "projection-discard-confirm"),
    ).status).toBe("applied");

    const after = canonicalActivePlanState.getReadModel();
    expect(after?.plannedSessions.map((session) => ({
      id: session.id,
      planSessionIndex: session.planSessionIndex,
      role: session.role,
      snapshot: session.snapshot,
    }))).toEqual(beforeTimeline);
    expect(after?.activeRecordedSession).toBeNull();

    const home = readCanonicalHomeProjection();
    const plan = readCanonicalPlanPresentation();
    const train = projectCanonicalTrainSession(started.planId, started.recordedSessionId);
    expect(home).toMatchObject({
      status: "ready",
      primary: {
        kind: "planned",
        ctaLabel: "Review workout",
        action: { type: "open_planned_session", sessionId: started.plannedSessionId },
      },
    });
    expect(plan.status).toBe("ready");
    expect(plan.schedule.find((session) => session.id === started.plannedSessionId))
      .toMatchObject({ status: "next" });
    expect(train).toEqual({ status: "rejected", reason: "recorded_session_not_found" });
    expect(canonicalProgressEvidenceRepository.list(started.planId).some(
      (evidence) => evidence.sessionId === started.recordedSessionId,
    )).toBe(false);
  });
});

function ensurePlan() {
  const current = canonicalActivePlanState.getReadModel();
  if (current) return current;
  const created = canonicalActivePlanState.create({
    planId: "build-45-workout-lifecycle",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    goal: "strength_hypertrophy",
    macrocycleGoal: "build_muscle_and_strength",
    experienceLevel: "intermediate",
    daysPerWeek: 5,
    preferredSplit: "let_app_choose",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    exercises: exerciseLibrary,
    history: [],
  });
  if (created.hydration !== "hydrated" || !created.model) {
    throw new Error(created.error ?? "plan creation failed");
  }
  return created.model;
}

function startNext(operationId: string) {
  return startExisting(ensurePlan(), operationId);
}

function startExisting(model: ReturnType<typeof ensurePlan>, operationId: string) {
  const planned = model.plannedSessions.find((session) => session.status === "planned");
  if (!planned) throw new Error("planned session missing");
  const started = startCanonicalSession({
    planId: model.planId,
    expectedPlanRevision: model.revision,
    plannedSessionId: planned.id,
    expectedPrescriptionHash: prescriptionHash(planned.snapshot),
    operationId,
    startedAt: "2026-01-01T08:00:00.000Z",
    provenance: "build_45_certification",
  });
  if (!started.recordedSessionId || started.planRevision === undefined) {
    throw new Error(started.reason);
  }
  return {
    planId: model.planId,
    planRevision: started.planRevision,
    plannedSessionId: planned.id,
    recordedSessionId: started.recordedSessionId,
  };
}

function recordSet(
  started: ReturnType<typeof startNext>,
  setOrder: number,
  load: number,
  reps: number,
  operationId: string,
  substitutionId?: string,
) {
  const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
  if (aggregate.status !== "found") throw new Error("recorded session missing");
  const slot = firstSlot(aggregate.session.prescriptionSnapshot);
  return recordCanonicalPerformedWork({
    ...lifecycle(started, aggregate.session.version, operationId),
    slotId: String(slot.id),
    exerciseId: String(slot.exerciseId),
    setId: `${String(slot.id)}:set:${setOrder}`,
    setOrder,
    reps,
    load,
    unit: "kg",
    completion: "complete",
    ...(substitutionId ? { substitutionId } : {}),
  });
}

function lifecycle(
  started: ReturnType<typeof startNext>,
  expectedLedgerVersion: number,
  operationId: string,
) {
  return {
    planId: started.planId,
    expectedPlanRevision: canonicalActivePlanState.getReadModel()?.revision
      ?? started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion,
    operationId,
    occurredAt: `2026-01-01T09:${String(expectedLedgerVersion).padStart(2, "0")}:00.000Z`,
    provenance: "build_45_certification",
  };
}

function latestDiscard(started: ReturnType<typeof startNext>, operationId: string) {
  return {
    planId: started.planId,
    recordedSessionId: started.recordedSessionId,
    operationId,
    occurredAt: "2026-01-01T10:00:00.000Z",
    provenance: "build_45_certification",
  };
}

function firstSlot(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const slots = Array.isArray(snapshot.slots)
    ? snapshot.slots as Record<string, unknown>[]
    : [];
  if (!slots[0]) throw new Error("slot missing");
  return slots[0];
}
