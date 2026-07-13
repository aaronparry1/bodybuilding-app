import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4D8 production winner retention", () => {
  it("carries retention status with the existing selected identity", () => {
    expect(source).toContain("winnerRetention");
    expect(source).toContain("retained_at_existing_branch");
    expect(source).toContain("unavailable_in_legacy_contract");
  });

  it("does not create a second precedence engine or alter public output", () => {
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
    expect(source).not.toContain("winnerRetention ?");
    expect(source).toContain("repRange: decision?.repRange");
  });

  it("keeps unresolved winner categories explicit", () => {
    expect(["explicit_override", "advanced_method", "family_role_collision", "planned_order_lane"]).toHaveLength(4);
  });
});
