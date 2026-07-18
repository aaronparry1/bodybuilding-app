import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { loadPlannedSession } from "@/application/training/canonical-active-plan-application";
import {
  completeCanonicalSession,
  pauseCanonicalSession,
  prescriptionHash,
  recordCanonicalPerformedWork,
  restoreCanonicalRecordedSessionFromLedger,
  resumeCanonicalSession,
  startCanonicalSession,
} from "@/application/training/canonical-recorded-session-application";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { useSubscription } from "@/application/billing/subscription-context";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
import { exerciseDisplayName, loadingModeDisplayName, methodDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import { hapticFeedback } from "@/application/training/haptic-feedback";
import { projectCanonicalWorkoutPresentation } from "@/application/training/canonical-workout-presentation";

type RouteParams = Readonly<{ planId?: string; planRevision?: string; plannedSessionId?: string; recordedSessionId?: string; action?: string; lifecycle?: string }>;

function operationId(prefix: string) { return `train:${prefix}:${Date.now()}`; }

export default function TrainScreen() {
  const subscription = useSubscription();
  if (!subscription.isPremium) return <AppScreen><Text style={{ color: colors.text, ...type.hero }}>Build More Muscle.</Text><Text style={{ color: colors.text, ...type.hero }}>Get Stronger.</Text><Text style={{ color: colors.text, ...type.hero }}>Stop Guessing.</Text><Text style={{ color: colors.textMuted }}>Your adaptive training plan is ready. Start your free trial to unlock coached workouts, progression, and recovery guidance.</Text><Text style={{ color: colors.accent, ...type.section }}>14-day free trial</Text><Text style={{ color: colors.textMuted }}>Cancel anytime.</Text><Text style={{ color: colors.text }}>Know exactly what to do every workout</Text><Text style={{ color: colors.text }}>Adaptive progression based on your performance</Text><Text style={{ color: colors.text }}>Warm-Up Sets and Session Prep included</Text><Text style={{ color: colors.text }}>Strength Dashboard, PRs, and e1RM tracking</Text><Text style={{ color: colors.text }}>Recovery & Capacity guidance</Text><PrimaryButton label="Start 14-Day Free Trial" onPress={() => router.push("/(protected)/paywall")} /><SecondaryButton label="Restore Purchases" onPress={subscription.restorePurchases} /><SecondaryButton label="View Plan" onPress={() => router.push("/(protected)/(tabs)/programmes")} /><Text style={{ color: colors.textMuted }}>Checking your plan access</Text><Text style={{ color: colors.textMuted }}>Managed securely through your App Store or Google Play account.</Text></AppScreen>;
  const params = useLocalSearchParams<RouteParams>();
  const [, refresh] = useState(0);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  const plan = canonicalActivePlanState.getReadModel();
  const route = useMemo(() => ({ planId: String(params.planId ?? ""), revision: Number(params.planRevision), plannedSessionId: params.plannedSessionId ? String(params.plannedSessionId) : undefined, recordedSessionId: params.recordedSessionId ? String(params.recordedSessionId) : undefined, action: String(params.action ?? params.lifecycle ?? "open") }), [params]);
  const [message, setMessage] = useState<string | null>(null);
  const [setValues, setSetValues] = useState<Record<string, { reps: string; load: string }>>({});
  const [recordedId, setRecordedId] = useState(route.recordedSessionId ?? plan?.activeRecordedSession?.recordedSessionId);
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [restNow, setRestNow] = useState(() => Date.now());
  useEffect(() => { if (!recordedId && plan?.activeRecordedSession?.recordedSessionId) setRecordedId(plan.activeRecordedSession.recordedSessionId); }, [plan?.activeRecordedSession?.recordedSessionId, recordedId]);
  useEffect(() => { if (restUntil === null) return; const timer = setInterval(() => setRestNow(Date.now()), 250); return () => clearInterval(timer); }, [restUntil]);
  const aggregate = recordedId ? canonicalRecordedSessionLedger.get(recordedId) : { status: "not_found" as const };
  const plannedId = route.plannedSessionId ?? plan?.nextSession?.id;
  const snapshot = aggregate.status === "found" ? aggregate.session.prescriptionSnapshot : plannedId ? loadPlannedSession(plannedId)?.prescriptionSnapshot : null;
  const slots = snapshot && Array.isArray((snapshot as Record<string, unknown>).slots) ? (snapshot as { slots: readonly Record<string, unknown>[] }).slots : [];

  const openPlanned = () => {
    if (!plan || !plannedId || plan.revision !== (Number.isInteger(route.revision) ? route.revision : plan.revision)) { setMessage("This planned session is no longer current. Return to Home and refresh."); return; }
    const planned = loadPlannedSession(plannedId);
    if (!planned) { setMessage("This planned session is no longer available."); return; }
    const result = startCanonicalSession({ planId: plan.planId, expectedPlanRevision: plan.revision, plannedSessionId: planned.id, expectedPrescriptionHash: prescriptionHash(planned.prescriptionSnapshot), operationId: operationId("start"), startedAt: new Date().toISOString(), provenance: "canonical_train" });
    if (result.recordedSessionId) setRecordedId(result.recordedSessionId);
    setMessage(result.reason);
    canonicalActivePlanState.refresh();
  };

  const restoreRecorded = () => {
    if (!plan || !recordedId || !Number.isInteger(route.revision)) { setMessage("This recorded session cannot be restored."); return; }
    const result = restoreCanonicalRecordedSessionFromLedger(plan.planId, recordedId);
    setMessage(result.status === "restored" ? `Session ${result.session.status}` : result.reason);
  };

  const pauseResume = () => {
    if (!plan || aggregate.status !== "found") return;
    const command = { planId: plan.planId, expectedPlanRevision: plan.revision, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: operationId(aggregate.session.status === "paused" ? "resume" : "pause"), occurredAt: new Date().toISOString(), provenance: "canonical_train" };
    const result = aggregate.session.status === "paused" ? resumeCanonicalSession(command) : pauseCanonicalSession(command);
    setMessage(result.reason);
    canonicalActivePlanState.refresh();
  };

  const complete = () => {
    if (!plan || aggregate.status !== "found") return;
    const result = completeCanonicalSession({ planId: plan.planId, expectedPlanRevision: plan.revision, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: operationId("complete"), occurredAt: new Date().toISOString(), provenance: "canonical_train" });
    setMessage(result.reason);
    canonicalActivePlanState.refresh();
  };

  const recordSet = (slot: Record<string, unknown>, index: number) => {
    if (!plan || aggregate.status !== "found") return;
    const values = setValues[`${String(slot.id)}:${index}`] ?? { reps: "", load: "" };
    const reps = Number(values.reps);
    const load = Number(values.load);
    if (!Number.isInteger(reps) || reps < 1 || !Number.isFinite(load) || load < 0) { setMessage("Enter the reps and load completed for this set."); return; }
    const result = recordCanonicalPerformedWork({ planId: plan.planId, expectedPlanRevision: plan.revision, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: operationId(`set:${String(slot.id)}:${index}`), occurredAt: new Date().toISOString(), provenance: "canonical_train", slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${String(slot.id)}:set:${index}`, setOrder: index, reps, load, unit: "kg", completion: "complete" });
    setMessage(result.reason);
    if (result.status === "applied") { setRestUntil(Date.now() + Number((slot.rest as Record<string, unknown> | undefined)?.seconds ?? 90) * 1000); awaitHaptic(hapticFeedback.setCompleted()); }
    canonicalActivePlanState.refresh();
  };

  if (!plan) return <AppScreen><Text style={{ color: colors.text }}>Your canonical training plan is not ready.</Text><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} /></AppScreen>;
  if (!recordedId && plannedId) return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.hero }}>Ready to train</Text><Text style={{ color: colors.textMuted }}>Review the prescribed workout, then start when you are ready.</Text>{snapshot ? <WorkoutPreview snapshot={snapshot} /> : null}<PrimaryButton label="Start workout" onPress={openPlanned} /><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} />{message ? <Text style={{ color: colors.textMuted }}>{message}</Text> : null}</View></AppScreen>;
  if (aggregate.status !== "found" || !snapshot) return <AppScreen><Text style={{ color: colors.text }}>This session could not be restored safely.</Text><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} />{message ? <Text style={{ color: colors.textMuted }}>{message}</Text> : null}</AppScreen>;
  const performanceEvents = aggregate.events.filter((event) => event.type === "performance");
  const presentation = projectCanonicalWorkoutPresentation({ session: aggregate.session, snapshot: aggregate.session.prescriptionSnapshot, events: aggregate.events });
  const restSeconds = restUntil === null ? 0 : Math.max(0, Math.ceil((restUntil - restNow) / 1000));
  return <AppScreen><ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xl }}><View style={{ gap: spacing.xs }}><Text style={{ color: colors.text, ...type.hero }}>{presentation.title}</Text><Text style={{ color: colors.textMuted }}>{presentation.completedSets} / {presentation.totalSets} sets · {presentation.progressPercent}% complete</Text>{restUntil !== null ? <View style={{ backgroundColor: colors.accentSoft, borderRadius: 14, padding: spacing.md }}><Text style={{ color: colors.accent, fontSize: 34, fontWeight: "900" }}>{restSeconds > 0 ? `${restSeconds}s rest` : "Rest complete"}</Text><SecondaryButton label="Skip rest" onPress={() => setRestUntil(null)} /></View> : null}</View>{presentation.exercises.map((exercise) => <View key={exercise.id} style={{ gap: spacing.xs, backgroundColor: colors.backgroundElevated, borderRadius: 14, padding: spacing.sm }}><Text style={{ color: colors.text, fontSize: 19, fontWeight: "900" }}>{exercise.order}. {exercise.name}</Text><Text style={{ color: colors.textMuted }}>{exercise.method} · {exercise.loadState}</Text><View style={{ flexDirection: "row", gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, paddingVertical: 5 }}><Text style={{ flex: 0.7, color: colors.textMuted, fontWeight: "800" }}>Set</Text><Text style={{ flex: 1, color: colors.textMuted, fontWeight: "800" }}>Target</Text><Text style={{ flex: 1, color: colors.textMuted, fontWeight: "800" }}>Load</Text><Text style={{ flex: 1.1, color: colors.textMuted, fontWeight: "800" }}>Actual</Text><Text style={{ flex: 0.8, color: colors.textMuted, fontWeight: "800" }}>Done</Text></View>{exercise.sets.map((set) => { const key = `${exercise.id}:${set.number}`; const values = setValues[key] ?? { reps: "", load: set.prescribedLoad === null ? "" : String(set.prescribedLoad) }; const done = set.state === "completed"; const current = set.state === "current"; return <View key={set.id} style={{ gap: 4, paddingVertical: spacing.xs, borderRadius: 8, backgroundColor: current ? colors.accentSoft : "transparent" }}><View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}><Text style={{ flex: 0.7, color: colors.text, fontWeight: "900" }}>{set.number}</Text><Text style={{ flex: 1, color: colors.text }}>{set.target}</Text><Text style={{ flex: 1, color: colors.text }}>{set.loadLabel}</Text><Text style={{ flex: 1.1, color: colors.textMuted }}>{done ? `${set.actualReps} × ${set.actualLoad} kg` : "—"}</Text><Pressable accessibilityRole="button" accessibilityLabel={done ? `Set ${set.number} completed` : `Complete set ${set.number}`} onPress={() => recordSet(slots.find((slot) => String(slot.id) === exercise.id)!, set.number)} disabled={done || aggregate.session.status === "completed"} style={{ flex: 0.8, minHeight: 42, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: done ? colors.surfaceSoft : colors.accent }}><Text style={{ color: done ? colors.textMuted : colors.background, fontWeight: "900" }}>{done ? "Done" : "Complete"}</Text></Pressable></View>{!done && current ? <View style={{ flexDirection: "row", gap: 6 }}><TextInput accessibilityLabel={`Reps for set ${set.number}`} placeholder={set.target} keyboardType="number-pad" value={values.reps} onChangeText={(reps) => setSetValues((currentValues) => ({ ...currentValues, [key]: { ...values, reps } }))} style={{ flex: 1, color: colors.text, borderColor: colors.line, borderWidth: 1, borderRadius: 8, padding: 8 }} /><TextInput accessibilityLabel="Actual load" placeholder={set.loadLabel} keyboardType="decimal-pad" value={values.load} onChangeText={(load) => setSetValues((currentValues) => ({ ...currentValues, [key]: { ...values, load } }))} style={{ flex: 1, color: colors.text, borderColor: colors.line, borderWidth: 1, borderRadius: 8, padding: 8 }} /></View> : null}</View>; })}</View>)}<SecondaryButton label={aggregate.session.status === "paused" ? "Resume" : "Pause"} onPress={pauseResume} disabled={aggregate.session.status === "completed"} /><PrimaryButton label="Finish workout" onPress={complete} disabled={!presentation.finishAllowed} />{message ? <Text style={{ color: colors.textMuted }}>{message === "session_started" || message === "canonical_session_started" ? "Workout started" : message}</Text> : null}</ScrollView></AppScreen>;
}

export { recordCanonicalPerformedWork };

function awaitHaptic(promise: Promise<void>) { void promise.catch(() => undefined); }

function WorkoutPreview({ snapshot }: { snapshot: Readonly<Record<string, unknown>> }) {
  const presentation = projectCanonicalWorkoutPresentation({ session: null, snapshot });
  return <View style={{ gap: spacing.sm, backgroundColor: colors.backgroundElevated, borderRadius: 14, padding: spacing.md }}>{presentation.exercises.map((exercise) => <View key={exercise.id}><Text style={{ color: colors.text, fontSize: 17, fontWeight: "900" }}>{exercise.order}. {exercise.name}</Text><Text style={{ color: colors.textMuted }}>{exercise.sets.length} sets · {exercise.sets[0]?.target ?? "Follow the prescribed target"} · {exercise.sets[0]?.loadLabel ?? "Load guidance shown in workout"}</Text></View>)}</View>;
}
