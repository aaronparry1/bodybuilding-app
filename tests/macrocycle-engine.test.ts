import { describe, expect, it } from "vitest";
import { createMacrocycle, macrocycleEngineForGoal } from "@/domain/training/macrocycle-engine";

describe("macrocycle engine selection", () => {
  it.each([
    ["build_muscle", "hypertrophy"],
    ["build_muscle_and_strength", "powerbuilding"],
    ["build_strength", "strength"],
    ["athletic_performance", "athletic_performance"],
  ] as const)("maps %s to the %s engine", (goal, engine) => {
    expect(macrocycleEngineForGoal(goal)).toBe(engine);
  });

  it("keeps an undated plan rolling and makes a dated plan finite", () => {
    expect(createMacrocycle("build_muscle", "intermediate").rolling).toBe(true);
    expect(createMacrocycle("build_strength", "intermediate", "2026-10-01", "2026-07-01").rolling).toBe(false);
  });
});
