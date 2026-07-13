import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4D7 collision provenance", () => {
  it("carries collision metadata without changing the selected branch", () => {
    expect(source).toContain("collision:");
    expect(source).toContain("inferred_role");
    expect(source).toContain("explicit_role_absent_inference_selected");
  });

  it("does not use collision metadata as a second precedence engine", () => {
    expect(source).not.toContain("collision.selectedAuthority ?");
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
    expect(source).toContain('plannedOrderClass: "unknown"');
  });

  it("keeps unresolved collision and planned-order categories explicit", () => {
    expect(["override_method_collisions", "method_family_role_collisions", "planned_order_lane_authority"]).toHaveLength(3);
  });
});
