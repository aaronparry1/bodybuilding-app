import { jsonStore } from "@/data/local/json-store";
import { allowedRecordedSessionTransition, validateCanonicalRecordedSession, type CanonicalRecordedSession, type CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
const key = "iron-logic.canonical-recorded-session-ledger-v1";
/**
 * KNOWN PERFORMANCE DEBT (documented, not yet fixed — 19 Sept 2026):
 * Every session's events live under this one shared store key. append()
 * (called on every single set logged) reads, mutates, and synchronously
 * rewrites this ENTIRE object — every session a user has ever recorded,
 * not just the current one. This scales with total accumulated workout
 * history per user, and the underlying write is also genuinely
 * synchronous (blocks the JS thread) via SQLiteStorage's setItemSync,
 * confirmed in local-storage.ts.
 *
 * Deliberately not fixed yet. Both real fixes are invasive:
 * (1) making storage truly async requires changing jsonStore's public
 *     API (currently synchronous) and updating every caller across the
 *     app that depends on it, not just this file;
 * (2) storing sessions under individual keys instead of one shared
 *     object fixes the scaling problem but changes the data format,
 *     requiring a real migration for any existing user's stored history
 *     — get that migration wrong and people lose workout data.
 *
 * Given the app was mid App Store/Play Store review when this was
 * found, the judgment call was to defer rather than risk either change
 * untested. Revisit once there's real room to test a migration properly.
 * New users are unaffected (empty history costs nothing to rewrite);
 * this only degrades gradually for long-tenured users.
 */
type Store = Record<string, { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] }>;
export const canonicalRecordedSessionLedger = {
  create(session: CanonicalRecordedSession, operationId: string) { const valid = validateCanonicalRecordedSession(session); if (valid.status !== "valid") return valid; const store = jsonStore.get<Store>(key, {}); if (store[session.recordedSessionId]) return JSON.stringify(store[session.recordedSessionId].session) === JSON.stringify(session) ? { status: "duplicate" as const, session } : { status: "conflict" as const, reason: "recorded_session_id_conflict" }; jsonStore.set(key, { ...store, [session.recordedSessionId]: { session, events: [{ eventId: `${session.recordedSessionId}:pending:${operationId}`, aggregateId: session.recordedSessionId, expectedVersion: 0, type: "pending_start", occurredAt: session.createdAt, operationId, payload: {} }] } }); return { status: "saved" as const, session }; },
  append(recordedSessionId: string, event: CanonicalRecordedSessionEvent) { const store = jsonStore.get<Store>(key, {}); const aggregate = store[recordedSessionId]; if (!aggregate) return { status: "not_found" as const }; if (event.expectedVersion !== aggregate.session.version) return { status: "stale" as const, reason: "aggregate_version_mismatch" }; if (!allowedRecordedSessionTransition(aggregate.session.status, event.type)) return { status: "rejected" as const, reason: "invalid_lifecycle_transition" }; const nextStatus = event.type === "started" || event.type === "resumed" ? "started" : event.type === "paused" ? "paused" : event.type === "completed" ? "completed" : event.type === "historical" ? "historical" : aggregate.session.status; const next = { ...aggregate.session, status: nextStatus as CanonicalRecordedSession["status"], version: aggregate.session.version + 1, ...(event.type === "started" ? { startedAt: event.occurredAt } : {}) }; const updated = { session: next, events: [...aggregate.events, event] }; jsonStore.set(key, { ...store, [recordedSessionId]: updated }); return { status: "saved" as const, session: next }; },
  adjustActivePrescription(recordedSessionId: string, expectedVersion: number, operationId: string, occurredAt: string, prescriptionSnapshot: Readonly<Record<string, unknown>>, payload: Readonly<Record<string, unknown>>) {
    try {
      const store = jsonStore.get<Store>(key, {});
      const aggregate = store[recordedSessionId];
      if (!aggregate) return { status: "not_found" as const };
      const prior = aggregate.events.find((event) => event.operationId === operationId);
      if (prior) return { status: "duplicate" as const, session: aggregate.session };
      if (aggregate.session.version !== expectedVersion) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
      if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected" as const, reason: "active_session_required" };
      const valid = validateCanonicalRecordedSession({ ...aggregate.session, prescriptionSnapshot, prescriptionHash: JSON.stringify(prescriptionSnapshot) });
      if (valid.status !== "valid") return valid;
      const event: CanonicalRecordedSessionEvent = { eventId: `${recordedSessionId}:prescription:${operationId}`, aggregateId: recordedSessionId, expectedVersion, type: "prescription_adjusted", occurredAt, operationId, payload };
      const next = { ...aggregate.session, prescriptionSnapshot, prescriptionHash: JSON.stringify(prescriptionSnapshot), version: expectedVersion + 1 };
      jsonStore.set(key, { ...store, [recordedSessionId]: { session: next, events: [...aggregate.events, event] } });
      return { status: "saved" as const, session: next };
    } catch {
      return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
    }
  },
  get(recordedSessionId: string) { const value = jsonStore.get<Store>(key, {})[recordedSessionId]; return value ? { status: "found" as const, session: value.session, events: [...value.events] } : { status: "not_found" as const }; },
  list(planId: string) { return Object.values(jsonStore.get<Store>(key, {})).filter((value) => value.session.planId === planId).map((value) => value.session).sort((a, b) => a.recordedSessionId.localeCompare(b.recordedSessionId)); },
  inspectActive() {
    try {
      const sessions = Object.values(jsonStore.get<Store>(key, {}))
        .map((value) => value.session)
        .filter((session) => session.status === "pending" || session.status === "started" || session.status === "paused")
        .sort((left, right) => left.recordedSessionId.localeCompare(right.recordedSessionId));
      if (sessions.length === 0) return { status: "none" as const, sessions };
      if (sessions.length === 1) return { status: "found" as const, sessions };
      return { status: "invalid" as const, reason: "multiple_active_workouts", sessions };
    } catch {
      return { status: "invalid" as const, reason: "active_workout_storage_read_failed", sessions: [] };
    }
  },
  exportPlan(planId: string) { return Object.values(jsonStore.get<Store>(key, {})).filter((value) => value.session.planId === planId).sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((value) => ({ session: value.session, events: value.events.slice() })); },
  deleteActive(recordedSessionId: string, expectedVersion: number) {
    try {
      const store = jsonStore.get<Store>(key, {});
      const aggregate = store[recordedSessionId];
      if (!aggregate) return { status: "not_found" as const };
      if (aggregate.session.version !== expectedVersion) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
      if (!["pending", "started", "paused"].includes(aggregate.session.status)) return { status: "rejected" as const, reason: "historical_session_cannot_be_deleted" };
      const { [recordedSessionId]: _removed, ...remaining } = store;
      jsonStore.set(key, remaining);
      return { status: "deleted" as const };
    } catch {
      return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
    }
  },
  restorePlan(records: readonly { session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }[]) {
    try {
      const store = jsonStore.get<Store>(key, {});
      const next = { ...store };
      for (const record of records.slice().sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId))) {
        const valid = validateCanonicalRecordedSession(record.session);
        if (valid.status !== "valid" || record.events.some((event) => event.aggregateId !== record.session.recordedSessionId || event.expectedVersion < 0)) return { status: "rejected" as const, reason: "invalid_ledger_record" };
        const existing = next[record.session.recordedSessionId];
        if (existing && JSON.stringify(existing) !== JSON.stringify({ session: record.session, events: record.events })) return { status: "conflict" as const, reason: "ledger_record_conflict" };
        next[record.session.recordedSessionId] = { session: record.session, events: record.events.slice() };
      }
      jsonStore.set(key, next);
      return { status: "restored" as const };
    } catch {
      return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
    }
  },
  clear() { jsonStore.remove(key); },
};
