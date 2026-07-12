import { describe, expect, it } from "vitest";
import { buildLegacyProgressJourneyActionsInput } from "@/domain/training/legacy-progress-journey-actions";
import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";

describe("legacy Progress journey-actions input", () => {
  it("extracts only the values consumed by journey presentation", () => {
    const source: StrategicCoachingViewModel = {
      hasEnoughHistory: true,
      planningModeLabel: "Guided annual plan",
      currentBlockLabel: "Hypertrophy block",
      recommendation: {
        title: "Advance to the next block",
        message: "Legacy presentation compatibility only.",
        reasons: ["Enough completed work"],
      },
    };

    expect(buildLegacyProgressJourneyActionsInput(source, true, false)).toEqual({
      strategic: { hasEnoughHistory: true, recommendationTitle: "Advance to the next block" },
      recovery: { priority: true },
      rotation: { hasRecommendation: false },
    });
  });

  it("preserves absent legacy recommendation titles without a fallback", () => {
    const source: StrategicCoachingViewModel = {
      hasEnoughHistory: false,
      planningModeLabel: "Guided annual plan",
      currentBlockLabel: "Hypertrophy block",
    };

    expect(buildLegacyProgressJourneyActionsInput(source, false, true)).toEqual({
      strategic: { hasEnoughHistory: false },
      recovery: { priority: false },
      rotation: { hasRecommendation: true },
    });
  });
});
