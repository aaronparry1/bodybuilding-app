import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { deriveCanonicalCompletionSummary } from "@/domain/training/canonical-completion-summary";

export type CanonicalRecordedReferenceReconciliationCommand = Readonly<{ planId: string; expectedPlanRevision: number; recordedSessionId: string; operationId: string }>;
export type CanonicalRecordedReferenceReconciliationResult = Readonly<{ status: "consistent" | "repaired" | "retry_required" | "rejected"; reason: string; planRevision: number; newRevision?: number; recordedSessionId: string; ledgerVersion?: number; completionSummaryId?: string }>;

export type CanonicalActivePlanReconciliationResult = Readonly<{
  status: "ready" | "ready_after_reconciliation" | "retry_required" | "recorded_history_missing" | "recorded_history_corrupt" | "immutable_linkage_conflict";
  carrier?: import("@/domain/training/canonical-active-plan-carrier").CanonicalActivePlanCarrier;
  repairedSessionIds: readonly string[];
  reason?: string;
}>;

/** Reconciles every referenced recorded aggregate before a read model is built. */
export function reconcileCanonicalActivePlanReferences(): CanonicalActivePlanReconciliationResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") return { status: "recorded_history_missing", repairedSessionIds: [], reason: loaded.status };
  let carrier = loaded.carrier;
  const references = carrier.recordedSessionReferences ?? [];
  const repaired: string[] = [];
  for (const reference of references.slice().sort((a, b) => a.sessionId.localeCompare(b.sessionId))) {
    const aggregate = canonicalRecordedSessionLedger.get(reference.sessionId);
    if (aggregate.status !== "found") return { status: "recorded_history_missing", repairedSessionIds: repaired, reason: `missing_ledger:${reference.sessionId}` };
    const session = aggregate.session;
    if (session.planId !== carrier.planId || session.macrocycleId !== reference.macrocycleId || session.mesocycleId !== reference.mesocycleId || session.microcycleId !== reference.microcycleId || session.prescriptionHash !== JSON.stringify(session.prescriptionSnapshot)) return { status: "immutable_linkage_conflict", repairedSessionIds: repaired, reason: `immutable_linkage:${reference.sessionId}` };
    if (session.status === "pending") return { status: "recorded_history_corrupt", repairedSessionIds: repaired, reason: `pending_ledger:${reference.sessionId}` };
    if (reference.status === session.status && reference.revision === session.version) continue;
    if (reference.revision > session.version) return { status: "recorded_history_corrupt", repairedSessionIds: repaired, reason: `carrier_ahead:${reference.sessionId}` };
    const nextRevision = carrier.revision + 1;
    const next = { ...carrier, revision: nextRevision, recordedSessionReferences: references.map((item) => item.sessionId === reference.sessionId ? { ...item, status: session.status === "historical" ? "legacy_historical" as const : session.status as "started" | "paused" | "completed", revision: session.version } : item), progress: { ...carrier.progress, revision: nextRevision } };
    const saved = canonicalActivePlanV2Repository.saveAtomically(next, carrier.revision);
    if (saved.status !== "saved") return { status: "retry_required", repairedSessionIds: repaired, reason: `cas_repair:${reference.sessionId}` };
    carrier = saved.carrier;
    repaired.push(reference.sessionId);
  }
  return { status: repaired.length ? "ready_after_reconciliation" : "ready", carrier, repairedSessionIds: repaired };
}

export function reconcileCanonicalRecordedReference(command: CanonicalRecordedReferenceReconciliationCommand): CanonicalRecordedReferenceReconciliationResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== command.planId) return { status: "rejected", reason: "canonical_plan_unavailable", planRevision: 0, recordedSessionId: command.recordedSessionId };
  if (loaded.carrier.revision !== command.expectedPlanRevision) return { status: "rejected", reason: "stale_plan_revision", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId };
  const reference = loaded.carrier.recordedSessionReferences?.find((item) => item.sessionId === command.recordedSessionId);
  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (!reference || aggregate.status !== "found") return { status: "rejected", reason: aggregate.status === "found" ? "recorded_reference_missing" : "missing_ledger_aggregate", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId };
  const session = aggregate.session;
  if (session.status === "pending") return { status: "rejected", reason: "pending_ledger_not_authoritative", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId, ledgerVersion: session.version };
  if (session.planId !== loaded.carrier.planId || session.microcycleId !== reference.microcycleId || session.prescriptionHash !== JSON.stringify(session.prescriptionSnapshot)) return { status: "rejected", reason: "immutable_recorded_identity_mismatch", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId, ledgerVersion: session.version };
  const summary = session.status === "completed" || session.status === "historical" ? deriveCanonicalCompletionSummary(session, aggregate.events) : undefined;
  if (reference.status === session.status && reference.revision === session.version) return { status: "consistent", reason: "carrier_matches_ledger", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId, ledgerVersion: session.version, ...(summary ? { completionSummaryId: summary.summaryId } : {}) };
  const nextRevision = loaded.carrier.revision + 1;
  const next = { ...loaded.carrier, revision: nextRevision, recordedSessionReferences: loaded.carrier.recordedSessionReferences!.map((item) => item.sessionId === command.recordedSessionId ? { ...item, status: session.status as "started" | "paused" | "completed" | "legacy_historical", revision: session.version } : item), progress: { ...loaded.carrier.progress, revision: nextRevision } };
  const saved = canonicalActivePlanV2Repository.saveAtomically(next, loaded.carrier.revision);
  if (saved.status !== "saved") return { status: "retry_required", reason: "carrier_repair_cas_failed", planRevision: loaded.carrier.revision, recordedSessionId: command.recordedSessionId, ledgerVersion: session.version };
  return { status: "repaired", reason: "carrier_reconciled_to_ledger", planRevision: loaded.carrier.revision, newRevision: nextRevision, recordedSessionId: command.recordedSessionId, ledgerVersion: session.version, ...(summary ? { completionSummaryId: summary.summaryId } : {}) };
}
