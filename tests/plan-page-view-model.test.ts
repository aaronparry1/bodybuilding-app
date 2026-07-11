import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import type { WorkoutSession } from "@/domain/training/models";
import { buildPlanPageViewModel } from "@/domain/training/plan-page-view-model";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";

function workoutFixture({
  id,
  planSessionIndex,
  sessionKind = "planned",
  completedAt,
  prescribedSetTargets,
}: {
  id: string;
  planSessionIndex?: number;
  sessionKind?: WorkoutSession["sessionKind"];
  completedAt?: string;
  prescribedSetTargets?: number[];
}): WorkoutSession {
  const startedAt = "2026-06-04T09:00:00.000Z";
  return {
    id,
    name: `Workout ${id}`,
    planSessionIndex,
    sessionKind,
    startedAt,
    ...(completedAt ? { completedAt } : {}),
    exercises: [{
      id: `${id}-exercise`,
      exerciseId: "barbell-back-squat",
      exerciseName: "Barbell Back Squat",
      settings: { repRange: { min: 5, max: 8 }, dropOffPercent: 15, loadIncrease: 2.5, unit: "kg", requiredWorkSets: 3 },
      load: 80,
      ...(prescribedSetTargets ? { prescribedSetTargets } : {}),
      sets: [],
      status: "active",
      origin: "planned",
    }],
    syncState: "local",
    updatedAt: startedAt,
  };
}

describe("Plan page view model", () => {
  it("shows a clean no-plan state without inventing a training plan", () => {
    const viewModel = buildPlanPageViewModel({ activePlan: null });

    expect(viewModel.hasActivePlan).toBe(false);
    expect(viewModel.emptyTitle).toBe("Set up your training plan");
    expect(viewModel.roadmap).toEqual([]);
    expect(viewModel.thisWeek).toEqual([]);
    expect(viewModel.currentMesocyclePurpose).toBeNull();
    expect(viewModel.currentMicrocycle).toBeNull();
    expect(viewModel.currentSessionRole).toBeNull();
    expect(viewModel.approvedNextMesocycles).toEqual([]);
    expect(viewModel.openPlannedWorkout).toBeNull();
    expect(viewModel.setupHref).toBe("/(protected)/onboarding");
  });

  it("summarizes the real active recommended plan", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan, currentBlock: plan.blocks[0], date: new Date("2026-06-04T09:00:00.000Z") });

    expect(viewModel.summary.goal).toBe("Build Muscle + Strength");
    expect(viewModel.summary.planStyle).toBe("Recommended 12-month plan");
    expect(viewModel.summary.schedule).toBe("4 days / week");
    expect(viewModel.summary.split).toBe("Upper lower");
    expect(viewModel.currentMesocyclePurpose).toBe("Establish repeatable squat, bench and deadlift");
    expect(viewModel.currentMicrocycle).toEqual({ number: 1, priority: "Main lifts plus muscle development" });
    expect(viewModel.currentSessionRole).toBe("Bench and hypertrophy");
    expect(viewModel.summary.planDuration).toMatch(/^\d+ weeks$/);
    expect(viewModel.summary.currentDay).toBe("Upper");
    expect(viewModel.roadmapSummary).toEqual({
      title: "Your training year",
      currentPhase: "Establish repeatable squat, bench and deadlift",
      goal: "Build Muscle + Strength",
      copy: "Build muscle first, then turn it into stronger performance.",
    });
    expect(viewModel.roadmap.some((block) => block.status === "current")).toBe(true);
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).toEqual(["powerbuilding_hypertrophy"]);
  });

  it("does not pretend more blocks are coming in single-block hypertrophy mode", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "single_block",
        singleBlockType: "hypertrophy",
        equipmentPreset: "full_gym",
        daysPerWeek: 3,
        preferredSplit: "full_body",
        experienceLevel: "beginner",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan, currentBlock: plan.blocks[0], date: new Date("2026-06-02T09:00:00.000Z") });

    expect(viewModel.roadmap.map((block) => block.label)).toEqual(["Hypertrophy"]);
    expect(viewModel.roadmapStages).toHaveLength(1);
  });

  it("supports single-block powerbuilding mode", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "single_block",
        singleBlockType: "powerbuilding",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan });

    expect(viewModel.roadmap.map((block) => block.label)).toEqual(["Powerbuilding"]);
    expect(viewModel.currentMesocyclePurpose).toBe("Establish repeatable squat, bench and deadlift");
  });

  it("shows only relevant blocks for an event plan", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_strength",
        planningChoice: "custom_date_event",
        eventType: "powerlifting_meet",
        targetDate: "2026-10-01",
        equipmentPreset: "full_gym",
        daysPerWeek: 5,
        preferredSplit: "push_pull_legs",
        experienceLevel: "advanced",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan });

    expect(viewModel.summary.planStyle).toBe("Powerlifting Meet Date Plan");
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).toEqual(["strength_accumulation"]);
    expect(viewModel.currentMesocyclePurpose).toBe("Build work capacity and movement tolerance");
    expect(viewModel.summary.planDuration).not.toBe("50 weeks");
  });

  it("keeps recommended Powerlifting Meet annual plans annual when explicitly requested", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "recommended_12_month",
        eventType: "powerlifting_meet",
        targetDate: "2026-12-01",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan, date: new Date("2026-06-04T09:00:00.000Z") });

    expect(viewModel.summary.planStyle).toBe("Recommended 12-month plan");
    expect(viewModel.currentMesocyclePurpose).toBe("Build work capacity and movement tolerance");
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).toEqual(["strength_accumulation"]);
  });

  it.each([
    [2, "full_body", ["Full Body", "Full Body"]],
    [3, "full_body", ["Full Body", "Full Body", "Full Body"]],
    [4, "upper_lower", ["Upper", "Lower", "Upper", "Lower"]],
    [5, "push_pull_legs", ["Push", "Pull", "Legs", "Upper", "Lower"]],
    [6, "push_pull_legs", ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]],
  ] as const)("renders the actual weekly schedule for %i days/week", (daysPerWeek, preferredSplit, expectedWeek) => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek,
        preferredSplit,
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan, date: new Date("2026-06-03T09:00:00.000Z") });

    expect(viewModel.thisWeek.map((day) => day.label)).toEqual(expectedWeek);
    expect(viewModel.thisWeek).toHaveLength(daysPerWeek);
    expect(viewModel.thisWeek.some((day) => day.label === "Rest")).toBe(false);
    expect(viewModel.thisWeek.filter((day) => day.status === "current")).toHaveLength(1);
  });

  it("exposes safe action targets", () => {
    const viewModel = buildPlanPageViewModel({ activePlan: null });

    expect(viewModel.createSessionHref).toBe("/(protected)/programmes/ai");
    expect(viewModel.editPlanHref).toBe("/(protected)/settings");
    expect(viewModel.libraryHref).toBe("/(protected)/(tabs)/library");
  });

  it("marks completed, current, and upcoming blocks correctly", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "custom_sequence",
        customBlockTypes: ["hypertrophy", "powerbuilding", "strength"],
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const activeBlock = createTrainingBlock("powerbuilding", { id: plan.blocks[1]!.id, status: "active" });
    const advancedPlan = {
      ...plan,
      activeBlockId: plan.blocks[1]!.id,
      blocks: [
        { ...plan.blocks[0]!, status: "completed" as const },
        activeBlock,
        { ...plan.blocks[2]!, status: "planned" as const },
      ],
    };

    const viewModel = buildPlanPageViewModel({ activePlan: advancedPlan, currentBlock: activeBlock });

    expect(viewModel.roadmap.map((block) => block.status)).toEqual(["done", "current", "upcoming"]);
    expect(viewModel.roadmap.map((block) => block.displayStatus)).toEqual(["Complete", "Current", "Next"]);
  });

  it("returns only domain-approved mesocycle successors", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const viewModel = buildPlanPageViewModel({ activePlan: plan });
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).toEqual(["powerbuilding_hypertrophy"]);
    expect(viewModel.approvedNextMesocycles[0]).toMatchObject({ id: "powerbuilding_hypertrophy", purpose: "Add muscle while retaining S/B/D" });
  });

  it("does not use informational roadmap order to authorise mesocycle successors", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "custom_sequence",
        customBlockTypes: ["strength", "hypertrophy"],
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );

    const viewModel = buildPlanPageViewModel({ activePlan: plan });

    expect(viewModel.roadmap[1]?.label).toBe("Hypertrophy");
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).toEqual(["powerbuilding_hypertrophy"]);
    expect(viewModel.approvedNextMesocycles.map((item) => item.id)).not.toContain("hypertrophy_base");
  });

  it("selects the next open planned workout deterministically and exposes its exact targets", () => {
    const plan = createActiveTrainingPlan(
      { goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" },
      "2026-06-04T09:00:00.000Z",
    );
    const next = workoutFixture({ id: "next", planSessionIndex: 1, prescribedSetTargets: [8, 8, 9] });
    const later = workoutFixture({ id: "later", planSessionIndex: 2, prescribedSetTargets: [10, 10, 10] });
    const completed = workoutFixture({ id: "completed", planSessionIndex: 0, completedAt: "2026-06-04T10:00:00.000Z", prescribedSetTargets: [12, 12, 12] });
    const extra = workoutFixture({ id: "extra", planSessionIndex: 0, sessionKind: "extra_full", prescribedSetTargets: [12, 12, 12] });

    const viewModel = buildPlanPageViewModel({ activePlan: plan, workouts: [later, completed, extra, next] });

    expect(viewModel.openPlannedWorkout?.id).toBe("next");
    expect(viewModel.openPlannedWorkout?.exercises[0]?.prescribedSetTargets).toEqual([8, 8, 9]);
    expect(viewModel.currentSessionRole).toBe("Full body 2");
  });

  it("does not fabricate exact targets when the next planned workout has none", () => {
    const plan = createActiveTrainingPlan(
      { goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" },
      "2026-06-04T09:00:00.000Z",
    );
    const next = workoutFixture({ id: "next", planSessionIndex: 0 });

    const viewModel = buildPlanPageViewModel({ activePlan: plan, workouts: [next] });

    expect(viewModel.openPlannedWorkout?.exercises[0]?.prescribedSetTargets).toBeUndefined();
  });

  it("does not expose legacy Plan transition fields", () => {
    const viewModel = buildPlanPageViewModel({ activePlan: null });

    expect("blockTransition" in viewModel).toBe(false);
    expect("nextBlock" in viewModel.summary).toBe(false);
  });
});
