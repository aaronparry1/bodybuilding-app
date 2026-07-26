import { jsonStore } from "@/data/local/json-store";
import {
  validateCanonicalCoachingApplicationIntent,
  type CanonicalCoachingApplicationIntent,
} from "@/domain/training/canonical-coaching-application-intent";

const key = "iron-logic.canonical-coaching-application-intents-v1";

export const canonicalCoachingApplicationIntentRepository = {
  save(intent: CanonicalCoachingApplicationIntent) {
    if (!validateCanonicalCoachingApplicationIntent(intent)) return { status: "invalid" as const, reason: "invalid_application_intent" };
    const all = jsonStore.get<Record<string, CanonicalCoachingApplicationIntent>>(key, {});
    const existing = all[intent.decisionId];
    if (existing && existing.status !== intent.status) {
      if (JSON.stringify(immutableIntent(existing)) !== JSON.stringify(immutableIntent(intent))) {
        return { status: "conflict" as const, reason: "application_intent_identity_conflict" };
      }
      const next = { ...existing, status: intent.status, terminalReason: intent.terminalReason, resolvedAt: intent.resolvedAt };
      jsonStore.set(key, { ...all, [intent.decisionId]: next });
      return { status: "saved" as const, intent: next };
    }
    if (existing) {
      return JSON.stringify(existing) === JSON.stringify(intent)
        ? { status: "duplicate" as const, intent: existing }
        : { status: "conflict" as const, reason: "application_intent_identity_conflict" };
    }
    jsonStore.set(key, { ...all, [intent.decisionId]: intent });
    return { status: "saved" as const, intent };
  },
  get(decisionId: string) {
    const value = jsonStore.get<Record<string, unknown>>(key, {})[decisionId];
    return validateCanonicalCoachingApplicationIntent(value)
      ? { status: "found" as const, intent: value }
      : value
        ? { status: "invalid" as const, reason: "invalid_application_intent" }
        : { status: "not_found" as const };
  },
  remove(decisionId: string) {
    const all = jsonStore.get<Record<string, CanonicalCoachingApplicationIntent>>(key, {});
    if (!all[decisionId]) return { status: "not_found" as const };
    const { [decisionId]: _removed, ...remaining } = all;
    jsonStore.set(key, remaining);
    return { status: "removed" as const };
  },
  clear() { jsonStore.remove(key); },
};

function immutableIntent(intent: CanonicalCoachingApplicationIntent): Omit<CanonicalCoachingApplicationIntent, "status" | "terminalReason" | "resolvedAt"> {
  const { status: _status, terminalReason: _terminalReason, resolvedAt: _resolvedAt, ...immutable } = intent;
  return immutable;
}
