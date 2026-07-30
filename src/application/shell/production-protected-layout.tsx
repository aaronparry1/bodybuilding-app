import { Redirect, useGlobalSearchParams, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  inspectCanonicalRetainedTrainingPresence,
  resolveCanonicalExistingUserRoute,
} from "@/application/training/canonical-existing-user-routing";
import { backfillExistingUserOnboardingMetadata } from "@/application/training/canonical-onboarding-setup";
import { resumePendingCanonicalCoachingWork } from "@/application/training/canonical-completion-evidence-reconciliation";
import { reconcileCanonicalReleaseState, type CanonicalReleaseReconciliationResult } from "@/application/training/canonical-release-reconciliation";
import { resolveCanonicalStartupHydration } from "@/application/training/canonical-startup-hydration";
import { PrimaryButton } from "@/ui/primitives";
import { colors, spacing } from "@/ui/theme";

/** Production-only protected route boundary. QA and preview routes deliberately
 * live in the separate development Router root and are not imported here. */
export default function ProductionProtectedLayout() {
  const { user, isLoading, isOfflineMode } = useAuth();
  const { dataHydrationStatus, dataHydrationError, retryDataHydration } = useSubscription();
  const { settings } = useAppSettings();
  const segments = useSegments();
  const { restart } = useGlobalSearchParams<{ restart?: string }>();
  const [reconciliation, setReconciliation] = useState<CanonicalReleaseReconciliationResult | null>(null);
  const [reconciliationAttempt, setReconciliationAttempt] = useState(0);
  const isOnboardingRoute = segments.includes("onboarding");
  const isTrainRoute = segments.includes("train");
  const explicitSetupRestart = isOnboardingRoute && restart === "1";
  const retainedTraining = inspectCanonicalRetainedTrainingPresence(user?.id ?? null);
  const startupHydration = resolveCanonicalStartupHydration({
    authLoading: isLoading,
    authenticatedUserId: user?.id ?? null,
    localPlanStatus: retainedTraining.localPlanStatus,
    retainedTrainingStatus: retainedTraining.status,
    accountDataStatus: dataHydrationStatus,
  });
  const routeDecision = resolveCanonicalExistingUserRoute({
    hydration: startupHydration,
    reconciliation,
    isOnboardingRoute,
    explicitSetupRestart,
  });

  useEffect(() => {
    if (startupHydration.status !== "ready") {
      setReconciliation(null);
      return;
    }
    const result = reconcileCanonicalReleaseState({
      onboardingCompleted: settings.onboardingCompleted,
      updatedAt: new Date().toISOString(),
      authenticatedUserId: user?.id ?? null,
      accessMode: user ? "authenticated" : "offline",
    });
    setReconciliation(result);
    if (result.onboardingMetadataBackfillRequired && result.planVisible) {
      const backfill = backfillExistingUserOnboardingMetadata();
      if (backfill.status === "rejected" && process.env.NODE_ENV !== "production") {
        console.info("[startup:onboarding-metadata] backfill failed", backfill.reason);
      }
    }
    if (result.status === "ready" || result.status === "reconstructed") {
      const hydrated = canonicalActivePlanState.hydrate();
      if (hydrated.model) resumePendingCanonicalCoachingWork(hydrated.model.planId);
    }
  }, [
    reconciliationAttempt,
    settings.onboardingCompleted,
    startupHydration.reason,
    startupHydration.status,
    user?.id,
  ]);

  if (isLoading) return <Loading />;
  if (!user && !isOfflineMode) return <Redirect href="/(auth)" />;
  if (routeDecision.status === "waiting") return <Loading />;
  if (routeDecision.status === "recovery") {
    const retry = () => {
      setReconciliation(null);
      retryDataHydration();
      setReconciliationAttempt((attempt) => attempt + 1);
    };
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>We found training that needs restoring</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>
          {reconciliation?.customerGuidance ?? "Your programme and workout have not been changed. Try restoring them again before setting up anything new."}
        </Text>
        {dataHydrationError && process.env.NODE_ENV !== "production" ? <Text style={{ color: colors.textSubtle }}>{dataHydrationError}</Text> : null}
        <PrimaryButton label="Try restoring training" onPress={retry} />
      </View>
    );
  }
  if (routeDecision.status === "authenticated" && routeDecision.destination === "active_workout" && !isTrainRoute) {
    return <Redirect href="/(protected)/(tabs)/train" />;
  }
  if (routeDecision.status === "authenticated" && isOnboardingRoute) return <Redirect href="/(protected)/(tabs)" />;
  if (routeDecision.status === "onboarding" && !isOnboardingRoute) return <Redirect href="/(protected)/onboarding" />;

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
