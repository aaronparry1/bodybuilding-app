import { jsonStore } from "@/data/local/json-store";

const key = "iron-logic.canonical-coaching-attempts-v1";

export type CanonicalCoachingAttempt = Readonly<{
  schemaVersion: "canonical_coaching_attempt_v1";
  operationId: string;
  planId: string;
  recordedSessionId: string;
  completionEvidenceId: string;
  status: "pending" | "decision_persisted" | "applied" | "unchanged" | "blocked";
  reason: string;
  evaluationId?: string;
  decisionId?: string;
  planRevisionAtCompletion?: number;
  completedLedgerVersion?: number;
  prescriptionHash?: string;
  evidenceState?: "pending" | "complete";
  decisionState?: "pending" | "persisted";
  applicationState?: "pending" | "applied" | "unchanged" | "blocked";
  boundaryResolutionFingerprint?: string;
  boundaryResolutionEvent?: string;
  retryIdentity?: string;
  updatedAt: string;
}>;

export const canonicalCoachingAttemptRepository = {
  save(attempt: CanonicalCoachingAttempt) {
    if (attempt.schemaVersion !== "canonical_coaching_attempt_v1" || !attempt.operationId || !attempt.planId || !attempt.recordedSessionId || !attempt.completionEvidenceId || Number.isNaN(Date.parse(attempt.updatedAt))
      || attempt.planRevisionAtCompletion !== undefined && (!Number.isInteger(attempt.planRevisionAtCompletion) || attempt.planRevisionAtCompletion < 0)
      || attempt.completedLedgerVersion !== undefined && (!Number.isInteger(attempt.completedLedgerVersion) || attempt.completedLedgerVersion < 1)
      || attempt.boundaryResolutionFingerprint !== undefined && !attempt.boundaryResolutionFingerprint.startsWith("canonical_fingerprint_v1|")
      || attempt.boundaryResolutionEvent !== undefined && !attempt.boundaryResolutionEvent
      || attempt.retryIdentity !== undefined && attempt.retryIdentity !== attempt.operationId) return { status: "invalid" as const, reason: "invalid_coaching_attempt" };
    const all = jsonStore.get<Record<string, CanonicalCoachingAttempt>>(key, {});
    const existing = all[attempt.operationId];
    if (existing && (existing.planId !== attempt.planId || existing.recordedSessionId !== attempt.recordedSessionId || existing.completionEvidenceId !== attempt.completionEvidenceId)) return { status: "conflict" as const, reason: "coaching_operation_identity_conflict" };
    const persisted = existing
      ? { ...existing, ...Object.fromEntries(Object.entries(attempt).filter(([, value]) => value !== undefined)) } as CanonicalCoachingAttempt
      : attempt;
    jsonStore.set(key, { ...all, [attempt.operationId]: persisted });
    return { status: "saved" as const, attempt: persisted };
  },
  get(operationId: string) {
    const value = jsonStore.get<Record<string, CanonicalCoachingAttempt>>(key, {})[operationId];
    return value ? { status: "found" as const, attempt: value } : { status: "not_found" as const };
  },
  list(planId: string) {
    return Object.values(jsonStore.get<Record<string, CanonicalCoachingAttempt>>(key, {}))
      .filter((attempt) => attempt.planId === planId)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) || a.operationId.localeCompare(b.operationId));
  },
  clear() { jsonStore.remove(key); },
};
