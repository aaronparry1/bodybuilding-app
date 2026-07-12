import type { Exercise, WorkoutHistorySummary } from "@/domain/training/models";
import type { DeloadProfile } from "@/domain/training/deload-prescription";
import { resolveEventTaper } from "@/domain/training/event-taper";
import { classifyFatigue, type FatigueClassifierResult } from "@/domain/training/fatigue-classifier";
import { buildHypertrophyCoachReport, type HypertrophyCoachReport } from "@/domain/training/progression-coach";
import { displayWorkoutName } from "@/domain/training/planned-workout";
import { buildStrategicCoachingViewModel, type StrategicCoachingViewModel } from "@/domain/training/strategic-coaching-presenter";
import { buildLegacyProgressCopyPresentationInput, type LegacyProgressCopyPresentationInput } from "@/domain/training/legacy-progress-copy-presentation";
import { buildLegacyProgressPrimaryEvidenceInput, type LegacyProgressPrimaryEvidenceInput } from "@/domain/training/legacy-progress-primary-evidence";
import { buildLegacyProgressJourneyActionsInput, type LegacyProgressJourneyActionsInput } from "@/domain/training/legacy-progress-journey-actions";
import { buildLegacyProgressActionFlowInput, type LegacyProgressActionFlowInput } from "@/domain/training/legacy-progress-action-flow";
import { recommendExerciseRotation, type ExerciseRotationRecommendation } from "@/domain/training/exercise-rotation";
import { analyzeMuscleVolumeLandmarks, getPrimaryVolumeRecommendation } from "@/domain/training/volume-landmarks";
import {
  analyzePersonalisedVolume,
  getPrimaryPersonalisedVolumeRecommendation,
  type PersonalisedVolumeResult,
} from "@/domain/training/personalised-volume";
import type { ActiveTrainingPlan } from "@/domain/training/plan-setup";
import { createPlanningContext } from "@/domain/training/planning-context";
import { getBlockTransitionPreview, shouldSuppressRotationRecommendation } from "@/domain/training/recommendation-actions";
import { resolveCurrentProgressContext, type CurrentProgressContext } from "@/domain/training/current-progress-context";
import { buildCurrentProgressStrategicSummary, type CurrentProgressStrategicSummary } from "@/domain/training/current-progress-strategic-summary";
import { evidence, fixtureSource, insufficientEvidence, type RecommendationEvidence } from "@/domain/training/recommendation-evidence";
import { previousVolumeLadderActions } from "@/domain/training/volume-adjustments";
import type { PrimaryLiftVariationSelection } from "@/domain/training/primary-lift-variations";
import { resolveRecoveryCapacity } from "@/domain/training/recovery-capacity";
import { buildRecoveryCapacityWeeklyTarget, type RecoveryCapacityWeeklyTarget } from "@/domain/training/recovery-capacity-delivery";

export interface ProgressWorkoutCard {
  sessionId: string;
  name: string;
  dateLabel: string;
  durationLabel: string;
  workSetsLabel: string;
  highlight: string;
}

export interface ProgressDashboardViewModel {
  currentProgressContext: CurrentProgressContext;
  currentStrategicSummary: CurrentProgressStrategicSummary;
  completedWorkouts: WorkoutHistorySummary[];
  hiddenZeroSetWorkouts: WorkoutHistorySummary[];
  hasEnoughHistory: boolean;
  verdictTitle: string;
  verdictMessage: string;
  actionTitle: string;
  actionMessage: string;
  progressionNote?: string;
  volumeRecommendation?: string;
  recoveryCapacityRecommendation?: string;
  recoveryCapacityTarget?: RecoveryCapacityWeeklyTarget;
  rotationRecommendation?: string;
  recommendationEvidence: RecommendationEvidence;
  actionFlow?: ProgressActionFlow;
  journeyActions: {
    primary: {
      label: string;
      href: string;
    };
    secondary?: {
      label: string;
      message: string;
    };
  };
  recentProgress: string[];
  recentWorkouts: ProgressWorkoutCard[];
  emptyMessage: string;
}

export type ProgressActionFlow =
  | {
      type: "deload";
      title: string;
      reason: string;
      primaryLabel: string;
      deloadProfile: DeloadProfile;
      evidence: RecommendationEvidence;
    }
  | {
      type: "rotation";
      title: string;
      reason: string;
      primaryLabel: string;
      secondaryLabel: string;
      currentExerciseId: string;
      currentExerciseName: string;
      replacementExerciseId?: string;
      replacementExerciseName?: string;
      structuredPrimaryLiftVariation?: PrimaryLiftVariationSelection;
      evidence: RecommendationEvidence;
    }
  | {
      type: "volume";
      title: string;
      reason: string;
      primaryLabel: string;
      secondaryLabel: string;
      muscleGroup: PersonalisedVolumeResult["muscleGroup"];
      ladderAction: PersonalisedVolumeResult["recommendedLadderAction"];
      recommendation: PersonalisedVolumeResult;
      evidence: RecommendationEvidence;
    }
  | {
      type: "accepted";
      title: string;
      reason: string;
      primaryLabel: string;
      evidence: RecommendationEvidence;
    };

export function buildProgressDashboardViewModel(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  activePlan?: ActiveTrainingPlan | null,
): ProgressDashboardViewModel {
  const currentProgressContext = resolveCurrentProgressContext();
  const currentStrategicSummary = buildCurrentProgressStrategicSummary(currentProgressContext);
  const planningContext = activePlan ? createPlanningContext(activePlan) : null;
  const completedWorkouts = normalCompletedWorkouts(history);
  const plannedCompletedWorkouts = normalPlannedCompletedWorkouts(history);
  const hiddenZeroSetWorkouts = history.filter((summary) => !isNormalCompletedWorkout(summary));
  const coachReport = buildHypertrophyCoachReport(plannedCompletedWorkouts, exercises);
  const source = fixtureSource(isFixtureHistory(plannedCompletedWorkouts));
  const activeBlock = activePlan ? activePlan.blocks.find((block) => block.id === activePlan.activeBlockId) ?? activePlan.blocks[0] : null;
  const strategic = buildStrategicCoachingViewModel(plannedCompletedWorkouts, exercises, {
    goal: planningContext?.goal ?? activePlan?.goal,
    currentBlockType: activeBlock?.type,
  });
  const legacyCopyPresentation = buildLegacyProgressCopyPresentationInput(strategic);
  const eventTaper = activePlan?.targetDate
    ? resolveEventTaper({
        eventType: activePlan.eventType,
        targetDate: activePlan.targetDate,
        currentBlock: activeBlock?.type,
        goal: activePlan.goal,
        experienceLevel: activePlan.experienceLevel,
      })
    : null;
  const previousLadderActionsByMuscle = Object.fromEntries(
    exercises.flatMap((exercise) => exercise.primaryMuscles).map((muscle) => [muscle, previousVolumeLadderActions(activePlan, muscle)]),
  );
  const rawPersonalisedVolumeResults = strategic.hasEnoughHistory
    ? analyzePersonalisedVolume({
        completedWorkouts: plannedCompletedWorkouts,
        exercises,
        goal: activePlan?.goal,
        experienceLevel: activePlan?.experienceLevel,
        block: activeBlock?.type,
        deloadActive: activeBlock?.type === "deload" || activePlan?.recommendationState?.deload?.status === "accepted",
        eventTaper,
        previousLadderActionsByMuscle,
      })
    : [];
  const fatigueClassification = classifyFatigue({
    workoutHistory: plannedCompletedWorkouts,
    exercises,
    muscleVolumeSignals: rawPersonalisedVolumeResults,
    block: activeBlock?.type,
    goal: activePlan?.goal,
    deloadActive: activeBlock?.type === "deload" || activePlan?.recommendationState?.deload?.status === "accepted",
  });
  const personalisedVolumeResults = strategic.hasEnoughHistory
    ? analyzePersonalisedVolume({
        completedWorkouts: plannedCompletedWorkouts,
        exercises,
        goal: activePlan?.goal,
        experienceLevel: activePlan?.experienceLevel,
        block: activeBlock?.type,
        deloadActive: activeBlock?.type === "deload" || activePlan?.recommendationState?.deload?.status === "accepted",
        eventTaper,
        previousLadderActionsByMuscle,
        fatigueClassification,
      })
    : [];
  const personalisedVolumeRecommendation = strategic.hasEnoughHistory ? getPrimaryPersonalisedVolumeRecommendation(personalisedVolumeResults) : null;
  const recoveryCapacity = strategic.hasEnoughHistory
    ? resolveRecoveryCapacity({
        goal: activePlan?.goal,
        block: activeBlock?.type,
        eventType: activePlan?.eventType,
        fatigueClassification,
        personalisedVolumeState: personalisedVolumeResults,
        extraSessionWorkload: completedWorkouts.filter((summary) => summary.sessionKind && summary.sessionKind !== "planned").length,
        recoveryCardioPreference: activePlan?.recoveryCardioPreference,
        weeklyTrainingVolume: plannedCompletedWorkouts.slice(0, 4).reduce((sum, summary) => sum + summary.setsCompleted, 0),
        experienceLevel: activePlan?.experienceLevel,
        completedWorkouts: plannedCompletedWorkouts,
      })
    : null;
  const recoveryCapacityTarget = buildRecoveryCapacityWeeklyTarget({
    activePlan,
    currentBlock: activeBlock,
    history,
    exercises,
  });
  const volumeRecommendation = strategic.hasEnoughHistory
    ? getPrimaryVolumeRecommendation(analyzeMuscleVolumeLandmarks(plannedCompletedWorkouts, exercises, new Date(), { block: activeBlock?.type, goal: activePlan?.goal }))
    : null;
  const rotationAction = strategic.hasEnoughHistory ? firstRotationRecommendation(plannedCompletedWorkouts, exercises, activePlan, fatigueClassification) : undefined;
  const rotationRecommendation = rotationAction ? formatRotationRecommendation(rotationAction) : undefined;
  const hasRecoveryPriority = isRecoveryPriority(strategic, fatigueClassification);
  const primaryExerciseAction = firstExerciseAction(coachReport);
  const legacyTransitionPreview = activePlan ? getBlockTransitionPreview(activePlan) : null;
  const legacyActionFlowInput = buildLegacyProgressActionFlowInput({
    history: { hasEnoughHistory: strategic.hasEnoughHistory },
    recovery: {
      accepted: activePlan?.recommendationState?.deload?.status === "accepted",
      ...(activePlan?.recommendationState?.deload?.status === "accepted" ? { acceptedAt: activePlan.recommendationState.deload.decidedAt } : {}),
      priority: hasRecoveryPriority,
      fatigue: fatigueClassification,
      ...(strategic.recommendation?.deloadProfile ? { deloadProfile: strategic.recommendation.deloadProfile } : {}),
      recommendationReasons: [...(strategic.recommendation?.reasons ?? [])],
    },
    rotation: { action: rotationAction },
    volume: { recommendation: personalisedVolumeRecommendation },
    strategic: {
      ...(legacyTransitionPreview?.available
        ? { transitionAvailable: true, transitionReason: legacyTransitionPreview.reason }
        : { transitionAvailable: false }),
    },
    ordering: { source },
  });
  const actionFlow = buildActionFlow(legacyActionFlowInput);
  const legacyJourneyActionsInput = buildLegacyProgressJourneyActionsInput(strategic, hasRecoveryPriority, Boolean(rotationRecommendation));
  const journeyActions = buildJourneyActions(legacyJourneyActionsInput);
  const legacyPrimaryEvidenceInput = buildLegacyProgressPrimaryEvidenceInput({
    historical: { completedWorkouts: plannedCompletedWorkouts, source },
    strategic: { hasEnoughHistory: strategic.hasEnoughHistory, ...(strategic.recommendation?.title ? { recommendationTitle: strategic.recommendation.title } : {}), ...(strategic.recommendation?.message ? { recommendationMessage: strategic.recommendation.message } : {}), recommendationReasons: [...(strategic.recommendation?.reasons ?? [])] },
    recovery: { priority: hasRecoveryPriority, fatigue: fatigueClassification },
    volume: { primary: volumeRecommendation, personalised: personalisedVolumeRecommendation },
    rotation: { action: rotationAction },
  });

  return {
    currentProgressContext,
    currentStrategicSummary,
    completedWorkouts,
    hiddenZeroSetWorkouts,
    hasEnoughHistory: strategic.hasEnoughHistory,
    verdictTitle: verdictTitle(legacyCopyPresentation, hasRecoveryPriority),
    verdictMessage: verdictMessage(legacyCopyPresentation, hasRecoveryPriority),
    actionTitle: actionTitle(legacyCopyPresentation, primaryExerciseAction, hasRecoveryPriority),
    actionMessage: actionMessage(legacyCopyPresentation, primaryExerciseAction, hasRecoveryPriority),
    progressionNote: hasRecoveryPriority && primaryExerciseAction ? progressionNote(primaryExerciseAction) : undefined,
    volumeRecommendation: personalisedVolumeRecommendation?.userCopy ?? volumeRecommendation?.reason,
    recoveryCapacityRecommendation:
      recoveryCapacity && recoveryCapacity.recommendation !== "none" && recoveryCapacity.message
        ? `${recoveryCapacity.message}${recoveryCapacity.frequencySuggestion ? ` ${recoveryCapacity.frequencySuggestion}` : ""}`
        : undefined,
    recoveryCapacityTarget,
    rotationRecommendation,
    recommendationEvidence: buildPrimaryEvidence(legacyPrimaryEvidenceInput),
    actionFlow,
    journeyActions,
    recentProgress: recentProgressItems(completedWorkouts),
    recentWorkouts: completedWorkouts.slice(0, 3).map(toWorkoutCard),
    emptyMessage: strategic.emptyMessage ?? "Log 3-5 completed workouts first. Then Progress can give useful coaching.",
  };
}

function buildActionFlow(input: LegacyProgressActionFlowInput): ProgressActionFlow | undefined {
  const { source } = input.ordering;
  const { fatigue } = input.recovery;
  const hasRecoveryPriority = input.recovery.priority;
  const rotationAction = input.rotation.action;
  const personalisedVolumeRecommendation = input.volume.recommendation;

  if (!input.history.hasEnoughHistory) return undefined;

  if (input.recovery.accepted) {
    return {
      type: "accepted",
      title: "Recovery session planned",
      reason: "Home and Plan now use a calmer recovery phase. Keep the work easy until performance normalises.",
      primaryLabel: "View recovery plan",
      evidence: evidence({
        type: "deload_accepted",
        confidence: "high",
        source: "history",
        summary: "Recovery was automatically planned from high-confidence fatigue evidence.",
        dataPoints: [`Accepted at ${input.recovery.acceptedAt}`],
        reason: "Deload is active on the plan.",
        actionAllowed: true,
      }),
    };
  }

  if (hasRecoveryPriority) {
    return {
      type: "deload",
      title: "Recovery session planned",
      reason:
        fatigue.classification === "systemic" || fatigue.classification === "mixed"
          ? "Performance is dropping before useful work is complete, so the next plan needs less stress."
          : "Fatigue is affecting key training decisions, so the next plan needs less stress.",
      primaryLabel: "View recovery plan",
      deloadProfile: input.recovery.deloadProfile ?? "clear",
      evidence: evidence({
        type: "deload",
        confidence: "high",
        source,
        summary: "Recovery is the priority signal and should be planned automatically.",
        dataPoints: [...(input.recovery.recommendationReasons.length > 0 ? input.recovery.recommendationReasons : ["Readiness and fatigue signals point toward recovery."]), ...fatigue.evidence].slice(0, 7),
        reason: fatigue.classification === "systemic" || fatigue.classification === "mixed" ? fatigue.recommendedResponse : "Performance is dropping and fatigue is rising.",
        actionAllowed: true,
      }),
    };
  }

  if (rotationAction) {
    return {
      type: "rotation",
      title: `Rotate ${rotationAction.currentExerciseName}`,
      reason: rotationAction.reason,
      primaryLabel: "Replace exercise",
      secondaryLabel: "Keep exercise",
      currentExerciseId: rotationAction.currentExerciseId,
      currentExerciseName: rotationAction.currentExerciseName,
      replacementExerciseId: rotationAction.suggestedReplacement?.id,
      replacementExerciseName: rotationAction.suggestedReplacement?.name,
      structuredPrimaryLiftVariation: rotationAction.structuredPrimaryLiftVariation,
      evidence: evidence({
        type: "exercise_rotation",
        confidence: "high",
        source,
        summary: rotationAction.structuredPrimaryLiftVariation ? "Primary-lift stall criteria were met." : "Exercise-level stall criteria were met.",
        dataPoints: [
          rotationAction.reason,
          rotationAction.structuredPrimaryLiftVariation
            ? `Structured ${rotationAction.structuredPrimaryLiftVariation.family.label} variation: ${rotationAction.structuredPrimaryLiftVariation.selectedExercise.name}`
            : rotationAction.suggestedReplacement
              ? `Suggested same-family/role replacement: ${rotationAction.suggestedReplacement.name}`
              : "No suitable replacement found.",
        ],
        reason: rotationAction.reason,
        actionAllowed: Boolean(rotationAction.suggestedReplacement),
      }),
    };
  }

  if (personalisedVolumeRecommendation && personalisedVolumeRecommendation.recommendedLadderAction !== "hold") {
    return {
      type: "volume",
      title: volumeActionTitle(personalisedVolumeRecommendation),
      reason: personalisedVolumeRecommendation.userCopy,
      primaryLabel: "Apply change",
      secondaryLabel: "Ignore for now",
      muscleGroup: personalisedVolumeRecommendation.muscleGroup,
      ladderAction: personalisedVolumeRecommendation.recommendedLadderAction,
      recommendation: personalisedVolumeRecommendation,
      evidence: evidence({
        type: "volume_change",
        confidence: personalisedVolumeRecommendation.confidence,
        source,
        summary: "Muscle-specific volume trend produced an approved-change option.",
        dataPoints: personalisedVolumeRecommendation.evidence.summary,
        reason: personalisedVolumeRecommendation.reason,
        actionAllowed: personalisedVolumeRecommendation.confidence !== "low" && !["insufficient_data", "deload_caution"].includes(personalisedVolumeRecommendation.recommendedLadderAction),
      }),
    };
  }

  if (input.strategic.transitionAvailable) {
    return {
      type: "accepted",
      title: "Block decision available",
      reason: "Plan can move you forward, repeat the current block, or leave the decision for later.",
      primaryLabel: "Review in Plan",
      evidence: evidence({
        type: "block_transition",
        confidence: "medium",
        source: "history",
        summary: "The active block has reached its planned endpoint.",
        dataPoints: [input.strategic.transitionReason ?? ""],
        reason: "Review the block decision in Plan.",
        actionAllowed: true,
      }),
    };
  }

  return undefined;
}

function buildPrimaryEvidence(input: LegacyProgressPrimaryEvidenceInput): RecommendationEvidence {
  const { completedWorkouts, source } = input.historical;
  const { recommendationReasons, recommendationMessage, recommendationTitle, hasEnoughHistory } = input.strategic;
  const { fatigue: fatigueClassification, priority: recoveryPriority } = input.recovery;
  const { primary: volumeRecommendation, personalised: personalisedVolumeRecommendation } = input.volume;
  const rotationAction = input.rotation.action;
  if (!hasEnoughHistory) {
    return insufficientEvidence("progress_dashboard", "Log 3-5 completed workouts first.");
  }
  if (recoveryPriority) {
    return evidence({
      type: "progress_dashboard",
      confidence: "high",
      source,
      summary: "Recovery signals outrank load or volume actions.",
      dataPoints: [`${completedWorkouts.length} completed workouts`, ...fatigueClassification.evidence, ...recommendationReasons].slice(0, 7),
      reason: fatigueClassification.classification !== "insufficient_data" ? fatigueClassification.recommendedResponse : "Fatigue is limiting progress.",
      actionAllowed: true,
    });
  }
  if (personalisedVolumeRecommendation && personalisedVolumeRecommendation.recommendedLadderAction !== "hold") {
    return evidence({
      type: "volume_change",
      confidence: personalisedVolumeRecommendation.confidence,
      source,
      summary: "Muscle-specific volume trend produced a ladder recommendation.",
      dataPoints: [
        `${completedWorkouts.length} completed workouts`,
        ...personalisedVolumeRecommendation.evidence.summary,
      ].slice(0, 6),
      reason: personalisedVolumeRecommendation.reason,
      actionAllowed: personalisedVolumeRecommendation.confidence !== "low",
    });
  }
  if (volumeRecommendation && volumeRecommendation.recommendation !== "maintain" && recommendationTitle?.toLowerCase().includes("volume")) {
    return evidence({
      type: "volume_change",
      confidence: "medium",
      source,
      summary: "Muscle-volume trend crossed a recommendation threshold.",
      dataPoints: [
        `${completedWorkouts.length} completed workouts`,
        ...recommendationReasons.slice(0, 2),
        `${volumeRecommendation.muscleGroup.replaceAll("_", " ")}: ${volumeRecommendation.weeklyProductiveSets} productive sets this week`,
        `Progression rate ${Math.round(volumeRecommendation.progressionRate * 100)}%`,
        `Regressive shutdown pressure ${Math.round(volumeRecommendation.shutdownRate * 100)}%`,
      ],
      reason: volumeRecommendation.reason,
      actionAllowed: true,
    });
  }
  if (rotationAction) {
    return evidence({
      type: "exercise_rotation",
      confidence: "high",
      source,
      summary: "Exercise-level stall criteria were met.",
      dataPoints: [rotationAction.reason, ...recommendationReasons].slice(0, 5),
      reason: rotationAction.reason,
      actionAllowed: Boolean(rotationAction.suggestedReplacement),
    });
  }
  return evidence({
    type: "progress_dashboard",
    confidence: "medium",
    source,
    summary: "Enough completed workouts for a general coach verdict.",
    dataPoints: [`${completedWorkouts.length} completed workouts`, ...recommendationReasons].slice(0, 5),
    reason: recommendationMessage ?? "Continue collecting training history.",
    actionAllowed: true,
  });
}

function isFixtureHistory(history: WorkoutHistorySummary[]): boolean {
  return history.some((summary) => summary.userId === "design-qa-local" || summary.notes?.includes("[Design QA Fixture]"));
}

function buildJourneyActions(input: LegacyProgressJourneyActionsInput): ProgressDashboardViewModel["journeyActions"] {
  if (!input.strategic.hasEnoughHistory) {
    return {
      primary: { label: "Log a workout", href: "/(protected)/(tabs)/train" },
      secondary: {
        label: "Review plan",
        message: "Open Plan if you want to check the structure before logging more sessions.",
      },
    };
  }

  if (input.recovery.priority) {
    return {
      primary: { label: "View recovery plan", href: "/(protected)/(tabs)/programmes" },
    };
  }

  if (input.rotation.hasRecommendation) {
    return {
      primary: { label: "Review rotation in Train", href: "/(protected)/(tabs)/train" },
      secondary: {
        label: "Keep exercise",
        message: "Noted. Keep the exercise if it still feels good and setup is available.",
      },
    };
  }

  const recommendation = input.strategic.recommendationTitle?.toLowerCase() ?? "";
  if (recommendation.includes("advance") || recommendation.includes("repeat") || recommendation.includes("extend")) {
    return {
      primary: { label: "Review block in Plan", href: "/(protected)/(tabs)/programmes" },
      secondary: {
        label: "Stay here for now",
        message: "Noted. Continue this block until your next completed workouts give a clearer signal.",
      },
    };
  }

  return {
    primary: { label: "Start next workout", href: "/(protected)/(tabs)/train" },
    secondary: {
      label: "View plan",
      message: "Open Plan if you want to check the coming week before training.",
    },
  };
}

function firstRotationRecommendation(
  history: WorkoutHistorySummary[],
  exercises: Exercise[],
  activePlan?: ActiveTrainingPlan | null,
  fatigueClassification?: FatigueClassifierResult,
): ExerciseRotationRecommendation | undefined {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const entriesByExercise = new Map<string, WorkoutHistorySummary["exerciseSummaries"]>();
  const activeBlock = activePlan?.blocks.find((block) => block.id === activePlan.activeBlockId) ?? activePlan?.blocks[0];

  for (const entry of history.flatMap((summary) => summary.exerciseSummaries)) {
    const entries = entriesByExercise.get(entry.exerciseId) ?? [];
    entries.push(entry);
    entriesByExercise.set(entry.exerciseId, entries);
  }

  for (const [exerciseId, entries] of entriesByExercise) {
    if (shouldSuppressRotationRecommendation(activePlan, exerciseId)) continue;
    const exercise = exerciseById.get(exerciseId);
    if (!exercise) continue;
    const recommendation = recommendExerciseRotation(exercise, entries, exercises, {
      blockType: activeBlock?.type,
      goal: activePlan?.goal,
      experienceLevel: activePlan?.experienceLevel,
      equipmentAvailable: activePlan?.equipment,
      variationHistory: activePlan?.recommendationState?.primaryLiftVariations,
      currentWeek: activeBlock?.currentWeek,
      fatigueClassification,
      exercisePreferences: activePlan?.recommendationState?.exercisePreferences,
    });
    if (!recommendation.shouldRotate) continue;
    return recommendation;
  }

  return undefined;
}

function formatRotationRecommendation(recommendation: ExerciseRotationRecommendation): string {
  const replacement = recommendation.suggestedReplacement?.name;
  return replacement
    ? `Rotate ${recommendation.currentExerciseName}. ${recommendation.reason} Suggested replacement: ${replacement}.`
    : `Rotate ${recommendation.currentExerciseName}. ${recommendation.reason}`;
}

function volumeActionTitle(recommendation: PersonalisedVolumeResult): string {
  switch (recommendation.recommendedLadderAction) {
    case "bias_high":
      return "Aim higher in the range";
    case "raise_range":
      return "Raise the set target";
    case "add_exercise":
      return "Add a low-fatigue slot";
    case "bias_low":
      return "Stay lower in the range";
    case "lower_range":
      return "Lower accessory work";
    case "remove_or_swap_exercise":
      return "Trim a low-priority slot";
    default:
      return "Volume adjustment";
  }
}

export function normalCompletedWorkouts(history: WorkoutHistorySummary[]): WorkoutHistorySummary[] {
  return history.filter(isNormalCompletedWorkout);
}

export function normalPlannedCompletedWorkouts(history: WorkoutHistorySummary[]): WorkoutHistorySummary[] {
  return history.filter((summary) => isNormalCompletedWorkout(summary) && (summary.sessionKind == null || summary.sessionKind === "planned"));
}

export function cleanGeneratedSessionName(name: string): string {
  return displayWorkoutName(name);
}

function isNormalCompletedWorkout(summary: WorkoutHistorySummary): boolean {
  return Boolean(summary.completedAt) && summary.setsCompleted > 0 && summary.exerciseSummaries.some((exercise) => exercise.setsCompleted > 0);
}

function isRecoveryPriority(strategic: StrategicCoachingViewModel, fatigueClassification?: FatigueClassifierResult): boolean {
  const recommendation = strategic.recommendation?.title.toLowerCase() ?? "";
  const separatedFatiguePriority =
    (fatigueClassification?.classification === "systemic" || fatigueClassification?.classification === "mixed") &&
    fatigueClassification.severity === "high" &&
    fatigueClassification.confidence !== "low";
  return separatedFatiguePriority || recommendation.includes("deload") || recommendation.includes("recovery window");
}

function firstExerciseAction(report: HypertrophyCoachReport): string | null {
  return report.coachingSummary.find((item) => item.trim().length > 0) ?? null;
}

function verdictTitle(input: LegacyProgressCopyPresentationInput, recoveryPriority: boolean): string {
  if (!input.hasEnoughHistory) return "Not enough data yet.";
  if (recoveryPriority) return "Fatigue is the limiter.";
  const recommendation = input.recommendationTitle?.toLowerCase() ?? "";
  const momentum = input.momentumBand?.toLowerCase() ?? "";
  if (recommendation.includes("advance")) return "You are ready to shift emphasis.";
  if (momentum.includes("strong")) return "Training is moving well.";
  if (momentum.includes("slowing")) return "Progress is slowing.";
  return "Training is on track.";
}

function verdictMessage(input: LegacyProgressCopyPresentationInput, recoveryPriority: boolean): string {
  if (!input.hasEnoughHistory) return "Log 3-5 completed workouts first. Then Progress can give useful coaching.";
  if (recoveryPriority) return "The next plan should reduce stress until output normalises.";
  const reasons = input.recommendationReasons;
  if (reasons.length > 0) return reasons.slice(0, 2).join(" ");
  return input.recommendationMessage ?? "Keep collecting productive work from completed sessions.";
}

function actionTitle(input: LegacyProgressCopyPresentationInput, exerciseAction: string | null, recoveryPriority: boolean): string {
  if (!input.hasEnoughHistory) return "Build more history first.";
  if (recoveryPriority) return "Recovery session planned.";
  const recommendation = input.recommendationTitle;
  if (recommendation) return sentenceCase(recommendation);
  return exerciseAction ? sentenceCase(stripExercisePrefix(exerciseAction)) : "Stay the course.";
}

function actionMessage(input: LegacyProgressCopyPresentationInput, exerciseAction: string | null, recoveryPriority: boolean): string {
  if (!input.hasEnoughHistory) return "Complete a few real sessions and Progress will start giving objective recommendations.";
  if (recoveryPriority) return "ASC will keep the next session calmer. Let output recover before chasing load.";
  if (input.recommendationMessage) return input.recommendationMessage;
  return exerciseAction ?? "Maintain the current plan until the logbook says otherwise.";
}

function progressionNote(exerciseAction: string): string {
  if (exerciseAction.toLowerCase().includes("increase load")) {
    return `${exerciseAction} Apply it after recovery normalises.`;
  }
  return exerciseAction;
}

function recentProgressItems(history: WorkoutHistorySummary[]): string[] {
  const highlights = history
    .flatMap((summary) => summary.progressionHighlights.map(formatHighlight))
    .filter((highlight): highlight is string => Boolean(highlight));
  if (highlights.length > 0) return unique(highlights).slice(0, 3);

  const shutdown = history
    .flatMap((summary) => summary.exerciseSummaries)
    .find((exercise) => exercise.stoppedByDropOff);
  if (shutdown) return [`${shutdown.exerciseName} hit the stop point. Productive work was capped cleanly.`];

  return history.length > 0 ? ["Training data is building. No clear progression highlight yet."] : [];
}

function toWorkoutCard(summary: WorkoutHistorySummary): ProgressWorkoutCard {
  return {
    sessionId: summary.sessionId,
    name: cleanGeneratedSessionName(summary.sessionName),
    dateLabel: new Date(summary.completedAt).toLocaleDateString(),
    durationLabel: `${summary.durationMinutes} min`,
    workSetsLabel: `${summary.setsCompleted} work sets`,
    highlight: formatHighlight(summary.progressionHighlights[0]) ?? `${summary.exerciseSummaries[0]?.exerciseName ?? "Session"} logged clean work.`,
  };
}

function formatHighlight(highlight?: string): string | undefined {
  if (!highlight) return undefined;
  return cleanGeneratedSessionName(highlight).replace("->", "→");
}

function stripExercisePrefix(message: string): string {
  return message.replace(/^[^:]+:\s*/, "");
}

function sentenceCase(value: string): string {
  if (value.length === 0) return value;
  return `${value[0]!.toUpperCase()}${value.slice(1)}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
