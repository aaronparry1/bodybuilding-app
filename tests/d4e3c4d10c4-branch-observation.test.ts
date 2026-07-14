import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/block-training-lanes.ts"), "utf8");

describe("D4E3C4D10C4 observation boundary", () => {
  it("confirms the primitive selector has no internal observer seam", () => {
    expect(source).toContain("export function resolveTrainingLane");
    expect(source).not.toContain("onDecisionObserved");
  });

  it("keeps the experiment free of duplicated lane precedence", () => {
    expect(source).toContain("resolveTrainingLaneDecision");
    expect(source).not.toContain("ProvenanceSidecar");
    expect(source).not.toContain("onDecisionObserved");
  });
});
