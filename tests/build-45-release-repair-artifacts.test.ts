import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/build-45-focused-release-repair";
const required = [
  "executive-summary.md",
  "starting-state.md",
  "workout-colour-source-inventory.md",
  "brand-token-contract.md",
  "brand-repair-results.md",
  "discard-root-cause.md",
  "discard-lifecycle-contract.md",
  "discard-results.json",
  "discard-results.md",
  "workout-lifecycle-results.md",
  "screen-consistency-results.md",
  "protected-regressions.md",
  "remaining-findings.md",
  "release-readiness.md",
] as const;

describe("Build 45 focused release-repair artifacts", () => {
  it("publishes the complete deterministic artifact set and reconciles all Discard cases", () => {
    for (const file of required) expect(existsSync(`${root}/${file}`), file).toBe(true);
    const results = JSON.parse(readFileSync(`${root}/discard-results.json`, "utf8")) as {
      cases: Array<{ id: number; verdict: string }>;
      summary: { proven: number; partiallyProven: number; permanentGhosts: number; duplicateMutations: number; discardedEvidenceRecords: number };
    };
    expect(results.cases.map((item) => item.id)).toEqual(Array.from({ length: 25 }, (_, index) => index + 1));
    expect(results.cases.filter((item) => item.verdict === "PROVEN")).toHaveLength(24);
    expect(results.cases.filter((item) => item.verdict === "PARTIALLY PROVEN")).toHaveLength(1);
    expect(results.summary).toMatchObject({
      proven: 24,
      partiallyProven: 1,
      permanentGhosts: 0,
      duplicateMutations: 0,
      discardedEvidenceRecords: 0,
    });
  });

  it("does not overstate rendered or release readiness and preserves release identity", () => {
    const brand = readFileSync(`${root}/brand-repair-results.md`, "utf8");
    const readiness = readFileSync(`${root}/release-readiness.md`, "utf8");
    const config = readFileSync("app.config.ts", "utf8");
    expect(brand).toContain("Genuine iPhone visual verification: **NOT PROVEN**");
    expect(readiness).toContain("No build, upload, deployment");
    expect(readiness).toContain("**PARTIALLY PROVEN**");
    expect(config).toContain('env("APP_VERSION", "1.0.14")');
    expect(config).toContain('env("APP_IOS_BUILD_NUMBER", "45")');
    expect(config).toContain('"com.aaronparry.adaptivestrengthcoach"');
  });
});
