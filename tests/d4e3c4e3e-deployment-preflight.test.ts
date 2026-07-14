import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const preflight = JSON.parse(fs.readFileSync(path.join(process.cwd(), "qa-reports/legacy-migration-change-control/phase-d4e3c4e3e-deployment-preflight.json"), "utf8")) as any;
const eas = JSON.parse(fs.readFileSync(path.join(process.cwd(), "eas.json"), "utf8")) as any;

describe("D4E3C4E3E deployment preflight", () => {
  it("selects preview internal distribution with observation only", () => {
    expect(eas.build.preview.distribution).toBe("internal");
    expect(eas.build.preview.env.EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION).toBe("enabled");
    expect(eas.build.production.env.EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION).toBeUndefined();
    expect(preflight.authority).toBe("production_only");
  });
  it("fails closed before external build when EAS is unavailable", () => {
    expect(preflight.buildStarted).toBe(false);
    expect(preflight.status).toBe("blocked_before_build");
    expect(preflight.buildId).toBeNull();
  });
});
