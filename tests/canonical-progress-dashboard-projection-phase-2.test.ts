import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical dashboard projection phase 2 boundary", () => {
  it("keeps every unrepresented behavior explicit instead of deleting coverage", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-progress-dashboard-projection-phase-2-blocker.json"), "utf8"));
    expect(artifact.originalCases).toBe(21);
    expect(artifact.canonicalCasesCompleted + artifact.blockedCases).toBe(21);
    expect(artifact.decision).toBe("stop_at_missing_canonical_dashboard_projection_fields");
    expect(artifact.productionSwitchCompleted).toBe(false);
  });

  it("does not claim a mounted production dashboard caller", () => {
    const artifact = JSON.parse(readFileSync(resolve(process.cwd(), "qa-reports/legacy-migration-change-control/canonical-progress-dashboard-projection-phase-2-blocker.json"), "utf8"));
    expect(artifact.mountedProductionCaller).toBeNull();
  });
});
