import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { projectCanonicalProgress } from "@/application/training/canonical-progress-projection";

const source = readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");

describe("canonical Progress production boundary", () => {
  it("projects canonical evidence and decisions without mutation authority", () => {
    expect(source).toContain("canonicalProgressEvidenceRepository");
    expect(source).toContain("canonicalProgressDecisionRepository");
    expect(source).toContain("evaluateCanonicalProgress");
    expect(source).toContain("projectCanonicalProgress");
    expect(source).not.toMatch(/activeTrainingPlanRepository|workoutHistoryRepository|summarizeWorkoutHistory|currentBlock|activeBlockId|TrainingYear|annual-planner|volumeAdjustment|applyRecommendation/);
  });

  it("keeps projection pure and explicit when evidence is absent", () => {
    const result = projectCanonicalProgress({ status: "empty", plan: null, evidence: [], evaluation: null, decision: null });
    expect(result.status).toBe("empty");
    expect(result.decision).toBeNull();
    expect(result.evidenceCount).toBe(0);
  });
});
