import { describe, expect, it } from "vitest";
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
});
