import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const onboardingSource = () => readFileSync("app/(protected)/onboarding.tsx", "utf8");

describe("onboarding final programme screen", () => {
  it("uses the final programme confirmation title and CTA", () => {
    const source = onboardingSource();

    expect(source).toContain('title: step === "review" ? "Your Programme" : "Welcome"');
    expect(source).toContain('review: "Your Programme"');
    expect(source).toContain("ASC will use these choices to build your first programme.");
    expect(source).toContain('creationPending ? "Creating Programme…" : "Create Programme"');
  });

  it("shows all programme summary rows", () => {
    const source = onboardingSource();

    for (const label of ["Goal", "Training commitment", "Training days", "Framework", "Experience", "Recovery & Capacity", "Units"]) {
      expect(source).toContain(`SummaryRow label="${label}"`);
    }
  });

  it("moves units onto the final screen and keeps stored unit values compatible", () => {
    const source = onboardingSource();
    const reviewBlock = source.slice(source.indexOf("function ReviewPanel"), source.indexOf("function SummaryRow"));

    expect(reviewBlock).toContain("OptionList<UnitSystem>");
    expect(reviewBlock).toContain("options={unitOptions}");
    expect(source).toContain('value: "kg"');
    expect(source).toContain('value: "lb"');
    expect(source).not.toContain('value: "kilograms"');
    expect(source).not.toContain('value: "pounds"');
  });

  it("keeps kilograms and pounds off the experience screen", () => {
    const source = onboardingSource();
    const experienceBlock = source.slice(source.indexOf('{step === "experience"'), source.indexOf('{step === "recovery"'));

    expect(experienceBlock).not.toContain("Kilograms");
    expect(experienceBlock).not.toContain("Pounds");
    expect(source).not.toContain('{step === "unit"');
    expect(source).not.toContain('unit: "Measurement preference"');
  });

  it("keeps onboarding completion and generation boundaries stable", () => {
    const source = onboardingSource();

    expect(source).toContain("completeCanonicalOnboardingSetup({");
    expect(source).toContain('if (committed.status !== "saved")');
    expect(source).toContain("settings: {");
    expect(source).toContain("unit,");
    expect(source).not.toContain("generateV2Workout");
    expect(source).not.toContain("useSubscription");
  });
});
