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
    expect(result.directSetTargets).toEqual({ chest: { min: 6, max: 16 }, back: { min: 6, max: 16 }, quads: { min: 6, max: 16 }, hamstrings: { min: 6, max: 16 }, glutes: { min: 6, max: 16 }, shoulders: { min: 4, max: 14 }, triceps: { min: 4, max: 14 }, biceps: { min: 4, max: 14 }, calves: { min: 4, max: 14 }, abs: { min: 2, max: 6 } });
    expect(result.directSets).toEqual({ chest: 10, shoulders: 5, triceps: 4, quads: 8.5, glutes: 6.5, hamstrings: 6, calves: 4, back: 9, biceps: 4, abs: 2 });
    expect(result.indirectContributions).toEqual({ convention: "not_quantified_without_explicit_policy", sets: {} });
    expect(result.primaryLiftExposures).toEqual({ bench: 1, squat: 1, deadlift: 1 });
    expect(result.movementPatternExposures).toEqual({ horizontal_push: 3, vertical_push: 1, isolation: 9, squat: 3, hinge: 1, horizontal_pull: 2, vertical_pull: 1, hip_thrust: 1, core: 1 });
    expect(result.sessionWorkingSets).toEqual([12, 11, 12, 12, 12]);
    expect(result.totalWorkingSets).toBe(59);
    expect(result.estimatedSessionMinutes).toEqual([44, 41, 44, 44, 44]);
    expect(result.fatigue).toEqual({ perSession: [26, 22, 23, 18, 18], weeklyUnits: 107, overlapFlags: [] });
  });

  it("allocates less work to a beginner while retaining every authorised contribution", () => {
    const beginner = allocate("beginner");
    const intermediate = allocate("intermediate");

    expect(beginner.certification.status).toBe("passed");
    expect(beginner.totalWorkingSets).toBe(49);
    expect(beginner.sessionWorkingSets).toEqual([9, 9, 10, 10, 11]);
    expect(beginner.totalWorkingSets).toBeLessThan(intermediate.totalWorkingSets);
    expect(beginner.directSets).toEqual({ chest: 7, shoulders: 4, triceps: 4, quads: 6, glutes: 5.5, hamstrings: 5.5, calves: 4, back: 7, biceps: 4, abs: 2 });
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
      expect(result.status, `${macrocycleGoal}/${daysPerWeek}`).toBe("constructed");
      if (result.status === "constructed") expect(result.carrier.plannedSessions).toHaveLength(daysPerWeek);
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
