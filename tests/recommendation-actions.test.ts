import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import {
  advanceActivePlanBlock,
  chooseNextSingleBlock,
  decideLaterOnBlock,
  getBlockTransitionPreview,
  ignoreDeloadPlan,
  keepExerciseDespiteRotationRecommendation,
  replaceExerciseForFutureSessions,
  repeatActivePlanBlock,
  shouldSuppressRotationRecommendation,
  startDeloadPlan,
} from "@/domain/training/recommendation-actions";

function plan() {
  const canonical = createActiveTrainingPlan(
    {
      goal: "build_muscle_and_strength",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
  // These tests exercise the retained compatibility adapter, not canonical mutation.
  const { authority: _authority, currentMesocycleId: _mesocycle, currentMicrocycle: _microcycle, ...legacy } = canonical;
  return legacy;
}

function endingPlan() {
  const base = plan();
  return {
    ...base,
    blocks: base.blocks.map((block, index) =>
      index === 0 ? { ...block, currentWeek: block.durationWeeks } : block,
    ),
  };
}

describe("recommendation action flows", () => {
  it("advances the active plan block and keeps completed history out of the mutation", () => {
    const activePlan = endingPlan();
    const advanced = advanceActivePlanBlock(activePlan, "2026-06-06T10:00:00.000Z");

    expect(advanced.activeBlockId).toBe(activePlan.blocks[1]!.id);
    expect(advanced.blocks[0]?.status).toBe("completed");
    expect(advanced.blocks[1]?.status).toBe("active");
    expect(advanced.blocks[1]?.currentWeek).toBe(1);
    expect(advanced.recommendationState?.blockDecision?.type).toBe("advanced");
  });

  it("repeats the current block by restarting its week without advancing", () => {
    const activePlan = endingPlan();
    const repeated = repeatActivePlanBlock(activePlan, "2026-06-06T10:00:00.000Z");

    expect(repeated.activeBlockId).toBe(activePlan.activeBlockId);
    expect(repeated.blocks[0]?.type).toBe("hypertrophy");
    expect(repeated.blocks[0]?.status).toBe("active");
    expect(repeated.blocks[0]?.currentWeek).toBe(1);
    expect(repeated.recommendationState?.blockDecision?.type).toBe("repeated");
  });

  it("decide later records the decision without changing the block", () => {
    const activePlan = endingPlan();
    const held = decideLaterOnBlock(activePlan, "2026-06-06T10:00:00.000Z");

    expect(held.activeBlockId).toBe(activePlan.activeBlockId);
    expect(held.blocks).toEqual(activePlan.blocks);
    expect(held.recommendationState?.blockDecision?.type).toBe("decided_later");
  });

  it("creates an active deload phase without erasing the plan", () => {
    const activePlan = plan();
    const deloaded = startDeloadPlan(activePlan, "2026-06-06T10:00:00.000Z", "severe");

    expect(deloaded.blocks.some((block) => block.type === "hypertrophy")).toBe(true);
    expect(deloaded.blocks.find((block) => block.id === deloaded.activeBlockId)?.type).toBe("deload");
    expect(deloaded.blocks.find((block) => block.id === deloaded.activeBlockId)?.notes.join(" ")).toContain("reduce productive sets 50-70%");
    expect(deloaded.recommendationState?.deload?.status).toBe("accepted");
  });

  it("ignoring a deload records no structural plan change", () => {
    const activePlan = plan();
    const ignored = ignoreDeloadPlan(activePlan, "2026-06-06T10:00:00.000Z");

    expect(ignored.blocks).toEqual(activePlan.blocks);
    expect(ignored.recommendationState?.deload?.status).toBe("ignored");
  });

  it("applies a stalled exercise replacement to future planned sessions only", () => {
    const replaced = replaceExerciseForFutureSessions(
      plan(),
      "ex-bench-press",
      "ex-machine-chest-press",
      "Bench Press stalled across repeated exposures.",
      "2026-06-06T10:00:00.000Z",
    );
    expect(replaced.recommendationState?.exerciseReplacements?.["ex-bench-press"]?.replacementExerciseId).toBe("ex-machine-chest-press");
    expect(replaced.recommendationState?.exerciseReplacements?.["ex-bench-press"]?.reason).toContain("stalled");
  });

  it("keeping a stalled exercise suppresses the immediate repeat prompt", () => {
    const kept = keepExerciseDespiteRotationRecommendation(
      plan(),
      "ex-bench-press",
      "Still feels good and setup is available.",
      "2026-06-06T10:00:00.000Z",
    );

    expect(shouldSuppressRotationRecommendation(kept, "ex-bench-press")).toBe(true);
  });

  it("detects block transition availability only at the block endpoint", () => {
    expect(getBlockTransitionPreview(plan()).available).toBe(false);
    expect(getBlockTransitionPreview(endingPlan()).available).toBe(true);
  });

  it("lets single-block users choose the next block at the endpoint", () => {
    const base = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "single_block",
        singleBlockType: "hypertrophy",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T08:00:00.000Z",
    );
    const { authority: _authority, currentMesocycleId: _mesocycle, currentMicrocycle: _microcycle, ...legacyBase } = base;
    const ending = {
      ...legacyBase,
      blocks: base.blocks.map((block) => ({ ...block, currentWeek: block.durationWeeks })),
    };
    const chosen = chooseNextSingleBlock(ending, "peak", "2026-07-13T08:00:00.000Z");

    expect(getBlockTransitionPreview(ending).title).toBe("Choose next block");
    expect(chosen.blocks[0]?.status).toBe("completed");
    expect(chosen.blocks.at(-1)?.type).toBe("peak");
    expect(chosen.blocks.at(-1)?.status).toBe("active");
    expect(chosen.activeBlockId).toBe(chosen.blocks.at(-1)?.id);
  });

  it("does not apply block actions before the endpoint evidence exists", () => {
    const activePlan = plan();

    expect(advanceActivePlanBlock(activePlan)).toEqual(activePlan);
    expect(repeatActivePlanBlock(activePlan)).toEqual(activePlan);
    expect(decideLaterOnBlock(activePlan)).toEqual(activePlan);
  });
});
