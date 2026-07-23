import { isInternalRuntime, type AppEnvironment } from "@/application/runtime/app-environment-core";

export function isDesignQaModeAvailable(environment: AppEnvironment) {
  return isInternalRuntime(environment);
}
