import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/build-52-testflight-candidate";
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

describe("build 52 TestFlight candidate evidence", () => {
  it("ties the accepted production binary to the genuine route repair without overstating iPhone verification", () => {
    for (const file of required) expect(existsSync(`${root}/${file}`), file).toBe(true);

    const config = readFileSync("app.config.ts", "utf8");
    const plist = readFileSync("ios/AdaptiveStrengthCoach/Info.plist", "utf8");
    const project = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj", "utf8");
    const summary = readFileSync(`${root}/executive-summary.md`, "utf8");
    const verification = readFileSync(`${root}/pre-build-verification.md`, "utf8");
    const build = readFileSync(`${root}/build-result.md`, "utf8");
    const upload = readFileSync(`${root}/upload-result.md`, "utf8");
    const receipt = readFileSync(`${root}/app-store-connect-receipt.md`, "utf8");
    const trace = readFileSync(`${root}/source-to-binary-traceability.md`, "utf8");
    const checklist = readFileSync(`${root}/iPhone-verification-checklist.md`, "utf8");

    expect(config).toContain('env("APP_VERSION", "1.0.17")');
    expect(config).toContain('env("APP_IOS_BUILD_NUMBER", "52")');
    expect(config).toContain("com.aaronparry.adaptivestrengthcoach");
    expect(plist).toMatch(/CFBundleShortVersionString[\s\S]*?<string>1\.0\.17<\/string>/);
    expect(plist).toMatch(/CFBundleVersion[\s\S]*?<string>52<\/string>/);
    expect(project.match(/MARKETING_VERSION = 1\.0\.17;/g)?.length).toBe(3);
    expect(project.match(/CURRENT_PROJECT_VERSION = 52;/g)?.length).toBe(3);

    expect(summary).toContain("Genuine retained-state verification on the owner's iPhone remains **NOT PROVEN**");
    expect(verification).toContain("385 files, 2,359 tests passed");
    expect(verification).toContain("386 files, 2,360 tests passed");
    expect(verification).toContain("mounted `1`, competing `0`, UI `0`");
    expect(build).toContain("`c969f577-11cb-4bb2-9dde-9dc530f3ff93`");
    expect(build).toContain("`f2dd468d37b7756ba7fa40be778db79361f17d59`");
    expect(upload).toContain("`cd96192e-7b35-49a5-b85e-d74fd2594e56`");
    expect(upload).toContain("No App Review submission");
    expect(receipt).toContain("processing state: `VALID`");
    expect(receipt).toContain("TestFlight internal build state: `IN_BETA_TESTING`");
    expect(trace).toContain("`3d52cd057e60b1d8c34eb74c98ed8067b1caf7d2`");
    expect(trace).toContain("This proves the production-route repair is an ancestor of the uploaded binary");
    expect(checklist).toContain("Uploading and processing a binary do not complete this checklist");
  });
});
