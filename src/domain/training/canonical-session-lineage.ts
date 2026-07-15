export const CANONICAL_SESSION_LINEAGE_SCHEMA = "canonical_session_lineage_v1" as const;
export type CanonicalCycleLineage = Readonly<{ schemaVersion: typeof CANONICAL_SESSION_LINEAGE_SCHEMA; planId: string; macrocycleId: string; mesocycleId: string; microcycleId: string; revision: number; sequenceNumber: number; predecessorMicrocycleId?: string; transitionDecisionId?: string; status: "current" | "predecessor" }>;
export type CanonicalRecordedSessionReference = Readonly<{ sessionId: string; planId: string; macrocycleId: string; mesocycleId: string; microcycleId: string; revision: number; status: "started" | "paused" | "completed" | "legacy_historical"; recordReference: string }>;

export function validateCanonicalLineage(lineage: readonly CanonicalCycleLineage[], references: readonly CanonicalRecordedSessionReference[]): string | null {
  const ids = new Set<string>();
  for (const entry of lineage) {
    if (entry.schemaVersion !== CANONICAL_SESSION_LINEAGE_SCHEMA || !entry.planId || !entry.macrocycleId || !entry.mesocycleId || !entry.microcycleId || entry.revision < 0 || ids.has(entry.microcycleId)) return "invalid_cycle_lineage";
    ids.add(entry.microcycleId);
  }
  const sessions = new Set<string>();
  for (const reference of references) {
    if (!reference.sessionId || !reference.planId || !reference.microcycleId || !reference.recordReference || sessions.has(reference.sessionId)) return "invalid_recorded_session_reference";
    if (!ids.has(reference.microcycleId)) return "recorded_session_lineage_missing";
    sessions.add(reference.sessionId);
  }
  return null;
}
