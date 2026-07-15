import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

export type CanonicalProgressEvaluation = Readonly<{
  schemaVersion: "canonical_progress_evaluation_v1";
  evaluationId: string;
  planId: string;
  planRevision: number;
  mesocycleId: string;
  microcycleId: string;
  evidenceIds: readonly string[];
  state: "ready" | "insufficient_evidence" | "review_required";
  reason: "complete_current_microcycle" | "no_evidence" | "partial_or_review_signal";
  explanation: string;
}>;

export function evaluateCanonicalProgress(input: Readonly<{ plan: CanonicalActivePlanReadModel; evidence: readonly CanonicalProgressEvidence[] }>): CanonicalProgressEvaluation {
  const { plan, evidence } = input;
  const relevant = evidence.filter((item) => item.planId === plan.planId && item.planRevision <= plan.revision && item.microcycleId === plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const hasReview = relevant.some((item) => item.kind === "review_request" || item.kind === "pain");
  const state = hasReview ? "review_required" : relevant.length ? "ready" : "insufficient_evidence";
  const reason = hasReview ? "partial_or_review_signal" : relevant.length ? "complete_current_microcycle" : "no_evidence";
  return { schemaVersion: "canonical_progress_evaluation_v1", evaluationId: `${plan.planId}:progress:${plan.revision}:${relevant.map((item) => item.evidenceId).join(",")}`, planId: plan.planId, planRevision: plan.revision, mesocycleId: plan.mesocycle.id, microcycleId: plan.microcycle.id, evidenceIds: relevant.map((item) => item.evidenceId), state, reason, explanation: state === "review_required" ? "Progress evidence requests review before a transition." : state === "ready" ? "Current canonical Progress evidence is available for decision evaluation." : "More canonical Progress evidence is required before a decision can be produced." };
}
