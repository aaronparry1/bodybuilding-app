import { jsonStore } from "@/data/local/json-store";
import { validateCanonicalProgressDecision, type CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
const key = "iron-logic.canonical-progress-decisions-v1";
export const canonicalProgressDecisionRepository = {
  save(decision: CanonicalProgressDecision) {
    const validated = validateCanonicalProgressDecision(decision);
    if (validated.status !== "valid") return validated;
    const all = jsonStore.get<Record<string, unknown>>(key, {});
    const existing = all[decision.decisionId];
    if (existing) {
      const prior = validateCanonicalProgressDecision(existing);
      return prior.status === "valid" && JSON.stringify(prior.decision) === JSON.stringify(validated.decision) ? { status: "duplicate" as const, decision: prior.decision } : { status: "conflict" as const, reason: "decision_id_conflict" };
    }
    jsonStore.set(key, { ...all, [decision.decisionId]: validated.decision });
    return { status: "saved" as const, decision: validated.decision };
  },
  get(decisionId: string) { const value = jsonStore.get<Record<string, unknown>>(key, {})[decisionId]; if (!value) return { status: "not_found" as const }; const result = validateCanonicalProgressDecision(value); return result.status === "valid" ? { status: "found" as const, decision: result.decision } : { status: "invalid" as const, reason: result.reason }; },
  current(planId: string, mesocycleId: string) { return Object.values(jsonStore.get<Record<string, unknown>>(key, {})).map((value) => validateCanonicalProgressDecision(value)).filter((result): result is { status: "valid"; decision: CanonicalProgressDecision } => result.status === "valid" && result.decision.planId === planId && result.decision.mesocycleId === mesocycleId && result.decision.status === "current").map((result) => result.decision).sort((a, b) => a.decisionId.localeCompare(b.decisionId)); },
  clear() { jsonStore.remove(key); },
};
