import { jsonStore } from "@/data/local/json-store";
import { CANONICAL_SUPERSET_ADAPTATION_SCHEMA, type CanonicalSupersetShadowDecision } from "@/domain/training/canonical-antagonist-superset-adaptation";

const KEY = "iron-logic.canonical-superset-shadow-decisions-v1";
type Records = Record<string, CanonicalSupersetShadowDecision>;

export const canonicalSupersetShadowDecisionRepository = {
  record(decision: CanonicalSupersetShadowDecision) {
    if (decision.schemaVersion !== CANONICAL_SUPERSET_ADAPTATION_SCHEMA || decision.decisionAuthority !== "shadow_only" || decision.eligibleForProductionApplication !== false) return { status: "invalid" as const, reason: "uncertified_superset_decision_authority" };
    const records = jsonStore.get<Records>(KEY, {});
    const existing = records[decision.decisionId];
    if (existing) return JSON.stringify(existing) === JSON.stringify(decision) ? { status: "duplicate" as const, decision: existing } : { status: "conflict" as const, reason: "superset_decision_id_conflict" };
    jsonStore.set(KEY, { ...records, [decision.decisionId]: decision });
    return { status: "saved" as const, decision };
  },
  list(planId: string) { return Object.values(jsonStore.get<Records>(KEY, {})).filter((item) => item.planId === planId); },
  clear() { jsonStore.remove(KEY); },
};
