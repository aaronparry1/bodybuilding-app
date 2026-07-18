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

export type CanonicalActivePlanCreateCommand = Readonly<{
  planId: string; createdAt: string; updatedAt: string; goal: ProgrammeGoal; macrocycleGoal: CanonicalGeneratedPlanInput["macrocycleGoal"]; experienceLevel: ExperienceLevel; daysPerWeek: CanonicalTrainingDaysPerWeek; preferredSplit: CanonicalGeneratedPlanInput["preferredSplit"]; equipment: readonly Equipment[]; units: UnitSystem; targetDate?: string; exercises: readonly Exercise[]; limitations?: readonly string[]; history?: readonly WorkoutHistorySummary[]; establishedLoads?: Readonly<Record<string, number>>; loadEvidence?: Readonly<Record<string, CanonicalLoadEvidence>>;
}>;

export type CanonicalRecordedSessionProjection = Readonly<{ recordedSessionId: string; role: string; macrocycleId: string; mesocycleId: string; microcycleId: string; status: string; prescribedSlots: number; performedSets: number; performedReps: number; performedLoad: number; completedSlots: number; partialSlots: number; missedSlots: number; substitutions: readonly string[]; startedAt?: string; completedAt?: string; completionSummaryId?: string; progressEvidence: "pending" | "complete"; restorationIdentity: string }>;
export type CanonicalActivePlanReadModel = Readonly<{ schemaVersion: "canonical_active_plan_read_model_v1"; planId: string; revision: number; macrocycle: Readonly<{ goal: string; targetDate?: string; rolling: boolean }>; mesocycle: Readonly<{ id: string; position: number; purpose: string }>; microcycle: Readonly<{ id: string; sequenceNumber: number; trainingDays: number; sessionRoles: readonly string[] }>; plannedSessions: readonly Readonly<{ id: string; microcycleId: string; role: string; planSessionIndex: number; status: string; constructionVersion: string; revision: number; snapshot: Readonly<Record<string, unknown>> }>[]; activeRecordedSession?: CanonicalRecordedSessionProjection | null; historicalRecordedSessions?: readonly CanonicalRecordedSessionProjection[]; nextSession: Readonly<{ id: string; role: string }> | null; progress: Readonly<{ evidenceVersion: string; revision: number }> }>;

export type CanonicalActivePlanApplicationResult = Readonly<{ status: "ok"; model: CanonicalActivePlanReadModel }> | Readonly<{ status: "invalid"; reason: string }>;

export function createCanonicalActivePlan(command: CanonicalActivePlanCreateCommand): CanonicalActivePlanApplicationResult {
  const result = constructCanonicalActivePlanFromCanonicalInputs(command);
  if (result.status !== "constructed") return { status: "invalid", reason: result.reason };
  const saved = canonicalActivePlanV2Repository.saveAtomically(result.carrier);
  if (saved.status !== "saved") return { status: "invalid", reason: saved.status === "conflict" ? saved.reason : saved.status === "invalid" ? saved.reason : "canonical_plan_save_failed" };
  return { status: "ok", model: projectCanonicalActivePlan(saved.carrier) };
}

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
  const recorded = (carrier.recordedSessionReferences ?? []).slice().sort((a, b) => a.sessionId.localeCompare(b.sessionId)).flatMap((reference) => { const aggregate = canonicalRecordedSessionLedger.get(reference.sessionId); if (aggregate.status !== "found") return []; const summary = aggregate.session.status === "completed" || aggregate.session.status === "historical" ? deriveCanonicalCompletionSummary(aggregate.session, aggregate.events) : undefined; const effective = effectiveCanonicalPerformedWork(aggregate.events); const completionEvent = aggregate.events.find((event) => event.type === "completed"); const projection: CanonicalRecordedSessionProjection = { recordedSessionId: aggregate.session.recordedSessionId, role: aggregate.session.role, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId, microcycleId: aggregate.session.microcycleId, status: aggregate.session.status, prescribedSlots: summary?.prescribedSlots ?? (Array.isArray((aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots) ? ((aggregate.session.prescriptionSnapshot as Record<string, unknown>).slots as unknown[]).length : 0), performedSets: summary?.performedSets ?? effective.length, performedReps: summary?.performedReps ?? effective.reduce((sum, event) => sum + Number(event.payload.reps ?? 0), 0), performedLoad: summary?.performedLoad ?? effective.reduce((sum, event) => sum + Number(event.payload.load ?? 0), 0), completedSlots: summary?.completedSlots.length ?? new Set(effective.filter((event) => event.payload.completion === "complete").map((event) => String(event.payload.slotId))).size, partialSlots: summary?.partialSlots.length ?? new Set(effective.filter((event) => event.payload.completion === "partial").map((event) => String(event.payload.slotId))).size, missedSlots: summary?.skippedSlots.length ?? 0, substitutions: summary?.substitutions ?? [...new Set(effective.flatMap((event) => event.payload.substitutionId ? [String(event.payload.substitutionId)] : []))].sort(), ...(aggregate.session.startedAt ? { startedAt: aggregate.session.startedAt } : {}), ...(completionEvent ? { completedAt: completionEvent.occurredAt } : {}), ...(summary ? { completionSummaryId: summary.summaryId } : {}), progressEvidence: summary && !canonicalProgressEvidenceExists(carrier.planId, aggregate.session.recordedSessionId) ? "pending" : "complete", restorationIdentity: `canonical-recorded-session:${aggregate.session.recordedSessionId}` }; return [projection]; });
  const activeRecordedSession = recorded.find((session) => session.status === "started" || session.status === "paused") ?? null;
  const historicalRecordedSessions = recorded.filter((session) => session.status === "completed" || session.status === "historical");
  const model: CanonicalActivePlanReadModel = { schemaVersion: "canonical_active_plan_read_model_v1", planId: carrier.planId, revision: carrier.revision, macrocycle: { goal: carrier.macrocycle.output.goal, targetDate: carrier.macrocycle.output.targetDate, rolling: carrier.macrocycle.output.rolling }, mesocycle: { id: carrier.mesocycle.id, position: carrier.mesocycle.position, purpose: carrier.mesocycle.output.adaptation }, microcycle: { id: carrier.microcycle.id, sequenceNumber: carrier.microcycle.output.sequenceNumber, trainingDays: carrier.microcycle.output.trainingDays, sessionRoles: carrier.microcycle.output.sessionRoles }, plannedSessions, activeRecordedSession, historicalRecordedSessions, nextSession: next ? { id: next.id, role: next.role } : null, progress: { evidenceVersion: carrier.progress.evidenceVersion, revision: carrier.progress.revision } };
  if (containsLegacyFields(model)) throw new Error("legacy_fields_in_canonical_read_model");
  return model;
}

function canonicalProgressEvidenceExists(planId: string, sessionId: string): boolean {
  return canonicalProgressEvidenceRepository.list(planId).some((evidence) => evidence.sessionId === sessionId && evidence.kind === "completion");
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
