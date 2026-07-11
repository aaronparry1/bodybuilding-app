import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assessAdaptiveTrainingState,
  getAdaptiveTrainingStateDefinitions,
  type AdaptiveTrainingStateEvidence,
} from "@/domain/training/adaptive-training-state";

const baseEvidence: AdaptiveTrainingStateEvidence = {
  currentState: "accumulation",
  stateExposureWeeks: 4,
  stateExposureSessions: 12,
  performanceTrend: "up",
  progressionVelocity: "steady",
  fatigueRecoverySignal: "stable",
  completionQuality: "high",
  recentTrainingContinuity: "consistent",
  evidenceConfidence: 84,
};

describe("adaptive training state architecture", () => {
  it("defines the five internal training states", () => {
    const definitions = getAdaptiveTrainingStateDefinitions();

    expect(definitions.map((definition) => definition.stateId)).toEqual([
      "foundation",
      "accumulation",
      "intensification",
      "realisation",
      "pivot",
    ]);
    expect(definitions.every((definition) => definition.internalOnly)).toBe(true);
  });

  it("gives every state minimum and maximum exposure rules plus criteria", () => {
    for (const definition of getAdaptiveTrainingStateDefinitions()) {
      expect(definition.exposure.minimumWeeks).toBeGreaterThan(0);
      expect(definition.exposure.minimumSessions).toBeGreaterThan(0);
      expect(definition.exposure.maximumWeeks).toBeGreaterThan(definition.exposure.minimumWeeks);
      expect(definition.exposure.maximumSessions).toBeGreaterThan(definition.exposure.minimumSessions);
      expect(definition.entryCriteria.length).toBeGreaterThan(0);
      expect(definition.continuationCriteria.length).toBeGreaterThan(0);
      expect(definition.exitCriteria.length).toBeGreaterThan(0);
      expect(definition.fallbackCriteria.length).toBeGreaterThan(0);
    }
  });

  it("uses traditional block names as emphasis hints, not primary structure", () => {
    const definitions = getAdaptiveTrainingStateDefinitions();
    const stateIds = definitions.map((definition) => definition.stateId);
    const hints = definitions.flatMap((definition) => definition.traditionalEmphasisHints);

    expect(stateIds).not.toContain("hypertrophy");
    expect(stateIds).not.toContain("strength");
    expect(stateIds).not.toContain("power");
    expect(stateIds).not.toContain("peak");
    expect(hints).toEqual(expect.arrayContaining(["hypertrophy", "strength", "peak"]));
  });

  it("prevents flip-flopping before minimum exposure is satisfied", () => {
    const assessment = assessAdaptiveTrainingState({
      ...baseEvidence,
      currentState: "foundation",
      stateExposureWeeks: 1,
      stateExposureSessions: 2,
      recentStateChangeWeeks: 1,
      recentStateChangeSessions: 2,
      performanceTrend: "strong_up",
      progressionVelocity: "fast",
      evidenceConfidence: 95,
    });

    expect(assessment.flipFlopGuardActive).toBe(true);
    expect(assessment.reviewStatus).toBe("continue_allowed");
    expect(assessment.eligibleNextStates).toEqual([]);
  });

  it("allows evidence-based state review after minimum exposure and confidence threshold", () => {
    const assessment = assessAdaptiveTrainingState({
      ...baseEvidence,
      currentState: "accumulation",
      stateExposureWeeks: 4,
      stateExposureSessions: 12,
      performanceTrend: "up",
      progressionVelocity: "steady",
      evidenceConfidence: 84,
    });

    expect(assessment.minimumExposureSatisfied).toBe(true);
    expect(assessment.reviewStatus).toBe("review_required");
    expect(assessment.eligibleNextStates).toEqual(["intensification"]);
  });

  it("forces escalation when a state reaches maximum exposure", () => {
    const assessment = assessAdaptiveTrainingState({
      ...baseEvidence,
      currentState: "foundation",
      stateExposureWeeks: 6,
      stateExposureSessions: 18,
      performanceTrend: "flat",
      progressionVelocity: "slow",
      evidenceConfidence: 62,
    });

    expect(assessment.maximumExposureReached).toBe(true);
    expect(assessment.reviewStatus).toBe("escalation_required");
    expect(assessment.escalationRequired).toBe(true);
    expect(assessment.canContinue).toBe(false);
  });

  it("prevents Foundation or Accumulation continuing indefinitely", () => {
    for (const currentState of ["foundation", "accumulation"] as const) {
      const assessment = assessAdaptiveTrainingState({
        ...baseEvidence,
        currentState,
        stateExposureWeeks: currentState === "foundation" ? 7 : 9,
        stateExposureSessions: currentState === "foundation" ? 20 : 34,
        evidenceConfidence: 88,
      });

      expect(assessment.reviewStatus).toBe("escalation_required");
      expect(assessment.mustReview).toBe(true);
    }
  });

  it("uses fallback criteria when recovery and completion evidence deteriorate", () => {
    const assessment = assessAdaptiveTrainingState({
      ...baseEvidence,
      currentState: "intensification",
      stateExposureWeeks: 3,
      stateExposureSessions: 8,
      performanceTrend: "down",
      progressionVelocity: "regressing",
      fatigueRecoverySignal: "overreached",
      completionQuality: "low",
      evidenceConfidence: 82,
    });

    expect(assessment.reviewStatus).toBe("fallback_required");
    expect(assessment.fallbackState).toBe("pivot");
    expect(assessment.eligibleNextStates).toEqual(["pivot"]);
  });

  it("keeps low-confidence evidence from forcing a state change", () => {
    const assessment = assessAdaptiveTrainingState({
      ...baseEvidence,
      currentState: "accumulation",
      stateExposureWeeks: 4,
      stateExposureSessions: 12,
      performanceTrend: "up",
      progressionVelocity: "steady",
      evidenceConfidence: 58,
    });

    expect(assessment.reviewStatus).toBe("continue_allowed");
    expect(assessment.eligibleNextStates).toEqual([]);
  });

  it("does not implement the future session PR or progress recognition system", () => {
    const source = readFileSync("src/domain/training/adaptive-training-state.ts", "utf8");

    expect(source).not.toMatch(/sessionPr|sessionPR|personalRecord|recogniseProgress|recognizeProgress|prRecognition/i);
  });

  it("is deterministic and does not use network, storage, or async work", () => {
    expect(assessAdaptiveTrainingState(baseEvidence)).toEqual(assessAdaptiveTrainingState(baseEvidence));

    const source = readFileSync("src/domain/training/adaptive-training-state.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});
