import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production recovery diagnostics", () => {
  it("is user initiated, redacted, selectable and reachable from production Settings", () => {
    const settings = readFileSync("src/application/shell/production-settings-screen.tsx", "utf8");
    const screen = readFileSync("src/application/shell/production-recovery-diagnostics-screen.tsx", "utf8");
    const route = readFileSync("app-production/(protected)/recovery-diagnostics.tsx", "utf8");
    expect(settings).toContain("Recovery diagnostic summary");
    expect(screen).toContain("Create read-only summary");
    expect(screen).toContain("selectable");
    expect(screen).toContain("tokens, workout contents, exercises, sets, reps and loads are never included");
    expect(screen).not.toContain("useEffect");
    expect(route).toContain("production-recovery-diagnostics-screen");
  });
});
