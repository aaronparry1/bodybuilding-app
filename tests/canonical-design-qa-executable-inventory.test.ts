import { describe, expect, it } from "vitest";
import { designQaFixtures, designQaFixtureFamily } from "@/application/design-qa/design-qa-fixtures";
describe("executable Design-QA inventory", () => {
  it("has a complete unique family partition", () => {
    const ids = designQaFixtures.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(78);
    expect(ids).toHaveLength(78);
    expect(new Set(ids.map((id) => designQaFixtureFamily(id))).size).toBe(3);
    expect(ids.filter((id) => designQaFixtureFamily(id) === "plan_state")).toHaveLength(13);
    expect(ids.filter((id) => designQaFixtureFamily(id) === "session_lifecycle")).toHaveLength(30);
    expect(ids.filter((id) => designQaFixtureFamily(id) === "progress_decision")).toHaveLength(35);
  });
});
