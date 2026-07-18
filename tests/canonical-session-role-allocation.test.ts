import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("canonical session role allocation", () => {
  it("uses explicit role contracts instead of a universal three-slot blueprint", () => {
    const source = readFileSync("src/domain/training/canonical-session-construction-pipeline.ts", "utf8");
    expect(source).toContain('role.includes("bench")');
    expect(source).toContain('role.includes("squat")');
    expect(source).toContain('role.includes("deadlift")');
    expect(source).toContain("targetReps");
    expect(source).toContain("assessCanonicalExerciseRoleSuitability");
    expect(source).toContain("resolveCanonicalExactTarget");
  });
});
