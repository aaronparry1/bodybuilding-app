import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Home Design-QA production boundary", () => {
  it("forces fixture mode off in resolved production config even when a public flag is supplied", () => {
    const raw = execFileSync("npx", ["expo", "config", "--type", "public", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, APP_ENV: "production", EAS_BUILD_PROFILE: "production", EXPO_PUBLIC_DESIGN_QA_MODE: "1" },
    });
    const config = JSON.parse(raw) as { extra?: { appEnvironment?: string; designQaMode?: boolean } };
    expect(config.extra).toMatchObject({ appEnvironment: "production", designQaMode: false });
  });

  it("requires explicit local QA mode for fixture query state and chrome", () => {
    const home = readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");
    const layout = readFileSync("app/(protected)/_layout.tsx", "utf8");
    const eas = JSON.parse(readFileSync("eas.json", "utf8")) as { build: Record<string, { env?: Record<string, string> }> };
    expect(home).toContain("isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested()");
    expect(layout).toContain('qaChrome === "1"');
    expect(layout).toContain("isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested()");
    expect(eas.build.production?.env?.EXPO_PUBLIC_DESIGN_QA_MODE).toBeUndefined();
  });
});
