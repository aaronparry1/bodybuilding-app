import { describe, expect, it } from "vitest";
import {
  calculateMuscleVolumeLandmarks,
  generateLegsWorkout,
  generatePullWorkout,
  generatePushWorkout,
  generateWorkoutByFocus,
} from "@/domain/training/ad-hoc-workout-generator";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import type { Exercise, WorkoutHistorySummary } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { resolveSetPrescription } from "@/domain/training/set-prescription";

function exercisesFor(programme: ReturnType<typeof generatePushWorkout>) {
  const day = programme.days[0]!;
  return day.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!);
}

function exercisePool(ids: string[]): Exercise[] {
  return ids.map((id) => {
    const exercise = exerciseLibrary.find((candidate) => candidate.id === id);
    if (!exercise) throw new Error(`Missing exercise fixture: ${id}`);
    return exercise;
  });
}

function selectedIds(programme: ReturnType<typeof generatePushWorkout>) {
  return programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
}

function selectedSlots(programme: ReturnType<typeof generatePushWorkout>) {
  return programme.days[0]!.exerciseSlots.map((slot) => ({
    slot,
    exercise: exerciseLibrary.find((candidate) => candidate.id === slot.exerciseId)!,
    prescription: resolveSetPrescription(slot.settings),
  }));
}

describe("ad-hoc workout generation", () => {
  it("generates a push workout with chest, shoulders, and triceps", () => {
    const programme = generatePushWorkout({ exercises: exerciseLibrary });
    const muscles = new Set(exercisesFor(programme).flatMap((exercise) => [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles]));

    expect(muscles.has("chest")).toBe(true);
    expect(muscles.has("shoulders")).toBe(true);
    expect(muscles.has("triceps")).toBe(true);
  });

  it("generates a pull workout with back and biceps", () => {
    const programme = generatePullWorkout({ exercises: exerciseLibrary });
    const muscles = new Set(exercisesFor(programme).flatMap((exercise) => [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles]));

    expect(muscles.has("back")).toBe(true);
    expect(muscles.has("biceps")).toBe(true);
  });

  it("keeps biceps support in shortened hypertrophy and powerbuilding pull sessions", () => {
    for (const blockType of ["hypertrophy", "powerbuilding"] as const) {
      const programme = generatePullWorkout({
        exercises: exerciseLibrary,
        currentBlock: createTrainingBlock(blockType),
        targetExerciseCount: 4,
      });
      const selected = exercisesFor(programme);

      expect(selected.some((exercise) => exercise.primaryMuscles.includes("back"))).toBe(true);
      expect(selected.some((exercise) => exercise.movementPattern === "vertical_pull" || exercise.movementPattern === "horizontal_pull")).toBe(true);
      expect(selected.some((exercise) => exercise.primaryMuscles.includes("biceps") || exercise.category === "biceps")).toBe(true);
    }
  });

  it("generates a legs workout with quads, hamstrings, and glutes", () => {
    const programme = generateLegsWorkout({ exercises: exerciseLibrary });
    const muscles = new Set(exercisesFor(programme).flatMap((exercise) => [exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles]));

    expect(muscles.has("quads")).toBe(true);
    expect(muscles.has("hamstrings")).toBe(true);
    expect(muscles.has("glutes")).toBe(true);
  });

  it("respects current block rep ranges and drop-off defaults", () => {
    const strengthBlock = createTrainingBlock("strength");
    const programme = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: strengthBlock });

    expect(programme.days[0]?.exerciseSlots[0]?.settings.repRange).toEqual({ min: 3, max: 5 });
    expect(programme.days[0]?.exerciseSlots.some((slot) => slot.settings.repRange.min >= 10 && slot.settings.repRange.max >= 15)).toBe(true);
    expect(programme.days[0]?.exerciseSlots.every((slot) => slot.settings.dropOffPercent === 10)).toBe(true);
  });

  it("stores equipment-aware load increments in generated slots", () => {
    const programme = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      availableEquipment: ["dumbbell"],
      targetExerciseCount: 3,
      loadIncrementProfile: {
        barbellPlateLoadedKg: 2.5,
        dumbbellKg: 2,
        cableKg: 5,
        machineKg: 5,
        bodyweightExternalLoading: false,
      },
    });

    expect(programme.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
    expect(programme.days[0]?.exerciseSlots.every((slot) => slot.settings.loadIncrease === 2)).toBe(true);
  });

  it("avoids duplicate exact exercises", () => {
    const programme = generateWorkoutByFocus("full_body", { exercises: exerciseLibrary });
    const ids = programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses expanded library options for generated workouts", () => {
    const programme = generatePushWorkout({ exercises: exerciseLibrary, availableEquipment: ["machine"], targetExerciseCount: 4 });
    const ids = programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(ids).toContain("ex-machine-chest-press");
    expect(ids.some((id) => id === "ex-machine-shoulder-press" || id === "ex-machine-lateral-raise")).toBe(true);
  });

  it("can include a matching custom exercise", () => {
    const customExercise: Exercise = {
      ...exerciseLibrary[0]!,
      id: "custom-push-press",
      name: "Custom Machine Chest Press",
      equipment: ["machine"],
      kind: "machine",
      isCustom: true,
      createdByUserId: "user-1",
    };
    const programme = generatePushWorkout({
      exercises: [...exerciseLibrary, customExercise],
      availableEquipment: ["machine"],
      targetExerciseCount: 4,
    });

    expect(programme.days[0]?.exerciseSlots.some((slot) => slot.exerciseId === customExercise.id)).toBe(true);
  });

  it("changes exercise selection across block intent instead of only changing reps", () => {
    const hypertrophy = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const power = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("power") });
    const hypertrophyIds = hypertrophy.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
    const powerIds = power.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(powerIds).not.toEqual(hypertrophyIds);
    expect(powerIds.some((id) => exerciseLibrary.find((exercise) => exercise.id === id)?.roles.includes("power"))).toBe(true);
  });

  it("uses dedicated peak templates instead of strength fallback templates", () => {
    const peakPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("peak"), variant: 0 });
    const strengthPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });
    const peakFullBody = generateWorkoutByFocus("full_body", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("peak"), variant: 0 });

    expect(selectedIds(peakPush)).not.toEqual(selectedIds(strengthPush));
    expect(peakPush.days[0]?.exerciseSlots.length).toBeLessThan(strengthPush.days[0]?.exerciseSlots.length ?? 99);
    expect(selectedIds(peakPush)[0]).toBe("ex-bench-press");
    expect(selectedIds(peakFullBody)).toContain("ex-barbell-back-squat");
    expect(selectedIds(peakFullBody)).toContain("ex-bench-press");
    const peakPushPrescriptions = selectedSlots(peakPush).map(({ prescription }) => prescription);
    expect(peakPushPrescriptions[0]?.recommendedMaxSets).toBe(4);
    expect(peakPushPrescriptions.slice(1).every((prescription) => prescription.recommendedMaxSets <= 3)).toBe(true);
  });

  it("uses dedicated deload templates with reduced complexity and low-fatigue work", () => {
    const deloadPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("deload"), variant: 0 });
    const hypertrophyPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy"), variant: 0 });
    const deloadLegs = generateWorkoutByFocus("legs", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("deload"), variant: 0 });

    expect(selectedIds(deloadPush)).not.toEqual(selectedIds(hypertrophyPush));
    expect(deloadPush.days[0]?.exerciseSlots.length).toBeLessThan(hypertrophyPush.days[0]?.exerciseSlots.length ?? 99);
    expect(selectedSlots(deloadPush).every(({ slot, prescription }) => slot.settings.trainingLane === "maintenance" && prescription.recommendedMaxSets <= 2)).toBe(true);
    expect(selectedSlots(deloadLegs).every(({ exercise }) => exercise.role !== "power" && !exercise.isAdvanced)).toBe(true);
    expect(selectedIds(deloadLegs)).not.toContain("ex-safety-squat-bar-squat");
    expect(selectedSlots(deloadLegs).every(({ exercise }) => !exercise.equipment.includes("other"))).toBe(true);
  });

  it("anchors strength templates around canonical strength lifts", () => {
    const strengthPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });
    const strengthPull = generateWorkoutByFocus("pull", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });
    const strengthLower = generateWorkoutByFocus("lower", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });
    const strengthShoulders = generateWorkoutByFocus("shoulders", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });
    const strengthFullBody = generateWorkoutByFocus("full_body", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength"), variant: 0 });

    expect(selectedIds(strengthPush)[0]).toBe("ex-bench-press");
    expect(selectedIds(strengthPull)[0]).toBe("ex-deadlift");
    expect(selectedIds(strengthLower)[0]).toBe("ex-barbell-back-squat");
    expect(selectedIds(strengthShoulders)[0]).toBe("ex-military-press");
    expect(selectedIds(strengthFullBody)).toEqual(expect.arrayContaining(["ex-barbell-back-squat", "ex-bench-press"]));
    expect(selectedSlots(strengthLower).some(({ exercise, prescription }) => exercise.movementPattern === "core" && prescription.recommendedMaxSets <= 3)).toBe(true);
  });

  it("uses evidence-based slot prescriptions instead of one session-wide set range", () => {
    const push = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const slots = selectedSlots(push);
    const primary = slots.find(({ exercise }) => exercise.roles.includes("primary_compound"));
    const isolationSlot = slots.find(({ exercise }) => exercise.roles.includes("isolation"));

    expect(primary?.prescription).toMatchObject({
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
    });
    expect(isolationSlot?.prescription).toMatchObject({
      requiredSets: 2,
      recommendedMinSets: 2,
      recommendedMaxSets: 4,
    });
  });

  it("guarantees trunk exposure in lower-body strength and hypertrophy templates", () => {
    const hypertrophyLegs = generateLegsWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const strengthLower = generateWorkoutByFocus("lower", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("strength") });
    const meetLower = generateWorkoutByFocus("lower", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("strength"),
      goal: "powerlifting_meet",
    });

    for (const programme of [hypertrophyLegs, strengthLower, meetLower]) {
      expect(selectedSlots(programme).some(({ exercise }) => exercise.movementPattern === "core" || exercise.primaryMuscles.includes("abs"))).toBe(true);
    }
  });

  it("keeps power templates focused on actual power work without excessive hypertrophy accessories", () => {
    const powerLegs = generateWorkoutByFocus("legs", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("power"), variant: 0 });
    const powerPush = generateWorkoutByFocus("push", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("power"), variant: 0 });
    const beginnerPower = generateWorkoutByFocus("legs", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("power"),
      experienceLevel: "beginner",
      variant: 0,
    });

    expect(selectedSlots(powerLegs).filter(({ exercise }) => exercise.role === "power").length).toBeGreaterThanOrEqual(2);
    expect(selectedSlots(powerPush).filter(({ exercise }) => exercise.role === "power").length).toBeGreaterThanOrEqual(2);
    expect(selectedSlots(powerLegs).filter(({ exercise }) => exercise.role === "isolation").length).toBeLessThanOrEqual(1);
    expect(selectedIds(beginnerPower)).toContain("ex-box-jump");
    expect(selectedIds(beginnerPower)).not.toContain("ex-hang-power-clean");
    expect(selectedIds(beginnerPower)).not.toContain("ex-power-snatch");
  });

  it("builds arms sessions around direct arm work, not back and shoulder filler", () => {
    const programme = generateWorkoutByFocus("arms", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const selected = exercisesFor(programme);
    const primaryArmSlots = selected.filter((exercise) => exercise.primaryMuscles.includes("biceps") || exercise.primaryMuscles.includes("triceps"));

    expect(primaryArmSlots.length).toBeGreaterThanOrEqual(4);
  });

  it("builds chest sessions around chest-dominant pressing and pec isolation", () => {
    const programme = generateWorkoutByFocus("chest", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const selected = exercisesFor(programme);
    const primaryChestSlots = selected.filter((exercise) => exercise.primaryMuscles.includes("chest"));
    const hasPress = selected.some((exercise) => exercise.movementPattern === "horizontal_push" && exercise.primaryMuscles.includes("chest"));
    const hasPecIsolation = selected.some((exercise) => exercise.family === "chest_isolation");

    expect(primaryChestSlots.length).toBeGreaterThanOrEqual(3);
    expect(hasPress).toBe(true);
    expect(hasPecIsolation).toBe(true);
  });

  it("builds back sessions around vertical pulls, rows, and rear-delt or trap support", () => {
    const programme = generateWorkoutByFocus("back", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const selected = exercisesFor(programme);

    expect(selected.some((exercise) => exercise.movementPattern === "vertical_pull" && exercise.primaryMuscles.includes("back"))).toBe(true);
    expect(selected.some((exercise) => exercise.movementPattern === "horizontal_pull" && exercise.primaryMuscles.includes("back"))).toBe(true);
    expect(selected.some((exercise) => exercise.family === "rear_delt_corrective" || exercise.family === "trap")).toBe(true);
    expect(selected.filter((exercise) => exercise.movementPattern === "horizontal_push" || exercise.movementPattern === "vertical_push").length).toBe(0);
  });

  it("keeps biceps support in shortened back sessions", () => {
    const programme = generateWorkoutByFocus("back", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      targetExerciseCount: 4,
    });
    const selected = exercisesFor(programme);

    expect(selected.some((exercise) => exercise.movementPattern === "vertical_pull" && exercise.primaryMuscles.includes("back"))).toBe(true);
    expect(selected.some((exercise) => exercise.movementPattern === "horizontal_pull" && exercise.primaryMuscles.includes("back"))).toBe(true);
    expect(selected.some((exercise) => exercise.primaryMuscles.includes("biceps") || exercise.category === "biceps")).toBe(true);
  });

  it("builds shoulder sessions around press, lateral delt, rear delt, and trap/scapular support", () => {
    const programme = generateWorkoutByFocus("shoulders", { exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const selected = exercisesFor(programme);

    expect(selected.some((exercise) => exercise.movementPattern === "vertical_push" && exercise.primaryMuscles.includes("shoulders"))).toBe(true);
    expect(selected.some((exercise) => exercise.family === "shoulder_isolation" && exercise.primaryMuscles.includes("shoulders"))).toBe(true);
    expect(selected.some((exercise) => exercise.family === "rear_delt_corrective")).toBe(true);
    expect(selected.some((exercise) => exercise.family === "trap")).toBe(true);
    expect(selected.some((exercise) => exercise.primaryMuscles.includes("back") && exercise.movementPattern === "horizontal_pull")).toBe(false);
  });

  it("allows controlled shoulder/back crossover without turning sessions generic", () => {
    const crossoverPool = exercisePool([
      "ex-bench-press",
      "ex-incline-dumbbell-press",
      "ex-cable-fly",
      "ex-machine-shoulder-press",
      "ex-dumbbell-lateral-raise",
      "ex-cable-rear-delt-fly",
      "ex-face-pull",
      "ex-barbell-shrug",
      "ex-pull-up",
      "ex-barbell-row",
      "ex-lat-pulldown",
      "ex-triceps-pushdown",
    ]);
    const pushIds = generateWorkoutByFocus("push", { exercises: crossoverPool, currentBlock: createTrainingBlock("hypertrophy"), targetExerciseCount: 5 }).days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
    const pullIds = generateWorkoutByFocus("pull", { exercises: crossoverPool, currentBlock: createTrainingBlock("hypertrophy"), targetExerciseCount: 5 }).days[0]!.exerciseSlots.map((slot) => slot.exerciseId);
    const shoulderIds = generateWorkoutByFocus("shoulders", { exercises: crossoverPool, currentBlock: createTrainingBlock("hypertrophy"), targetExerciseCount: 4 }).days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

    expect(pushIds).toContain("ex-dumbbell-lateral-raise");
    expect(pullIds.some((id) => id === "ex-face-pull" || id === "ex-cable-rear-delt-fly" || id === "ex-barbell-shrug")).toBe(true);
    expect(shoulderIds).toContain("ex-machine-shoulder-press");
    expect(shoulderIds.some((id) => id === "ex-face-pull" || id === "ex-cable-rear-delt-fly")).toBe(true);
    expect(shoulderIds).toContain("ex-barbell-shrug");
  });

  it("uses fatigue signals to trim planned volume before tactical autoregulation takes over", () => {
    const normal = generatePushWorkout({ exercises: exerciseLibrary, currentBlock: createTrainingBlock("hypertrophy") });
    const fatigued = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      recentVolumeByMuscle: { chest: 20 },
    });
    const normalSets = normal.days[0]!.exerciseSlots.reduce((total, slot) => total + slot.settings.requiredWorkSets, 0);
    const fatiguedSets = fatigued.days[0]!.exerciseSlots.reduce((total, slot) => total + slot.settings.requiredWorkSets, 0);

    expect(fatigued.days[0]!.exerciseSlots.length).toBeLessThan(normal.days[0]!.exerciseSlots.length);
    expect(fatiguedSets).toBeLessThan(normalSets);
  });

  it("uses experience level to change generated session complexity and planned set targets", () => {
    const beginner = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      experienceLevel: "beginner",
    });
    const advanced = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      experienceLevel: "advanced",
    });
    const beginnerSlots = beginner.days[0]!.exerciseSlots;
    const advancedSlots = advanced.days[0]!.exerciseSlots;
    const beginnerSets = beginnerSlots.reduce((total, slot) => total + slot.settings.requiredWorkSets, 0);
    const advancedSets = advancedSlots.reduce((total, slot) => total + slot.settings.requiredWorkSets, 0);

    expect(beginner.experienceLevel).toBe("beginner");
    expect(advanced.experienceLevel).toBe("advanced");
    expect(beginnerSlots.length).toBeLessThan(advancedSlots.length);
    expect(beginnerSets).toBeLessThan(advancedSets);
    expect(beginnerSlots.every((slot) => !exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)?.isAdvanced)).toBe(true);
  });

  it("writes hybrid set ranges onto generated exercise slots", () => {
    const programme = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
    });
    const primary = programme.days[0]!.exerciseSlots[0]!;
    const prescription = resolveSetPrescription(primary.settings);

    expect(primary.settings.requiredSets).toBe(primary.settings.requiredWorkSets);
    expect(prescription.requiredSets).toBeGreaterThanOrEqual(1);
    expect(prescription.recommendedMinSets).toBeGreaterThanOrEqual(prescription.requiredSets);
    expect(prescription.recommendedMaxSets).toBeGreaterThanOrEqual(prescription.recommendedMinSets);
    expect(prescription.softCapSets).toBeGreaterThanOrEqual(prescription.recommendedMaxSets);
    expect(primary.settings.setRangeSource).toBe("generated");
  });

  it("estimates muscle volume landmarks from actual quality-set history", () => {
    const history = [4, 5, 6, 7, 5, 4].map((qualitySets, index): WorkoutHistorySummary => ({
      sessionId: `session-${index}`,
      sessionName: "Push",
      startedAt: `2026-05-${index + 1}T10:00:00.000Z`,
      completedAt: `2026-05-${index + 1}T11:00:00.000Z`,
      durationMinutes: 60,
      exercisesCompleted: 1,
      setsCompleted: qualitySets,
      repsCompleted: qualitySets * 10,
      totalLoadVolume: qualitySets * 1000,
      progressionHighlights: [],
      exerciseSummaries: [
        {
          exerciseLogId: `bench-${index}`,
          exerciseId: "ex-bench-press",
          exerciseName: "Bench Press",
          load: 100,
          unit: "kg",
          setsCompleted: qualitySets,
          repsCompleted: qualitySets * 10,
          qualitySets,
          bestSetReps: 10,
          dropOffThreshold: 9,
          stoppedByDropOff: index >= 4,
          progressionEarned: index < 4,
          nextRecommendedLoad: 105,
          volumeLoad: qualitySets * 1000,
        },
      ],
    }));

    const landmarks = calculateMuscleVolumeLandmarks(history, exerciseLibrary, "chest");

    expect(landmarks.estimatedMEV).toBeGreaterThan(0);
    expect(landmarks.estimatedMAV).toBeGreaterThanOrEqual(landmarks.estimatedMEV);
    expect(landmarks.status).not.toBe("insufficient_data");
  });
});
