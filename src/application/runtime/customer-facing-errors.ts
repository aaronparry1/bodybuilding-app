import { isDesignQaModeAvailable, type AppEnvironment } from "@/application/runtime/app-environment-core";

const internalDiagnosticPattern =
  /(EXPO_PUBLIC_|APP_ENV|SUPABASE|REVENUECAT|API key|env|environment variable|configuration|configured|offering|product IDs?|bundle ID|package name)/i;

export function shouldShowDeveloperDiagnostics(environment: AppEnvironment): boolean {
  return isDesignQaModeAvailable(environment);
}

export function customerSafeServiceMessage(
  message: string | null | undefined,
  environment: AppEnvironment,
  fallback = "We couldn’t connect to online services right now.",
): string | null {
  if (!message) return null;
  if (shouldShowDeveloperDiagnostics(environment)) return message;
  return internalDiagnosticPattern.test(message) ? fallback : message;
}
