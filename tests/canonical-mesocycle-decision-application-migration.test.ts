import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Mesocycle decision application migration boundary", () => {
  it("records missing canonical command inputs instead of preserving legacy mutation", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-mesocycle-decision-application-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("stop_at_missing_canonical_command_contract");
    expect(artifact.missingCanonicalInputs).toContain("expectedPlanRevision");
    expect(artifact.nextBoundedTask).toContain("recommendation action");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("proves both direct callers still delegate to the legacy application", () => {
    const recommendation = readFileSync(resolve(process.cwd(), "src/application/training/canonical-recommendation-actions.ts"), "utf8");
    const current = readFileSync(resolve(process.cwd(), "src/domain/training/current-decision-recommendation.ts"), "utf8");
    expect(recommendation).toContain("applyCurrentMesocycleDecision");
    expect(current).toContain("applyCurrentMesocycleDecision");
  });
});
