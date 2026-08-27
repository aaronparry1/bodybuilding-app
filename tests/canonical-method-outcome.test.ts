import { beforeEach, describe, expect, it } from "vitest";
import { canonicalMethodOutcomeRepository } from "@/data/local/canonical-method-outcome-repository";
import { methodOutcomeFromPerformanceEvidence, validateCanonicalMethodOutcome } from "@/domain/training/canonical-method-outcome";
import type { CanonicalProgressEvidence } from "@/domain/training/canonical-progress-evidence";

describe("canonical method outcome", () => {
  beforeEach(() => canonicalMethodOutcomeRepository.clear());

  it("retains independent superset member identity and remains shadow-only", () => {
    const outcome = methodOutcomeFromPerformanceEvidence(evidence());
    expect(outcome).toMatchObject({
      outcomeId: "session:evidence:set-a:method-outcome",
      exerciseId: "bench",
      groupIdentity: "pair-1",
      groupPosition: 1,
      pairComparableIdentity: "bench::row",
      setRole: "paired_round",
      prescribedLoad: 80,
      prescribedRepetitions: 8,
      performedLoad: 80,
      performedRepetitions: 9,
      exercisePerformance: "exceeded",
      methodExecution: "observed",
      decisionAuthority: "shadow_only",
      affectsFutureMethodAssignment: false,
    });
    expect(outcome?.actualRestSeconds).toBeNull();
    expect(validateCanonicalMethodOutcome({ ...outcome, decisionAuthority: "production" })).toEqual({ status: "invalid", reason: "method_outcome_authority_not_certified" });
  });

  it("replaces corrected effective evidence without double-counting", () => {
    const original = methodOutcomeFromPerformanceEvidence(evidence())!;
    const corrected = methodOutcomeFromPerformanceEvidence(evidence({
      observedAt: "2026-08-27T10:05:00.000Z",
      source: "ledger-reconciliation:repair-1",
      observations: { ...evidence().observations, reps: 7, correctionProvenance: "corrected", executionEventId: "repair-1", originalExecutionEventId: "performance-1" },
    }))!;
    expect(canonicalMethodOutcomeRepository.saveEffective(original).status).toBe("saved");
    expect(canonicalMethodOutcomeRepository.saveEffective(corrected).status).toBe("replaced");
    expect(canonicalMethodOutcomeRepository.saveEffective(corrected).status).toBe("duplicate");
    expect(canonicalMethodOutcomeRepository.list("plan")).toHaveLength(1);
    expect(canonicalMethodOutcomeRepository.list("plan")[0]).toMatchObject({ performedRepetitions: 7, correctionProvenance: "corrected", originalExecutionEventId: "performance-1" });
  });

  it("fails closed for old evidence without a comparable exposure identity", () => {
    const legacy = methodOutcomeFromPerformanceEvidence(evidence({ observations: { ...evidence().observations, comparableExposureKey: "" } }))!;
    expect(legacy).toMatchObject({ evidenceConfidence: "incomplete", adaptationEligible: false, affectsNextComparableExposure: false });
  });
});

function evidence(overrides: Partial<CanonicalProgressEvidence> = {}): CanonicalProgressEvidence {
  return {
    schemaVersion: "canonical_progress_evidence_v1",
    evidenceId: "session:evidence:set-a",
    planId: "plan",
    planRevision: 1,
    macrocycleId: "macro",
    mesocycleId: "hypertrophy_accumulation" as never,
    microcycleId: "micro-1",
    sessionId: "session",
    slotId: "slot-a",
    athleteId: "athlete",
    observedAt: "2026-08-27T10:00:00.000Z",
    source: "ledger-reconciliation:performance-1",
    kind: "performance",
    observations: {
      exerciseId: "bench",
      comparableExposureKey: "bench:push:primary",
      method: "antagonist_superset",
      methodContractVersion: "antagonist_superset_v1",
      methodGroupIdentity: "pair-1",
      methodGroupPosition: 1,
      pairedExerciseId: "row",
      setRole: "paired_round",
      setOrder: 1,
      prescribedSetLoad: 80,
      prescribedTargetReps: 8,
      prescribedRestSeconds: 120,
      actualRestSeconds: null,
      reps: 9,
      load: 80,
      completion: "complete",
      correctionProvenance: "original",
      substitutionId: null,
      executionEventId: "performance-1",
    },
    evidenceVersion: "progress_v1",
    ...overrides,
  };
}
