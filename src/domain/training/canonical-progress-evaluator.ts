import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

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
export type CanonicalProgressEvaluationV2 = Readonly<{
  schemaVersion: "canonical_progress_evaluation_v2";
  evaluationId: string; planId: string; planRevision: number; mesocycleId: string; microcycleId: string;
  evidenceIds: readonly string[]; evidenceVersions: Readonly<Record<string, string>>;
  outcome: "insufficient_evidence" | "continue" | "review_required" | "transition_recommended" | "deload_required";
  reason: string; explanation: string; policyVersion: string; transitionIntent: boolean; deloadIntent: boolean;
}>;

export function evaluateCanonicalProgress(input: Readonly<{ plan: CanonicalActivePlanReadModel; evidence: readonly CanonicalProgressEvidence[] }>): CanonicalProgressEvaluation {
  const { plan, evidence } = input;
  const relevant = evidence.filter((item) => item.planId === plan.planId && item.planRevision <= plan.revision && item.microcycleId === plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const hasReview = relevant.some((item) => item.kind === "review_request" || item.kind === "pain");
  const state = hasReview ? "review_required" : relevant.length ? "ready" : "insufficient_evidence";
  const reason = hasReview ? "partial_or_review_signal" : relevant.length ? "complete_current_microcycle" : "no_evidence";
  return { schemaVersion: "canonical_progress_evaluation_v1", evaluationId: `${plan.planId}:progress:${plan.revision}:${relevant.map((item) => item.evidenceId).join(",")}`, planId: plan.planId, planRevision: plan.revision, mesocycleId: plan.mesocycle.id, microcycleId: plan.microcycle.id, evidenceIds: relevant.map((item) => item.evidenceId), state, reason, explanation: state === "review_required" ? "Progress evidence requests review before a transition." : state === "ready" ? "Current canonical Progress evidence is available for decision evaluation." : "More canonical Progress evidence is required before a decision can be produced." };
}

export function evaluateCanonicalProgressV2(input: Readonly<{ plan: CanonicalActivePlanReadModel; evidence: readonly CanonicalProgressEvidence[]; policy: MesocyclePrescriptionPolicy }>): CanonicalProgressEvaluationV2 {
  const base = evaluateCanonicalProgress(input);
  const relevant = input.evidence.filter((item) => base.evidenceIds.includes(item.evidenceId));
  const transitionIntent = relevant.some((item) => item.observations.transitionReady === true || item.observations.exitCriteriaSatisfied === true);
  const deloadIntent = relevant.some((item) => item.observations.deloadRequired === true || item.observations.recoveryState === "recovery_first");
  const outcome = !relevant.length ? "insufficient_evidence" : transitionIntent && deloadIntent ? "review_required" : deloadIntent ? "deload_required" : transitionIntent ? "transition_recommended" : base.state === "review_required" ? "review_required" : "continue";
  return { schemaVersion: "canonical_progress_evaluation_v2", evaluationId: `${base.evaluationId}:v2:${outcome}`, planId: base.planId, planRevision: base.planRevision, mesocycleId: base.mesocycleId, microcycleId: base.microcycleId, evidenceIds: base.evidenceIds, evidenceVersions: Object.fromEntries(relevant.map((item) => [item.evidenceId, item.evidenceVersion])), outcome, reason: outcome === "transition_recommended" ? "canonical_transition_exit_requirements_met" : outcome === "deload_required" ? `canonical_fatigue_policy:${input.policy.fatigue.boundary}` : base.reason, explanation: outcome === "transition_recommended" ? "Canonical Progress evidence satisfies transition intent." : outcome === "deload_required" ? "Canonical fatigue evidence requires a recovery successor." : base.explanation, policyVersion: input.policy.schemaVersion, transitionIntent, deloadIntent };
}
