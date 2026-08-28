import { describe, expect, it } from "vitest";
import { deriveAntagonistSupersetShadowDecision } from "@/domain/training/canonical-antagonist-superset-adaptation";
import type { CanonicalMethodOutcome } from "@/domain/training/canonical-method-outcome";

describe("antagonist-superset longitudinal shadow adaptation", () => {
  it("keeps paired members independent across six productive exposures", () => {
    const decision = deriveAntagonistSupersetShadowDecision(exposures(["met", "met", "met", "met", "met", "met"], ["met", "met", "met", "met", "met", "met"]));
    expect(decision).toMatchObject({ comparableExposureCount: 6, action: "progress_both", exerciseAId: "row", exerciseBId: "press", memberA: { successfulExposures: 6 }, memberB: { successfulExposures: 6 }, decisionAuthority: "shadow_only", eligibleForProductionApplication: false });
  });

  it("progresses A only when B repeatedly regresses", () => {
    const decision = deriveAntagonistSupersetShadowDecision(exposures(["met", "met", "met", "met", "met", "met"], ["met", "met", "met", "missed", "missed", "missed"]));
    expect(decision).toMatchObject({ action: "progress_a_only", reason: "member_a_progressed_while_member_b_did_not", memberB: { regressedExposures: 3 } });
  });

  it("does not infer inadequate rest when actual rest was not observed", () => {
    const decision = deriveAntagonistSupersetShadowDecision(exposures(["met", "met", "met", "missed", "missed", "missed"], ["met", "met", "met", "missed", "missed", "missed"]));
    expect(decision).toMatchObject({ action: "hold", reason: "smallest_justified_change_is_no_change" });
  });

  it("can propose rest only from repeated observed shortfall", () => {
    const outcomes = exposures(["met", "missed", "missed"], ["met", "missed", "missed"]).map((item) => ({ ...item, actualRestSeconds: 45, recoveryTimingConfidence: "reliable" as const, recoveryTimingReason: "continuous_foreground_timing" }));
    expect(deriveAntagonistSupersetShadowDecision(outcomes)).toMatchObject({ action: "increase_between_round_rest", reason: "observed_rest_shortfall_preceded_repeated_pair_regression" });
  });

  it("delays rather than adapting after one poor exposure", () => {
    expect(deriveAntagonistSupersetShadowDecision(exposures(["missed"], ["missed"]))).toMatchObject({ action: "delay_for_evidence", comparableExposureCount: 1 });
  });

  it("progresses the successful member independently while the affected lane is reviewed", () => {
    const outcomes = exposures(["met", "missed", "missed"], ["met", "met", "met"]).map(adequateRecovery);
    expect(deriveAntagonistSupersetShadowDecision(outcomes)).toMatchObject({ action: "progress_b_only", outcomeClassification: "a_regresses_b_succeeds", recoverySufficiency: "adequate", memberA: { laneOutcome: "regress_candidate" } });
  });

  it("marks pair removal only after bilateral regression despite adequate recovery", () => {
    const outcomes = exposures(["met", "missed", "missed"], ["met", "missed", "missed"]).map(adequateRecovery);
    expect(deriveAntagonistSupersetShadowDecision(outcomes)).toMatchObject({ action: "remove_pairing", outcomeClassification: "bilateral_deterioration_despite_adequate_recovery", pairingSuitability: "remove_candidate" });
  });

  it("holds bilateral regression when recovery remains unknown", () => {
    expect(deriveAntagonistSupersetShadowDecision(exposures(["met", "missed", "missed"], ["met", "missed", "missed"]))).toMatchObject({ action: "hold", outcomeClassification: "both_regress_unknown_cause", adaptationConfidence: "contradictory" });
  });

  it("invalidates pair comparability for partial and non-comparable substituted work", () => {
    const partial = exposures(["met"], ["met"]).map((item) => item.exerciseId === "press" ? { ...item, completion: "partial" as const, adaptationEligible: false } : item);
    expect(deriveAntagonistSupersetShadowDecision(partial)).toMatchObject({ action: "delay_for_evidence", outcomeClassification: "partial_group_completion", pairingSuitability: "reassess" });
    const substituted = exposures(["met", "met", "met"], ["met", "met", "met"]).map((item, index) => index === 5 ? { ...item, substitutionId: "sub", substitutionComparability: "non_comparable" as const } : item);
    expect(deriveAntagonistSupersetShadowDecision(substituted)).toMatchObject({ action: "delay_for_evidence", outcomeClassification: "non_comparable_substitution", pairingSuitability: "reassess" });
  });

  it("changes decision identity when corrected evidence changes without changing evidence ids", () => {
    const original = exposures(["met", "met", "met"], ["met", "met", "met"]);
    const corrected = original.map((item, index) => index === original.length - 1
      ? { ...item, performedRepetitions: 7, exercisePerformance: "missed" as const, setRolePerformance: "missed" as const, correctionProvenance: "corrected" as const }
      : item);
    const before = deriveAntagonistSupersetShadowDecision(original);
    const after = deriveAntagonistSupersetShadowDecision(corrected);
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    if (!before || !after) throw new Error("expected comparable superset decisions");
    expect(after.evidenceIds).toEqual(before.evidenceIds);
    expect(after.evidenceFingerprint).not.toBe(before.evidenceFingerprint);
    expect(after.decisionId).not.toBe(before.decisionId);
  });
});

function adequateRecovery(item: CanonicalMethodOutcome): CanonicalMethodOutcome {
  return { ...item, actualRestSeconds: 120, recoveryTimingConfidence: "reliable", recoveryTimingReason: "continuous_foreground_timing" };
}

function exposures(a: readonly CanonicalMethodOutcome["exercisePerformance"][], b: readonly CanonicalMethodOutcome["exercisePerformance"][]): CanonicalMethodOutcome[] {
  return a.flatMap((performance, index) => [outcome("row", 1, index, performance), outcome("press", 2, index, b[index] ?? "missed")]);
}

function outcome(exerciseId: string, position: number, exposure: number, performance: CanonicalMethodOutcome["exercisePerformance"]): CanonicalMethodOutcome {
  return {
    schemaVersion: "canonical_method_outcome_v1", policyVersion: "canonical_method_outcome_policy_v1", outcomeId: `${exerciseId}:${exposure}`, evidenceId: `evidence:${exerciseId}:${exposure}`,
    planId: "plan", planRevision: exposure, macrocycleId: "macro", mesocycleId: "meso", microcycleId: `micro-${exposure}`, sessionId: `session-${exposure}`, slotId: `slot-${position}`,
    exerciseId, comparableExposureIdentity: `${exerciseId}:accessory`, method: "antagonist_superset", methodPrescriptionVersion: "superset-v1", groupIdentity: `session-group-${exposure}`, groupPosition: position, pairComparableIdentity: "press::row",
    setRole: "paired_round", setOrder: 1, prescribedLoad: 50, prescribedRepetitions: 10, performedLoad: 50, performedRepetitions: performance === "missed" ? 8 : 10,
    prescribedRestSeconds: 120, actualRestSeconds: null, observedTransitionSeconds: null, recoveryTimingConfidence: "unreliable", recoveryTimingReason: "recovery_timing_not_started", completion: "complete", correctionProvenance: "original", substitutionId: null, substitutionComparability: "not_substituted", executionEventId: `event:${exerciseId}:${exposure}`, originalExecutionEventId: null,
    replayProvenance: "ledger-reconciliation", exercisePerformance: performance, setRolePerformance: performance, methodExecution: "observed", methodSuitability: "not_evaluated", sessionDisruption: "unknown", userContextChange: "unknown",
    evidenceConfidence: "sufficient_set_fact", adaptationEligible: true, affectsNextComparableExposure: true, affectsFutureMethodAssignment: false, decisionAuthority: "shadow_only", outcomeClassification: `antagonist_superset:${performance}`, applicableFutureSlot: `${exerciseId}:accessory`, boundaryBehaviour: "retain_until_resolved", observedAt: `2026-08-${String(exposure + 1).padStart(2, "0")}T10:00:00.000Z`,
  };
}
