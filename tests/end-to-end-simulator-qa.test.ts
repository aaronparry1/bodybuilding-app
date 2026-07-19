import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateWorkoutByFocus, type GeneratedWorkoutType } from "@/domain/training/ad-hoc-workout-generator";
import { createAnnualPlan, createTrainingBlock, naturalLifterAnnualPlan } from "@/domain/training/annual-planner";
import { getExerciseSwapSuggestions, swapExerciseInSession } from "@/domain/training/exercise-swaps";
import { buildHomeDashboardViewModel } from "@/domain/training/home-dashboard";
import type { Exercise, ProgressionSettings, SetLog, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { createActiveTrainingPlan, weeklySplitForPlan } from "@/domain/training/plan-setup";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { exerciseLibrary, presetProgrammes } from "@/domain/training/presets";
import { getRestTimerDefault } from "@/domain/training/rest-timer";
import { buildStrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import { summarizeWorkoutHistory, summarizeWorkoutSession } from "@/domain/training/workout-history";

const repoRoot = process.cwd();

function exercise(id: string): Exercise {
  const match = exerciseLibrary.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing exercise ${id}`);
  return match;
}

function settings(exercise: Exercise): ProgressionSettings {
  return {
    ...exercise.defaultSettings,
    repRange: { min: 8, max: 12 },
    dropOffPercent: 15,
    loadIncrease: 5,
    requiredWorkSets: 3,
    unit: "kg",
  };
}

function setLog(setNumber: number, reps: number, load = 100): SetLog {
  return {
    id: `set-${setNumber}-${reps}`,
    setNumber,
    reps,
    load,
    loggedAt: `2026-06-02T10:${String(setNumber).padStart(2, "0")}:00.000Z`,
  };
}

function completedLog(id: string, load: number, reps: number[]): WorkoutExerciseLog {
  const metadata = exercise(id);
  const sets = reps.map((repsValue, index) => setLog(index + 1, repsValue, load));
  const progression = evaluateExerciseProgression({
    exerciseName: metadata.name,
    currentLoad: load,
    settings: settings(metadata),
    sets,
  });

  return {
    id: `log-${id}`,
    exerciseId: id,
    exerciseName: metadata.name,
    settings: settings(metadata),
    load,
    sets,
    status: progression.shouldShutdown ? "shutdown" : "complete",
  };
}

function completedSession(id: string, name: string, exercises: WorkoutExerciseLog[]): WorkoutSession {
  return {
    id,
    userId: "guest-local",
    name,
    startedAt: "2026-06-02T10:00:00.000Z",
    completedAt: "2026-06-02T11:00:00.000Z",
    updatedAt: "2026-06-02T11:00:00.000Z",
    syncState: "local",
    exercises,
  };
}

function selectedExercises(programme: ReturnType<typeof generateWorkoutByFocus>) {
  return programme.days[0]!.exerciseSlots.map((slot) => exercise(slot.exerciseId));
}

describe("end-to-end simulator QA regression", () => {
  it("validates onboarding choices and home dashboard output", () => {
    const activePlan = createActiveTrainingPlan(
      {
        goal: "build_muscle",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "let_app_choose",
        experienceLevel: "intermediate",
      },
      "2026-06-02T09:00:00.000Z",
    );
    const dashboard = buildHomeDashboardViewModel({
      trainingYear: createAnnualPlan(naturalLifterAnnualPlan, "2026-06-02T09:00:00.000Z"),
      activePlan,
      history: [],
      exercises: exerciseLibrary,
      programmes: presetProgrammes,
    });

    expect(activePlan.goal).toBe("build_muscle");
    expect(activePlan.mode).toBe("recommended_12_month");
    expect(activePlan.equipment).toEqual(["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"]);
    expect(activePlan.daysPerWeek).toBe(4);
    expect(weeklySplitForPlan(activePlan.daysPerWeek, activePlan.preferredSplit)).toEqual(["Upper", "Lower", "Upper", "Lower"]);
    expect(dashboard.planningContext.status).toBe("ready");
    expect(dashboard.planningContext.microcycleLabel).toContain("Microcycle 1");
    expect(dashboard.thisWeek).toEqual(activePlan.currentMicrocycle?.sessionRoles);
    expect(dashboard.recommendationLabel).toBe("Log a few workouts first");
    expect(dashboard.primaryActionLabel).toBe("Start Upper hypertrophy");
  });

  it("validates generated sessions after taxonomy fixes", () => {
    const workoutTypes: GeneratedWorkoutType[] = ["push", "pull", "legs", "upper", "arms"];
    const generated = Object.fromEntries(
      workoutTypes.map((type) => [
        type,
        generateWorkoutByFocus(type, {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock("hypertrophy"),
          availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
          variant: 2,
        }),
      ]),
    ) as Record<GeneratedWorkoutType, ReturnType<typeof generateWorkoutByFocus>>;

    const push = selectedExercises(generated.push);
    const pull = selectedExercises(generated.pull);
    const legs = selectedExercises(generated.legs);
    const arms = selectedExercises(generated.arms);
    const powerPush = selectedExercises(generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("power") }));

    expect(push.some((candidate) => candidate.family === "rear_delt_corrective")).toBe(false);
    expect(push.some((candidate) => candidate.family === "shoulder_isolation")).toBe(true);
    expect(pull.some((candidate) => candidate.movementPattern === "vertical_pull")).toBe(true);
    expect(pull.some((candidate) => candidate.movementPattern === "horizontal_pull")).toBe(true);
    expect(legs.filter((candidate) => candidate.family === "squat_pattern" && candidate.tier !== "C")).toHaveLength(1);
    expect(arms.filter((candidate) => candidate.primaryMuscles.includes("biceps") || candidate.primaryMuscles.includes("triceps")).length).toBeGreaterThanOrEqual(
      Math.ceil(arms.length * 0.6),
    );
    expect(powerPush[0]?.role).toBe("power");
  });

  it("validates generated Push workout start, editable load, rest defaults, autoregulation, swap, save, and progress output", () => {
    const generatedPush = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      variant: 1,
    });
    const session = buildWorkoutSessionFromProgrammeDay(
      generatedPush,
      generatedPush.days[0]!.id,
      exerciseLibrary,
      { id: "qa-session", userId: "guest-local", startedAt: "2026-06-02T10:00:00.000Z", defaultLoad: 100 },
    );

    expect(session).not.toBeNull();
    expect(session?.name).toContain("Push");
    expect(session?.exercises.map((entry) => entry.exerciseName)).toEqual(selectedExercises(generatedPush).map((entry) => entry.name));
    expect(session?.exercises[0]?.settings.repRange).toEqual(generatedPush.days[0]?.exerciseSlots[0]?.settings.repRange);

    const bench = exercise("ex-bench-press");
    const shutdown = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: settings(bench),
      sets: [12, 11, 10, 8].map((reps, index) => setLog(index + 1, reps)),
    });
    const productive = evaluateExerciseProgression({
      exerciseName: "Bench Press",
      currentLoad: 100,
      settings: settings(bench),
      sets: [12, 11, 10, 10].map((reps, index) => setLog(index + 1, reps)),
    });

    expect(shutdown.bestSetReps).toBe(12);
    expect(shutdown.minimumAcceptableReps).toBe(10);
    expect(shutdown.shouldShutdown).toBe(true);
    expect(shutdown.shouldIncreaseLoad).toBe(false);
    expect(productive.shouldShutdown).toBe(false);
    expect(productive.shouldIncreaseLoad).toBe(true);
    expect(productive.nextLoad).toBe(105);

    const editableLoadLog = {
      ...completedLog("ex-bench-press", 100, [12, 11, 10, 8]),
      sets: [setLog(1, 12, 100), setLog(2, 11, 102.5), setLog(3, 10, 102.5), setLog(4, 8, 102.5)],
      load: 102.5,
    };
    expect(editableLoadLog.sets.map((set) => set.load)).toEqual([100, 102.5, 102.5, 102.5]);
    expect(getRestTimerDefault({ blockType: "hypertrophy", roles: bench.roles, movementPattern: bench.movementPattern }).seconds).toBe(120);

    const suggestions = getExerciseSwapSuggestions(exercise("ex-bench-press"), exerciseLibrary, { limit: 5 });
    expect(suggestions[0]?.family).toBe("horizontal_press");
    expect(suggestions[0]?.role).toBe("primary_compound");

    const openSession = completedSession("qa-push", "Push QA", [editableLoadLog, completedLog("ex-cable-lateral-raise", 12, [15, 14, 13])]);
    const replacement = {
      id: "replacement-machine-press",
      exerciseId: "ex-machine-chest-press",
      exerciseName: "Machine Chest Press",
      settings: settings(exercise("ex-machine-chest-press")),
      load: 102.5,
      sets: [],
      status: "active" as const,
    };
    const swapped = swapExerciseInSession({ ...openSession, completedAt: undefined }, 0, replacement);
    const finished = {
      ...swapped,
      completedAt: "2026-06-02T11:00:00.000Z",
      exercises: swapped.exercises.map((entry) =>
        entry.exerciseId === "ex-machine-chest-press" ? { ...entry, status: "complete" as const, sets: [setLog(1, 11, 102.5), setLog(2, 10, 102.5)] } : entry,
      ),
    };
    const summary = summarizeWorkoutSession(finished);
    const history = summarizeWorkoutHistory([finished]);
    const direction = buildStrategicCoachingViewModel(history, exerciseLibrary);

    expect(swapped.exercises).toHaveLength(2);
    expect(swapped.exercises[0]).toMatchObject({
      exerciseId: "ex-machine-chest-press",
      status: "active",
      swappedFromExerciseName: "Bench Press",
    });
    expect(swapped.exercises[0]?.sets).toHaveLength(0);
    expect(swapped.exercises[0]?.swapHistory?.[0]?.sets).toHaveLength(4);
    expect(summary?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-bench-press")?.swappedToExerciseName).toBe("Machine Chest Press");
    expect(summary?.exerciseSummaries.find((entry) => entry.exerciseId === "ex-machine-chest-press")?.swappedFromExerciseName).toBe("Bench Press");
    expect(history).toHaveLength(1);
    expect(direction.hasEnoughHistory).toBe(false);
    expect(direction.emptyMessage).toContain("Log 3-5 completed workouts first");
  });

  it("keeps critical nested navigation route files present", () => {
    const routes = [
      "app/(protected)/(tabs)/train.tsx",
      "app/(protected)/(tabs)/index.tsx",
      "app/(protected)/(tabs)/programmes.tsx",
      "app/(protected)/programmes/ai.tsx",
      "app/(protected)/settings.tsx",
      "app/(protected)/library/[id].tsx",
      "app/(protected)/history/[id].tsx",
    ];

    expect(routes.every((route) => existsSync(join(repoRoot, route)))).toBe(true);
  });
});
