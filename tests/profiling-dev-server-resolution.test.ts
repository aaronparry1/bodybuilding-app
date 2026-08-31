import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profiling development-server resolution", () => {
  it("accepts a QA-only physical-device packager host without embedding one", () => {
    const source = readFileSync("ios/AdaptiveStrengthCoach/AppDelegate.swift", "utf8");
    const project = readFileSync("ios/AdaptiveStrengthCoach.xcodeproj/project.pbxproj", "utf8");
    const profilingPlist = readFileSync("ios/AdaptiveStrengthCoach/Info-Profiling.plist", "utf8");

    expect(source).toContain("#if ASC_QA");
    expect(source).toContain('environment["ASC_METRO_HOST"]');
    expect(source).toContain('environment["ASC_METRO_PORT"]');
    expect(source).toContain('provider.jsLocation = "\\(host):\\(port)"');
    expect(source).not.toContain('jsLocation = "localhost:8081"');
    expect(source).not.toContain("192.168.");
    const profiling = project.slice(project.indexOf("DQA00000000000000000001"));
    expect(profiling).toContain('INFOPLIST_FILE = "AdaptiveStrengthCoach/Info-Profiling.plist"');
    expect(profilingPlist).toContain("NSLocalNetworkUsageDescription");
    expect(readFileSync("ios/AdaptiveStrengthCoach/Info.plist", "utf8")).not.toContain("NSLocalNetworkUsageDescription");
  });
});
