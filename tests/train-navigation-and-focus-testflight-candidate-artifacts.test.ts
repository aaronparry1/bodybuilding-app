import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/train-navigation-and-focus-testflight-candidate";
const required = [
  "executive-summary.md",
  "starting-state.md",
  "release-metadata.md",
  "pre-build-verification.md",
  "build-result.md",
  "upload-result.md",
  "app-store-connect-receipt.md",
  "source-to-binary-traceability.md",
  "iPhone-verification-checklist.md",
  "remaining-findings.md",
] as const;

const report = (name: (typeof required)[number]) => readFileSync(`${root}/${name}`, "utf8");

describe("Train repair TestFlight candidate evidence", () => {
  it("publishes every required artifact", () => {
    for (const file of required) expect(existsSync(`${root}/${file}`), file).toBe(true);
  });

  it("ties Build 53 to the certified repair source and exact submission", () => {
    expect(report("source-to-binary-traceability.md")).toContain("71333d44befd19ab700ab97aa1b3a6b40b9213ce");
    expect(report("source-to-binary-traceability.md")).toContain("4f10250d0d7a7e710c9ced5b77a40862b2aba5e6");
    expect(report("source-to-binary-traceability.md")).toContain("d0e644035b974c7cf6299d491bdb3a15498cd904");
    expect(report("build-result.md")).toContain("31e40c45-10f5-4d95-8901-8720047c698d");
    expect(report("upload-result.md")).toContain("13e673a9-88dd-4ce7-b6fb-6f9465c009ea");
  });

  it("records consistent production identity and authority counts", () => {
    expect(report("release-metadata.md")).toContain("1.0.18");
    expect(report("release-metadata.md")).toContain("iOS build: `53`");
    expect(report("release-metadata.md")).toContain("com.aaronparry.adaptivestrengthcoach");
    expect(report("pre-build-verification.md")).toContain("mounted coaching authorities: `1`");
    expect(report("pre-build-verification.md")).toContain("competing coaching authorities: `0`");
    expect(report("pre-build-verification.md")).toContain("UI adaptation authorities: `0`");
  });

  it("records Apple processing without overstating iPhone or release status", () => {
    expect(report("app-store-connect-receipt.md")).toContain("has completed processing");
    expect(report("iPhone-verification-checklist.md")).toContain("remains **NOT PROVEN**");
    expect(report("remaining-findings.md")).toContain("Internal TestFlight group assignment — NOT PROVEN");
    expect(report("upload-result.md")).toContain("no App Review submission");
    expect(report("executive-summary.md")).toContain("No App Review submission or public release occurred");
  });
});
