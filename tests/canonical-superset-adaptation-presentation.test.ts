import { beforeEach, describe, expect, it } from "vitest";
import { applyCanonicalPlanVisualState } from "@/application/design-qa/canonical-five-day-plan-fixture";
import { applyCanonicalSupersetMutation, recordCanonicalSupersetShadowEvaluation } from "@/application/training/canonical-superset-application";
import { projectCanonicalSupersetAdaptation, type CanonicalSupersetAdaptationSurface } from "@/application/training/canonical-superset-adaptation-presentation";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalSupersetApplicationRepository } from "@/data/local/canonical-superset-application-repository";
import type { CanonicalSupersetFutureMutationProposal } from "@/domain/training/canonical-superset-future-mutation";

const surfaces: readonly CanonicalSupersetAdaptationSurface[] = ["completion", "today", "preview", "progress"];

describe("receipt-derived superset adaptation presentation", () => {
  beforeEach(() => canonicalSupersetApplicationRepository.clear());

  it("uses the same persisted receipt meaning on all four surfaces", () => {
    const proposal = fixture("receipt", "production");
    const applied = applyCanonicalSupersetMutation({ proposal, appliedAt: "2026-08-28T14:00:00.000Z", authority: "production" });
    expect(applied.status).toBe("applied");
    const projections = surfaces.map((surface) => projectCanonicalSupersetAdaptation({ planId: proposal.planId, surface }));
    expect(projections.every(Boolean)).toBe(true);
    expect(new Set(projections.map((item) => item?.meaningIdentity)).size).toBe(1);
    expect(new Set(projections.map((item) => item?.explanation)).size).toBe(1);
    expect(projections[0]?.explanation).toBe(applied.receipt?.explanation);
    expect(projections.every((item) => item?.changes === applied.receipt?.exactMutations)).toBe(true);
  });

  it("never exposes shadow evaluation unless the QA caller opts in", () => {
    const proposal = fixture("shadow", "shadow_only");
    recordCanonicalSupersetShadowEvaluation(proposal, "2026-08-28T14:00:00.000Z");
    expect(projectCanonicalSupersetAdaptation({ planId: proposal.planId, surface: "today" })).toBeNull();
    expect(projectCanonicalSupersetAdaptation({ planId: proposal.planId, surface: "today", includeQaOnly: true })).toMatchObject({ state: "held", qaOnly: true, explanation: expect.stringContaining("QA only") });
  });
});

function fixture(id: string, authority: "shadow_only" | "production"): CanonicalSupersetFutureMutationProposal {
  applyCanonicalPlanVisualState("planned", { planId: `superset-presentation-${id}` });
  const loaded = canonicalActivePlanV2Repository.get();
  if (loaded.status !== "saved") throw new Error("fixture carrier missing");
  const target = loaded.carrier.plannedSessions[0]!;
  const snapshot = target.prescriptionSnapshot as Record<string, unknown>;
  const before = Number((snapshot.slots as Record<string, unknown>[])[0]!.targetReps);
  const slots = (snapshot.slots as Record<string, unknown>[]).map((slot, index) => index === 0 ? { ...slot, targetReps: before + 1 } : slot);
  const proposedSessions = loaded.carrier.plannedSessions.map((session) => session.id === target.id ? { ...session, prescriptionSnapshot: { ...snapshot, slots } } : session);
  return { schemaVersion: "canonical_superset_future_mutation_v1", originatingDecisionId: `decision:${id}`, decisionVersion: "canonical_antagonist_superset_decision_v1", policyVersion: "canonical_antagonist_superset_adaptation_v1", evidenceIds: ["evidence-a", "evidence-b"], pairIdentity: "press::row", planId: loaded.carrier.planId, expectedPlanRevision: loaded.carrier.revision, targetMicrocycleId: target.microcycleId, targetSessionId: target.id, targetPlanSessionIndex: target.planSessionIndex, targetComparableExposureIdentity: `${target.microcycleId}:${target.planSessionIndex}:press::row`, pairStateBefore: "paired", pairStateAfter: "paired", restBeforeSeconds: 60, restAfterSeconds: 60, expectedDurationDeltaMinutes: 0, comparabilityConsequence: "continues", applicationAuthority: authority, applicationEligibility: "eligible", reason: "fixture", mutations: [{ member: "a", exerciseId: "row", slotId: String(slots[0]!.id), mutationType: "progress_repetitions", field: "targetReps", before, after: before + 1, equipmentIncrement: null, roundingBasis: "one_repetition" }], proposedSessions };
}
