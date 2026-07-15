import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Progress dashboard context migration boundary", () => {
  it("records that the dashboard has no mounted production caller", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-progress-dashboard-context-migration-blocker.json"), "utf8"));
    expect(artifact.mountedProductionCallers).toEqual([]);
    expect(artifact.decision).toBe("stop_at_unmounted_dashboard_projection_scope");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("keeps the legacy dashboard boundary explicit for the dedicated migration", () => {
    const source = readFileSync(resolve(process.cwd(), "src/domain/training/progress-dashboard.ts"), "utf8");
    expect(source).toContain("activePlan?: ActiveTrainingPlan | null");
    expect(source).toContain("activePlan.blocks");
    expect(source).toContain("activePlan.currentMicrocycle");
  });
});
