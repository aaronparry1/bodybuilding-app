import Constants from "expo-constants";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import type { AppEnvironment } from "@/application/runtime/app-environment-core";
import { isDesignQaModeAvailable as isDesignQaModeAvailableForEnvironment } from "@/application/design-qa/design-qa-runtime-core";

export function isDesignQaModeAvailable(environment: AppEnvironment = getAppEnvironment()) {
  return isDesignQaModeAvailableForEnvironment(environment);
}

export function isDesignQaModeRequested() {
  const extra = Constants.expoConfig?.extra as { designQaMode?: boolean } | undefined;
  return extra?.designQaMode === true || process.env.EXPO_PUBLIC_DESIGN_QA_MODE === "1";
}

export function isV2CoachingQaRequested() {
  const extra = Constants.expoConfig?.extra as { enableV2CoachingQa?: boolean } | undefined;
  return extra?.enableV2CoachingQa === true || process.env.EXPO_PUBLIC_ENABLE_V2_COACHING_QA === "1";
}
