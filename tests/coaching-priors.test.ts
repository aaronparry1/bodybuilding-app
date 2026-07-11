import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createInitialCoachingPriors } from "@/domain/training/coaching-priors";

const input = {
  trainingExperience: "intermediate",
  trainingGoal: "build_muscle_strength",
  trainingDays: 4,
  preferredFramework: "upper_lower",
  trainingCommitment: "continuous_development",
} as const;

describe("coaching priors", () => {
  it("creates all initial coaching priors", () => {
    expect(createInitialCoachingPriors(input).map((prior) => prior.id)).toEqual([
      "training_experience",
      "training_goal",
      "training_days",
      "preferred_framework",
      "training_commitment",
    ]);
  });

  it("marks training experience as updateable from evidence", () => {
    expect(prior("training_experience")).toMatchObject({
      value: "intermediate",
      source: "user_input",
      confidence: "medium",
      isUserPreference: false,
      canBeUpdatedFromEvidence: true,
    });
  });

  it("marks user-selected goal as a stable preference", () => {
    expect(prior("training_goal")).toMatchObject({
      value: "build_muscle_strength",
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    });
  });

  it("marks training days as a stable user preference", () => {
    expect(prior("training_days")).toMatchObject({
      value: 4,
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    });
  });

  it("marks preferred framework as a stable user preference", () => {
    expect(prior("preferred_framework")).toMatchObject({
      value: "upper_lower",
      source: "user_input",
      confidence: "high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    });
  });

  it("marks training commitment as a stable user preference", () => {
    expect(prior("training_commitment")).toMatchObject({
      value: "continuous_development",
      source: "user_input",
      confidence: "very_high",
      isUserPreference: true,
      canBeUpdatedFromEvidence: false,
    });
  });

  it("is deterministic", () => {
    expect(createInitialCoachingPriors(input)).toEqual(createInitialCoachingPriors(input));
  });

  it("does not implement automatic learning yet", () => {
    const source = readFileSync("src/domain/training/coaching-priors.ts", "utf8");

    expect(source).toContain("future_response_model");
    expect(source).not.toMatch(/update.*prior/i);
    expect(source).not.toMatch(/athleteResponseModel|applyEvidence|observedPerformance/i);
  });

  it("does not use network or storage", () => {
    const source = readFileSync("src/domain/training/coaching-priors.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });
});

function prior(id: ReturnType<typeof createInitialCoachingPriors>[number]["id"]) {
  const found = createInitialCoachingPriors(input).find((item) => item.id === id);
  if (!found) throw new Error(`Missing prior ${id}`);
  return found;
}
