import { jsonStore } from "@/data/local/json-store";
import type {
  CanonicalRecordedSession,
  CanonicalRecordedSessionEvent,
} from "@/domain/training/canonical-recorded-session-ledger";

const key = "iron-logic.canonical-workout-discard-intents-v1";

export type CanonicalWorkoutDiscardIntent = Readonly<{
  schemaVersion: "canonical_workout_discard_intent_v1";
  operationId: string;
  planId: string;
  recordedSessionId: string;
  plannedSessionId: string;
  expectedPlanRevision: number;
  expectedLedgerVersion: number;
  occurredAt: string;
  provenance: string;
  aggregate: Readonly<{
    session: CanonicalRecordedSession;
    events: readonly CanonicalRecordedSessionEvent[];
  }>;
}>;

type Store = Record<string, CanonicalWorkoutDiscardIntent>;

export const canonicalWorkoutDiscardIntentRepository = {
  save(intent: CanonicalWorkoutDiscardIntent) {
    if (!validIntent(intent)) {
      return { status: "invalid" as const, reason: "invalid_discard_intent" };
    }
    const store = jsonStore.get<Store>(key, {});
    const existing = store[intent.recordedSessionId];
    if (existing) {
      return immutableIdentity(existing) === immutableIdentity(intent)
        ? { status: "duplicate" as const, intent: existing }
        : { status: "conflict" as const, reason: "discard_intent_identity_conflict" };
    }
    jsonStore.set(key, { ...store, [intent.recordedSessionId]: intent });
    return { status: "saved" as const, intent };
  },

  get(recordedSessionId: string) {
    const intent = jsonStore.get<Store>(key, {})[recordedSessionId];
    return intent
      ? validIntent(intent)
        ? { status: "found" as const, intent }
        : { status: "invalid" as const, reason: "invalid_discard_intent" }
      : { status: "not_found" as const };
  },

  list() {
    return Object.values(jsonStore.get<Store>(key, {}))
      .filter(validIntent)
      .sort((left, right) =>
        left.occurredAt.localeCompare(right.occurredAt)
        || left.recordedSessionId.localeCompare(right.recordedSessionId));
  },

  remove(recordedSessionId: string) {
    const store = jsonStore.get<Store>(key, {});
    if (!store[recordedSessionId]) return { status: "not_found" as const };
    const { [recordedSessionId]: _removed, ...remaining } = store;
    jsonStore.set(key, remaining);
    return { status: "removed" as const };
  },

  clear() {
    jsonStore.remove(key);
  },
};

function immutableIdentity(intent: CanonicalWorkoutDiscardIntent): string {
  return JSON.stringify({
    planId: intent.planId,
    recordedSessionId: intent.recordedSessionId,
    plannedSessionId: intent.plannedSessionId,
    expectedPlanRevision: intent.expectedPlanRevision,
    expectedLedgerVersion: intent.expectedLedgerVersion,
    aggregate: intent.aggregate,
  });
}

function validIntent(value: unknown): value is CanonicalWorkoutDiscardIntent {
  if (!value || typeof value !== "object") return false;
  const intent = value as Partial<CanonicalWorkoutDiscardIntent>;
  return intent.schemaVersion === "canonical_workout_discard_intent_v1"
    && typeof intent.operationId === "string"
    && Boolean(intent.operationId)
    && typeof intent.planId === "string"
    && Boolean(intent.planId)
    && typeof intent.recordedSessionId === "string"
    && Boolean(intent.recordedSessionId)
    && typeof intent.plannedSessionId === "string"
    && Boolean(intent.plannedSessionId)
    && Number.isInteger(intent.expectedPlanRevision)
    && Number(intent.expectedPlanRevision) >= 0
    && Number.isInteger(intent.expectedLedgerVersion)
    && Number(intent.expectedLedgerVersion) >= 0
    && typeof intent.occurredAt === "string"
    && typeof intent.provenance === "string"
    && Boolean(intent.aggregate)
    && intent.aggregate?.session.recordedSessionId === intent.recordedSessionId
    && intent.aggregate.session.plannedSessionId === intent.plannedSessionId
    && intent.aggregate.session.planId === intent.planId
    && intent.aggregate.session.version === intent.expectedLedgerVersion
    && intent.aggregate.events.every((event) => event.aggregateId === intent.recordedSessionId);
}
