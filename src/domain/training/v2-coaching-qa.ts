import { decideAdaptiveLoadPrescription, type AdaptiveLoadPrescription } from "@/domain/training/adaptive-load-prescription";
import { decideAdaptiveRepPrescription, type AdaptiveExerciseCategory, type AdaptiveProgrammingGoal, type AdaptiveTrainingPhase, type RecentPerformanceSignal } from "@/domain/training/adaptive-rep-prescription";
import { decideAdaptiveSetAllocation, type AdaptiveSetDecision } from "@/domain/training/adaptive-set-allocation";
import { deriveAdaptiveStimulusDelivery, type StimulusDeliveryDecision } from "@/domain/training/adaptive-stimulus-delivery";
import { deriveAdaptiveStimulusPlan, type AdaptiveStimulusSessionType } from "@/domain/training/adaptive-stimulus-planner";
import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import { deriveCycleStrategyContext, type CycleLoadOwnership, type CycleRecoveryFlag, type CycleStrategyContext } from "@/domain/training/cycle-strategy-context";
import type { ActiveTrainingPlan, TrainingSetupGoal } from "@/domain/training/plan-setup";
import { decideSessionStrategy, type SessionStrategyDecision } from "@/domain/training/session-strategy";
import type { Exercise, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { getWorkSets } from "@/domain/training/workout-sets";

export interface V2CoachingQaContext {
  enabled: boolean;
  session: WorkoutSession;
  exercise: WorkoutExerciseLog;
  exerciseIndex: number;
  metadata?: Exercise;
  activePlan?: ActiveTrainingPlan | null;
  currentBlock?: TrainingBlock | null;
  adaptiveSetDecision?: AdaptiveSetDecision | null;
}

export interface V2CoachingQaOutput {
  cycle: CycleStrategyContext;
  sessionStrategy: SessionStrategyDecision;
  repPrescription: ReturnType<typeof decideAdaptiveRepPrescription>;
  loadPrescription: AdaptiveLoadPrescription;
  setDecision: AdaptiveSetDecision | null;
  chips: {
    exercise: string;
    stimulus: string;
    cycle: string;
    intent: string;
    reps: string;
    load: string;
    sets: string;
  };
  confidence: number;
}

export function buildV2CoachingQaOutput(context: V2CoachingQaContext): V2CoachingQaOutput | null {
  if (!context.enabled) return null;
  if (context.session.sessionKind != null && context.session.sessionKind !== "planned") return null;

  const goal = programmingGoalForPlan(context.activePlan?.goal);
  const trainingPhase = trainingPhaseForBlock(context.currentBlock?.type);
  const exerciseCategory = categoryForExercise(context.exercise, context.metadata);
  const recoveryFlag = recoveryFlagForBlock(context.currentBlock?.type);
  const recentPerformanceSignal = performanceSignalForExercise(context.exercise);
  const loadOwnership = loadOwnershipForExercise(context.exercise);
  const cycle = deriveCycleStrategyContext({
    goal,
    trainingPhase,
    weekInBlock: context.currentBlock?.currentWeek,
    blockLengthWeeks: context.currentBlock?.durationWeeks,
    plannedTrainingDays: context.activePlan?.daysPerWeek,
    currentSessionIndex: context.exerciseIndex + 1,
    recentPerformanceSignal,
    recoveryFlag,
    loadOwnership,
    evidenceConfidence: context.metadata?.isCustom ? 58 : 72,
  });
  const stimulusPlan = deriveAdaptiveStimulusPlan({
    goal,
    trainingPhase,
    sessionType: sessionTypeForWorkout(context.session),
    recoveryFlag,
    recentPerformanceSignal,
    stressBudgetBias: cycle.stress_budget_bias,
    cycleStrategyContext: cycle,
  });
  const stimulusDelivery = deriveAdaptiveStimulusDelivery({
    stimulusPlan,
    goal,
    trainingPhase,
    recoveryFlag,
    availableEquipment: "full_gym",
  });
  const suggestedStimulus = suggestedStimulusForExercise(exerciseCategory, context.metadata, stimulusDelivery.decisions);
  const sessionStrategy = decideSessionStrategy({
    goal,
    exerciseName: context.exercise.exerciseName,
    exerciseCategory,
    movementPattern: context.metadata?.movementPattern,
    trainingPhase,
    recoveryFlag,
    recentPerformanceSignal,
    loadEstimateConfidence: context.exercise.loadKnown === false ? "low" : "medium",
    exerciseExposureCount: getWorkSets(context.exercise.sets).length,
    loadOwnership,
    safetyFlag: context.exercise.finishReason === "pain_limitation",
    cycleStrategyContext: cycle,
  });
  const repPrescription = decideAdaptiveRepPrescription({
    goal,
    exerciseName: context.exercise.exerciseName,
    exerciseCategory,
    movementPattern: context.metadata?.movementPattern,
    trainingPhase,
    setObjective: sessionStrategy.set_objective,
    coachingBias: sessionStrategy.coaching_bias,
    prescribedRange: context.exercise.settings.repRange,
    exerciseExposureCount: getWorkSets(context.exercise.sets).length,
    loadEstimateConfidence: context.exercise.loadKnown === false ? 45 : 70,
    recoveryFlag: recoveryFlag === "poor",
    recentPerformanceSignal,
    fatigueCost: context.metadata?.fatigueCost,
  });
  const loadPrescription = decideAdaptiveLoadPrescription({
    goal,
    exerciseName: context.exercise.exerciseName,
    exerciseCategory,
    movementPattern: context.metadata?.movementPattern,
    trainingPhase,
    cycleStrategyContext: cycle,
    sessionStrategy,
    repPrescription,
    previousLoad: context.exercise.load,
    lastSuccessfulLoad: context.exercise.load,
    loadOwnership,
    recentPerformanceSignal,
    recoveryFlag,
    availableLoadJump: context.exercise.settings.loadIncrease,
    safetyFlag: context.exercise.finishReason === "pain_limitation",
  });
  const setDecision =
    context.adaptiveSetDecision ??
    (getWorkSets(context.exercise.sets).length > 0
      ? decideAdaptiveSetAllocation({
          exerciseName: context.exercise.exerciseName,
          settings: context.exercise.settings,
          sets: context.exercise.sets,
          currentLoad: context.exercise.load,
          metadata: context.metadata,
          blockType: context.currentBlock?.type,
          remainingExercises: context.session.exercises.slice(context.exerciseIndex + 1).filter((candidate) => candidate.status === "active").length,
          currentSessionWorkingSetCount: context.session.exercises.reduce((total, candidate) => total + getWorkSets(candidate.sets).length, 0),
          shutdown: context.exercise.status === "shutdown",
          repPrescription,
        })
      : null);

  return {
    cycle,
    sessionStrategy,
    repPrescription,
    loadPrescription,
    setDecision,
    chips: {
      exercise: context.exercise.exerciseName,
      stimulus: suggestedStimulus?.stimulus_id ?? "Stimulus pending",
      cycle: cycleLabel(goal, trainingPhase),
      intent: `${title(sessionStrategy.set_objective)} / ${title(sessionStrategy.coaching_bias)}`,
      reps: repLabel(repPrescription),
      load: title(loadPrescription.load_action),
      sets: setDecision ? title(setDecision.recommended_next) : "Waiting for set",
    },
    confidence: Math.round((cycle.confidence + sessionStrategy.confidence + repPrescription.confidence + loadPrescription.confidence + (setDecision?.confidence ?? 70)) / 5),
  };
}

function sessionTypeForWorkout(session: WorkoutSession): AdaptiveStimulusSessionType {
  const name = session.name.toLowerCase();
  if (name.includes("push")) return "push";
  if (name.includes("pull")) return "pull";
  if (name.includes("leg") || name.includes("lower")) return "legs";
  if (name.includes("upper")) return "upper";
  if (name.includes("power")) return "power";
  if (name.includes("conditioning")) return "conditioning";
  if (name.includes("recovery") || name.includes("deload")) return "recovery";
  return "full_body";
}

function suggestedStimulusForExercise(
  category: AdaptiveExerciseCategory,
  metadata: Exercise | undefined,
  decisions: StimulusDeliveryDecision[],
) {
  const exactId =
    category === "competition_squat" ? "competition_squat_strength" :
    category === "competition_bench" ? "competition_bench_strength" :
    category === "competition_deadlift" ? "competition_deadlift_strength" :
    category === "standing_overhead_press" ? "overhead_press_strength" :
    category === "power" ? decisions.find((decision) => decision.preferred_delivery_type === "power_movement")?.stimulus_id :
    undefined;
  if (exactId) return decisions.find((decision) => decision.stimulus_id === exactId);

  const primaryMuscles = metadata?.primaryMuscles?.map((muscle) => muscle.toLowerCase()) ?? [];
  const muscleStimulus =
    primaryMuscles.some((muscle) => muscle.includes("chest")) ? "chest_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("triceps")) ? "triceps_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("delt") || muscle.includes("shoulder")) ? "lateral_delt_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("lat")) ? "lat_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("back")) ? "upper_back_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("biceps")) ? "biceps_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("quad")) ? "quad_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("hamstring")) ? "hamstring_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("glute")) ? "glute_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("calf")) ? "calf_hypertrophy" :
    primaryMuscles.some((muscle) => muscle.includes("ab")) ? "abdominal_hypertrophy" :
    undefined;
  if (muscleStimulus) {
    const match = decisions.find((decision) => decision.stimulus_id === muscleStimulus);
    if (match) return match;
  }

  return decisions.find((decision) => decision.movement_pattern === metadata?.movementPattern) ?? decisions[0];
}

function programmingGoalForPlan(goal: TrainingSetupGoal | undefined): AdaptiveProgrammingGoal {
  if (goal === "build_strength" || goal === "powerlifting_meet") return "strength";
  if (goal === "build_muscle") return "hypertrophy";
  if (goal === "athletic_performance") return "athletic_performance";
  if (goal === "get_leaner") return "get_lean";
  return "build_muscle_strength";
}

function trainingPhaseForBlock(blockType: BlockType | undefined): AdaptiveTrainingPhase {
  if (blockType === "strength" || blockType === "powerbuilding") return "intensification";
  if (blockType === "peak") return "peak";
  if (blockType === "deload") return "deload";
  return "accumulation";
}

function categoryForExercise(exercise: WorkoutExerciseLog, metadata: Exercise | undefined): AdaptiveExerciseCategory {
  const name = exercise.exerciseName.toLowerCase();
  if (metadata?.measurementType === "duration" || exercise.settings.measurementType === "duration") return "duration_bodyweight";
  if (name.includes("competition squat")) return "competition_squat";
  if (name.includes("competition bench")) return "competition_bench";
  if (name.includes("competition deadlift")) return "competition_deadlift";
  if (name.includes("standing overhead press") || name.includes("military press")) return "standing_overhead_press";
  if (metadata?.role === "power") return "power";
  if (metadata?.role === "isolation") return "isolation";
  if (metadata?.role === "secondary_compound" || metadata?.kind === "machine" || metadata?.kind === "cable") return "machine_compound";
  if (metadata?.role === "primary_compound") return "heavy_compound";
  return "unsupported";
}

function recoveryFlagForBlock(blockType: BlockType | undefined): CycleRecoveryFlag {
  if (blockType === "deload") return "poor";
  return "normal";
}

function performanceSignalForExercise(exercise: WorkoutExerciseLog): RecentPerformanceSignal {
  if (exercise.status === "shutdown") return "overreached";
  const workSets = getWorkSets(exercise.sets);
  if (workSets.length === 0) return "unknown";
  const belowMin = workSets.some((set) => set.reps < exercise.settings.repRange.min);
  if (belowMin) return "overreached";
  const allTopRange = workSets.every((set) => set.reps >= exercise.settings.repRange.max);
  if (allTopRange && workSets.length >= 2) return "underloaded";
  return "appropriate";
}

function loadOwnershipForExercise(exercise: WorkoutExerciseLog): CycleLoadOwnership {
  if (exercise.loadKnown === false || exercise.load <= 0) return "unknown";
  const workSetCount = getWorkSets(exercise.sets).length;
  if (exercise.status === "shutdown") return "unstable";
  if (workSetCount === 0) return "introduced";
  if (workSetCount < 3) return "stabilising";
  return "owned";
}

function repLabel(rep: ReturnType<typeof decideAdaptiveRepPrescription>) {
  if (rep.prescription_type === "duration_hold" || rep.prescription_type === "duration_carry") {
    if (rep.target_seconds) return `${rep.target_seconds} sec`;
    if (rep.duration_range) return `${rep.duration_range.min}-${rep.duration_range.max} sec`;
  }
  if (rep.prescription_type === "top_range_check") return "Top-range check";
  if (rep.prescription_type === "capped_amrap") return `AMRAP cap ${rep.amrap_cap ?? ""}`.trim();
  if (rep.prescription_type === "amrap") return "AMRAP";
  if (rep.rep_range) return `${rep.rep_range.min}-${rep.rep_range.max} reps`;
  if (rep.target_reps) return `${rep.target_reps} reps`;
  return title(rep.prescription_type);
}

function cycleLabel(goal: AdaptiveProgrammingGoal, phase: AdaptiveTrainingPhase) {
  return `${title(goal)} ${title(phase)}`;
}

function title(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
