import type { BlockType, TrainingBlock, TrainingYear } from "@/domain/training/annual-models";
import { completeBlock, createTrainingBlock } from "@/domain/training/annual-planner";
import { displayBlockType } from "@/domain/training/block-display";
import { buildDeloadPrescription, type DeloadProfile } from "@/domain/training/deload-prescription";
import { recordExerciseReason, type ExerciseReasonInput } from "@/domain/training/exercise-preferences";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import type { PrimaryLiftVariationSelection } from "@/domain/training/primary-lift-variations";

export interface BlockTransitionPreview {
  available: boolean;
  title: string;
  reason: string;
  nextBlockType?: BlockType;
  nextBlockLabel?: string;
}

export function getActivePlanBlock(plan: ActiveTrainingPlan): TrainingBlock | null {
  return plan.blocks.find((block) => block.id === plan.activeBlockId) ?? plan.blocks[0] ?? null;
}

export function getNextPlanBlock(plan: ActiveTrainingPlan): TrainingBlock | null {
  const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
  if (activeIndex < 0) return null;
  return plan.blocks[activeIndex + 1] ?? null;
}

export function getBlockTransitionPreview(plan: ActiveTrainingPlan): BlockTransitionPreview {
  const activeBlock = getActivePlanBlock(plan);
  if (!activeBlock) {
    return {
      available: false,
      title: "No active block",
      reason: "Set up a plan before block decisions are available.",
    };
  }

  const nextBlock = getNextPlanBlock(plan);
  const blockCompleteOrEnding = activeBlock.status === "completed" || activeBlock.currentWeek >= activeBlock.durationWeeks;
  const nextBlockLabel = nextBlock ? titleBlock(nextBlock.type) : titleBlock(activeBlock.type);

  return {
    available: blockCompleteOrEnding,
    title: nextBlock ? `Move to ${nextBlockLabel}` : plan.mode === "single_block" ? "Choose next block" : `Repeat ${titleBlock(activeBlock.type)}`,
    reason: blockCompleteOrEnding
      ? `${titleBlock(activeBlock.type)} is at week ${activeBlock.currentWeek} of ${activeBlock.durationWeeks}.`
      : `${titleBlock(activeBlock.type)} has not reached its minimum planned endpoint yet.`,
    nextBlockType: nextBlock?.type ?? activeBlock.type,
    nextBlockLabel,
  };
}

export function chooseNextSingleBlock(plan: ActiveTrainingPlan, nextBlockType: BlockType, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  const transition = getBlockTransitionPreview(plan);
  if (!transition.available || plan.mode !== "single_block") return plan;

  const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
  if (activeIndex < 0) return plan;

  const currentBlock = plan.blocks[activeIndex]!;
  const nextBlock = createTrainingBlock(nextBlockType, {
    id: `${plan.id}-single-next-${decidedAt}-${nextBlockType}`,
    status: "active",
    currentWeek: 1,
    startedAt: decidedAt,
    notes: [`Chosen after completing ${titleBlock(currentBlock.type)}.`],
  });

  const previousBlocks = plan.blocks.map((block, index) =>
    index === activeIndex ? { ...block, status: "completed" as const, completedAt: decidedAt } : index < activeIndex ? { ...block, status: "completed" as const } : { ...block, status: "completed" as const },
  );

  return {
    ...plan,
    activeBlockId: nextBlock.id,
    blocks: [...previousBlocks, nextBlock],
    recommendationState: {
      ...plan.recommendationState,
      blockDecision: { type: "advanced", blockId: currentBlock.id, decidedAt },
    },
  };
}

export function advanceActivePlanBlock(plan: ActiveTrainingPlan, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  if (!getBlockTransitionPreview(plan).available) return plan;
  const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
  if (activeIndex < 0) return plan;
  const nextBlock = plan.blocks[activeIndex + 1];
  if (!nextBlock) return repeatActivePlanBlock(plan, decidedAt);

  return {
    ...plan,
    activeBlockId: nextBlock.id,
    blocks: plan.blocks.map((block, index) => {
      if (index === activeIndex) return { ...block, status: "completed", completedAt: decidedAt };
      if (index === activeIndex + 1) return { ...block, status: "active", currentWeek: 1, startedAt: decidedAt, completedAt: undefined };
      return index < activeIndex ? { ...block, status: "completed" } : block;
    }),
    recommendationState: {
      ...plan.recommendationState,
      blockDecision: { type: "advanced", blockId: plan.activeBlockId, decidedAt },
    },
  };
}

export function repeatActivePlanBlock(plan: ActiveTrainingPlan, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  if (!getBlockTransitionPreview(plan).available) return plan;
  const activeBlock = getActivePlanBlock(plan);
  if (!activeBlock) return plan;

  return {
    ...plan,
    blocks: plan.blocks.map((block) =>
      block.id === activeBlock.id
        ? {
            ...block,
            status: "active",
            currentWeek: 1,
            startedAt: decidedAt,
            completedAt: undefined,
            notes: [...block.notes, "Repeated from coaching recommendation."],
          }
        : block,
    ),
    recommendationState: {
      ...plan.recommendationState,
      blockDecision: { type: "repeated", blockId: activeBlock.id, decidedAt },
    },
  };
}

export function decideLaterOnBlock(plan: ActiveTrainingPlan, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  if (!getBlockTransitionPreview(plan).available) return plan;
  const activeBlock = getActivePlanBlock(plan);
  if (!activeBlock) return plan;
  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      blockDecision: { type: "decided_later", blockId: activeBlock.id, decidedAt },
    },
  };
}

export function startDeloadPlan(plan: ActiveTrainingPlan, decidedAt = new Date().toISOString(), profile: DeloadProfile = "clear"): ActiveTrainingPlan {
  const activeIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
  if (activeIndex < 0) return plan;

  const current = plan.blocks[activeIndex]!;
  const prescription = buildDeloadPrescription(profile);
  const existingDeload = plan.blocks.find((block) => block.type === "deload" && block.status !== "completed");
  const deloadNotes = [
    "Accepted from coaching recommendation.",
    `${titleProfile(profile)} deload: reduce productive sets ${prescription.productiveSetReductionPercent.min}-${prescription.productiveSetReductionPercent.max}%.`,
    `${prescription.coachCopy}`,
  ];
  const deloadBlock =
    existingDeload ??
    createTrainingBlock("deload", {
      id: `${plan.id}-accepted-deload-${decidedAt}`,
      name: "Deload 1 week",
      durationWeeks: 1,
      status: "active",
      startedAt: decidedAt,
      notes: deloadNotes,
    });

  const withoutInsertedDeload = plan.blocks.filter((block) => block.id !== deloadBlock.id);
  const insertionIndex = Math.min(activeIndex + 1, withoutInsertedDeload.length);
  const insertedBlocks = [...withoutInsertedDeload.slice(0, insertionIndex), deloadBlock, ...withoutInsertedDeload.slice(insertionIndex)];

  const nextBlocks = insertedBlocks.map((block) => {
    if (block.id === current.id) return { ...block, status: "planned" as const };
    if (block.id === deloadBlock.id) return { ...deloadBlock, status: "active" as const, currentWeek: 1, startedAt: decidedAt, completedAt: undefined, notes: deloadNotes };
    return block.status === "active" ? { ...block, status: "planned" as const } : block;
  });

  return {
    ...plan,
    activeBlockId: deloadBlock.id,
    blocks: nextBlocks,
    recommendationState: {
      ...plan.recommendationState,
      deload: { status: "accepted", decidedAt, blockId: deloadBlock.id },
    },
  };
}

export function ignoreDeloadPlan(plan: ActiveTrainingPlan, decidedAt = new Date().toISOString()): ActiveTrainingPlan {
  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      deload: { status: "ignored", decidedAt },
    },
  };
}

export function replaceExerciseForFutureSessions(
  plan: ActiveTrainingPlan,
  currentExerciseId: string,
  replacementExerciseId: string,
  reason: string,
  decidedAt = new Date().toISOString(),
  structuredPrimaryLiftVariation?: PrimaryLiftVariationSelection,
): ActiveTrainingPlan {
  const nextPrimaryLiftVariations = structuredPrimaryLiftVariation
    ? [
        ...(plan.recommendationState?.primaryLiftVariations ?? []),
        {
          ...structuredPrimaryLiftVariation.decisionRecord,
          decidedAt,
          exposureCount: 0,
          status: "accepted" as const,
          outcome: "unknown" as const,
        },
      ]
    : plan.recommendationState?.primaryLiftVariations;

  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      exerciseReplacements: {
        ...(plan.recommendationState?.exerciseReplacements ?? {}),
        [currentExerciseId]: {
          replacementExerciseId,
          reason,
          replacedAt: decidedAt,
        },
      },
      primaryLiftVariations: nextPrimaryLiftVariations,
    },
  };
}

export function keepExerciseDespiteRotationRecommendation(
  plan: ActiveTrainingPlan,
  exerciseId: string,
  reason: string,
  decidedAt = new Date().toISOString(),
  structuredPrimaryLiftVariation?: PrimaryLiftVariationSelection,
): ActiveTrainingPlan {
  const nextPrimaryLiftVariations = structuredPrimaryLiftVariation
    ? [
        ...(plan.recommendationState?.primaryLiftVariations ?? []),
        {
          ...structuredPrimaryLiftVariation.decisionRecord,
          originalExerciseId: exerciseId,
          decidedAt,
          exposureCount: 0,
          status: "rejected" as const,
          outcome: "unknown" as const,
        },
      ]
    : plan.recommendationState?.primaryLiftVariations;

  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      rotationSuppressions: {
        ...(plan.recommendationState?.rotationSuppressions ?? {}),
        [exerciseId]: {
          keptAt: decidedAt,
          reason,
        },
      },
      primaryLiftVariations: nextPrimaryLiftVariations,
    },
  };
}

export function applyPlanExerciseReplacements<T extends { exerciseId: string }>(slots: T[], plan: ActiveTrainingPlan): T[] {
  const replacements = plan.recommendationState?.exerciseReplacements;
  if (!replacements) return slots;

  return slots.map((slot) => {
    const replacement = replacements[slot.exerciseId];
    return replacement ? { ...slot, exerciseId: replacement.replacementExerciseId } : slot;
  });
}

export function shouldSuppressRotationRecommendation(plan: ActiveTrainingPlan | null | undefined, exerciseId: string): boolean {
  if (!plan) return false;
  return Boolean(plan.recommendationState?.exerciseReplacements?.[exerciseId] || plan.recommendationState?.rotationSuppressions?.[exerciseId]);
}

export function recordExerciseReasonForFutureCoaching(
  plan: ActiveTrainingPlan,
  input: ExerciseReasonInput,
  decidedAt = new Date().toISOString(),
): ActiveTrainingPlan {
  return recordExerciseReason(plan, input, decidedAt);
}

export function advanceTrainingYearBlock(year: TrainingYear, decidedAt = new Date().toISOString()): TrainingYear {
  return completeBlock(year, decidedAt);
}

export function startDeloadTrainingYear(year: TrainingYear, decidedAt = new Date().toISOString()): TrainingYear {
  const deload = createTrainingBlock(
    "deload",
    {
      id: `${year.id}-accepted-deload-${decidedAt}`,
      name: "Deload 1 week",
      status: "active",
      startedAt: decidedAt,
      durationWeeks: 1,
      notes: ["Accepted from coaching recommendation.", "Keep sessions easy and restore output."],
    },
    decidedAt,
  );
  return {
    ...year,
    currentBlockId: deload.id,
    blocks: [deload, ...year.blocks.map((block) => (block.status === "active" ? { ...block, status: "planned" as const } : block))],
    status: "active",
  };
}

function titleBlock(value: string): string {
  return displayBlockType(value);
}

function titleProfile(profile: DeloadProfile): string {
  return profile === "clear" ? "Clear fatigue" : profile.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
