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
    const outcomes = exposures(["met", "missed", "missed"], ["met", "missed", "missed"]).map((item) => ({ ...item, actualRestSeconds: 45 }));
    expect(deriveAntagonistSupersetShadowDecision(outcomes)).toMatchObject({ action: "increase_between_round_rest", reason: "observed_rest_shortfall_preceded_repeated_pair_regression" });
  });

  it("delays rather than adapting after one poor exposure", () => {
    expect(deriveAntagonistSupersetShadowDecision(exposures(["missed"], ["missed"]))).toMatchObject({ action: "delay_for_evidence", comparableExposureCount: 1 });
  });
});

function exposures(a: readonly CanonicalMethodOutcome["exercisePerformance"][], b: readonly CanonicalMethodOutcome["exercisePerformance"][]): CanonicalMethodOutcome[] {
  return a.flatMap((performance, index) => [outcome("row", 1, index, performance), outcome("press", 2, index, b[index] ?? "missed")]);
}

function outcome(exerciseId: string, position: number, exposure: number, performance: CanonicalMethodOutcome["exercisePerformance"]): CanonicalMethodOutcome {
  return {
    schemaVersion: "canonical_method_outcome_v1", policyVersion: "canonical_method_outcome_policy_v1", outcomeId: `${exerciseId}:${exposure}`, evidenceId: `evidence:${exerciseId}:${exposure}`,
    planId: "plan", planRevision: exposure, macrocycleId: "macro", mesocycleId: "meso", microcycleId: `micro-${exposure}`, sessionId: `session-${exposure}`, slotId: `slot-${position}`,
    exerciseId, comparableExposureIdentity: `${exerciseId}:accessory`, method: "antagonist_superset", methodPrescriptionVersion: "superset-v1", groupIdentity: `session-group-${exposure}`, groupPosition: position, pairComparableIdentity: "press::row",
    setRole: "paired_round", setOrder: 1, prescribedLoad: 50, prescribedRepetitions: 10, performedLoad: 50, performedRepetitions: performance === "missed" ? 8 : 10,
    prescribedRestSeconds: 120, actualRestSeconds: null, observedTransitionSeconds: null, recoveryTimingConfidence: "unreliable", recoveryTimingReason: "recovery_timing_not_started", completion: "complete", correctionProvenance: "original", substitutionId: null, executionEventId: `event:${exerciseId}:${exposure}`, originalExecutionEventId: null,
    replayProvenance: "ledger-reconciliation", exercisePerformance: performance, setRolePerformance: performance, methodExecution: "observed", methodSuitability: "not_evaluated", sessionDisruption: "unknown", userContextChange: "unknown",
    evidenceConfidence: "sufficient_set_fact", adaptationEligible: true, affectsNextComparableExposure: true, affectsFutureMethodAssignment: false, decisionAuthority: "shadow_only", outcomeClassification: `antagonist_superset:${performance}`, applicableFutureSlot: `${exerciseId}:accessory`, boundaryBehaviour: "retain_until_resolved", observedAt: `2026-08-${String(exposure + 1).padStart(2, "0")}T10:00:00.000Z`,
  };
}
