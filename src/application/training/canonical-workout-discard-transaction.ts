import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalRestTimerRepository } from "@/data/local/canonical-rest-timer-repository";
import {
  canonicalWorkoutDiscardIntentRepository,
  type CanonicalWorkoutDiscardIntent,
} from "@/data/local/canonical-workout-discard-intent-repository";

export type CanonicalWorkoutDiscardCommand = Readonly<{
  planId: string;
  expectedPlanRevision: number;
  recordedSessionId: string;
  expectedLedgerVersion: number;
  operationId: string;
  occurredAt: string;
  provenance: string;
}>;

export type CanonicalWorkoutDiscardResult = Readonly<{
  status: "applied" | "idempotent" | "rejected" | "retryable";
  reason: string;
  planRevision?: number;
  ledgerVersion?: number;
}>;

/**
 * The one persistence transaction for discarding a mutable workout attempt.
 *
 * Local storage cannot atomically update the active-plan carrier, recorded
 * ledger, evidence, and rest timer in one write. A durable intent therefore
 * precedes every destructive write and contains the exact ledger aggregate
 * needed to recover a pre-CAS interruption without inventing workout facts.
 */
export function discardCanonicalWorkoutAttempt(
  command: CanonicalWorkoutDiscardCommand,
): CanonicalWorkoutDiscardResult {
  const existingIntent = canonicalWorkoutDiscardIntentRepository.get(command.recordedSessionId);
  if (existingIntent.status === "found") {
    return reconcileCanonicalWorkoutDiscardIntent(existingIntent.intent);
  }
  if (existingIntent.status === "invalid") {
    return { status: "rejected", reason: "discard_intent_corrupt" };
  }

  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") {
    return { status: "rejected", reason: "canonical_plan_unavailable" };
  }
  if (
    loaded.carrier.planId !== command.planId
    || loaded.carrier.revision !== command.expectedPlanRevision
  ) {
    return { status: "rejected", reason: "stale_plan_revision" };
  }

  const aggregate = canonicalRecordedSessionLedger.get(command.recordedSessionId);
  if (aggregate.status !== "found") {
    const plannedSessionId = plannedSessionIdForRecordedId(command.planId, command.recordedSessionId);
    const restored = plannedSessionId
      && loaded.carrier.plannedSessions.some((session) => session.id === plannedSessionId);
    if (!restored) return { status: "rejected", reason: "recorded_session_not_found" };
    return cleanupDiscardedAttempt(command.planId, command.recordedSessionId)
      ? {
          status: "idempotent",
          reason: "discard_already_applied",
          planRevision: loaded.carrier.revision,
        }
      : {
          status: "retryable",
          reason: "discard_cleanup_pending",
          planRevision: loaded.carrier.revision,
        };
  }
  if (aggregate.session.version !== command.expectedLedgerVersion) {
    return { status: "rejected", reason: "stale_ledger_version" };
  }
  if (!["pending", "started", "paused"].includes(aggregate.session.status)) {
    return { status: "rejected", reason: "completed_history_cannot_be_discarded" };
  }

  const reference = loaded.carrier.recordedSessionReferences?.find(
    (item) => item.sessionId === command.recordedSessionId,
  );
  const snapshot = aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const planSessionIndex = Number(snapshot.planSessionIndex);
  if (
    !Number.isInteger(planSessionIndex)
    || planSessionIndex < 0
    || aggregate.session.prescriptionHash !== JSON.stringify(snapshot)
  ) {
    return { status: "rejected", reason: "discard_prescription_integrity_mismatch" };
  }
  const alreadyRestored = loaded.carrier.plannedSessions.some(
    (session) => session.id === aggregate.session.plannedSessionId,
  );
  if (!reference && !alreadyRestored) {
    return { status: "rejected", reason: "recorded_session_linkage_missing" };
  }

  const prepared = canonicalWorkoutDiscardIntentRepository.save({
    schemaVersion: "canonical_workout_discard_intent_v1",
    operationId: command.operationId,
    planId: command.planId,
    recordedSessionId: command.recordedSessionId,
    plannedSessionId: aggregate.session.plannedSessionId,
    expectedPlanRevision: command.expectedPlanRevision,
    expectedLedgerVersion: command.expectedLedgerVersion,
    occurredAt: command.occurredAt,
    provenance: command.provenance,
    aggregate: {
      session: aggregate.session,
      events: aggregate.events,
    },
  });
  if (prepared.status !== "saved" && prepared.status !== "duplicate") {
    return { status: "rejected", reason: prepared.reason };
  }
  return applyCanonicalWorkoutDiscardIntent(prepared.intent);
}

export function reconcilePendingCanonicalWorkoutDiscards(): readonly CanonicalWorkoutDiscardResult[] {
  return canonicalWorkoutDiscardIntentRepository
    .list()
    .map(reconcileCanonicalWorkoutDiscardIntent);
}

export function reconcileCanonicalWorkoutDiscard(
  recordedSessionId: string,
): CanonicalWorkoutDiscardResult | null {
  const pending = canonicalWorkoutDiscardIntentRepository.get(recordedSessionId);
  if (pending.status === "found") {
    return reconcileCanonicalWorkoutDiscardIntent(pending.intent);
  }
  if (pending.status === "invalid") {
    return { status: "rejected", reason: "discard_intent_corrupt" };
  }
  return null;
}

function reconcileCanonicalWorkoutDiscardIntent(
  intent: CanonicalWorkoutDiscardIntent,
): CanonicalWorkoutDiscardResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || loaded.carrier.planId !== intent.planId) {
    return { status: "retryable", reason: "discard_plan_reconciliation_pending" };
  }

  const plannedRestored = loaded.carrier.plannedSessions.some(
    (session) => session.id === intent.plannedSessionId,
  );
  const referencePresent = Boolean(
    loaded.carrier.recordedSessionReferences?.some(
      (reference) => reference.sessionId === intent.recordedSessionId,
    ),
  );

  if (plannedRestored && !referencePresent) {
    const cleaned = removeMutableAttemptAndEvidence(intent);
    if (!cleaned) {
      return {
        status: "retryable",
        reason: "discard_cleanup_pending",
        planRevision: loaded.carrier.revision,
      };
    }
    canonicalWorkoutDiscardIntentRepository.remove(intent.recordedSessionId);
    return {
      status: "idempotent",
      reason: "discard_reconciled_after_restart",
      planRevision: loaded.carrier.revision,
    };
  }

  if (
    loaded.carrier.revision !== intent.expectedPlanRevision
    || !referencePresent
    || plannedRestored
  ) {
    restoreIntentAggregateIfMissing(intent);
    return {
      status: "retryable",
      reason: "discard_state_reconciliation_required",
      planRevision: loaded.carrier.revision,
    };
  }

  if (!restoreIntentAggregateIfMissing(intent)) {
    return {
      status: "rejected",
      reason: "discard_ledger_reconciliation_conflict",
      planRevision: loaded.carrier.revision,
    };
  }

  return applyCanonicalWorkoutDiscardIntent(intent);
}

function applyCanonicalWorkoutDiscardIntent(
  intent: CanonicalWorkoutDiscardIntent,
): CanonicalWorkoutDiscardResult {
  const loaded = canonicalActivePlanV2Repository.get();
  if (
    loaded.status !== "saved"
    || loaded.carrier.planId !== intent.planId
    || loaded.carrier.revision !== intent.expectedPlanRevision
  ) {
    return reconcileCanonicalWorkoutDiscardIntent(intent);
  }

  const aggregate = canonicalRecordedSessionLedger.get(intent.recordedSessionId);
  if (aggregate.status !== "found") {
    if (!restoreIntentAggregateIfMissing(intent)) {
      return { status: "rejected", reason: "discard_ledger_reconciliation_conflict" };
    }
  } else if (!sameAggregate(intent, aggregate)) {
    return { status: "rejected", reason: "discard_attempt_changed_after_confirmation" };
  }

  const snapshot = intent.aggregate.session.prescriptionSnapshot as Record<string, unknown>;
  const restoredPlanned = {
    id: intent.plannedSessionId,
    microcycleId: intent.aggregate.session.microcycleId,
    planSessionIndex: Number(snapshot.planSessionIndex),
    role: intent.aggregate.session.role,
    kind: "planned" as const,
    status: "planned" as const,
    constructionVersion:
      intent.aggregate.session.provenance.constructionVersion ?? "canonical_plan_v3",
    revision: intent.aggregate.session.startRevision,
    prescriptionSnapshot: intent.aggregate.session.prescriptionSnapshot,
  };
  const alreadyRestored = loaded.carrier.plannedSessions.some(
    (session) => session.id === intent.plannedSessionId,
  );
  const nextRevision = loaded.carrier.revision + 1;
  const next = {
    ...loaded.carrier,
    revision: nextRevision,
    updatedAt: intent.occurredAt,
    plannedSessions: (
      alreadyRestored
        ? loaded.carrier.plannedSessions
        : [...loaded.carrier.plannedSessions, restoredPlanned]
    )
      .slice()
      .sort((left, right) => left.planSessionIndex - right.planSessionIndex),
    recordedSessionReferences: (loaded.carrier.recordedSessionReferences ?? []).filter(
      (item) => item.sessionId !== intent.recordedSessionId,
    ),
    progress: { ...loaded.carrier.progress, revision: nextRevision },
  };

  const deleted = canonicalRecordedSessionLedger.deleteActive(
    intent.recordedSessionId,
    intent.expectedLedgerVersion,
  );
  if (deleted.status !== "deleted" && deleted.status !== "not_found") {
    return {
      status: "retryable",
      reason: deleted.reason ?? "discard_ledger_cleanup_pending",
    };
  }

  // The durable intent deliberately remains present across this CAS window.
  // A process interruption can therefore restore the exact ledger aggregate
  // or finish cleanup from the committed carrier on the next hydration.
  const saved = canonicalActivePlanV2Repository.saveAtomically(
    next,
    loaded.carrier.revision,
  );
  if (saved.status !== "saved") {
    const restored = canonicalRecordedSessionLedger.restorePlan([
      {
        session: intent.aggregate.session,
        events: intent.aggregate.events,
      },
    ]);
    return restored.status === "restored"
      ? { status: "retryable", reason: "discard_carrier_update_pending" }
      : { status: "retryable", reason: "discard_compensation_failed" };
  }

  if (!cleanupDiscardedAttempt(intent.planId, intent.recordedSessionId)) {
    return {
      status: "retryable",
      reason: "discard_cleanup_pending",
      planRevision: nextRevision,
    };
  }
  canonicalWorkoutDiscardIntentRepository.remove(intent.recordedSessionId);
  return {
    status: "applied",
    reason: "session_attempt_discarded",
    planRevision: nextRevision,
  };
}

function removeMutableAttemptAndEvidence(intent: CanonicalWorkoutDiscardIntent): boolean {
  const aggregate = canonicalRecordedSessionLedger.get(intent.recordedSessionId);
  if (aggregate.status === "found") {
    if (
      !["pending", "started", "paused"].includes(aggregate.session.status)
      || !sameAggregate(intent, aggregate)
    ) {
      return false;
    }
    const deleted = canonicalRecordedSessionLedger.deleteActive(
      intent.recordedSessionId,
      aggregate.session.version,
    );
    if (deleted.status !== "deleted" && deleted.status !== "not_found") return false;
  }
  return cleanupDiscardedAttempt(intent.planId, intent.recordedSessionId);
}

function restoreIntentAggregateIfMissing(intent: CanonicalWorkoutDiscardIntent): boolean {
  const current = canonicalRecordedSessionLedger.get(intent.recordedSessionId);
  if (current.status === "found") return sameAggregate(intent, current);
  return canonicalRecordedSessionLedger.restorePlan([
    {
      session: intent.aggregate.session,
      events: intent.aggregate.events,
    },
  ]).status === "restored";
}

function sameAggregate(
  intent: CanonicalWorkoutDiscardIntent,
  aggregate: Readonly<{
    session: CanonicalWorkoutDiscardIntent["aggregate"]["session"];
    events: readonly CanonicalWorkoutDiscardIntent["aggregate"]["events"][number][];
  }>,
): boolean {
  return JSON.stringify({
    session: aggregate.session,
    events: aggregate.events,
  }) === JSON.stringify(intent.aggregate);
}

function cleanupDiscardedAttempt(planId: string, recordedSessionId: string): boolean {
  try {
    canonicalProgressEvidenceRepository.removeSession(planId, recordedSessionId);
    canonicalRestTimerRepository.clear(recordedSessionId);
    return true;
  } catch {
    return false;
  }
}

function plannedSessionIdForRecordedId(
  planId: string,
  recordedSessionId: string,
): string | null {
  const prefix = `${planId}:recorded:`;
  return recordedSessionId.startsWith(prefix) && recordedSessionId.length > prefix.length
    ? recordedSessionId.slice(prefix.length)
    : null;
}
