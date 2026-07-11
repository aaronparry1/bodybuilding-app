import { describe, expect, it } from "vitest";
import {
  generatePushWorkout,
  generateWorkoutByFocus,
  type GeneratedWorkoutType,
} from "@/domain/training/ad-hoc-workout-generator";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { getExerciseSwapSuggestions } from "@/domain/training/exercise-swaps";
import { exerciseLibrary } from "@/domain/training/presets";
import type { BlockCompatibility, ExerciseFamily, ExerciseRole, ExerciseTier } from "@/domain/training/models";

const workoutTypes: Exclude<GeneratedWorkoutType, "custom">[] = ["push", "pull", "legs", "upper", "lower", "full_body", "arms"];
const blockTypes: BlockCompatibility[] = ["hypertrophy", "powerbuilding", "strength", "power"];

function exercise(id: string) {
  const match = exerciseLibrary.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing exercise ${id}`);
  return match;
}

function selectedExercises(programme: ReturnType<typeof generatePushWorkout>) {
  return programme.days[0]!.exerciseSlots.map((slot) => exercise(slot.exerciseId));
}

describe("exercise taxonomy", () => {
  it("classifies core named exercises by role, family, and tier", () => {
    expect(exercise("ex-bench-press")).toMatchObject({
      role: "primary_compound" satisfies ExerciseRole,
      family: "horizontal_press" satisfies ExerciseFamily,
      tier: "A" satisfies ExerciseTier,
    });
    expect(exercise("ex-deadlift")).toMatchObject({
      role: "primary_compound" satisfies ExerciseRole,
      family: "hip_hinge" satisfies ExerciseFamily,
      tier: "A" satisfies ExerciseTier,
      movementPattern: "hinge",
      equipment: ["barbell"],
    });
    expect(exercise("ex-pendlay-row")).toMatchObject({ role: "primary_compound", family: "horizontal_pull", tier: "A" });
    expect(exercise("ex-lateral-raise-plate-loaded")).toMatchObject({ role: "isolation", family: "shoulder_isolation", tier: "C" });
    expect(exercise("ex-face-pull")).toMatchObject({ role: "corrective", family: "rear_delt_corrective", tier: "C" });
    expect(exercise("ex-power-clean")).toMatchObject({ role: "power", family: "olympic_power", tier: "A" });
    expect(exercise("ex-back-extension")).toMatchObject({ role: "capacity", family: "hyperextension", tier: "B" });
    expect(exercise("ex-iso-hold-back-extension")).toMatchObject({ role: "resilience", family: "hyperextension", tier: "C" });
  });

  it("classifies added squat, press, and deadlift variants for generation and same-family estimates", () => {
    for (const id of ["ex-safety-squat-bar-squat", "ex-cambered-bar-squat", "ex-zercher-squat", "ex-box-squat"]) {
      expect(exercise(id)).toMatchObject({ family: "squat_pattern", movementPattern: "squat", role: "secondary_compound", tier: "B" });
    }
    for (const id of ["ex-floor-press", "ex-board-press", "ex-decline-press", "ex-spoto-press", "ex-pin-press"]) {
      expect(exercise(id)).toMatchObject({ family: "horizontal_press", movementPattern: "horizontal_push", role: "secondary_compound", tier: "B" });
    }
    for (const id of ["ex-seated-barbell-shoulder-press", "ex-high-incline-press"]) {
      expect(exercise(id)).toMatchObject({ family: "vertical_press", movementPattern: "vertical_push", role: "secondary_compound", tier: "B" });
    }
    expect(exercise("ex-plate-loaded-shoulder-press-machine")).toMatchObject({
      family: "vertical_press",
      movementPattern: "vertical_push",
      equipment: ["machine"],
      role: "secondary_compound",
      tier: "B",
    });
    expect(exercise("ex-pause-squat")).toMatchObject({ family: "squat_pattern", movementPattern: "squat", role: "secondary_compound", tier: "B" });
    for (const id of ["ex-rack-pull", "ex-deficit-deadlift", "ex-block-pull", "ex-pause-deadlift", "ex-trap-bar-deadlift"]) {
      expect(exercise(id)).toMatchObject({ family: "hip_hinge", movementPattern: "hinge", role: "secondary_compound", tier: "B" });
    }
  });

  it("classifies expansion strength variants by primary-lift family and block suitability", () => {
    for (const id of ["ex-paused-bench-press", "ex-larsen-press", "ex-feet-up-bench-press", "ex-slingshot-bench-press", "ex-bench-press-chains", "ex-bench-press-bands"]) {
      expect(exercise(id)).toMatchObject({ family: "horizontal_press", movementPattern: "horizontal_push", tier: "B" });
      expect(exercise(id).suitableBlocks).toContain("strength");
    }
    for (const id of ["ex-pin-squat", "ex-anderson-squat", "ex-hatfield-squat", "ex-tempo-squat", "ex-squat-chains", "ex-squat-bands", "ex-speed-squat"]) {
      expect(exercise(id)).toMatchObject({ family: "squat_pattern", movementPattern: "squat", tier: "B" });
    }
    for (const id of ["ex-snatch-grip-deadlift", "ex-stiff-leg-deadlift", "ex-tempo-deadlift", "ex-deadlift-chains", "ex-deadlift-bands", "ex-speed-deadlift"]) {
      expect(exercise(id)).toMatchObject({ family: "hip_hinge", movementPattern: "hinge", tier: "B" });
    }
  });

  it("classifies expansion power exercises as power-lane work", () => {
    const powerIds = [
      "ex-power-clean",
      "ex-hang-power-clean",
      "ex-clean-pull",
      "ex-power-snatch",
      "ex-hang-power-snatch",
      "ex-snatch-pull",
      "ex-high-pull",
      "ex-box-jump",
      "ex-broad-jump",
      "ex-countermovement-jump",
      "ex-depth-jump",
      "ex-medicine-ball-chest-throw",
      "ex-medicine-ball-overhead-throw",
      "ex-medicine-ball-rotational-throw",
      "ex-slam-ball-throw",
    ];

    for (const id of powerIds) {
      const candidate = exercise(id);
      expect(candidate.role, id).toBe("power");
      expect(candidate.roles, id).toContain("power");
      expect(candidate.suitableBlocks, id).toContain("power");
    }
  });

  it("classifies expansion hypertrophy exercises as accessory or isolation work", () => {
    const hypertrophyIds = [
      "ex-arnold-press",
      "ex-front-raise",
      "ex-cable-front-raise",
      "ex-leaning-lateral-raise",
      "ex-machine-lateral-raise",
      "ex-reverse-machine-fly",
      "ex-rope-pushdown",
      "ex-straight-bar-pushdown",
      "ex-single-arm-cable-pushdown",
      "ex-cable-rope-overhead-extension",
      "ex-skull-crusher",
      "ex-pjr-pullover",
      "ex-bayesian-curl",
      "ex-incline-dumbbell-curl",
      "ex-spider-curl",
      "ex-preacher-curl",
      "ex-cable-curl",
      "ex-hammer-curl",
      "ex-pec-deck",
      "ex-cable-fly",
      "ex-low-to-high-cable-fly",
      "ex-high-to-low-cable-fly",
      "ex-machine-chest-press",
      "ex-chest-supported-row",
      "ex-t-bar-row",
      "ex-meadows-row",
      "ex-seal-row",
      "ex-high-row-plate-loaded",
      "ex-straight-arm-pulldown",
      "ex-nordic-curl",
      "ex-glute-ham-raise",
      "ex-seated-leg-curl",
      "ex-lying-leg-curl",
      "ex-b-stance-hip-thrust",
      "ex-cable-kickback",
      "ex-standing-calf-raise",
      "ex-seated-calf-raise",
      "ex-tibialis-raise",
    ];

    for (const id of hypertrophyIds) {
      const candidate = exercise(id);
      expect(candidate.roles.some((role) => role === "accessory" || role === "isolation" || role === "secondary_compound"), id).toBe(true);
      expect(candidate.suitableBlocks, id).toContain("hypertrophy");
    }
  });

  it("classifies coverage-update exercises with valid families and equipment", () => {
    for (const id of ["ex-walking-lunge", "ex-reverse-lunge", "ex-lunge"]) {
      expect(exercise(id)).toMatchObject({ family: "single_leg", movementPattern: "lunge", tier: "B" });
      expect(exercise(id).primaryMuscles).toEqual(expect.arrayContaining(["quads", "glutes"]));
    }

    expect(exercise("ex-single-leg-glute-bridge")).toMatchObject({ family: "hip_thrust", movementPattern: "hip_thrust", kind: "bodyweight", defaultLoadJump: 0 });
    expect(exercise("ex-machine-glute-drive").swapTags).toContain("glute drive (machine)");
    expect(exercise("ex-rope-pushdown").swapTags).toContain("rope tricep pushdowns");

    for (const id of ["ex-rope-hammer-curl", "ex-alternating-hammer-curl", "ex-drag-curl", "ex-v-bar-cable-curl", "ex-thick-bar-cable-curl", "ex-barbell-curl"]) {
      expect(exercise(id)).toMatchObject({ family: "biceps_isolation", movementPattern: "isolation", tier: "C" });
      expect(exercise(id).primaryMuscles).toContain("biceps");
    }

    expect(exercise("ex-cable-shrug")).toMatchObject({ family: "trap", category: "traps", equipment: ["cable"] });
    expect(exercise("ex-barbell-row").swapTags).toContain("bent over row");
    expect(exercise("ex-face-pull")).toMatchObject({ family: "rear_delt_corrective", tier: "C" });
  });

  it("gives every seeded exercise complete taxonomy metadata", () => {
    for (const candidate of exerciseLibrary) {
      expect(candidate.role).toBeTruthy();
      expect(candidate.roles.length).toBeGreaterThan(0);
      expect(candidate.roles).toContain(candidate.role);
      expect(candidate.family).toBeTruthy();
      expect(["A", "B", "C"]).toContain(candidate.tier);
      expect(["low", "moderate", "high"]).toContain(candidate.fatigueCost);
      expect(["low", "moderate", "high"]).toContain(candidate.jointStress);
      expect(candidate.suitability.length).toBeGreaterThan(0);
    }
  });

  it("prioritises same-family swaps before broader same-muscle alternatives", () => {
    const suggestions = getExerciseSwapSuggestions(exercise("ex-bench-press"), exerciseLibrary, { limit: 14 });
    const firstChestIsolationIndex = suggestions.findIndex((candidate) => candidate.family === "chest_isolation");

    expect(suggestions[0]?.family).toBe("horizontal_press");
    expect(suggestions[0]?.role).toBe("primary_compound");
    expect(suggestions.slice(0, 4).every((candidate) => candidate.family === "horizontal_press")).toBe(true);
    if (firstChestIsolationIndex !== -1) {
      expect(suggestions.findIndex((candidate) => candidate.family === "horizontal_press")).toBeLessThan(firstChestIsolationIndex);
    }
  });

  it("keeps stable Tier A primary exercises when requested", () => {
    const programme = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      stablePrimaryExerciseIds: ["ex-bench-press"],
      recentExerciseIds: ["ex-bench-press"],
      variant: 9,
    });
    const first = selectedExercises(programme)[0];

    expect(first?.id).toBe("ex-bench-press");
    expect(first?.tier).toBe("A");
  });

  it("rotates Tier C accessories more readily than primary anchors", () => {
    const programme = generatePushWorkout({
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      recentExerciseIds: ["ex-cable-lateral-raise"],
      variant: 3,
    });
    const selected = selectedExercises(programme);
    const shoulderIsolation = selected.find((candidate) => candidate.family === "shoulder_isolation");

    expect(shoulderIsolation?.id).not.toBe("ex-cable-lateral-raise");
    expect(shoulderIsolation?.tier).toBe("C");
  });

  it("generates valid non-duplicate workouts for every supported block and workout type", () => {
    for (const blockType of blockTypes) {
      for (const workoutType of workoutTypes) {
        const programme = generateWorkoutByFocus(workoutType, {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock(blockType),
          variant: 2,
        });
        const ids = programme.days[0]!.exerciseSlots.map((slot) => slot.exerciseId);

        expect(ids.length).toBeGreaterThanOrEqual(3);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it("uses power movements in power blocks", () => {
    const programme = generateWorkoutByFocus("full_body", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("power"),
    });
    const selected = selectedExercises(programme);

    expect(selected.filter((candidate) => candidate.role === "power").length).toBeGreaterThanOrEqual(2);
  });

  it("keeps rear-delt corrective work out of normal push slots", () => {
    for (const blockType of blockTypes) {
      for (let variant = 0; variant < 10; variant += 1) {
        const programme = generateWorkoutByFocus("push", {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock(blockType),
          variant,
        });
        const selected = selectedExercises(programme);

        expect(selected.some((candidate) => candidate.family === "rear_delt_corrective")).toBe(false);
      }
    }
  });

  it("includes vertical and horizontal pulling in pull sessions when the library supports it", () => {
    for (const blockType of blockTypes) {
      for (let variant = 0; variant < 10; variant += 1) {
        const programme = generateWorkoutByFocus("pull", {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock(blockType),
          variant,
        });
        const selected = selectedExercises(programme);

        expect(selected.some((candidate) => candidate.movementPattern === "vertical_pull")).toBe(true);
        expect(selected.some((candidate) => candidate.movementPattern === "horizontal_pull")).toBe(true);
      }
    }
  });

  it("keeps arms sessions mostly direct biceps and triceps work", () => {
    for (const blockType of blockTypes) {
      for (let variant = 0; variant < 10; variant += 1) {
        const programme = generateWorkoutByFocus("arms", {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock(blockType),
          variant,
        });
        const selected = selectedExercises(programme);
        const directArmWork = selected.filter(
          (candidate) =>
            candidate.category === "biceps" ||
            candidate.category === "triceps" ||
            candidate.primaryMuscles.includes("biceps") ||
            candidate.primaryMuscles.includes("triceps"),
        );

        expect(directArmWork.length).toBeGreaterThanOrEqual(Math.ceil(selected.length * 0.6));
      }
    }
  });

  it("starts every power workout with a power-role exercise", () => {
    for (const workoutType of workoutTypes) {
      for (let variant = 0; variant < 10; variant += 1) {
        const programme = generateWorkoutByFocus(workoutType, {
          exercises: exerciseLibrary,
          currentBlock: createTrainingBlock("power"),
          variant,
        });
        const selected = selectedExercises(programme);

        expect(selected[0]?.role).toBe("power");
      }
    }
  });

  it("starts pull workouts with a real pull and avoids exact exercise duplicates", () => {
    const programme = generateWorkoutByFocus("pull", {
      exercises: exerciseLibrary,
      currentBlock: createTrainingBlock("hypertrophy"),
      variant: 4,
    });
    const selected = selectedExercises(programme);
    const ids = selected.map((candidate) => candidate.id);

    expect(["horizontal_pull", "vertical_pull"]).toContain(selected[0]?.movementPattern);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not stack redundant squat-pattern compounds in legs or lower sessions", () => {
    for (const workoutType of ["legs", "lower"] as const) {
      for (const blockType of blockTypes) {
        for (let variant = 0; variant < 10; variant += 1) {
          const programme = generateWorkoutByFocus(workoutType, {
            exercises: exerciseLibrary,
            currentBlock: createTrainingBlock(blockType),
            variant,
          });
          const selected = selectedExercises(programme);
          const squatCompounds = selected.filter((candidate) => candidate.family === "squat_pattern" && candidate.tier !== "C");

          expect(squatCompounds.length).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("excludes advanced new variants from beginner generation", () => {
    for (const workoutType of ["push", "legs", "lower", "full_body"] as const) {
      const selected = selectedExercises(generateWorkoutByFocus(workoutType, {
        exercises: exerciseLibrary,
        currentBlock: createTrainingBlock("hypertrophy"),
        experienceLevel: "beginner",
        variant: 3,
      }));
      const ids = selected.map((candidate) => candidate.id);

      expect(ids).not.toContain("ex-cambered-bar-squat");
      expect(ids).not.toContain("ex-zercher-squat");
      expect(ids).not.toContain("ex-board-press");
      expect(ids).not.toContain("ex-rack-pull");
      expect(ids).not.toContain("ex-deficit-deadlift");
      expect(ids).not.toContain("ex-power-clean");
      expect(ids).not.toContain("ex-hang-power-clean");
      expect(ids).not.toContain("ex-power-snatch");
      expect(ids).not.toContain("ex-depth-jump");
      expect(ids).not.toContain("ex-slingshot-bench-press");
      expect(ids).not.toContain("ex-bench-press-chains");
      expect(ids).not.toContain("ex-deadlift-bands");
    }
  });

  it("equipment filtering excludes new variants when their equipment is unavailable", () => {
    const dumbbellPush = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      availableEquipment: ["dumbbell"],
      currentBlock: createTrainingBlock("hypertrophy"),
      variant: 4,
    });
    const machinePush = generateWorkoutByFocus("push", {
      exercises: exerciseLibrary,
      availableEquipment: ["machine"],
      currentBlock: createTrainingBlock("hypertrophy"),
      variant: 4,
    });

    expect(selectedExercises(dumbbellPush).map((candidate) => candidate.id)).not.toContain("ex-floor-press");
    expect(selectedExercises(dumbbellPush).map((candidate) => candidate.id)).not.toContain("ex-plate-loaded-shoulder-press-machine");
    expect(selectedExercises(dumbbellPush).map((candidate) => candidate.id)).not.toContain("ex-bench-press-bands");
    expect(selectedExercises(machinePush).every((candidate) => candidate.equipment.includes("machine"))).toBe(true);
  });
});
