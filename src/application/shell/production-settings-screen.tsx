import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { buildDataSafetyStatus } from "@/application/account/data-safety-status";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { customerSafeServiceMessage } from "@/application/runtime/customer-facing-errors";
import { useAppSettings } from "@/application/settings/app-settings";
import { getUnsyncedQueueCount, runManualSync, syncDiagnosticsStore } from "@/application/sync/sync-diagnostics";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { canonicalSessionDurationOptions, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";
import { PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, radius, spacing } from "@/ui/theme";

/** Production settings projection. Development diagnostics and QA routes are
 * owned by the isolated QA route tree, so this module cannot pull them into a
 * production bundle transitively. */
export default function ProductionSettingsScreen() {
  const { settings, updateSettings } = useAppSettings();
  const { user, isOfflineMode, signOut, error } = useAuth();
  const billing = useSubscription();
  const [, refresh] = useState(0);
  const [syncStatus, setSyncStatus] = useState(() => syncDiagnosticsStore.get());
  const [syncQueueCount, setSyncQueueCount] = useState(() => getUnsyncedQueueCount());
  const [durationMessage, setDurationMessage] = useState<string | null>(null);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  useEffect(() => syncDiagnosticsStore.subscribe(() => { setSyncStatus(syncDiagnosticsStore.get()); setSyncQueueCount(getUnsyncedQueueCount()); }), []);

  const plan = canonicalActivePlanState.getReadModel();
  const environment = getAppEnvironment();
  const accountError = customerSafeServiceMessage(error, environment, "Account backup is unavailable right now.");
  const billingError = customerSafeServiceMessage(billing.error, environment, "Subscription status could not refresh right now.");
  const dataSafety = buildDataSafetyStatus({ userEmail: user?.email, isOfflineMode, subscription: billing.subscription, syncStatus, unsyncedQueueCount: syncQueueCount });
  const restartSetup = () => { updateSettings({ onboardingCompleted: false }); router.replace("/(protected)/onboarding"); };
  const changeDuration = (availableSessionMinutes: CanonicalSessionDurationMinutes) => {
    if (!plan) { updateSettings({ availableSessionMinutes }); return; }
    const result = canonicalActivePlanState.changeSessionDuration({ planId: plan.planId, expectedRevision: plan.revision, availableSessionMinutes, updatedAt: new Date().toISOString() });
    if (result.status === "applied" || result.status === "unchanged") {
      updateSettings({ availableSessionMinutes });
      setDurationMessage(result.status === "applied" ? "Future workouts were rebuilt. Completed training was preserved." : "Workout length is unchanged.");
    } else setDurationMessage(result.customerGuidance ?? "Workout length could not be changed safely.");
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Settings" title="Training controls" subtitle="Manage preferences, backup and your programme." />
      {accountError ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{accountError}</Text> : null}
      <SectionHeader title="Account" />
      <PremiumCard><Text style={{ color: colors.text }}>Backup: {dataSafety.status}</Text>{user ? <SecondaryButton label="Retry sync" onPress={() => runManualSync(user.id, billing.subscription)} /> : null}</PremiumCard>
      <SectionHeader title="Subscription" />
      <PremiumCard>
        <Text style={{ color: colors.text }}>Plan: {billing.planLabel}</Text>
        {billing.restoreMessage ? <Text style={{ color: colors.textMuted }}>{billing.restoreMessage}</Text> : null}
        {billingError ? <Text style={{ color: colors.danger }}>{billingError}</Text> : null}
        <SecondaryButton label={billing.restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"} onPress={billing.restorePurchases} disabled={billing.isLoading} />
        {!billing.subscription.isPremium ? <Link href="/(protected)/paywall" asChild><SecondaryButton label="Upgrade" onPress={() => {}} /></Link> : <SecondaryButton label="Manage Subscription" onPress={billing.presentCustomerCenter} disabled={!billing.isRevenueCatConfigured} />}
      </PremiumCard>
      <SectionHeader title="Canonical training plan" />
      <PremiumCard>{plan ? <><Text style={{ color: colors.text }}>Focus: {trainingGoalDisplayName(plan.macrocycle.goal)}</Text><Text style={{ color: colors.text }}>Phase: {mesocyclePurposeDisplayName(plan.mesocycle.purpose)}</Text><Text style={{ color: colors.textMuted }}>Next workout: {plan.nextSession ? sessionRoleDisplayName(plan.nextSession.role) : "None currently planned"}</Text><Link href="/(protected)/(tabs)/programmes" asChild><SecondaryButton label="View programme" onPress={() => {}} /></Link></> : <><Text style={{ color: colors.textMuted }}>No programme is set up yet.</Text><SecondaryButton label="Set up training" onPress={restartSetup} /></>}</PremiumCard>
      <SectionHeader title="Display preferences" />
      <PremiumCard><View style={{ flexDirection: "row", gap: spacing.sm }}>{(["kg", "lb"] as const).map((unit) => <Pressable key={unit} accessibilityRole="button" accessibilityState={{ selected: settings.unit === unit }} accessibilityLabel={`Use ${unit}`} onPress={() => updateSettings({ unit })} style={{ flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: settings.unit === unit ? colors.accent : colors.line, backgroundColor: settings.unit === unit ? colors.accentSoft : colors.surfaceMuted }}><Text style={{ color: settings.unit === unit ? colors.accent : colors.textMuted, fontWeight: "900" }}>{unit.toUpperCase()}</Text></Pressable>)}</View></PremiumCard>
      <SectionHeader title="Plan management" />
      <PremiumCard>
        <Text style={{ color: colors.textMuted }}>Changes to training facts are reviewed by canonical planning owners and never edit started history. Your training history stays intact when you change preferences.</Text>
        <Text style={{ color: colors.text, fontWeight: "900" }}>Workout length</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>{canonicalSessionDurationOptions.map((minutes) => <Pressable key={minutes} testID={`settings-duration-${minutes}`} accessibilityRole="button" accessibilityState={{ selected: settings.availableSessionMinutes === minutes }} accessibilityLabel={`${minutes} minute workouts`} onPress={() => changeDuration(minutes)} style={{ minHeight: 44, minWidth: 64, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: settings.availableSessionMinutes === minutes ? colors.accent : colors.line, backgroundColor: settings.availableSessionMinutes === minutes ? colors.accentSoft : colors.surfaceMuted }}><Text style={{ color: settings.availableSessionMinutes === minutes ? colors.accent : colors.textMuted, fontWeight: "900" }}>{minutes} min</Text></Pressable>)}</View>
        {durationMessage ? <Text accessibilityLiveRegion="polite" style={{ color: colors.textMuted }}>{durationMessage}</Text> : null}
        <SecondaryButton label="Restart setup" onPress={restartSetup} />
      </PremiumCard>
      <PrimaryButton label="Logout" onPress={signOut} />
    </Screen>
  );
}
