import { describe, expect, it } from "vitest";
import { buildLegacyProgressJourneyActionsInput } from "@/domain/training/legacy-progress-journey-actions";
import { buildCurrentProgressRecoveryPresentationInput } from "@/domain/training/current-progress-recovery-presentation";
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

    const recovery = buildCurrentProgressRecoveryPresentationInput({ status: "recovery_recommended", reason: "persisted_deload_decision", historicalWarning: "none" });
    expect(buildLegacyProgressJourneyActionsInput(source, recovery, { status: "no_rotation", reason: "no_current_rotation" })).toEqual({
      strategic: { hasEnoughHistory: true, recommendationTitle: "Advance to the next block" },
      recovery: { current: recovery },
      rotation: { current: { status: "no_rotation", reason: "no_current_rotation" } },
    });
  });

  it("preserves absent legacy recommendation titles without a fallback", () => {
    const source: StrategicCoachingViewModel = {
      hasEnoughHistory: false,
      planningModeLabel: "Guided annual plan",
      currentBlockLabel: "Hypertrophy block",
    };

    const recovery = buildCurrentProgressRecoveryPresentationInput({ status: "watch", reason: "historical_fatigue_pattern", historicalWarning: "fatigue_pattern_observed" });
    expect(buildLegacyProgressJourneyActionsInput(source, recovery, { status: "rotation_authorised", reason: "persistent_stall", exerciseId: "ex", interventionDecision: "substitute" })).toEqual({
      strategic: { hasEnoughHistory: false },
      recovery: { current: recovery },
      rotation: { current: { status: "rotation_authorised", reason: "persistent_stall", exerciseId: "ex", interventionDecision: "substitute" } },
    });
  });
});
