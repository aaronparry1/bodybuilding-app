import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalProgressIntervention } from "@/domain/training/canonical-progress-intervention";
import type { LoadEvidenceState, LoadAdjustmentPolicyResult } from "@/domain/training/canonical-mesocycle-load-adjustment-policy";

export type CanonicalLoadInterventionEvaluation = Readonly<{ status: "resolved" | "rejected"; reason: string; intervention?: CanonicalProgressIntervention }>;

export function evaluateCanonicalLoadIntervention(input: Readonly<{ plan: CanonicalActivePlanReadModel; prescription: CanonicalLoadPrescription; evidence: readonly CanonicalProgressEvidence[]; policy: LoadAdjustmentPolicyResult; evidenceState: LoadEvidenceState; operationId: string }>): CanonicalLoadInterventionEvaluation {
  if (input.policy.status === "unsupported_policy") return { status: "rejected", reason: input.policy.reason };
  const relevant = input.evidence.filter((item) => item.planId === input.plan.planId && item.planRevision <= input.plan.revision && item.microcycleId === input.plan.microcycle.id);
  const disposition = input.evidenceState === "missing" || input.prescription.state === "calibration_required" ? "calibration_required" : "review_required";
  const reason = input.evidenceState === "conflicting" ? "conflicting_load_evidence" : input.evidenceState === "stale" ? "stale_load_evidence" : input.policy.reason;
  const intervention: CanonicalProgressIntervention = { schemaVersion: "canonical_progress_intervention_v1", decisionId: input.operationId, evaluationId: `${input.plan.planId}:load:${input.plan.revision}:${relevant.map((item) => item.evidenceId).sort().join(",")}`, planId: input.plan.planId, planRevision: input.plan.revision, macrocycleId: `${input.plan.planId}:macrocycle`, mesocycleId: input.plan.mesocycle.id, microcycleId: input.plan.microcycle.id, evidenceIds: relevant.map((item) => item.evidenceId).sort(), evidenceVersions: Object.fromEntries(relevant.map((item) => [item.evidenceId, item.evidenceVersion])), reason, policyVersion: input.policy.policyId, applicationOwner: "Progress", provenance: [...input.policy.provenance, `load-state:${input.prescription.state}`, `evidence-state:${input.evidenceState}`], family: "load_adjustment", disposition };
  return { status: "resolved", reason, intervention };
}
