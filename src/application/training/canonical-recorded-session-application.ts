import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";
import { reconcileCanonicalRecordedReference } from "@/application/training/canonical-recorded-reference-reconciliation";
import { pauseCanonicalRestTimer, resumeCanonicalRestTimer, startCanonicalRestTimer } from "@/application/training/canonical-rest-timer";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import { effectiveCanonicalPerformedWork } from "@/domain/training/canonical-performed-work";
import { comparableExposureObservationFacts } from "@/domain/training/canonical-comparable-exposure-policy";
import { orchestrateCanonicalPostWorkoutAdaptation } from "@/application/training/canonical-post-workout-orchestrator";
import { reconcileCanonicalCompletedSessionEvidence } from "@/application/training/canonical-completion-evidence-reconciliation";
import { canonicalCoachingAttemptRepository } from "@/data/local/canonical-coaching-attempt-repository";
import { canonicalCoachingOperationId } from "@/domain/training/canonical-coaching-identity";
import {
  discardCanonicalWorkoutAttempt,
  reconcileCanonicalWorkoutDiscard,
} from "@/application/training/canonical-workout-discard-transaction";

export type CanonicalStartSessionCommand = Readonly<{ planId: string; expectedPlanRevision: number; plannedSessionId: string; expectedPrescriptionHash: string; operationId: string; startedAt: string; provenance: string }>;
export type CanonicalStartSessionResult = Readonly<{ status: "started" | "already_started" | "rejected" | "retryable"; reason: string; recordedSessionId?: string; planRevision?: number }>;

export function prescriptionHash(snapshot: Readonly<Record<string, unknown>>): string { return JSON.stringify(snapshot); }

export function startCanonicalSession(command: CanonicalStartSessionCommand): CanonicalStartSessionResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") return { status: "rejected", reason: "canonical_plan_unavailable" };
  const carrier = loaded.carrier;
  if (carrier.planId !== command.planId || carrier.revision !== command.expectedPlanRevision) return { status: "rejected", reason: "stale_plan_revision" };
  const planned = carrier.plannedSessions.find((session) => session.id === command.plannedSessionId && session.status === "planned");
  if (!planned) {
    const existing = carrier.recordedSessionReferences?.find((reference) => reference.recordReference === `canonical-recorded-session:${command.plannedSessionId}`);
    return existing ? { status: "already_started", reason: "recorded_reference_exists", recordedSessionId: existing.sessionId, planRevision: carrier.revision } : { status: "rejected", reason: "planned_session_not_available" };
  }
  const hash = prescriptionHash(planned.prescriptionSnapshot);
  if (hash !== command.expectedPrescriptionHash) return { status: "rejected", reason: "prescription_identity_mismatch" };
  const recordedSessionId = `${carrier.planId}:recorded:${planned.id}`;
  const created = canonicalRecordedSessionLedger.create({ schemaVersion: "canonical_recorded_session_v1", recordedSessionId, plannedSessionId: planned.id, planId: carrier.planId, startRevision: carrier.revision, macrocycleId: carrier.macrocycle.id, mesocycleId: carrier.mesocycle.id, microcycleId: carrier.microcycle.id, role: planned.role, prescriptionSnapshot: planned.prescriptionSnapshot, prescriptionHash: hash, provenance: { source: command.provenance, constructionVersion: planned.constructionVersion }, athleteId: carrier.constructionInputs?.athleteId ?? "local-athlete", version: 0, status: "pending", createdAt: command.startedAt }, command.operationId);
  if (!["saved", "duplicate"].includes(created.status)) return { status: "rejected", reason: "recorded_session_creation_failed" };
  const nextRevision = carrier.revision + 1;
  const next = { ...carrier, revision: nextRevision, updatedAt: command.startedAt, plannedSessions: carrier.plannedSessions.filter((session) => session.id !== planned.id), recordedSessionReferences: [...(carrier.recordedSessionReferences ?? []), { sessionId: recordedSessionId, planId: carrier.planId, macrocycleId: carrier.macrocycle.id, mesocycleId: carrier.mesocycle.id, microcycleId: carrier.microcycle.id, revision: nextRevision, status: "started" as const, recordReference: `canonical-recorded-session:${planned.id}` }], progress: { ...carrier.progress, revision: nextRevision } };
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, carrier.revision);
  if (saved.status !== "saved") return { status: "retryable", reason: "carrier_revision_conflict_after_pending", recordedSessionId };
  const activated = canonicalRecordedSessionLedger.append(recordedSessionId, { eventId: `${recordedSessionId}:started:${command.operationId}`, aggregateId: recordedSessionId, expectedVersion: 0, type: "started", occurredAt: command.startedAt, operationId: command.operationId, payload: {} });
  if (activated.status !== "saved") { canonicalActivePlanState.hydrate(); return { status: "retryable", reason: "activation_receipt_pending", recordedSessionId, planRevision: nextRevision }; }
  canonicalActivePlanState.hydrate();
  return { status: "started", reason: "canonical_session_started", recordedSessionId, planRevision: nextRevision };
}

export type CanonicalRecordedLifecycleCommand = Readonly<{ planId: string; expectedPlanRevision: number; recordedSessionId: string; expectedLedgerVersion: number; operationId: string; occurredAt: string; provenance: string }>;
export type CanonicalRecordedLifecycleResult = Readonly<{ status: "applied" | "idempotent" | "rejected" | "retryable"; reason: string; planRevision?: number; ledgerVersion?: number; nextInstruction?: string }>;

export function pauseCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult {
  const result = updateRecordedStatus(command, "paused", "pause");
  if (result.status === "applied" || result.status === "idempotent") pauseCanonicalRestTimer(command.recordedSessionId);
  return result;
}
export function resumeCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult {
  const result = updateRecordedStatus(command, "started", "resumed");
  if (result.status === "applied" || result.status === "idempotent") resumeCanonicalRestTimer(command.recordedSessionId);
  return result;
}
export function completeCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult {
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_not_found" };
  if (aggregate.session.status === "completed") {
    const reconciled = reconcileCanonicalCompletedSessionEvidence({
      planId: command.planId,
      recordedSessionId: command.recordedSessionId,
    });
    const priorEvidence = reconciled.completionEvidenceId
      ? canonicalProgressEvidenceRepository.get(reconciled.completionEvidenceId)
      : { status: "not_found" as const };
    const adaptation = priorEvidence.status === "found" && isPlannedRecordedSession(command.planId, command.recordedSessionId)
      ? orchestrateCanonicalPostWorkoutAdaptation({ planId: command.planId, recordedSessionId: command.recordedSessionId, completionEvidenceId: priorEvidence.evidence.evidenceId, occurredAt: priorEvidence.evidence.observedAt })
      : null;
    return {
      status: "idempotent",
      reason: reconciled.status === "retryable" || adaptation?.status === "retryable" ? "completion_applied_adaptation_pending" : "completion_already_applied",
      ledgerVersion: aggregate.session.version,
      ...(adaptation?.explanation ? { nextInstruction: adaptation.explanation } : {}),
    };
  }
  if (aggregate.session.version !== command.expectedLedgerVersion) return { status: "rejected", reason: "stale_ledger_version" };
  if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected", reason: "completion_not_allowed_in_current_status" };
  const performanceEvents = effectiveCanonicalPerformedWork(aggregate.events);
  if (!performanceEvents.length) return { status: "rejected", reason: "completion_requires_performed_work" };
  const summary = deriveCanonicalCompletionSummary(aggregate.session, aggregate.events);
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, { eventId: `${command.recordedSessionId}:completed:${command.operationId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: "completed", occurredAt: command.occurredAt, operationId: command.operationId, payload: { summary } });
  if (appended.status !== "saved") return { status: "rejected", reason: appended.reason ?? "completion_conflict" };
  const completionEvidenceId = `${command.recordedSessionId}:completion-evidence:${appended.session!.version}`;
  const coachingOperationId = canonicalCoachingOperationId(command.planId, command.recordedSessionId, completionEvidenceId);
  canonicalCoachingAttemptRepository.save({
    schemaVersion: "canonical_coaching_attempt_v1",
    operationId: coachingOperationId,
    planId: command.planId,
    recordedSessionId: command.recordedSessionId,
    completionEvidenceId,
    status: "pending",
    reason: "durable_completion_recorded",
    planRevisionAtCompletion: command.expectedPlanRevision,
    completedLedgerVersion: appended.session!.version,
    prescriptionHash: aggregate.session.prescriptionHash,
    evidenceState: "pending",
    decisionState: "pending",
    applicationState: "pending",
    retryIdentity: coachingOperationId,
    updatedAt: command.occurredAt,
  });
  const evidence = reconcileCanonicalCompletedSessionEvidence({
    planId: command.planId,
    recordedSessionId: command.recordedSessionId,
    planRevision: command.expectedPlanRevision,
  });
  canonicalRestTimerRepository.clear(command.recordedSessionId);
  if (evidence.status !== "reconciled" && evidence.status !== "already_complete") {
    canonicalActivePlanState.hydrate();
    return { status: "retryable", reason: "completed_with_evidence_pending", ledgerVersion: appended.session!.version };
  }
  reconcileCompletedRecordedReference(command.planId, command.recordedSessionId);
  const adaptation = isPlannedRecordedSession(command.planId, command.recordedSessionId)
    ? orchestrateCanonicalPostWorkoutAdaptation({ planId: command.planId, recordedSessionId: command.recordedSessionId, completionEvidenceId, occurredAt: command.occurredAt })
    : null;
  canonicalActivePlanState.hydrate();
  return {
    status: "applied",
    reason: adaptation?.status === "retryable" || adaptation?.status === "rejected" ? "session_completed_adaptation_pending" : "session_completed",
    ledgerVersion: appended.session!.version,
    ...(adaptation?.newRevision === undefined ? {} : { planRevision: adaptation.newRevision }),
    ...(adaptation?.explanation ? { nextInstruction: adaptation.explanation } : {}),
  };
}

export type CanonicalPerformedWorkCommand = Readonly<CanonicalRecordedLifecycleCommand & { slotId: string; exerciseId: string; setId: string; setOrder: number; reps: number; load: number; unit: string; effort?: number; substitutionId?: string; completion: "complete" | "partial" | "missed" }>;
export function recordCanonicalPerformedWork(command: CanonicalPerformedWorkCommand): CanonicalRecordedLifecycleResult {
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_not_found" };
  if (aggregate.session.version !== command.expectedLedgerVersion) return { status: "rejected", reason: "stale_ledger_version" };
  if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected", reason: "performance_not_allowed_in_current_status" };
  if (!Number.isInteger(command.reps) || command.reps < 0 || !Number.isFinite(command.load) || command.load < 0 || !Number.isInteger(command.setOrder) || command.setOrder < 1) return { status: "rejected", reason: "invalid_performed_work" };
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const slot = slots.find((candidate) => candidate.id === command.slotId && candidate.exerciseId === command.exerciseId);
  if (!slot) return { status: "rejected", reason: "performed_slot_not_in_prescription" };
  const existingSet = effectiveCanonicalPerformedWork(aggregate.events).find((event) => String(event.payload.setId) === command.setId);
  if (existingSet) {
    const equivalent = Number(existingSet.payload.reps) === command.reps
      && Number(existingSet.payload.load) === command.load
      && String(existingSet.payload.unit) === command.unit
      && String(existingSet.payload.completion) === command.completion;
    return { status: equivalent ? "idempotent" : "rejected", reason: equivalent ? "performed_work_already_recorded" : "performed_set_conflict", ledgerVersion: aggregate.session.version };
  }
  const next = deriveCanonicalNextSetInstruction(aggregate.session.prescriptionSnapshot, command.slotId, command.setOrder, command.reps, command.load);
  const event = { eventId: `${command.recordedSessionId}:performance:${command.setId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: "performance" as const, occurredAt: command.occurredAt, operationId: command.operationId, payload: { setId: command.setId, slotId: command.slotId, exerciseId: command.exerciseId, setOrder: command.setOrder, reps: command.reps, load: command.load, unit: command.unit, effort: command.effort, substitutionId: command.substitutionId, completion: command.completion, provenance: command.provenance, nextInstruction: next.text, nextRestSeconds: next.restSeconds } };
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, event);
  if (appended.status === "stale") return { status: "rejected", reason: "stale_ledger_version" };
  if (appended.status !== "saved") return { status: "rejected", reason: appended.reason ?? "performed_work_conflict" };
  const evidence = canonicalProgressEvidenceRepository.record({ schemaVersion: "canonical_progress_evidence_v1", evidenceId: `${command.recordedSessionId}:evidence:${command.setId}`, planId: command.planId, planRevision: command.expectedPlanRevision, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId as never, microcycleId: aggregate.session.microcycleId, sessionId: command.recordedSessionId, slotId: command.slotId, athleteId: aggregate.session.athleteId, observedAt: command.occurredAt, source: `ledger:${command.recordedSessionId}:v${appended.session!.version}`, kind: "performance", observations: canonicalPerformedEvidenceObservations(snapshot, slot, aggregate.session.mesocycleId, aggregate.session.prescriptionHash, command), evidenceVersion: "progress_v1" });
  canonicalActivePlanState.hydrate();
  if ((evidence.status === "saved" || evidence.status === "duplicate") && next.restSeconds > 0) {
    startCanonicalRestTimer({ workoutId: aggregate.session.recordedSessionId, setId: command.setId, durationSeconds: next.restSeconds });
  }
  return { status: evidence.status === "saved" || evidence.status === "duplicate" ? "applied" : "retryable", reason: evidence.status === "saved" || evidence.status === "duplicate" ? "performed_work_recorded" : "progress_evidence_pending", ledgerVersion: appended.session!.version, nextInstruction: next.text };
}

export type CanonicalEditPerformedWorkCommand = Readonly<CanonicalPerformedWorkCommand>;
export function editCanonicalPerformedWork(command: CanonicalEditPerformedWorkCommand): CanonicalRecordedLifecycleResult {
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_not_found" };
  if (aggregate.session.version !== command.expectedLedgerVersion) return { status: "rejected", reason: "stale_ledger_version" };
  if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected", reason: "performed_work_edit_not_allowed" };
  if (!Number.isInteger(command.reps) || command.reps < 0 || !Number.isFinite(command.load) || command.load < 0 || !Number.isInteger(command.setOrder) || command.setOrder < 1 || (command.effort !== undefined && (!Number.isFinite(command.effort) || command.effort < 0 || command.effort > 10))) return { status: "rejected", reason: "invalid_performed_work" };
  const original = aggregate.events.find((event) => event.type === "performance" && String(event.payload.setId) === command.setId);
  if (!original) return { status: "rejected", reason: "performed_set_not_found" };
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const slot = slots.find((candidate) => String(candidate.id) === command.slotId && String(candidate.exerciseId) === command.exerciseId);
  if (!slot) return { status: "rejected", reason: "performed_slot_not_in_prescription" };
  if (String(original.payload.slotId) !== command.slotId || String(original.payload.exerciseId) !== command.exerciseId || Number(original.payload.setOrder) !== command.setOrder) return { status: "rejected", reason: "performed_set_identity_mismatch" };
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, { eventId: `${command.recordedSessionId}:repair:${command.operationId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: "repair", occurredAt: command.occurredAt, operationId: command.operationId, payload: { ...command, editedSetId: command.setId, replacesEventId: original.eventId } });
  if (appended.status !== "saved") return { status: "rejected", reason: "performed_work_edit_conflict" };
  const evidence = canonicalProgressEvidenceRepository.replace({ schemaVersion: "canonical_progress_evidence_v1", evidenceId: `${command.recordedSessionId}:evidence:${command.setId}`, planId: command.planId, planRevision: command.expectedPlanRevision, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId as never, microcycleId: aggregate.session.microcycleId, sessionId: command.recordedSessionId, slotId: command.slotId, athleteId: aggregate.session.athleteId, observedAt: command.occurredAt, source: `ledger:${command.recordedSessionId}:v${appended.session!.version}:repair`, kind: "performance", observations: canonicalPerformedEvidenceObservations(snapshot, slot, aggregate.session.mesocycleId, aggregate.session.prescriptionHash, command), evidenceVersion: "progress_v1" });
  canonicalActivePlanState.hydrate();
  return { status: evidence.status === "saved" ? "applied" : "retryable", reason: evidence.status === "saved" ? "performed_work_edited" : "performed_work_edited_with_evidence_pending", ledgerVersion: appended.session!.version, nextInstruction: deriveCanonicalNextSetInstruction(aggregate.session.prescriptionSnapshot, command.slotId, command.setOrder, command.reps, command.load).text };
}

export type CanonicalDiscardSessionCommand = CanonicalRecordedLifecycleCommand;

export type CanonicalLatestDiscardSessionCommand = Readonly<{
  planId: string;
  recordedSessionId: string;
  operationId: string;
  occurredAt: string;
  provenance: string;
}>;

/**
 * UI-facing discard boundary. Expected revisions are resolved immediately
 * before the command so an open confirmation sheet cannot submit a stale
 * render-time revision.
 */
export function discardLatestCanonicalSessionAttempt(command: CanonicalLatestDiscardSessionCommand): CanonicalRecordedLifecycleResult {
  const reconciled = reconcileCanonicalWorkoutDiscard(command.recordedSessionId);
  if (reconciled) return reconciled;
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== command.planId) return { status: "rejected", reason: "canonical_plan_unavailable" };
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  return discardCanonicalSessionAttempt({
    ...command,
    expectedPlanRevision: loaded.carrier.revision,
    expectedLedgerVersion: aggregate.status === "found" ? aggregate.session.version : 0,
  });
}

export function discardCanonicalSessionAttempt(command: CanonicalDiscardSessionCommand): CanonicalRecordedLifecycleResult {
  const result = discardCanonicalWorkoutAttempt(command);
  if (
    result.status === "applied"
    || result.status === "idempotent"
    || result.reason === "discard_cleanup_pending"
  ) {
    canonicalActivePlanState.hydrate();
  }
  return result;
}

function isPlannedRecordedSession(planId: string, recordedSessionId: string): boolean {
  const loaded = canonicalActivePlanV2Repository.get();
  return loaded.status === "saved"
    && loaded.carrier.planId === planId
    && Boolean(loaded.carrier.recordedSessionReferences?.some((reference) => reference.sessionId === recordedSessionId && reference.recordReference.startsWith("canonical-recorded-session:")));
}

function reconcileCompletedRecordedReference(planId: string, recordedSessionId: string): void {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== planId) return;
  const reference = loaded.carrier.recordedSessionReferences?.find((candidate) => candidate.sessionId === recordedSessionId);
  if (!reference || reference.status === "completed") return;
  reconcileCanonicalRecordedReference({
    planId,
    expectedPlanRevision: loaded.carrier.revision,
    recordedSessionId,
    operationId: `completion:${recordedSessionId}:reference`,
  });
}

export function deriveCanonicalNextSetInstruction(snapshot: Readonly<Record<string, unknown>>, slotId: string, setOrder: number, reps: number, load: number): Readonly<{ text: string; restSeconds: number }> {
  const slots = Array.isArray(snapshot.slots) ? (snapshot.slots as Array<Record<string, unknown>>).slice().sort((left, right) => Number(left.index) - Number(right.index)) : [];
  const slot = slots.find((candidate) => String(candidate.id) === slotId);
  const rest = Number(((slot?.rest as Record<string, unknown> | undefined)?.seconds ?? 90));
  const settings = slot?.settings as Record<string, unknown> | undefined;
  const required = Number(settings?.requiredSets ?? 1);
  const structure = slot?.methodStructure as Record<string, unknown> | undefined;
  if (structure?.kind === "linked_rounds") {
    const position = Number(structure.position);
    if (position === 1) {
      return { text: `Move directly to ${String(structure.pairedExerciseName ?? "the paired exercise")} · round ${setOrder}`, restSeconds: Number(structure.intraMethodRestSeconds ?? 0) };
    }
    if (setOrder < required) return { text: `Rest ${Number(structure.interRoundRestSeconds ?? 60)} sec, then start paired round ${setOrder + 1}`, restSeconds: Number(structure.interRoundRestSeconds ?? 60) };
  }
  if (structure?.kind === "rest_pause" && setOrder < required) {
    return { text: `Rest ${Number(structure.interRoundRestSeconds ?? rest)} sec, then repeat the ${Number(structure.segmentsPerRound ?? reps)}-rep rest-pause round`, restSeconds: Number(structure.interRoundRestSeconds ?? rest) };
  }
  if (setOrder < required) return { text: `Rest ${rest} sec, then repeat ${load} kg × ${reps}`, restSeconds: rest };
  const currentIndex = slots.findIndex((candidate) => String(candidate.id) === slotId);
  const next = slots.slice(currentIndex + 1).find((candidate) => Number(((candidate.settings as Record<string, unknown> | undefined)?.requiredSets ?? 1)) > 0);
  return next ? { text: `Rest ${rest} sec, then move to the next exercise`, restSeconds: rest } : { text: "All prescribed working sets are complete. Finish when ready.", restSeconds: 0 };
}

function canonicalSlotLoadingMode(slot: Record<string, unknown> | undefined): string {
  if (!slot) return "unavailable";
  const prescription = slot.loadPrescription;
  const prescribedMode = prescription && typeof prescription === "object"
    ? (prescription as Record<string, unknown>).loadingMode
    : undefined;
  return String(prescribedMode ?? slot.loadingMode ?? "unavailable");
}

function canonicalSlotMethodFacts(slot: Record<string, unknown> | undefined): Readonly<{
  method: string;
  methodExecutionKind: string;
  methodPolicyId: string;
}> {
  const structure = slot?.methodStructure as Record<string, unknown> | undefined;
  return {
    method: String(slot?.method ?? "straight_sets"),
    methodExecutionKind: String(structure?.kind ?? "standalone"),
    methodPolicyId: String(structure?.policyId ?? "canonical_training_method_policy_v1"),
  };
}

function canonicalPerformedEvidenceObservations(
  snapshot: Record<string, unknown>,
  slot: Record<string, unknown> | undefined,
  mesocycleId: string,
  immutablePrescriptionHash: string,
  command: CanonicalPerformedWorkCommand,
): Readonly<Record<string, string | number | boolean | null>> {
  const settings = slot?.settings as Record<string, unknown> | undefined;
  const loadPrescription = slot?.loadPrescription as Record<string, unknown> | undefined;
  const progression = slot?.progression as Record<string, unknown> | undefined;
  const stopRule = slot?.stopRule as Record<string, unknown> | undefined;
  const exactTargets = Array.isArray(slot?.exactTargets) ? slot?.exactTargets as number[] : [];
  const targetForSet = Number(exactTargets[command.setOrder - 1] ?? slot?.targetReps ?? 0);
  return {
    exerciseId: command.exerciseId,
    slotId: command.slotId,
    prescriptionHash: immutablePrescriptionHash,
    ...(slot ? comparableExposureObservationFacts({ ...snapshot, mesocycleId }, slot) : {}),
    loadingMode: canonicalSlotLoadingMode(slot),
    ...canonicalSlotMethodFacts(slot),
    loadState: String(loadPrescription?.state ?? "unavailable"),
    progressionRule: String(progression?.rule ?? "unknown"),
    prescribedSets: Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0),
    prescribedTargetReps: targetForSet,
    stopThreshold: typeof stopRule?.threshold === "number" ? Number(stopRule.threshold) : null,
    setOrder: command.setOrder,
    reps: command.reps,
    load: command.load,
    unit: command.unit,
    completion: command.completion,
    substitutionId: command.substitutionId ?? null,
    ...(command.effort === undefined ? {} : { effort: command.effort }),
  };
}

function prescribedWorkingSetCount(snapshot: Readonly<Record<string, unknown>>): number {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  return slots.reduce((sum, slot) => {
    const settings = slot.settings as Record<string, unknown> | undefined;
    const count = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? 0);
    return sum + (Number.isInteger(count) && count > 0 ? count : 0);
  }, 0);
}

export function restoreCanonicalRecordedSessionFromLedger(planId: string, recordedSessionId: string) {
  const carrier = canonicalActivePlanV2Repository.get();
  if (carrier.status !== "saved" || carrier.carrier.planId !== planId) return { status: "rejected" as const, reason: "canonical_plan_unavailable" };
  const reference = carrier.carrier.recordedSessionReferences?.find((item) => item.sessionId === recordedSessionId);
  const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
  if (!reference || aggregate.status !== "found") return { status: "rejected" as const, reason: "recorded_session_reference_missing" };
  if (aggregate.session.planId !== planId || aggregate.session.microcycleId !== reference.microcycleId || aggregate.session.prescriptionHash !== prescriptionHash(aggregate.session.prescriptionSnapshot)) return { status: "rejected" as const, reason: "recorded_session_integrity_mismatch" };
  if (reference.status !== aggregate.session.status || reference.revision > carrier.carrier.revision) {
    const repaired = reconcileCanonicalRecordedReference({ planId, expectedPlanRevision: carrier.carrier.revision, recordedSessionId, operationId: `restore:${recordedSessionId}` });
    if (repaired.status === "retry_required") return { status: "retry_required" as const, reason: repaired.reason };
    if (repaired.status === "rejected") return { status: "rejected" as const, reason: repaired.reason };
    const refreshed = canonicalRecordedSessionLedger.get(recordedSessionId);
    if (refreshed.status !== "found") return { status: "rejected" as const, reason: "recorded_session_reference_missing" };
    return { status: "restored" as const, session: refreshed.session, events: refreshed.events, completionSummary: refreshed.session.status === "completed" ? deriveCanonicalCompletionSummary(refreshed.session, refreshed.events) : undefined };
  }
  return { status: "restored" as const, session: aggregate.session, events: aggregate.events, completionSummary: aggregate.session.status === "completed" ? deriveCanonicalCompletionSummary(aggregate.session, aggregate.events) : undefined };
}

function updateRecordedStatus(command: CanonicalRecordedLifecycleCommand, target: "paused" | "started" | "completed", eventType: "pause" | "resumed" | "completed"): CanonicalRecordedLifecycleResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") return { status: "rejected", reason: "canonical_plan_unavailable" };
  if (loaded.carrier.planId !== command.planId || loaded.carrier.revision !== command.expectedPlanRevision) return { status: "rejected", reason: "stale_plan_revision" };
  const reference = loaded.carrier.recordedSessionReferences?.find((item) => item.sessionId === command.recordedSessionId);
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (!reference || aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_linkage_missing" };
  if (aggregate.session.version !== command.expectedLedgerVersion) return { status: "rejected", reason: "stale_ledger_version" };
  if (aggregate.session.status === target) return { status: "idempotent", reason: "lifecycle_already_applied", planRevision: loaded.carrier.revision, ledgerVersion: aggregate.session.version };
  const event = { eventId: `${command.recordedSessionId}:${eventType}:${command.operationId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: eventType === "pause" ? "paused" as const : eventType, occurredAt: command.occurredAt, operationId: command.operationId, payload: { provenance: command.provenance } };
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, event);
  if (appended.status !== "saved") return { status: "rejected", reason: appended.status === "stale" ? "stale_ledger_version" : appended.reason ?? "invalid_lifecycle_transition" };
  const nextRevision = loaded.carrier.revision + 1;
  const next = { ...loaded.carrier, revision: nextRevision, updatedAt: command.occurredAt, recordedSessionReferences: loaded.carrier.recordedSessionReferences!.map((item) => item.sessionId === command.recordedSessionId ? { ...item, status: target, revision: nextRevision } : item), progress: { ...loaded.carrier.progress, revision: nextRevision } };
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, loaded.carrier.revision);
  if (saved.status !== "saved") return { status: "retryable", reason: "carrier_update_pending", ledgerVersion: appended.session.version };
  canonicalActivePlanState.hydrate();
  return { status: "applied", reason: `session_${eventType}`, planRevision: nextRevision, ledgerVersion: appended.session.version };
}
