import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical History detail route boundary", () => {
  it("uses canonical projection only and has no legacy session persistence", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(protected)/history/[id].tsx"), "utf8");
    expect(source).toContain("projectCanonicalTrainSession");
    expect(source).toContain("canonicalRecordedSessionLedger");
    expect(source).not.toContain("workoutSessionRepository");
    expect(source).not.toContain("WorkoutSession");
    expect(source).not.toContain("editLoggedSetInSession");
    expect(source).not.toContain("deleteLoggedSetFromSession");
  });
});
