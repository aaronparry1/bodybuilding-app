import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical onboarding plan construction boundary", () => {
  it("coordinates canonical creation without legacy construction or persistence", () => {
    const source = readFileSync(resolve(process.cwd(), "app/(protected)/onboarding.tsx"), "utf8");
    expect(source).toContain("canonicalActivePlanState.create");
    expect(source).not.toContain("createActiveTrainingPlan");
    expect(source).not.toContain("annual-planner");
    expect(source).not.toContain("activeTrainingPlanRepository");
    expect(source).not.toContain("ActiveTrainingPlan");
    expect(source).not.toContain("blocks");
  });

  it("keeps canonical plan construction and persistence owners in the application boundary", () => {
    const source = readFileSync(resolve(process.cwd(), "src/application/training/canonical-active-plan-application.ts"), "utf8");
    expect(source).toContain("constructCanonicalActivePlanFromCanonicalInputs");
    expect(source).toContain("saveAtomically");
    expect(source).not.toContain("createActiveTrainingPlan");
  });
});
