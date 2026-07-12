import type { RecommendationEvidence } from "@/domain/training/recommendation-evidence";
import type { ExerciseRotationRecommendation } from "@/domain/training/exercise-rotation";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";
import type { StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import type { CurrentProgressRecoveryPresentationInput } from "@/domain/training/current-progress-recovery-presentation";
import type { WorkoutHistorySummary } from "@/domain/training/models";
import type { getPrimaryVolumeRecommendation } from "@/domain/training/volume-landmarks";

export type LegacyProgressPrimaryEvidenceInput = Readonly<{
  historical: { completedWorkouts: readonly WorkoutHistorySummary[]; source: RecommendationEvidence["source"] };
  strategic: { hasEnoughHistory: boolean; recommendationTitle?: string; recommendationMessage?: string; recommendationReasons: readonly string[] };
  recovery: { current: CurrentProgressRecoveryPresentationInput };
  volume: { primary: ReturnType<typeof getPrimaryVolumeRecommendation>; personalised?: PersonalisedVolumeResult | null };
  rotation: { action?: ExerciseRotationRecommendation };
}>;

export function buildLegacyProgressPrimaryEvidenceInput(input: LegacyProgressPrimaryEvidenceInput): LegacyProgressPrimaryEvidenceInput { return input; }
