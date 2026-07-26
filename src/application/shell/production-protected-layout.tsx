import { Redirect, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { resumePendingCanonicalCoachingWork } from "@/application/training/canonical-completion-evidence-reconciliation";
import { reconcileCanonicalReleaseState, type CanonicalReleaseReconciliationResult } from "@/application/training/canonical-release-reconciliation";
import { colors, spacing } from "@/ui/theme";

/** Production-only protected route boundary. QA and preview routes deliberately
 * live in the separate development Router root and are not imported here. */
export default function ProductionProtectedLayout() {
  const { user, isLoading, isOfflineMode } = useAuth();
  const { settings } = useAppSettings();
  const segments = useSegments();
  const [reconciliation, setReconciliation] = useState<CanonicalReleaseReconciliationResult | null>(null);
  const isOnboardingRoute = segments.includes("onboarding");

  useEffect(() => {
    const result = reconcileCanonicalReleaseState({ onboardingCompleted: settings.onboardingCompleted, updatedAt: new Date().toISOString() });
    setReconciliation(result);
    if (result.status === "ready" || result.status === "reconstructed") {
      const hydrated = canonicalActivePlanState.hydrate();
      if (hydrated.model) resumePendingCanonicalCoachingWork(hydrated.model.planId);
    }
  }, [settings.onboardingCompleted]);

  if (isLoading) return <Loading />;
  if (!user && !isOfflineMode) return <Redirect href="/(auth)" />;
  if (reconciliation === null) return <Loading />;
  if (!settings.onboardingCompleted && !isOnboardingRoute) return <Redirect href="/(protected)/onboarding" />;
  if (settings.onboardingCompleted && reconciliation.status === "setup_required" && !isOnboardingRoute) return <Redirect href="/(protected)/onboarding" />;
  if (settings.onboardingCompleted && ["recovery_required", "retry_required", "infeasible"].includes(reconciliation.status) && !isOnboardingRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>Training needs a safe refresh</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>{reconciliation.customerGuidance ?? "Your recorded history has not been changed. Try again before starting another workout."}</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitleStyle: { fontWeight: "800" }, headerShadowVisible: false, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="library/[id]" options={{ title: "Exercise" }} />
      <Stack.Screen name="library/new" options={{ title: "Custom Exercise" }} />
      <Stack.Screen name="programmes/[id]" options={{ title: "Programme" }} />
      <Stack.Screen name="programmes/builder" options={{ title: "Programme Builder" }} />
      <Stack.Screen name="programmes/session" options={{ title: "Session Builder" }} />
      <Stack.Screen name="history/index" options={{ title: "History" }} />
      <Stack.Screen name="history/[id]" options={{ title: "Workout Detail" }} />
      <Stack.Screen name="history/exercise/[id]" options={{ title: "Exercise History" }} />
      <Stack.Screen name="analytics/exercise/[id]" options={{ title: "Exercise Analytics" }} />
      <Stack.Screen name="analytics/muscles" options={{ title: "Muscle Analytics" }} />
      <Stack.Screen name="paywall" options={{ title: "Adaptive Strength Coach Premium" }} />
      <Stack.Screen name="session-prep" options={{ title: "Session Prep" }} />
      <Stack.Screen name="completion-summary" options={{ title: "Workout complete", headerBackVisible: false }} />
      <Stack.Screen name="capacity-focus" options={{ title: "Low Back Capacity" }} />
      <Stack.Screen name="onboarding" options={{ title: "Welcome" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

function Loading() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.accent} /></View>;
}
