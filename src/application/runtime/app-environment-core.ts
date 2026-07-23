export type AppEnvironment = "development" | "staging" | "production";

export function normalizeAppEnvironment(value?: string | null): AppEnvironment {
  if (value === "production" || value === "staging" || value === "development") return value;
  return "development";
}

export function isInternalRuntime(environment: AppEnvironment) {
  return environment !== "production";
}
