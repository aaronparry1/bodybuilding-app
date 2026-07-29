import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/build-47-onboarding-p0-repair";
const required = [
  "executive-summary.md",
  "genuine-device-defects.md",
  "startup-routing-root-cause.md",
  "existing-user-routing-contract.md",
  "onboarding-field-usage-map.md",
  "duplicate-training-days-resolution.md",
  "completion-root-cause.md",
  "onboarding-transaction-contract.md",
  "migration-and-data-preservation.md",
  "rendered-results.md",
  "protected-regressions.md",
  "remaining-findings.md",
  "release-readiness.md",
] as const;

describe("Build 47 onboarding P0 repair artifacts", () => {
  it("keeps the complete deterministic evidence set", () => {
    for (const name of required) {
      expect(existsSync(`${root}/${name}`), name).toBe(true);
      expect(readFileSync(`${root}/${name}`, "utf8").length, name).toBeGreaterThan(100);
    }
  });

  it("does not overstate the defective binary or genuine-device verification", () => {
    const executive = readFileSync(`${root}/executive-summary.md`, "utf8");
    const rendered = readFileSync(`${root}/rendered-results.md`, "utf8");
    const release = readFileSync(`${root}/release-readiness.md`, "utf8");
    expect(executive).toContain("Build 47 release readiness: **UNSAFE**");
    expect(rendered).toContain("Genuine iPhone replacement | **NOT PROVEN**");
    expect(release).toContain("No build, upload, App Store submission, deployment, or release occurred");
    expect(release).toContain("a new iOS build number");
  });

  it("records all 32 required cases and preserves architecture authority", () => {
    const regressions = readFileSync(`${root}/protected-regressions.md`, "utf8");
    for (let index = 1; index <= 32; index += 1) {
      expect(regressions).toContain(`${index}.`);
    }
    expect(regressions).toContain("Mounted coaching authorities: 1");
    expect(regressions).toContain("Competing coaching authorities: 0");
    expect(regressions).toContain("UI adaptation authorities: 0");
    expect(regressions).toContain("382 files, 2,334 tests passed");
  });

  it("records separate future and historical training-frequency semantics", () => {
    const usage = readFileSync(`${root}/onboarding-field-usage-map.md`, "utf8");
    const resolution = readFileSync(`${root}/duplicate-training-days-resolution.md`, "utf8");
    expect(usage).toContain("Future sessions the athlete can sustain");
    expect(usage).toContain("Historical frequency before today");
    expect(resolution).toContain("Future schedule remains a 2–6 day choice");
    expect(resolution).toContain("stores zero");
  });
});
