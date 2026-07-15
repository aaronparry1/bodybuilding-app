import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { designQaFixtureFamily, designQaFixtures } from "@/application/design-qa/design-qa-fixtures";

describe("Design-QA fixture family boundary", () => {
  it("classifies every declared fixture exactly once", () => {
    const ids = designQaFixtures.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => ["plan_state", "session_lifecycle", "progress_decision", "failure_recovery"].includes(designQaFixtureFamily(id)))).toBe(true);
  });
  it("keeps normal families distinct from migration fixtures", () => {
    expect(designQaFixtureFamily("home_active_plan")).toBe("plan_state");
    expect(designQaFixtureFamily("train_work_sets")).toBe("session_lifecycle");
    expect(designQaFixtureFamily("progress_healthy")).toBe("progress_decision");
  });
  it("uses the canonical state boundary for plan fixtures", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/design-qa/design-qa-fixtures.ts"), "utf8");
    const planDispatcher = source.slice(source.indexOf("function applyPlanStateFixture"), source.indexOf("function applySessionLifecycleFixture"));
    expect(planDispatcher).toContain("canonicalActivePlanState.create");
    expect(planDispatcher).not.toContain("activeTrainingPlanRepository");
    expect(planDispatcher).not.toContain("createActiveTrainingPlan");
    expect(planDispatcher).not.toContain("TrainingYear");
  });
});
