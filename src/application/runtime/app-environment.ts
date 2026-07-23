import Constants from "expo-constants";
import { normalizeAppEnvironment, isInternalRuntime, type AppEnvironment } from "@/application/runtime/app-environment-core";

type CoachingEngineV3Extra = {
  appEnvironment?: string;
  coachingEngineV3?: {
    enabled?: boolean;
    activeWorkout?: boolean;
    qualityGateStrict?: boolean;
    shadowMode?: boolean;
  };
};

export function getAppEnvironment(): AppEnvironment {
  const extra = Constants.expoConfig?.extra as { appEnvironment?: string } | undefined;
  return normalizeAppEnvironment(extra?.appEnvironment ?? process.env.APP_ENV);
}

export function getCoachingEngineV3RuntimeStatus(environment: AppEnvironment = getAppEnvironment()) {
  const extra = Constants.expoConfig?.extra as CoachingEngineV3Extra | undefined;
  const internal = isInternalRuntime(environment);
  const engineEnabled = internal && (extra?.coachingEngineV3?.enabled === true || isTruthyRuntimeFlag(process.env.EXPO_PUBLIC_ASC_COACHING_ENGINE_V3));
  const activeWorkoutEnabled = internal && (extra?.coachingEngineV3?.activeWorkout === true || isTruthyRuntimeFlag(process.env.EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT));
  const qualityGateStrictEnabled = internal && (extra?.coachingEngineV3?.qualityGateStrict === true || isTruthyRuntimeFlag(process.env.EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT));
  return {
    environment,
    internal,
    engineEnabled,
    activeWorkoutEnabled,
    qualityGateStrictEnabled,
    activeWorkoutReady: engineEnabled && activeWorkoutEnabled && qualityGateStrictEnabled,
  };
}

function isTruthyRuntimeFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export { normalizeAppEnvironment, type AppEnvironment };
