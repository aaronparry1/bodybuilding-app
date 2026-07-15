import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Mesocycle decision application migration boundary", () => {
  it("records missing canonical command inputs instead of preserving legacy mutation", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-mesocycle-decision-application-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("resolved_for_recommendation_callers");
    expect(artifact.nextBoundedTask).toContain("plan-setup");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("proves both direct callers use the canonical application boundary", () => {
    const recommendation = readFileSync(resolve(process.cwd(), "src/application/training/canonical-recommendation-actions.ts"), "utf8");
    const current = readFileSync(resolve(process.cwd(), "src/domain/training/current-decision-recommendation.ts"), "utf8");
    expect(recommendation).toContain("canonicalActivePlanState.applyProgressDecision");
    expect(current).toContain("applyCanonicalRecommendationAction");
    expect(recommendation).not.toContain("activeTrainingPlanRepository");
  });
});
