import { describe, expect, it } from "vitest";
import { buildLegacyProgressActionFlowInput } from "@/domain/training/legacy-progress-action-flow";
import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";

const fatigue: FatigueClassifierResult = {
  classification: "systemic",
  severity: "high",
  confidence: "high",
  evidence: ["Repeated performance decline"],
  recommendedResponse: "Reduce stress.",
  affectedExerciseIds: [],
  affectedMuscles: [],
};

describe("legacy Progress action-flow input", () => {
  it("preserves separate candidates and ordering source without selecting one", () => {
    const input = buildLegacyProgressActionFlowInput({
      history: { hasEnoughHistory: true },
      recovery: { accepted: false, priority: true, fatigue, recommendationReasons: ["Legacy fatigue evidence"] },
      rotation: {},
      volume: { recommendation: null },
      strategic: { transitionAvailable: true, transitionReason: "Planned endpoint reached." },
      ordering: { source: "history" },
    });

    expect(input).toEqual({
      history: { hasEnoughHistory: true },
      recovery: { accepted: false, priority: true, fatigue, recommendationReasons: ["Legacy fatigue evidence"] },
      rotation: {},
      volume: { recommendation: null },
      strategic: { transitionAvailable: true, transitionReason: "Planned endpoint reached." },
      ordering: { source: "history" },
    });
  });
});
