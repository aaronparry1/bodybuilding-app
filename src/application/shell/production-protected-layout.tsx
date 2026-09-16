import { Redirect, useGlobalSearchParams, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { useAppSettings } from "@/application/settings/app-settings";
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
import { recoverLegacyExistingUserTraining } from "@/application/training/legacy-existing-user-recovery";
import { sameCanonicalReconciliation } from "@/application/training/stable-reconciliation";
import { PrimaryButton } from "@/ui/primitives";
import { colors, spacing } from "@/ui/theme";
import { elapsedSince, recordStartupTelemetry } from "@/application/startup/startup-observability";

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
  // Local plan version: bumps whenever the canonical plan store publishes, so
  // the (expensive) retained-training inspection below only re-reads storage
  // when training data changed, not on every navigation or context re-render.
  const [localPlanVersion, setLocalPlanVersion] = useState(0);
  useEffect(() => canonicalActivePlanState.subscribe(() => setLocalPlanVersion((value) => value + 1)), []);
  const retainedTraining = useMemo(
    () => inspectCanonicalRetainedTrainingPresence(user?.id ?? null),
    // reconciliation / dataHydrationStatus / localPlanVersion are invalidation signals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, reconciliation, dataHydrationStatus, localPlanVersion],
  );
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
    const reconciliationStartedAt = Date.now();
    recordStartupTelemetry({ stage: "reconciliation", outcome: "started" });
    const recovery = recoverLegacyExistingUserTraining(user?.id ?? null);
    if (recovery.status === "blocked") {
      updateReconciliation(setReconciliation, {
        status: "recovery_required",
        reason: recovery.reason,
        planVisible: false,
        historyPreserved: true,
        activeAttempt: "none",
        regeneratedFutureSessions: 0,
        customerGuidance: "We found earlier training data but could not safely reconnect it to your programme. Nothing has been overwritten. Retry account restore or contact support before creating a new plan.",
      });
      recordStartupTelemetry({ stage: "reconciliation", outcome: "failed", durationMs: elapsedSince(reconciliationStartedAt), reason: "unknown" });
      return;
    }
    const result = reconcileCanonicalReleaseState({
      onboardingCompleted: settings.onboardingCompleted,
      updatedAt: new Date().toISOString(),
      authenticatedUserId: user?.id ?? null,
      accessMode: user ? "authenticated" : "offline",
    });
    updateReconciliation(setReconciliation, result);
    recordStartupTelemetry({ stage: "reconciliation", outcome: result.status === "ready" || result.status === "reconstructed" ? "ready" : "failed", durationMs: elapsedSince(reconciliationStartedAt), reason: result.status === "ready" || result.status === "reconstructed" ? undefined : "unknown" });
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
    // Recovery/backfill above may have written local training data without a
    // store publish; make sure the memoised retained-training read refreshes.
    setLocalPlanVersion((value) => value + 1);
  }, [
    reconciliationAttempt,
    settings.onboardingCompleted,
    startupHydration.reason,
    startupHydration.status,
    user?.id,
  ]);

  if (isLoading) return <StartupState title="Checking your saved session" detail="This check has a deadline. Your training will not be changed." />;
  if (!user && !isOfflineMode) return <Redirect href="/(auth)" />;
  if (routeDecision.status === "waiting") return <StartupState title={routeDecision.reason === "canonical_reconciliation_pending" ? "Checking your local programme" : "Restoring your account in the background"} detail={routeDecision.reason === "canonical_reconciliation_pending" ? "Your saved programme and workout are being verified on this device." : "No safe local programme is available yet. You can retry if this check is delayed."} showSpinner />;
  if (routeDecision.status === "recovery") {
    const retry = () => {
      setReconciliation(null);
      retryDataHydration();
      setReconciliationAttempt((attempt) => attempt + 1);
    };
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }}>SAFE RECOVERY</Text>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: "900" }}>{dataHydrationStatus === "conflict" ? "This training belongs to another account" : dataHydrationStatus === "delayed" ? "Account restore is taking longer than expected" : "We found training that needs restoring"}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>
          {dataHydrationStatus === "conflict" ? "This device contains account-scoped training that cannot be shown for the signed-in account. Nothing has been overwritten." : dataHydrationStatus === "delayed" ? "The remote check reached its deadline. Nothing has been overwritten. Retry when your connection is stable." : reconciliation?.customerGuidance ?? "Your programme and workout have not been changed. Try restoring them again before setting up anything new."}
        </Text>
        {dataHydrationError && process.env.NODE_ENV !== "production" ? <Text style={{ color: colors.textSubtle }}>{dataHydrationError}</Text> : null}
        <PrimaryButton label="Try restoring training" onPress={retry} />
      </View>
    );
  }
  if (shouldAutoEnterCanonicalActiveWorkout({ routeDecision, retainedTraining, isTrainRoute })) {
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
    </Stack>
  );
}

function updateReconciliation(
  setter: Dispatch<SetStateAction<CanonicalReleaseReconciliationResult | null>>,
  next: CanonicalReleaseReconciliationResult | null,
): void {
  setter((current) => sameCanonicalReconciliation(current, next) ? current : next);
}

function StartupState({ title, detail, showSpinner = false }: Readonly<{ title: string; detail: string; showSpinner?: boolean }>) {
  return <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background, padding: spacing.xl, gap: spacing.md }}>
    {showSpinner ? <ActivityIndicator accessibilityLabel="Startup check in progress" color={colors.accent} /> : null}
    <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }}>SAFE STARTUP</Text>
    <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 28, lineHeight: 33, fontWeight: "900" }}>{title}</Text>
    <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 23 }}>{detail}</Text>
  </View>;
}
