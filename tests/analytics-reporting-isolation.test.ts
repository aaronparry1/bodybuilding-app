import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const analyticsScreen = readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");
const advancedReporting = readFileSync("src/domain/training/advanced-reporting.ts", "utf8");

describe("Analytics and reporting isolation", () => {
  it("keeps Analytics read-only with respect to plan and training-year authority", () => {
    expect(analyticsScreen).toContain("canonicalActivePlanState");
    expect(analyticsScreen).toContain("canonicalProgressEvidenceRepository");
    expect(analyticsScreen).toContain("canonicalProgressDecisionRepository");
    expect(analyticsScreen).not.toContain("trainingYearRepository");
    expect(analyticsScreen).not.toContain("startDeloadTrainingYear");
    expect(analyticsScreen).not.toContain("startDeloadPlan(");
    expect(analyticsScreen).not.toContain("replaceExerciseForFutureSessions(");
    expect(analyticsScreen).not.toContain("approveVolumeAdjustment(");
  });

  it("keeps reporting as an aggregation layer without a TrainingBlock input", () => {
    expect(advancedReporting).not.toContain("TrainingBlock");
    expect(advancedReporting).not.toContain("currentBlock");
    expect(advancedReporting).not.toContain("buildRecoveryWorkoutSession");
    expect(advancedReporting).not.toContain("transitionToApprovedMesocycle");
  });
});
