import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useSubscription } from "@/application/billing/subscription-context";
import {
  clearLocalTestData,
  getUnsyncedQueueCount,
  runManualSync,
  syncDiagnosticsStore,
} from "@/application/sync/sync-diagnostics";
import { normalizeAppEnvironment } from "@/application/runtime/app-environment";
import { getSupabaseConfigResult } from "@/lib/supabase/config";
import { ErrorState, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

const extra = Constants.expoConfig?.extra as
  | {
      appEnvironment?: string;
      supabaseUrl?: string;
    }
  | undefined;

export default function DiagnosticsScreen() {
  const { user, session, isOfflineMode, isConfigured } = useAuth();
  const { subscription } = useSubscription();
  const [status, setStatus] = useState(() => syncDiagnosticsStore.get());
  const [queueCount, setQueueCount] = useState(() => getUnsyncedQueueCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const configResult = getSupabaseConfigResult();
  const appEnvironment = normalizeAppEnvironment(extra?.appEnvironment ?? process.env.APP_ENV);
  const isProduction = appEnvironment === "production";

  useEffect(
    () =>
      syncDiagnosticsStore.subscribe(() => {
        setStatus(syncDiagnosticsStore.get());
      }),
    [],
  );

  const handleManualSync = async () => {
    if (!user?.id) return;
    setIsSyncing(true);
    await runManualSync(user.id, subscription);
    setQueueCount(getUnsyncedQueueCount());
    setIsSyncing(false);
  };

  const handleClearLocalData = () => {
    if (isProduction) return;
    Alert.alert("Clear local test data?", "This removes Adaptive Strength Coach local logs, queues, settings, and mock subscription state on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          clearLocalTestData();
          setQueueCount(getUnsyncedQueueCount());
        },
      },
    ]);
  };

  if (isProduction) {
    return (
      <Screen>
        <ScreenHeader
          eyebrow="Support"
          title="Diagnostics unavailable"
          subtitle="Developer diagnostics are not available in production builds."
        />
        <PremiumCard>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            If something is not working, please contact support from Settings.
          </Text>
        </PremiumCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="QA"
        title="Staging Diagnostics"
        subtitle="Hidden panel for proving auth, local data, and Supabase sync before real testers get involved."
      />

      {configResult.error ? <ErrorState message={configResult.error} /> : null}

      <SectionHeader title="Environment" />
      <PremiumCard>
        <DiagnosticRow label="App environment" value={appEnvironment} />
        <DiagnosticRow label="Supabase URL" value={configResult.config?.url ?? extra?.supabaseUrl ?? "missing"} />
        <DiagnosticRow label="Supabase key" value={configResult.config?.publishableKey ? "present" : "missing"} />
        <DiagnosticRow label="Auth configured" value={isConfigured ? "yes" : "no"} />
      </PremiumCard>

      <SectionHeader title="Auth Session" />
      <PremiumCard>
        <DiagnosticRow label="Session" value={session ? "signed in" : isOfflineMode ? "offline mode" : "signed out"} />
        <DiagnosticRow label="User ID" value={user?.id ?? "-"} />
        <DiagnosticRow label="Email" value={user?.email ?? "-"} />
      </PremiumCard>

      <SectionHeader title="Sync" />
      <PremiumCard>
        <DiagnosticRow label="Unsynced queue" value={`${queueCount}`} />
        <DiagnosticRow label="Last attempt" value={status.lastAttemptAt ?? "-"} />
        <DiagnosticRow label="Last success" value={status.lastSuccessAt ?? "-"} />
        <DiagnosticRow label="Last synced" value={`${status.lastSyncedCount ?? 0}`} />
        <DiagnosticRow label="Last skipped" value={`${status.lastSkippedCount ?? 0}`} />
        <DiagnosticRow label="Last failed" value={`${status.lastFailedCount ?? 0}`} />
        <DiagnosticRow label="Last error" value={status.lastError ?? "-"} />
        <PrimaryButton label={isSyncing ? "Syncing..." : "Trigger Manual Sync"} onPress={handleManualSync} disabled={!user?.id || isSyncing} />
      </PremiumCard>

      {!isProduction ? (
        <>
          <SectionHeader title="Dev Reset" />
          <PremiumCard>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Clears only local Adaptive Strength Coach test data on this device. It does not delete Supabase staging rows.
            </Text>
            <SecondaryButton label="Clear Local Test Data" onPress={handleClearLocalData} />
          </PremiumCard>
        </>
      ) : null}
    </Screen>
  );
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}
