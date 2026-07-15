export const CANONICAL_PROGRESS_DECISION_SCHEMA = "canonical_progress_decision_v1" as const;
export type CanonicalProgressDecision = Readonly<{
  schemaVersion: typeof CANONICAL_PROGRESS_DECISION_SCHEMA;
  decisionId: string;
  planId: string;
  expectedPlanRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  evaluationId: string;
  evidenceIds: readonly string[];
  outcome: "continue" | "transition" | "deload" | "review_required" | "insufficient_evidence";
  successorMesocycleId?: string;
  owner: "mesocycle";
  reason: string;
  explanation: string;
  status: "current" | "consumed";
  intervention?: import("@/domain/training/canonical-progress-intervention").CanonicalProgressIntervention;
}>;

export function validateCanonicalProgressDecision(value: unknown): { status: "valid"; decision: CanonicalProgressDecision } | { status: "invalid"; reason: string } {
  if (!value || typeof value !== "object") return { status: "invalid", reason: "malformed_decision" };
  const c = value as Record<string, unknown>;
  if (c.schemaVersion !== CANONICAL_PROGRESS_DECISION_SCHEMA) return { status: "invalid", reason: "unsupported_decision_schema" };
  for (const key of ["decisionId", "planId", "macrocycleId", "mesocycleId", "microcycleId", "evaluationId", "owner", "reason", "explanation"]) if (typeof c[key] !== "string" || !c[key]) return { status: "invalid", reason: `missing_${key}` };
  if (!Number.isInteger(c.expectedPlanRevision) || Number(c.expectedPlanRevision) < 0) return { status: "invalid", reason: "invalid_expected_revision" };
  if (!Array.isArray(c.evidenceIds) || !(c.evidenceIds as unknown[]).every((id) => typeof id === "string")) return { status: "invalid", reason: "invalid_evidence_ids" };
  if (!["continue", "transition", "deload", "review_required", "insufficient_evidence"].includes(String(c.outcome))) return { status: "invalid", reason: "invalid_outcome" };
  if (!["current", "consumed"].includes(String(c.status))) return { status: "invalid", reason: "invalid_status" };
  return { status: "valid", decision: { ...(c as CanonicalProgressDecision), evidenceIds: [...(c.evidenceIds as string[])] } };
}
