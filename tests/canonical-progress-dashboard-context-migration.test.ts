import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Progress dashboard context migration boundary", () => {
  it("records the canonical dashboard boundary and completed switch evidence", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-production-switch-final-result.json"), "utf8"));
    expect(artifact.productionSwitchCompleted).toBe(true);
    expect(artifact.pipelineReadyForSwitch).toBe(true);
    expect(artifact.firstFalsePredicate ?? null).toBeNull();
  });

  it("keeps the deleted legacy dashboard boundary absent", () => {
    expect(() => readFileSync(resolve(process.cwd(), "src/domain/training/progress-dashboard.ts"), "utf8")).toThrow();
  });
});
