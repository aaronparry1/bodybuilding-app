import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());

describe("canonical production reachability refresh", () => {
  it("records the current mounted legacy surfaces and one bounded next target", () => {
    const inventory = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-production-reachability-refresh.json"), "utf8"));
    expect(inventory.sourceCommit).toBe("abcdaeb");
    expect(inventory.productionSwitchCompleted).toBe(false);
    expect(inventory.selectedNextTarget.file).toBe("src/application/sync/cloud-data-sync.ts");
    expect(inventory.selectedNextTarget.symbol).toBe("activeTrainingPlanRepository");
  });

  it("keeps the selected History route on legacy persistence until migration", () => {
    const source = readFileSync(resolve(root, "app/(protected)/history/[id].tsx"), "utf8");
    expect(source).not.toContain("workoutSessionRepository");
    expect(source).toContain("projectCanonicalTrainSession");
  });
});
