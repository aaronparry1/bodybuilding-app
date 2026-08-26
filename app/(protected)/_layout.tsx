import Constants from "expo-constants";
import { Redirect, useGlobalSearchParams, useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/application/auth/auth-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { useSubscription } from "@/application/billing/subscription-context";
import { applyDesignQaFixture, designQaFixtures, getActiveDesignQaFixture, subscribeDesignQaFixture } from "@/application/design-qa/design-qa-fixtures";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import {
  inspectCanonicalRetainedTrainingPresence,
  resolveCanonicalExistingUserRoute,
  shouldAutoEnterCanonicalActiveWorkout,
} from "@/application/training/canonical-existing-user-routing";
import { backfillExistingUserOnboardingMetadata } from "@/application/training/canonical-onboarding-setup";
import { resumePendingCanonicalCoachingWork } from "@/application/training/canonical-completion-evidence-reconciliation";
import { reconcileCanonicalReleaseState, type CanonicalReleaseReconciliationResult } from "@/application/training/canonical-release-reconciliation";
import { resolveCanonicalStartupHydration } from "@/application/training/canonical-startup-hydration";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { isDesignQaModeAvailable, isDesignQaModeRequested } from "@/application/design-qa/design-qa-runtime";
import { colors, spacing } from "@/ui/theme";
import { PrimaryButton } from "@/ui/primitives";

export default function ProtectedLayout() {
  const insets = useSafeAreaInsets();
  const { user, isLoading, isOfflineMode } = useAuth();
  const { dataHydrationStatus, dataHydrationError, retryDataHydration, qaPremiumFixtureActive } = useSubscription();
  const { settings } = useAppSettings();
  const segments = useSegments();
  const router = useRouter();
  const { qaChrome, restart } = useGlobalSearchParams<{ qaChrome?: string; restart?: string }>();
  const designQaRuntimeAvailable = isDesignQaModeAvailable(getAppEnvironment()) && isDesignQaModeRequested();
  const [activeFixture, setActiveFixture] = useState(() => designQaRuntimeAvailable ? getActiveDesignQaFixture() : null);
  const [reconciliation, setReconciliation] = useState<CanonicalReleaseReconciliationResult | null>(null);
  const initialFixtureApplied = useRef(false);
  const isOnboardingRoute = segments.includes("onboarding");
  const explicitSetupRestart = isOnboardingRoute && restart === "1";
  const showDesignQaChrome = Boolean(activeFixture) && qaChrome === "1" && designQaRuntimeAvailable;
  const qaBuildIdentity = (Constants.expoConfig?.extra as { qaBuildIdentity?: unknown } | undefined)?.qaBuildIdentity;
  const qaNativeBuildLabel = typeof qaBuildIdentity === "string" && qaBuildIdentity.length > 0 ? ` · native ${qaBuildIdentity}` : "";
  const qaBundleIdentity = designQaRuntimeAvailable ? process.env.EXPO_PUBLIC_QA_BUNDLE_ID : undefined;
  const qaBundleLabel = typeof qaBundleIdentity === "string" && qaBundleIdentity.length > 0 ? ` · JS ${qaBundleIdentity}` : "";
  const retainedTraining = inspectCanonicalRetainedTrainingPresence(user?.id ?? null);
  const startupHydration = resolveCanonicalStartupHydration({
    authLoading: isLoading,
    authenticatedUserId: user?.id ?? null,
    localPlanStatus: retainedTraining.localPlanStatus,
    retainedTrainingStatus: retainedTraining.status,
    accountDataStatus: dataHydrationStatus,
  });
  const waitingForAccountRestore = startupHydration.status === "waiting"
    && startupHydration.reason === "account_data_restoring";
  const accountRestoreFailedWithoutLocalPlan = startupHydration.status === "retry_required";
  const routeDecision = resolveCanonicalExistingUserRoute({
    hydration: startupHydration,
    reconciliation,
    isOnboardingRoute,
    explicitSetupRestart,
  });

  useEffect(() => {
    if (!designQaRuntimeAvailable) { setActiveFixture(null); return; }
    return subscribeDesignQaFixture(() => setActiveFixture(getActiveDesignQaFixture()));
  }, [designQaRuntimeAvailable]);
  useEffect(() => {
    if (!designQaRuntimeAvailable || initialFixtureApplied.current) return;
    const requestedFixture = process.env.EXPO_PUBLIC_QA_INITIAL_FIXTURE;
    if (!requestedFixture) return;
    const definition = designQaFixtures.find((candidate) => candidate.id === requestedFixture);
    if (!definition) return;
    initialFixtureApplied.current = true;
    applyDesignQaFixture(definition.id, getAppEnvironment());
    router.replace(definition.targetHref);
  }, [designQaRuntimeAvailable, router]);
  useEffect(() => {
    if (activeFixture) { canonicalActivePlanState.hydrate(); return; }
    if (waitingForAccountRestore || accountRestoreFailedWithoutLocalPlan) {
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
  }, [accountRestoreFailedWithoutLocalPlan, activeFixture, settings.onboardingCompleted, user?.id, waitingForAccountRestore]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user && !isOfflineMode) return <Redirect href="/(auth)" />;
  if (!activeFixture && accountRestoreFailedWithoutLocalPlan) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>We couldn’t restore your training yet</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>
          Your local data has not been changed. Check your connection and try again before setting up a new programme.
        </Text>
        {dataHydrationError && process.env.NODE_ENV !== "production" ? <Text style={{ color: colors.textSubtle }}>{dataHydrationError}</Text> : null}
        <PrimaryButton label="Try again" onPress={retryDataHydration} />
      </View>
    );
  }
  if (!activeFixture && routeDecision.status === "waiting") return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.accent} /></View>;
  if (!activeFixture && shouldAutoEnterCanonicalActiveWorkout({ routeDecision, retainedTraining, isTrainRoute: segments.includes("train") })) return <Redirect href="/(protected)/(tabs)/train" />;
  if (!activeFixture && routeDecision.status === "authenticated" && isOnboardingRoute) return <Redirect href="/(protected)/(tabs)" />;
  if (!activeFixture && routeDecision.status === "onboarding" && !isOnboardingRoute) return <Redirect href="/(protected)/onboarding" />;
  if (!activeFixture && routeDecision.status === "recovery") {
    return <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>We found training that needs restoring</Text><Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>{reconciliation?.customerGuidance ?? "Your programme and workout have not been changed. Try restoring them again before setting up anything new."}</Text><PrimaryButton label="Try restoring training" onPress={retryDataHydration} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {showDesignQaChrome || qaPremiumFixtureActive ? (
        <View
          style={{
            backgroundColor: colors.accentSoft,
            borderBottomWidth: 1,
            borderBottomColor: colors.accent,
            paddingHorizontal: spacing.lg,
            paddingTop: Math.max(insets.top, spacing.xs),
            paddingBottom: spacing.xs,
          }}
        >
          <Text selectable adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900", textAlign: "center" }}>
            {qaPremiumFixtureActive ? `Premium QA · billing disabled${qaNativeBuildLabel}${qaBundleLabel}` : `Design QA: ${activeFixture?.label}${qaNativeBuildLabel}${qaBundleLabel}`}
          </Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}><Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="library/[id]" options={{ title: "Exercise" }} />
        <Stack.Screen name="library/new" options={{ title: "Custom Exercise" }} />
        <Stack.Screen name="programmes/[id]" options={{ title: "Programme" }} />
        <Stack.Screen name="programmes/builder" options={{ title: "Programme Builder" }} />
        <Stack.Screen name="programmes/session" options={{ title: "Session Builder" }} />
        <Stack.Screen name="programmes/manage" options={{ title: "Manage Exercises" }} />
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
        <Stack.Screen name="recovery-diagnostics" options={{ title: "Recovery Diagnostics" }} />
        <Stack.Screen name="diagnostics" options={{ title: "Diagnostics" }} />
        <Stack.Screen name="design-qa" options={{ title: "Design QA" }} />
        <Stack.Screen name="v2-benchmark-qa" options={{ title: "V2 QA" }} />
      </Stack></View>
    </View>
  );
}
