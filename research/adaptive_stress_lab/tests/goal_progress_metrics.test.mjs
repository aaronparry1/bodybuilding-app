import assert from "node:assert/strict";
import { calculateGoalProgress, getGoalProgressModel, listGoalProgressModels, normaliseGoal } from "../src/goal_progress_metrics.mjs";

const now = new Date("2026-06-28T00:00:00.000Z");

assert.equal(listGoalProgressModels().length, 6, "six goal progress models should be defined");
assert.equal(normaliseGoal("hypertrophy"), "build_muscle");
assert.equal(normaliseGoal("powerlifting"), "strength");
assert.equal(normaliseGoal("strength_hypertrophy"), "build_muscle_strength");

const strengthModel = getGoalProgressModel("strength");
assert.ok(strengthModel.primary_metrics.some((item) => item.includes("Competition Squat")));
assert.ok(strengthModel.primary_metrics.some((item) => item.includes("Competition Bench Press")));
assert.ok(strengthModel.primary_metrics.some((item) => item.includes("Competition Deadlift")));
assert.ok(strengthModel.secondary_metrics.some((item) => item.includes("Standing Overhead Press")));
assert.ok(strengthModel.secondary_metrics.some((item) => item.includes("Bent Over Row")));
assert.ok(strengthModel.forbidden_or_low_trust_metrics.some((item) => item.includes("isolation")));

const muscleModel = getGoalProgressModel("build_muscle");
assert.ok(muscleModel.primary_metrics.some((item) => item.includes("quality work volume")));
assert.ok(muscleModel.forbidden_or_low_trust_metrics.some((item) => item.includes("scale weight")));

const leanModel = getGoalProgressModel("get_lean");
assert.ok(leanModel.primary_metrics.some((item) => item.includes("body fat percentage")));
assert.ok(leanModel.forbidden_or_low_trust_metrics.some((item) => item.includes("body weight alone")));

const athleticModel = getGoalProgressModel("athletic_performance");
assert.ok(athleticModel.primary_metrics.some((item) => item.includes("power")));
assert.ok(athleticModel.forbidden_or_low_trust_metrics.some((item) => item.includes("bar speed")));

const strengthProgress = calculateGoalProgress({
  goal: "strength",
  evidence: baseEvidence({
    goalProgressEvidence: {
      strengthMetrics: [
        strengthMetric("competition_squat", "improving"),
        strengthMetric("competition_bench_press", "improving"),
        strengthMetric("competition_deadlift", "stable"),
        strengthMetric("biceps_curl", "improving"),
      ],
    },
  }),
  now,
});
assert.equal(strengthProgress.goal, "strength");
assert.equal(strengthProgress.trend, "improving");
assert.ok(strengthProgress.confidence >= 80);
assert.ok(strengthProgress.primary_metric_summary.includes("Competition lift"));

const muscleProgress = calculateGoalProgress({
  goal: "build_muscle",
  evidence: baseEvidence({
    goalProgressEvidence: {
      qualityVolume: {
        totalQualityVolumeTrend: "improving",
        qualitySetsByMuscleTrend: "improving",
        targetRangeCompletionRate: 0.86,
        junkVolumeRatio: 0.04,
        plannedVolumeRatio: 1,
        plannedQualitySetCount: 16,
        recoveryCost: "moderate",
      },
      bodyComposition: { bodyWeightTrendKg: 2.2 },
    },
  }),
  now,
});
assert.equal(muscleProgress.trend, "improving");
assert.ok(muscleProgress.primary_metric_summary.includes("Quality volume"));
assert.ok(muscleProgress.secondary_metric_summary.includes("Scale weight is optional context"));

const leanWithoutBodyFat = calculateGoalProgress({
  goal: "get_lean",
  evidence: baseEvidence({
    goalProgressEvidence: {
      bodyComposition: { bodyWeightTrendKg: -2.5 },
      performancePreservation: { strengthTrend: "stable", qualityWorkRetainedTrend: "stable" },
    },
  }),
  now,
});
assert.equal(leanWithoutBodyFat.trend, "stable");
assert.ok(leanWithoutBodyFat.confidence < 60);
assert.ok(leanWithoutBodyFat.warnings.some((warning) => warning.includes("body fat percentage is missing")));

const athleticProgress = calculateGoalProgress({
  goal: "athletic_performance",
  evidence: baseEvidence({
    goalProgressEvidence: {
      strengthMetrics: [strengthMetric("competition_squat", "stable"), strengthMetric("competition_bench_press", "stable")],
      athleticMetrics: [
        { metricType: "power", exercise: "jump_squat", trend: "improving", source: "programmed_performance" },
        { metricType: "dynamic_strength", exercise: "push_press", trend: "improving", source: "programmed_performance" },
      ],
    },
  }),
  now,
});
assert.equal(athleticProgress.trend, "improving");
assert.ok(athleticProgress.confidence < 80, "athletic confidence should stay lower without timing/velocity data");

console.log("Goal progress metrics test passed");

function baseEvidence(overrides = {}) {
  return {
    id: "goal_progress_test",
    evidenceModelVersion: "v0.7",
    sessionHistory: {
      plannedSessionsCompleted: 4,
      plannedSessionsMissed: 0,
      extraSessionsCompleted: 0,
      sessionSpacing: "normal",
      completedSets: 12,
      skippedExercises: 0,
      sessionDurationMinutes: 60,
      sessionCompletionQuality: "good",
    },
    exerciseHistory: [
      {
        exerciseName: "bench_press",
        movementPattern: "pressing pattern",
        targetRange: { min: 8, max: 12, unit: "reps" },
        loads: [100],
        repsOrSeconds: [10, 10, 10],
        withinRange: true,
        comparableLoadTrend: "stable",
        loadEvents: [],
        shutdowns: 0,
        belowMinimumEvents: 0,
        aboveRangeEvents: 0,
        productiveFatigue: false,
        newExercise: false,
        techniqueBreakdown: "none",
        repeatedSuccessfulExposuresAtLoad: 3,
      },
    ],
    safetyContext: {
      affectedArea: "none",
      affectedMovementPattern: "none",
      painTrend: "none",
      painSeverity: "none",
      techniqueBreakdown: false,
      systemicRedFlags: [],
      safetyIssueScope: "none",
    },
    evidenceConfidence: {
      plannedEvidenceCount: 4,
      comparableExposureCount: 4,
      recency: "recent",
      dataCompleteness: "high",
      evidenceSourceQuality: "high",
    },
    ...overrides,
  };
}

function strengthMetric(exercise, trend) {
  return {
    exercise,
    estimatedStrengthTrend: trend,
    ownedLoadTrend: trend,
    comparableLoadPerformance: trend,
    meaningfulRepPrCount: trend === "improving" ? 1 : 0,
    comparableExposures: 4,
  };
}
