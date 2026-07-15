import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";

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
export type CanonicalRecordedLifecycleResult = Readonly<{ status: "applied" | "idempotent" | "rejected" | "retryable"; reason: string; planRevision?: number; ledgerVersion?: number }>;

export function pauseCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult { return updateRecordedStatus(command, "paused", "pause"); }
export function resumeCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult { return updateRecordedStatus(command, "started", "resumed"); }
export function completeCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult {
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found") return { status: "rejected", reason: "recorded_session_not_found" };
  if (aggregate.session.version !== command.expectedLedgerVersion) return { status: "rejected", reason: "stale_ledger_version" };
  if (aggregate.session.status === "completed") return { status: "idempotent", reason: "completion_already_applied", ledgerVersion: aggregate.session.version };
  if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected", reason: "completion_not_allowed_in_current_status" };
  const summary = deriveCanonicalCompletionSummary(aggregate.session, aggregate.events);
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, { eventId: `${command.recordedSessionId}:completed:${command.operationId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: "completed", occurredAt: command.occurredAt, operationId: command.operationId, payload: { summary } });
  if (appended.status !== "saved") return { status: "rejected", reason: appended.reason ?? "completion_conflict" };
  const evidence = canonicalProgressEvidenceRepository.record({ schemaVersion: "canonical_progress_evidence_v1", evidenceId: `${command.recordedSessionId}:completion-evidence:${appended.session!.version}`, planId: command.planId, planRevision: command.expectedPlanRevision, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId as never, microcycleId: aggregate.session.microcycleId, sessionId: command.recordedSessionId, athleteId: aggregate.session.athleteId, observedAt: command.occurredAt, source: `ledger:${command.recordedSessionId}:v${appended.session!.version}`, kind: "completion", observations: { completion: summary.completion, performedSets: summary.performedSets, performedReps: summary.performedReps, performedLoad: summary.performedLoad }, evidenceVersion: "progress_v1" });
  canonicalActivePlanState.hydrate();
  return { status: evidence.status === "saved" || evidence.status === "duplicate" ? "applied" : "retryable", reason: evidence.status === "saved" || evidence.status === "duplicate" ? "session_completed" : "completed_with_evidence_pending", ledgerVersion: appended.session!.version };
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
  const event = { eventId: `${command.recordedSessionId}:performance:${command.setId}`, aggregateId: command.recordedSessionId, expectedVersion: command.expectedLedgerVersion, type: "performance" as const, occurredAt: command.occurredAt, operationId: command.operationId, payload: { setId: command.setId, slotId: command.slotId, exerciseId: command.exerciseId, setOrder: command.setOrder, reps: command.reps, load: command.load, unit: command.unit, effort: command.effort, substitutionId: command.substitutionId, completion: command.completion, provenance: command.provenance } };
  const appended = canonicalRecordedSessionLedger.append(command.recordedSessionId, event);
  if (appended.status === "stale") return { status: "rejected", reason: "stale_ledger_version" };
  if (appended.status !== "saved") return { status: "rejected", reason: appended.reason ?? "performed_work_conflict" };
  const evidence = canonicalProgressEvidenceRepository.record({ schemaVersion: "canonical_progress_evidence_v1", evidenceId: `${command.recordedSessionId}:evidence:${command.setId}`, planId: command.planId, planRevision: command.expectedPlanRevision, macrocycleId: aggregate.session.macrocycleId, mesocycleId: aggregate.session.mesocycleId as never, microcycleId: aggregate.session.microcycleId, sessionId: command.recordedSessionId, slotId: command.slotId, athleteId: aggregate.session.athleteId, observedAt: command.occurredAt, source: `ledger:${command.recordedSessionId}:v${appended.session!.version}`, kind: "performance", observations: { reps: command.reps, load: command.load, completion: command.completion, ...(command.effort === undefined ? {} : { effort: command.effort }) }, evidenceVersion: "progress_v1" });
  canonicalActivePlanState.hydrate();
  return { status: evidence.status === "saved" || evidence.status === "duplicate" ? "applied" : "retryable", reason: evidence.status === "saved" || evidence.status === "duplicate" ? "performed_work_recorded" : "progress_evidence_pending", ledgerVersion: appended.session!.version };
}

export function restoreCanonicalRecordedSessionFromLedger(planId: string, recordedSessionId: string) {
  const carrier = canonicalActivePlanV2Repository.get();
  if (carrier.status !== "saved" || carrier.carrier.planId !== planId) return { status: "rejected" as const, reason: "canonical_plan_unavailable" };
  const reference = carrier.carrier.recordedSessionReferences?.find((item) => item.sessionId === recordedSessionId);
  const aggregate = canonicalRecordedSessionLedger.get(recordedSessionId);
  if (!reference || aggregate.status !== "found") return { status: "rejected" as const, reason: "recorded_session_reference_missing" };
  if (aggregate.session.planId !== planId || aggregate.session.microcycleId !== reference.microcycleId || aggregate.session.prescriptionHash !== prescriptionHash(aggregate.session.prescriptionSnapshot)) return { status: "rejected" as const, reason: "recorded_session_integrity_mismatch" };
  if (reference.status !== aggregate.session.status || reference.revision > carrier.carrier.revision) return { status: "rejected" as const, reason: "recorded_session_status_mismatch" };
  return { status: "restored" as const, session: aggregate.session, events: aggregate.events };
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
