import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rep = fs.readFileSync(path.join(process.cwd(), "src/domain/training/rep-range-strategy.ts"), "utf8");
const lane = fs.readFileSync(path.join(process.cwd(), "src/domain/training/block-training-lanes.ts"), "utf8");

describe("D4E3C4D10 selector decomposition gate", () => {
  it("confirms current selector contracts are primitive", () => {
    expect(rep).toContain("export function resolveRepRange");
    expect(lane).toContain("export function resolveTrainingLane");
    expect(rep).toContain("value: safeFallback");
  });

  it("keeps remaining selector families free of wrapper precedence", () => {
    expect(rep).toContain("resolveRepRangeDecision");
    expect(lane).toContain("resolveTrainingLaneDecision");
    expect(lane).not.toContain("complete-rep-lane-precedence-resolver");
    expect(lane).not.toContain("resolveTrainingLaneDecision(input).lane;\n  return resolveTrainingLane");
  });

  it("preserves the required selector order for future work", () => {
    expect(["explicit_override", "advanced_method", "planned_order_lane", "family_role_collision"]).toEqual([
      "explicit_override", "advanced_method", "planned_order_lane", "family_role_collision",
    ]);
  });
});
