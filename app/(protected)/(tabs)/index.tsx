import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { programmeSkeletonRepository } from "@/data/local/programme-skeleton-repository";
import { isRecoveryCapacityIgnoredForWeek, recoveryCapacityIgnoreRepository } from "@/data/local/recovery-capacity-ignore-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { getActiveDesignQaFixture } from "@/application/design-qa/design-qa-fixtures";
import { buildWorkoutConflictCopy, isSameWorkoutStartTarget, type WorkoutStartTarget } from "@/domain/training/active-workout";
import { buildHomeDashboardViewModel } from "@/domain/training/home-dashboard";
import { detectPersonalRecords, type PersonalRecordItem } from "@/domain/training/personal-records";
import type { ProgrammeSkeleton } from "@/domain/training/programme-skeleton";
import { buildPrSharePayload, type BrandedSharePayload } from "@/domain/training/share-cards";
import { displayWorkoutName, isLegacyPlaceholderWorkoutSession, workoutTypeForName } from "@/domain/training/planned-workout";
import type { BlockType } from "@/domain/training/annual-models";
import type { CapacityFocusArea } from "@/domain/training/capacity-focus";
import {
  buildCapacitySessionProgramme,
  buildCapacityCardioSessionProgramme,
  buildExtraFullSessionProgramme,
  buildExtraVolumeSessionProgramme,
  buildPerformanceConditioningSessionProgramme,
  buildRecoveryCardioSessionProgramme,
  type ExtraFullSessionType,
  type ExtraVolumeSessionType,
} from "@/domain/training/extra-session-generator";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { startOfWeek } from "@/domain/training/training-session-selection";
import { admitExtraSession, type ExtraSessionPurpose } from "@/domain/training/extra-session-admission";
import { approveVolumeAdjustment, ignoreVolumeAdjustment } from "@/domain/training/volume-adjustments";
import { useProgrammeLibrary } from "@/features/programme-builder/use-programme-builder";
import { BrandedShareCardPreviewModal } from "@/features/social-sharing/branded-share-card-preview";
import { AppScreen, DetailToggle, PremiumCard, PrimaryButton, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";

type ExtraSessionMode = "full" | "volume" | "capacity" | "recovery_cardio" | "capacity_cardio" | "performance_conditioning";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const params = useLocalSearchParams<{ extraSession?: string }>();
  const { settings } = useAppSettings();
  const handledExtraSessionParam = useRef<string | null>(null);
  const [sessions, setSessions] = useState(() => workoutSessionRepository.list());
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const [programmeSkeleton, setProgrammeSkeleton] = useState(() => programmeSkeletonRepository.getOptional());
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number | null>(null);
  const [showExtraSession, setShowExtraSession] = useState(false);
  const [extraMode, setExtraMode] = useState<ExtraSessionMode>("full");
  const [extraFullType, setExtraFullType] = useState<ExtraFullSessionType>("upper");
  const [extraBlockType, setExtraBlockType] = useState<BlockType>("hypertrophy");
  const [extraVolumeType, setExtraVolumeType] = useState<ExtraVolumeSessionType>("upper");
  const [capacityArea, setCapacityArea] = useState<CapacityFocusArea>("low_back");
  const [recoveryCapacityIgnore, setRecoveryCapacityIgnore] = useState(() => recoveryCapacityIgnoreRepository.get());
  const [sharePayload, setSharePayload] = useState<BrandedSharePayload | null>(null);
  const { programmes } = useProgrammeLibrary();
  const exercises = customExerciseRepository.listAll();
  const completedHistory = useMemo(() => summarizeWorkoutHistory(workoutHistoryRepository.listCompletedSessions()), [sessions]);
  const openWorkout = sessions.find((session) => !session.completedAt && !isLegacyPlaceholderWorkoutSession(session));
  const hasOpenWorkout = Boolean(openWorkout);
  const activeFixture = getActiveDesignQaFixture();
  const dashboardDate = useMemo(
    () => (activeFixture?.id === "home_rest_day" ? new Date("2026-06-04T09:00:00.000Z") : undefined),
    [activeFixture?.id],
  );
  const dashboard = useMemo(
    () =>
      buildHomeDashboardViewModel({
        activePlan,
        history: completedHistory,
        exercises,
        programmes,
        hasOpenWorkout,
        activeWorkoutName: openWorkout?.name,
        activeWorkout: openWorkout,
        selectedSessionIndex,
        date: dashboardDate,
      }),
    [activePlan, completedHistory, dashboardDate, exercises, hasOpenWorkout, openWorkout, openWorkout?.name, programmes, selectedSessionIndex],
  );
  const workoutSourceName = dashboard.todayState === "completed_today" || dashboard.todayState === "rest_day" ? dashboard.nextWorkout : dashboard.todayWorkoutName;
  const todayWorkoutName = displayWorkoutName(dashboard.todayWorkoutName);
  const todayExercises = useMemo(
    () => {
      if (openWorkout) return openWorkout.exercises.slice(0, 5).map((exercise) => ({ id: exercise.id, name: exercise.exerciseName }));
      return [];
    },
    [openWorkout],
  );
  const trainingGapNote = null;
  const totalExerciseCount = openWorkout?.exercises.length ?? todayExercises.length;
  const estimatedTime = totalExerciseCount <= 4 ? "35-45 mins" : "45-60 mins";
  const upNextName = displayWorkoutName(workoutSourceName || dashboard.todayWorkoutName);
  const upNextFocus = focusLabelForWorkout(upNextName, todayExercises.map((exercise) => exercise.name));
  const currentWeekCompletedSessions = useMemo(
    () => completedSessionsForWeek(sessions, dashboardDate ?? new Date()),
    [dashboardDate, sessions],
  );
  const homeRecentPrs = useMemo(
    () =>
      detectPersonalRecords({
        sessions: workoutHistoryRepository.listCompletedSessions(),
        now: (dashboardDate ?? new Date()).toISOString(),
        includeBaselines: false,
        recentDays: 30,
        limit: 3,
      }),
    [dashboardDate, sessions],
  );

  const startTodayWorkout = () => {
    if (hasOpenWorkout) {
      if (!requirePremiumForTodayWorkout("continue")) return;
      router.push("/(protected)/(tabs)/train");
      return;
    }

    if (!activePlan || !requirePremiumForTodayWorkout("start")) return;
    router.push("/(protected)/(tabs)/train");
  };

  const handleActiveWorkoutConflict = (target: WorkoutStartTarget, onDiscardAndStart: () => void) => {
    if (!openWorkout) return false;
    if (isSameWorkoutStartTarget(openWorkout, target)) {
      router.push("/(protected)/(tabs)/train");
      return true;
    }

    const copy = buildWorkoutConflictCopy(openWorkout, target);
    Alert.alert(copy.title, copy.body, [
      { text: copy.continueLabel, style: "cancel", onPress: () => router.push("/(protected)/(tabs)/train") },
      {
        text: copy.discardLabel,
        style: "destructive",
        onPress: () => {
          workoutSessionRepository.remove(openWorkout.id);
          onDiscardAndStart();
        },
      },
    ]);
    return true;
  };

  const openPremiumPaywall = () => {
    setShowExtraSession(false);
    requestAnimationFrame(() => router.push("/(protected)/paywall"));
  };

  const openExtraSessionPaywall = openPremiumPaywall;

  const requirePremiumForCoachedAction = ({
    loadingMessage,
    premiumMessage,
  }: {
    loadingMessage: string;
    premiumMessage: string;
  }) => {
    if (isPremium) return true;

    if (subscriptionLoading) {
      Alert.alert("Checking subscription", loadingMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "View Premium", onPress: openPremiumPaywall },
      ]);
      return false;
    }

    Alert.alert("Premium required", premiumMessage, [
      { text: "Not now", style: "cancel" },
      { text: "Start Free Trial", onPress: openPremiumPaywall },
    ]);
    return false;
  };

  const requirePremiumForTodayWorkout = (action: "start" | "continue") =>
    requirePremiumForCoachedAction({
      loadingMessage: `We are checking your access before ${action === "continue" ? "continuing" : "starting"} this workout.`,
      premiumMessage: "Coached workouts are part of Adaptive Strength Coach. Start a trial to unlock them.",
    });

  const requirePremiumForExtraSession = () => {
    return requirePremiumForCoachedAction({
      loadingMessage: "We are checking your access before starting an extra session.",
      premiumMessage: "Extra Sessions are part of the adaptive coach. Start a trial to unlock them.",
    });
  };

  const openLowBackCapacitySession = () => {
    startExtraSession("capacity");
  };

  const applyHomeVolumeChange = () => {
    if (!activePlan || !dashboard.muscleVolumeWarning) return;
    const nextPlan = approveVolumeAdjustment(activePlan, dashboard.muscleVolumeWarning.recommendation);
    if (nextPlan === activePlan) {
      Alert.alert("No change applied", "That volume change is blocked by the current safety rules.");
      return;
    }
    activeTrainingPlanRepository.save(nextPlan);
    setActivePlan(nextPlan);
    Alert.alert("Volume change applied", "Future planned sessions will use this adjustment. Active workouts and history stay unchanged.");
  };

  const ignoreHomeVolumeChange = () => {
    if (!activePlan || !dashboard.muscleVolumeWarning) return;
    const nextPlan = ignoreVolumeAdjustment(activePlan, dashboard.muscleVolumeWarning.recommendation);
    activeTrainingPlanRepository.save(nextPlan);
    setActivePlan(nextPlan);
    Alert.alert("Ignored for now", "No future session changes were applied. The evidence stays in Progress.");
  };

  const recoveryCapacityWeekKey = startOfWeek(dashboardDate ?? new Date()).toISOString();
  const recoveryCapacityIgnored = isRecoveryCapacityIgnoredForWeek(recoveryCapacityIgnore, { weekId: recoveryCapacityWeekKey, activePlanId: activePlan?.id });
  const recoveryCapacityTarget =
    dashboard.recoveryCapacityTarget && !recoveryCapacityIgnored ? dashboard.recoveryCapacityTarget : undefined;
  const coachInsightSummary = dashboard.hasTrainingDirection
    ? coachHeadline(dashboard.momentumLabel, dashboard.recommendationLabel)
    : dashboard.emptyDirectionMessage;
  const currentTrainingWeekWorkout =
    dashboard.thisWeekItems.find((workout) => workout.status === "current") ??
    dashboard.thisWeekItems.find((workout) => workout.status === "upcoming") ??
    dashboard.thisWeekItems[0];
  const completedPlannedSessionCount = dashboard.thisWeekItems.filter((workout) => workout.status === "done").length;
  const trainingWeekSummary =
    dashboard.thisWeekItems.length > 0
      ? `${completedPlannedSessionCount} of ${dashboard.thisWeekItems.length} sessions complete`
      : "No planned sessions yet";
  const recentPrSummary = homeRecentPrs[0] ? `${homeRecentPrs[0].exerciseName} · ${formatHomePersonalRecord(homeRecentPrs[0]).replace(" · ", " ")}` : "";
  const completedThisWeekSummary = `${currentWeekCompletedSessions.length} ${currentWeekCompletedSessions.length === 1 ? "session" : "sessions"} logged`;

  const ignoreRecoveryCapacityThisWeek = () => {
    recoveryCapacityIgnoreRepository.save({
      ignoredRecoveryCapacityWeekId: recoveryCapacityWeekKey,
      ignoredAt: new Date().toISOString(),
      activePlanId: activePlan?.id,
      sessionType: recoveryCapacityTarget?.sessionType,
    });
    Alert.alert("Ignored for this week", "Recovery & Capacity will stay quiet until next week. You can still start cardio from the Recovery & Capacity card.");
  };

  const startRecoveryCapacityTarget = () => {
    if (!recoveryCapacityTarget) return;
    if (!requirePremiumForExtraSession()) return;
    Alert.alert("Timing check", recoveryCapacityTarget.timingGuidance.startMessage, [
      { text: "Not now", style: "cancel" },
      { text: recoveryCapacityTarget.actionLabel, onPress: () => startExtraSession(recoveryCapacityTarget.sessionType) },
    ]);
  };

  const startCardioSession = () => {
    if (recoveryCapacityTarget) {
      startRecoveryCapacityTarget();
      return;
    }
    startExtraSession("recovery_cardio");
  };

  const startExtraSession = (modeOverride?: ExtraSessionMode) => {
    if (!requirePremiumForExtraSession()) return;

    const selectedMode = isExtraSessionMode(modeOverride) ? modeOverride : extraMode;
    let shouldReduce = false;
    if (activePlan) {
      const purpose: ExtraSessionPurpose = selectedMode === "volume" ? "priority_volume" : selectedMode === "capacity" ? "lift_practice" : selectedMode === "recovery_cardio" || selectedMode === "capacity_cardio" ? "recovery" : selectedMode === "performance_conditioning" ? "conditioning" : "recreational";
      const admission = admitExtraSession({ plan: activePlan, purpose, recentHighStressSessions: 0 });
      if (admission.decision === "block") {
        Alert.alert("Extra session not added", admission.reason);
        return;
      }
      if (admission.decision === "reduce") {
        shouldReduce = true;
        Alert.alert("Extra session reduced", admission.reason);
      }
    }
    const availableEquipment = activePlan?.equipment;
    const loadIncrementProfile = settings.loadIncrementProfile;
    const unit = settings.unit;
    const programme =
      selectedMode === "full"
        ? buildExtraFullSessionProgramme({
            type: extraFullType,
            blockType: extraBlockType,
            exercises,
            availableEquipment,
            loadIncrementProfile,
            unit,
            experienceLevel: activePlan?.experienceLevel,
            createdByUserId: user?.id ?? null,
            history: completedHistory,
          })
        : selectedMode === "volume"
          ? buildExtraVolumeSessionProgramme({
              type: extraVolumeType,
              exercises,
              availableEquipment,
              loadIncrementProfile,
              unit,
              experienceLevel: activePlan?.experienceLevel,
              createdByUserId: user?.id ?? null,
            })
          : selectedMode === "capacity"
            ? buildCapacitySessionProgramme({
              area: capacityArea,
              exercises,
              loadIncrementProfile,
              unit,
              experienceLevel: activePlan?.experienceLevel,
              createdByUserId: user?.id ?? null,
            })
            : selectedMode === "recovery_cardio"
              ? buildRecoveryCardioSessionProgramme({
                  exercises,
                  unit,
                  experienceLevel: activePlan?.experienceLevel,
                  createdByUserId: user?.id ?? null,
                })
              : selectedMode === "capacity_cardio"
                ? buildCapacityCardioSessionProgramme({
                    exercises,
                    unit,
                    experienceLevel: activePlan?.experienceLevel,
                    createdByUserId: user?.id ?? null,
                  })
                : buildPerformanceConditioningSessionProgramme({
                    exercises,
                    unit,
                    experienceLevel: activePlan?.experienceLevel,
                    createdByUserId: user?.id ?? null,
                  });
    const day = programme.days[0];
    if (shouldReduce && day) {
      // Preserve the first (highest-priority) movement and remove lower-priority tail work.
      day.exerciseSlots = day.exerciseSlots.slice(0, Math.max(1, Math.ceil(day.exerciseSlots.length / 2)));
      day.notes = [day.notes, "Reduced by active microcycle admission rules."].filter(Boolean).join(" ");
    }
    if (!day || day.exerciseSlots.length === 0) {
      Alert.alert("Unable to create session", "That extra session could not be built right now. Try another option.");
      return;
    }

    const sessionKind = extraSessionKindForMode(selectedMode);
    const startSelectedExtraSession = () => {
      programmeRepository.save(programme);
      programmeRepository.selectProgrammeDay({ programmeId: programme.id, dayId: day.id, sessionKind });
      setShowExtraSession(false);

      if (selectedMode === "capacity" || selectedMode === "recovery_cardio" || selectedMode === "capacity_cardio" || selectedMode === "performance_conditioning") {
        router.push("/(protected)/(tabs)/train");
        return;
      }

      const firstExercise = exercises.find((exercise) => exercise.id === day.exerciseSlots[0]?.exerciseId);
      router.push({
        pathname: "/(protected)/session-prep",
        params: {
          workoutName: displayWorkoutName(programme.name),
          workoutType: workoutTypeForName(programme.name) ?? undefined,
          firstExerciseName: firstExercise?.name,
          firstMovementPattern: firstExercise?.movementPattern,
        },
      });
    };
    if (handleActiveWorkoutConflict({ name: displayWorkoutName(programme.name), sessionKind }, startSelectedExtraSession)) return;
    startSelectedExtraSession();
  };

  useEffect(
    () =>
      workoutSessionRepository.subscribe(() => {
        setSessions(workoutSessionRepository.list());
      }),
    [],
  );

  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);

  useEffect(() => programmeSkeletonRepository.subscribe(() => setProgrammeSkeleton(programmeSkeletonRepository.getOptional())), []);

  useEffect(() => recoveryCapacityIgnoreRepository.subscribe(() => setRecoveryCapacityIgnore(recoveryCapacityIgnoreRepository.get())), []);

  useEffect(() => {
    if (params.extraSession !== "capacity" || handledExtraSessionParam.current === "capacity") return;
    handledExtraSessionParam.current = "capacity";
    openLowBackCapacitySession();
    requestAnimationFrame(() => router.setParams({ extraSession: "" }));
  }, [params.extraSession, isPremium, subscriptionLoading]);

  useEffect(() => {
    setSelectedSessionIndex(null);
  }, [activePlan?.currentMesocycleId, activePlan?.currentMicrocycle?.sequenceNumber]);

  return (
    <AppScreen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
            {dashboard.greeting}
          </Text>
          <Text selectable style={{ ...type.title, color: colors.text }}>
            Today
          </Text>
        </View>
        <TrainingSystemGuideButton />
      </View>

      {dashboard.todayState === "completed_today" ? (
        <PremiumCard>
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <Text selectable style={{ color: colors.text, fontSize: 30, lineHeight: 35, fontWeight: "900", letterSpacing: 0 }}>
                Done today
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 17, lineHeight: 22, fontWeight: "800" }}>
                {dashboard.nextWorkout ? (
                  <>
                    Next: {upNextName}
                  </>
                ) : (
                  "Training complete"
                )}
              </Text>
              {dashboard.planningContext.microcycleLabel ? (
                <Text selectable style={{ color: colors.textSubtle, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                  {dashboard.planningContext.microcycleLabel}
                </Text>
              ) : null}
            </View>
          </View>

          <PrimaryButton label={dashboard.primaryActionLabel} onPress={startTodayWorkout} disabled={dashboard.hasCompletedWeek || !dashboard.nextWorkout} />

          <DetailToggle label="More" compact>
            <View style={{ gap: spacing.sm }}>
              {dashboard.todayMeta ? (
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {dashboard.todayMeta}
                </Text>
              ) : null}
              {dashboard.approvedNextMesocycleLabel ? (
                <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                  {dashboard.approvedNextMesocycleLabel}
                </Text>
              ) : null}
              <SecondaryButton
                label="Create Extra Session"
                onPress={() => {
                  if (requirePremiumForExtraSession()) setShowExtraSession(true);
                }}
                compact
              />
            </View>
          </DetailToggle>
        </PremiumCard>
      ) : (
        <PremiumCard>
          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ fontSize: 36, lineHeight: 41, fontWeight: "900", color: colors.text, letterSpacing: 0 }}>
                {todayWorkoutName}
              </Text>
              <Text selectable style={{ ...type.body, color: colors.text }}>
                {dashboard.todayGoal}
              </Text>
              {dashboard.todayState !== "no_plan" ? (
                <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "700" }}>
                  {dashboard.todayMeta || (todayExercises.length > 0 ? estimatedTime : "Set up your plan first.")}
                </Text>
              ) : null}
              {dashboard.planningContext.mesocyclePurpose ? (
                <DetailToggle label="More" compact>
                  <View style={{ gap: spacing.xs }}>
                    <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900" }}>
                      {dashboard.planningContext.mesocyclePurpose}
                    </Text>
                    {dashboard.planningContext.microcycleLabel ? (
                      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                        {dashboard.planningContext.microcycleLabel}
                      </Text>
                    ) : null}
                    {dashboard.planningContext.sessionRole ? (
                      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                        Session role: {dashboard.planningContext.sessionRole}
                      </Text>
                    ) : null}
                    {dashboard.planningContext.exactTargets.length ? (
                      <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "800" }}>
                        Today: {dashboard.planningContext.exactTargets.join(", ")}
                      </Text>
                    ) : null}
                  </View>
                </DetailToggle>
              ) : null}
            </View>
          </View>

          <PrimaryButton
            label={dashboard.primaryActionLabel}
            onPress={startTodayWorkout}
            disabled={dashboard.hasCompletedWeek}
          />
          {dashboard.todayState !== "active_workout" ? (
            <SecondaryButton
              label="Create Extra Session"
              onPress={() => {
                if (requirePremiumForExtraSession()) setShowExtraSession(true);
              }}
              compact
            />
          ) : null}
        </PremiumCard>
      )}

      {programmeSkeleton && !activePlan ? (
        <SectionList title="Programme Overview">
          <PremiumCard tone="quiet">
            <View style={{ gap: spacing.md }}>
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Current programme
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "900" }}>
                  {formatProgrammeSkeletonGoal(programmeSkeleton.goal)}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {programmeSkeleton.currentBlock.blockPurpose}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                <MiniSummary label="Training days" value={`${programmeSkeleton.scheduledSessions.length}/week`} />
                <MiniSummary label="Framework" value={formatProgrammeSkeletonFramework(programmeSkeleton.framework)} />
              </View>
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.textSubtle, textTransform: "uppercase" }}>
                  Current block focus
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>
                  {formatProgrammeSkeletonValue(programmeSkeleton.currentBlock.blockFocus)}
                </Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                <Text selectable style={{ ...type.label, color: colors.textSubtle, textTransform: "uppercase" }}>
                  Week 1 sessions
                </Text>
                {programmeSkeleton.scheduledSessions.map((session) => (
                  <View key={`${session.weekNumber}-${session.sessionIndex}-${session.sessionType}`} style={{ gap: 2 }}>
                    <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "900" }}>
                      {session.sessionIndex}. {formatProgrammeSkeletonValue(session.sessionType)}
                    </Text>
                    <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "700" }}>
                      {session.sessionRole}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </PremiumCard>
        </SectionList>
      ) : null}

      {dashboard.showUpNext && dashboard.todayState !== "completed_today" && todayExercises.length > 0 ? (
        <SectionList title="Up Next">
          <PremiumCard tone="quiet">
            <View style={{ gap: spacing.xs }}>
              <Text selectable style={{ color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: "900" }}>
                {upNextName}
              </Text>
              <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                Focus
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {upNextFocus}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <MiniSummary label="Session" value={`${totalExerciseCount} ${totalExerciseCount === 1 ? "exercise" : "exercises"}`} />
              <MiniSummary label="Time" value={estimatedTime} />
            </View>
            <PrimaryButton label="View Session" onPress={startTodayWorkout} compact />
          </PremiumCard>
        </SectionList>
      ) : null}

      <SectionList title="Recovery & Capacity">
        <PremiumCard tone="quiet">
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                Optional training support
              </Text>
              <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "900" }}>
                Low Back Capacity
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                Build trunk control, hip support, and load tolerance for more consistent training.
              </Text>
            </View>
            <PrimaryButton label="Start Capacity Session" onPress={openLowBackCapacitySession} compact />
            <SecondaryButton label="Learn More" onPress={() => router.push("/(protected)/capacity-focus")} compact />
          </View>
        </PremiumCard>
        <PremiumCard tone="quiet">
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Cardio & Conditioning
                </Text>
                {recoveryCapacityTarget ? (
                  <View style={{ borderRadius: radius.pill, backgroundColor: colors.accentSoft, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
                    <Text selectable style={{ color: colors.accent, fontSize: 11, lineHeight: 14, fontWeight: "900", textTransform: "uppercase" }}>
                      Recommended this week
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "900" }}>
                Cardio & Conditioning
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                Optional conditioning outside your main lifting plan.
              </Text>
              {recoveryCapacityTarget ? (
                <View style={{ gap: spacing.sm, paddingTop: spacing.xs }}>
                  <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
                    {recoveryCapacityTarget.completedSessions} / {recoveryCapacityTarget.targetSessions} completed
                  </Text>
                  <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                    Target: {recoveryCapacityTarget.targetLabel}
                  </Text>
                  <Text selectable style={{ ...type.body, color: colors.text }}>
                    {recoveryCapacityTarget.note}
                  </Text>
                  <View style={{ gap: spacing.xs }}>
                    <Text selectable style={{ ...type.label, color: colors.success, textTransform: "uppercase" }}>
                      Best
                    </Text>
                    {recoveryCapacityTarget.timingGuidance.bestTimingGuidance.map((item) => (
                      <Text key={`cardio-best-${item}`} selectable style={{ ...type.body, color: colors.textMuted }}>
                        ✓ {item}
                      </Text>
                    ))}
                  </View>
                  <View style={{ gap: spacing.xs }}>
                    <Text selectable style={{ ...type.label, color: colors.warning, textTransform: "uppercase" }}>
                      Avoid
                    </Text>
                    {recoveryCapacityTarget.timingGuidance.avoidGuidance.map((item) => (
                      <Text key={`cardio-avoid-${item}`} selectable style={{ ...type.body, color: colors.textMuted }}>
                        ✗ {item}
                      </Text>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <PrimaryButton label={recoveryCapacityTarget?.actionLabel ?? "Start Cardio Session"} onPress={startCardioSession} compact />
              {recoveryCapacityTarget ? <SecondaryButton label={recoveryCapacityTarget.secondaryActionLabel} onPress={ignoreRecoveryCapacityThisWeek} compact /> : null}
            </View>
          </View>
        </PremiumCard>
      </SectionList>

      {dashboard.todayState !== "no_plan" ? (
        <HomeCollapsibleSection
          title="Coach Insight"
          summary={coachInsightSummary}
          actionLabel="View Analysis"
          hideLabel="Hide Analysis"
        >
          <PremiumCard tone="quiet">
            {dashboard.hasTrainingDirection ? (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {coachInsightSummary} {dashboard.recommendationLabel}.
              </Text>
            ) : (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {dashboard.emptyDirectionMessage}
              </Text>
            )}
            {dashboard.extraWorkWarning ? (
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ ...type.body, color: colors.text }}>
                  {dashboard.extraWorkWarning.message}
                </Text>
                <DetailToggle label="Extra work evidence" compact>
                  {dashboard.extraWorkWarning.evidence.dataPoints.map((point) => (
                    <Text key={point} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
                      - {point}
                    </Text>
                  ))}
                </DetailToggle>
              </View>
            ) : null}
            {trainingGapNote ? (
              <Text selectable style={{ ...type.body, color: colors.text }}>
                {trainingGapNote}
              </Text>
            ) : null}
            {dashboard.muscleVolumeWarning ? (
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ ...type.body, color: colors.text }}>
                  {dashboard.muscleVolumeWarning.message}
                </Text>
                <DetailToggle label="Volume evidence" compact>
                  {dashboard.muscleVolumeWarning.evidence.dataPoints.map((point) => (
                    <Text key={point} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
                      - {point}
                    </Text>
                  ))}
                </DetailToggle>
                <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                  <SecondaryButton label="Apply change" onPress={applyHomeVolumeChange} compact />
                  <SecondaryButton label="Ignore for now" onPress={ignoreHomeVolumeChange} compact />
                </View>
              </View>
            ) : null}
            {dashboard.recoveryCapacityWarning ? (
              <View style={{ gap: spacing.xs }}>
                <Text selectable style={{ ...type.body, color: colors.text }}>
                  {dashboard.recoveryCapacityWarning.message}
                </Text>
                <DetailToggle label="Recovery evidence" compact>
                  {dashboard.recoveryCapacityWarning.evidence.dataPoints.map((point) => (
                    <Text key={point} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
                      - {point}
                    </Text>
                  ))}
                </DetailToggle>
              </View>
            ) : null}
            <DetailToggle label="Evidence" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
                Confidence: {dashboard.recommendationEvidence.confidence.replaceAll("_", " ")}
              </Text>
              {dashboard.recommendationEvidence.dataPoints.map((point) => (
                <Text key={point} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
                  - {point}
                </Text>
              ))}
            </DetailToggle>
          </PremiumCard>
        </HomeCollapsibleSection>
      ) : null}

      {dashboard.thisWeek.length > 0 ? (
        <HomeCollapsibleSection
          title="Training Week"
          summary={trainingWeekSummary}
          meta={currentTrainingWeekWorkout ? `Current: ${currentTrainingWeekWorkout.label}` : undefined}
          actionLabel="View Sessions"
          hideLabel="Hide Sessions"
        >
          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              {dashboard.thisWeekItems.map((workout, index) => (
                <TrainingWeekCard
                  key={`${workout.label}-${index}`}
                  workout={workout}
                  sessionNumber={index + 1}
                  sessionTotal={dashboard.thisWeekItems.length}
                  onSelect={() => setSelectedSessionIndex(index)}
                  onStart={workout.status === "current" ? startTodayWorkout : undefined}
                />
              ))}
            </View>
          </View>
        </HomeCollapsibleSection>
      ) : null}

      {homeRecentPrs.length > 0 ? (
        <HomeCollapsibleSection title="Recent PRs" summary={recentPrSummary} actionLabel="View PRs" hideLabel="Hide PRs">
          <PremiumCard tone="quiet">
            <View style={{ gap: spacing.md }}>
              {homeRecentPrs.map((record) => (
                <View key={record.id} style={{ gap: spacing.xs }}>
                  <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>
                    {record.exerciseName}
                  </Text>
                  <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                    {formatHomePersonalRecord(record)}
                  </Text>
                  <SecondaryButton label="Share PR" onPress={() => setSharePayload(buildPrSharePayload(record))} compact />
                </View>
              ))}
              <SecondaryButton label="View Progress" onPress={() => router.push("/(protected)/(tabs)/analytics")} compact />
            </View>
          </PremiumCard>
        </HomeCollapsibleSection>
      ) : null}

      {currentWeekCompletedSessions.length > 0 ? (
        <HomeCollapsibleSection title="Completed This Week" summary={completedThisWeekSummary} actionLabel="View Completed" hideLabel="Hide Completed">
          <View style={{ gap: spacing.sm }}>
            {currentWeekCompletedSessions.map((session) => (
              <PremiumCard key={session.id} tone="quiet">
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "center" }}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>
                      {displayWorkoutName(session.name)}
                    </Text>
                    <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                      {session.sessionKind && session.sessionKind !== "planned" ? "Extra" : "Planned"} · {session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} sets
                    </Text>
                  </View>
                  <SecondaryButton
                    label="View/Edit"
                    onPress={() =>
                      router.push({
                        pathname: "/(protected)/history/[id]",
                        params: { id: session.id },
                      })
                    }
                    compact
                  />
                </View>
              </PremiumCard>
            ))}
          </View>
        </HomeCollapsibleSection>
      ) : null}

      <ExtraSessionModal
        visible={showExtraSession}
        mode={extraMode}
        fullType={extraFullType}
        blockType={extraBlockType}
        volumeType={extraVolumeType}
        capacityArea={capacityArea}
        onClose={() => setShowExtraSession(false)}
        onMode={setExtraMode}
        onFullType={setExtraFullType}
        onBlockType={setExtraBlockType}
        onVolumeType={setExtraVolumeType}
        onCapacityArea={setCapacityArea}
        onStart={startExtraSession}
      />
      <BrandedShareCardPreviewModal payload={sharePayload} onClose={() => setSharePayload(null)} />
    </AppScreen>
  );
}

function HomeCollapsibleSection({
  title,
  summary,
  meta,
  actionLabel,
  hideLabel,
  children,
}: {
  title: string;
  summary: string;
  meta?: string;
  actionLabel: string;
  hideLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: spacing.sm }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? hideLabel : actionLabel}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => ({
          borderRadius: radius.lg,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: open ? colors.accent : colors.lineSoft,
          backgroundColor: pressed || open ? colors.accentSoft : colors.surfaceMuted,
          padding: spacing.lg,
          gap: spacing.sm,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text selectable style={{ ...type.label, color: open ? colors.accent : colors.textSubtle, textTransform: "uppercase" }}>
              {title}
            </Text>
            <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }}>
              {summary}
            </Text>
            {meta ? (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {meta}
              </Text>
            ) : null}
          </View>
          <Text selectable style={{ color: open ? colors.accent : colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
            {open ? hideLabel : actionLabel}
          </Text>
        </View>
      </Pressable>
      {open ? <View style={{ gap: spacing.md }}>{children}</View> : null}
    </View>
  );
}

function TrainingWeekCard({
  workout,
  sessionNumber,
  sessionTotal,
  onSelect,
  onStart,
}: {
  workout: { label: string; status: "done" | "current" | "upcoming" | "rest"; isRecommended: boolean; isSelected: boolean };
  sessionNumber: number;
  sessionTotal: number;
  onSelect(): void;
  onStart?: () => void;
}) {
  const current = workout.status === "current";
  const completed = workout.status === "done";
  const statusLabel = trainingWeekStatusLabel(workout.status);
  const borderColor = current ? colors.accent : completed ? colors.success : colors.line;
  const backgroundColor = current ? colors.accentSoft : completed ? "rgba(74, 222, 128, 0.08)" : colors.surfaceMuted;

  return (
    <View
      style={{
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor,
        backgroundColor,
        padding: current ? spacing.lg : spacing.md,
        gap: current ? spacing.md : spacing.sm,
      }}
    >
      <Pressable onPress={onSelect} accessibilityRole="button" accessibilityLabel={`${statusLabel}: ${workout.label}, session ${sessionNumber} of ${sessionTotal}`}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text selectable style={{ color: current ? colors.accent : completed ? colors.success : colors.textSubtle, fontSize: 11, lineHeight: 15, fontWeight: "900", textTransform: "uppercase" }}>
              {statusLabel}
            </Text>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={{ color: colors.text, fontSize: current ? 24 : 18, lineHeight: current ? 29 : 23, fontWeight: "900" }}>
              {workout.label}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
              Session {sessionNumber} of {sessionTotal}
            </Text>
            {completed ? (
              <Text selectable style={{ color: colors.success, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
                Completed
              </Text>
            ) : workout.isRecommended && !workout.isSelected ? (
              <Text selectable style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
                Recommended
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      {current && onStart ? <PrimaryButton label="Start workout" onPress={onStart} compact /> : null}
    </View>
  );
}

function trainingWeekStatusLabel(status: "done" | "current" | "upcoming" | "rest"): string {
  if (status === "done") return "Completed";
  if (status === "current") return "Current session";
  if (status === "rest") return "Recovery";
  return "Upcoming";
}

function coachHeadline(momentum: string, recommendation: string): string {
  const lowerMomentum = momentum.toLowerCase();
  if (recommendation.toLowerCase().includes("deload")) return "Fatigue is becoming the limiter.";
  if (recommendation.toLowerCase().includes("advance")) return "A new block may be appropriate soon.";
  if (lowerMomentum.includes("strong")) return "Training is moving in the right direction.";
  if (lowerMomentum.includes("declining")) return "Progress has slowed.";
  return "Stay the course.";
}

function MiniSummary({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Text selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}

function formatProgrammeSkeletonGoal(goal: ProgrammeSkeleton["goal"]): string {
  const labels: Record<ProgrammeSkeleton["goal"], string> = {
    build_muscle: "Build Muscle",
    get_stronger: "Get Stronger",
    build_muscle_strength: "Build Muscle + Strength",
    athletic_performance: "Athletic Performance",
    lose_fat: "Lose Fat",
  };
  return labels[goal];
}

function formatProgrammeSkeletonFramework(framework: ProgrammeSkeleton["framework"]): string {
  const labels: Record<ProgrammeSkeleton["framework"], string> = {
    push_pull_legs: "Push/Pull/Legs",
    upper_lower: "Upper/Lower",
    full_body: "Full Body",
    chest_back_shoulders_arms_legs: "Body Part Split",
    bench_squat_deadlift: "Bench/Squat/Deadlift",
  };
  return labels[framework];
}

function formatProgrammeSkeletonValue(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatHomePersonalRecord(record: PersonalRecordItem): string {
  if (record.type === "load") return `Load PR · ${formatHomeRecordNumber(record.value)}${record.unit ?? ""}`;
  if (record.type === "rep") {
    const load = record.load != null ? `${formatHomeRecordNumber(record.load)}${record.unit ?? ""} × ` : "";
    return `Rep PR · ${load}${record.reps ?? record.value}`;
  }
  if (record.type === "volume") return `Volume PR · ${formatHomeRecordNumber(record.value)}${record.unit ?? ""}`;
  return `e1RM PR · ${formatHomeRecordNumber(record.value)}${record.unit ?? ""}`;
}

function formatHomeRecordNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function ExtraSessionModal({
  visible,
  mode,
  fullType,
  blockType,
  volumeType,
  capacityArea,
  onClose,
  onMode,
  onFullType,
  onBlockType,
  onVolumeType,
  onCapacityArea,
  onStart,
}: {
  visible: boolean;
  mode: ExtraSessionMode;
  fullType: ExtraFullSessionType;
  blockType: BlockType;
  volumeType: ExtraVolumeSessionType;
  capacityArea: CapacityFocusArea;
  onClose(): void;
  onMode(mode: ExtraSessionMode): void;
  onFullType(type: ExtraFullSessionType): void;
  onBlockType(type: BlockType): void;
  onVolumeType(type: ExtraVolumeSessionType): void;
  onCapacityArea(area: CapacityFocusArea): void;
  onStart(): void;
}) {
  const cardioMode = isCardioExtraSessionMode(mode);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" }}>
        <View style={{ maxHeight: "86%", borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg }}>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              Create Extra Session
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Separate from your main plan. Log it if it helps today.
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ gap: spacing.lg }} keyboardShouldPersistTaps="handled">
            <OptionRow
              options={[
                { value: "full", label: "Full Session" },
                { value: "volume", label: "Extra Volume" },
              ]}
              value={mode}
              onChange={onMode}
            />
            {mode === "full" ? (
              <>
                <OptionRow
                  options={[
                    { value: "upper", label: "Upper" },
                    { value: "lower", label: "Lower" },
                    { value: "push", label: "Push" },
                    { value: "pull", label: "Pull" },
                    { value: "legs", label: "Legs" },
                    { value: "full_body", label: "Full Body" },
                  ]}
                  value={fullType}
                  onChange={onFullType}
                />
                <OptionRow
                  options={[
                    { value: "hypertrophy", label: "Hypertrophy" },
                    { value: "powerbuilding", label: "Powerbuilding" },
                    { value: "strength", label: "Strength" },
                    { value: "power", label: "Power" },
                  ]}
                  value={blockType}
                  onChange={onBlockType}
                />
              </>
            ) : mode === "volume" ? (
              <OptionRow
                options={[
                  { value: "upper", label: "Upper" },
                  { value: "lower", label: "Lower" },
                  { value: "push", label: "Push" },
                  { value: "pull", label: "Pull" },
                  { value: "legs", label: "Legs" },
                ]}
                value={volumeType}
                onChange={onVolumeType}
              />
            ) : mode === "capacity" ? (
              <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceMuted, padding: spacing.lg, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Selected capacity track
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 19, lineHeight: 24, fontWeight: "900" }}>
                  Low Back Capacity
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  Trunk control, hip support, and load tolerance. Separate from main workout progression.
                </Text>
              </View>
            ) : cardioMode ? (
              <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceMuted, padding: spacing.lg, gap: spacing.xs }}>
                <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
                  Selected cardio
                </Text>
                <Text selectable style={{ color: colors.text, fontSize: 19, lineHeight: 24, fontWeight: "900" }}>
                  {extraSessionModeLabel(mode)}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {extraSessionModeDetail(mode)}
                </Text>
              </View>
            ) : null}
          </ScrollView>
          <View style={{ gap: spacing.sm }}>
            <PrimaryButton label="Create Session" onPress={() => onStart()} />
            <SecondaryButton label="Cancel" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function isCardioExtraSessionMode(mode: ExtraSessionMode): mode is "recovery_cardio" | "capacity_cardio" | "performance_conditioning" {
  return mode === "recovery_cardio" || mode === "capacity_cardio" || mode === "performance_conditioning";
}

function isExtraSessionMode(value: unknown): value is ExtraSessionMode {
  return (
    value === "full" ||
    value === "volume" ||
    value === "capacity" ||
    value === "recovery_cardio" ||
    value === "capacity_cardio" ||
    value === "performance_conditioning"
  );
}

function extraSessionKindForMode(mode: ExtraSessionMode) {
  if (mode === "full") return "extra_full";
  if (mode === "volume") return "extra_volume";
  if (mode === "capacity") return "extra_capacity";
  return mode;
}

function extraSessionModeLabel(mode: ExtraSessionMode): string {
  if (mode === "recovery_cardio") return "Recovery Cardio";
  if (mode === "capacity_cardio") return "Capacity Cardio";
  if (mode === "performance_conditioning") return "Performance Conditioning";
  return "Extra Session";
}

function extraSessionModeDetail(mode: ExtraSessionMode): string {
  if (mode === "recovery_cardio") return "Easy work for recovery and work capacity. Low fatigue by design.";
  if (mode === "capacity_cardio") return "Moderate conditioning. Useful, but it should not fight the lifting plan.";
  if (mode === "performance_conditioning") return "Event or athletic conditioning when the goal actually calls for it.";
  return "Choose the session type above.";
}

function OptionRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange(value: T): void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {options.map((option) => (
        <Pressable key={option.value} onPress={() => onChange(option.value)} accessibilityRole="button" accessibilityLabel={option.label}>
          <View
            style={{
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: option.value === value ? colors.accent : colors.line,
              backgroundColor: option.value === value ? colors.accentSoft : colors.surfaceMuted,
              paddingHorizontal: spacing.md,
              paddingVertical: 10,
            }}
          >
            <Text selectable style={{ color: option.value === value ? colors.accent : colors.textMuted, fontSize: 13, lineHeight: 17, fontWeight: "900" }}>
              {option.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
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

function focusLabelForWorkout(workoutName: string, exerciseNames: string[]): string {
  const lower = workoutName.toLowerCase();
  if (lower.includes("push")) return "Chest, shoulders and triceps";
  if (lower.includes("pull")) return "Back and biceps";
  if (lower.includes("legs")) return "Quads, hamstrings and glutes";
  if (lower.includes("upper")) return "Pressing, pulling and shoulders";
  if (lower.includes("lower")) return "Squat, hinge and lower body";
  if (lower.includes("arms")) return "Biceps, triceps and forearms";
  if (lower.includes("full")) return "Full-body productive work";
  const joined = exerciseNames.join(" ").toLowerCase();
  if (joined.includes("bench") || joined.includes("press")) return "Pressing strength and accessories";
  if (joined.includes("row") || joined.includes("pulldown")) return "Pulling strength and back volume";
  if (joined.includes("squat") || joined.includes("leg")) return "Lower-body productive work";
  return "Productive work for today’s session";
}

function completedSessionsForWeek(sessions: ReturnType<typeof workoutSessionRepository.list>, date: Date) {
  const weekStart = startOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return sessions
    .filter((session) => {
      if (!session.completedAt) return false;
      const completedAt = new Date(session.completedAt);
      return completedAt >= weekStart && completedAt < weekEnd;
    })
    .sort((a, b) => new Date(b.completedAt ?? "").getTime() - new Date(a.completedAt ?? "").getTime());
}
