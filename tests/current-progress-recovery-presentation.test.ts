import { describe, expect, it } from "vitest";
import { buildCurrentProgressRecoveryPresentationInput, isCurrentRecoveryAction } from "@/domain/training/current-progress-recovery-presentation";
import { withoutLegacyRecoveryCopyAuthority } from "@/domain/training/legacy-progress-copy-presentation";

describe("current Progress recovery presentation", () => {
  it("makes only persisted or active recovery states actionable", () => {
    const recommended = buildCurrentProgressRecoveryPresentationInput({ status: "recovery_recommended", reason: "persisted_deload_decision", historicalWarning: "none" });
    const active = buildCurrentProgressRecoveryPresentationInput({ status: "recovery_active", reason: "current_deload_microcycle", historicalWarning: "none" });
    const warning = buildCurrentProgressRecoveryPresentationInput({ status: "watch", reason: "historical_fatigue_pattern", historicalWarning: "fatigue_pattern_observed" });

    expect(recommended.priority).toBe(true);
    expect(active.priority).toBe(true);
    expect(warning.priority).toBe(false);
    expect(isCurrentRecoveryAction(warning)).toBe(false);
  });

  it("keeps unavailable and compatibility state non-actionable", () => {
    expect(buildCurrentProgressRecoveryPresentationInput({ status: "assessment_unavailable", reason: "current_assessment_unavailable" }).priority).toBe(false);
    expect(buildCurrentProgressRecoveryPresentationInput({ status: "compatibility", reason: "missing_current_plan_identity" }).priority).toBe(false);
  });

  it("does not let a legacy deload title recreate recovery copy", () => {
    const warning = buildCurrentProgressRecoveryPresentationInput({ status: "watch", reason: "historical_fatigue_pattern", historicalWarning: "fatigue_pattern_observed" });
    expect(withoutLegacyRecoveryCopyAuthority({ hasEnoughHistory: true, recommendationTitle: "Plan a deload", recommendationMessage: "Legacy only.", recommendationReasons: ["Legacy fatigue"] }, warning)).toMatchObject({
      recommendationTitle: undefined,
      recommendationMessage: undefined,
      recommendationReasons: [],
    });
  });
});
