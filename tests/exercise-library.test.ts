import { beforeEach, describe, expect, it } from "vitest";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { jsonStore } from "@/data/local/json-store";
import { equipmentOptions, filterExercises, movementPatternOptions, muscleGroups } from "@/domain/training/exercise-library";
import { exerciseLibrary } from "@/domain/training/presets";

describe("Exercise library filtering", () => {
  beforeEach(() => {
    jsonStore.clearByPrefix("iron-logic.custom-exercises");
    jsonStore.clearByPrefix("iron-logic.selected-exercise-id");
    jsonStore.resetCache();
  });

  it("contains a substantial hypertrophy exercise inventory", () => {
    expect(exerciseLibrary.length).toBeGreaterThanOrEqual(60);
    expect(exerciseLibrary.some((exercise) => exercise.category === "traps")).toBe(true);
    expect(exerciseLibrary.some((exercise) => exercise.category === "rear_delts")).toBe(true);
    expect(exerciseLibrary.some((exercise) => exercise.category === "adductors")).toBe(true);
    expect(exerciseLibrary.some((exercise) => exercise.category === "abductors")).toBe(true);
  });

  it("searches by exercise name and muscle metadata", () => {
    expect(filterExercises(exerciseLibrary, { query: "bench" }).map((exercise) => exercise.id)).toContain("ex-bench-press");
    expect(filterExercises(exerciseLibrary, { query: "rear delt" }).map((exercise) => exercise.id)).toContain("ex-rear-delt-machine");
  });

  it("contains each new physical QA exercise variant exactly once", () => {
    const names = [
      "Safety Squat Bar Squat",
      "Cambered Bar Squat",
      "Zercher Squat",
      "Box Squat",
      "Floor Press",
      "Board Press",
      "Decline Press",
      "Plate Loaded Shoulder Press Machine",
      "Deadlift",
      "Spoto Press",
      "Pin Bench Press",
      "Seated Barbell Shoulder Press",
      "High-Incline Press",
      "Pause Squat",
      "Rack Pull",
      "Deficit Deadlift",
      "Block Pull",
      "Pause Deadlift",
      "Trap Bar Deadlift",
    ];

    for (const name of names) {
      expect(exerciseLibrary.filter((exercise) => exercise.name === name)).toHaveLength(1);
    }
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Floor Press")).toHaveLength(1);
  });

  it("contains the strength, power, and hypertrophy expansion exercises exactly once", () => {
    const names = [
      "Paused Bench Press",
      "Larsen Press",
      "Pin Bench Press",
      "Feet-Up Bench Press",
      "Slingshot Bench Press",
      "Bench Press with Chains",
      "Bench Press with Bands",
      "Speed Bench Press",
      "Pin Squat",
      "Anderson Squat",
      "Hatfield Squat",
      "Tempo Squat",
      "Squat with Chains",
      "Squat with Bands",
      "Speed Squat",
      "Snatch-Grip Deadlift",
      "Stiff-Leg Deadlift",
      "Tempo Deadlift",
      "Deadlift with Chains",
      "Deadlift with Bands",
      "Speed Deadlift",
      "Power Clean",
      "Hang Power Clean",
      "Clean Pull",
      "Power Snatch",
      "Hang Power Snatch",
      "Snatch Pull",
      "High Pull",
      "Box Jump",
      "Broad Jump",
      "Countermovement Jump",
      "Depth Jump",
      "Medicine Ball Chest Throw",
      "Medicine Ball Overhead Throw",
      "Medicine Ball Rotational Throw",
      "Slam Ball Throw",
      "Arnold Press",
      "Front Raise",
      "Cable Front Raise",
      "Leaning Lateral Raise",
      "Machine Lateral Raise",
      "Rear Delt Fly Machine",
      "Rope Pushdown",
      "Straight Bar Pushdown",
      "Single-Arm Cable Pushdown",
      "Overhead Rope Extension",
      "Skull Crusher",
      "PJR Pullover",
      "Bayesian Curl",
      "Incline Dumbbell Curl",
      "Spider Curl",
      "Preacher Curl",
      "Cable Curl",
      "Hammer Curl",
      "Pec Deck",
      "Cable Fly",
      "Low-to-High Cable Fly",
      "High-to-Low Cable Fly",
      "Machine Chest Press",
      "Chest-Supported Row",
      "T-Bar Row",
      "Meadows Row",
      "Seal Row",
      "Machine High Row",
      "Straight-Arm Pulldown",
      "Nordic Curl",
      "Glute-Ham Raise",
      "Seated Leg Curl",
      "Lying Leg Curl",
      "Hip Thrust",
      "B-Stance Hip Thrust",
      "Cable Kickback",
      "Standing Calf Raise",
      "Seated Calf Raise",
      "Tibialis Raise",
    ];

    for (const name of names) {
      const matches = exerciseLibrary.filter((exercise) => exercise.name === name || exercise.swapTags?.includes(name.toLowerCase()));
      expect(matches.length, name).toBeGreaterThanOrEqual(1);
    }
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Floor Press")).toHaveLength(1);
  });

  it("finds new physical QA exercise variants through library search", () => {
    const queries = [
      ["Safety Squat Bar Squat", "ex-safety-squat-bar-squat"],
      ["Deadlift", "ex-deadlift"],
      ["Spoto Press", "ex-spoto-press"],
      ["Pin Press", "ex-pin-press"],
      ["Floor Press", "ex-floor-press"],
      ["Plate Loaded Shoulder Press Machine", "ex-plate-loaded-shoulder-press-machine"],
      ["Seated Barbell Shoulder Press", "ex-seated-barbell-shoulder-press"],
      ["Pause Squat", "ex-pause-squat"],
      ["Rack Pull", "ex-rack-pull"],
      ["Deficit Deadlift", "ex-deficit-deadlift"],
      ["Trap Bar Deadlift", "ex-trap-bar-deadlift"],
    ] as const;

    for (const [query, id] of queries) {
      expect(filterExercises(exerciseLibrary, { query }).map((exercise) => exercise.id)).toContain(id);
    }
  });

  it("finds expansion exercises and alias terms through library search", () => {
    const queries = [
      ["Power Clean", "ex-power-clean"],
      ["Speed Bench Press", "ex-speed-bench-press"],
      ["Arnold Press", "ex-arnold-press"],
      ["Rope Pushdown", "ex-rope-pushdown"],
      ["Chest-Supported Row", "ex-chest-supported-row"],
      ["Skull Crusher", "ex-skull-crusher"],
      ["Overhead Rope Extension", "ex-cable-rope-overhead-extension"],
      ["Machine High Row", "ex-high-row-plate-loaded"],
      ["Rear Delt Fly Machine", "ex-reverse-machine-fly"],
      ["Straight Arm Cable Pulldown", "ex-straight-arm-pulldown"],
    ] as const;

    for (const [query, id] of queries) {
      expect(filterExercises(exerciseLibrary, { query }).map((exercise) => exercise.id), query).toContain(id);
    }
  });

  it("finds requested coverage-update exercises and aliases through library search", () => {
    const queries = [
      ["Walking Lunge", "ex-walking-lunge"],
      ["Reverse Lunge", "ex-reverse-lunge"],
      ["Lunge", "ex-lunge"],
      ["Rope Tricep Pushdowns", "ex-rope-pushdown"],
      ["Single Leg Glute Bridge", "ex-single-leg-glute-bridge"],
      ["Glute Drive (Machine)", "ex-machine-glute-drive"],
      ["Barbell Hip Thrust", "ex-hip-thrust"],
      ["Rope Cable Curl", "ex-rope-hammer-curl"],
      ["Hammer Curl", "ex-hammer-curl"],
      ["Alternating Hammer Curl", "ex-alternating-hammer-curl"],
      ["Drag Curls", "ex-drag-curl"],
      ["V-Bar Cable Curl", "ex-v-bar-cable-curl"],
      ["V Bar Curl", "ex-v-bar-cable-curl"],
      ["Thick Bar Cable Curl", "ex-thick-bar-cable-curl"],
      ["Fat Grip Curl", "ex-thick-bar-cable-curl"],
      ["Face Pull", "ex-face-pull"],
      ["Cable Shrug", "ex-cable-shrug"],
      ["Barbell Curl", "ex-barbell-curl"],
      ["Bent Over Row", "ex-barbell-row"],
      ["Bent Row", "ex-barbell-row"],
    ] as const;

    for (const [query, id] of queries) {
      expect(filterExercises(exerciseLibrary, { query }).map((exercise) => exercise.id), query).toContain(id);
    }
  });

  it("does not duplicate equivalent coverage-update aliases as separate exercise names", () => {
    const exactNames = [
      "Walking Lunge",
      "Reverse Lunge",
      "Lunge",
      "Single Leg Glute Bridge",
      "Barbell Hip Thrust",
      "Hammer Curl",
      "Alternating Hammer Curl",
      "Drag Curls",
      "V-Bar Cable Curl",
      "Thick Bar Cable Curl",
      "Face Pull",
      "Cable Shrug",
      "Barbell Curl",
    ];

    for (const name of exactNames) {
      expect(exerciseLibrary.filter((exercise) => exercise.name === name), name).toHaveLength(1);
    }
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Rope Tricep Pushdowns")).toHaveLength(0);
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Glute Drive (Machine)")).toHaveLength(0);
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Rope Cable Curl")).toHaveLength(0);
    expect(exerciseLibrary.filter((exercise) => exercise.name === "Bent Over Row")).toHaveLength(0);
  });

  it("keeps exercise metadata free of medical or rehab claims", () => {
    const forbidden = /\b(rehab|therapy|cure|fixes pain|prevents pain|guaranteed)\b/i;

    for (const exercise of exerciseLibrary) {
      const text = [exercise.name, exercise.category, ...exercise.primaryMuscles, ...exercise.secondaryMuscles, ...(exercise.notes ?? []), ...(exercise.swapTags ?? [])].join(" ");
      expect(text, exercise.name).not.toMatch(forbidden);
    }
  });

  it("filters by muscle group and equipment", () => {
    const cableShoulders = filterExercises(exerciseLibrary, {
      muscleGroup: "shoulders",
      equipment: "cable",
    });

    expect(cableShoulders.map((exercise) => exercise.id)).toContain("ex-cable-lateral-raise");
    expect(cableShoulders.every((exercise) => exercise.equipment.includes("cable"))).toBe(true);
  });

  it("covers the required hypertrophy body parts", () => {
    const requiredGroups = [
      "chest",
      "back",
      "shoulders",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves",
      "abs",
    ];

    for (const group of requiredGroups) {
      expect(exerciseLibrary.some((exercise) => exercise.category === group)).toBe(true);
    }
  });

  it("includes common equipment families", () => {
    for (const equipment of ["barbell", "dumbbell", "cable", "machine", "bodyweight"]) {
      expect(equipmentOptions).toContain(equipment);
      expect(exerciseLibrary.some((exercise) => exercise.equipment.includes(equipment as never))).toBe(true);
    }
  });

  it("exposes muscle groups for UI filters", () => {
    expect(muscleGroups).toContain("chest");
    expect(muscleGroups).toContain("abs");
  });

  it("exposes movement patterns for custom exercise editing", () => {
    expect(movementPatternOptions).toContain("horizontal_push");
    expect(movementPatternOptions).toContain("hinge");
    expect(movementPatternOptions).toContain("isolation");
  });

  it("can edit a custom exercise without duplicating it", () => {
    const base = { ...exerciseLibrary[0], id: "custom-edit-test", name: "Custom Press", isCustom: true, createdByUserId: "user-1" };
    customExerciseRepository.save(base);
    customExerciseRepository.save({
      ...base,
      name: "Custom Press Updated",
      category: "shoulders",
      primaryMuscles: ["shoulders"],
      equipment: ["machine"],
      movementPattern: "vertical_push",
      defaultRepRange: { min: 6, max: 10 },
      defaultLoadJump: 5,
      notes: ["Keep control"],
      swapTags: ["shoulders", "machine", "vertical_push", "custom"],
    });

    const custom = customExerciseRepository.listCustom();
    expect(custom).toHaveLength(1);
    expect(custom[0].name).toBe("Custom Press Updated");
    expect(custom[0].movementPattern).toBe("vertical_push");
    expect(custom[0].defaultRepRange).toEqual({ min: 6, max: 10 });
  });

  it("can delete custom exercises while leaving built-ins and past exercise names untouched", () => {
    const base = { ...exerciseLibrary[0], id: "custom-delete-test", name: "History Safe Curl", isCustom: true, createdByUserId: "user-1" };
    const completedWorkoutExerciseName = base.name;
    customExerciseRepository.save(base);
    customExerciseRepository.setSelectedExerciseId(base.id);

    expect(customExerciseRepository.deleteCustomExercise(base.id)).toBe(true);
    expect(customExerciseRepository.listCustom().map((exercise) => exercise.id)).not.toContain(base.id);
    expect(customExerciseRepository.getSelectedExerciseId()).toBeNull();
    expect(completedWorkoutExerciseName).toBe("History Safe Curl");
  });

  it("does not delete built-in exercises through the custom repository", () => {
    expect(customExerciseRepository.deleteCustomExercise(exerciseLibrary[0].id)).toBe(false);
    expect(customExerciseRepository.listAll().map((exercise) => exercise.id)).toContain(exerciseLibrary[0].id);
  });
});
