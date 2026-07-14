import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createActiveTrainingPlan } from "@/domain/training/plan-setup";
import { getSuccessModel } from "@/domain/training/success-model";
import { resolveCardioDose } from "@/domain/training/cardio-dose";
import { TRAINING_SYSTEM_GUIDE_SECTIONS } from "@/ui/training-system-guide-content";

const onboardingSource = () => readFileSync(join(process.cwd(), "app/(protected)/onboarding.tsx"), "utf8");
const guideText = () => TRAINING_SYSTEM_GUIDE_SECTIONS.map((section) => `${section.title} ${section.bullets.join(" ")}`).join(" ");

describe("Adaptive Strength Coach positioning", () => {
  it("uses the new app name in app metadata", () => {
    const config = readFileSync(join(process.cwd(), "app.config.ts"), "utf8");
    const eas = readFileSync(join(process.cwd(), "eas.json"), "utf8");

    expect(config).toContain("Adaptive Strength Coach");
    expect(eas).toContain("Adaptive Strength Coach");
    expect(config).not.toContain("Iron Logic");
    expect(eas).not.toContain("Iron Logic");
  });

  it("shows the new onboarding goals and removes old goal labels", () => {
    const source = onboardingSource();

    for (const label of ["Hypertrophy", "Strength", "Powerbuilding", "Athletic Performance", "Powerlifting meet"]) {
      expect(source).toContain(`label: "${label}"`);
    }

    expect(source).not.toContain('label: "Build Strength"');
    expect(source).not.toContain('label: "Build Muscle & Strength"');
    expect(source).not.toContain('label: "Get Leaner"');
    expect(source).not.toContain('label: "Powerlifting Meet"');
    expect(source).not.toContain("Just Help Me Train");
    expect(source).not.toContain("Prepare For Event");
  });

  it("maps Lose Fat to body recomposition with sustainable annual planning", () => {
    const plan = createActiveTrainingPlan({
      goal: "get_leaner",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 4,
      preferredSplit: "upper_lower",
      experienceLevel: "intermediate",
    });
    const totalWeeks = plan.blocks.reduce((sum, block) => sum + block.durationWeeks, 0);

    expect(plan.goal).toBe("get_leaner");
    expect(plan.programmeGoal).toBe("body_recomposition");
    expect(totalWeeks).toBeGreaterThanOrEqual(48);
    expect(totalWeeks).toBeLessThanOrEqual(52);
    expect(plan.blocks.map((block) => block.type)).toContain("deload");
  });

  it("maps Powerlifting Meet to meet-date planning and specificity", () => {
    const plan = createActiveTrainingPlan(
      {
        goal: "powerlifting_meet",
        planningChoice: "custom_date_event",
        eventType: "powerlifting_meet",
        targetDate: "2026-12-01",
        equipmentPreset: "full_gym",
        daysPerWeek: 4,
        preferredSplit: "upper_lower",
        experienceLevel: "intermediate",
      },
      "2026-06-01T00:00:00.000Z",
    );

    expect(plan.goal).toBe("powerlifting_meet");
    expect(plan.name).toBe("Powerlifting Meet Plan");
    expect(plan.blocks.map((block) => block.type)).toContain("peak");
    expect(plan.blocks.flatMap((block) => block.notes).join(" ")).toContain("specific");
  });

  it("updates success models and recovery/cardio bias for the new goals", () => {
    expect(getSuccessModel("get_leaner").primarySuccess.join(" ")).toContain("strength maintained");
    expect(getSuccessModel("powerlifting_meet").primarySuccess.join(" ")).toContain("squat, bench, and deadlift");

    const leanerCardio = resolveCardioDose({
      goal: "get_leaner",
      recoveryCardioPreference: "recommended",
      currentWeeklyCardioSessions: [],
    });

    expect(leanerCardio.suggestedSessionType).toBe("recovery_cardio");
    expect(leanerCardio.reason).toContain("Start low");
  });

  it("updates the guide and keeps old goal names out of user-facing guide copy", () => {
    const source = readFileSync(join(process.cwd(), "src/ui/training-system-guide.tsx"), "utf8");
    const text = guideText();

    expect(source).toContain("How Adaptive Strength Coach Works");
    expect(text).toContain("Recovery Window is a planned opportunity to reduce fatigue");
    expect(text).toContain("Powerlifting Meet works backwards from the meet date.");
    expect(text).not.toContain("Just Help Me Train");
    expect(text).not.toContain("Prepare For Event");
  });
});
