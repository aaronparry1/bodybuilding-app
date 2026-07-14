import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4D10C7 lane final-decision integration", () => {
  it("evaluates the rich lane selector once and projects only lane into settings", () => {
    expect(source).toContain("const laneDecision = resolveTrainingLaneDecision");
    expect(source).toContain("resolveCompatibilityFinalRepLaneDecision(exercise, slot, currentBlock, laneDecision)");
    expect(source).toContain("const lane = decision?.lane ?? laneDecision.lane");
    expect(source).toContain("suppliedLaneDecision?: ResolvedTrainingLaneDecision");
    expect(source).not.toContain("trainingLane: laneDecision");
  });

  it("copies selector provenance at the final decision boundary without v2", () => {
    expect(source).toContain("laneAuthoritySource: laneDecision.source");
    expect(source).toContain("appliedLaneAuthorityIdentity: `production.${laneDecision.appliedIdentity}.lane`");
    expect(source).toContain("winnerRetention: laneDecision.winnerRetention");
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
  });
});
