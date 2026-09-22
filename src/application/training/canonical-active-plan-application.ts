import { constructCanonicalActivePlanFromCanonicalInputs, type CanonicalGeneratedPlanInput } from "@/application/training/canonical-active-plan-construction";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import type { CanonicalActivePlanCarrier, CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { Equipment, Exercise, ExperienceLevel, ProgrammeGoal, UnitSystem, WorkoutHistorySummary } from "@/domain/training/models";
import type { CanonicalTrainingDaysPerWeek } from "@/domain/training/microcycle-scheduler";
import { reconcileCanonicalActivePlanReferences } from "@/application/training/canonical-recorded-reference-reconciliation";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import type { CanonicalLoadEvidence } from "@/domain/training/canonical-load-prescription";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import type { RecoveryCardioPreference } from "@/domain/training/plan-setup";
import type { CanonicalCardioPrescription } from "@/domain/training/canonical-cardio-prescription";
import { normalizeCanonicalSessionDuration, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";
import type { CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";
import { resolveCanonicalConstructionFacts } from "@/application/training/canonical-construction-facts";
import { buildWorkoutHistoryForPlan } from "@/domain/training/canonical-recorded-session-legacy-history-bridge";
import { resolveCanonicalSessionDuration } from "@/domain/training/canonical-session-duration";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { exerciseCustomisations, reapplyCanonicalExerciseCustomisations } from "@/domain/training/canonical-exercise-customisations";

export type CanonicalActivePlanCreateCommand = Readonly<{
  planId: string; createdAt: string; updatedAt: string; goal: ProgrammeGoal; macrocycleGoal: CanonicalGeneratedPlanInput["macrocycleGoal"]; experienceLevel: ExperienceLevel; daysPerWeek: CanonicalTrainingDaysPerWeek; preferredSplit: CanonicalGeneratedPlanInput["preferredSplit"]; equipment: readonly Equipment[]; units: UnitSystem; targetDate?: string; recoveryCardioPreference?: RecoveryCardioPreference; availableSessionMinutes?: CanonicalSessionDurationMinutes; startingVolumeContext?: CanonicalStartingVolumeContext; exercises: readonly Exercise[]; limitations?: readonly string[]; exercisePreferences?: Readonly<Record<string, ExercisePreferenceRecord>>; history?: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; loadEvidence?: Readonly<Record<string, CanonicalLoadEvidence>>;
}>;

export type CanonicalRecordedSessionProjection = Readonly<{ recordedSessionId: string; role: string; macrocycleId: string; mesocycleId: string; microcycleId: string; status: string; prescribedSlots: number; performedSets: number; performedReps: number; performedLoad: number; completedSlots: number; partialSlots: number; missedSlots: number; substitutions: readonly string[]; startedAt?: string; completedAt?: string; completionSummaryId?: string; progressEvidence: "pending" | "complete"; restorationIdentity: string }>;
export type CanonicalActivePlanReadModel = Readonly<{ schemaVersion: "canonical_active_plan_read_model_v1"; planId: string; revision: number; equipment: readonly Equipment[]; macrocycle: Readonly<{ goal: string; targetDate?: string; rolling: boolean }>; mesocycle: Readonly<{ id: string; definitionId?: string; position: number; purpose: string }>; microcycle: Readonly<{ id: string; sequenceNumber: number; trainingDays: number; sessionRoles: readonly string[]; availableSessionMinutes?: CanonicalSessionDurationMinutes }>; conditioning?: CanonicalCardioPrescription; plannedSessions: readonly Readonly<{ id: string; microcycleId: string; role: string; planSessionIndex: number; status: string; constructionVersion: string; revision: number; snapshot: Readonly<Record<string, unknown>> }>[]; activeRecordedSession?: CanonicalRecordedSessionProjection | null; historicalRecordedSessions?: readonly CanonicalRecordedSessionProjection[]; nextSession: Readonly<{ id: string; role: string }> | null; progress: Readonly<{ evidenceVersion: string; revision: number; latestDecision?: Readonly<{ decisionId: string; decisionType: string; explanation: string; reasonCodes: readonly string[]; sourceRecordedSessionId: string; result: string; applicationStatus?: string; resultingFutureSessionIds?: readonly string[]; boundaryState?: import("@/domain/training/canonical-progress-decision").CanonicalCoachingBoundaryState }> }> }>;

export type CanonicalActivePlanApplicationResult = Readonly<{ status: "ok"; model: CanonicalActivePlanReadModel }> | Readonly<{ status: "invalid"; reason: string }>;

export function createCanonicalActivePlan(command: CanonicalActivePlanCreateCommand): CanonicalActivePlanApplicationResult {
  const result = constructCanonicalActivePlanFromCanonicalInputs(command);
  if (result.status !== "constructed") return { status: "invalid", reason: result.reason };
  const saved = canonicalActivePlanV2Repository.saveAtomically(result.carrier);
  if (saved.status !== "saved") return { status: "invalid", reason: saved.status === "conflict" ? saved.reason : saved.status === "invalid" ? saved.reason : "canonical_plan_save_failed" };
  return { status: "ok", model: projectCanonicalActivePlan(saved.carrier) };
}

export type CanonicalSessionDurationChangeResult = Readonly<{
  status: "applied" | "unchanged" | "rejected";
  reason: string;
  priorRevision: number;
  newRevision: number;
  historyPreserved: boolean;
  futureSessionsRegenerated: boolean;
  customerGuidance?: string;
}>;

/** Reconstructs only future immutable Session Construction snapshots. Recorded
 * sessions and lineage are retained byte-for-byte; an active attempt or stale
 * revision fails closed before any write. */
export function changeCanonicalSessionDuration(command: Readonly<{
  planId: string;
  expectedRevision: number;
  availableSessionMinutes: unknown;
  updatedAt: string;
}>): CanonicalSessionDurationChangeResult {
  const duration = resolveCanonicalSessionDuration(command.availableSessionMinutes);
  if (duration.status !== "valid") return { status: "rejected", reason: duration.reason, priorRevision: command.expectedRevision, newRevision: command.expectedRevision, historyPreserved: true, futureSessionsRegenerated: false, customerGuidance: duration.customerGuidance };
  const raw = canonicalActivePlanV2Repository.get();
  if (raw.status !== "saved") return durationRejected(command.expectedRevision, "canonical_plan_unavailable");
  if (raw.carrier.planId !== command.planId || raw.carrier.revision !== command.expectedRevision) return durationRejected(raw.carrier.revision, "stale_plan_revision");
  if (normalizeCanonicalSessionDuration(raw.carrier.constraints.availableSessionMinutes) === duration.minutes) return { status: "unchanged", reason: "session_duration_unchanged", priorRevision: raw.carrier.revision, newRevision: raw.carrier.revision, historyPreserved: true, futureSessionsRegenerated: false };
  if (raw.carrier.operational.openWorkoutId || projectCanonicalActivePlan(raw.carrier).activeRecordedSession) return { ...durationRejected(raw.carrier.revision, "active_session_must_be_completed_or_discarded"), customerGuidance: "Finish or discard the active workout before changing workout length." };
  const facts = resolveCanonicalConstructionFacts(raw.carrier);
  if (facts.status !== "ready") return durationRejected(raw.carrier.revision, facts.reason);
  const realHistory = buildWorkoutHistoryForPlan(canonicalRecordedSessionLedger.exportPlan(raw.carrier.planId), facts.facts.exercises, raw.carrier.constraints.units);
  const constructed = constructCanonicalActivePlanFromCanonicalInputs({
    planId: raw.carrier.planId,
    createdAt: raw.carrier.createdAt,
    updatedAt: command.updatedAt,
    goal: raw.carrier.constraints.goal,
    macrocycleGoal: macrocycleGoalForCarrier(raw.carrier.macrocycle.output.goal),
    experienceLevel: raw.carrier.constraints.experienceLevel,
    daysPerWeek: raw.carrier.constraints.daysPerWeek as CanonicalTrainingDaysPerWeek,
    preferredSplit: raw.carrier.constraints.preferredSplit as CanonicalGeneratedPlanInput["preferredSplit"],
    equipment: facts.facts.equipment,
    units: raw.carrier.constraints.units,
    targetDate: raw.carrier.constraints.targetDate,
    recoveryCardioPreference: raw.carrier.constraints.recoveryCardioPreference,
    availableSessionMinutes: duration.minutes,
    startingVolumeContext: raw.carrier.constraints.startingVolumeContext,
    trainingPriority: raw.carrier.constraints.trainingPriority,
    microcycleSequenceNumber: raw.carrier.microcycle.output.sequenceNumber,
    exercises: facts.facts.exercises,
    limitations: facts.facts.limitations,
    history: realHistory,
    establishedLoads: facts.facts.establishedLoads,
  });
  if (constructed.status !== "constructed") return { ...durationRejected(raw.carrier.revision, `session_duration_infeasible:${constructed.reason}`), customerGuidance: "That workout length cannot preserve the required training coverage for this programme. Choose a longer workout or fewer training constraints." };
  const nextRevision = raw.carrier.revision + 1;
  const retainedCustomisations = exerciseCustomisations(raw.carrier);
  const next = {
    ...constructed.carrier,
    revision: nextRevision,
    progress: { ...constructed.carrier.progress, revision: nextRevision },
    plannedSessions: reapplyCanonicalExerciseCustomisations(constructed.carrier.plannedSessions, retainedCustomisations, nextRevision),
    recordedSessionReferences: raw.carrier.recordedSessionReferences ?? [],
    cycleLineage: raw.carrier.cycleLineage ?? [],
    constructionInputs: facts.facts.references,
    operational: { ...constructed.carrier.operational, exerciseCustomisations: retainedCustomisations },
  };
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, raw.carrier.revision);
  if (saved.status !== "saved") return durationRejected(raw.carrier.revision, saved.status === "conflict" ? "stale_plan_revision" : "canonical_plan_save_failed");
  return { status: "applied", reason: "future_sessions_reconstructed_for_duration", priorRevision: raw.carrier.revision, newRevision: nextRevision, historyPreserved: JSON.stringify(next.recordedSessionReferences) === JSON.stringify(raw.carrier.recordedSessionReferences ?? []), futureSessionsRegenerated: true };
}

function durationRejected(revision: number, reason: string): CanonicalSessionDurationChangeResult { return { status: "rejected", reason, priorRevision: revision, newRevision: revision, historyPreserved: true, futureSessionsRegenerated: false }; }
function macrocycleGoalForCarrier(goal: string): CanonicalGeneratedPlanInput["macrocycleGoal"] { return goal === "build_muscle_and_strength" ? "build_muscle_and_strength" : goal === "build_strength" || goal === "powerlifting_meet" ? "build_strength" : goal === "athletic_performance" ? "athletic_performance" : goal === "get_leaner" ? "get_leaner" : "build_muscle"; }

export function loadCanonicalActivePlan(): CanonicalActivePlanApplicationResult {
  const reconciliation = reconcileCanonicalActivePlanReferences();
  if (!reconciliation.carrier) return { status: "invalid", reason: reconciliation.reason ?? reconciliation.status };
  return { status: "ok", model: projectCanonicalActivePlan(reconciliation.carrier) };
}

/** Explicit hydration boundary for callers that need reconciliation outcome semantics. */
export function hydrateCanonicalActivePlan(): Readonly<{ status: "ready" | "ready_after_reconciliation"; model: CanonicalActivePlanReadModel }> | Readonly<{ status: "reconciliation_retry_required" | "recorded_history_missing" | "recorded_history_corrupt" | "immutable_linkage_conflict"; reason: string }> {
  const reconciliation = reconcileCanonicalActivePlanReferences();
  if (!reconciliation.carrier) {
    const status: "reconciliation_retry_required" | "recorded_history_missing" | "recorded_history_corrupt" | "immutable_linkage_conflict" = reconciliation.status === "retry_required" ? "reconciliation_retry_required" : reconciliation.status === "recorded_history_missing" || reconciliation.status === "recorded_history_corrupt" || reconciliation.status === "immutable_linkage_conflict" ? reconciliation.status : "recorded_history_corrupt";
    return { status, reason: reconciliation.reason ?? status };
  }
  return { status: reconciliation.status === "ready_after_reconciliation" ? "ready_after_reconciliation" : "ready", model: projectCanonicalActivePlan(reconciliation.carrier) };
}

export function projectCanonicalActivePlan(carrier: CanonicalActivePlanCarrier): CanonicalActivePlanReadModel {
  const plannedSessions = carrier.plannedSessions.slice().sort((a, b) => a.planSessionIndex - b.planSessionIndex).map((session) => ({ id: session.id, microcycleId: session.microcycleId, role: session.role, planSessionIndex: session.planSessionIndex, status: session.status, constructionVersion: session.constructionVersion, revision: session.revision, snapshot: session.prescriptionSnapshot }));
  const next = plannedSessions.find((session) => session.status === "planned");
  const completionEvidenceSessionIds = new Set(
    canonicalProgressEvidenceRepository
      .list(carrier.planId)
      .filter((evidence) => evidence.kind === "completion")
      .map((evidence) => evidence.sessionId),
  );
  const recorded = (carrier.recordedSessionReferences ?? []).slice().sort((a, b) => a.sessionId.localeCompare(b.sessionId)).flatMap((reference) => { const aggregate = canonicalRecordedSessionLedger.get(reference.sessionId); if (aggregate.status !== "found") return []; const summary = aggregate.session.status === "completed" || aggregate.session.status === "historical" ? deriveCanonicalCompletionSummary(aggregate.session, aggregate.events) : undefined; const effective = effectiveCanonicalPerformedWork(aggregate.events); const completionEvent = aggregate.events.find((event) => event.type === "completed"); const projection: CanonicalRecordedSessionProjection = { recordedSessionId: aggregate.session.recordedSessionId, role: aggregate.session.role, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId, microcycleId: aggregate.session.microcycleId, status: aggregate.session.status, prescribedSlots: summary?.prescribedSlots ?? (Array.isArray((aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots) ? ((aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots as unknown[]).length : 0), performedSets: summary?.performedSets ?? effective.length, performedReps: summary?.performedReps ?? effective.reduce((sum, event) => sum + Number(event.payload.reps ?? 0), 0), performedLoad: summary?.performedLoad ?? effective.reduce((sum, event) => sum + Number(event.payload.load ?? 0), 0), completedSlots: summary?.completedSlots.length ?? new Set(effective.filter((event) => event.payload.completion === "complete").map((event) => String(event.payload.slotId))).size, partialSlots: summary?.partialSlots.length ?? new Set(effective.filter((event) => event.payload.completion === "partial").map((event) => String(event.payload.slotId))).size, missedSlots: summary?.skippedSlots.length ?? 0, substitutions: summary?.substitutions ?? [...new Set(effective.flatMap((event) => event.payload.substitutionId ? [String(event.payload.substitutionId)] : []))].sort(), ...(aggregate.session.startedAt ? { startedAt: aggregate.session.startedAt } : {}), ...(completionEvent ? { completedAt: completionEvent.occurredAt } : {}), ...(summary ? { completionSummaryId: summary.summaryId } : {}), progressEvidence: summary && !completionEvidenceSessionIds.has(aggregate.session.recordedSessionId) ? "pending" : "complete", restorationIdentity: `canonical-recorded-session:${aggregate.session.recordedSessionId}` }; return [projection]; });
  const activeRecordedSession = recorded.find((session) => session.status === "started" || session.status === "paused") ?? null;
  const historicalRecordedSessions = recorded.filter((session) => session.status === "completed" || session.status === "historical");
  const latestDecision = canonicalProgressDecisionRepository.list(carrier.planId)
    .filter((decision) => Boolean(decision.phaseOne))
    .sort((left, right) => (left.phaseOne!.decidedAt.localeCompare(right.phaseOne!.decidedAt) || left.decisionId.localeCompare(right.decisionId)))
    .at(-1);
  const application = latestDecision?.phaseOneApplication;
  const model: CanonicalActivePlanReadModel = { schemaVersion: "canonical_active_plan_read_model_v1", planId: carrier.planId, revision: carrier.revision, equipment: carrier.constraints.equipment, macrocycle: { goal: carrier.macrocycle.output.goal, targetDate: carrier.macrocycle.output.targetDate, rolling: carrier.macrocycle.output.rolling }, mesocycle: { id: carrier.mesocycle.id, definitionId: carrier.mesocycle.output.id, position: carrier.mesocycle.position, purpose: carrier.mesocycle.output.adaptation }, microcycle: { id: carrier.microcycle.id, sequenceNumber: carrier.microcycle.output.sequenceNumber, trainingDays: carrier.microcycle.output.trainingDays, sessionRoles: carrier.microcycle.output.sessionRoles, availableSessionMinutes: normalizeCanonicalSessionDuration(carrier.constraints.availableSessionMinutes) }, ...(carrier.conditioning ? { conditioning: carrier.conditioning } : {}), plannedSessions, activeRecordedSession, historicalRecordedSessions, nextSession: next ? { id: next.id, role: next.role } : null, progress: { evidenceVersion: carrier.progress.evidenceVersion, revision: carrier.progress.revision, ...(latestDecision?.phaseOne ? { latestDecision: { decisionId: latestDecision.decisionId, decisionType: latestDecision.phaseOne.decisionType, explanation: application?.schemaVersion === "canonical_coaching_application_receipt_v2" ? application.explanation : latestDecision.explanation, reasonCodes: application?.schemaVersion === "canonical_coaching_application_receipt_v2" ? [...latestDecision.phaseOne.reasonCodes, application.reasonCode] : latestDecision.phaseOne.reasonCodes, sourceRecordedSessionId: latestDecision.phaseOne.sourceRecordedSessionId, result: application?.schemaVersion === "canonical_coaching_application_receipt_v2" ? application.actualResult : latestDecision.phaseOne.result, ...(application ? { applicationStatus: application.status, resultingFutureSessionIds: application.resultingFutureSessionIds, ...(application.schemaVersion === "canonical_coaching_application_receipt_v2" && application.boundaryState ? { boundaryState: application.boundaryState } : {}) } : {}) } } : {}) } };
  if (containsLegacyFields(model)) throw new Error("legacy_fields_in_canonical_read_model");
  return model;
}

function containsLegacyFields(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Object.keys(value as object).some((key) => ["blocks", "activeBlockId", "blockType", "currentBlock", "trainingYear", "annualWeek"].includes(key))) return true;
  return Object.values(value as Record<string, unknown>).some(containsLegacyFields);
}

export function loadPlannedSession(id: string): CanonicalPlannedSessionSnapshot | null {
  const result = canonicalActivePlanV2Repository.get();
  if (result.status !== "saved") return null;
  return result.carrier.plannedSessions.find((session) => session.id === id && session.status === "planned") ?? null;
}
