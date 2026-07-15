import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";

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
export function completeCanonicalSession(command: CanonicalRecordedLifecycleCommand): CanonicalRecordedLifecycleResult { return updateRecordedStatus(command, "completed", "completed"); }

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
