import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import type { CanonicalProgressEvaluation, CanonicalProgressEvaluationV2 } from "@/domain/training/canonical-progress-evaluator";
import type { CanonicalProgressDecision } from "@/domain/training/canonical-progress-decision";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";

export type CanonicalProgressDecisionProductionCommand = Readonly<{
  planId: string;
  planRevision: number;
  macrocycleId: string;
  mesocycleId: string;
  microcycleId: string;
  evaluation: CanonicalProgressEvaluation | CanonicalProgressEvaluationV2;
  evidenceVersions: Readonly<Record<string, string>>;
  operationId: string;
}>;

export type CanonicalProgressDecisionProductionResult = Readonly<{ status: "produced" | "rejected"; reason: string; decision?: CanonicalProgressDecision }>;

/** Progress-owned production only. It persists a decision; it never applies or mutates the plan. */
export function produceCanonicalProgressDecision(command: CanonicalProgressDecisionProductionCommand): CanonicalProgressDecisionProductionResult {
  const plan = canonicalActivePlanState.getReadModel();
  if (!plan || plan.planId !== command.planId) return { status: "rejected", reason: "canonical_plan_unavailable" };
  if (plan.revision !== command.planRevision) return { status: "rejected", reason: "stale_plan_revision" };
  if (`${plan.planId}:macrocycle` !== command.macrocycleId || plan.mesocycle.id !== command.mesocycleId || plan.microcycle.id !== command.microcycleId) return { status: "rejected", reason: "canonical_identity_mismatch" };
  const evaluation = command.evaluation;
  if (evaluation.planId !== command.planId || evaluation.planRevision !== command.planRevision || evaluation.mesocycleId !== command.mesocycleId || evaluation.microcycleId !== command.microcycleId) return { status: "rejected", reason: "evaluation_chain_mismatch" };
  if (evaluation.schemaVersion === "canonical_progress_evaluation_v1" && evaluation.evaluationId !== `${command.planId}:progress:${command.planRevision}:${evaluation.evidenceIds.join(",")}`) return { status: "rejected", reason: "evaluation_chain_mismatch" };
  const evidenceIds = [...evaluation.evidenceIds].sort();
  if (new Set(evidenceIds).size !== evidenceIds.length) return { status: "rejected", reason: "duplicate_evidence" };
  for (const evidenceId of evidenceIds) {
    const evidence = canonicalProgressEvidenceRepository.get(evidenceId);
    if (evidence.status !== "found") return { status: "rejected", reason: "evidence_not_found" };
    if (evidence.evidence.planId !== command.planId || evidence.evidence.planRevision > command.planRevision || evidence.evidence.microcycleId !== command.microcycleId || command.evidenceVersions[evidenceId] !== evidence.evidence.evidenceVersion) return { status: "rejected", reason: "evidence_chain_mismatch" };
  }
  const outcome = evaluation.schemaVersion === "canonical_progress_evaluation_v2" ? (evaluation.outcome === "transition_recommended" ? "transition" : evaluation.outcome === "deload_required" ? "deload" : evaluation.outcome) : evaluation.state === "review_required" ? "review_required" : evaluation.state === "ready" ? "continue" : "insufficient_evidence";
  let successorMesocycleId: string | undefined;
  if (outcome === "transition" || outcome === "deload") {
    const successor = resolveCanonicalMesocycleSuccessor({ macrocycleId: command.macrocycleId, macrocycleEngine: plan.macrocycle.goal === "build_strength" ? "strength" : plan.macrocycle.goal === "build_muscle_and_strength" ? "powerbuilding" : plan.macrocycle.goal === "athletic_performance" ? "athletic_performance" : "hypertrophy", currentMesocycleId: command.mesocycleId as never, decisionId: command.operationId, evaluationId: evaluation.evaluationId, evidenceIds, outcome, sequenceNumber: plan.microcycle.sequenceNumber + 1, planRevision: plan.revision });
    if (successor.status !== "resolved") return { status: "rejected", reason: successor.reason };
    successorMesocycleId = successor.successorMesocycleId;
  }
  const decisionId = command.operationId;
  const decision: CanonicalProgressDecision = { schemaVersion: "canonical_progress_decision_v1", decisionId, planId: command.planId, expectedPlanRevision: command.planRevision, macrocycleId: command.macrocycleId, mesocycleId: command.mesocycleId, microcycleId: command.microcycleId, evaluationId: evaluation.evaluationId, evidenceIds, outcome, ...(successorMesocycleId ? { successorMesocycleId } : {}), owner: "mesocycle", reason: evaluation.reason, explanation: evaluation.explanation, status: "current" };
  const existing = canonicalProgressDecisionRepository.get(decisionId);
  if (existing.status === "found") return JSON.stringify(existing.decision) === JSON.stringify(decision) ? { status: "produced", reason: "idempotent_retry", decision: existing.decision } : { status: "rejected", reason: "decision_id_conflict" };
  const saved = canonicalProgressDecisionRepository.save(decision);
  if (saved.status === "conflict") return { status: "rejected", reason: saved.reason };
  if (saved.status !== "saved" && saved.status !== "duplicate") return { status: "rejected", reason: "decision_persistence_failed" };
  const readBack = canonicalProgressDecisionRepository.get(decisionId);
  return readBack.status === "found" ? { status: "produced", reason: "decision_persisted", decision: readBack.decision } : { status: "rejected", reason: "decision_readback_failed" };
}
