import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  completeCanonicalSession,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { exerciseLibrary } from "@/domain/training/presets";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";

export const CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT = "2026-01-01T00:00:00.000Z";
export const canonicalFiveDayFixtureProfile = {
  goal: "strength_hypertrophy",
  macrocycleGoal: "build_muscle_and_strength",
  experienceLevel: "intermediate",
  daysPerWeek: 5,
  preferredSplit: "let_app_choose",
  equipment: ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
  units: "kg",
} as const;

export type CanonicalHomeVisualState = "planned" | "active" | "paused" | "completed" | "rest_day";
export type CanonicalPlanVisualState = "planned" | "active" | "partial_week" | "phase_completed";
export type CanonicalProgressVisualState = "zero" | "one_completed" | "insufficient_trend" | "established" | "genuine_pr";
export type CanonicalCompletionVisualState = "ordinary" | "pr" | "multiple" | "missing_history" | "partial" | "long_accessibility" | "sharing";

export function canonicalFiveDayFixtureInput(planId: string) {
  return {
    planId,
    createdAt: CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT,
    updatedAt: CANONICAL_FIVE_DAY_FIXTURE_CREATED_AT,
    ...canonicalFiveDayFixtureProfile,
    exercises: exerciseLibrary,
    history: [],
  } as const;
}

/** Shared source for the allocator certification and product-like Design-QA renders. */
export function constructCanonicalFiveDayFixture(planId = "canonical-five-day-certification") {
  return constructCanonicalActivePlanFromCanonicalInputs(canonicalFiveDayFixtureInput(planId));
}

/**
 * Builds Home states through the same active-plan, ledger, evidence and lifecycle owners as Train.
 * This helper is Design-QA only; it does not author snapshot or projection fields.
 */
export function applyCanonicalHomeVisualState(
  state: CanonicalHomeVisualState,
  options: Readonly<{ planId?: string; now?: string }> = {},
) {
  const planId = options.planId ?? `design-qa:home-${state}`;
  const now = options.now ?? "2026-07-18T10:00:00.000Z";
  resetCanonicalHomeVisualState();
  const created = canonicalActivePlanState.create(canonicalFiveDayFixtureInput(planId));
  if (created.hydration !== "hydrated" || !created.model) {
    throw new Error(`canonical_home_visual_plan_failed:${created.error ?? created.hydration}`);
  }
  if (state === "planned" || state === "rest_day") return created.model;

  const active = startFirstPlannedSession(planId, now, state === "completed" ? 45 : 1);
  const work = recordPrescribedWork(planId, active, state === "completed");
  if (state === "paused") {
    const currentRevision = requireModel(planId, state).revision;
    const paused = pauseCanonicalSession({
      planId,
      expectedPlanRevision: currentRevision,
      recordedSessionId: active.recordedSessionId,
      expectedLedgerVersion: work.ledgerVersion,
      operationId: `${planId}:pause`,
      occurredAt: offsetIso(now, -10_000),
      provenance: "design_qa_home_visual",
    });
    if (paused.status !== "applied" && paused.status !== "idempotent") {
      throw new Error(`canonical_home_visual_pause_failed:${paused.reason}`);
    }
  }
  if (state === "completed") completeActiveSession(planId, active.recordedSessionId, active.planRevision, work.ledgerVersion, now, "first");
  return requireModel(planId, state);
}

/** Canonical Plan visual states composed through real plan and recorded-session owners. */
export function applyCanonicalPlanVisualState(
  state: CanonicalPlanVisualState,
  options: Readonly<{ planId?: string; now?: string }> = {},
) {
  const planId = options.planId ?? `design-qa:plan-${state}`;
  const now = options.now ?? "2026-07-18T10:00:00.000Z";
  if (state === "planned" || state === "active") return applyCanonicalHomeVisualState(state, { planId, now });
  resetCanonicalHomeVisualState();
  const created = canonicalActivePlanState.create(canonicalFiveDayFixtureInput(planId));
  if (created.hydration !== "hydrated" || !created.model) throw new Error(`canonical_plan_visual_plan_failed:${created.error ?? created.hydration}`);
  if (state === "phase_completed") return applyCompletedWeekHistory(planId, now);
  const completionCount = 1;
  for (let index = 0; index < completionCount; index += 1) {
    const completedAt = offsetIso(now, index * 3_600_000);
    const active = startFirstPlannedSession(planId, completedAt);
    const work = recordPrescribedWork(planId, active, true);
    completeActiveSession(planId, active.recordedSessionId, active.planRevision, work.ledgerVersion, completedAt, `visual-${index + 1}`);
  }
  return requireModel(planId, state);
}

function applyCompletedWeekHistory(planId: string, now: string) {
  const repositoryPlan = canonicalActivePlanV2Repository.get();
  if (repositoryPlan.status !== "saved") throw new Error("canonical_plan_visual_carrier_unavailable");
  const nextRevision = repositoryPlan.carrier.revision + 1;
  const references = repositoryPlan.carrier.plannedSessions.map((planned, index) => {
    const recordedSessionId = `${planId}:completed:${index + 1}`;
    const startedAt = offsetIso(now, index * 3_600_000 - 45 * 60_000);
    const created = canonicalRecordedSessionLedger.create({
      schemaVersion: "canonical_recorded_session_v1", recordedSessionId, plannedSessionId: planned.id, planId,
      startRevision: repositoryPlan.carrier.revision, macrocycleId: repositoryPlan.carrier.macrocycle.id,
      mesocycleId: repositoryPlan.carrier.mesocycle.id, microcycleId: repositoryPlan.carrier.microcycle.id,
      role: planned.role, prescriptionSnapshot: planned.prescriptionSnapshot, prescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
      provenance: { source: "design_qa_plan_visual", constructionVersion: planned.constructionVersion },
      athleteId: repositoryPlan.carrier.constructionInputs?.athleteId ?? "local-athlete", version: 0, status: "pending", createdAt: startedAt,
    }, `${recordedSessionId}:create`);
    if (created.status !== "saved") throw new Error(`canonical_plan_visual_create_failed:${created.status}`);
    const started = canonicalRecordedSessionLedger.append(recordedSessionId, { eventId: `${recordedSessionId}:started`, aggregateId: recordedSessionId, expectedVersion: 0, type: "started", occurredAt: startedAt, operationId: `${recordedSessionId}:start`, payload: {} });
    if (started.status !== "saved") throw new Error(`canonical_plan_visual_start_failed:${started.status}`);
    const work = recordPrescribedWork(planId, { recordedSessionId, planRevision: repositoryPlan.carrier.revision }, true);
    completeActiveSession(planId, recordedSessionId, repositoryPlan.carrier.revision, work.ledgerVersion, offsetIso(now, index * 3_600_000), `week-${index + 1}`);
    const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
    if (aggregate.status !== "found" || aggregate.session.status !== "completed") throw new Error("canonical_plan_visual_completion_unavailable");
    return { sessionId: recordedSessionId, planId, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId, microcycleId: aggregate.session.microcycleId, revision: nextRevision, status: "completed" as const, recordReference: `canonical-recorded-session:${recordedSessionId}` };
  });
  const saved = canonicalActivePlanV2Repository.saveAtomically({ ...repositoryPlan.carrier, revision: nextRevision, updatedAt: now, plannedSessions: [], recordedSessionReferences: references, progress: { ...repositoryPlan.carrier.progress, revision: nextRevision } }, repositoryPlan.carrier.revision);
  if (saved.status !== "saved") throw new Error(`canonical_plan_visual_reference_failed:${saved.status}`);
  return canonicalActivePlanState.hydrate().model ?? (() => { throw new Error("canonical_plan_visual_hydration_failed"); })();
}

/**
 * Progress visuals use ledger/evidence facts. Comparable history is created from one immutable
 * Session Construction snapshot so exercise and loading-mode comparisons remain valid.
 */
export function applyCanonicalProgressVisualState(
  state: CanonicalProgressVisualState,
  options: Readonly<{ planId?: string }> = {},
) {
  const planId = options.planId ?? `design-qa:progress-${state}`;
  if (state === "zero") return applyCanonicalHomeVisualState("planned", { planId });
  if (state === "one_completed") return applyCanonicalHomeVisualState("completed", { planId, now: "2026-07-18T10:00:00.000Z" });
  const exposures = state === "insufficient_trend" ? 2 : 3;
  return applyComparableProgressHistory(planId, exposures, state === "established" ? 0 : 2.5);
}

/** Executable finish-screen states built from canonical immutable session history. */
export function applyCanonicalCompletionVisualState(
  state: CanonicalCompletionVisualState,
  options: Readonly<{ planId?: string }> = {},
): Readonly<{ model: ReturnType<typeof requireModel>; recordedSessionId: string }> {
  const planId = options.planId ?? `design-qa:completion-${state}`;
  const exposures = state === "ordinary" || state === "missing_history" ? 1 : state === "partial" ? 2 : 3;
  const loadStepKg = state === "ordinary" || state === "missing_history" ? 0 : 2.5;
  const model = applyComparableProgressHistory(planId, exposures, loadStepKg, state === "multiple" || state === "long_accessibility", state === "partial");
  return { model, recordedSessionId: `${planId}:comparison:${exposures}` };
}

export function applyCanonicalAdaptationVisualState(options: Readonly<{ planId?: string }> = {}) {
  const planId = options.planId ?? "design-qa:progress-adaptation-applied";
  const model = applyCanonicalProgressVisualState("established", { planId });
  const sourceSessionId = `${planId}:comparison:3`;
  const decision: CanonicalProgressDecision = {
    schemaVersion: "canonical_progress_decision_v1",
    decisionId: `${planId}:adaptation-decision`,
    planId,
    expectedPlanRevision: model.revision,
    macrocycleId: `${planId}:macrocycle`,
    mesocycleId: model.mesocycle.id,
    microcycleId: model.microcycle.id,
    evaluationId: `${planId}:adaptation-evaluation`,
    evidenceIds: [`${sourceSessionId}:evidence:1`, `${sourceSessionId}:evidence:2`, `${sourceSessionId}:evidence:3`],
    outcome: "continue",
    owner: "mesocycle",
    reason: "comparable_training_progressed",
    explanation: "Your completed Bench Press work supported a small load increase for future sessions.",
    status: "consumed",
    phaseOne: {
      schemaVersion: "canonical_coaching_decision_details_v1",
      decisionType: "advance_microcycle",
      sourceRecordedSessionId: sourceSessionId,
      sourcePrescriptionHash: "design-qa-prescription-hash",
      reasonCodes: ["comparable_success_threshold_met"],
      evidenceSummary: { targetCompletion: "successful", comparableExposureCount: 3, repDropOff: false, recoveryEvidence: "stable", transitionEligible: false, deloadEligible: false },
      priorFutureSessionIds: model.plannedSessions.map((session) => session.id),
      result: "future_prescription_change",
      boundedAdjustment: {
        kind: "construct_next_microcycle",
        exerciseIds: ["ex-bench-press"],
        numericLoadAdjustmentAuthorised: true,
        numericDecisions: [{ schemaVersion: "canonical_numeric_prescription_decision_v1", policyId: "canonical_numeric_progression_policy_v1", outcome: "progress_load", comparableExposureKey: "design-qa-bench-comparable", exerciseId: "ex-bench-press", planSessionIndex: 0, sessionRole: "Upper strength", constructionRole: "primary", exerciseRole: "primary_compound", lane: "strength", method: "straight_sets", progressionRule: "load_progression", evidenceIds: [`${sourceSessionId}:evidence:1`, `${sourceSessionId}:evidence:2`, `${sourceSessionId}:evidence:3`], exposureCount: 3, successfulExposureCount: 3, failedExposureCount: 0, reasonCode: "comparable_success_threshold_met", before: { prescribedBaseLoad: 65, exactTargets: [5, 5, 5] }, after: { prescribedBaseLoad: 67.5, exactTargets: [5, 5, 5] }, exactNumericDelta: { loadKg: 2.5, repetitions: [0, 0, 0] } }],
      },
      contextIdentity: { macrocycleId: `${planId}:macrocycle`, mesocycleId: model.mesocycle.id, microcycleId: model.microcycle.id },
      decidedAt: "2026-07-18T11:00:00.000Z",
      idempotencyKey: `${planId}:adaptation-idempotency`,
    },
    phaseOneApplication: { schemaVersion: "canonical_coaching_application_receipt_v2", status: "applied", actualResult: "future_prescription_change", reasonCode: "numeric_progression_applied", explanation: "Your completed Bench Press work supported a small load increase for future sessions.", priorRevision: Math.max(0, model.revision - 1), newRevision: model.revision, resultingFutureSessionIds: model.plannedSessions.map((session) => session.id), materialDeltas: [{ schemaVersion: "canonical_material_prescription_delta_v1", sessionKey: "0:Upper strength:planned", slotKey: "0:ex-bench-press", field: "loadPrescription.prescribedBaseLoad", before: 65, after: 67.5 }], appliedAt: "2026-07-18T11:00:01.000Z" },
  };
  const saved = canonicalProgressDecisionRepository.save(decision);
  if (saved.status !== "saved") throw new Error(`canonical_adaptation_visual_decision_failed:${saved.status}`);
  return model;
}

function applyComparableProgressHistory(planId: string, exposures: number, loadStepKg: number, progressEveryExercise = false, partialFinalExposure = false) {
  resetCanonicalHomeVisualState();
  const created = canonicalActivePlanState.create(canonicalProgressFixtureInput(planId));
  if (created.hydration !== "hydrated" || !created.model) throw new Error(`canonical_progress_visual_plan_failed:${created.error ?? created.hydration}`);
  const repositoryPlan = canonicalActivePlanV2Repository.get();
  if (repositoryPlan.status !== "saved") throw new Error("canonical_progress_visual_carrier_unavailable");
  const planned = repositoryPlan.carrier.plannedSessions[0];
  if (!planned) throw new Error("canonical_progress_visual_snapshot_unavailable");
  const snapshot = planned.prescriptionSnapshot;
  const firstSlot = Array.isArray(snapshot.slots) ? (snapshot.slots as Array<Record<string, unknown>>)[0] : undefined;
  if (!firstSlot) throw new Error("canonical_progress_visual_slot_unavailable");
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const prescribed = slots.flatMap((slot) => {
    const settings = (slot.settings ?? {}) as Record<string, unknown>;
    const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets.map(Number) : [];
    const requiredSets = Number(settings.requiredWorkSets ?? settings.requiredSets ?? 0);
    return Array.from({ length: requiredSets }, (_, setIndex) => ({ slot, setOrder: setIndex + 1, reps: exactTargets[setIndex] ?? Number(slot.targetReps ?? 6) }));
  });
  const durationMinutes = Math.max(45, prescribed.length * 3 + slots.length * 4);
  const nextRevision = repositoryPlan.carrier.revision + 1;
  const references = [];

  for (let index = 0; index < exposures; index += 1) {
    const recordedSessionId = `${planId}:comparison:${index + 1}`;
    const startedAt = new Date(Date.UTC(2026, 6, 4 + index * 6, 9, 0, 0)).toISOString();
    const createdLedger = canonicalRecordedSessionLedger.create({
      schemaVersion: "canonical_recorded_session_v1",
      recordedSessionId,
      plannedSessionId: planned.id,
      planId,
      startRevision: repositoryPlan.carrier.revision,
      macrocycleId: repositoryPlan.carrier.macrocycle.id,
      mesocycleId: repositoryPlan.carrier.mesocycle.id,
      microcycleId: repositoryPlan.carrier.microcycle.id,
      role: planned.role,
      prescriptionSnapshot: snapshot,
      prescriptionHash: prescriptionHash(snapshot),
      provenance: { source: "design_qa_progress_visual", constructionVersion: planned.constructionVersion },
      athleteId: repositoryPlan.carrier.constructionInputs?.athleteId ?? "local-athlete",
      version: 0,
      status: "pending",
      createdAt: startedAt,
    }, `${recordedSessionId}:create`);
    if (createdLedger.status !== "saved") throw new Error(`canonical_progress_visual_create_failed:${createdLedger.status}`);
    const started = canonicalRecordedSessionLedger.append(recordedSessionId, { eventId: `${recordedSessionId}:started`, aggregateId: recordedSessionId, expectedVersion: 0, type: "started", occurredAt: startedAt, operationId: `${recordedSessionId}:start`, payload: {} });
    if (started.status !== "saved") throw new Error(`canonical_progress_visual_start_failed:${started.status}`);
    let ledgerVersion = started.session!.version;
    for (let setIndex = 0; setIndex < prescribed.length; setIndex += 1) {
      const performed = prescribed[setIndex]!;
      const slot = performed.slot;
      if (partialFinalExposure && index === exposures - 1 && setIndex >= Math.max(1, Math.floor(prescribed.length / 2))) continue;
      const loadPrescription = (slot.loadPrescription ?? {}) as Record<string, unknown>;
      const isComparisonExercise = String(slot.id) === String(firstSlot.id);
      const load = loadPrescription.state === "bodyweight" ? 0 : Number(loadPrescription.prescribedBaseLoad ?? 60) + (isComparisonExercise || progressEveryExercise ? index * loadStepKg : 0);
      const work = recordCanonicalPerformedWork({
        planId,
        expectedPlanRevision: repositoryPlan.carrier.revision,
        recordedSessionId,
        expectedLedgerVersion: ledgerVersion,
        operationId: `${recordedSessionId}:work:${setIndex + 1}`,
        occurredAt: offsetIso(startedAt, Math.round(((setIndex + 1) / (prescribed.length + 1)) * durationMinutes * 60_000)),
        provenance: "design_qa_progress_visual",
        slotId: String(slot.id),
        exerciseId: String(slot.exerciseId),
        setId: `${String(slot.id)}:comparison:${index + 1}:${performed.setOrder}`,
        setOrder: performed.setOrder,
        reps: performed.reps,
        load,
        unit: "kg",
        completion: "complete",
      });
      if (work.status !== "applied" || work.ledgerVersion === undefined) throw new Error(`canonical_progress_visual_work_failed:${work.reason}`);
      ledgerVersion = work.ledgerVersion;
    }
    const completedAt = offsetIso(startedAt, durationMinutes * 60_000);
    completeActiveSession(planId, recordedSessionId, repositoryPlan.carrier.revision, ledgerVersion, completedAt, `comparison-${index + 1}`);
    const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
    if (aggregate.status !== "found" || aggregate.session.status !== "completed") throw new Error("canonical_progress_visual_completion_unavailable");
    references.push({ sessionId: recordedSessionId, planId, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId, microcycleId: aggregate.session.microcycleId, revision: nextRevision, status: "completed" as const, recordReference: `canonical-recorded-session:${recordedSessionId}` });
  }

  const saved = canonicalActivePlanV2Repository.saveAtomically({ ...repositoryPlan.carrier, revision: nextRevision, updatedAt: "2026-07-18T10:00:00.000Z", recordedSessionReferences: references, progress: { ...repositoryPlan.carrier.progress, revision: nextRevision } }, repositoryPlan.carrier.revision);
  if (saved.status !== "saved") throw new Error(`canonical_progress_visual_reference_failed:${saved.status}`);
  return canonicalActivePlanState.hydrate().model ?? (() => { throw new Error("canonical_progress_visual_hydration_failed"); })();
}

function resetCanonicalHomeVisualState(): void {
  canonicalActivePlanState.clear();
  canonicalRecordedSessionLedger.clear();
  canonicalProgressEvidenceRepository.clear();
  canonicalProgressDecisionRepository.clear();
  canonicalRestTimerRepository.clear();
}

function startFirstPlannedSession(planId: string, at: string, elapsedMinutes = 1): Readonly<{ recordedSessionId: string; planRevision: number }> {
  const model = requireModel(planId, "planned");
  const next = model.nextSession;
  const session = next ? model.plannedSessions.find((candidate) => candidate.id === next.id) : null;
  if (!next || !session) throw new Error(`canonical_home_visual_planned_session_unavailable:${planId}`);
  const started = startCanonicalSession({
    planId,
    expectedPlanRevision: model.revision,
    plannedSessionId: next.id,
    expectedPrescriptionHash: prescriptionHash(session.snapshot),
    operationId: `${planId}:start:${session.planSessionIndex}`,
    startedAt: offsetIso(at, -elapsedMinutes * 60_000),
    provenance: "design_qa_home_visual",
  });
  if (!started.recordedSessionId || started.planRevision === undefined || !["started", "already_started"].includes(started.status)) {
    throw new Error(`canonical_home_visual_start_failed:${started.reason}`);
  }
  return { recordedSessionId: started.recordedSessionId, planRevision: started.planRevision };
}

function recordPrescribedWork(
  planId: string,
  active: Readonly<{ recordedSessionId: string; planRevision: number }>,
  allWorkSets: boolean,
): Readonly<{ ledgerVersion: number }> {
  const initial = canonicalRecordedSessionLedger.get(active.recordedSessionId);
  if (initial.status !== "found") throw new Error(`canonical_home_visual_ledger_unavailable:${active.recordedSessionId}`);
  const slots = Array.isArray(initial.session.prescriptionSnapshot.slots)
    ? initial.session.prescriptionSnapshot.slots as Array<Record<string, unknown>>
    : [];
  const prescribed = slots.flatMap((slot) => {
    const settings = (slot.settings ?? {}) as Record<string, unknown>;
    const required = allWorkSets ? Number(settings.requiredWorkSets ?? settings.requiredSets ?? 0) : 1;
    const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets.map(Number) : [];
    return Array.from({ length: Math.max(0, required) }, (_, index) => ({ slot, setOrder: index + 1, reps: exactTargets[index] ?? Number(slot.targetReps ?? 8) }));
  });
  const selected = allWorkSets ? prescribed : prescribed.slice(0, 1);
  let ledgerVersion = initial.session.version;
  selected.forEach(({ slot, setOrder, reps }, index) => {
    const work = recordCanonicalPerformedWork({
      planId,
      expectedPlanRevision: active.planRevision,
      recordedSessionId: active.recordedSessionId,
      expectedLedgerVersion: ledgerVersion,
      operationId: `${active.recordedSessionId}:work:${index + 1}`,
      occurredAt: offsetIso(initial.session.startedAt ?? initial.session.createdAt, (index + 1) * 1_000),
      provenance: "design_qa_home_visual",
      slotId: String(slot.id),
      exerciseId: String(slot.exerciseId),
      setId: `${String(slot.id)}:work:${setOrder}`,
      setOrder,
      reps,
      load: 60,
      unit: "kg",
      completion: "complete",
    });
    if (work.ledgerVersion === undefined || !["applied", "idempotent"].includes(work.status)) {
      throw new Error(`canonical_home_visual_work_failed:${work.reason}`);
    }
    ledgerVersion = work.ledgerVersion;
  });
  return { ledgerVersion };
}

function completeActiveSession(planId: string, recordedSessionId: string, planRevision: number, ledgerVersion: number, completedAt: string, suffix: string): void {
  const completed = completeCanonicalSession({
    planId,
    expectedPlanRevision: planRevision,
    recordedSessionId,
    expectedLedgerVersion: ledgerVersion,
    operationId: `${planId}:complete:${suffix}`,
    occurredAt: completedAt,
    provenance: "design_qa_home_visual",
  });
  if (completed.status !== "applied" && completed.status !== "idempotent") {
    throw new Error(`canonical_home_visual_completion_failed:${completed.reason}`);
  }
}

function requireModel(planId: string, state: CanonicalHomeVisualState | CanonicalPlanVisualState | CanonicalProgressVisualState) {
  const current = canonicalActivePlanState.getState();
  const model = current.model;
  if (!model || model.planId !== planId) throw new Error(`canonical_home_visual_hydration_failed:${state}:${current.hydration}:${current.error ?? "unknown"}`);
  return model;
}

function offsetIso(value: string, milliseconds: number): string {
  return new Date(Date.parse(value) + milliseconds).toISOString();
}

function canonicalProgressFixtureInput(planId: string) {
  const athleteId = "design-qa-athlete";
  const established = exerciseLibrary.filter((exercise) => exercise.kind !== "bodyweight");
  const establishedLoads = Object.fromEntries(established.map((exercise) => [exercise.id, 60]));
  const loadEvidence = Object.fromEntries(established.map((exercise): [string, CanonicalLoadEvidence] => [exercise.id, {
    evidenceId: `${planId}:established-load:${exercise.id}`,
    evidenceVersion: "canonical_load_evidence_v1",
    athleteId,
    exerciseId: exercise.id,
    observedLoad: 60,
    observedReps: 6,
    baseUnit: "kg",
    freshnessVersion: 1,
    calibrationStatus: "established",
  }]));
  return { ...canonicalFiveDayFixtureInput(planId), establishedLoads, loadEvidence };
}
