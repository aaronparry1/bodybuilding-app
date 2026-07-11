import Constants from "expo-constants";
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { buildDataSafetyStatus } from "@/application/account/data-safety-status";
import { useAuth } from "@/application/auth/auth-context";
import type { SubscriptionStatus } from "@/application/billing/subscription";
import { useSubscription } from "@/application/billing/subscription-context";
import { customerSafeServiceMessage, shouldShowDeveloperDiagnostics } from "@/application/runtime/customer-facing-errors";
import { normalizeAppEnvironment } from "@/application/runtime/app-environment";
import { getUnsyncedQueueCount, runManualSync, syncDiagnosticsStore } from "@/application/sync/sync-diagnostics";
import { AppScreen, CoachInsightCard, ErrorState, HeroPanel, Pill, PrimaryButton, RowItem, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function AccountScreen() {
  const { user, signOut, isLoading, error, isOfflineMode } = useAuth();
  const {
    planLabel,
    subscription,
    restorePurchases,
    presentCustomerCenter,
    setMockStatus,
    provider,
    isRevenueCatConfigured,
    error: billingError,
    isTrialActive,
    trialEndsAt,
    refreshSubscription,
    isLoading: billingLoading,
    restoreStatus,
    restoreMessage,
  } = useSubscription();
  const appEnvironment = normalizeAppEnvironment((Constants.expoConfig?.extra as { appEnvironment?: string } | undefined)?.appEnvironment);
  const showDiagnostics = shouldShowDeveloperDiagnostics(appEnvironment);
  const accountError = customerSafeServiceMessage(error, appEnvironment, "Account backup is unavailable right now. Your workouts stay saved on this device.");
  const subscriptionError = customerSafeServiceMessage(billingError, appEnvironment, "Subscription status could not refresh right now. Your training data stays saved on this device.");
  const syncEnabled = Boolean(user && (subscription.status === "active" || subscription.status === "trial" || subscription.status === "lifetime"));
  const syncStatus = syncDiagnosticsStore.get();
  const dataSafety = buildDataSafetyStatus({
    userEmail: user?.email,
    isOfflineMode,
    subscription,
    syncStatus,
    unsyncedQueueCount: getUnsyncedQueueCount(),
  });

  return (
    <AppScreen>
      <HeroPanel
        eyebrow="Account"
        title={dataSafety.title}
        subtitle={dataSafety.body}
      />

      <CoachInsightCard
        title="Training data"
        message={
          dataSafety.helper
            ? `${dataSafety.status}. ${dataSafety.helper}`
            : dataSafety.meta
              ? `${dataSafety.status}. ${dataSafety.meta}.`
              : dataSafety.status
        }
        tone={dataSafety.tone === "success" ? "success" : dataSafety.tone === "warning" ? "locked" : "default"}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {showDiagnostics ? <Pill label={provider} tone={isRevenueCatConfigured ? "accent" : "default"} /> : null}
        <Pill label={dataSafety.status} tone={syncEnabled || dataSafety.tone === "success" ? "success" : "default"} />
        {showDiagnostics ? <Pill label={appEnvironment} /> : null}
      </View>

      {dataSafety.primaryActionLabel && !user ? (
        <Link href="/(auth)" asChild>
          <PrimaryButton label={dataSafety.primaryActionLabel} onPress={() => {}} />
        </Link>
      ) : null}
      {dataSafety.secondaryActionLabel && !user ? (
        <Link href="/(auth)" asChild>
          <SecondaryButton label={dataSafety.secondaryActionLabel} onPress={() => {}} />
        </Link>
      ) : null}
      {dataSafety.retryActionLabel && user ? (
        <SecondaryButton label={dataSafety.retryActionLabel} onPress={() => runManualSync(user.id, subscription)} />
      ) : null}

      <SectionList title="Subscription">
        <Link href="/(protected)/paywall" asChild>
          <PrimaryButton label={subscription.status === "free" ? "Start Free Trial" : "View Premium"} onPress={() => {}} />
        </Link>
        {restoreMessage ? (
          <Text selectable style={{ ...type.body, color: restoreStatus === "restored" ? colors.success : restoreStatus === "failed" ? colors.danger : colors.textMuted }}>
            {restoreMessage}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <SecondaryButton label={restoreStatus === "restoring" ? "Restoring..." : "Restore"} onPress={restorePurchases} disabled={billingLoading} compact />
          <SecondaryButton label="Manage" onPress={presentCustomerCenter} disabled={billingLoading || !isRevenueCatConfigured} compact />
        </View>
      </SectionList>

      <SectionList title="Settings and sync">
        <Link href="/(protected)/settings" asChild>
          <SecondaryButton label="Training settings" onPress={() => {}} />
        </Link>
        {showDiagnostics ? (
          <Link href="/(protected)/diagnostics" asChild>
            <SecondaryButton label="Staging diagnostics" onPress={() => {}} />
          </Link>
        ) : null}
      </SectionList>

      <SectionList title="Details">
        {showDiagnostics ? <AccountRow label="User ID" value={user?.id ?? (isOfflineMode ? "offline-local" : "-")} /> : null}
        {user?.email ? <AccountRow label="Account" value={user.email} /> : null}
        <AccountRow label="Subscription status" value={planLabel} />
        {showDiagnostics ? <AccountRow label="Subscription type" value={subscription.subscriptionType ?? "none"} /> : null}
        {isTrialActive ? <AccountRow label="Trial" value={trialEndsAt ? `Active until ${formatDate(trialEndsAt)}` : "Active"} /> : null}
        {subscription.expiresAt ? <AccountRow label="Renews/expires" value={subscription.expiresAt} /> : null}
        {subscription.isOfflineEntitlementCache ? <AccountRow label="Offline access" value="Using recent premium access" /> : null}
        <Text onPress={refreshSubscription} style={{ color: colors.accent, fontWeight: "900" }}>
          Refresh subscription status
        </Text>
      </SectionList>

      {showDiagnostics && !isRevenueCatConfigured ? (
        <SectionList title="Dev subscription toggle">
          {(["free", "trial", "active", "expired", "cancelled", "lifetime"] as SubscriptionStatus[]).map((status, index) => (
            <RowItem key={status} title={status} subtitle={subscription.status === status ? "Current mock status" : "Tap to switch"} index={index}>
              <Text onPress={() => setMockStatus(status)} style={{ color: colors.accent, fontWeight: "900" }}>
                Set mock status
              </Text>
            </RowItem>
          ))}
        </SectionList>
      ) : null}

      {accountError || subscriptionError ? (
        showDiagnostics ? (
          <ErrorState message={accountError ?? subscriptionError ?? "Online services are unavailable."} />
        ) : (
          <ServiceNotice message={accountError ?? subscriptionError ?? "Account backup is unavailable right now. Your workouts stay saved on this device."} />
        )
      ) : null}

      <SecondaryButton label="Logout" onPress={signOut} disabled={isLoading} />
    </AppScreen>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  );
}

function ServiceNotice({ message }: { message: string }) {
  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceMuted, padding: spacing.md }}>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
    </View>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
