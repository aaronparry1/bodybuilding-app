import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { buildDataSafetyStatus } from "@/application/account/data-safety-status";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import { getAppEnvironment } from "@/application/runtime/app-environment";
import { customerSafeServiceMessage, shouldShowDeveloperDiagnostics } from "@/application/runtime/customer-facing-errors";
import { useAppSettings } from "@/application/settings/app-settings";
import { getUnsyncedQueueCount, runManualSync, syncDiagnosticsStore } from "@/application/sync/sync-diagnostics";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { DetailToggle, ErrorState, LockedFeatureCard, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";
import { canonicalSessionDurationOptions, type CanonicalSessionDurationMinutes } from "@/domain/training/canonical-session-duration";

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppSettings();
  const { user, isOfflineMode, signOut, error } = useAuth();
  const { planLabel, subscription, restorePurchases, presentCustomerCenter, isLoading, entitlementStatus, isRevenueCatConfigured, error: subscriptionError, restoreStatus, restoreMessage } = useSubscription();
  const [, refresh] = useState(0);
  const [syncStatus, setSyncStatus] = useState(() => syncDiagnosticsStore.get());
  const [syncQueueCount, setSyncQueueCount] = useState(() => getUnsyncedQueueCount());
  const [durationMessage, setDurationMessage] = useState<string | null>(null);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  useEffect(() => syncDiagnosticsStore.subscribe(() => { setSyncStatus(syncDiagnosticsStore.get()); setSyncQueueCount(getUnsyncedQueueCount()); }), []);
  const plan = canonicalActivePlanState.getReadModel();
  const environment = getAppEnvironment();
  const showDevTools = shouldShowDeveloperDiagnostics(environment);
  const accountError = customerSafeServiceMessage(error, environment, "Account backup is unavailable right now.");
  const billingError = customerSafeServiceMessage(subscriptionError, environment, "Subscription status could not refresh right now.");
  const dataSafety = buildDataSafetyStatus({ userEmail: user?.email, isOfflineMode, subscription, syncStatus, unsyncedQueueCount: syncQueueCount });
  const restartSetup = () => { updateSettings({ onboardingCompleted: false }); router.replace("/(protected)/onboarding"); };
  const changeDuration = (availableSessionMinutes: CanonicalSessionDurationMinutes) => {
    if (!plan) { updateSettings({ availableSessionMinutes }); return; }
    const result = canonicalActivePlanState.changeSessionDuration({ planId: plan.planId, expectedRevision: plan.revision, availableSessionMinutes, updatedAt: new Date().toISOString() });
    if (result.status === "applied" || result.status === "unchanged") { updateSettings({ availableSessionMinutes }); setDurationMessage(result.status === "applied" ? "Future workouts were rebuilt. Completed training was preserved." : "Workout length is unchanged."); }
    else setDurationMessage(result.customerGuidance ?? "Workout length could not be changed safely.");
  };
  return <Screen><ScreenHeader eyebrow="Settings" title="Training controls" subtitle="Manage preferences, backup and your programme." />{showDevTools && accountError ? <ErrorState message={accountError} /> : null}<SectionHeader title="Account" /><PremiumCard><Text style={{ color: colors.text }}>Backup: {dataSafety.status}</Text>{user ? <SecondaryButton label="Retry sync" onPress={() => runManualSync(user.id, subscription)} /> : null}</PremiumCard><SectionHeader title="Subscription" /><PremiumCard><Text style={{ color: colors.text }}>Plan: {planLabel}</Text>{restoreMessage ? <Text style={{ color: colors.textMuted }}>{restoreMessage}</Text> : null}{billingError ? <Text style={{ color: colors.danger }}>{billingError}</Text> : null}<SecondaryButton label={restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"} onPress={restorePurchases} disabled={isLoading} />{!subscription.isPremium ? <Link href="/(protected)/paywall" asChild><SecondaryButton label="Upgrade" onPress={() => {}} /></Link> : <SecondaryButton label="Manage Subscription" onPress={presentCustomerCenter} disabled={!isRevenueCatConfigured} />}</PremiumCard><SectionHeader title="Canonical training plan" /><PremiumCard>{plan ? <><Text style={{ color: colors.text }}>Focus: {trainingGoalDisplayName(plan.macrocycle.goal)}</Text><Text style={{ color: colors.text }}>Phase: {mesocyclePurposeDisplayName(plan.mesocycle.purpose)}</Text><Text style={{ color: colors.textMuted }}>Next workout: {plan.nextSession ? sessionRoleDisplayName(plan.nextSession.role) : "None currently planned"}</Text><Text style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>Current programme</Text><Link href="/(protected)/(tabs)/programmes" asChild><SecondaryButton label="View programme" onPress={() => {}} /></Link></> : <><Text style={{ color: colors.textMuted }}>No programme is set up yet.</Text><SecondaryButton label="Set up training" onPress={restartSetup} /></>}</PremiumCard><SectionHeader title="Display preferences" /><PremiumCard><View style={{ flexDirection: "row", gap: spacing.sm }}>{(["kg", "lb"] as const).map((unit) => <Pressable key={unit} onPress={() => updateSettings({ unit })} style={{ flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: settings.unit === unit ? colors.accent : colors.line, backgroundColor: settings.unit === unit ? colors.accentSoft : colors.surfaceMuted }}><Text style={{ color: settings.unit === unit ? colors.accent : colors.textMuted, fontWeight: "900" }}>{unit.toUpperCase()}</Text></Pressable>)}</View></PremiumCard><SectionHeader title="Plan management" /><PremiumCard><Text style={{ color: colors.textMuted }}>Changes to training facts are reviewed by canonical planning owners and never edit started history. Your training history stays intact when you change preferences.</Text><Text style={{ color: colors.text, fontWeight: "900" }}>Workout length</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>{canonicalSessionDurationOptions.map((minutes) => <Pressable key={minutes} onPress={() => changeDuration(minutes)} style={{ minHeight: 42, minWidth: 64, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: 1, borderColor: settings.availableSessionMinutes === minutes ? colors.accent : colors.line, backgroundColor: settings.availableSessionMinutes === minutes ? colors.accentSoft : colors.surfaceMuted }}><Text style={{ color: settings.availableSessionMinutes === minutes ? colors.accent : colors.textMuted, fontWeight: "900" }}>{minutes} min</Text></Pressable>)}</View>{durationMessage ? <Text style={{ color: colors.textMuted }}>{durationMessage}</Text> : null}<Text style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>Microcycle schedule</Text><SecondaryButton label="Restart setup" onPress={restartSetup} /></PremiumCard>{showDevTools ? <PremiumCard><Text style={{ color: colors.textMuted }}>Developer tools are hidden from production builds.</Text><Link href="/(protected)/diagnostics" asChild><SecondaryButton label="Open diagnostics" onPress={() => {}} /></Link><Link href="/(protected)/design-qa" asChild><SecondaryButton label="Design QA fixtures" onPress={() => {}} /></Link><LockedFeatureCard title="Clear local test data" message="Developer-only cleanup belongs here." /></PremiumCard> : null}<PrimaryButton label="Logout" onPress={signOut} /></Screen>;
}
