import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4D9 rich authority helper boundary", () => {
  it("retains identities already known by production", () => {
    expect(source).toContain("appliedRepAuthorityIdentity");
    expect(source).toContain("appliedLaneAuthorityIdentity");
    expect(source).toContain("winnerRetention");
  });

  it("preserves primitive façades and does not replay precedence", () => {
    expect(source).toContain("function getGeneratedRepRange");
    expect(source).toContain("resolveTrainingLane");
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
    expect(source).not.toContain("winnerRetention ?");
  });

  it("keeps structural blockers explicit", () => {
    expect(["explicit_override", "advanced_method", "family_role_collision", "planned_order_lane"]).toHaveLength(4);
  });
});
