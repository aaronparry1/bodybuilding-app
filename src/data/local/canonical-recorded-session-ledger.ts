import { jsonStore } from "@/data/local/json-store";
import { getLocalStorageKeys } from "@/data/local/local-storage";
import { allowedRecordedSessionTransition, validateCanonicalRecordedSession, type CanonicalRecordedSession, type CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

export const CANONICAL_LEDGER_LEGACY_KEY = "iron-logic.canonical-recorded-session-ledger-v1";
export const CANONICAL_LEDGER_V2_MANIFEST_KEY = "iron-logic.canonical-recorded-session-ledger-v2.manifest";
export const CANONICAL_LEDGER_V2_RECORD_PREFIX = "iron-logic.canonical-recorded-session-ledger-v2.session.";
export const CANONICAL_LEDGER_V2_PENDING_KEY = "iron-logic.canonical-recorded-session-ledger-v2.pending";

type Aggregate = { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] };
type LegacyStore = Record<string, Aggregate>;
type ManifestEntry = { planId: string; active: boolean };
type Manifest = { schemaVersion: 2; legacyImportComplete: true; ids: string[]; indexVersion?: 1; entries?: Record<string, ManifestEntry> };
type PendingManifestMutation = { operation: "upsert" | "delete"; ids: string[] };

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
  const manifestEntry = (record: Aggregate): ManifestEntry => ({ planId: record.session.planId, active: ["pending", "started", "paused"].includes(record.session.status) });
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
    .sort();
  const normalizeIds = (ids: readonly string[]) => [...new Set(ids)].sort();
  const isManifest = (value: unknown): value is Manifest => Boolean(value && typeof value === "object" && (value as Manifest).schemaVersion === 2 && (value as Manifest).legacyImportComplete === true && Array.isArray((value as Manifest).ids) && (value as Manifest).ids.every((id) => typeof id === "string"));
  const isIndexedManifest = (manifest: Manifest): manifest is Manifest & { indexVersion: 1; entries: Record<string, ManifestEntry> } => manifest.indexVersion === 1 && Boolean(manifest.entries) && manifest.ids.every((id) => {
    const entry = manifest.entries?.[id];
    return Boolean(entry && typeof entry.planId === "string" && typeof entry.active === "boolean");
  });
  const indexedManifest = (records: ReadonlyMap<string, Aggregate>): Manifest => {
    const ids = normalizeIds([...records.keys()]);
    return { schemaVersion: 2, legacyImportComplete: true, ids, indexVersion: 1, entries: Object.fromEntries(ids.map((id) => [id, manifestEntry(records.get(id)!)])) };
  };
  const recoverPending = (manifest: Manifest & { indexVersion: 1; entries: Record<string, ManifestEntry> }): Manifest => {
    const pending = storage.get<PendingManifestMutation | null>(CANONICAL_LEDGER_V2_PENDING_KEY, null);
    if (!pending || !Array.isArray(pending.ids) || !["upsert", "delete"].includes(pending.operation)) return manifest;
    const entries = { ...manifest.entries };
    const ids = new Set(manifest.ids);
    for (const id of pending.ids) {
      const record = readRecord(id);
      if (pending.operation === "upsert" && record) { ids.add(id); entries[id] = manifestEntry(record); }
      else if (pending.operation === "delete" || !record) { ids.delete(id); delete entries[id]; }
    }
    const recovered: Manifest = { ...manifest, ids: normalizeIds([...ids]), entries };
    writeManifestVerified(recovered);
    storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
    return recovered;
  };

  const ensureReady = (): Manifest => {
    if (readyManifest) return readyManifest;
    const storedManifest = storage.get<unknown>(CANONICAL_LEDGER_V2_MANIFEST_KEY, null);
    if (storedManifest !== null && !isManifest(storedManifest)) throw new Error("recorded_session_manifest_invalid");
    if (isManifest(storedManifest)) {
      if (isIndexedManifest(storedManifest)) {
        readyManifest = storedManifest;
        return recoverPending(storedManifest);
      }
      const records = new Map<string, Aggregate>();
      for (const id of normalizeIds([...storedManifest.ids, ...scannedIds()])) {
        const record = readRecord(id);
        if (record) records.set(id, record);
      }
      const upgraded = indexedManifest(records);
      writeManifestVerified(upgraded);
      return upgraded;
    }

    const hasLegacy = storage.keys().includes(CANONICAL_LEDGER_LEGACY_KEY);
    const orphanedIds = scannedIds();
    if (!hasLegacy && orphanedIds.length === 0) {
      readyManifest = { schemaVersion: 2, legacyImportComplete: true, ids: [], indexVersion: 1, entries: {} };
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
    const migratedRecords = new Map<string, Aggregate>();
    for (const id of normalizeIds([...legacyIds, ...orphanedIds])) {
      const record = legacy[id] ?? readRecord(id);
      if (record) migratedRecords.set(id, record);
    }
    const migrated = indexedManifest(migratedRecords);
    writeManifestVerified(migrated);
    return migrated;
  };

  const updateManifest = (manifest: Manifest, ids: readonly string[], entries: Record<string, ManifestEntry>) => writeManifestVerified({ schemaVersion: 2, legacyImportComplete: true, ids: normalizeIds(ids), indexVersion: 1, entries });
  const values = (planId?: string) => {
    const manifest = ensureReady();
    const ids = planId && isIndexedManifest(manifest) ? manifest.ids.filter((id) => manifest.entries[id]?.planId === planId) : manifest.ids;
    return ids.flatMap((id) => {
    const record = readRecord(id);
    if (!record) return [];
    if (!validRecord(record)) throw new Error("recorded_session_storage_invalid");
    return [record];
    });
  };

  return {
    create(session: CanonicalRecordedSession, operationId: string) {
      const valid = validateCanonicalRecordedSession(session);
      if (valid.status !== "valid") return valid;
      try {
        const manifest = ensureReady();
        const existing = readRecord(session.recordedSessionId);
        if (existing) return JSON.stringify(existing.session) === JSON.stringify(session) ? { status: "duplicate" as const, session } : { status: "conflict" as const, reason: "recorded_session_id_conflict" };
        const record = { session, events: [{ eventId: `${session.recordedSessionId}:pending:${operationId}`, aggregateId: session.recordedSessionId, expectedVersion: 0, type: "pending_start" as const, occurredAt: session.createdAt, operationId, payload: {} }] };
        storage.set(CANONICAL_LEDGER_V2_PENDING_KEY, { operation: "upsert", ids: [session.recordedSessionId] } satisfies PendingManifestMutation);
        writeVerified(session.recordedSessionId, record);
        const entries = { ...(manifest.entries ?? {}), [session.recordedSessionId]: manifestEntry(record) };
        updateManifest(manifest, [...manifest.ids, session.recordedSessionId], entries);
        storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
        return { status: "saved" as const, session };
      } catch {
        readyManifest = null;
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    append(recordedSessionId: string, event: CanonicalRecordedSessionEvent) {
      try {
        const manifest = ensureReady();
        const aggregate = readRecord(recordedSessionId);
        if (!aggregate) return { status: "not_found" as const };
        if (event.expectedVersion !== aggregate.session.version) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
        if (!allowedRecordedSessionTransition(aggregate.session.status, event.type)) return { status: "rejected" as const, reason: "invalid_lifecycle_transition" };
        const nextStatus = event.type === "started" || event.type === "resumed" ? "started" : event.type === "paused" ? "paused" : event.type === "completed" ? "completed" : event.type === "historical" ? "historical" : aggregate.session.status;
        const next = { ...aggregate.session, status: nextStatus as CanonicalRecordedSession["status"], version: aggregate.session.version + 1, ...(event.type === "started" ? { startedAt: event.occurredAt } : {}) };
        const nextActive = ["pending", "started", "paused"].includes(next.status);
        const indexChanged = isIndexedManifest(manifest) && manifest.entries[recordedSessionId]?.active !== nextActive;
        if (indexChanged) storage.set(CANONICAL_LEDGER_V2_PENDING_KEY, { operation: "upsert", ids: [recordedSessionId] } satisfies PendingManifestMutation);
        writeVerified(recordedSessionId, { session: next, events: [...aggregate.events, event] });
        if (indexChanged && isIndexedManifest(manifest)) {
          updateManifest(manifest, manifest.ids, { ...manifest.entries, [recordedSessionId]: { planId: next.planId, active: nextActive } });
          storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
        }
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
    list(planId: string) { return values(planId).filter((value) => value.session.planId === planId).map((value) => value.session).sort((a, b) => a.recordedSessionId.localeCompare(b.recordedSessionId)); },
    inspectActive() {
      try {
        const manifest = ensureReady();
        const candidateIds = isIndexedManifest(manifest) ? manifest.ids.filter((id) => manifest.entries[id]?.active) : manifest.ids;
        const sessions = candidateIds.flatMap((id) => {
          const record = readRecord(id);
          return record ? [record.session] : [];
        }).filter((session) => session.status === "pending" || session.status === "started" || session.status === "paused").sort((left, right) => left.recordedSessionId.localeCompare(right.recordedSessionId));
        if (sessions.length === 0) return { status: "none" as const, sessions };
        if (sessions.length === 1) return { status: "found" as const, sessions };
        return { status: "invalid" as const, reason: "multiple_active_workouts", sessions };
      } catch {
        return { status: "invalid" as const, reason: "active_workout_storage_read_failed", sessions: [] };
      }
    },
    exportPlan(planId: string) { return values(planId).filter((value) => value.session.planId === planId).sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((value) => ({ session: value.session, events: value.events.slice() })); },
    async exportPlanAsync(planId: string, batchSize = 50) {
      const manifest = ensureReady();
      const ids = isIndexedManifest(manifest) ? manifest.ids.filter((id) => manifest.entries[id]?.planId === planId) : manifest.ids;
      const records: Aggregate[] = [];
      for (let index = 0; index < ids.length; index += 1) {
        const record = readRecord(ids[index]!);
        if (record) {
          if (!validRecord(record)) throw new Error("recorded_session_storage_invalid");
          if (record.session.planId === planId) records.push(record);
        }
        if ((index + 1) % Math.max(1, batchSize) === 0) await yieldToEventLoop();
      }
      return records.sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((value) => ({ session: value.session, events: value.events.slice() }));
    },
    deleteActive(recordedSessionId: string, expectedVersion: number) {
      try {
        const manifest = ensureReady();
        const aggregate = readRecord(recordedSessionId);
        if (!aggregate) return { status: "not_found" as const };
        if (aggregate.session.version !== expectedVersion) return { status: "stale" as const, reason: "aggregate_version_mismatch" };
        if (!["pending", "started", "paused"].includes(aggregate.session.status)) return { status: "rejected" as const, reason: "historical_session_cannot_be_deleted" };
        storage.set(CANONICAL_LEDGER_V2_PENDING_KEY, { operation: "delete", ids: [recordedSessionId] } satisfies PendingManifestMutation);
        storage.remove(recordKey(recordedSessionId));
        const entries = { ...(manifest.entries ?? {}) }; delete entries[recordedSessionId];
        updateManifest(manifest, manifest.ids.filter((id) => id !== recordedSessionId), entries);
        storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
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
        const entries = { ...(manifest.entries ?? {}) };
        const candidates = records.slice().sort((a, b) => a.session.recordedSessionId.localeCompare(b.session.recordedSessionId)).map((record) => ({ session: record.session, events: record.events.slice() }));
        for (const candidate of candidates) {
          if (!validRecord(candidate)) return { status: "rejected" as const, reason: "invalid_ledger_record" };
          const existing = readRecord(candidate.session.recordedSessionId);
          if (existing && JSON.stringify(existing) !== JSON.stringify(candidate)) return { status: "conflict" as const, reason: "ledger_record_conflict" };
        }
        storage.set(CANONICAL_LEDGER_V2_PENDING_KEY, { operation: "upsert", ids: candidates.map((record) => record.session.recordedSessionId) } satisfies PendingManifestMutation);
        for (const candidate of candidates) {
          if (!readRecord(candidate.session.recordedSessionId)) writeVerified(candidate.session.recordedSessionId, candidate);
          nextIds.push(candidate.session.recordedSessionId);
          entries[candidate.session.recordedSessionId] = manifestEntry(candidate);
        }
        updateManifest(manifest, nextIds, entries);
        storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
        return { status: "restored" as const };
      } catch {
        readyManifest = null;
        return { status: "storage_failure" as const, reason: "recorded_session_storage_write_failed" };
      }
    },
    clear() {
      for (const candidate of storage.keys().filter((candidate) => candidate.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX))) storage.remove(candidate);
      storage.remove(CANONICAL_LEDGER_V2_PENDING_KEY);
      writeManifestVerified({ schemaVersion: 2, legacyImportComplete: true, ids: [], indexVersion: 1, entries: {} });
    },
  };
}

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export const canonicalRecordedSessionLedger = createCanonicalRecordedSessionLedger();
