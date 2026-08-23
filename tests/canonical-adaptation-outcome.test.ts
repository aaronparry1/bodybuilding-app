import { describe, expect, it } from "vitest";
import { evaluateCanonicalAdaptationOutcome } from "@/domain/training/canonical-adaptation-outcome";

const decision = {
  schemaVersion: "canonical_progress_decision_v1", decisionId: "decision-1", planId: "plan-1", expectedPlanRevision: 1,
  macrocycleId: "macro-1", mesocycleId: "meso-1", microcycleId: "micro-1", evaluationId: "evaluation-1",
  evidenceIds: ["source-1"], outcome: "continue", owner: "mesocycle", reason: "progress", explanation: "Progress reps.", status: "consumed",
  phaseOne: {
    schemaVersion: "canonical_coaching_decision_details_v1", decisionType: "advance_microcycle", sourceRecordedSessionId: "session-1",
    sourcePrescriptionHash: "hash", reasonCodes: ["three_comparable_successful_exposures_progress_repetitions"],
    evidenceSummary: { targetCompletion: "successful", comparableExposureCount: 3, repDropOff: false, recoveryEvidence: "stable", transitionEligible: false, deloadEligible: false },
    priorFutureSessionIds: ["future-1"], result: "future_prescription_change",
    boundedAdjustment: { kind: "construct_next_microcycle", exerciseIds: ["bench"], numericLoadAdjustmentAuthorised: true, numericDecisions: [{
      schemaVersion: "canonical_numeric_prescription_decision_v1", policyId: "canonical_numeric_progression_policy_v1", outcome: "progress_repetitions", comparableExposureKey: "bench-key", exerciseId: "bench", planSessionIndex: 0, sessionRole: "Upper", constructionRole: "primary", exerciseRole: "press", lane: "strength", method: "straight_sets", progressionRule: "rep_progression", evidenceIds: ["source-1"], exposureCount: 3, successfulExposureCount: 3, failedExposureCount: 0, reasonCode: "progress", before: { prescribedBaseLoad: 80, exactTargets: [6] }, after: { prescribedBaseLoad: 80, exactTargets: [7] }, exactNumericDelta: { loadKg: 0, repetitions: [1] },
    }] },
    contextIdentity: { macrocycleId: "macro-1", mesocycleId: "meso-1", microcycleId: "micro-1" }, decidedAt: "2026-01-01T00:00:00.000Z", idempotencyKey: "decision-1",
    adaptationAudit: { schemaVersion: "canonical_adaptation_audit_v1", athleteId: "athlete-1", scope: { kind: "exercise", exerciseIds: ["bench"] }, evidenceWindow: { evidenceIds: ["source-1"], comparableExposureCount: 3 }, signals: ["progress"], evidenceState: "sufficient", changes: [{ exerciseId: "bench", variable: "repetitions", before: { prescribedBaseLoad: 80, exactTargets: [6] }, after: { prescribedBaseLoad: 80, exactTargets: [7] } }], bounds: ["one_numeric_variable_per_exercise"], authorityVersion: "canonical_adaptation_policy_v1", explanation: { observation: "Targets met.", decision: "Progress reps.", nextAction: "Perform seven reps." } },
  },
} as const;

function performance(sessionId: string, id: string, reps: number) {
  return { schemaVersion: "canonical_progress_evidence_v1", evidenceId: id, planId: "plan-1", planRevision: 2, macrocycleId: "macro-1", mesocycleId: "hypertrophy_base", microcycleId: "micro-2", sessionId, slotId: "slot-1", athleteId: "athlete-1", observedAt: `2026-01-0${sessionId.endsWith("2") ? 2 : 3}T00:00:00.000Z`, source: id, kind: "performance", observations: { comparableExposureKey: "bench-key", completion: "complete", reps, prescribedTargetReps: 7, effort: 8 }, evidenceVersion: "progress_v1" } as const;
}

describe("adaptation outcome evaluation", () => {
  it("requires two later comparable exposures and classifies a productive response", () => {
    expect(evaluateCanonicalAdaptationOutcome({ decision, evidence: [performance("session-2", "later-1", 7)] })).toBeUndefined();
    const outcome = evaluateCanonicalAdaptationOutcome({ decision, evidence: [performance("session-2", "later-1", 7), performance("session-3", "later-2", 8)] });
    expect(outcome).toMatchObject({ status: "productive", comparableExposureCount: 2, reasonCode: "two_subsequent_comparable_targets_achieved" });
  });

  it("classifies repeated misses without mutating or re-scoring the source decision", () => {
    const outcome = evaluateCanonicalAdaptationOutcome({ decision, evidence: [performance("session-2", "later-1", 5), performance("session-3", "later-2", 6)] });
    expect(outcome?.status).toBe("unsuccessful");
    expect(decision.phaseOne.boundedAdjustment.numericDecisions[0].after.exactTargets).toEqual([7]);
  });
});
