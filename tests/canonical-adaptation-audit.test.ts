import { describe, expect, it } from "vitest";
import { adaptationAuditFromNumericDecisions, validateCanonicalAdaptationAudit } from "@/domain/training/canonical-adaptation-audit";

describe("canonical adaptation audit", () => {
  it("persists evidence, bounded before/after state, authority and explanation data", () => {
    const audit = adaptationAuditFromNumericDecisions({
      athleteId: "athlete-1",
      evidenceIds: ["evidence-3", "evidence-1", "evidence-2"],
      comparableExposureCount: 3,
      reasonCodes: ["three_comparable_successful_exposures_progress_repetitions"],
      explanation: "Three comparable targets support one bounded repetition change.",
      exerciseIds: ["bench-press"],
      decisionType: "advance_microcycle",
      recoveryEvidence: "stable",
      numericDecisions: [{
        schemaVersion: "canonical_numeric_prescription_decision_v1",
        policyId: "canonical_numeric_progression_policy_v1",
        outcome: "progress_repetitions",
        comparableExposureKey: "bench-key",
        exerciseId: "bench-press",
        planSessionIndex: 0,
        sessionRole: "Upper",
        constructionRole: "primary",
        exerciseRole: "horizontal_press",
        lane: "strength",
        method: "straight_sets",
        progressionRule: "rep_progression",
        evidenceIds: ["evidence-1", "evidence-2", "evidence-3"],
        exposureCount: 3,
        successfulExposureCount: 3,
        failedExposureCount: 0,
        reasonCode: "three_comparable_successful_exposures_progress_repetitions",
        before: { prescribedBaseLoad: 80, exactTargets: [6, 6, 6] },
        after: { prescribedBaseLoad: 80, exactTargets: [7, 7, 7] },
        exactNumericDelta: { loadKg: 0, repetitions: [1, 1, 1] },
      }],
    });

    expect(validateCanonicalAdaptationAudit(audit)).toBe(true);
    expect(audit.evidenceWindow.evidenceIds).toEqual(["evidence-1", "evidence-2", "evidence-3"]);
    expect(audit.changes).toEqual([expect.objectContaining({
      variable: "repetitions",
      before: { prescribedBaseLoad: 80, exactTargets: [6, 6, 6] },
      after: { prescribedBaseLoad: 80, exactTargets: [7, 7, 7] },
    })]);
    expect(audit.bounds).toContain("one_numeric_variable_per_exercise");
    expect(audit.explanation.nextAction).not.toContain("AI");
  });
});
