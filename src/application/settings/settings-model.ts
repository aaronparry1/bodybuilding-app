import type { ExperienceLevel, ProgrammeGoal, ProgressionSettings, UnitSystem } from "@/domain/training/models";
import type { RecoveryCardioPreference } from "@/domain/training/plan-setup";
import {
  defaultCapacityFocusSettings,
  normalizeCapacityFocusSettings,
  type CapacityFocusSettings,
} from "@/domain/training/capacity-focus";
import {
  defaultLoadIncrementProfile,
  normalizeLoadIncrementProfile,
  type LoadIncrementProfile,
} from "@/domain/training/load-increment-strategy";
import { normalizeCanonicalSessionDuration, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";
import { defaultCanonicalStartingVolumeContext, normalizeCanonicalStartingVolumeContext, type CanonicalStartingVolumeContext } from "@/domain/training/canonical-hypertrophy-volume-policy";

export interface AppSettings {
  onboardingCompleted: boolean;
  unit: UnitSystem;
  defaultDropOffPercent: number;
  repStrategy: "recommended" | "advanced_custom";
  defaultRepRange: {
    min: number;
    max: number;
  };
  defaultLoadJump: number;
  loadIncrementProfile: LoadIncrementProfile;
  capacityFocus: CapacityFocusSettings;
  recoveryCardioPreference: RecoveryCardioPreference;
  theme: "dark" | "system";
  trainingGoal: ProgrammeGoal;
  experienceLevel: ExperienceLevel;
  availableSessionMinutes: CanonicalSessionDurationMinutes;
  startingVolumeContext: CanonicalStartingVolumeContext;
}

export const defaultAppSettings: AppSettings = {
  onboardingCompleted: false,
  unit: "kg",
  defaultDropOffPercent: 15,
  repStrategy: "recommended",
  defaultRepRange: { min: 8, max: 12 },
  defaultLoadJump: 2.5,
  loadIncrementProfile: defaultLoadIncrementProfile,
  capacityFocus: defaultCapacityFocusSettings,
  recoveryCardioPreference: "recommended",
  theme: "dark",
  trainingGoal: "hypertrophy",
  experienceLevel: "intermediate",
  availableSessionMinutes: 75,
  startingVolumeContext: defaultCanonicalStartingVolumeContext(3),
};

export function normalizeAppSettings(settings: AppSettings): AppSettings {
  const merged = { ...defaultAppSettings, ...settings };
  const repRange = merged.defaultRepRange ?? defaultAppSettings.defaultRepRange;
  return {
    ...merged,
    repStrategy: merged.repStrategy ?? "recommended",
    defaultDropOffPercent: clamp(merged.defaultDropOffPercent, 0, 50),
    defaultRepRange: {
      min: Math.max(1, Math.min(repRange.min, repRange.max)),
      max: Math.max(repRange.min, repRange.max),
    },
    defaultLoadJump: Math.max(0, merged.defaultLoadJump),
    loadIncrementProfile: normalizeLoadIncrementProfile(merged.loadIncrementProfile),
    capacityFocus: normalizeCapacityFocusSettings(merged.capacityFocus),
    availableSessionMinutes: normalizeCanonicalSessionDuration(merged.availableSessionMinutes),
    startingVolumeContext: normalizeCanonicalStartingVolumeContext(merged.startingVolumeContext, 3),
  };
}

export function progressionSettingsFromAppSettings(settings: AppSettings): ProgressionSettings {
  const normalized = normalizeAppSettings(settings);

  return {
    repRange: normalized.defaultRepRange,
    dropOffPercent: normalized.defaultDropOffPercent,
    loadIncrease: normalized.defaultLoadJump,
    unit: normalized.unit,
    requiredWorkSets: 3,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
