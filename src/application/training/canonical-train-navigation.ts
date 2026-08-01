import {
  pauseCanonicalSession,
  type CanonicalRecordedLifecycleResult,
} from "@/application/training/canonical-recorded-session-application";

export type CanonicalTrainMinimiseCommand = Readonly<{
  planId: string;
  planRevision: number;
  recordedSessionId: string;
  ledgerVersion: number;
  lifecycle: string;
  operationId: string;
  occurredAt: string;
  provenance: string;
}>;

/**
 * Navigation coordination only. The recorded-session application remains the
 * sole lifecycle authority; leaving Train first persists a canonical paused
 * state so tab navigation cannot lose or duplicate the active attempt.
 */
export function minimiseCanonicalActiveWorkout(
  command: CanonicalTrainMinimiseCommand,
): CanonicalRecordedLifecycleResult {
  if (command.lifecycle === "paused") {
    return {
      status: "idempotent",
      reason: "session_already_paused",
      planRevision: command.planRevision,
      ledgerVersion: command.ledgerVersion,
    };
  }
  if (command.lifecycle !== "started") {
    return { status: "rejected", reason: "active_workout_not_minimisable" };
  }
  return pauseCanonicalSession({
    planId: command.planId,
    expectedPlanRevision: command.planRevision,
    recordedSessionId: command.recordedSessionId,
    expectedLedgerVersion: command.ledgerVersion,
    operationId: command.operationId,
    occurredAt: command.occurredAt,
    provenance: command.provenance,
  });
}
