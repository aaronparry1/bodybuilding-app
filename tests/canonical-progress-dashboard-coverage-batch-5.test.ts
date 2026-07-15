import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-coverage-batch-5.json";

describe("canonical dashboard coverage batch 5", () => {
  it("accounts for all nine remaining cases without selecting an unsafe group", () => {
    expect(artifact.startingRemainingCases).toBe(9);
    expect(artifact.cases).toHaveLength(9);
    expect(artifact.selectedBatch).toBeNull();
    expect(artifact.selectionResult).toBe("no_projection_only_group");
    expect(artifact.cases.every((item) => !item.projectionOnly)).toBe(true);
  });

  it("preserves the canonical fixture partition and production boundary", () => {
    expect(artifact.fixturePartition).toEqual({ plan: 13, session: 30, progress: 35 });
    expect(artifact.productionSwitchCompleted).toBe(false);
  });
});
