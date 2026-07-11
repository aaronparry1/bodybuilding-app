import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generatePushWorkout } from "@/domain/training/ad-hoc-workout-generator";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { selectPlannedExercisesForWeek } from "@/domain/training/exercise-selection";
import { buildHomeDashboardViewModel } from "@/domain/training/home-dashboard";
import { createActiveTrainingPlan, createRecommendedAnnualPlan, equipmentForPreset, normalizeActiveTrainingPlanEquipment, resolveBlockSequence, weeklyCalendarForPlan, weeklySplitForPlan } from "@/domain/training/plan-setup";
import type { ExerciseHistorySummary, WorkoutHistorySummary } from "@/domain/training/models";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";
import { createAnnualPlan, naturalLifterAnnualPlan } from "@/domain/training/annual-planner";

function slotIds(programme: ReturnType<typeof generatePushWorkout>) {
  return programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
}

function entry(index: number, exerciseId = "ex-bench-press", progressionEarned = true): ExerciseHistorySummary {
  const exercise = exerciseLibrary.find((candidate) => candidate.id === exerciseId)!;
  return {
    exerciseLogId: `${exerciseId}-${index}`,
    exerciseId,
    exerciseName: exercise.name,
    load: 100,
    unit: "kg",
    setsCompleted: 3,
    repsCompleted: 33,
    qualitySets: progressionEarned ? 4 : 2,
    bestSetReps: progressionEarned ? 12 : 8,
    dropOffThreshold: 15,
    stoppedByDropOff: !progressionEarned,
    progressionEarned,
    nextRecommendedLoad: progressionEarned ? 105 : 100,
    volumeLoad: 3300,
  };
}

function history(index: number, progressionEarned = true): WorkoutHistorySummary {
  return {
    sessionId: `session-${index}`,
    sessionName: `Push ${index}`,
    startedAt: `2026-05-${String(index).padStart(2, "0")}T09:00:00.000Z`,
    completedAt: `2026-05-${String(index).padStart(2, "0")}T10:00:00.000Z`,
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: 3,
    repsCompleted: 33,
    totalLoadVolume: 3300,
    progressionHighlights: progressionEarned ? ["Bench Press -> 105kg"] : [],
    exerciseSummaries: [entry(index, "ex-bench-press", progressionEarned)],
  };
}

function totalWeeks(plan: ReturnType<typeof createActiveTrainingPlan>) {
  return plan.blocks.reduce((sum, block) => sum + block.durationWeeks, 0);
}

describe("product flow architecture", () => {
  it("keeps planned workouts consistent inside a four-week rotation window", () => {
    const block = createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 });
    const weekOne = selectPlannedExercisesForWeek({ workoutType: "push", block, weekNumber: 1, exercises: exerciseLibrary });
    const weekThree = selectPlannedExercisesForWeek({
      workoutType: "push",
      block,
      weekNumber: 3,
      exercises: exerciseLibrary,
      previousSelections: weekOne.exerciseSlots,
    });

    expect(weekThree.rotated).toBe(false);
    expect(weekThree.exerciseSlots.map((slot) => slot.exerciseId)).toEqual(weekOne.exerciseSlots.map((slot) => slot.exerciseId));
  });

  it("rotates planned workouts after the configured four-week period", () => {
    const block = createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 });
    const weekOne = selectPlannedExercisesForWeek({ workoutType: "push", block, weekNumber: 1, exercises: exerciseLibrary });
    const weekFive = selectPlannedExercisesForWeek({
      workoutType: "push",
      block,
      weekNumber: 5,
      exercises: exerciseLibrary,
      previousSelections: weekOne.exerciseSlots,
    });

    expect(weekFive.rotated).toBe(true);
    expect(weekFive.exerciseSlots.map((slot) => slot.exerciseId)).not.toEqual(weekOne.exerciseSlots.map((slot) => slot.exerciseId));
  });

  it("varies generated workouts without breaking push template structure", () => {
    const first = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy"), variant: 1 });
    const second = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      variant: 2,
      recentExerciseIds: slotIds(first),
      stablePrimaryExerciseIds: [slotIds(first)[0]!],
    });
    const selected = second.days[0]!.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!);
    const muscles = new Set(selected.flatMap((exercise) => [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles]));

    expect(slotIds(second)).not.toEqual(slotIds(first));
    expect(slotIds(second)[0]).toBe(slotIds(first)[0]);
    expect(muscles.has("chest")).toBe(true);
    expect(muscles.has("shoulders")).toBe(true);
    expect(muscles.has("triceps")).toBe(true);
  });

  it("creates truthful setup plans for recommended, single-block, and event users", () => {
    const recommended = createRecommendedAnnualPlan("2026-01-01T00:00:00.000Z");
    const strength = createActiveTrainingPlan(
      {
        goal: "build_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-01-01T00:00:00.000Z",
    );
    const single = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "single_block",
      singleBlockType: "peak",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const eventPlan = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "custom_date_event",
        eventType: "powerlifting_meet",
        targetDate: "2026-12-01",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );

    expect(totalWeeks(recommended)).toBeGreaterThanOrEqual(48);
    expect(totalWeeks(recommended)).toBeLessThanOrEqual(52);
    expect(totalWeeks(strength)).toBeGreaterThanOrEqual(48);
    expect(totalWeeks(strength)).toBeLessThanOrEqual(52);
    expect(recommended.blocks.map((block) => block.type)).not.toEqual(strength.blocks.map((block) => block.type));
    expect(recommended.blocks.some((block) => block.type === "deload")).toBe(true);
    expect(strength.blocks.filter((block) => block.type === "strength").length).toBeGreaterThan(recommended.blocks.filter((block) => block.type === "strength").length);
    expect(single.blocks.map((block) => block.type)).toEqual(["peak"]);
    expect(eventPlan.blocks.map((block) => block.type)).toContain("peak");
    expect(totalWeeks(eventPlan)).toBeLessThanOrEqual(27);
  });

  it("assumes full gym equipment for new and legacy setup values", () => {
    const fullGym = ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"];
    const legacyHomeGymPlan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "home_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const legacyCustomPlan = createActiveTrainingPlan({
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "custom",
      customEquipment: ["dumbbell"],
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const savedLimitedPlan = { ...legacyHomeGymPlan, equipment: ["dumbbell"] as typeof legacyHomeGymPlan.equipment };

    expect(equipmentForPreset("dumbbells_only")).toEqual(fullGym);
    expect(equipmentForPreset("machines_only")).toEqual(fullGym);
    expect(legacyHomeGymPlan.equipment).toEqual(fullGym);
    expect(legacyCustomPlan.equipment).toEqual(fullGym);
    expect(normalizeActiveTrainingPlanEquipment(savedLimitedPlan).equipment).toEqual(fullGym);
  });

  it("builds a home dashboard with today, current block, upcoming week, and strategic direction", () => {
    const plan = createRecommendedAnnualPlan("2026-01-01T00:00:00.000Z");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear: createAnnualPlan(naturalLifterAnnualPlan, "2026-01-01T00:00:00.000Z"),
      activePlan: plan,
      history: [1, 2, 3, 4].map((index) => history(index, index >= 2)),
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-01-08T12:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("planned");
    expect(dashboard.primaryActionLabel).toBe("Start Push");
    expect(dashboard.todayWorkoutName).toBe("Push");
    expect(dashboard.todayWorkoutName).toBeTruthy();
    expect(dashboard.todayGoal).toBeTruthy();
    expect(dashboard.currentDayIndex).toBeGreaterThanOrEqual(0);
    expect(dashboard.currentBlock.name).toContain("Hypertrophy");
    expect(dashboard.thisWeek).toEqual(weeklySplitForPlan(plan.daysPerWeek, plan.preferredSplit));
    expect(dashboard.recommendationLabel).toBeTruthy();
    expect(dashboard.hasTrainingDirection).toBe(true);
    expect(dashboard.recommendationReasons.length).toBeLessThanOrEqual(2);
    expect(dashboard.nextBlockPreview).toBeTruthy();
  });

  it.each([
    [2, "upper_lower", ["Upper", "Lower"]],
    [3, "full_body", ["Full Body", "Full Body", "Full Body"]],
    [4, "upper_lower", ["Upper", "Lower", "Upper", "Lower"]],
    [5, "push_pull_legs", ["Push", "Pull", "Legs", "Upper", "Lower"]],
    [6, "push_pull_legs", ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]],
  ] as const)("treats %i days/week as actual workout slots", (daysPerWeek, split, expectedSequence) => {
    const trainingSequence = weeklySplitForPlan(daysPerWeek, split);

    expect(trainingSequence).toEqual(expectedSequence);
    expect(trainingSequence).toHaveLength(daysPerWeek);
    expect(trainingSequence).not.toContain("Rest");
  });

  it("keeps rest days in the explicit seven-day calendar view only", () => {
    const trainingSequence = weeklySplitForPlan(4, "upper_lower");
    const calendar = weeklyCalendarForPlan(4, "upper_lower");

    expect(trainingSequence).toEqual(["Upper", "Lower", "Upper", "Lower"]);
    expect(calendar).toHaveLength(7);
    expect(calendar.filter((day) => day !== "Rest")).toEqual(trainingSequence);
    expect(calendar.filter((day) => day === "Rest")).toHaveLength(3);
  });

  it("does not invent programme data when no active plan exists", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear: createAnnualPlan(naturalLifterAnnualPlan, "2026-01-01T00:00:00.000Z"),
      activePlan: null,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
    });

    expect(dashboard.hasActivePlan).toBe(false);
    expect(dashboard.hasOpenWorkout).toBe(false);
    expect(dashboard.todayWorkoutName).toBe("Set up your training plan");
    expect(dashboard.currentBlock.name).toBe("No active plan");
    expect(dashboard.thisWeek).toEqual([]);
  });

  it("uses a custom premium text tab bar instead of default triangle markers", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/_layout.tsx"), "utf8");

    expect(source).toContain("tabBar={(props) => <PremiumTabBar");
    expect(source).toContain("accessibilityRole=\"tab\"");
    expect(source).toContain("minimumFontScale={0.78}");
    expect(source).not.toContain("tabBarIcon");
  });

  it("does not expose unfinished custom sequence setup controls", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/onboarding.tsx"), "utf8");

    expect(source).not.toContain("Build my own plan");
    expect(source).not.toContain("Advanced sequence control");
    expect(source).not.toContain('singleBlockType');
    expect(source).not.toContain('customBlockTypes');
    expect(source).not.toContain('label: "Peak"');
    expect(source).not.toContain('label: "Recovery Window"');
    expect(source).not.toContain('label: "Maintenance"');
    expect(source).toContain("Are you training for something specific?");
  });

  it("does not expose recovery/deload as a user-choice Progress CTA", () => {
    const progressSource = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/analytics.tsx"), "utf8");
    const dashboardSource = readFileSync(join(process.cwd(), "src/domain/training/progress-dashboard.ts"), "utf8");

    expect(progressSource).not.toContain("ignoreDeloadPlan");
    expect(progressSource).not.toContain("Recovery Window started");
    expect(dashboardSource).not.toContain('primaryLabel: "Start Recovery Window"');
    expect(dashboardSource).toContain('title: "Recovery session planned"');
    const deloadActionBlock = dashboardSource.match(/if \(hasRecoveryPriority\) \{[\s\S]*?\n  if \(rotationAction\)/)?.[0] ?? "";
    expect(deloadActionBlock).toContain('type: "deload"');
    expect(deloadActionBlock).not.toContain("secondaryLabel");
    expect(deloadActionBlock).not.toContain("Ignore for now");
    expect(progressSource).toContain('progress.actionFlow.type === "deload"');
    expect(progressSource).not.toContain("startDeloadPlan(activePlan");
    expect(progressSource).toContain('href="/(protected)/(tabs)/programmes"');
  });

  it("does not ask users to choose available equipment during onboarding", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/onboarding.tsx"), "utf8");

    expect(source).not.toContain('"equipment"');
    expect(source).not.toContain("What equipment do you have?");
    expect(source).not.toContain("Full gym");
    expect(source).not.toContain("Home gym");
    expect(source).not.toContain("Dumbbells only");
    expect(source).not.toContain("Machines only");
    expect(source).not.toContain('SummaryRow label="Equipment"');
    expect(source).toContain('equipmentPreset: "full_gym"');
  });

  it("keeps the final onboarding summary scannable and roadmap-light", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/onboarding.tsx"), "utf8");

    expect(source).toContain('review: "Your Programme"');
    expect(source).toContain('step === "review" ? "Your Programme" : "Welcome"');
    expect(source).toContain("Programme summary");
    expect(source).toContain("ASC will use these choices to build your first programme.");
    expect(source).toContain('step === "review" ? "Create Programme" : "Continue"');
    expect(source).toContain("programmeSkeletonRepository.save");
    expect(source).not.toContain("blocks.join");
    expect(source).not.toContain('label="Blocks"');
    expect(source).not.toContain(" -> ");
    expect(source).not.toContain("Your full roadmap is available in Plan.");
    expect(source).not.toContain("has already learned");
  });

  it("presents the Plan roadmap as coached stages instead of a flat learn-heavy list", () => {
    const source = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/programmes.tsx"), "utf8");

    expect(source).toContain("RoadmapSummaryCard");
    expect(source).toContain("RoadmapStageCard");
    expect(source).toContain("Current phase");
    expect(source).toContain("Next up");
    expect(source).toContain("displayStatus");
    expect(source).toContain("ⓘ");
    expect(source).not.toContain(">Learn<");
    expect(source).not.toContain("Learn\n      </Text>");
  });
});
