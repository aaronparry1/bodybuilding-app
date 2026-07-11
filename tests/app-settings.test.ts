import { describe, expect, it } from "vitest";
import {
  appSettingsStore,
  defaultAppSettings,
  normalizeAppSettings,
  progressionSettingsFromAppSettings,
} from "@/application/settings/app-settings";
import { resolveWorkoutExerciseSettings } from "@/application/settings/workout-settings";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import { exerciseLibrary } from "@/domain/training/presets";

describe("app settings", () => {
  it("returns a stable external-store snapshot between writes", () => {
    appSettingsStore.resetCache();
    appSettingsStore.set(defaultAppSettings);

    const first = appSettingsStore.get();
    const second = appSettingsStore.get();

    expect(first).toBe(second);

    appSettingsStore.patch({ unit: "lb" });
    const third = appSettingsStore.get();

    expect(third).not.toBe(first);
    expect(third.unit).toBe("lb");
  });

  it("normalizes training defaults into safe ranges", () => {
    const settings = normalizeAppSettings({
      ...defaultAppSettings,
      defaultDropOffPercent: 99,
      defaultRepRange: { min: 15, max: 8 },
      defaultLoadJump: -5,
      loadIncrementProfile: {
        barbellPlateLoadedKg: 7.5 as 2.5,
        dumbbellKg: 3 as 2,
        cableKg: 4 as 2.5,
        machineKg: 4 as 2.5,
        bodyweightExternalLoading: true,
      },
    });

    expect(settings.defaultDropOffPercent).toBe(50);
    expect(settings.defaultRepRange).toEqual({ min: 8, max: 15 });
    expect(settings.defaultLoadJump).toBe(0);
    expect(settings.loadIncrementProfile).toEqual({
      barbellPlateLoadedKg: 2.5,
      dumbbellKg: 2.5,
      cableKg: 5,
      machineKg: 5,
      bodyweightExternalLoading: true,
    });
    expect(settings.capacityFocus).toEqual(defaultAppSettings.capacityFocus);
    expect(settings.recoveryCardioPreference).toBe("recommended");
  });

  it("turns user settings into progression defaults", () => {
    const progressionSettings = progressionSettingsFromAppSettings({
      ...defaultAppSettings,
      unit: "lb",
      defaultDropOffPercent: 12,
      defaultRepRange: { min: 6, max: 10 },
      defaultLoadJump: 5,
      loadIncrementProfile: {
        ...defaultAppSettings.loadIncrementProfile,
        barbellPlateLoadedKg: 5,
      },
    });

    expect(progressionSettings).toEqual({
      repRange: { min: 6, max: 10 },
      dropOffPercent: 12,
      loadIncrease: 5,
      unit: "lb",
      requiredWorkSets: 3,
    });
  });

  it("resolves workout settings with programme rep prescription before block defaults", () => {
    const benchPress = exerciseLibrary.find((exercise) => exercise.name === "Bench Press");
    expect(benchPress).toBeDefined();

    const settings = resolveWorkoutExerciseSettings(
      benchPress!,
      {
        ...defaultAppSettings,
        unit: "lb",
        defaultDropOffPercent: 12,
        defaultRepRange: { min: 6, max: 10 },
        defaultLoadJump: 5,
      },
      {
        id: "slot-1",
        exerciseId: benchPress!.id,
        plannedOrder: 1,
        settings: {
          repRange: { min: 10, max: 14 },
          dropOffPercent: 18,
          loadIncrease: 10,
          unit: "kg",
          requiredWorkSets: 4,
        },
      },
      createTrainingBlock("strength", { status: "active" }),
    );

    expect(settings).toEqual({
      repRange: { min: 10, max: 14 },
      dropOffPercent: 10,
      loadIncrease: 10,
      unit: "lb",
      requiredWorkSets: 4,
      requiredSets: 4,
      recommendedMinSets: 4,
      recommendedMaxSets: 5,
      softCapSets: 6,
      hardCapSets: undefined,
      setRangeSource: "legacy",
      volumeCoachingIntent: undefined,
    });
  });

  it("resolves workout load increment from equipment profile when no programme slot overrides it", () => {
    const inclineDumbbellPress = exerciseLibrary.find((exercise) => exercise.name === "Incline Dumbbell Press");
    expect(inclineDumbbellPress).toBeDefined();

    const settings = resolveWorkoutExerciseSettings(
      inclineDumbbellPress!,
      {
        ...defaultAppSettings,
      loadIncrementProfile: {
        ...defaultAppSettings.loadIncrementProfile,
        barbellPlateLoadedKg: 1,
        dumbbellKg: 2,
        cableKg: 1,
        machineKg: 1,
      },
      },
      undefined,
      createTrainingBlock("hypertrophy", { status: "active" }),
    );

    expect(settings.loadIncrease).toBe(2);
  });
});
