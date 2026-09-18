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
    const receipt = readFileSync(`${root}/app-store-connect-receipt.md`, "utf8");
    const build = readFileSync(`${root}/build-result.md`, "utf8");
    const checklist = readFileSync(`${root}/iPhone-verification-checklist.md`, "utf8");
    const currentVersion = config.match(/env\("APP_VERSION", "(\d+)\.(\d+)\.(\d+)"\)/);
    expect(currentVersion).not.toBeNull();
    const [, major, minor, patch] = (currentVersion ?? []).map(Number);
    const isAtLeast1_0_15 = major > 1 || (major === 1 && (minor > 0 || (minor === 0 && patch >= 15)));
    expect(isAtLeast1_0_15).toBe(true);
    const currentBuild = Number(config.match(/env\("APP_IOS_BUILD_NUMBER", "(\d+)"\)/)?.[1]);
    expect(currentBuild).toBeGreaterThanOrEqual(47);
    expect(metadata).toContain("`com.aaronparry.adaptivestrengthcoach`");
    expect(metadata).toContain("| Android version code | `1` | unchanged | unchanged |");
    expect(build).toContain("`f186502a-3695-4b7a-abb0-2854e996b8ac`");
    expect(upload).toContain("`bc9f21ee-bdfd-40af-b284-94c5184e1224`");
    expect(upload).toContain("App Review submission and public release remain prohibited and did not occur");
    expect(receipt).toContain("Apple status at handoff: processing");
    expect(receipt).toContain("Build number: `47`");
    expect(checklist).toContain("Uploading and processing a binary do not complete this checklist");
  });
});
