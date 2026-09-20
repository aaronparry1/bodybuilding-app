import { jsonStore } from "@/data/local/json-store";
import { getLocalStorageKeys } from "@/data/local/local-storage";
import { allowedRecordedSessionTransition, validateCanonicalRecordedSession, type CanonicalRecordedSession, type CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_LEDGER_LEGACY_KEY = "iron-logic.canonical-recorded-session-ledger-v1";
export const CANONICAL_LEDGER_V2_MANIFEST_KEY = "iron-logic.canonical-recorded-session-ledger-v2.manifest";
export const CANONICAL_LEDGER_V2_RECORD_PREFIX = "iron-logic.canonical-recorded-session-ledger-v2.session.";

type Aggregate = { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] };
type LegacyStore = Record<string, Aggregate>;
type Manifest = { schemaVersion: 2; legacyImportComplete: true; ids: string[] };

export type CanonicalLedgerStorage = {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  keys(): string[];
};

const defaultStorage: CanonicalLedgerStorage = {
  get: (key, fallback) => jsonStore.get(key, fallback),
  set: (key, value) => jsonStore.set(key, value),
  remove: (key) => jsonStore.remove(key),
  keys: () => getLocalStorageKeys(),
};

export function createCanonicalRecordedSessionLedger(storage: CanonicalLedgerStorage = defaultStorage) {
  let readyManifest: Manifest | null = null;
  const recordKey = (id: string) => `${CANONICAL_LEDGER_V2_RECORD_PREFIX}${encodeURIComponent(id)}`;
  const readRecord = (id: string) => storage.get<Aggregate | null>(recordKey(id), null);
  const validRecord = (record: Aggregate): boolean => {
    const valid = validateCanonicalRecordedSession(record.session);
    return valid.status === "valid" && record.events.every((event) => event.aggregateId === record.session.recordedSessionId && event.expectedVersion >= 0);
  };
  const writeVerified = (id: string, record: Aggregate) => {
    if (!validRecord(record)) throw new Error("invalid_ledger_record");
    storage.set(recordKey(id), record);
    const readBack = readRecord(id);
    if (!readBack || JSON.stringify(readBack) !== JSON.stringify(record)) throw new Error("recorded_session_storage_verification_failed");
  };
  const writeManifestVerified = (manifest: Manifest) => {
    storage.set(CANONICAL_LEDGER_V2_MANIFEST_KEY, manifest);
    const readBack = storage.get<Manifest | null>(CANONICAL_LEDGER_V2_MANIFEST_KEY, null);
    if (JSON.stringify(readBack) !== JSON.stringify(manifest)) throw new Error("recorded_session_manifest_verification_failed");
    readyManifest = manifest;
  };
  const scannedIds = () => storage.keys()
    .filter((candidate) => candidate.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX))
    .map((candidate) => decodeURIComponent(candidate.slice(CANONICAL_LEDGER_V2_RECORD_PREFIX.length)))
    .filter((id) => Boolean(readRecord(id)))
    .sort();
  const normalizeIds = (ids: readonly string[]) => [...new Set(ids)].sort();
  const isManifest = (value: unknown): value is Manifest => Boolean(value && typeof value === "object" && (value as Manifest).schemaVersion === 2 && (value as Manifest).legacyImportComplete === true && Array.isArray((value as Manifest).ids) && (value as Manifest).ids.every((id) => typeof id === "string"));

  const ensureReady = (): Manifest => {
    if (readyManifest) return readyManifest;
    const storedManifest = storage.get<unknown>(CANONICAL_LEDGER_V2_MANIFEST_KEY, null);
    if (storedManifest !== null && !isManifest(storedManifest)) throw new Error("recorded_session_manifest_invalid");
    if (isManifest(storedManifest)) {
      const repaired: Manifest = { ...storedManifest, ids: normalizeIds([...storedManifest.ids.filter((id) => Boolean(readRecord(id))), ...scannedIds()]) };
      if (JSON.stringify(repaired) !== JSON.stringify(storedManifest)) writeManifestVerified(repaired);
      else readyManifest = repaired;
      return repaired;
    }

    const hasLegacy = storage.keys().includes(CANONICAL_LEDGER_LEGACY_KEY);
    const orphanedIds = scannedIds();
    if (!hasLegacy && orphanedIds.length === 0) {
      readyManifest = { schemaVersion: 2, legacyImportComplete: true, ids: [] };
      return readyManifest;
    }
    const legacy = storage.get<LegacyStore>(CANONICAL_LEDGER_LEGACY_KEY, {});
    const legacyIds = Object.keys(legacy).sort();
    for (const id of legacyIds) {
      const record = legacy[id];
      if (!record || record.session.recordedSessionId !== id || !validRecord(record)) throw new Error("legacy_recorded_session_migration_invalid");
      const existing = readRecord(id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(record)) throw new Error("legacy_recorded_session_migration_conflict");
      if (!existing) writeVerified(id, record);
    }
    const migrated: Manifest = { schemaVersion: 2, legacyImportComplete: true, ids: normalizeIds([...legacyIds, ...orphanedIds]) };
    writeManifestVerified(migrated);
    return migrated;
  };

  const updateManifest = (ids: readonly string[]) => writeManifestVerified({ schemaVersion: 2, legacyImportComplete: true, ids: normalizeIds(ids) });
  const values = () => ensureReady().ids.flatMap((id) => {
    const record = readRecord(id);
    if (!record) return [];
    if (!validRecord(record)) throw new Error("recorded_session_storage_invalid");
    return [record];
  });

  return {
    create(session: CanonicalRecordedSession, operationId: string) {
      const valid = validateCanonicalRecordedSession(session);
      if (valid.status !== "valid") return valid;
      try {
        const manifest = ensureReady();
        const existing = readRecord(session.recordedSessionId);
        if (existing) return JSON.stringify(existing.session) === JSON.stringify(session) ? { status: "duplicate" as const, session } : { status: "conflict" as const, reason: "recorded_session_id_conflict" };
        const record = { session, events: [{ eventId: `${session.recordedSessionId}:pending:${operationId}`, aggregateId: session.recordedSessionId, expectedVersion: 0, type: "pending_start" as const, occurredAt: session.createdAt, operationId, payload: {} }] };
        writeVerified(session.recordedSessionId, record);
        updateManifest([...manifest.ids, session.recordedSessionId]);
        return { status: "saved" as const, session };
      } catch {
        readyManifest = null;
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    append(recordedSessionId: string, event: CanonicalRecordedSessionEvent) {
      try {
        ensureReady();
        const aggregate = readRecord(recordedSessionId);
        if (!aggregate) return { status: "not_found" as const };
        if (event.expectedVersion !== aggregate.session.version) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
        if (!allowedRecordedSessionTransition(aggregate.session.status, event.type)) return { status: "rejected" as const, reason: "invalid_lifecycle_transition" };
        const nextStatus = event.type === "started" || event.type === "resumed" ? "started" : event.type === "paused" ? "paused" : event.type === "completed" ? "completed" : event.type === "historical" ? "historical" : aggregate.session.status;
        const next = { ...aggregate.session, status: nextStatus as CanonicalRecordedSession["status"], version: aggregate.session.version + 1, ...(event.type === "started" ? { startedAt: event.occurredAt } : {}) };
        writeVerified(recordedSessionId, { session: next, events: [...aggregate.events, event] });
        return { status: "saved" as const, session: next };
      } catch {
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    adjustActivePrescription(recordedSessionId: string, expectedVersion: number, operationId: string, occurredAt: string, prescriptionSnapshot: Readonly<Record<string, unknown>>, payload: Readonly<Record<string, unknown>>) {
      try {
        ensureReady();
        const aggregate = readRecord(recordedSessionId);
        if (!aggregate) return { status: "not_found" as const };
        const prior = aggregate.events.find((event) => event.operationId === operationId);
        if (prior) return { status: "duplicate" as const, session: aggregate.session };
        if (aggregate.session.version !== expectedVersion) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
        if (!["started", "paused"].includes(aggregate.session.status)) return { status: "rejected" as const, reason: "active_session_required" };
        const valid = validateCanonicalRecordedSession({ ...aggregate.session, prescriptionSnapshot, prescriptionHash: JSON.stringify(prescriptionSnapshot) });
        if (valid.status !== "valid") return valid;
        const event: CanonicalRecordedSessionEvent = { eventId: `${recordedSessionId}:prescription:${operationId}`, aggregateId: recordedSessionId, expectedVersion, type: "prescription_adjusted", occurredAt, operationId, payload };
        const next = { ...aggregate.session, prescriptionSnapshot, prescriptionHash: JSON.stringify(prescriptionSnapshot), version: expectedVersion + 1 };
        writeVerified(recordedSessionId, { session: next, events: [...aggregate.events, event] });
        return { status: "saved" as const, session: next };
      } catch {
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    get(recordedSessionId: string) {
      ensureReady();
      const value = readRecord(recordedSessionId);
      return value ? { status: "found" as const, session: value.session, events: [...value.events] } : { status: "not_found" as const };
    },
    list(planId: string) { return values().filter((value) => value.session.planId === planId).map((value) => value.session).sort((a, b) => a.recordedSessionId.localeCompare(b.recordedSessionId)); },
    inspectActive() {
      try {
        const sessions = values().map((value) => value.session).filter((session) => session.status === "pending" || session.status === "started" || session.status === "paused").sort((left, right) => left.recordedSessionId.localeCompare(right.recordedSessionId));
        if (sessions.length === 0) return { status: "none" as const, sessions };
        if (sessions.length === 1) return { status: "found" as const, sessions };
        return { status: "invalid" as const, reason: "multiple_active_workouts", sessions };
      } catch {
        return { status: "invalid" as const, reason: "active_workout_storage_read_failed", sessions: [] };
      }
    },
    exportPlan(planId: string) { return values().filter((value) => value.session.planId === planId).sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((value) => ({ session: value.session, events: value.events.slice() })); },
    deleteActive(recordedSessionId: string, expectedVersion: number) {
      try {
        const manifest = ensureReady();
        const aggregate = readRecord(recordedSessionId);
        if (!aggregate) return { status: "not_found" as const };
        if (aggregate.session.version !== expectedVersion) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
        if (!["pending", "started", "paused"].includes(aggregate.session.status)) return { status: "rejected" as const, reason: "historical_session_cannot_be_deleted" };
        storage.remove(recordKey(recordedSessionId));
        updateManifest(manifest.ids.filter((id) => id !== recordedSessionId));
        return { status: "deleted" as const };
      } catch {
        readyManifest = null;
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    restorePlan(records: readonly { session: CanonicalRecordedSession; events: readonly CanonicalRecordedSessionEvent[] }[]) {
      try {
        const manifest = ensureReady();
        const nextIds = [...manifest.ids];
        for (const record of records.slice().sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId))) {
          const candidate = { session: record.session, events: record.events.slice() };
          if (!validRecord(candidate)) return { status: "rejected" as const, reason: "invalid_ledger_record" };
          const existing = readRecord(record.session.recordedSessionId);
          if (existing && JSON.stringify(existing) !== JSON.stringify(candidate)) return { status: "conflict" as const, reason: "ledger_record_conflict" };
          if (!existing) writeVerified(record.session.recordedSessionId, candidate);
          nextIds.push(record.session.recordedSessionId);
        }
        updateManifest(nextIds);
        return { status: "restored" as const };
      } catch {
        readyManifest = null;
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    clear() {
      for (const candidate of storage.keys().filter((candidate) => candidate.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX))) storage.remove(candidate);
      writeManifestVerified({ schemaVersion: 2, legacyImportComplete: true, ids: [] });
    },
  };
}

export const canonicalRecordedSessionLedger = createCanonicalRecordedSessionLedger();
