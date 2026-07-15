import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalProgressIntervention } from "@/domain/training/canonical-progress-intervention";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

type Input = Readonly<{ plan: CanonicalActivePlanReadModel; policy: MesocyclePrescriptionPolicy; evidence: readonly CanonicalProgressEvidence[]; evidenceState: "missing" | "insufficient" | "stale" | "fresh" | "conflicting"; operationId: string; intent: "recovery" | "goal_or_phase" }>;
export function evaluateCanonicalRecoveryPhaseIntervention(input: Input): CanonicalProgressIntervention {
  const evidence = input.evidence.filter((item) => item.planId === input.plan.planId && item.microcycleId === input.plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const disposition = input.evidenceState === "missing" || input.evidenceState === "insufficient" ? "insufficient_evidence" : input.evidenceState === "fresh" && input.evidence.some((item) => item.observations.deloadRequired === true) ? "deload" : input.evidenceState === "fresh" ? "continue" : "pause_review";
  return { schemaVersion: "canonical_progress_intervention_v1", decisionId: input.operationId, evaluationId: `${input.plan.planId}:recovery:${input.plan.revision}:${evidence.map((item) => item.evidenceId).join(",")}`, planId: input.plan.planId, planRevision: input.plan.revision, macrocycleId: `${input.plan.planId}:macrocycle`, mesocycleId: input.plan.mesocycle.id, microcycleId: input.plan.microcycle.id, evidenceIds: evidence.map((item) => item.evidenceId), evidenceVersions: Object.fromEntries(evidence.map((item) => [item.evidenceId, item.evidenceVersion])), reason: `recovery_evidence_${input.evidenceState}`, policyVersion: input.policy.schemaVersion, applicationOwner: "Progress", provenance: [`mesocycle:${input.policy.mesocycleId}`, `policy:${input.policy.schemaVersion}`], family: "recovery_action", disposition };
}

export function evaluateCanonicalGoalPhaseIntervention(input: Input): CanonicalProgressIntervention {
  const evidence = input.evidence.filter((item) => item.planId === input.plan.planId && item.microcycleId === input.plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  const transition = input.evidenceState === "fresh" && evidence.some((item) => item.observations.transitionReady === true || item.observations.exitCriteriaSatisfied === true);
  const disposition = input.evidenceState !== "fresh" ? "insufficient_evidence" : transition ? "transition" : "remain_on_route";
  return { schemaVersion: "canonical_progress_intervention_v1", decisionId: input.operationId, evaluationId: `${input.plan.planId}:goal:${input.plan.revision}:${evidence.map((item) => item.evidenceId).join(",")}`, planId: input.plan.planId, planRevision: input.plan.revision, macrocycleId: `${input.plan.planId}:macrocycle`, mesocycleId: input.plan.mesocycle.id, microcycleId: input.plan.microcycle.id, evidenceIds: evidence.map((item) => item.evidenceId), evidenceVersions: Object.fromEntries(evidence.map((item) => [item.evidenceId, item.evidenceVersion])), reason: `goal_phase_evidence_${input.evidenceState}`, policyVersion: input.policy.schemaVersion, applicationOwner: "Macrocycle", provenance: [`mesocycle:${input.policy.mesocycleId}`, `policy:${input.policy.schemaVersion}`], family: "goal_or_phase_review", disposition };
}
