import { progressionSettingsFromAppSettings, type AppSettings } from "@/application/settings/settings-model";
import { getBlockDropOffPercentage } from "@/domain/training/annual-planner";
import type { TrainingBlock } from "@/domain/training/annual-models";
import { resolveLoadIncrement } from "@/domain/training/load-increment-strategy";
import type { Exercise, ProgramExercise, ProgressionSettings } from "@/domain/training/models";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import { withSetPrescription } from "@/domain/training/set-prescription";

export function resolveWorkoutExerciseSettings(
  exercise: Exercise,
  appSettings: AppSettings,
  plannedSlot?: ProgramExercise,
  currentBlock?: TrainingBlock | null,
): ProgressionSettings {
  const appDefaults = progressionSettingsFromAppSettings(appSettings);
  const loadIncrement = resolveLoadIncrement({
    exercise,
    equipmentProfile: appSettings.loadIncrementProfile,
    unit: appSettings.unit,
    context: "progression",
  });
  const resolvedRepRange = resolveRepRange({
    blockType: currentBlock?.type,
    exerciseRole: exercise.role,
    exerciseFamily: exercise.family,
    movementPattern: exercise.movementPattern,
    programmeSlotOverride: plannedSlot?.settings.repRange,
    exerciseDefault: exercise.defaultRepRange,
    userAdvancedOverride: {
      enabled: appSettings.repStrategy === "advanced_custom",
      repRange: appSettings.defaultRepRange,
    },
  });
  const measurementType = plannedSlot?.settings.measurementType ?? exercise.defaultSettings.measurementType ?? exercise.measurementType ?? "reps";

  return withSetPrescription({
    ...appDefaults,
    ...exercise.defaultSettings,
    ...(plannedSlot?.settings ?? {}),
    repRange: measurementType === "duration" ? (plannedSlot?.settings.repRange ?? exercise.defaultRepRange) : resolvedRepRange,
    ...(measurementType === "duration"
      ? {
          measurementType,
          durationIncreaseSeconds: plannedSlot?.settings.durationIncreaseSeconds ?? exercise.defaultSettings.durationIncreaseSeconds ?? 5,
        }
      : {}),
    dropOffPercent: currentBlock ? getBlockDropOffPercentage(currentBlock) : (plannedSlot?.settings.dropOffPercent ?? exercise.defaultSettings.dropOffPercent ?? appDefaults.dropOffPercent),
    loadIncrease: plannedSlot?.settings.loadIncrease ?? loadIncrement.increment,
    unit: appDefaults.unit,
  }, {
    blockType: currentBlock?.type,
    exerciseRole: exercise.role,
    exerciseFamily: exercise.family,
    primaryMuscles: exercise.primaryMuscles,
  });
}
