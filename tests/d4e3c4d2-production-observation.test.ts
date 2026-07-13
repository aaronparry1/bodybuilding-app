import { describe, expect, it } from "vitest";
import { observeProductionRepLaneDecision } from "./support/production-rep-lane-observation";

describe("D4E3C4D2 production decision observation", () => {
  it("observes existing rep/lane results without v2 or mutable state", () => {
    const input = { blockType: "hypertrophy" as const, exerciseRole: "primary_compound" as const, exerciseFamily: "horizontal_press" as const };
    const first = observeProductionRepLaneDecision(input);
    const second = observeProductionRepLaneDecision(input);
    expect(first).toEqual(second);
    expect(first.rep).toEqual({ minimum: 6, maximum: 10 });
    expect(first.lane).toBe("hypertrophy_strength");
  });
  it("observes override output rather than inferring an authority", () => {
    const observed = observeProductionRepLaneDecision({ blockType: "hypertrophy", exerciseRole: "isolation", exerciseFamily: "calf_raise", programmeSlotOverride: { min: 5, max: 8 } });
    expect(observed.rep).toEqual({ minimum: 5, maximum: 8 });
    expect(observed.evidenceLevel).toBe("direct_helper_result");
  });
});
