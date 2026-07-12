import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";

export type LegacyProgressJourneyActionsInput = Readonly<{
  strategic: { hasEnoughHistory: boolean; recommendationTitle?: string };
  recovery: { priority: boolean };
  rotation: { hasRecommendation: boolean };
}>;

/** Temporary legacy-source extraction for journey presentation only. */
export function buildLegacyProgressJourneyActionsInput(source: StrategicCoachingViewModel, recoveryPriority: boolean, hasRotationRecommendation: boolean): LegacyProgressJourneyActionsInput {
  return {
    strategic: { hasEnoughHistory: source.hasEnoughHistory, ...(source.recommendation?.title ? { recommendationTitle: source.recommendation.title } : {}) },
    recovery: { priority: recoveryPriority },
    rotation: { hasRecommendation: hasRotationRecommendation },
  };
}
