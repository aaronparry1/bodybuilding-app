import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";

/** Temporary compatibility input for copy-only helpers; delete after all Progress presenter consumers migrate. */
export type LegacyProgressCopyPresentationInput = Readonly<{
  hasEnoughHistory: boolean;
  emptyMessage?: string;
  recommendationTitle?: string;
  recommendationMessage?: string;
  recommendationReasons: readonly string[];
  momentumBand?: string;
}>;

export function buildLegacyProgressCopyPresentationInput(source: StrategicCoachingViewModel): LegacyProgressCopyPresentationInput {
  return {
    hasEnoughHistory: source.hasEnoughHistory,
    ...(source.emptyMessage ? { emptyMessage: source.emptyMessage } : {}),
    ...(source.recommendation?.title ? { recommendationTitle: source.recommendation.title } : {}),
    ...(source.recommendation?.message ? { recommendationMessage: source.recommendation.message } : {}),
    recommendationReasons: [...(source.recommendation?.reasons ?? [])],
    ...(source.momentum?.band ? { momentumBand: source.momentum.band } : {}),
  };
}
