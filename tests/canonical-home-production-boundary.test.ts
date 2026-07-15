import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("canonical Home production boundary", () => {
  it("contains no legacy training authority imports", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/index.tsx"), "utf8");
    expect(source).not.toMatch(/ActiveTrainingPlan|activeTrainingPlanRepository|TrainingYear|annual-planner|currentBlock|activeBlockId|extra-session-generator|recommendation-actions/);
    expect(source).toContain("canonicalActivePlanState");
    expect(source).toContain("projectCanonicalHome");
  });
});
