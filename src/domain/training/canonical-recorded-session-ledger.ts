export const CANONICAL_RECORDED_SESSION_SCHEMA = "canonical_recorded_session_v1" as const;
export type CanonicalRecordedSessionStatus = "pending" | "started" | "paused" | "completed" | "historical";
export type CanonicalRecordedSession = Readonly<{ schemaVersion: typeof CANONICAL_RECORDED_SESSION_SCHEMA; recordedSessionId: string; plannedSessionId: string; planId: string; startRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; role: string; prescriptionSnapshot: Readonly<Record<string, unknown>>; prescriptionHash: string; provenance: Readonly<Record<string, string>>; athleteId: string; version: number; status: CanonicalRecordedSessionStatus; createdAt: string; startedAt?: string }>;
export type CanonicalRecordedSessionEvent = Readonly<{ eventId: string; aggregateId: string; expectedVersion: number; type: "pending_start" | "started" | "paused" | "resumed" | "performance" | "completed" | "historical" | "repair"; occurredAt: string; operationId: string; payload: Readonly<Record<string, unknown>> }>;

export function validateCanonicalRecordedSession(value: unknown): { status: "valid"; session: CanonicalRecordedSession } | { status: "invalid"; reason: string } {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "malformed_recorded_session" };
  const c = value as Record<string, unknown>;
  for (const key of ["recordedSessionId", "plannedSessionId", "planId", "macrocycleId", "mesocycleId", "microcycleId", "role", "prescriptionHash", "athleteId", "createdAt"]) if (typeof c[key] !== "string" || !c[key]) return { status: "invalid", reason: `missing_${key}` };
  if (c.schemaVersion !== CANONICAL_RECORDED_SESSION_SCHEMA || typeof c.prescriptionSnapshot !== "object" || c.prescriptionSnapshot === null) return { status: "invalid", reason: "invalid_recorded_schema" };
  if (typeof c.version !== "number" || c.version < 0 || !["pending", "started", "paused", "completed", "historical"].includes(String(c.status))) return { status: "invalid", reason: "invalid_recorded_state" };
  const serialized = JSON.stringify(c.prescriptionSnapshot);
  if (serialized.includes("blocks") || serialized.includes("TrainingYear") || serialized.includes("activeBlockId")) return { status: "invalid", reason: "legacy_authority_present" };
  return { status: "valid", session: c as CanonicalRecordedSession };
}

export function allowedRecordedSessionTransition(from: CanonicalRecordedSessionStatus, event: CanonicalRecordedSessionEvent["type"]): boolean {
  if (from === "pending") return event === "started" || event === "repair";
  if (from === "started") return ["paused", "performance", "completed", "repair"].includes(event);
  if (from === "paused") return ["resumed", "performance", "completed", "repair"].includes(event);
  if (from === "completed") return event === "historical";
  return event === "repair";
}
