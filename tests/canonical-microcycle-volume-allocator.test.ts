import { describe, expect, it } from "vitest";
import { constructCanonicalActivePlanFromCanonicalInputs } from "@/application/training/canonical-active-plan-construction";
import { allocateCanonicalMicrocycleVolume, canonicalMicrocycleVolumePolicy } from "@/domain/training/canonical-microcycle-volume-allocator";
import type { ExperienceLevel } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";

const roles = ["Bench and hypertrophy", "Squat and hypertrophy", "Deadlift and back", "Upper support", "Lower support"] as const;
const fullEquipment = ["barbell", "dumbbell", "machine", "cable", "bodyweight", "bands"] as const;

function allocate(experience: ExperienceLevel) {
  return allocateCanonicalMicrocycleVolume({
    macrocycleGoal: "build_muscle_and_strength",
    mesocycleId: "powerbuilding_foundation",
    mesocyclePurpose: "Establish repeatable squat, bench and deadlift",
    microcyclePriority: "Main lifts plus muscle development",
    microcycleSequence: 1,
    experience,
    frequency: 5,
    split: "let_app_choose",
    equipment: fullEquipment,
    recoveryRestricted: false,
    establishedLoadExerciseIds: [],
    sessionRoles: roles,
  });
}

describe("canonical microcycle volume allocator", () => {
  it("allocates and certifies the complete intermediate powerbuilding week", () => {
    const result = allocate("intermediate");

    expect(result.profile).toBe("powerbuilding_five_day_v1");
    expect(result.policyId).toBe(canonicalMicrocycleVolumePolicy.policyId);
    expect(result.certification.failures).toEqual([]);
    expect(result.certification.status).toBe("passed");
    expect(result.directSetTargets).toEqual({ chest: { min: 6, max: 16 }, lats: { min: 3, max: 13 }, upper_back: { min: 5, max: 15 }, lateral_delts: { min: 3, max: 9 }, rear_delts: { min: 2, max: 8 }, triceps: { min: 4, max: 14 }, biceps: { min: 4, max: 14 }, quadriceps: { min: 6, max: 16 }, hamstrings_knee_flexion: { min: 4, max: 14 }, hip_extension: { min: 5, max: 15 }, calves: { min: 4, max: 14 }, core: { min: 2, max: 8 } });
    expect(result.directSets).toEqual({ chest: 10, lateral_delts: 4, triceps: 4, quadriceps: 10, hamstrings_knee_flexion: 4, calves: 4, hip_extension: 6, upper_back: 6, lats: 3, biceps: 4, rear_delts: 2, core: 2 });
    expect(result.indirectContributions).toEqual({ convention: "certified_from_selected_exercise_metadata", sets: {} });
    expect(result.primaryLiftExposures).toEqual({ bench: { primary: 1, secondaryVariation: 1 }, squat: { primary: 1, secondaryVariation: 0 }, deadlift: { primary: 1, secondaryVariation: 0 } });
    expect(result.movementPatternExposures).toEqual({ horizontal_push: 3, isolation: 11, squat: 3, lunge: 2, hinge: 1, horizontal_pull: 2, vertical_pull: 1, hip_thrust: 1, core: 1 });
    expect(result.sessionWorkingSets).toEqual([11, 11, 11, 14, 12]);
    expect(result.totalWorkingSets).toBe(59);
    expect(result.estimatedSessionMinutes).toEqual([39, 42, 41, 42, 39]);
    expect(result.durationEstimates.every((estimate) => estimate.assumptions.includes("lift_specific_ramps_included"))).toBe(true);
    expect(result.fatigue).toEqual({ perSession: [22, 22, 23, 20, 18], weeklyUnits: 105, overlapFlags: [] });
  });

  it("allocates less work to a beginner while retaining every authorised contribution", () => {
    const beginner = allocate("beginner");
    const intermediate = allocate("intermediate");

    expect(beginner.certification.status).toBe("passed");
    expect(beginner.totalWorkingSets).toBe(50);
    expect(beginner.sessionWorkingSets).toEqual([9, 9, 9, 12, 11]);
    expect(beginner.totalWorkingSets).toBeLessThan(intermediate.totalWorkingSets);
    expect(beginner.directSets).toEqual({ chest: 7, lateral_delts: 4, triceps: 4, quadriceps: 7, hamstrings_knee_flexion: 4, calves: 4, hip_extension: 5, upper_back: 4, lats: 3, biceps: 4, rear_delts: 2, core: 2 });
  });

  it("is deterministic for deep-equivalent inputs", () => {
    expect(allocate("intermediate")).toEqual(allocate("intermediate"));
  });

  it.each([2, 3, 4, 5, 6] as const)("constructs supported %s-day configurations for hypertrophy, strength and powerbuilding", (daysPerWeek) => {
    for (const macrocycleGoal of ["build_muscle", "build_strength", "build_muscle_and_strength"] as const) {
      const result = constructCanonicalActivePlanFromCanonicalInputs({
        planId: `allocation-matrix-${macrocycleGoal}-${daysPerWeek}`,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        goal: "strength_hypertrophy",
        macrocycleGoal,
        experienceLevel: "intermediate",
        daysPerWeek,
        preferredSplit: "let_app_choose",
        equipment: fullEquipment,
        units: "kg",
        exercises: exerciseLibrary,
        history: [],
      });
      expect(result.status, result.status === "constructed" ? `${macrocycleGoal}/${daysPerWeek}` : `${macrocycleGoal}/${daysPerWeek}:${result.reason}`).toBe("constructed");
      if (result.status === "constructed") expect(result.carrier.plannedSessions).toHaveLength(daysPerWeek);
    }
  });

  it.each([
    ["build_muscle", "beginner", 3, "full_body"],
    ["build_muscle", "intermediate", 3, "push_pull_legs"],
    ["build_muscle", "intermediate", 4, "upper_lower"],
    ["build_strength", "advanced", 4, "upper_lower"],
    ["build_muscle_and_strength", "beginner", 5, "let_app_choose"],
    ["build_muscle_and_strength", "advanced", 5, "let_app_choose"],
    ["athletic_performance", "intermediate", 2, "full_body"],
    ["athletic_performance", "intermediate", 6, "push_pull_legs"],
    ["get_leaner", "intermediate", 3, "full_body"],
    ["get_leaner", "intermediate", 5, "push_pull_legs"],
  ] as const)("retains goal/frequency/split-specific construction for %s %s %s-day %s", (macrocycleGoal, experienceLevel, daysPerWeek, preferredSplit) => {
    const result = constructCanonicalActivePlanFromCanonicalInputs({
      planId: `quality-matrix-${macrocycleGoal}-${experienceLevel}-${daysPerWeek}-${preferredSplit}`,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      goal: macrocycleGoal === "get_leaner" ? "body_recomposition" : macrocycleGoal === "build_muscle" ? "hypertrophy" : "strength_hypertrophy",
      macrocycleGoal,
      experienceLevel,
      daysPerWeek,
      preferredSplit,
      equipment: fullEquipment,
      units: "kg",
      exercises: exerciseLibrary,
      history: [],
    });
    expect(result.status, result.status === "constructed" ? undefined : result.reason).toBe("constructed");
    if (result.status === "constructed") {
      expect(result.carrier.plannedSessions).toHaveLength(daysPerWeek);
      expect(result.carrier.microcycle.output.requestedSplit).toBe(preferredSplit);
      expect(result.carrier.microcycle.output.split).not.toBe("let_app_choose");
      expect(result.carrier.constraints.experienceLevel).toBe(experienceLevel);
    }
  });

  it("constructs the strict week with constrained equipment and fails closed for an unresolved library", () => {
    const constrained = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "allocation-constrained",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      goal: "strength_hypertrophy",
      macrocycleGoal: "build_muscle_and_strength",
      experienceLevel: "intermediate",
      daysPerWeek: 5,
      preferredSplit: "let_app_choose",
      equipment: ["barbell", "dumbbell", "bodyweight", "bands"],
      units: "kg",
      exercises: exerciseLibrary,
      history: [],
    });
    expect(constrained.status).toBe("constructed");

    const unresolved = constructCanonicalActivePlanFromCanonicalInputs({
      planId: "allocation-unresolved",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      goal: "strength_hypertrophy",
      macrocycleGoal: "build_muscle_and_strength",
      experienceLevel: "intermediate",
      daysPerWeek: 5,
      preferredSplit: "let_app_choose",
      equipment: fullEquipment,
      units: "kg",
      exercises: [exerciseLibrary.find((exercise) => exercise.id === "ex-bench-press")!],
      history: [],
    });
    expect(unresolved).toEqual({ status: "carrier_validation_failed", reason: "session_0:no_suitable_exercise" });
  });
});
