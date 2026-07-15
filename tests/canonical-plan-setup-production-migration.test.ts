import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical plan setup production migration boundary", () => {
  it("records the first live caller and refuses speculative constructor deletion", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-plan-setup-production-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("resolved_for_recommendation_callers");
    expect(artifact.liveCaller.symbol).toBe("resolveCurrentProgressContext");
    expect(artifact.constructorDisposition).toBe("retain_for_migration_and_nonproduction_qa");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("proves the caller still has legacy repository authority", () => {
    const source = readFileSync(resolve(process.cwd(), "src/domain/training/current-progress-context.ts"), "utf8");
    expect(source).toContain("activeTrainingPlanRepository.getOptional");
    expect(source).not.toContain("activeTrainingPlanRepository.save");
    expect(source).toContain("currentMicrocycle");
  });
});
