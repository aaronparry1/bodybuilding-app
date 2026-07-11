import type { TrainingBlock } from "@/domain/training/annual-models";
import { resolveEventTaper } from "@/domain/training/event-taper";
import type { Exercise, MuscleGroup, ProgramExercise, Programme } from "@/domain/training/models";
import { normalizeTrainingSetupGoal, type ActiveTrainingPlan, type VolumeAdjustmentRecord } from "@/domain/training/plan-setup";
import type { PersonalisedVolumeResult, VolumeLadderAction } from "@/domain/training/personalised-volume";
import { shiftRecommendedSetRange, withSetPrescription } from "@/domain/training/set-prescription";

const increaseActions = new Set<VolumeLadderAction>(["bias_high", "raise_range", "add_exercise"]);
const structuralActions = new Set<VolumeLadderAction>(["add_exercise", "remove_or_swap_exercise"]);

export function approveVolumeAdjustment(
  plan: ActiveTrainingPlan,
  recommendation: Pick<PersonalisedVolumeResult, "muscleGroup" | "recommendedLadderAction" | "confidence" | "evidence" | "reason">,
  decidedAt = new Date().toISOString(),
): ActiveTrainingPlan {
  const activeBlock = plan.blocks.find((block) => block.id === plan.activeBlockId) ?? plan.blocks[0];
  const record = buildVolumeAdjustmentRecord(plan, recommendation, "applied", decidedAt);
  if (!canApplyVolumeAdjustment(plan, record, activeBlock)) return plan;

  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      volumeAdjustments: [...(plan.recommendationState?.volumeAdjustments ?? []), record],
    },
  };
}

export function ignoreVolumeAdjustment(
  plan: ActiveTrainingPlan,
  recommendation: Pick<PersonalisedVolumeResult, "muscleGroup" | "recommendedLadderAction" | "confidence" | "evidence" | "reason">,
  decidedAt = new Date().toISOString(),
): ActiveTrainingPlan {
  const record = buildVolumeAdjustmentRecord(plan, recommendation, "ignored", decidedAt);
  return {
    ...plan,
    recommendationState: {
      ...plan.recommendationState,
      volumeAdjustments: [...(plan.recommendationState?.volumeAdjustments ?? []), record],
    },
  };
}

export function previousVolumeLadderActions(plan: ActiveTrainingPlan | null | undefined, muscle: MuscleGroup): VolumeLadderAction[] {
  return (
    plan?.recommendationState?.volumeAdjustments
      ?.filter((record) => record.status === "applied" && record.muscle === muscle)
      .map((record) => record.action) ?? []
  );
}

export function applyVolumeAdjustmentsToProgramme(
  programme: Programme,
  plan: ActiveTrainingPlan,
  exercises: Exercise[],
  currentBlock?: TrainingBlock | null,
): Programme {
  const activeAdjustments = (plan.recommendationState?.volumeAdjustments ?? []).filter((record) => record.status === "applied");
  if (activeAdjustments.length === 0) return programme;
  if (currentBlock?.type === "deload") return programme;

  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return {
    ...programme,
    days: programme.days.map((day) => {
      let slots = day.exerciseSlots;
      for (const adjustment of activeAdjustments) {
        if (adjustment.blockId && currentBlock?.id && adjustment.blockId !== currentBlock.id) continue;
        slots = applyAdjustmentToSlots(slots, adjustment, exercises, exerciseById, plan.equipment);
      }
      return { ...day, exerciseSlots: normalizeOrder(slots) };
    }),
  };
}

export function canApplyVolumeAdjustment(plan: ActiveTrainingPlan, record: VolumeAdjustmentRecord, activeBlock?: TrainingBlock | null): boolean {
  if (record.action === "insufficient_data" || record.action === "hold" || record.action === "deload_caution") return false;
  if (activeBlock?.type === "deload") return false;
  if (increaseActions.has(record.action) && (activeBlock?.type === "peak")) return false;
  if (increaseActions.has(record.action) && activeBlock?.type === "power" && record.action !== "bias_high") return false;
  const goal = normalizeTrainingSetupGoal(plan.goal);
  if (plan.targetDate && (plan.mode === "custom_date_event" || goal === "powerlifting_meet")) {
    const taper = resolveEventTaper({
      eventType: plan.eventType,
      targetDate: plan.targetDate,
      currentBlock: activeBlock?.type,
      goal,
      experienceLevel: plan.experienceLevel,
      referenceDate: new Date(record.decidedAt),
    });
    if (increaseActions.has(record.action) && ["taper", "event_week", "post_event"].includes(taper.eventPhase)) return false;
    if (record.action === "add_exercise" && taper.noveltyAllowance !== "normal" && taper.noveltyAllowance !== "limited") return false;
  }

  const applied = plan.recommendationState?.volumeAdjustments?.filter((item) => item.status === "applied" && item.muscle === record.muscle) ?? [];
  if (increaseActions.has(record.action) && applied.some((item) => increaseActions.has(item.action) && item.week === record.week)) return false;
  if (structuralActions.has(record.action) && record.confidence !== "high" && applied.some((item) => structuralActions.has(item.action) && item.blockId === record.blockId)) return false;
  return true;
}

function applyAdjustmentToSlots(
  slots: ProgramExercise[],
  adjustment: VolumeAdjustmentRecord,
  exercises: Exercise[],
  exerciseById: Map<string, Exercise>,
  availableEquipment: ActiveTrainingPlan["equipment"],
): ProgramExercise[] {
  switch (adjustment.action) {
    case "bias_high":
      return slots.map((slot) => (slotTouchesMuscle(slot, exerciseById, adjustment.muscle) ? { ...slot, notes: appendNote(slot.notes, "Aim for the top of the range if performance holds.") } : slot));
    case "bias_low":
      return slots.map((slot) => (slotTouchesMuscle(slot, exerciseById, adjustment.muscle) ? { ...slot, notes: appendNote(slot.notes, "Stay near the low end this week.") } : slot));
    case "raise_range":
      return adjustBestAccessorySlot(slots, exerciseById, adjustment.muscle, 1, "Personalised volume: start one set higher next week.");
    case "lower_range":
      return adjustBestAccessorySlot(slots, exerciseById, adjustment.muscle, -1, "Personalised volume: pull one set from accessory work.");
    case "add_exercise":
      return addAccessorySlot(slots, exercises, exerciseById, availableEquipment, adjustment);
    case "remove_or_swap_exercise":
      return removeLowestPriorityAccessory(slots, exerciseById, adjustment.muscle);
    default:
      return slots;
  }
}

function adjustBestAccessorySlot(slots: ProgramExercise[], exerciseById: Map<string, Exercise>, muscle: MuscleGroup, delta: number, note: string): ProgramExercise[] {
  const target = bestAccessorySlot(slots, exerciseById, muscle);
  if (!target) return slots;
  return slots.map((slot) => {
    if (slot.id !== target.id) return slot;
    const exercise = exerciseById.get(slot.exerciseId);
    return {
      ...slot,
      settings: shiftRecommendedSetRange(slot.settings, delta, {
        exerciseRole: exercise?.role,
        exerciseFamily: exercise?.family,
        primaryMuscles: exercise?.primaryMuscles,
      }),
      notes: appendNote(slot.notes, note),
    };
  });
}

function addAccessorySlot(
  slots: ProgramExercise[],
  exercises: Exercise[],
  exerciseById: Map<string, Exercise>,
  availableEquipment: ActiveTrainingPlan["equipment"],
  adjustment: VolumeAdjustmentRecord,
): ProgramExercise[] {
  const existingIds = new Set(slots.map((slot) => slot.exerciseId));
  const candidate = exercises
    .filter((exercise) => !existingIds.has(exercise.id))
    .filter((exercise) => exercise.primaryMuscles.includes(adjustment.muscle))
    .filter((exercise) => exercise.roles.includes("isolation") || exercise.roles.includes("accessory"))
    .filter((exercise) => exercise.fatigueCost === "low")
    .filter((exercise) => exercise.equipment.some((equipment) => availableEquipment.includes(equipment)))
    .sort((a, b) => accessoryPreferenceScore(b) - accessoryPreferenceScore(a))[0];
  if (!candidate) return slots;

  const lastOrder = Math.max(0, ...slots.map((slot) => slot.plannedOrder));
  const baseSettings = withSetPrescription(candidate.defaultSettings, {
    exerciseRole: candidate.role,
    exerciseFamily: candidate.family,
    primaryMuscles: candidate.primaryMuscles,
  }, {
    requiredSets: Math.min(3, Math.max(2, candidate.defaultSettings.requiredWorkSets)),
    source: "volume_adjustment",
  });
  return [
    ...slots,
    {
      id: `volume-adjustment-${adjustment.id}-${candidate.id}`,
      exerciseId: candidate.id,
      plannedOrder: lastOrder + 1,
      settings: { ...baseSettings, trainingLane: "hypertrophy" },
      notes: "Plan adjustment: low-fatigue accessory added from personalised volume learning.",
    },
  ];
}

function removeLowestPriorityAccessory(slots: ProgramExercise[], exerciseById: Map<string, Exercise>, muscle: MuscleGroup): ProgramExercise[] {
  const removable = slots
    .map((slot) => ({ slot, exercise: exerciseById.get(slot.exerciseId) }))
    .filter((item): item is { slot: ProgramExercise; exercise: Exercise } => Boolean(item.exercise))
    .filter(({ exercise }) => exercise.primaryMuscles.includes(muscle))
    .filter(({ exercise }) => exercise.tier !== "A" && !exercise.roles.includes("primary_compound"))
    .sort((a, b) => removalPriority(b.exercise) - removalPriority(a.exercise))[0];
  if (!removable) return slots;
  return slots.filter((slot) => slot.id !== removable.slot.id);
}

function bestAccessorySlot(slots: ProgramExercise[], exerciseById: Map<string, Exercise>, muscle: MuscleGroup): ProgramExercise | null {
  return (
    slots
      .map((slot) => ({ slot, exercise: exerciseById.get(slot.exerciseId) }))
      .filter((item): item is { slot: ProgramExercise; exercise: Exercise } => Boolean(item.exercise))
      .filter(({ exercise }) => exercise.primaryMuscles.includes(muscle))
      .filter(({ exercise }) => exercise.roles.includes("isolation") || exercise.roles.includes("accessory"))
      .filter(({ exercise }) => exercise.tier !== "A")
      .sort((a, b) => accessoryPreferenceScore(b.exercise) - accessoryPreferenceScore(a.exercise))[0]?.slot ?? null
  );
}

function buildVolumeAdjustmentRecord(
  plan: ActiveTrainingPlan,
  recommendation: Pick<PersonalisedVolumeResult, "muscleGroup" | "recommendedLadderAction" | "confidence" | "evidence" | "reason">,
  status: VolumeAdjustmentRecord["status"],
  decidedAt: string,
): VolumeAdjustmentRecord {
  const activeBlock = plan.blocks.find((block) => block.id === plan.activeBlockId) ?? plan.blocks[0];
  return {
    id: `volume-${recommendation.muscleGroup}-${recommendation.recommendedLadderAction}-${decidedAt}`,
    muscle: recommendation.muscleGroup,
    action: recommendation.recommendedLadderAction,
    confidence: recommendation.confidence,
    evidenceSummary: recommendation.evidence.summary,
    status,
    decidedAt,
    week: activeBlock?.currentWeek ?? 1,
    blockId: activeBlock?.id,
    reason: recommendation.reason,
  };
}

function slotTouchesMuscle(slot: ProgramExercise, exerciseById: Map<string, Exercise>, muscle: MuscleGroup): boolean {
  const exercise = exerciseById.get(slot.exerciseId);
  return Boolean(exercise?.primaryMuscles.includes(muscle));
}

function appendNote(existing: string | undefined, note: string): string {
  if (!existing) return note;
  if (existing.includes(note)) return existing;
  return `${existing} ${note}`;
}

function accessoryPreferenceScore(exercise: Exercise): number {
  let score = 0;
  if (exercise.kind === "machine" || exercise.kind === "cable") score += 8;
  if (exercise.kind === "dumbbell") score += 5;
  if (exercise.roles.includes("isolation")) score += 6;
  if (exercise.fatigueCost === "low") score += 6;
  if (exercise.tier === "C") score += 4;
  return score;
}

function removalPriority(exercise: Exercise): number {
  let score = 0;
  if (exercise.tier === "C") score += 8;
  if (exercise.roles.includes("isolation") || exercise.roles.includes("accessory")) score += 6;
  if (exercise.fatigueCost === "high") score += 5;
  if (exercise.fatigueCost === "low") score -= 2;
  return score;
}

function normalizeOrder(slots: ProgramExercise[]): ProgramExercise[] {
  return [...slots]
    .sort((a, b) => a.plannedOrder - b.plannedOrder)
    .map((slot, index) => ({ ...slot, plannedOrder: index + 1 }));
}
