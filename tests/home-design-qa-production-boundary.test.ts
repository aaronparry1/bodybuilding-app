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
    expect(config.extra).toMatchObject({ appEnvironment: "production" });
    expect(config.extra).not.toHaveProperty("designQaMode");
  });

  it("keeps QA routes and chrome in the non-production router graph only", () => {
    const qaLayout = readFileSync("app/(protected)/_layout.tsx", "utf8");
    const qaRoute = readFileSync("app/(protected)/design-qa.tsx", "utf8");
    const productionLayout = readFileSync("app-production/(protected)/_layout.tsx", "utf8");
    const productionShell = readFileSync("src/application/shell/production-protected-layout.tsx", "utf8");
    const eas = JSON.parse(readFileSync("eas.json", "utf8")) as { build: Record<string, { env?: Record<string, string> }> };
    expect(qaRoute).toContain("isDesignQaModeAvailable(environment) || !isDesignQaModeRequested()");
    expect(qaLayout).toContain('qaChrome === "1"');
    expect(qaLayout).toContain("isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested()");
    expect(productionLayout).toContain("production-protected-layout");
    expect(productionShell).not.toMatch(/design.?qa|qaChrome|fixture/i);
    expect(eas.build.production?.env?.EXPO_PUBLIC_DESIGN_QA_MODE).toBeUndefined();
  });
});
