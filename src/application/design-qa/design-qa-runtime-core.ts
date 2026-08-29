import { isInternalRuntime, type AppEnvironment } from "@/application/runtime/app-environment-core";

export function isDesignQaModeAvailable(environment: AppEnvironment) {
  return isInternalRuntime(environment);
}

/** Pure build-time signal for read models that must remain importable outside React Native. */
export function isDesignQaModeExplicitlyRequested() {
  return process.env.EXPO_PUBLIC_DESIGN_QA_MODE === "1";
}
