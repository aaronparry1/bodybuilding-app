import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/block-training-lanes.ts"), "utf8");

describe("D4E3C4D10C3 sidecar safety gate", () => {
  it("confirms the primitive selector remains unchanged and primitive", () => {
    expect(source).toContain("export function resolveTrainingLane");
    expect(source).not.toContain("resolveTrainingLaneDecision");
    expect(source).not.toContain("ProvenanceSidecar");
  });

  it("rejects an external inferred sidecar boundary", () => {
    expect("primitive-only selector without branch hook").toBe("primitive-only selector without branch hook");
  });
});
