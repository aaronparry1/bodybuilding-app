import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
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
  const [recordedId, setRecordedId] = useState(route.recordedSessionId);
  const aggregate = recordedId ? canonicalRecordedSessionLedger.get(recordedId) : { status: "not_found" as const };
  const snapshot = aggregate.status === "found" ? aggregate.session.prescriptionSnapshot : route.plannedSessionId ? loadPlannedSession(route.plannedSessionId)?.prescriptionSnapshot : null;
  const slots = snapshot && Array.isArray((snapshot as Record<string, unknown>).slots) ? (snapshot as { slots: readonly Record<string, unknown>[] }).slots : [];

  const openPlanned = () => {
    if (!plan || !route.plannedSessionId || !Number.isInteger(route.revision) || plan.planId !== route.planId || plan.revision !== route.revision) { setMessage("This planned session is no longer current. Return to Home and refresh."); return; }
    const planned = loadPlannedSession(route.plannedSessionId);
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
    const result = recordCanonicalPerformedWork({ planId: plan.planId, expectedPlanRevision: plan.revision, recordedSessionId: aggregate.session.recordedSessionId, expectedLedgerVersion: aggregate.session.version, operationId: operationId(`set:${String(slot.id)}:${index}`), occurredAt: new Date().toISOString(), provenance: "canonical_train", slotId: String(slot.id), exerciseId: String(slot.exerciseId), setId: `${String(slot.id)}:set:${index}`, setOrder: index, reps: 0, load: 0, unit: "unknown", completion: "partial" });
    setMessage(result.reason);
    canonicalActivePlanState.refresh();
  };

  if (!plan) return <AppScreen><Text style={{ color: colors.text }}>Your canonical training plan is not ready.</Text><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} /></AppScreen>;
  if (!recordedId && route.plannedSessionId) return <AppScreen><Text style={{ color: colors.text, ...type.section }}>Planned session</Text><Text style={{ color: colors.textMuted }}>Open the exact canonical prescription for this session.</Text><PrimaryButton label="Start session" onPress={openPlanned} /><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} />{message ? <Text style={{ color: colors.textMuted }}>{message}</Text> : null}</AppScreen>;
  if (aggregate.status !== "found" || !snapshot) return <AppScreen><Text style={{ color: colors.text }}>This session could not be restored safely.</Text><SecondaryButton label="Return to Home" onPress={() => router.replace("/(protected)/(tabs)")} />{message ? <Text style={{ color: colors.textMuted }}>{message}</Text> : null}</AppScreen>;
  return <AppScreen><View style={{ gap: spacing.md }}><Text style={{ color: colors.text, ...type.section }}>Canonical session</Text><Text style={{ color: colors.textMuted }}>{aggregate.session.role} · {aggregate.session.status}</Text>{slots.map((slot, index) => <View key={String(slot.id)} style={{ gap: spacing.xs }}><Text style={{ color: colors.text }}>{String(slot.exerciseId)}</Text><Text style={{ color: colors.textMuted }}>{String(slot.method)} · {String(slot.loadingMode)}</Text><PrimaryButton label={`Record set ${index + 1}`} onPress={() => recordSet(slot, index + 1)} disabled={aggregate.session.status === "completed"} /></View>)}<PrimaryButton label={aggregate.session.status === "paused" ? "Resume session" : "Pause session"} onPress={pauseResume} disabled={aggregate.session.status === "completed"} /><PrimaryButton label="Complete session" onPress={complete} disabled={aggregate.session.status === "completed"} /><SecondaryButton label="Restore session" onPress={restoreRecorded} />{message ? <Text style={{ color: colors.textMuted }}>{message}</Text> : null}</View></AppScreen>;
}

export { recordCanonicalPerformedWork };
