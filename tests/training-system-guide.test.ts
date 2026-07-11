import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TRAINING_SYSTEM_GUIDE_SECTIONS } from "@/ui/training-system-guide-content";

const guideText = TRAINING_SYSTEM_GUIDE_SECTIONS.map((section) => `${section.title} ${section.bullets.join(" ")}`).join(" ");

describe("training system guide", () => {
  it("is available from Home and Plan", () => {
    const homeSource = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/index.tsx"), "utf8");
    const planSource = readFileSync(join(process.cwd(), "app/(protected)/(tabs)/programmes.tsx"), "utf8");

    expect(homeSource).toContain("TrainingSystemGuideButton");
    expect(planSource).toContain("TrainingSystemGuideButton");
  });

  it("has the required title and sections", () => {
    expect(readFileSync(join(process.cwd(), "src/ui/training-system-guide.tsx"), "utf8")).toContain("How Adaptive Strength Coach Works");
    expect(TRAINING_SYSTEM_GUIDE_SECTIONS.map((section) => section.title)).toEqual([
      "Why Adaptive Strength Coach Exists",
      "The Problem With Most Programmes",
      "Push. Hold. Pull Back.",
      "Why We Don't Use RPE",
      "Muscle Growth Isn't Just Weight",
      "Session Prep and Warm-Up Sets",
      "Rep Ranges and Target Zones",
      "Strength Isn't Hypertrophy",
      "Recovery Windows",
      "Powerlifting Meet",
      "Recovery Is Training",
      "What Makes Adaptive Strength Coach Different",
      "What You Can Expect",
    ]);
  });

  it("explains required sets, target range, soft cap, and warm-ups", () => {
    expect(guideText).toContain("Required sets finish the exercise.");
    expect(guideText).toContain("Target range is where useful work lives.");
    expect(guideText).toContain("Soft cap is the guardrail, not the goal.");
    expect(guideText).toContain("Warm-ups help you prepare. They do not count as work.");
    expect(guideText).toContain("A warm-up set never sets your working weight.");
    expect(guideText).toContain("Session Prep happens before the workout.");
    expect(guideText).toContain("Warm-Up Sets happen inside an exercise.");
    expect(guideText).toContain("Neither Session Prep nor Warm-Up Sets count toward progression");
    expect(guideText).toContain("A rep range is a valid zone, not a staircase where only the top counts.");
    expect(guideText).toContain("Target Zone is the app's current best aim for that exercise");
    expect(guideText).toContain("Power work stays sharp. Peak work stays specific. Recovery Window work stays easy.");
  });

  it("explains the autoregulation theory and push, hold, pull back decisions", () => {
    expect(guideText).toContain("Training is individual. Progress should be individual too.");
    expect(guideText).toContain("should we push, should we hold, or should we pull back?");
    expect(guideText).toContain("No RPE or RIR required.");
    expect(guideText).toContain("Push: performance is strong and recovery looks under control.");
    expect(guideText).toContain("Hold: progress is happening, but the cost is climbing.");
    expect(guideText).toContain("Pull back: performance is declining repeatedly");
    expect(guideText).toContain("You will not always add weight. That is the point.");
  });

  it("explains block-specific logic, load progression, and cardio settings", () => {
    expect(guideText).toContain("Hypertrophy builds muscle and work capacity.");
    expect(guideText).toContain("Power builds fast force production.");
    expect(guideText).toContain("Recovery Windows lower stress so the next push has somewhere to go.");
    expect(guideText).toContain("The roadmap creates the opportunity. Your data decides the dose.");
    expect(guideText).toContain("100kg x 12 in Hypertrophy does not automatically become 100kg x 5 in Strength.");
    expect(guideText).toContain("More weight is not always the answer.");
    expect(guideText).toContain("Recovery Cardio is low-fatigue work that supports recovery and aerobic base.");
    expect(guideText).toContain("Capacity Cardio builds the engine");
    expect(guideText).not.toContain("Lose Fat is still performance-based coaching.");
    expect(guideText).toContain("Powerlifting Meet works backwards from the meet date.");
  });

  it("explains differentiation, swaps, and event taper logic", () => {
    expect(guideText).toContain("Performance-based autoregulation");
    expect(guideText).toContain("Volume learning");
    expect(guideText).toContain("Fatigue classification");
    expect(guideText).toContain("Strength-specific variation logic");
    expect(guideText).toContain("Pain, unavailable equipment, dislike, and temporary skips are treated differently.");
    expect(guideText).toContain("Powerlifting Meet plans work backwards from the date.");
    expect(guideText).toContain("Late phases reduce fatigue and novelty");
    expect(guideText).toContain("The app is smart. Not psychic.");
  });

  it("has an accessible close action and avoids forbidden medical claims or exact engine disclosure", () => {
    const source = readFileSync(join(process.cwd(), "src/ui/training-system-guide.tsx"), "utf8");
    const lowerGuide = guideText.toLowerCase();

    expect(source).toContain("Close How Adaptive Strength Coach Works guide");
    expect(source).toContain("Close guide");
    expect(lowerGuide).not.toMatch(/\bfix(?:es)? pain\b/);
    expect(lowerGuide).not.toMatch(/\bcure(?:s|d)?\b/);
    expect(lowerGuide).not.toContain("rehab");
    expect(lowerGuide).not.toContain("push through pain");
    expect(lowerGuide).not.toContain("scientifically proven best");
    expect(lowerGuide).not.toContain("exact algorithm");
    expect(lowerGuide).not.toContain("threshold");
    expect(lowerGuide).not.toContain("scoring system");
    expect(lowerGuide).not.toContain("progression formula");
    expect(lowerGuide).not.toContain("fatigue calculation");
  });
});
