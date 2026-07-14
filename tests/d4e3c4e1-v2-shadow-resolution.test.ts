import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shadowResolveCompatibilityV2 } from "@/domain/training/compatibility-v2-shadow";

const generatorSource = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts"), "utf8");

describe("D4E3C4E1 v2 shadow resolution", () => {
  it("evaluates only after production facts exist and does not alter the production lane", () => {
    const result = shadowResolveCompatibilityV2({ blockType: "hypertrophy", exerciseRole: "accessory", slotRole: "accessory", exerciseFamily: "ordinary", lane: "hypertrophy", repMinimum: 10, repMaximum: 15 });
    expect(result.production).toEqual({ lane: "hypertrophy", repMinimum: 10, repMaximum: 15 });
    expect(result.eligibility).toBe("eligible");
    expect(result.status).toMatch(/resolved|v2_resolution_failed/);
  });

  it("keeps shadow data outside generated settings and preserves one selector call", () => {
    expect(generatorSource).toContain("const laneDecision = resolveTrainingLaneDecision");
    expect(generatorSource).toContain("const shadow = shadowResolveCompatibilityV2");
    expect(generatorSource).not.toContain("trainingLane: shadow");
    expect(generatorSource).not.toContain("resolveCompleteRepLanePrecedence");
  });
});
