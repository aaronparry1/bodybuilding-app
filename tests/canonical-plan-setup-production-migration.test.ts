import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical plan setup production migration boundary", () => {
  it("records the first live caller and refuses speculative constructor deletion", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-plan-setup-production-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("blocked_at_current_decision_application_contract");
    expect(artifact.liveCaller.symbol).toBe("applyCurrentMesocycleDecision");
    expect(artifact.constructorDisposition).toBe("retain_until_live_caller_migrated");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("proves the caller still has legacy repository authority", () => {
    const source = readFileSync(resolve(process.cwd(), "src/domain/training/current-decision-application.ts"), "utf8");
    expect(source).toContain("activeTrainingPlanRepository.getOptional");
    expect(source).toContain("activeTrainingPlanRepository.save");
    expect(source).toContain("currentMicrocycle");
    expect(source).toContain("isCurrentApprovedSuccessor");
  });
});
