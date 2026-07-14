import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/block-training-lanes.ts"), "utf8");

describe("D4E3C4D10C6 private lane authority", () => {
  it("retains branch-local metadata without changing the primitive façade", () => {
    expect(source).toContain("appliedIdentity");
    expect(source).toContain("plannedOrderClass");
    expect(source).toContain("winnerRetention");
    expect(source).toContain("return resolveTrainingLaneDecision(input).lane");
  });

  it("keeps the rich result internal and out of generated settings", () => {
    expect(source).not.toContain("export type ResolvedTrainingLaneDecision");
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
  });
});
