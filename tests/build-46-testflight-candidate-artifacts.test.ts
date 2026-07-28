import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/build-46-testflight-candidate";
const required = [
  "executive-summary.md",
  "starting-state.md",
  "release-metadata.md",
  "pre-build-verification.md",
  "build-command-and-resolution.md",
  "build-result.md",
  "upload-result.md",
  "app-store-connect-receipt.md",
  "source-to-binary-traceability.md",
  "iPhone-verification-checklist.md",
  "remaining-findings.md",
] as const;

describe("Build 46 TestFlight candidate artifacts", () => {
  it("keeps the candidate identity consistent without authorising public release", () => {
    for (const file of required) expect(existsSync(`${root}/${file}`), file).toBe(true);
    const config = readFileSync("app.config.ts", "utf8");
    const metadata = readFileSync(`${root}/release-metadata.md`, "utf8");
    const upload = readFileSync(`${root}/upload-result.md`, "utf8");
    const checklist = readFileSync(`${root}/iPhone-verification-checklist.md`, "utf8");
    expect(config).toContain('env("APP_VERSION", "1.0.15")');
    expect(config).toContain('env("APP_IOS_BUILD_NUMBER", "47")');
    expect(metadata).toContain("`com.aaronparry.adaptivestrengthcoach`");
    expect(metadata).toContain("| Android version code | `1` | unchanged |");
    expect(upload).toContain("App Review submission and public release remain prohibited");
    expect(checklist).toContain("Uploading a binary does not complete this checklist");
  });
});
