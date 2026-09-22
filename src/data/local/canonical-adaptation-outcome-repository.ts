import { jsonStore } from "@/data/local/json-store";
import { validateCanonicalAdaptationOutcome, type CanonicalAdaptationOutcome } from "@/domain/training/canonical-adaptation-outcome";

const key = "iron-logic.canonical-adaptation-outcomes-v1";

export const canonicalAdaptationOutcomeRepository = {
  saveBatch(outcomes: readonly CanonicalAdaptationOutcome[]) {
    const all = jsonStore.get<Record<string, unknown>>(key, {});
    const next = { ...all };
    let changed = false;
    for (const outcome of outcomes) {
      if (!validateCanonicalAdaptationOutcome(outcome)) return { status: "invalid" as const };
      const existing = next[outcome.decisionId];
      if (existing && JSON.stringify(existing) !== JSON.stringify(outcome)) return { status: "conflict" as const };
      if (!existing) { next[outcome.decisionId] = outcome; changed = true; }
    }
    if (changed) jsonStore.set(key, next);
    return { status: changed ? "saved" as const : "duplicate" as const };
  },
  save(outcome: CanonicalAdaptationOutcome) {
    if (!validateCanonicalAdaptationOutcome(outcome)) return { status: "invalid" as const };
    const all = jsonStore.get<Record<string, unknown>>(key, {});
    const existing = all[outcome.decisionId];
    if (existing) return JSON.stringify(existing) === JSON.stringify(outcome)
      ? { status: "duplicate" as const, outcome }
      : { status: "conflict" as const };
    jsonStore.set(key, { ...all, [outcome.decisionId]: outcome });
    return { status: "saved" as const, outcome };
  },
  get(decisionId: string) {
    const value = jsonStore.get<Record<string, unknown>>(key, {})[decisionId];
    return validateCanonicalAdaptationOutcome(value) ? { status: "found" as const, outcome: value } : { status: "not_found" as const };
  },
  list(planId: string) {
    return Object.values(jsonStore.get<Record<string, unknown>>(key, {}))
      .filter(validateCanonicalAdaptationOutcome)
      .filter((outcome) => outcome.planId === planId)
      .sort((left, right) => left.evaluatedAt.localeCompare(right.evaluatedAt));
  },
  clear() { jsonStore.remove(key); },
};
