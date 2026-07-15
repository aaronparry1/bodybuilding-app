import { jsonStore } from "@/data/local/json-store";
import { allowedRecordedSessionTransition, validateCanonicalRecordedSession, type CanonicalRecordedSession, type CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";
const key = "iron-logic.canonical-recorded-session-ledger-v1";
type Store = Record<string, { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] }>;
export const canonicalRecordedSessionLedger = {
  create(session: CanonicalRecordedSession, operationId: string) { const valid = validateCanonicalRecordedSession(session); if (valid.status !== "valid") return valid; const store = jsonStore.get<Store>(key, {}); if (store[session.recordedSessionId]) return JSON.stringify(store[session.recordedSessionId].session) === JSON.stringify(session) ? { status: "duplicate" as const, session } : { status: "conflict" as const, reason: "recorded_session_id_conflict" }; jsonStore.set(key, { ...store, [session.recordedSessionId]: { session, events: [{ eventId: `${session.recordedSessionId}:pending:${operationId}`, aggregateId: session.recordedSessionId, expectedVersion: 0, type: "pending_start", occurredAt: session.createdAt, operationId, payload: {} }] } }); return { status: "saved" as const, session }; },
  append(recordedSessionId: string, event: CanonicalRecordedSessionEvent) { const store = jsonStore.get<Store>(key, {}); const aggregate = store[recordedSessionId]; if (!aggregate) return { status: "not_found" as const }; if (event.expectedVersion !== aggregate.session.version) return { status: "stale" as const, reason: "aggregate_version_mismatch" }; if (!allowedRecordedSessionTransition(aggregate.session.status, event.type)) return { status: "rejected" as const, reason: "invalid_lifecycle_transition" }; const nextStatus = event.type === "started" || event.type === "resumed" ? "started" : event.type === "paused" ? "paused" : event.type === "completed" ? "completed" : event.type === "historical" ? "historical" : aggregate.session.status; const next = { ...aggregate.session, status: nextStatus as CanonicalRecordedSession["status"], version: aggregate.session.version + 1, ...(event.type === "started" ? { startedAt: event.occurredAt } : {}) }; const updated = { session: next, events: [...aggregate.events, event] }; jsonStore.set(key, { ...store, [recordedSessionId]: updated }); return { status: "saved" as const, session: next }; },
  get(recordedSessionId: string) { const value = jsonStore.get<Store>(key, {})[recordedSessionId]; return value ? { status: "found" as const, session: value.session, events: [...value.events] } : { status: "not_found" as const }; },
  list(planId: string) { return Object.values(jsonStore.get<Store>(key, {})).filter((value) => value.session.planId === planId).map((value) => value.session).sort((a, b) => a.recordedSessionId.localeCompare(b.recordedSessionId)); },
  exportPlan(planId: string) { return Object.values(jsonStore.get<Store>(key, {})).filter((value) => value.session.planId === planId).sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((value) => ({ session: value.session, events: value.events.slice() })); },
  restorePlan(records: readonly { session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }[]) {
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
  },
  clear() { jsonStore.remove(key); },
};
