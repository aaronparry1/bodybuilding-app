import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { defaultAppSettings, useAppSettings, type AppSettings } from "@/application/settings/app-settings";
import { syncLocalDataForUser } from "@/application/sync/cloud-data-sync";
import { resolveWorkoutExerciseSettings } from "@/application/settings/workout-settings";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { trainingEvidenceRepository } from "@/data/local/training-evidence-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { LocalSyncQueueStore } from "@/data/sync/local-sync-queue-store";
import { SyncQueue } from "@/data/sync/sync-queue";
import type { Exercise, ManualExerciseFinishReason, NextLoadApproval, ProgramExercise, SetLog, WorkoutExerciseLog, WorkoutHistorySummary, WorkoutSession } from "@/domain/training/models";
import { decideAdaptiveSetAllocation } from "@/domain/training/adaptive-set-allocation";
import { getLatestOpenSession } from "@/domain/training/active-workout";
import { getExerciseSwapSuggestions, swapExerciseInSession } from "@/domain/training/exercise-swaps";
import { applyInSessionEscalationToFuturePrescription } from "@/domain/training/in-session-escalation";
import { addExerciseToSession, removeAddedExerciseFromSession, removeExerciseForTodayFromSession, type AddExercisePosition } from "@/domain/training/session-editing";
import { deleteLoggedSetFromSession, editLoggedSetInSession, removeFutureWorkSetFromSession } from "@/domain/training/session-set-editing";
import { getDeloadAwareInSessionLoadIncreaseSuggestion, getInSessionLoadDropSuggestion, resolveStartingLoadRecommendation } from "@/domain/training/load-selection";
import { finishExerciseManuallyInSession, reopenExercise } from "@/domain/training/workout-exercise-state";
import { evaluateExerciseProgression } from "@/domain/training/progression-engine";
import { clampRestSeconds, getRestCompleteMessage, getRestTimerDefault } from "@/domain/training/rest-timer";
import { buildWorkoutSessionFromProgrammeDay } from "@/domain/training/session-builder";
import { getLastExercisePerformance, summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { getWorkSets } from "@/domain/training/workout-sets";
import { buildProductiveSetGuidance } from "@/domain/training/productive-set-targets";
import { resolveSetPrescription } from "@/domain/training/set-prescription";
import { resolveTrainingGapAdjustment } from "@/domain/training/training-gap-adjustment";
import { exerciseLibrary } from "@/domain/training/presets";
import { workoutTypeForName } from "@/domain/training/workout-name";
import { resolveRecommendedSessionIndex } from "@/domain/training/training-session-selection";
import { type ActiveTrainingPlan, type TrainingSetupGoal } from "@/domain/training/plan-setup";
import { orchestrateCompletedPlannedWorkout } from "@/domain/training/current-completion-orchestration";
import type { TrainingGoalId } from "@/domain/training/training-goals";
import { buildDefaultPostWorkoutReviewAnswers, runFirstShippablePostWorkoutLoop } from "@/domain/training/first-shippable-coaching-loop";
import { buildRecoveryWorkoutSession } from "@/domain/training/recovery-workout-constructor";
import { resolveCanonicalLoadEvidence } from "@/domain/training/load-evidence-resolver";
import type { PostWorkoutReviewAnswers } from "@/domain/training/post-workout-review-flow";
import type { BlockType, TrainingBlock } from "@/domain/training/annual-models";
import type { AdaptiveProgrammingGoal, AdaptiveTrainingPhase, RecentPerformanceSignal } from "@/domain/training/adaptive-rep-prescription";
import type { AdaptiveStimulusKnownLimitation } from "@/domain/training/adaptive-stimulus-planner";
import type { CycleLoadOwnership, CycleRecoveryFlag } from "@/domain/training/cycle-strategy-context";

const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const syncQueue = new SyncQueue(new LocalSyncQueueStore());
const shutdownCopy =
  "Exercise complete. Performance dropped enough to move on.";

export interface ActiveRestTimer {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  startedAt: string;
  durationSeconds: number;
  reason: string;
}

function createExerciseLogFromExercise(
  exercise: Exercise,
  load: number,
  appSettings: AppSettings,
  plannedSlot?: ProgramExercise,
  currentBlock?: TrainingBlock | null,
): WorkoutExerciseLog {
  return {
    id: makeId("workout-exercise"),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    settings: resolveWorkoutExerciseSettings(exercise, appSettings, plannedSlot, currentBlock),
    load,
    loadKnown: exercise.kind === "bodyweight" || plannedSlot?.suggestedLoad != null || load > 0,
    sets: [],
    status: "active",
    origin: "planned",
  };
}

function createSessionFromProgrammeDay(
  userId?: string | null,
): WorkoutSession | null {
  const selection = programmeRepository.getSelectedProgrammeDay();
  if (!selection) return null;

  const programme = programmeRepository.listAll().find((candidate) => candidate.id === selection.programmeId);
  if (!programme) {
    programmeRepository.clearSelectedProgrammeDay();
    return null;
  }

  const session = buildWorkoutSessionFromProgrammeDay(
    programme,
    selection.dayId,
    availableWorkoutExercises(),
    {
      id: makeId("custom-session"),
      userId: userId ?? "guest-local",
      startedAt: now(),
      sessionKind: selection.sessionKind,
    },
  );
  programmeRepository.clearSelectedProgrammeDay();
  return session;

  /*
  const selection = programmeRepository.getSelectedProgrammeDay();
  if (!selection) return null;

  const programme = programmeRepository.listAll().find((candidate) => candidate.id === selection.programmeId);
  if (!programme) return null;

  const availableExercises = availableWorkoutExercises();
  const timestamp = now();
  const sessionKind = selection.sessionKind ?? "planned";
  const isPlannedSession = sessionKind === "planned";
  const history = summarizeWorkoutHistory(workoutSessionRepository.list());

  if (isPlannedSession) {
    const selectedDay = programme.days.find((candidate) => candidate.id === selection.dayId);
    const sessionType = sessionTypeForWorkoutName(selectedDay?.name ?? programme.name);
    const v2Session = createV2LiveWorkoutSession({
      userId,
      sessionId: makeId("session"),
      startedAt: timestamp,
      programmeId: programme.id,
      templateId: selection.dayId,
      programmeName: programme.name,
      planSessionIndex: selection.planSessionIndex,
      planBlockId: selection.planBlockId ?? currentBlock?.id,
      planWeekNumber: selection.planWeekNumber ?? currentBlock?.currentWeek,
      selectedSession: sessionType,
      goal: adaptiveGoalForProgramme(programme.goal, activePlan?.goal),
      trainingPhase: adaptivePhaseForBlock(currentBlock?.type),
      recoveryFlag: recoveryFlagFor(currentBlock, history),
      recentPerformanceSignal: recentPerformanceSignalFor(history),
      loadOwnership: loadOwnershipFor(history),
      loadEstimateConfidence: history.length >= 3 ? "high" : history.length > 0 ? "medium" : "low",
      evidenceConfidence: Math.min(95, 55 + history.length * 8),
      experienceLevel: activePlan?.experienceLevel ?? programme.experienceLevel,
      knownLimitations: knownLimitationsFor(history),
      exercises: availableExercises,
      history,
    });
    if (v2Session) {
      programmeRepository.clearSelectedProgrammeDay();
      return v2Session;
    }
    if (!isLegacyWorkoutGenerationRollbackEnabled()) {
      programmeRepository.clearSelectedProgrammeDay();
      return null;
    }
  }

  const session = buildWorkoutSessionFromProgrammeDay(
    programme,
    selection.dayId,
    availableExercises,
    {
      id: makeId("session"),
      userId: userId ?? "guest-local",
      startedAt: timestamp,
      planSessionIndex: selection.planSessionIndex,
      planBlockId: isPlannedSession ? selection.planBlockId ?? currentBlock?.id : undefined,
      planWeekNumber: isPlannedSession ? selection.planWeekNumber ?? currentBlock?.currentWeek : undefined,
      sessionKind,
    },
    currentBlock,
  );
  programmeRepository.clearSelectedProgrammeDay();
  return session;
  */
}

function createSessionFromActivePlan(userId?: string | null, appSettings?: AppSettings): WorkoutSession | null {
  // Production recovery has one entry point for authoritative planned workouts.
  const activePlan = activeTrainingPlanRepository.getOptional();
  if (!activePlan) return null;
  const availableExercises = availableWorkoutExercises();
  const history = summarizeWorkoutHistory(workoutSessionRepository.list());
  const planSessionIndex = resolveRecommendedSessionIndex({ activePlan, history });
  const timestamp = now();
  const result = buildRecoveryWorkoutSession({
    id: makeId("session"),
    userId,
    startedAt: timestamp,
    activePlan,
    appSettings: appSettings ?? defaultAppSettings,
    exercises: availableExercises,
    history,
    sessionIndex: planSessionIndex,
  });
  switch (result.status) {
    case "constructed":
      return result.session;
    case "blocked_by_intervention":
    case "no_eligible_candidate":
    case "invalid_input":
      return null;
  }
}

/* Retired V2/V3 workout-generation implementation. Removed from production compilation while the remaining legacy helpers are deleted in the recovery cleanup. 
function createV2LiveWorkoutSession({
  userId,
  sessionId,
  startedAt,
  programmeId,
  templateId,
  programmeName,
  planSessionIndex,
  planBlockId,
  planWeekNumber,
  selectedSession,
  goal,
  trainingPhase,
  recoveryFlag,
  recentPerformanceSignal,
  loadOwnership,
  loadEstimateConfidence,
  evidenceConfidence,
  experienceLevel,
  knownLimitations,
  exercises,
  history,
}: {
  userId?: string | null;
  sessionId: string;
  startedAt: string;
  programmeId?: string;
  templateId?: string;
  programmeName?: string;
  planSessionIndex?: number;
  planBlockId?: string;
  planWeekNumber?: number;
  selectedSession: CoachingPacketPipelineInput["selectedSession"];
  goal: AdaptiveProgrammingGoal;
  trainingPhase: AdaptiveTrainingPhase;
  recoveryFlag: CycleRecoveryFlag;
  recentPerformanceSignal: RecentPerformanceSignal;
  loadOwnership: CycleLoadOwnership;
  loadEstimateConfidence: "low" | "medium" | "high";
  evidenceConfidence: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  knownLimitations: AdaptiveStimulusKnownLimitation[];
  exercises: Exercise[];
  history: WorkoutHistorySummary[];
}): WorkoutSession | null {
  const athleteId = userId ?? "guest-local";
  const trainingGoal = trainingGoalForAdaptiveGoal(goal);
  const equipment = [...availableEquipmentFromExercises(exercises)];
  const athleteModel = livingAthleteModelRepository.getOrCreate({
    athleteId,
    trainingAge: experienceLevel,
    primaryGoal: trainingGoal,
    equipment,
    unitPreference: "kg",
    now: startedAt,
  });
  const packetResult = createProductionWorkoutFromCoachingPacketPipeline({
    packetId: sessionId,
    generatedAt: startedAt,
    athleteId,
    userStatedGoal: userStatedGoalForAdaptiveGoal(goal),
    trainingGoal,
    selectedSession,
    exercises,
    workoutHistory: history,
    experienceLevel,
    equipment,
    unit: "kg",
    currentTrainingState: trainingStateForAdaptivePhase(trainingPhase),
    timeAvailableMinutes: 60,
    painIssueFlag: knownLimitations.includes("pain") ? "pain" : "none",
    recoveryHint: recoveryStatusForCycleFlag(recoveryFlag),
    livingAthleteModel: athleteModel,
  });

  if (!packetResult.ok || !isValidLiveWorkoutSession(packetResult.workoutSession)) return null;
  const workoutSession = {
    ...packetResult.workoutSession,
    userId: athleteId,
    programmeId,
    templateId,
    planSessionIndex,
    planBlockId,
    planWeekNumber,
    notes: [
      packetResult.workoutSession.notes,
      "Generated by ASC V2 CoachingPacket Production Pipeline.",
    ].filter(Boolean).join(" "),
  };
  if (
    isCoachingEngineV3Enabled() &&
    isCoachingEngineV3ActiveWorkoutEnabled() &&
    isCoachingEngineV3QualityGateStrictEnabled()
  ) {
    const trainingStateSnapshot = buildTrainingStateSnapshotV3({
      snapshotId: `${sessionId}-v3-active-snapshot`,
      generatedAt: startedAt,
      athleteId,
      sessionCategory: selectedSession,
      history,
    });
    const v3ActiveAttempt = tryBuildActiveWorkoutFromV3({
      currentSession: workoutSession,
      packetId: `${sessionId}-v3-active`,
      generatedAt: startedAt,
      athleteId,
      trainingStateSnapshot,
      availableExercises: exercises,
      availableEquipment: equipment,
    });
    if (v3ActiveAttempt.usedV3) return v3ActiveAttempt.workoutSession;
  }

  scheduleCoachingEngineV3ShadowTelemetry({
    currentSession: workoutSession,
    sessionId,
    startedAt,
    athleteId,
    selectedSession,
    exercises,
    equipment,
    history,
  });
  return workoutSession;
}

function scheduleCoachingEngineV3ShadowTelemetry({
  currentSession,
  sessionId,
  startedAt,
  athleteId,
  selectedSession,
  exercises,
  equipment,
  history,
}: {
  currentSession: WorkoutSession;
  sessionId: string;
  startedAt: string;
  athleteId: string;
  selectedSession: CoachingPacketPipelineInput["selectedSession"];
  exercises: Exercise[];
  equipment: CoachingPacketPipelineInput["equipment"];
  history: WorkoutHistorySummary[];
}) {
  if (!isCoachingEngineV3Enabled() || !isCoachingEngineV3ShadowModeEnabled()) return;
  const run = () => {
    try {
      const trainingStateSnapshot = buildTrainingStateSnapshotV3({
        snapshotId: `${sessionId}-v3-shadow-snapshot`,
        generatedAt: startedAt,
        athleteId,
        sessionCategory: selectedSession,
        history,
      });
      runCoachingEngineV3ShadowTelemetry({
        currentSession,
        packetId: `${sessionId}-v3-shadow`,
        generatedAt: startedAt,
        athleteId,
        trainingStateSnapshot,
        availableExercises: exercises,
        availableEquipment: [...equipment],
      });
    } catch (error) {
      console.info("[asc:v3-shadow]", {
        packetId: `${sessionId}-v3-shadow`,
        generationTimeMs: 0,
        qualityState: "shadow_failed",
        riskFlags: ["shadow_failed"],
        fallbackReason: error instanceof Error ? error.message : "unknown_shadow_error",
      });
    }
  };

  if (typeof queueMicrotask === "function") {
    queueMicrotask(run);
    return;
  }
  setTimeout(run, 0);
}

function isValidLiveWorkoutSession(session: WorkoutSession): boolean {
  return (
    session.exercises.length > 0 &&
    session.exercises.every(
      (exercise) =>
        exercise.exerciseId.length > 0 &&
        exercise.exerciseName.length > 0 &&
        exercise.status === "active" &&
        exercise.settings.repRange.min > 0 &&
        exercise.settings.repRange.max >= exercise.settings.repRange.min &&
        (exercise.settings.recommendedMinSets ?? exercise.settings.requiredWorkSets) > 0 &&
        (exercise.settings.recommendedMaxSets ?? exercise.settings.requiredWorkSets) >= (exercise.settings.recommendedMinSets ?? exercise.settings.requiredWorkSets),
    )
  );
}

*/
function adaptiveGoalForProgramme(programmeGoal: string, setupGoal?: TrainingSetupGoal): AdaptiveProgrammingGoal {
  if (setupGoal) return adaptiveGoalForSetup(setupGoal);
  if (programmeGoal === "strength_hypertrophy") return "build_muscle_strength";
  if (programmeGoal === "body_recomposition") return "get_lean";
  return "hypertrophy";
}

function adaptiveGoalForSetup(goal: TrainingSetupGoal): AdaptiveProgrammingGoal {
  if (goal === "build_strength" || goal === "powerlifting_meet") return "strength";
  if (goal === "build_muscle") return "hypertrophy";
  if (goal === "build_muscle_and_strength") return "build_muscle_strength";
  if (goal === "athletic_performance") return "athletic_performance";
  if (goal === "get_leaner") return "get_lean";
  return "maintenance";
}

function adaptivePhaseForBlock(blockType: BlockType | undefined): AdaptiveTrainingPhase {
  if (blockType === "strength" || blockType === "strength_hypertrophy") return "intensification";
  if (blockType === "peak") return "peak";
  if (blockType === "deload") return "deload";
  if (blockType === "power") return "peak";
  if (blockType === "powerbuilding") return "intensification";
  return "accumulation";
}

function sessionTypeForWorkoutName(name: string): "push" | "pull" | "legs" | "upper" | "lower" | "full_body" {
  const type = workoutTypeForName(name);
  if (type === "push" || type === "chest" || type === "shoulders" || type === "arms") return "push";
  if (type === "pull" || type === "back") return "pull";
  if (type === "legs") return "legs";
  if (type === "upper") return "upper";
  if (type === "lower") return "lower";
  return "full_body";
}

function availableWorkoutExercises(): Exercise[] {
  const byId = new Map<string, Exercise>();
  for (const exercise of exerciseLibrary) byId.set(exercise.id, exercise);
  for (const exercise of customExerciseRepository.listAll()) byId.set(exercise.id, exercise);
  return [...byId.values()];
}

function recoveryFlagFor(block: TrainingBlock | null | undefined, history: WorkoutHistorySummary[]): CycleRecoveryFlag {
  if (block?.type === "deload") return "poor";
  const recent = recentExerciseEvidence(history, 2);
  const stopped = recent.filter((summary) => summary.stoppedByDropOff).length;
  const missedMinimum = recent.filter((summary) => summary.qualitySets < Math.max(1, Math.floor(summary.setsCompleted / 2))).length;
  if (stopped >= 2 || missedMinimum >= 3) return "limited";
  return "normal";
}

function recentPerformanceSignalFor(history: WorkoutHistorySummary[]): RecentPerformanceSignal {
  const recent = recentExerciseEvidence(history, 2);
  if (recent.length === 0) return "unknown";
  if (recent.some((summary) => summary.stoppedByDropOff)) return "overreached";
  if (recent.filter((summary) => summary.progressionEarned).length >= Math.min(3, recent.length)) return "improving";
  if (recent.some((summary) => summary.bestSetReps >= 0 && summary.qualitySets === 0)) return "overreached";
  return "appropriate";
}

function loadOwnershipFor(history: WorkoutHistorySummary[]): CycleLoadOwnership {
  const recent = recentExerciseEvidence(history, 3);
  if (recent.length === 0) return "unknown";
  if (recent.some((summary) => summary.stoppedByDropOff)) return "unstable";
  if (recent.length < 3) return "introduced";
  if (recent.filter((summary) => summary.qualitySets > 0).length >= 3) return "owned";
  return "stabilising";
}

function knownLimitationsFor(history: WorkoutHistorySummary[]): AdaptiveStimulusKnownLimitation[] {
  const recent = recentExerciseEvidence(history, 2);
  const limitations: AdaptiveStimulusKnownLimitation[] = [];
  if (recent.some((summary) => /pain|irritation/i.test(summary.notes ?? ""))) limitations.push("pain");
  if (recent.some((summary) => /shoulder/i.test(summary.notes ?? ""))) limitations.push("shoulder_irritation");
  if (recent.some((summary) => /elbow/i.test(summary.notes ?? ""))) limitations.push("elbow_irritation");
  if (recent.some((summary) => /knee/i.test(summary.notes ?? ""))) limitations.push("knee_irritation");
  if (recent.some((summary) => /low back|back fatigue/i.test(summary.notes ?? ""))) limitations.push("low_back_fatigue");
  return [...new Set(limitations)];
}

function userStatedGoalForAdaptiveGoal(goal: AdaptiveProgrammingGoal): string {
  if (goal === "strength") return "get_stronger";
  if (goal === "hypertrophy") return "build_muscle";
  if (goal === "build_muscle_strength") return "build_muscle_strength";
  if (goal === "athletic_performance") return "improve_athletic_performance";
  if (goal === "get_lean") return "lose_fat";
  return "stay_healthy";
}

function trainingGoalForAdaptiveGoal(goal: AdaptiveProgrammingGoal): TrainingGoalId {
  if (goal === "strength") return "get_stronger";
  if (goal === "hypertrophy") return "build_muscle";
  if (goal === "build_muscle_strength") return "build_muscle_strength";
  if (goal === "athletic_performance") return "athletic_performance";
  if (goal === "get_lean") return "lose_fat";
  return "build_muscle_strength";
}

function trainingStateForAdaptivePhase(phase: AdaptiveTrainingPhase): string {
  if (phase === "deload") return "pivot";
  if (phase === "peak") return "realisation";
  if (phase === "intensification") return "intensification";
  return "accumulation";
}

function recoveryStatusForCycleFlag(flag: CycleRecoveryFlag): string {
  if (flag === "good") return "recovered";
  if (flag === "normal") return "recovering";
  if (flag === "limited") return "borderline";
  if (flag === "poor") return "compromised";
  return "insufficient_evidence";
}

function availableEquipmentFromExercises(exercises: Exercise[]): Exercise["equipment"] {
  const equipment = [...new Set(exercises.flatMap((exercise) => exercise.equipment))];
  return equipment.length > 0 ? equipment : ["barbell", "dumbbell", "machine", "cable", "bodyweight"];
}

function recentExerciseEvidence(history: WorkoutHistorySummary[], sessionCount: number) {
  return [...history]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, sessionCount)
    .flatMap((summary) => summary.exerciseSummaries);
}

export function useWorkoutLogger() {
  const { user } = useAuth();
  const { settings: appSettings } = useAppSettings();
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const currentBlock = activePlan?.blocks.find((block) => block.id === activePlan.activeBlockId) ?? null;
  const sessions = workoutSessionRepository.list();
  const availableExercises = availableWorkoutExercises();
  const selectedExerciseId = customExerciseRepository.getSelectedExerciseId();
  const [session, setSession] = useState<WorkoutSession>(() => {
    const latestOpenSession = getLatestOpenSession(sessions);
    if (latestOpenSession) return latestOpenSession;

    const programmeSession = createSessionFromProgrammeDay(user?.id);
    if (programmeSession) return programmeSession;

    const selectedExercise = availableExercises.find((candidate) => candidate.id === selectedExerciseId);
    if (!selectedExercise) return createSessionFromActivePlan(user?.id, appSettings) ?? createSelectedFallbackSession(user?.id, appSettings, currentBlock);

    const timestamp = now();
    return {
      id: makeId("session"),
      userId: user?.id ?? "guest-local",
      name: "Selected Movement",
      startedAt: timestamp,
      exercises: [
        createExerciseLogFromExercise(selectedExercise, 0, appSettings, undefined, currentBlock),
      ],
      syncState: "local",
      updatedAt: timestamp,
    };
  });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(() => {
    const openIndex = session.exercises.findIndex((candidate) => candidate.status === "active");
    return openIndex >= 0 ? openIndex : 0;
  });
  const [restTimer, setRestTimer] = useState<ActiveRestTimer | null>(null);
  const [lastRestCompleteMessage, setLastRestCompleteMessage] = useState<string | null>(null);

  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);
  const [timerNow, setTimerNow] = useState(() => Date.now());

  const exercise = session.exercises[activeExerciseIndex] ?? session.exercises[0];
  const suppressLoadEscalation = currentBlock?.type === "deload";
  const currentExerciseMetadata =
    availableExercises.find((candidate) => candidate.id === exercise.exerciseId) ?? exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId);
  const currentExerciseHistory = useMemo(
    () =>
      summarizeWorkoutHistory(sessions)
        .flatMap((summary) => summary.exerciseSummaries)
        .filter((summary) => summary.exerciseId === exercise.exerciseId),
    [exercise.exerciseId, sessions],
  );
  const currentTrainingGap = useMemo(
    () =>
      resolveTrainingGapAdjustment({
        history: summarizeWorkoutHistory(sessions.filter((candidate) => candidate.id !== session.id)),
        exerciseHistory: currentExerciseHistory,
        targetExercise: currentExerciseMetadata,
        goal: activePlan?.goal,
        experienceLevel: activePlan?.experienceLevel,
        blockType: currentBlock?.type,
        exerciseRole: currentExerciseMetadata?.role,
        exerciseFamily: currentExerciseMetadata?.family,
        currentRecommendedLoad: exercise.load,
        unit: exercise.settings.unit,
        increment: exercise.settings.loadIncrease,
        loadKnown: exercise.loadKnown !== false,
      }),
    [
      activePlan?.experienceLevel,
      activePlan?.goal,
      currentBlock?.type,
      currentExerciseHistory,
      currentExerciseMetadata,
      exercise.load,
      exercise.loadKnown,
      exercise.settings.loadIncrease,
      exercise.settings.unit,
      session.id,
      sessions,
    ],
  );
  const progression = useMemo(
    () =>
      evaluateExerciseProgression({
        exerciseName: exercise.exerciseName,
        currentLoad: exercise.load,
        settings: exercise.settings,
        sets: getWorkSets(exercise.sets),
        prescribedSetTargets: exercise.prescribedSetTargets,
      }),
    [exercise],
  );
  const inSessionLoadSuggestion = useMemo(
    () =>
      getDeloadAwareInSessionLoadIncreaseSuggestion({
        sets: exercise.sets,
        settings: exercise.settings,
        currentLoad: exercise.load,
        suppressEscalation: suppressLoadEscalation,
        throttleInput: {
          exerciseRole: currentExerciseMetadata?.role,
          exerciseFamily: currentExerciseMetadata?.family,
          goal: activePlan?.goal,
          experienceLevel: activePlan?.experienceLevel,
          currentBlock: currentBlock?.type,
          recentExercisePerformance: currentExerciseHistory,
          isDeload: currentBlock?.type === "deload",
          isExtraSession: session.sessionKind != null && session.sessionKind !== "planned",
          trainingGapStatus: currentTrainingGap.status,
          trainingLane: exercise.settings.trainingLane,
        },
      }),
    [
      activePlan?.experienceLevel,
      activePlan?.goal,
      currentBlock?.type,
      currentExerciseHistory,
      currentTrainingGap.status,
      currentExerciseMetadata?.family,
      currentExerciseMetadata?.role,
      exercise.load,
      exercise.sets,
      exercise.settings,
      session.sessionKind,
      suppressLoadEscalation,
    ],
  );
  const productiveSetGuidance = useMemo(
    () => {
      const setPrescription = resolveSetPrescription(exercise.settings, {
        blockType: currentBlock?.type,
        exerciseRole: currentExerciseMetadata?.role,
        exerciseFamily: currentExerciseMetadata?.family,
        primaryMuscles: currentExerciseMetadata?.primaryMuscles,
      });
      return buildProductiveSetGuidance({
        blockType: currentBlock?.type,
        exerciseRole: currentExerciseMetadata?.role,
        exerciseFamily: currentExerciseMetadata?.family,
        primaryMuscles: currentExerciseMetadata?.primaryMuscles,
        setPrescription,
        productiveSets: progression.completedAcceptableSets,
      });
    },
    [currentBlock?.type, currentExerciseMetadata?.family, currentExerciseMetadata?.primaryMuscles, currentExerciseMetadata?.role, exercise.settings, progression.completedAcceptableSets],
  );
  const adaptiveSetDecision = useMemo(() => {
    if (session.sessionKind != null && session.sessionKind !== "planned") return null;
    if (getWorkSets(exercise.sets).length === 0) return null;
    return decideAdaptiveSetAllocation({
      exerciseName: exercise.exerciseName,
      settings: exercise.settings,
      sets: exercise.sets,
      currentLoad: exercise.load,
      metadata: currentExerciseMetadata,
      blockType: currentBlock?.type,
      remainingExercises: session.exercises.slice(activeExerciseIndex + 1).filter((candidate) => candidate.status === "active").length,
      currentSessionWorkingSetCount: session.exercises.reduce((total, candidate) => total + getWorkSets(candidate.sets).length, 0),
      shutdown: exercise.status === "shutdown",
    });
  }, [activeExerciseIndex, currentBlock?.type, currentExerciseMetadata, exercise.exerciseName, exercise.load, exercise.sets, exercise.settings, exercise.status, session.exercises, session.sessionKind]);
  const metadataForExercise = (exerciseLog: WorkoutExerciseLog) =>
    availableExercises.find((candidate) => candidate.id === exerciseLog.exerciseId) ?? exerciseLibrary.find((candidate) => candidate.id === exerciseLog.exerciseId);
  const previousPerformance = useMemo(() => {
    const lastPerformance = getLastExercisePerformance(sessions, session.id, exercise.exerciseId);
    if (!lastPerformance) return null;

    return {
      bestSet: lastPerformance.bestSetReps,
      totalReps: lastPerformance.repsCompleted,
      sets: lastPerformance.setsCompleted,
      load: lastPerformance.load,
      unit: lastPerformance.unit,
      lastRecommendation: lastPerformance.nextRecommendedLoad,
      shouldIncreaseToday: lastPerformance.progressionEarned,
      completedAt: lastPerformance.completedAt,
      sessionName: lastPerformance.sessionName,
    };
  }, [exercise.exerciseId, session.id, sessions]);
  const swapSuggestions = useMemo(
    () => (currentExerciseMetadata ? getExerciseSwapSuggestions(currentExerciseMetadata, availableExercises, { limit: 6 }) : []),
    [availableExercises, currentExerciseMetadata],
  );
  const broadSwapSuggestions = useMemo(
    () => (currentExerciseMetadata ? getExerciseSwapSuggestions(currentExerciseMetadata, availableExercises, { broad: true, limit: 20 }) : []),
    [availableExercises, currentExerciseMetadata],
  );
  const restRemainingSeconds = useMemo(() => {
    if (!restTimer) return 0;
    const elapsedSeconds = Math.floor((timerNow - new Date(restTimer.startedAt).getTime()) / 1000);
    return clampRestSeconds(restTimer.durationSeconds - elapsedSeconds);
  }, [restTimer, timerNow]);

  const persistSession = (nextSession: WorkoutSession) => {
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    if (nextSession.completedAt) {
      syncQueue.enqueueWorkoutSession(nextSession, user?.id ?? null);
      if (user?.id) {
        syncLocalDataForUser(user.id).catch((error) => {
          if (process.env.NODE_ENV !== "production") {
            console.info("[sync] workout completion sync failed", error);
          }
        });
      }
    }
  };

  const produceCurrentDecisionAfterPlannedCompletion = (completedSession: WorkoutSession) => {
    if (completedSession.sessionKind !== "planned" || !activePlan) return;
    orchestrateCompletedPlannedWorkout({
      plan: activePlan,
      completedSession,
      snapshotId: makeId("readiness"),
      decisionId: makeId("decision"),
      createdAt: completedSession.completedAt ?? now(),
    });
  };

  useEffect(
    () =>
      programmeRepository.subscribe(() => {
        const latestOpenSession = getLatestOpenSession(workoutSessionRepository.list());
        if (latestOpenSession) {
          const openIndex = latestOpenSession.exercises.findIndex((candidate) => candidate.status === "active");
          setActiveExerciseIndex(openIndex >= 0 ? openIndex : 0);
          setSession(latestOpenSession);
          return;
        }

        const programmeSession = createSessionFromProgrammeDay(user?.id);
        if (!programmeSession) return;
        setActiveExerciseIndex(0);
        persistSession(programmeSession);
      }),
    [activePlan, appSettings, currentBlock, user?.id],
  );

  useEffect(() => {
    if (!restTimer) return undefined;

    const intervalId = setInterval(() => setTimerNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [restTimer]);

  useEffect(() => {
    if (restTimer && restRemainingSeconds <= 0) {
      const message = getRestCompleteMessage({
        exerciseName: restTimer.exerciseName,
        previousMessage: lastRestCompleteMessage,
        category: restMessageCategory(currentBlock),
      });
      setLastRestCompleteMessage(message);
      Alert.alert("Rest complete", message);
      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setRestTimer(null);
    }
  }, [currentBlock, lastRestCompleteMessage, restRemainingSeconds, restTimer]);

  const advanceFromSession = (baseSession: WorkoutSession) => {
    if (baseSession.completedAt) return;

    const nextIndex = activeExerciseIndex + 1;
    const timestamp = now();
    const nextSession =
      nextIndex >= baseSession.exercises.length
        ? { ...baseSession, completedAt: timestamp, updatedAt: timestamp, syncState: "local" as const }
        : { ...baseSession, updatedAt: timestamp, syncState: "local" as const };

    persistSession(nextSession);

    if (nextIndex < nextSession.exercises.length) {
      setActiveExerciseIndex(nextIndex);
    }

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const logSetAtIndex = (index: number, reps: number, type: SetLog["type"] = "work", loadOverride?: number) => {
    const targetExercise = session.exercises[index];
    if (!targetExercise || targetExercise.status !== "active") return;

    const effectiveLoad = Number.isFinite(loadOverride) ? Number(loadOverride?.toFixed(2)) : targetExercise.load;
    const nextExerciseLoad = type === "work" ? effectiveLoad : targetExercise.load;
    const nextExerciseLoadKnown = type === "work" ? true : targetExercise.loadKnown;
    const sameTypeSets = targetExercise.sets.filter((set) => (set.type ?? "work") === type);
    const nextSet: SetLog = {
      id: makeId("set"),
      setNumber: sameTypeSets.length + 1,
      reps,
      load: effectiveLoad,
      loggedAt: now(),
      type,
    };

    const nextSets = [...targetExercise.sets, nextSet];
    const shouldUsePlannedLoadEvidence = session.sessionKind == null || session.sessionKind === "planned";
    const loadDrop =
      type === "work" && shouldUsePlannedLoadEvidence
        ? getInSessionLoadDropSuggestion(nextSets, targetExercise.settings, nextExerciseLoad, targetExercise.settings.loadIncrease)
        : null;
    const correctedExerciseLoad = loadDrop?.shouldDrop ? loadDrop.suggestedLoad : nextExerciseLoad;
    const nextProgression = evaluateExerciseProgression({
      exerciseName: targetExercise.exerciseName,
      currentLoad: correctedExerciseLoad,
      settings: targetExercise.settings,
      sets: getWorkSets(nextSets),
    });
    const nextExercise: WorkoutExerciseLog = {
      ...targetExercise,
      sets: nextSets,
      load: correctedExerciseLoad,
      loadKnown: nextExerciseLoadKnown,
      loadEstablishedFromLoggedWorkSet:
        type === "work"
          ? targetExercise.loadEstablishedFromLoggedWorkSet || targetExercise.loadKnown === false
          : targetExercise.loadEstablishedFromLoggedWorkSet,
      status: type === "work" && nextProgression.shouldShutdown ? "shutdown" : "active",
      shutdownReason: type === "work" && nextProgression.shouldShutdown ? shutdownCopy : undefined,
      removedFutureWorkSetNumbers:
        type === "work"
          ? targetExercise.removedFutureWorkSetNumbers?.filter((setNumber) => setNumber !== nextSet.setNumber)
          : targetExercise.removedFutureWorkSetNumbers,
    };
    const nextExercises = session.exercises.map((candidate, candidateIndex) =>
      candidateIndex === index ? nextExercise : candidate,
    );
    const nextSession = {
      ...session,
      exercises: nextExercises,
      syncState: "local" as const,
      updatedAt: now(),
    };

    setSession(nextSession);
    workoutSessionRepository.save(nextSession);

    if (type === "work") {
      const targetMetadata = metadataForExercise(targetExercise);
      const defaultRest = getRestTimerDefault({
        blockType: currentBlock?.type,
        roles: targetMetadata?.roles,
        movementPattern: targetMetadata?.movementPattern,
      });
      setRestTimer({
        exerciseId: targetExercise.id,
        exerciseName: targetExercise.exerciseName,
        setNumber: nextSet.setNumber,
        startedAt: now(),
        durationSeconds: defaultRest.seconds,
        reason: defaultRest.reason,
      });
    }
    setTimerNow(Date.now());

    if (process.env.EXPO_OS === "ios") {
      Haptics.notificationAsync(
        type === "work" && nextProgression.shouldShutdown
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      );
    }
  };

  const logSet = (reps: number, type: SetLog["type"] = "work", loadOverride?: number) => {
    logSetAtIndex(activeExerciseIndex, reps, type, loadOverride);
  };

  const undoLastSetAtIndex = (index: number) => {
    const targetExercise = session.exercises[index];
    if (!targetExercise || targetExercise.sets.length === 0 || session.completedAt) return;

    const nextSets = targetExercise.sets.slice(0, -1).map((set, index) => ({ ...set, setNumber: index + 1 }));
    const nextProgression = evaluateExerciseProgression({
      exerciseName: targetExercise.exerciseName,
      currentLoad: targetExercise.load,
      settings: targetExercise.settings,
      sets: getWorkSets(nextSets),
    });
    const nextExercise: WorkoutExerciseLog = {
      ...targetExercise,
      sets: nextSets,
      status: nextProgression.shouldShutdown ? "shutdown" : "active",
      shutdownReason: nextProgression.shouldShutdown ? shutdownCopy : undefined,
    };
    const nextExercises = session.exercises.map((candidate, candidateIndex) =>
      candidateIndex === index ? nextExercise : candidate,
    );
    const nextSession = { ...session, exercises: nextExercises, updatedAt: now(), syncState: "local" as const };
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const undoLastSet = () => {
    undoLastSetAtIndex(activeExerciseIndex);
  };

  const editLoggedSetAtIndex = (index: number, setId: string, edit: { load: number; reps: number; type: SetLog["type"] }) => {
    const nextSession = editLoggedSetInSession(session, index, setId, edit);
    if (nextSession === session) return null;
    setRestTimer(null);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    return nextSession.exercises[index] ?? null;
  };

  const deleteLoggedSetAtIndex = (index: number, setId: string) => {
    const nextSession = deleteLoggedSetFromSession(session, index, setId);
    if (nextSession === session) return null;
    setRestTimer(null);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    return nextSession.exercises[index] ?? null;
  };

  const removeFutureWorkSetAtIndex = (index: number, setNumber: number) => {
    const nextSession = removeFutureWorkSetFromSession(session, index, setNumber);
    if (nextSession === session) return null;
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    return nextSession.exercises[index] ?? null;
  };

  const resetSession = () => {
    const nextSession = createSessionFromActivePlan(user?.id, appSettings);
    if (!nextSession) return;
    setActiveExerciseIndex(0);
    setRestTimer(null);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const goToNextExercise = () => {
    advanceFromSession(session);
  };

  const openExercise = (index: number) => {
    if (index < 0 || index >= session.exercises.length) return;
    setActiveExerciseIndex(index);
  };

  const finishWorkout = (options?: { completedAt?: string; nextLoadApprovals?: Record<string, NextLoadApproval>; postWorkoutReviewAnswers?: PostWorkoutReviewAnswers }) => {
    if (session.completedAt) return;

    const timestamp = options?.completedAt ?? now();
    const nextSession = {
      ...session,
      exercises: session.exercises.map((candidate) =>
        options?.nextLoadApprovals?.[candidate.id]
          ? { ...candidate, nextLoadApproval: options.nextLoadApprovals[candidate.id] }
          : candidate,
      ),
      completedAt: timestamp,
      updatedAt: timestamp,
      syncState: "local" as const,
    };
    setRestTimer(null);
    const loopResult = runFirstShippablePostWorkoutLoop({
      session: nextSession,
      previousSessions: workoutSessionRepository.list().filter((candidate) => candidate.id !== nextSession.id),
      completedAt: timestamp,
      reviewAnswers: options?.postWorkoutReviewAnswers ?? buildDefaultPostWorkoutReviewAnswers(nextSession),
    });
    trainingEvidenceRepository.add(loopResult.trainingEvidence);
    persistSession(nextSession);
    produceCurrentDecisionAfterPlannedCompletion(nextSession);
  };

  const cancelWorkout = () => {
    if (session.completedAt) return;
    setRestTimer(null);
    workoutSessionRepository.remove(session.id);
  };

  const completeCurrentExercise = () => {
    if (session.completedAt || exercise.status !== "active") return;

    const nextExercises = session.exercises.map((candidate, index) =>
      index === activeExerciseIndex ? { ...candidate, status: "complete" as const } : candidate,
    );
    const nextSession = { ...session, exercises: nextExercises, updatedAt: now(), syncState: "local" as const };
    if (activeExerciseIndex >= nextSession.exercises.length - 1) {
      persistSession(nextSession);
      return;
    }
    advanceFromSession(nextSession);
  };

  const finishExerciseAtIndex = (index: number, reason: ManualExerciseFinishReason) => {
    const targetExercise = session.exercises[index];
    if (session.completedAt || !targetExercise || targetExercise.status !== "active") return null;

    const nextSession = finishExerciseManuallyInSession(session, index, reason);
    if (nextSession === session) return null;
    setRestTimer(null);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    setActiveExerciseIndex(index);
    return nextSession.exercises[index] ?? null;
  };

  const finishCurrentExercise = (reason: ManualExerciseFinishReason) => {
    return finishExerciseAtIndex(activeExerciseIndex, reason);
  };

  const reopenCurrentExercise = (allowShutdown = false) => {
    if (session.completedAt) return;
    if (exercise.status === "active") return;
    if (exercise.status === "shutdown" && !allowShutdown) return;

    const nextExercises = session.exercises.map((candidate, index) =>
      index === activeExerciseIndex ? reopenExercise(candidate, { allowShutdown }) : candidate,
    );
    const nextSession = { ...session, exercises: nextExercises, updatedAt: now(), syncState: "local" as const };
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const selectExercise = (exerciseId: string) => {
    const selectedExercise = customExerciseRepository.listAll().find((candidate) => candidate.id === exerciseId);
    if (!selectedExercise || exercise.sets.length > 0) return;

    customExerciseRepository.setSelectedExerciseId(exerciseId);
    const nextExercise = createExerciseLogFromExercise(
      selectedExercise,
      exercise.loadKnown === false ? 0 : exercise.load,
      appSettings,
      undefined,
      currentBlock,
    );
    const nextExercises = session.exercises.map((candidate, index) =>
      index === activeExerciseIndex ? nextExercise : candidate,
    );
    const nextSession = { ...session, exercises: nextExercises, updatedAt: now(), syncState: "local" as const };
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const swapExerciseAtIndex = (exerciseIndex: number, exerciseId: string): boolean => {
    const targetExercise = session.exercises[exerciseIndex];
    if (!targetExercise || session.completedAt || targetExercise.status !== "active") return false;
    const selectedExercise = availableExercises.find((candidate) => candidate.id === exerciseId);
    if (!selectedExercise || selectedExercise.id === targetExercise.exerciseId) return false;
    const replacementEvidence = resolveCanonicalLoadEvidence(summarizeWorkoutHistory(workoutSessionRepository.list()), selectedExercise.id);
    const replacementLoad = selectedExercise.kind === "bodyweight" ? 0 : replacementEvidence?.load ?? 0;

    const replacement = createExerciseLogFromExercise(
      selectedExercise,
      replacementLoad,
      appSettings,
      {
        id: `${targetExercise.id}-swap-${selectedExercise.id}`,
        exerciseId: selectedExercise.id,
        plannedOrder: exerciseIndex + 1,
        suggestedLoad: selectedExercise.kind === "bodyweight" ? 0 : replacementEvidence?.load,
        settings: {
          ...targetExercise.settings,
          loadIncrease: resolveWorkoutExerciseSettings(selectedExercise, appSettings, undefined, currentBlock).loadIncrease,
        },
      },
      currentBlock,
    );
    const nextSession = swapExerciseInSession(session, exerciseIndex, replacement);
    setRestTimer(null);
    setActiveExerciseIndex(exerciseIndex);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
    return true;
  };

  const swapExercise = (exerciseId: string) => {
    swapExerciseAtIndex(activeExerciseIndex, exerciseId);
  };

  const addExercise = (exerciseId: string, position: AddExercisePosition) => {
    if (session.completedAt) return;
    const selectedExercise = availableExercises.find((candidate) => candidate.id === exerciseId);
    if (!selectedExercise) return;

    const settings = resolveWorkoutExerciseSettings(selectedExercise, appSettings, undefined, currentBlock);
    const loadRecommendation = resolveStartingLoadRecommendation({
      targetExercise: selectedExercise,
      exercises: availableExercises,
      history: summarizeWorkoutHistory(sessions.filter((candidate) => candidate.id !== session.id)),
      repRange: settings.repRange,
      loadIncrement: settings.loadIncrease,
      goal: activePlan?.goal,
      experienceLevel: activePlan?.experienceLevel,
      blockType: currentBlock?.type,
      exerciseRole: selectedExercise.role,
      exerciseFamily: selectedExercise.family,
      unit: settings.unit,
    });
    const startingLoad = selectedExercise.kind === "bodyweight" ? 0 : loadRecommendation.load ?? 0;
    const addedExercise = createExerciseLogFromExercise(selectedExercise, startingLoad, appSettings, undefined, currentBlock);
    const nextSession = addExerciseToSession(
      session,
      {
        ...addedExercise,
        loadKnown: selectedExercise.kind === "bodyweight" || loadRecommendation.source !== "blank",
        notes: loadRecommendation.source === "same_family_estimate" || loadRecommendation.recommendationEvidence?.type === "training_gap_starting_load"
          ? loadRecommendation.message
          : addedExercise.notes,
        origin: "added_during_workout",
      },
      { activeExerciseIndex, position },
    );

    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const removeAddedExercise = (index: number) => {
    if (session.completedAt) return;
    const nextSession = removeAddedExerciseFromSession(session, index);
    if (nextSession === session) return;

    const nextActiveIndex =
      index < activeExerciseIndex
        ? Math.max(0, activeExerciseIndex - 1)
        : index === activeExerciseIndex
          ? Math.min(activeExerciseIndex, Math.max(0, nextSession.exercises.length - 1))
          : activeExerciseIndex;

    setActiveExerciseIndex(nextActiveIndex);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const removeExerciseForToday = (index: number) => {
    if (session.completedAt) return;
    const nextSession = removeExerciseForTodayFromSession(session, index);
    if (nextSession === session) return;

    const nextActiveIndex =
      index < activeExerciseIndex
        ? Math.max(0, activeExerciseIndex - 1)
        : index === activeExerciseIndex
          ? Math.min(activeExerciseIndex, Math.max(0, nextSession.exercises.length - 1))
          : activeExerciseIndex;

    setActiveExerciseIndex(nextActiveIndex);
    setRestTimer(null);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const updateLoadAtIndex = (index: number, load: number) => {
    const targetExercise = session.exercises[index];
    if (!targetExercise || !Number.isFinite(load) || load < 0 || targetExercise.status !== "active" || session.completedAt) return;

    const nextSession = applyInSessionEscalationToFuturePrescription(session, index, load);
    setSession(nextSession);
    workoutSessionRepository.save(nextSession);
  };

  const updateLoad = (load: number) => {
    updateLoadAtIndex(activeExerciseIndex, load);
  };

  const skipRest = () => {
    setRestTimer(null);
  };

  const adjustRestTime = (deltaSeconds: number) => {
    setRestTimer((currentTimer) =>
      currentTimer
        ? {
            ...currentTimer,
            durationSeconds: clampRestSeconds(currentTimer.durationSeconds + deltaSeconds),
          }
        : currentTimer,
    );
    setTimerNow(Date.now());
  };

  return {
    session,
    exercise,
    progression,
    inSessionLoadSuggestion,
    currentTrainingGap,
    productiveSetGuidance,
    adaptiveSetDecision,
    previousPerformance,
    activeExerciseIndex,
    totalExercises: session.exercises.length,
    logSet,
    logSetAtIndex,
    resetSession,
    goToNextExercise,
    openExercise,
    finishWorkout,
    cancelWorkout,
    completeCurrentExercise,
    finishCurrentExercise,
    finishExerciseAtIndex,
    reopenCurrentExercise,
    undoLastSet,
    undoLastSetAtIndex,
    editLoggedSetAtIndex,
    deleteLoggedSetAtIndex,
    removeFutureWorkSetAtIndex,
    selectExercise,
    swapExercise,
    swapExerciseAtIndex,
    addExercise,
    removeAddedExercise,
    removeExerciseForToday,
    swapSuggestions,
    broadSwapSuggestions,
    availableExercises,
    updateLoad,
    updateLoadAtIndex,
    restTimer,
    restRemainingSeconds,
    skipRest,
    adjustRestTime,
  };
}

function createSelectedFallbackSession(userId: string | null | undefined, appSettings: AppSettings, currentBlock?: TrainingBlock | null): WorkoutSession {
  const timestamp = now();
  const firstExercise = exerciseLibrary[0]!;
  return {
    id: makeId("session"),
    userId: userId ?? "guest-local",
    name: "Freestyle Session",
    startedAt: timestamp,
    exercises: [createExerciseLogFromExercise(firstExercise, 0, appSettings, undefined, currentBlock)],
    syncState: "local",
    updatedAt: timestamp,
  };
}

function restMessageCategory(currentBlock?: TrainingBlock | null): "strength_power" | "hypertrophy" | "general" {
  if (!currentBlock) return "general";
  if (currentBlock.type === "strength" || currentBlock.type === "power" || currentBlock.type === "peak") return "strength_power";
  if (currentBlock.type === "hypertrophy" || currentBlock.type === "powerbuilding" || currentBlock.type === "strength_hypertrophy") return "hypertrophy";
  return "general";
}
