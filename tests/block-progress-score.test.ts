import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateBlockProgressScore, type BlockProgressEvidence } from "@/domain/training/block-progress-score";

const baseEvidence: BlockProgressEvidence = {
  blockStrategyId: "hypertrophy_accumulation",
  completedWeeks: 5,
  plannedWeeks: 5,
  completedSessions: 20,
  plannedSessions: 20,
  comparableExerciseExposures: 8,
  primaryMetricTrend: "up",
  secondaryMetricTrend: "up",
  volumeToleranceTrend: "maintained",
  hypertrophyWorkTrend: "up",
  evidenceNoise: "low",
  missedSessionCount: 0,
};

describe("block progress score", () => {
  it("scores strong hypertrophy logbook improvement as strong progress", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      primaryMetricTrend: "strong_up",
      secondaryMetricTrend: "up",
      hypertrophyWorkTrend: "strong_up",
      volumeToleranceTrend: "improved",
    });

    expect(score.band).toBe("strong_progress");
    expect(score.score).toBeGreaterThanOrEqual(85);
    expect(score.primaryAdaptationScore).toBeGreaterThanOrEqual(90);
  });

  it("treats maintained performance with increased volume as useful or strong hypertrophy progress", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      primaryMetricTrend: "flat",
      secondaryMetricTrend: "flat",
      hypertrophyWorkTrend: "flat",
      volumeToleranceTrend: "improved",
    });

    expect(["useful_progress", "strong_progress"]).toContain(score.band);
    expect(score.primaryAdaptationScore).toBeGreaterThanOrEqual(80);
  });

  it("scores strength main lift improvement as strong progress", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      blockStrategyId: "strength_accumulation",
      primaryMetricTrend: "up",
      secondaryMetricTrend: "up",
      mainLiftTrend: "strong_up",
      volumeToleranceTrend: "maintained",
      comparableExerciseExposures: 7,
    });

    expect(score.band).toBe("strong_progress");
    expect(score.primaryAdaptationScore).toBeGreaterThanOrEqual(90);
  });

  it("penalises concurrent development when strength crashes despite hypertrophy improvement", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      blockStrategyId: "concurrent_development",
      primaryMetricTrend: "down",
      secondaryMetricTrend: "up",
      mainLiftTrend: "strong_down",
      hypertrophyWorkTrend: "strong_up",
      volumeToleranceTrend: "improved",
    });

    expect(score.primaryAdaptationScore).toBeLessThan(45);
    expect(score.band).not.toBe("strong_progress");
  });

  it("scores preservation blocks useful or strong when strength and muscle-building performance are maintained", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      blockStrategyId: "muscle_strength_preservation",
      primaryMetricTrend: "flat",
      secondaryMetricTrend: "flat",
      preservationTrend: "flat",
      hypertrophyWorkTrend: "flat",
      volumeToleranceTrend: "maintained",
      comparableExerciseExposures: 6,
    });

    expect(["useful_progress", "strong_progress"]).toContain(score.band);
    expect(score.primaryAdaptationScore).toBeGreaterThanOrEqual(75);
  });

  it("scores regression trends as regression or poor progress", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      primaryMetricTrend: "strong_down",
      secondaryMetricTrend: "down",
      hypertrophyWorkTrend: "strong_down",
      volumeToleranceTrend: "reduced",
      evidenceNoise: "moderate",
      completedSessions: 13,
      missedSessionCount: 7,
    });

    expect(["regression", "poor_progress"]).toContain(score.band);
    expect(score.score).toBeLessThan(45);
  });

  it("lowers evidence quality for missing or noisy data", () => {
    const clean = calculateBlockProgressScore(baseEvidence);
    const noisy = calculateBlockProgressScore({
      ...baseEvidence,
      comparableExerciseExposures: 1,
      primaryMetricTrend: "unknown",
      secondaryMetricTrend: "unknown",
      hypertrophyWorkTrend: "unknown",
      volumeToleranceTrend: "unknown",
      evidenceNoise: "high",
    });

    expect(noisy.evidenceQualityScore).toBeLessThan(clean.evidenceQualityScore);
    expect(noisy.confidence).toBeLessThan(clean.confidence);
  });

  it("missed sessions lower completion score", () => {
    const complete = calculateBlockProgressScore(baseEvidence);
    const missed = calculateBlockProgressScore({
      ...baseEvidence,
      completedSessions: 14,
      missedSessionCount: 6,
    });

    expect(missed.completionScore).toBeLessThan(complete.completionScore);
  });

  it("unknown trends return unclear neutral rather than pretending progress", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      comparableExerciseExposures: 0,
      primaryMetricTrend: "unknown",
      secondaryMetricTrend: "unknown",
      volumeToleranceTrend: "unknown",
      hypertrophyWorkTrend: "unknown",
      evidenceNoise: "high",
      completedSessions: 4,
      plannedSessions: 12,
      missedSessionCount: 4,
    });

    expect(score.band).toBe("unclear_neutral");
    expect(score.primaryAdaptationScore).toBe(50);
  });

  it("clamps scores to 0-100", () => {
    const score = calculateBlockProgressScore({
      ...baseEvidence,
      completedWeeks: 99,
      plannedWeeks: 1,
      completedSessions: 999,
      plannedSessions: 1,
      comparableExerciseExposures: 99,
      primaryMetricTrend: "strong_up",
      secondaryMetricTrend: "strong_up",
      volumeToleranceTrend: "improved",
      missedSessionCount: 0,
    });

    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.completionScore).toBeLessThanOrEqual(100);
    expect(score.evidenceQualityScore).toBeLessThanOrEqual(100);
  });

  it("is deterministic and does not implement fatigue or next-block decision logic", () => {
    expect(calculateBlockProgressScore(baseEvidence)).toEqual(calculateBlockProgressScore(baseEvidence));

    const source = readFileSync("src/domain/training/block-progress-score.ts", "utf8");
    expect(source).not.toMatch(/fatigueScore|objectiveFit|confidenceGain|nextBlock|deload|continueBlock|extendBlock|transitionBlock/i);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});
