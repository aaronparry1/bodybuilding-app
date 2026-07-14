import { describe, expect, it } from "vitest";
import { resolveTrainingLane } from "@/domain/training/block-training-lanes";

const fixtures = [
  ["deload-recovery", { blockType: "deload", exerciseRole: "recovery" }, "recovery"],
  ["deload-maintenance", { blockType: "deload", exerciseRole: "accessory" }, "maintenance"],
  ["peak-first-order", { blockType: "peak", plannedOrder: 1 }, "peak"],
  ["peak-secondary", { blockType: "peak", exerciseRole: "secondary_compound" }, "strength_support"],
  ["peak-default", { blockType: "peak", exerciseRole: "accessory" }, "maintenance"],
  ["power-power-role", { blockType: "power", exerciseRole: "power" }, "power"],
  ["power-primary", { blockType: "power", exerciseRole: "primary_compound" }, "strength_support"],
  ["power-default", { blockType: "power", exerciseRole: "accessory" }, "maintenance"],
  ["strength-primary", { blockType: "strength", exerciseRole: "primary_compound" }, "strength"],
  ["strength-secondary", { blockType: "strength", exerciseRole: "secondary_compound" }, "strength_support"],
  ["strength-default", { blockType: "strength", exerciseRole: "accessory" }, "maintenance"],
  ["powerbuilding-primary", { blockType: "powerbuilding", exerciseRole: "primary_compound" }, "strength"],
  ["powerbuilding-secondary", { blockType: "powerbuilding", exerciseRole: "secondary_compound" }, "hypertrophy_strength"],
  ["powerbuilding-default", { blockType: "powerbuilding", exerciseRole: "accessory" }, "hypertrophy"],
  ["hypertrophy-primary", { blockType: "hypertrophy", exerciseRole: "primary_compound" }, "hypertrophy_strength"],
  ["hypertrophy-power", { blockType: "hypertrophy", exerciseRole: "power" }, "power"],
  ["hypertrophy-default", { blockType: "hypertrophy", exerciseRole: "accessory" }, "hypertrophy"],
] as const;

describe("D4E3C4D10C2 primitive lane characterization", () => {
  it.each(fixtures)("returns the restored baseline lane for %s", (_id, input, expected) => {
    const before = structuredClone(input);
    expect(resolveTrainingLane(input)).toBe(expected);
    expect(input).toEqual(before);
    expect(resolveTrainingLane(input)).toBe(expected);
  });

  it("locks planned-order versus role precedence", () => {
    expect(resolveTrainingLane({ blockType: "peak", plannedOrder: 1 })).toBe("peak");
    expect(resolveTrainingLane({ blockType: "peak", plannedOrder: 1, exerciseRole: "primary_compound" })).toBe("peak");
  });

  it("preserves nullish and malformed tolerance", () => {
    expect(resolveTrainingLane({})).toBe("hypertrophy");
    expect(resolveTrainingLane({ blockType: null, exerciseRole: null, slotRole: null, plannedOrder: -1 })).toBe("hypertrophy");
  });
});
