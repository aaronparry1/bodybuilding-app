import type { FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import type { ExerciseRotationRecommendation } from "@/domain/training/exercise-rotation";
import type { RecommendationEvidence } from "@/domain/training/recommendation-evidence";
import type { PersonalisedVolumeResult } from "@/domain/training/personalised-volume";
import type { DeloadProfile } from "@/domain/training/deload-prescription";

export type LegacyProgressRecoveryActionCandidate = Readonly<{
  accepted: boolean;
  acceptedAt?: string;
  priority: boolean;
  fatigue: FatigueClassifierResult;
  deloadProfile?: DeloadProfile;
  recommendationReasons: readonly string[];
}>;

export type LegacyProgressRotationActionCandidate = Readonly<{ action?: ExerciseRotationRecommendation }>;
export type LegacyProgressVolumeActionCandidate = Readonly<{ recommendation?: PersonalisedVolumeResult | null }>;
export type LegacyProgressStrategicActionCandidate = Readonly<{ transitionAvailable: boolean; transitionReason?: string }>;

export type LegacyProgressActionFlowInput = Readonly<{
  history: { hasEnoughHistory: boolean };
  recovery: LegacyProgressRecoveryActionCandidate;
  rotation: LegacyProgressRotationActionCandidate;
  volume: LegacyProgressVolumeActionCandidate;
  strategic: LegacyProgressStrategicActionCandidate;
  ordering: { source: RecommendationEvidence["source"] };
}>;

/** Temporary legacy-source decomposition for action-flow presentation only. */
export function buildLegacyProgressActionFlowInput(input: LegacyProgressActionFlowInput): LegacyProgressActionFlowInput {
  return input;
}
