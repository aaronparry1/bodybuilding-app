import { describe, expect, it } from "vitest";
import { buildLegacyProgressActionFlowInput } from "@/domain/training/legacy-progress-action-flow";
import { buildCurrentProgressRecoveryPresentationInput } from "@/domain/training/current-progress-recovery-presentation";
const recovery = buildCurrentProgressRecoveryPresentationInput({ status: "watch", reason: "historical_fatigue_pattern", historicalWarning: "fatigue_pattern_observed" });

describe("legacy Progress action-flow input", () => {
  it("preserves separate candidates and ordering source without selecting one", () => {
    const input = buildLegacyProgressActionFlowInput({
      history: { hasEnoughHistory: true },
      recovery: { current: recovery },
      rotation: { current: { status: "no_rotation", reason: "no_current_rotation" } },
      volume: { recommendation: null },
      strategic: { transitionAvailable: true, transitionReason: "Planned endpoint reached." },
      ordering: { source: "history" },
    });

    expect(input).toEqual({
      history: { hasEnoughHistory: true },
      recovery: { current: recovery },
      rotation: { current: { status: "no_rotation", reason: "no_current_rotation" } },
      volume: { recommendation: null },
      strategic: { transitionAvailable: true, transitionReason: "Planned endpoint reached." },
      ordering: { source: "history" },
    });
  });
});
