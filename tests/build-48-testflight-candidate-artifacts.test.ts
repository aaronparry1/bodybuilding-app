import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/build-48-testflight-candidate";
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

describe("replacement TestFlight candidate artifacts", () => {
  it("records one consistent production build and submission without overstating iPhone verification", () => {
    for (const file of required) expect(existsSync(`${root}/${file}`), file).toBe(true);

    const config = readFileSync("app.config.ts", "utf8");
    const plist = readFileSync("ios/AdaptiveStrengthCoach/Info.plist", "utf8");
    const project = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj", "utf8");
    const metadata = readFileSync(`${root}/release-metadata.md`, "utf8");
    const build = readFileSync(`${root}/build-result.md`, "utf8");
    const upload = readFileSync(`${root}/upload-result.md`, "utf8");
    const receipt = readFileSync(`${root}/app-store-connect-receipt.md`, "utf8");
    const trace = readFileSync(`${root}/source-to-binary-traceability.md`, "utf8");
    const checklist = readFileSync(`${root}/iPhone-verification-checklist.md`, "utf8");
    const verification = readFileSync(`${root}/pre-build-verification.md`, "utf8");

    expect(config).toMatch(/env\("APP_VERSION", "\d+\.\d+\.\d+"\)/);
    const configuredBuild = Number(config.match(/env\("APP_IOS_BUILD_NUMBER", "(\d+)"\)/)?.[1]);
    expect(configuredBuild).toBeGreaterThanOrEqual(50);
    expect(config).toContain("com.aaronparry.adaptivestrengthcoach");
    const plistBuild = Number(plist.match(/CFBundleVersion[\s\S]*?<string>(\d+)<\/string>/)?.[1]);
    expect(plistBuild).toBeGreaterThanOrEqual(50);
    expect(project.match(/MARKETING_VERSION = \d+\.\d+\.\d+;/g)?.length).toBeGreaterThan(0);
    const projectBuilds = [...project.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map((match) => Number(match[1]));
    expect(projectBuilds.length).toBeGreaterThan(0);
    expect(projectBuilds.every((buildNumber) => buildNumber >= 50)).toBe(true);

    expect(metadata).toContain("`1.0.16`");
    expect(metadata).toContain("`50`");
    expect(metadata).toContain("`ITMS-90062`");
    expect(metadata).toContain("`ITMS-90186`");
    expect(build).toContain("`2b7e3589-d8e8-4765-aa7f-798bc23a20b0`");
    expect(build).toContain("`d5038b4f167358d17d56fcef3598acfb0061a1d5`");
    expect(upload).toContain("`aa024d43-5abf-41d3-a5d6-af4a60fef719`");
    expect(upload).toContain("App Review submission and public release remain prohibited and did not occur");
    expect(receipt).toContain("Apple status at handoff: processing");
    expect(receipt).toContain("TestFlight build availability: **NOT PROVEN**");
    expect(trace).toContain("`dfaebe7496c4b3ec5c3c954dac3acf5642bc16f4`");
    expect(trace).toContain("`d0981bf8c94ecc7e249fd80ec336d1df7c7c4f16`");
    expect(checklist).toContain("Uploading and processing a binary do not complete this checklist");
    expect(verification).toContain("mounted `1`, competing `0`, UI `0`");
  });
});
