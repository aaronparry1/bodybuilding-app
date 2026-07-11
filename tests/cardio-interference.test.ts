import { describe, expect, it } from "vitest";
import { evaluateCardioInterference } from "@/domain/training/cardio-interference";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";

describe("cardio interference rules", () => {
  it("allows easy recovery cardio around lifting", () => {
    const result = evaluateCardioInterference({
      sessionType: "recovery_cardio",
      modality: "outdoor_walk",
      perceivedEase: "easy",
      nextLiftingContext: "heavy_lower",
    });

    expect(result.verdict).toBe("allowed");
  });

  it("avoids hard lower-body conditioning before heavy squat or deadlift work", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      modality: "sled_push",
      perceivedEase: "hard",
      goal: "build_strength",
      nextLiftingContext: "heavy_lower",
    });

    expect(result.verdict).toBe("avoid");
    expect(result.suggestedAlternative).toContain("Recovery Cardio");
  });

  it("suppresses hard conditioning during taper/event week", () => {
    const result = evaluateCardioInterference({
      sessionType: "performance_conditioning",
      modality: "run",
      eventTaperPhase: "event_week",
      goal: "powerlifting_meet",
    });

    expect(result.verdict).toBe("avoid");
    expect(result.reason).toContain("Recovery only");
  });

  it("cautions capacity cardio when systemic fatigue is moderate", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      modality: "rower",
      perceivedEase: "moderate",
      recentLiftingFatigue: fatigue("systemic", "moderate"),
    });

    expect(result.verdict).toBe("caution");
  });

  it("cautions capacity cardio before heavy lower work even before modality is chosen", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      goal: "build_strength",
      nextLiftingContext: "squat_focused",
    });

    expect(result.verdict).toBe("caution");
    expect(result.reason).toContain("Heavy squats");
  });

  it("avoids performance conditioning before heavy lower work for non-athletic goals", () => {
    const result = evaluateCardioInterference({
      sessionType: "performance_conditioning",
      goal: "build_strength",
      nextLiftingContext: "heavy_lower",
    });

    expect(result.verdict).toBe("avoid");
    expect(result.suggestedAlternative).toContain("Recovery Cardio");
  });

  it("avoids capacity work when lifting fatigue is high", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      modality: "assault_bike",
      perceivedEase: "moderate",
      recentLiftingFatigue: fatigue("mixed", "high"),
    });

    expect(result.verdict).toBe("avoid");
    expect(result.reason).toContain("Lifting fatigue");
  });

  it("suggests recovery cardio instead of capacity cardio when interference risk is high", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      modality: "run",
      perceivedEase: "hard",
      goal: "build_muscle_and_strength",
      nextLiftingContext: "heavy_lower",
    });

    expect(result.verdict).toBe("avoid");
    expect(result.reason).toBe("Heavy legs are next. Keep this easy.");
    expect(result.suggestedAlternative).toBe("Recovery Cardio: easy walk or easy bike.");
  });

  it("treats deadlift-focused lifting context like heavy lower-body work", () => {
    const result = evaluateCardioInterference({
      sessionType: "capacity_cardio",
      modality: "rower",
      perceivedEase: "hard",
      goal: "build_strength",
      nextLiftingContext: "deadlift_focused",
    });

    expect(result.verdict).toBe("avoid");
    expect(result.reason).toContain("Deadlift work");
  });
});

function fatigue(classification: FatigueClassifierResult["classification"], severity: FatigueClassifierResult["severity"]): FatigueClassifierResult {
  return {
    classification,
    severity,
    confidence: severity === "high" ? "high" : "medium",
    evidence: ["Fatigue evidence."],
    recommendedResponse: "Hold broad progression.",
    affectedExerciseIds: [],
    affectedMuscles: [],
  };
}
