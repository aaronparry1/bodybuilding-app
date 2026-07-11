import { describe, expect, it } from "vitest";
import {
  buildCapacityCardioSessionProgramme,
  buildCapacitySessionProgramme,
  buildExtraFullSessionProgramme,
  buildExtraVolumeSessionProgramme,
  buildPerformanceConditioningSessionProgramme,
  buildRecoveryCardioSessionProgramme,
  type ExtraFullSessionType,
  type ExtraVolumeSessionType,
} from "@/domain/training/extra-session-generator";
import { programmeRepository } from "@/data/local/programme-repository";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { exerciseLibrary } from "@/domain/training/presets";

describe("extra session generation", () => {
  it("creates full extra sessions without modifying the active plan", () => {
    const activePlan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-04T09:00:00.000Z",
    );
    const beforeBlocks = activePlan.blocks.map((block) => block.id);
    const programme = buildExtraFullSessionProgramme({
      type: "push",
      exercises: exerciseLibrary,
      availableEquipment: activePlan.equipment,
    });

    expect(programme.name).toBe("Extra Push");
    expect(programme.days[0]?.exerciseSlots.length).toBeGreaterThan(2);
    expect(activePlan.blocks.map((block) => block.id)).toEqual(beforeBlocks);
  });

  it.each(["upper", "lower", "push", "pull", "legs", "full_body"] as ExtraFullSessionType[])("generates full extra %s sessions", (type) => {
    const programme = buildExtraFullSessionProgramme({
      type,
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
    });

    expect(programme.name).toContain("Extra");
    expect(programme.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
  });

  it("does not require a training block to generate a full extra session", () => {
    const programme = buildExtraFullSessionProgramme({
      type: "push",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
    });

    expect(programme.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
  });

  it("keeps extra volume recovery-friendly by avoiding major compounds and power exercises", () => {
    const programme = buildExtraVolumeSessionProgramme({
      type: "push",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
    });
    const selectedExercises = programme.days[0]!.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!);

    expect(selectedExercises.length).toBeGreaterThan(0);
    expect(selectedExercises.every((exercise) => !exercise.roles.includes("primary_compound"))).toBe(true);
    expect(selectedExercises.every((exercise) => !exercise.roles.includes("power"))).toBe(true);
    expect(selectedExercises.every((exercise) => exercise.fatigueCost !== "high")).toBe(true);
  });

  it("extra sessions inherit experience level instead of hard-coding intermediate", () => {
    const beginnerFull = buildExtraFullSessionProgramme({
      type: "push",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
      experienceLevel: "beginner",
    });
    const advancedFull = buildExtraFullSessionProgramme({
      type: "push",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
      experienceLevel: "advanced",
    });
    const beginnerVolume = buildExtraVolumeSessionProgramme({
      type: "upper",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
      experienceLevel: "beginner",
    });
    const advancedVolume = buildExtraVolumeSessionProgramme({
      type: "upper",
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
      experienceLevel: "advanced",
    });

    expect(beginnerFull.experienceLevel).toBe("beginner");
    expect(advancedFull.experienceLevel).toBe("advanced");
    expect(beginnerFull.days[0]!.exerciseSlots.length).toBeLessThan(advancedFull.days[0]!.exerciseSlots.length);
    expect(beginnerVolume.experienceLevel).toBe("beginner");
    expect(advancedVolume.experienceLevel).toBe("advanced");
    expect(beginnerVolume.days[0]!.exerciseSlots.length).toBeLessThan(advancedVolume.days[0]!.exerciseSlots.length);
    expect(beginnerVolume.days[0]!.exerciseSlots.every((slot) => slot.settings.requiredWorkSets === 2)).toBe(true);
    expect(advancedVolume.days[0]!.exerciseSlots.every((slot) => slot.settings.requiredWorkSets === 3)).toBe(true);
  });

  it.each(["upper", "lower", "push", "pull", "legs"] as ExtraVolumeSessionType[])("keeps extra volume %s low fatigue", (type) => {
    const programme = buildExtraVolumeSessionProgramme({
      type,
      exercises: exerciseLibrary,
      availableEquipment: ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"],
    });
    const selectedExercises = programme.days[0]!.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)!);

    expect(selectedExercises.length).toBeGreaterThan(0);
    expect(selectedExercises.every((exercise) => !exercise.roles.includes("primary_compound"))).toBe(true);
    expect(selectedExercises.every((exercise) => !exercise.roles.includes("power"))).toBe(true);
    expect(selectedExercises.every((exercise) => exercise.fatigueCost !== "high")).toBe(true);
  });

  it("builds capacity sessions from the capacity library", () => {
    const programme = buildCapacitySessionProgramme({
      area: "low_back",
      exercises: exerciseLibrary,
    });
    const selectedNames = programme.days[0]!.exerciseSlots.map((slot) => exerciseLibrary.find((exercise) => exercise.id === slot.exerciseId)?.name);

    expect(programme.name).toBe("Low Back Capacity");
    expect(selectedNames).toContain("McGill Curl Up");
    expect(selectedNames).toContain("Pallof Press");
    expect(selectedNames).toContain("Single Leg Glute Bridge");
    expect(selectedNames).toContain("Reverse Step Up");
    expect(selectedNames.length).toBeGreaterThanOrEqual(3);
    expect(selectedNames.length).toBeLessThanOrEqual(5);
    expect(programme.notes).toContain("do not affect progression");
    expect(programme.notes).toContain("training-week advancement");
    expect(programme.description).toContain("not medical advice");
  });

  it("keeps low back capacity separate from PR, fatigue, and progression evidence in copy", () => {
    const programme = buildCapacitySessionProgramme({ area: "low_back", exercises: exerciseLibrary });

    expect(programme.name).toContain("Capacity");
    expect(programme.days[0]?.exerciseSlots.length).toBeGreaterThan(0);
    expect(programme.notes).toContain("do not affect progression");
    expect(programme.notes).toContain("PRs");
    expect(programme.notes).toContain("fatigue evidence");
    expect(programme.notes).toContain("training-week advancement");
  });

  it("generates, saves, selects, and builds every paid extra-session option safely", () => {
    const activePlan = createActiveTrainingPlan(
      {
        goal: "build_muscle_and_strength",
        planningChoice: "recommended_12_month",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-20T09:00:00.000Z",
    );
    const common = {
      exercises: exerciseLibrary,
      availableEquipment: activePlan.equipment,
      experienceLevel: activePlan.experienceLevel,
      createdByUserId: "premium-user",
    };
    const cases = [
      ...(["upper", "lower", "push", "pull", "legs", "full_body"] as ExtraFullSessionType[]).map((type) => ({
        label: `full:${type}`,
        sessionKind: "extra_full" as const,
        programme: buildExtraFullSessionProgramme({ ...common, type, history: [] }),
      })),
      ...(["upper", "lower", "push", "pull", "legs"] as ExtraVolumeSessionType[]).map((type) => ({
        label: `volume:${type}`,
        sessionKind: "extra_volume" as const,
        programme: buildExtraVolumeSessionProgramme({ ...common, type }),
      })),
      {
        label: "capacity:low_back",
        sessionKind: "extra_capacity" as const,
        programme: buildCapacitySessionProgramme({ ...common, area: "low_back" }),
      },
      {
        label: "recovery_cardio",
        sessionKind: "recovery_cardio" as const,
        programme: buildRecoveryCardioSessionProgramme(common),
      },
      {
        label: "capacity_cardio",
        sessionKind: "capacity_cardio" as const,
        programme: buildCapacityCardioSessionProgramme(common),
      },
      {
        label: "performance_conditioning",
        sessionKind: "performance_conditioning" as const,
        programme: buildPerformanceConditioningSessionProgramme(common),
      },
    ];

    for (const scenario of cases) {
      const day = scenario.programme.days[0];
      expect(day, scenario.label).toBeTruthy();
      expect(day?.exerciseSlots.length, scenario.label).toBeGreaterThan(0);
      expect(day?.exerciseSlots[0]?.exerciseId, scenario.label).toBeTruthy();

      programmeRepository.save(scenario.programme);
      programmeRepository.selectProgrammeDay({
        programmeId: scenario.programme.id,
        dayId: day!.id,
        sessionKind: scenario.sessionKind,
      });

      const savedProgramme = programmeRepository.listAll().find((candidate) => candidate.id === scenario.programme.id);
      expect(savedProgramme, scenario.label).toBeTruthy();
      const selection = programmeRepository.getSelectedProgrammeDay();
      expect(selection, scenario.label).toMatchObject({
        programmeId: scenario.programme.id,
        dayId: day!.id,
        sessionKind: scenario.sessionKind,
      });

      const session = buildWorkoutSessionFromProgrammeDay(
        savedProgramme!,
        day!.id,
        exerciseLibrary,
        {
          id: `session-${scenario.label}`,
          userId: "premium-user",
          startedAt: "2026-06-20T09:30:00.000Z",
          sessionKind: scenario.sessionKind,
        },
      );
      expect(session?.exercises.length, scenario.label).toBeGreaterThan(0);
      expect(session?.sessionKind, scenario.label).toBe(scenario.sessionKind);
      programmeRepository.clearSelectedProgrammeDay();
    }
  });
});
