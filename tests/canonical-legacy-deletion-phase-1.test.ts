import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("canonical legacy deletion phase 1 inventory", () => {
  it("keeps the retained legacy allowlist explicit and fail-closed", () => {
    const inventory = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-repository-legacy-authority-inventory.json"), "utf8"));
    expect(inventory.schemaVersion).toBe("canonical_repository_legacy_authority_inventory_v1");
    expect(inventory.nextBoundedDeletionBatch).toEqual(["src/application/design-qa/design-qa-fixtures.ts:basePlan and fixture-only helper cluster"]);
    expect(inventory.entries.some((entry: { symbol: string; classification: string }) => entry.symbol === "applyDesignQaFixtureMatrix" && entry.classification === "dead_unreferenced")).toBe(true);
    expect(inventory.entries.some((entry: { classification: string }) => entry.classification === "unknown_fail_closed")).toBe(false);
  });

  it("does not claim a production switch while legacy authority remains", () => {
    const result = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-legacy-deletion-phase-1-result.json"), "utf8"));
    expect(result.deadLegacyCodeRemoved).toBe(true);
    expect(result.pipelineReadyForSwitch).toBe(true);
    expect(result.productionSwitchCompleted).toBe(false);
  });
});
