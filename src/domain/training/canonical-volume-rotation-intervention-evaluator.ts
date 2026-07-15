import type { CanonicalActivePlanReadModel } from "@/application/training/canonical-active-plan-application";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";
import type { CanonicalProgressIntervention } from "@/domain/training/canonical-progress-intervention";
import type { MesocyclePrescriptionPolicy } from "@/domain/training/mesocycle-prescription-policy";

type Result = Readonly<{ status: "resolved" | "rejected"; reason: string; intervention?: CanonicalProgressIntervention }>;
type Input = Readonly<{ plan: CanonicalActivePlanReadModel; policy: MesocyclePrescriptionPolicy; evidence: readonly CanonicalProgressEvidence[]; evidenceState: "missing" | "insufficient" | "stale" | "fresh" | "conflicting"; operationId: string }>;

function base(input: Input, family: "volume_adjustment" | "microcycle_rotation", reason: string, disposition: "reduce" | "maintain" | "increase" | "review" | "retain" | "advance" | "reduce_stress") : CanonicalProgressIntervention {
  const evidence = input.evidence.filter((item) => item.planId === input.plan.planId && item.planRevision <= input.plan.revision && item.microcycleId === input.plan.microcycle.id).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
  return { schemaVersion: "canonical_progress_intervention_v1", decisionId: input.operationId, evaluationId: `${input.plan.planId}:${family}:${input.plan.revision}:${evidence.map((item) => item.evidenceId).join(",")}`, planId: input.plan.planId, planRevision: input.plan.revision, macrocycleId: `${input.plan.planId}:macrocycle`, mesocycleId: input.plan.mesocycle.id, microcycleId: input.plan.microcycle.id, evidenceIds: evidence.map((item) => item.evidenceId), evidenceVersions: Object.fromEntries(evidence.map((item) => [item.evidenceId, item.evidenceVersion])), reason, policyVersion: input.policy.schemaVersion, applicationOwner: family === "volume_adjustment" ? "Mesocycle" : "Microcycle", provenance: [`mesocycle:${input.policy.mesocycleId}`, `policy:${input.policy.schemaVersion}`, `evidence-state:${input.evidenceState}`], family, disposition } as CanonicalProgressIntervention;
}

export function evaluateCanonicalVolumeIntervention(input: Input): Result {
  if (input.evidenceState !== "fresh") return { status: "resolved", reason: `volume_evidence_${input.evidenceState}`, intervention: base(input, "volume_adjustment", `volume_evidence_${input.evidenceState}`, input.evidenceState === "missing" || input.evidenceState === "insufficient" ? "review" : "review") };
  if (input.policy.volume.progression === "hold") return { status: "resolved", reason: "mesocycle_volume_policy_hold", intervention: base(input, "volume_adjustment", "mesocycle_volume_policy_hold", "maintain") };
  return { status: "resolved", reason: "volume_magnitude_or_bounds_not_approved", intervention: base(input, "volume_adjustment", "volume_magnitude_or_bounds_not_approved", "review") };
}

export function evaluateCanonicalRotationIntervention(input: Input): Result {
  const reason = input.evidenceState === "fresh" ? "approved_microcycle_rotation_edge_unavailable" : `rotation_evidence_${input.evidenceState}`;
  return { status: "resolved", reason, intervention: base(input, "microcycle_rotation", reason, input.evidenceState === "fresh" ? "review" : "review") };
}
