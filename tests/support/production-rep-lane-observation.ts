import { resolveTrainingLane } from "@/domain/training/block-training-lanes";
import { resolveRepRange } from "@/domain/training/rep-range-strategy";
import type { BlockType } from "@/domain/training/annual-models";
import type { ExerciseFamily, ExerciseRole } from "@/domain/training/models";

export type ProductionRepLaneDecisionObservation = Readonly<{
  evidenceLevel: "direct_helper_result";
  rep: Readonly<{ minimum: number; maximum: number }>;
  lane: string;
  blockType: BlockType;
  exerciseRole: ExerciseRole;
  exerciseFamily?: ExerciseFamily;
}>;

/** Test-only read-only adapter. It invokes production helpers and never predicts authority. */
export function observeProductionRepLaneDecision(input: Readonly<{ blockType: BlockType; exerciseRole: ExerciseRole; exerciseFamily?: ExerciseFamily; programmeSlotOverride?: { min: number; max: number } }>): ProductionRepLaneDecisionObservation {
  const rep = resolveRepRange(input);
  const lane = resolveTrainingLane({ blockType: input.blockType, exerciseRole: input.exerciseRole, exerciseFamily: input.exerciseFamily });
  return { evidenceLevel: "direct_helper_result", rep: { minimum: rep.min, maximum: rep.max }, lane, blockType: input.blockType, exerciseRole: input.exerciseRole, ...(input.exerciseFamily ? { exerciseFamily: input.exerciseFamily } : {}) };
}
