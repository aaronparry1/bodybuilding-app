import { jsonStore } from "@/data/local/json-store";
import { validateCanonicalMethodOutcome, type CanonicalMethodOutcome } from "@/domain/training/canonical-method-outcome";

const KEY = "iron-logic.canonical-method-outcomes-v1";
type Records = Record<string, unknown>;

export const canonicalMethodOutcomeRepository = {
  saveEffectiveBatch(inputs: readonly CanonicalMethodOutcome[]) {
    const records = jsonStore.get<Records>(KEY, {});
    const next = { ...records };
    let changed = false;
    for (const input of inputs) {
      const validated = validateCanonicalMethodOutcome(input);
      if (validated.status !== "valid") return validated;
      const existing = next[input.outcomeId];
      if (existing && JSON.stringify(existing) === JSON.stringify(input)) continue;
      if (existing) {
        const prior = validateCanonicalMethodOutcome(existing);
        if (prior.status !== "valid" || prior.outcome.evidenceId !== input.evidenceId || prior.outcome.planId !== input.planId || prior.outcome.sessionId !== input.sessionId || prior.outcome.slotId !== input.slotId) return { status: "conflict" as const, reason: "method_outcome_identity_conflict" };
      }
      next[input.outcomeId] = input;
      changed = true;
    }
    if (changed) jsonStore.set(KEY, next);
    return { status: changed ? "saved" as const : "duplicate" as const };
  },
  saveEffective(input: CanonicalMethodOutcome) {
    const validated = validateCanonicalMethodOutcome(input);
    if (validated.status !== "valid") return validated;
    const records = jsonStore.get<Records>(KEY, {});
    const existing = records[input.outcomeId];
    if (existing && JSON.stringify(existing) === JSON.stringify(input)) return { status: "duplicate" as const, outcome: input };
    if (existing) {
      const prior = validateCanonicalMethodOutcome(existing);
      if (prior.status !== "valid" || prior.outcome.evidenceId !== input.evidenceId || prior.outcome.planId !== input.planId || prior.outcome.sessionId !== input.sessionId || prior.outcome.slotId !== input.slotId) return { status: "conflict" as const, reason: "method_outcome_identity_conflict" };
    }
    jsonStore.set(KEY, { ...records, [input.outcomeId]: input });
    return { status: existing ? "replaced" as const : "saved" as const, outcome: input };
  },
  list(planId: string) {
    return Object.values(jsonStore.get<Records>(KEY, {})).flatMap((value) => {
      const validated = validateCanonicalMethodOutcome(value);
      return validated.status === "valid" && validated.outcome.planId === planId ? [validated.outcome] : [];
    }).sort((left, right) => left.observedAt.localeCompare(right.observedAt) || left.outcomeId.localeCompare(right.outcomeId));
  },
  clear() { jsonStore.remove(KEY); },
};
