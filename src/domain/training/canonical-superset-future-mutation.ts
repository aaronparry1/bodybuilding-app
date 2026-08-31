import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { CanonicalSupersetShadowDecision } from "@/domain/training/canonical-antagonist-superset-adaptation";
import { createCanonicalStraightSetStructure } from "@/domain/training/canonical-training-method-policy";

export const CANONICAL_SUPERSET_MUTATION_CONTRACT = "canonical_superset_future_mutation_v1" as const;

export type CanonicalSupersetMutation = Readonly<{
  member: "a" | "b" | "pair";
  exerciseId: string | null;
  slotId: string | null;
  mutationType: "progress_load" | "progress_repetitions" | "regress_load" | "regress_repetitions" | "increase_round_rest" | "remove_pairing";
  field: string;
  before: unknown;
  after: unknown;
  equipmentIncrement: number | null;
  roundingBasis: string | null;
}>;

export type CanonicalSupersetFutureMutationProposal = Readonly<{
  schemaVersion: typeof CANONICAL_SUPERSET_MUTATION_CONTRACT;
  originatingDecisionId: string;
  decisionVersion: string;
  policyVersion: string;
  evidenceIds: readonly string[];
  pairIdentity: string;
  planId: string;
  expectedPlanRevision: number;
  targetMicrocycleId: string | null;
  targetSessionId: string | null;
  targetPlanSessionIndex: number | null;
  targetComparableExposureIdentity: string | null;
  pairStateBefore: "paired" | null;
  pairStateAfter: "paired" | "straight" | null;
  restBeforeSeconds: number | null;
  restAfterSeconds: number | null;
  expectedDurationDeltaMinutes: number;
  comparabilityConsequence: "continues" | "pairing_history_stops_exercise_history_continues" | "unresolved";
  applicationAuthority: "shadow_only" | "production";
  applicationEligibility: "eligible" | "held" | "rejected";
  reason: string;
  mutations: readonly CanonicalSupersetMutation[];
  proposedSessions: readonly CanonicalPlannedSessionSnapshot[];
}>;

export function proposeCanonicalSupersetFutureMutation(input: Readonly<{
  decision: CanonicalSupersetShadowDecision;
  planRevision?: number;
  sessions: readonly CanonicalPlannedSessionSnapshot[];
  startedSessionIds?: readonly string[];
  sessionDurationCeilingMinutes?: number;
  equipmentIncrementByExercise?: Readonly<Record<string, number>>;
  applicationAuthority?: "shadow_only" | "production";
}>): CanonicalSupersetFutureMutationProposal {
  const base = { ...baseProposal(input.decision, input.sessions, input.planRevision ?? 0), applicationAuthority: input.applicationAuthority ?? "shadow_only" };
  if (input.decision.decisionAuthority !== "shadow_only" || input.decision.eligibleForProductionApplication !== false) return { ...base, applicationEligibility: "rejected", reason: "uncertified_decision_authority" };
  if (["hold", "delay_for_evidence"].includes(input.decision.action)) return { ...base, applicationEligibility: "held", reason: input.decision.reason };
  const started = new Set(input.startedSessionIds ?? []);
  const matches = input.sessions.filter((session) => !started.has(session.id) && resolvePair(session, input.decision.pairIdentity));
  if (!matches.length) return { ...base, applicationEligibility: "held", reason: "next_comparable_pair_not_available" };
  const firstIndex = Math.min(...matches.map((item) => item.planSessionIndex));
  const firstMatches = matches.filter((item) => item.planSessionIndex === firstIndex);
  if (firstMatches.length !== 1) return { ...base, applicationEligibility: "rejected", reason: "future_pair_target_ambiguous" };
  const target = firstMatches[0]!;
  const pair = resolvePair(target, input.decision.pairIdentity)!;
  const result = mutateTarget(input.decision, target, pair, input.equipmentIncrementByExercise ?? {});
  if (result.status !== "changed") return { ...base, applicationEligibility: result.status, reason: result.reason };
  const existingDuration = Number((target.prescriptionSnapshot as Record<string, unknown>).estimatedDurationMinutes ?? 0);
  const ceiling = input.sessionDurationCeilingMinutes;
  if (ceiling && existingDuration + result.durationDeltaMinutes > ceiling) return { ...base, applicationEligibility: "held", reason: "session_duration_ceiling_would_be_exceeded" };
  const proposedSessions = input.sessions.map((session) => session.id === target.id ? result.session : session);
  return {
    ...base,
    targetMicrocycleId: target.microcycleId,
    targetSessionId: target.id,
    targetPlanSessionIndex: target.planSessionIndex,
    targetComparableExposureIdentity: `${target.microcycleId}:${target.planSessionIndex}:${input.decision.pairIdentity}`,
    pairStateBefore: "paired",
    pairStateAfter: result.pairStateAfter,
    restBeforeSeconds: pair.restSeconds,
    restAfterSeconds: result.restAfterSeconds,
    expectedDurationDeltaMinutes: result.durationDeltaMinutes,
    comparabilityConsequence: result.pairStateAfter === "straight" ? "pairing_history_stops_exercise_history_continues" : "continues",
    applicationEligibility: "eligible",
    reason: `exact_future_mutation:${input.decision.reason}`,
    mutations: result.mutations,
    proposedSessions,
  };
}

type PairTarget = Readonly<{ left: Record<string, unknown>; right: Record<string, unknown>; leftIndex: number; rightIndex: number; restSeconds: number; rounds: number }>;

function resolvePair(session: CanonicalPlannedSessionSnapshot, pairIdentity: string): PairTarget | null {
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Record<string, unknown>[] : [];
  const candidates = slots.flatMap((slot, index) => {
    const structure = slot.methodStructure as Record<string, unknown> | undefined;
    if (slot.method !== "antagonist_superset" || structure?.kind !== "linked_rounds" || Number(structure.position) !== 1 || !structure.pairedExerciseId) return [];
    const semantic = [String(slot.exerciseId), String(structure.pairedExerciseId)].sort().join("::");
    const rightIndex = slots.findIndex((item) => {
      const other = item.methodStructure as Record<string, unknown> | undefined;
      return item.method === "antagonist_superset" && other?.kind === "linked_rounds" && Number(other.position) === 2 && String(other.groupId) === String(structure.groupId) && String(item.exerciseId) === String(structure.pairedExerciseId);
    });
    return semantic === pairIdentity && rightIndex >= 0 ? [{ left: slot, right: slots[rightIndex]!, leftIndex: index, rightIndex, restSeconds: Number(structure.interRoundRestSeconds ?? 0), rounds: Number(structure.rounds ?? 0) }] : [];
  });
  return candidates.length === 1 ? candidates[0]! : null;
}

function mutateTarget(decision: CanonicalSupersetShadowDecision, session: CanonicalPlannedSessionSnapshot, pair: PairTarget, increments: Readonly<Record<string, number>>): Readonly<{ status: "changed"; session: CanonicalPlannedSessionSnapshot; mutations: readonly CanonicalSupersetMutation[]; pairStateAfter: "paired" | "straight"; restAfterSeconds: number; durationDeltaMinutes: number } | { status: "held" | "rejected"; reason: string }> {
  const snapshot = session.prescriptionSnapshot as Record<string, unknown>;
  const slots = (snapshot.slots as Record<string, unknown>[]).map((item) => ({ ...item }));
  const mutations: CanonicalSupersetMutation[] = [];
  let durationDeltaMinutes = 0;
  let restAfterSeconds = pair.restSeconds;
  let pairStateAfter: "paired" | "straight" = "paired";
  const members: Array<Readonly<{ member: "a" | "b"; exerciseId: string }>> = decision.action === "progress_both"
    ? [{ member: "a", exerciseId: decision.exerciseAId }, { member: "b", exerciseId: decision.exerciseBId }]
    : decision.action === "progress_a_only" || decision.action === "regress_a_only" ? [{ member: "a", exerciseId: decision.exerciseAId }]
      : decision.action === "progress_b_only" || decision.action === "regress_b_only" ? [{ member: "b", exerciseId: decision.exerciseBId }] : [];
  if (members.length) {
    for (const member of members) {
      const index = [pair.leftIndex, pair.rightIndex].find((candidate) => String(slots[candidate]?.exerciseId) === member.exerciseId) ?? -1;
      if (index < 0) return { status: "rejected", reason: "future_member_slot_unavailable" };
      const slot = slots[index]!;
      const regression = decision.action.startsWith("regress_");
      const changed = mutateMember(slot, member.member, regression, member.exerciseId, increments[member.exerciseId]);
      if (!changed) return { status: "held", reason: "member_has_no_safe_bounded_numeric_mutation" };
      slots[index] = changed.slot;
      mutations.push(changed.mutation);
    }
  } else if (decision.action === "increase_between_round_rest") {
    restAfterSeconds = Math.min(180, pair.restSeconds + 30);
    if (restAfterSeconds === pair.restSeconds) return { status: "held", reason: "bounded_round_rest_ceiling_reached" };
    for (const index of [pair.leftIndex, pair.rightIndex]) {
      const structure = slots[index]!.methodStructure as Record<string, unknown>;
      slots[index] = { ...slots[index]!, methodStructure: { ...structure, interRoundRestSeconds: restAfterSeconds } };
    }
    durationDeltaMinutes = ((restAfterSeconds - pair.restSeconds) * Math.max(0, pair.rounds - 1)) / 60;
    mutations.push({ member: "pair", exerciseId: null, slotId: null, mutationType: "increase_round_rest", field: "methodStructure.interRoundRestSeconds", before: pair.restSeconds, after: restAfterSeconds, equipmentIncrement: null, roundingBasis: null });
  } else if (decision.action === "remove_pairing") {
    pairStateAfter = "straight";
    const restValues = [pair.left, pair.right].map((slot) => Number((slot.rest as Record<string, unknown> | undefined)?.seconds ?? 90));
    for (const [offset, index] of [pair.leftIndex, pair.rightIndex].entries()) {
      const settings = slots[index]!.settings as Record<string, unknown> | undefined;
      const rounds = Number(settings?.requiredSets ?? settings?.requiredWorkSets ?? pair.rounds);
      slots[index] = { ...slots[index]!, method: "straight_sets", methodStructure: createCanonicalStraightSetStructure(rounds, restValues[offset]!) };
    }
    durationDeltaMinutes = Math.max(0, (restValues[0]! + restValues[1]!) * Math.max(0, pair.rounds - 1) / 60 - pair.restSeconds * Math.max(0, pair.rounds - 1) / 60);
    mutations.push({ member: "pair", exerciseId: null, slotId: null, mutationType: "remove_pairing", field: "method", before: "antagonist_superset", after: "straight_sets", equipmentIncrement: null, roundingBasis: null });
  } else return { status: "held", reason: "unsupported_or_non_mutating_decision" };
  const estimated = Number(snapshot.estimatedDurationMinutes ?? 0);
  const nextSnapshot = { ...snapshot, ...(estimated ? { estimatedDurationMinutes: Math.ceil((estimated + durationDeltaMinutes) * 10) / 10 } : {}), slots };
  return { status: "changed", session: { ...session, prescriptionSnapshot: nextSnapshot }, mutations, pairStateAfter, restAfterSeconds, durationDeltaMinutes };
}

function mutateMember(slot: Record<string, unknown>, member: "a" | "b", regression: boolean, exerciseId: string, requestedIncrement?: number): Readonly<{ slot: Record<string, unknown>; mutation: CanonicalSupersetMutation }> | null {
  const exactTargets = Array.isArray(slot.exactTargets) ? slot.exactTargets.map(Number) : [];
  if (regression && exactTargets.length && exactTargets.every((item) => item > 1)) {
    const after = exactTargets.map((item) => item - 1);
    return { slot: { ...slot, exactTargets: after, targetReps: Math.max(1, Number(slot.targetReps ?? after[0]) - 1) }, mutation: { member, exerciseId, slotId: String(slot.id), mutationType: "regress_repetitions", field: "exactTargets", before: exactTargets, after, equipmentIncrement: null, roundingBasis: "one_repetition_per_prescribed_set" } };
  }
  const loadPrescription = slot.loadPrescription as Record<string, unknown> | undefined;
  const beforeLoad = Number(loadPrescription?.prescribedBaseLoad);
  if (!regression && Number.isFinite(beforeLoad) && beforeLoad > 0) {
    const increment = Number.isFinite(requestedIncrement) && requestedIncrement! > 0 ? requestedIncrement! : 2.5;
    const afterLoad = Math.round((beforeLoad + increment) / increment) * increment;
    return { slot: { ...slot, loadPrescription: { ...loadPrescription, prescribedBaseLoad: afterLoad }, prescribedLoad: afterLoad }, mutation: { member, exerciseId, slotId: String(slot.id), mutationType: "progress_load", field: "loadPrescription.prescribedBaseLoad", before: beforeLoad, after: afterLoad, equipmentIncrement: increment, roundingBasis: "canonical_default_external_load_increment" } };
  }
  if (!regression && exactTargets.length) {
    const after = exactTargets.map((item) => item + 1);
    return { slot: { ...slot, exactTargets: after, targetReps: Number(slot.targetReps ?? after[0]) + 1 }, mutation: { member, exerciseId, slotId: String(slot.id), mutationType: "progress_repetitions", field: "exactTargets", before: exactTargets, after, equipmentIncrement: null, roundingBasis: "one_repetition_per_prescribed_set" } };
  }
  if (regression && Number.isFinite(beforeLoad) && beforeLoad > 0) {
    const increment = Number.isFinite(requestedIncrement) && requestedIncrement! > 0 ? requestedIncrement! : 2.5;
    const afterLoad = Math.max(increment, Math.floor((beforeLoad - increment) / increment) * increment);
    return { slot: { ...slot, loadPrescription: { ...loadPrescription, prescribedBaseLoad: afterLoad }, prescribedLoad: afterLoad }, mutation: { member, exerciseId, slotId: String(slot.id), mutationType: "regress_load", field: "loadPrescription.prescribedBaseLoad", before: beforeLoad, after: afterLoad, equipmentIncrement: increment, roundingBasis: "canonical_external_load_increment" } };
  }
  return null;
}

function baseProposal(decision: CanonicalSupersetShadowDecision, sessions: readonly CanonicalPlannedSessionSnapshot[], expectedPlanRevision = 0): CanonicalSupersetFutureMutationProposal {
  return { schemaVersion: CANONICAL_SUPERSET_MUTATION_CONTRACT, originatingDecisionId: decision.decisionId, decisionVersion: decision.schemaVersion, policyVersion: decision.policyVersion, evidenceIds: decision.evidenceIds, pairIdentity: decision.pairIdentity, planId: decision.planId, expectedPlanRevision, targetMicrocycleId: null, targetSessionId: null, targetPlanSessionIndex: null, targetComparableExposureIdentity: null, pairStateBefore: null, pairStateAfter: null, restBeforeSeconds: null, restAfterSeconds: null, expectedDurationDeltaMinutes: 0, comparabilityConsequence: "unresolved", applicationAuthority: "shadow_only", applicationEligibility: "held", reason: "not_evaluated", mutations: [], proposedSessions: sessions };
}
