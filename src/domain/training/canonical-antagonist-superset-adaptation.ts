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
  memberA: Readonly<{ successfulExposures: number; regressedExposures: number; laneOutcome: "progress_candidate" | "hold" | "regress_candidate" }>;
  memberB: Readonly<{ successfulExposures: number; regressedExposures: number; laneOutcome: "progress_candidate" | "hold" | "regress_candidate" }>;
  outcomeClassification: string;
  recoverySufficiency: "adequate" | "reliably_short" | "unknown";
  pairingSuitability: "retain" | "remove_candidate" | "reassess";
  adaptationConfidence: "sufficient" | "insufficient" | "contradictory";
  action: "progress_both" | "progress_a_only" | "progress_b_only" | "increase_between_round_rest" | "regress_a_only" | "regress_b_only" | "remove_pairing" | "hold" | "delay_for_evidence";
  reason: string;
  decisionAuthority: "shadow_only";
  eligibleForProductionApplication: false;
  boundaryBehaviour: "retain_until_resolved";
}>;

export function deriveAntagonistSupersetShadowDecision(outcomes: readonly CanonicalMethodOutcome[]): CanonicalSupersetShadowDecision | null {
  const scoped = outcomes.filter((item) => item.method === "antagonist_superset" && item.pairComparableIdentity && item.groupPosition);
  if (!scoped.length) return null;
  const head = scoped[0]!;
  const samePair = scoped.filter((item) => item.planId === head.planId && item.pairComparableIdentity === head.pairComparableIdentity);
  const memberAId = samePair.find((item) => item.groupPosition === 1)?.exerciseId;
  const memberBId = samePair.find((item) => item.groupPosition === 2)?.exerciseId;
  if (!memberAId || !memberBId || memberAId === memberBId) return null;
  const sessions = [...new Set(samePair.map((item) => item.sessionId))].sort();
  const comparableSessions = sessions.filter((sessionId) => {
    const session = samePair.filter((item) => item.sessionId === sessionId);
    return session.every((item) => item.adaptationEligible)
      && session.some((item) => item.exerciseId === memberAId)
      && session.some((item) => item.exerciseId === memberBId);
  });
  const recent = comparableSessions.slice(-3);
  const memberA = summarizeMember(samePair, memberAId, comparableSessions);
  const memberB = summarizeMember(samePair, memberBId, comparableSessions);
  const recentA = summarizeMember(samePair, memberAId, recent);
  const recentB = summarizeMember(samePair, memberBId, recent);
  const restCausality = recent.length >= 2 && recent.every((sessionId) => {
    const facts = samePair.filter((item) => item.sessionId === sessionId);
    return facts.some((item) => item.recoveryTimingConfidence === "reliable" && item.actualRestSeconds !== null && item.prescribedRestSeconds !== null && item.actualRestSeconds < item.prescribedRestSeconds);
  });
  const reliableRecovery = recent.flatMap((sessionId) => samePair.filter((item) => item.sessionId === sessionId && item.recoveryTimingConfidence === "reliable" && item.actualRestSeconds !== null && item.prescribedRestSeconds !== null));
  const recoverySufficiency: CanonicalSupersetShadowDecision["recoverySufficiency"] = restCausality ? "reliably_short"
    : reliableRecovery.length && reliableRecovery.every((item) => item.actualRestSeconds! >= item.prescribedRestSeconds!) ? "adequate" : "unknown";
  const nonComparableSubstitution = samePair.some((item) => item.substitutionComparability === "non_comparable");
  const partialGroup = samePair.some((item) => item.completion !== "complete");
  let action: CanonicalSupersetShadowDecision["action"] = "delay_for_evidence";
  let reason = comparableSessions.length < 3 ? "fewer_than_three_complete_comparable_pair_exposures" : "mixed_or_insufficient_pair_evidence";
  if (nonComparableSubstitution || partialGroup) {
    reason = nonComparableSubstitution ? "non_comparable_substitution_resets_pair_evidence" : "partial_group_completion_is_not_comparable";
  } else if (comparableSessions.length >= 3 && recentA.laneOutcome === "progress_candidate" && recentB.laneOutcome === "progress_candidate") {
    action = "progress_both";
    reason = "both_members_met_or_exceeded_three_comparable_exposures";
  } else if (comparableSessions.length >= 3 && recentA.laneOutcome === "progress_candidate" && recentB.laneOutcome !== "progress_candidate") {
    action = "progress_a_only";
    reason = "member_a_progressed_while_member_b_did_not";
  } else if (comparableSessions.length >= 3 && recentB.laneOutcome === "progress_candidate" && recentA.laneOutcome !== "progress_candidate") {
    action = "progress_b_only";
    reason = "member_b_progressed_while_member_a_did_not";
  } else if (restCausality && recentA.regressedExposures > 0 && recentB.regressedExposures > 0) {
    action = "increase_between_round_rest";
    reason = "observed_rest_shortfall_preceded_repeated_pair_regression";
  } else if (comparableSessions.length >= 3 && recoverySufficiency === "adequate" && recentA.laneOutcome === "regress_candidate" && recentB.laneOutcome === "regress_candidate") {
    action = "remove_pairing";
    reason = "bilateral_regression_persisted_despite_adequate_recovery";
  } else if (comparableSessions.length >= 3 && recoverySufficiency === "adequate" && recentA.laneOutcome === "regress_candidate") {
    action = "regress_a_only";
    reason = "member_a_regressed_despite_adequate_recovery";
  } else if (comparableSessions.length >= 3 && recoverySufficiency === "adequate" && recentB.laneOutcome === "regress_candidate") {
    action = "regress_b_only";
    reason = "member_b_regressed_despite_adequate_recovery";
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
    outcomeClassification: classifyPair(recentA.laneOutcome, recentB.laneOutcome, recoverySufficiency, nonComparableSubstitution, partialGroup),
    recoverySufficiency,
    pairingSuitability: action === "remove_pairing" ? "remove_candidate" : nonComparableSubstitution || partialGroup ? "reassess" : "retain",
    adaptationConfidence: nonComparableSubstitution || partialGroup || comparableSessions.length < 3 ? "insufficient" : recoverySufficiency === "unknown" && (recentA.laneOutcome === "regress_candidate" || recentB.laneOutcome === "regress_candidate") ? "contradictory" : "sufficient",
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
  const laneOutcome = successfulExposures === sessionIds.length && sessionIds.length >= 3 ? "progress_candidate" as const
    : regressedExposures >= 2 ? "regress_candidate" as const : "hold" as const;
  return { successfulExposures, regressedExposures, laneOutcome } as const;
}

function classifyPair(a: CanonicalSupersetShadowDecision["memberA"]["laneOutcome"], b: CanonicalSupersetShadowDecision["memberB"]["laneOutcome"], recovery: CanonicalSupersetShadowDecision["recoverySufficiency"], nonComparableSubstitution: boolean, partial: boolean): string {
  if (nonComparableSubstitution) return "non_comparable_substitution";
  if (partial) return "partial_group_completion";
  if (a === "progress_candidate" && b === "progress_candidate") return "both_members_succeed";
  if (a === "progress_candidate" && b === "hold") return "a_succeeds_b_holds";
  if (a === "progress_candidate" && b === "regress_candidate") return "a_succeeds_b_regresses";
  if (a === "hold" && b === "progress_candidate") return "a_holds_b_succeeds";
  if (a === "regress_candidate" && b === "progress_candidate") return "a_regresses_b_succeeds";
  if (a === "hold" && b === "hold") return "both_hold";
  if (a === "regress_candidate" && b === "regress_candidate" && recovery === "reliably_short") return "bilateral_deterioration_with_short_recovery";
  if (a === "regress_candidate" && b === "regress_candidate" && recovery === "adequate") return "bilateral_deterioration_despite_adequate_recovery";
  if (a === "regress_candidate" && b === "regress_candidate") return "both_regress_unknown_cause";
  return `${a}:${b}`;
}
