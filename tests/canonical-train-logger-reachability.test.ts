import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical Train logger reachability", () => {
  it("mounts Train through canonical lifecycle owners only", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(protected)/(tabs)/train.tsx"), "utf8");
    expect(source).toContain("startCanonicalSession");
    expect(source).toContain("recordCanonicalPerformedWork");
    expect(source).toContain("pauseCanonicalSession");
    expect(source).toContain("resumeCanonicalSession");
    expect(source).toContain("completeCanonicalSession");
    expect(source).not.toContain("useWorkoutLogger");
    expect(source).not.toContain("workoutSessionRepository");
  });

  it("does not retain the dead legacy hook", () => {
    expect(existsSync(resolve(process.cwd(), "src/features/workout-logging/use-workout-logger.ts"))).toBe(false);
  });
});
