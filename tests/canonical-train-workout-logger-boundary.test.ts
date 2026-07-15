import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());

describe("canonical Train workout logger migration boundary", () => {
  it("records the missing canonical projection contract instead of adding an adapter", () => {
    const result = JSON.parse(readFileSync(resolve(root, "qa-reports/legacy-migration-change-control/canonical-train-workout-logger-migration-blocker.json"), "utf8"));
    expect(result.status).toBe("blocked_by_missing_canonical_train_projection_contract");
    expect(result.decision).toBe("do_not_modify_production_until_contract_exists");
    expect(result.productionSwitchCompleted).toBe(false);
  });

  it("proves the current hook still has the exact legacy authority callers", () => {
    const source = readFileSync(resolve(root, "src/features/workout-logging/use-workout-logger.ts"), "utf8");
    expect(source).toContain("activeTrainingPlanRepository");
    expect(source).toContain("workoutSessionRepository");
    expect(source).toContain("WorkoutSession");
    expect(source).toContain("WorkoutExerciseLog");
  });
});
