import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  BackHandler,
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
  discardCanonicalSessionAttempt,
  editCanonicalPerformedWork,
  pauseCanonicalSession,
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
  canonicalTrainCloseActions,
  canonicalTrainNarrowLayout,
  validateCanonicalCalibrationEntry,
  validateCanonicalTrainSetEntry,
} from "@/application/training/canonical-train-interaction";
import { canonicalProgressEvidenceRepository } from "@/data/local/canonical-progress-evidence-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { hapticFeedback } from "@/application/training/haptic-feedback";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, type } from "@/ui/theme";

type RouteParams = Readonly<{
  planId?: string;
  planRevision?: string;
  plannedSessionId?: string;
  recordedSessionId?: string;
  action?: string;
  lifecycle?: string;
  qaEndConfirm?: string;
}>;
type SetValues = Readonly<{ reps: string; load: string }>;
type EditState = Readonly<{ setId: string; reps: string; load: string }>;
type TrainModal = "close" | "discard" | "finish" | null;

const TRAIN = {
  background: "#05070A",
  surface: "#0B1119",
  surfaceRaised: "#101925",
  line: "#263448",
  lineStrong: "#52647E",
  text: "#FFFFFF",
  muted: "#B8C4D4",
  subtle: "#7E8DA2",
  accent: "#52E5FF",
  accentPressed: "#9BF1FF",
  accentSoft: "#0B2C35",
  success: "#77F2AE",
  successSoft: "#10291E",
  danger: "#FF6B72",
  dangerSoft: "#321319",
};

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
  const [renderVersion, refresh] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<"reps" | "load" | null>(null);
  const [setValues, setSetValues] = useState<Record<string, SetValues>>({});
  const [calibrationDrafts, setCalibrationDrafts] = useState<Record<string, SetValues>>({});
  const [calibrationLoads, setCalibrationLoads] = useState<Record<string, number>>({});
  const [editState, setEditState] = useState<EditState | null>(null);
  const [recordedId, setRecordedId] = useState<string | undefined>(undefined);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [modal, setModal] = useState<TrainModal>(null);
  const [busy, setBusy] = useState(false);
  const [timerTick, setTimerTick] = useState(() => Date.now());
  const [nextInstruction, setNextInstruction] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    canonicalActivePlanState.hydrate();
    return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1));
  }, []);
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion); }, []);

  const plan = canonicalActivePlanState.getReadModel();
  const route = useMemo(() => ({
    planId: String(params.planId ?? ""),
    revision: Number(params.planRevision),
    plannedSessionId: params.plannedSessionId ? String(params.plannedSessionId) : undefined,
    recordedSessionId: params.recordedSessionId ? String(params.recordedSessionId) : undefined,
  }), [params.planId, params.planRevision, params.plannedSessionId, params.recordedSessionId]);

  useEffect(() => {
    const nextRecordedId = route.recordedSessionId ?? plan?.activeRecordedSession?.recordedSessionId;
    if (nextRecordedId && nextRecordedId !== recordedId) setRecordedId(nextRecordedId);
  }, [plan?.activeRecordedSession?.recordedSessionId, recordedId, route.recordedSessionId]);

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

  useEffect(() => {
    const listener = BackHandler.addEventListener("hardwareBackPress", () => {
      if (aggregate.status === "found" && ["started", "paused"].includes(aggregate.session.status)) setModal("close");
      else router.replace("/(protected)/(tabs)");
      return true;
    });
    return () => listener.remove();
  }, [aggregate.status === "found" ? aggregate.session.status : "missing"]);

  useEffect(() => {
    if (params.qaEndConfirm === "1" && presentation?.finishAllowed) setModal("finish");
  }, [params.qaEndConfirm, presentation?.finishAllowed]);

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
    if (aggregate.session.status === "paused") { setModal(null); router.replace("/(protected)/(tabs)"); return; }
    setBusy(true);
    const result = pauseCanonicalSession(lifecycleCommand(plan.planId, plan.revision, aggregate.session.recordedSessionId, aggregate.session.version, "pause"));
    setMessage(friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
    if (result.status === "applied" || result.status === "idempotent") { setModal(null); router.replace("/(protected)/(tabs)"); }
  };

  const resume = () => {
    if (!plan || aggregate.status !== "found") return;
    setBusy(true);
    const result = resumeCanonicalSession(lifecycleCommand(plan.planId, plan.revision, aggregate.session.recordedSessionId, aggregate.session.version, "resume"));
    setMessage(friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
  };

  const discard = () => {
    if (!plan || aggregate.status !== "found") return;
    setBusy(true);
    const result = discardCanonicalSessionAttempt(lifecycleCommand(plan.planId, plan.revision, aggregate.session.recordedSessionId, aggregate.session.version, "discard"));
    setMessage(friendlyReason(result.reason));
    canonicalActivePlanState.refresh();
    setBusy(false);
    if (result.status === "applied" || result.status === "idempotent") {
      setRecordedId(undefined);
      setModal(null);
      router.replace("/(protected)/(tabs)");
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
    setMessage(friendlyReason(result.reason));
    setNextInstruction(result.nextInstruction ?? null);
    if (result.status === "applied") awaitHaptic(hapticFeedback.setCompleted());
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
    return <TrainShell insets={insets} presentation={presentation} onClose={leavePreview}>
      <WorkoutPreview presentation={presentation} busy={busy} onStart={openPlanned} message={message} />
    </TrainShell>;
  }
  if (aggregate.status !== "found" || !snapshot || !presentation) {
    return <UnavailableState message="This session could not be restored safely." onReturn={leavePreview} onRestore={recordedId ? restoreRecorded : undefined} detail={message} />;
  }

  const activeExercise = presentation.exercises.find((exercise) => exercise.id === activeExerciseId) ?? presentation.exercises[0];
  const lastInstruction = nextInstruction ?? [...aggregate.events].reverse().find((event) => event.type === "performance" && typeof event.payload.nextInstruction === "string")?.payload.nextInstruction as string | null | undefined;
  const paused = aggregate.session.status === "paused";

  return <TrainShell insets={insets} presentation={presentation} onClose={() => setModal("close")}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex} keyboardVerticalOffset={0}>
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 108 }]}>
        {paused ? <PausedBanner busy={busy} onResume={resume} /> : null}
        {restTimer && restTimer.state !== "skipped" ? <RestPanel timer={restTimer} seconds={restSeconds} nextInstruction={lastInstruction ?? null} onAction={restAction} /> : null}
        <ExerciseRail exercises={presentation.exercises} activeId={activeExercise?.id ?? ""} onSelect={setActiveExerciseId} />
        {activeExercise ? <ActiveExerciseCard
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
        <FinishPanel presentation={presentation} busy={busy} onFinish={() => setModal("finish")} />
        {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
    <TrainActionModal modal={modal} reduceMotion={reduceMotion} busy={busy} onContinue={() => setModal(null)} onPauseLeave={pauseAndLeave} onRequestDiscard={() => setModal("discard")} onDiscard={discard} onFinish={finish} />
  </TrainShell>;
}

function TrainShell({ insets, presentation, onClose, children }: Readonly<{ insets: { top: number; bottom: number }; presentation: WorkoutPresentation; onClose(): void; children: React.ReactNode }>) {
  return <View style={[styles.shell, { paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close workout" hitSlop={8} onPress={onClose} style={({ pressed }) => [styles.headerControl, pressed && styles.pressed]}><Text style={styles.closeGlyph}>×</Text></Pressable>
      <View style={styles.headerTitleArea}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerTitle}>{presentation.title}</Text>
        <Text style={styles.headerMeta}>{formatElapsed(presentation.elapsedSeconds)} · {presentation.completedSets}/{presentation.totalSets} sets</Text>
      </View>
      <View style={styles.headerPercent}><Text style={styles.headerPercentText}>{presentation.progressPercent}%</Text></View>
    </View>
    <View accessibilityRole="progressbar" accessibilityLabel={`${presentation.progressPercent}% of working sets complete`} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${presentation.progressPercent}%` }]} /></View>
    <View style={styles.flex}>{children}</View>
  </View>;
}

function WorkoutPreview({ presentation, busy, onStart, message }: Readonly<{ presentation: WorkoutPresentation; busy: boolean; onStart(): void; message: string | null }>) {
  return <ScrollView contentContainerStyle={styles.previewContent}>
    <View style={styles.previewSummary}>
      <Text style={styles.eyebrow}>WORKOUT PREVIEW</Text>
      <Text style={styles.previewTitle}>{presentation.title}</Text>
      <Text style={styles.body}>{presentation.purpose}</Text>
      <View style={styles.previewStats}>
        <Stat label="Exercises" value={String(presentation.exercises.length)} />
        <Stat label="Working sets" value={String(presentation.totalSets)} />
        <Stat label="Estimate" value={`${presentation.estimatedDurationMinutes ?? "—"} min`} />
      </View>
    </View>
    <View style={styles.previewList}>{presentation.exercises.map((exercise) => <View key={exercise.id} style={styles.previewExercise}>
      <View style={styles.exerciseNumber}><Text style={styles.exerciseNumberText}>{exercise.order}</Text></View>
      <View style={styles.previewExerciseText}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.smallMuted}>{exercise.sets.length} sets · {exercise.sets.map((set) => set.target).join(" / ")}</Text>
        <Text style={styles.smallMuted}>{exercise.sets[0]?.loadLabel} · {exercise.sets[0]?.restSeconds}s rest · {exercise.method}</Text>
      </View>
    </View>)}</View>
    <Pressable accessibilityRole="button" accessibilityLabel="Start workout" disabled={busy} onPress={onStart} style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed, busy && styles.disabled]}><Text numberOfLines={1} style={styles.primaryActionText}>{busy ? "Starting…" : "Start workout"}</Text></Pressable>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </ScrollView>;
}

function ExerciseRail({ exercises, activeId, onSelect }: Readonly<{ exercises: readonly WorkoutExercisePresentation[]; activeId: string; onSelect(id: string): void }>) {
  return <View style={styles.exerciseRail} accessibilityRole="tablist">{exercises.map((exercise) => {
    const completed = exercise.sets.every((set) => set.state === "completed");
    const active = exercise.id === activeId;
    return <Pressable key={exercise.id} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`Exercise ${exercise.order} of ${exercises.length}, ${exercise.name}, ${completed ? "completed" : active ? "current" : "upcoming"}`} onPress={() => onSelect(exercise.id)} style={({ pressed }) => [styles.exerciseTab, active && styles.exerciseTabActive, pressed && styles.pressed]}>
      <Text style={[styles.exerciseTabIndex, completed && styles.successText]}>{completed ? "✓" : exercise.order}</Text>
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.exerciseTabName, active && styles.accentText]}>{exercise.name}</Text>
    </Pressable>;
  })}</View>;
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
  const firstIncomplete = exercise.sets.find((set) => set.state !== "completed");
  const calibration = exercise.calibration;
  const draft = props.calibrationDraft ?? { reps: String(calibration?.targetReps ?? firstIncomplete?.targetReps ?? ""), load: "" };
  return <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeading}>
      <View style={styles.exerciseHeadingText}>
        <Text style={styles.eyebrow}>EXERCISE {exercise.order}</Text>
        <Text style={styles.activeExerciseName}>{exercise.name}</Text>
        <Text style={styles.body}>{exercise.sets.length} working sets · {exercise.sets.map((set) => set.target).join(" / ")} · {exercise.sets[0]?.restSeconds}s rest</Text>
        <Text style={styles.smallMuted}>{exercise.method} · {exercise.loadState}</Text>
        {exercise.previousPerformance ? <Text style={styles.previous}>Previous: {exercise.previousPerformance}</Text> : null}
      </View>
    </View>
    {exercise.coachingNote ? <View style={styles.coaching}><Text style={styles.coachingText}>{exercise.coachingNote}</Text></View> : null}
    {calibration?.required && !props.calibrationConfirmed ? <View style={styles.calibrationPanel}>
      <Text style={styles.calibrationTitle}>{calibration.title}</Text>
      <Text style={styles.body}>{calibration.instruction}</Text>
      <Text style={styles.smallMuted}>{calibration.rampInstruction}</Text>
      <View style={styles.calibrationInputs}>
        <Field label="Successful reps" value={draft.reps} unit="reps" keyboardType="number-pad" error={props.fieldError === "reps"} onChange={(reps) => props.setCalibrationDraft({ ...draft, reps })} />
        <Field label="Successful load" value={draft.load} unit={props.displayUnit} keyboardType="decimal-pad" error={props.fieldError === "load"} onChange={(load) => props.setCalibrationDraft({ ...draft, load })} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Confirm starting load for ${exercise.name}`} onPress={props.onConfirmCalibration} style={({ pressed }) => [styles.calibrationAction, pressed && styles.primaryActionPressed]}><Text numberOfLines={1} style={styles.calibrationActionText}>Confirm starting load</Text></Pressable>
      <Text style={styles.tinyMuted}>Ramp attempts are not counted as working sets.</Text>
    </View> : calibration && props.calibrationConfirmed ? <View style={styles.calibrationReady}><Text style={styles.successText}>✓ Starting load ready</Text><Text style={styles.smallMuted}>Complete the working sets below; valid evidence is retained for compatible sessions.</Text></View> : null}
    <View style={styles.setHeader}>
      <Text style={[styles.columnLabel, { width: props.layout.setWidth }]}>Set</Text>
      <Text style={[styles.columnLabel, styles.flex]}>Reps</Text>
      <Text style={[styles.columnLabel, styles.loadColumn]}>Load</Text>
      <Text style={[styles.columnLabel, { width: props.layout.doneWidth, textAlign: "center" }]}>Done</Text>
    </View>
    <View style={{ gap: props.layout.rowGap }}>{exercise.sets.map((set) => {
      const current = set.id === firstIncomplete?.id;
      const completed = set.state === "completed";
      const values = props.valuesFor(exercise, set);
      const editing = props.editState?.setId === set.id;
      return <View key={set.id} style={[styles.setBlock, current && styles.setBlockCurrent, completed && styles.setBlockCompleted]}>
        <View style={styles.setRow}>
          <View style={[styles.setIdentity, { width: props.layout.setWidth }]}><Text style={styles.setNumber}>{set.number}</Text><Text style={[styles.setStateText, current && styles.accentText, completed && styles.successText]}>{completed ? "Done" : current ? "Now" : "Next"}</Text></View>
          {completed && !editing ? <Text style={[styles.completedValue, styles.flex]}>{set.actualReps} reps</Text> : <TextInput accessibilityLabel={`Actual reps for set ${set.number} of ${exercise.name}`} keyboardType="number-pad" returnKeyType="next" editable={!props.paused && !completed} selectTextOnFocus value={editing ? props.editState!.reps : values.reps} onChangeText={(reps) => editing ? props.setEditState({ ...props.editState!, reps }) : props.setSetValues((currentValues) => ({ ...currentValues, [set.id]: { ...values, reps } }))} style={[styles.compactInput, styles.flex, props.fieldError === "reps" && current && styles.inputError, (completed && !editing) && styles.lockedInput]} />}
          {set.loadSemantic === "bodyweight" ? <View style={styles.bodyweightCell}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.bodyweightText}>Bodyweight</Text></View> : completed && !editing ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={[styles.completedValue, styles.loadColumn]}>{set.actualLoad} {set.unit}</Text> : set.loadSemantic === "unavailable" ? <View style={styles.loadColumn}><Text numberOfLines={2} style={styles.unavailableText}>Unavailable</Text></View> : <View style={styles.loadInputWrap}><TextInput accessibilityLabel={`${set.loadInputLabel} for set ${set.number} of ${exercise.name}, ${props.displayUnit}`} keyboardType="decimal-pad" returnKeyType="done" editable={!props.paused && !completed} selectTextOnFocus value={editing ? props.editState!.load : values.load} onChangeText={(load) => editing ? props.setEditState({ ...props.editState!, load }) : props.setSetValues((currentValues) => ({ ...currentValues, [set.id]: { ...values, load } }))} style={[styles.compactInput, styles.loadInput, props.fieldError === "load" && current && styles.inputError]} /><Text style={styles.unitLabel}>{props.displayUnit}</Text></View>}
          <Pressable accessibilityRole="button" accessibilityLabel={completed ? `Set ${set.number} completed; edit available below` : `Complete set ${set.number} of ${exercise.name}`} accessibilityState={{ disabled: completed || !current || props.paused }} disabled={completed || !current || props.paused || (calibration?.required && !props.calibrationConfirmed) || set.loadSemantic === "unavailable"} onPress={() => props.onComplete(set)} style={({ pressed }) => [styles.doneControl, completed && styles.doneControlComplete, (!current || props.paused) && styles.doneControlUpcoming, pressed && styles.doneControlPressed]}><Text numberOfLines={1} style={[styles.doneGlyph, completed && styles.doneGlyphComplete]}>{completed ? "✓" : "✓"}</Text></Pressable>
        </View>
        <View style={styles.setDetailRow}>
          <Text style={styles.tinyMuted}>Target {set.target}{set.previous ? ` · Previous ${set.previous}` : ""}</Text>
          {completed && !editing ? <Pressable accessibilityRole="button" accessibilityLabel={`Edit completed set ${set.number} of ${exercise.name}`} hitSlop={8} onPress={() => props.onBeginEdit(set)}><Text style={styles.editLink}>Edit</Text></Pressable> : null}
          {editing ? <View style={styles.editActions}><Pressable accessibilityRole="button" accessibilityLabel={`Cancel editing set ${set.number}`} onPress={() => props.setEditState(null)}><Text style={styles.cancelLink}>Cancel</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Save edits to set ${set.number}`} onPress={() => props.onSaveEdit(set)}><Text style={styles.saveLink}>Save</Text></Pressable></View> : null}
        </View>
      </View>;
    })}</View>
  </View>;
}

function RestPanel({ timer, seconds, nextInstruction, onAction }: Readonly<{ timer: NonNullable<ReturnType<typeof restoreCanonicalRestTimer>>; seconds: number; nextInstruction: string | null; onAction(action: "pause" | "resume" | "add" | "skip"): void }>) {
  const expired = timer.state === "expired";
  const paused = timer.state === "paused";
  return <View style={styles.restPanel} accessibilityLiveRegion="polite">
    <View style={styles.restTop}><View><Text style={styles.eyebrow}>{expired ? "REST COMPLETE" : paused ? "REST PAUSED" : "REST"}</Text><Text accessibilityLabel={expired ? "Rest complete" : `${seconds} seconds remaining`} style={styles.restTime}>{expired ? "GO" : formatTimer(seconds)}</Text></View><Text style={styles.restPrescribed}>{timer.prescribedDurationSeconds}s prescribed</Text></View>
    {expired && nextInstruction ? <Text style={styles.restInstruction}>{nextInstruction}</Text> : null}
    {!expired ? <View style={styles.restActions}>
      <RestAction label={paused ? "Resume" : "Pause"} onPress={() => onAction(paused ? "resume" : "pause")} />
      <RestAction label="+30s" onPress={() => onAction("add")} />
      <RestAction label="Skip" onPress={() => onAction("skip")} />
    </View> : <RestAction label="Dismiss" onPress={() => onAction("skip")} />}
  </View>;
}

function RestAction({ label, onPress }: Readonly<{ label: string; onPress(): void }>) { return <Pressable accessibilityRole="button" accessibilityLabel={`${label} rest timer`} onPress={onPress} style={({ pressed }) => [styles.restAction, pressed && styles.pressed]}><Text numberOfLines={1} style={styles.restActionText}>{label}</Text></Pressable>; }

function PausedBanner({ busy, onResume }: Readonly<{ busy: boolean; onResume(): void }>) { return <View style={styles.pausedBanner}><View style={styles.flex}><Text style={styles.pausedTitle}>Workout paused</Text><Text style={styles.smallMuted}>Your completed work and rest state are saved.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Resume workout" disabled={busy} onPress={onResume} style={({ pressed }) => [styles.resumeAction, pressed && styles.primaryActionPressed]}><Text style={styles.resumeActionText}>Resume</Text></Pressable></View>; }

function FinishPanel({ presentation, busy, onFinish }: Readonly<{ presentation: WorkoutPresentation; busy: boolean; onFinish(): void }>) { return <View style={styles.finishPanel}><Text style={styles.finishTitle}>Finish workout</Text><Text style={styles.smallMuted}>{presentation.finishAllowed ? "Your recorded working sets are ready to complete." : presentation.finishBlockedReason}</Text><Pressable accessibilityRole="button" accessibilityLabel={presentation.finishAllowed ? "Finish workout" : `Finish workout unavailable. ${presentation.finishBlockedReason}`} accessibilityState={{ disabled: !presentation.finishAllowed }} disabled={!presentation.finishAllowed || busy} onPress={onFinish} style={({ pressed }) => [styles.finishAction, pressed && styles.primaryActionPressed, (!presentation.finishAllowed || busy) && styles.disabled]}><Text numberOfLines={1} style={styles.finishActionText}>{busy ? "Saving…" : "Finish workout"}</Text></Pressable></View>; }

function TrainActionModal({ modal, reduceMotion, busy, onContinue, onPauseLeave, onRequestDiscard, onDiscard, onFinish }: Readonly<{ modal: TrainModal; reduceMotion: boolean; busy: boolean; onContinue(): void; onPauseLeave(): void; onRequestDiscard(): void; onDiscard(): void; onFinish(): void }>) {
  return <Modal visible={modal !== null} transparent animationType={reduceMotion ? "none" : "fade"} onRequestClose={onContinue} statusBarTranslucent>
    <View style={styles.modalBackdrop}><View accessibilityViewIsModal accessibilityRole="none" style={styles.modalSheet}>
      {modal === "close" ? <>
        <Text style={styles.modalTitle}>Leave this workout?</Text><Text style={styles.body}>Your valid completed sets are saved. Choose how you want to leave.</Text>
        <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>{canonicalTrainCloseActions[0].label}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={onPauseLeave} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>{canonicalTrainCloseActions[1].label}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={onRequestDiscard} style={({ pressed }) => [styles.modalAction, styles.modalDangerOutline, pressed && styles.pressed]}><Text style={styles.modalDangerText}>{canonicalTrainCloseActions[2].label}</Text></Pressable>
      </> : modal === "discard" ? <>
        <Text style={styles.modalTitle}>Discard active attempt?</Text><Text style={styles.body}>This removes this in-progress attempt, its performed sets, and its rest timer. Completed workout history and the immutable prescription stay safe.</Text>
        <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Cancel</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={onDiscard} style={({ pressed }) => [styles.modalAction, styles.modalDanger, pressed && styles.pressed]}><Text style={styles.modalDangerFilledText}>{busy ? "Discarding…" : "Discard workout"}</Text></Pressable>
      </> : modal === "finish" ? <>
        <Text style={styles.modalTitle}>Finish workout?</Text><Text style={styles.body}>Your recorded sets will be completed exactly once and added to History.</Text>
        <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.modalAction, pressed && styles.pressed]}><Text style={styles.modalActionText}>Keep training</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={onFinish} style={({ pressed }) => [styles.modalAction, styles.modalPrimary, pressed && styles.pressed]}><Text style={styles.modalPrimaryText}>{busy ? "Finishing…" : "Finish workout"}</Text></Pressable>
      </> : null}
    </View></View>
  </Modal>;
}

function Field({ label, value, unit, keyboardType, error, onChange }: Readonly<{ label: string; value: string; unit: string; keyboardType: "number-pad" | "decimal-pad"; error: boolean; onChange(value: string): void }>) { return <View style={styles.field}><Text style={styles.columnLabel}>{label}</Text><View style={[styles.fieldInputWrap, error && styles.inputError]}><TextInput accessibilityLabel={`${label}, ${unit}`} keyboardType={keyboardType} value={value} onChangeText={onChange} style={styles.fieldInput} /><Text style={styles.unitLabel}>{unit}</Text></View></View>; }
function Stat({ label, value }: Readonly<{ label: string; value: string }>) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.tinyMuted}>{label}</Text></View>; }

function UnavailableState({ message, detail, onReturn, onRestore }: Readonly<{ message: string; detail?: string | null; onReturn(): void; onRestore?: () => void }>) { return <AppScreen><Text style={{ color: colors.text, fontSize: 28, fontWeight: "900" }}>Train safely</Text><Text style={{ color: colors.textMuted }}>{message}</Text>{detail ? <Text style={{ color: colors.textMuted }}>{detail}</Text> : null}{onRestore ? <SecondaryButton label="Restore workout" onPress={onRestore} /> : null}<SecondaryButton label="Return to Home" onPress={onReturn} /></AppScreen>; }

function TrainPaywall({ onRestore }: Readonly<{ onRestore(): void }>) {
  return <AppScreen>
    <Text style={{ color: colors.text, ...type.hero }}>Build More Muscle.</Text>
    <Text style={{ color: colors.text, ...type.hero }}>Get Stronger.</Text>
    <Text style={{ color: colors.text, ...type.hero }}>Stop Guessing.</Text>
    <Text style={{ color: colors.textMuted }}>Your adaptive training plan is ready. Start your free trial to unlock coached workouts, progression, and recovery guidance.</Text>
    <Text style={{ color: colors.accent, ...type.section }}>14-day free trial</Text>
    <Text style={{ color: colors.textMuted }}>Cancel anytime.</Text>
    <Text style={{ color: colors.text }}>Know exactly what to do every workout</Text>
    <Text style={{ color: colors.text }}>Adaptive progression based on your performance</Text>
    <Text style={{ color: colors.text }}>Warm-Up Sets and Session Prep included</Text>
    <Text style={{ color: colors.text }}>Strength Dashboard, PRs, and e1RM tracking</Text>
    <Text style={{ color: colors.text }}>Recovery & Capacity guidance</Text>
    <PrimaryButton label="Start 14-Day Free Trial" onPress={() => router.push("/(protected)/paywall")} />
    <SecondaryButton label="Restore Purchases" onPress={onRestore} />
    <SecondaryButton label="View Plan" onPress={() => router.push("/(protected)/(tabs)/programmes")} />
    <Text style={{ color: colors.textMuted }}>Checking your plan access</Text>
    <Text style={{ color: colors.textMuted }}>Managed securely through your App Store or Google Play account.</Text>
  </AppScreen>;
}

function lifecycleCommand(planId: string, revision: number, recordedSessionId: string, ledgerVersion: number, action: string) { return { planId, expectedPlanRevision: revision, recordedSessionId, expectedLedgerVersion: ledgerVersion, operationId: operationId(action), occurredAt: new Date().toISOString(), provenance: "canonical_train" }; }
function awaitHaptic(promise: Promise<void>) { void promise.catch(() => undefined); }
function formatElapsed(seconds: number) { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const remainder = seconds % 60; return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`; }
function formatTimer(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
function friendlyReason(reason: string): string { const labels: Record<string, string> = { canonical_session_started: "Workout started", performed_work_recorded: "Set completed", performed_work_edited: "Set updated", session_pause: "Workout paused and saved", session_resumed: "Workout resumed", session_completed: "Workout complete", session_attempt_discarded: "Active attempt discarded; the session is planned again", stale_ledger_version: "This workout changed. Refresh and try again.", stale_plan_revision: "Your plan changed. Return to Home and reopen this workout." }; return labels[reason] ?? reason.replace(/_/g, " "); }

export { recordCanonicalPerformedWork };

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shell: { flex: 1, backgroundColor: TRAIN.background },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: TRAIN.line },
  headerControl: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong },
  closeGlyph: { color: TRAIN.text, fontSize: 31, lineHeight: 34, fontWeight: "500" },
  headerTitleArea: { flex: 1, minWidth: 0 },
  headerTitle: { color: TRAIN.text, fontSize: 16, lineHeight: 20, fontWeight: "900" },
  headerMeta: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "700", fontVariant: ["tabular-nums"] },
  headerPercent: { minWidth: 48, height: 36, paddingHorizontal: 8, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accentSoft },
  headerPercentText: { color: TRAIN.accent, fontSize: 12, fontWeight: "900", fontVariant: ["tabular-nums"] },
  progressTrack: { height: 4, backgroundColor: TRAIN.surfaceRaised },
  progressFill: { height: 4, backgroundColor: TRAIN.accent },
  content: { gap: 12, paddingHorizontal: 12, paddingTop: 12 },
  previewContent: { gap: 14, padding: 16, paddingBottom: 40 },
  previewSummary: { gap: 8, padding: 16, borderRadius: 18, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  eyebrow: { color: TRAIN.accent, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1 },
  previewTitle: { color: TRAIN.text, fontSize: 28, lineHeight: 33, fontWeight: "900" },
  body: { color: TRAIN.muted, fontSize: 15, lineHeight: 21, fontWeight: "500" },
  previewStats: { flexDirection: "row", gap: 8, marginTop: 8 },
  stat: { flex: 1, minWidth: 0, padding: 10, borderRadius: 12, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.line },
  statValue: { color: TRAIN.text, fontSize: 19, lineHeight: 23, fontWeight: "900" },
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
  message: { color: TRAIN.muted, fontSize: 13, lineHeight: 19, paddingHorizontal: 4 },
  exerciseRail: { gap: 6 },
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
  calibrationPanel: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: TRAIN.accentSoft, borderWidth: 1, borderColor: TRAIN.accent },
  calibrationTitle: { color: TRAIN.text, fontSize: 20, lineHeight: 25, fontWeight: "900" },
  calibrationInputs: { flexDirection: "row", gap: 8 },
  field: { flex: 1, minWidth: 0, gap: 5 },
  fieldInputWrap: { minHeight: 48, flexDirection: "row", alignItems: "center", borderRadius: 10, backgroundColor: TRAIN.background, borderWidth: 1, borderColor: TRAIN.lineStrong },
  fieldInput: { flex: 1, minWidth: 0, minHeight: 46, color: TRAIN.text, fontSize: 17, fontWeight: "800", paddingLeft: 10, paddingRight: 42 },
  unitLabel: { position: "absolute", right: 0, color: TRAIN.muted, fontSize: 11, fontWeight: "900", textTransform: "uppercase", paddingRight: 8 },
  calibrationAction: { minHeight: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.accent, paddingHorizontal: 12 },
  calibrationActionText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  calibrationReady: { gap: 3, padding: 10, borderRadius: 10, backgroundColor: TRAIN.successSoft, borderWidth: 1, borderColor: TRAIN.success },
  setHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
  columnLabel: { color: TRAIN.subtle, fontSize: 10, lineHeight: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  loadColumn: { flex: 1.18, minWidth: 0 },
  setBlock: { gap: 5, padding: 7, borderRadius: 12, borderWidth: 1, borderColor: TRAIN.line, backgroundColor: TRAIN.background },
  setBlockCurrent: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accentSoft },
  setBlockCompleted: { borderColor: "#28553D", backgroundColor: TRAIN.successSoft },
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
  doneControlUpcoming: { backgroundColor: "transparent", borderColor: TRAIN.lineStrong, opacity: 0.55 },
  doneControlPressed: { transform: [{ scale: 0.96 }] },
  doneGlyph: { color: TRAIN.background, fontSize: 21, lineHeight: 23, fontWeight: "900" },
  doneGlyphComplete: { color: TRAIN.background },
  setDetailRow: { minHeight: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 4 },
  editLink: { color: TRAIN.accent, fontSize: 12, fontWeight: "900", paddingVertical: 3 },
  editActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  cancelLink: { color: TRAIN.muted, fontSize: 12, fontWeight: "900" },
  saveLink: { color: TRAIN.success, fontSize: 12, fontWeight: "900" },
  restPanel: { gap: 10, padding: 14, borderRadius: 18, backgroundColor: TRAIN.accentSoft, borderWidth: 2, borderColor: TRAIN.accent },
  restTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  restTime: { color: TRAIN.text, fontSize: 48, lineHeight: 52, fontWeight: "900", fontVariant: ["tabular-nums"] },
  restPrescribed: { color: TRAIN.muted, fontSize: 11, fontWeight: "800", paddingTop: 3 },
  restInstruction: { color: TRAIN.text, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  restActions: { flexDirection: "row", gap: 8 },
  restAction: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong, paddingHorizontal: 8 },
  restActionText: { color: TRAIN.text, fontSize: 13, fontWeight: "900" },
  pausedBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.accent },
  pausedTitle: { color: TRAIN.text, fontSize: 16, fontWeight: "900" },
  resumeAction: { minWidth: 92, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: TRAIN.accent },
  resumeActionText: { color: TRAIN.background, fontSize: 14, fontWeight: "900" },
  finishPanel: { gap: 8, padding: 14, borderRadius: 16, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  finishTitle: { color: TRAIN.text, fontSize: 18, fontWeight: "900" },
  finishAction: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: TRAIN.accent, paddingHorizontal: 12 },
  finishActionText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.78)", padding: 12 },
  modalSheet: { gap: 10, padding: 18, paddingBottom: 24, borderRadius: 22, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.lineStrong },
  modalTitle: { color: TRAIN.text, fontSize: 23, lineHeight: 28, fontWeight: "900" },
  modalAction: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: TRAIN.surfaceRaised, borderWidth: 1, borderColor: TRAIN.lineStrong, paddingHorizontal: 12 },
  modalActionText: { color: TRAIN.text, fontSize: 15, fontWeight: "900" },
  modalDangerOutline: { borderColor: TRAIN.danger, backgroundColor: TRAIN.dangerSoft },
  modalDangerText: { color: TRAIN.danger, fontSize: 15, fontWeight: "900" },
  modalDanger: { borderColor: TRAIN.danger, backgroundColor: TRAIN.danger },
  modalDangerFilledText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  modalPrimary: { borderColor: TRAIN.accent, backgroundColor: TRAIN.accent },
  modalPrimaryText: { color: TRAIN.background, fontSize: 15, fontWeight: "900" },
  disabled: { opacity: 0.42 },
  pressed: { opacity: 0.76 },
});
