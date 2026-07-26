import { jsonStore } from "@/data/local/json-store";
import { validateCanonicalProgressDecision, type CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import type { CanonicalPhaseOneApplicationReceipt } from "@/domain/training/canonical-progress-decision";
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
  list(planId: string) { return Object.values(jsonStore.get<Record<string, unknown>>(key, {})).map((value) => validateCanonicalProgressDecision(value)).filter((result): result is { status: "valid"; decision: CanonicalProgressDecision } => result.status === "valid" && result.decision.planId === planId).map((result) => result.decision).sort((a, b) => (a.phaseOne?.decidedAt ?? "").localeCompare(b.phaseOne?.decidedAt ?? "") || a.decisionId.localeCompare(b.decisionId)); },
  consume(decisionId: string) {
    const all = jsonStore.get<Record<string, unknown>>(key, {});
    const validated = validateCanonicalProgressDecision(all[decisionId]);
    if (validated.status !== "valid") return { status: "not_found" as const };
    if (validated.decision.status === "consumed") return { status: "duplicate" as const, decision: validated.decision };
    const decision = { ...validated.decision, status: "consumed" as const };
    jsonStore.set(key, { ...all, [decisionId]: decision });
    return { status: "saved" as const, decision };
  },
  recordApplication(decisionId: string, receipt: CanonicalPhaseOneApplicationReceipt) {
    const all = jsonStore.get<Record<string, unknown>>(key, {});
    const validated = validateCanonicalProgressDecision(all[decisionId]);
    if (validated.status !== "valid") return { status: "not_found" as const };
    if (!validated.decision.phaseOne) return { status: "invalid" as const, reason: "phase_one_decision_required" };
    if (validated.decision.phaseOneApplication) {
      return JSON.stringify(validated.decision.phaseOneApplication) === JSON.stringify(receipt)
        ? { status: "duplicate" as const, decision: validated.decision }
        : { status: "conflict" as const, reason: "application_receipt_conflict" };
    }
    const decision = { ...validated.decision, status: "consumed" as const, phaseOneApplication: receipt };
    const next = validateCanonicalProgressDecision(decision);
    if (next.status !== "valid") return next;
    jsonStore.set(key, { ...all, [decisionId]: next.decision });
    return { status: "saved" as const, decision: next.decision };
  },
  clear() { jsonStore.remove(key); },
};
