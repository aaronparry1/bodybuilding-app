import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import type { CurrentProgressRecoveryPresentationInput } from "@/domain/training/current-progress-recovery-presentation";

export type LegacyProgressJourneyActionsInput = Readonly<{
  strategic: { hasEnoughHistory: boolean; recommendationTitle?: string };
  recovery: { current: CurrentProgressRecoveryPresentationInput };
  rotation: { hasRecommendation: boolean };
}>;

/** Temporary legacy-source extraction for journey presentation only. */
export function buildLegacyProgressJourneyActionsInput(source: StrategicCoachingViewModel, currentRecovery: CurrentProgressRecoveryPresentationInput, hasRotationRecommendation: boolean): LegacyProgressJourneyActionsInput {
  return {
    strategic: { hasEnoughHistory: source.hasEnoughHistory, ...(source.recommendation?.title ? { recommendationTitle: source.recommendation.title } : {}) },
    recovery: { current: currentRecovery },
    rotation: { hasRecommendation: hasRotationRecommendation },
  };
}
