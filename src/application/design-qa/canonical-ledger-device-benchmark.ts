import {
  CANONICAL_LEDGER_LEGACY_KEY,
  CANONICAL_LEDGER_V2_PENDING_KEY,
  CANONICAL_LEDGER_V2_MANIFEST_KEY,
  CANONICAL_LEDGER_V2_RECORD_PREFIX,
  createCanonicalRecordedSessionLedger,
} from "@/data/local/canonical-recorded-session-ledger";
import { jsonStore } from "@/data/local/json-store";
import { getLocalStorage, getLocalStorageKeys } from "@/data/local/local-storage";
import type { CanonicalRecordedSession, CanonicalRecordedSessionEvent } from "@/domain/training/canonical-recorded-session-ledger";

const HISTORY_COUNT = 2_500;
const ACTIVE_ID = "device-ledger-benchmark-active";
const PLAN_ID = "device-ledger-benchmark-plan";

type Aggregate = { session: CanonicalRecordedSession; events: CanonicalRecordedSessionEvent[] };
type LegacyStore = Record<string, Aggregate>;

export type CanonicalLedgerDeviceBenchmarkResult = Readonly<{
  deviceStorage: "expo-sqlite/kv-store";
  historySessions: number;
  eventsSeeded: number;
  legacyPayloadBytes: number;
  legacyInspectActiveMs: number;
  legacyAppendMs: number;
  migrationMs: number;
  migratedSessions: number;
  v2ColdInspectActiveMs: number;
  v2ExportPlanMs: number;
  v2AppendMs: number;
  readSpeedup: number;
  speedup: number;
  v2RecordBytes: number;
  completedAt: string;
}>;

export function runCanonicalLedgerDeviceBenchmark(): CanonicalLedgerDeviceBenchmarkResult {
  clearBenchmarkData();
  const legacy = buildLegacyStore();
  const serializedLegacy = JSON.stringify(legacy);
  jsonStore.set(CANONICAL_LEDGER_LEGACY_KEY, legacy);

  jsonStore.resetCache();
  const legacyInspectStarted = now();
  const legacyActive = inspectActiveUsingLegacyWholeLedgerRead();
  const legacyInspectActiveMs = now() - legacyInspectStarted;
  if (legacyActive !== ACTIVE_ID) throw new Error("benchmark_legacy_active_inspection_failed");

  const legacyAppendStarted = now();
  appendUsingLegacyWholeLedgerWrite();
  const legacyAppendMs = now() - legacyAppendStarted;

  // Restore the identical seed so the migration and V2 write start from the
  // same history and active-session version as the legacy measurement.
  jsonStore.set(CANONICAL_LEDGER_LEGACY_KEY, legacy);
  const migrationStarted = now();
  const ledger = createCanonicalRecordedSessionLedger();
  const migratedSessions = ledger.exportPlan(PLAN_ID).length;
  const migrationMs = now() - migrationStarted;

  jsonStore.resetCache();
  const coldLedger = createCanonicalRecordedSessionLedger();
  const v2InspectStarted = now();
  const inspected = coldLedger.inspectActive();
  const v2ColdInspectActiveMs = now() - v2InspectStarted;
  if (inspected.status !== "found" || inspected.sessions[0]?.recordedSessionId !== ACTIVE_ID) throw new Error("benchmark_v2_active_inspection_failed");

  const exportStarted = now();
  const exportedSessions = coldLedger.exportPlan(PLAN_ID).length;
  const v2ExportPlanMs = now() - exportStarted;
  if (exportedSessions !== migratedSessions) throw new Error("benchmark_v2_export_mismatch");

  const active = coldLedger.get(ACTIVE_ID);
  if (active.status !== "found") throw new Error("benchmark_active_session_missing");
  const v2AppendStarted = now();
  const saved = coldLedger.append(ACTIVE_ID, performanceEvent(active.session.version, "v2"));
  const v2AppendMs = now() - v2AppendStarted;
  if (saved.status !== "saved") throw new Error(`benchmark_v2_append_${saved.status}`);

  const v2Key = `${CANONICAL_LEDGER_V2_RECORD_PREFIX}${encodeURIComponent(ACTIVE_ID)}`;
  const v2RecordBytes = getLocalStorage().getItem(v2Key)?.length ?? 0;
  return {
    deviceStorage: "expo-sqlite/kv-store",
    historySessions: HISTORY_COUNT,
    eventsSeeded: Object.values(legacy).reduce((total, record) => total + record.events.length, 0),
    legacyPayloadBytes: serializedLegacy.length,
    legacyInspectActiveMs,
    legacyAppendMs,
    migrationMs,
    migratedSessions,
    v2ColdInspectActiveMs,
    v2ExportPlanMs,
    v2AppendMs,
    readSpeedup: v2ColdInspectActiveMs > 0 ? legacyInspectActiveMs / v2ColdInspectActiveMs : Number.POSITIVE_INFINITY,
    speedup: v2AppendMs > 0 ? legacyAppendMs / v2AppendMs : Number.POSITIVE_INFINITY,
    v2RecordBytes,
    completedAt: new Date().toISOString(),
  };
}

function clearBenchmarkData() {
  const storage = getLocalStorage();
  for (const key of getLocalStorageKeys()) {
    if (key === CANONICAL_LEDGER_LEGACY_KEY || key === CANONICAL_LEDGER_V2_MANIFEST_KEY || key === CANONICAL_LEDGER_V2_PENDING_KEY || key.startsWith(CANONICAL_LEDGER_V2_RECORD_PREFIX)) storage.removeItem(key);
  }
  jsonStore.resetCache();
}

function inspectActiveUsingLegacyWholeLedgerRead(): string | null {
  const legacy = jsonStore.get<LegacyStore>(CANONICAL_LEDGER_LEGACY_KEY, {});
  return Object.values(legacy).find((record) => ["pending", "started", "paused"].includes(record.session.status))?.session.recordedSessionId ?? null;
}

function appendUsingLegacyWholeLedgerWrite() {
  const legacy = jsonStore.get<LegacyStore>(CANONICAL_LEDGER_LEGACY_KEY, {});
  const aggregate = legacy[ACTIVE_ID];
  if (!aggregate) throw new Error("benchmark_legacy_active_session_missing");
  const event = performanceEvent(aggregate.session.version, "legacy");
  jsonStore.set(CANONICAL_LEDGER_LEGACY_KEY, {
    ...legacy,
    [ACTIVE_ID]: {
      session: { ...aggregate.session, version: aggregate.session.version + 1 },
      events: [...aggregate.events, event],
    },
  });
}

function buildLegacyStore(): LegacyStore {
  const records = Array.from({ length: HISTORY_COUNT }, (_, index) => {
    const id = `legacy-${String(index + 1).padStart(5, "0")}`;
    return [id, completedAggregate(id, index)] as const;
  });
  records.push([ACTIVE_ID, activeAggregate()] as const);
  return Object.fromEntries(records);
}

function completedAggregate(id: string, index: number): Aggregate {
  const createdAt = new Date(Date.UTC(2022 + Math.floor(index / 600), index % 12, (index % 27) + 1, 7, index % 60)).toISOString();
  const events: CanonicalRecordedSessionEvent[] = [
    event(id, 0, "pending_start", createdAt, {}),
    event(id, 0, "started", createdAt, {}),
    ...Array.from({ length: 7 }, (_, setIndex) => event(id, setIndex + 1, "performance", createdAt, {
      exerciseId: ["back-squat", "bench-press", "deadlift", "barbell-row"][setIndex % 4],
      setIndex,
      reps: 5 + (setIndex % 6),
      loadKg: 45 + ((index + setIndex) % 28) * 2.5,
    })),
    event(id, 8, "completed", createdAt, { durationMinutes: 52 + (index % 24) }),
  ];
  return { session: session(id, "completed", events.length, createdAt), events };
}

function activeAggregate(): Aggregate {
  const createdAt = new Date().toISOString();
  return {
    session: session(ACTIVE_ID, "started", 1, createdAt),
    events: [event(ACTIVE_ID, 0, "pending_start", createdAt, {}), event(ACTIVE_ID, 0, "started", createdAt, {})],
  };
}

function session(id: string, status: CanonicalRecordedSession["status"], version: number, createdAt: string): CanonicalRecordedSession {
  return {
    schemaVersion: "canonical_recorded_session_v1",
    recordedSessionId: id,
    plannedSessionId: `planned-${id}`,
    planId: PLAN_ID,
    startRevision: 1,
    macrocycleId: "benchmark-macrocycle",
    mesocycleId: "benchmark-mesocycle",
    microcycleId: `benchmark-week-${(version % 8) + 1}`,
    role: "Strength and hypertrophy",
    prescriptionSnapshot: {
      schemaVersion: "canonical_session_snapshot_v2",
      sessionId: `planned-${id}`,
      role: "Strength and hypertrophy",
      slots: [
        { id: "squat", index: 0, exerciseId: "back-squat", lane: "strength", method: "straight_sets", settings: { sets: 4, reps: 6 }, rest: { seconds: 180 }, progression: {}, stopRule: {}, loadingMode: "guided", substitutionConstraints: [], reason: "Primary squat pattern" },
        { id: "bench", index: 1, exerciseId: "bench-press", lane: "hypertrophy", method: "straight_sets", settings: { sets: 3, reps: 10 }, rest: { seconds: 120 }, progression: {}, stopRule: {}, loadingMode: "guided", substitutionConstraints: [], reason: "Horizontal press volume" },
      ],
      provenance: { source: "device_ledger_benchmark" },
    },
    prescriptionHash: `benchmark-hash-${id}`,
    provenance: { constructionVersion: "v2", source: "synthetic_real_device_benchmark" },
    athleteId: "ledger-benchmark-athlete",
    version,
    status,
    createdAt,
    ...(status !== "pending" ? { startedAt: createdAt } : {}),
  };
}

function performanceEvent(expectedVersion: number, suffix: string): CanonicalRecordedSessionEvent {
  return event(ACTIVE_ID, expectedVersion, "performance", new Date().toISOString(), { exerciseId: "bench-press", setIndex: expectedVersion, reps: 8, loadKg: 80, source: suffix });
}

function event(id: string, expectedVersion: number, type: CanonicalRecordedSessionEvent["type"], occurredAt: string, payload: Readonly<Record<string, unknown>>): CanonicalRecordedSessionEvent {
  const operationId = `${id}:${type}:${expectedVersion}:${Object.keys(payload).join("-")}`;
  return { eventId: operationId, aggregateId: id, expectedVersion, type, occurredAt, operationId, payload };
}

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}
