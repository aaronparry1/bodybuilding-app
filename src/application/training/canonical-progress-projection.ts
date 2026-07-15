import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvaluation } from "@/domain/training/canonical-progress-evaluator";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";

export type CanonicalProgressProjection = Readonly<{
  status: "ready" | "hydrating" | "empty" | "insufficient_evidence" | "review_required" | "storage_error";
  macrocycle: string;
  mesocycle: string;
  microcycle: string;
  explanation: string;
  evidenceCount: number;
  evidenceFreshness: "current" | "stale" | "none";
  decision: CanonicalProgressDecision | null;
  recentSessions: readonly Readonly<{ id: string; role: string; status: string; performedSets: number }>[];
}>;

export function projectCanonicalProgress(input: Readonly<{ status: "hydrating" | "empty" | "error" | "ready"; plan?: CanonicalActivePlanReadModel | null; evidence?: readonly CanonicalProgressEvidence[]; evaluation?: CanonicalProgressEvaluation | null; decision?: CanonicalProgressDecision | null }>): CanonicalProgressProjection {
  if (input.status === "hydrating") return { status: "hydrating", macrocycle: "", mesocycle: "", microcycle: "", explanation: "Loading canonical Progress…", evidenceCount: 0, evidenceFreshness: "none", decision: null, recentSessions: [] };
  if (input.status === "empty" || !input.plan) return { status: "empty", macrocycle: "", mesocycle: "", microcycle: "", explanation: "Create a canonical training plan to see Progress.", evidenceCount: 0, evidenceFreshness: "none", decision: null, recentSessions: [] };
  const plan = input.plan;
  const evidence = input.evidence ?? [];
  const evaluation = input.evaluation;
  const state = evaluation?.state ?? (evidence.length ? "ready" : "insufficient_evidence");
  const status = state === "review_required" ? "review_required" : state === "insufficient_evidence" ? "insufficient_evidence" : "ready";
  const recentSessions = [...(plan.historicalRecordedSessions ?? []), ...(plan.activeRecordedSession ? [plan.activeRecordedSession] : [])].sort((a, b) => b.recordedSessionId.localeCompare(a.recordedSessionId)).map((session) => ({ id: session.recordedSessionId, role: session.role, status: session.status, performedSets: session.performedSets }));
  return { status, macrocycle: plan.macrocycle.goal, mesocycle: plan.mesocycle.purpose, microcycle: `${plan.microcycle.sequenceNumber}`, explanation: evaluation?.explanation ?? "More canonical Progress evidence is required before a decision can be produced.", evidenceCount: evidence.length, evidenceFreshness: evidence.length ? "current" : "none", decision: input.decision ?? null, recentSessions };
}
