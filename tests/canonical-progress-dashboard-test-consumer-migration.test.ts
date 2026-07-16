import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-test-consumer-migration.json";

describe("dashboard test consumer migration boundary", () => {
  it("records test-only consumers and no mounted production caller", () => {
    expect(artifact.remainingMigration.productionMountedCallers).toEqual([]);
    expect(artifact.remainingMigration.testOnlyCallers).toEqual([]);
  });
  it("does not claim deletion while shared legacy consumers remain", () => {
    expect(artifact.deletedSymbols).toContain("buildProgressDashboardViewModel");
    expect(artifact.resolveCurrentProgressContext.status).toBe("retained");
    expect(artifact.canonicalCases + artifact.obsoleteCases + artifact.blockedCases).toBe(21);
  });
});
