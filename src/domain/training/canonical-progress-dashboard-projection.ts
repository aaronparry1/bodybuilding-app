export const CANONICAL_PROGRESS_DASHBOARD_PROJECTION_VERSION = "canonical_progress_dashboard_projection_v1" as const;

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
  action: Readonly<{ allowed: boolean; kind: string; reason: string }>;
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
  const status = input.evidence.freshness !== "fresh" || input.evidence.completeness !== "complete" || !input.evaluation ? "insufficient_evidence" : input.decision?.kind === "review_required" ? "review_required" : "ready";
  return {
    contractVersion: CANONICAL_PROGRESS_DASHBOARD_PROJECTION_VERSION,
    status,
    context: { ...input.macrocycle, ...input.mesocycle, ...input.microcycle },
    evidence: input.evidence,
    ...(input.evaluation ? { evaluation: input.evaluation } : {}),
    ...(input.intervention ? { intervention: input.intervention } : {}),
    ...(input.decision ? { decision: input.decision } : {}),
    recordedProgress: input.recordedProgress,
    action: { allowed: status === "ready" && Boolean(input.decision), kind: input.decision?.kind ?? "review", reason: status === "ready" ? "persisted_canonical_decision" : "canonical_review_required" },
  };
}
