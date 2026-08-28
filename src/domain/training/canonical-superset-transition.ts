import { canonicalDeterministicFingerprintId } from "@/domain/training/canonical-deterministic-fingerprint";

export const CANONICAL_SUPERSET_TRANSITION_POLICY = "canonical_superset_transition_policy_v1" as const;
export type CanonicalSupersetBoundary = "ordinary_week" | "deload_entry" | "deload_exit" | "mesocycle_regeneration" | "hypertrophy_to_strength" | "strength_to_hypertrophy" | "powerbuilding_phase_change" | "exercise_rotation" | "split_reinterpretation" | "programme_interruption" | "return_after_missed_weeks" | "policy_version_change";
export type CanonicalSupersetTransitionDecision = Readonly<{ schemaVersion: "canonical_superset_transition_decision_v1"; transitionDecisionId: string; sourceDecisionId: string; pairIdentity: string; boundary: CanonicalSupersetBoundary; disposition: "carry" | "defer" | "remove_pairing" | "reassess" | "expire"; carryExerciseProgression: boolean; carryPairingSuitability: boolean; carryRecoveryEvidence: boolean; countBoundaryPerformanceAsOrdinaryEvidence: boolean; reason: string; policyVersion: typeof CANONICAL_SUPERSET_TRANSITION_POLICY }>;

export function decideCanonicalSupersetTransition(input: Readonly<{ sourceDecisionId: string; pairIdentity: string; boundary: CanonicalSupersetBoundary; nextPairIdentity?: string; comparableReplacement?: boolean; pendingMutation: boolean; interruptionWeeks?: number; sourcePolicyVersion: string; nextPolicyVersion: string }>): CanonicalSupersetTransitionDecision {
  let disposition: CanonicalSupersetTransitionDecision["disposition"] = "carry";
  let carryPairingSuitability = true;
  let carryRecoveryEvidence = true;
  let countBoundaryPerformanceAsOrdinaryEvidence = true;
  let reason = "same_pair_continues_into_next_ordinary_exposure";
  if (input.boundary === "deload_entry") { disposition = "defer"; countBoundaryPerformanceAsOrdinaryEvidence = false; reason = "deload_is_not_ordinary_regression_evidence"; }
  else if (input.boundary === "deload_exit" || input.boundary === "strength_to_hypertrophy" || input.boundary === "powerbuilding_phase_change" || input.boundary === "split_reinterpretation") { disposition = "reassess"; carryRecoveryEvidence = false; reason = "new_structure_requires_pair_eligibility_review"; }
  else if (input.boundary === "hypertrophy_to_strength") { disposition = "remove_pairing"; carryPairingSuitability = false; carryRecoveryEvidence = false; reason = "strength_priority_does_not_inherit_accessory_pairing_authority"; }
  else if (input.boundary === "exercise_rotation") {
    const samePair = input.nextPairIdentity === input.pairIdentity && input.comparableReplacement === true;
    disposition = samePair ? "reassess" : "expire";
    carryPairingSuitability = samePair;
    carryRecoveryEvidence = false;
    reason = samePair ? "comparable_member_change_requires_pair_reassessment" : "new_pair_cannot_inherit_prior_pair_suitability";
  } else if (input.boundary === "programme_interruption" || input.boundary === "return_after_missed_weeks") {
    disposition = (input.interruptionWeeks ?? 0) >= 3 ? "expire" : "defer";
    carryRecoveryEvidence = false;
    reason = disposition === "expire" ? "stale_pair_evidence_expired_after_interruption" : "pending_pair_decision_deferred_after_short_interruption";
  } else if (input.boundary === "policy_version_change" && input.sourcePolicyVersion !== input.nextPolicyVersion) {
    disposition = "reassess"; carryPairingSuitability = false; carryRecoveryEvidence = false; reason = "method_policy_version_changed";
  } else if (input.boundary === "mesocycle_regeneration" && input.pendingMutation) {
    disposition = "defer"; reason = "pending_mutation_retained_until_exact_comparable_slot_resolves";
  }
  return { schemaVersion: "canonical_superset_transition_decision_v1", transitionDecisionId: `superset-transition:${canonicalDeterministicFingerprintId(input)}`, sourceDecisionId: input.sourceDecisionId, pairIdentity: input.pairIdentity, boundary: input.boundary, disposition, carryExerciseProgression: true, carryPairingSuitability, carryRecoveryEvidence, countBoundaryPerformanceAsOrdinaryEvidence, reason, policyVersion: CANONICAL_SUPERSET_TRANSITION_POLICY };
}
