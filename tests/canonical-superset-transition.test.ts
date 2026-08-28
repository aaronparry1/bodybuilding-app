import { describe, expect, it } from "vitest";
import { decideCanonicalSupersetTransition, type CanonicalSupersetBoundary } from "@/domain/training/canonical-superset-transition";

describe("canonical superset block transitions", () => {
  it.each([
    ["ordinary_week", "carry", true, true],
    ["deload_entry", "defer", true, true],
    ["deload_exit", "reassess", true, false],
    ["hypertrophy_to_strength", "remove_pairing", false, false],
    ["strength_to_hypertrophy", "reassess", true, false],
    ["powerbuilding_phase_change", "reassess", true, false],
    ["split_reinterpretation", "reassess", true, false],
  ] as const)("handles %s explicitly", (boundary, disposition, carryPair, carryRecovery) => {
    expect(decide(boundary)).toMatchObject({ disposition, carryExerciseProgression: true, carryPairingSuitability: carryPair, carryRecoveryEvidence: carryRecovery });
  });

  it("never counts deload performance as ordinary regression evidence", () => expect(decide("deload_entry")).toMatchObject({ countBoundaryPerformanceAsOrdinaryEvidence: false }));

  it("does not transfer pairing evidence to a new exercise pair", () => expect(decideCanonicalSupersetTransition({ ...base("exercise_rotation"), nextPairIdentity: "curl::extension", comparableReplacement: false })).toMatchObject({ disposition: "expire", carryExerciseProgression: true, carryPairingSuitability: false, carryRecoveryEvidence: false }));

  it("retains unresolved mutation explicitly during regeneration", () => expect(decideCanonicalSupersetTransition({ ...base("mesocycle_regeneration"), pendingMutation: true })).toMatchObject({ disposition: "defer", reason: "pending_mutation_retained_until_exact_comparable_slot_resolves" }));

  it("expires stale recovery and pairing evidence after a long interruption", () => expect(decideCanonicalSupersetTransition({ ...base("return_after_missed_weeks"), interruptionWeeks: 4 })).toMatchObject({ disposition: "expire", carryExerciseProgression: true, carryRecoveryEvidence: false }));

  it("reassesses rather than silently carrying across a policy version change", () => expect(decideCanonicalSupersetTransition({ ...base("policy_version_change"), nextPolicyVersion: "v2" })).toMatchObject({ disposition: "reassess", carryPairingSuitability: false, carryRecoveryEvidence: false }));
});

function decide(boundary: CanonicalSupersetBoundary) { return decideCanonicalSupersetTransition(base(boundary)); }
function base(boundary: CanonicalSupersetBoundary) { return { sourceDecisionId: "decision", pairIdentity: "press::row", boundary, pendingMutation: false, sourcePolicyVersion: "v1", nextPolicyVersion: "v1" }; }
