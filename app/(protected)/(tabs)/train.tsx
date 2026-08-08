import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  BackHandler,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { loadPlannedSession } from "@/application/training/canonical-active-plan-application";
import {
  completeCanonicalSession,
  discardLatestCanonicalSessionAttempt,
  editCanonicalPerformedWork,
  prescriptionHash,
  recordCanonicalPerformedWork,
  restoreCanonicalRecordedSessionFromLedger,
  resumeCanonicalSession,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import {
  acknowledgeCanonicalRestExpiry,
  addCanonicalRestTime,
  pauseCanonicalRestTimer,
  restoreCanonicalRestTimer,
  resumeCanonicalRestTimer,
  skipCanonicalRestTimer,
} from "@/application/training/canonical-rest-timer";
import {
  baseKgFromDisplayLoad,
  projectCanonicalWorkoutPresentation,
  type WorkoutExercisePresentation,
  type WorkoutPresentation,
  type WorkoutSetPresentation,
} from "@/application/training/canonical-workout-presentation";
import {
  canonicalTrainNarrowLayout,
  canonicalTrainWorkoutActions,
  resolveCanonicalTrainCompletionAffordance,
  validateCanonicalCalibrationEntry,
  validateCanonicalTrainSetEntry,
} from "@/application/training/canonical-train-interaction";
import { minimiseCanonicalActiveWorkout } from "@/application/training/canonical-train-navigation";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { hapticFeedback } from "@/application/training/haptic-feedback";
import { AppScreen, PrimaryButton, SecondaryButton, stableUiIdentifier } from "@/ui/primitives";
import { type, workoutColors } from "@/ui/theme";
import { WorkoutMetricStrip, WorkoutStage } from "@/ui/workout-visuals";
import { useReducedMotion } from "@/ui/motion";

type RouteParams = Readonly<{
  planId?: string;
  planRevision?: string;
  plannedSessionId?: string;
  recordedSessionId?: string;
  action?: string;
  lifecycle?: string;
  exerciseEditMessage?: string;
}>;
type SetValues = Readonly<{ reps: string; load: string }>;
type EditState = Readonly<{ setId: string; reps: string; load: string }>;
type TrainModal = "actions" | "discard" | "finish_early" | "finish_complete" | null;

const TRAIN_NUMERIC_KEYBOARD_ACCESSORY_ID = "train-numeric-keyboard-accessory";

const TRAIN = workoutColors;

function operationId(prefix: string): string { return `train:${prefix}:${Date.now()}`; }

export default function TrainScreen() {
  const subscription = useSubscription();
  if (!subscription.isPremium) return <TrainPaywall onRestore={subscription.restorePurchases} />;
  return <CanonicalTrainExperience />;
}

function CanonicalTrainExperience() {
  const params = useLocalSearchParams<RouteParams>();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const { settings } = useAppSettings();
  const scrollRef = useRef<ScrollView>(null);
  const inFlightSets = useRef(new Set<string>());
  const routeResumeAttempt = useRef<string | null>(null);
  const [renderVersion, refresh] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<"reps" | "load" | null>(null);
  const [setValues, setSetValues] = useState<Record<string, SetValues>>({});
  const [calibrationDrafts, setCalibrationDrafts] = useState<Record<string, SetValues>>({});
  const [calibrationLoads, setCalibrationLoads] = useState<Record<string, number>>({});
  const [editState, setEditState] = useState<EditState | null>(null);
  const [recordedId, setRecordedId] = useState<string | undefined>(undefined);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [exerciseSwitcherOpen, setExerciseSwitcherOpen] = useState(false);
  const [modal, setModal] = useState<TrainModal>(null);
  const [busy, setBusy] = useState(false);
  const [timerTick, setTimerTick] = useState(() => Date.now());
  const [nextInstruction, setNextInstruction] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    canonicalActivePlanState.hydrate();
    return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1));
  }, []);
  useEffect(() => {
    if (params.exerciseEditMessage) setMessage(String(params.exerciseEditMessage));
  }, [params.exerciseEditMessage]);

  const plan = canonicalActivePlanState.getReadModel();
  const route = useMemo(() => ({
    planId: String(params.planId ?? ""),
    revision: Number(params.planRevision),
    plannedSessionId: params.plannedSessionId ? String(params.plannedSessionId) : undefined,
    recordedSessionId: params.recordedSessionId ? String(params.recordedSessionId) : undefined,
    lifecycle: params.lifecycle ? String(params.lifecycle) : undefined,
  }), [params.lifecycle, params.planId, params.planRevision, params.plannedSessionId, params.recordedSessionId]);

  useEffect(() => {
    const nextRecordedId = route.lifecycle === "start"
      ? plan?.activeRecordedSession?.recordedSessionId ?? undefined
      : route.recordedSessionId ?? plan?.activeRecordedSession?.recordedSessionId ?? undefined;
    if (nextRecordedId !== recordedId) setRecordedId(nextRecordedId);
  }, [plan?.activeRecordedSession?.recordedSessionId, recordedId, route.lifecycle, route.recordedSessionId]);

  const aggregate = recordedId ? canonicalRecordedSessionLedger.get(recordedId) : { status: "not_found" as const };
  const plannedId = route.plannedSessionId ?? plan?.nextSession?.id;
  const snapshot = aggregate.status === "found"
    ? aggregate.session.prescriptionSnapshot
    : plannedId ? loadPlannedSession(plannedId)?.prescriptionSnapshot ?? null : null;
  const evidence = plan ? canonicalProgressEvidenceRepository.list(plan.planId) : [];
  const presentation = snapshot ? projectCanonicalWorkoutPresentation({
    session: aggregate.status === "found" ? aggregate.session : null,
    snapshot,
    events: aggregate.status === "found" ? aggregate.events : [],
    evidence,
    displayUnit: settings.unit,
    now: timerTick,
  }) : null;
  const restTimer = recordedId ? restoreCanonicalRestTimer(recordedId) : null;
  const restSeconds = restTimer?.state === "paused"
    ? restTimer.remainingSeconds ?? 0
    : restTimer?.state === "running" ? Math.max(0, Math.ceil((restTimer.expiresAt - timerTick) / 1000)) : 0;
  const layout = canonicalTrainNarrowLayout(width, fontScale);

  useEffect(() => {
    if (!recordedId || aggregate.status !== "found" || aggregate.session.status === "completed") return;
    const timer = setInterval(() => setTimerTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [aggregate.status === "found" ? aggregate.session.status : "missing", recordedId]);

  useEffect(() => {
    if (!recordedId || restTimer?.state !== "expired" || restTimer.expiryAcknowledged) return;
    void AccessibilityInfo.announceForAccessibility("Rest complete. Continue with the next prescribed action.");
    awaitHaptic(hapticFeedback.restFinished());
    acknowledgeCanonicalRestExpiry(recordedId);
    refresh((value) => value + 1);
  }, [recordedId, restTimer?.expiryAcknowledged, restTimer?.state]);

  useEffect(() => {
    if (!presentation?.exercises.length) return;
    if (activeExerciseId && presentation.exercises.some((exercise) => exercise.id === activeExerciseId)) return;
    const next = presentation.exercises.find((exercise) => exercise.sets.some((set) => set.state === "current")) ?? presentation.exercises[0];
    setActiveExerciseId(next?.id ?? null);
  }, [activeExerciseId, presentation?.id, presentation?.completedSets]);

  const openPlanned = () => {
    if (!plan || !plannedId || plan.revision !== (Number.isInteger(route.revision) ? route.revision : plan.revision)) {
      setMessage("This planned session is no longer current. Return to Home and refresh.");
      return;
    }
    const planned = loadPlannedSession(plannedId);
    if (!planned) { setMessage("This planned session is no longer available."); return; }
    setBusy(true);
    const result = startCanonicalSession({
      planId: plan.planId,
      expectedPlanRevision: plan.revision,
      plannedSessionId: planned.id,
      expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot),
      operationId: operationId("start"),
      startedAt: new Date().toISOString(),
      provenance: "canonical_train",
    });
    if (result.recordedSessionId) setRecordedId(result.recordedSessionId);
    setMessage(friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
  };

  const restoreRecorded = () => {
    if (!plan || !recordedId) { setMessage("This recorded session cannot be restored."); return; }
    const result = restoreCanonicalRecordedSessionFromLedger(plan.planId, recordedId);
    setMessage(result.status === "restored" ? "Workout restored" : friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
  };

  const pauseAndLeave = () => {
    if (!plan || aggregate.status !== "found") return;
    setBusy(true);
    const result = minimiseCanonicalActiveWorkout({
      planId: plan.planId,
      planRevision: plan.revision,
      recordedSessionId: aggregate.session.recordedSessionId,
      ledgerVersion: aggregate.session.version,
      lifecycle: aggregate.session.status,
      operationId: operationId("minimise"),
      occurredAt: new Date().toISOString(),
      provenance: "canonical_train",
    });
    setMessage(result.status === "applied" || result.status === "idempotent" ? null : friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
    if (result.status === "applied" || result.status === "idempotent") { setModal(null); router.replace("/(protected)/(tabs)"); }
  };

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (aggregate.status === "found" && ["started", "paused"].includes(aggregate.session.status)) pauseAndLeave();
      else router.replace("/(protected)/(tabs)");
      return true;
    });
    return () => listener.remove();
  }, [
    aggregate.status === "found" ? aggregate.session.status : "missing",
    aggregate.status === "found" ? aggregate.session.version : -1,
    plan?.planId,
    plan?.revision,
  ]);

  const resume = () => {
    if (!plan || aggregate.status !== "found") return;
    setBusy(true);
    const result = resumeCanonicalSession(lifecycleCommand(plan.planId, plan.revision, aggregate.session.recordedSessionId, aggregate.session.version, "resume"));
    setMessage(friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
  };

  useEffect(() => {
    if (route.lifecycle !== "resume" || !plan || !recordedId || aggregate.status !== "found" || aggregate.session.status !== "paused") return;
    const attempt = `${recordedId}:${aggregate.session.version}`;
    if (routeResumeAttempt.current === attempt) return;
    routeResumeAttempt.current = attempt;
    resume();
  }, [aggregate.status === "found" ? aggregate.session.status : "missing", aggregate.status === "found" ? aggregate.session.version : -1, plan?.planId, plan?.revision, recordedId, route.lifecycle]);

  const discard = () => {
    if (!plan || aggregate.status !== "found") return;
    setBusy(true);
    try {
      const result = discardLatestCanonicalSessionAttempt({
        planId: plan.planId,
        recordedSessionId: aggregate.session.recordedSessionId,
        operationId: operationId("discard"),
        occurredAt: new Date().toISOString(),
        provenance: "canonical_train",
      });
      setMessage(friendlyReason(result.reason));
      if (result.status === "applied" || result.status === "idempotent") {
        canonicalActivePlanState.refresh();
        setRecordedId(undefined);
        setModal(null);
        router.replace("/(protected)/(tabs)");
      }
    } catch {
      setMessage("Discard did not complete. Your workout is still saved; try again.");
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (!plan || aggregate.status !== "found" || !presentation?.finishAllowed) return;
    setBusy(true);
    const result = completeCanonicalSession(lifecycleCommand(plan.planId, plan.revision, aggregate.session.recordedSessionId, aggregate.session.version, "complete"));
    setMessage(friendlyReason(result.reason));
    setBusy(false);
    if (result.status === "applied" || result.status === "idempotent") {
      awaitHaptic(hapticFeedback.workoutCompleted());
      setModal(null);
      router.replace(`/(protected)/completion-summary?recordedSessionId=${encodeURIComponent(aggregate.session.recordedSessionId)}`);
      return;
    }
    canonicalActivePlanState.refresh();
  };

  const confirmCalibration = (exercise: WorkoutExercisePresentation) => {
    const calibration = exercise.calibration;
    if (!calibration) return;
    const draft = calibrationDrafts[exercise.id] ?? { reps: String(calibration.targetReps), load: "" };
    const result = validateCanonicalCalibrationEntry({ repsText: draft.reps, loadText: draft.load, exactTargetReps: calibration.targetReps, displayUnit: settings.unit });
    if (result.status === "invalid") { setFieldError(result.field); setMessage(result.reason); return; }
    setFieldError(null);
    const displayLoad = Number(draft.load);
    setCalibrationLoads((current) => ({ ...current, [exercise.id]: displayLoad }));
    setSetValues((current) => ({
      ...current,
      ...Object.fromEntries(exercise.sets.filter((set) => set.state !== "completed").map((set) => [set.id, { reps: String(set.targetReps), load: String(displayLoad) }])),
    }));
    setMessage("Starting load confirmed. Ramp work remains separate; completed working sets will retain the evidence.");
  };

  const valuesFor = (exercise: WorkoutExercisePresentation, set: WorkoutSetPresentation): SetValues => {
    const defaultLoad = calibrationLoads[exercise.id] ?? set.defaultLoad;
    return setValues[set.id] ?? { reps: String(set.targetReps), load: defaultLoad === null ? "" : String(defaultLoad) };
  };

  const recordSet = (exercise: WorkoutExercisePresentation, set: WorkoutSetPresentation) => {
    if (!plan || aggregate.status !== "found" || aggregate.session.status !== "started") return;
    if (exercise.calibration?.required && calibrationLoads[exercise.id] === undefined && set.defaultLoad === null) {
      setMessage("Confirm the starting load before the first working set.");
      setFieldError("load");
      return;
    }
    if (inFlightSets.current.has(set.id)) return;
    const values = valuesFor(exercise, set);
    const validated = validateCanonicalTrainSetEntry({ repsText: values.reps, loadText: values.load, loadSemantic: set.loadSemantic, displayUnit: settings.unit });
    if (validated.status === "invalid") { setFieldError(validated.field); setMessage(validated.reason); return; }
    const fresh = canonicalRecordedSessionLedger.get(aggregate.session.recordedSessionId);
    if (fresh.status !== "found" || fresh.events.some((event) => event.type === "performance" && event.payload.setId === set.id)) return;
    const slots = Array.isArray((snapshot as Record<string, unknown>).slots) ? (snapshot as { slots: readonly Record<string, unknown>[] }).slots : [];
    const slot = slots.find((candidate) => String(candidate.id) === exercise.id);
    if (!slot) { setMessage("This prescribed exercise is no longer available."); return; }
    inFlightSets.current.add(set.id);
    setFieldError(null);
    const result = recordCanonicalPerformedWork({
      planId: plan.planId,
      expectedPlanRevision: plan.revision,
      recordedSessionId: fresh.session.recordedSessionId,
      expectedLedgerVersion: fresh.session.version,
      operationId: operationId(`set:${set.id}`),
      occurredAt: new Date().toISOString(),
      provenance: "canonical_train",
      slotId: exercise.id,
      exerciseId: String(slot.exerciseId),
      setId: set.id,
      setOrder: set.number,
      reps: validated.reps,
      load: validated.baseLoadKg,
      unit: "kg",
      completion: "complete",
    });
    setMessage(result.status === "applied" || result.status === "idempotent" ? null : friendlyReason(result.reason));
    setNextInstruction(result.nextInstruction ?? null);
    if (result.status === "applied") {
      awaitHaptic(hapticFeedback.setCompleted());
      void AccessibilityInfo.announceForAccessibility("Set completed");
      const remainingInExercise = exercise.sets.filter((candidate) => candidate.state !== "completed" && candidate.id !== set.id);
      if (remainingInExercise.length === 0) setActiveExerciseId(null);
    }
    canonicalActivePlanState.refresh();
    inFlightSets.current.delete(set.id);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion }));
  };

  const beginEdit = (set: WorkoutSetPresentation) => {
    setEditState({ setId: set.id, reps: String(set.actualReps ?? set.targetReps), load: set.actualLoad === null ? "" : String(set.actualLoad) });
    setMessage(null);
  };

  const saveEdit = (exercise: WorkoutExercisePresentation, set: WorkoutSetPresentation) => {
    if (!plan || aggregate.status !== "found" || !editState || editState.setId !== set.id) return;
    const validated = validateCanonicalTrainSetEntry({ repsText: editState.reps, loadText: editState.load, loadSemantic: set.loadSemantic, displayUnit: settings.unit });
    if (validated.status === "invalid") { setFieldError(validated.field); setMessage(validated.reason); return; }
    const fresh = canonicalRecordedSessionLedger.get(aggregate.session.recordedSessionId);
    if (fresh.status !== "found") return;
    const slots = Array.isArray((snapshot as Record<string, unknown>).slots) ? (snapshot as { slots: readonly Record<string, unknown>[] }).slots : [];
    const slot = slots.find((candidate) => String(candidate.id) === exercise.id);
    if (!slot) { setMessage("This prescribed exercise is no longer available."); return; }
    const result = editCanonicalPerformedWork({
      planId: plan.planId,
      expectedPlanRevision: plan.revision,
      recordedSessionId: fresh.session.recordedSessionId,
      expectedLedgerVersion: fresh.session.version,
      operationId: operationId(`edit:${set.id}`),
      occurredAt: new Date().toISOString(),
      provenance: "canonical_train",
      slotId: exercise.id,
      exerciseId: String(slot.exerciseId),
      setId: set.id,
      setOrder: set.number,
      reps: validated.reps,
      load: validated.baseLoadKg,
      unit: "kg",
      completion: "complete",
    });
    setMessage(friendlyReason(result.reason));
    setNextInstruction(result.nextInstruction ?? null);
    if (result.status === "applied") setEditState(null);
    canonicalActivePlanState.refresh();
  };

  const restAction = (action: "pause" | "resume" | "add" | "skip") => {
    if (!recordedId) return;
    if (action === "pause") pauseCanonicalRestTimer(recordedId);
    if (action === "resume") resumeCanonicalRestTimer(recordedId);
    if (action === "add") addCanonicalRestTime(recordedId, 30);
    if (action === "skip") skipCanonicalRestTimer(recordedId);
    setTimerTick(Date.now());
    refresh((value) => value + 1);
  };

  const leavePreview = () => router.replace("/(protected)/(tabs)");

  if (!plan) return <UnavailableState message="Your canonical training plan is not ready." onReturn={leavePreview} />;
  if (!recordedId && plannedId && snapshot && presentation) {
    return <TrainShell insets={insets} presentation={presentation} onMinimise={leavePreview}>
      <WorkoutPreview presentation={presentation} busy={busy} onStart={openPlanned} message={message} />
    </TrainShell>;
  }
  if (aggregate.status !== "found" || !snapshot || !presentation) {
    const boundary = plan.progress.latestDecision?.boundaryState;
    return <UnavailableState
      message={boundary ? "Your next training step needs review." : "This session could not be restored safely."}
      onReturn={leavePreview}
      onRestore={recordedId ? restoreRecorded : undefined}
      detail={boundary ? plan.progress.latestDecision?.explanation : message}
    />;
  }

  const activeExercise = presentation.exercises.find((exercise) => exercise.id === activeExerciseId) ?? presentation.exercises[0];
  const activeExerciseIndex = Math.max(0, presentation.exercises.findIndex((exercise) => exercise.id === activeExercise?.id));
  const lastInstruction = nextInstruction ?? [...aggregate.events].reverse().find((event) => event.type === "performance" && typeof event.payload.nextInstruction === "string")?.payload.nextInstruction as string | null | undefined;
  const paused = aggregate.session.status === "paused";
  const completion = resolveCanonicalTrainCompletionAffordance(presentation.completedSets, presentation.totalSets, presentation.finishAllowed);
  const positiveFeedback = message ? isPositiveTrainFeedback(message) : false;
  const selectExercise = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
    setExerciseSwitcherOpen(false);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion }));
  };
  const keyboardAction = (() => {
    if (!activeExercise || paused) return { label: "Done", run: Keyboard.dismiss };
    if (editState) {
      const editedSet = activeExercise.sets.find((set) => set.id === editState.setId);
      return editedSet
        ? { label: "Save set", run: () => { saveEdit(activeExercise, editedSet); Keyboard.dismiss(); } }
        : { label: "Done", run: Keyboard.dismiss };
    }
    if (activeExercise.calibration?.required && calibrationLoads[activeExercise.id] === undefined) {
      return { label: "Confirm load", run: () => { confirmCalibration(activeExercise); Keyboard.dismiss(); } };
    }
    const currentSet = activeExercise.sets.find((set) => set.state === "current");
    return currentSet
      ? { label: "Log set", run: () => { recordSet(activeExercise, currentSet); Keyboard.dismiss(); } }
      : { label: "Done", run: Keyboard.dismiss };
  })();

  return <TrainShell
    insets={insets}
    presentation={presentation}
    onMinimise={() => { Keyboard.dismiss(); pauseAndLeave(); }}
    onActions={() => { Keyboard.dismiss(); setMessage(null); setModal("actions"); }}
  >
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex} keyboardVerticalOffset={0}>
      <ScrollView ref={scrollRef} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 76 }]}>
        {message ? <View testID="train-feedback" accessibilityLiveRegion={positiveFeedback ? "polite" : "assertive"} style={[styles.feedbackBanner, positiveFeedback && styles.feedbackBannerPositive]}><Text style={[styles.feedbackText, positiveFeedback && styles.feedbackTextPositive]}>{message}</Text></View> : null}
        {paused ? <PausedBanner busy={busy} onResume={resume} /> : null}
        {restTimer && restTimer.state !== "skipped" ? <RestPanel timer={restTimer} seconds={restSeconds} nextInstruction={lastInstruction ?? null} onAction={restAction} /> : null}
        {(!restTimer || restTimer.state === "skipped") && lastInstruction?.startsWith("Move directly")
          ? <View testID="train-next-instruction" accessibilityRole="summary" style={styles.nextInstruction}><Text style={styles.nextInstructionLabel}>UP NEXT</Text><Text style={styles.nextInstructionText}>{lastInstruction}</Text></View>
          : null}
        <ExerciseNavigator
          exercises={presentation.exercises}
          activeIndex={activeExerciseIndex}
          onPrevious={() => activeExerciseIndex > 0 && selectExercise(presentation.exercises[activeExerciseIndex - 1]!.id)}
          onNext={() => activeExerciseIndex < presentation.exercises.length - 1 && selectExercise(presentation.exercises[activeExerciseIndex + 1]!.id)}
          onOpen={() => setExerciseSwitcherOpen(true)}
        />
        <Pressable testID={stableUiIdentifier("action", "Swap or add exercise")} accessibilityRole="button" accessibilityLabel="Swap or add exercise" onPress={() => router.push({ pathname: "/(protected)/programmes/manage", params: { recordedSessionId: aggregate.session.recordedSessionId, plannedSessionId: aggregate.session.plannedSessionId } })} style={({ pressed }) => [styles.exerciseEditAction, pressed && styles.pressed]}><Text style={styles.exerciseEditActionText}>Swap or add exercise</Text><Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.exerciseEditGlyph}>›</Text></Pressable>
        {activeExercise ? <ActiveExerciseCard
          key={activeExercise.id}
          exercise={activeExercise}
          displayUnit={settings.unit}
          paused={paused}
          layout={layout}
          valuesFor={valuesFor}
          setValues={setValues}
          setSetValues={setSetValues}
          calibrationDraft={calibrationDrafts[activeExercise.id]}
          setCalibrationDraft={(value) => setCalibrationDrafts((current) => ({ ...current, [activeExercise.id]: value }))}
          calibrationConfirmed={calibrationLoads[activeExercise.id] !== undefined || activeExercise.calibration?.required === false}
          onConfirmCalibration={() => confirmCalibration(activeExercise)}
          fieldError={fieldError}
          editState={editState}
          setEditState={setEditState}
          onBeginEdit={beginEdit}
          onSaveEdit={(set) => saveEdit(activeExercise, set)}
          onComplete={(set) => recordSet(activeExercise, set)}
        /> : null}
        {completion.normalFinishAvailable ? <FinishPanel presentation={presentation} busy={busy} onFinish={() => setModal("finish_complete")} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
    {Platform.OS === "ios" ? <InputAccessoryView nativeID={TRAIN_NUMERIC_KEYBOARD_ACCESSORY_ID}><View style={styles.keyboardAccessory}><Pressable testID="train-keyboard-action" accessibilityRole="button" accessibilityLabel={keyboardAction.label} onPress={keyboardAction.run} style={({ pressed }) => [styles.keyboardDone, pressed && styles.pressed]}><Text maxFontSizeMultiplier={1.4} style={styles.keyboardDoneText}>{keyboardAction.label}</Text></Pressable></View></InputAccessoryView> : null}
    <TrainActionModal
      modal={modal}
      reduceMotion={reduceMotion}
      busy={busy}
      message={message}
      onContinue={() => setModal(null)}
      onMinimise={pauseAndLeave}
      onRequestDiscard={() => { Keyboard.dismiss(); setModal("discard"); }}
      onDiscard={discard}
      completion={completion}
      onRequestFinishEarly={() => setModal("finish_early")}
      onFinish={finish}
    />
    <ExerciseSwitcherModal
      visible={exerciseSwitcherOpen}
      reduceMotion={reduceMotion}
      exercises={presentation.exercises}
      activeId={activeExercise?.id ?? ""}
      onSelect={selectExercise}
      onClose={() => setExerciseSwitcherOpen(false)}
    />
  </TrainShell>;
}

function TrainShell({ insets, presentation, onMinimise, onActions, children }: Readonly<{ insets: { top: number; bottom: number }; presentation: WorkoutPresentation; onMinimise(): void; onActions?: () => void; children: React.ReactNode }>) {
  return <View style={[styles.shell, { paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable testID="train-minimise" accessibilityRole="button" accessibilityLabel="Minimise workout and return to Home" hitSlop={8} onPress={onMinimise} style={({ pressed }) => [styles.headerControl, pressed && styles.pressed]}><Text maxFontSizeMultiplier={1.25} style={styles.minimiseGlyph}>⌄</Text></Pressable>
      <View style={styles.headerTitleArea}>
        <Text maxFontSizeMultiplier={1.35} numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{presentation.title}</Text>
        <Text accessibilityLabel={`${formatElapsed(presentation.elapsedSeconds)} elapsed. ${presentation.completedSets} of ${presentation.totalSets} current-session working sets complete.`} maxFontSizeMultiplier={1.25} numberOfLines={1} ellipsizeMode="tail" style={styles.headerMeta}>{formatElapsed(presentation.elapsedSeconds)} · {presentation.completedSets} of {presentation.totalSets} sets</Text>
      </View>
      {onActions ? <Pressable testID="train-actions" accessibilityRole="button" accessibilityLabel="Workout actions" hitSlop={8} onPress={onActions} style={({ pressed }) => [styles.headerControl, pressed && styles.pressed]}><Text maxFontSizeMultiplier={1.25} style={styles.actionsGlyph}>•••</Text></Pressable> : <View style={styles.headerPercent}><Text maxFontSizeMultiplier={1.25} numberOfLines={1} style={styles.headerPercentText}>{presentation.progressPercent}%</Text></View>}
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel={`${presentation.progressPercent}% of working sets complete`} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${presentation.progressPercent}%` }]} /></View>
    <View style={styles.flex}>{children}</View>
  </View>;
}

function WorkoutPreview({ presentation, busy, onStart, message }: Readonly<{ presentation: WorkoutPresentation; busy: boolean; onStart(): void; message: string | null }>) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return <ScrollView contentContainerStyle={styles.previewContent}>
    <WorkoutStage eyebrow="Workout preview" title={presentation.title} detail={presentation.purpose}>
      <WorkoutMetricStrip items={[
        { label: "Exercises", value: String(presentation.exercises.length) },
        { label: "Working sets", value: String(presentation.totalSets) },
        { label: "Estimate", value: `${presentation.estimatedDurationMinutes ?? "—"} min` },
      ]} />
    </WorkoutStage>
    <Pressable testID="train-start" accessibilityRole="button" accessibilityLabel="Start workout" disabled={busy} onPress={onStart} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed, busy && styles.disabled]}><Text numberOfLines={1} style={styles.primaryActionText}>{busy ? "Starting…" : "Start workout"}</Text></Pressable>
    <Text style={styles.startReassurance}>Your workout is not recorded until you start. You can still review every exercise below.</Text>
    <Pressable testID="train-preview-details-toggle" accessibilityRole="button" accessibilityState={{ expanded: detailsOpen }} accessibilityLabel={`${detailsOpen ? "Hide" : "Review"} full workout prescription`} onPress={() => setDetailsOpen((open) => !open)} style={({ pressed }) => [styles.disclosureRow, pressed && styles.pressed]}><Text style={styles.disclosureText}>{detailsOpen ? "Hide workout details" : `Review ${presentation.exercises.length} exercises`}</Text><Text style={styles.disclosureGlyph}>{detailsOpen ? "⌃" : "⌄"}</Text></Pressable>
    {detailsOpen ? <View style={styles.previewList}>{presentation.exercises.map((exercise) => <View key={exercise.id} style={styles.previewExercise}>
      <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{exercise.order}</Text></View>
      <View style={styles.previewExerciseText}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.smallMuted}>{exercise.sets.length} sets · {exercise.sets.map((set) => set.target).join(" / ")}</Text>
        <Text style={styles.smallMuted}>{exercise.sets[0]?.loadLabel} · {exercise.method}</Text>
        <Text style={styles.methodSummary}>{exercise.methodExecution.instruction}</Text>
      </View>
    </View>)}</View> : null}
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </ScrollView>;
}

function ExerciseNavigator({ exercises, activeIndex, onPrevious, onNext, onOpen }: Readonly<{
  exercises: readonly WorkoutExercisePresentation[];
  activeIndex: number;
  onPrevious(): void;
  onNext(): void;
  onOpen(): void;
}>) {
  const exercise = exercises[activeIndex];
  if (!exercise) return null;
  const completed = exercise.sets.filter((set) => set.state === "completed").length;
  return <View testID="train-exercise-navigator" style={styles.exerciseNavigator}>
    <Pressable testID="train-exercise-previous" accessibilityRole="button" accessibilityLabel="Previous exercise" accessibilityState={{ disabled: activeIndex === 0 }} disabled={activeIndex === 0} onPress={onPrevious} style={({ pressed }) => [styles.exerciseNavArrow, activeIndex === 0 && styles.disabled, pressed && styles.pressed]}><Text style={styles.exerciseNavArrowText}>‹</Text></Pressable>
    <Pressable testID="train-exercise-switcher-open" accessibilityRole="button" accessibilityLabel={`Open exercise list. Exercise ${activeIndex + 1} of ${exercises.length}, ${exercise.name}`} onPress={onOpen} style={({ pressed }) => [styles.exerciseNavigatorMain, pressed && styles.pressed]}>
      <Text style={styles.eyebrow}>EXERCISE {activeIndex + 1} OF {exercises.length}</Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.exerciseNavigatorName}>{exercise.name}</Text>
      <Text style={styles.tinyMuted}>{completed} of {exercise.sets.length} sets complete · View all</Text>
    </Pressable>
    <Pressable testID="train-exercise-next" accessibilityRole="button" accessibilityLabel="Next exercise" accessibilityState={{ disabled: activeIndex === exercises.length - 1 }} disabled={activeIndex === exercises.length - 1} onPress={onNext} style={({ pressed }) => [styles.exerciseNavArrow, activeIndex === exercises.length - 1 && styles.disabled, pressed && styles.pressed]}><Text style={styles.exerciseNavArrowText}>›</Text></Pressable>
  </View>;
}

function ExerciseSwitcherModal({ visible, reduceMotion, exercises, activeId, onSelect, onClose }: Readonly<{
  visible: boolean;
  reduceMotion: boolean;
  exercises: readonly WorkoutExercisePresentation[];
  activeId: string;
  onSelect(id: string): void;
  onClose(): void;
}>) {
  return <Modal visible={visible} transparent animationType={reduceMotion ? "none" : "slide"} onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.modalBackdrop}><View accessibilityViewIsModal style={styles.modalSheet}>
      <ScrollView bounces={false} contentContainerStyle={styles.modalContent}>
        <View style={styles.switcherHeading}><View style={styles.flex}><Text style={styles.modalTitle}>Exercises</Text><Text style={styles.smallMuted}>Choose an exercise without changing its prescription or method order.</Text></View><Pressable testID="train-exercise-switcher-close" accessibilityRole="button" accessibilityLabel="Close exercise list" onPress={onClose} style={styles.switcherClose}><Text style={styles.switcherCloseText}>×</Text></Pressable></View>
        <View accessibilityRole="tablist" style={styles.switcherList}>{exercises.map((exercise) => {
          const completedSets = exercise.sets.filter((set) => set.state === "completed").length;
          const complete = completedSets === exercise.sets.length;
          const active = exercise.id === activeId;
          const status = complete ? "completed" : active ? "current" : "upcoming";
          return <Pressable key={exercise.id} testID={`train-exercise-${exercise.order}`} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`Exercise ${exercise.order} of ${exercises.length}, ${exercise.name}, ${status}, ${completedSets} of ${exercise.sets.length} sets complete`} onPress={() => onSelect(exercise.id)} style={({ pressed }) => [styles.switcherItem, active && styles.switcherItemActive, pressed && styles.pressed]}>
            <View style={[styles.switcherIndex, complete && styles.switcherIndexComplete]}><Text style={styles.switcherIndexText}>{complete ? "✓" : exercise.order}</Text></View>
            <View style={styles.flex}><Text numberOfLines={1} style={[styles.exerciseTabName, active && styles.accentText]}>{exercise.name}</Text><Text style={styles.tinyMuted}>{completedSets} of {exercise.sets.length} sets · {exercise.methodExecution.sequenceLabel ?? exercise.method}</Text></View>
            <Text style={[styles.switcherStatus, complete && styles.successText]}>{status}</Text>
          </Pressable>;
        })}</View>
      </ScrollView>
    </View></View>
  </Modal>;
}

function ActiveExerciseCard(props: Readonly<{
  exercise: WorkoutExercisePresentation;
  displayUnit: "kg" | "lb";
  paused: boolean;
  layout: ReturnType<typeof canonicalTrainNarrowLayout>;
  valuesFor(exercise: WorkoutExercisePresentation, set: WorkoutSetPresentation): SetValues;
  setValues: Record<string, SetValues>;
  setSetValues(value: React.SetStateAction<Record<string, SetValues>>): void;
  calibrationDraft?: SetValues;
  setCalibrationDraft(value: SetValues): void;
  calibrationConfirmed: boolean;
  onConfirmCalibration(): void;
  fieldError: "reps" | "load" | null;
  editState: EditState | null;
  setEditState(value: EditState | null): void;
  onBeginEdit(set: WorkoutSetPresentation): void;
  onSaveEdit(set: WorkoutSetPresentation): void;
  onComplete(set: WorkoutSetPresentation): void;
}>) {
  const { exercise } = props;
  const [allSetsOpen, setAllSetsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const firstIncomplete = exercise.sets.find((set) => set.state !== "completed");
  const completedSetCount = exercise.sets.filter((set) => set.state === "completed").length;
  const displayedSets = allSetsOpen
    ? exercise.sets
    : firstIncomplete ? [firstIncomplete] : exercise.sets.slice(-1);
  const calibration = exercise.calibration;
  const draft = props.calibrationDraft ?? { reps: String(calibration?.targetReps ?? firstIncomplete?.targetReps ?? ""), load: "" };
  return <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeading}>
      <View style={styles.exerciseHeadingText}>
        <Text style={styles.eyebrow}>EXERCISE {exercise.order}</Text>
        <Text style={styles.activeExerciseName}>{exercise.name}</Text>
        <Text style={styles.body}>{completedSetCount} of {exercise.sets.length} sets complete · {exercise.method}</Text>
        <Text style={styles.smallMuted}>{firstIncomplete ? `Current target ${firstIncomplete.target} · ${exercise.loadState}` : "All prescribed sets complete"}</Text>
        {exercise.previousPerformance ? <Text style={styles.previous}>Previous: {exercise.previousPerformance}</Text> : null}
      </View>
    </View>
    {calibration?.required && !props.calibrationConfirmed ? <View style={styles.calibrationPanel}>
      <Text style={styles.calibrationTitle}>{calibration.title}</Text>
      <Text style={styles.body}>{calibration.instruction}</Text>
      <Text style={styles.smallMuted}>{calibration.rampInstruction}</Text>
      <View style={styles.calibrationInputs}>
        <Field testID="train-calibration-reps" label="Successful reps" value={draft.reps} unit="reps" keyboardType="number-pad" error={props.fieldError === "reps"} onChange={(reps) => props.setCalibrationDraft({ ...draft, reps })} />
        <Field testID="train-calibration-load" label="Successful load" value={draft.load} unit={props.displayUnit} keyboardType="decimal-pad" error={props.fieldError === "load"} onChange={(load) => props.setCalibrationDraft({ ...draft, load })} onSubmit={props.onConfirmCalibration} />
      </View>
      <Pressable testID="train-confirm-calibration" accessibilityRole="button" accessibilityLabel={`Confirm starting load for ${exercise.name}`} onPress={props.onConfirmCalibration} style={({ pressed }) => [styles.calibrationAction, pressed && styles.primaryActionPressed]}><Text numberOfLines={1} style={styles.calibrationActionText}>Confirm starting load</Text></Pressable>
      <Text style={styles.tinyMuted}>Ramp attempts are not counted as working sets.</Text>
    </View> : calibration && props.calibrationConfirmed ? <View style={styles.calibrationReady}><Text style={styles.successText}>✓ Starting load ready</Text><Text style={styles.smallMuted}>Complete the working sets below; valid evidence is retained for compatible sessions.</Text></View> : null}
    <View style={styles.setHeader}>
      <Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.columnLabel, { width: props.layout.setWidth }]}>Set</Text>
      <Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.columnLabel, styles.flex]}>Reps</Text>
      <Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.columnLabel, styles.loadColumn]}>Load</Text>
      <Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.columnLabel, { width: props.layout.doneWidth, textAlign: "center" }]}>Done</Text>
    </View>
    <View style={{ gap: props.layout.rowGap }}>{displayedSets.map((set) => {
      const current = set.state === "current";
      const completed = set.state === "completed";
      const values = props.valuesFor(exercise, set);
      const editing = props.editState?.setId === set.id;
      return <View key={set.id} style={[styles.setBlock, current && styles.setBlockCurrent, completed && styles.setBlockCompleted]}>
        <View style={styles.setRow}>
          <View style={[styles.setIdentity, { width: props.layout.setWidth }]}><Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={styles.setNumber}>{set.number}</Text><Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.setStateText, current && styles.accentText, completed && styles.successText]}>{completed ? "Done" : current ? "Now" : "Next"}</Text></View>
          {completed && !editing ? <Text maxFontSizeMultiplier={1.35} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.completedValue, styles.flex]}>{set.actualReps} reps</Text> : <NumericTextInput testID={`train-reps-${exercise.order}-${set.number}`} accessibilityLabel={`Actual reps for set ${set.number} of ${exercise.name}`} keyboardType="number-pad" returnKeyType="next" editable={!props.paused && (!completed || editing)} selectTextOnFocus value={editing ? props.editState!.reps : values.reps} onChangeText={(reps) => editing ? props.setEditState({ ...props.editState!, reps }) : props.setSetValues((currentValues) => ({ ...currentValues, [set.id]: { ...values, reps } }))} style={[styles.compactInput, styles.flex, props.fieldError === "reps" && current && styles.inputError, (completed && !editing) && styles.lockedInput]} />}
          {set.loadSemantic === "bodyweight" ? <View style={styles.bodyweightCell}><Text maxFontSizeMultiplier={1.35} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.bodyweightText}>Bodyweight</Text></View> : completed && !editing ? <Text maxFontSizeMultiplier={1.35} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={[styles.completedValue, styles.loadColumn]}>{set.actualLoad} {set.unit}</Text> : set.loadSemantic === "unavailable" ? <View style={styles.loadColumn}><Text maxFontSizeMultiplier={1.35} numberOfLines={2} style={styles.unavailableText}>Unavailable</Text></View> : <View style={styles.loadInputWrap}><NumericTextInput testID={`train-load-${exercise.order}-${set.number}`} accessibilityLabel={`${set.loadInputLabel} for set ${set.number} of ${exercise.name}, ${props.displayUnit}`} keyboardType="decimal-pad" returnKeyType="done" editable={!props.paused && (!completed || editing)} selectTextOnFocus value={editing ? props.editState!.load : values.load} onChangeText={(load) => editing ? props.setEditState({ ...props.editState!, load }) : props.setSetValues((currentValues) => ({ ...currentValues, [set.id]: { ...values, load } }))} onSubmitEditing={() => editing ? props.onSaveEdit(set) : current ? props.onComplete(set) : undefined} style={[styles.compactInput, styles.loadInput, props.fieldError === "load" && current && styles.inputError]} /><Text maxFontSizeMultiplier={1.35} style={styles.unitLabel}>{props.displayUnit}</Text></View>}
          <Pressable testID={`train-complete-${exercise.order}-${set.number}`} accessibilityRole="button" accessibilityLabel={completed ? `Set ${set.number} completed; edit available below` : `Complete set ${set.number} of ${exercise.name}`} accessibilityState={{ disabled: completed || !current || props.paused }} disabled={completed || !current || props.paused || (calibration?.required && !props.calibrationConfirmed) || set.loadSemantic === "unavailable"} onPress={() => props.onComplete(set)} style={({ pressed }) => [styles.doneControl, completed && styles.doneControlComplete, (!current || props.paused) && styles.doneControlUpcoming, pressed && styles.doneControlPressed]}><Text maxFontSizeMultiplier={1.35} numberOfLines={1} style={[styles.doneGlyph, completed && styles.doneGlyphComplete]}>{completed ? "✓" : "✓"}</Text></Pressable>
        </View>
        <View style={styles.setDetailRow}>
          <Text style={styles.tinyMuted}>Target {set.target}{set.previous ? ` · Previous ${set.previous}` : ""}</Text>
          {completed && !editing ? <Pressable accessibilityRole="button" accessibilityLabel={`Edit completed set ${set.number} of ${exercise.name}`} hitSlop={8} onPress={() => props.onBeginEdit(set)}><Text style={styles.editLink}>Edit</Text></Pressable> : null}
          {editing ? <View style={styles.editActions}><Pressable accessibilityRole="button" accessibilityLabel={`Cancel editing set ${set.number}`} onPress={() => props.setEditState(null)}><Text style={styles.cancelLink}>Cancel</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Save edits to set ${set.number}`} onPress={() => props.onSaveEdit(set)}><Text style={styles.saveLink}>Save</Text></Pressable></View> : null}
        </View>
      </View>;
    })}</View>
    {exercise.sets.length > 1 ? <Pressable testID="train-all-sets-toggle" accessibilityRole="button" accessibilityState={{ expanded: allSetsOpen }} accessibilityLabel={`${allSetsOpen ? "Hide" : "Show"} all sets for ${exercise.name}`} onPress={() => setAllSetsOpen((open) => !open)} style={({ pressed }) => [styles.disclosureRow, pressed && styles.pressed]}><Text style={styles.disclosureText}>{allSetsOpen ? "Show current set only" : `All sets · ${completedSetCount} of ${exercise.sets.length} complete`}</Text><Text style={styles.disclosureGlyph}>{allSetsOpen ? "⌃" : "⌄"}</Text></Pressable> : null}
    <Pressable testID={`train-details-${exercise.order}`} accessibilityRole="button" accessibilityState={{ expanded: detailsOpen }} accessibilityLabel={`${detailsOpen ? "Hide" : "Show"} method and coaching details for ${exercise.name}`} onPress={() => setDetailsOpen((open) => !open)} style={({ pressed }) => [styles.disclosureRow, pressed && styles.pressed]}><Text style={styles.disclosureText}>Method and coaching details</Text><Text style={styles.disclosureGlyph}>{detailsOpen ? "⌃" : "⌄"}</Text></Pressable>
    {detailsOpen ? <>
      <View testID={`train-method-${exercise.order}`} style={styles.methodPanel}>
        <Text style={styles.methodTitle}>{exercise.methodExecution.sequenceLabel ? `${exercise.methodExecution.sequenceLabel} · ` : ""}{exercise.method}</Text>
        <Text style={styles.methodSummary}>{exercise.methodExecution.instruction}</Text>
        <Text style={styles.tinyMuted}>{exercise.methodExecution.kind === "linked_rounds"
          ? `${exercise.methodExecution.intraMethodRestSeconds ?? 0}s between exercises · ${exercise.methodExecution.interRoundRestSeconds}s between rounds`
          : exercise.methodExecution.kind === "rest_pause"
            ? `${exercise.methodExecution.intraMethodRestSeconds ?? 0}s reset between single reps · ${exercise.methodExecution.interRoundRestSeconds}s between rounds`
            : `${exercise.methodExecution.interRoundRestSeconds}s between sets`}</Text>
      </View>
      {exercise.coachingNote ? <View style={styles.coaching}><Text style={styles.coachingText}>{exercise.coachingNote}</Text></View> : null}
    </> : null}
  </View>;
}

function RestPanel({ timer, seconds, nextInstruction, onAction }: Readonly<{ timer: NonNullable<ReturnType<typeof restoreCanonicalRestTimer>>; seconds: number; nextInstruction: string | null; onAction(action: "pause" | "resume" | "add" | "skip"): void }>) {
  const expired = timer.state === "expired";
  const paused = timer.state === "paused";
  return <View style={styles.restPanel} accessibilityLiveRegion="polite">
    <View style={styles.restTop}><View><Text style={styles.eyebrow}>{expired ? "REST COMPLETE" : paused ? "REST PAUSED" : "REST"}</Text><Text accessibilityLabel={expired ? "Rest complete" : `${seconds} seconds remaining`} style={styles.restTime}>{expired ? "GO" : formatTimer(seconds)}</Text></View><Text style={styles.restPrescribed}>{timer.prescribedDurationSeconds}s prescribed</Text></View>
    {nextInstruction ? <Text testID="train-next-instruction" numberOfLines={2} style={styles.restInstruction}>{nextInstruction}</Text> : null}
    {!expired ? <View style={styles.restActions}>
      <RestAction label={paused ? "Resume" : "Pause"} onPress={() => onAction(paused ? "resume" : "pause")} />
      <RestAction label="+30s" onPress={() => onAction("add")} />
      <RestAction label="Skip" onPress={() => onAction("skip")} />
    </View> : <RestAction label="Dismiss" onPress={() => onAction("skip")} />}
  </View>;
}

function RestAction({ label, onPress }: Readonly<{ label: string; onPress(): void }>) { return <Pressable testID={stableUiIdentifier("action", `${label}-rest-timer`)} accessibilityRole="button" accessibilityLabel={`${label} rest timer`} onPress={onPress} style={({ pressed }) => [styles.restAction, pressed && styles.pressed]}><Text numberOfLines={1} style={styles.restActionText}>{label}</Text></Pressable>; }

function PausedBanner({ busy, onResume }: Readonly<{ busy: boolean; onResume(): void }>) { return <View style={styles.pausedBanner}><View style={styles.flex}><Text style={styles.pausedTitle}>Workout paused</Text><Text style={styles.smallMuted}>Your completed work and rest state are saved.</Text></View><Pressable testID="train-resume" accessibilityRole="button" accessibilityLabel="Resume workout" disabled={busy} onPress={onResume} style={({ pressed }) => [styles.resumeAction, pressed && styles.primaryActionPressed]}><Text style={styles.resumeActionText}>Resume</Text></Pressable></View>; }

function FinishPanel({ presentation, busy, onFinish }: Readonly<{ presentation: WorkoutPresentation; busy: boolean; onFinish(): void }>) { return <View style={styles.finishPanel}><Text style={styles.finishTitle}>Workout complete</Text><Text style={styles.smallMuted}>All {presentation.totalSets} prescribed working sets are complete.</Text><Pressable testID="train-finish" accessibilityRole="button" accessibilityLabel="Finish workout" disabled={busy} onPress={onFinish} style={({ pressed }) => [styles.finishAction, pressed && styles.primaryActionPressed, busy && styles.disabled]}><Text numberOfLines={1} style={styles.finishActionText}>{busy ? "Saving…" : "Finish workout"}</Text></Pressable></View>; }

function TrainActionModal({ modal, reduceMotion, busy, message, completion, onContinue, onMinimise, onRequestFinishEarly, onRequestDiscard, onDiscard, onFinish }: Readonly<{ modal: TrainModal; reduceMotion: boolean; busy: boolean; message: string | null; completion: ReturnType<typeof resolveCanonicalTrainCompletionAffordance>; onContinue(): void; onMinimise(): void; onRequestFinishEarly(): void; onRequestDiscard(): void; onDiscard(): void; onFinish(): void }>) {
  return <Modal visible={modal !== null} transparent animationType={reduceMotion ? "none" : "fade"} onShow={Keyboard.dismiss} onRequestClose={onContinue} statusBarTranslucent>
    <View style={styles.modalBackdrop}><View accessibilityViewIsModal accessibilityRole="none" style={styles.modalSheet}>
      <ScrollView key={modal ?? "closed"} bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator contentContainerStyle={styles.modalContent}>
      {modal === "actions" ? <>
        <Text maxFontSizeMultiplier={1.5} style={styles.modalTitle}>Workout actions</Text><Text maxFontSizeMultiplier={1.6} style={styles.body}>{completion.completedSets} of {completion.completedSets + completion.remainingSets} working sets complete. Leaving saves this exact attempt for later.</Text>
        <Pressable testID="train-actions-cancel" accessibilityRole="button" accessibilityLabel="Keep training" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Keep training</Text></Pressable>
        <Pressable testID="train-pause-leave" accessibilityRole="button" accessibilityLabel={canonicalTrainWorkoutActions[0].label} disabled={busy} onPress={onMinimise} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>{canonicalTrainWorkoutActions[0].label}</Text></Pressable>
        {completion.earlyFinishAvailable ? <Pressable testID="train-request-finish-early" accessibilityRole="button" accessibilityLabel={canonicalTrainWorkoutActions[1].label} onPress={onRequestFinishEarly} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>{canonicalTrainWorkoutActions[1].label}</Text></Pressable> : null}
        <Pressable testID="train-request-discard" accessibilityRole="button" accessibilityLabel={canonicalTrainWorkoutActions[2].label} onPress={onRequestDiscard} style={({ pressed }) => [styles.modalAction, styles.modalDangerOutline, pressed && styles.pressed]}><Text style={styles.modalDangerText}>{canonicalTrainWorkoutActions[2].label}</Text></Pressable>
      </> : modal === "discard" ? <>
        <Text maxFontSizeMultiplier={1.5} style={styles.modalTitle}>Discard active attempt?</Text><Text maxFontSizeMultiplier={1.6} style={styles.body}>This removes this in-progress attempt, its performed sets, and its rest timer. Completed workout history and the immutable prescription stay safe.</Text>
        <Pressable testID="train-discard-cancel" accessibilityRole="button" accessibilityLabel="Cancel discard" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Cancel</Text></Pressable>
        <Pressable testID="train-discard-confirm" accessibilityRole="button" accessibilityLabel="Discard workout" disabled={busy} onPress={onDiscard} style={({ pressed }) => [styles.modalAction, styles.modalDanger, pressed && styles.pressed]}><Text style={styles.modalDangerFilledText}>{busy ? "Discarding…" : "Discard workout"}</Text></Pressable>
      </> : modal === "finish_early" ? <>
        <Text maxFontSizeMultiplier={1.5} style={styles.modalTitle}>Finish early?</Text><Text maxFontSizeMultiplier={1.6} style={styles.body}>{completion.completedSets} working sets are complete and {completion.remainingSets} prescribed sets remain. Finishing now records the session truthfully as incomplete; it does not count the remaining sets as performed.</Text>
        <Pressable testID="train-finish-early-cancel" accessibilityRole="button" accessibilityLabel="Cancel finish early" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Keep training</Text></Pressable>
        <Pressable testID="train-finish-early-confirm" accessibilityRole="button" accessibilityLabel="Confirm finish early" disabled={busy} onPress={onFinish} style={({ pressed }) => [styles.modalAction, styles.modalPrimary, pressed && styles.pressed]}><Text style={styles.modalPrimaryText}>{busy ? "Finishing…" : "Finish early"}</Text></Pressable>
      </> : modal === "finish_complete" ? <>
        <Text maxFontSizeMultiplier={1.5} style={styles.modalTitle}>Finish workout?</Text><Text maxFontSizeMultiplier={1.6} style={styles.body}>All prescribed working sets are complete. Save this workout to History?</Text>
        <Pressable testID="train-finish-cancel" accessibilityRole="button" accessibilityLabel="Keep training" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Keep training</Text></Pressable>
        <Pressable testID="train-finish-confirm" accessibilityRole="button" accessibilityLabel="Confirm finish workout" disabled={busy} onPress={onFinish} style={({ pressed }) => [styles.modalAction, styles.modalPrimary, pressed && styles.pressed]}><Text style={styles.modalPrimaryText}>{busy ? "Finishing…" : "Finish workout"}</Text></Pressable>
      </> : null}
      {message && modal ? <Text testID="train-modal-message" accessibilityLiveRegion="assertive" style={styles.modalMessage}>{message}</Text> : null}
      </ScrollView>
    </View></View>
  </Modal>;
}

function Field({ testID, label, value, unit, keyboardType, error, onChange, onSubmit }: Readonly<{ testID: string; label: string; value: string; unit: string; keyboardType: "number-pad" | "decimal-pad"; error: boolean; onChange(value: string): void; onSubmit?(): void }>) { return <View style={styles.field}><Text maxFontSizeMultiplier={1.35} style={styles.columnLabel}>{label}</Text><View style={[styles.fieldInputWrap, error && styles.inputError]}><NumericTextInput testID={testID} accessibilityLabel={`${label}, ${unit}`} keyboardType={keyboardType} returnKeyType={onSubmit ? "done" : undefined} value={value} onChangeText={onChange} onSubmitEditing={onSubmit} style={styles.fieldInput} /><Text maxFontSizeMultiplier={1.35} style={styles.unitLabel}>{unit}</Text></View></View>; }

function NumericTextInput(props: React.ComponentProps<typeof TextInput> & Readonly<{ testID: string }>) {
  return <TextInput maxFontSizeMultiplier={1.35} {...props} inputAccessoryViewID={Platform.OS === "ios" ? TRAIN_NUMERIC_KEYBOARD_ACCESSORY_ID : undefined} />;
}
function UnavailableState({ message, detail, onReturn, onRestore }: Readonly<{ message: string; detail?: string | null; onReturn(): void; onRestore?: () => void }>) { return <AppScreen><Text style={{ color: TRAIN.text, fontSize: 28, fontWeight: "900" }}>Train safely</Text><Text style={{ color: TRAIN.muted }}>{message}</Text>{detail ? <Text style={{ color: TRAIN.muted }}>{detail}</Text> : null}{onRestore ? <SecondaryButton label="Restore workout" onPress={onRestore} /> : null}<SecondaryButton label="Return to Home" onPress={onReturn} /></AppScreen>; }

function TrainPaywall({ onRestore }: Readonly<{ onRestore(): void }>) {
  return <AppScreen>
    <Text style={{ color: TRAIN.text, ...type.hero }}>Build More Muscle.</Text>
    <Text style={{ color: TRAIN.text, ...type.hero }}>Get Stronger.</Text>
    <Text style={{ color: TRAIN.text, ...type.hero }}>Stop Guessing.</Text>
    <Text style={{ color: TRAIN.muted }}>Your adaptive training plan is ready. Start your free trial to unlock coached workouts, progression, and recovery guidance.</Text>
    <Text style={{ color: TRAIN.accent, ...type.section }}>14-day free trial</Text>
    <Text style={{ color: TRAIN.muted }}>Cancel anytime.</Text>
    <Text style={{ color: TRAIN.text }}>Know exactly what to do every workout</Text>
    <Text style={{ color: TRAIN.text }}>Adaptive progression based on your performance</Text>
    <Text style={{ color: TRAIN.text }}>Warm-Up Sets and Session Prep included</Text>
    <Text style={{ color: TRAIN.text }}>Strength Dashboard, PRs, and e1RM tracking</Text>
    <Text style={{ color: TRAIN.text }}>Recovery & Capacity guidance</Text>
    <PrimaryButton label="Start 14-Day Free Trial" onPress={() => router.push("/(protected)/paywall")} />
    <SecondaryButton label="Restore Purchases" onPress={onRestore} />
    <SecondaryButton label="View Plan" onPress={() => router.push("/(protected)/(tabs)/programmes")} />
    <Text style={{ color: TRAIN.muted }}>Checking your plan access</Text>
    <Text style={{ color: TRAIN.muted }}>Managed securely through your App Store or Google Play account.</Text>
  </AppScreen>;
}

function lifecycleCommand(planId: string, revision: number, recordedSessionId: string, ledgerVersion: number, action: string) { return { planId, expectedPlanRevision: revision, recordedSessionId, expectedLedgerVersion: ledgerVersion, operationId: operationId(action), occurredAt: new Date().toISOString(), provenance: "canonical_train" }; }
function awaitHaptic(promise: Promise<void>) { void promise.catch(() => undefined); }
function formatElapsed(seconds: number) { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const remainder = seconds % 60; return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`; }
function formatTimer(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
function friendlyReason(reason: string): string {
  const labels: Record<string, string> = {
    canonical_session_started: "Workout started",
    performed_work_recorded: "Set completed",
    performed_work_edited: "Set updated",
    session_pause: "Workout paused and saved",
    session_resumed: "Workout resumed",
    session_completed: "Workout complete",
    session_attempt_discarded: "Active attempt discarded; the session is planned again",
    discard_already_applied: "This active attempt was already discarded. The planned workout is ready again.",
    stale_ledger_version: "This workout changed. Refresh and try again.",
    stale_plan_revision: "Your plan changed. Return to Home and reopen this workout.",
    recorded_session_storage_write_failed: "Discard did not complete because local storage could not be updated. Your workout is still saved; try again.",
    discard_carrier_update_pending: "Discard did not complete because your plan changed. Your workout is still saved; reopen it and try again.",
    discard_compensation_failed: "Discard could not be completed safely. Your workout data has been preserved for recovery.",
    discard_cleanup_pending: "The workout was restored, but local cleanup is still pending. Confirm discard again.",
  };
  return labels[reason] ?? reason.replace(/_/g, " ");
}
function isPositiveTrainFeedback(message: string): boolean {
  return ["Exercise replaced.", "Optional exercise", "Workout restored", "Workout started", "Workout paused", "Workout resumed", "Workout complete", "Set updated", "Starting load confirmed", "Active attempt discarded"].some((prefix) => message.startsWith(prefix));
}

export { recordCanonicalPerformedWork };

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shell: { flex: 1, backgroundColor: TRAIN.background },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: TRAIN.line },
  headerControl: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong },
  minimiseGlyph: { color: TRAIN.text, fontSize: 30, lineHeight: 31, fontWeight: "800", marginTop: -6 },
  actionsGlyph: { color: TRAIN.text, fontSize: 18, lineHeight: 20, fontWeight: "900", letterSpacing: 1 },
  headerTitleArea: { flex: 1, minWidth: 0 },
  headerTitle: { color: TRAIN.text, fontSize: 16, lineHeight: 20, fontWeight: "900" },
  headerMeta: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "700", fontVariant: ["tabular-nums"] },
  headerPercent: { minWidth: 48, height: 36, paddingHorizontal: 8, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accentSoft },
  headerPercentText: { color: TRAIN.accent, fontSize: 12, fontWeight: "900", fontVariant: ["tabular-nums"] },
  progressTrack: { height: 4, backgroundColor: TRAIN.surfaceRaised },
  progressFill: { height: 4, backgroundColor: TRAIN.accent },
  content: { gap: 12, paddingHorizontal: 12, paddingTop: 12 },
  feedbackBanner: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: TRAIN.dangerSoft, borderWidth: 1, borderColor: TRAIN.danger },
  feedbackText: { color: TRAIN.danger, fontSize: 13, lineHeight: 18, fontWeight: "800" },
  feedbackBannerPositive: { backgroundColor: TRAIN.successSoft, borderColor: TRAIN.success },
  feedbackTextPositive: { color: TRAIN.success },
  previewContent: { gap: 14, padding: 16, paddingBottom: 40 },
  eyebrow: { color: TRAIN.accent, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1 },
  body: { color: TRAIN.muted, fontSize: 15, lineHeight: 21, fontWeight: "500" },
  tinyMuted: { color: TRAIN.subtle, fontSize: 11, lineHeight: 15, fontWeight: "600", flexShrink: 1 },
  previewList: { gap: 8 },
  previewExercise: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 14, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  exerciseNumber: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accentSoft },
  exerciseNumberText: { color: TRAIN.accent, fontSize: 13, fontWeight: "900" },
  previewExerciseText: { flex: 1, minWidth: 0, gap: 3 },
  exerciseName: { color: TRAIN.text, fontSize: 16, lineHeight: 21, fontWeight: "900" },
  smallMuted: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "600", flexShrink: 1 },
  primaryAction: { minHeight: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accent, paddingHorizontal: 16 },
  primaryActionPressed: { backgroundColor: TRAIN.accentPressed },
  primaryActionText: { color: TRAIN.background, fontSize: 17, fontWeight: "900" },
  startReassurance: { color: TRAIN.subtle, fontSize: 11, lineHeight: 16, fontWeight: "600", textAlign: "center", paddingHorizontal: 8 },
  message: { color: TRAIN.muted, fontSize: 13, lineHeight: 19, paddingHorizontal: 4 },
  exerciseNavigator: { minHeight: 76, flexDirection: "row", alignItems: "stretch", gap: 8, padding: 8, borderRadius: 16, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  exerciseNavigatorMain: { flex: 1, minWidth: 0, justifyContent: "center", alignItems: "center", gap: 1, paddingHorizontal: 4 },
  exerciseNavigatorName: { maxWidth: "100%", color: TRAIN.text, fontSize: 17, lineHeight: 21, fontWeight: "900", textAlign: "center" },
  exerciseNavArrow: { width: 44, minHeight: 56, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong },
  exerciseNavArrowText: { color: TRAIN.text, fontSize: 34, lineHeight: 36, fontWeight: "600" },
  exerciseEditAction: { alignSelf: "flex-end", minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4 },
  exerciseEditActionText: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "800" },
  exerciseEditGlyph: { color: TRAIN.accent, fontSize: 20, lineHeight: 21, fontWeight: "800" },
  switcherHeading: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  switcherClose: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.surfaceRaised },
  switcherCloseText: { color: TRAIN.text, fontSize: 28, lineHeight: 30 },
  switcherList: { gap: 8 },
  switcherItem: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 13, backgroundColor: TRAIN.background, borderWidth: 1, borderColor: TRAIN.line },
  switcherItemActive: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accentSoft },
  switcherIndex: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.surfaceRaised },
  switcherIndexComplete: { backgroundColor: TRAIN.success },
  switcherIndexText: { color: TRAIN.text, fontSize: 13, fontWeight: "900" },
  switcherStatus: { color: TRAIN.subtle, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  exerciseTab: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  exerciseTabActive: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accentSoft },
  exerciseTabIndex: { width: 20, color: TRAIN.muted, fontSize: 13, fontWeight: "900", textAlign: "center" },
  exerciseTabName: { flex: 1, minWidth: 0, color: TRAIN.muted, fontSize: 14, fontWeight: "800" },
  accentText: { color: TRAIN.accent },
  successText: { color: TRAIN.success, fontWeight: "900" },
  exerciseCard: { gap: 12, padding: 14, borderRadius: 18, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.lineStrong },
  exerciseHeading: { flexDirection: "row", gap: 10 },
  exerciseHeadingText: { flex: 1, minWidth: 0, gap: 4 },
  activeExerciseName: { color: TRAIN.text, fontSize: 24, lineHeight: 29, fontWeight: "900" },
  previous: { color: TRAIN.accent, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  coaching: { padding: 10, borderRadius: 10, backgroundColor: TRAIN.surfaceRaised, borderLeftWidth: 3, borderLeftColor: TRAIN.accent },
  coachingText: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  disclosureRow: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 12, borderRadius: 11, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.line },
  disclosureText: { flex: 1, color: TRAIN.text, fontSize: 13, fontWeight: "800" },
  disclosureGlyph: { color: TRAIN.accent, fontSize: 18, fontWeight: "900" },
  methodPanel: { gap: 3, padding: 10, borderRadius: 10, backgroundColor: TRAIN.accentSoft, borderWidth: 1, borderColor: TRAIN.line },
  methodTitle: { color: TRAIN.accent, fontSize: 13, lineHeight: 18, fontWeight: "900" },
  methodSummary: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  nextInstruction: { gap: 3, padding: 12, borderRadius: 12, backgroundColor: TRAIN.accentSoft, borderWidth: 1, borderColor: TRAIN.accent },
  nextInstructionLabel: { color: TRAIN.accent, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 0.8 },
  nextInstructionText: { color: TRAIN.text, fontSize: 14, lineHeight: 20, fontWeight: "800" },
  calibrationPanel: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: TRAIN.accentSoft, borderWidth: 1, borderColor: TRAIN.accent },
  calibrationTitle: { color: TRAIN.text, fontSize: 20, lineHeight: 25, fontWeight: "900" },
  calibrationInputs: { flexDirection: "row", gap: 8 },
  field: { flex: 1, minWidth: 0, gap: 5 },
  fieldInputWrap: { minHeight: 48, flexDirection: "row", alignItems: "center", borderRadius: 10, backgroundColor: TRAIN.background, borderWidth: 1, borderColor: TRAIN.lineStrong },
  fieldInput: { flex: 1, minWidth: 0, minHeight: 46, color: TRAIN.text, fontSize: 17, fontWeight: "800", paddingLeft: 10, paddingRight: 42 },
  keyboardAccessory: { minHeight: 44, alignItems: "flex-end", justifyContent: "center", paddingHorizontal: 12, backgroundColor: TRAIN.surface },
  keyboardDone: { minWidth: 56, minHeight: 44, alignItems: "center", justifyContent: "center" },
  keyboardDoneText: { color: TRAIN.accent, fontSize: 16, fontWeight: "900" },
  unitLabel: { position: "absolute", right: 0, color: TRAIN.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", paddingRight: 8 },
  calibrationAction: { minHeight: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accent, paddingHorizontal: 12 },
  calibrationActionText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  calibrationReady: { gap: 3, padding: 10, borderRadius: 10, backgroundColor: TRAIN.successSoft, borderWidth: 1, borderColor: TRAIN.success },
  setHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
  columnLabel: { color: TRAIN.subtle, fontSize: 10, lineHeight: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  loadColumn: { flex: 1.18, minWidth: 0 },
  setBlock: { gap: 5, padding: 7, borderRadius: 12, borderWidth: 1, borderColor: TRAIN.line, backgroundColor: TRAIN.background },
  setBlockCurrent: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accentSoft },
  setBlockCompleted: { borderColor: TRAIN.success, backgroundColor: TRAIN.successSoft },
  setRow: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 6 },
  setIdentity: { alignItems: "center", justifyContent: "center" },
  setNumber: { color: TRAIN.text, fontSize: 17, lineHeight: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  setStateText: { color: TRAIN.subtle, fontSize: 9, lineHeight: 12, fontWeight: "900", textTransform: "uppercase" },
  compactInput: { minWidth: 0, minHeight: 44, borderRadius: 9, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong, color: TRAIN.text, fontSize: 16, fontWeight: "800", textAlign: "center", paddingHorizontal: 6, fontVariant: ["tabular-nums"] },
  lockedInput: { opacity: 0.7 },
  inputError: { borderColor: TRAIN.danger, borderWidth: 2 },
  completedValue: { color: TRAIN.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  loadInputWrap: { flex: 1.18, minWidth: 0, position: "relative", justifyContent: "center" },
  loadInput: { width: "100%", paddingRight: 29 },
  bodyweightCell: { flex: 1.18, minWidth: 0, minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  bodyweightText: { color: TRAIN.text, fontSize: 12, fontWeight: "800", textAlign: "center" },
  unavailableText: { color: TRAIN.danger, fontSize: 10, lineHeight: 13, fontWeight: "800", textAlign: "center" },
  doneControl: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accent, borderWidth: 2, borderColor: TRAIN.accent },
  doneControlComplete: { backgroundColor: TRAIN.success, borderColor: TRAIN.success },
  doneControlUpcoming: { backgroundColor: TRAIN.transparent, borderColor: TRAIN.lineStrong, opacity: 0.55 },
  doneControlPressed: { transform: [{ scale: 0.96 }] },
  doneGlyph: { color: TRAIN.background, fontSize: 21, lineHeight: 23, fontWeight: "900" },
  doneGlyphComplete: { color: TRAIN.background },
  setDetailRow: { minHeight: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 4 },
  editLink: { color: TRAIN.accent, fontSize: 12, fontWeight: "900", paddingVertical: 3 },
  editActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  cancelLink: { color: TRAIN.muted, fontSize: 12, fontWeight: "900" },
  saveLink: { color: TRAIN.success, fontSize: 12, fontWeight: "900" },
  restPanel: { gap: 7, padding: 10, borderRadius: 14, backgroundColor: TRAIN.accentSoft, borderWidth: 1, borderColor: TRAIN.accent },
  restTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  restTime: { color: TRAIN.text, fontSize: 32, lineHeight: 35, fontWeight: "900", fontVariant: ["tabular-nums"] },
  restPrescribed: { color: TRAIN.muted, fontSize: 11, fontWeight: "800", paddingTop: 3 },
  restInstruction: { color: TRAIN.text, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  restActions: { flexDirection: "row", gap: 6 },
  restAction: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong, paddingHorizontal: 8 },
  restActionText: { color: TRAIN.text, fontSize: 13, fontWeight: "900" },
  pausedBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.accent },
  pausedTitle: { color: TRAIN.text, fontSize: 16, fontWeight: "900" },
  resumeAction: { minWidth: 92, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: TRAIN.accent },
  resumeActionText: { color: TRAIN.background, fontSize: 14, fontWeight: "900" },
  finishPanel: { gap: 8, padding: 14, borderRadius: 16, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  finishTitle: { color: TRAIN.text, fontSize: 18, fontWeight: "900" },
  finishAction: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: TRAIN.accent, paddingHorizontal: 12 },
  finishActionText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: TRAIN.scrim, padding: 12 },
  modalSheet: { maxHeight: "92%", borderRadius: 22, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.lineStrong, overflow: "hidden" },
  modalContent: { gap: 10, padding: 18, paddingBottom: 24 },
  modalTitle: { color: TRAIN.text, fontSize: 23, lineHeight: 28, fontWeight: "900" },
  modalAction: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong, paddingHorizontal: 12 },
  modalActionText: { color: TRAIN.text, fontSize: 15, fontWeight: "900" },
  modalDangerOutline: { borderColor: TRAIN.danger, backgroundColor: TRAIN.dangerSoft },
  modalDangerText: { color: TRAIN.danger, fontSize: 15, fontWeight: "900" },
  modalDanger: { borderColor: TRAIN.danger, backgroundColor: TRAIN.danger },
  modalDangerFilledText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  modalPrimary: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accent },
  modalPrimaryText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  modalMessage: { color: TRAIN.danger, fontSize: 13, lineHeight: 19, fontWeight: "700", padding: 8, borderRadius: 10, backgroundColor: TRAIN.dangerSoft },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.76 },
});
