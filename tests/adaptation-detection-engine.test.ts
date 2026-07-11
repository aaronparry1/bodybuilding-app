import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { detectAdaptationStatus, type AdaptationDetectionEvidence } from "@/domain/training/adaptation-detection-engine";

const baseEvidence: AdaptationDetectionEvidence = {
  level: "exercise",
  evidenceWindowSessions: 6,
  comparableExposureCount: 4,
  bestSetTrend: "up",
  estimatedOneRepMaxTrend: "flat",
  repPerformanceTrend: "up",
  loadTrend: "flat",
  completedVsPlannedWork: "high",
  failedSetFrequency: "none",
  sessionDifficulty: "normal",
  fatigueRecoverySignal: "stable",
  missedSessionCount: 0,
  painOrIssueFlag: "none",
  exerciseAgeExposures: 4,
  movementPatternPerformanceTrend: "up",
  systemWidePerformanceTrend: "flat",
  poorExposureCount: 0,
  evidenceNoise: "low",
};

describe("adaptation detection engine", () => {
  it("classifies improving exercise evidence as adapting", () => {
    const result = detectAdaptationStatus(baseEvidence);

    expect(result.level).toBe("exercise");
    expect(result.status).toBe("adapting");
    expect(result.confidence).toBeGreaterThanOrEqual(80);
    expect(result.reasonCodes).toContain("objective_performance_improving");
  });

  it("does not treat workout completion alone as progress", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      bestSetTrend: "unknown",
      estimatedOneRepMaxTrend: "unknown",
      repPerformanceTrend: "unknown",
      loadTrend: "unknown",
      movementPatternPerformanceTrend: "unknown",
      systemWidePerformanceTrend: "unknown",
      comparableExposureCount: 1,
      evidenceWindowSessions: 2,
      completedVsPlannedWork: "high",
    });

    expect(result.status).toBe("insufficient_evidence");
    expect(result.reasonCodes).toContain("insufficient_evidence_window");
  });

  it("treats one poor session as noise unless fatigue or pain warning signs are present", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      bestSetTrend: "down",
      repPerformanceTrend: "flat",
      loadTrend: "flat",
      poorExposureCount: 1,
      fatigueRecoverySignal: "stable",
      painOrIssueFlag: "none",
    });

    expect(result.status).toBe("likely_adapting");
    expect(result.reasonCodes).toContain("single_poor_session_treated_as_noise");
  });

  it("classifies repeated poor exposures as plateaued when recovery is normal", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      bestSetTrend: "down",
      repPerformanceTrend: "down",
      loadTrend: "flat",
      fatigueRecoverySignal: "stable",
      failedSetFrequency: "repeated",
      poorExposureCount: 3,
    });

    expect(result.status).toBe("plateaued");
    expect(result.reasonCodes).toEqual(expect.arrayContaining([
      "poor_performance_with_normal_recovery",
      "repeated_poor_exposures",
    ]));
  });

  it("treats poor performance with high fatigue primarily as recovery/fatigue related", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      bestSetTrend: "down",
      estimatedOneRepMaxTrend: "down",
      repPerformanceTrend: "down",
      sessionDifficulty: "high",
      fatigueRecoverySignal: "poor",
      poorExposureCount: 2,
    });

    expect(result.status).toBe("regressing");
    expect(result.reasonCodes).toContain("poor_performance_with_high_fatigue");
    expect(result.reasonCodes).not.toContain("poor_performance_with_normal_recovery");
  });

  it("detects exercise saturation at exercise level", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      level: "exercise",
      bestSetTrend: "flat",
      estimatedOneRepMaxTrend: "flat",
      repPerformanceTrend: "flat",
      loadTrend: "flat",
      fatigueRecoverySignal: "stable",
      exerciseAgeExposures: 10,
      poorExposureCount: 2,
    });

    expect(result.status).toBe("saturated");
    expect(result.reasonCodes).toContain("exercise_age_high_with_flat_performance");
  });

  it("detects movement-pattern level adaptation separately from exercise level", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      level: "movement_pattern",
      movementPatternPerformanceTrend: "up",
      systemWidePerformanceTrend: "flat",
    });

    expect(result.level).toBe("movement_pattern");
    expect(result.status).toBe("adapting");
    expect(result.reasonCodes).toContain("movement_pattern_supports_status");
  });

  it("detects system-level decline across unrelated movement patterns", () => {
    const result = detectAdaptationStatus({
      ...baseEvidence,
      level: "programme_system",
      bestSetTrend: "flat",
      estimatedOneRepMaxTrend: "down",
      repPerformanceTrend: "down",
      loadTrend: "flat",
      movementPatternPerformanceTrend: "down",
      systemWidePerformanceTrend: "strong_down",
      poorExposureCount: 4,
      fatigueRecoverySignal: "poor",
    });

    expect(result.level).toBe("programme_system");
    expect(result.status).toBe("regressing");
    expect(result.reasonCodes).toContain("multi_pattern_decline");
  });

  it("feeds future engines without directly replacing them", () => {
    const result = detectAdaptationStatus(baseEvidence);

    expect(result.feedsFutureEngines).toEqual([
      "progression_adjustment",
      "exercise_rotation",
      "method_selection",
      "deloads",
      "adaptive_training_state_transitions",
    ]);
  });

  it("does not implement user-facing PR recognition or direct progression decisions", () => {
    const source = readFileSync("src/domain/training/adaptation-detection-engine.ts", "utf8");

    expect(source).not.toMatch(/personalRecord|sessionPR|sessionPr|recogniseProgress|recognizeProgress|celebratePR/i);
    expect(source).not.toMatch(/applyProgression|rotateExercise|chooseMethod|triggerDeload|transitionTrainingState/i);
  });

  it("is deterministic and does not use network, storage, or async work", () => {
    expect(detectAdaptationStatus(baseEvidence)).toEqual(detectAdaptationStatus(baseEvidence));

    const source = readFileSync("src/domain/training/adaptation-detection-engine.ts", "utf8");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});
