import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import type { CurrentProgressRecoveryPresentationInput } from "@/domain/training/current-progress-recovery-presentation";
import type { CurrentProgressRotationContext } from "@/domain/training/current-progress-rotation-context";

export type LegacyProgressJourneyActionsInput = Readonly<{
  strategic: { hasEnoughHistory: boolean; recommendationTitle?: string };
  recovery: { current: CurrentProgressRecoveryPresentationInput };
  rotation: { current: CurrentProgressRotationContext };
}>;

/** Temporary legacy-source extraction for journey presentation only. */
export function buildLegacyProgressJourneyActionsInput(source: StrategicCoachingViewModel, currentRecovery: CurrentProgressRecoveryPresentationInput, currentRotation: CurrentProgressRotationContext): LegacyProgressJourneyActionsInput {
  return {
    strategic: { hasEnoughHistory: source.hasEnoughHistory, ...(source.recommendation?.title ? { recommendationTitle: source.recommendation.title } : {}) },
    recovery: { current: currentRecovery },
    rotation: { current: currentRotation },
  };
}
