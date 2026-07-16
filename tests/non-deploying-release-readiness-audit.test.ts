import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/release-readiness";
const read = (name: string) => JSON.parse(readFileSync(`${root}/${name}`, "utf8")) as any;

describe("non-deploying release readiness evidence", () => {
  it("keeps audit, platform, data-safety, and smoke artifacts internally consistent", () => {
    const audit = read("non-deploying-release-readiness-audit.json");
    const smoke = read("manual-smoke-test-matrix.json");
    const platforms = read("platform-readiness-matrix.json");
    const safety = read("data-safety-readiness.json");
    expect(audit.sourceCommit).toBe("280e5f1faf96e52054d316fcb529ba48cff06c57");
    expect(audit.architecture.productionPredicates).toBe("24/24 passing");
    expect(audit.architecture.productionSwitchCompleted).toBe(true);
    expect(audit.finalStatus).toBe("blocked_before_release_candidate_build");
    expect(audit.releaseCandidateBuildExecuted).toBe(false);
    expect(audit.deploymentAuthorized).toBe(false);
    expect(audit.deploymentExecuted).toBe(false);
    expect(audit.rolloutExecuted).toBe(false);
    expect(audit.storeSubmissionExecuted).toBe(false);
    expect(smoke.cases.every((test: { manualStatus: string }) => test.manualStatus !== "passed")).toBe(true);
    expect(Object.values(platforms.platforms).some((platform: any) => platform.status === "verified" && platform.evidence.length === 0)).toBe(false);
    expect(safety.manualCoverage).toBe("blocked_cloud_and_not_executed_local");
  });

  it("preserves canonical authority and inactive ordinary-v2 controls", () => {
    const audit = read("non-deploying-release-readiness-audit.json");
    const config = read("release-configuration-inventory.json");
    expect(audit.architecture.mountedLegacyBlockers).toEqual([]);
    expect(audit.architecture.ordinaryV2).toBe("inactive");
    expect(audit.architecture.d4d2).toBe("unchanged");
    expect(config.profiles.production.observation).toBe("disabled");
    expect(config.profiles.production.authority).toBe("production_only");
  });
});
