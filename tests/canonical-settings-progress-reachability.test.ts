import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("canonical settings and Progress reachability", () => {
  it("keeps mounted Settings canonical", () => {
    const source = readFileSync("app/(protected)/settings.tsx", "utf8");
    expect(source).toContain("canonicalActivePlanState");
    expect(source).not.toMatch(/activeTrainingPlanRepository|TrainingYear|currentBlock|activeBlockId|annual-planner/);
  });

  it("keeps mounted Progress canonical and mutation-free except decision application", () => {
    const source = readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");
    expect(source).toContain("useCanonicalProgressPresentation");
    expect(source).toContain("ProgressDashboard");
    expect(source).not.toMatch(/canonicalProgressEvidenceRepository|canonicalProgressDecisionRepository|evaluateCanonicalProgress|applyProgressDecision/);
    expect(source).not.toMatch(/activeTrainingPlanRepository|workoutHistoryRepository|TrainingYear|currentBlock|annual-planner|startDeloadPlan|approveVolumeAdjustment/);
  });
});
