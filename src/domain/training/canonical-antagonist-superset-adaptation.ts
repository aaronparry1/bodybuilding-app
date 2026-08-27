import { canonicalDeterministicFingerprintId } from "@/domain/training/canonical-deterministic-fingerprint";
import type { CanonicalMethodOutcome } from "@/domain/training/canonical-method-outcome";

export const CANONICAL_SUPERSET_ADAPTATION_SCHEMA = "canonical_antagonist_superset_decision_v1" as const;
export const CANONICAL_SUPERSET_ADAPTATION_POLICY = "canonical_antagonist_superset_adaptation_v1" as const;

export type CanonicalSupersetShadowDecision = Readonly<{
  schemaVersion: typeof CANONICAL_SUPERSET_ADAPTATION_SCHEMA;
  policyVersion: typeof CANONICAL_SUPERSET_ADAPTATION_POLICY;
  decisionId: string;
  planId: string;
  pairIdentity: string;
  exerciseAId: string;
  exerciseBId: string;
  evidenceIds: readonly string[];
  comparableExposureCount: number;
  memberA: Readonly<{ successfulExposures: number; regressedExposures: number }>;
  memberB: Readonly<{ successfulExposures: number; regressedExposures: number }>;
  action: "progress_both" | "progress_a_only" | "progress_b_only" | "increase_between_round_rest" | "hold" | "delay_for_evidence";
  reason: string;
  decisionAuthority: "shadow_only";
  eligibleForProductionApplication: false;
  boundaryBehaviour: "retain_until_resolved";
}>;

export function deriveAntagonistSupersetShadowDecision(outcomes: readonly CanonicalMethodOutcome[]): CanonicalSupersetShadowDecision | null {
  const eligible = outcomes.filter((item) => item.method === "antagonist_superset" && item.pairComparableIdentity && item.groupPosition && item.adaptationEligible);
  if (!eligible.length) return null;
  const head = eligible[0]!;
  const samePair = eligible.filter((item) => item.planId === head.planId && item.pairComparableIdentity === head.pairComparableIdentity);
  const memberAId = samePair.find((item) => item.groupPosition === 1)?.exerciseId;
  const memberBId = samePair.find((item) => item.groupPosition === 2)?.exerciseId;
  if (!memberAId || !memberBId || memberAId === memberBId) return null;
  const sessions = [...new Set(samePair.map((item) => item.sessionId))].sort();
  const comparableSessions = sessions.filter((sessionId) => {
    const session = samePair.filter((item) => item.sessionId === sessionId);
    return session.some((item) => item.exerciseId === memberAId) && session.some((item) => item.exerciseId === memberBId);
  });
  const recent = comparableSessions.slice(-3);
  const memberA = summarizeMember(samePair, memberAId, comparableSessions);
  const memberB = summarizeMember(samePair, memberBId, comparableSessions);
  const recentA = summarizeMember(samePair, memberAId, recent);
  const recentB = summarizeMember(samePair, memberBId, recent);
  const restCausality = recent.length >= 2 && recent.every((sessionId) => {
    const facts = samePair.filter((item) => item.sessionId === sessionId);
    return facts.some((item) => item.actualRestSeconds !== null && item.prescribedRestSeconds !== null && item.actualRestSeconds < item.prescribedRestSeconds);
  });
  let action: CanonicalSupersetShadowDecision["action"] = "delay_for_evidence";
  let reason = comparableSessions.length < 3 ? "fewer_than_three_complete_comparable_pair_exposures" : "mixed_or_insufficient_pair_evidence";
  if (comparableSessions.length >= 3 && recentA.successfulExposures === 3 && recentB.successfulExposures === 3) {
    action = "progress_both";
    reason = "both_members_met_or_exceeded_three_comparable_exposures";
  } else if (comparableSessions.length >= 3 && recentA.successfulExposures === 3 && recentB.regressedExposures > 0) {
    action = "progress_a_only";
    reason = "member_a_progressed_while_member_b_did_not";
  } else if (comparableSessions.length >= 3 && recentB.successfulExposures === 3 && recentA.regressedExposures > 0) {
    action = "progress_b_only";
    reason = "member_b_progressed_while_member_a_did_not";
  } else if (restCausality && recentA.regressedExposures > 0 && recentB.regressedExposures > 0) {
    action = "increase_between_round_rest";
    reason = "observed_rest_shortfall_preceded_repeated_pair_regression";
  } else if (comparableSessions.length >= 3) {
    action = "hold";
    reason = "smallest_justified_change_is_no_change";
  }
  const evidenceIds = samePair.map((item) => item.evidenceId).sort();
  return {
    schemaVersion: CANONICAL_SUPERSET_ADAPTATION_SCHEMA,
    policyVersion: CANONICAL_SUPERSET_ADAPTATION_POLICY,
    decisionId: `superset-shadow:${canonicalDeterministicFingerprintId({ planId: head.planId, pairIdentity: head.pairComparableIdentity, evidenceIds })}`,
    planId: head.planId,
    pairIdentity: head.pairComparableIdentity!,
    exerciseAId: memberAId,
    exerciseBId: memberBId,
    evidenceIds,
    comparableExposureCount: comparableSessions.length,
    memberA,
    memberB,
    action,
    reason,
    decisionAuthority: "shadow_only",
    eligibleForProductionApplication: false,
    boundaryBehaviour: "retain_until_resolved",
  };
}

function summarizeMember(outcomes: readonly CanonicalMethodOutcome[], exerciseId: string, sessionIds: readonly string[]) {
  let successfulExposures = 0;
  let regressedExposures = 0;
  for (const sessionId of sessionIds) {
    const sets = outcomes.filter((item) => item.sessionId === sessionId && item.exerciseId === exerciseId);
    if (sets.length && sets.every((item) => item.exercisePerformance === "met" || item.exercisePerformance === "exceeded")) successfulExposures += 1;
    else if (sets.some((item) => item.exercisePerformance === "missed" || item.exercisePerformance === "partial")) regressedExposures += 1;
  }
  return { successfulExposures, regressedExposures } as const;
}
