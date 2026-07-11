import { describe, expect, it } from "vitest";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { buildProductiveSetGuidance, resolveProductiveSetTarget } from "@/domain/training/productive-set-targets";
import type { ProgressionSettings, SetLog } from "@/domain/training/models";

const settings: ProgressionSettings = {
  repRange: { min: 8, max: 12 },
  dropOffPercent: 15,
  loadIncrease: 2.5,
  requiredWorkSets: 3,
  unit: "kg",
};

describe("productive set targets", () => {
  it("resolves productive set targets by block and role", () => {
    expect(resolveProductiveSetTarget({ blockType: "hypertrophy", exerciseRole: "primary_compound" })).toMatchObject({
      min: 3,
      targetMin: 4,
      targetMax: 6,
      softCap: 8,
    });
    expect(resolveProductiveSetTarget({ blockType: "powerbuilding", exerciseRole: "primary_compound" })).toMatchObject({
      min: 3,
      targetMin: 3,
      targetMax: 5,
      softCap: 6,
    });
    expect(resolveProductiveSetTarget({ blockType: "power", exerciseRole: "power" })).toMatchObject({
      min: 3,
      targetMin: 4,
      targetMax: 8,
      softCap: 10,
    });
  });

  it("uses higher productive set guidance for small muscle isolation", () => {
    const target = resolveProductiveSetTarget({
      blockType: "hypertrophy",
      exerciseRole: "isolation",
      primaryMuscles: ["biceps"],
    });

    expect(target.targetMin).toBe(3);
    expect(target.targetMax).toBe(6);
    expect(target.softCap).toBe(8);
  });

  it("shows a soft-cap prompt without forcing shutdown", () => {
    const sets: SetLog[] = Array.from({ length: 8 }, (_, index) => ({
      id: `set-${index}`,
      setNumber: index + 1,
      reps: 12,
      load: 100,
      loggedAt: "2026-06-05T10:00:00.000Z",
      type: "work",
    }));
    const progression = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings,
      sets,
    });
    const guidance = buildProductiveSetGuidance({
      blockType: "hypertrophy",
      exerciseRole: "primary_compound",
      productiveSets: progression.completedAcceptableSets,
    });

    expect(progression.shouldShutdown).toBe(false);
    expect(guidance.softCapReached).toBe(true);
    expect(guidance.softCapText).toContain("Most lifters would move on");
  });

  it("keeps Recovery Window training conservative without changing shutdown logic", () => {
    const target = resolveProductiveSetTarget({ blockType: "deload", exerciseRole: "primary_compound" });
    const guidance = buildProductiveSetGuidance({
      blockType: "deload",
      exerciseRole: "primary_compound",
      productiveSets: 3,
    });

    expect(target).toMatchObject({ min: 1, targetMin: 1, targetMax: 2, softCap: 3 });
    expect(target.reason).toContain("Recovery Window guidance lowers productive work");
    expect(guidance.softCapReached).toBe(true);
  });

  it("keeps low-fatigue Recovery Window work below normal training volume", () => {
    const recovery = resolveProductiveSetTarget({ blockType: "deload", exerciseRole: "isolation" });
    const normal = resolveProductiveSetTarget({ blockType: "hypertrophy", exerciseRole: "isolation" });

    expect(recovery.targetMax).toBeLessThan(normal.targetMax);
    expect(recovery.softCap).toBeLessThan(normal.softCap);
  });
});
