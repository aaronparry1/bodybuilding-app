import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlan } from "@/application/training/canonical-plan-projections";
import {
  completeCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingApplicationIntentRepository } from "@/data/local/canonical-coaching-application-intent-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { resumePendingCanonicalCoachingWork } from "@/application/training/canonical-completion-evidence-reconciliation";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { exerciseLibrary } from "@/domain/training/presets";
import { canonicalSessionRoleFamily } from "@/domain/training/canonical-comparable-exposure-policy";

describe("P1A mounted completed-workout production route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    jsonStore.clearByPrefix("iron-logic.");
    jsonStore.resetCache();
    canonicalActivePlanState.clear();
    canonicalRecordedSessionLedger.clear();
    canonicalProgressEvidenceRepository.clear();
    canonicalProgressDecisionRepository.clear();
    canonicalCoachingAttemptRepository.clear();
    canonicalCoachingApplicationIntentRepository.clear();
  });

  it("uses comparable completed history to commit one bounded numeric change through the existing CAS and truthful receipt", () => {
    const planId = "p1a-mounted";
    seedPlan(planId);
    const intentSave = vi.spyOn(canonicalCoachingApplicationIntentRepository, "save");

    const sourceSnapshots = new Map<string, Record<string, unknown>>();
    // The initial calibration Mesocycle completes first. Three comparable
    // exposures are then accumulated in the approved hypertrophy base phase.
    let numericCommitted = false;
    for (let ordinal = 0; ordinal < 30 && !numericCommitted; ordinal += 1) {
      canonicalActivePlanState.hydrate();
      const model = canonicalActivePlanState.getReadModel();
      if (!model?.nextSession) throw new Error(`next session missing at ${ordinal}`);
      const planned = model.plannedSessions.find((item) => item.id === model.nextSession!.id);
      if (!planned) throw new Error("planned session missing");
      sourceSnapshots.set(`${planned.role}:${planned.planSessionIndex}`, planned.snapshot as Record<string, unknown>);
      completePlannedSession(planId, planned.id, planned.snapshot as Record<string, unknown>, ordinal, ordinal >= 17 && ordinal % 3 === 2 ? "partial_first" : "success");
      numericCommitted = canonicalProgressDecisionRepository.list(planId).some((decision) =>
        decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        && decision.phaseOneApplication.reasonCode === "phase_one_bounded_numeric_adjustment_applied"
      );
    }

    const decisions = canonicalProgressDecisionRepository.list(planId);
    expect(summarizePipeline(decisions, preparedIntentCount(intentSave.mock.calls))).toEqual({
      evaluatorDecisions: 9,
      numericDecisionRecords: 66,
      outcomes: {
        insufficient_evidence: 38,
        phase_prohibited: 3,
        progress_repetitions: 25,
      },
      applicationIntents: 3,
      applicationStatuses: { applied: 3, unchanged: 6 },
      successfulCasApplications: 3,
      affectedExercises: 14,
      affectedFutureSlots: 14,
      affectedFutureSessions: 3,
      progressionFieldDeltas: 14,
      regressionFieldDeltas: 0,
      materialFieldDeltas: 14,
      receipts: 9,
      duplicateOrReplayedDecisions: 0,
    });
    const authorised = decisions.filter((decision) => decision.phaseOne?.boundedAdjustment.numericLoadAdjustmentAuthorised);
    expect(authorised.length).toBeGreaterThan(0);
    const committed = decisions.findLast((decision) =>
      decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      && decision.phaseOneApplication.reasonCode === "phase_one_bounded_numeric_adjustment_applied"
    );
    if (!committed) throw new Error("bounded numeric receipt missing");
    const appliedSlotKeys = new Set(committed.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      ? committed.phaseOneApplication.materialDeltas.filter((item) => item.field === "exactTargets" || item.field === "loadPrescription.prescribedBaseLoad").map((item) => item.slotKey)
      : []);
    const actionable = authorised
      .flatMap((decision) => decision.phaseOne!.boundedAdjustment.numericDecisions!.filter((item) => item.after))
      .filter((item) => appliedSlotKeys.has(`${item.exerciseId}:${item.constructionRole}:${item.lane}`));
    expect(actionable.length).toBeGreaterThan(0);
    expect(actionable.every((item) => item.evidenceIds.length >= 3)).toBe(true);
    expect(committed.phaseOneApplication).toMatchObject({
      schemaVersion: "canonical_coaching_application_receipt_v2",
      status: "applied",
      actualResult: "future_prescription_change",
      priorRevision: expect.any(Number),
      newRevision: expect.any(Number),
    });
    if (committed.phaseOneApplication?.schemaVersion !== "canonical_coaching_application_receipt_v2") throw new Error("truthful receipt missing");
    expect(committed.phaseOneApplication.materialDeltas.some((delta) =>
      delta.field.includes("exactTargets") || delta.field.includes("prescribedBaseLoad")
    )).toBe(true);
    const materialDeltaIdentities = committed.phaseOneApplication.materialDeltas.map((delta) =>
      JSON.stringify([delta.sessionKey, delta.slotKey, delta.field, delta.before, delta.after]));
    expect(new Set(materialDeltaIdentities).size).toBe(materialDeltaIdentities.length);

    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    const persisted = canonicalActivePlanV2Repository.get();
    if (persisted.status !== "saved") throw new Error("persisted carrier missing");
    for (const adjustment of actionable) {
      const future = persisted.carrier.plannedSessions.find((session) =>
        session.planSessionIndex === adjustment.planSessionIndex && canonicalSessionRoleFamily(session.role) === adjustment.sessionRole);
      if (!future) continue;
      const slot = slots(future.prescriptionSnapshot).find((item) => item.exerciseId === adjustment.exerciseId);
      if (!slot) continue;
      expect(slot.exactTargets).toEqual(adjustment.after?.exactTargets);
      expect((slot.loadPrescription as Record<string, unknown>).prescribedBaseLoad).toBe(adjustment.after?.prescribedBaseLoad);
    }

    const home = readCanonicalHomeProjection();
    const readModel = canonicalActivePlanState.getReadModel();
    if (!readModel) throw new Error("read model missing after restart");
    const plan = projectCanonicalPlan(readModel);
    const train = persisted.carrier.plannedSessions[0]
      ? projectCanonicalWorkoutPresentation({
        session: null,
        snapshot: persisted.carrier.plannedSessions[0].prescriptionSnapshot,
        displayUnit: persisted.carrier.constraints.units,
      })
      : null;
    expect(home?.planId).toBe(planId);
    expect(plan?.planId).toBe(planId);
    expect(train?.lifecycle).toBe("planned");
    expect(canonicalCoachingApplicationIntentRepository.get(committed.decisionId).status).toBe("not_found");
  }, 60_000);

  it("commits one conservative repetition regression after repeated comparable underperformance", () => {
    const planId = "p1a-mounted-regression";
    seedPlan(planId);
    const intentSave = vi.spyOn(canonicalCoachingApplicationIntentRepository, "save");
    let regression: ReturnType<typeof canonicalProgressDecisionRepository.list>[number] | undefined;
    let regressionApplication: ReturnType<typeof canonicalProgressDecisionRepository.list>[number] | undefined;
    for (let ordinal = 0; ordinal < 36 && !regressionApplication; ordinal += 1) {
      canonicalActivePlanState.hydrate();
      const model = canonicalActivePlanState.getReadModel();
      if (!model?.nextSession) throw new Error(`next session missing at ${ordinal}`);
      const planned = model.plannedSessions.find((item) => item.id === model.nextSession!.id);
      if (!planned) throw new Error("planned session missing");
      completePlannedSession(
        planId,
        planned.id,
        planned.snapshot as Record<string, unknown>,
        ordinal,
        ordinal >= 15 ? "underperform_all" : "success",
      );
      const decisions = canonicalProgressDecisionRepository.list(planId);
      regressionApplication = decisions.findLast((decision) =>
        decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        && decision.phaseOneApplication.appliedDecisionSources?.some((source) => {
          const origin = decisions.find((candidate) => candidate.decisionId === source.decisionId);
          return source.outcome === "regress_repetitions"
            && origin?.phaseOne?.boundedAdjustment.numericDecisions?.some((item) => item.comparableExposureKey === source.comparableExposureKey && item.outcome === source.outcome);
        })
        && decision.phaseOneApplication.materialDeltas.some((delta) => delta.field === "exactTargets" && isRepetitionRegression(delta.before, delta.after)));
      const sourceId = regressionApplication?.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        ? regressionApplication.phaseOneApplication.appliedDecisionSources?.find((source) => source.outcome === "regress_repetitions")?.decisionId
        : undefined;
      regression = decisions.find((decision) => decision.decisionId === sourceId);
    }
    if (!regression?.phaseOne || regressionApplication?.phaseOneApplication?.schemaVersion !== "canonical_coaching_application_receipt_v2") {
      throw new Error("bounded regression receipt missing");
    }
    expect(summarizePipeline(
      canonicalProgressDecisionRepository.list(planId),
      preparedIntentCount(intentSave.mock.calls),
    )).toEqual({
      evaluatorDecisions: 27,
      numericDecisionRecords: 199,
      outcomes: {
        hold: 69,
        insufficient_evidence: 42,
        phase_prohibited: 9,
        progress_repetitions: 78,
        regress_repetitions: 1,
      },
      applicationIntents: 9,
      applicationStatuses: { applied: 9, unchanged: 18 },
      successfulCasApplications: 9,
      affectedExercises: 18,
      affectedFutureSlots: 18,
      affectedFutureSessions: 3,
      progressionFieldDeltas: 45,
      regressionFieldDeltas: 1,
      materialFieldDeltas: 46,
      receipts: 27,
      duplicateOrReplayedDecisions: 0,
    });
    expect(regression.phaseOne.boundedAdjustment.numericDecisions?.some((decision) =>
      decision.outcome === "regress_repetitions"
      && decision.exposureCount >= 3
      && decision.failedExposureCount >= 2)).toBe(true);
    expect(regressionApplication.phaseOneApplication).toMatchObject({
      status: "applied",
      actualResult: "future_prescription_change",
      newRevision: regressionApplication.phaseOneApplication.priorRevision + 1,
      appliedDecisionSources: expect.arrayContaining([expect.objectContaining({ decisionId: regression.decisionId, outcome: "regress_repetitions" })]),
    });
  }, 60_000);

  it("reconstructs a truthful numeric receipt after CAS commits and receipt persistence is interrupted", () => {
    const planId = "p1a-mounted-post-cas";
    seedPlan(planId);
    const originalRecord = canonicalProgressDecisionRepository.recordApplication.bind(canonicalProgressDecisionRepository);
    let interrupted = false;
    vi.spyOn(canonicalProgressDecisionRepository, "recordApplication").mockImplementation((decisionId, receipt) => {
      if (!interrupted
        && receipt.schemaVersion === "canonical_coaching_application_receipt_v2"
        && receipt.reasonCode === "phase_one_bounded_numeric_adjustment_applied") {
        interrupted = true;
        throw new Error("p1a_fault_after_numeric_cas");
      }
      return originalRecord(decisionId, receipt);
    });

    for (let ordinal = 0; ordinal < 36 && !interrupted; ordinal += 1) {
      canonicalActivePlanState.hydrate();
      const model = canonicalActivePlanState.getReadModel();
      if (!model?.nextSession) throw new Error(`next session missing at ${ordinal}`);
      const planned = model.plannedSessions.find((item) => item.id === model.nextSession!.id);
      if (!planned) throw new Error("planned session missing");
      if (ordinal < 35) {
        try {
          completePlannedSession(planId, planned.id, planned.snapshot as Record<string, unknown>, ordinal, "success");
        } catch (error) {
          expect((error as Error).message).toBe("p1a_fault_after_numeric_cas");
        }
      }
    }
    expect(interrupted).toBe(true);
    const committed = canonicalActivePlanV2Repository.get();
    if (committed.status !== "saved") throw new Error("committed carrier missing");
    const revisionAfterCas = committed.carrier.revision;
    expect(canonicalProgressDecisionRepository.list(planId).some((decision) =>
      decision.phaseOne?.boundedAdjustment.numericLoadAdjustmentAuthorised
      && decision.phaseOneApplication === undefined)).toBe(true);

    vi.restoreAllMocks();
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    expect(resumePendingCanonicalCoachingWork(planId)).toHaveLength(1);
    const reconstructed = canonicalProgressDecisionRepository.list(planId).find((decision) =>
      decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      && decision.phaseOneApplication.status === "applied"
      && decision.phaseOneApplication.materialDeltas.some((delta) =>
        delta.field === "exactTargets" || delta.field === "loadPrescription.prescribedBaseLoad"));
    if (!reconstructed) {
      throw new Error(JSON.stringify({
        decisions: canonicalProgressDecisionRepository.list(planId).map((decision) => ({
          id: decision.decisionId,
          application: decision.phaseOneApplication && {
            status: decision.phaseOneApplication.status,
            reason: decision.phaseOneApplication.schemaVersion === "canonical_coaching_application_receipt_v2"
              ? decision.phaseOneApplication.reasonCode
              : decision.phaseOneApplication.schemaVersion,
            fields: decision.phaseOneApplication.schemaVersion === "canonical_coaching_application_receipt_v2"
              ? decision.phaseOneApplication.materialDeltas.map((delta) => delta.field)
              : [],
          },
        })),
        attempts: canonicalCoachingAttemptRepository.list(planId).map((attempt) => ({
          status: attempt.status,
          reason: attempt.reason,
          decisionId: attempt.decisionId,
        })),
      }));
    }
    expect(reconstructed?.phaseOneApplication).toMatchObject({
      status: "applied",
      actualResult: "future_prescription_change",
    });
    expect(reconstructed?.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      && reconstructed.phaseOneApplication.materialDeltas.some((delta) =>
        delta.field === "exactTargets" || delta.field === "loadPrescription.prescribedBaseLoad")).toBe(true);
    expect(canonicalActivePlanV2Repository.get()).toMatchObject({
      status: "saved",
      carrier: { revision: revisionAfterCas },
    });
    expect(resumePendingCanonicalCoachingWork(planId)).toEqual([]);
  }, 60_000);
});

function seedPlan(planId: string): void {
  const establishedLoads = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, 60]));
  const loadEvidence = Object.fromEntries(exerciseLibrary.map((exercise) => [exercise.id, initialEvidence(exercise.id, 60)]));
  const created = constructCanonicalActivePlanFromCanonicalInputs({
    planId,
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-01T08:00:00.000Z",
    goal: "hypertrophy",
    macrocycleGoal: "build_muscle",
    experienceLevel: "intermediate",
    daysPerWeek: 3,
    preferredSplit: "let_app_choose",
    equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    selectedMesocycleId: "hypertrophy_base",
    exercises: exerciseLibrary,
    establishedLoads,
    loadEvidence,
  });
  if (created.status !== "constructed") throw new Error(created.reason);
  expect(canonicalActivePlanV2Repository.saveAtomically(created.carrier).status).toBe("saved");
  expect(canonicalActivePlanState.hydrate().hydration).toBe("hydrated");
}

function completePlannedSession(
  planId: string,
  plannedSessionId: string,
  snapshot: Record<string, unknown>,
  ordinal: number,
  mode: "success" | "partial_first" | "underperform_all",
): void {
  const model = canonicalActivePlanState.getReadModel();
  if (!model) throw new Error("plan unavailable");
  const started = startCanonicalSession({
    planId,
    expectedPlanRevision: model.revision,
    plannedSessionId,
    expectedPrescriptionHash: prescriptionHash(snapshot),
    operationId: `${planId}:start:${ordinal}`,
    startedAt: time(ordinal, 0),
    provenance: "p1a-production-path-test",
  });
  if (!started.recordedSessionId || started.planRevision === undefined) throw new Error(started.reason);
  const aggregate = canonicalRecordedSessionLedger.get(started.recordedSessionId);
  if (aggregate.status !== "found") throw new Error("recorded session missing");
  let ledgerVersion = aggregate.session.version;
  let setOrdinal = 0;
  for (const slot of slots(snapshot)) {
    const settings = slot.settings as Record<string, unknown>;
    const required = Number(settings.requiredSets ?? settings.requiredWorkSets ?? 0);
    const targets = Array.isArray(slot.exactTargets) ? slot.exactTargets as number[] : [];
    const loadPrescription = slot.loadPrescription as Record<string, unknown>;
    const load = loadPrescription.state === "established" ? Number(loadPrescription.prescribedBaseLoad) : 0;
    for (let setOrder = 1; setOrder <= required; setOrder += 1) {
      const target = Number(targets[setOrder - 1] ?? slot.targetReps);
      const underperformed = mode === "underperform_all"
        || mode === "partial_first" && setOrdinal === 0;
      const performed = recordCanonicalPerformedWork({
        planId,
        expectedPlanRevision: started.planRevision,
        recordedSessionId: started.recordedSessionId,
        expectedLedgerVersion: ledgerVersion,
        operationId: `${planId}:work:${ordinal}:${setOrdinal}`,
        occurredAt: time(ordinal, setOrdinal + 1),
        provenance: "p1a-production-path-test",
        slotId: String(slot.id),
        exerciseId: String(slot.exerciseId),
        setId: `${started.recordedSessionId}:${slot.id}:${setOrder}`,
        setOrder,
        reps: underperformed ? Math.max(0, target - 1) : target,
        load,
        unit: "kg",
        completion: mode === "partial_first" && underperformed ? "partial" : "complete",
      });
      if (performed.status !== "applied" || performed.ledgerVersion === undefined) throw new Error(performed.reason);
      ledgerVersion = performed.ledgerVersion;
      setOrdinal += 1;
    }
  }
  const completed = completeCanonicalSession({
    planId,
    expectedPlanRevision: started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion: ledgerVersion,
    operationId: `${planId}:complete:${ordinal}`,
    occurredAt: time(ordinal, setOrdinal + 2),
    provenance: "p1a-production-path-test",
  });
  if (completed.status !== "applied") throw new Error(completed.reason);
}

function time(ordinal: number, minute: number): string {
  const date = new Date(Date.UTC(2026, 0, 1 + ordinal, 8, minute));
  return date.toISOString();
}

function initialEvidence(exerciseId: string, load: number): CanonicalLoadEvidence {
  return {
    evidenceId: `initial:${exerciseId}`,
    evidenceVersion: "initial_v1",
    athleteId: "local-athlete",
    exerciseId,
    observedLoad: load,
    observedReps: 8,
    baseUnit: "kg",
    freshnessVersion: 1,
    calibrationStatus: "established",
  };
}

function slots(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown>[] {
  return Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : [];
}

function isRepetitionRegression(before: unknown, after: unknown): boolean {
  if (!Array.isArray(before) || !Array.isArray(after)) return false;
  return after.some((value, index) => Number(value) < Number(before[index]));
}

function summarizePipeline(
  decisions: ReturnType<typeof canonicalProgressDecisionRepository.list>,
  applicationIntents: number,
) {
  const numeric = decisions.flatMap((decision) => decision.phaseOne?.boundedAdjustment.numericDecisions ?? []);
  const applications = decisions.flatMap((decision) =>
    decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
      ? [decision.phaseOneApplication]
      : []);
  const applied = applications.filter((receipt) => receipt.status === "applied");
  const material = applied.flatMap((receipt) => receipt.materialDeltas.filter((delta) =>
    delta.field === "exactTargets" || delta.field === "loadPrescription.prescribedBaseLoad"));
  const repetitionDeltas = material.filter((delta) => delta.field === "exactTargets");
  const loadDeltas = material.filter((delta) => delta.field === "loadPrescription.prescribedBaseLoad");
  const progressionFieldDeltas = repetitionDeltas.filter((delta) =>
    numericList(delta.after).some((value, index) => value > (numericList(delta.before)[index] ?? value))).length
    + loadDeltas.filter((delta) => Number(delta.after) > Number(delta.before)).length;
  const regressionFieldDeltas = repetitionDeltas.filter((delta) =>
    numericList(delta.after).some((value, index) => value < (numericList(delta.before)[index] ?? value))).length
    + loadDeltas.filter((delta) => Number(delta.after) < Number(delta.before)).length;
  const applicationStatuses = Object.fromEntries(
    [...new Set(applications.map((receipt) => receipt.status))]
      .sort()
      .map((status) => [status, applications.filter((receipt) => receipt.status === status).length]),
  );
  return {
    evaluatorDecisions: decisions.length,
    numericDecisionRecords: numeric.length,
    outcomes: Object.fromEntries([...new Set(numeric.map((decision) => decision.outcome))]
      .sort()
      .map((outcome) => [outcome, numeric.filter((decision) => decision.outcome === outcome).length])),
    applicationIntents,
    applicationStatuses,
    successfulCasApplications: applied.length,
    affectedExercises: new Set(material.map((delta) => String(delta.slotKey).split(":")[0])).size,
    affectedFutureSlots: new Set(material.map((delta) => `${delta.sessionKey}:${delta.slotKey}`)).size,
    affectedFutureSessions: new Set(material.map((delta) => delta.sessionKey)).size,
    progressionFieldDeltas,
    regressionFieldDeltas,
    materialFieldDeltas: material.length,
    receipts: applications.length,
    duplicateOrReplayedDecisions: 0,
  };
}

function preparedIntentCount(
  calls: Array<Parameters<typeof canonicalCoachingApplicationIntentRepository.save>>,
): number {
  return new Set(calls
    .map(([intent]) => intent)
    .filter((intent) => intent?.status === "prepared")
    .map((intent) => intent.decisionId)).size;
}

function numericList(value: unknown): number[] {
  return Array.isArray(value) && value.every((item) => Number.isFinite(item))
    ? value.map(Number)
    : [];
}
