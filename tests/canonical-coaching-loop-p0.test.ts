import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import * as canonicalConstruction from "@/application/training/canonical-active-plan-construction";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlan } from "@/application/training/canonical-plan-projections";
import {
  completeCanonicalSession,
  editCanonicalPerformedWork,
  prescriptionHash,
  recordCanonicalPerformedWork,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import {
  reconcileCanonicalCompletedSessionEvidence,
  resumePendingCanonicalCoachingWork,
} from "@/application/training/canonical-completion-evidence-reconciliation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { compareCanonicalMaterialPrescriptions } from "@/domain/training/canonical-material-prescription-delta";
import { validateCanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import { exerciseLibrary } from "@/domain/training/presets";

describe("mounted canonical coaching loop P0 remediation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
    canonicalProgressDecisionRepository.clear();
    canonicalCoachingAttemptRepository.clear();
  });

  it("mounts durable completion through factual evidence, decision persistence and future Session Construction", () => {
    const started = createAndStart("mounted-calibration");
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const immutableCompletedSnapshot = JSON.stringify(started.aggregate.session.prescriptionSnapshot);
    const first = firstSlot(started.aggregate.session.prescriptionSnapshot);

    const completion = completeSuccessfulWorkout(started, 70);
    expect(completion).toMatchObject({ status: "applied", reason: "session_completed" });

    const decisions = canonicalProgressDecisionRepository.list(started.planId);
    expect(decisions).toHaveLength(1);
    expect(decisions[0]?.phaseOne).toMatchObject({
      decisionType: "establish_calibration",
      sourceRecordedSessionId: started.recordedSessionId,
      result: "future_prescription_change",
      boundedAdjustment: { numericLoadAdjustmentAuthorised: false },
    });
    expect(decisions[0]?.phaseOneApplication).toMatchObject({
      status: "applied",
      priorRevision: expect.any(Number),
      newRevision: expect.any(Number),
      resultingFutureSessionIds: expect.any(Array),
    });
    expect(decisions[0]?.phaseOneApplication?.resultingFutureSessionIds.length).toBeGreaterThan(0);
    expect(decisions[0]?.evidenceIds.length).toBeGreaterThan(1);
    expect(completion.nextInstruction).toMatch(/established/i);

    const after = canonicalActivePlanV2Repository.get();
    if (after.status !== "saved") throw new Error("updated plan missing");
    expect(after.carrier.revision).toBeGreaterThan(before.carrier.revision);
    expect(after.carrier.constructionContext?.initialEstablishedLoads[String(first.exerciseId)]).toBe(70);
    expect(after.carrier.constructionContext?.initialEstablishedLoads).not.toHaveProperty(String(first.id));
    const historical = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    expect(historical.status === "found" && JSON.stringify(historical.session.prescriptionSnapshot)).toBe(immutableCompletedSnapshot);

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    const restarted = canonicalActivePlanV2Repository.get();
    if (restarted.status !== "saved") throw new Error("restarted plan missing");
    const facts = resolveCanonicalConstructionFacts(restarted.carrier);
    expect(facts.status).toBe("ready");
    if (facts.status === "ready") {
      expect(facts.facts.establishedLoads[String(first.exerciseId)]).toBe(70);
      expect(facts.facts.loadEvidence[String(first.exerciseId)]).toMatchObject({
        exerciseId: String(first.exerciseId),
        sourceSlotId: String(first.id),
        sourceSessionId: started.recordedSessionId,
      });
    }
  });

  it("completing the same workout twice cannot apply the coaching decision twice", () => {
    const started = createAndStart("idempotent");
    const first = completeSuccessfulWorkout(started, 62.5);
    const revision = canonicalActivePlanState.getReadModel()?.revision;
    const decisions = canonicalProgressDecisionRepository.list(started.planId);
    const attempts = canonicalCoachingAttemptRepository.list(started.planId);

    const repeated = completeCanonicalSession({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: 1,
      operationId: "idempotent:completion-retry",
      occurredAt: "2026-07-25T11:00:00.000Z",
      provenance: "canonical_coaching_loop_test",
    });

    expect(first.status).toBe("applied");
    expect(repeated).toMatchObject({ status: "idempotent", reason: "completion_already_applied" });
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(revision);
    expect(canonicalProgressDecisionRepository.list(started.planId)).toEqual(decisions);
    expect(canonicalCoachingAttemptRepository.list(started.planId)).toEqual(attempts);
  });

  it("one incomplete exposure maintains the future prescription and excessive drop-off cannot progress it", () => {
    const started = createAndStart("single-failure", true);
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const beforeFuture = JSON.stringify(before.carrier.plannedSessions);

    completeWorkout(started, ({ targetReps, setOrder }) => ({ load: 80, reps: setOrder === 2 ? Math.max(0, targetReps - 2) : targetReps }));

    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOne).toMatchObject({ decisionType: "maintain", result: "explicit_no_change" });
    expect(decision?.phaseOne?.reasonCodes).toContain("rep_drop_off_blocks_progression");
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status === "saved" && JSON.stringify(after.carrier.plannedSessions)).toBe(beforeFuture);
  });

  it("qualified repeated comparable failure differs from one bad session and removes only that exercise from established loading", () => {
    const started = createAndStart("repeated-failure", true);
    const slot = firstSlot(started.aggregate.session.prescriptionSnapshot);
    canonicalProgressEvidenceRepository.record({
      schemaVersion: "canonical_progress_evidence_v1",
      evidenceId: "prior-failed-exposure",
      planId: started.planId,
      planRevision: started.planRevision,
      macrocycleId: started.aggregate.session.macrocycleId,
      mesocycleId: started.aggregate.session.mesocycleId as never,
      microcycleId: started.aggregate.session.microcycleId,
      sessionId: "prior-comparable-session",
      slotId: "prior-slot",
      athleteId: started.aggregate.session.athleteId,
      observedAt: "2026-07-18T10:00:00.000Z",
      source: "canonical_test_prior_session",
      kind: "performance",
      observations: { exerciseId: String(slot.exerciseId), load: 80, reps: 5, unit: "kg", completion: "partial", prescribedTargetReps: 8, loadingMode: "fixed_external" },
      evidenceVersion: "progress_v1",
    });

    completeWorkout(started, ({ targetReps }) => ({ load: 80, reps: Math.max(0, targetReps - 2) }));
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOne).toMatchObject({
      decisionType: "recalibrate",
      boundedAdjustment: { kind: "require_recalibration", numericLoadAdjustmentAuthorised: false },
    });
    expect(decision?.phaseOne?.boundedAdjustment.exerciseIds).toContain(String(slot.exerciseId));
    const after = canonicalActivePlanV2Repository.get();
    if (after.status !== "saved") throw new Error("updated plan missing");
    expect(after.carrier.constructionContext?.recalibrationRequiredExerciseIds).toContain(String(slot.exerciseId));
    expect(after.carrier.constructionContext?.initialEstablishedLoads).not.toHaveProperty(String(slot.exerciseId));
  });

  it("missing real equipment context persists an explicit blocked no-change decision instead of assuming a full gym", () => {
    const started = createAndStart("missing-equipment");
    const loaded = canonicalActivePlanV2Repository.get();
    if (loaded.status !== "saved") throw new Error("plan missing");
    const unsafeContextFree = {
      ...loaded.carrier,
      revision: loaded.carrier.revision + 1,
      constraints: { ...loaded.carrier.constraints, equipment: [] },
      progress: { ...loaded.carrier.progress, revision: loaded.carrier.revision + 1 },
    };
    expect(canonicalActivePlanV2Repository.saveAtomically(unsafeContextFree, loaded.carrier.revision).status).toBe("saved");
    started.planRevision = unsafeContextFree.revision;

    const beforeFuture = JSON.stringify(unsafeContextFree.plannedSessions);
    completeSuccessfulWorkout(started, 50);
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOne).toMatchObject({ decisionType: "blocked", result: "blocked_no_change" });
    expect(decision?.phaseOne?.reasonCodes).toContain("required_construction_context_missing");
    expect(decision?.explanation).toMatch(/required training information is missing/i);
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status === "saved" && JSON.stringify(after.carrier.plannedSessions)).toBe(beforeFuture);
    expect(after.status === "saved" && after.carrier.constraints.equipment).toEqual([]);
  });

  it("keeps durable completion and the prior future prescription when application CAS fails, then retries exactly once", () => {
    const started = createAndStart("application-failure-retry");
    const originalSave = canonicalActivePlanV2Repository.saveAtomically.bind(canonicalActivePlanV2Repository);
    let writeCount = 0;
    vi.spyOn(canonicalActivePlanV2Repository, "saveAtomically").mockImplementation((carrier, expectedRevision) => {
      writeCount += 1;
      if (writeCount === 2) return { status: "conflict", reason: "stale_revision" };
      return originalSave(carrier, expectedRevision);
    });
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const beforeFuture = JSON.stringify(before.carrier.plannedSessions);

    const first = completeSuccessfulWorkout(started, 67.5);
    expect(first).toMatchObject({ status: "applied", reason: "session_completed_adaptation_pending" });
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId)).toMatchObject({ status: "found", session: { status: "completed" } });
    const afterFailure = canonicalActivePlanV2Repository.get();
    if (afterFailure.status !== "saved") throw new Error("plan missing after failure");
    expect(JSON.stringify(afterFailure.carrier.plannedSessions)).toBe(beforeFuture);
    expect(canonicalCoachingAttemptRepository.list(started.planId).at(-1)?.status).toBe("pending");
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(1);
    const completedAggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
    if (completedAggregate.status !== "found") throw new Error("completed aggregate missing");
    const completedSlot = firstSlot(started.aggregate.session.prescriptionSnapshot);
    const performedEvidenceId = `${started.recordedSessionId}:evidence:${String(completedSlot.id)}:set:1`;
    const performedEvidenceBefore = canonicalProgressEvidenceRepository.get(performedEvidenceId);
    expect(editCanonicalPerformedWork({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: completedAggregate.session.version,
      operationId: "application-failure-retry:late-edit",
      occurredAt: "2026-07-25T10:45:00.000Z",
      provenance: "canonical_coaching_loop_test",
      slotId: String(completedSlot.id),
      exerciseId: String(completedSlot.exerciseId),
      setId: `${String(completedSlot.id)}:set:1`,
      setOrder: 1,
      reps: 99,
      load: 99,
      unit: "kg",
      completion: "complete",
    })).toMatchObject({ status: "rejected", reason: "performed_work_edit_not_allowed" });
    expect(canonicalProgressEvidenceRepository.get(performedEvidenceId)).toEqual(performedEvidenceBefore);

    vi.restoreAllMocks();
    const retry = completeCanonicalSession({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: 0,
      operationId: "application-failure-retry:retry",
      occurredAt: "2026-07-25T11:00:00.000Z",
      provenance: "canonical_coaching_loop_test",
    });
    expect(retry).toMatchObject({ status: "idempotent", reason: "completion_already_applied" });
    expect(canonicalCoachingAttemptRepository.list(started.planId).at(-1)?.status).toBe("applied");
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(1);
    const appliedRevision = canonicalActivePlanState.getReadModel()?.revision;
    const secondRetry = completeCanonicalSession({
      planId: started.planId,
      expectedPlanRevision: 0,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: 0,
      operationId: "application-failure-retry:second-retry",
      occurredAt: "2026-07-25T11:05:00.000Z",
      provenance: "canonical_coaching_loop_test",
    });
    expect(secondRetry.status).toBe("idempotent");
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(appliedRevision);
  });

  it("preserves typed limitations through future reconstruction and ignores substituted or non-base-unit load evidence", () => {
    const limitation = "exclude_exercise:ex-donkey-calf-raise";
    const started = createAndStart("context-and-load-boundary", { limitations: [limitation] });
    const slot = firstSlot(started.aggregate.session.prescriptionSnapshot);
    const unrelatedExercise = exerciseLibrary.find((exercise) => exercise.id !== slot.exerciseId)!;
    for (const [suffix, unit, substitutionId] of [["substituted", "kg", "swap-1"], ["display-unit", "lb", null]] as const) {
      canonicalProgressEvidenceRepository.record({
        schemaVersion: "canonical_progress_evidence_v1",
        evidenceId: `${started.planId}:${suffix}`,
        planId: started.planId,
        planRevision: started.planRevision,
        macrocycleId: started.aggregate.session.macrocycleId,
        mesocycleId: started.aggregate.session.mesocycleId as never,
        microcycleId: started.aggregate.session.microcycleId,
        sessionId: `${started.planId}:${suffix}:session`,
        slotId: `${started.planId}:${suffix}:slot`,
        athleteId: started.aggregate.session.athleteId,
        observedAt: "2026-07-24T09:00:00.000Z",
        source: "canonical_identity_boundary_test",
        kind: "performance",
        observations: { exerciseId: unrelatedExercise.id, load: 220, reps: 8, unit, completion: "complete", prescribedTargetReps: 8, loadingMode: "fixed_external", substitutionId },
        evidenceVersion: "progress_v1",
      });
    }
    completeSuccessfulWorkout(started, 55);
    const after = canonicalActivePlanV2Repository.get();
    if (after.status !== "saved") throw new Error("plan missing");
    expect(after.carrier.constructionContext?.limitations).toContain(limitation);
    expect(after.carrier.constructionContext?.initialEstablishedLoads).not.toHaveProperty(unrelatedExercise.id);
    expect(after.carrier.plannedSessions.every((session) => JSON.stringify(session.prescriptionSnapshot).includes(limitation))).toBe(true);
  });

  it("Home, Plan and Train resolve the same regenerated future-session identity", () => {
    const started = createAndStart("presentation-consistency");
    completeSuccessfulWorkout(started, 65);
    canonicalActivePlanState.hydrate();
    const model = canonicalActivePlanState.getReadModel();
    if (!model?.nextSession) throw new Error("next session missing");
    const home = readCanonicalHomeProjection({ now: Date.parse("2026-07-26T08:00:00.000Z") });
    const plan = projectCanonicalPlan(model);
    const train = canonicalActivePlanState.getPlannedSession(model.nextSession.id);
    if (!train) throw new Error("Train session missing");
    const trainPresentation = projectCanonicalWorkoutPresentation({ session: null, snapshot: train.prescriptionSnapshot });

    expect(home.primary?.action?.sessionId).toBe(model.nextSession.id);
    expect(plan.nextActionableSession?.id).toBe(model.nextSession.id);
    expect(train.id).toBe(model.nextSession.id);
    expect(trainPresentation.id).toBe(model.nextSession.id);
    expect(model.progress.latestDecision?.sourceRecordedSessionId).toBe(started.recordedSessionId);
  });

  it("does not claim an applied coaching change when reconstruction is materially equivalent", () => {
    const started = createAndStart("truthful-no-op", {
      experienceLevel: "advanced",
      macrocycleGoal: "build_muscle",
      goal: "hypertrophy",
      daysPerWeek: 5,
    });
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    vi.spyOn(canonicalConstruction, "constructCanonicalActivePlanFromCanonicalInputs").mockReturnValue({
      status: "constructed",
      carrier: before.carrier,
    });
    const completion = completeSuccessfulWorkout(started, 80);
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    const receipt = decision?.phaseOneApplication;
    expect(receipt?.schemaVersion).toBe("canonical_coaching_application_receipt_v2");
    if (receipt?.schemaVersion !== "canonical_coaching_application_receipt_v2") throw new Error("v2 receipt missing");
    expect(receipt.status).toBe("unchanged");
    expect(receipt.actualResult).toBe("explicit_no_change");
    expect(receipt.reasonCode).toBe("material_prescription_delta_absent");
    expect(receipt.materialDeltas).toEqual([]);
    expect(validateCanonicalProgressDecision({
      ...decision,
      phaseOneApplication: { ...receipt, status: "blocked" },
    })).toMatchObject({ status: "invalid", reason: "invalid_phase_one_application_receipt" });
    expect(completion.nextInstruction).toMatch(/materially equivalent/i);
    expect(completion.nextInstruction).not.toMatch(/progress|increas|advanced/i);
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status === "saved" && after.carrier.revision).toBe(receipt.priorRevision);
    expect(receipt.newRevision).toBe(receipt.priorRevision);

    const command = {
      planId: decision.planId,
      expectedPlanRevision: receipt.priorRevision,
      macrocycleId: decision.macrocycleId,
      mesocycleId: decision.mesocycleId,
      microcycleId: decision.microcycleId,
      decisionId: decision.decisionId,
      evaluationId: decision.evaluationId,
      expectedEvidenceIds: decision.evidenceIds,
    };
    const firstReplay = canonicalActivePlanState.applyProgressDecision(command);
    const concurrentReplay = canonicalActivePlanState.applyProgressDecision(command);
    expect(firstReplay).toMatchObject({ status: "unchanged", priorRevision: receipt.priorRevision, newRevision: receipt.priorRevision });
    expect(concurrentReplay).toEqual(firstReplay);
    expect(canonicalActivePlanV2Repository.get()).toEqual(after);
  });

  it("ignores generated metadata but detects exact prescription changes", () => {
    const started = createAndStart("material-comparator");
    const loaded = canonicalActivePlanV2Repository.get();
    if (loaded.status !== "saved") throw new Error("plan missing");
    const before = loaded.carrier.plannedSessions;
    const metadataOnly = before.map((session) => ({
      ...session,
      id: `${session.id}:regenerated`,
      revision: session.revision + 1,
      prescriptionSnapshot: {
        ...session.prescriptionSnapshot,
        provenance: { source: "new-metadata" },
        slots: sessionSlots(session.prescriptionSnapshot).map((slot) => ({
          ...slot,
          progression: {
            ...(slot.progression as Record<string, unknown>),
            staleRevision: "2099-01-01T00:00:00.000Z",
          },
        })),
      },
    }));
    expect(compareCanonicalMaterialPrescriptions(before, metadataOnly)).toEqual({ status: "unchanged", deltas: [] });

    const changed = metadataOnly.map((session, sessionIndex) => sessionIndex ? session : {
      ...session,
      prescriptionSnapshot: {
        ...session.prescriptionSnapshot,
        slots: sessionSlots(session.prescriptionSnapshot).map((slot, slotIndex) => slotIndex ? slot : {
          ...slot,
          exactTargets: (slot.exactTargets as number[]).map((target, index) => index ? target : target + 1),
        }),
      },
    });
    const comparison = compareCanonicalMaterialPrescriptions(before, changed);
    expect(comparison.status).toBe("changed");
    expect(comparison.deltas.some((delta) => delta.field.includes("exactTargets"))).toBe(true);

    const setChanged = metadataOnly.map((session, sessionIndex) => sessionIndex ? session : {
      ...session,
      prescriptionSnapshot: {
        ...session.prescriptionSnapshot,
        slots: sessionSlots(session.prescriptionSnapshot).map((slot, slotIndex) => slotIndex ? slot : {
          ...slot,
          settings: { ...(slot.settings as Record<string, unknown>), requiredSets: Number((slot.settings as Record<string, unknown>).requiredSets) + 1 },
        }),
      },
    });
    expect(compareCanonicalMaterialPrescriptions(before, setChanged).deltas.some((delta) => delta.field.includes("requiredSets"))).toBe(true);

    const loadChanged = metadataOnly.map((session, sessionIndex) => sessionIndex ? session : {
      ...session,
      prescriptionSnapshot: {
        ...session.prescriptionSnapshot,
        slots: sessionSlots(session.prescriptionSnapshot).map((slot, slotIndex) => slotIndex ? slot : { ...slot, prescribedLoad: 82.5 }),
      },
    });
    expect(compareCanonicalMaterialPrescriptions(before, loadChanged).deltas.some((delta) => delta.field === "slots[0].prescribedLoad")).toBe(true);

    const displayUnitOnly = before.map((session) => ({
      ...session,
      prescriptionSnapshot: {
        ...session.prescriptionSnapshot,
        slots: sessionSlots(session.prescriptionSnapshot).map((slot) => ({
          ...slot,
          settings: { ...(slot.settings as Record<string, unknown>), unit: "lb" },
        })),
      },
    }));
    expect(compareCanonicalMaterialPrescriptions(before, displayUnitOnly)).toEqual({ status: "unchanged", deltas: [] });
    expect(started.recordedSessionId).toBeTruthy();
  });

  it("keeps rounded or bounded proposals truthful when the committed prescription is identical", () => {
    const started = createAndStart("rounded-bounded-no-op", true);
    const loaded = canonicalActivePlanV2Repository.get();
    if (loaded.status !== "saved") throw new Error("plan missing");
    const sameAfterRounding = loaded.carrier.plannedSessions.map((session) => ({
      ...session,
      revision: session.revision + 1,
      prescriptionSnapshot: { ...session.prescriptionSnapshot, proposedUnroundedLoad: 80.1, boundedTarget: 80 },
    }));
    expect(compareCanonicalMaterialPrescriptions(loaded.carrier.plannedSessions, sameAfterRounding)).toEqual({ status: "unchanged", deltas: [] });
    expect(started.recordedSessionId).toBeTruthy();
  });

  it("reconciles missing completion evidence from the durable ledger after restart exactly once", () => {
    const started = createAndStart("completion-reconciliation");
    const originalRecord = canonicalProgressEvidenceRepository.record.bind(canonicalProgressEvidenceRepository);
    let failed = false;
    vi.spyOn(canonicalProgressEvidenceRepository, "record").mockImplementation((evidence) => {
      if (evidence.kind === "completion" && !failed) {
        failed = true;
        return { status: "invalid" as const, reason: "fault_injected_completion_evidence_write" };
      }
      return originalRecord(evidence);
    });
    const completion = completeSuccessfulWorkout(started, 60);
    expect(completion).toMatchObject({ status: "retryable", reason: "completed_with_evidence_pending" });
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId)).toMatchObject({ status: "found", session: { status: "completed" } });
    expect(canonicalCoachingAttemptRepository.list(started.planId)).toHaveLength(1);
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]).toMatchObject({
      status: "pending",
      evidenceState: "pending",
      decisionState: "pending",
      applicationState: "pending",
    });

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    const resumed = resumePendingCanonicalCoachingWork(started.planId);
    expect(resumed).toHaveLength(1);
    expect(resumed[0]?.status).toMatch(/reconciled|already_complete/);
    expect(canonicalProgressEvidenceRepository.list(started.planId).some((evidence) => evidence.kind === "completion" && evidence.sessionId === started.recordedSessionId)).toBe(true);
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(1);
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]).toMatchObject({
      evidenceState: "complete",
      decisionState: "persisted",
    });
    const revision = canonicalActivePlanState.getReadModel()?.revision;
    expect(resumePendingCanonicalCoachingWork(started.planId)).toEqual([]);
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(1);
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(revision);
  });

  it("reconstructs the latest repaired completed-set facts before a pending adaptation retry", () => {
    const started = createAndStart("repaired-set-reconciliation");
    const slot = firstSlot(started.aggregate.session.prescriptionSnapshot);
    const target = Number((slot.exactTargets as number[] | undefined)?.[0] ?? slot.targetReps ?? 8);
    const recorded = recordCanonicalPerformedWork({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: started.aggregate.session.version,
      operationId: "repair-reconciliation:record",
      occurredAt: "2026-07-26T08:01:00.000Z",
      provenance: "p0_reconciliation_test",
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId: "repaired-set",
      setOrder: 1,
      reps: target,
      load: 60,
      unit: "kg",
      completion: "complete",
    });
    expect(recorded.status).toBe("applied");
    const edited = editCanonicalPerformedWork({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: recorded.ledgerVersion!,
      operationId: "repair-reconciliation:edit",
      occurredAt: "2026-07-26T08:02:00.000Z",
      provenance: "p0_reconciliation_test",
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId: "repaired-set",
      setOrder: 1,
      reps: target + 1,
      load: 62.5,
      unit: "kg",
      completion: "complete",
    });
    expect(edited.status).toBe("applied");

    const originalRecord = canonicalProgressEvidenceRepository.record.bind(canonicalProgressEvidenceRepository);
    let failed = false;
    vi.spyOn(canonicalProgressEvidenceRepository, "record").mockImplementation((evidence) => {
      if (evidence.kind === "completion" && !failed) {
        failed = true;
        return { status: "invalid" as const, reason: "fault_injected_completion_evidence_write" };
      }
      return originalRecord(evidence);
    });
    expect(completeCanonicalSession({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: edited.ledgerVersion!,
      operationId: "repair-reconciliation:complete",
      occurredAt: "2026-07-26T08:03:00.000Z",
      provenance: "p0_reconciliation_test",
    })).toMatchObject({ status: "retryable", reason: "completed_with_evidence_pending" });

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(resumePendingCanonicalCoachingWork(started.planId)).toHaveLength(1);
    expect(canonicalProgressEvidenceRepository.get(`${started.recordedSessionId}:evidence:repaired-set`)).toMatchObject({
      status: "found",
      evidence: {
        observations: {
          reps: target + 1,
          load: 62.5,
        },
      },
    });
  });

  it("fails closed when durable performed work cannot be matched to the immutable prescription", () => {
    const started = createAndStart("irreconstructible-completion");
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const priorFuture = JSON.stringify(before.carrier.plannedSessions);
    const impossible = canonicalRecordedSessionLedger.append(started.recordedSessionId, {
      eventId: `${started.recordedSessionId}:performance:unknown`,
      aggregateId: started.recordedSessionId,
      expectedVersion: started.aggregate.session.version,
      type: "performance",
      occurredAt: "2026-07-26T08:05:00.000Z",
      operationId: "fault:irreconstructible-performance",
      payload: {
        setId: "unknown-set",
        slotId: "unknown-slot",
        exerciseId: "unknown-exercise",
        setOrder: 1,
        reps: 8,
        load: 60,
        unit: "kg",
        completion: "complete",
      },
    });
    expect(impossible.status).toBe("saved");
    const completion = completeCanonicalSession({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: impossible.status === "saved" ? impossible.session.version : -1,
      operationId: "fault:complete-irreconstructible",
      occurredAt: "2026-07-26T08:10:00.000Z",
      provenance: "p0_fault_injection",
    });
    expect(completion).toMatchObject({ status: "applied", reason: "session_completed" });
    expect(reconcileCanonicalCompletedSessionEvidence({
      planId: started.planId,
      recordedSessionId: started.recordedSessionId,
    })).toMatchObject({ status: "already_complete" });
    const after = canonicalActivePlanV2Repository.get();
    expect(after.status === "saved" && JSON.stringify(after.carrier.plannedSessions)).toBe(priorFuture);
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOne).toMatchObject({
      decisionType: "blocked",
      result: "blocked_no_change",
      reasonCodes: ["performed_work_identity_unavailable"],
    });
    expect(decision?.phaseOneApplication).toMatchObject({
      schemaVersion: "canonical_coaching_application_receipt_v2",
      status: "blocked",
      actualResult: "blocked_no_change",
    });
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]).toMatchObject({
      status: "blocked",
      evidenceState: "complete",
      decisionState: "persisted",
      applicationState: "blocked",
    });
    expect(resumePendingCanonicalCoachingWork(started.planId)).toEqual([]);
  });

  it("keeps evidence durable and the future unchanged when decision persistence fails, then resumes once", () => {
    const started = createAndStart("decision-write-retry");
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const priorFuture = JSON.stringify(before.carrier.plannedSessions);
    const originalSave = canonicalProgressDecisionRepository.save.bind(canonicalProgressDecisionRepository);
    let failed = false;
    vi.spyOn(canonicalProgressDecisionRepository, "save").mockImplementation((decision) => {
      if (!failed) {
        failed = true;
        return { status: "invalid" as const, reason: "fault_injected_decision_write" };
      }
      return originalSave(decision);
    });
    const completion = completeSuccessfulWorkout(started, 65);
    expect(completion.reason).toBe("session_completed_adaptation_pending");
    expect(canonicalProgressEvidenceRepository.list(started.planId).some((evidence) => evidence.kind === "completion")).toBe(true);
    const afterFailure = canonicalActivePlanV2Repository.get();
    expect(afterFailure.status === "saved" && JSON.stringify(afterFailure.carrier.plannedSessions)).toBe(priorFuture);
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]?.status).toBe("pending");

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(resumePendingCanonicalCoachingWork(started.planId)[0]?.status).toMatch(/already_complete|reconciled/);
    expect(canonicalProgressDecisionRepository.list(started.planId)).toHaveLength(1);
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]?.status).toMatch(/applied|unchanged/);
    expect(resumePendingCanonicalCoachingWork(started.planId)).toEqual([]);
  });

  it("rolls back a future change when its application receipt fails and retries the same decision once", () => {
    const started = createAndStart("receipt-write-retry");
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("plan missing");
    const priorFuture = JSON.stringify(before.carrier.plannedSessions);
    const originalRecord = canonicalProgressDecisionRepository.recordApplication.bind(canonicalProgressDecisionRepository);
    let failed = false;
    vi.spyOn(canonicalProgressDecisionRepository, "recordApplication").mockImplementation((decisionId, receipt) => {
      if (!failed) {
        failed = true;
        return { status: "invalid" as const, reason: "fault_injected_receipt_write" };
      }
      return originalRecord(decisionId, receipt);
    });
    const completion = completeSuccessfulWorkout(started, 67.5);
    expect(completion.reason).toBe("session_completed_adaptation_pending");
    const rolledBack = canonicalActivePlanV2Repository.get();
    expect(rolledBack.status === "saved" && JSON.stringify(rolledBack.carrier.plannedSessions)).toBe(priorFuture);
    expect(canonicalProgressDecisionRepository.list(started.planId)[0]?.phaseOneApplication).toBeUndefined();

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    resumePendingCanonicalCoachingWork(started.planId);
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOneApplication?.status).toBe("applied");
    const revision = canonicalActivePlanState.getReadModel()?.revision;
    expect(resumePendingCanonicalCoachingWork(started.planId)).toEqual([]);
    expect(canonicalActivePlanState.getReadModel()?.revision).toBe(revision);
  });

  it("constructs an approved successor atomically while retaining limited equipment and limitations", () => {
    const planId = "limited-transition";
    const limitation = "exclude_exercise:ex-donkey-calf-raise";
    let started = createAndStart(planId, {
      established: true,
      macrocycleGoal: "build_strength",
      goal: "strength_hypertrophy",
      daysPerWeek: 3,
      equipment: ["barbell", "dumbbell", "bodyweight", "bands"],
      limitations: [limitation],
    });
    for (let ordinal = 0; ordinal < 12; ordinal += 1) {
      if (ordinal) started = startNextExisting(planId, ordinal);
      completeSuccessfulWorkout(started, 80);
    }
    const carrier = canonicalActivePlanV2Repository.get();
    if (carrier.status !== "saved") throw new Error("transitioned plan missing");
    expect(carrier.carrier.mesocycle.id).toBe("strength_accumulation");
    expect(carrier.carrier.constraints.equipment).toEqual(["barbell", "dumbbell", "bodyweight", "bands"]);
    expect(carrier.carrier.constructionContext?.limitations).toContain(limitation);
    expect(carrier.carrier.cycleLineage?.some((entry) => entry.mesocycleId === "strength_general" && entry.status === "predecessor")).toBe(true);
    expect(carrier.carrier.plannedSessions.length).toBeGreaterThan(0);
    canonicalActivePlanState.hydrate();
    const model = canonicalActivePlanState.getReadModel();
    if (!model?.nextSession) throw new Error("transition next session missing");
    expect(readCanonicalHomeProjection({ now: Date.parse("2026-08-20T08:00:00.000Z") }).primary?.action?.sessionId).toBe(model.nextSession.id);
    expect(projectCanonicalPlan(model).nextActionableSession?.id).toBe(model.nextSession.id);
    expect(canonicalActivePlanState.getPlannedSession(model.nextSession.id)?.id).toBe(model.nextSession.id);
  }, 20_000);

  it("continues the current Mesocycle within its certified horizon when an approved successor cannot be constructed", () => {
    const originalConstruct = canonicalConstruction.constructCanonicalActivePlanFromCanonicalInputs;
    let successorFailureInjected = false;
    vi.spyOn(canonicalConstruction, "constructCanonicalActivePlanFromCanonicalInputs").mockImplementation((input) => {
      if (input.selectedMesocycleId === "strength_specific" && !successorFailureInjected) {
        successorFailureInjected = true;
        return { status: "carrier_validation_failed", reason: "session_0:no_suitable_exercise" };
      }
      return originalConstruct(input);
    });
    const planId = "successor-construction-continuity";
    let started = createAndStart(planId, {
      established: true,
      macrocycleGoal: "build_strength",
      goal: "strength_hypertrophy",
      daysPerWeek: 3,
    });
    for (let ordinal = 0; ordinal < 30; ordinal += 1) {
      if (ordinal) started = startNextExisting(planId, ordinal);
      completeSuccessfulWorkout(started, 80);
    }

    expect(successorFailureInjected).toBe(true);
    const carrier = canonicalActivePlanV2Repository.get();
    if (carrier.status !== "saved") throw new Error("continued plan missing");
    expect(carrier.carrier.mesocycle.id).toBe("strength_accumulation");
    expect(carrier.carrier.microcycle.output.sequenceNumber).toBe(11);
    expect(carrier.carrier.plannedSessions.length).toBeGreaterThan(0);
    const decision = canonicalProgressDecisionRepository.list(planId).find((candidate) =>
      candidate.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      && candidate.phaseOneApplication.reasonCode === "approved_successor_construction_unavailable_continued_within_horizon"
    );
    expect(decision?.phaseOne?.boundaryResolution).toMatchObject({
      status: "transition_approved",
      successorMesocycleId: "strength_specific",
    });
    expect(decision?.phaseOneApplication).toMatchObject({
      schemaVersion: "canonical_coaching_application_receipt_v2",
      status: "applied",
      actualResult: "future_prescription_change",
      reasonCode: "approved_successor_construction_unavailable_continued_within_horizon",
    });
    const receipt = decision?.phaseOneApplication;
    if (receipt?.schemaVersion !== "canonical_coaching_application_receipt_v2") throw new Error("truthful continuation receipt missing");
    expect(receipt.explanation).toMatch(/continues in the current phase/i);
  }, 30_000);

  it("certifies the mounted longitudinal scenario matrix without silent non-adaptation", () => {
    const results: Array<{ scenario: string; decision: string; result: string }> = [];
    const scenarios = [
      { scenario: "normal_responder", options: {}, setup: (_started: StartedFixture) => undefined, performance: "success" as const, expected: "establish_calibration" },
      { scenario: "high_responder", options: { established: true }, setup: (_started: StartedFixture) => undefined, performance: "success" as const, expected: "maintain" },
      { scenario: "repeated_stall", options: { established: true }, setup: addPriorFailedExposure, performance: "failure" as const, expected: "recalibrate" },
      { scenario: "poor_recovery", options: {}, setup: (started: StartedFixture) => addContextEvidence(started, "readiness", { freshness: "fresh", completeness: "complete", recovery: "constrained", fatigue: "systemic" }), performance: "success" as const, expected: "blocked" },
      { scenario: "missed_sessions", options: { established: true }, setup: (_started: StartedFixture) => undefined, performance: "missed_work" as const, expected: "maintain" },
      { scenario: "return_after_layoff", options: {}, setup: (started: StartedFixture) => addContextEvidence(started, "capacity", { freshness: "fresh", completeness: "complete", recovery: "ready", fatigue: "stable", recentTraining: "returning" }), performance: "success" as const, expected: "establish_calibration" },
      { scenario: "pain_or_limitation", options: { limitations: ["exclude_exercise:ex-donkey-calf-raise"] }, setup: (started: StartedFixture) => addContextEvidence(started, "pain", { location: "shoulder", status: "unresolved" }), performance: "success" as const, expected: "blocked" },
      { scenario: "limited_equipment", options: { equipment: ["barbell", "dumbbell", "bodyweight", "bands"] as const, daysPerWeek: 3 as const }, setup: (_started: StartedFixture) => undefined, performance: "success" as const, expected: "establish_calibration" },
      { scenario: "advanced_five_day_hypertrophy", options: { experienceLevel: "advanced" as const, macrocycleGoal: "build_muscle" as const, goal: "hypertrophy" as const }, setup: (_started: StartedFixture) => undefined, performance: "success" as const, expected: "establish_calibration" },
      { scenario: "powerbuilding_athlete", options: { established: true, macrocycleGoal: "build_muscle_and_strength" as const, goal: "strength_hypertrophy" as const }, setup: (_started: StartedFixture) => undefined, performance: "success" as const, expected: "maintain" },
      { scenario: "athletic_changing_sport_workload", options: { macrocycleGoal: "athletic_performance" as const, goal: "strength_hypertrophy" as const, daysPerWeek: 3 as const }, setup: (started: StartedFixture) => addContextEvidence(started, "capacity", { freshness: "fresh", completeness: "complete", recovery: "constrained", fatigue: "systemic", sportWorkload: "increased" }), performance: "success" as const, expected: "blocked" },
    ];
    for (const scenario of scenarios) {
      let started: StartedFixture;
      try {
        started = createAndStart(`matrix:${scenario.scenario}`, scenario.options);
      } catch (error) {
        throw new Error(`${scenario.scenario}:${error instanceof Error ? error.message : String(error)}`);
      }
      scenario.setup(started);
      if (scenario.performance === "success") completeSuccessfulWorkout(started, 60);
      else if (scenario.performance === "missed_work") completeOnlyFirstSlot(started, 60);
      else completeWorkout(started, ({ targetReps }) => ({ load: 60, reps: Math.max(0, targetReps - 2) }));
      const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
      expect(decision?.phaseOne?.decisionType, scenario.scenario).toBe(scenario.expected);
      expect(decision?.phaseOne?.result, scenario.scenario).toMatch(/future_prescription_change|explicit_no_change|blocked_no_change/);
      expect(decision?.phaseOne?.reasonCodes.length, scenario.scenario).toBeGreaterThan(0);
      const revision = canonicalActivePlanState.getReadModel()?.revision;
      const retry = completeCanonicalSession({
        planId: started.planId,
        expectedPlanRevision: started.planRevision,
        recordedSessionId: started.recordedSessionId,
        expectedLedgerVersion: 0,
        operationId: `${scenario.scenario}:retry`,
        occurredAt: "2026-07-25T11:30:00.000Z",
        provenance: "canonical_coaching_loop_matrix",
      });
      expect(retry.status, scenario.scenario).toBe("idempotent");
      expect(canonicalActivePlanState.getReadModel()?.revision, scenario.scenario).toBe(revision);
      results.push({ scenario: scenario.scenario, decision: scenario.expected, result: decision!.phaseOne!.result });
      clearScenarioState();
    }

    const transition = certifyStrengthTransitionBoundary();
    results.push(transition);
    expect(results).toHaveLength(12);
    expect(new Set(results.map((result) => result.scenario)).size).toBe(12);
    expect(results.every((result) => result.decision && result.result)).toBe(true);
  }, 30_000);

  it("recovers a transient first coaching-work-item write from the durable completed ledger", () => {
    const started = createAndStart("post-continuity:attempt-write-fault");
    const originalSave = canonicalCoachingAttemptRepository.save.bind(canonicalCoachingAttemptRepository);
    let firstWriteRejected = false;
    vi.spyOn(canonicalCoachingAttemptRepository, "save").mockImplementation((attempt) => {
      if (!firstWriteRejected && attempt.reason === "durable_completion_recorded") {
        firstWriteRejected = true;
        return { status: "invalid" as const, reason: "fault_injected_attempt_write" };
      }
      return originalSave(attempt);
    });

    const completion = completeSuccessfulWorkout(started, 60);
    expect(firstWriteRejected).toBe(true);
    expect(completion.status).toBe("applied");
    expect(canonicalRecordedSessionLedger.get(started.recordedSessionId)).toMatchObject({
      status: "found",
      session: { status: "completed" },
    });
    expect(canonicalCoachingAttemptRepository.list(started.planId)).toHaveLength(1);
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]?.status).toMatch(/applied|unchanged/);
  });

  it("exposes the unresolved crash window between carrier commit and application-receipt persistence", () => {
    const started = createAndStart("post-continuity:receipt-crash-window");
    const prior = canonicalActivePlanV2Repository.get();
    if (prior.status !== "saved") throw new Error("prior carrier missing");
    vi.spyOn(canonicalProgressDecisionRepository, "recordApplication").mockImplementation(() => {
      throw new Error("fault_injected_process_termination_before_receipt");
    });

    expect(() => completeSuccessfulWorkout(started, 60)).toThrow("fault_injected_process_termination_before_receipt");
    vi.restoreAllMocks();

    const committedWithoutReceipt = canonicalActivePlanV2Repository.get();
    if (committedWithoutReceipt.status !== "saved") throw new Error("carrier missing after injected crash");
    expect(committedWithoutReceipt.carrier.revision).toBeGreaterThan(prior.carrier.revision);
    const decision = canonicalProgressDecisionRepository.list(started.planId)[0];
    expect(decision?.phaseOneApplication).toBeUndefined();
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]?.status).toBe("decision_persisted");

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(resumePendingCanonicalCoachingWork(started.planId)).toHaveLength(1);
    expect(canonicalProgressDecisionRepository.list(started.planId)[0]?.phaseOneApplication).toBeUndefined();
    expect(canonicalCoachingAttemptRepository.list(started.planId)[0]?.status).toBe("decision_persisted");
    expect(resumePendingCanonicalCoachingWork(started.planId)).toHaveLength(1);
    expect(canonicalActivePlanV2Repository.get()).toEqual(committedWithoutReceipt);
  });

  it("exposes the unresolved final-session review boundary hidden by the continuity harness", () => {
    const planId = "post-continuity:final-session-review";
    let started = createAndStart(planId, { daysPerWeek: 3 });
    completeSuccessfulWorkout(started, 60);
    started = startNextExisting(planId, 1);
    completeSuccessfulWorkout(started, 60);
    started = startNextExisting(planId, 2);
    addContextEvidence(started, "readiness", {
      freshness: "fresh",
      completeness: "complete",
      recovery: "constrained",
      fatigue: "systemic",
    });
    completeSuccessfulWorkout(started, 60);

    const finalDecision = canonicalProgressDecisionRepository.list(planId).at(-1);
    expect(finalDecision?.phaseOne).toMatchObject({
      decisionType: "blocked",
      result: "blocked_no_change",
      reasonCodes: ["recovery_review_required"],
    });
    expect(finalDecision?.phaseOneApplication).toMatchObject({
      status: "blocked",
      actualResult: "blocked_no_change",
    });
    canonicalActivePlanState.hydrate();
    expect(canonicalActivePlanState.getReadModel()?.nextSession).toBeNull();
  });
});

type StartedFixture = {
  planId: string;
  planRevision: number;
  recordedSessionId: string;
  aggregate: Extract<ReturnType<typeof canonicalRecordedSessionLedger.get>, { status: "found" }>;
};

type FixtureOptions = Readonly<{
  established?: boolean;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  macrocycleGoal?: "build_muscle" | "build_strength" | "build_muscle_and_strength" | "get_leaner" | "athletic_performance";
  goal?: "hypertrophy" | "strength_hypertrophy" | "beginner_hypertrophy" | "body_recomposition";
  daysPerWeek?: 2 | 3 | 4 | 5 | 6;
  equipment?: readonly ("barbell" | "dumbbell" | "machine" | "cable" | "smith" | "bodyweight" | "bands" | "other")[];
  limitations?: readonly string[];
}>;

function createAndStart(planId: string, input: boolean | FixtureOptions = {}): StartedFixture {
  const options = typeof input === "boolean" ? { established: input } : input;
  const established = options.established ?? false;
  const establishedLoads = established ? Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 80])) : undefined;
  const loadEvidence = established ? Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, loadEvidenceFor(exercise.id, 80)])) : undefined;
  const created = canonicalActivePlanState.create({
    planId,
    createdAt: "2026-07-25T08:00:00.000Z",
    updatedAt: "2026-07-25T08:00:00.000Z",
    goal: options.goal ?? "strength_hypertrophy",
    macrocycleGoal: options.macrocycleGoal ?? "build_muscle_and_strength",
    experienceLevel: options.experienceLevel ?? "intermediate",
    daysPerWeek: options.daysPerWeek ?? 5,
    preferredSplit: "let_app_choose",
    equipment: options.equipment ?? ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    exercises: exerciseLibrary,
    limitations: options.limitations,
    history: [],
    establishedLoads,
    loadEvidence,
  });
  if (created.hydration !== "hydrated" || !created.model?.nextSession) throw new Error(created.error ?? "plan creation failed");
  const planned = created.model.plannedSessions.find((session) => session.id === created.model!.nextSession!.id);
  if (!planned) throw new Error("planned session missing");
  const started = startCanonicalSession({
    planId,
    expectedPlanRevision: created.model.revision,
    plannedSessionId: planned.id,
    expectedPrescriptionHash: prescriptionHash(planned.snapshot),
    operationId: `${planId}:start`,
    startedAt: "2026-07-25T09:00:00.000Z",
    provenance: "canonical_coaching_loop_test",
  });
  if (!started.recordedSessionId || started.planRevision === undefined) throw new Error(started.reason);
  const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
  if (aggregate.status !== "found") throw new Error("recorded session missing");
  return { planId, planRevision: started.planRevision, recordedSessionId: started.recordedSessionId, aggregate };
}

function startNextExisting(planId: string, ordinal: number): StartedFixture {
  canonicalActivePlanState.hydrate();
  const model = canonicalActivePlanState.getReadModel();
  if (!model?.nextSession) throw new Error(`next session missing:${planId}:${ordinal}`);
  const planned = model.plannedSessions.find((session) => session.id === model.nextSession!.id);
  if (!planned) throw new Error("planned snapshot missing");
  const result = startCanonicalSession({
    planId,
    expectedPlanRevision: model.revision,
    plannedSessionId: planned.id,
    expectedPrescriptionHash: prescriptionHash(planned.snapshot),
    operationId: `${planId}:start:${ordinal}`,
    startedAt: `2026-08-${String(1 + Math.floor(ordinal / 5)).padStart(2, "0")}T${String(8 + ordinal % 5).padStart(2, "0")}:00:00.000Z`,
    provenance: "canonical_coaching_loop_transition_test",
  });
  if (!result.recordedSessionId || result.planRevision === undefined) throw new Error(result.reason);
  const aggregate = canonicalRecordedSessionLedger.get(result.recordedSessionId);
  if (aggregate.status !== "found") throw new Error("recorded session missing");
  return { planId, planRevision: result.planRevision, recordedSessionId: result.recordedSessionId, aggregate };
}

function completeSuccessfulWorkout(started: StartedFixture, load: number) {
  return completeWorkout(started, ({ targetReps }) => ({ load, reps: targetReps }));
}

function completeOnlyFirstSlot(started: StartedFixture, load: number) {
  let ledgerVersion = started.aggregate.session.version;
  const slot = firstSlot(started.aggregate.session.prescriptionSnapshot);
  const settings = slot.settings as Record<string, unknown>;
  const requiredSets = Number(settings.requiredSets ?? settings.requiredWorkSets ?? 0);
  const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets as number[] : [];
  for (let setOrder = 1; setOrder <= requiredSets; setOrder += 1) {
    const result = recordCanonicalPerformedWork({
      planId: started.planId,
      expectedPlanRevision: started.planRevision,
      recordedSessionId: started.recordedSessionId,
      expectedLedgerVersion: ledgerVersion,
      operationId: `${started.planId}:missed-work:${setOrder}`,
      occurredAt: `2026-07-25T09:${String(setOrder).padStart(2, "0")}:00.000Z`,
      provenance: "canonical_coaching_loop_test",
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId: `${String(slot.id)}:set:${setOrder}`,
      setOrder,
      reps: Number(exactTargets[setOrder - 1] ?? slot.targetReps ?? 8),
      load,
      unit: "kg",
      completion: "complete",
    });
    expect(result.status).toBe("applied");
    ledgerVersion = result.ledgerVersion!;
  }
  return completeCanonicalSession({
    planId: started.planId,
    expectedPlanRevision: started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion: ledgerVersion,
    operationId: `${started.planId}:complete-missed-work`,
    occurredAt: "2026-07-25T10:30:00.000Z",
    provenance: "canonical_coaching_loop_test",
  });
}

function completeWorkout(
  started: StartedFixture,
  performed: (input: { slot: Record<string, unknown>; setOrder: number; targetReps: number }) => { load: number; reps: number },
) {
  let ledgerVersion = started.aggregate.session.version;
  const slots = sessionSlots(started.aggregate.session.prescriptionSnapshot);
  let operation = 0;
  for (const slot of slots) {
    const settings = slot.settings as Record<string, unknown>;
    const requiredSets = Number(settings.requiredSets ?? settings.requiredWorkSets ?? 0);
    const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets as number[] : [];
    for (let setOrder = 1; setOrder <= requiredSets; setOrder += 1) {
      const targetReps = Number(exactTargets[setOrder - 1] ?? slot.targetReps ?? 8);
      const actual = performed({ slot, setOrder, targetReps });
      const result = recordCanonicalPerformedWork({
        planId: started.planId,
        expectedPlanRevision: started.planRevision,
        recordedSessionId: started.recordedSessionId,
        expectedLedgerVersion: ledgerVersion,
        operationId: `${started.planId}:set:${operation}`,
        occurredAt: `2026-07-25T09:${String(operation + 1).padStart(2, "0")}:00.000Z`,
        provenance: "canonical_coaching_loop_test",
        slotId: String(slot.id),
        exerciseId: String(slot.exerciseId),
        setId: `${String(slot.id)}:set:${setOrder}`,
        setOrder,
        reps: actual.reps,
        load: actual.load,
        unit: "kg",
        completion: actual.reps >= targetReps ? "complete" : "partial",
      });
      expect(result.status).toBe("applied");
      ledgerVersion = result.ledgerVersion!;
      operation += 1;
    }
  }
  return completeCanonicalSession({
    planId: started.planId,
    expectedPlanRevision: started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion: ledgerVersion,
    operationId: `${started.planId}:complete`,
    occurredAt: "2026-07-25T10:30:00.000Z",
    provenance: "canonical_coaching_loop_test",
  });
}

function sessionSlots(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown>[] {
  return Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : [];
}

function firstSlot(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const slot = sessionSlots(snapshot)[0];
  if (!slot) throw new Error("slot missing");
  return slot;
}

function loadEvidenceFor(exerciseId: string, load: number): CanonicalLoadEvidence {
  return {
    evidenceId: `initial:${exerciseId}`,
    evidenceVersion: "initial_v1",
    athleteId: "local-athlete",
    exerciseId,
    sourceSessionId: "initial-calibration",
    sourceSlotId: `initial:${exerciseId}:slot`,
    observedLoad: load,
    observedReps: 8,
    baseUnit: "kg",
    freshnessVersion: 1,
    calibrationStatus: "established",
  };
}

function addPriorFailedExposure(started: StartedFixture): void {
  const slot = firstSlot(started.aggregate.session.prescriptionSnapshot);
  const result = canonicalProgressEvidenceRepository.record({
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `${started.planId}:prior-failed`,
    planId: started.planId,
    planRevision: started.planRevision,
    macrocycleId: started.aggregate.session.macrocycleId,
    mesocycleId: started.aggregate.session.mesocycleId as never,
    microcycleId: started.aggregate.session.microcycleId,
    sessionId: `${started.planId}:prior-session`,
    slotId: `${started.planId}:prior-slot`,
    athleteId: started.aggregate.session.athleteId,
    observedAt: "2026-07-18T10:00:00.000Z",
    source: "canonical_longitudinal_matrix",
    kind: "performance",
    observations: { exerciseId: String(slot.exerciseId), load: 80, reps: 5, unit: "kg", completion: "partial", prescribedTargetReps: 8, loadingMode: "fixed_external" },
    evidenceVersion: "progress_v1",
  });
  expect(result.status).toBe("saved");
}

function addContextEvidence(
  started: StartedFixture,
  kind: "readiness" | "capacity" | "pain",
  observations: Readonly<Record<string, string | number | boolean | null>>,
): void {
  const result = canonicalProgressEvidenceRepository.record({
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: `${started.planId}:${kind}`,
    planId: started.planId,
    planRevision: started.planRevision,
    macrocycleId: started.aggregate.session.macrocycleId,
    mesocycleId: started.aggregate.session.mesocycleId as never,
    microcycleId: started.aggregate.session.microcycleId,
    sessionId: started.recordedSessionId,
    athleteId: started.aggregate.session.athleteId,
    observedAt: "2026-07-25T08:30:00.000Z",
    source: "canonical_longitudinal_matrix",
    kind,
    observations,
    evidenceVersion: "progress_v1",
  });
  expect(result.status).toBe("saved");
}

function clearScenarioState(): void {
  jsonStore.clearByPrefix("iron-logic.");
  jsonStore.resetCache();
  canonicalActivePlanState.clear();
  canonicalRecordedSessionLedger.clear();
  canonicalProgressEvidenceRepository.clear();
  canonicalProgressDecisionRepository.clear();
  canonicalCoachingAttemptRepository.clear();
}

function certifyStrengthTransitionBoundary(): { scenario: string; decision: string; result: string } {
  const planId = "matrix:strength_transition_boundary";
  let started = createAndStart(planId, {
    established: true,
    goal: "strength_hypertrophy",
    macrocycleGoal: "build_strength",
    daysPerWeek: 3,
  });
  let ordinal = 0;
  let lastDecision = "";
  let lastResult = "";
  for (let week = 0; week < 4; week += 1) {
    for (let session = 0; session < 3; session += 1) {
      if (ordinal > 0) started = startNextExisting(planId, ordinal);
      completeSuccessfulWorkout(started, 80);
      const decision = canonicalProgressDecisionRepository.list(planId).at(-1);
      lastDecision = decision?.phaseOne?.decisionType ?? "";
      lastResult = decision?.phaseOne?.result ?? "";
      ordinal += 1;
    }
  }
  expect(lastDecision).toBe("transition");
  expect(lastResult).toBe("future_prescription_change");
  return { scenario: "strength_transition_boundary", decision: lastDecision, result: lastResult };
}
