import { useCallback, useEffect, useState } from "react";
import { jsonStore } from "@/data/local/json-store";
import {
  defaultAppSettings,
  normalizeAppSettings,
  progressionSettingsFromAppSettings,
  type AppSettings,
} from "@/application/settings/settings-model";

const settingsKey = "iron-logic.app-settings";
let cachedSettings: AppSettings | null = null;

function logSettingsStage(stage: string) {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[startup:settings] ${stage}`);
  }
}

export const appSettingsStore = {
  get(): AppSettings {
    if (!cachedSettings) {
      cachedSettings = normalizeAppSettings(jsonStore.get<AppSettings>(settingsKey, defaultAppSettings));
      logSettingsStage("snapshot loaded");
    }
    return cachedSettings;
  },
  set(settings: AppSettings): void {
    cachedSettings = normalizeAppSettings(settings);
    logSettingsStage("snapshot updated");
    jsonStore.set(settingsKey, cachedSettings);
  },
  patch(patch: Partial<AppSettings>): void {
    this.set({ ...this.get(), ...patch });
  },
  resetCache(): void {
    cachedSettings = null;
  },
  subscribe(listener: () => void): () => void {
    return jsonStore.subscribe(settingsKey, listener);
  },
};

export function useAppSettings() {
  const [settings, setSettings] = useState(() => appSettingsStore.get());

  useEffect(
    () =>
      appSettingsStore.subscribe(() => {
        setSettings(appSettingsStore.get());
      }),
    [],
  );

  const updateSettings = useCallback((patch: Partial<AppSettings>) => appSettingsStore.patch(patch), []);

  return {
    settings,
    updateSettings,
  };
}
export { defaultAppSettings, normalizeAppSettings, progressionSettingsFromAppSettings, type AppSettings };
