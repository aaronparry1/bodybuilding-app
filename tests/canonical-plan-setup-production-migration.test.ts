import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical plan setup production migration boundary", () => {
  it("records the first live caller and refuses speculative constructor deletion", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-plan-setup-production-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("resolved_for_recommendation_callers");
    expect(artifact.liveCaller.symbol).toBe("none");
    expect(artifact.constructorDisposition).toBe("retain_for_migration_and_nonproduction_qa");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("proves the canonical context type is projection-only", () => {
    const source = readFileSync(resolve(process.cwd(), "src/domain/training/canonical-progress-context.ts"), "utf8");
    expect(source).toContain("CanonicalProgressContext");
    expect(source).not.toContain("activeTrainingPlanRepository");
  });
});
