import { loadCanonicalActivePlan } from "@/application/training/canonical-active-plan-application";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { resolveCanonicalMesocycleSuccessor } from "@/domain/training/canonical-mesocycle-successor";

export type CanonicalProgressDecisionApplicationCommand = Readonly<{ planId: string; expectedPlanRevision: number; macrocycleId: string; mesocycleId: string; microcycleId: string; decisionId: string; evaluationId: string; expectedEvidenceIds: readonly string[] }>;
export type CanonicalProgressDecisionApplicationResult = Readonly<{ status: "unchanged" | "applied" | "rejected"; reason: string; planId: string; priorRevision: number; newRevision: number; decisionId: string; stateChanged: boolean; futureSessionsRegenerated: boolean; reviewRequired: boolean }>;

/** Coordinates canonical identity validation. Transition/regeneration remains owned by Mesocycle/Microcycle/Session Construction. */
export function applyCanonicalProgressDecision(command: CanonicalProgressDecisionApplicationCommand): CanonicalProgressDecisionApplicationResult {
  const loaded = loadCanonicalActivePlan();
  if (loaded.status !== "ok") return rejected(command, 0, "canonical_plan_unavailable");
  const plan = loaded.model;
  if (plan.planId !== command.planId || plan.revision !== command.expectedPlanRevision) return rejected(command, plan.revision, "stale_plan_revision");
  if (plan.macrocycle.goal === "" || plan.mesocycle.id !== command.mesocycleId || plan.microcycle.id !== command.microcycleId) return rejected(command, plan.revision, "canonical_identity_mismatch");
  const decision = canonicalProgressDecisionRepository.get(command.decisionId);
  if (decision.status !== "found") return rejected(command, plan.revision, "decision_not_found");
  if (decision.decision.planId !== command.planId || decision.decision.expectedPlanRevision !== command.expectedPlanRevision || decision.decision.evaluationId !== command.evaluationId || decision.decision.mesocycleId !== command.mesocycleId || decision.decision.microcycleId !== command.microcycleId) return rejected(command, plan.revision, "decision_chain_mismatch");
  const expected = [...command.expectedEvidenceIds].sort();
  const actual = [...decision.decision.evidenceIds].sort();
  if (JSON.stringify(expected) !== JSON.stringify(actual) || actual.some((id) => canonicalProgressEvidenceRepository.get(id).status !== "found")) return rejected(command, plan.revision, "evidence_chain_mismatch");
  if (decision.decision.status === "consumed") return { status: "unchanged", reason: "decision_already_consumed", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
  if (decision.decision.outcome !== "continue") {
    const successor = resolveCanonicalMesocycleSuccessor({ macrocycleId: `${plan.planId}:macrocycle`, macrocycleEngine: engineForGoal(plan.macrocycle.goal), currentMesocycleId: command.mesocycleId as never, decisionId: decision.decision.decisionId, evaluationId: command.evaluationId, evidenceIds: actual, outcome: decision.decision.outcome === "transition" ? "transition" : "deload", successorMesocycleId: decision.decision.successorMesocycleId as never, sequenceNumber: plan.microcycle.sequenceNumber + 1, planRevision: plan.revision });
    if (successor.status !== "resolved") return rejected(command, plan.revision, successor.reason);
    return rejected(command, plan.revision, "canonical_future_regeneration_inputs_required");
  }
  return { status: "unchanged", reason: "continue_requires_no_plan_change", planId: plan.planId, priorRevision: plan.revision, newRevision: plan.revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false };
}

function rejected(command: CanonicalProgressDecisionApplicationCommand, revision: number, reason: string): CanonicalProgressDecisionApplicationResult { return { status: "rejected", reason, planId: command.planId, priorRevision: revision, newRevision: revision, decisionId: command.decisionId, stateChanged: false, futureSessionsRegenerated: false, reviewRequired: false }; }

function engineForGoal(goal: string): "hypertrophy" | "powerbuilding" | "strength" | "athletic_performance" { return goal === "build_muscle_and_strength" ? "powerbuilding" : goal === "build_strength" || goal === "powerlifting_meet" ? "strength" : goal === "athletic_performance" ? "athletic_performance" : "hypertrophy"; }
