import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { exerciseLibrary } from "@/domain/training/presets";

const continuityMode = process.env.ASC_P0_CONTINUITY_MODE === "1";
const outputDirectory = process.env.ASC_P0_CONTINUITY_OUTPUT
  ? fileURLToPath(new URL(process.env.ASC_P0_CONTINUITY_OUTPUT, `file://${process.cwd()}/`))
  : fileURLToPath(new URL("./", import.meta.url));
const createdAt = "2026-07-25T08:00:00.000Z";

type ScenarioId =
  | "normal_responder"
  | "high_responder"
  | "repeated_stall"
  | "poor_recovery"
  | "missed_sessions"
  | "return_after_layoff"
  | "pain_or_limitation"
  | "limited_equipment"
  | "advanced_five_day_hypertrophy"
  | "strength_transition_boundary"
  | "powerbuilding_athlete"
  | "athletic_changing_sport_workload";

type Scenario = Readonly<{
  id: ScenarioId;
  athleteContext: string;
  goal?: "hypertrophy" | "strength_hypertrophy";
  macrocycleGoal?: "build_muscle" | "build_strength" | "build_muscle_and_strength" | "athletic_performance";
  experienceLevel?: "intermediate" | "advanced";
  daysPerWeek?: 3 | 5;
  equipment?: readonly ("barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "bands")[];
  limitations?: readonly string[];
  established?: boolean;
  performance: "success" | "failure" | "partial";
  injectedEvidence?: "prior_failure" | "recovery_constrained" | "returning_capacity" | "pain" | "sport_capacity_constrained";
  productionInputReachability: "mounted" | "simulation_only";
  reachabilityReason: string;
}>;

const scenarios: readonly Scenario[] = [
  { id: "normal_responder", athleteContext: "Intermediate five-day powerbuilding athlete calibrating loads", performance: "success", productionInputReachability: "mounted", reachabilityReason: "Train writes all performed-work and completion facts." },
  { id: "high_responder", athleteContext: "Intermediate five-day powerbuilding athlete with established loads", established: true, performance: "success", productionInputReachability: "mounted", reachabilityReason: "Established load plus successful performed work is mounted." },
  { id: "repeated_stall", athleteContext: "Established athlete with a prior below-target exposure", established: true, performance: "failure", injectedEvidence: "prior_failure", productionInputReachability: "simulation_only", reachabilityReason: "The prior failure is inserted directly; the current failure is mounted, and the comparator does not validate full prescription compatibility." },
  { id: "poor_recovery", athleteContext: "Athlete with fresh complete constrained recovery evidence", performance: "success", injectedEvidence: "recovery_constrained", productionInputReachability: "simulation_only", reachabilityReason: "No mounted production writer records readiness or capacity evidence." },
  { id: "missed_sessions", athleteContext: "Athlete completing only one prescribed slot", established: true, performance: "partial", productionInputReachability: "mounted", reachabilityReason: "Train permits early completion after one working set, but this represents partial work rather than a missed planned session." },
  { id: "return_after_layoff", athleteContext: "Returning athlete with direct capacity evidence", performance: "success", injectedEvidence: "returning_capacity", productionInputReachability: "simulation_only", reachabilityReason: "No mounted production writer records returning-capacity evidence." },
  { id: "pain_or_limitation", athleteContext: "Athlete with a persisted limitation and unresolved pain evidence", limitations: ["exclude_exercise:ex-donkey-calf-raise"], performance: "success", injectedEvidence: "pain", productionInputReachability: "simulation_only", reachabilityReason: "Limitations persist when supplied, but Train has no mounted pain-evidence writer." },
  { id: "limited_equipment", athleteContext: "Three-day barbell/dumbbell/bodyweight/bands athlete", daysPerWeek: 3, equipment: ["barbell", "dumbbell", "bodyweight", "bands"], performance: "success", productionInputReachability: "simulation_only", reachabilityReason: "Canonical construction supports limited equipment, but mounted onboarding still supplies full-gym equipment." },
  { id: "advanced_five_day_hypertrophy", athleteContext: "Advanced five-day hypertrophy athlete", goal: "hypertrophy", macrocycleGoal: "build_muscle", experienceLevel: "advanced", performance: "success", productionInputReachability: "mounted", reachabilityReason: "The canonical onboarding/construction path can produce this context." },
  { id: "strength_transition_boundary", athleteContext: "Established three-day strength athlete completing four full Microcycles", goal: "strength_hypertrophy", macrocycleGoal: "build_strength", daysPerWeek: 3, established: true, performance: "success", productionInputReachability: "mounted", reachabilityReason: "Performed work, completed Microcycles, and cycle lineage are mounted facts." },
  { id: "powerbuilding_athlete", athleteContext: "Established five-day powerbuilding athlete", established: true, performance: "success", productionInputReachability: "mounted", reachabilityReason: "The entire input path is mounted." },
  { id: "athletic_changing_sport_workload", athleteContext: "Three-day athletic athlete with constrained capacity and increased sport workload", macrocycleGoal: "athletic_performance", daysPerWeek: 3, performance: "success", injectedEvidence: "sport_capacity_constrained", productionInputReachability: "simulation_only", reachabilityReason: "Initial sport workload is mounted, but no production writer records later workload/capacity changes." },
];
const selectedScenarioId = process.env.ASC_P0_SCENARIO;
const selectedScenarios = selectedScenarioId ? scenarios.filter((scenario) => scenario.id === selectedScenarioId) : scenarios;
if (selectedScenarioId && selectedScenarios.length !== 1) throw new Error(`unknown_continuity_scenario:${selectedScenarioId}`);

type Started = Readonly<{
  planId: string;
  planRevision: number;
  recordedSessionId: string;
  session: Extract<ReturnType<typeof canonicalRecordedSessionLedger.get>, { status: "found" }>;
}>;

type FutureSummary = Readonly<{
  sessionIds: readonly string[];
  slots: readonly Readonly<{
    sessionIndex: number;
    role: string;
    slotId: string;
    exerciseId: string;
    loadState: string;
    prescribedBaseLoad: number | null;
    prescribedSets: number;
    targetReps: readonly number[];
  }>[];
}>;

function clearState(): void {
  jsonStore.clearByPrefix("iron-logic.");
  jsonStore.resetCache();
  canonicalActivePlanState.clear();
  canonicalRecordedSessionLedger.clear();
  canonicalProgressEvidenceRepository.clear();
  canonicalProgressDecisionRepository.clear();
  canonicalCoachingAttemptRepository.clear();
}

function must<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) throw new Error(message);
  return value;
}

function createPlan(scenario: Scenario, suffix: string): string {
  const planId = `post-cert:${scenario.id}:${suffix}`;
  const input = (id: string, establishedExerciseIds: readonly string[] = []) => ({
    planId: id,
    createdAt,
    updatedAt: createdAt,
    goal: scenario.goal ?? "strength_hypertrophy",
    macrocycleGoal: scenario.macrocycleGoal ?? "build_muscle_and_strength",
    experienceLevel: scenario.experienceLevel ?? "intermediate",
    daysPerWeek: scenario.daysPerWeek ?? 5,
    preferredSplit: "let_app_choose",
    equipment: scenario.equipment ?? ["barbell", "dumbbell", "machine", "cable", "bodyweight"],
    units: "kg",
    exercises: exerciseLibrary,
    limitations: scenario.limitations,
    history: [],
    ...(establishedExerciseIds.length ? {
      establishedLoads: Object.fromEntries(establishedExerciseIds.map((exerciseId) => [exerciseId, 80])),
      loadEvidence: Object.fromEntries(establishedExerciseIds.map((exerciseId) => [exerciseId, loadEvidenceFor(exerciseId, 80)])),
    } : {}),
  });
  let establishedExerciseIds: readonly string[] = [];
  if (scenario.established) {
    const probe = canonicalActivePlanState.create(input(`${planId}:selection-probe`));
    if (probe.hydration !== "hydrated" || !probe.model) throw new Error(`${scenario.id}:selection_probe:${probe.error ?? "unknown"}`);
    establishedExerciseIds = [...new Set(probe.model.plannedSessions.flatMap((session) => sessionSlots(session.snapshot).map((slot) => String(slot.exerciseId))))].sort();
    clearState();
  }
  const result = canonicalActivePlanState.create(input(planId, establishedExerciseIds));
  if (result.hydration !== "hydrated" || !result.model) throw new Error(`${scenario.id}:plan_creation:${result.error ?? "unknown"}`);
  return planId;
}

function startNext(planId: string, ordinal: number): Started {
  canonicalActivePlanState.hydrate();
  const model = must(canonicalActivePlanState.getReadModel(), `${planId}:read_model_missing`);
  const next = must(model.nextSession, `${planId}:next_session_missing`);
  const planned = must(model.plannedSessions.find((candidate) => candidate.id === next.id), `${planId}:planned_session_missing`);
  const result = startCanonicalSession({
    planId,
    expectedPlanRevision: model.revision,
    plannedSessionId: planned.id,
    expectedPrescriptionHash: prescriptionHash(planned.snapshot),
    operationId: `${planId}:start:${ordinal}`,
    startedAt: isoFor(ordinal, 0),
    provenance: "post_remediation_certification",
  });
  const recordedSessionId = must(result.recordedSessionId, `${planId}:start:${result.reason}`);
  const planRevision = must(result.planRevision, `${planId}:start_revision_missing`);
  const session = canonicalRecordedSessionLedger.get(recordedSessionId);
  if (session.status !== "found") throw new Error(`${planId}:recorded_session_missing`);
  return { planId, planRevision, recordedSessionId, session };
}

function performAndComplete(started: Started, pattern: "success" | "failure" | "partial", load: number, ordinal: number): ReturnType<typeof completeCanonicalSession> {
  let version = started.session.session.version;
  const slots = sessionSlots(started.session.session.prescriptionSnapshot);
  const selectedSlots = pattern === "partial" ? slots.slice(0, 1) : slots;
  let operation = 0;
  for (const slot of selectedSlots) {
    const settings = slot.settings as Record<string, unknown> | undefined;
    const requiredSets = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0);
    const targets = Array.isArray(slot.exactTargets) ? slot.exactTargets as number[] : [];
    for (let setOrder = 1; setOrder <= requiredSets; setOrder += 1) {
      const targetReps = Number(targets[setOrder - 1] ?? slot.targetReps ?? 8);
      const reps = pattern === "failure" ? Math.max(0, targetReps - 2) : targetReps;
      const result = recordCanonicalPerformedWork({
        planId: started.planId,
        expectedPlanRevision: started.planRevision,
        recordedSessionId: started.recordedSessionId,
        expectedLedgerVersion: version,
        operationId: `${started.planId}:work:${ordinal}:${operation}`,
        occurredAt: isoFor(ordinal, operation + 1),
        provenance: "post_remediation_certification",
        slotId: String(slot.id),
        exerciseId: String(slot.exerciseId),
        setId: `${String(slot.id)}:set:${setOrder}`,
        setOrder,
        reps,
        load,
        unit: "kg",
        completion: reps >= targetReps ? "complete" : "partial",
      });
      if (result.status !== "applied" || result.ledgerVersion === undefined) throw new Error(`${started.planId}:performed_work:${result.reason}`);
      version = result.ledgerVersion;
      operation += 1;
    }
  }
  return completeCanonicalSession({
    planId: started.planId,
    expectedPlanRevision: started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion: version,
    operationId: `${started.planId}:complete:${ordinal}`,
    occurredAt: isoFor(ordinal, 100),
    provenance: "post_remediation_certification",
  });
}

function addInjectedEvidence(started: Started, kind: Scenario["injectedEvidence"], ordinal: number): void {
  if (!kind) return;
  const slot = sessionSlots(started.session.session.prescriptionSnapshot)[0];
  if (!slot) throw new Error(`${started.planId}:slot_missing`);
  const common = {
    schemaVersion: "canonical_progress_evidence_v1" as const,
    planId: started.planId,
    planRevision: started.planRevision,
    macrocycleId: started.session.session.macrocycleId,
    mesocycleId: started.session.session.mesocycleId as never,
    microcycleId: started.session.session.microcycleId,
    athleteId: started.session.session.athleteId,
    observedAt: isoFor(ordinal, -1),
    source: "post_remediation_certification_direct_repository_injection",
    evidenceVersion: "progress_v1",
  };
  const evidence = kind === "prior_failure"
    ? {
      ...common,
      evidenceId: `${started.planId}:prior-failure`,
      sessionId: `${started.planId}:different-role-prior-session`,
      slotId: `${started.planId}:different-slot`,
      kind: "performance" as const,
      observations: { exerciseId: String(slot.exerciseId), load: 80, reps: 5, unit: "kg", completion: "partial", prescribedTargetReps: 8, loadingMode: "fixed_external", sessionRole: "different_role" },
    }
    : kind === "pain"
      ? { ...common, evidenceId: `${started.recordedSessionId}:pain:${ordinal}`, sessionId: started.recordedSessionId, kind: "pain" as const, observations: { location: "shoulder", status: "unresolved" } }
      : {
        ...common,
        evidenceId: `${started.recordedSessionId}:${kind}:${ordinal}`,
        sessionId: started.recordedSessionId,
        kind: kind === "recovery_constrained" ? "readiness" as const : "capacity" as const,
        observations: kind === "returning_capacity"
          ? { freshness: "fresh", completeness: "complete", recovery: "ready", fatigue: "stable", recentTraining: "returning" }
          : kind === "sport_capacity_constrained"
            ? { freshness: "fresh", completeness: "complete", recovery: "constrained", fatigue: "systemic", sportWorkload: "increased" }
            : { freshness: "fresh", completeness: "complete", recovery: "constrained", fatigue: "systemic" },
      };
  const result = canonicalProgressEvidenceRepository.record(evidence);
  if (result.status !== "saved" && result.status !== "duplicate") throw new Error(`${started.planId}:injected_evidence:${result.reason}`);
}

function futureSummary(): FutureSummary {
  const carrier = canonicalActivePlanV2Repository.get();
  if (carrier.status !== "saved") throw new Error("future_summary_plan_missing");
  return {
    sessionIds: carrier.carrier.plannedSessions.map((session) => session.id).sort(),
    slots: carrier.carrier.plannedSessions.flatMap((session) => sessionSlots(session.prescriptionSnapshot).map((slot) => {
      const load = slot.loadPrescription as Record<string, unknown> | undefined;
      const settings = slot.settings as Record<string, unknown> | undefined;
      return {
        sessionIndex: session.planSessionIndex,
        role: session.role,
        slotId: String(slot.id),
        exerciseId: String(slot.exerciseId),
        loadState: String(load?.state ?? "unavailable"),
        prescribedBaseLoad: typeof load?.prescribedBaseLoad === "number" ? load.prescribedBaseLoad : null,
        prescribedSets: Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0),
        targetReps: Array.isArray(slot.exactTargets) ? [...slot.exactTargets as number[]] : [],
      };
    })),
  };
}

function futureDiff(before: FutureSummary, after: FutureSummary) {
  const key = (slot: FutureSummary["slots"][number]) => `${slot.sessionIndex}:${slot.exerciseId}`;
  const comparable = (slot: FutureSummary["slots"][number] | undefined) => slot ? {
    sessionIndex: slot.sessionIndex,
    role: slot.role,
    exerciseId: slot.exerciseId,
    loadState: slot.loadState,
    prescribedBaseLoad: slot.prescribedBaseLoad,
    prescribedSets: slot.prescribedSets,
    targetReps: slot.targetReps,
  } : null;
  const beforeByKey = new Map(before.slots.map((slot) => [key(slot), slot]));
  const afterByKey = new Map(after.slots.map((slot) => [key(slot), slot]));
  const keys = [...new Set([...beforeByKey.keys(), ...afterByKey.keys()])].sort();
  return keys.flatMap((id) => {
    const prior = beforeByKey.get(id);
    const next = afterByKey.get(id);
    return JSON.stringify(comparable(prior)) === JSON.stringify(comparable(next))
      ? []
      : [{ id, before: prior ?? null, after: next ?? null }];
  });
}

function runOneStep(scenario: Scenario, run: number) {
  clearState();
  const planId = createPlan(scenario, "one-step");
  if (scenario.id === "strength_transition_boundary") {
    let last: ReturnType<typeof captureCompletedBoundary> | null = null;
    for (let ordinal = 0; ordinal < 12; ordinal += 1) {
      const started = startNext(planId, ordinal);
      last = captureCompletedBoundary(started, scenario, ordinal, "success", 80);
    }
    return must(last, `${scenario.id}:boundary_missing`);
  }
  const started = startNext(planId, 0);
  addInjectedEvidence(started, scenario.injectedEvidence, 0);
  return captureCompletedBoundary(started, scenario, 0, scenario.performance, scenario.established ? 80 : 60);
}

function captureCompletedBoundary(started: Started, scenario: Scenario, ordinal: number, performance: Scenario["performance"], load: number) {
  const before = futureSummary();
  const immutableCompletedPrescription = JSON.stringify(started.session.session.prescriptionSnapshot);
  const completion = performAndComplete(started, performance, load, ordinal);
  const evidence = canonicalProgressEvidenceRepository.list(started.planId).filter((item) => item.sessionId === started.recordedSessionId);
  const decision = must(canonicalProgressDecisionRepository.list(started.planId).at(-1), `${scenario.id}:decision_missing`);
  const after = futureSummary();
  const ledger = canonicalRecordedSessionLedger.get(started.recordedSessionId);
  if (ledger.status !== "found") throw new Error(`${scenario.id}:ledger_missing`);
  const historicalImmutable = JSON.stringify(ledger.session.prescriptionSnapshot) === immutableCompletedPrescription;
  jsonStore.resetCache();
  canonicalActivePlanState.hydrate();
  const restarted = must(canonicalActivePlanState.getReadModel(), `${scenario.id}:restart_plan_missing`);
  const home = readCanonicalHomeProjection({ now: Date.parse("2026-09-01T08:00:00.000Z") });
  const plan = projectCanonicalPlan(restarted);
  const train = restarted.nextSession ? canonicalActivePlanState.getPlannedSession(restarted.nextSession.id) : null;
  const trainId = train ? projectCanonicalWorkoutPresentation({ session: null, snapshot: train.prescriptionSnapshot }).id : null;
  const revisionBeforeRetry = restarted.revision;
  const duplicate = completeCanonicalSession({
    planId: started.planId,
    expectedPlanRevision: started.planRevision,
    recordedSessionId: started.recordedSessionId,
    expectedLedgerVersion: 0,
    operationId: `${started.planId}:duplicate:${ordinal}`,
    occurredAt: isoFor(ordinal, 120),
    provenance: "post_remediation_certification",
  });
  const revisionAfterRetry = canonicalActivePlanState.getReadModel()?.revision ?? -1;
  return {
    scenarioId: scenario.id,
    athleteContext: scenario.athleteContext,
    productionInputReachability: scenario.productionInputReachability,
    reachabilityReason: scenario.reachabilityReason,
    completedPrescription: {
      plannedSessionId: started.session.session.plannedSessionId,
      recordedSessionId: started.recordedSessionId,
      prescriptionHash: started.session.session.prescriptionHash,
      slotCount: sessionSlots(started.session.session.prescriptionSnapshot).length,
      prescribedWorkingSets: prescribedSets(started.session.session.prescriptionSnapshot),
    },
    factualEvidence: evidence.map((item) => ({ id: item.evidenceId, kind: item.kind, slotId: item.slotId ?? null, exerciseId: item.observations.exerciseId ?? null, completion: item.observations.completion ?? null, source: item.source })),
    evaluatorOutput: {
      evaluationId: decision.evaluationId,
      decisionType: decision.phaseOne?.decisionType ?? null,
      reasonCodes: decision.phaseOne?.reasonCodes ?? [],
      evidenceSummary: decision.phaseOne?.evidenceSummary ?? null,
      explanation: decision.explanation,
    },
    persistedDecision: {
      decisionId: decision.decisionId,
      outcome: decision.outcome,
      result: decision.phaseOne?.result ?? null,
      boundedAdjustment: decision.phaseOne?.boundedAdjustment ?? null,
    },
    futureInventory: {
      sessionIdsBefore: before.sessionIds,
      sessionIdsAfter: after.sessionIds,
      slotCountBefore: before.slots.length,
      slotCountAfter: after.slots.length,
    },
    futureDiff: futureDiff(before, after),
    applicationReceipt: decision.phaseOneApplication ?? null,
    completionResult: completion,
    historicalPrescriptionImmutable: historicalImmutable,
    restart: {
      revision: restarted.revision,
      decisionId: restarted.progress.latestDecision?.decisionId ?? null,
      resultingFutureSessionIds: restarted.progress.latestDecision?.resultingFutureSessionIds ?? [],
    },
    duplicate: {
      status: duplicate.status,
      reason: duplicate.reason,
      revisionBefore: revisionBeforeRetry,
      revisionAfter: revisionAfterRetry,
    },
    screenIdentities: {
      readModel: restarted.nextSession?.id ?? null,
      home: home.primary?.action?.sessionId ?? null,
      plan: plan.nextActionableSession?.id ?? null,
      train: train?.id ?? null,
      trainPresentation: trainId,
    },
  };
}

function runLongitudinal(scenario: Scenario) {
  clearState();
  const planId = createPlan(scenario, "longitudinal");
  const decisions: Array<Record<string, unknown>> = [];
  let ordinal = 0;
  let highestWeek = 1;
  let noNextReason: string | null = null;
  while (highestWeek <= 12 && ordinal < 100) {
    canonicalActivePlanState.hydrate();
    const model = must(canonicalActivePlanState.getReadModel(), `${scenario.id}:longitudinal_plan_missing`);
    highestWeek = Math.max(highestWeek, model.microcycle.sequenceNumber);
    if (!model.nextSession) {
      noNextReason = "no_future_planned_session";
      break;
    }
    const started = startNext(planId, ordinal);
    if (!continuityMode && scenario.injectedEvidence && scenario.injectedEvidence !== "prior_failure") addInjectedEvidence(started, scenario.injectedEvidence, ordinal);
    if (scenario.injectedEvidence === "prior_failure" && ordinal === 0) addInjectedEvidence(started, "prior_failure", ordinal);
    const performance = scenario.id === "repeated_stall"
      ? ordinal < 2 ? "failure" : "success"
      : continuityMode && scenario.performance === "partial"
        ? ordinal === 0 ? "partial" : "success"
        : continuityMode && scenario.productionInputReachability === "simulation_only"
          ? "success"
          : scenario.performance;
    const before = futureSummary();
    const completion = performAndComplete(started, performance, scenario.established ? 80 : 60, ordinal);
    const decision = must(canonicalProgressDecisionRepository.list(planId).at(-1), `${scenario.id}:longitudinal_decision_missing:${ordinal}`);
    const attempt = canonicalCoachingAttemptRepository.list(planId).at(-1);
    const after = futureSummary();
    decisions.push({
      ordinal: ordinal + 1,
      microcycleSequence: model.microcycle.sequenceNumber,
      plannedSessionId: started.session.session.plannedSessionId,
      recordedSessionId: started.recordedSessionId,
      performance,
      completionStatus: completion.status,
      completionReason: completion.reason,
      attemptStatus: attempt?.status ?? null,
      attemptReason: attempt?.reason ?? null,
      decisionType: decision.phaseOne?.decisionType ?? null,
      result: decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        ? decision.phaseOneApplication.actualResult
        : decision.phaseOne?.result ?? null,
      reasonCodes: decision.phaseOne?.reasonCodes ?? [],
      boundaryResolution: decision.phaseOne?.boundaryResolution ?? null,
      applicationStatus: decision.phaseOneApplication?.status ?? null,
      priorRevision: decision.phaseOneApplication?.priorRevision ?? null,
      newRevision: decision.phaseOneApplication?.newRevision ?? null,
      materialDeltas: decision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        ? decision.phaseOneApplication.materialDeltas
        : [],
      futureSessionCountBefore: before.sessionIds.length,
      futureSessionCountAfter: after.sessionIds.length,
      numericalChanges: futureDiff(before, after).filter((change) => {
        const prior = change.before as FutureSummary["slots"][number] | null;
        const next = change.after as FutureSummary["slots"][number] | null;
        return prior?.prescribedBaseLoad !== next?.prescribedBaseLoad || prior?.prescribedSets !== next?.prescribedSets || JSON.stringify(prior?.targetReps) !== JSON.stringify(next?.targetReps);
      }).map((change) => {
        const prior = change.before as FutureSummary["slots"][number] | null;
        const next = change.after as FutureSummary["slots"][number] | null;
        return {
          id: change.id,
          before: prior ? {
            exerciseId: prior.exerciseId,
            sessionIndex: prior.sessionIndex,
            loadState: prior.loadState,
            prescribedBaseLoad: prior.prescribedBaseLoad,
            prescribedSets: prior.prescribedSets,
            targetReps: prior.targetReps,
          } : null,
          after: next ? {
            exerciseId: next.exerciseId,
            sessionIndex: next.sessionIndex,
            loadState: next.loadState,
            prescribedBaseLoad: next.prescribedBaseLoad,
            prescribedSets: next.prescribedSets,
            targetReps: next.targetReps,
          } : null,
        };
      }),
    });
    jsonStore.resetCache();
    canonicalActivePlanState.hydrate();
    (globalThis as typeof globalThis & { gc?: () => void }).gc?.();
    ordinal += 1;
    highestWeek = Math.max(highestWeek, canonicalActivePlanState.getReadModel()?.microcycle.sequenceNumber ?? highestWeek);
  }
  const finalModel = must(canonicalActivePlanState.getReadModel(), `${scenario.id}:final_model_missing`);
  const finalDecision = canonicalProgressDecisionRepository.list(planId).at(-1);
  const deadlocked = !finalModel.nextSession && highestWeek < 12;
  return {
    scenarioId: scenario.id,
    athleteContext: scenario.athleteContext,
    productionInputReachability: scenario.productionInputReachability,
    sessionsCompleted: ordinal,
    highestMicrocycleSequence: highestWeek,
    targetWeeks: 12,
    reachedTwelveWeeks: highestWeek >= 12 && Boolean(finalModel.nextSession),
    deadlocked,
    noNextReason,
    finalDecision: finalDecision?.phaseOne ? {
      decisionType: finalDecision.phaseOne.decisionType,
      result: finalDecision.phaseOneApplication?.schemaVersion === "canonical_coaching_application_receipt_v2"
        ? finalDecision.phaseOneApplication.actualResult
        : finalDecision.phaseOne.result,
      reasonCodes: finalDecision.phaseOne.reasonCodes,
      boundaryResolution: finalDecision.phaseOne.boundaryResolution ?? null,
      applicationStatus: finalDecision.phaseOneApplication?.status ?? null,
    } : null,
    decisionCounts: countBy(decisions.map((decision) => String(decision.decisionType))),
    resultCounts: countBy(decisions.map((decision) => String(decision.result))),
    decisions,
  };
}

function semanticOneStep(result: ReturnType<typeof runOneStep>) {
  return {
    scenarioId: result.scenarioId,
    productionInputReachability: result.productionInputReachability,
    completedPrescription: { slotCount: result.completedPrescription.slotCount, prescribedWorkingSets: result.completedPrescription.prescribedWorkingSets },
    evidenceKinds: result.factualEvidence.map((item) => item.kind),
    decisionType: result.evaluatorOutput.decisionType,
    reasonCodes: result.evaluatorOutput.reasonCodes,
    result: result.persistedDecision.result,
    boundedKind: result.persistedDecision.boundedAdjustment?.kind ?? null,
    futureDiff: result.futureDiff.map((change) => ({ before: change.before, after: change.after })),
    applicationStatus: result.applicationReceipt?.status ?? null,
    immutable: result.historicalPrescriptionImmutable,
    duplicateStatus: result.duplicate.status,
    screenIdentityAgreement: new Set(Object.values(result.screenIdentities).filter(Boolean)).size <= 1,
  };
}

function isoFor(ordinal: number, offset: number): string {
  return new Date(Date.UTC(2026, 7, 1, 8, 0, 0) + ordinal * 24 * 60 * 60 * 1000 + offset * 60 * 1000).toISOString();
}

function sessionSlots(snapshot: Readonly<Record<string, unknown>>): Record<string, unknown>[] {
  return Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : [];
}

function prescribedSets(snapshot: Readonly<Record<string, unknown>>): number {
  return sessionSlots(snapshot).reduce((total, slot) => {
    const settings = slot.settings as Record<string, unknown> | undefined;
    return total + Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0);
  }, 0);
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

function countBy(values: readonly string[]): Record<string, number> {
  return Object.fromEntries([...new Set(values)].sort().map((value) => [value, values.filter((candidate) => candidate === value).length]));
}

mkdirSync(outputDirectory, { recursive: true });
const firstOneStep = continuityMode ? [] : selectedScenarios.map((scenario) => runOneStep(scenario, 1));
const secondOneStep = continuityMode ? [] : selectedScenarios.map((scenario) => runOneStep(scenario, 2));
const firstSemantic = firstOneStep.map(semanticOneStep);
const secondSemantic = secondOneStep.map(semanticOneStep);
const oneStepDeterministic = JSON.stringify(firstSemantic) === JSON.stringify(secondSemantic);
const oneStep = {
  schemaVersion: "canonical_coaching_loop_post_remediation_scenario_reproduction_v1",
  auditedCommit: "2fe93443add4420aaa7d4e3a9a86fdc1a13c8da1",
  runCount: 2,
  scenarioCount: scenarios.length,
  semanticDeterminism: oneStepDeterministic,
  reportedCounts: { futureChanges: 5, explicitNoChangeOrReview: 7, silentOmissions: 0 },
  reproducedCounts: {
    futureChanges: firstOneStep.filter((result) => result.persistedDecision.result === "future_prescription_change").length,
    explicitNoChangeOrReview: firstOneStep.filter((result) => result.persistedDecision.result === "explicit_no_change" || result.persistedDecision.result === "blocked_no_change").length,
    silentOmissions: firstOneStep.filter((result) => !result.persistedDecision.result).length,
  },
  fullyMountedInputScenarios: firstOneStep.filter((result) => result.productionInputReachability === "mounted").map((result) => result.scenarioId),
  simulationOnlyInputScenarios: firstOneStep.filter((result) => result.productionInputReachability === "simulation_only").map((result) => result.scenarioId),
  scenarios: firstOneStep,
  secondRunSemanticResults: secondSemantic,
};
if (!continuityMode) writeFileSync(`${outputDirectory}/scenario-reproduction.json`, `${JSON.stringify(oneStep, null, 2)}\n`);

const longitudinalScenarios = selectedScenarios.map(runLongitudinal);
const longitudinal = {
  schemaVersion: continuityMode ? "canonical_coaching_loop_p0_continuity_longitudinal_v1" : "canonical_coaching_loop_post_remediation_longitudinal_v1",
  auditedCommit: continuityMode ? "7a5a21d40240fab407dbb17a47324dbedda32ff2+working-tree" : "2fe93443add4420aaa7d4e3a9a86fdc1a13c8da1",
  targetWeeks: 12,
  scenarioCount: longitudinalScenarios.length,
  scenariosReachingTwelveWeeks: longitudinalScenarios.filter((scenario) => scenario.reachedTwelveWeeks).length,
  deadlockedScenarioCount: longitudinalScenarios.filter((scenario) => scenario.deadlocked).length,
  scenarios: longitudinalScenarios,
};
writeFileSync(`${outputDirectory}/${continuityMode && selectedScenarioId ? `longitudinal-${selectedScenarioId}.json` : "longitudinal-12-week-results.json"}`, `${JSON.stringify(longitudinal, null, 2)}\n`);

if (!continuityMode && !oneStepDeterministic) throw new Error("one_step_semantic_determinism_failed");
if (!continuityMode && (oneStep.reproducedCounts.futureChanges !== 5 || oneStep.reproducedCounts.explicitNoChangeOrReview !== 7 || oneStep.reproducedCounts.silentOmissions !== 0)) {
  throw new Error(`one_step_count_mismatch:${JSON.stringify(oneStep.reproducedCounts)}`);
}
console.log(JSON.stringify({
  oneStep: oneStep.reproducedCounts,
  fullyMountedInputScenarios: oneStep.fullyMountedInputScenarios,
  simulationOnlyInputScenarios: oneStep.simulationOnlyInputScenarios,
  longitudinal: {
    scenariosReachingTwelveWeeks: longitudinal.scenariosReachingTwelveWeeks,
    deadlockedScenarioCount: longitudinal.deadlockedScenarioCount,
    sessionsByScenario: Object.fromEntries(longitudinalScenarios.map((scenario) => [scenario.scenarioId, scenario.sessionsCompleted])),
    finalDecisions: Object.fromEntries(longitudinalScenarios.map((scenario) => [scenario.scenarioId, scenario.finalDecision])),
  },
}, null, 2));
