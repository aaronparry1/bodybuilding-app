import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("D4E3C4D4 final compatibility decision boundary", () => {
  it("projects rep and lane through one internal final decision before set construction", () => {
    const source = readFileSync("src/domain/training/ad-hoc-workout-generator.ts", "utf8");
    expect(source).toContain("resolveCompatibilityFinalRepLaneDecision");
    expect(source).toContain("repRange: decision?.repRange");
    expect(source).toContain("trainingLane: lane");
    expect(source).not.toContain("compatibility-prescription-aggregate-resolver");
  });
  it("keeps the decision contract diagnostic-only and v2-free", () => {
    const source = readFileSync("src/domain/training/ad-hoc-workout-generator.ts", "utf8");
    expect(source).toContain("ownershipStage: \"helper_resolution\"");
    expect(source).not.toContain("resolveCompleteRepLanePrecedence");
  });
});
