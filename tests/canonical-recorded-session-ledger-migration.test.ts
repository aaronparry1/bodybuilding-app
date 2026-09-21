import { describe, expect, it } from "vitest";
import {
  CANONICAL_LEDGER_LEGACY_KEY,
  CANONICAL_LEDGER_V2_MANIFEST_KEY,
  CANONICAL_LEDGER_V2_RECORD_PREFIX,
  createCanonicalRecordedSessionLedger,
  type CanonicalLedgerStorage,
} from "@/data/local/canonical-recorded-session-ledger";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

type Aggregate = { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] };

class MemoryStorage implements CanonicalLedgerStorage {
  readonly values = new Map<string, unknown>();
  readonly writes: string[] = [];
  readonly reads: string[] = [];
  failSet: ((key: string, count: number) => boolean) | null = null;
  truncateReadKey: string | null = null;
  private setCount = 0;

  get<T>(key: string, fallback: T): T {
    this.reads.push(key);
    const value = this.values.has(key) ? this.values.get(key) : fallback;
    if (key === this.truncateReadKey && value && typeof value === "object") return { broken: true } as T;
    return structuredClone(value) as T;
  }
  set<T>(key: string, value: T): void {
    this.setCount += 1;
    this.values.set(key, structuredClone(value));
    this.writes.push(key);
    if (this.failSet?.(key, this.setCount)) throw new Error("injected_write_failure");
  }
  remove(key: string): void { this.values.delete(key); }
  keys(): string[] { return [...this.values.keys()]; }
}

describe("canonical recorded-session per-session migration", () => {
  it("copies, validates and commits legacy history without deleting the recovery source", () => {
    const storage = legacyStorage([aggregate("r1"), aggregate("r2")]);
    const ledger = createCanonicalRecordedSessionLedger(storage);

    expect(ledger.exportPlan("plan").map((record) => record.session.recordedSessionId)).toEqual(["r1", "r2"]);
    expect(storage.values.has(CANONICAL_LEDGER_LEGACY_KEY)).toBe(true);
    expect(storage.values.get(CANONICAL_LEDGER_V2_MANIFEST_KEY)).toMatchObject({ schemaVersion: 2, legacyImportComplete: true, ids: ["r1", "r2"], indexVersion: 1 });
    expect(storage.values.has(key("r1"))).toBe(true);
    expect(storage.values.has(key("r2"))).toBe(true);
  });

  it("resumes safely when migration is interrupted after any individual record write", () => {
    const storage = legacyStorage([aggregate("r1"), aggregate("r2"), aggregate("r3")]);
    storage.failSet = (candidate, count) => candidate.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX) && count === 2;
    expect(() => createCanonicalRecordedSessionLedger(storage).exportPlan("plan")).toThrow("injected_write_failure");
    expect(storage.values.has(CANONICAL_LEDGER_LEGACY_KEY)).toBe(true);

    storage.failSet = null;
    const resumed = createCanonicalRecordedSessionLedger(storage);
    expect(resumed.exportPlan("plan")).toHaveLength(3);
    expect(storage.values.get(CANONICAL_LEDGER_V2_MANIFEST_KEY)).toMatchObject({ schemaVersion: 2, legacyImportComplete: true, ids: ["r1", "r2", "r3"], indexVersion: 1 });
  });

  it("rejects a failed read-back and remains retryable from the untouched legacy value", () => {
    const storage = legacyStorage([aggregate("r1")]);
    storage.truncateReadKey = key("r1");
    expect(() => createCanonicalRecordedSessionLedger(storage).exportPlan("plan")).toThrow("recorded_session_storage_verification_failed");
    expect(storage.values.has(CANONICAL_LEDGER_LEGACY_KEY)).toBe(true);

    storage.truncateReadKey = null;
    expect(createCanonicalRecordedSessionLedger(storage).exportPlan("plan")).toHaveLength(1);
  });

  it("fails closed for corrupt legacy data and conflicting mixed-format data", () => {
    const corrupt = legacyStorage([aggregate("r1")]);
    const corruptLegacy = corrupt.values.get(CANONICAL_LEDGER_LEGACY_KEY) as Record<string, Aggregate>;
    corrupt.values.set(CANONICAL_LEDGER_LEGACY_KEY, {
      ...corruptLegacy,
      r1: {
        ...corruptLegacy.r1,
        events: corruptLegacy.r1.events.map((event, index) => index === 0 ? { ...event, aggregateId: "wrong" } : event),
      },
    });
    expect(() => createCanonicalRecordedSessionLedger(corrupt).exportPlan("plan")).toThrow("legacy_recorded_session_migration_invalid");
    expect(corrupt.values.has(CANONICAL_LEDGER_V2_MANIFEST_KEY)).toBe(false);

    const mixed = legacyStorage([aggregate("r1")]);
    mixed.values.set(key("r1"), aggregate("r1", { status: "started", version: 1 }));
    expect(() => createCanonicalRecordedSessionLedger(mixed).exportPlan("plan")).toThrow("legacy_recorded_session_migration_conflict");
  });

  it("recovers an orphaned session record when the manifest update was interrupted", () => {
    const storage = new MemoryStorage();
    const first = createCanonicalRecordedSessionLedger(storage);
    expect(first.exportPlan("plan")).toEqual([]);
    storage.failSet = (candidate) => candidate === CANONICAL_LEDGER_V2_MANIFEST_KEY;
    expect(first.create(session("new-session"), "create")).toMatchObject({ status: "storage_failure" });
    expect(storage.values.has(key("new-session"))).toBe(true);

    storage.failSet = null;
    const recovered = createCanonicalRecordedSessionLedger(storage);
    expect(recovered.get("new-session")).toMatchObject({ status: "found", session: { recordedSessionId: "new-session" } });
  });

  it("does not resurrect retained legacy history after an intentional clear", () => {
    const storage = legacyStorage([aggregate("r1")]);
    const ledger = createCanonicalRecordedSessionLedger(storage);
    expect(ledger.exportPlan("plan")).toHaveLength(1);
    ledger.clear();

    expect(storage.values.has(CANONICAL_LEDGER_LEGACY_KEY)).toBe(true);
    expect(createCanonicalRecordedSessionLedger(storage).exportPlan("plan")).toEqual([]);
  });

  it("rewrites only the active session record on a set append, regardless of history size", () => {
    const history = Array.from({ length: 200 }, (_, index) => aggregate(`history-${String(index).padStart(3, "0")}`, { status: "completed", version: 1 }));
    const active = aggregate("active");
    const storage = legacyStorage([...history, active]);
    const ledger = createCanonicalRecordedSessionLedger(storage);
    expect(ledger.exportPlan("plan")).toHaveLength(201);
    storage.writes.length = 0;

    expect(ledger.append("active", event("active", 0, "started")).status).toBe("saved");
    expect(storage.writes).toEqual([key("active")]);
    expect(JSON.stringify(storage.values.get(key("active")))).not.toContain("history-199");
  });

  it("uses the indexed manifest to inspect the active workout without reading historical records on cold startup", () => {
    const history = Array.from({ length: 2_500 }, (_, index) => aggregate(`history-${String(index).padStart(4, "0")}`, { status: "completed", version: 1 }));
    const active = aggregate("active", { status: "started", version: 1 });
    const storage = legacyStorage([...history, active]);
    expect(createCanonicalRecordedSessionLedger(storage).inspectActive()).toMatchObject({ status: "found", sessions: [{ recordedSessionId: "active" }] });

    storage.reads.length = 0;
    const cold = createCanonicalRecordedSessionLedger(storage).inspectActive();

    expect(cold).toMatchObject({ status: "found", sessions: [{ recordedSessionId: "active" }] });
    expect(storage.reads.filter((candidate) => candidate.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX))).toEqual([key("active")]);
  });
});

function legacyStorage(records: Aggregate[]): MemoryStorage {
  const storage = new MemoryStorage();
  storage.values.set(CANONICAL_LEDGER_LEGACY_KEY, Object.fromEntries(records.map((record) => [record.session.recordedSessionId, record])));
  return storage;
}

function key(id: string): string { return `${CANONICAL_LEDGER_V2_RECORD_PREFIX}${encodeURIComponent(id)}`; }

function aggregate(id: string, overrides: Partial<CanonicalRecordedSession> = {}): Aggregate {
  const value = session(id, overrides);
  return { session: value, events: [event(id, 0, "pending_start")] };
}

function event(id: string, expectedVersion: number, type: CanonicalRecordedSessionEvent["type"]): CanonicalRecordedSessionEvent {
  return { eventId: `${id}:${type}`, aggregateId: id, expectedVersion, type, occurredAt: "2026-01-01T00:00:00.000Z", operationId: `${id}:${type}`, payload: {} };
}

function session(id: string, overrides: Partial<CanonicalRecordedSession> = {}): CanonicalRecordedSession {
  return {
    schemaVersion: "canonical_recorded_session_v1",
    recordedSessionId: id,
    plannedSessionId: `planned-${id}`,
    planId: "plan",
    startRevision: 1,
    macrocycleId: "macro",
    mesocycleId: "meso",
    microcycleId: "micro",
    role: "Full body 1",
    prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v2", sessionId: `planned-${id}`, role: "Full body 1", slots: [{ id: "slot", index: 0, exerciseId: "ex", lane: "hypertrophy", method: "straight_sets", settings: {}, rest: {}, progression: {}, stopRule: {}, loadingMode: "guided", substitutionConstraints: [], reason: "test" }], provenance: {} },
    prescriptionHash: "hash",
    provenance: { constructionVersion: "v2" },
    athleteId: "athlete",
    version: 0,
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}
