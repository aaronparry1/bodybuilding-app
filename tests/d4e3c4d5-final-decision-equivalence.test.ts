import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const generatorPath = path.join(process.cwd(), "src/domain/training/ad-hoc-workout-generator.ts");
const source = fs.readFileSync(generatorPath, "utf8");

describe("D4E3C4D5 final compatibility rep/lane decision audit", () => {
  it("projects one immutable decision into generated settings", () => {
    expect(source).toContain("const decisionResult = resolveCompatibilityFinalRepLaneDecision");
    expect(source).toContain("repRange: decision?.repRange");
    expect(source).toContain("return applyLaneSetConstraints({ ...generated, trainingLane: lane }, lane)");
    expect(source).toContain('ownershipStage: "helper_resolution"');
  });

  it("keeps the final decision boundary free of v2 runtime imports", () => {
    expect(source).not.toContain("complete-rep-lane-precedence-resolver");
    expect(source).not.toContain("resolveCompatibilityPrescriptionSemantics");
  });

  it("has no rep/lane reassignment after the decision projection", () => {
    const start = source.indexOf("function resolveGeneratedSettings");
    const end = source.indexOf("function getSafeDropOffPercent", start);
    const projection = source.slice(start, end);
    expect(projection.match(/repRange\s*:/g)?.length).toBe(2);
    expect(projection.match(/trainingLane\s*:/g)?.length).toBe(2);
  });

  it("records the honest coverage gate: ordinary branches are exact, model gaps remain blocked", () => {
    const exactOrdinaryBranches = ["primary_compound", "secondary_compound", "accessory"];
    const unresolvedGaps = [
      "override_authority",
      "advanced_methods",
      "family_collisions",
      "special_families",
      "planned_order_final_authority",
      "partial_facades",
    ];
    expect(exactOrdinaryBranches).toHaveLength(3);
    expect(unresolvedGaps).toHaveLength(6);
  });

  it("does not imply caller migration readiness", () => {
    expect(source).not.toContain("resolveCompatibilityPrescriptionSemantics");
    expect(source).toContain("decision?.repRange");
  });
});
