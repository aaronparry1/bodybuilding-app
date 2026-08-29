import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalPlanVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { applyCanonicalSupersetMutation, recordCanonicalSupersetShadowEvaluation } from "@/application/training/canonical-superset-application";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import type { CanonicalSupersetFutureMutationProposal } from "@/domain/training/canonical-superset-future-mutation";

describe("canonical superset durable application protocol", () => {
  beforeEach(() => canonicalSupersetApplicationRepository.clear());

  it("keeps shadow authority unable to mutate the plan", () => {
    const proposal = fixture("disabled");
    const before = canonicalActivePlanV2Repository.get();
    expect(applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "disabled" })).toMatchObject({ status: "held", reason: "superset_production_authority_disabled" });
    expect(canonicalActivePlanV2Repository.get()).toEqual(before);
    expect(canonicalSupersetApplicationRepository.get(proposal.originatingDecisionId).status).toBe("not_found");
  });

  it("durably records mounted shadow evaluation without changing plan revision", () => {
    const proposal = fixture("mounted-shadow");
    const before = canonicalActivePlanV2Repository.get();
    const first = recordCanonicalSupersetShadowEvaluation(proposal, "2026-08-28T12:00:00.000Z");
    expect(first).toEqual({ status: "held", reason: "shadow_authority_no_plan_write" });
    expect(canonicalSupersetApplicationRepository.get(proposal.originatingDecisionId)).toMatchObject({ status: "found", record: { status: "held", terminalReason: "shadow_authority_no_plan_write", proposal } });
    expect(canonicalActivePlanV2Repository.get()).toEqual(before);
    expect(recordCanonicalSupersetShadowEvaluation(proposal, "2026-08-28T12:05:00.000Z")).toEqual(first);
    expect(canonicalActivePlanV2Repository.get()).toEqual(before);
  });

  it("applies once and returns the immutable existing receipt on replay", () => {
    const proposal = fixture("once");
    const first = applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "shadow_certification" });
    expect(first).toMatchObject({ status: "applied", receipt: { originatingDecisionId: proposal.originatingDecisionId, pairIdentity: "press::row", exactMutations: proposal.mutations, appliedAuthority: "shadow_certification" } });
    expect(first.receipt?.explanation).toBe("Exercise unavailable is ready to progress next time. Exercise unavailable stays unchanged.");
    expect(first.receipt?.explanation).not.toContain("press");
    expect(first.receipt?.explanation).not.toContain("row");
    expect(first.receipt?.explanation).not.toContain("::");
    const revision = canonicalActivePlanV2Repository.get();
    const replay = applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:05:00.000Z", authority: "shadow_certification" });
    expect(replay).toMatchObject({ status: "unchanged", reason: "existing_application_receipt", receipt: first.receipt });
    expect(canonicalActivePlanV2Repository.get()).toEqual(revision);
  });

  it("recovers safely after interruption following proposal persistence", () => {
    const proposal = fixture("after-prepare");
    expect(applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "shadow_certification", crashPoint: "after_prepare" })).toMatchObject({ status: "retryable", reason: "simulated_interruption_after_prepare" });
    expect(canonicalSupersetApplicationRepository.get(proposal.originatingDecisionId)).toMatchObject({ status: "found", record: { status: "prepared" } });
    expect(applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "shadow_certification" }).status).toBe("applied");
  });

  it("reconstructs the receipt after CAS without applying another mutation", () => {
    const proposal = fixture("after-cas");
    const before = canonicalActivePlanV2Repository.get();
    if (before.status !== "saved") throw new Error("fixture missing");
    expect(applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "shadow_certification", crashPoint: "after_cas" })).toMatchObject({ status: "retryable", reason: "simulated_interruption_after_cas" });
    const afterCrash = canonicalActivePlanV2Repository.get();
    expect(afterCrash.status === "saved" && afterCrash.carrier.revision).toBe(before.carrier.revision + 1);
    const recovered = applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T12:00:00.000Z", authority: "shadow_certification" });
    expect(recovered.status).toBe("applied");
    const afterRecovery = canonicalActivePlanV2Repository.get();
    expect(afterRecovery.status === "saved" && afterRecovery.carrier.revision).toBe(before.carrier.revision + 1);
    expect(canonicalSupersetApplicationRepository.get(proposal.originatingDecisionId)).toMatchObject({ status: "found", record: { status: "applied", receipt: recovered.receipt } });
  });
});

function fixture(id: string): CanonicalSupersetFutureMutationProposal {
  applyCanonicalPlanVisualState("planned", { planId: `superset-application-${id}` });
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("fixture carrier missing");
  const target = loaded.carrier.plannedSessions[0]!;
  const snapshot = target.prescriptionSnapshot as Record<string, unknown>;
  const slots = (snapshot.slots as Record<string, unknown>[]).map((slot, index) => index === 0 ? { ...slot, targetReps: Number(slot.targetReps) + 1 } : slot);
  const proposedSessions = loaded.carrier.plannedSessions.map((session) => session.id === target.id ? { ...session, prescriptionSnapshot: { ...snapshot, slots } } : session);
  const slotId = String((slots[0] as Record<string, unknown>).id);
  return { schemaVersion: "canonical_superset_future_mutation_v1", originatingDecisionId: `decision:${id}`, decisionVersion: "canonical_antagonist_superset_decision_v1", policyVersion: "canonical_antagonist_superset_adaptation_v1", evidenceIds: ["evidence-a", "evidence-b"], pairIdentity: "press::row", planId: loaded.carrier.planId, expectedPlanRevision: loaded.carrier.revision, targetMicrocycleId: target.microcycleId, targetSessionId: target.id, targetPlanSessionIndex: target.planSessionIndex, targetComparableExposureIdentity: `${target.microcycleId}:${target.planSessionIndex}:press::row`, pairStateBefore: "paired", pairStateAfter: "paired", restBeforeSeconds: 60, restAfterSeconds: 60, expectedDurationDeltaMinutes: 0, comparabilityConsequence: "continues", applicationAuthority: "shadow_only", applicationEligibility: "eligible", reason: "fixture", mutations: [{ member: "a", exerciseId: "row", slotId, mutationType: "progress_repetitions", field: "targetReps", before: Number((snapshot.slots as Record<string, unknown>[])[0]!.targetReps), after: Number(slots[0]!.targetReps), equipmentIncrement: null, roundingBasis: "one_repetition" }], proposedSessions };
}
