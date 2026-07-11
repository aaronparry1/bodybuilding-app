import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultAppSettings, progressionSettingsFromAppSettings } from "@/application/settings/app-settings";
import { resolveWorkoutExerciseSettings } from "@/application/settings/workout-settings";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { generateLegsWorkout, generatePushWorkout, generateWorkoutByFocus } from "@/domain/training/ad-hoc-workout-generator";
import { swapExerciseInSession } from "@/domain/training/exercise-swaps";
import type { WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import { addExerciseToSession } from "@/domain/training/session-editing";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { exerciseLibrary } from "@/domain/training/presets";

describe("rep range strategy", () => {
  it("resolves primary compounds by block", () => {
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "primary_compound", exerciseFamily: "horizontal_press" })).toEqual({ min: 6, max: 10 });
    expect(resolveRepRange({ blockType: "powerbuilding", exerciseRole: "primary_compound", exerciseFamily: "horizontal_press" })).toEqual({ min: 4, max: 8 });
    expect(resolveRepRange({ blockType: "strength", exerciseRole: "primary_compound", exerciseFamily: "horizontal_press" })).toEqual({ min: 3, max: 5 });
  });

  it("gives hypertrophy isolation and small-muscle work higher rep targets", () => {
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "isolation", exerciseFamily: "chest_isolation" })).toEqual({ min: 10, max: 20 });
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "isolation", exerciseFamily: "biceps_isolation" })).toEqual({ min: 12, max: 25 });
  });

  it("keeps power ranges for actual power exercises", () => {
    expect(resolveRepRange({ blockType: "power", exerciseRole: "power", exerciseFamily: "olympic_power" })).toEqual({ min: 1, max: 3 });
    expect(resolveRepRange({ blockType: "power", exerciseRole: "power", exerciseFamily: "jump_power" })).toEqual({ min: 1, max: 5 });
  });

  it("applies family overrides for calves and rear delts", () => {
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "isolation", exerciseFamily: "calf_raise" })).toEqual({ min: 10, max: 25 });
    expect(resolveRepRange({ blockType: "hypertrophy", exerciseRole: "corrective", exerciseFamily: "rear_delt_corrective" })).toEqual({ min: 12, max: 25 });
  });

  it("lets explicit programme prescriptions beat block defaults", () => {
    expect(
      resolveRepRange({
        blockType: "strength",
        exerciseRole: "primary_compound",
        exerciseFamily: "horizontal_press",
        programmeSlotOverride: { min: 9, max: 13 },
      }),
    ).toEqual({ min: 9, max: 13 });
  });

  it("preserves generated planned rep ranges when starting a workout", () => {
    const generated = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
    });
    const session = buildWorkoutSessionFromProgrammeDay(generated, generated.days[0]!.id, exerciseLibrary, {
      id: "session-rep-strategy",
      startedAt: "2026-06-04T12:00:00.000Z",
    });

    expect(generated.days[0]?.exerciseSlots[0]?.settings.repRange).toEqual({ min: 6, max: 10 });
    expect(session?.exercises[0]?.settings.repRange).toEqual({ min: 6, max: 10 });
  });

  it("generates Push hypertrophy with role-specific ranges", () => {
    const programme = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
    });
    const slots = programme.days[0]!.exerciseSlots;
    const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

    const primaryPress = slots.find((slot) => byId.get(slot.exerciseId)?.role === "primary_compound");
    const isolation = slots.find((slot) => byId.get(slot.exerciseId)?.role === "isolation");

    expect(primaryPress?.settings.repRange).toEqual({ min: 6, max: 10 });
    expect(isolation?.settings.repRange.min).toBeGreaterThanOrEqual(10);
    expect(isolation?.settings.repRange.max).toBeGreaterThanOrEqual(15);
  });

  it("generates Legs with different compound and isolation ranges", () => {
    const programme = generateLegsWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
    });
    const slots = programme.days[0]!.exerciseSlots;
    const byId = new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise]));

    const compound = slots.find((slot) => byId.get(slot.exerciseId)?.role === "primary_compound");
    const calf = slots.find((slot) => byId.get(slot.exerciseId)?.family === "calf_raise");

    expect(compound?.settings.repRange).toEqual({ min: 6, max: 10 });
    expect(calf?.settings.repRange).toEqual({ min: 10, max: 25 });
  });

  it("generates Arms with higher small-muscle ranges", () => {
    const programme = generateWorkoutByFocus("arms", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
    });

    expect(
      programme.days[0]!.exerciseSlots.filter((slot) => slot.settings.repRange.min >= 12 && slot.settings.repRange.max >= 20).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("keeps strength compounds low-rep while retaining higher-rep maintenance work", () => {
    const programme = generateWorkoutByFocus("upper", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("strength"),
    });
    const ranges = programme.days[0]!.exerciseSlots.map((slot) => slot.settings.repRange);

    expect(ranges.some((range) => range.min === 3 && range.max === 5)).toBe(true);
    expect(ranges.some((range) => range.min >= 10 && range.max >= 15)).toBe(true);
  });

  it("resolves added exercises by current block, role, and family", () => {
    const lateralRaise = exerciseLibrary.find((exercise) => exercise.family === "shoulder_isolation")!;
    const settings = resolveWorkoutExerciseSettings(lateralRaise, defaultAppSettings, undefined, createTrainingBlock("hypertrophy"));
    const session = addExerciseToSession(baseSession(), exerciseLog(lateralRaise.id, lateralRaise.name, settings.repRange), {
      activeExerciseIndex: 0,
      position: "end",
    });

    expect(session.exercises.at(-1)?.origin).toBe("added_during_workout");
    expect(session.exercises.at(-1)?.settings.repRange).toEqual({ min: 12, max: 25 });
  });

  it("keeps swap replacements on the current slot prescription instead of a generic block range", () => {
    const current = exerciseLog("ex-bench-press", "Bench Press", { min: 6, max: 10 });
    const replacement = exerciseLog("ex-machine-chest-press", "Machine Chest Press", { min: 6, max: 10 });
    const swapped = swapExerciseInSession(baseSession([current]), 0, replacement);

    expect(swapped.exercises).toHaveLength(1);
    expect(swapped.exercises[0]?.settings.repRange).toEqual({ min: 6, max: 10 });
    expect(swapped.exercises[0]?.settings.repRange).not.toEqual(createTrainingBlock("hypertrophy").repRange);
  });

  it("does not show global rep min/max in normal settings", () => {
    const settingsSource = readFileSync("app/(protected)/settings.tsx", "utf8");

    expect(settingsSource).not.toContain("Rep strategy");
    expect(settingsSource).not.toContain('label="Rep min"');
    expect(settingsSource).not.toContain('label="Rep max"');
  });

  it("keeps legacy defaultRepRange as a fallback setting only", () => {
    const settings = progressionSettingsFromAppSettings({
      ...defaultAppSettings,
      repStrategy: "advanced_custom",
      defaultRepRange: { min: 7, max: 11 },
    });

    expect(settings.repRange).toEqual({ min: 7, max: 11 });
  });
});

function baseSession(exercises: WorkoutExerciseLog[] = [exerciseLog("ex-bench-press", "Bench Press", { min: 6, max: 10 })]): WorkoutSession {
  return {
    id: "session-rep-range-validation",
    userId: "guest-local",
    name: "Push",
    startedAt: "2026-06-04T12:00:00.000Z",
    updatedAt: "2026-06-04T12:00:00.000Z",
    syncState: "local",
    exercises,
  };
}

function exerciseLog(exerciseId: string, exerciseName: string, repRange: { min: number; max: number }): WorkoutExerciseLog {
  return {
    id: `${exerciseId}-log`,
    exerciseId,
    exerciseName,
    settings: {
      repRange,
      dropOffPercent: 15,
      loadIncrease: 2.5,
      unit: "kg",
      requiredWorkSets: 3,
    },
    load: 0,
    loadKnown: false,
    sets: [],
    status: "active",
    origin: "planned",
  };
}
