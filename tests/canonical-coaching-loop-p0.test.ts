import { beforeEach, describe, expect, it, vi } from "vitest";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { readCanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { projectCanonicalPlan } from "@/application/training/canonical-plan-projections";
import {
  completeCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
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
  expect(lastDecision).toBe("blocked");
  expect(lastResult).toBe("blocked_no_change");
  return { scenario: "strength_transition_boundary", decision: lastDecision, result: lastResult };
}
