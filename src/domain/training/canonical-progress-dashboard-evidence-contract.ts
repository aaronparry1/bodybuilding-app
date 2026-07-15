export const CANONICAL_PROGRESS_DASHBOARD_EVIDENCE_VERSION = "canonical_progress_dashboard_evidence_v1" as const;

export type CanonicalProgressDashboardEvidence = Readonly<{
  contractVersion: typeof CANONICAL_PROGRESS_DASHBOARD_EVIDENCE_VERSION;
  planId: string;
  planRevision: number;
  cycleIds: readonly string[];
  completedSessions: number;
  plannedSessions: number;
  extraSessions: number;
  requiredCompletedSessions: number;
  freshness: "fresh" | "stale" | "missing";
  completeness: "complete" | "incomplete" | "conflicting";
  status: "sufficient" | "insufficient_evidence" | "review_required";
  reasonCodes: readonly string[];
}>;

type Input = Readonly<{
  planId: string;
  planRevision: number;
  cycleIds: readonly string[];
  completedSessions: number;
  plannedSessions: number;
  extraSessions: number;
  requiredCompletedSessions: number;
  freshness: "fresh" | "stale" | "missing";
  completeness: "complete" | "incomplete" | "conflicting";
}>;

function rejectLegacy(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) return value.forEach(rejectLegacy);
  const object = value as Record<string, unknown>;
  if (["blocks", "activeBlockId", "currentBlock", "TrainingBlock", "TrainingYear", "progressionState", "ActiveTrainingPlan"].some((key) => key in object)) throw new Error("invalid_canonical_progress_dashboard_evidence");
  Object.values(object).forEach(rejectLegacy);
}

export function resolveCanonicalProgressDashboardEvidence(input: Input): CanonicalProgressDashboardEvidence {
  rejectLegacy(input);
  if (!input.planId || !Number.isInteger(input.planRevision) || input.planRevision < 0 || !input.cycleIds.length || input.cycleIds.some((id) => !id) || Object.values(input).some((value) => typeof value === "number" && (!Number.isFinite(value) || value < 0))) throw new Error("invalid_canonical_progress_dashboard_evidence");
  const identity = input.plannedSessions === input.completedSessions + input.extraSessions || input.plannedSessions >= input.completedSessions;
  const status = input.freshness !== "fresh" || input.completeness !== "complete" ? input.completeness === "conflicting" ? "review_required" : "insufficient_evidence" : !identity ? "review_required" : input.completedSessions >= input.requiredCompletedSessions ? "sufficient" : "insufficient_evidence";
  const reasonCodes = status === "sufficient" ? ["evidence_sufficient"] : status === "review_required" ? ["evidence_identity_conflict"] : input.freshness !== "fresh" ? ["evidence_not_fresh"] : input.completeness !== "complete" ? ["evidence_incomplete"] : ["completed_history_below_requirement"];
  return { contractVersion: CANONICAL_PROGRESS_DASHBOARD_EVIDENCE_VERSION, ...input, status, reasonCodes };
}
