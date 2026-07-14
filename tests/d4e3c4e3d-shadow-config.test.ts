import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resolveOrdinaryShadowObservationPolicy } from "@/domain/training/ordinary-v2-shadow-config";

describe("D4E3C4E3D deployable observation config", () => {
  it("is disabled when absent or malformed and enables only the exact value", () => {
    expect(resolveOrdinaryShadowObservationPolicy({})).toEqual({ enabled: false, timeoutMs: 20 });
    expect(resolveOrdinaryShadowObservationPolicy({ EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION: "true" })).toEqual({ enabled: false, timeoutMs: 20 });
    expect(resolveOrdinaryShadowObservationPolicy({ EXPO_PUBLIC_ORDINARY_V2_SHADOW_OBSERVATION: "enabled" })).toEqual({ enabled: true, timeoutMs: 20 });
  });
  it("keeps authority controls structurally separate", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/domain/training/ordinary-v2-shadow-config.ts"), "utf8");
    expect(source).not.toContain("ordinary_v2_canary");
    expect(source).not.toContain("v2Enabled");
  });
});
