import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Extra Session route boundary", () => {
  it("uses canonical construction and contains no legacy workout generation or persistence", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(protected)/programmes/ai.tsx"), "utf8");
    expect(source).toContain("constructCanonicalExtraSession");
    expect(source).toContain("canonicalActivePlanState");
    expect(source).not.toContain("generateExtraWorkout");
    expect(source).not.toContain("extra-session-generator");
    expect(source).not.toContain("workoutSessionRepository");
    expect(source).not.toContain("programmeRepository");
    expect(source).not.toContain("ad-hoc-workout-generator");
  });
});
