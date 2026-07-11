import type { AnnualPlan, BlockType, TrainingBlock } from "@/domain/training/annual-models";
import { createTrainingBlock } from "@/domain/training/annual-planner";
import type { Equipment, ExperienceLevel, MuscleGroup, ProgrammeGoal } from "@/domain/training/models";
import type { ExerciseRotationFrequency } from "@/domain/training/exercise-selection";
import type { ExercisePreferenceRecord } from "@/domain/training/exercise-preferences";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { createMacrocycle } from "@/domain/training/macrocycle-engine";
import { mesocycleById, selectMesocycles, type MesocycleId } from "@/domain/training/mesocycle-library";
import { createMicrocycle, type MicrocyclePlan } from "@/domain/training/microcycle-scheduler";
import type { PersonalisedVolumeConfidence, VolumeLadderAction } from "@/domain/training/personalised-volume";
import type { PrimaryLiftVariationDecisionRecord } from "@/domain/training/primary-lift-variations";

export type TrainingSetupGoal =
  | "build_muscle"
  | "build_strength"
  | "build_muscle_and_strength"
  | "athletic_performance"
  | "get_leaner"
  | "powerlifting_meet";

type LegacyTrainingSetupGoal = "prepare_for_event" | "just_help_me_train";

export type PlanningChoice = "recommended_12_month" | "custom_date_event" | "single_block" | "custom_sequence";
export type EventType = "powerlifting_meet" | "photoshoot" | "holiday" | "sport_season" | "custom";
export type EquipmentPreset = "full_gym" | "machines_only" | "dumbbells_only" | "barbell_dumbbells" | "home_gym" | "custom";
export type PreferredSplit = "push_pull_legs" | "upper_lower" | "full_body" | "body_part_split" | "bench_squat_deadlift" | "let_app_choose";
export type RecoveryCardioPreference = "recommended" | "minimal" | "off";

export interface TrainingSetupInput {
  goal: TrainingSetupGoal;
  planningChoice: PlanningChoice;
  eventType?: EventType;
  targetDate?: string;
  eventPriority?: "muscle" | "strength" | "performance" | "maintenance";
  singleBlockType?: BlockType;
  customBlockTypes?: BlockType[];
  equipmentPreset: EquipmentPreset;
  customEquipment?: Equipment[];
  daysPerWeek: number;
  preferredSplit: PreferredSplit;
  experienceLevel: ExperienceLevel;
  recoveryCardioPreference?: RecoveryCardioPreference;
  rotationFrequency?: ExerciseRotationFrequency;
}

export interface ActiveTrainingPlan {
  id: string;
  name: string;
  mode: PlanningChoice;
  goal: TrainingSetupGoal;
  programmeGoal: ProgrammeGoal;
  /** Legacy persisted compatibility data. Current programme authority is macrocycle/mesocycle/microcycle state. */
  blocks: TrainingBlock[];
  activeBlockId: string;
  currentMesocycleId?: MesocycleId;
  currentMicrocycle?: MicrocyclePlan;
  equipment: Equipment[];
  daysPerWeek: number;
  preferredSplit: PreferredSplit;
  experienceLevel: ExperienceLevel;
  recoveryCardioPreference: RecoveryCardioPreference;
  rotationFrequency: ExerciseRotationFrequency;
  recommendationState?: PlanRecommendationState;
  createdAt: string;
  targetDate?: string;
  eventType?: EventType;
}

export interface PlanRecommendationState {
  exerciseInterventions?: ExerciseInterventionRecord[];
  blockDecision?: {
    type: "advanced" | "repeated" | "decided_later";
    blockId: string;
    decidedAt: string;
  };
  deload?: {
    status: "accepted" | "ignored";
    decidedAt: string;
    blockId?: string;
  };
  exerciseReplacements?: Record<
    string,
    {
      replacementExerciseId: string;
      replacedAt: string;
      reason: string;
    }
  >;
  rotationSuppressions?: Record<
    string,
    {
      keptAt: string;
      reason: string;
    }
  >;
  primaryLiftVariations?: PrimaryLiftVariationDecisionRecord[];
  volumeAdjustments?: VolumeAdjustmentRecord[];
  exercisePreferences?: Record<string, ExercisePreferenceRecord>;
}

export interface ExerciseInterventionRecord {
  exerciseId: string;
  decision: "keep" | "substitute" | "rotate_at_phase_boundary" | "replace";
  reason: "productive" | "pain" | "poor_fit" | "persistent_stall" | "phase_specificity" | "unavailable";
  evidence: string[];
  decidedAt: string;
  reviewAfterExposures: number;
  replacementExerciseId?: string;
}

export interface VolumeAdjustmentRecord {
  id: string;
  muscle: MuscleGroup;
  action: VolumeLadderAction;
  confidence: PersonalisedVolumeConfidence;
  evidenceSummary: string[];
  status: "applied" | "ignored";
  decidedAt: string;
  week: number;
  blockId?: string;
  affectedExerciseIds?: string[];
  reason: string;
}

export interface PlanBlockSpec {
  type: BlockType;
  durationWeeks: number;
  note?: string;
}

const fullGymEquipment: Equipment[] = ["barbell", "dumbbell", "machine", "cable", "smith", "bodyweight"];

const defaultGuidedCycle: PlanBlockSpec[] = [
  { type: "hypertrophy", durationWeeks: 6 },
  { type: "powerbuilding", durationWeeks: 6 },
  { type: "strength", durationWeeks: 6 },
  { type: "power", durationWeeks: 3 },
  { type: "peak", durationWeeks: 2 },
  { type: "deload", durationWeeks: 1 },
];

export function createActiveTrainingPlan(input: TrainingSetupInput, createdAt = new Date().toISOString()): ActiveTrainingPlan {
  const normalizedInput = { ...input, goal: normalizeTrainingSetupGoal(input.goal) };
  const blockSpecs = resolveBlockPlanSpecs(normalizedInput, createdAt);
  const blocks = blockSpecs.map((spec, index) =>
    createTrainingBlock(spec.type, {
      id: `setup-${createdAt}-block-${index + 1}-${spec.type}`,
      durationWeeks: spec.durationWeeks,
      name: `${title(spec.type)} ${spec.durationWeeks} weeks`,
      status: index === 0 ? "active" : "planned",
      startedAt: index === 0 ? createdAt : undefined,
      notes: spec.note ? [...createTrainingBlock(spec.type).notes, spec.note] : undefined,
    }),
  );
  const mesocycles = selectMesocycles(macrocycleEngineForSetupGoal(normalizedInput.goal), normalizedInput.experienceLevel);

  const currentMesocycleId = mesocycles[0]?.id;
  const currentMicrocycle = currentMesocycleId
    ? createMicrocycle({ parentMesocycleId: currentMesocycleId, trainingDays: clampDays(normalizedInput.daysPerWeek) as 3 | 4 | 5 | 6, split: normalizedInput.preferredSplit })
    : undefined;
  return {
    id: `active-plan-${createdAt}`,
    name: nameForSetup(normalizedInput),
    mode: normalizedInput.planningChoice,
    goal: normalizedInput.goal,
    programmeGoal: programmeGoalForSetup(normalizedInput),
    blocks,
    activeBlockId: blocks[0]?.id ?? "",
    currentMesocycleId,
    currentMicrocycle,
    equipment: equipmentForPreset(normalizedInput.equipmentPreset, normalizedInput.customEquipment),
    daysPerWeek: clampDays(normalizedInput.daysPerWeek),
    preferredSplit: normalizedInput.preferredSplit,
    experienceLevel: normalizedInput.experienceLevel,
    recoveryCardioPreference: normalizedInput.recoveryCardioPreference ?? "recommended",
    rotationFrequency: normalizedInput.rotationFrequency ?? "every_4_weeks",
    createdAt,
    targetDate: normalizedInput.targetDate,
    eventType: normalizedInput.eventType,
  };
}

function macrocycleEngineForSetupGoal(goal: TrainingSetupGoal): import("@/domain/training/macrocycle-engine").MacrocycleEngineId {
  if (goal === "build_muscle") return "hypertrophy";
  if (goal === "build_muscle_and_strength") return "powerbuilding";
  if (goal === "build_strength" || goal === "powerlifting_meet") return "strength";
  return "athletic_performance";
}

export function createRecommendedAnnualPlan(createdAt?: string): ActiveTrainingPlan {
  return createActiveTrainingPlan(
    {
      goal: "build_muscle_and_strength",
      planningChoice: "recommended_12_month",
      equipmentPreset: "full_gym",
      daysPerWeek: 5,
      preferredSplit: "let_app_choose",
      experienceLevel: "intermediate",
      rotationFrequency: "every_4_weeks",
    },
    createdAt,
  );
}

export function completeCurrentPlanWeek(plan: ActiveTrainingPlan, completedAt = new Date().toISOString()): ActiveTrainingPlan {
  const activeBlockIndex = plan.blocks.findIndex((block) => block.id === plan.activeBlockId);
  if (activeBlockIndex < 0) return plan;

  const activeBlock = plan.blocks[activeBlockIndex]!;
  const nextWeek = Math.min(activeBlock.durationWeeks, activeBlock.currentWeek + 1);
  const nextBlocks = plan.blocks.map((block, index) => {
    if (index !== activeBlockIndex) return block;

    return {
      ...block,
      currentWeek: nextWeek,
      weeks: block.weeks.map((week) =>
        week.weekNumber === block.currentWeek
          ? {
              ...week,
              completedAt,
            }
          : week,
      ),
    };
  });

  return {
    ...plan,
    blocks: nextBlocks,
    recommendationState: {
      ...plan.recommendationState,
      blockDecision:
        activeBlock.currentWeek >= activeBlock.durationWeeks
          ? {
              type: "decided_later",
              blockId: activeBlock.id,
              decidedAt: completedAt,
            }
          : plan.recommendationState?.blockDecision,
    },
  };
}

/**
 * Advances the persisted planning hierarchy only after every scheduled session
 * in the current seven-day microcycle has been completed. This is deliberately
 * calendar-independent: missed sessions cannot silently advance the programme.
 */
export function advanceCompletedMicrocycle(plan: ActiveTrainingPlan): ActiveTrainingPlan {
  const current = plan.currentMicrocycle;
  if (!current) return plan;

  const mesocycle = mesocycleById(current.parentMesocycleId);
  if (!mesocycle) return plan;

  if (current.sequenceNumber < mesocycle.defaultWeeks) {
    return {
      ...plan,
      currentMicrocycle: createMicrocycle({
        parentMesocycleId: current.parentMesocycleId,
        trainingDays: current.trainingDays as 3 | 4 | 5 | 6,
        split: current.split,
        sequenceNumber: current.sequenceNumber + 1,
        progressionState: current.sequenceNumber + 1 >= mesocycle.defaultWeeks ? "exit_mesocycle" : "build",
      }),
    };
  }

  const nextMesocycleId = mesocycle.nextStates.find((id) => mesocycleById(id)?.eligibility.includes(plan.experienceLevel));
  if (!nextMesocycleId) return plan;

  return {
    ...plan,
    currentMesocycleId: nextMesocycleId,
    currentMicrocycle: createMicrocycle({
      parentMesocycleId: nextMesocycleId,
      trainingDays: current.trainingDays as 3 | 4 | 5 | 6,
      split: current.split,
    }),
  };
}

export function sessionRolesForPlan(plan: ActiveTrainingPlan): string[] {
  return plan.currentMicrocycle?.sessionRoles ?? weeklySplitForPlan(plan.daysPerWeek, plan.preferredSplit);
}

export function getApprovedNextMesocycleStates(plan: ActiveTrainingPlan): MesocycleId[] {
  if (!plan.currentMesocycleId) return [];
  const current = mesocycleById(plan.currentMesocycleId);
  if (!current) return [];
  return current.nextStates.filter((id) => mesocycleById(id)?.eligibility.includes(plan.experienceLevel));
}

export function transitionToApprovedMesocycle(plan: ActiveTrainingPlan, nextMesocycleId: MesocycleId): ActiveTrainingPlan {
  if (!getApprovedNextMesocycleStates(plan).includes(nextMesocycleId)) return plan;
  return {
    ...plan,
    currentMesocycleId: nextMesocycleId,
    currentMicrocycle: createMicrocycle({
      parentMesocycleId: nextMesocycleId,
      trainingDays: plan.daysPerWeek as 3 | 4 | 5 | 6,
      split: plan.preferredSplit,
      sequenceNumber: 1,
    }),
  };
}

export function resolveBlockSequence(input: Pick<TrainingSetupInput, "planningChoice" | "goal" | "eventType" | "singleBlockType" | "customBlockTypes" | "targetDate" | "experienceLevel">): BlockType[] {
  return resolveBlockPlanSpecs(input).map((spec) => spec.type);
}

export function resolveBlockPlanSpecs(
  input: Pick<TrainingSetupInput, "planningChoice" | "goal" | "eventType" | "singleBlockType" | "customBlockTypes" | "targetDate" | "experienceLevel">,
  createdAt = new Date().toISOString(),
): PlanBlockSpec[] {
  const goal = normalizeTrainingSetupGoal(input.goal);
  if (input.planningChoice === "single_block") return [singleBlockSpec(input.singleBlockType ?? blockForGoal(goal))];
  if (input.planningChoice === "custom_sequence" && input.customBlockTypes?.length) return input.customBlockTypes.map(singleBlockSpec);
  return macrocycleBlockSpecs(goal, input.experienceLevel ?? "intermediate", input.planningChoice === "custom_date_event" ? input.targetDate : undefined, createdAt);
}

function macrocycleBlockSpecs(goal: TrainingSetupGoal, experienceLevel: ExperienceLevel, targetDate?: string, createdAt?: string): PlanBlockSpec[] {
  const macrocycle = createMacrocycle(goal, experienceLevel, targetDate, createdAt);
  return macrocycle.phases.map((phase) => ({
    type: blockTypeForMacrocyclePhase(phase.phase),
    durationWeeks: phase.maxWeeks,
    note: phase.emphasis,
  }));
}

function blockTypeForMacrocyclePhase(phase: import("@/domain/training/macrocycle-engine").MacrocyclePhase): BlockType {
  if (phase === "calibration" || phase === "foundation" || phase === "accumulation" || phase === "hypertrophy_bias" || phase === "consolidation") return "hypertrophy";
  if (phase === "strength_accumulation" || phase === "transmutation") return "strength";
  if (phase === "intensification" || phase === "pre_competition") return "power";
  if (phase === "realisation" || phase === "taper") return "peak";
  if (phase === "transition" || phase === "recovery") return "deload";
  return "powerbuilding";
}

export function equipmentForPreset(preset: EquipmentPreset, customEquipment: Equipment[] = []): Equipment[] {
  void preset;
  void customEquipment;
  return [...fullGymEquipment];
}

export function normalizeActiveTrainingPlanEquipment(plan: ActiveTrainingPlan): ActiveTrainingPlan {
  if (sameEquipmentSet(plan.equipment, fullGymEquipment)) return plan;
  return { ...plan, equipment: [...fullGymEquipment] };
}

export function weeklySplitForPlan(daysPerWeek: number, preferredSplit: PreferredSplit): string[] {
  const days = clampDays(daysPerWeek);
  const split = preferredSplit === "let_app_choose" ? defaultSplit(days) : preferredSplit;
  return workoutSequenceForSplit(split, days);
}

export function weeklyCalendarForPlan(daysPerWeek: number, preferredSplit: PreferredSplit): string[] {
  const trainingSequence = weeklySplitForPlan(daysPerWeek, preferredSplit);
  const restCount = Math.max(0, 7 - trainingSequence.length);
  if (trainingSequence.length === 0) return Array.from({ length: 7 }, () => "Rest");
  if (restCount === 0) return trainingSequence.slice(0, 7);

  const calendar: string[] = [];
  const spacing = 7 / trainingSequence.length;
  for (let day = 0; day < 7; day += 1) {
    const workoutIndex = Math.round(day / spacing);
    const shouldTrain = workoutIndex < trainingSequence.length && Math.round(workoutIndex * spacing) === day;
    calendar.push(shouldTrain ? trainingSequence[workoutIndex]! : "Rest");
  }

  let insertedWorkouts = calendar.filter((entry) => entry !== "Rest").length;
  for (const workout of trainingSequence.slice(insertedWorkouts)) {
    const restIndex = calendar.findIndex((entry) => entry === "Rest");
    if (restIndex < 0) break;
    calendar[restIndex] = workout;
    insertedWorkouts += 1;
  }

  return calendar;
}

function annualMacrocycleForGoal(goal: TrainingSetupGoal): PlanBlockSpec[] {
  goal = normalizeTrainingSetupGoal(goal);
  if (goal === "build_muscle") {
    return [
      { type: "hypertrophy", durationWeeks: 8, note: "Muscle-first accumulation." },
      { type: "powerbuilding", durationWeeks: 6, note: "Keep load progression alive." },
      { type: "deload", durationWeeks: 1 },
      { type: "hypertrophy", durationWeeks: 8 },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
      { type: "strength", durationWeeks: 4, note: "Short strength support phase." },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 3, note: "Brief speed and output phase." },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
    ];
  }

  if (goal === "build_strength") {
    return [
      { type: "hypertrophy", durationWeeks: 6, note: "Base building before heavier work." },
      { type: "powerbuilding", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
      { type: "strength", durationWeeks: 6, note: "Strength accumulation." },
      { type: "strength", durationWeeks: 6, note: "Strength intensification." },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 4 },
      { type: "strength", durationWeeks: 5 },
      { type: "deload", durationWeeks: 1 },
      { type: "peak", durationWeeks: 3, note: "Specificity and expression." },
      { type: "deload", durationWeeks: 1 },
      { type: "powerbuilding", durationWeeks: 4 },
      { type: "strength", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
    ];
  }

  if (goal === "athletic_performance") {
    return [
      { type: "hypertrophy", durationWeeks: 6, note: "Support tissue and capacity." },
      { type: "strength", durationWeeks: 5 },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 5, note: "Speed and quality emphasis." },
      { type: "powerbuilding", durationWeeks: 5 },
      { type: "deload", durationWeeks: 1 },
      { type: "strength", durationWeeks: 4 },
      { type: "power", durationWeeks: 5 },
      { type: "deload", durationWeeks: 1 },
      { type: "peak", durationWeeks: 3, note: "Readiness without junk volume." },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 5 },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "power", durationWeeks: 4 },
    ];
  }

  if (goal === "get_leaner") {
    return [
      { type: "hypertrophy", durationWeeks: 6, note: "Preserve muscle while keeping fatigue recoverable." },
      { type: "powerbuilding", durationWeeks: 5, note: "Keep strength exposed while leaning out." },
      { type: "deload", durationWeeks: 1 },
      { type: "hypertrophy", durationWeeks: 6, note: "Sustainable volume, not a fatigue contest." },
      { type: "strength", durationWeeks: 4, note: "Maintain force production." },
      { type: "deload", durationWeeks: 1 },
      { type: "powerbuilding", durationWeeks: 5 },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 3, note: "Keep output sharp without adding junk volume." },
      { type: "deload", durationWeeks: 1 },
      { type: "hypertrophy", durationWeeks: 6 },
      { type: "powerbuilding", durationWeeks: 4 },
      { type: "deload", durationWeeks: 1 },
    ];
  }

  if (goal === "powerlifting_meet") {
    return [
      { type: "powerbuilding", durationWeeks: 6, note: "Build the base around squat, bench, and deadlift." },
      { type: "strength", durationWeeks: 5, note: "Increase specificity for the competition lifts." },
      { type: "deload", durationWeeks: 1 },
      { type: "powerbuilding", durationWeeks: 6 },
      { type: "strength", durationWeeks: 5, note: "Competition-lift practice stays central." },
      { type: "deload", durationWeeks: 1 },
      { type: "power", durationWeeks: 4, note: "Fast force without drifting from the main lifts." },
      { type: "peak", durationWeeks: 3, note: "Meet specificity and readiness." },
      { type: "deload", durationWeeks: 1 },
      { type: "strength", durationWeeks: 5 },
      { type: "power", durationWeeks: 4 },
      { type: "deload", durationWeeks: 1 },
      { type: "powerbuilding", durationWeeks: 6 },
    ];
  }

  return [
    { type: "hypertrophy", durationWeeks: 6 },
    { type: "powerbuilding", durationWeeks: 6 },
    { type: "deload", durationWeeks: 1 },
    { type: "strength", durationWeeks: 5 },
    { type: "powerbuilding", durationWeeks: 6 },
    { type: "deload", durationWeeks: 1 },
    { type: "hypertrophy", durationWeeks: 6 },
    { type: "strength", durationWeeks: 5 },
    { type: "deload", durationWeeks: 1 },
    { type: "power", durationWeeks: 4 },
    { type: "peak", durationWeeks: 2 },
    { type: "deload", durationWeeks: 1 },
    { type: "powerbuilding", durationWeeks: 6 },
  ];
}

function singleBlockSpec(type: BlockType): PlanBlockSpec {
  return { type, durationWeeks: defaultGuidedCycle.find((block) => block.type === type)?.durationWeeks ?? 6 };
}

function eventBlockSpecs(eventType?: EventType, targetDate?: string, createdAt = new Date().toISOString()): PlanBlockSpec[] {
  const availableWeeks = weeksUntilEvent(targetDate, createdAt);
  const cap = (weeks: number) => Math.max(1, Math.min(availableWeeks, weeks));
  const taper = resolveEventTaper({
    eventType,
    targetDate,
    weeksUntilEvent: availableWeeks,
    goal: "powerlifting_meet",
    referenceDate: new Date(createdAt),
  });
  const note = (copy: string) => `${copy} ${taper.readinessNote}`;

  if (availableWeeks <= 4) {
    return [{ type: eventType === "powerlifting_meet" ? "peak" : "deload", durationWeeks: cap(availableWeeks), note: note("Short runway: readiness beats a big new cycle.") }];
  }

  if (eventType === "powerlifting_meet") {
    if (availableWeeks <= 8) return [{ type: "strength", durationWeeks: availableWeeks - 2, note: note("Event-specific strength work.") }, { type: "peak", durationWeeks: 2, note: "Taper into the event. No novelty." }];
    if (availableWeeks <= 16) return [{ type: "powerbuilding", durationWeeks: 5 }, { type: "strength", durationWeeks: availableWeeks - 8, note: "Specificity increases as the event gets closer." }, { type: "peak", durationWeeks: 3, note: "Peak and taper. Keep fatigue low." }];
    return [
      { type: "powerbuilding", durationWeeks: 6 },
      { type: "strength", durationWeeks: Math.max(6, availableWeeks - 11), note: "Strength work narrows toward event-specific lifts." },
      { type: "peak", durationWeeks: 4, note: "Peak and taper. Specificity wins." },
      { type: "deload", durationWeeks: 1, note: "Fatigue reduction into the event. No last-minute heroics." },
    ];
  }

  if (eventType === "holiday" || eventType === "photoshoot") {
    if (availableWeeks <= 8) return [{ type: "hypertrophy", durationWeeks: availableWeeks - 1, note: note("Keep productive work recoverable.") }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
    return [{ type: "hypertrophy", durationWeeks: Math.max(6, availableWeeks - 8), note: "Build useful work before the event narrows choices." }, { type: "powerbuilding", durationWeeks: 4 }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
  }

  if (eventType === "sport_season") {
    if (availableWeeks <= 8) return [{ type: "power", durationWeeks: availableWeeks - 1, note: note("Prioritise fast, clean output.") }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
    return [{ type: "strength", durationWeeks: 5 }, { type: "power", durationWeeks: Math.max(3, availableWeeks - 7), note: "Power and readiness rise as the event gets closer." }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
  }

  if (availableWeeks <= 8) return [{ type: "powerbuilding", durationWeeks: availableWeeks - 1, note: note("Short generic event runway.") }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
  return [{ type: "hypertrophy", durationWeeks: Math.max(4, availableWeeks - 8) }, { type: "powerbuilding", durationWeeks: 6, note: "Narrow choices as the event gets closer." }, { type: "deload", durationWeeks: 1, note: "Lower fatigue into the event." }];
}

function weeksUntilEvent(targetDate?: string, createdAt = new Date().toISOString()): number {
  if (!targetDate) return 16;
  const target = new Date(targetDate).getTime();
  const start = new Date(createdAt).getTime();
  if (!Number.isFinite(target) || !Number.isFinite(start)) return 16;
  return Math.max(1, Math.round((target - start) / 604_800_000));
}

function blockForGoal(goal: TrainingSetupGoal): BlockType {
  goal = normalizeTrainingSetupGoal(goal);
  if (goal === "build_strength") return "strength";
  if (goal === "build_muscle_and_strength") return "powerbuilding";
  if (goal === "athletic_performance") return "power";
  if (goal === "powerlifting_meet") return "strength";
  return "hypertrophy";
}

function programmeGoalForSetup(input: TrainingSetupInput): ProgrammeGoal {
  if (input.goal === "build_strength" || input.goal === "build_muscle_and_strength") return "strength_hypertrophy";
  if (input.goal === "powerlifting_meet") return "strength_hypertrophy";
  if (input.experienceLevel === "beginner") return "beginner_hypertrophy";
  if (input.goal === "get_leaner") return "body_recomposition";
  return "hypertrophy";
}

function nameForSetup(input: TrainingSetupInput): string {
  if (input.planningChoice === "recommended_12_month") return "Recommended 12-month plan";
  if (input.planningChoice === "single_block") return `${title(input.singleBlockType ?? blockForGoal(input.goal))} Single Block`;
  if (input.planningChoice === "custom_date_event") return `${input.eventType === "powerlifting_meet" || input.goal === "powerlifting_meet" ? "Powerlifting Meet" : title(input.eventType ?? "event")} Plan`;
  return "Custom Training Sequence";
}

export function normalizeTrainingSetupGoal(goal: TrainingSetupGoal | LegacyTrainingSetupGoal): TrainingSetupGoal {
  if (goal === "prepare_for_event") return "powerlifting_meet";
  if (goal === "just_help_me_train") return "get_leaner";
  return goal;
}

function defaultSplit(daysPerWeek: number): PreferredSplit {
  if (daysPerWeek <= 3) return "full_body";
  if (daysPerWeek === 4) return "upper_lower";
  return "push_pull_legs";
}

function workoutSequenceForSplit(split: PreferredSplit, days: number): string[] {
  if (split === "upper_lower") return repeatSequence(["Upper", "Lower"], days);
  if (split === "full_body") return repeatSequence(["Full Body"], days);
  if (split === "push_pull_legs") {
    if (days === 4) return ["Push", "Pull", "Legs", "Upper"];
    if (days === 5) return ["Push", "Pull", "Legs", "Upper", "Lower"];
    return repeatSequence(["Push", "Pull", "Legs"], days);
  }
  if (split === "body_part_split") return repeatSequence(["Chest", "Back", "Legs", "Shoulders", "Arms", "Full Body"], days);
  if (split === "bench_squat_deadlift") {
    if (days === 2) return ["Upper Strength", "Lower Strength"];
    if (days === 4) return ["Bench", "Squat", "Deadlift", "Full Body Strength"];
    if (days === 5) return ["Bench", "Squat", "Deadlift", "Upper Strength", "Lower Strength"];
    return repeatSequence(["Bench", "Squat", "Deadlift"], days);
  }
  return workoutSequenceForSplit(defaultSplit(days), days);
}

function repeatSequence(sequence: string[], length: number): string[] {
  return Array.from({ length }, (_, index) => sequence[index % sequence.length]!);
}

function clampDays(days: number): number {
  return Math.max(1, Math.min(6, Math.round(days)));
}

function sameEquipmentSet(left: Equipment[], right: Equipment[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((item) => rightSet.has(item));
}

function title(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
