import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";

export type CanonicalRecommendationAction = Readonly<{
  kind: "continue_mesocycle" | "transition_mesocycle" | "deload_mesocycle" | "review_required";
  owner: "mesocycle";
  planId: string;
  mesocycleId: string;
  microcycleNumber: number;
  evidenceId: string;
  evidenceVersion: string;
  reason: string;
  expectedDecisionId: string;
  explanation: string;
  targetMesocycleId?: string;
}>;

export type CanonicalRecommendationQuery =
  | { status: "no_plan" | "legacy_compatibility" | "ambiguous" | "no_current_decision" }
  | { status: "available"; action: CanonicalRecommendationAction };

export function readCanonicalRecommendationAction(planId: string): CanonicalRecommendationQuery {
  const plan = loadCanonicalActivePlan();
  if (plan.status !== "ok" || plan.model.planId !== planId) return { status: "no_plan" };
  const record = canonicalProgressDecisionRepository.current(planId, plan.model.mesocycle.id)[0];
  if (!record) return { status: "no_current_decision" };
  const evidence = record.evidenceIds.map((id) => canonicalProgressEvidenceRepository.get(id));
  if (evidence.some((item) => item.status !== "found")) return { status: "no_current_decision" };
  const kind = record.outcome === "continue" ? "continue_mesocycle" : record.outcome === "transition" ? "transition_mesocycle" : record.outcome === "deload" ? "deload_mesocycle" : "review_required";
  return { status: "available", action: { kind, owner: "mesocycle", planId, mesocycleId: record.mesocycleId, microcycleNumber: plan.model.microcycle.sequenceNumber, evidenceId: record.evidenceIds[0] ?? record.decisionId, evidenceVersion: "canonical_progress_evidence_v1", reason: record.reason, expectedDecisionId: record.decisionId, explanation: record.explanation, ...(record.successorMesocycleId ? { targetMesocycleId: record.successorMesocycleId } : {}) } };
}

export type ApplyCanonicalRecommendationCommand = Readonly<{ action: CanonicalRecommendationAction; expectedPlanRevision: number; evaluationVersion: string; operationId: string }>;

export function applyCanonicalRecommendationAction(command: ApplyCanonicalRecommendationCommand) {
  const { action, expectedPlanRevision } = command;
  const plan = loadCanonicalActivePlan();
  if (plan.status !== "ok") return { status: "rejected" as const, reason: "canonical_plan_unavailable" };
  if (plan.model.planId !== action.planId || plan.model.revision !== expectedPlanRevision || plan.model.mesocycle.id !== action.mesocycleId) return { status: "rejected" as const, reason: "stale_plan_revision" };
  const decision = canonicalProgressDecisionRepository.get(action.expectedDecisionId);
  if (decision.status !== "found") return { status: "rejected" as const, reason: "decision_not_found" };
  if (decision.decision.evaluationId !== action.expectedDecisionId && decision.decision.evaluationId !== action.evidenceId) return { status: "rejected" as const, reason: "decision_chain_mismatch" };
  const result = canonicalActivePlanState.applyProgressDecision({ planId: action.planId, expectedPlanRevision, macrocycleId: decision.decision.macrocycleId, mesocycleId: decision.decision.mesocycleId, microcycleId: decision.decision.microcycleId, decisionId: decision.decision.decisionId, evaluationId: decision.decision.evaluationId, expectedEvidenceIds: decision.decision.evidenceIds });
  return { ...result, operationId: command.operationId, evaluationVersion: command.evaluationVersion };
}
