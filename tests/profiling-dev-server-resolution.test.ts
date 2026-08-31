import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profiling development-server resolution", () => {
  it("allows Expo dev-client to select the physical-device packager host", () => {
    const source = readFileSync("ios/AdaptiveStrengthCoach/AppDelegate.swift", "utf8");

    expect(source).toContain("#if DEBUG || ASC_QA");
    expect(source).toContain("RCTBundleURLProvider.sharedSettings().jsBundleURL");
    expect(source).not.toContain('jsLocation = "localhost:8081"');
  });
});
