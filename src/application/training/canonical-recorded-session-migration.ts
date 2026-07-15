import type { CanonicalActivePlanCarrier } from "@/domain/training/canonical-active-plan-carrier";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export type CanonicalRecordedSnapshotMigrationInput = Readonly<{
  recordedSessionId: string;
  plannedSessionId: string;
  planId: string;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  role: string;
  prescriptionSnapshot: Readonly<Record<string, unknown>>;
  status: "started" | "paused" | "completed" | "historical";
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  performedEvents?: readonly CanonicalRecordedSessionEvent[];
  athleteId: string;
}>;

export type CanonicalRecordedSnapshotMigrationResult = Readonly<{ status: "migrated"; sessions: readonly { session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }[]; carrier: CanonicalActivePlanCarrier }> | Readonly<{ status: "rejected"; reason: "ambiguous_record" | "invalid_linkage" | "invalid_prescription" }>;

/** Imports only explicit canonical facts; it never reconstructs missing work or identity. */
export function migrateCanonicalRecordedSnapshots(carrier: CanonicalActivePlanCarrier, inputs: readonly CanonicalRecordedSnapshotMigrationInput[]): CanonicalRecordedSnapshotMigrationResult {
  const sessions: { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] }[] = [];
  const references = [...(carrier.recordedSessionReferences ?? [])];
  for (const input of inputs.slice().sort((a, b) => a.recordedSessionId.localeCompare(b.recordedSessionId))) {
    if (input.planId !== carrier.planId || input.macrocycleId !== carrier.macrocycle.id || input.mesocycleId !== carrier.mesocycle.id || input.microcycleId !== carrier.microcycle.id || !input.recordedSessionId || !input.athleteId) return { status: "rejected", reason: "invalid_linkage" };
    const hash = JSON.stringify(input.prescriptionSnapshot);
    if (!hash || hash.includes("blocks") || hash.includes("TrainingYear")) return { status: "rejected", reason: "invalid_prescription" };
    const events = (input.performedEvents ?? []).slice().sort((a, b) => a.expectedVersion - b.expectedVersion || a.eventId.localeCompare(b.eventId));
    if (input.status === "completed" && !input.completedAt) return { status: "rejected", reason: "ambiguous_record" };
    const session: CanonicalRecordedSession = { schemaVersion: "canonical_recorded_session_v1", recordedSessionId: input.recordedSessionId, plannedSessionId: input.plannedSessionId, planId: input.planId, startRevision: carrier.revision, macrocycleId: input.macrocycleId, mesocycleId: input.mesocycleId, microcycleId: input.microcycleId, role: input.role, prescriptionSnapshot: input.prescriptionSnapshot, prescriptionHash: hash, provenance: { source: "canonical_recorded_snapshot_migration", constructionVersion: "migration" }, athleteId: input.athleteId, version: events.length, status: input.status, createdAt: input.createdAt, ...(input.startedAt ? { startedAt: input.startedAt } : {}) };
    sessions.push({ session, events });
    if (!references.some((reference) => reference.sessionId === input.recordedSessionId)) references.push({ sessionId: input.recordedSessionId, planId: input.planId, macrocycleId: input.macrocycleId, mesocycleId: input.mesocycleId, microcycleId: input.microcycleId, revision: carrier.revision, status: input.status === "historical" ? "legacy_historical" : input.status, recordReference: `canonical-recorded-session:${input.plannedSessionId}` });
  }
  return { status: "migrated", sessions, carrier: { ...carrier, recordedSessionReferences: references.sort((a, b) => a.sessionId.localeCompare(b.sessionId)) } };
}
