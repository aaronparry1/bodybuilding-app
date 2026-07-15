export const CANONICAL_MESOCYCLE_RECOVERY_POLICY_ID = "canonical_mesocycle_recovery_policy_v1" as const;
export type RecoveryDisposition = "continue" | "review_stress_reduction" | "deload_required" | "pause_for_review" | "insufficient_evidence" | "unsupported_policy";

export type CanonicalMesocycleRecoveryPolicyResult = Readonly<{
  policyId: typeof CANONICAL_MESOCYCLE_RECOVERY_POLICY_ID;
  policyVersion: "v1";
  planId: string;
  mesocycleId: string;
  purpose: string;
  method: string;
  disposition: RecoveryDisposition;
  reasonCodes: readonly string[];
  evidenceIds: readonly string[];
  provenance: Readonly<{ source: "canonical_mesocycle_policy"; numericRules: readonly string[] }>;
}>;

type Input = Readonly<{ planId: string; mesocycleId: string; purpose: string; method: string; evidenceIds: readonly string[]; freshness: "fresh" | "stale" | "missing"; completeness: "complete" | "incomplete" | "conflicting"; fatigue: "stable" | "local" | "systemic" | "unknown" | "conflicting"; recovery: "ready" | "constrained" | "unknown" }>;

function rejectLegacy(value: unknown): void { if (!value || typeof value !== "object") return; if (Array.isArray(value)) return value.forEach(rejectLegacy); const object = value as Record<string, unknown>; if (["blocks", "activeBlockId", "currentBlock", "TrainingBlock", "TrainingYear", "progressionState", "ActiveTrainingPlan"].some((key) => key in object)) throw new Error("invalid_canonical_mesocycle_recovery_policy_input"); Object.values(object).forEach(rejectLegacy); }

export function resolveCanonicalMesocycleRecoveryPolicy(input: Input): CanonicalMesocycleRecoveryPolicyResult {
  rejectLegacy(input);
  if (!input.planId || !input.mesocycleId || !input.evidenceIds.length) throw new Error("invalid_canonical_mesocycle_recovery_policy_input");
  const supported = ["hypertrophy_base", "hypertrophy_specialisation", "hypertrophy_consolidation", "powerbuilding_hypertrophy", "powerbuilding_strength", "strength_accumulation", "strength_specific"].includes(input.purpose);
  let disposition: RecoveryDisposition = "continue";
  let reason = "stable_recovery_facts";
  if (!supported) { disposition = "unsupported_policy"; reason = "mesocycle_purpose_unsupported"; }
  else if (input.freshness !== "fresh" || input.completeness === "incomplete" || input.completeness === "conflicting" || input.recovery === "unknown") { disposition = input.completeness === "conflicting" ? "pause_for_review" : "insufficient_evidence"; reason = input.completeness === "conflicting" ? "conflicting_recovery_evidence" : "recovery_evidence_not_sufficient"; }
  else if (input.fatigue === "conflicting") { disposition = "pause_for_review"; reason = "ambiguous_fatigue_signal"; }
  else if (input.fatigue === "systemic" || input.recovery === "constrained") { disposition = "review_stress_reduction"; reason = "recovery_review_required"; }
  else if (input.fatigue === "local") { disposition = "continue"; reason = "local_signal_not_global_recovery_policy"; }
  return { policyId: CANONICAL_MESOCYCLE_RECOVERY_POLICY_ID, policyVersion: "v1", planId: input.planId, mesocycleId: input.mesocycleId, purpose: input.purpose, method: input.method, disposition, reasonCodes: [reason], evidenceIds: [...input.evidenceIds].sort(), provenance: { source: "canonical_mesocycle_policy", numericRules: [] } };
}
