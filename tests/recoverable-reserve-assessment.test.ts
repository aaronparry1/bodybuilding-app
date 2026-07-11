import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assessRecoverableReserve, type RecoverableReserveEvidence } from "@/domain/training/recoverable-reserve-assessment";

const baseEvidence: RecoverableReserveEvidence = {
  completedWeeks: 5,
  plannedWeeks: 5,
  completedSessions: 20,
  plannedSessions: 20,
  performanceTrend: "up",
  workloadToleranceTrend: "maintained",
  setDropOffTrend: "normal",
  missedTargetTrend: "none",
  shutdownEvents: 0,
  comparableExposureCount: 6,
  evidenceNoise: "low",
};

describe("recoverable reserve assessment", () => {
  it("returns high reserve when performance improved and workload was tolerated", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "strong_up",
      workloadToleranceTrend: "improved",
    });

    expect(assessment).toMatchObject({
      reserve: "high_reserve",
      canAddStress: true,
      recommendedStressAction: "progress_normally",
      evidenceQuality: "high",
    });
  });

  it("returns moderate reserve when performance held or improved but evidence is less strong", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "flat",
      workloadToleranceTrend: "maintained",
      comparableExposureCount: 3,
      evidenceNoise: "moderate",
    });

    expect(assessment).toMatchObject({
      reserve: "moderate_reserve",
      canAddStress: true,
      recommendedStressAction: "progress_carefully",
      evidenceQuality: "moderate",
    });
  });

  it("returns low reserve when flat performance comes with increasing drop-off and missed targets", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "flat",
      workloadToleranceTrend: "maintained",
      setDropOffTrend: "increasing",
      missedTargetTrend: "occasional",
    });

    expect(assessment).toMatchObject({
      reserve: "low_reserve",
      canAddStress: false,
      recommendedStressAction: "hold_or_consolidate",
    });
  });

  it("returns no reserve when performance drops with severe drop-off and shutdowns", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "down",
      workloadToleranceTrend: "reduced",
      setDropOffTrend: "severe",
      missedTargetTrend: "repeated",
      shutdownEvents: 3,
    });

    expect(assessment).toMatchObject({
      reserve: "no_reserve",
      canAddStress: false,
      recommendedStressAction: "reduce_or_recover",
    });
  });

  it("returns unknown when comparable exposure is insufficient", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      comparableExposureCount: 1,
      performanceTrend: "unknown",
      workloadToleranceTrend: "unknown",
      setDropOffTrend: "unknown",
      missedTargetTrend: "unknown",
      evidenceNoise: "high",
    });

    expect(assessment).toMatchObject({
      reserve: "unknown",
      canAddStress: false,
      recommendedStressAction: "gather_more_evidence",
      evidenceQuality: "low",
    });
  });

  it("allows strong progress and low reserve to coexist", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "flat",
      workloadToleranceTrend: "reduced",
      setDropOffTrend: "increasing",
      missedTargetTrend: "occasional",
    });

    expect(assessment.reserve).toBe("low_reserve");
    expect(assessment.canAddStress).toBe(false);
  });

  it("allows poor progress and high reserve to coexist", () => {
    const assessment = assessRecoverableReserve({
      ...baseEvidence,
      performanceTrend: "up",
      workloadToleranceTrend: "improved",
      setDropOffTrend: "normal",
      missedTargetTrend: "none",
      shutdownEvents: 0,
    });

    expect(assessment.reserve).toBe("high_reserve");
    expect(assessment.canAddStress).toBe(true);
  });

  it("is deterministic and does not use network, storage, async work, or block decisions", () => {
    expect(assessRecoverableReserve(baseEvidence)).toEqual(assessRecoverableReserve(baseEvidence));

    const source = readFileSync("src/domain/training/recoverable-reserve-assessment.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
    expect(source).not.toMatch(/blockDecision|decideBlock|nextBlock|transitionBlock|deloadBlock|continueBlock|extendBlock/i);
  });
});
