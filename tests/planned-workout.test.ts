import { describe, expect, it } from "vitest";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { exerciseLibrary } from "@/domain/training/presets";
import { buildPlannedWorkoutProgramme, isLegacyPlaceholderWorkoutSession, resolveNextTrainableWorkoutName, workoutTypeForName } from "@/domain/training/planned-workout";
import { createActiveTrainingPlan, type PreferredSplit, type TrainingSetupInput } from "@/domain/training/plan-setup";
import { resolveRecommendedSessionIndex } from "@/domain/training/training-session-selection";
import { resolveSetPrescription } from "@/domain/training/set-prescription";
import type { WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";

const activePlan = createActiveTrainingPlan(
  {
    goal: "build_muscle",
    planningChoice: "recommended_12_month",
    equipmentPreset: "full_gym",
    daysPerWeek: 5,
    preferredSplit: "push_pull_legs",
    experienceLevel: "intermediate",
  },
  "2026-06-04T09:00:00.000Z",
);

function createPlan(overrides: Partial<TrainingSetupInput> = {}) {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 5,
      preferredSplit: "push_pull_legs",
      experienceLevel: "intermediate",
      ...overrides,
    },
    "2026-06-04T09:00:00.000Z",
  );
}

function slotExercises(programme: NonNullable<ReturnType<typeof buildPlannedWorkoutProgramme>>) {
  return programme.days[0]!.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!);
}

function hasBicepsSupport(programme: NonNullable<ReturnType<typeof buildPlannedWorkoutProgramme>>) {
  return slotExercises(programme).some((exercise) => exercise.category === "biceps" || exercise.primaryMuscles.includes("biceps"));
}

function hasDirectCore(programme: NonNullable<ReturnType<typeof buildPlannedWorkoutProgramme>>) {
  return slotExercises(programme).some((exercise) => exercise.movementPattern === "core" || exercise.primaryMuscles.includes("abs"));
}

function dropOffHistory(count: number): WorkoutHistorySummary[] {
  return Array.from({ length: count }, (_, index) => ({
    sessionId: `dropoff-session-${index}`,
    userId: "user",
    sessionName: "Pull",
    startedAt: `2026-06-0${index + 1}T10:00:00.000Z`,
    completedAt: `2026-06-0${index + 1}T11:00:00.000Z`,
    durationMinutes: 60,
    exercisesCompleted: 1,
    setsCompleted: 3,
    repsCompleted: 24,
    totalLoadVolume: 2400,
    progressionHighlights: [],
    exerciseSummaries: [
      {
        sessionId: `dropoff-session-${index}`,
        sessionName: "Pull",
        completedAt: `2026-06-0${index + 1}T11:00:00.000Z`,
        exerciseLogId: `pull-dropoff-${index}`,
        exerciseId: "ex-pull-up",
        exerciseName: "Pull-Up",
        load: 0,
        unit: "kg",
        setsCompleted: 3,
        repsCompleted: 24,
        qualitySets: 2,
        bestSetReps: 10,
        dropOffThreshold: 15,
        stoppedByDropOff: true,
        progressionEarned: false,
        nextRecommendedLoad: 0,
        volumeLoad: 0,
      },
    ],
  }));
}

describe("planned workout resolution", () => {
  it("builds today's train session from the active plan instead of a two-exercise placeholder", () => {
    const programme = buildPlannedWorkoutProgramme({
      activePlan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      date: new Date("2026-06-01T09:00:00.000Z"),
    });

    expect(programme?.name).toBe("Push");
    expect(programme?.days[0]?.exerciseSlots.length).toBeGreaterThan(2);
    expect(programme?.days[0]?.exerciseSlots.map((slot) => slot.plannedOrder)).toEqual(
      programme?.days[0]?.exerciseSlots.map((_, index) => index + 1),
    );
  });

  it("uses training-gap-adjusted starting loads in generated planned sessions", () => {
    const baseline = buildPlannedWorkoutProgramme({
      activePlan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      date: new Date("2026-06-08T09:00:00.000Z"),
      selectedSessionIndex: 0,
    });
    const targetSlot = baseline?.days[0]?.exerciseSlots[0];
    const targetExercise = exerciseLibrary.find((exercise) => exercise.id === targetSlot?.exerciseId);
    expect(targetSlot).toBeTruthy();
    expect(targetExercise).toBeTruthy();

    const oldHistory: WorkoutHistorySummary[] = [
      {
        sessionId: "old-session",
        userId: "user",
        sessionName: "Push",
        startedAt: "2026-05-19T11:00:00.000Z",
        completedAt: "2026-05-19T12:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 1,
        setsCompleted: 3,
        repsCompleted: 30,
        totalLoadVolume: 3000,
        progressionHighlights: [],
        exerciseSummaries: [
          {
            sessionId: "old-session",
            sessionName: "Push",
            completedAt: "2026-05-19T12:00:00.000Z",
            exerciseLogId: "old-log",
            exerciseId: targetSlot!.exerciseId,
            exerciseName: targetExercise!.name,
            load: 100,
            unit: "kg",
            setsCompleted: 3,
            repsCompleted: 30,
            qualitySets: 3,
            bestSetReps: 10,
            dropOffThreshold: 15,
            stoppedByDropOff: false,
            progressionEarned: true,
            nextRecommendedLoad: 100,
            volumeLoad: 3000,
          },
        ],
      },
    ];

    const programme = buildPlannedWorkoutProgramme({
      activePlan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      date: new Date("2026-06-08T09:00:00.000Z"),
      selectedSessionIndex: 0,
      history: oldHistory,
    });
    const adjustedSlot = programme?.days[0]?.exerciseSlots.find((slot) => slot.exerciseId === targetSlot!.exerciseId);

    expect(adjustedSlot?.suggestedLoad).toBe(95);
    expect(adjustedSlot?.notes).toContain("trimmed");
  });

  it("uses the selected training sequence slot instead of a rest placeholder", () => {
    const workoutName = resolveNextTrainableWorkoutName(activePlan, new Date("2026-06-04T09:00:00.000Z"));

    expect(workoutName).toBe("Push");
  });

  it("starts a fresh plan on session 1 instead of the weekday slot", () => {
    const fourDayPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );

    expect(resolveNextTrainableWorkoutName(fourDayPlan, new Date("2026-06-04T09:00:00.000Z"), [])).toBe("Upper");
  });

  it.each([
    [2, "upper_lower", "Upper"],
    [3, "full_body", "Full Body"],
    [4, "upper_lower", "Upper"],
    [5, "push_pull_legs", "Push"],
    [6, "push_pull_legs", "Push"],
  ] as const)("fresh %i-day plans start on session 1", (daysPerWeek, preferredSplit, expectedFirstSession) => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek,
        preferredSplit: preferredSplit as PreferredSplit,
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );

    expect(resolveRecommendedSessionIndex({ activePlan: plan, history: [], date: new Date("2026-06-06T09:00:00.000Z") })).toBe(0);
    expect(resolveNextTrainableWorkoutName(plan, new Date("2026-06-06T09:00:00.000Z"), [])).toBe(expectedFirstSession);
  });

  it("allows selecting any session out of order", () => {
    const fourDayPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );

    const programme = buildPlannedWorkoutProgramme({
      activePlan: fourDayPlan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      selectedSessionIndex: 3,
      history: [],
    });

    expect(programme?.name).toBe("Lower");
  });

  it("does not shorten a normal first-block intermediate Pull session", () => {
    const plan = createPlan();
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      selectedSessionIndex: 1,
      history: [],
    });

    expect(programme?.name).toBe("Pull");
    expect(programme?.days[0]?.exerciseSlots.length).toBe(5);
    expect(hasBicepsSupport(programme!)).toBe(true);
    expect(slotExercises(programme!).filter((exercise) => exercise.primaryMuscles.includes("back")).length).toBeGreaterThanOrEqual(3);
    expect(
      programme!.days[0]!.exerciseSlots.map((slot) => resolveSetPrescription(slot.settings)).map((prescription) => [
        prescription.recommendedMinSets,
        prescription.recommendedMaxSets,
      ]),
    ).toEqual([
      [3, 5],
      [2, 4],
      [2, 4],
      [2, 5],
      [2, 5],
    ]);
  });

  it("keeps Push and Pull coherent in the same first block without making Pull a short session", () => {
    const plan = createPlan();
    const currentBlock = createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 });
    const push = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock,
      selectedSessionIndex: 0,
      history: [],
    });
    const pull = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock,
      selectedSessionIndex: 1,
      history: [],
    });
    const legs = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock,
      selectedSessionIndex: 2,
      history: [],
    });

    expect(push?.name).toBe("Push");
    expect(pull?.name).toBe("Pull");
    expect(legs?.name).toBe("Legs");
    expect(push?.days[0]?.exerciseSlots.length).toBe(6);
    expect(pull?.days[0]?.exerciseSlots.length).toBe(5);
    expect(legs?.days[0]?.exerciseSlots.length).toBe(7);
    expect(hasBicepsSupport(pull!)).toBe(true);
    expect(slotExercises(push!).some((exercise) => exercise.primaryMuscles.includes("triceps") || exercise.category === "triceps")).toBe(true);
    expect(slotExercises(legs!).some((exercise) => exercise.movementPattern === "core" || exercise.primaryMuscles.includes("abs"))).toBe(true);
  });

  it("allows beginner Pull to stay conservative while retaining biceps support", () => {
    const plan = createPlan({ experienceLevel: "beginner" });
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      selectedSessionIndex: 1,
      history: [],
    });

    expect(programme?.name).toBe("Pull");
    expect(programme?.experienceLevel).toBe("beginner");
    expect(programme?.days[0]?.exerciseSlots.length).toBe(4);
    expect(hasBicepsSupport(programme!)).toBe(true);
    expect(
      slotExercises(programme!)
        .filter((exercise) => exercise.category !== "biceps")
        .every((exercise) => exercise.movementPattern === "vertical_pull" || exercise.movementPattern === "horizontal_pull"),
    ).toBe(true);
    expect(programme!.days[0]!.exerciseSlots.some((slot) => resolveSetPrescription(slot.settings).recommendedMinSets <= 2)).toBe(true);
  });

  it("trims Pull only when fatigue/drop-off evidence justifies a reduced first-block dose", () => {
    const plan = createPlan();
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      selectedSessionIndex: 1,
      history: dropOffHistory(3),
    });

    expect(programme?.name).toBe("Pull");
    expect(programme?.days[0]?.exerciseSlots.length).toBe(4);
    expect(hasBicepsSupport(programme!)).toBe(true);
    expect(
      programme!.days[0]!.exerciseSlots.every((slot) => slot.notes?.includes("Fatigue-aware planner trimmed planned volume")),
    ).toBe(true);
    expect(programme!.days[0]!.exerciseSlots.map((slot) => resolveSetPrescription(slot.settings).recommendedMaxSets)).toEqual([4, 4, 4, 4]);
  });

  it.each([
    [0, "Chest", "chest"],
    [1, "Back", "back"],
    [2, "Legs", "legs"],
    [3, "Shoulders", "shoulders"],
    [4, "Arms", "arms"],
    [5, "Full Body", "full_body"],
  ] as const)("maps body-part split session %s (%s) to a planned workout", (selectedSessionIndex, expectedName, expectedType) => {
    const bodyPartPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 6,
        preferredSplit: "body_part_split",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );

    const programme = buildPlannedWorkoutProgramme({
      activePlan: bodyPartPlan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      selectedSessionIndex,
      history: [],
    });

    expect(workoutTypeForName(expectedName)).toBe(expectedType);
    expect(programme?.name).toBe(expectedName);
    expect(programme?.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
  });

  it("keeps primary machine lower-body slots on primary prescriptions", () => {
    const plan = createPlan();
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      workoutName: "Legs",
      selectedSessionIndex: 0,
      history: [],
    })!;
    const firstSlot = programme.days[0]!.exerciseSlots[0]!;
    const firstExercise = exerciseLibrary.find((exercise) => exercise.id === firstSlot.exerciseId)!;
    const prescription = resolveSetPrescription(firstSlot.settings);

    expect(firstExercise.id).toBe("ex-hack-squat");
    expect(firstExercise.kind).toBe("machine");
    expect(firstExercise.movementPattern).toBe("squat");
    expect(prescription).toMatchObject({
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
    });
  });

  it("preserves beginner Power Lower trunk work before optional support", () => {
    const plan = createPlan({ goal: "athletic_performance", preferredSplit: "upper_lower", experienceLevel: "beginner" });
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("power", { id: "block-power", currentWeek: 1 }),
      workoutName: "Lower",
      selectedSessionIndex: 0,
      history: [],
    })!;
    const coreSlot = programme.days[0]!.exerciseSlots.find((slot) => {
      const exercise = exerciseLibrary.find((item) => item.id === slot.exerciseId)!;
      return exercise.movementPattern === "core";
    })!;
    const coreExercise = exerciseLibrary.find((exercise) => exercise.id === coreSlot.exerciseId)!;
    const corePrescription = resolveSetPrescription(coreSlot.settings);

    expect(hasDirectCore(programme)).toBe(true);
    expect(coreExercise.family).toBe("core_stability");
    expect(coreExercise.kind).toBe("bodyweight");
    expect(coreExercise.isBeginnerFriendly).toBe(true);
    expect(coreExercise.fatigueCost).toBe("low");
    expect(corePrescription.recommendedMaxSets).toBeLessThanOrEqual(2);
  });

  it("keeps Powerlifting Meet Peak Full Body specific while adding low-volume bracing", () => {
    const plan = createPlan({
      goal: "powerlifting_meet",
      planningChoice: "custom_date_event",
      eventType: "powerlifting_meet",
      targetDate: "2026-10-10",
      preferredSplit: "full_body",
    });
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("peak", { id: "block-peak", currentWeek: 1 }),
      workoutName: "Full Body",
      selectedSessionIndex: 0,
      history: [],
    })!;
    const ids = programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
    const coreSlot = programme.days[0]!.exerciseSlots.find((slot) => {
      const exercise = exerciseLibrary.find((item) => item.id === slot.exerciseId)!;
      return exercise.movementPattern === "core";
    })!;
    const corePrescription = resolveSetPrescription(coreSlot.settings);

    expect(ids).toEqual(expect.arrayContaining(["ex-barbell-back-squat", "ex-bench-press"]));
    expect(hasDirectCore(programme)).toBe(true);
    expect(corePrescription.requiredSets).toBe(1);
    expect(corePrescription.recommendedMaxSets).toBeLessThanOrEqual(2);
  });

  it("late Powerlifting Meet Peak prefers canonical deadlift over novelty hinge variants", () => {
    const plan = createPlan({
      goal: "powerlifting_meet",
      planningChoice: "custom_date_event",
      eventType: "powerlifting_meet",
      targetDate: "2026-10-10",
      preferredSplit: "upper_lower",
    });
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("peak", { id: "block-peak", currentWeek: 1 }),
      workoutName: "Lower",
      selectedSessionIndex: 0,
      history: [],
    })!;
    const ids = programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(ids).toContain("ex-deadlift");
    expect(ids).not.toContain("ex-deficit-deadlift");
    expect(ids).not.toContain("ex-snatch-grip-deadlift");
  });

  it("uses controlled planned rotation in active planned workouts", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 5,
        preferredSplit: "push_pull_legs",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const weekOne = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 1 }),
      selectedSessionIndex: 0,
      history: [],
    });
    const weekThree = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 3 }),
      selectedSessionIndex: 0,
      history: [],
    });
    const weekFive = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy", { id: "block-hyp", currentWeek: 5 }),
      selectedSessionIndex: 0,
      history: [],
    });

    const weekOneIds = weekOne?.days[0]?.exerciseSlots.map((slot) => slot.exerciseId) ?? [];
    const weekThreeIds = weekThree?.days[0]?.exerciseSlots.map((slot) => slot.exerciseId) ?? [];
    const weekFiveIds = weekFive?.days[0]?.exerciseSlots.map((slot) => slot.exerciseId) ?? [];

    expect(weekOneIds.length).toBeGreaterThan(2);
    expect(weekThreeIds).toEqual(weekOneIds);
    expect(weekFiveIds[0]).toBe(weekOneIds[0]);
    expect(weekFiveIds).not.toEqual(weekOneIds);
  });

  it("keeps planned deload lower sessions low complexity instead of selecting specialty-bar overload work", () => {
    const plan = createPlan();
    const programme = buildPlannedWorkoutProgramme({
      activePlan: plan,
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("deload", { id: "block-deload", currentWeek: 1 }),
      workoutName: "Legs",
      history: [],
    });
    const exercises = slotExercises(programme!);

    expect(programme?.name).toBe("Legs");
    expect(programme?.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
    expect(exercises.map((exercise) => exercise.id)).not.toContain("ex-safety-squat-bar-squat");
    expect(exercises.every((exercise) => !exercise.equipment.includes("other"))).toBe(true);
    expect(exercises.every((exercise) => exercise.role !== "power" && !exercise.isAdvanced)).toBe(true);
    expect(programme!.days[0]!.exerciseSlots.every((slot) => resolveSetPrescription(slot.settings).recommendedMaxSets <= 2)).toBe(true);
  });

  it("moves the recommended session from completed plan slot metadata", () => {
    const fourDayPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const history: WorkoutHistorySummary[] = [
      {
        sessionId: "completed-upper",
        sessionName: "Upper",
        startedAt: "2026-06-01T09:00:00.000Z",
        completedAt: "2026-06-01T10:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 1,
        setsCompleted: 3,
        repsCompleted: 30,
        totalLoadVolume: 3000,
        progressionHighlights: [],
        exerciseSummaries: [],
        planSessionIndex: 0,
        sessionKind: "planned",
      },
    ];

    expect(resolveNextTrainableWorkoutName(fourDayPlan, new Date("2026-06-04T09:00:00.000Z"), history)).toBe("Lower");
  });

  it("does not let extra sessions advance the main plan recommendation", () => {
    const fourDayPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const history: WorkoutHistorySummary[] = [
      {
        sessionId: "extra-upper",
        sessionName: "Extra Upper",
        startedAt: "2026-06-01T09:00:00.000Z",
        completedAt: "2026-06-01T10:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 1,
        setsCompleted: 3,
        repsCompleted: 30,
        totalLoadVolume: 3000,
        progressionHighlights: [],
        exerciseSummaries: [],
        sessionKind: "extra_full",
      },
    ];

    expect(resolveRecommendedSessionIndex({ activePlan: fourDayPlan, history, date: new Date("2026-06-04T09:00:00.000Z") })).toBe(0);
  });

  it("does not let legacy ad-hoc AI sessions satisfy a planned slot by name", () => {
    const fourDayPlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const history: WorkoutHistorySummary[] = [
      {
        sessionId: "legacy-ai-upper",
        sessionName: "AI Upper",
        startedAt: "2026-06-01T09:00:00.000Z",
        completedAt: "2026-06-01T10:00:00.000Z",
        durationMinutes: 60,
        exercisesCompleted: 1,
        setsCompleted: 3,
        repsCompleted: 30,
        totalLoadVolume: 3000,
        progressionHighlights: [],
        exerciseSummaries: [],
      },
    ];

    expect(resolveRecommendedSessionIndex({ activePlan: fourDayPlan, history, date: new Date("2026-06-04T09:00:00.000Z") })).toBe(0);
  });

  it("identifies only untouched legacy Push Priority placeholders", () => {
    const placeholder: WorkoutSession = {
      id: "session-legacy",
      userId: "guest-local",
      name: "Push Priority",
      startedAt: "2026-06-04T09:00:00.000Z",
      updatedAt: "2026-06-04T09:00:00.000Z",
      syncState: "local",
      exercises: [
        { id: "one", exerciseId: "ex-bench-press", exerciseName: "Bench Press", settings: exerciseLibrary[0]!.defaultSettings, load: 0, sets: [], status: "active" },
        { id: "two", exerciseId: "ex-incline-dumbbell-press", exerciseName: "Incline Dumbbell Press", settings: exerciseLibrary[1]!.defaultSettings, load: 0, sets: [], status: "active" },
      ],
    };

    expect(isLegacyPlaceholderWorkoutSession(placeholder)).toBe(true);
    expect(
      isLegacyPlaceholderWorkoutSession({
        ...placeholder,
        exercises: [
          {
            ...placeholder.exercises[0]!,
            sets: [{ id: "set-1", setNumber: 1, reps: 10, load: 100, loggedAt: "2026-06-04T09:10:00.000Z" }],
          },
          placeholder.exercises[1]!,
        ],
      }),
    ).toBe(false);
  });
});
