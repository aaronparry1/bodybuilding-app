import { applyCanonicalCompletionVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { applyCanonicalSupersetMutation, recordCanonicalSupersetShadowEvaluation } from "@/application/training/canonical-superset-application";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";
import type { CanonicalSupersetFutureMutationProposal, CanonicalSupersetMutation } from "@/domain/training/canonical-superset-future-mutation";
import { createCanonicalStraightSetStructure } from "@/domain/training/canonical-training-method-policy";

export type CanonicalSupersetCertificationFixture = "member_a_progress" | "round_rest_increase" | "pair_removal" | "held_shadow";

export function applyCanonicalSupersetCertificationFixture(kind: CanonicalSupersetCertificationFixture, fixturePlanId = `design-qa:superset:${kind}`) {
  const planId = fixturePlanId;
  canonicalSupersetApplicationRepository.clear();
  applyCanonicalCompletionVisualState("pr", { planId, now: "2026-08-29T08:00:00.000Z" });
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved" || !loaded.carrier.plannedSessions[0]) throw new Error("superset_fixture_plan_unavailable");
  const pairedSessions = seedPair(loaded.carrier.plannedSessions);
  const nextRevision = loaded.carrier.revision + 1;
  const seeded = canonicalActivePlanV2Repository.saveAtomically({ ...loaded.carrier, revision: nextRevision, updatedAt: "2026-08-29T08:01:00.000Z", plannedSessions: pairedSessions, progress: { ...loaded.carrier.progress, revision: nextRevision } }, loaded.carrier.revision);
  if (seeded.status !== "saved") throw new Error(`superset_fixture_pair_seed_failed:${"reason" in seeded ? seeded.reason : seeded.status}`);
  const proposal = proposalFor(kind, seeded.carrier.revision, seeded.carrier.planId, seeded.carrier.plannedSessions);
  const result = kind === "held_shadow"
    ? recordCanonicalSupersetShadowEvaluation(proposal, "2026-08-29T08:02:00.000Z")
    : applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-29T08:02:00.000Z", authority: "shadow_certification" });
  canonicalActivePlanState.refresh();
  const historical = (canonicalActivePlanState.getReadModel()?.historicalRecordedSessions ?? []).at(-1);
  return { fixtureId: kind, planId, recordedSessionId: historical?.recordedSessionId ?? null, result };
}

function seedPair(sessions: readonly CanonicalPlannedSessionSnapshot[]): readonly CanonicalPlannedSessionSnapshot[] {
  const target = sessions[0];
  if (!target) throw new Error("superset_fixture_target_unavailable");
  const snapshot = target.prescriptionSnapshot as Record<string, unknown>;
  const slots = (snapshot.slots as Record<string, unknown>[]).map((slot) => ({ ...slot }));
  if (slots.length < 2) throw new Error("superset_fixture_requires_two_slots");
  const groupId = "qa-certified-pair";
  const ids = [String(slots[0]!.exerciseId), String(slots[1]!.exerciseId)];
  for (const [index, position] of [1, 2].entries()) slots[index] = { ...slots[index]!, method: "antagonist_superset", methodStructure: { kind: "linked_rounds", policyId: "canonical_training_method_policy_v1", method: "antagonist_superset", groupId, position, groupSize: 2, rounds: 3, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseName: ids[1 - index], pairedExerciseId: ids[1 - index], executionLabel: position === 1 ? "A1" : "A2", reasonCodes: ["qa_certification_fixture"] } };
  return sessions.map((session, index) => index === 0 ? { ...session, prescriptionSnapshot: { ...snapshot, estimatedDurationMinutes: 60, slots } } : session);
}

function proposalFor(kind: CanonicalSupersetCertificationFixture, revision: number, planId: string, sessions: readonly CanonicalPlannedSessionSnapshot[]): CanonicalSupersetFutureMutationProposal {
  const target = sessions[0]!;
  const snapshot = target.prescriptionSnapshot as Record<string, unknown>;
  const slots = (snapshot.slots as Record<string, unknown>[]).map((slot) => ({ ...slot }));
  const first = slots[0]!;
  const second = slots[1]!;
  let mutations: readonly CanonicalSupersetMutation[] = [];
  let pairStateAfter: "paired" | "straight" = "paired";
  let restAfterSeconds = 60;
  let durationDelta = 0;
  if (kind === "member_a_progress") {
    const before = Number(first.targetReps ?? 8);
    first.targetReps = before + 1;
    mutations = [{ member: "a", exerciseId: String(first.exerciseId), slotId: String(first.id), mutationType: "progress_repetitions", field: "targetReps", before, after: before + 1, equipmentIncrement: null, roundingBasis: "one_repetition" }];
  } else if (kind === "round_rest_increase") {
    restAfterSeconds = 90;
    durationDelta = 1;
    for (const slot of [first, second]) slot.methodStructure = { ...(slot.methodStructure as Record<string, unknown>), interRoundRestSeconds: 90 };
    mutations = [{ member: "pair", exerciseId: null, slotId: null, mutationType: "increase_round_rest", field: "methodStructure.interRoundRestSeconds", before: 60, after: 90, equipmentIncrement: null, roundingBasis: null }];
  } else if (kind === "pair_removal") {
    pairStateAfter = "straight";
    first.method = "straight_sets"; first.methodStructure = createCanonicalStraightSetStructure(3, 90);
    second.method = "straight_sets"; second.methodStructure = createCanonicalStraightSetStructure(3, 90);
    mutations = [{ member: "pair", exerciseId: null, slotId: null, mutationType: "remove_pairing", field: "method", before: "antagonist_superset", after: "straight_sets", equipmentIncrement: null, roundingBasis: null }];
  }
  const proposedSessions = sessions.map((session, index) => index === 0 ? { ...session, prescriptionSnapshot: { ...snapshot, estimatedDurationMinutes: 60 + durationDelta, slots } } : session);
  return { schemaVersion: "canonical_superset_future_mutation_v1", originatingDecisionId: `qa-superset:${kind}`, decisionVersion: "canonical_antagonist_superset_decision_v1", policyVersion: "canonical_antagonist_superset_adaptation_v1", evidenceIds: [`qa-evidence:${kind}`], pairIdentity: [String(first.exerciseId), String(second.exerciseId)].sort().join("::"), planId, expectedPlanRevision: revision, targetMicrocycleId: target.microcycleId, targetSessionId: target.id, targetPlanSessionIndex: target.planSessionIndex, targetComparableExposureIdentity: `${target.microcycleId}:${target.planSessionIndex}:qa-pair`, pairStateBefore: "paired", pairStateAfter, restBeforeSeconds: 60, restAfterSeconds, expectedDurationDeltaMinutes: durationDelta, comparabilityConsequence: pairStateAfter === "straight" ? "pairing_history_stops_exercise_history_continues" : "continues", applicationAuthority: "shadow_only", applicationEligibility: kind === "held_shadow" ? "held" : "eligible", reason: kind === "held_shadow" ? "insufficient_comparable_evidence" : `qa_certification:${kind}`, mutations, proposedSessions };
}
