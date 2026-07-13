import { describe, expect, it } from "vitest";
import { resolveRepRange, resolveRepRangeDecision } from "@/domain/training/rep-range-strategy";

describe("D4E3C4D10A explicit rep override decision", () => {
  it("retains the override winner while preserving the primitive façade", () => {
    const input = { blockType: "hypertrophy" as const, programmeSlotOverride: { min: 3, max: 5 }, exerciseDefault: { min: 8, max: 12 } };
    const rich = resolveRepRangeDecision(input);
    expect(rich.authoritySource).toBe("explicit_slot_override");
    expect(rich.appliedIdentity).toBe("programme_slot_override");
    expect(rich.value).toEqual({ min: 3, max: 5 });
    expect(resolveRepRange(input)).toEqual(rich.value);
  });

  it("keeps the existing branch order when no override applies", () => {
    const rich = resolveRepRangeDecision({ blockType: "hypertrophy", exerciseRole: "primary_compound", exerciseDefault: { min: 8, max: 12 } });
    expect(rich.authoritySource).toBe("block_compatibility");
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "primary_compound", exerciseDefault: { min: 8, max: 12 } })).toEqual(rich.value);
  });
});
