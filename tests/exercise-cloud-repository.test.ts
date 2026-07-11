import { describe, expect, it } from "vitest";
import { buildExerciseUpsertPayload, mapExerciseRowToExercise } from "@/data/cloud/exercise-cloud-repository";
import { exerciseLibrary } from "@/domain/training/presets";

describe("Exercise cloud repository mapping", () => {
  it("round-trips expanded exercise metadata", () => {
    const exercise = exerciseLibrary.find((candidate) => candidate.id === "ex-machine-chest-press")!;
    const payload = buildExerciseUpsertPayload("user-1", exercise);
    const mapped = mapExerciseRowToExercise({
      ...payload,
      created_at: "2026-06-02T00:00:00.000Z",
      updated_at: "2026-06-02T00:00:00.000Z",
    });

    expect(payload).toMatchObject({
      exercise_kind: exercise.kind,
      category: exercise.category,
      primary_muscles: exercise.primaryMuscles,
      secondary_muscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      movement_pattern: exercise.movementPattern,
      default_rep_range_min: exercise.defaultRepRange.min,
      default_rep_range_max: exercise.defaultRepRange.max,
      default_load_jump: exercise.defaultLoadJump,
      exercise_role: exercise.role,
      exercise_roles: exercise.roles,
      exercise_family: exercise.family,
      exercise_tier: exercise.tier,
      fatigue_cost: exercise.fatigueCost,
      joint_stress: exercise.jointStress,
      suitability: exercise.suitability,
      suitable_blocks: exercise.suitableBlocks,
      swap_tags: exercise.swapTags,
    });
    expect(mapped).toMatchObject({
      id: exercise.id,
      kind: exercise.kind,
      category: exercise.category,
      primaryMuscles: exercise.primaryMuscles,
      secondaryMuscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      movementPattern: exercise.movementPattern,
      defaultRepRange: exercise.defaultRepRange,
      defaultLoadJump: exercise.defaultLoadJump,
      role: exercise.role,
      roles: exercise.roles,
      family: exercise.family,
      tier: exercise.tier,
      fatigueCost: exercise.fatigueCost,
      jointStress: exercise.jointStress,
      suitability: exercise.suitability,
      suitableBlocks: exercise.suitableBlocks,
      swapTags: exercise.swapTags,
    });
  });

  it("loads old cloud records with safe metadata defaults", () => {
    const mapped = mapExerciseRowToExercise({
      id: "old-row",
      name: "Old Cloud Curl",
      category: "biceps",
      primary_muscles: ["biceps"],
      secondary_muscles: [],
      equipment: ["dumbbell"],
      movement_pattern: "isolation",
      default_rep_range: { min: 10, max: 15 },
      default_load_jump: 2.5,
      unit_compatibility: ["kg", "lb"],
      kind: "dumbbell",
      is_beginner_friendly: true,
      is_advanced: false,
      notes: [],
      created_by_user_id: "user-1",
      is_custom: true,
      default_settings: {
        repRange: { min: 10, max: 15 },
        dropOffPercent: 15,
        loadIncrease: 2.5,
        unit: "kg",
        requiredWorkSets: 3,
      },
    });

    expect(mapped.defaultRepRange).toEqual({ min: 10, max: 15 });
    expect(mapped.kind).toBe("dumbbell");
    expect(mapped.role).toBe("isolation");
    expect(mapped.family).toBe("biceps_isolation");
    expect(mapped.tier).toBe("C");
    expect(mapped.fatigueCost).toBe("low");
    expect(mapped.jointStress).toBe("low");
    expect(mapped.suitability).toEqual(["beginner", "intermediate", "advanced"]);
    expect(mapped.suitableBlocks).toContain("hypertrophy");
    expect(mapped.swapTags).toEqual(["biceps", "isolation", "dumbbell", "isolation", "biceps_isolation", "C", "dumbbell"]);
  });
});
