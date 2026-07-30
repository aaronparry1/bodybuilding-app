import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = "qa-reports/onboarding-active-workout-deadlock-repair";
const required = [
  "genuine-device-evidence.md",
  "contradictory-state-root-cause.md",
  "authority-and-hydration-trace.md",
  "unified-existing-user-contract.md",
  "deadlock-repair.md",
  "retained-update-fixture.md",
  "data-preservation.md",
  "rendered-results.md",
  "false-certification-postmortem.md",
  "protected-regressions.md",
  "release-readiness.md",
] as const;

describe("onboarding active-workout deadlock repair evidence", () => {
  it("keeps the complete deterministic evidence set internally consistent", () => {
    const reports = Object.fromEntries(
      required.map((name) => [name, readFileSync(`${root}/${name}`, "utf8")]),
    );
    expect(Object.keys(reports)).toEqual([...required]);
    expect(reports["contradictory-state-root-cause.md"]).toContain("app-production/(protected)/_layout.tsx");
    expect(reports["deadlock-repair.md"]).toContain("3d52cd0");
    expect(reports["rendered-results.md"]).toContain("resolve to `/train`");
    expect(reports["rendered-results.md"]).toContain("replacement-iPhone verification is **NOT PROVEN**");
    expect(reports["release-readiness.md"]).not.toContain("device resolution is **PROVEN**");
  });

  it("never claims data clearing, automatic discard, build, upload or deployment", () => {
    const combined = required.map((name) => readFileSync(`${root}/${name}`, "utf8")).join("\n");
    expect(combined).toContain("No device data was accessed, reset, regenerated, rebound, or modified");
    expect(combined).toContain("does not certify a replacement binary");
    expect(combined).toContain("No test or rendered journey clears storage");
    expect(combined).not.toContain("deployment occurred");
  });

  it("retains production authority and rollout exclusions", () => {
    const authority = readFileSync(`${root}/authority-and-hydration-trace.md`, "utf8");
    const readiness = readFileSync(`${root}/release-readiness.md`, "utf8");
    expect(authority).toContain("mounted coaching authorities: **1**");
    expect(authority).toContain("competing coaching authorities: **0**");
    expect(authority).toContain("UI adaptation authorities: **0**");
    expect(readiness).toContain("does not:");
    expect(readiness).toContain("build or upload a binary");
    expect(readiness).toContain("release publicly");
  });
});
