import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());

describe("canonical Train workout logger migration boundary", () => {
  it("records the deleted hook and canonical Train boundary", () => {
    const result = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-train-logger-reachability.json"), "utf8"));
    expect(result.useWorkoutLogger.executableCallers).toEqual([]);
    expect(result.useWorkoutLogger.classification).toBe("dead legacy code");
    const switchResult = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-production-switch-final-result.json"), "utf8"));
    expect(switchResult.productionSwitchCompleted).toBe(true);
  });

  it("proves the deleted legacy hook remains absent", () => {
    expect(() => readFileSync(resolve(root, "src/features/workout-logging/use-workout-logger.ts"), "utf8")).toThrow();
  });
});
