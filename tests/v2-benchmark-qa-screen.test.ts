import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const qaScreenSource = () => readFileSync("app/(protected)/v2-benchmark-qa.tsx", "utf8");
const designQaSource = () => readFileSync("app/(protected)/design-qa.tsx", "utf8");
const protectedLayoutSource = () => readFileSync("app/(protected)/_layout.tsx", "utf8");

describe("V2 benchmark QA screen", () => {
  it("is gated behind the V2 coaching QA flag", () => {
    const source = qaScreenSource();

    expect(source).toContain("isV2CoachingQaRequested");
    expect(source).toContain('<Redirect href="/(protected)/(tabs)/train"');
    expect(source).toContain("V2 coaching QA only");
  });

  it("renders benchmark sessions as workout-style cards", () => {
    const source = qaScreenSource();

    expect(source).toContain("runProductionV2CompleteSessionReviewSuite");
    expect(source).toContain("SessionCard");
    expect(source).toContain("ExerciseCard");
    expect(source).toContain("selected_exercise");
    expect(source).toContain("stimulus_id");
    expect(source).toContain("Intent");
    expect(source).toContain("Reps");
    expect(source).toContain("Load");
    expect(source).toContain("Sets");
  });

  it("does not write storage, call network, or alter workout generation", () => {
    const source = qaScreenSource();

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/AsyncStorage|SecureStore|repository\.save|saveWorkout|startWorkout/);
    expect(source).not.toContain("programme-builder");
    expect(source).not.toContain("workout generation");
  });

  it("adds the entry point only from Design QA when the flag is enabled", () => {
    const designQa = designQaSource();
    const layout = protectedLayoutSource();

    expect(designQa).toContain("showV2BenchmarkQa");
    expect(designQa).toContain("isV2CoachingQaRequested");
    expect(designQa).toContain('router.push("/(protected)/v2-benchmark-qa")');
    expect(layout).toContain('name="v2-benchmark-qa"');
  });
});
