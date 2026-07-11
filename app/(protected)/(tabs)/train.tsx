import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, InputAccessoryView, Keyboard, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { getCoachingEngineV3RuntimeStatus } from "@/application/runtime/app-environment";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import type { AdaptiveSetDecision } from "@/domain/training/adaptive-set-allocation";
import type { BlockType } from "@/domain/training/annual-models";
import { exerciseReasonOptions, scoreExercisePreference, type ExercisePreferenceRecord, type ExerciseReasonAction, type ExerciseReasonCode } from "@/domain/training/exercise-preferences";
import { evaluateCardioInterference, type CardioInterferenceResult } from "@/domain/training/cardio-interference";
import { resolveNextLiftingContext } from "@/domain/training/recovery-capacity-delivery";
import { resolveEventTaper } from "@/domain/training/event-taper";
import type { CardioEase, CardioModality, CardioSessionKind, Equipment, Exercise, ManualExerciseFinishReason, MuscleGroup, SetLog, UnitSystem, WorkoutExerciseLog, WorkoutSession } from "@/domain/training/models";
import { resolveTrainExecutionTarget } from "@/domain/training/train-execution-target";
import { getExerciseSwapSuggestions } from "@/domain/training/exercise-swaps";
import { resolveExerciseTargetZone, targetZoneLabel } from "@/domain/training/exercise-target-zone";
import { hasFutureUncompletedWorkSetAfterLog } from "@/domain/training/in-session-escalation";
import { formatMetricValue, formatTargetRange, getExerciseMeasurementType, metricAccessibilityUnit, metricInputLabel } from "@/domain/training/exercise-metrics";
import { buildWarmupPrescriptions, formatLoadDisplay, formatSetLoadDisplay, loadDisplayForExercise } from "@/domain/training/load-display";
import { getDeloadAwareInSessionLoadIncreaseSuggestion } from "@/domain/training/load-selection";
import type { PersonalRecordItem } from "@/domain/training/personal-records";
import {
  applyPostWorkoutReviewLoadApprovals,
  buildPostWorkoutReview,
  type PostWorkoutLoadDecision,
  type PostWorkoutReviewViewModel,
} from "@/domain/training/post-workout-review";
import type { PainFeedbackStatus, PostWorkoutReviewAnswers, SessionDifficultyFeedback, UserConstraintReason } from "@/domain/training/post-workout-review-flow";
import { buildPrSharePayload, buildWorkoutSummarySharePayload, type BrandedSharePayload } from "@/domain/training/share-cards";
import { buildProductiveSetGuidance } from "@/domain/training/productive-set-targets";
import { getRequiredSets, resolveSetPrescription } from "@/domain/training/set-prescription";
import { buildSessionPrepOverview, buildSessionPrepRecord } from "@/domain/training/session-prep";
import { getWorkoutExerciseDisplayStatus, type WorkoutExerciseDisplayStatus } from "@/domain/training/workout-session-status";
import { evaluateExerciseProgression, type ExerciseProgressionState } from "@/domain/training/progression-engine";
import type { ProgressionThrottleInput } from "@/domain/training/progression-throttle";
import { formatRestTime } from "@/domain/training/rest-timer";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { getWarmupSets, getWorkSets } from "@/domain/training/workout-sets";
import { recordExerciseReasonForFutureCoaching } from "@/domain/training/recommendation-actions";
import { manualExerciseFinishLabel } from "@/domain/training/workout-exercise-state";
import { createPlanningContext } from "@/domain/training/planning-context";
import { BrandedShareCardPreviewModal } from "@/features/social-sharing/branded-share-card-preview";
import { useWorkoutLogger } from "@/features/workout-logging/use-workout-logger";
import { useTrainingYear } from "@/features/training-year/use-training-year";
import { BottomActionBar, DetailToggle, PremiumCard, PrimaryButton, Screen, SecondaryButton, WorkoutSetRow } from "@/ui/primitives";
import { getTabScreenBottomPadding } from "@/ui/layout";
import { colors, radius, spacing, type } from "@/ui/theme";

type WorkoutView = "overview" | "exercise";
type DisplayStatus = WorkoutExerciseDisplayStatus;
type PerformanceDrawerState = {
  exerciseIndex: number;
  setNumber: number;
  setType: SetLog["type"];
  suggestedLoad?: number | null;
  suggestedReps?: number | null;
  suggestionDisplay?: string | null;
  editSetId?: string | null;
  hasNextWorkSet?: boolean;
  workSetTargetMax?: number;
} | null;

type PendingEscalationPrompt = {
  exerciseIndex: number;
  exerciseId: string;
  exerciseName: string;
  currentLoad: number;
  suggestedLoad: number;
  unit: UnitSystem;
  message: string;
  suggestionKey?: string;
} | null;

type PendingExerciseReasonAction = {
  type: ExerciseReasonAction;
  exerciseIndex: number;
  avoidedExercise: WorkoutExerciseLog;
  replacement?: Exercise;
} | null;

export default function WorkoutLoggingScreen() {
  const subscription = useSubscription();

  if (!subscription.isPremium) return <TrainPremiumSalesPage subscription={subscription} />;

  return <WorkoutLoggingContent />;
}

function TrainPremiumSalesPage({
  subscription,
}: {
  subscription: ReturnType<typeof useSubscription>;
}) {
  const openPaywall = () => {
    router.push("/(protected)/paywall");
  };

  const openPlan = () => {
    router.push("/(protected)/(tabs)/programmes");
  };

  const restoreColor =
    subscription.restoreStatus === "restored" ? colors.success : subscription.restoreStatus === "failed" ? colors.danger : colors.textMuted;

  return (
    <Screen>
      <View style={{ gap: spacing.md }}>
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          Adaptive Strength Coach
        </Text>
        <View style={{ gap: 2 }}>
          {["Build More Muscle.", "Get Stronger.", "Stop Guessing."].map((line) => (
            <Text key={line} selectable numberOfLines={1} style={{ color: colors.text, fontSize: 34, lineHeight: 39, fontWeight: "900" }}>
              {line}
            </Text>
          ))}
        </View>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Your adaptive training plan is ready. Start your free trial to unlock coached workouts, progression, and recovery guidance.
        </Text>
      </View>

      <PremiumCard tone="locked">
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.accent, fontSize: 30, lineHeight: 36, fontWeight: "900" }}>
            14-day free trial
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Cancel anytime.
          </Text>
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Unlock coached training
        </Text>
        {[
          "Know exactly what to do every workout",
          "Adaptive progression based on your performance",
          "Warm-Up Sets and Session Prep included",
          "Strength Dashboard, PRs, and e1RM tracking",
          "Recovery & Capacity guidance",
        ].map((benefit) => (
          <View key={benefit} style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
            <Text style={{ color: colors.accent, fontSize: 17, lineHeight: 24, fontWeight: "900" }}>✓</Text>
            <Text selectable style={{ flex: 1, ...type.body, color: colors.text }}>
              {benefit}
            </Text>
          </View>
        ))}
      </PremiumCard>

      {subscription.isLoading ? (
        <PremiumCard tone="quiet">
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Checking your plan access
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            We are checking your subscription status before opening coached workouts.
          </Text>
        </PremiumCard>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <PrimaryButton label="Start 14-Day Free Trial" onPress={openPaywall} disabled={subscription.isLoading} />
        <SecondaryButton
          label={subscription.restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"}
          onPress={subscription.restorePurchases}
          disabled={subscription.isLoading}
        />
        <SecondaryButton label="View Plan" onPress={openPlan} />
      </View>

      {subscription.restoreMessage ? (
        <Text selectable style={{ ...type.body, color: restoreColor, textAlign: "center" }}>
          {subscription.restoreMessage}
        </Text>
      ) : null}

      <Text selectable style={{ ...type.body, color: colors.textSubtle, textAlign: "center" }}>
        Subscriptions are managed securely through your App Store or Google Play account.
      </Text>
    </Screen>
  );
}

function WorkoutLoggingContent() {
  const insets = useSafeAreaInsets();
  const {
    session,
    exercise,
    progression,
    inSessionLoadSuggestion,
    currentTrainingGap,
    productiveSetGuidance,
    adaptiveSetDecision,
    activeExerciseIndex,
    totalExercises,
    logSet,
    logSetAtIndex,
    resetSession,
    goToNextExercise,
    openExercise,
    finishWorkout,
    cancelWorkout,
    completeCurrentExercise,
    finishExerciseAtIndex,
    reopenCurrentExercise,
    undoLastSet,
    undoLastSetAtIndex,
    selectExercise,
    swapExerciseAtIndex,
    addExercise,
    removeExerciseForToday,
    availableExercises,
    updateLoad,
    updateLoadAtIndex,
    editLoggedSetAtIndex,
    deleteLoggedSetAtIndex,
    removeFutureWorkSetAtIndex,
    restTimer,
    restRemainingSeconds,
    skipRest,
    adjustRestTime,
  } = useWorkoutLogger();
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const currentBlock = useMemo(
    () => activePlan?.blocks.find((block) => block.id === activePlan.activeBlockId) ?? activePlan?.blocks[0] ?? null,
    [activePlan],
  );
  const planningContext = useMemo(() => activePlan ? createPlanningContext(activePlan, session) : null, [activePlan, session]);
  const eventTaper = useMemo(
    () =>
      activePlan?.targetDate
        ? resolveEventTaper({
            eventType: activePlan.eventType,
            targetDate: activePlan.targetDate,
            currentBlock: currentBlock?.type,
            goal: activePlan.goal,
            experienceLevel: activePlan.experienceLevel,
          })
        : null,
    [activePlan, currentBlock?.type],
  );
  const { exerciseId, qaView, qaEndConfirm, qaReview } = useLocalSearchParams<{ exerciseId?: string; qaView?: string; qaEndConfirm?: string; qaReview?: string }>();
  const [view, setView] = useState<WorkoutView>("overview");
  const [repInput, setRepInput] = useState("");
  const [loadInput, setLoadInput] = useState("");
  const [setMode, setSetMode] = useState<"warmup" | "work">("work");
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [overviewActionsIndex, setOverviewActionsIndex] = useState<number | null>(null);
  const [swapPickerIndex, setSwapPickerIndex] = useState<number | null>(null);
  const [pendingSwapExercise, setPendingSwapExercise] = useState<Exercise | null>(null);
  const [performanceDrawer, setPerformanceDrawer] = useState<PerformanceDrawerState>(null);
  const [prepRecords, setPrepRecords] = useState(() => sessionPrepRepository.list());
  const [addPosition, setAddPosition] = useState<"after_current" | "end">("after_current");
  const [ignoredLoadSuggestionKey, setIgnoredLoadSuggestionKey] = useState<string | null>(null);
  const [qaEndConfirmShown, setQaEndConfirmShown] = useState(false);
  const [warmupRowCounts, setWarmupRowCounts] = useState<Record<string, number>>({});
  const [warmupExpansionOverrides, setWarmupExpansionOverrides] = useState<Record<string, boolean>>({});
  const [pendingAddExercise, setPendingAddExercise] = useState<Exercise | null>(null);
  const [restTimerExpanded, setRestTimerExpanded] = useState(false);
  const [pendingReview, setPendingReview] = useState<PostWorkoutReviewViewModel | null>(null);
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, PostWorkoutLoadDecision>>({});
  const [pendingEscalationPrompt, setPendingEscalationPrompt] = useState<PendingEscalationPrompt>(null);
  const [pendingExerciseReasonAction, setPendingExerciseReasonAction] = useState<PendingExerciseReasonAction>(null);
  const [pendingManualFinishIndex, setPendingManualFinishIndex] = useState<number | null>(null);
  const [cardioModality, setCardioModality] = useState<CardioModality>("incline_walk");
  const [cardioDuration, setCardioDuration] = useState("");
  const [cardioDistance, setCardioDistance] = useState("");
  const [cardioEase, setCardioEase] = useState<CardioEase>("easy");
  const [cardioNotes, setCardioNotes] = useState("");
  const reps = Number.parseInt(repInput, 10);
  const measurementType = getExerciseMeasurementType(exercise.settings);
  const metricLabel = metricInputLabel(measurementType);
  const metricUnit = metricAccessibilityUnit(measurementType);
  const targetRangeDisplay = formatTargetRange(exercise.settings.repRange, measurementType);
  const unit = exercise.settings.unit;
  const isShutdown = exercise.status === "shutdown";
  const isReadOnly = exercise.status !== "active" || Boolean(session.completedAt);
  const hasUsableLoad = exercise.loadKnown !== false || Number.isFinite(Number.parseFloat(loadInput));
  const warmupSets = useMemo(() => getWarmupSets(exercise.sets), [exercise.sets]);
  const workSets = useMemo(() => getWorkSets(exercise.sets), [exercise.sets]);
  const currentPlannedWorkTarget = resolveTrainExecutionTarget({
    sessionKind: session.sessionKind,
    exercise,
    workSetIndex: workSets.length,
  });
  const plannedWorkTargetMissing = setMode === "work" && currentPlannedWorkTarget.source === "planned_target_missing";
  const executionTargetDisplay = currentPlannedWorkTarget.reps != null
    ? `${currentPlannedWorkTarget.reps}${measurementType === "duration" ? " sec" : ""}`
    : "Exact target unavailable";
  const canLogSet = Number.isInteger(reps) && reps >= 0 && !isReadOnly && hasUsableLoad && !plannedWorkTargetMissing;
  const currentSetNumber = exercise.status === "active" ? (setMode === "warmup" ? warmupSets.length : workSets.length) + 1 : Math.max(1, workSets.length);
  const completedCount = session.exercises.filter((candidate) => candidate.status === "complete" || candidate.status === "shutdown" || candidate.status === "swapped").length;
  const hasAnyLoggedSets = session.exercises.some((candidate) => candidate.sets.length > 0);
  const plannedWorkComplete = session.exercises.length > 0 && session.exercises.every(isExercisePlannedWorkComplete);
  const nextExercise = session.exercises[activeExerciseIndex + 1];
  const finalExercise = activeExerciseIndex >= session.exercises.length - 1;
  const quickReps = useMemo(
    () => session.sessionKind === "planned" && setMode === "work" && currentPlannedWorkTarget.reps != null
      ? [currentPlannedWorkTarget.reps]
      : getQuickRepButtons(exercise.settings.repRange.min, exercise.settings.repRange.max),
    [currentPlannedWorkTarget.reps, exercise.settings.repRange.max, exercise.settings.repRange.min, session.sessionKind, setMode],
  );
  const sessionBriefing = useMemo(() => buildSessionBriefing(session.exercises), [session.exercises]);
  const cardioSessionKind = isCardioSessionKind(session.sessionKind) ? session.sessionKind : null;
  const nextLiftingContext = useMemo(
    () =>
      resolveNextLiftingContext({
        activePlan,
        history: summarizeWorkoutHistory(workoutSessionRepository.list()),
        currentBlock,
        exercises: availableExercises,
        eventTaperPhase: eventTaper?.eventPhase,
      }),
    [activePlan, availableExercises, currentBlock, eventTaper?.eventPhase],
  );
  const cardioInterference = useMemo(
    () =>
      cardioSessionKind
        ? evaluateCardioInterference({
            sessionType: cardioSessionKind,
            modality: cardioModality,
            perceivedEase: cardioEase,
            goal: activePlan?.goal,
            block: currentBlock?.type,
            nextLiftingContext,
            eventTaperPhase: eventTaper?.eventPhase,
          })
        : null,
    [activePlan?.goal, cardioEase, cardioModality, cardioSessionKind, currentBlock?.type, eventTaper?.eventPhase, nextLiftingContext],
  );
  const loadSuggestionKey = inSessionLoadSuggestion.shouldSuggest
    ? `${exercise.id}:${workSets.length}:${inSessionLoadSuggestion.currentLoad}:${inSessionLoadSuggestion.suggestedLoad}`
    : null;
  const tabAwareBottomPadding = getTabScreenBottomPadding(insets.bottom);
  const displaySessionName = cleanWorkoutName(session.name);
  const v3RuntimeStatus = getCoachingEngineV3RuntimeStatus();
  const v3SessionSource = session.notes?.includes("Generated by ASC Coaching Engine V3.")
    ? "active"
    : v3RuntimeStatus.activeWorkoutReady
      ? "fallback"
      : "off";
  const prOpportunity = useMemo(() => parsePacketPrOpportunity(session.notes), [session.notes]);
  const workoutType = inferWorkoutType(displaySessionName);
  const firstSessionExercise = session.exercises[0];
  const firstSessionExerciseMetadata = firstSessionExercise
    ? availableExercises.find((candidate) => candidate.id === firstSessionExercise.exerciseId)
    : undefined;
  const prepOverview = useMemo(
    () =>
      buildSessionPrepOverview({
        records: prepRecords,
        workoutName: displaySessionName,
        workoutType,
        firstExerciseName: firstSessionExercise?.exerciseName,
        firstMovementPattern: firstSessionExerciseMetadata?.movementPattern,
      }),
    [displaySessionName, firstSessionExercise?.exerciseName, firstSessionExerciseMetadata?.movementPattern, prepRecords, workoutType],
  );
  const activeExerciseMetadata = availableExercises.find((candidate) => candidate.id === exercise.exerciseId);
  const activeLoadDisplay = loadDisplayForExercise(exercise, activeExerciseMetadata);
  const exerciseHistorySummaries = useMemo(
    () =>
      summarizeWorkoutHistory(workoutSessionRepository.list().filter((candidate) => candidate.id !== session.id)).flatMap(
        (summary) => summary.exerciseSummaries,
      ),
    [session.id, session.updatedAt],
  );
  const activeTargetZone = useMemo(
    () =>
      resolveExerciseTargetZone({
        exercise: activeExerciseMetadata,
        exerciseId: exercise.exerciseId,
        exerciseRole: activeExerciseMetadata?.role,
        exerciseFamily: activeExerciseMetadata?.family,
        movementPattern: activeExerciseMetadata?.movementPattern,
        block: currentBlock?.type,
        lane: exercise.settings.trainingLane,
        repRange: exercise.settings.repRange,
        recentExerciseHistory: exerciseHistorySummaries,
      }),
    [
      activeExerciseMetadata,
      currentBlock?.type,
      exercise.exerciseId,
      exercise.settings.repRange,
      exercise.settings.trainingLane,
      exerciseHistorySummaries,
    ],
  );

  useEffect(() => {
    if (!v3RuntimeStatus.internal) return;
    console.info("[asc:v3-runtime]", {
      environment: v3RuntimeStatus.environment,
      activeWorkoutReady: v3RuntimeStatus.activeWorkoutReady,
      workoutSource: v3SessionSource,
      sessionId: session.id,
    });
  }, [session.id, v3RuntimeStatus.activeWorkoutReady, v3RuntimeStatus.environment, v3RuntimeStatus.internal, v3SessionSource]);
  const activeWorkRows = buildOverviewSetRows(
    exercise,
    productiveSetGuidance.target.targetMin,
    productiveSetGuidance.target.targetMax,
    activeExerciseMetadata,
    currentBlock?.type,
    warmupRowCounts[exercise.id],
    0,
    session.sessionKind,
  ).workRows;
  const activeHasNextWorkSet = activeWorkRows.some((row) => !row.set);

  useEffect(() => {
    if (exerciseId) {
      selectExercise(exerciseId);
      setView("exercise");
    }
  }, [exerciseId, selectExercise]);

  useEffect(() => {
    if (qaView === "exercise") setView("exercise");
    if (qaView === "overview") setView("overview");
  }, [qaView]);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_DESIGN_QA_MODE !== "1" || qaEndConfirm !== "1" || qaEndConfirmShown) return;
    setQaEndConfirmShown(true);
    confirmCompleteWorkout(plannedWorkComplete, () => undefined);
  }, [plannedWorkComplete, qaEndConfirm, qaEndConfirmShown]);

  useEffect(() => sessionPrepRepository.subscribe(() => setPrepRecords(sessionPrepRepository.list())), []);
  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
        setPerformanceDrawer(null);
        setSwapPickerIndex(null);
        setPendingSwapExercise(null);
        setShowAddExercise(false);
        setPendingAddExercise(null);
        setOverviewActionsIndex(null);
        setPendingEscalationPrompt(null);
        setPendingExerciseReasonAction(null);
        setPendingManualFinishIndex(null);
      };
    }, []),
  );

  useEffect(() => {
    setLoadInput(exercise.loadKnown === false ? "" : String(exercise.load));
    setRepInput("");
    setSetMode("work");
    setIgnoredLoadSuggestionKey(null);
  }, [exercise.id, exercise.load, exercise.loadKnown]);

  useEffect(() => {
    if (
      view !== "exercise" ||
      isReadOnly ||
      !activeHasNextWorkSet ||
      !inSessionLoadSuggestion.shouldSuggest ||
      !loadSuggestionKey ||
      loadSuggestionKey === ignoredLoadSuggestionKey ||
      pendingEscalationPrompt
    ) {
      return;
    }

    setPendingEscalationPrompt({
      exerciseIndex: activeExerciseIndex,
      exerciseId: exercise.id,
      exerciseName: exercise.exerciseName,
      currentLoad: inSessionLoadSuggestion.currentLoad,
      suggestedLoad: inSessionLoadSuggestion.suggestedLoad,
      unit,
      message: inSessionLoadSuggestion.message,
      suggestionKey: loadSuggestionKey,
    });
  }, [
    activeExerciseIndex,
    activeHasNextWorkSet,
    exercise.exerciseName,
    exercise.id,
    ignoredLoadSuggestionKey,
    inSessionLoadSuggestion.currentLoad,
    inSessionLoadSuggestion.message,
    inSessionLoadSuggestion.shouldSuggest,
    inSessionLoadSuggestion.suggestedLoad,
    isReadOnly,
    loadSuggestionKey,
    pendingEscalationPrompt,
    unit,
    view,
  ]);

  useEffect(() => {
    setRestTimerExpanded(false);
  }, [restTimer?.startedAt]);

  const summaries = useMemo(
    () =>
      session.exercises.map((candidate, index) => {
        const metadata = availableExercises.find((exercise) => exercise.id === candidate.exerciseId);
        const progression = evaluateExerciseProgression({
          exerciseName: candidate.exerciseName,
          currentLoad: candidate.load,
          settings: candidate.settings,
          sets: getWorkSets(candidate.sets),
        });
        const setPrescription = resolveSetPrescription(candidate.settings, {
          blockType: currentBlock?.type,
          exerciseRole: metadata?.role,
          exerciseFamily: metadata?.family,
          primaryMuscles: metadata?.primaryMuscles,
        });
        return {
          exercise: candidate,
          index,
          status: getDisplayStatus(candidate, index, activeExerciseIndex),
          setPrescription,
          progression,
          productiveGuidance: buildProductiveSetGuidance({
            blockType: currentBlock?.type,
            exerciseRole: metadata?.role,
            exerciseFamily: metadata?.family,
            primaryMuscles: metadata?.primaryMuscles,
            setPrescription,
            productiveSets: progression.completedAcceptableSets,
          }),
        };
      }),
    [activeExerciseIndex, availableExercises, currentBlock?.type, session.exercises],
  );
  const addExerciseOptions = useMemo(
    () => buildRecommendedAddExerciseOptions(availableExercises, session.exercises, activePlan?.recommendationState?.exercisePreferences),
    [activePlan?.recommendationState?.exercisePreferences, availableExercises, session.exercises],
  );
  const overviewSwapExercise = swapPickerIndex == null ? null : session.exercises[swapPickerIndex];
  const overviewSwapMetadata = overviewSwapExercise ? availableExercises.find((candidate) => candidate.id === overviewSwapExercise.exerciseId) : null;
  const overviewSwapSuggestions = useMemo(
    () =>
      overviewSwapMetadata
        ? getExerciseSwapSuggestions(overviewSwapMetadata, availableExercises, {
            limit: 6,
            exercisePreferences: activePlan?.recommendationState?.exercisePreferences,
          })
        : [],
    [activePlan?.recommendationState?.exercisePreferences, availableExercises, overviewSwapMetadata],
  );

  const handleOpenExercise = (index: number) => {
    openExercise(index);
    setView("exercise");
    setShowAddExercise(false);
    setOverviewActionsIndex(null);
    setSwapPickerIndex(null);
    setPendingSwapExercise(null);
  };

  const handleOpenPerformance = (
    index: number,
    setNumber: number,
    setType: SetLog["type"] = "work",
    suggestedLoad?: number | null,
    suggestionDisplay?: string | null,
    editSetId?: string | null,
    hasNextWorkSet?: boolean,
    workSetTargetMax?: number,
    suggestedReps?: number | null,
  ) => {
    openExercise(index);
    setPerformanceDrawer({ exerciseIndex: index, setNumber, setType, suggestedLoad, suggestedReps, suggestionDisplay, editSetId, hasNextWorkSet, workSetTargetMax });
    setOverviewActionsIndex(null);
    setSwapPickerIndex(null);
    setPendingSwapExercise(null);
    setShowAddExercise(false);
  };

  const handleAddWarmupRow = (exerciseId: string) => {
    setWarmupRowCounts((current) => ({ ...current, [exerciseId]: Math.min((current[exerciseId] ?? 3) + 1, 6) }));
  };

  const handleRemoveWarmupRow = (exercise: WorkoutExerciseLog) => {
    const loggedWarmups = getWarmupSets(exercise.sets).length;
    setWarmupRowCounts((current) => {
      const currentCount = current[exercise.id] ?? 3;
      return { ...current, [exercise.id]: Math.max(loggedWarmups, currentCount - 1) };
    });
  };

  const handleToggleWarmup = (exerciseId: string, defaultExpanded: boolean) => {
    setWarmupExpansionOverrides((current) => ({ ...current, [exerciseId]: !(current[exerciseId] ?? defaultExpanded) }));
  };

  const handleCloseAddExercise = () => {
    setShowAddExercise(false);
    setPendingAddExercise(null);
  };

  const handleConfirmAddExercise = () => {
    if (!pendingAddExercise) return;
    addExercise(pendingAddExercise.id, addPosition);
    handleCloseAddExercise();
  };

  const handleOverviewSwap = (index: number) => {
    setSwapPickerIndex(index);
    setPendingSwapExercise(null);
    setOverviewActionsIndex(null);
  };

  const handleOpenManualFinish = (index: number) => {
    setPendingManualFinishIndex(index);
    setOverviewActionsIndex(null);
    setSwapPickerIndex(null);
    setPendingSwapExercise(null);
  };

  const confirmDeleteLoggedSetFromOverview = (exerciseIndex: number, setId: string) => {
    Alert.alert("Delete set?", "This removes the logged set from today’s workout.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteLoggedSetAtIndex(exerciseIndex, setId);
          setPerformanceDrawer((current) =>
            current?.exerciseIndex === exerciseIndex && current.editSetId === setId ? null : current,
          );
        },
      },
    ]);
  };

  const recordPendingExerciseReason = (
    pending: NonNullable<PendingExerciseReasonAction>,
    reason: ExerciseReasonCode,
    decidedAt = new Date().toISOString(),
  ) => {
    if (activePlan) {
      const avoidedMetadata = availableExercises.find((candidate) => candidate.id === pending.avoidedExercise.exerciseId);
      const nextPlan = recordExerciseReasonForFutureCoaching(
        activePlan,
        {
          action: pending.type,
          avoidedExerciseId: pending.avoidedExercise.exerciseId,
          avoidedFamily: avoidedMetadata?.family,
          avoidedPrimaryMuscles: avoidedMetadata?.primaryMuscles,
          preferredReplacementExerciseId: pending.replacement?.id,
          reason,
          context: {
            currentBlock: currentBlock?.type,
            goal: activePlan.goal,
            workoutType,
            actionSurface: pending.type,
          },
        },
        decidedAt,
      );
      activeTrainingPlanRepository.save(nextPlan);
      setActivePlan(nextPlan);
    }
  };

  const handleConfirmSwapReplacement = () => {
    if (!pendingSwapExercise || !overviewSwapExercise) return;

    const pending = {
      type: "swap" as const,
      exerciseIndex: swapPickerIndex ?? activeExerciseIndex,
      avoidedExercise: overviewSwapExercise,
      replacement: pendingSwapExercise,
    };
    const swapped = swapExerciseAtIndex(pending.exerciseIndex, pendingSwapExercise.id);
    if (!swapped) return;

    recordPendingExerciseReason(pending, "prefer_another");
    Alert.alert("Exercise swapped.", `${pending.avoidedExercise.exerciseName} was replaced with ${pending.replacement.name}.`);
    setPendingExerciseReasonAction(null);
    setSwapPickerIndex(null);
    setPendingSwapExercise(null);
    setOverviewActionsIndex(null);
    setView("overview");
  };

  const commitExerciseReasonAction = (reason: ExerciseReasonCode) => {
    const pending = pendingExerciseReasonAction;
    if (!pending) return;

    recordPendingExerciseReason(pending, reason);

    if (pending.type === "swap" && pending.replacement) {
      const swapped = swapExerciseAtIndex(pending.exerciseIndex, pending.replacement.id);
      if (swapped) {
        Alert.alert("Exercise swapped.", `${pending.avoidedExercise.exerciseName} was replaced with ${pending.replacement.name}.`);
      }
    }

    if (pending.type === "remove") {
      removeExerciseForToday(pending.exerciseIndex);
    }

    if (pending.type === "skip") {
      completeCurrentExercise();
      if (finalExercise) {
        setView("overview");
      }
    }

    setPendingExerciseReasonAction(null);
    setSwapPickerIndex(null);
    setPendingSwapExercise(null);
    setOverviewActionsIndex(null);
  };

  const commitManualFinish = (reason: ManualExerciseFinishReason) => {
    const index = pendingManualFinishIndex;
    if (index == null) return;
    const targetExercise = session.exercises[index];
    if (!targetExercise) return;

    const finished = finishExerciseAtIndex(index, reason);
    if (!finished) return;

    if (reason === "pain_limitation") {
      recordPendingExerciseReason(
        {
          type: "skip",
          exerciseIndex: index,
          avoidedExercise: targetExercise,
        },
        reason,
      );
    }

    if (reason === "equipment_unavailable") {
      recordPendingExerciseReason(
        {
          type: "remove",
          exerciseIndex: index,
          avoidedExercise: targetExercise,
        },
        reason,
      );
    }

    setPendingManualFinishIndex(null);
    setView("overview");
  };

  const handleLogSet = () => {
    if (!canLogSet) return;
    const committedLoad = commitLoad();
    if (committedLoad == null) return;
    logSet(reps, setMode, committedLoad);
    setRepInput("");
  };

  const handleQuickLogSet = (quickRepValue: number) => {
    if (isReadOnly || !hasUsableLoad) return;
    setRepInput(String(quickRepValue));
    const committedLoad = commitLoad();
    if (committedLoad == null) return;
    logSet(quickRepValue, setMode, committedLoad);
    setRepInput("");
  };

  const commitLoad = () => {
    const nextLoad = Number.parseFloat(loadInput);
    if (!Number.isFinite(nextLoad)) {
      setLoadInput(exercise.loadKnown === false ? "" : String(exercise.load));
      return null;
    }
    updateLoad(nextLoad);
    return Number(nextLoad.toFixed(2));
  };

  const adjustLoad = (delta: number) => {
    const currentLoad = Number.parseFloat(loadInput);
    const baseLoad = Number.isFinite(currentLoad) ? currentLoad : exercise.loadKnown === false ? 0 : exercise.load;
    const nextLoad = Math.max(0, Number((baseLoad + delta).toFixed(2)));
    setLoadInput(String(nextLoad));
    updateLoad(nextLoad);
  };

  const handleMoveNext = () => {
    if (finalExercise) {
      confirmCompleteWorkout(plannedWorkComplete, handleOpenWorkoutReview);
      setView("overview");
      return;
    }
    goToNextExercise();
    setView("exercise");
  };

  const handleStartPrep = () => {
    router.push({
      pathname: "/(protected)/session-prep",
      params: {
        workoutName: displaySessionName,
        workoutType,
        firstExerciseName: firstSessionExercise?.exerciseName,
        firstMovementPattern: firstSessionExerciseMetadata?.movementPattern,
      },
    });
  };

  const handleSkipPrep = () => {
    sessionPrepRepository.save(
      buildSessionPrepRecord({
        routine: prepOverview.routine,
        workoutName: displaySessionName,
        status: "skipped",
      }),
    );
  };

  const handleKeepInSessionEscalation = () => {
    if (pendingEscalationPrompt?.suggestionKey) {
      setIgnoredLoadSuggestionKey(pendingEscalationPrompt.suggestionKey);
    }
    setPendingEscalationPrompt(null);
  };

  const handleUseInSessionEscalation = (suggestedLoad: number) => {
    const targetPrompt = pendingEscalationPrompt;
    if (!targetPrompt) return;
    updateLoadAtIndex(targetPrompt.exerciseIndex, suggestedLoad);
    if (targetPrompt.exerciseIndex === activeExerciseIndex) {
      setLoadInput(String(suggestedLoad));
    }
    setPendingEscalationPrompt(null);
  };

  const handleCompleteOrSkip = () => {
    setPendingManualFinishIndex(activeExerciseIndex);
  };

  const handleOpenWorkoutReview = () => {
    const completedAt = new Date().toISOString();
    const review = buildPostWorkoutReview({
      session,
      previousSessions: workoutSessionRepository.list().filter((candidate) => candidate.id !== session.id),
      completedAt,
      goal: activePlan?.goal,
      experienceLevel: activePlan?.experienceLevel,
      currentBlock: currentBlock?.type,
      isDeload: currentBlock?.type === "deload",
    });
    setPendingReview(review);
    setReviewDecisions({});
    setView("overview");
  };

  const saveCardioSession = () => {
    if (!cardioSessionKind) return;
    const durationMinutes = Number.parseInt(cardioDuration, 10);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return;
    const distance = Number.parseFloat(cardioDistance);
    const completedAt = new Date().toISOString();
    Keyboard.dismiss();
    workoutSessionRepository.save({
      ...session,
      completedAt,
      cardioLog: {
        sessionType: cardioSessionKind,
        modality: cardioModality,
        durationMinutes,
        distance: Number.isFinite(distance) && distance > 0 ? distance : undefined,
        perceivedEase: cardioEase,
        notes: cardioNotes.trim() || undefined,
        loggedAt: completedAt,
      },
      updatedAt: completedAt,
    });
    router.replace("/(protected)/(tabs)");
  };

  const finishReviewedWorkout = (decisions: Record<string, PostWorkoutLoadDecision>, postWorkoutReviewAnswers?: PostWorkoutReviewAnswers) => {
    if (!pendingReview) return;
    const reviewedSession = applyPostWorkoutReviewLoadApprovals(session, pendingReview, decisions);
    const nextLoadApprovals = Object.fromEntries(
      reviewedSession.exercises
        .filter((candidate) => candidate.nextLoadApproval)
        .map((candidate) => [candidate.id, candidate.nextLoadApproval!]),
    );
    finishWorkout({
      completedAt: pendingReview.completedAt,
      nextLoadApprovals,
      postWorkoutReviewAnswers,
    });
    setPendingReview(null);
    setReviewDecisions({});
    router.replace("/(protected)/(tabs)");
  };

  const approveAllAndFinish = (postWorkoutReviewAnswers?: PostWorkoutReviewAnswers) => {
    if (!pendingReview) return;
    finishReviewedWorkout(Object.fromEntries(pendingReview.loadChanges.map((change) => [change.exerciseLogId, "approved"])), postWorkoutReviewAnswers);
  };

  const finishWithCurrentLoads = (postWorkoutReviewAnswers?: PostWorkoutReviewAnswers) => {
    if (!pendingReview) return;
    finishReviewedWorkout(Object.fromEntries(pendingReview.loadChanges.map((change) => [change.exerciseLogId, "kept"])), postWorkoutReviewAnswers);
  };

  const finishSelectedReviewChoices = (postWorkoutReviewAnswers?: PostWorkoutReviewAnswers) => {
    if (!pendingReview) return;
    const decisions = Object.fromEntries(
      pendingReview.loadChanges.map((change) => [change.exerciseLogId, reviewDecisions[change.exerciseLogId] ?? "kept"]),
    );
    finishReviewedWorkout(decisions, postWorkoutReviewAnswers);
  };

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_DESIGN_QA_MODE !== "1" || qaReview !== "1" || pendingReview || session.completedAt) return;
    handleOpenWorkoutReview();
  }, [pendingReview, qaReview, session.completedAt, session.id]);

  if (cardioSessionKind) {
    return (
      <CardioSessionLoggingScreen
        sessionName={displaySessionName}
        sessionType={cardioSessionKind}
        modality={cardioModality}
        duration={cardioDuration}
        distance={cardioDistance}
        ease={cardioEase}
        notes={cardioNotes}
        interference={cardioInterference}
        onModality={setCardioModality}
        onDuration={(value) => setCardioDuration(value.replace(/[^0-9]/g, ""))}
        onDistance={(value) => setCardioDistance(value.replace(/[^0-9.]/g, ""))}
        onEase={setCardioEase}
        onNotes={setCardioNotes}
        onSave={saveCardioSession}
        onCancel={() => router.replace("/(protected)/(tabs)")}
      />
    );
  }

  const swapPickerModals = overviewSwapExercise && !session.completedAt ? (
    <>
      <SwapExercisePicker
        visible={swapPickerIndex != null && !pendingSwapExercise}
        exercise={overviewSwapExercise}
        recommended={overviewSwapSuggestions}
        allExercises={availableExercises}
        onClose={() => {
          setSwapPickerIndex(null);
          setPendingSwapExercise(null);
        }}
        onCreateExercise={(createdExercise) => {
          customExerciseRepository.save(createdExercise);
          setPendingSwapExercise(createdExercise);
        }}
        onSelect={(replacement) => setPendingSwapExercise(replacement)}
      />
      <ReplaceExerciseConfirmationModal
        visible={Boolean(pendingSwapExercise)}
        currentExerciseName={overviewSwapExercise.exerciseName}
        replacementExerciseName={pendingSwapExercise?.name}
        onCancel={() => setPendingSwapExercise(null)}
        onReplace={handleConfirmSwapReplacement}
      />
    </>
  ) : null;

  if (pendingReview) {
    return (
      <PostWorkoutReviewScreen
        review={pendingReview}
        decisions={reviewDecisions}
        onDecision={(exerciseLogId, decision) =>
          setReviewDecisions((current) => ({ ...current, [exerciseLogId]: decision }))
        }
        onApproveAll={approveAllAndFinish}
        onFinishSelected={finishSelectedReviewChoices}
        onKeepCurrentLoads={finishWithCurrentLoads}
        onBack={() => setPendingReview(null)}
      />
    );
  }

  if (view === "overview") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {restTimer ? (
          <WorkoutRestTimerStrip
            expanded={restTimerExpanded}
            remainingSeconds={restRemainingSeconds}
            onAdjust={adjustRestTime}
            onSkip={skipRest}
            onToggle={() => setRestTimerExpanded((value) => !value)}
          />
        ) : null}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: tabAwareBottomPadding, gap: spacing.xxl }}
        >
          <Animated.View entering={FadeInDown.duration(220)} style={workoutHeaderStyle}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "flex-start" }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  {formatWorkoutType(workoutType)}
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 28, lineHeight: 32, fontWeight: "900", letterSpacing: 0 }}>
                  {displaySessionName}
                </Text>
              </View>
              <View style={workoutProgressPillStyle}>
                <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
                  {session.completedAt ? "Done" : `${completedCount}/${totalExercises}`}
                </Text>
              </View>
            </View>
            <View style={workoutHeaderMetricsStyle}>
              <WorkoutHeaderMetric label="Exercises" value={`${totalExercises}`} />
              <WorkoutHeaderMetric label="Time" value={sessionBriefing.expectedLength} />
              <WorkoutHeaderMetric label="Progress" value={session.completedAt ? "Complete" : `${completedCount}/${totalExercises}`} />
            </View>
            {v3RuntimeStatus.internal ? (
              <Text selectable style={{ color: colors.textSubtle, fontSize: 11, lineHeight: 15, fontWeight: "800" }}>
                V3 {v3SessionSource === "active" ? "active" : v3SessionSource === "fallback" ? "fallback" : "off"}
              </Text>
            ) : null}
          </Animated.View>

          {!session.completedAt ? (
            <NextExerciseCard
              exerciseName={exercise.exerciseName}
              loadLabel={activeLoadDisplay.kind === "unknown" ? activeUnknownLoadLabel(exercise) : activeLoadDisplay.label}
              repLabel={session.sessionKind === "planned" ? executionTargetDisplay : targetRangeDisplay}
              setLabel={`Set ${currentSetNumber}`}
              onOpen={() => handleOpenExercise(activeExerciseIndex)}
            />
          ) : null}

          {!session.completedAt ? (
            <PrepInlineAction
              routineName={prepOverview.routine.name}
              status={prepOverview.status}
              primaryAction={prepOverview.primaryAction}
              showSkip={prepOverview.secondaryAction === "skip"}
              onStartOrView={handleStartPrep}
              onSkip={handleSkipPrep}
            />
          ) : null}

        <View style={{ gap: spacing.sm }}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Exercises
          </Text>
          {summaries.map((summary) => (
            <SessionExerciseRow
              key={summary.exercise.id}
              exercise={summary.exercise}
              status={summary.status}
              active={summary.index === activeExerciseIndex}
              index={summary.index}
              onOpen={() => handleOpenExercise(summary.index)}
              actionsOpen={overviewActionsIndex === summary.index}
              onToggleActions={() => {
                setOverviewActionsIndex((current) => (current === summary.index ? null : summary.index));
                setSwapPickerIndex(null);
                setPendingSwapExercise(null);
              }}
              onSwap={() => handleOverviewSwap(summary.index)}
              onRemoveForToday={() => {
                setPendingExerciseReasonAction({
                  type: "remove",
                  exerciseIndex: summary.index,
                  avoidedExercise: summary.exercise,
                });
              }}
              onFinishExercise={() => handleOpenManualFinish(summary.index)}
              productiveGuidance={summary.productiveGuidance}
              metadata={availableExercises.find((candidate) => candidate.id === summary.exercise.exerciseId)}
              blockType={currentBlock?.type}
              sessionKind={session.sessionKind}
              warmupRowCount={warmupRowCounts[summary.exercise.id]}
              warmupExpanded={warmupExpansionOverrides[summary.exercise.id] ?? summary.index === 0}
              onAddWarmupRow={() => handleAddWarmupRow(summary.exercise.id)}
              onRemoveWarmupRow={() => handleRemoveWarmupRow(summary.exercise)}
              onToggleWarmup={() => handleToggleWarmup(summary.exercise.id, summary.index === 0)}
              onPerformance={(row) =>
                handleOpenPerformance(
                  summary.index,
                  row.setNumber,
                  row.type,
                  row.suggestedLoad,
                  row.suggestionDisplay,
                  row.set?.id,
                  row.hasNextWorkSet,
                  summary.setPrescription.recommendedMaxSets,
                  row.suggestedReps,
                )
              }
              onDeleteLoggedSet={(setId) => confirmDeleteLoggedSetFromOverview(summary.index, setId)}
              onDeleteFutureWorkSet={(setNumber) => removeFutureWorkSetAtIndex(summary.index, setNumber)}
            />
          ))}
        </View>

        <DetailToggle label="Coach note">
          <View style={sessionBriefingStyle}>
            <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
              {sessionBriefing.goal}
            </Text>
            <View style={{ gap: spacing.sm }}>
              <SessionFocus label="Primary focus" value={sessionBriefing.primaryFocus} />
              <SessionFocus label="Secondary focus" value={sessionBriefing.secondaryFocus} />
              <SessionFocus label="Expected length" value={sessionBriefing.expectedLength} />
              {currentBlock?.type === "deload" ? <SessionFocus label="Recovery" value="Keep it easy enough to rebound." /> : null}
              {prOpportunity ? <SessionFocus label="Target" value={prOpportunity} /> : null}
            </View>
          </View>
        </DetailToggle>

        {session.completedAt ? (
          <BottomActionBar>
            <PrimaryButton label="Start new workout" onPress={resetSession} />
          </BottomActionBar>
        ) : null}

        {!session.completedAt ? (
          <Animated.View entering={FadeInUp.duration(180)} style={{ gap: spacing.md }}>
            <SecondaryButton label="Add exercise" onPress={() => setShowAddExercise(true)} />
            <CompleteWorkoutButton ready={plannedWorkComplete} onPress={() => confirmCompleteWorkout(plannedWorkComplete, handleOpenWorkoutReview)} />
            <DestructiveButton
              label="Cancel Workout"
              onPress={() =>
                confirmCancelWorkout(hasAnyLoggedSets, () => {
                  cancelWorkout();
                  router.replace("/(protected)/(tabs)");
                })
              }
            />
          </Animated.View>
        ) : null}
        {performanceDrawer && session.exercises[performanceDrawer.exerciseIndex] ? (
          <PerformanceLoggingDrawer
            exercise={session.exercises[performanceDrawer.exerciseIndex]!}
            metadata={availableExercises.find((candidate) => candidate.id === session.exercises[performanceDrawer.exerciseIndex]?.exerciseId) ?? null}
            exerciseIndex={performanceDrawer.exerciseIndex}
            sessionKind={session.sessionKind}
            setNumber={performanceDrawer.setNumber}
            visible={Boolean(performanceDrawer)}
            restTimer={restTimer}
            restRemainingSeconds={restRemainingSeconds}
            productiveSetGuidance={performanceDrawer.exerciseIndex === activeExerciseIndex ? productiveSetGuidance : null}
            initialSetType={performanceDrawer.setType}
            suggestedLoad={performanceDrawer.suggestedLoad}
            suggestedReps={performanceDrawer.suggestedReps}
            suggestionDisplay={performanceDrawer.suggestionDisplay}
            initialEditSetId={performanceDrawer.editSetId}
            hasNextWorkSet={Boolean(performanceDrawer.hasNextWorkSet)}
            workSetTargetMax={performanceDrawer.workSetTargetMax}
            suppressLoadEscalation={currentBlock?.type === "deload"}
            progressionThrottleInput={{
              exerciseRole: availableExercises.find((candidate) => candidate.id === session.exercises[performanceDrawer.exerciseIndex]?.exerciseId)?.role,
              exerciseFamily: availableExercises.find((candidate) => candidate.id === session.exercises[performanceDrawer.exerciseIndex]?.exerciseId)?.family,
              goal: activePlan?.goal,
              experienceLevel: activePlan?.experienceLevel,
              currentBlock: currentBlock?.type,
              isDeload: currentBlock?.type === "deload",
              isExtraSession: session.sessionKind != null && session.sessionKind !== "planned",
              trainingGapStatus: currentTrainingGap.status,
              eventTaper,
            }}
            onAdjustRest={adjustRestTime}
            onSkipRest={skipRest}
            onClose={() => setPerformanceDrawer(null)}
            onLogSet={(index, reps, type, loadOverride) => {
              logSetAtIndex(index, reps, type, loadOverride);
              setPerformanceDrawer(null);
            }}
            onEscalationSuggestion={(suggestion) => {
              const targetExercise = session.exercises[suggestion.exerciseIndex];
              if (!targetExercise) return;
              setPerformanceDrawer(null);
              setPendingEscalationPrompt({
                ...suggestion,
                exerciseId: targetExercise.id,
                exerciseName: targetExercise.exerciseName,
                unit: targetExercise.settings.unit,
              });
            }}
            onUpdateLoad={updateLoadAtIndex}
            onUndo={undoLastSetAtIndex}
            onEditSet={editLoggedSetAtIndex}
            onDeleteSet={deleteLoggedSetAtIndex}
          />
        ) : null}
        {swapPickerModals}
        <AddExercisePicker
          visible={showAddExercise && !session.completedAt}
          pendingExercise={pendingAddExercise}
          recommended={addExerciseOptions}
          allExercises={availableExercises}
          currentExercises={session.exercises}
          position={addPosition}
          onPositionChange={setAddPosition}
          onClose={handleCloseAddExercise}
          onSelect={setPendingAddExercise}
          onCreateExercise={(createdExercise) => {
            customExerciseRepository.save(createdExercise);
            setPendingAddExercise(createdExercise);
          }}
          onCancelPending={() => setPendingAddExercise(null)}
          onConfirmPending={handleConfirmAddExercise}
        />
        <InSessionEscalationModal
          prompt={pendingEscalationPrompt}
          onKeep={handleKeepInSessionEscalation}
          onUse={handleUseInSessionEscalation}
        />
        <ExerciseReasonSheet
          pending={pendingExerciseReasonAction}
          onClose={() => setPendingExerciseReasonAction(null)}
          onSelect={commitExerciseReasonAction}
        />
        <ManualFinishExerciseModal
          exercise={pendingManualFinishIndex == null ? null : session.exercises[pendingManualFinishIndex] ?? null}
          onClose={() => setPendingManualFinishIndex(null)}
          onFinish={commitManualFinish}
        />
        </ScrollView>
      </View>
    );
  }

  const activeStatus = getActiveStatusLabel(progression.minimumAcceptableReps, workSets, isShutdown);
  const trainingGapNote = getTrainingGapNote(exercise.notes);
  const calibrationLoad = isCalibrationLoadExercise(exercise);
  const loadHelperText =
    calibrationLoad
      ? null
      : trainingGapNote ??
        (exercise.loadKnown === false
          ? "Use percentages as effort guidance until Adaptive Strength Coach has your actual load history."
          : exercise.notes?.includes("Estimated from similar exercises")
            ? "Estimated from similar exercises. Adjust during warm-ups."
            : exercise.notes?.includes("Previous performance") || exercise.notes?.includes("Recent performance suggests")
              ? exercise.notes
              : null);

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      {restTimer ? (
        <WorkoutRestTimerStrip
          expanded={restTimerExpanded}
          remainingSeconds={restRemainingSeconds}
          onAdjust={adjustRestTime}
          onSkip={skipRest}
          onToggle={() => setRestTimerExpanded((value) => !value)}
        />
      ) : null}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: tabAwareBottomPadding, gap: spacing.lg }}
      >
        <Animated.View entering={FadeInDown.duration(220)} style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
            <Pressable onPress={() => setView("overview")} style={backToSessionStyle}>
              <Text style={{ color: colors.text, fontWeight: "900" }}>← Workout</Text>
            </Pressable>
            <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
              <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                Workout
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800", textAlign: "right" }}>
                {completedCount}/{totalExercises}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "center" }}>
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                Exercise
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 30, lineHeight: 34, fontWeight: "900", letterSpacing: 0 }}>
                {exercise.exerciseName}
              </Text>
            </View>
            <StatusPill label={activeStatus} tone={isShutdown ? "stop" : activeStatus.startsWith("Warning") ? "warn" : "go"} />
          </View>
        </Animated.View>

        <View style={cockpitMetricsStyle}>
          <CockpitMetric label="Load" value={activeLoadDisplay.kind === "unknown" ? activeUnknownMetricLabel(exercise) : activeLoadDisplay.label} />
          <CockpitMetric label={measurementType === "duration" ? "Duration" : "Reps"} value={session.sessionKind === "planned" ? executionTargetDisplay : targetRangeDisplay} />
          <CockpitMetric label="Set" value={`${currentSetNumber}`} />
        </View>
        <DetailToggle label="Coach note" compact>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
              {getExerciseCoachLine(activeStatus, progression.minimumAcceptableReps, progression.nextLoad, unit, measurementType)}
            </Text>
            <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
              {activeTargetZone.guidance}
            </Text>
            <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
              Useful zone: {formatTargetRange(activeTargetZone.targetZone, measurementType)}
            </Text>
          </View>
        </DetailToggle>

        {!isReadOnly ? (
          <View style={quickActionsStyle}>
            <SecondaryButton label="Undo" onPress={undoLastSet} disabled={exercise.sets.length === 0} compact />
            <SecondaryButton label="Swap" onPress={() => handleOverviewSwap(activeExerciseIndex)} compact />
            <SecondaryButton label="Finish" onPress={handleCompleteOrSkip} compact />
          </View>
        ) : null}

        {isShutdown ? (
          <ShutdownCoach
            exerciseName={exercise.exerciseName}
            nextLoad={progression.nextLoad}
            recommendation={progression.recommendation}
            shouldIncreaseLoad={progression.shouldIncreaseLoad}
            unit={unit}
            nextExerciseName={nextExercise?.exerciseName}
          />
        ) : null}

        {productiveSetGuidance.softCapReached ? (
          <Animated.View entering={FadeInUp.duration(180)} style={progressionPanelStyle(false, false)}>
            <Text selectable style={{ ...type.label, color: colors.accent }}>
              Move on?
            </Text>
            <Text selectable style={{ ...type.body, color: colors.text }}>
              {productiveSetGuidance.softCapText}
            </Text>
            <DetailToggle compact>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                The soft cap is coaching guidance only. Drop-off shutdown still decides when performance has clearly fallen below the useful range.
              </Text>
            </DetailToggle>
          </Animated.View>
        ) : null}

        {adaptiveSetDecision && !isReadOnly && !isShutdown ? (
          <AdaptiveSetGuidanceCard decision={adaptiveSetDecision} />
        ) : null}

        {!isShutdown && workSets.length > 0 && (!inSessionLoadSuggestion.shouldSuggest || isReadOnly || loadSuggestionKey === ignoredLoadSuggestionKey) ? (
          <ProgressionRecommendation
            shouldIncreaseLoad={progression.shouldIncreaseLoad}
            shouldShutdown={progression.shouldShutdown}
            nextLoad={progression.nextLoad}
            unit={unit}
            recommendation={progression.recommendation}
          />
        ) : null}

        {!isReadOnly ? (
          <Animated.View entering={FadeInUp.duration(220)} style={inputPanelStyle}>
            <View style={{ flexDirection: "row", gap: spacing.xs, padding: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, alignSelf: "flex-start" }}>
              <ModeButton label="Warm-up" active={setMode === "warmup"} onPress={() => setSetMode("warmup")} />
              <ModeButton label="Work set" active={setMode === "work"} onPress={() => setSetMode("work")} />
            </View>
            <View style={loadControlStyle(exercise.loadKnown === false)}>
              {calibrationLoad ? (
                <View style={{ flex: 1, gap: 3 }}>
                  <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                    Calibrate
                  </Text>
                </View>
              ) : loadHelperText ? (
                <View style={{ flex: 1, gap: 3 }}>
                  <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                    {exercise.loadKnown === false ? "Choose load" : "Load note"}
                  </Text>
                  <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                    {loadHelperText}
                  </Text>
                </View>
              ) : null}
              <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center", justifyContent: "space-between" }}>
                <LoadStepButton label={`-${exercise.settings.loadIncrease}`} onPress={() => adjustLoad(-exercise.settings.loadIncrease)} />
                <TextInput
                  editable={!isReadOnly}
                  keyboardType="decimal-pad"
                  onBlur={commitLoad}
                  onChangeText={(value) => setLoadInput(value.replace(/[^0-9.]/g, ""))}
                  onSubmitEditing={commitLoad}
                  returnKeyType="done"
                  value={loadInput}
                  placeholder={exercise.loadKnown === false ? "Load" : undefined}
                  placeholderTextColor={colors.textSubtle}
                  style={loadInputStyle(!isReadOnly)}
                />
                <Text selectable style={{ color: colors.textMuted, fontWeight: "900" }}>
                  {unit}
                </Text>
                <LoadStepButton label={`+${exercise.settings.loadIncrease}`} onPress={() => adjustLoad(exercise.settings.loadIncrease)} />
              </View>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.label, color: colors.textMuted }}>
                {metricLabel}
              </Text>
              {plannedWorkTargetMissing ? (
                <Text selectable style={{ color: colors.warning, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                  Exact target unavailable. Restore a compatible prescription before logging this planned set.
                </Text>
              ) : null}
              <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
                {quickReps.map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityLabel={`Log ${value} ${metricUnit}`}
                    disabled={isReadOnly || !hasUsableLoad || plannedWorkTargetMissing}
                    onPress={() => handleQuickLogSet(value)}
                    style={({ pressed }) => quickRepStyle(pressed, isReadOnly || !hasUsableLoad || plannedWorkTargetMissing)}
                  >
                    <Text style={{ color: colors.text, fontWeight: "900" }}>{value}</Text>
                    <Text style={{ color: colors.textSubtle, fontSize: 11, fontWeight: "800" }}>log</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "stretch" }}>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={3}
                  onChangeText={(value) => setRepInput(value.replace(/[^0-9]/g, ""))}
                  placeholder="0"
                  placeholderTextColor={colors.textSubtle}
                  returnKeyType="done"
                  value={repInput}
                  style={repInputStyle}
                />
                <View style={{ flex: 1 }}>
                  <PrimaryButton label={setMode === "warmup" ? "Log warm-up" : "Log work set"} onPress={handleLogSet} disabled={!canLogSet} />
                </View>
              </View>
            </View>

            <DetailToggle label="Target sets" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                {productiveSetGuidance.targetText}
              </Text>
            </DetailToggle>

          </Animated.View>
        ) : null}

        {isShutdown ? (
          <BottomActionBar>
            <PrimaryButton label={finalExercise ? "Complete Workout" : `Move to ${nextExercise?.exerciseName ?? "next exercise"}`} onPress={handleMoveNext} />
            <SecondaryButton label="Undo last set" onPress={undoLastSet} disabled={exercise.sets.length === 0 || Boolean(session.completedAt)} compact />
            <SecondaryButton label="Reopen anyway" onPress={() => reopenCurrentExercise(true)} disabled={Boolean(session.completedAt)} compact />
          </BottomActionBar>
        ) : null}

        {isReadOnly && !isShutdown ? (
          <BottomActionBar>
            <PrimaryButton label="Reopen exercise" onPress={() => reopenCurrentExercise()} />
            <SecondaryButton label={finalExercise ? "Finish workout" : "Move to next exercise"} onPress={handleMoveNext} compact />
            <SecondaryButton label="Undo last set" onPress={undoLastSet} disabled={exercise.sets.length === 0 || Boolean(session.completedAt)} compact />
          </BottomActionBar>
        ) : null}

        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              Set history
            </Text>
            <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
              {warmupSets.length} warm-up · {workSets.length} work
            </Text>
          </View>

          {exercise.sets.length === 0 ? (
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              No sets yet. Warm up if needed, then switch to work sets when the load is real.
            </Text>
          ) : (
            <Animated.View entering={FadeIn.duration(180)} layout={LinearTransition.duration(180)} style={{ gap: spacing.lg }}>
            <SetGroup title="Warm-up Sets" empty="No warm-ups logged." sets={warmupSets} unit={unit} exercise={exercise} metadata={activeExerciseMetadata} />
            <SetGroup title="Work Sets" empty="No work sets yet." sets={workSets} unit={unit} exercise={exercise} metadata={activeExerciseMetadata} minimumAcceptableReps={progression.minimumAcceptableReps} />
            </Animated.View>
          )}
        </View>
        <InSessionEscalationModal
          prompt={pendingEscalationPrompt}
          onKeep={handleKeepInSessionEscalation}
          onUse={handleUseInSessionEscalation}
        />
        {swapPickerModals}
        <ExerciseReasonSheet
          pending={pendingExerciseReasonAction}
          onClose={() => setPendingExerciseReasonAction(null)}
          onSelect={commitExerciseReasonAction}
        />
        <ManualFinishExerciseModal
          exercise={pendingManualFinishIndex == null ? null : session.exercises[pendingManualFinishIndex] ?? null}
          onClose={() => setPendingManualFinishIndex(null)}
          onFinish={commitManualFinish}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SessionExerciseRow({
  exercise,
  status,
  active,
  index,
  onOpen,
  actionsOpen,
  onToggleActions,
  onSwap,
  onRemoveForToday,
  onFinishExercise,
  productiveGuidance,
  metadata,
  blockType,
  sessionKind,
  warmupRowCount,
  warmupExpanded,
  onAddWarmupRow,
  onRemoveWarmupRow,
  onToggleWarmup,
  onPerformance,
  onDeleteLoggedSet,
  onDeleteFutureWorkSet,
}: {
  exercise: WorkoutExerciseLog;
  status: DisplayStatus;
  active: boolean;
  index: number;
  onOpen(): void;
  actionsOpen: boolean;
  onToggleActions(): void;
  onSwap(): void;
  onRemoveForToday(): void;
  onFinishExercise(): void;
  productiveGuidance: { target: { targetMin: number; targetMax: number }; targetText: string };
  metadata?: Exercise;
  blockType?: BlockType | null;
  sessionKind?: WorkoutSession["sessionKind"];
  warmupRowCount?: number;
  warmupExpanded: boolean;
  onAddWarmupRow(): void;
  onRemoveWarmupRow(): void;
  onToggleWarmup(): void;
  onPerformance(row: OverviewSetRowModel): void;
  onDeleteLoggedSet(setId: string): void;
  onDeleteFutureWorkSet(setNumber: number): void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const hasSwap = Boolean(exercise.swappedFromExerciseId || exercise.swapHistory?.length);
  const isAdded = exercise.origin === "added_during_workout";
  const workSets = getWorkSets(exercise.sets);
  const warmupSets = getWarmupSets(exercise.sets);
  const latestWorkSet = workSets.at(-1);
  const restingStateLabel = isCalibrationLoadExercise(exercise) ? "Calibrate" : "Ready";
  const morePanelRows = buildExerciseMorePanelRows(exercise, metadata, index, sessionKind);
  const setPrescription = resolveSetPrescription(exercise.settings, {
    blockType,
    exerciseRole: metadata?.role,
    exerciseFamily: metadata?.family,
    primaryMuscles: metadata?.primaryMuscles,
  });
  const plannedRows = buildOverviewSetRows(exercise, setPrescription.recommendedMinSets, setPrescription.recommendedMaxSets, metadata, blockType, warmupRowCount, index, sessionKind);
  const isFinishedEarly = exercise.status === "shutdown" || Boolean(exercise.finishedManually);
  const visibleWorkRows = isFinishedEarly ? plannedRows.workRows.filter((row) => row.set) : plannedRows.workRows;
  const canRemoveWarmupRow = plannedRows.warmupRows.length > warmupSets.length;
  return (
    <View
      style={{
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.lineSoft,
        backgroundColor: active ? colors.accentSoft : colors.surfaceMuted,
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "flex-start" }}>
        <View style={{ flex: 1, flexShrink: 1, minWidth: 0, gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
            {overviewExerciseRoleLabel(index, isAdded, hasSwap)}
          </Text>
          <Text selectable numberOfLines={2} ellipsizeMode="tail" style={{ color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900", flexShrink: 1 }}>
            {exercise.exerciseName}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {latestWorkSet ? `Last set: ${formatSetLoadDisplay(latestWorkSet, exercise.settings.unit, exercise.settings.unit, { exercise, metadata })}` : restingStateLabel}
          </Text>
          {showDetails ? <ExerciseMorePanel rows={morePanelRows} /> : null}
          {isAdded || hasSwap ? (
            <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" }}>
              {isAdded ? <InlineBadge label="Added" /> : null}
              {hasSwap ? <InlineBadge label="Swapped" /> : null}
            </View>
          ) : null}
        </View>
        <StatusPill label={exercise.finishedManually ? "Finished" : formatStatus(status)} tone={status === "stopped" ? "stop" : status === "active" ? "go" : "neutral"} />
      </View>
      <View style={overviewSetTableStyle}>
        <View style={overviewSetSectionHeaderStyle}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text selectable style={overviewSetSectionLabelStyle}>
              Warm-Up Sets
            </Text>
            <Text selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 16, fontWeight: "800" }}>
              {plannedRows.warmupRows.length > 0 ? `${plannedRows.warmupRows.length} ramp sets` : "optional ramp"}
            </Text>
          </View>
          <CompactTextAction label={warmupExpanded ? "Hide" : "Show"} onPress={onToggleWarmup} />
        </View>
        {warmupExpanded ? (
          <>
            {plannedRows.warmupRows.map((row) => (
              <OverviewSetRow
                key={`${row.type}-${row.setNumber}`}
                setNumber={row.label}
                loadLabel={row.set ? formatSetLoadDisplay(row.set, exercise.settings.unit, exercise.settings.unit, { exercise, metadata }) : row.loadLabel}
                logged={Boolean(row.set)}
                disabled={exercise.status !== "active"}
                onPerformance={() => onPerformance(row)}
              />
            ))}
            <View style={warmupControlRowStyle}>
              <CompactTextAction label="+ Warm-up set" onPress={onAddWarmupRow} disabled={exercise.status !== "active"} />
              {canRemoveWarmupRow ? <CompactTextAction label="- Warm-up set" onPress={onRemoveWarmupRow} disabled={exercise.status !== "active"} /> : null}
            </View>
          </>
        ) : null}
        <View style={overviewSetSectionDividerStyle} />
        <View style={overviewSetSectionHeaderStyle}>
          <Text selectable style={overviewSetSectionLabelStyle}>
            Work sets
          </Text>
        </View>
        {visibleWorkRows.map((row) => {
          const loggedSetId = row.set?.id;
          return (
            <OverviewSetRow
              key={`${row.type}-${row.setNumber}`}
              setNumber={row.label}
              loadLabel={row.set ? formatSetLoadDisplay(row.set, exercise.settings.unit, exercise.settings.unit, { exercise, metadata }) : row.loadLabel}
              logged={Boolean(row.set)}
              disabled={exercise.status !== "active"}
              onPerformance={() => onPerformance(row)}
              onDelete={loggedSetId ? () => onDeleteLoggedSet(loggedSetId) : exercise.status === "active" ? () => onDeleteFutureWorkSet(row.setNumber) : undefined}
            />
          );
        })}
        {isFinishedEarly ? (
          <Text selectable style={{ color: colors.warning, fontSize: 13, lineHeight: 18, fontWeight: "900", padding: spacing.md }}>
            {manualExerciseFinishLabel(exercise) ?? "Shut down here. Move on."}
          </Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.xs, flexWrap: "wrap", alignItems: "center" }}>
        <CompactTextAction label={showDetails ? "Hide more" : "More"} onPress={() => setShowDetails((value) => !value)} />
        <CompactTextAction label="Open detail" onPress={onOpen} />
        <CompactTextAction label={actionsOpen ? "Hide actions" : "Actions"} onPress={onToggleActions} />
      </View>
      {actionsOpen ? (
        <Animated.View entering={FadeInUp.duration(140)} style={overviewActionsStyle}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text selectable style={{ ...type.label, color: colors.accent }}>
              Actions
            </Text>
            <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>
              Changes apply to this workout only.
            </Text>
          </View>
          <SecondaryButton label="Swap exercise" onPress={onSwap} compact />
          <SecondaryButton label="Finish exercise" onPress={onFinishExercise} compact />
          <SecondaryButton label="Remove for today" onPress={onRemoveForToday} compact />
        </Animated.View>
      ) : null}
    </View>
  );
}

function OverviewSetRow({
  setNumber,
  loadLabel,
  logged,
  disabled,
  onPerformance,
  onDelete,
}: {
  setNumber: string | number;
  loadLabel: string;
  logged: boolean;
  disabled: boolean;
  onPerformance(): void;
  onDelete?: () => void;
}) {
  const [deleteRevealed, setDeleteRevealed] = useState(false);
  const swipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Boolean(onDelete) && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (!onDelete) return;
          if (gesture.dx < -42) {
            setDeleteRevealed(true);
            return;
          }
          if (gesture.dx > 24) setDeleteRevealed(false);
        },
        onPanResponderTerminate: () => undefined,
      }),
    [onDelete],
  );
  const handleDelete = () => {
    setDeleteRevealed(false);
    onDelete?.();
  };

  return (
    <View style={overviewSetSwipeContainerStyle}>
      {onDelete ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete set ${setNumber}`}
          accessibilityElementsHidden={!deleteRevealed}
          importantForAccessibility={deleteRevealed ? "auto" : "no-hide-descendants"}
          onPress={handleDelete}
          pointerEvents={deleteRevealed ? "auto" : "none"}
          style={({ pressed }) => overviewSetDeleteActionStyle(pressed)}
        >
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: "900" }}>Delete</Text>
        </Pressable>
      ) : null}
      <View
        {...(onDelete ? swipeResponder.panHandlers : {})}
        style={[
          overviewSetRowStyle,
          deleteRevealed && onDelete ? overviewSetRowRevealedStyle : null,
        ]}
      >
        <Text selectable style={{ color: colors.textSubtle, fontSize: 13, fontWeight: "900", width: 24 }}>
          {setNumber}
        </Text>
        <Text selectable style={overviewSetLoadTextStyle}>
          {loadLabel}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={logged ? `Edit set ${setNumber}` : `Log performance for set ${setNumber}`}
          disabled={disabled && !logged}
          onPress={onPerformance}
          style={({ pressed }) => performanceButtonStyle(pressed, disabled && !logged, logged)}
        >
          <Text style={{ color: logged ? colors.success : disabled ? colors.textSubtle : colors.accent, fontSize: 12, fontWeight: "900" }}>
            {logged ? "Logged · Edit" : "Performance"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ExerciseReasonSheet({
  pending,
  onClose,
  onSelect,
}: {
  pending: PendingExerciseReasonAction;
  onClose(): void;
  onSelect(reason: ExerciseReasonCode): void;
}) {
  const actionLabel = pending?.type === "swap" ? "swap" : pending?.type === "remove" ? "remove" : "skip";
  const replacementText = pending?.replacement ? ` → ${pending.replacement.name}` : "";

  return (
    <Modal visible={Boolean(pending)} transparent animationType="slide" onRequestClose={onClose}>
      <View style={performanceDrawerBackdropStyle}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View entering={FadeInUp.duration(160)} style={swapPickerSheetStyle}>
          <ScrollView contentContainerStyle={{ gap: spacing.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Reason
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: "900" }}>
                  Why {actionLabel} this exercise?
                </Text>
                <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
                  {pending ? `${pending.avoidedExercise.exerciseName}${replacementText}` : "Tell Adaptive Strength Coach what happened."}
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close reason sheet" onPress={onClose} style={drawerCloseStyle}>
                <Text style={{ color: colors.text, fontWeight: "900" }}>Close</Text>
              </Pressable>
            </View>

            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Fast note only. Pain or unavailable kit will not be treated as failed training. This is coaching data, not medical advice.
            </Text>

            <View style={{ gap: spacing.sm }}>
              {exerciseReasonOptions.map((option) => (
                <Pressable key={option.code} accessibilityRole="button" accessibilityLabel={option.label} onPress={() => onSelect(option.code)} style={reasonOptionStyle}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900" }}>
                      {option.label}
                    </Text>
                    <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>
                      {option.helper}
                    </Text>
                  </View>
                  <Text style={{ color: colors.accent, fontWeight: "900" }}>Use</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const manualFinishReasonOptions: Array<{ code: ManualExerciseFinishReason; label: string; helper: string }> = [
  { code: "completed_enough", label: "Completed enough for today", helper: "Finished, neutral evidence." },
  { code: "fatigue_performance", label: "Fatigue / performance dropping", helper: "Finished as a shutdown signal for review." },
  { code: "pain_limitation", label: "Pain or limitation", helper: "No failed-performance penalty. Keep it calm." },
  { code: "equipment_unavailable", label: "Equipment unavailable", helper: "Today problem, not a strength problem." },
  { code: "taking_it_easy", label: "Taking it easy today", helper: "Conservative evidence. No heroic load jump." },
  { code: "out_of_time", label: "Out of time", helper: "Finished for today without punishing performance." },
];

function ManualFinishExerciseModal({
  exercise,
  onClose,
  onFinish,
}: {
  exercise: WorkoutExerciseLog | null;
  onClose(): void;
  onFinish(reason: ManualExerciseFinishReason): void;
}) {
  const [selectedReason, setSelectedReason] = useState<ManualExerciseFinishReason>("completed_enough");

  useEffect(() => {
    if (exercise) setSelectedReason("completed_enough");
  }, [exercise?.id]);

  return (
    <Modal visible={Boolean(exercise)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={replaceExerciseModalBackdropStyle}>
        <Pressable accessible={false} style={manualFinishModalCardStyle}>
          <Animated.View entering={FadeInUp.duration(160)} style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Finish exercise?
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {exercise ? `Finish ${exercise.exerciseName} for today and hide the unperformed sets.` : "Finish this exercise for today."}
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              {manualFinishReasonOptions.map((option) => {
                const selected = option.code === selectedReason;
                return (
                  <Pressable
                    key={option.code}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    onPress={() => setSelectedReason(option.code)}
                    style={manualFinishReasonOptionStyle(selected)}
                  >
                    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                      <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>
                        {option.label}
                      </Text>
                      <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>
                        {option.helper}
                      </Text>
                    </View>
                    <Text style={{ color: selected ? colors.accent : colors.textSubtle, fontWeight: "900" }}>
                      {selected ? "Selected" : "Select"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <View style={{ flex: 1, minWidth: 120 }}>
                <SecondaryButton label="Cancel" onPress={onClose} />
              </View>
              <View style={{ flex: 1, minWidth: 140 }}>
                <PrimaryButton label="Finish Exercise" onPress={() => onFinish(selectedReason)} />
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </Modal>
  );
}

function InSessionEscalationModal({
  prompt,
  onUse,
  onKeep,
}: {
  prompt: PendingEscalationPrompt;
  onUse(suggestedLoad: number): void;
  onKeep(): void;
}) {
  const suggestedLoadLabel = prompt ? formatLoadDisplaySafe(prompt.suggestedLoad, prompt.unit) : "";

  return (
    <Modal visible={Boolean(prompt)} transparent animationType="fade" onRequestClose={onKeep}>
      <Pressable style={escalationModalBackdropStyle} onPress={onKeep}>
        <Pressable accessible={false} style={escalationModalCardStyle}>
          <Animated.View entering={FadeInUp.duration(160)} style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <Text selectable style={{ ...type.section, color: colors.success }}>
                You earned more weight.
              </Text>
              {prompt ? (
                <Text selectable style={{ ...type.body, color: colors.text }}>
                  Try {suggestedLoadLabel} on the next {prompt.exerciseName} set?
                </Text>
              ) : null}
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                Top reps hit across productive sets. Fatigue still looks under control.
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <SecondaryButton label="Keep current load" onPress={onKeep} compact />
              {prompt ? <PrimaryButton label={`Use ${suggestedLoadLabel}`} onPress={() => onUse(prompt.suggestedLoad)} compact /> : null}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AdaptiveSetGuidanceCard({ decision }: { decision: AdaptiveSetDecision }) {
  const title =
    decision.recommendation === "max_reached"
      ? "Set cap reached"
      : decision.recommended_next === "move_on"
        ? decision.fatigue_cost === "high"
          ? "Stimulus achieved"
          : "Move on"
        : decision.recommended_next === "complete_prescribed_max"
          ? "Finish the range"
          : "One more quality set";
  const tone =
    decision.recommended_next === "move_on"
      ? "stop"
      : decision.recommended_next === "complete_prescribed_max"
        ? "go"
        : "neutral";
  const status =
    decision.stimulus_status === "high"
      ? "High stimulus"
      : decision.stimulus_status === "sufficient"
        ? "Enough stimulus"
        : "Building stimulus";

  return (
    <Animated.View entering={FadeInUp.duration(160)} style={adaptiveSetGuidanceStyle(tone)}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text selectable style={{ ...type.label, color: tone === "go" ? colors.success : tone === "stop" ? colors.accent : colors.textMuted, textTransform: "uppercase" }}>
            {title}
          </Text>
          <Text selectable numberOfLines={2} style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
            {decision.short_reason}
          </Text>
        </View>
        <View style={adaptiveSetStatusPillStyle(tone)}>
          <Text selectable style={{ color: colors.text, fontSize: 11, lineHeight: 14, fontWeight: "900" }}>
            {status}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function ReplaceExerciseConfirmationModal({
  visible,
  currentExerciseName,
  replacementExerciseName,
  onCancel,
  onReplace,
}: {
  visible: boolean;
  currentExerciseName: string;
  replacementExerciseName?: string;
  onCancel(): void;
  onReplace(): void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={replaceExerciseModalBackdropStyle}>
        <Pressable accessible={false} style={replaceExerciseModalCardStyle}>
          <Animated.View entering={FadeInUp.duration(160)} style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Replace exercise?
              </Text>
              <Text selectable numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.84} style={{ ...type.body, color: colors.textMuted, flexShrink: 1 }}>
                Replace {currentExerciseName} with {replacementExerciseName ?? "this exercise"}?
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <View style={{ flex: 1, minWidth: 120 }}>
                <SecondaryButton label="Cancel" onPress={onCancel} />
              </View>
              <View style={{ flex: 1, minWidth: 120 }}>
                <PrimaryButton label="Replace" onPress={onReplace} />
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </Modal>
  );
}

function CompactTextAction({ label, onPress, disabled }: { label: string; onPress(): void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => compactTextActionStyle(pressed, disabled)}>
      <Text style={{ color: disabled ? colors.textSubtle : colors.textMuted, fontSize: 12, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

type OverviewSetRowModel = {
  label: string | number;
  setNumber: number;
  type: SetLog["type"];
  set?: SetLog;
  suggestedLoad?: number | null;
  suggestedReps?: number | null;
  suggestionDisplay?: string | null;
  loadLabel: string;
  hasNextWorkSet?: boolean;
};

function buildOverviewSetRows(
  exercise: WorkoutExerciseLog,
  targetMin: number,
  targetMax: number,
  metadata?: Exercise,
  blockType?: BlockType | null,
  warmupRowCount?: number,
  exerciseIndex = 0,
  sessionKind?: WorkoutSession["sessionKind"],
): { warmupRows: OverviewSetRowModel[]; workRows: OverviewSetRowModel[] } {
  const warmupSets = getWarmupSets(exercise.sets);
  const workSets = getWorkSets(exercise.sets);
  const rowCount = Math.max(targetMin, Math.min(Math.max(workSets.length + 1, targetMin), Math.max(targetMax, targetMin)));
  const baseWarmupPrescriptions = buildWarmupPrescriptions(exercise, metadata, exercise.settings.unit, blockType, { exerciseIndex });
  const desiredWarmupRows = Math.max(warmupRowCount ?? baseWarmupPrescriptions.length, warmupSets.length);
  const warmupPrescriptions = Array.from({ length: desiredWarmupRows }, (_, index) => baseWarmupPrescriptions[index] ?? {
    ...baseWarmupPrescriptions[baseWarmupPrescriptions.length - 1]!,
    id: `W${index + 1}`,
    label: `W${index + 1}` as "W1",
  });
  const warmupRows = warmupPrescriptions.map((prescription, index) => ({
    label: prescription.label,
    setNumber: index + 1,
    type: "warmup" as const,
    set: warmupSets[index],
    suggestedLoad: prescription.load,
    suggestedReps: prescription.reps,
    suggestionDisplay: prescription.suggestionDisplay,
    loadLabel: prescription.loadDisplay,
  }));
  const workLoad = loadDisplayForExercise(exercise, metadata, exercise.settings.unit, { preserveExact: true });
  const removedFutureWorkSetNumbers = new Set(exercise.removedFutureWorkSetNumbers ?? []);
  const workRows = Array.from({ length: rowCount }, (_, index) => {
    const set = workSets[index];
    const target = resolveTrainExecutionTarget({ sessionKind, exercise, workSetIndex: index });
    const setTarget = target.reps;
    const plannedLoadLabel = workLoad.kind === "unknown"
      ? formatPlannedWorkSetDisplay(activeUnknownLoadLabel(exercise), setTarget, exercise)
      : formatPlannedWorkSetDisplay(workLoad.label, setTarget, exercise);
    return {
      label: index + 1,
      setNumber: index + 1,
      type: "work" as const,
      set,
      suggestedLoad: workLoad.kind === "unknown" ? null : workLoad.value,
      suggestedReps: setTarget,
      suggestionDisplay: target.source === "planned_target_missing"
        ? "Exact target unavailable. Restore a compatible prescription before logging this set."
        : `Suggested: ${plannedLoadLabel}`,
      loadLabel: plannedLoadLabel,
      hasNextWorkSet: index < rowCount - 1,
    };
  }).filter((row) => row.set || !removedFutureWorkSetNumbers.has(row.setNumber));
  return { warmupRows, workRows };
}

function formatPlannedWorkSetDisplay(loadLabel: string, reps: number | null, exercise: Pick<WorkoutExerciseLog, "settings">): string {
  if (typeof reps !== "number" || !Number.isFinite(reps) || reps <= 0) return loadLabel;
  const suffix = getExerciseMeasurementType(exercise.settings) === "duration" ? " sec" : "";
  return `${loadLabel} × ${reps}${suffix}`;
}

function isCalibrationLoadExercise(exercise: Pick<WorkoutExerciseLog, "loadKnown" | "notes">): boolean {
  return exercise.loadKnown === false && /\b(find working load|calibrate)\b/i.test(exercise.notes ?? "");
}

function activeUnknownLoadLabel(exercise: Pick<WorkoutExerciseLog, "loadKnown" | "notes">): string {
  return isCalibrationLoadExercise(exercise) ? "Find working load" : "Choose load";
}

function activeUnknownMetricLabel(exercise: Pick<WorkoutExerciseLog, "loadKnown" | "notes">): string {
  return isCalibrationLoadExercise(exercise) ? "Calibrate" : "Choose";
}

type ExerciseMorePanelRow = {
  label: "Why this exercise" | "Today’s target" | "Technique" | "Progression";
  text: string;
};

function ExerciseMorePanel({ rows }: { rows: ExerciseMorePanelRow[] }) {
  return (
    <View style={exerciseMorePanelStyle}>
      {rows.slice(0, 4).map((row) => (
        <View key={row.label} style={{ gap: 2 }}>
          <Text selectable style={exerciseMorePanelLabelStyle}>
            {row.label}
          </Text>
          <Text selectable style={exerciseMorePanelTextStyle}>
            {row.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

function buildExerciseMorePanelRows(exercise: WorkoutExerciseLog, metadata: Exercise | undefined, index: number, sessionKind?: WorkoutSession["sessionKind"]): ExerciseMorePanelRow[] {
  const rows: ExerciseMorePanelRow[] = [
    { label: "Why this exercise", text: athleteFacingExerciseReason(exercise, metadata, index) },
    { label: "Today’s target", text: athleteFacingExerciseTarget(exercise, sessionKind) },
  ];
  const cue = athleteFacingTechniqueCue(metadata);
  if (cue) rows.push({ label: "Technique", text: cue });
  rows.push({ label: "Progression", text: athleteFacingProgressionNote(exercise, metadata) });
  return rows;
}

const INTERNAL_EXERCISE_DETAIL_PATTERN =
  /\b(decisionTrace|session[_ ]?id|exercise[_ ]?id|packet|engine|confidence|source key|load source|layer|session_layer|method_id|loading_prescription|reason_codes?|calibration confidence|direct_exercise_history|movement_family|close_variation|validated_direct_e1rm|v2|v3)\b|[_:]{2,}/i;

function athleteFacingExerciseReason(exercise: WorkoutExerciseLog, metadata: Exercise | undefined, index: number): string {
  const safeNote = firstAthleteFacingNote(exercise.notes);
  if (safeNote) return safeNote;
  const primaryMuscle = metadata?.primaryMuscles[0];
  const secondaryMuscle = metadata?.secondaryMuscles[0];
  if (index === 0) return `${exercise.exerciseName} anchors today’s main work.`;
  if (primaryMuscle === "triceps") return "Build triceps strength to support pressing.";
  if (primaryMuscle === "biceps") return "Build elbow-flexor strength for pulling work.";
  if (primaryMuscle === "back" || secondaryMuscle === "back") return "Support stronger, more stable pulling.";
  if (primaryMuscle === "shoulders") return "Build shoulder strength and balance.";
  if (primaryMuscle === "quads" || primaryMuscle === "hamstrings" || primaryMuscle === "glutes" || primaryMuscle === "calves") return "Add productive lower-body work without wasting sets.";
  if (metadata?.role === "isolation") return `Build ${titlePanelText(primaryMuscle ?? "target muscle")} with focused reps.`;
  return "Support today’s main lift with useful, focused work.";
}

function titlePanelText(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function athleteFacingExerciseTarget(exercise: WorkoutExerciseLog, sessionKind?: WorkoutSession["sessionKind"]): string {
  const sets = Math.max(1, exercise.settings.requiredWorkSets);
  const target = resolveTrainExecutionTarget({ sessionKind, exercise, workSetIndex: 0 });
  if (target.source === "planned_target_missing") return "This planned workout needs a compatible exact prescription before you log it.";
  const reps = target.reps ?? 0;
  const metric = getExerciseMeasurementType(exercise.settings) === "duration" ? `${reps} sec` : `${reps}`;
  if (isCalibrationLoadExercise(exercise)) return `${sets} × ${metric}. Find a working load.`;
  return `${sets} × ${metric} with controlled reps.`;
}

function athleteFacingTechniqueCue(metadata: Exercise | undefined): string | null {
  const cue = metadata?.notes.find((note) => isAthleteFacingExerciseText(note));
  return cue ? trimPanelSentence(cue) : null;
}

function athleteFacingProgressionNote(exercise: WorkoutExerciseLog, metadata: Exercise | undefined): string {
  if (isCalibrationLoadExercise(exercise)) return "Find a repeatable working load before chasing progression.";
  if (exercise.loadKnown === false) return "Log the load you use today so next time is sharper.";
  if (metadata?.kind === "bodyweight") return "Own clean reps before adding difficulty.";
  return "Own all sets before load increases.";
}

function firstAthleteFacingNote(notes: string | undefined): string | null {
  if (!notes) return null;
  const parts = notes
    .split(/[|•·\n]/)
    .map((part) => trimPanelSentence(part))
    .filter(Boolean);
  return parts.find(isAthleteFacingExerciseText) ?? null;
}

function isAthleteFacingExerciseText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 120 && !INTERNAL_EXERCISE_DETAIL_PATTERN.test(trimmed) && !/\b(suggested|estimated from similar|previous performance|recent performance suggests)\b/i.test(trimmed);
}

function trimPanelSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function PerformanceLoggingDrawer({
  exercise,
  metadata,
  exerciseIndex,
  sessionKind,
  setNumber,
  visible,
  productiveSetGuidance,
  initialSetType,
  initialEditSetId,
  hasNextWorkSet,
  workSetTargetMax,
  suggestedLoad,
  suggestedReps,
  suggestionDisplay,
  restTimer,
  restRemainingSeconds,
  suppressLoadEscalation,
  progressionThrottleInput,
  onAdjustRest,
  onSkipRest,
  onClose,
  onLogSet,
  onEscalationSuggestion,
  onUpdateLoad,
  onUndo,
  onEditSet,
  onDeleteSet,
}: {
  exercise: WorkoutExerciseLog;
  metadata?: Exercise | null;
  exerciseIndex: number;
  sessionKind?: WorkoutSession["sessionKind"];
  setNumber: number;
  visible: boolean;
  productiveSetGuidance: { softCapReached: boolean; softCapText?: string; targetText: string } | null;
  initialSetType: SetLog["type"];
  initialEditSetId?: string | null;
  hasNextWorkSet?: boolean;
  workSetTargetMax?: number;
  suggestedLoad?: number | null;
  suggestedReps?: number | null;
  suggestionDisplay?: string | null;
  restTimer: { exerciseId: string; exerciseName: string; setNumber: number; reason: string } | null;
  restRemainingSeconds: number;
  suppressLoadEscalation?: boolean;
  progressionThrottleInput?: Omit<ProgressionThrottleInput, "progressionEarned" | "targetRepRange" | "recentExercisePerformance">;
  onAdjustRest(deltaSeconds: number): void;
  onSkipRest(): void;
  onClose(): void;
  onLogSet(index: number, reps: number, type?: SetLog["type"], loadOverride?: number): void;
  onEscalationSuggestion(suggestion: {
    exerciseIndex: number;
    currentLoad: number;
    suggestedLoad: number;
    message: string;
  }): void;
  onUpdateLoad(index: number, load: number): void;
  onUndo(index: number): void;
  onEditSet(index: number, setId: string, edit: { load: number; reps: number; type: SetLog["type"] }): WorkoutExerciseLog | null;
  onDeleteSet(index: number, setId: string): WorkoutExerciseLog | null;
}) {
  const [displayExercise, setDisplayExercise] = useState(exercise);
  const [mode, setMode] = useState<SetLog["type"]>(initialSetType);
  const [repsInput, setRepsInput] = useState(suggestedReps != null ? String(suggestedReps) : "");
  const [loadInputValue, setLoadInputValue] = useState(suggestedLoad != null ? String(suggestedLoad) : displayExercise.loadKnown === false ? "" : String(displayExercise.load));
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editLoadInput, setEditLoadInput] = useState("");
  const [editRepsInput, setEditRepsInput] = useState("");
  const [editType, setEditType] = useState<SetLog["type"]>("work");
  const unit = displayExercise.settings.unit;
  const measurementType = getExerciseMeasurementType(displayExercise.settings);
  const metricLabel = metricInputLabel(measurementType);
  const workSets = useMemo(() => getWorkSets(displayExercise.sets), [displayExercise.sets]);
  const warmupSets = useMemo(() => getWarmupSets(displayExercise.sets), [displayExercise.sets]);
  const isReadOnly = displayExercise.status !== "active";
  const hasUsableLoad = displayExercise.loadKnown !== false || Number.isFinite(Number.parseFloat(loadInputValue));
  const parsedReps = Number.parseInt(repsInput, 10);
  const executionTarget = resolveTrainExecutionTarget({
    sessionKind,
    exercise: displayExercise,
    workSetIndex: Math.max(0, setNumber - 1),
  });
  const plannedWorkTargetMissing = initialSetType === "work" && executionTarget.source === "planned_target_missing";
  const canLog = !isReadOnly && hasUsableLoad && Number.isInteger(parsedReps) && parsedReps >= 0 && !plannedWorkTargetMissing;
  const restApplies = restTimer?.exerciseId === displayExercise.id;
  const drawerIdentity = `${exercise.id}:${setNumber}:${initialSetType}:${suggestedLoad ?? "none"}:${suggestedReps ?? "none"}:${initialEditSetId ?? "none"}:${exercise.loadKnown === false ? "unknown" : "known"}`;
  const inputAccessoryViewID = `performance-drawer-keyboard-${displayExercise.id}`;

  useEffect(() => {
    setDisplayExercise(exercise);
  }, [exercise]);

  useEffect(() => {
    setMode(initialSetType);
    setDisplayExercise(exercise);
    setLoadInputValue(suggestedLoad != null ? String(suggestedLoad) : exercise.loadKnown === false ? "" : String(exercise.load));
    setRepsInput(suggestedReps != null ? String(suggestedReps) : "");
    if (initialEditSetId) {
      const selectedSet = exercise.sets.find((set) => set.id === initialEditSetId);
      if (selectedSet) {
        setEditingSetId(selectedSet.id);
        setEditLoadInput(String(selectedSet.load));
        setEditRepsInput(String(selectedSet.reps));
        setEditType(selectedSet.type ?? "work");
      }
      return;
    }
    setEditingSetId(null);
  }, [drawerIdentity]);

  const commitLoad = (updateWorkingLoad: boolean) => {
    const nextLoad = Number.parseFloat(loadInputValue);
    if (!Number.isFinite(nextLoad)) {
      setLoadInputValue(displayExercise.loadKnown === false ? "" : String(displayExercise.load));
      return null;
    }
    const roundedLoad = Number(nextLoad.toFixed(2));
    if (updateWorkingLoad) {
      onUpdateLoad(exerciseIndex, roundedLoad);
    }
    return roundedLoad;
  };

  const adjustLoad = (delta: number) => {
    const currentLoad = Number.parseFloat(loadInputValue);
    const baseLoad = Number.isFinite(currentLoad) ? currentLoad : displayExercise.loadKnown === false ? 0 : displayExercise.load;
    const nextLoad = Math.max(0, Number((baseLoad + delta).toFixed(2)));
    setLoadInputValue(String(nextLoad));
    if (mode === "work") {
      onUpdateLoad(exerciseIndex, nextLoad);
    }
  };

  const logReps = (value: number) => {
    if (isReadOnly || !hasUsableLoad) return;
    const committedLoad = commitLoad(mode === "work");
    if (committedLoad == null) return;
    const sameTypeSets = displayExercise.sets.filter((set) => (set.type ?? "work") === mode);
    const nextSet: SetLog = {
      id: "pending-set",
      setNumber: sameTypeSets.length + 1,
      reps: value,
      load: committedLoad,
      loggedAt: new Date().toISOString(),
      type: mode,
    };
    const hasFutureWorkSet = hasFutureUncompletedWorkSetAfterLog(workSets.length, workSetTargetMax ?? workSets.length + (hasNextWorkSet ? 2 : 1));
    const nextSuggestion =
      mode === "work" && hasFutureWorkSet && !suppressLoadEscalation
        ? getDeloadAwareInSessionLoadIncreaseSuggestion({
            sets: [...displayExercise.sets, nextSet],
            settings: displayExercise.settings,
            currentLoad: committedLoad,
            suppressEscalation: suppressLoadEscalation,
            throttleInput: {
              ...progressionThrottleInput,
              trainingLane: displayExercise.settings.trainingLane,
              recentExercisePerformance: summarizeWorkoutHistory(workoutSessionRepository.list())
                .flatMap((summary) => summary.exerciseSummaries)
                .filter((summary) => summary.exerciseId === displayExercise.exerciseId),
            },
          })
        : null;
    onLogSet(exerciseIndex, value, mode, committedLoad);
    setRepsInput("");
    if (nextSuggestion?.shouldSuggest) {
      onEscalationSuggestion({
        exerciseIndex,
        currentLoad: nextSuggestion.currentLoad,
        suggestedLoad: nextSuggestion.suggestedLoad,
        message: nextSuggestion.message,
      });
    }
  };

  const beginEditSet = (set: SetLog) => {
    setEditingSetId(set.id);
    setEditLoadInput(String(set.load));
    setEditRepsInput(String(set.reps));
    setEditType(set.type ?? "work");
  };

  const saveEditedSet = () => {
    const load = Number.parseFloat(editLoadInput);
    const reps = Number.parseInt(editRepsInput, 10);
    if (!editingSetId || !Number.isFinite(load) || !Number.isInteger(reps) || reps < 0) return;
    const updatedExercise = onEditSet(exerciseIndex, editingSetId, { load, reps, type: editType });
    if (updatedExercise) {
      setDisplayExercise(updatedExercise);
      const savedSet = updatedExercise.sets.find((set) => set.id === editingSetId);
      if (savedSet) {
        setEditLoadInput(String(savedSet.load));
        setEditRepsInput(String(savedSet.reps));
        setEditType(savedSet.type ?? "work");
      }
      Keyboard.dismiss();
      setEditingSetId(null);
      onClose();
    }
  };

  const deleteEditedSet = () => {
    if (!editingSetId) return;
    Alert.alert("Delete set?", "Remove this set from the current workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedExercise = onDeleteSet(exerciseIndex, editingSetId);
          if (updatedExercise) {
            setDisplayExercise(updatedExercise);
            Keyboard.dismiss();
            setEditingSetId(null);
            onClose();
          }
        },
      },
    ]);
  };

  const trainingGapNote = getTrainingGapNote(displayExercise.notes);
  const calibrationLoad = isCalibrationLoadExercise(displayExercise);
  const loadHelperText =
    calibrationLoad
      ? null
      : trainingGapNote ??
        (displayExercise.loadKnown === false
          ? "Use percentages as effort guidance until Adaptive Strength Coach has your actual load history."
          : displayExercise.notes?.includes("Estimated from similar exercises")
            ? "Estimated from similar exercises. Adjust during warm-ups."
            : null);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={spacing.md} style={performanceDrawerBackdropStyle}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View entering={FadeInUp.duration(160)} style={performanceDrawerStyle}>
          <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={performanceDrawerContentStyle}
          >
            <Pressable accessible={false} onPress={Keyboard.dismiss} style={{ gap: spacing.md }}>
              {editingSetId ? (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                        Edit Set
                      </Text>
                      <Text selectable style={{ color: colors.textMuted, fontSize: 15, lineHeight: 20, fontWeight: "800" }}>
                        {displayExercise.exerciseName}
                      </Text>
                    </View>
                    <Pressable onPress={onClose} style={drawerCloseStyle}>
                      <Text style={{ color: colors.text, fontWeight: "900" }}>Close</Text>
                    </Pressable>
                  </View>

                  <View style={{ flexDirection: "row", gap: spacing.xs, padding: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, alignSelf: "flex-start" }}>
                    <ModeButton label="Warm-up" active={editType === "warmup"} onPress={() => setEditType("warmup")} />
                    <ModeButton label="Work" active={editType === "work"} onPress={() => setEditType("work")} />
                  </View>

                  <View style={drawerInputGridStyle}>
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                        Load
                      </Text>
                      <View style={inlineUnitInputStyle}>
                        <TextInput
                          accessibilityLabel="Edit set load"
                          blurOnSubmit
                          inputAccessoryViewID={inputAccessoryViewID}
                          keyboardType="decimal-pad"
                          onChangeText={(value) => setEditLoadInput(value.replace(/[^0-9.]/g, ""))}
                          onSubmitEditing={Keyboard.dismiss}
                          placeholder="Load"
                          placeholderTextColor={colors.textSubtle}
                          returnKeyType="done"
                          value={editLoadInput}
                          style={overviewLoadInputInlineStyle}
                        />
                        <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>
                          {unit}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                        {metricLabel}
                      </Text>
                      <TextInput
                        accessibilityLabel={`Edit set ${measurementType === "duration" ? "seconds" : "reps"}`}
                        blurOnSubmit
                        inputAccessoryViewID={inputAccessoryViewID}
                        keyboardType="number-pad"
                        maxLength={3}
                        onChangeText={(value) => setEditRepsInput(value.replace(/[^0-9]/g, ""))}
                        onSubmitEditing={Keyboard.dismiss}
                        placeholder={metricLabel}
                        placeholderTextColor={colors.textSubtle}
                        returnKeyType="done"
                        value={editRepsInput}
                        style={overviewRepInputStyle}
                      />
                    </View>
                  </View>

                  <View style={{ gap: spacing.sm }}>
                    <PrimaryButton label="Save Changes" onPress={saveEditedSet} compact />
                    <SecondaryButton label="Delete Set" onPress={deleteEditedSet} compact />
                    <SecondaryButton
                      label="Cancel"
                      onPress={() => {
                        Keyboard.dismiss();
                        setEditingSetId(null);
                        onClose();
                      }}
                      compact
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
                    <View style={{ flex: 1, gap: spacing.xs }}>
                      <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                        Set {setNumber} performance
                      </Text>
                      <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 26, fontWeight: "900" }}>
                        {displayExercise.exerciseName}
                      </Text>
                    </View>
                    <Pressable onPress={onClose} style={drawerCloseStyle}>
                      <Text style={{ color: colors.text, fontWeight: "900" }}>Close</Text>
                    </Pressable>
                  </View>

                  {restApplies ? (
                    <RestTimerPanel
                      compact
                      exerciseName={restTimer.exerciseName}
                      setNumber={restTimer.setNumber}
                      remainingSeconds={restRemainingSeconds}
                      reason={restTimer.reason}
                      onAdjust={onAdjustRest}
                      onSkip={onSkipRest}
                    />
                  ) : null}

                  {displayExercise.status === "shutdown" ? (
                    <View style={{ gap: spacing.sm }}>
                      <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }}>
                        Exercise complete.
                      </Text>
                      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                        Performance dropped enough. Move on, or undo the last set if it was a mistake.
                      </Text>
                    </View>
                  ) : null}

                  {!isReadOnly ? (
                    <>
                      <View style={{ flexDirection: "row", gap: spacing.xs, padding: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, alignSelf: "flex-start" }}>
                        <ModeButton label="Warm-up" active={mode === "warmup"} onPress={() => setMode("warmup")} />
                        <ModeButton label="Work" active={mode === "work"} onPress={() => setMode("work")} />
                      </View>

                      <View style={drawerInputGridStyle}>
                        <View style={{ flex: 1, gap: spacing.xs }}>
                          <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                            Load
                          </Text>
                          <View style={inlineUnitInputStyle}>
                            <TextInput
                              blurOnSubmit
                              inputAccessoryViewID={inputAccessoryViewID}
                              keyboardType="decimal-pad"
                              onBlur={() => commitLoad(mode === "work")}
                              onChangeText={(value) => setLoadInputValue(value.replace(/[^0-9.]/g, ""))}
                              onSubmitEditing={() => {
                                commitLoad(mode === "work");
                                Keyboard.dismiss();
                              }}
                              placeholder={displayExercise.loadKnown === false ? "Load" : undefined}
                              placeholderTextColor={colors.textSubtle}
                              returnKeyType="done"
                              value={loadInputValue}
                              style={overviewLoadInputInlineStyle}
                            />
                            <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>
                              {unit}
                            </Text>
                          </View>
                        </View>
                        <View style={{ flex: 1, gap: spacing.xs }}>
                          <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                            {metricLabel}
                          </Text>
                          <TextInput
                            blurOnSubmit
                            inputAccessoryViewID={inputAccessoryViewID}
                            keyboardType="number-pad"
                            maxLength={3}
                            onChangeText={(value) => setRepsInput(value.replace(/[^0-9]/g, ""))}
                            onSubmitEditing={Keyboard.dismiss}
                            placeholder={metricLabel}
                            placeholderTextColor={colors.textSubtle}
                            returnKeyType="done"
                            value={repsInput}
                            style={overviewRepInputStyle}
                          />
                        </View>
                      </View>

                      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                        {sessionKind === "planned" && executionTarget.source === "planned_target_missing"
                          ? "Exact target unavailable. Restore a compatible prescription before logging this planned set."
                          : displayExercise.prescribedSetTargets?.length
                            ? `Today: ${displayExercise.load}${displayExercise.settings.unit} × ${displayExercise.prescribedSetTargets.join(", ")}. Exact targets are today’s progression opportunity.`
                            : `Calibration boundary: ${formatTargetRange(displayExercise.settings.repRange, measurementType)}`}
                      </Text>

                      {suggestionDisplay || loadHelperText ? (
                        <Text selectable style={{ ...type.body, color: suggestionDisplay ? colors.accent : colors.textMuted }}>
                          {suggestionDisplay ?? loadHelperText}
                        </Text>
                      ) : null}

                      {displayExercise.sets.length > 0 ? (
                        <DetailToggle label="Set history" compact>
                          <EditableSetGroup title="Warm-up Sets" empty="No warm-ups logged." sets={warmupSets} unit={unit} exercise={displayExercise} metadata={metadata} onEdit={beginEditSet} />
                          <EditableSetGroup title="Work Sets" empty="No work sets yet." sets={workSets} unit={unit} exercise={displayExercise} metadata={metadata} onEdit={beginEditSet} />
                        </DetailToggle>
                      ) : null}

                      <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "stretch" }}>
                        <View style={{ flex: 1 }}>
                          <PrimaryButton label="Log set" onPress={() => logReps(parsedReps)} disabled={!canLog} compact />
                        </View>
                        <SecondaryButton label="Cancel" onPress={onClose} compact />
                      </View>
                    </>
                  ) : null}

                  {productiveSetGuidance?.softCapReached ? (
                    <View style={inlineCoachNoteStyle}>
                      <Text selectable style={{ color: colors.accent, fontWeight: "900" }}>
                        Move on?
                      </Text>
                      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                        {productiveSetGuidance.softCapText}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </Pressable>
          </ScrollView>
        </Animated.View>
        {Platform.OS === "ios" ? (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={keyboardAccessoryStyle}>
              <Pressable onPress={Keyboard.dismiss} style={keyboardAccessoryButtonStyle}>
                <Text style={{ color: colors.background, fontWeight: "900" }}>Done</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PrepInlineAction({
  routineName,
  status,
  primaryAction,
  showSkip,
  onStartOrView,
  onSkip,
}: {
  routineName: string;
  status: "not_started" | "completed" | "skipped";
  primaryAction: "start" | "view";
  showSkip: boolean;
  onStartOrView(): void;
  onSkip(): void;
}) {
  const statusLabel = status === "completed" ? "Completed" : status === "skipped" ? "Skipped" : "Optional";

  return (
    <Animated.View entering={FadeInUp.duration(180)} style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
        Prep: {statusLabel}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={primaryAction === "start" ? `Start ${routineName}` : "View prep"} onPress={onStartOrView}>
        <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
          {primaryAction === "start" ? `Start ${routineName}` : "View"}
        </Text>
      </Pressable>
      {showSkip ? (
        <>
          <Text selectable style={{ color: colors.textSubtle, fontSize: 13 }}>·</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Skip prep" onPress={onSkip}>
            <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
              Skip
            </Text>
          </Pressable>
        </>
      ) : null}
    </Animated.View>
  );
}

function AddExercisePicker({
  visible,
  pendingExercise,
  recommended,
  allExercises,
  currentExercises,
  position,
  onPositionChange,
  onClose,
  onSelect,
  onCreateExercise,
  onCancelPending,
  onConfirmPending,
}: {
  visible: boolean;
  pendingExercise: Exercise | null;
  recommended: Exercise[];
  allExercises: Exercise[];
  currentExercises: WorkoutExerciseLog[];
  position: "after_current" | "end";
  onPositionChange(position: "after_current" | "end"): void;
  onClose(): void;
  onSelect(exercise: Exercise): void;
  onCreateExercise(exercise: Exercise): void;
  onCancelPending(): void;
  onConfirmPending(): void;
}) {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const currentExerciseIds = useMemo(() => new Set(currentExercises.map((exercise) => exercise.exerciseId)), [currentExercises]);
  const searchableExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const candidates = allExercises.filter((candidate) => !currentExerciseIds.has(candidate.id));
    if (!normalizedQuery) return candidates.slice(0, 24);
    return candidates
      .filter((candidate) => {
        const haystack = [candidate.name, candidate.family.replaceAll("_", " "), candidate.role.replaceAll("_", " "), candidate.primaryMuscles.join(" "), candidate.equipment.join(" "), candidate.swapTags.join(" "), candidate.notes.join(" ")]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 40);
  }, [allExercises, currentExerciseIds, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={performanceDrawerBackdropStyle}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View entering={FadeInUp.duration(160)} style={swapPickerSheetStyle}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Add Exercise
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: "900" }}>
                  Choose an exercise
                </Text>
                <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
                  Adds to this workout only. Your programme stays clean.
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close add exercise picker" onPress={onClose} style={drawerCloseStyle}>
                <Text style={{ color: colors.text, fontWeight: "900" }}>Close</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", gap: spacing.sm, padding: 3, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
              <ModeButton label="After current" active={position === "after_current"} onPress={() => onPositionChange("after_current")} />
              <ModeButton label="End" active={position === "end"} onPress={() => onPositionChange("end")} />
            </View>

            {pendingExercise ? (
              <View style={swapConfirmationInlineStyle}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Add Exercise
                </Text>
                <Text selectable numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.84} style={{ color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "900", flexShrink: 1 }}>
                  Add {pendingExercise.name}?
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  This affects today's workout only. Load guidance will use exact history, a same-family estimate, or unknown-load percentages.
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <SecondaryButton label="Cancel" onPress={onCancelPending} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton label="Add" onPress={onConfirmPending} />
                  </View>
                </View>
              </View>
            ) : null}

            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Recommended
              </Text>
              {recommended.length === 0 ? (
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  No obvious gaps found. Search the full library below.
                </Text>
              ) : (
                recommended.map((candidate) => (
                  <SwapCandidateRow key={candidate.id} exercise={candidate} reason="Recommended from today's session balance." onSelect={() => onSelect(candidate)} />
                ))
              )}
            </View>

            <View style={{ gap: spacing.md }}>
              <SecondaryButton label={showCreate ? "Hide create new exercise" : "Create new exercise"} onPress={() => setShowCreate((value) => !value)} />
              {showCreate ? <CreateSwapExerciseForm onCreate={onCreateExercise} /> : null}
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Search Library
              </Text>
              <TextInput
                accessibilityLabel="Search all exercises"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="Search all exercises"
                placeholderTextColor={colors.textSubtle}
                value={query}
                style={swapSearchInputStyle}
              />
              {searchableExercises.map((candidate) => (
                <SwapCandidateRow key={candidate.id} exercise={candidate} onSelect={() => onSelect(candidate)} />
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SwapExercisePicker({
  visible,
  exercise,
  recommended,
  allExercises,
  onClose,
  onSelect,
  onCreateExercise,
}: {
  visible: boolean;
  exercise: WorkoutExerciseLog;
  recommended: Exercise[];
  allExercises: Exercise[];
  onClose(): void;
  onSelect(exercise: Exercise): void;
  onCreateExercise(exercise: Exercise): void;
}) {
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const searchableExercises = useMemo(() => {
    if (!normalizedQuery) return allExercises.filter((candidate) => candidate.id !== exercise.exerciseId).slice(0, 24);
    return allExercises
      .filter((candidate) => {
        if (candidate.id === exercise.exerciseId) return false;
        const haystack = [candidate.name, candidate.family.replaceAll("_", " "), candidate.role.replaceAll("_", " "), candidate.primaryMuscles.join(" "), candidate.equipment.join(" "), candidate.swapTags.join(" "), candidate.notes.join(" ")]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 40);
  }, [allExercises, exercise.exerciseId, normalizedQuery]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={performanceDrawerBackdropStyle}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View entering={FadeInUp.duration(160)} style={swapPickerSheetStyle}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Swap Exercise
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: "900" }}>
                  Choose a replacement
                </Text>
                <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 20 }}>
                  Choose a replacement for {exercise.exerciseName}.
                </Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close swap picker" onPress={onClose} style={drawerCloseStyle}>
                <Text style={{ color: colors.text, fontWeight: "900" }}>Close</Text>
              </Pressable>
            </View>

            <View style={{ gap: spacing.md }}>
              <SecondaryButton label={showCreate ? "Hide create new exercise" : "Create new exercise"} onPress={() => setShowCreate((value) => !value)} />
              {showCreate ? <CreateSwapExerciseForm onCreate={onCreateExercise} /> : null}
              <TextInput
                accessibilityLabel="Search all exercises"
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="Search all exercises"
                placeholderTextColor={colors.textSubtle}
                value={query}
                style={swapSearchInputStyle}
              />
            </View>

            {isSearching ? (
              <View style={{ gap: spacing.sm }}>
                <Text selectable style={{ ...type.section, color: colors.text }}>
                  Search Results
                </Text>
                {searchableExercises.length === 0 ? (
                  <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                    No exercises found. Try another search or create a new exercise above.
                  </Text>
                ) : (
                  searchableExercises.map((candidate) => (
                    <SwapCandidateRow key={candidate.id} exercise={candidate} onSelect={() => onSelect(candidate)} />
                  ))
                )}
              </View>
            ) : (
              <>
                <View style={{ gap: spacing.sm }}>
                  <Text selectable style={{ ...type.section, color: colors.text }}>
                    Recommended
                  </Text>
                  {recommended.length === 0 ? (
                    <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                      No close matches found. Search the full library above.
                    </Text>
                  ) : (
                    recommended.map((candidate) => (
                      <SwapCandidateRow key={candidate.id} exercise={candidate} reason="Same family or role first." onSelect={() => onSelect(candidate)} />
                    ))
                  )}
                </View>

                <View style={{ gap: spacing.sm }}>
                  <Text selectable style={{ ...type.section, color: colors.text }}>
                    Browse Library
                  </Text>
                  {searchableExercises.map((candidate) => (
                    <SwapCandidateRow key={candidate.id} exercise={candidate} onSelect={() => onSelect(candidate)} />
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SwapCandidateRow({ exercise, reason, onSelect }: { exercise: Exercise; reason?: string; onSelect(): void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Select ${exercise.name}`} onPress={onSelect}>
      <View style={compactExerciseRowStyle}>
        <View style={{ flex: 1, flexShrink: 1, minWidth: 0, gap: spacing.xs }}>
          <Text selectable numberOfLines={2} ellipsizeMode="tail" style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900", flexShrink: 1 }}>
            {exercise.name}
          </Text>
          <Text selectable numberOfLines={2} ellipsizeMode="tail" style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16, flexShrink: 1 }}>
            {exercise.primaryMuscles.join(", ")} · {exercise.family.replaceAll("_", " ")} · {exercise.equipment.join(", ")}
          </Text>
          {reason ? (
            <DetailToggle label="Why?" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>
                {reason}
              </Text>
            </DetailToggle>
          ) : null}
        </View>
        <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={{ color: colors.accent, fontWeight: "900" }}>
          Select
        </Text>
      </View>
    </Pressable>
  );
}

function CreateSwapExerciseForm({ onCreate }: { onCreate(exercise: Exercise): void }) {
  const [name, setName] = useState("");
  const [equipment, setEquipment] = useState<Equipment>("machine");
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>("chest");
  const canCreate = name.trim().length >= 2;
  return (
    <View style={createExerciseFormStyle}>
      <Text selectable style={{ ...type.label, color: colors.accent }}>
        Create New Exercise
      </Text>
      <TextInput accessibilityLabel="New exercise name" onChangeText={setName} placeholder="Exercise name" placeholderTextColor={colors.textSubtle} value={name} style={swapSearchInputStyle} />
      <OptionPills label="Equipment" options={customEquipmentOptions} value={equipment} onChange={(value) => setEquipment(value)} />
      <OptionPills label="Target muscle" options={customMuscleOptions} value={targetMuscle} onChange={(value) => setTargetMuscle(value)} />
      <PrimaryButton
        label="Save and select"
        disabled={!canCreate}
        onPress={() => {
          if (!canCreate) return;
          onCreate(createWorkoutSwapCustomExercise(name, equipment, targetMuscle));
        }}
      />
    </View>
  );
}

function OptionPills<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange(value: T): void }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {options.map((option) => (
          <Pressable key={option} accessibilityRole="button" accessibilityLabel={`${label}: ${option}`} onPress={() => onChange(option)} style={({ pressed }) => optionPillStyle(pressed, option === value)}>
            <Text style={{ color: option === value ? colors.background : colors.text, fontSize: 12, fontWeight: "900" }}>
              {option.replaceAll("_", " ")}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const customEquipmentOptions = ["machine", "cable", "dumbbell", "barbell", "bodyweight", "other"] as const;
const customMuscleOptions = ["chest", "back", "quads", "hamstrings", "glutes", "shoulders", "biceps", "triceps", "calves", "abs"] as const;

function createWorkoutSwapCustomExercise(name: string, equipment: Equipment, targetMuscle: MuscleGroup): Exercise {
  const family = familyForCustomExercise(targetMuscle);
  const defaultRepRange = { min: 10, max: 15 };
  const loadIncrease = equipment === "bodyweight" ? 0 : equipment === "machine" || equipment === "cable" ? 5 : 2.5;
  return {
    id: `custom-swap-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
    category: targetMuscle,
    primaryMuscles: [targetMuscle],
    secondaryMuscles: [],
    equipment: [equipment],
    movementPattern: "isolation",
    defaultRepRange,
    defaultLoadJump: loadIncrease,
    unitCompatibility: ["kg", "lb"],
    kind: equipment === "bands" ? "other" : equipment,
    role: "isolation",
    roles: ["isolation"],
    family,
    tier: "C",
    fatigueCost: "low",
    jointStress: "low",
    suitability: ["beginner", "intermediate", "advanced"],
    isBeginnerFriendly: true,
    isAdvanced: false,
    notes: ["Created during a workout swap."],
    suitableBlocks: ["hypertrophy", "powerbuilding", "strength_hypertrophy", "strength", "power", "peak", "deload"],
    swapTags: [targetMuscle, equipment, family, "custom"],
    createdByUserId: null,
    isCustom: true,
    defaultSettings: {
      repRange: defaultRepRange,
      dropOffPercent: 18,
      loadIncrease,
      unit: "kg",
      requiredWorkSets: 3,
    },
  };
}

function buildRecommendedAddExerciseOptions(
  availableExercises: Exercise[],
  currentExercises: WorkoutExerciseLog[],
  exercisePreferences?: Record<string, ExercisePreferenceRecord>,
): Exercise[] {
  const currentExerciseIds = new Set(currentExercises.map((exercise) => exercise.exerciseId));
  const currentMuscles = new Set(currentExercises.flatMap((exercise) => exercise.exerciseName.toLowerCase().split(/\s+/)));
  const currentMetadata = currentExercises
    .map((exercise) => availableExercises.find((candidate) => candidate.id === exercise.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
  const usedFamilies = new Set(currentMetadata.map((exercise) => exercise.family));
  const usedPrimaryMuscles = new Set(currentMetadata.flatMap((exercise) => exercise.primaryMuscles));

  return availableExercises
    .filter((candidate) => !currentExerciseIds.has(candidate.id))
    .sort(
      (a, b) =>
        scoreAddExerciseCandidate(b, usedFamilies, usedPrimaryMuscles, currentMuscles, exercisePreferences) -
        scoreAddExerciseCandidate(a, usedFamilies, usedPrimaryMuscles, currentMuscles, exercisePreferences),
    )
    .slice(0, 8);
}

function scoreAddExerciseCandidate(
  candidate: Exercise,
  usedFamilies: Set<Exercise["family"]>,
  usedPrimaryMuscles: Set<MuscleGroup>,
  currentNameTokens: Set<string>,
  exercisePreferences?: Record<string, ExercisePreferenceRecord>,
): number {
  let score = 0;
  if (!usedFamilies.has(candidate.family)) score += 4;
  if (candidate.primaryMuscles.some((muscle) => !usedPrimaryMuscles.has(muscle))) score += 3;
  if (candidate.role === "accessory" || candidate.role === "isolation" || candidate.role === "corrective") score += 2;
  if (candidate.tier === "C") score += 1;
  if (candidate.name.toLowerCase().split(/\s+/).some((token) => currentNameTokens.has(token))) score -= 1;
  score += scoreExercisePreference(candidate, exercisePreferences);
  return score;
}

function familyForCustomExercise(category: MuscleGroup): Exercise["family"] {
  if (category === "chest") return "chest_isolation";
  if (category === "back") return "horizontal_pull";
  if (category === "shoulders") return "shoulder_isolation";
  if (category === "rear_delts") return "rear_delt_corrective";
  if (category === "biceps") return "biceps_isolation";
  if (category === "triceps") return "triceps_isolation";
  if (category === "quads") return "quad_isolation";
  if (category === "hamstrings") return "hamstring_isolation";
  if (category === "glutes") return "glute_isolation";
  if (category === "calves") return "calf_raise";
  if (category === "abs") return "core_flexion";
  if (category === "forearms") return "forearm";
  if (category === "traps") return "trap";
  if (category === "adductors") return "adductor";
  if (category === "abductors") return "abductor";
  return "other";
}

function overviewExerciseRoleLabel(index: number, added: boolean, swapped: boolean): string {
  if (added) return "Added today";
  if (swapped) return "Swapped in";
  if (index === 0) return "Main lift";
  if (index === 1) return "Support lift";
  return "Accessory";
}

function ShutdownCoach({
  exerciseName,
  nextLoad,
  recommendation,
  shouldIncreaseLoad,
  unit,
  nextExerciseName,
}: {
  exerciseName: string;
  nextLoad: number;
  recommendation: string;
  shouldIncreaseLoad: boolean;
  unit: UnitSystem;
  nextExerciseName?: string;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(220)} style={{ gap: spacing.md }}>
      <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
        Stop {exerciseName}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 34, lineHeight: 38, fontWeight: "900" }}>
        Exercise complete.
      </Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        Performance dropped enough. You have accumulated enough useful work.
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "900" }}>
        {shouldIncreaseLoad ? "Recommended next load" : "Next time"}: {formatLoadDisplaySafe(nextLoad, unit)}
      </Text>
      <DetailToggle compact>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {recommendation}
        </Text>
      </DetailToggle>
      {nextExerciseName ? (
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Move to {nextExerciseName}.
        </Text>
      ) : null}
    </Animated.View>
  );
}

function ProgressionRecommendation({
  shouldIncreaseLoad,
  shouldShutdown,
  nextLoad,
  unit,
  recommendation,
}: {
  shouldIncreaseLoad: boolean;
  shouldShutdown: boolean;
  nextLoad: number;
  unit: UnitSystem;
  recommendation: string;
}) {
  const title = shouldShutdown ? "Stop here" : shouldIncreaseLoad ? "Load increase earned" : "Keep the load";
  const coachLine = shouldShutdown
    ? "The productive dose is complete."
    : shouldIncreaseLoad
      ? "You reached the top of the range while staying productive."
      : "Stay with this load and beat the reps next time.";

  return (
    <Animated.View entering={FadeInUp.duration(180)} style={progressionPanelStyle(shouldIncreaseLoad, shouldShutdown)}>
      <Text selectable style={{ ...type.label, color: shouldIncreaseLoad ? colors.success : shouldShutdown ? colors.accent : colors.textMuted }}>
        {title}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "900" }}>
        Next recommendation: {formatLoadDisplaySafe(nextLoad, unit)}
      </Text>
      <Text selectable style={{ ...type.body, color: colors.text }}>
        {coachLine}
      </Text>
      <DetailToggle compact>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {recommendation}
        </Text>
      </DetailToggle>
    </Animated.View>
  );
}

function RestTimerPanel({
  exerciseName,
  setNumber,
  remainingSeconds,
  reason,
  compact = false,
  onAdjust,
  onSkip,
}: {
  exerciseName: string;
  setNumber: number;
  remainingSeconds: number;
  reason: string;
  compact?: boolean;
  onAdjust(deltaSeconds: number): void;
  onSkip(): void;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(180)} style={restTimerStyle(compact)}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.accent }}>
            Rest after set {setNumber}
          </Text>
          <Text selectable style={{ color: colors.text, fontSize: compact ? 26 : 34, lineHeight: compact ? 30 : 38, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
            {formatRestTime(remainingSeconds)}
          </Text>
          <Text selectable numberOfLines={compact ? 1 : 2} style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {exerciseName} · {reason}
          </Text>
        </View>
        <SecondaryButton label="Skip rest" onPress={onSkip} />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <SecondaryButton label="-15s" onPress={() => onAdjust(-15)} />
        <SecondaryButton label="+15s" onPress={() => onAdjust(15)} />
      </View>
    </Animated.View>
  );
}

function WorkoutRestTimerStrip({
  expanded,
  remainingSeconds,
  onAdjust,
  onSkip,
  onToggle,
}: {
  expanded: boolean;
  remainingSeconds: number;
  onAdjust(deltaSeconds: number): void;
  onSkip(): void;
  onToggle(): void;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(160)} style={workoutRestTimerRegionStyle}>
      <View style={workoutRestTimerStripStyle(expanded)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Workout rest timer" onPress={onToggle} style={workoutRestTimerHeaderStyle}>
          <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
            ⏱ Rest: {formatRestTime(remainingSeconds)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "900" }}>
            {expanded ? "Hide" : "Controls"}
          </Text>
        </Pressable>
        {expanded ? (
          <View style={workoutRestTimerControlsStyle}>
            <RestTimerControlButton label="-15s" onPress={() => onAdjust(-15)} />
            <RestTimerControlButton label="+15s" onPress={() => onAdjust(15)} />
            <RestTimerControlButton label="Skip" onPress={onSkip} emphasis />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

function RestTimerControlButton({ label, onPress, emphasis = false }: { label: string; onPress(): void; emphasis?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => restTimerControlButtonStyle(pressed, emphasis)}>
      <Text style={restTimerControlButtonTextStyle(emphasis)}>{label}</Text>
    </Pressable>
  );
}

function BigMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 32, lineHeight: 36, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function CockpitMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: "30%", minWidth: 96, gap: 3 }}>
      <Text selectable numberOfLines={1} style={{ color: colors.textSubtle, fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={{ color: colors.text, fontSize: 20, lineHeight: 24, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function WorkoutHeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text selectable numberOfLines={1} style={{ color: colors.textSubtle, fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: colors.text, fontSize: 16, lineHeight: 20, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}

function NextExerciseCard({
  exerciseName,
  loadLabel,
  repLabel,
  setLabel,
  onOpen,
}: {
  exerciseName: string;
  loadLabel: string;
  repLabel: string;
  setLabel: string;
  onOpen(): void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${exerciseName}`} onPress={onOpen} style={({ pressed }) => nextExerciseCardStyle(pressed)}>
      <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
        <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
          Next up
        </Text>
        <Text selectable numberOfLines={2} style={{ color: colors.text, fontSize: 24, lineHeight: 28, fontWeight: "900", letterSpacing: 0 }}>
          {exerciseName}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          <InlineBadge label={loadLabel} />
          <InlineBadge label={repLabel} />
          <InlineBadge label={setLabel} />
        </View>
      </View>
      <Text style={{ color: colors.accent, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>Open</Text>
    </Pressable>
  );
}

function SessionFocus({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.lg }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle, flex: 1 }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontWeight: "900", flex: 1.25, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.sm,
        borderCurve: "continuous",
        backgroundColor: active ? colors.surfaceSoft : "transparent",
      }}
    >
      <Text style={{ color: active ? colors.text : colors.textSubtle, fontSize: 13, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function LoadStepButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => loadStepButtonStyle(pressed)}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function DestructiveButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => destructiveButtonStyle(pressed)}>
      <Text style={{ color: colors.danger, fontWeight: "900", fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

function CompleteWorkoutButton({ ready, onPress }: { ready: boolean; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => completeWorkoutButtonStyle(pressed, ready)}>
      <Text style={{ color: ready ? colors.success : colors.danger, fontWeight: "900", fontSize: 15 }}>Complete Workout</Text>
    </Pressable>
  );
}

function PostWorkoutReviewScreen({
  review,
  decisions,
  onDecision,
  onApproveAll,
  onFinishSelected,
  onKeepCurrentLoads,
  onBack,
}: {
  review: PostWorkoutReviewViewModel;
  decisions: Record<string, PostWorkoutLoadDecision>;
  onDecision(exerciseLogId: string, decision: PostWorkoutLoadDecision): void;
  onApproveAll(answers?: PostWorkoutReviewAnswers): void;
  onFinishSelected(answers?: PostWorkoutReviewAnswers): void;
  onKeepCurrentLoads(answers?: PostWorkoutReviewAnswers): void;
  onBack(): void;
}) {
  const decidedCount = Object.keys(decisions).length;
  const [sharePayload, setSharePayload] = useState<BrandedSharePayload | null>(null);
  const [sessionDifficulty, setSessionDifficulty] = useState<SessionDifficultyFeedback>("moderate");
  const [painStatus, setPainStatus] = useState<PainFeedbackStatus>("none");
  const [completionBlocker, setCompletionBlocker] = useState<UserConstraintReason>("none");
  const [reviewNotes, setReviewNotes] = useState("");
  const reviewAnswers = buildUserPostWorkoutReviewAnswers({
    sessionDifficulty,
    painStatus,
    completionBlocker,
    notes: reviewNotes,
  });
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xxl }}
      >
        <Pressable onPress={onBack} style={backToSessionStyle}>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>Workout</Text>
        </Pressable>

        <View style={{ gap: spacing.sm }}>
          <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
            Workout Review
          </Text>
          <Text selectable style={{ ...type.title, color: colors.text }}>
            {review.headline}
          </Text>
          {review.summary.extraSession ? (
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Extra session. It counts toward history, not planned-week completion.
            </Text>
          ) : null}
        </View>

        <View style={reviewCardStyle("default")}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            {review.summary.workoutName}
          </Text>
          <View style={reviewMetricGridStyle}>
            <Mini label="Duration" value={review.summary.durationMinutes > 0 ? `${review.summary.durationMinutes} min` : "—"} />
            <Mini label="Exercises" value={`${review.summary.exercisesCompleted}/${review.summary.totalExercises}`} />
            <Mini label="Work sets" value={String(review.summary.workSetsCompleted)} />
            <Mini label="Warm-ups" value={String(review.summary.warmupsLogged)} />
          </View>
          {review.summary.completedEarly ? (
            <Text selectable style={{ ...type.body, color: colors.accent }}>
              Completed early.
            </Text>
          ) : null}
          {review.summary.skippedExercises.length > 0 ? (
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Skipped/unfinished: {review.summary.skippedExercises.join(", ")}
            </Text>
          ) : null}
          <SecondaryButton
            label="Share summary"
            onPress={() =>
              setSharePayload(
                buildWorkoutSummarySharePayload({
                  workoutName: review.summary.workoutName,
                  exercisesCompleted: review.summary.exercisesCompleted,
                  workSetsCompleted: review.summary.workSetsCompleted,
                  prCount: review.personalRecords.length,
                  personalRecords: review.personalRecords,
                }),
              )
            }
            compact
          />
        </View>

        <View style={reviewCardStyle("default")}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Coaching feedback
          </Text>
          <ReviewChoiceGroup
            label="How hard did the session feel?"
            options={[
              ["easy", "Easy"],
              ["moderate", "Moderate"],
              ["hard", "Hard"],
              ["grind", "Grind"],
            ]}
            value={sessionDifficulty}
            onChange={(value) => setSessionDifficulty(value as SessionDifficultyFeedback)}
          />
          <ReviewChoiceGroup
            label="Any pain or discomfort?"
            options={[
              ["none", "No"],
              ["discomfort", "Discomfort"],
              ["pain", "Pain"],
            ]}
            value={painStatus}
            onChange={(value) => setPainStatus(value as PainFeedbackStatus)}
          />
          <ReviewChoiceGroup
            label="Did anything stop you completing the plan?"
            options={[
              ["none", "No"],
              ["time", "Time"],
              ["fatigue", "Fatigue"],
              ["equipment", "Equipment"],
              ["pain", "Pain"],
              ["other", "Other"],
            ]}
            value={completionBlocker}
            onChange={(value) => setCompletionBlocker(value as UserConstraintReason)}
          />
          <TextInput
            value={reviewNotes}
            onChangeText={setReviewNotes}
            placeholder="Optional notes"
            placeholderTextColor={colors.textSubtle}
            multiline
            style={postWorkoutNotesInputStyle}
          />
        </View>

        {review.personalRecords.length > 0 ? (
          <View style={reviewCardStyle("success")}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              New PRs
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              New bests from completed work sets. Strong work.
            </Text>
            {review.personalRecords.map((record) => (
              <View key={record.id} style={{ gap: spacing.xs }}>
                <Text selectable style={{ color: colors.success, fontSize: 15, lineHeight: 20, fontWeight: "900" }}>
                  {record.exerciseName}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {formatPersonalRecord(record)}
                </Text>
                <SecondaryButton label="Share PR" onPress={() => setSharePayload(buildPrSharePayload(record))} compact />
              </View>
            ))}
          </View>
        ) : null}

        {review.baselines.length > 0 ? (
          <View style={reviewCardStyle("quiet")}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              New baselines
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              First tracked bests. Useful, but not a victory lap yet.
            </Text>
            {review.baselines.slice(0, 4).map((record) => (
              <Text key={record.id} selectable style={{ ...type.body, color: colors.textMuted }}>
                {record.exerciseName}: {formatPersonalRecord(record)}
              </Text>
            ))}
          </View>
        ) : null}

        {review.progressItems.length > 0 ? (
          <View style={reviewCardStyle("success")}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              Progress
            </Text>
            {review.progressItems.map((item) => (
              <View key={item.id} style={{ gap: spacing.xs }}>
                <Text selectable style={{ color: colors.success, fontSize: 15, lineHeight: 20, fontWeight: "900" }}>
                  {item.title}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {item.detail}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {review.loadChanges.length > 0 ? (
          <View style={reviewCardStyle("default")}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              Next-session loads
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Approve what changes next time. The workout is saved either way.
            </Text>
            {review.loadChanges.map((change) => {
              const decision = decisions[change.exerciseLogId];
              return (
                <View key={change.exerciseLogId} style={loadChangeRowStyle}>
                  <View style={{ gap: spacing.xs }}>
                    <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>
                      {change.exerciseName}
                    </Text>
                    <Text
                      selectable
                      style={{
                        color: change.direction === "increase" ? colors.success : change.direction === "decrease" ? colors.danger : colors.accent,
                        fontSize: 18,
                        lineHeight: 23,
                        fontWeight: "900",
                      }}
                    >
                      {formatReviewLoad(change.currentLoad, change.unit)} → {formatReviewLoad(change.recommendedLoad, change.unit)}
                    </Text>
                    <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                      {change.reason}
                    </Text>
                  </View>
                  <DetailToggle label="Evidence" compact>
                    <View style={{ gap: spacing.xs }}>
                      {change.evidence.map((item) => (
                        <Text key={item} selectable style={{ ...type.body, color: colors.textMuted }}>
                          {item}
                        </Text>
                      ))}
                    </View>
                  </DetailToggle>
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <Pressable
                      onPress={() => onDecision(change.exerciseLogId, "approved")}
                      style={({ pressed }) => reviewChoiceButtonStyle(decision === "approved", pressed, "success")}
                    >
                      <Text style={{ color: decision === "approved" ? colors.success : colors.text, fontSize: 12, fontWeight: "900" }}>
                        {change.direction === "hold" ? "Hold next time" : "Approve for next time"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => onDecision(change.exerciseLogId, "kept")}
                      style={({ pressed }) => reviewChoiceButtonStyle(decision === "kept", pressed, "default")}
                    >
                      <Text style={{ color: decision === "kept" ? colors.accent : colors.text, fontSize: 12, fontWeight: "900" }}>
                        Keep current load
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {review.emptyStateCopy ? (
          <View style={reviewCardStyle("quiet")}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              {review.emptyStateCopy}
            </Text>
            {review.lowHistoryCopy ? (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {review.lowHistoryCopy}
              </Text>
            ) : null}
          </View>
        ) : review.lowHistoryCopy ? (
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {review.lowHistoryCopy}
          </Text>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          {review.loadChanges.length > 0 ? (
            <>
              <PrimaryButton label="Approve all and finish" onPress={() => onApproveAll(reviewAnswers)} />
              {decidedCount > 0 ? <SecondaryButton label="Finish review" onPress={() => onFinishSelected(reviewAnswers)} /> : null}
              <SecondaryButton label="Finish without changes" onPress={() => onKeepCurrentLoads(reviewAnswers)} />
            </>
          ) : (
            <PrimaryButton label="Finish and return Home" onPress={() => onKeepCurrentLoads(reviewAnswers)} />
          )}
        </View>
      </ScrollView>
      <BrandedShareCardPreviewModal payload={sharePayload} onClose={() => setSharePayload(null)} />
    </View>
  );
}

function ReviewChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<[string, string]>;
  value: string;
  onChange(value: string): void;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {options.map(([optionValue, labelText]) => (
          <Pressable
            key={optionValue}
            onPress={() => onChange(optionValue)}
            style={({ pressed }) => reviewChoiceButtonStyle(value === optionValue, pressed, "default")}
          >
            <Text style={{ color: value === optionValue ? colors.accent : colors.text, fontSize: 12, fontWeight: "900" }}>
              {labelText}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function buildUserPostWorkoutReviewAnswers(input: {
  sessionDifficulty: SessionDifficultyFeedback;
  painStatus: PainFeedbackStatus;
  completionBlocker: UserConstraintReason;
  notes: string;
}): PostWorkoutReviewAnswers {
  return {
    session_difficulty: input.sessionDifficulty,
    pain_feedback: { status: input.painStatus },
    completion_reason: input.completionBlocker === "none" ? "completed_as_planned" : "modified",
    user_constraint_reason: input.completionBlocker,
    substitution_feedback: "not_applicable",
    recovery_context: input.completionBlocker === "fatigue" ? "fatigue" : "none",
    user_notes: input.notes.trim() || undefined,
  };
}

function formatReviewLoad(load: number, unit: string): string {
  return `${Number.isInteger(load) ? load : load.toFixed(1)}${unit}`;
}

function formatPersonalRecord(record: PersonalRecordItem): string {
  const prefix = record.status === "baseline" ? "Baseline" : "New best";
  if (record.type === "load") return `${prefix} load: ${formatReviewLoad(record.value, record.unit ?? "kg")}`;
  if (record.type === "rep") {
    const load = record.load != null ? `${formatReviewLoad(record.load, record.unit ?? "kg")} × ` : "";
    const metric = formatMetricValue(record.reps ?? record.value, record.measurementType);
    return `${prefix} ${record.measurementType === "duration" ? "duration" : "reps"}: ${load}${metric}`;
  }
  if (record.type === "volume") return `${prefix} volume: ${formatReviewLoad(record.value, record.unit ?? "kg")}`;
  return `${prefix} estimated strength: ${formatReviewLoad(record.value, record.unit ?? "kg")}`;
}

function InlineBadge({ label }: { label: string }) {
  return (
    <View style={inlineBadgeStyle}>
      <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function SetGroup({
  title,
  empty,
  sets,
  unit,
  exercise,
  metadata,
  minimumAcceptableReps = 0,
}: {
  title: string;
  empty: string;
  sets: SetLog[];
  unit: UnitSystem;
  exercise: WorkoutExerciseLog;
  metadata?: Exercise | null;
  minimumAcceptableReps?: number;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle, textTransform: "uppercase" }}>
        {title}
      </Text>
      {sets.length === 0 ? (
        <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
          {empty}
        </Text>
      ) : (
        sets.map((set) => (
          <WorkoutSetRow
            key={set.id}
            setNumber={set.setNumber}
            reps={set.reps}
            load={set.load}
            unit={unit}
            loadLabel={formatSetLoadDisplay(set, unit, unit, { exercise, metadata })}
            status={minimumAcceptableReps > 0 && set.reps < minimumAcceptableReps ? "below" : "counted"}
          />
        ))
      )}
    </View>
  );
}

function EditableSetGroup({
  title,
  empty,
  sets,
  unit,
  exercise,
  metadata,
  onEdit,
}: {
  title: string;
  empty: string;
  sets: SetLog[];
  unit: UnitSystem;
  exercise: WorkoutExerciseLog;
  metadata?: Exercise | null;
  onEdit(set: SetLog): void;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle, textTransform: "uppercase" }}>
        {title}
      </Text>
      {sets.length === 0 ? (
        <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
          {empty}
        </Text>
      ) : (
        sets.map((set) => (
          <Pressable
            key={set.id}
            accessibilityRole="button"
            accessibilityLabel={`Edit set ${set.setNumber}`}
            onPress={() => onEdit(set)}
            style={({ pressed }) => editableSetRowStyle(pressed)}
          >
            <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 19, fontWeight: "900" }}>
              {set.type === "warmup" ? "W" : ""}
              {set.setNumber}
            </Text>
            <Text selectable style={{ color: colors.textMuted, fontSize: 14, lineHeight: 19, fontWeight: "800", flex: 1 }}>
              {formatSetLoadDisplay(set, unit, unit, { exercise, metadata })}
            </Text>
            <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
              Edit
            </Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "go" | "warn" | "stop" | "neutral" }) {
  const palette = {
    go: { bg: colors.successSoft, fg: colors.success, border: "#214d35" },
    warn: { bg: colors.warningSoft, fg: colors.warning, border: "#59441c" },
    stop: { bg: colors.accentSoft, fg: colors.accent, border: "#5a4721" },
    neutral: { bg: colors.surfaceSoft, fg: colors.textMuted, border: colors.line },
  }[tone];

  return (
    <View
      style={{
        borderRadius: radius.pill,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.bg,
        paddingHorizontal: spacing.md,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: palette.fg, fontSize: 12, fontWeight: "900" }}>{label}</Text>
    </View>
  );
}

function getDisplayStatus(exercise: WorkoutExerciseLog, index: number, activeIndex: number): DisplayStatus {
  return getWorkoutExerciseDisplayStatus(exercise, index, activeIndex);
}

function formatStatus(status: DisplayStatus): string {
  return {
    "not-started": "Not started",
    active: "In progress",
    completed: "Complete",
    stopped: "Drop-off stop",
    skipped: "Skipped",
    swapped: "Swapped",
  }[status];
}

function getActiveStatusLabel(minimum: number, sets: WorkoutExerciseLog["sets"], stopped: boolean): string {
  if (stopped) return "Stop exercise";
  const latest = sets.at(-1)?.reps;
  if (minimum > 0 && latest === minimum) return "Warning: close";
  return "Continue";
}

function getQuickRepButtons(min: number, max: number) {
  const midpoint = Math.round((min + max) / 2);
  return Array.from(new Set([max, midpoint, min])).filter((value) => Number.isFinite(value) && value >= 0);
}

function isExercisePlannedWorkComplete(exercise: WorkoutExerciseLog): boolean {
  if (exercise.status === "complete" || exercise.status === "shutdown" || exercise.status === "swapped") return true;
  return getWorkSets(exercise.sets).length >= getRequiredSets(exercise.settings);
}

function isCardioSessionKind(kind: unknown): kind is CardioSessionKind {
  return kind === "recovery_cardio" || kind === "capacity_cardio" || kind === "performance_conditioning";
}

const cardioModalityOptions: Array<{ value: CardioModality; label: string }> = [
  { value: "incline_walk", label: "Incline walk" },
  { value: "outdoor_walk", label: "Outdoor walk" },
  { value: "bike", label: "Bike" },
  { value: "rower", label: "Rower" },
  { value: "ski_erg", label: "Ski erg" },
  { value: "assault_bike", label: "Assault bike" },
  { value: "sled_push", label: "Sled push" },
  { value: "run", label: "Run" },
  { value: "sport_conditioning", label: "Sport conditioning" },
  { value: "other", label: "Other" },
];

const cardioEaseOptions: Array<{ value: CardioEase; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

function CardioSessionLoggingScreen({
  sessionName,
  sessionType,
  modality,
  duration,
  distance,
  ease,
  notes,
  interference,
  onModality,
  onDuration,
  onDistance,
  onEase,
  onNotes,
  onSave,
  onCancel,
}: {
  sessionName: string;
  sessionType: CardioSessionKind;
  modality: CardioModality;
  duration: string;
  distance: string;
  ease: CardioEase;
  notes: string;
  interference?: CardioInterferenceResult | null;
  onModality(value: CardioModality): void;
  onDuration(value: string): void;
  onDistance(value: string): void;
  onEase(value: CardioEase): void;
  onNotes(value: string): void;
  onSave(): void;
  onCancel(): void;
}) {
  const insets = useSafeAreaInsets();
  const canSave = Number.parseInt(duration, 10) > 0;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: getTabScreenBottomPadding(insets.bottom), gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.textMuted }}>
            Extra Session
          </Text>
          <Text selectable style={{ ...type.hero, color: colors.text }}>
            {sessionName}
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {cardioSessionCopy(sessionType)}
          </Text>
        </View>

        <View style={cardioPanelStyle}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Modality
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {cardioModalityOptions.map((option) => (
              <Pressable key={option.value} accessibilityRole="button" onPress={() => onModality(option.value)} style={({ pressed }) => cardioChipStyle(modality === option.value, pressed)}>
                <Text selectable style={{ color: modality === option.value ? colors.background : colors.text, fontWeight: "900" }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={cardioPanelStyle}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Dose
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text selectable style={{ ...type.label, color: colors.textMuted }}>Duration</Text>
              <TextInput keyboardType="number-pad" onChangeText={onDuration} placeholder="20" placeholderTextColor={colors.textSubtle} value={duration} style={cardioInputStyle} />
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text selectable style={{ ...type.label, color: colors.textMuted }}>Distance optional</Text>
              <TextInput keyboardType="decimal-pad" onChangeText={onDistance} placeholder="Optional" placeholderTextColor={colors.textSubtle} value={distance} style={cardioInputStyle} />
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {cardioEaseOptions.map((option) => (
              <Pressable key={option.value} accessibilityRole="button" onPress={() => onEase(option.value)} style={({ pressed }) => cardioChipStyle(ease === option.value, pressed)}>
                <Text selectable style={{ color: ease === option.value ? colors.background : colors.text, fontWeight: "900" }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {interference && interference.verdict !== "allowed" ? (
          <View
            style={{
              borderRadius: radius.lg,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: interference.verdict === "avoid" ? "#5a4721" : colors.line,
              backgroundColor: interference.verdict === "avoid" ? colors.warningSoft : colors.surfaceSoft,
              padding: spacing.lg,
              gap: spacing.xs,
            }}
          >
            <Text selectable style={{ color: interference.verdict === "avoid" ? colors.warning : colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>
              {interference.verdict === "avoid" ? "Keep this easy" : "Interference check"}
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              {interference.reason}
            </Text>
            {interference.suggestedAlternative ? (
              <Text selectable style={{ color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: "800" }}>
                {interference.suggestedAlternative}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={cardioPanelStyle}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Notes
          </Text>
          <TextInput
            multiline
            onChangeText={onNotes}
            placeholder="Optional. Keep it useful, not a diary novel."
            placeholderTextColor={colors.textSubtle}
            value={notes}
            style={[cardioInputStyle, { minHeight: 92, textAlignVertical: "top" }]}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <PrimaryButton label="Save cardio session" disabled={!canSave} onPress={onSave} />
          <SecondaryButton label="Cancel" onPress={onCancel} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function cardioSessionCopy(sessionType: CardioSessionKind): string {
  if (sessionType === "recovery_cardio") return "Easy work for recovery and work capacity. Keep it easy enough to recover from.";
  if (sessionType === "capacity_cardio") return "Moderate conditioning. Build the engine without hijacking the lifting plan.";
  return "Performance conditioning for athletic or event goals. Purposeful, not punishment.";
}

const cardioPanelStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surface,
  padding: spacing.lg,
  gap: spacing.md,
};

const cardioInputStyle = {
  minHeight: 50,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.background,
  color: colors.text,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: 18,
  fontWeight: "800" as const,
};

function cardioChipStyle(selected: boolean, pressed: boolean) {
  return {
    minHeight: 42,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: selected ? colors.accent : colors.line,
    backgroundColor: selected ? colors.accent : pressed ? colors.accentSoft : colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  };
}

function confirmCompleteWorkout(plannedWorkComplete: boolean, onConfirm: () => void) {
  Alert.alert(
    plannedWorkComplete ? "Complete workout?" : "Complete workout early?",
    plannedWorkComplete ? "All planned work is complete. Save this session?" : "Some planned work sets are still unfinished. Complete anyway?",
    [
      { text: "Keep training", style: "cancel" },
      { text: "Complete workout", style: plannedWorkComplete ? "default" : "destructive", onPress: onConfirm },
    ],
  );
}

function confirmCancelWorkout(hasLoggedSets: boolean, onConfirm: () => void) {
  Alert.alert(
    "Cancel workout?",
    hasLoggedSets
      ? "This will discard logged sets from this active workout."
      : "This will discard this active workout and any unsaved sets.",
    [
      { text: "Keep workout", style: "cancel" },
      { text: "Cancel workout", style: "destructive", onPress: onConfirm },
    ],
  );
}

function buildSessionBriefing(exercises: WorkoutExerciseLog[]) {
  const primary = exercises[0]?.exerciseName ?? "First exercise";
  const second = exercises[1]?.exerciseName;
  const sessionName = exercises.map((candidate) => candidate.exerciseName.toLowerCase()).join(" ");
  const expectedLength = exercises.length <= 4 ? "35-45 minutes" : exercises.length <= 6 ? "45-60 minutes" : "60-75 minutes";

  if (sessionName.includes("clean") || sessionName.includes("jump") || sessionName.includes("throw")) {
    return {
      goal: `Build power through ${primary}.`,
      primaryFocus: primary,
      secondaryFocus: second ?? "Fast, clean execution",
      expectedLength,
    };
  }

  if (sessionName.includes("pulldown") || sessionName.includes("row") || sessionName.includes("pull up")) {
    return {
      goal: "Build pulling strength and back volume.",
      primaryFocus: primary,
      secondaryFocus: second ?? "Upper-back work",
      expectedLength,
    };
  }

  if (sessionName.includes("squat") || sessionName.includes("leg") || sessionName.includes("deadlift")) {
    return {
      goal: "Build lower-body tissue without wasting sets.",
      primaryFocus: primary,
      secondaryFocus: second ?? "Posterior-chain support",
      expectedLength,
    };
  }

  return {
    goal: "Accumulate productive volume, then stop clean.",
    primaryFocus: primary,
    secondaryFocus: second ?? "Accessory quality",
    expectedLength,
  };
}

function cleanWorkoutName(name: string): string {
  return name.replace(/^AI\s+/i, "").replace(/\s+•\s+.+$/i, "").trim() || name;
}

function getTrainingGapNote(notes?: string | null): string | null {
  if (!notes) return null;
  const notesToShow = [
    "First session back? Keep it clean before chasing numbers.",
    "We trimmed the target because you've had time away.",
    "Re-entry week. Build back in, don't prove a point.",
    "Ease back in.",
  ];
  return notesToShow.find((note) => notes.includes(note)) ?? null;
}

function parsePacketPrOpportunity(notes?: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/PR opportunity:\s*([^.]*)\./i);
  if (!match?.[1]) return null;
  return match[1].replaceAll("_", " ").trim();
}

function inferWorkoutType(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("full")) return "full_body";
  if (normalized.includes("push")) return "push";
  if (normalized.includes("pull")) return "pull";
  if (normalized.includes("legs") || normalized.includes("leg")) return "legs";
  if (normalized.includes("upper")) return "upper";
  if (normalized.includes("lower")) return "lower";
  if (normalized.includes("arms") || normalized.includes("arm")) return "arms";
  return "custom";
}

function formatWorkoutType(type: string): string {
  return type.replaceAll("_", " ");
}

function getExerciseCoachLine(status: string, minimum: number, nextLoad: number, unit: UnitSystem, measurementType = "reps") {
  if (status === "Stop exercise") return `Productive work is complete. Next target: ${formatLoadDisplaySafe(nextLoad, unit)}.`;
  if (status.startsWith("Warning")) return "Performance is approaching the stop point. One more productive set may remain.";
  if (minimum > 0) return measurementType === "duration"
    ? "Keep logging controlled seconds. The app will stop the movement when performance drops."
    : "Keep logging productive reps. The app will stop the movement when performance drops.";
  return "First set establishes the performance line.";
}

function formatLoadDisplaySafe(load: number, unit: UnitSystem): string {
  return formatLoadDisplay({ load, unit, known: load > 0 }).label;
}

const inputPanelStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.line,
  padding: spacing.sm,
  gap: spacing.sm,
};

const workoutHeaderStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surface,
  padding: spacing.lg,
  gap: spacing.md,
};

const workoutHeaderMetricsStyle = {
  flexDirection: "row" as const,
  gap: spacing.sm,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.lineSoft,
};

const workoutProgressPillStyle = {
  minHeight: 34,
  minWidth: 58,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  borderRadius: radius.pill,
  borderCurve: "continuous" as const,
  backgroundColor: colors.accentSoft,
  paddingHorizontal: spacing.md,
};

const cockpitMetricsStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.md,
  paddingVertical: 10,
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  gap: spacing.md,
};

function nextExerciseCardStyle(pressed: boolean) {
  return {
    borderRadius: radius.xl,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: pressed ? colors.surfaceSoft : colors.backgroundElevated,
    padding: spacing.lg,
    gap: spacing.md,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  };
}

const quickActionsStyle = {
  flexDirection: "row" as const,
  gap: spacing.sm,
  flexWrap: "wrap" as const,
};

const sessionBriefingStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.lg,
  gap: spacing.lg,
};

const addExercisePanelStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.lg,
  gap: spacing.md,
};

const compactExerciseRowStyle = {
  minHeight: 58,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderColor: colors.lineSoft,
};

const overviewActionsStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surface,
  padding: spacing.md,
  gap: spacing.sm,
};

const exerciseMorePanelStyle = {
  borderTopWidth: 1,
  borderTopColor: colors.lineSoft,
  paddingTop: spacing.sm,
  marginTop: spacing.xs,
  gap: spacing.sm,
};

const exerciseMorePanelLabelStyle = {
  color: colors.textSubtle,
  fontSize: 11,
  lineHeight: 15,
  fontWeight: "900" as const,
  textTransform: "uppercase" as const,
};

const exerciseMorePanelTextStyle = {
  color: colors.text,
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "700" as const,
};

const overviewSetTableStyle = {
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  overflow: "hidden" as const,
};

const overviewSetSectionHeaderStyle = {
  minHeight: 34,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.surfaceMuted,
};

const overviewSetSectionLabelStyle = {
  color: colors.textMuted,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: "900" as const,
  textTransform: "uppercase" as const,
};

const overviewSetSectionDividerStyle = {
  height: spacing.sm,
  backgroundColor: colors.background,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.lineSoft,
};

const warmupControlRowStyle = {
  minHeight: 40,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.xs,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.backgroundElevated,
  borderBottomWidth: 1,
  borderBottomColor: colors.lineSoft,
};

const overviewSetSwipeContainerStyle = {
  position: "relative" as const,
  overflow: "hidden" as const,
  backgroundColor: colors.backgroundElevated,
};

const overviewSetRowStyle = {
  minHeight: 48,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.lineSoft,
  backgroundColor: colors.backgroundElevated,
};

const overviewSetRowRevealedStyle = {
  transform: [{ translateX: -86 }],
};

const overviewSetLoadTextStyle = {
  color: colors.text,
  fontSize: 14,
  lineHeight: 19,
  fontWeight: "800" as const,
  flex: 1,
  flexShrink: 1,
  minWidth: 0,
};

function overviewSetDeleteActionStyle(pressed: boolean) {
  return {
    position: "absolute" as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: 86,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: pressed ? "#9b2424" : colors.danger,
  };
}

const workoutRestTimerRegionStyle = {
  backgroundColor: colors.background,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.lineSoft,
};

function workoutRestTimerStripStyle(expanded: boolean) {
  return {
    minHeight: expanded ? 86 : 44,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: expanded ? colors.accent : colors.lineSoft,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  };
}

const workoutRestTimerHeaderStyle = {
  minHeight: 28,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  gap: spacing.md,
};

const workoutRestTimerControlsStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.sm,
  flexWrap: "wrap" as const,
};

function restTimerControlButtonStyle(pressed: boolean, emphasis: boolean) {
  return {
    minHeight: 34,
    minWidth: emphasis ? 92 : 72,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: emphasis ? colors.accent : colors.lineSoft,
    backgroundColor: emphasis ? colors.accentSoft : colors.surface,
    paddingHorizontal: spacing.md,
    opacity: pressed ? 0.76 : 1,
  };
}

function restTimerControlButtonTextStyle(emphasis: boolean) {
  return {
    color: emphasis ? colors.accent : colors.textMuted,
    fontSize: 13,
    fontWeight: "900" as const,
  };
}

function performanceButtonStyle(pressed: boolean, disabled: boolean, logged = false) {
  return {
    minHeight: 34,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: logged ? colors.success : disabled ? colors.lineSoft : colors.accent,
    backgroundColor: pressed ? colors.accentSoft : logged ? "rgba(86, 211, 139, 0.1)" : colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    opacity: disabled ? 0.75 : 1,
  };
}

function compactTextActionStyle(pressed: boolean, disabled?: boolean) {
  return {
    minHeight: 32,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    backgroundColor: pressed ? colors.surfaceSoft : "transparent",
    paddingHorizontal: spacing.sm,
    opacity: disabled ? 0.45 : 1,
  };
}

const performanceDrawerBackdropStyle = {
  flex: 1,
  justifyContent: "flex-end" as const,
  backgroundColor: "rgba(0, 0, 0, 0.55)",
};

const escalationModalBackdropStyle = {
  flex: 1,
  justifyContent: "center" as const,
  padding: spacing.xl,
  backgroundColor: "rgba(0, 0, 0, 0.62)",
};

const escalationModalCardStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.success,
  backgroundColor: colors.backgroundElevated,
  padding: spacing.xl,
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 14 },
  elevation: 8,
};

const replaceExerciseModalBackdropStyle = {
  flex: 1,
  justifyContent: "center" as const,
  padding: spacing.xl,
  backgroundColor: "rgba(0, 0, 0, 0.68)",
};

const replaceExerciseModalCardStyle = {
  borderRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.accent,
  backgroundColor: colors.backgroundElevated,
  padding: spacing.xl,
  shadowColor: "#000",
  shadowOpacity: 0.32,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 14 },
  elevation: 9,
};

const manualFinishModalCardStyle = {
  ...replaceExerciseModalCardStyle,
  maxHeight: "88%" as const,
};

function manualFinishReasonOptionStyle(selected: boolean) {
  return {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: selected ? colors.accent : colors.lineSoft,
    backgroundColor: selected ? colors.accentSoft : colors.surfaceMuted,
    padding: spacing.md,
  };
}

const performanceDrawerStyle = {
  maxHeight: "86%" as const,
  borderTopLeftRadius: radius.xl,
  borderTopRightRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.background,
};

const performanceDrawerContentStyle = {
  padding: spacing.xl,
  paddingBottom: spacing.xl + spacing.lg,
};

const drawerInputGridStyle = {
  flexDirection: "row" as const,
  gap: spacing.sm,
  alignItems: "flex-start" as const,
};

const inlineUnitInputStyle = {
  minHeight: 46,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.sm,
};

const editSetPanelStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.md,
  gap: spacing.sm,
};

const keyboardAccessoryStyle = {
  minHeight: 44,
  flexDirection: "row" as const,
  justifyContent: "flex-end" as const,
  alignItems: "center" as const,
  borderTopWidth: 1,
  borderTopColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.md,
};

const keyboardAccessoryButtonStyle = {
  minHeight: 34,
  justifyContent: "center" as const,
  borderRadius: radius.pill,
  borderCurve: "continuous" as const,
  backgroundColor: colors.accent,
  paddingHorizontal: spacing.md,
};

function editableSetRowStyle(pressed: boolean) {
  return {
    minHeight: 42,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    backgroundColor: pressed ? colors.surfaceSoft : colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  };
}

const swapPickerSheetStyle = {
  maxHeight: "88%" as const,
  borderTopLeftRadius: radius.xl,
  borderTopRightRadius: radius.xl,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.background,
  padding: spacing.xl,
};

const drawerCloseStyle = {
  minHeight: 36,
  justifyContent: "center" as const,
  borderRadius: radius.pill,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.md,
};

const swapSearchInputStyle = {
  minHeight: 48,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  color: colors.text,
  paddingHorizontal: spacing.md,
  fontSize: 15,
  fontWeight: "800" as const,
};

const createExerciseFormStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.lg,
  gap: spacing.md,
};

const swapConfirmationInlineStyle = {
  borderRadius: radius.lg,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.accent,
  backgroundColor: colors.accentSoft,
  padding: spacing.lg,
  gap: spacing.md,
};

function optionPillStyle(pressed: boolean, active: boolean) {
  return {
    minHeight: 34,
    justifyContent: "center" as const,
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: active ? colors.accent : colors.lineSoft,
    backgroundColor: active ? colors.accent : pressed ? colors.surfaceSoft : colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  };
}

function destructiveButtonStyle(pressed: boolean) {
  return {
    minHeight: 50,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: pressed ? colors.dangerSoft : "transparent",
    paddingHorizontal: spacing.lg,
  };
}

function completeWorkoutButtonStyle(pressed: boolean, ready: boolean) {
  return {
    minHeight: 50,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: ready ? colors.success : colors.danger,
    backgroundColor: ready ? (pressed ? "#173522" : colors.successSoft) : pressed ? colors.dangerSoft : "transparent",
    paddingHorizontal: spacing.lg,
  };
}

function reviewCardStyle(tone: "default" | "success" | "quiet") {
  const palette = {
    default: { borderColor: colors.line, backgroundColor: colors.surface },
    success: { borderColor: "#214d35", backgroundColor: colors.successSoft },
    quiet: { borderColor: colors.lineSoft, backgroundColor: colors.surfaceMuted },
  }[tone];
  return {
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: palette.borderColor,
    backgroundColor: palette.backgroundColor,
    padding: spacing.lg,
    gap: spacing.md,
  };
}

const reviewMetricGridStyle = {
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  gap: spacing.md,
};

const loadChangeRowStyle = {
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.md,
  gap: spacing.md,
};

const postWorkoutNotesInputStyle = {
  minHeight: 76,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  color: colors.text,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: 15,
  lineHeight: 20,
};

const reasonOptionStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.md,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.md,
};

function reviewChoiceButtonStyle(active: boolean, pressed: boolean, tone: "success" | "default") {
  return {
    flex: 1,
    minHeight: 42,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: active ? (tone === "success" ? colors.success : colors.accent) : colors.line,
    backgroundColor: active
      ? tone === "success"
        ? colors.successSoft
        : colors.accentSoft
      : pressed
        ? colors.surfaceSoft
        : "transparent",
    paddingHorizontal: spacing.sm,
  };
}

function inlineLoadRowStyle(needsLoad: boolean) {
  return {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: needsLoad ? colors.accent : colors.lineSoft,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
  };
}

const overviewLoadInputStyle = {
  flex: 1,
  minHeight: 44,
  color: colors.text,
  fontSize: 22,
  fontWeight: "900" as const,
  textAlign: "center" as const,
};

const overviewLoadInputInlineStyle = {
  flex: 1,
  minHeight: 44,
  color: colors.text,
  fontSize: 22,
  fontWeight: "900" as const,
  textAlign: "center" as const,
  paddingVertical: 0,
};

const overviewRepInputStyle = {
  width: 76,
  minHeight: 46,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  color: colors.text,
  fontSize: 22,
  fontWeight: "900" as const,
  textAlign: "center" as const,
};

const inlineCoachNoteStyle = {
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.lineSoft,
  backgroundColor: colors.surfaceMuted,
  padding: spacing.md,
  gap: spacing.sm,
};

const backToSessionStyle = {
  alignSelf: "flex-start" as const,
  minHeight: 42,
  justifyContent: "center" as const,
  borderRadius: radius.pill,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
};

function loadControlStyle(needsLoad: boolean) {
  return {
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: needsLoad ? colors.accent : colors.line,
    backgroundColor: needsLoad ? colors.accentSoft : colors.surfaceMuted,
    padding: spacing.sm,
    gap: spacing.sm,
  };
}

function progressionPanelStyle(increaseEarned: boolean, stopped: boolean) {
  return {
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: increaseEarned ? "#214d35" : stopped ? "#5a4721" : colors.line,
    backgroundColor: increaseEarned ? colors.successSoft : stopped ? colors.accentSoft : colors.surfaceMuted,
    padding: spacing.lg,
    gap: spacing.sm,
  };
}

function adaptiveSetGuidanceStyle(tone: "go" | "stop" | "neutral") {
  return {
    borderRadius: radius.lg,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: tone === "go" ? "#214d35" : tone === "stop" ? "#5a4721" : colors.line,
    backgroundColor: tone === "go" ? colors.successSoft : tone === "stop" ? colors.accentSoft : colors.surfaceMuted,
    padding: spacing.lg,
    gap: spacing.sm,
  };
}

function adaptiveSetStatusPillStyle(tone: "go" | "stop" | "neutral") {
  return {
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: tone === "go" ? "#2f6747" : tone === "stop" ? "#755d2c" : colors.line,
    backgroundColor: tone === "go" ? "#173421" : tone === "stop" ? colors.warningSoft : colors.backgroundElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexShrink: 0,
  };
}

function restTimerStyle(compact: boolean) {
  return {
    borderRadius: radius.xl,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.backgroundElevated,
    padding: compact ? spacing.lg : spacing.xl,
    gap: spacing.md,
  };
}

function loadInputStyle(enabled: boolean) {
  return {
    width: 92,
    height: 50,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: enabled ? colors.background : colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 22,
    fontWeight: "900" as const,
    textAlign: "center" as const,
    fontVariant: ["tabular-nums" as const],
  };
}

const repInputStyle = {
  height: 54,
  width: 86,
  borderRadius: radius.md,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.background,
  color: colors.text,
  fontSize: 24,
  fontWeight: "900" as const,
  textAlign: "center" as const,
  fontVariant: ["tabular-nums" as const],
};

function quickRepStyle(pressed: boolean, disabled: boolean) {
  return {
    minHeight: 56,
    minWidth: 70,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: pressed ? colors.accent : colors.line,
    backgroundColor: pressed ? colors.accentSoft : colors.surfaceMuted,
    opacity: disabled ? 0.45 : 1,
  };
}

function loadStepButtonStyle(pressed: boolean) {
  return {
    minHeight: 50,
    minWidth: 58,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: radius.md,
    borderCurve: "continuous" as const,
    borderWidth: 1,
    borderColor: pressed ? colors.accent : colors.line,
    backgroundColor: pressed ? colors.accentSoft : colors.background,
  };
}

const inlineBadgeStyle = {
  alignSelf: "flex-start" as const,
  borderRadius: radius.pill,
  borderCurve: "continuous" as const,
  borderWidth: 1,
  borderColor: "#5a4721",
  backgroundColor: colors.accentSoft,
  paddingHorizontal: spacing.sm,
  paddingVertical: 4,
};
