import { describe, expect, it } from "vitest";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import type { MuscleGroup, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { buildPlannedWorkoutProgramme } from "@/domain/training/planned-workout";
import { createActiveTrainingPlan, type ActiveTrainingPlan } from "@/domain/training/plan-setup";
import type { PersonalisedVolumeResult, VolumeLadderAction } from "@/domain/training/personalised-volume";
import { exerciseLibrary } from "@/domain/training/presets";
import { resolveSetPrescription } from "@/domain/training/set-prescription";
import {
  approveVolumeAdjustment,
  ignoreVolumeAdjustment,
  previousVolumeLadderActions,
} from "@/domain/training/volume-adjustments";

function plan(overrides: Partial<ActiveTrainingPlan> = {}): ActiveTrainingPlan {
  const base = createActiveTrainingPlan(
    {
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 5,
      preferredSplit: "push_pull_legs",
      experienceLevel: "intermediate",
    },
    "2026-06-01T08:00:00.000Z",
  );
  return { ...base, ...overrides };
}

function recommendation(action: VolumeLadderAction, muscleGroup: MuscleGroup = "chest", confidence: PersonalisedVolumeResult["confidence"] = "medium"): PersonalisedVolumeResult {
  return {
    muscleGroup,
    status: action.includes("low") || action.includes("remove") ? "high_cost" : "underdosed",
    confidence,
    currentProductiveSetsPerWeek: 8,
    trend: "stable",
    recommendedLadderAction: action,
    reason: `${muscleGroup} needs a ladder action.`,
    userCopy: `${muscleGroup} ladder copy.`,
    evidence: {
      weeksObserved: 3,
      exposures: 3,
      extraSessionExposures: 0,
      shutdownRate: 0,
      progressionRate: 0,
      averageProductiveSetsPerWeek: 8,
      recentProductiveSetsPerWeek: 8,
      previousProductiveSetsPerWeek: 8,
      productiveRange: { low: 10, high: 16 },
      summary: ["3 weeks of muscle-specific evidence."],
    },
  };
}

function buildProgramme(activePlan: ActiveTrainingPlan) {
  return buildPlannedWorkoutProgramme({
    activePlan,
    exercises: exerciseLibrary,
    currentBlock: activePlan.blocks.find((block) => block.id === activePlan.activeBlockId),
    date: new Date("2026-06-02T09:00:00.000Z"),
  })!;
}

function chestAccessorySlots(activePlan: ActiveTrainingPlan) {
  const programme = buildProgramme(activePlan);
  return programme.days[0]!.exerciseSlots.filter((slot) => {
    const exercise = exerciseLibrary.find((item) => item.id === slot.exerciseId);
    return Boolean(exercise?.primaryMuscles.includes("chest") && exercise.tier !== "A" && (exercise.roles.includes("isolation") || exercise.roles.includes("accessory")));
  });
}

describe("approved personalised volume adjustments", () => {
  it("apply bias_high stores coaching intent without changing range", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("bias_high"), "2026-06-03T10:00:00.000Z");
    const before = buildProgramme(plan());
    const after = buildProgramme(activePlan);

    expect(activePlan.recommendationState?.volumeAdjustments?.[0]?.status).toBe("applied");
    expect(after.days[0]?.exerciseSlots.map((slot) => slot.settings.requiredWorkSets)).toEqual(before.days[0]?.exerciseSlots.map((slot) => slot.settings.requiredWorkSets));
    expect(after.days[0]?.exerciseSlots.some((slot) => slot.notes?.includes("Aim for the top of the range"))).toBe(true);
  });

  it("apply raise_range changes future accessory range 3-5 to 4-6", () => {
    const basePlan = plan();
    const before = chestAccessorySlots(basePlan)[0]!;
    const activePlan = approveVolumeAdjustment(basePlan, recommendation("raise_range"), "2026-06-03T10:00:00.000Z");
    const after = chestAccessorySlots(activePlan).find((slot) => slot.exerciseId === before.exerciseId)!;
    const beforeRange = resolveSetPrescription(before.settings);
    const afterRange = resolveSetPrescription(after.settings);

    expect(afterRange.requiredSets).toBe(beforeRange.requiredSets);
    expect(afterRange.recommendedMinSets).toBe(beforeRange.recommendedMinSets + 1);
    expect(afterRange.recommendedMaxSets).toBe(beforeRange.recommendedMaxSets + 1);
    expect(after.notes).toContain("start one set higher");
  });

  it("apply add_exercise adds low-fatigue accessory only", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("add_exercise"), "2026-06-03T10:00:00.000Z");
    const programme = buildProgramme(activePlan);
    const added = programme.days[0]!.exerciseSlots.find((slot) => slot.id.startsWith("volume-adjustment-"))!;
    const exercise = exerciseLibrary.find((item) => item.id === added.exerciseId)!;

    expect(exercise.primaryMuscles).toContain("chest");
    expect(exercise.fatigueCost).toBe("low");
    expect(exercise.roles.some((role) => role === "isolation" || role === "accessory")).toBe(true);
    expect(exercise.roles).not.toContain("power");
    expect(exercise.role).not.toBe("primary_compound");
    expect(added.notes).toContain("Plan adjustment");
  });

  it("apply bias_low stores coaching intent without changing range", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("bias_low"), "2026-06-03T10:00:00.000Z");
    const before = buildProgramme(plan());
    const after = buildProgramme(activePlan);

    expect(after.days[0]?.exerciseSlots.map((slot) => slot.settings.requiredWorkSets)).toEqual(before.days[0]?.exerciseSlots.map((slot) => slot.settings.requiredWorkSets));
    expect(after.days[0]?.exerciseSlots.some((slot) => slot.notes?.includes("Stay near the low end"))).toBe(true);
  });

  it("apply lower_range changes future accessory range 3-5 to 2-4", () => {
    const basePlan = plan();
    const before = chestAccessorySlots(basePlan)[0]!;
    const activePlan = approveVolumeAdjustment(basePlan, recommendation("lower_range"), "2026-06-03T10:00:00.000Z");
    const after = chestAccessorySlots(activePlan).find((slot) => slot.exerciseId === before.exerciseId)!;
    const beforeRange = resolveSetPrescription(before.settings);
    const afterRange = resolveSetPrescription(after.settings);

    expect(afterRange.requiredSets).toBe(Math.min(beforeRange.requiredSets, beforeRange.recommendedMinSets - 1));
    expect(afterRange.recommendedMinSets).toBe(beforeRange.recommendedMinSets - 1);
    expect(afterRange.recommendedMaxSets).toBe(beforeRange.recommendedMaxSets - 1);
    expect(after.notes).toContain("pull one set");
  });

  it("remove_or_swap avoids Tier A/main compounds", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("remove_or_swap_exercise", "chest", "high"), "2026-06-03T10:00:00.000Z");
    const exerciseIds = buildProgramme(activePlan).days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(exerciseIds).toContain("ex-bench-press");
  });

  it("ignored recommendation makes no future session change", () => {
    const activePlan = ignoreVolumeAdjustment(plan(), recommendation("raise_range"), "2026-06-03T10:00:00.000Z");
    expect(buildProgramme(activePlan).days[0]?.exerciseSlots).toEqual(buildProgramme(plan()).days[0]?.exerciseSlots);
    expect(activePlan.recommendationState?.volumeAdjustments?.[0]?.status).toBe("ignored");
  });

  it("approved action persists across reload", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("bias_high"), "2026-06-03T10:00:00.000Z");
    activeTrainingPlanRepository.save(activePlan);

    expect(activeTrainingPlanRepository.getOptional()?.recommendationState?.volumeAdjustments?.[0]?.action).toBe("bias_high");
  });

  it("approved action affects future sessions only and does not mutate active workouts or completed history", () => {
    const activeWorkout: WorkoutSession = {
      id: "active",
      name: "Push",
      startedAt: "2026-06-03T09:00:00.000Z",
      updatedAt: "2026-06-03T09:00:00.000Z",
      syncState: "local",
      exercises: [],
    };
    const history: WorkoutHistorySummary[] = [];
    const activeWorkoutSnapshot = structuredClone(activeWorkout);
    const historySnapshot = structuredClone(history);

    approveVolumeAdjustment(plan(), recommendation("add_exercise"), "2026-06-03T10:00:00.000Z");

    expect(activeWorkout).toEqual(activeWorkoutSnapshot);
    expect(history).toEqual(historySnapshot);
  });

  it("blocks more than one volume increase per muscle per week", () => {
    const first = approveVolumeAdjustment(plan(), recommendation("bias_high"), "2026-06-03T10:00:00.000Z");
    const second = approveVolumeAdjustment(first, recommendation("raise_range"), "2026-06-04T10:00:00.000Z");

    expect(second).toBe(first);
  });

  it("blocks a second structural add/remove per muscle per block unless confidence is high", () => {
    const first = approveVolumeAdjustment(plan(), recommendation("add_exercise", "chest", "medium"), "2026-06-03T10:00:00.000Z");
    const second = approveVolumeAdjustment(first, recommendation("remove_or_swap_exercise", "chest", "medium"), "2026-06-10T10:00:00.000Z");
    const highConfidence = approveVolumeAdjustment(first, recommendation("remove_or_swap_exercise", "chest", "high"), "2026-06-10T10:00:00.000Z");

    expect(second).toBe(first);
    expect(highConfidence.recommendationState?.volumeAdjustments).toHaveLength(2);
  });

  it("blocks add-volume during deload", () => {
    const base = plan();
    const deloadBlock = createTrainingBlock("deload", { id: "deload-block", status: "active" });
    const deloadPlan = {
      ...base,
      activeBlockId: deloadBlock.id,
      blocks: [deloadBlock, ...base.blocks.map((block) => ({ ...block, status: "planned" as const }))],
    };

    expect(approveVolumeAdjustment(deloadPlan, recommendation("add_exercise"), "2026-06-03T10:00:00.000Z")).toBe(deloadPlan);
  });

  it("previous applied action feeds model input", () => {
    const activePlan = approveVolumeAdjustment(plan(), recommendation("bias_high", "back"), "2026-06-03T10:00:00.000Z");

    expect(previousVolumeLadderActions(activePlan, "back")).toEqual(["bias_high"]);
  });
});
