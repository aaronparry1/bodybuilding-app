import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profiling development-server resolution", () => {
  it("accepts a QA-only physical-device packager host without embedding one", () => {
    const source = readFileSync("ios/AdaptiveStrengthCoach/AppDelegate.swift", "utf8");

    expect(source).toContain("#if ASC_QA");
    expect(source).toContain('environment["ASC_METRO_HOST"]');
    expect(source).toContain('environment["ASC_METRO_PORT"]');
    expect(source).toContain('provider.jsLocation = "\\(host):\\(port)"');
    expect(source).not.toContain('jsLocation = "localhost:8081"');
    expect(source).not.toContain("192.168.");
  });
});
