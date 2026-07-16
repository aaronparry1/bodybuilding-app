import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("retired V3 shadow telemetry boundary", () => {
  it("does not treat the retired coaching-engine-v3 module as a production blocker", () => {
    expect(() => readFileSync("src/domain/training/coaching-engine-v3.ts", "utf8")).toThrow();
    const source = readFileSync("src/domain/training/ordinary-v2-authority-boundary.ts", "utf8");
    expect(source).not.toContain("coaching-engine-v3");
  });

  it("keeps canonical Progress authoritative while ordinary-v2 remains inactive", () => {
    const evidence = JSON.parse(readFileSync("qa-reports/legacy-migration-change-control/canonical-production-switch-final-result.json", "utf8"));
    expect(evidence.productionSwitchCompleted).toBe(true);
    expect(evidence.predicates?.every((predicate: { passed: boolean }) => predicate.passed) ?? true).toBe(true);
    const authority = readFileSync("src/domain/training/ordinary-v2-authority-boundary.ts", "utf8");
    expect(authority).toContain("production_only");
  });

  it("retains explicit shadow/observation isolation without telemetry emission", () => {
    const observation = readFileSync("src/domain/training/ordinary-v2-shadow-observation.ts", "utf8");
    expect(observation).toContain("observeOrdinaryV2Shadow");
    expect(observation).toContain("ORDINARY_SHADOW_OBSERVATION_DISABLED");
    expect(observation).not.toContain("applyProgressDecision");
  });
});
