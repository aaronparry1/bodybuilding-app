import { describe, expect, it } from "vitest";
import { resolveTrainExecutionTarget } from "@/domain/training/train-execution-target";
import { defaultHypertrophySettings } from "@/domain/training/presets";

const exercise = (repRange: { min: number; max: number }, prescribedSetTargets?: number[]) => ({
  settings: { ...defaultHypertrophySettings, repRange },
  ...(prescribedSetTargets ? { prescribedSetTargets } : {}),
});

describe("Train planned execution target authority", () => {
  it("uses the stored exact target for the selected planned work-set ordinal", () => {
    const target = resolveTrainExecutionTarget({
      sessionKind: "planned",
      exercise: exercise({ min: 8, max: 12 }, [5, 7]),
      workSetIndex: 1,
    });

    expect(target).toEqual({ source: "exact_planned_target", reps: 7 });
  });

  it("does not change a planned execution target when range metadata changes", () => {
    const first = resolveTrainExecutionTarget({
      sessionKind: "planned",
      exercise: exercise({ min: 8, max: 12 }, [6]),
      workSetIndex: 0,
    });
    const changedBoundary = resolveTrainExecutionTarget({
      sessionKind: "planned",
      exercise: exercise({ min: 1, max: 30 }, [6]),
      workSetIndex: 0,
    });

    expect(first).toEqual({ source: "exact_planned_target", reps: 6 });
    expect(changedBoundary).toEqual(first);
  });

  it("keeps a planned workout with a missing exact target in an explicit compatibility state", () => {
    const target = resolveTrainExecutionTarget({
      sessionKind: "planned",
      exercise: exercise({ min: 8, max: 12 }, [6]),
      workSetIndex: 1,
    });

    expect(target).toEqual({ source: "planned_target_missing", reps: null });
  });

  it("retains boundary metadata for non-planned sessions without treating it as a planned prescription", () => {
    const target = resolveTrainExecutionTarget({
      sessionKind: "extra_volume",
      exercise: exercise({ min: 8, max: 12 }),
      workSetIndex: 0,
    });

    expect(target).toEqual({ source: "non_planned_boundary", reps: 12 });
  });
});
