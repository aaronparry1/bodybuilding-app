export const CANONICAL_PROGRESS_DASHBOARD_PROJECTION_VERSION = "canonical_progress_dashboard_projection_v1" as const;
export type CanonicalDashboardRecoverySummary = Readonly<{ completeness: "complete" | "incomplete"; freshness: "fresh" | "stale" | "missing"; recovery: string; capacity: string; fatigue: string; evidenceIds: readonly string[]; reasonCodes: readonly string[] }>;
export type CanonicalDashboardInterventionSummary = Readonly<{ interventionId: string; family: "volume_adjustment" | "microcycle_rotation"; policyId: string; policyVersion: string; disposition: string; reasonCodes: readonly string[]; application: "supported" | "unsupported" | "review_required"; evidenceIds: readonly string[] }>;
export type CanonicalDashboardHistorySummary = Readonly<{ windowId: string; recordedSessions: number; completed: number; partial: number; missed: number; performedSets: number; prescribedSets: number; substitutions: number; evidencePending: number }>;
export type CanonicalDashboardAction = Readonly<{ kind: "none" | "review" | "continue" | "transition" | "deload"; allowed: boolean; decisionId?: string; evaluationId?: string; expectedPlanRevision?: number; successorId?: string; reason: string }>;

export type CanonicalProgressDashboardInput = Readonly<{
  contractVersion: "canonical_current_progress_context_v1";
  planId: string;
  planRevision: number;
  macrocycle: Readonly<{ id: string; route: string; strategy: string }>;
  mesocycle: Readonly<{ id: string; purpose: string; policyId: string }>;
  microcycle: Readonly<{ id: string; order: number; priority: string; rotation: string; stress: string }>;
  evidence: Readonly<{ ids: readonly string[]; freshness: "fresh" | "stale" | "missing"; completeness: "complete" | "incomplete" }>;
  evaluation?: Readonly<{ id: string; version: string; outcome: string; reasons: readonly string[] }>;
  intervention?: Readonly<{ family: string; disposition: string; reasonCodes: readonly string[] }>;
  decision?: Readonly<{ id: string; kind: string; status: string; successorId?: string }>;
  recordedProgress: Readonly<{ completedSessions: number; performedSets: number; evidencePending: boolean }>;
  recovery?: CanonicalDashboardRecoverySummary;
  interventions?: readonly CanonicalDashboardInterventionSummary[];
  history?: CanonicalDashboardHistorySummary;
}>;

export type CanonicalProgressDashboardProjection = Readonly<{
  contractVersion: typeof CANONICAL_PROGRESS_DASHBOARD_PROJECTION_VERSION;
  status: "ready" | "review_required" | "insufficient_evidence";
  context: CanonicalProgressDashboardInput["macrocycle"] & CanonicalProgressDashboardInput["mesocycle"] & CanonicalProgressDashboardInput["microcycle"];
  evidence: CanonicalProgressDashboardInput["evidence"];
  evaluation?: CanonicalProgressDashboardInput["evaluation"];
  intervention?: CanonicalProgressDashboardInput["intervention"];
  decision?: CanonicalProgressDashboardInput["decision"];
  recordedProgress: CanonicalProgressDashboardInput["recordedProgress"];
  recovery?: CanonicalDashboardRecoverySummary;
  interventions: readonly CanonicalDashboardInterventionSummary[];
  history?: CanonicalDashboardHistorySummary;
  action: CanonicalDashboardAction;
}>;

function containsLegacy(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsLegacy);
  const object = value as Record<string, unknown>;
  if (["blocks", "activeBlockId", "currentBlock", "TrainingBlock", "TrainingYear", "progressionState", "ActiveTrainingPlan"].some((key) => key in object)) return true;
  return Object.values(object).some(containsLegacy);
}

export function projectCanonicalProgressDashboard(input: CanonicalProgressDashboardInput): CanonicalProgressDashboardProjection {
  if (input.contractVersion !== "canonical_current_progress_context_v1" || !input.planId || !Number.isInteger(input.planRevision) || containsLegacy(input)) throw new Error("invalid_canonical_progress_dashboard_input");
  if (input.interventions?.some((item) => !item.interventionId || !item.policyId || !item.policyVersion || !item.evidenceIds.length)) throw new Error("invalid_canonical_dashboard_intervention");
  if (input.history && (!input.history.windowId || Object.values(input.history).some((value) => typeof value === "number" && value < 0))) throw new Error("invalid_canonical_dashboard_history");
  const status = input.evidence.freshness !== "fresh" || input.evidence.completeness !== "complete" || !input.evaluation ? "insufficient_evidence" : input.decision?.kind === "review_required" ? "review_required" : "ready";
  const kind = input.decision?.kind === "transition" || input.decision?.kind === "deload" || input.decision?.kind === "continue" ? input.decision.kind : input.decision ? "review" : "none";
  const action: CanonicalDashboardAction = { kind, allowed: status === "ready" && Boolean(input.decision) && (kind === "continue" || Boolean(input.decision?.successorId) || kind === "review"), ...(input.decision?.id ? { decisionId: input.decision.id } : {}), ...(input.evaluation?.id ? { evaluationId: input.evaluation.id } : {}), expectedPlanRevision: input.planRevision, ...(input.decision?.successorId ? { successorId: input.decision.successorId } : {}), reason: status === "ready" ? "persisted_canonical_decision" : "canonical_review_required" };
  return {
    contractVersion: CANONICAL_PROGRESS_DASHBOARD_PROJECTION_VERSION,
    status,
    context: { ...input.macrocycle, ...input.mesocycle, ...input.microcycle },
    evidence: input.evidence,
    ...(input.evaluation ? { evaluation: input.evaluation } : {}),
    ...(input.intervention ? { intervention: input.intervention } : {}),
    ...(input.decision ? { decision: input.decision } : {}),
    recordedProgress: input.recordedProgress,
    ...(input.recovery ? { recovery: input.recovery } : {}),
    interventions: [...(input.interventions ?? [])].sort((a, b) => a.interventionId.localeCompare(b.interventionId)),
    ...(input.history ? { history: input.history } : {}),
    action,
  };
}
