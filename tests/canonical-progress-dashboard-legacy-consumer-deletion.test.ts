import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-legacy-consumer-deletion.json";

describe("legacy dashboard consumer proof", () => {
  it("distinguishes test-only callers from mounted production callers", () => {
    expect(artifact.buildProgressDashboardViewModel.mountedProductionCallers).toEqual([]);
    expect(artifact.buildProgressDashboardViewModel.externalCallers).toHaveLength(2);
    expect(artifact.resolveCurrentProgressContext.mountedProductionCallers).toEqual([]);
  });

  it("does not claim deletion while legacy consumers remain", () => {
    expect(artifact.deletion.dashboardDeleted).toBe(false);
    expect(artifact.deletion.currentProgressContextDeleted).toBe(false);
    expect(artifact.coverage.fixturePartition).toEqual({ plan: 13, session: 30, progress: 35 });
  });
});
