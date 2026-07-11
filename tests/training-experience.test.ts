import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getTrainingExperience, isTrainingExperienceId, trainingExperiences } from "@/domain/training/training-experience";

describe("training experience", () => {
  it("defines the three approved experience levels", () => {
    expect(trainingExperiences.map((experience) => experience.id)).toEqual(["beginner", "intermediate", "advanced"]);
    expect(trainingExperiences.map((experience) => experience.displayName)).toEqual(["Beginner", "Intermediate", "Advanced"]);
  });

  it("uses evidence-based descriptions", () => {
    expect(getTrainingExperience("beginner").description).toBe(
      "New to structured resistance training, returning after a long break, or still building consistent technique and training habits.",
    );
    expect(getTrainingExperience("intermediate").description).toBe(
      "Training consistently with good technique and progressing reliably using structured programmes.",
    );
    expect(getTrainingExperience("advanced").description).toBe(
      "Several years of consistent lifting experience with strong technique, slower progress, and a need for more precise programming.",
    );
  });

  it("stores starting coaching assumptions as priors only", () => {
    expect(getTrainingExperience("beginner").initialCoachingAssumptions).toEqual([
      "slower progression assumptions",
      "lower starting coaching confidence",
      "simpler exercise selection",
      "slower exercise rotation",
      "conservative complexity",
    ]);
    expect(getTrainingExperience("intermediate").initialCoachingAssumptions).toContain("balanced progression");
    expect(getTrainingExperience("advanced").initialCoachingAssumptions).toContain("higher coaching confidence after evidence accumulates");
    expect(getTrainingExperience("advanced").coachingSummary).toContain("only after evidence accumulates");
  });

  it("rejects unsupported experience ids", () => {
    expect(isTrainingExperienceId("beginner")).toBe(true);
    expect(isTrainingExperienceId("novice")).toBe(false);
    expect(() => getTrainingExperience("novice" as never)).toThrow(/unsupported/i);
  });

  it("removes kilograms and pounds from the experience screen", () => {
    const source = readFileSync("app/(protected)/onboarding.tsx", "utf8");
    const experienceBlock = source.slice(source.indexOf('{step === "experience"'), source.indexOf('{step === "unit"'));

    expect(source).toContain("How would you describe your lifting experience?");
    expect(source).toContain("This helps ASC choose an appropriate starting coaching strategy. It will continue learning from your training over time.");
    expect(experienceBlock).not.toContain("Kilograms");
    expect(experienceBlock).not.toContain("Pounds");
    expect(source).toContain("SummaryRow label=\"Units\"");
    expect(source).toContain("OptionList<UnitSystem>");
    expect(source).not.toContain('unit: "Measurement preference"');
  });

  it("is deterministic", () => {
    expect(getTrainingExperience("intermediate")).toEqual(getTrainingExperience("intermediate"));
    expect([...trainingExperiences]).toEqual([...trainingExperiences]);
  });

  it("does not use network or storage", () => {
    const source = readFileSync("src/domain/training/training-experience.ts", "utf8");

    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bawait\b/);
    expect(source).not.toMatch(/AsyncStorage|localStorage|repository|supabase/i);
  });
});
