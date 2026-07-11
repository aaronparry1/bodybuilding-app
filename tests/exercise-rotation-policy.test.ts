import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { selectExerciseRotation, type ExerciseRotationCandidate, type ExerciseRotationPolicyInput } from "@/domain/training/exercise-rotation-policy";

const bench: ExerciseRotationCandidate = candidate("bench", "Flat Barbell Bench Press", {
  movement_pattern: "horizontal_push",
  primary_muscles: ["chest"],
  secondary_muscles: ["triceps", "shoulders"],
  equipment_required: ["barbell"],
  variation_family: "bench_press",
  loadability: "high",
  measurability: "high",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "competition_lift", "horizontal_press", "chest", "triceps"],
  force_direction: "horizontal",
  strength_quality: "max_strength",
});

const pausedBench = candidate("paused-bench", "Paused Bench Press", {
  movement_pattern: "horizontal_push",
  primary_muscles: ["chest"],
  secondary_muscles: ["triceps", "shoulders"],
  equipment_required: ["barbell"],
  variation_family: "bench_press",
  range_of_motion_profile: "paused",
  loadability: "high",
  measurability: "high",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "horizontal_press", "bottom_range", "chest", "triceps"],
  force_direction: "horizontal",
  strength_quality: "max_strength",
});

const closeGripBench = candidate("close-grip-bench", "Close-Grip Bench Press", {
  movement_pattern: "horizontal_push",
  primary_muscles: ["triceps", "chest"],
  secondary_muscles: ["shoulders"],
  equipment_required: ["barbell"],
  variation_family: "bench_press",
  loadability: "high",
  measurability: "high",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "horizontal_press", "lockout", "triceps"],
  force_direction: "horizontal",
  strength_quality: "max_strength",
});

const neutralDbPress = candidate("neutral-db-press", "Neutral-Grip Dumbbell Press", {
  movement_pattern: "horizontal_push",
  primary_muscles: ["chest"],
  secondary_muscles: ["triceps", "shoulders"],
  equipment_required: ["dumbbell"],
  variation_family: "dumbbell_press",
  joint_stress_profile: "low",
  loadability: "moderate",
  measurability: "moderate",
  hypertrophy_bias: "high",
  strength_bias: "moderate",
  transfer_tags: ["horizontal_press", "chest", "shoulder_friendly"],
  force_direction: "horizontal",
  strength_quality: "hypertrophy",
});

const cableFly = candidate("cable-fly", "Cable Fly", {
  movement_pattern: "isolation",
  primary_muscles: ["chest"],
  secondary_muscles: [],
  equipment_required: ["cable"],
  variation_family: "chest_isolation",
  loadability: "low",
  measurability: "moderate",
  hypertrophy_bias: "high",
  strength_bias: "low",
  transfer_tags: ["isolation_accessory", "chest"],
});

const backSquat = candidate("back-squat", "Back Squat", {
  movement_pattern: "squat",
  primary_muscles: ["quads", "glutes"],
  secondary_muscles: ["hamstrings", "abs"],
  equipment_required: ["barbell"],
  variation_family: "squat",
  loadability: "high",
  measurability: "high",
  axial_loading: "high",
  fatigue_cost: "high",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "competition_lift", "squat", "quads", "glutes"],
  force_direction: "axial",
  strength_quality: "max_strength",
});

const frontSquat = candidate("front-squat", "Front Squat", {
  movement_pattern: "squat",
  primary_muscles: ["quads"],
  secondary_muscles: ["glutes", "abs"],
  equipment_required: ["barbell"],
  variation_family: "squat",
  loadability: "high",
  measurability: "high",
  axial_loading: "moderate",
  fatigue_cost: "moderate",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "squat", "quads", "upper_back"],
  force_direction: "axial",
  strength_quality: "max_strength",
});

const legExtension = candidate("leg-extension", "Leg Extension", {
  movement_pattern: "isolation",
  primary_muscles: ["quads"],
  secondary_muscles: [],
  equipment_required: ["machine"],
  variation_family: "quad_isolation",
  loadability: "low",
  measurability: "moderate",
  hypertrophy_bias: "high",
  strength_bias: "low",
  transfer_tags: ["isolation_accessory", "quads"],
});

const deadlift = candidate("deadlift", "Conventional Deadlift", {
  movement_pattern: "hinge",
  primary_muscles: ["hamstrings", "glutes"],
  secondary_muscles: ["back", "forearms"],
  equipment_required: ["barbell"],
  variation_family: "deadlift",
  loadability: "high",
  measurability: "high",
  axial_loading: "high",
  fatigue_cost: "high",
  strength_bias: "high",
  transfer_tags: ["primary_lift", "competition_lift", "hinge", "glutes", "hamstrings", "grip"],
  force_direction: "hip_extension",
  strength_quality: "max_strength",
});

const romanianDeadlift = candidate("rdl", "Romanian Deadlift", {
  movement_pattern: "hinge",
  primary_muscles: ["hamstrings", "glutes"],
  secondary_muscles: ["back"],
  equipment_required: ["barbell"],
  variation_family: "deadlift",
  loadability: "high",
  measurability: "high",
  axial_loading: "moderate",
  fatigue_cost: "moderate",
  hypertrophy_bias: "high",
  strength_bias: "moderate",
  transfer_tags: ["hinge", "hamstrings", "glutes", "fatigue_management"],
  force_direction: "hip_extension",
  strength_quality: "hypertrophy",
});

const hipThrust = candidate("hip-thrust", "Hip Thrust", {
  movement_pattern: "hip_thrust",
  primary_muscles: ["glutes"],
  secondary_muscles: ["hamstrings"],
  equipment_required: ["barbell"],
  variation_family: "hip_thrust",
  axial_loading: "low",
  fatigue_cost: "low",
  loadability: "moderate",
  measurability: "moderate",
  hypertrophy_bias: "high",
  strength_bias: "moderate",
  transfer_tags: ["glutes", "lower_fatigue"],
});

describe("exercise rotation policy", () => {
  it("does not rotate purely for novelty while adaptation is occurring", () => {
    const decision = selectExerciseRotation(baseInput({
      adaptationStatus: "adapting",
      adaptationConfidence: 84,
      currentExercise: bench,
      availableExerciseLibrary: [bench, pausedBench, closeGripBench],
    }));

    expect(decision.selected_replacement_exercise).toBeNull();
    expect(decision.reason_codes).toContain("no_rotation_needed");
  });

  it("prefers the smallest useful bench variation when flat bench is plateaued without pain", () => {
    const decision = selectExerciseRotation(baseInput({
      currentExercise: bench,
      availableExerciseLibrary: [bench, pausedBench, closeGripBench, neutralDbPress, cableFly],
      limitingFactorTags: ["bottom_range"],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("paused-bench");
    expect(decision.rotation_scope).toBe("exercise");
    expect(decision.reason_codes).toEqual(expect.arrayContaining([
      "movement_pattern_preserved",
      "training_intent_preserved",
      "smallest_meaningful_variation",
      "primary_lift_transfer_protected",
      "limiting_factor_addressed",
    ]));
    expect(decision.rejected_candidates.map((item) => item.exercise.id)).toContain("cable-fly");
  });

  it("chooses a safer pressing variation when shoulder pain is present", () => {
    const decision = selectExerciseRotation(baseInput({
      currentExercise: bench,
      painIssueFlag: "pain",
      userEquipment: ["barbell", "dumbbell", "machine"],
      availableExerciseLibrary: [bench, pausedBench, neutralDbPress],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("neutral-db-press");
    expect(decision.reason_codes).toContain("pain_safer_variation");
    expect(decision.recommended_loading_adjustment).toContain("pain-free");
  });

  it("protects primary squat transfer and rejects low-transfer accessories", () => {
    const decision = selectExerciseRotation(baseInput({
      currentExercise: backSquat,
      movementPattern: "squat",
      targetRegion: "quads",
      availableExerciseLibrary: [backSquat, frontSquat, legExtension],
      limitingFactorTags: ["quads"],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("front-squat");
    expect(decision.reason_codes).toContain("primary_lift_transfer_protected");
    expect(decision.rejected_candidates.find((item) => item.exercise.id === "leg-extension")?.reasons).toContain("Low-transfer accessory is not an appropriate replacement for a primary lift.");
  });

  it("selects a lower-fatigue hinge when deadlift is saturated and fatigue is high", () => {
    const decision = selectExerciseRotation(baseInput({
      currentExercise: deadlift,
      movementPattern: "hinge",
      targetRegion: "hamstrings",
      fatigueRecoveryStatus: "poor",
      availableExerciseLibrary: [deadlift, romanianDeadlift, hipThrust],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("rdl");
    expect(decision.reason_codes).toContain("lower_fatigue_selected");
    expect(decision.recommended_loading_adjustment).toContain("conservative");
  });

  it("avoids recently saturated or cooldown-blocked candidates", () => {
    const decision = selectExerciseRotation(baseInput({
      currentExercise: bench,
      availableExerciseLibrary: [bench, pausedBench, closeGripBench],
      exerciseHistory: [
        { exerciseId: "paused-bench", exposureCount: 6, saturatedRecently: true },
        { exerciseId: "close-grip-bench", exposureCount: 0, lastUsedSessionOffset: 6 },
      ],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("close-grip-bench");
    expect(decision.rejected_candidates.find((item) => item.exercise.id === "paused-bench")?.reasons).toContain("Candidate was recently saturated.");
  });

  it("respects equipment availability and user experience level", () => {
    const advancedBoardPress = candidate("board-press", "Board Press", {
      movement_pattern: "horizontal_push",
      primary_muscles: ["chest", "triceps"],
      secondary_muscles: ["shoulders"],
      equipment_required: ["barbell", "other"],
      variation_family: "bench_press",
      skill_level: "advanced",
      setup_complexity: "high",
      loadability: "high",
      measurability: "high",
      strength_bias: "high",
      transfer_tags: ["primary_lift", "lockout"],
    });

    const decision = selectExerciseRotation(baseInput({
      currentExercise: bench,
      userExperienceLevel: "beginner",
      userEquipment: ["barbell"],
      availableExerciseLibrary: [bench, advancedBoardPress, pausedBench],
    }));

    expect(decision.selected_replacement_exercise?.id).toBe("paused-bench");
    expect(decision.rejected_candidates.find((item) => item.exercise.id === "board-press")?.reasons).toEqual(expect.arrayContaining([
      "Required equipment is unavailable.",
      "Setup or skill demand is not appropriate for experience level.",
    ]));
  });

  it("is deterministic and does not use random swapping, network, storage, or async work", () => {
    const input = baseInput({ currentExercise: bench, availableExerciseLibrary: [bench, pausedBench, closeGripBench] });
    expect(selectExerciseRotation(input)).toEqual(selectExerciseRotation(input));

    const source = readFileSync("src/domain/training/exercise-rotation-policy.ts", "utf8");
    expect(source).not.toMatch(/Math\.random|shuffle|random/i);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|jsonStore|repository|supabase/i);
  });
});

function baseInput(overrides: Partial<ExerciseRotationPolicyInput> = {}): ExerciseRotationPolicyInput {
  return {
    currentExercise: bench,
    movementPattern: "horizontal_push",
    targetRegion: "chest",
    trainingState: "intensification",
    trainingMethod: "strength",
    interventionReasonCodes: ["exercise_age_high_with_flat_performance"],
    adaptationStatus: "saturated",
    adaptationConfidence: 78,
    exerciseExposureCount: 9,
    exerciseHistory: [],
    recentPerformanceTrend: "flat",
    fatigueRecoveryStatus: "normal",
    painIssueFlag: "none",
    userEquipment: ["barbell", "dumbbell", "machine", "cable"],
    userExperienceLevel: "intermediate",
    userPreferences: {},
    availableExerciseLibrary: [bench, pausedBench, closeGripBench],
    limitingFactorTags: [],
    ...overrides,
  };
}

function candidate(id: string, name: string, overrides: Partial<ExerciseRotationCandidate>): ExerciseRotationCandidate {
  return {
    id,
    name,
    movement_pattern: "horizontal_push",
    primary_muscles: ["chest"],
    secondary_muscles: ["triceps"],
    equipment_required: ["barbell"],
    skill_level: "beginner",
    setup_complexity: "moderate",
    loadability: "moderate",
    measurability: "moderate",
    joint_stress_profile: "moderate",
    range_of_motion_profile: "full",
    stability_demand: "moderate",
    axial_loading: "low",
    fatigue_cost: "moderate",
    hypertrophy_bias: "moderate",
    strength_bias: "moderate",
    power_bias: "low",
    transfer_tags: [],
    variation_family: "general",
    progression_compatibility: "moderate",
    force_direction: "unknown",
    strength_quality: "unknown",
    ...overrides,
  };
}
