import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const root = "qa-reports/coaching-loop-p0-remediation";

describe("canonical coaching-loop P0 remediation evidence", () => {
  it("publishes every required deterministic artifact", () => {
    for (const name of [
      "implementation-summary.md",
      "authority-before-after.md",
      "identity-contract.md",
      "evidence-contract.md",
      "decision-contract.md",
      "transaction-and-retry-behaviour.md",
      "longitudinal-results.json",
      "longitudinal-results.md",
      "counterfactual-results.json",
      "protected-baseline-regressions.md",
      "remaining-p1-p3-findings.md",
    ]) expect(existsSync(`${root}/${name}`), name).toBe(true);
  });

  it("preserves all three audit identifiers and reconciles all 12 scenarios", () => {
    const implementation = readFileSync(`${root}/implementation-summary.md`, "utf8");
    expect(implementation).toContain("F01 / P0");
    expect(implementation).toContain("F02 / P0");
    expect(implementation).toContain("F03 / P0");
    const results = JSON.parse(readFileSync(`${root}/longitudinal-results.json`, "utf8")) as {
      scenarioCount: number;
      futureChangeCount: number;
      explicitNoChangeOrBlockedCount: number;
      silentNonAdaptationCount: number;
      scenarios: Array<{ id: string }>;
      determinism: { numericAutomaticAdjustmentAuthorised: boolean };
    };
    expect(results.scenarioCount).toBe(12);
    expect(results.scenarios).toHaveLength(12);
    expect(new Set(results.scenarios.map((scenario) => scenario.id)).size).toBe(12);
    expect(results.futureChangeCount + results.explicitNoChangeOrBlockedCount).toBe(12);
    expect(results.silentNonAdaptationCount).toBe(0);
    expect(results.determinism.numericAutomaticAdjustmentAuthorised).toBe(false);
  });
});
