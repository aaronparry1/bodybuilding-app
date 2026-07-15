import type { MesocyclePrescriptionPolicy, PrescriptionMethodFamily } from "@/domain/training/mesocycle-prescription-policy";
import type { CanonicalLoadPrescription } from "@/domain/training/canonical-load-prescription";

export const CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION = "canonical_mesocycle_load_adjustment_policy_v1" as const;

export type LoadEvidenceState = "missing" | "insufficient" | "stale" | "fresh" | "conflicting" | "calibration" | "established" | "completed" | "contraindicated";
export type LoadAdjustmentPolicyResult = Readonly<{
  status: "resolved" | "manual_review_required" | "unsupported_policy";
  policyId: typeof CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION;
  reason: string;
  provenance: readonly string[];
  constraints: Readonly<{
    exactLoadOwner: "Session Construction";
    automaticAdjustment: "not_permitted" | "session_construction_owned";
    permittedDirections: readonly ("reduce" | "maintain" | "increase")[];
    productiveRangeSource: "mesocycle_target_envelope" | "unavailable";
    softCapSource: "mesocycle_dropoff_policy" | "unavailable";
    evidenceMinimum: "mesocycle_evidence_required" | "unavailable";
    freshness: "current_evidence_version" | "unavailable";
    rounding: "construction_equipment_increment" | "unavailable";
  }>;
}>;

export type CanonicalLoadAdjustmentPolicyInput = Readonly<{
  mesocycle: MesocyclePrescriptionPolicy;
  method: PrescriptionMethodFamily;
  loadingMode: string;
  prescription: CanonicalLoadPrescription;
  evidenceState: LoadEvidenceState;
  equipmentIncrementAvailable: boolean;
}>;

const baseConstraints: LoadAdjustmentPolicyResult["constraints"] = {
  exactLoadOwner: "Session Construction",
  automaticAdjustment: "not_permitted",
  permittedDirections: ["maintain"],
  productiveRangeSource: "unavailable",
  softCapSource: "unavailable",
  evidenceMinimum: "unavailable",
  freshness: "unavailable",
  rounding: "unavailable",
};

/**
 * Resolves only policy facts already owned by Mesocycle. It deliberately fails
 * closed until a source-backed bounded load-adjustment rule is approved.
 */
export function resolveCanonicalMesocycleLoadAdjustmentPolicy(input: CanonicalLoadAdjustmentPolicyInput): LoadAdjustmentPolicyResult {
  const provenance = [`mesocycle:${input.mesocycle.mesocycleId}`, `mesocycle-policy:${input.mesocycle.schemaVersion}`, `intervention-policy:${CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION}`];
  if (["bodyweight", "autoregulated", "calibration_required", "unavailable"].includes(input.prescription.state)) return { status: "manual_review_required", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: `${input.prescription.state}_requires_explicit_policy`, provenance, constraints: baseConstraints };
  if (input.prescription.state !== "established") return { status: "unsupported_policy", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: "unsupported_load_state", provenance, constraints: baseConstraints };
  if (!["straight_sets", "back_off_sets"].includes(input.method) || !input.mesocycle.progression.permitted.includes("load_progression")) return { status: "unsupported_policy", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: "method_or_progression_not_supported", provenance, constraints: baseConstraints };
  if (input.evidenceState !== "fresh" && input.evidenceState !== "established" && input.evidenceState !== "completed") return { status: "manual_review_required", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: `evidence_${input.evidenceState}_requires_review`, provenance, constraints: baseConstraints };
  if (!input.equipmentIncrementAvailable) return { status: "manual_review_required", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: "equipment_rounding_capability_unavailable", provenance, constraints: baseConstraints };
  return { status: "manual_review_required", policyId: CANONICAL_MESOCYCLE_LOAD_ADJUSTMENT_POLICY_VERSION, reason: "source_backed_bounded_adjustment_rule_not_yet_approved", provenance, constraints: baseConstraints };
}
