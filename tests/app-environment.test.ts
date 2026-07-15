import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isDesignQaModeAvailable, isInternalRuntime, normalizeAppEnvironment } from "@/application/runtime/app-environment-core";

describe("app environment", () => {
  it("normalizes known app environments", () => {
    expect(normalizeAppEnvironment("development")).toBe("development");
    expect(normalizeAppEnvironment("staging")).toBe("staging");
    expect(normalizeAppEnvironment("production")).toBe("production");
  });

  it("falls back unknown environment values to development", () => {
    expect(normalizeAppEnvironment("preview")).toBe("development");
    expect(normalizeAppEnvironment(undefined)).toBe("development");
  });

  it("only allows Design QA Mode outside production", () => {
    expect(isDesignQaModeAvailable("development")).toBe(true);
    expect(isDesignQaModeAvailable("staging")).toBe(true);
    expect(isDesignQaModeAvailable("production")).toBe(false);
  });

  it("treats only non-production builds as internal runtime", () => {
    expect(isInternalRuntime("development")).toBe(true);
    expect(isInternalRuntime("staging")).toBe(true);
    expect(isInternalRuntime("production")).toBe(false);
  });

  it("enables V3 active workout validation flags for internal profiles and the production release candidate", () => {
    const eas = JSON.parse(readFileSync("eas.json", "utf8")) as {
      build: Record<string, { env?: Record<string, string> }>;
    };

    for (const profile of ["development", "preview"]) {
      expect(eas.build[profile]?.env).toMatchObject({
        ASC_COACHING_ENGINE_V3: "true",
        ASC_V3_ACTIVE_WORKOUT: "true",
        ASC_V3_QUALITY_GATE_STRICT: "true",
        EXPO_PUBLIC_ASC_COACHING_ENGINE_V3: "true",
        EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT: "true",
        EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT: "true",
      });
    }

    expect(eas.build.production?.env).toMatchObject({
      ASC_COACHING_ENGINE_V3: "true",
      ASC_V3_ACTIVE_WORKOUT: "true",
      ASC_V3_QUALITY_GATE_STRICT: "true",
      ASC_V3_SHADOW_MODE: "false",
      EXPO_PUBLIC_ASC_COACHING_ENGINE_V3: "true",
      EXPO_PUBLIC_ASC_V3_ACTIVE_WORKOUT: "true",
      EXPO_PUBLIC_ASC_V3_QUALITY_GATE_STRICT: "true",
      EXPO_PUBLIC_ASC_V3_SHADOW_MODE: "false",
    });
  });

  it("keeps the V3 Train-screen status indicator internal-only even when production V3 is enabled", () => {
    const runtimeSource = readFileSync("src/application/runtime/app-environment.ts", "utf8");
    const trainSource = readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");

    expect(runtimeSource).toContain("const internal = isInternalRuntime(environment)");
    expect(trainSource).toContain("canonicalActivePlanState");
    expect(trainSource).not.toContain("v3RuntimeStatus");
    expect(trainSource).not.toContain("getCoachingEngineV3RuntimeStatus");
  });
});
