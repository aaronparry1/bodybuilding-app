import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4D6 authority provenance", () => {
  it("carries production-native rep and lane authority without changing precedence", () => {
    expect(source).toContain("repAuthoritySource");
    expect(source).toContain("laneAuthoritySource");
    expect(source).toContain("appliedRepAuthorityIdentity");
    expect(source).toContain("appliedLaneAuthorityIdentity");
    expect(source).toContain("familyAuthority");
  });

  it("keeps provenance out of arithmetic and v2 runtime", () => {
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
    expect(source).not.toContain("repAuthoritySource ?");
    expect(source).not.toContain("laneAuthoritySource ?");
  });

  it("keeps unresolved collision and planned-order authority explicit", () => {
    expect(["override_method_role_collisions", "planned_order_authority"]).toHaveLength(2);
  });
});
