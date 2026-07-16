import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => JSON.parse(readFileSync(`qa-reports/release-readiness/${file}`, "utf8")) as any;

describe("manual smoke execution evidence", () => {
  it("does not overstate unexecuted platforms or cases", () => {
    const result = read("manual-smoke-execution-result.json");
    const matrix = read("manual-smoke-test-matrix.json");
    expect(result.manualSmokeExecutionStarted).toBe(true);
    expect(result.manualSmokeExecutionCompleted).toBe(true);
    expect(result.caseTotals.passed).toBe(0);
    expect(result.cases.every((test: any) => test.status !== "passed")).toBe(true);
    expect(matrix.cases).toHaveLength(result.caseTotals.notExecuted);
    expect(result.deploymentAuthorized).toBe(false);
    expect(result.readyForReleaseCandidateBuild).toBe(false);
  });

  it("keeps the audit blocked until manual and disposable-cloud evidence exists", () => {
    const audit = read("non-deploying-release-readiness-audit.json");
    const platforms = read("platform-readiness-matrix.json");
    const safety = read("data-safety-readiness.json");
    expect(audit.finalStatus).toBe("blocked_before_release_candidate_build");
    expect(audit.readyForReleaseCandidateBuild).toBe(false);
    expect(Object.values(platforms.platforms).some((platform: any) => platform.status === "verified" && platform.evidence.length === 0)).toBe(false);
    expect(safety.manualCoverage).not.toBe("verified");
  });
});
