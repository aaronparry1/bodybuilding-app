import { describe, expect, it } from "vitest";
import type { ProgressionSettings, WorkoutExerciseLog } from "@/domain/training/models";
import { earnedLoadIncrease } from "@/domain/training/progression-engine";
import { resolveSetPrescription, shiftRecommendedSetRange, withSetPrescription } from "@/domain/training/set-prescription";
import { getWorkoutExerciseDisplayStatus } from "@/domain/training/workout-session-status";

const legacySettings: ProgressionSettings = {
  repRange: { min: 8, max: 12 },
  dropOffPercent: 15,
  loadIncrease: 2.5,
  requiredWorkSets: 3,
  unit: "kg",
};

describe("hybrid set prescription", () => {
  it("maps old requiredWorkSets to a hybrid range safely", () => {
    const prescription = resolveSetPrescription(legacySettings);

    expect(prescription).toMatchObject({
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "legacy",
    });
  });

  it("generated settings include required sets, recommended range, and soft cap", () => {
    const settings = withSetPrescription(legacySettings, {
      blockType: "hypertrophy",
      exerciseRole: "primary_compound",
      primaryMuscles: ["chest"],
    }, {
      source: "generated",
    });

    expect(settings.requiredSets).toBe(3);
    expect(settings.recommendedMinSets).toBe(3);
    expect(settings.recommendedMaxSets).toBe(5);
    expect(settings.softCapSets).toBe(8);
    expect(settings.requiredWorkSets).toBe(3);
  });

  it("exercise completion uses requiredSets and warm-ups do not count", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "generated",
    });
    const exercise: WorkoutExerciseLog = {
      id: "exercise",
      exerciseId: "bench",
      exerciseName: "Bench Press",
      settings,
      load: 100,
      sets: [
        { id: "warmup", setNumber: 1, reps: 10, load: 60, loggedAt: "2026-06-01T10:00:00.000Z", type: "warmup" },
        { id: "set-1", setNumber: 1, reps: 10, load: 100, loggedAt: "2026-06-01T10:01:00.000Z", type: "work" },
        { id: "set-2", setNumber: 2, reps: 10, load: 100, loggedAt: "2026-06-01T10:02:00.000Z", type: "work" },
      ],
      status: "active",
    };

    expect(getWorkoutExerciseDisplayStatus(exercise, 0, 0)).toBe("active");

    exercise.sets.push({ id: "set-3", setNumber: 3, reps: 10, load: 100, loggedAt: "2026-06-01T10:03:00.000Z", type: "work" });

    expect(getWorkoutExerciseDisplayStatus(exercise, 0, 0)).toBe("completed");
  });

  it("soft cap does not determine completion", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 2,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "generated",
    });
    const sets = [
      { id: "set-1", setNumber: 1, reps: 12, load: 100, loggedAt: "2026-06-01T10:01:00.000Z", type: "work" as const },
      { id: "set-2", setNumber: 2, reps: 12, load: 100, loggedAt: "2026-06-01T10:02:00.000Z", type: "work" as const },
    ];

    expect(
      getWorkoutExerciseDisplayStatus({
        id: "exercise",
        exerciseId: "bench",
        exerciseName: "Bench Press",
        settings,
        load: 100,
        sets,
        status: "active",
      }, 0, 0),
    ).toBe("completed");
    expect(sets).toHaveLength(2);
  });

  it("raise_range changes 3-5 to 4-6 without raising the required floor", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "generated",
    });
    const raised = shiftRecommendedSetRange(settings, 1);

    expect(resolveSetPrescription(raised)).toMatchObject({
      requiredSets: 3,
      recommendedMinSets: 4,
      recommendedMaxSets: 6,
      softCapSets: 8,
      source: "volume_adjustment",
    });
  });

  it("raise_range cannot exceed an evidence-based hard cap", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 2,
      recommendedMinSets: 2,
      recommendedMaxSets: 4,
      softCapSets: 5,
      hardCapSets: 5,
      source: "generated",
    });
    const raisedOnce = shiftRecommendedSetRange(settings, 1);
    const raisedAgain = shiftRecommendedSetRange(raisedOnce, 1);

    expect(resolveSetPrescription(raisedOnce)).toMatchObject({
      requiredSets: 2,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 5,
      hardCapSets: 5,
      source: "volume_adjustment",
    });
    expect(resolveSetPrescription(raisedAgain)).toMatchObject({
      requiredSets: 2,
      recommendedMinSets: 4,
      recommendedMaxSets: 5,
      softCapSets: 5,
      hardCapSets: 5,
      source: "volume_adjustment",
    });
  });

  it("lower_range changes 3-5 to 2-4 and can lower the required floor", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "generated",
    });
    const lowered = shiftRecommendedSetRange(settings, -1);

    expect(resolveSetPrescription(lowered)).toMatchObject({
      requiredSets: 2,
      recommendedMinSets: 2,
      recommendedMaxSets: 4,
      softCapSets: 8,
      source: "volume_adjustment",
    });
  });

  it("load progression uses requiredSets, not the soft cap", () => {
    const settings = withSetPrescription(legacySettings, {}, {
      requiredSets: 3,
      recommendedMinSets: 3,
      recommendedMaxSets: 5,
      softCapSets: 8,
      source: "generated",
    });

    expect(earnedLoadIncrease([{ reps: 12 }, { reps: 12 }, { reps: 12 }], settings)).toBe(true);
  });
});
