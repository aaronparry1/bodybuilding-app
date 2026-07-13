import { describe, expect, it } from "vitest";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import { resolveTrainingLane } from "@/domain/training/block-training-lanes";
import { COMPLETE_REP_LANE_AGGREGATE_REGISTRY } from "@/domain/training/complete-rep-lane-aggregate-contracts";
import { resolveCompleteRepLanePrecedence } from "@/domain/training/complete-rep-lane-precedence-resolver";

describe("D4E3C4D rep/lane resolver equivalence characterization", () => {
  it("matches observable ordinary hypertrophy rep/lane semantics", () => {
    const fixtures = [
      { entry: COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0], role: "primary_compound" as const, family: "horizontal_press" as const, expected: { min: 6, max: 10, lane: "hypertrophy_strength" } },
      { entry: COMPLETE_REP_LANE_AGGREGATE_REGISTRY[1], role: "secondary_compound" as const, family: "horizontal_pull" as const, expected: { min: 8, max: 12, lane: "hypertrophy" } },
      { entry: COMPLETE_REP_LANE_AGGREGATE_REGISTRY[2], role: "accessory" as const, family: "shoulder_isolation" as const, expected: { min: 10, max: 15, lane: "hypertrophy" } },
    ];
    for (const fixture of fixtures) {
      const productionRep = resolveRepRange({ blockType: "hypertrophy", exerciseRole: fixture.role, exerciseFamily: fixture.family });
      const productionLane = resolveTrainingLane({ blockType: "hypertrophy", exerciseRole: fixture.role });
      expect(productionRep).toEqual({ min: fixture.expected.min, max: fixture.expected.max });
      expect(productionLane).toBe(fixture.expected.lane);
    }
  });

  it("records resolver coverage gaps instead of treating them as equivalent", () => {
    const representative = COMPLETE_REP_LANE_AGGREGATE_REGISTRY[0];
    const result = resolveCompleteRepLanePrecedence({ schemaVersion: "v2", registryVersion: "v2", branchKey: representative.branchKey, explicitRolePresent: true, generatedSettingsFactsComplete: true });
    expect(result.status).toBe("resolved");
    // Explicit slot overrides, advanced methods, family precedence, planned order,
    // corrective/recovery branches, and public partial façades remain uncovered.
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "isolation", exerciseFamily: "calf_raise", programmeSlotOverride: { min: 5, max: 8 } })).toEqual({ min: 5, max: 8 });
  });
});
