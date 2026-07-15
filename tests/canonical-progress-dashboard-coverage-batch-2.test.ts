import { describe, expect, it } from "vitest";
import artifact from "@/../qa-reports/legacy-migration-change-control/canonical-progress-dashboard-coverage-batch-2.json";

describe("canonical dashboard coverage batch 2", () => {
  it("accounts for every prior remaining semantic case", () => {
    expect(artifact.originalRemainingCases).toBe(14);
    expect(artifact.obsoleteCasesRemoved).toHaveLength(1);
    expect(artifact.duplicateCasesRemoved).toHaveLength(0);
    expect(artifact.trueMissingCases).toHaveLength(13);
    expect(artifact.obsoleteCasesRemoved.length + artifact.duplicateCasesRemoved.length + artifact.trueMissingCases.length).toBe(14);
  });

  it("preserves the canonical fixture partition and records the bounded next contract", () => {
    expect(artifact.fixturePartition).toEqual({ plan: 13, session: 30, progress: 35 });
    expect(artifact.nextBoundedBatch).toContain("recorded-session");
  });
});
