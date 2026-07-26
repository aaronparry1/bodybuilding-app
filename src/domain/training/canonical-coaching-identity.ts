import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalRecordedSession } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_COACHING_IDENTITY_VERSION = "canonical_coaching_identity_v1" as const;

export type CanonicalCoachingIdentity = Readonly<{
  schemaVersion: typeof CANONICAL_COACHING_IDENTITY_VERSION;
  planId: string;
  planRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  plannedSessionId: string;
  recordedSessionId: string;
  prescriptionHash: string;
  athleteId: string;
  exerciseId?: string;
  slotId?: string;
  evidenceId?: string;
}>;

export function validateCanonicalCoachingIdentity(input: Readonly<{
  identity: CanonicalCoachingIdentity;
  session: CanonicalRecordedSession;
  evidence?: CanonicalProgressEvidence;
}>): Readonly<{ status: "valid" } | { status: "invalid"; reason: string }> {
  const { identity, session, evidence } = input;
  if (identity.schemaVersion !== CANONICAL_COACHING_IDENTITY_VERSION) return { status: "invalid", reason: "unsupported_identity_version" };
  if (!identity.planId || !identity.plannedSessionId || !identity.recordedSessionId || !identity.prescriptionHash || !identity.athleteId || !Number.isInteger(identity.planRevision) || identity.planRevision < 0) return { status: "invalid", reason: "incomplete_identity" };
  if (session.planId !== identity.planId
    || session.plannedSessionId !== identity.plannedSessionId
    || session.recordedSessionId !== identity.recordedSessionId
    || session.prescriptionHash !== identity.prescriptionHash
    || session.macrocycleId !== identity.macrocycleId
    || session.mesocycleId !== identity.mesocycleId
    || session.microcycleId !== identity.microcycleId
    || session.athleteId !== identity.athleteId) return { status: "invalid", reason: "session_identity_mismatch" };
  if (!evidence) return { status: "valid" };
  if (evidence.planId !== identity.planId
    || evidence.macrocycleId !== identity.macrocycleId
    || evidence.mesocycleId !== identity.mesocycleId
    || evidence.microcycleId !== identity.microcycleId
    || evidence.sessionId !== identity.recordedSessionId
    || evidence.athleteId !== identity.athleteId
    || (identity.evidenceId && identity.evidenceId !== evidence.evidenceId)
    || (identity.slotId && identity.slotId !== evidence.slotId)
    || (identity.exerciseId && identity.exerciseId !== evidence.observations.exerciseId)) return { status: "invalid", reason: "evidence_identity_mismatch" };
  return { status: "valid" };
}

export function canonicalCoachingOperationId(planId: string, recordedSessionId: string, completionEvidenceId: string): string {
  return `${planId}:post-workout:${recordedSessionId}:${completionEvidenceId}`;
}
