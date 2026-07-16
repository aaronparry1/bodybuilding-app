import type { CanonicalProgressContext } from "@/domain/training/canonical-progress-context";

export type CurrentProgressRecoveryContext =
  | Readonly<{ status: "normal" | "watch" | "recovery_recommended" | "recovery_active"; reason: string; historicalWarning: "none" | "fatigue_pattern_observed" }>
  | Readonly<{ status: "assessment_unavailable" | "compatibility" | "invalid"; reason: string }>;

/** Pure recovery presentation boundary. Persisted current state, never strategic recommendation, is authoritative. */
export function buildCurrentProgressRecoveryContext(context: CanonicalProgressContext, microcycleProgressionState?: string, historicalWarning = false): CurrentProgressRecoveryContext {
  if (context.status === "compatibility") return { status: "compatibility", reason: context.reason };
  if (context.status === "invalid") return { status: "invalid", reason: context.reason };
  if (context.status === "blocked" || context.status === "disrupted" || context.status === "insufficient_evidence" || context.status === "insufficient_policy" || context.status === "in_progress" || context.status === "no_current_snapshot" || context.status === "no_current_decision") return { status: "assessment_unavailable", reason: "current_assessment_unavailable" };
  if (microcycleProgressionState === "deload") return { status: "recovery_active", reason: "current_deload_microcycle", historicalWarning: historicalWarning ? "fatigue_pattern_observed" : "none" };
  if (context.status === "ready" && context.decisionOutcome === "deload") return { status: "recovery_recommended", reason: "persisted_deload_decision", historicalWarning: historicalWarning ? "fatigue_pattern_observed" : "none" };
  return historicalWarning ? { status: "watch", reason: "historical_fatigue_pattern", historicalWarning: "fatigue_pattern_observed" } : { status: "normal", reason: "no_persisted_recovery_action", historicalWarning: "none" };
}

export function isCurrentRecoveryPriority(context: CurrentProgressRecoveryContext): boolean {
  return context.status === "recovery_recommended" || context.status === "recovery_active";
}
