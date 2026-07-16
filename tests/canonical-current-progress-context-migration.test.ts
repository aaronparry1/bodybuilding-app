import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical current Progress context migration boundary", () => {
  it("records the exact dashboard projection gap and remains fail-closed", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-current-progress-context-migration-blocker.json"), "utf8"));
    expect(artifact.decision).toBe("stop_at_progress_dashboard_projection_gap");
    expect(artifact.productionSwitchCompleted).toBe(false);
    expect(artifact.nextBoundedTask).toContain("Progress dashboard");
  });

  it("proves the resolver module is removed after canonical consumer migration", () => {
    expect(() => readFileSync(resolve(process.cwd(), "src/domain/training/current-progress-context.ts"), "utf8")).toThrow();
    const source = readFileSync(resolve(process.cwd(), "src/domain/training/canonical-progress-context.ts"), "utf8");
    expect(source).toContain("CanonicalProgressContext");
  });
});
