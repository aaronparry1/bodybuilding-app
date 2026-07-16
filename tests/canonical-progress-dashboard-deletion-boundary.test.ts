import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("legacy Progress dashboard deletion boundary", () => {
  it("removes the dead module without a compatibility replacement", () => {
    expect(existsSync(resolve(process.cwd(), "src/domain/training/progress-dashboard.ts"))).toBe(false);
    const sourceRoots = ["src", "tests"];
    for (const root of sourceRoots) {
      const source = readFileSync(resolve(process.cwd(), root === "src" ? "src/domain/training/canonical-progress-dashboard-projection.ts" : "tests/progress-dashboard.test.ts"), "utf8");
      expect(source).not.toContain("buildProgressDashboardViewModel");
    }
  });

  it("retains the canonical dashboard projection", () => {
    expect(existsSync(resolve(process.cwd(), "src/domain/training/canonical-progress-dashboard-projection.ts"))).toBe(true);
  });
});
