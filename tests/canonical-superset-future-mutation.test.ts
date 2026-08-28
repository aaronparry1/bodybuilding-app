import { describe, expect, it } from "vitest";
import { proposeCanonicalSupersetFutureMutation } from "@/domain/training/canonical-superset-future-mutation";
import type { CanonicalSupersetShadowDecision } from "@/domain/training/canonical-antagonist-superset-adaptation";
import type { CanonicalPlannedSessionSnapshot } from "@/domain/training/canonical-active-plan-carrier";

describe("canonical superset exact future mutation", () => {
  it("targets the earliest unstarted semantic pair and changes member A only", () => {
    const prior = session("past", 0);
    const next = session("next", 1);
    const result = proposeCanonicalSupersetFutureMutation({ decision: decision("progress_a_only"), sessions: [prior, next], startedSessionIds: [prior.id], equipmentIncrementByExercise: { row: 1.25 } });
    expect(result).toMatchObject({ applicationEligibility: "eligible", targetSessionId: "next", targetPlanSessionIndex: 1, pairIdentity: "press::row", pairStateAfter: "paired", expectedDurationDeltaMinutes: 0 });
    expect(result.mutations).toEqual([expect.objectContaining({ member: "a", exerciseId: "row", mutationType: "progress_load", before: 50, after: 51.25, equipmentIncrement: 1.25 })]);
    const slots = (result.proposedSessions[1]!.prescriptionSnapshot as { slots: Array<Record<string, unknown>> }).slots;
    expect((slots[0]!.loadPrescription as Record<string, unknown>).prescribedBaseLoad).toBe(51.25);
    expect((slots[1]!.loadPrescription as Record<string, unknown>).prescribedBaseLoad).toBe(40);
  });

  it("progresses both members independently without changing grouping or volume", () => {
    const result = proposeCanonicalSupersetFutureMutation({ decision: decision("progress_both"), sessions: [session("next", 0)] });
    expect(result.mutations.map((item) => [item.member, item.before, item.after])).toEqual([["a", 50, 52.5], ["b", 40, 42.5]]);
    const slots = (result.proposedSessions[0]!.prescriptionSnapshot as { slots: Array<Record<string, unknown>> }).slots;
    expect(slots).toHaveLength(3);
    expect(slots.slice(0, 2).every((item) => item.method === "antagonist_superset")).toBe(true);
    expect(slots.map((item) => (item.settings as Record<string, unknown>).requiredSets)).toEqual([3, 3, 3]);
  });

  it("applies one bounded group-level rest increase and updates duration", () => {
    const result = proposeCanonicalSupersetFutureMutation({ decision: decision("increase_between_round_rest"), sessions: [session("next", 0)], sessionDurationCeilingMinutes: 61 });
    expect(result).toMatchObject({ applicationEligibility: "eligible", restBeforeSeconds: 60, restAfterSeconds: 90, expectedDurationDeltaMinutes: 1 });
    expect(result.mutations).toHaveLength(1);
    expect(result.mutations[0]).toMatchObject({ member: "pair", mutationType: "increase_round_rest", before: 60, after: 90 });
    expect((result.proposedSessions[0]!.prescriptionSnapshot as Record<string, unknown>).estimatedDurationMinutes).toBe(61);
  });

  it("holds a rest increase that would exceed the session ceiling", () => {
    expect(proposeCanonicalSupersetFutureMutation({ decision: decision("increase_between_round_rest"), sessions: [session("next", 0)], sessionDurationCeilingMinutes: 60 })).toMatchObject({ applicationEligibility: "held", reason: "session_duration_ceiling_would_be_exceeded", mutations: [] });
  });

  it("removes the pair coherently while retaining both exercises and histories", () => {
    const result = proposeCanonicalSupersetFutureMutation({ decision: decision("remove_pairing"), sessions: [session("next", 0)], sessionDurationCeilingMinutes: 65 });
    expect(result).toMatchObject({ applicationEligibility: "eligible", pairStateAfter: "straight", comparabilityConsequence: "pairing_history_stops_exercise_history_continues" });
    expect(result.mutations).toEqual([expect.objectContaining({ member: "pair", mutationType: "remove_pairing" })]);
    const slots = (result.proposedSessions[0]!.prescriptionSnapshot as { slots: Array<Record<string, unknown>> }).slots;
    expect(slots.slice(0, 2).map((item) => [item.exerciseId, item.method, (item.methodStructure as Record<string, unknown>).kind])).toEqual([["row", "straight_sets", "standalone"], ["press", "straight_sets", "standalone"]]);
  });

  it("fails closed for absent, started, or ambiguous future targets", () => {
    expect(proposeCanonicalSupersetFutureMutation({ decision: decision("progress_a_only"), sessions: [session("started", 0)], startedSessionIds: ["started"] })).toMatchObject({ applicationEligibility: "held", reason: "next_comparable_pair_not_available" });
    expect(proposeCanonicalSupersetFutureMutation({ decision: decision("progress_a_only"), sessions: [session("wrong", 0, "curl", "extension")] })).toMatchObject({ applicationEligibility: "held", reason: "next_comparable_pair_not_available" });
    expect(proposeCanonicalSupersetFutureMutation({ decision: decision("progress_a_only"), sessions: [session("one", 0), session("two", 0)] })).toMatchObject({ applicationEligibility: "rejected", reason: "future_pair_target_ambiguous" });
  });
});

function decision(action: CanonicalSupersetShadowDecision["action"]): CanonicalSupersetShadowDecision {
  return { schemaVersion: "canonical_antagonist_superset_decision_v1", policyVersion: "canonical_antagonist_superset_adaptation_v1", decisionId: `decision:${action}`, planId: "plan", pairIdentity: "press::row", exerciseAId: "row", exerciseBId: "press", evidenceIds: ["evidence-a", "evidence-b"], evidenceFingerprint: `fingerprint:${action}`, comparableExposureCount: 3, memberA: { successfulExposures: 3, regressedExposures: 0, laneOutcome: "progress_candidate" }, memberB: { successfulExposures: 3, regressedExposures: 0, laneOutcome: "progress_candidate" }, outcomeClassification: "fixture", recoverySufficiency: "adequate", pairingSuitability: action === "remove_pairing" ? "remove_candidate" : "retain", adaptationConfidence: "sufficient", action, reason: "fixture_reason", decisionAuthority: "shadow_only", eligibleForProductionApplication: false, boundaryBehaviour: "retain_until_resolved" };
}

function session(id: string, planSessionIndex: number, left = "row", right = "press"): CanonicalPlannedSessionSnapshot {
  const groupId = `method-group:${id}`;
  const linked = (position: 1 | 2, pairedExerciseId: string) => ({ kind: "linked_rounds", policyId: "canonical_training_method_policy_v1", method: "antagonist_superset", groupId, position, groupSize: 2, rounds: 3, intraMethodRestSeconds: 0, interRoundRestSeconds: 60, pairedExerciseId, pairedExerciseName: pairedExerciseId, executionLabel: "fixture", reasonCodes: ["fixture"] });
  const slot = (index: number, exerciseId: string, load: number, structure: Record<string, unknown>) => ({ id: `${id}:slot:${index}`, index, exerciseId, exerciseRole: "accessory", constructionRole: "accessory", lane: "hypertrophy", method: "antagonist_superset", methodStructure: structure, settings: { requiredSets: 3 }, targetReps: 10, exactTargets: [10, 10, 10], loadPrescription: { state: "established", prescribedBaseLoad: load, baseUnit: "kg", loadingMode: "external_load" }, prescribedLoad: load, rest: { seconds: 90 } });
  return { id, microcycleId: "micro-next", planSessionIndex, role: "upper", kind: "planned", status: "planned", constructionVersion: "fixture", revision: 1, prescriptionSnapshot: { schemaVersion: "canonical_session_snapshot_v3", sessionId: id, role: "upper", planSessionIndex, estimatedDurationMinutes: 60, slots: [slot(0, left, 50, linked(1, right)), slot(1, right, 40, linked(2, left)), { ...slot(2, "lateral-raise", 10, { kind: "standalone", method: "straight_sets", rounds: 3 }), method: "straight_sets" }] } };
}
