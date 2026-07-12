import { describe, expect, it } from "vitest";
import { calculateCurrentVolumeSetAdjustment } from "@/domain/training/current-volume-set-adjustment";
describe("current volume set adjustment", () => {
  it("adjusts and clamps deterministically", () => {
    expect(calculateCurrentVolumeSetAdjustment({ currentSetCount: 3, direction: "increase", magnitude: 2, minimumSetCount: 1, maximumSetCount: 4 })).toMatchObject({ status: "adjusted", resultingSetCount: 4, maximumClamped: true });
    expect(calculateCurrentVolumeSetAdjustment({ currentSetCount: 2, direction: "reduce", magnitude: 2, minimumSetCount: 1, maximumSetCount: 10 })).toMatchObject({ status: "adjusted", resultingSetCount: 1, minimumClamped: true });
  });
  it("reports no-op and invalid inputs explicitly", () => {
    expect(calculateCurrentVolumeSetAdjustment({ currentSetCount: 3, direction: "maintain", magnitude: 1, minimumSetCount: 1, maximumSetCount: 5 })).toMatchObject({ status: "unchanged", reason: "maintain" });
    expect(calculateCurrentVolumeSetAdjustment({ currentSetCount: 3.5, direction: "increase", magnitude: 1, minimumSetCount: 1, maximumSetCount: 5 })).toEqual({ status: "invalid_input", reason: "non_integer" });
  });
});
