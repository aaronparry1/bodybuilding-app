import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { canonicalActivePlanState, type CanonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalHome, type CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { AppScreen, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
import { sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";

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
          <Text style={{ color: colors.textMuted }}>Your next workout and progress at a glance.</Text>
        </View>
        {home.status === "hydrating" && <Text style={{ color: colors.textMuted }}>Loading your training plan…</Text>}
        {home.status === "empty" && <><Text style={{ color: colors.text }}>No training plan is ready yet.</Text><PrimaryButton label="Set up training" onPress={() => router.push("/(protected)/onboarding")} /></>}
        {home.status === "storage_error" && <><Text style={{ color: colors.text }}>Your training history needs attention before Home can continue.</Text><SecondaryButton label="Retry" onPress={() => canonicalActivePlanState.refresh()} /></>}
        {home.status === "ready" && <>
          <View style={{ gap: spacing.xs }}><Text style={{ color: colors.textMuted }}>Current focus</Text><Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{trainingGoalDisplayName(home.macrocycle ?? "")}</Text><Text style={{ color: colors.text }}>{home.mesocyclePurpose ?? "Your next training phase"}</Text></View>
          {home.activeRecordedSession ? <View style={{ gap: spacing.xs, backgroundColor: colors.backgroundElevated, borderRadius: 14, padding: spacing.md }}><Text style={{ color: colors.textMuted }}>Workout in progress</Text><Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>{sessionRoleDisplayName(home.activeRecordedSession.role)}</Text><Text style={{ color: colors.textMuted }}>{home.activeRecordedSession.performedSets} sets completed · keep going</Text><PrimaryButton label="Resume workout" onPress={() => router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: home.planId, planRevision: String(home.revision), recordedSessionId: home.activeRecordedSession?.recordedSessionId, lifecycle: "resume" } })} /></View> : home.nextSession ? <View style={{ gap: spacing.xs, backgroundColor: colors.backgroundElevated, borderRadius: 14, padding: spacing.md }}><Text style={{ color: colors.textMuted }}>Next workout</Text><Text style={{ color: colors.text, fontSize: 22, fontWeight: "900" }}>{sessionRoleDisplayName(home.nextSession.role)}</Text><Text style={{ color: colors.textMuted }}>{home.nextSessionSummary?.exerciseCount ?? 0} exercises · {home.nextSessionSummary?.setCount ?? 0} working sets</Text><PrimaryButton label="Start workout" onPress={() => router.push({ pathname: "/(protected)/(tabs)/train", params: { planId: home.planId, planRevision: String(home.revision), plannedSessionId: home.nextSession?.id, lifecycle: "start" } })} /></View> : <Text style={{ color: colors.textMuted }}>No workout is currently scheduled.</Text>}
          <SecondaryButton label="View Progress" onPress={() => router.push("/(protected)/(tabs)/analytics")} />
        </>}
      </View>
    </AppScreen>
  );
}
