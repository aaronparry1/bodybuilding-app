import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/train-navigation-and-focus-repair";
const files = [
  "genuine-device-defects.md",
  "production-route-trace.md",
  "navigation-trap-root-cause.md",
  "active-workout-navigation-contract.md",
  "exercise-navigation-redesign.md",
  "completion-affordance-audit.md",
  "state-preservation.md",
  "rendered-results.md",
  "protected-regressions.md",
  "remaining-findings.md",
  "release-readiness.md",
] as const;

const report = (name: (typeof files)[number]) => readFileSync(`${root}/${name}`, "utf8");

describe("Train navigation and focus repair evidence", () => {
  it("publishes every required deterministic artifact", () => {
    for (const file of files) expect(existsSync(`${root}/${file}`), file).toBe(true);
  });

  it("records the exact installed TestFlight source identity and production mount", () => {
    expect(report("genuine-device-defects.md")).toContain("1.0.17 (52)");
    expect(report("genuine-device-defects.md")).toContain("f2dd468d37b7756ba7fa40be778db79361f17d59");
    expect(report("production-route-trace.md")).toContain("app-production");
    expect(report("production-route-trace.md")).toContain("com.aaronparry.adaptivestrengthcoach");
  });

  it("does not overstate unavailable rendered or physical-iPhone evidence", () => {
    expect(report("rendered-results.md")).toContain("Verdict: **NOT PROVEN**");
    expect(report("rendered-results.md")).toContain("no screenshots, tap traces or viewport measurements");
    expect(report("release-readiness.md")).toContain("Verdict: **PARTIALLY PROVEN**");
    expect(report("remaining-findings.md")).toContain("current-source physical interaction: NOT PROVEN");
  });

  it("retains the one-authority boundary and records no release activity", () => {
    const protectedRegressions = report("protected-regressions.md");
    expect(protectedRegressions).toContain("mounted coaching authorities: 1");
    expect(protectedRegressions).toContain("competing coaching authorities: 0");
    expect(protectedRegressions).toContain("UI adaptation authorities: 0");
    expect(report("release-readiness.md")).toContain("No build, EAS operation, TestFlight upload, App Review submission, deployment or public release occurred.");
  });
});
