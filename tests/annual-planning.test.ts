import { describe, expect, it } from "vitest";
import {
  calculateEmergentVolumeTrend,
  createAnnualPlan,
  createTrainingBlock,
  detectBestSetDrop,
  detectQualitySetCollapse,
  getBlockDropOffPercentage,
  getBlockRepRange,
  naturalLifterAnnualPlan,
  recommendBlockAction,
} from "@/domain/training/annual-planner";
import type { BlockPerformanceSnapshot } from "@/domain/training/annual-models";

function snapshot(
  sessionId: string,
  bestSetReps: number,
  qualitySets: number,
  stoppedByDropOff = false,
): BlockPerformanceSnapshot {
  return {
    sessionId,
    completedAt: `2026-06-0${sessionId}.000Z`,
    bestSetReps,
    qualitySets,
    stoppedByDropOff,
    earlyDropOff: stoppedByDropOff,
  };
}

describe("annual autoregulation planning", () => {
  it("uses hypertrophy block defaults", () => {
    const block = createTrainingBlock("hypertrophy");

    expect(getBlockRepRange(block)).toEqual({ min: 6, max: 20 });
    expect(getBlockDropOffPercentage(block)).toBe(18);
    expect(block.volumeEmphasis).toBe("high");
  });

  it("uses strength block defaults", () => {
    const block = createTrainingBlock("strength");

    expect(getBlockRepRange(block)).toEqual({ min: 3, max: 15 });
    expect(getBlockDropOffPercentage(block)).toBe(10);
    expect(block.intensityEmphasis).toBe("high");
  });

  it("creates the natural lifter annual block sequence", () => {
    const year = createAnnualPlan(naturalLifterAnnualPlan, "2026-01-01T00:00:00.000Z");

    expect(year.blocks.map((block) => block.type)).toEqual([
      "hypertrophy",
      "powerbuilding",
      "strength",
      "power",
      "peak",
      "deload",
    ]);
    expect(year.blocks[0]?.status).toBe("active");
    expect(year.currentBlockId).toBe(year.blocks[0]?.id);
  });

  it("keeps every block hypertrophy-first enough to retain muscle work", () => {
    for (const type of ["hypertrophy", "powerbuilding", "strength", "power", "peak"] as const) {
      const block = createTrainingBlock(type);
      expect(block.hypertrophyShare).toBeGreaterThan(0);
      expect(block.hypertrophyAccessoryRepRange.min).toBeGreaterThanOrEqual(8);
      expect(block.hypertrophyAccessoryRepRange.max).toBeGreaterThanOrEqual(block.hypertrophyAccessoryRepRange.min);
    }
  });

  it("models powerbuilding as strength plus hypertrophy", () => {
    const block = createTrainingBlock("powerbuilding");

    expect(block.strengthShare).toBe(50);
    expect(block.hypertrophyShare).toBe(50);
    expect(block.mainRepRange).toEqual({ min: 4, max: 8 });
    expect(block.accessoryRepRange).toEqual({ min: 8, max: 15 });
  });

  it("models strength and power blocks with hypertrophy accessories", () => {
    const strength = createTrainingBlock("strength");
    const power = createTrainingBlock("power");

    expect(strength.strengthShare).toBe(75);
    expect(strength.hypertrophyShare).toBe(25);
    expect(strength.hypertrophyAccessoryRepRange).toEqual({ min: 8, max: 15 });
    expect(power.powerShare).toBe(30);
    expect(power.strengthShare).toBe(50);
    expect(power.hypertrophyShare).toBe(20);
  });

  it("treats rising quality sets as emergent volume", () => {
    const trend = calculateEmergentVolumeTrend([
      snapshot("1", 12, 3),
      snapshot("2", 12, 4),
      snapshot("3", 12, 5),
      snapshot("4", 12, 6),
    ]);

    expect(trend.qualitySets).toEqual([3, 4, 5, 6]);
    expect(trend.trend).toBe("rising");
    expect(trend.change).toBe(3);
  });

  it("detects a best-set deload trigger after a meaningful drop", () => {
    const trigger = detectBestSetDrop([snapshot("1", 12, 5), snapshot("2", 12, 5), snapshot("3", 11, 4)]);

    expect(trigger.active).toBe(true);
    expect(trigger.type).toBe("best_set_drop");
  });

  it("detects quality set collapse", () => {
    const trigger = detectQualitySetCollapse([snapshot("1", 12, 5), snapshot("2", 12, 5), snapshot("3", 11, 3)]);

    expect(trigger.active).toBe(true);
    expect(trigger.evidence).toContain("3 quality sets");
  });

  it("does not recommend deload from one weak signal", () => {
    const recommendation = recommendBlockAction([snapshot("1", 12, 5), snapshot("2", 12, 5), snapshot("3", 11, 5)]);

    expect(recommendation.action).not.toBe("deload_next_week");
    expect(recommendation.action).not.toBe("end_block_early");
  });

  it("recommends a deload when multiple fatigue signals align", () => {
    const recommendation = recommendBlockAction([
      snapshot("1", 12, 5),
      snapshot("2", 12, 5),
      snapshot("3", 11, 3, true),
      snapshot("4", 10, 3, true),
    ]);

    expect(["deload_next_week", "end_block_early"]).toContain(recommendation.action);
    expect(recommendation.nextBlockType).toBe("deload");
  });
});
