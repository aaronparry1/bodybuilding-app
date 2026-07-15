import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalHome, type CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

function readHome(): CanonicalHomeProjection {
  const state = canonicalActivePlanState.getState();
  if (state.hydration === "empty") return projectCanonicalHome({ status: "empty", model: null });
  if (state.hydration === "error") return projectCanonicalHome({ status: "error", model: null });
  if (!state.model) return projectCanonicalHome({ status: "hydrating", model: null });
  return projectCanonicalHome({ status: "ready", model: state.model });
}

export default function HomeScreen() {
  const [, refresh] = useState<CanonicalActivePlanState>(canonicalActivePlanState.getState());
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh(canonicalActivePlanState.getState())); }, []);
  const home = readHome();
  const primary = home.actions[0];
  return (
    <AppScreen>
      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, ...type.hero }}>Today</Text>
          <Text style={{ color: colors.textMuted }}>Your canonical training plan, recorded history, and next action.</Text>
        </View>
        {home.status === "hydrating" && <Text style={{ color: colors.textMuted }}>Loading your training plan…</Text>}
        {home.status === "empty" && <><Text style={{ color: colors.text }}>No training plan is ready yet.</Text><PrimaryButton label="Set up training" onPress={() => router.push("/(protected)/onboarding")} /></>}
        {home.status === "storage_error" && <><Text style={{ color: colors.text }}>Your training history needs attention before Home can continue.</Text><SecondaryButton label="Retry" onPress={() => canonicalActivePlanState.refresh()} /></>}
        {home.status === "ready" && <>
          <View style={{ gap: spacing.xs }}><Text style={{ color: colors.textMuted }}>Current focus</Text><Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{home.macrocycle}</Text><Text style={{ color: colors.text }}>{home.mesocyclePurpose}</Text></View>
          {home.activeRecordedSession ? <View style={{ gap: spacing.xs }}><Text style={{ color: colors.textMuted }}>Workout in progress</Text><Text style={{ color: colors.text }}>{home.activeRecordedSession.role}</Text><PrimaryButton label="Resume workout" onPress={() => router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: home.planId, planRevision: String(home.revision), recordedSessionId: home.activeRecordedSession?.recordedSessionId, lifecycle: "resume" } })} /></View> : home.nextSession ? <View style={{ gap: spacing.xs }}><Text style={{ color: colors.textMuted }}>Next session</Text><Text style={{ color: colors.text }}>{home.nextSession.role}</Text><PrimaryButton label="Start workout" onPress={() => router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: home.planId, planRevision: String(home.revision), plannedSessionId: home.nextSession?.id, lifecycle: "start" } })} /></View> : <Text style={{ color: colors.textMuted }}>No actionable session is currently available.</Text>}
          <SecondaryButton label="View Progress" onPress={() => router.push("/(protected)/(tabs)/analytics")} />
          <Text style={{ color: colors.textMuted }}>Recorded history: {home.historicalCount} completed session{home.historicalCount === 1 ? "" : "s"}.</Text>
        </>}
      </View>
    </AppScreen>
  );
}
