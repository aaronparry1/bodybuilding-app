import { describe, expect, it } from "vitest";
import { resolveRepRange, resolveRepRangeDecision } from "@/domain/training/rep-range-strategy";

describe("D4E3C4D10B advanced-method decision", () => {
  it("retains the method identity without changing the primitive façade", () => {
    const input = { userAdvancedOverride: { enabled: true, repRange: { min: 2, max: 4 } } };
    const decision = resolveRepRangeDecision(input);
    expect(decision.authoritySource).toBe("advanced_method");
    expect(decision.appliedIdentity).toBe("user_advanced_override");
    expect(decision.value).toEqual({ min: 2, max: 4 });
    expect(resolveRepRange(input)).toEqual(decision.value);
  });

  it("does not evaluate the method when an explicit override already wins", () => {
    const input = { blockType: "hypertrophy" as const, programmeSlotOverride: { min: 3, max: 5 }, userAdvancedOverride: { enabled: true, repRange: { min: 1, max: 2 } } };
    expect(resolveRepRangeDecision(input).authoritySource).toBe("explicit_slot_override");
  });
});
