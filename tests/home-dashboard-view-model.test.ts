import { describe, expect, it } from "vitest";
import { createAnnualPlan, naturalLifterAnnualPlan } from "@/domain/training/annual-planner";
import { buildHomeDashboardViewModel } from "@/domain/training/home-dashboard";
import type { ExerciseHistorySummary, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { displayWorkoutName } from "@/domain/training/planned-workout";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";
import { shouldAdvanceTrainingWeekAfterCompletedSession } from "@/domain/training/training-session-selection";

const trainingYear = createAnnualPlan(naturalLifterAnnualPlan, "2026-06-01T00:00:00.000Z");

function plan(daysPerWeek = 4, preferredSplit: "upper_lower" | "push_pull_legs" | "full_body" = "upper_lower") {
  const created = createActiveTrainingPlan(
    {
      goal: "build_muscle_and_strength",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek,
      preferredSplit,
      experienceLevel: "intermediate",
    },
    "2026-06-01T00:00:00.000Z",
  );
  // Legacy dashboard fixtures intentionally omit the new microcycle field.
  // Production plans carry it and therefore use microcycle-owned roles.
  return { ...created, currentMicrocycle: undefined };
}

function workout(index: number, sessionName = `Push ${index}`, patch: Partial<ExerciseHistorySummary> = {}): WorkoutHistorySummary {
  const completedAt = new Date("2026-06-01T10:00:00.000Z");
  completedAt.setDate(completedAt.getDate() + index);
  const entry: ExerciseHistorySummary = {
    sessionId: `session-${index}`,
    sessionName,
    completedAt: completedAt.toISOString(),
    exerciseLogId: `bench-${index}`,
    exerciseId: "ex-bench-press",
    exerciseName: "Bench Press",
    load: 100 + index * 2.5,
    unit: "kg",
    setsCompleted: patch.setsCompleted ?? 4,
    repsCompleted: patch.repsCompleted ?? 44,
    qualitySets: patch.qualitySets ?? 4,
    bestSetReps: patch.bestSetReps ?? 12,
    dropOffThreshold: 15,
    stoppedByDropOff: patch.stoppedByDropOff ?? false,
    progressionEarned: patch.progressionEarned ?? true,
    nextRecommendedLoad: patch.nextRecommendedLoad ?? 105,
    volumeLoad: patch.volumeLoad ?? 4400,
    ...patch,
  };

  return {
    sessionId: `session-${index}`,
    sessionName,
    startedAt: completedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMinutes: 55,
    exercisesCompleted: 1,
    setsCompleted: entry.setsCompleted,
    repsCompleted: entry.repsCompleted,
    totalLoadVolume: entry.volumeLoad,
    progressionHighlights: entry.progressionEarned ? ["Bench Press -> 105kg"] : [],
    exerciseSummaries: [entry],
  };
}

function plannedWorkout(index: number, label: string, planSessionIndex: number): WorkoutHistorySummary {
  return {
    ...workout(index, label),
    sessionKind: "planned",
    planSessionIndex,
  };
}

function currentTrainingWeekWorkout(activePlan: ReturnType<typeof plan>, index: number, label: string, planSessionIndex: number): WorkoutHistorySummary {
  const activeBlock = activePlan.blocks.find((block) => block.id === activePlan.activeBlockId)!;
  return {
    ...plannedWorkout(index, label, planSessionIndex),
    planBlockId: activeBlock.id,
    planWeekNumber: activeBlock.currentWeek,
  };
}

function completedSessionForSummary(summary: WorkoutHistorySummary): WorkoutSession {
  return {
    id: summary.sessionId,
    userId: summary.userId,
    name: summary.sessionName,
    startedAt: summary.startedAt,
    completedAt: summary.completedAt,
    updatedAt: summary.completedAt,
    syncState: "local",
    programmeId: summary.programmeId,
    templateId: summary.programmeDayId,
    planSessionIndex: summary.planSessionIndex,
    planBlockId: summary.planBlockId,
    planWeekNumber: summary.planWeekNumber,
    sessionKind: summary.sessionKind,
    exercises: [],
  };
}

function activeWorkout(): WorkoutSession {
  return {
    id: "active-session",
    userId: "guest-local",
    name: "AI Push",
    startedAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-06-04T10:20:00.000Z",
    syncState: "local",
    exercises: [
      { id: "one", exerciseId: "ex-bench-press", exerciseName: "Bench Press", settings: exerciseLibrary[0]!.defaultSettings, load: 100, sets: [], status: "complete" },
      { id: "two", exerciseId: "ex-incline-dumbbell-press", exerciseName: "Incline Dumbbell Press", settings: exerciseLibrary[1]!.defaultSettings, load: 80, sets: [], status: "active" },
    ],
  };
}

function activeWorkoutWithName(name: string): WorkoutSession {
  return {
    ...activeWorkout(),
    name,
  };
}

describe("Home dashboard view model", () => {
  it("uses current planning context rather than conflicting legacy block metadata", () => {
    const activePlan = createActiveTrainingPlan(
      {
        goal: "build_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );
    const conflicting = { ...activePlan, blocks: activePlan.blocks.map((block) => ({ ...block, type: "deload" as const })) };
    const dashboard = buildHomeDashboardViewModel({ activePlan: conflicting, history: [], exercises: exerciseLibrary, programmes: presetProgrammes });

    expect(dashboard.planningContext.status).toBe("ready");
    expect(dashboard.planningContext.mesocyclePurpose).toBe("Build work capacity and movement tolerance");
    expect(dashboard.planningContext.microcycleLabel).toContain("Microcycle 1");
    expect(dashboard.planningContext.sessionRole).toBe("Squat emphasis");
  });

  it("shows stored exact targets from an open planned workout without reading its range", () => {
    const activePlan = createActiveTrainingPlan(
      { goal: "build_muscle", planningChoice: "recommended_12_month", equipmentPreset: "full_gym", daysPerWeek: 3, preferredSplit: "full_body", experienceLevel: "beginner" },
      "2026-06-01T00:00:00.000Z",
    );
    const planned = {
      ...activeWorkout(),
      sessionKind: "planned" as const,
      exercises: [{
        ...activeWorkout().exercises[0]!,
        settings: { ...activeWorkout().exercises[0]!.settings, repRange: { min: 12, max: 20 } },
        prescribedSetTargets: [6, 6, 7],
      }],
    };
    const dashboard = buildHomeDashboardViewModel({ activePlan, history: [], exercises: exerciseLibrary, programmes: presetProgrammes, activeWorkout: planned, hasOpenWorkout: true });

    expect(dashboard.planningContext.exactTargets).toEqual(["6", "6", "7"]);
  });

  it("does not invent a workout when there is no active plan", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: null,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("no_plan");
    expect(dashboard.todayWorkoutName).toBe("Set up your training plan");
    expect(dashboard.primaryActionLabel).toBe("Set up your training plan");
    expect(dashboard.thisWeek).toEqual([]);
    expect(dashboard.planningContext.status).toBe("no_plan");
  });

  it("shows today's workout from the real active plan", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("planned");
    expect(dashboard.todayWorkoutName).toBe("Upper");
    expect(dashboard.planningContext.status).toBe("incomplete");
    expect("currentBlock" in dashboard).toBe(false);
    expect("nextBlockPreview" in dashboard).toBe(false);
    expect(dashboard.primaryActionLabel).toBe("Start Upper");
    expect(dashboard.thisWeek).toEqual(["Upper", "Lower", "Upper", "Lower"]);
    expect(dashboard.recommendedSessionIndex).toBe(0);
  });

  it("lets the user override the recommended session from the weekly strip", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      selectedSessionIndex: 3,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayWorkoutName).toBe("Lower");
    expect(dashboard.currentDayIndex).toBe(3);
    expect(dashboard.recommendedSessionIndex).toBe(0);
    expect(dashboard.thisWeekItems[0]?.isRecommended).toBe(true);
    expect(dashboard.thisWeekItems[3]?.isSelected).toBe(true);
  });

  it("keeps the recommended session sensible after out-of-order completion", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [plannedWorkout(0, "Upper", 2)],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-02T12:00:00.000Z"),
    });

    expect(dashboard.recommendedSessionIndex).toBe(0);
    expect(dashboard.todayWorkoutName).toBe("Upper");
    expect(dashboard.thisWeekItems[2]?.status).toBe("done");
  });

  it("advances through planned sessions as each main-plan slot is completed", () => {
    const activePlan = plan(4, "upper_lower");
    const afterOne = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [plannedWorkout(0, "Upper", 0)],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-02T12:00:00.000Z"),
    });
    const afterTwo = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [plannedWorkout(0, "Upper", 0), plannedWorkout(1, "Lower", 1)],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-03T12:00:00.000Z"),
    });

    expect(afterOne.todayWorkoutName).toBe("Lower");
    expect(afterOne.recommendedSessionIndex).toBe(1);
    expect(afterTwo.todayWorkoutName).toBe("Upper");
    expect(afterTwo.recommendedSessionIndex).toBe(2);
  });

  it("shows a week-complete state after all planned sessions are complete", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [
        currentTrainingWeekWorkout(activePlan, 0, "Upper", 0),
        currentTrainingWeekWorkout(activePlan, 1, "Lower", 1),
        currentTrainingWeekWorkout(activePlan, 2, "Upper", 2),
        currentTrainingWeekWorkout(activePlan, 3, "Lower", 3),
      ],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-05T12:00:00.000Z"),
    });

    expect(dashboard.hasCompletedWeek).toBe(true);
    expect(dashboard.todayWorkoutName).toBe("Training week complete");
    expect(dashboard.primaryActionLabel).toBe("Training week complete");
  });

  it("advances the programme week only after all required planned sessions are completed", () => {
    const activePlan = plan(4, "upper_lower");
    const incompleteHistory = [
      currentTrainingWeekWorkout(activePlan, 0, "Upper", 0),
      currentTrainingWeekWorkout(activePlan, 1, "Lower", 1),
      currentTrainingWeekWorkout(activePlan, 2, "Upper", 2),
    ];
    const finalSummary = currentTrainingWeekWorkout(activePlan, 3, "Lower", 3);
    const completeHistory = [...incompleteHistory, finalSummary];

    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(incompleteHistory[2]!),
        history: incompleteHistory,
      }),
    ).toBe(false);
    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(finalSummary),
        history: completeHistory,
      }),
    ).toBe(true);
  });

  it("keeps the same training week when the calendar changes but required workouts are incomplete", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [currentTrainingWeekWorkout(activePlan, 0, "Upper", 0)],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-15T12:00:00.000Z"),
    });

    expect(dashboard.todayWorkoutName).toBe("Lower");
    expect(dashboard.recommendedSessionIndex).toBe(1);
  });

  it("six-day plans advance only after six required planned workouts complete", () => {
    const activePlan = plan(6, "push_pull_legs");
    const labels = ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
    const firstFive = labels.slice(0, 5).map((label, index) => currentTrainingWeekWorkout(activePlan, index, label, index));
    const finalSummary = currentTrainingWeekWorkout(activePlan, 5, "Legs", 5);

    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(firstFive[4]!),
        history: firstFive,
      }),
    ).toBe(false);
    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(finalSummary),
        history: [...firstFive, finalSummary],
      }),
    ).toBe(true);
  });

  it("does not count extra or recovery-capacity sessions toward training week advancement", () => {
    const activePlan = plan(4, "upper_lower");
    const planned = [
      currentTrainingWeekWorkout(activePlan, 0, "Upper", 0),
      currentTrainingWeekWorkout(activePlan, 1, "Lower", 1),
      currentTrainingWeekWorkout(activePlan, 2, "Upper", 2),
    ];
    const extra = {
      ...currentTrainingWeekWorkout(activePlan, 3, "Extra Lower", 3),
      sessionKind: "extra_full" as const,
      planSessionIndex: undefined,
    };
    const cardio = {
      ...currentTrainingWeekWorkout(activePlan, 4, "Recovery Cardio", 3),
      sessionKind: "recovery_cardio" as const,
      planSessionIndex: undefined,
      cardioLog: {
        sessionType: "recovery_cardio" as const,
        modality: "incline_walk" as const,
        durationMinutes: 25,
        loggedAt: "2026-06-05T09:00:00.000Z",
      },
    };

    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(extra),
        history: [...planned, extra],
      }),
    ).toBe(false);
    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(cardio),
        history: [...planned, extra, cardio],
      }),
    ).toBe(false);
  });

  it("counts multiple completed planned sessions on the same day", () => {
    const activePlan = plan(4, "upper_lower");
    const sameDayHistory = [0, 1, 2, 3].map((slotIndex) => ({
      ...currentTrainingWeekWorkout(activePlan, 0, slotIndex % 2 === 0 ? "Upper" : "Lower", slotIndex),
      sessionId: `same-day-${slotIndex}`,
      completedAt: "2026-06-05T12:00:00.000Z",
      startedAt: "2026-06-05T11:00:00.000Z",
    }));

    expect(
      shouldAdvanceTrainingWeekAfterCompletedSession({
        activePlan,
        completedSession: completedSessionForSummary(sameDayHistory[3]!),
        history: sameDayHistory,
      }),
    ).toBe(true);
  });

  it("migrates legacy current-week sessions cautiously without counting them after calendar rollover", () => {
    const activePlan = plan(4, "upper_lower");
    const legacyHistory = [plannedWorkout(0, "Upper", 0)];
    const sameCalendarWeek = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: legacyHistory,
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-03T12:00:00.000Z"),
    });
    const afterCalendarRollover = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: legacyHistory,
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-15T12:00:00.000Z"),
    });

    expect(sameCalendarWeek.recommendedSessionIndex).toBe(1);
    expect(afterCalendarRollover.recommendedSessionIndex).toBe(0);
  });

  it("does not let completed extra sessions advance the main plan", () => {
    const activePlan = plan(4, "upper_lower");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [{ ...plannedWorkout(0, "Extra Upper", 0), sessionKind: "extra_full", planSessionIndex: undefined }],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-02T12:00:00.000Z"),
    });

    expect(dashboard.recommendedSessionIndex).toBe(0);
    expect(dashboard.todayWorkoutName).toBe("Upper");
  });

  it("prioritises an active workout over the plan and shows progress", () => {
    const open = activeWorkout();
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(),
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      hasOpenWorkout: true,
      activeWorkoutName: open.name,
      activeWorkout: open,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("active_workout");
    expect(dashboard.todayWorkoutName).toBe("Push");
    expect(dashboard.primaryActionLabel).toBe("Continue Push");
    expect(dashboard.activeWorkoutProgress).toBe("1 of 2 exercises complete");
    expect(dashboard.todayGoal).toBe("Finish the session you already started.");
    expect(dashboard.showUpNext).toBe(false);
  });

  it("hides Up Next when an active workout is the same workout", () => {
    const open = activeWorkoutWithName("Push");
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(5, "push_pull_legs"),
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      hasOpenWorkout: true,
      activeWorkoutName: open.name,
      activeWorkout: open,
      date: new Date("2026-06-01T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("active_workout");
    expect(dashboard.todayWorkoutName).toBe("Push");
    expect(dashboard.nextWorkout).toBe("Pull");
    expect(dashboard.showUpNext).toBe(false);
  });

  it("shows completed-today state without offering Continue", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(5, "push_pull_legs"),
      history: [workout(0, "Push")],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-01T12:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("completed_today");
    expect(dashboard.todayWorkoutName).toBe("Push complete");
    expect(dashboard.primaryActionLabel).toBe("Start Pull");
    expect(dashboard.todayMeta).toBe("Next up: Pull");
    expect(dashboard.showUpNext).toBe(true);
  });

  it("hides Up Next when completed-today next session is not meaningfully different", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(2, "full_body"),
      history: [workout(0, "Full Body")],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-01T12:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("completed_today");
    expect(dashboard.todayWorkoutName).toBe("Full Body complete");
    expect(dashboard.nextWorkout).toBe("Full Body");
    expect(dashboard.showUpNext).toBe(false);
  });

  it("does not duplicate Up Next for a planned workout that has not started", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(5, "push_pull_legs"),
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-01T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("planned");
    expect(dashboard.todayWorkoutName).toBe("Push");
    expect(dashboard.nextWorkout).toBe("Pull");
    expect(dashboard.showUpNext).toBe(false);
  });

  it("shows the selected training sequence without rest consuming a workout slot", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(5, "push_pull_legs"),
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("planned");
    expect(dashboard.todayWorkoutName).toBe("Push");
    expect(dashboard.nextWorkout).toBe("Pull");
    expect(dashboard.thisWeek).toEqual(["Push", "Pull", "Legs", "Upper", "Lower"]);
    expect(dashboard.showUpNext).toBe(false);
  });

  it("shows no Up Next in the no-plan state", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: null,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.todayState).toBe("no_plan");
    expect(dashboard.showUpNext).toBe(false);
  });

  it.each([
    [2, "full_body", ["Full Body", "Full Body"]],
    [3, "full_body", ["Full Body", "Full Body", "Full Body"]],
    [4, "upper_lower", ["Upper", "Lower", "Upper", "Lower"]],
    [5, "push_pull_legs", ["Push", "Pull", "Legs", "Upper", "Lower"]],
    [6, "push_pull_legs", ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]],
  ] as const)("renders actual weekly schedule for %i days/week", (days, split, expected) => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(days, split),
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-03T09:00:00.000Z"),
    });

    expect(dashboard.thisWeek).toEqual(expected);
    expect(dashboard.thisWeekItems).toHaveLength(days);
    const currentSlot = dashboard.thisWeekItems[dashboard.currentDayIndex];
    expect(currentSlot?.label).not.toBe("Rest");
    expect(dashboard.thisWeekItems.filter((item) => item.status === "current")).toHaveLength(1);
    expect(dashboard.thisWeekItems.some((item) => item.label === "Rest")).toBe(false);
  });

  it("marks completed workouts in This Week from real history", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(5, "push_pull_legs"),
      history: [workout(0, "Push")],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-03T09:00:00.000Z"),
    });

    expect(dashboard.thisWeekItems[0]).toMatchObject({ label: "Push", status: "done" });
    expect(dashboard.thisWeekItems[1]).toMatchObject({ label: "Pull", status: "current" });
    expect(dashboard.thisWeekItems[3]).toMatchObject({ label: "Upper", status: "upcoming" });
  });

  it("shows limited-history coach note until enough real history exists", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(),
      history: [workout(0, "Upper")],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T09:00:00.000Z"),
    });

    expect(dashboard.hasTrainingDirection).toBe(false);
    expect(dashboard.recommendationLabel).toBe("Log a few workouts first");
    expect(dashboard.emptyDirectionMessage).toBe("Log a few sessions first. The app is smart, not psychic.");
  });

  it("uses strategic coaching output when enough history exists", () => {
    const history = [0, 7, 14, 21].map((offset, index) =>
      workout(offset, `Upper ${index}`, {
        bestSetReps: 10 + index,
        qualitySets: index < 2 ? 3 : 5,
        progressionEarned: index >= 1,
      }),
    );
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(),
      history,
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-07-01T09:00:00.000Z"),
    });

    expect(dashboard.hasTrainingDirection).toBe(true);
    expect(dashboard.recommendationLabel).not.toBe("Log a few workouts first");
    expect(dashboard.momentumLabel).toBeTruthy();
  });

  it("cleans generated workout names before Home displays them", () => {
    expect(displayWorkoutName("AI Push")).toBe("Push");
    expect(displayWorkoutName("AI Arms • Arms")).toBe("Arms");
  });

  it("does not warn from one extra session", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(),
      history: [
        plannedWorkout(0, "Upper", 0),
        plannedWorkout(1, "Lower", 1),
        plannedWorkout(2, "Upper", 2),
        { ...plannedWorkout(3, "Extra Push", 3), sessionKind: "extra_full", planSessionIndex: undefined },
      ],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-07T09:00:00.000Z"),
    });

    expect(dashboard.extraWorkWarning).toBeUndefined();
  });

  it("warns when repeated extra sessions meaningfully raise workload without completing plan slots", () => {
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan: plan(),
      history: [
        plannedWorkout(0, "Upper", 0),
        plannedWorkout(1, "Lower", 1),
        {
          ...plannedWorkout(2, "Extra Push", 2),
          sessionKind: "extra_full",
          planSessionIndex: undefined,
          setsCompleted: 8,
          exerciseSummaries: [{ ...workout(2).exerciseSummaries[0]!, setsCompleted: 8 }],
        },
        {
          ...plannedWorkout(3, "Extra Volume", 3),
          sessionKind: "extra_volume",
          planSessionIndex: undefined,
          setsCompleted: 8,
          exerciseSummaries: [{ ...workout(3).exerciseSummaries[0]!, setsCompleted: 8 }],
        },
      ],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-07T09:00:00.000Z"),
    });

    expect(dashboard.extraWorkWarning?.message).toBe("You’re adding a lot of extra work. Useful if you recover. Expensive if you don’t.");
    expect(dashboard.extraWorkWarning?.evidence.dataPoints).toContain("2 extra session(s) in recent completed history.");
    expect(dashboard.recommendedSessionIndex).toBe(2);
  });

  it("surfaces high-priority personalised muscle-volume notes on Home only after enough evidence", () => {
    const activePlan = { ...plan(), goal: "build_muscle" as const };
    const history = [0, 7, 14, 21, 28].map((offset, index) =>
      workout(offset, `Push ${index}`, {
        qualitySets: 18 - index,
        setsCompleted: 18 - index,
        stoppedByDropOff: true,
        progressionEarned: false,
      }),
    );

    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history,
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-07-08T09:00:00.000Z"),
    });

    expect(dashboard.muscleVolumeWarning?.message).toMatch(/recovering|recovering from|less work|Pull|Swap|remove/i);
    expect(dashboard.muscleVolumeWarning?.evidence.dataPoints.join(" ")).not.toMatch(/MEV|MAV|MRV/i);
  });

  it("surfaces recovery capacity notes on Home when cardio preference allows it", () => {
    const activePlan = { ...plan(), recoveryCardioPreference: "recommended" as const };
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [
        { ...plannedWorkout(0, "Upper", 0), setsCompleted: 12 },
        { ...plannedWorkout(1, "Lower", 1), setsCompleted: 12 },
        { ...plannedWorkout(2, "Extra Push", 2), sessionKind: "extra_full", planSessionIndex: undefined, setsCompleted: 10 },
        { ...plannedWorkout(3, "Extra Pull", 3), sessionKind: "extra_volume", planSessionIndex: undefined, setsCompleted: 10 },
      ],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-07T09:00:00.000Z"),
    });

    expect(dashboard.recoveryCapacityWarning?.message).toMatch(/recovery|capacity|engine|walk/i);
    expect(dashboard.recoveryCapacityWarning?.evidence.dataPoints.join(" ")).not.toMatch(/fat.?loss|calorie|heart.?rate/i);
    expect(dashboard.recoveryCapacityTarget?.title).toBe("Recovery & Capacity");
    expect(dashboard.recoveryCapacityTarget?.targetLabel).toContain("Cardio");
    expect(dashboard.recoveryCapacityTarget?.actionLabel).toMatch(/^Start /);
  });

  it("hides the recovery capacity target when training evidence is insufficient", () => {
    const activePlan = { ...plan(), recoveryCardioPreference: "recommended" as const };
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-07T09:00:00.000Z"),
    });

    expect(dashboard.recoveryCapacityTarget).toBeUndefined();
    expect(dashboard.recoveryCapacityWarning).toBeUndefined();
  });

  it("suppresses recovery cardio notes on Home when cardio preference is off", () => {
    const activePlan = { ...plan(), recoveryCardioPreference: "off" as const };
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [
        { ...plannedWorkout(0, "Upper", 0), setsCompleted: 12 },
        { ...plannedWorkout(1, "Lower", 1), setsCompleted: 12 },
        { ...plannedWorkout(2, "Extra Push", 2), sessionKind: "extra_full", planSessionIndex: undefined, setsCompleted: 10 },
        { ...plannedWorkout(3, "Extra Pull", 3), sessionKind: "extra_volume", planSessionIndex: undefined, setsCompleted: 10 },
      ],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-07T09:00:00.000Z"),
    });

    expect(dashboard.recoveryCapacityWarning).toBeUndefined();
    expect(dashboard.recoveryCapacityTarget).toBeUndefined();
  });

  it("counts current-week cardio logs on the Home recovery target without completing lifting sessions", () => {
    const activePlan = { ...plan(), goal: "get_leaner" as const, recoveryCardioPreference: "recommended" as const };
    const cardio = {
      ...plannedWorkout(3, "Recovery Cardio", 3),
      sessionKind: "recovery_cardio" as const,
      planSessionIndex: undefined,
      setsCompleted: 0,
      repsCompleted: 0,
      totalLoadVolume: 0,
      exerciseSummaries: [],
      cardioLog: {
        sessionType: "recovery_cardio" as const,
        modality: "outdoor_walk" as const,
        durationMinutes: 20,
        perceivedEase: "easy" as const,
        loggedAt: "2026-06-04T10:20:00.000Z",
      },
    };
    const dashboard = buildHomeDashboardViewModel({
      trainingYear,
      activePlan,
      history: [plannedWorkout(0, "Upper", 0), plannedWorkout(1, "Lower", 1), plannedWorkout(2, "Upper", 2), cardio],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
      date: new Date("2026-06-04T12:00:00.000Z"),
    });

    expect(dashboard.recoveryCapacityTarget?.completedSessions).toBe(1);
    expect(dashboard.thisWeekItems[3]?.status).not.toBe("done");
  });
});
