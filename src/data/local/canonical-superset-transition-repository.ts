import { jsonStore } from "@/data/local/json-store";
import type { CanonicalSupersetTransitionDecision } from "@/domain/training/canonical-superset-transition";
const KEY = "iron-logic.canonical-superset-transitions-v1";
export const canonicalSupersetTransitionRepository = {
  record(decision: CanonicalSupersetTransitionDecision) { const all = jsonStore.get<Record<string, CanonicalSupersetTransitionDecision>>(KEY, {}); const existing = all[decision.transitionDecisionId]; if (existing) return JSON.stringify(existing) === JSON.stringify(decision) ? { status: "duplicate" as const, decision: existing } : { status: "conflict" as const }; jsonStore.set(KEY, { ...all, [decision.transitionDecisionId]: decision }); return { status: "saved" as const, decision }; },
  list(sourceDecisionId: string) { return Object.values(jsonStore.get<Record<string, CanonicalSupersetTransitionDecision>>(KEY, {})).filter((item) => item.sourceDecisionId === sourceDecisionId); },
  clear() { jsonStore.remove(KEY); },
};
