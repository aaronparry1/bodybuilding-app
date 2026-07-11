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
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import type { UnitSystem } from "@/domain/training/models";
import { deriveTrainingFrequency, isTrainingDaysPerWeek, trainingFrequencyOptions, type TrainingDaysPerWeek } from "@/domain/training/training-frequency";
import { displayNameForTrainingSetupGoal } from "@/domain/training/training-goals";
import { DetailToggle, ErrorState, LockedFeatureCard, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function SettingsScreen() {
  const { settings, updateSettings } = useAppSettings();
  const { user, isOfflineMode, signOut, error } = useAuth();
  const {
    planLabel,
    subscription,
    restorePurchases,
    presentCustomerCenter,
    isLoading: subscriptionLoading,
    entitlementStatus,
    isRevenueCatConfigured,
    error: subscriptionError,
    restoreStatus,
    restoreMessage,
  } = useSubscription();
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const [syncStatus, setSyncStatus] = useState(() => syncDiagnosticsStore.get());
  const [syncQueueCount, setSyncQueueCount] = useState(() => getUnsyncedQueueCount());
  const appEnvironment = getAppEnvironment();
  const showDevTools = shouldShowDeveloperDiagnostics(appEnvironment);
  const accountError = customerSafeServiceMessage(error, appEnvironment, "Account backup is unavailable right now. Your workouts stay saved on this device.");
  const billingError = customerSafeServiceMessage(subscriptionError, appEnvironment, "Subscription status could not refresh right now. Your training data stays saved on this device.");
  const dataSafety = buildDataSafetyStatus({
    userEmail: user?.email,
    isOfflineMode,
    subscription,
    syncStatus,
    unsyncedQueueCount: syncQueueCount,
  });

  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);
  useEffect(
    () =>
      syncDiagnosticsStore.subscribe(() => {
        setSyncStatus(syncDiagnosticsStore.get());
        setSyncQueueCount(getUnsyncedQueueCount());
      }),
    [],
  );

  const restartSetup = () => {
    updateSettings({ onboardingCompleted: false });
    router.replace("/(protected)/onboarding");
  };
  const updateTrainingDays = (daysPerWeek: TrainingDaysPerWeek) => {
    if (!activePlan) return;
    const nextPlan = { ...activePlan, daysPerWeek };
    activeTrainingPlanRepository.save(nextPlan);
    setActivePlan(nextPlan);
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Settings"
        title="Training controls"
        subtitle="Change account, training setup, and workout preferences here."
      />

      {showDevTools && accountError ? <ErrorState message={accountError} /> : null}

      <SectionHeader title="Account" />
      <AccountDataSafetyCard
        status={dataSafety}
        userEmail={user?.email ?? null}
        onRetrySync={user ? () => runManualSync(user.id, subscription).then(() => {
          setSyncStatus(syncDiagnosticsStore.get());
          setSyncQueueCount(getUnsyncedQueueCount());
        }) : undefined}
      />

      <SectionHeader title="Subscription" />
      <PremiumCard>
        <SummaryRow label="Plan" value={subscriptionPlanValue(subscription, planLabel)} detail={subscriptionStatusDetail(subscription, entitlementStatus, isRevenueCatConfigured, showDevTools)} />
        {restoreMessage ? <RestoreFeedback status={restoreStatus} message={restoreMessage} /> : null}
        {billingError ? (showDevTools ? <ErrorState message={billingError} /> : <ServiceNotice message={billingError} />) : null}
        {subscription.renewsAt ? <SummaryRow label={subscription.willRenew === false ? "Access until" : "Renews"} value={formatDate(subscription.renewsAt)} /> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <SecondaryButton label={restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"} onPress={restorePurchases} disabled={subscriptionLoading} compact />
          <Link href="/(protected)/paywall" asChild>
            <SecondaryButton label="Upgrade" onPress={() => {}} compact />
          </Link>
          {subscription.isPremium ? (
            <SecondaryButton label="Manage Subscription" onPress={presentCustomerCenter} disabled={subscriptionLoading || !isRevenueCatConfigured} compact />
          ) : null}
        </View>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Subscription status is managed through your store account.
        </Text>
      </PremiumCard>

      <SectionHeader title="Training Setup" />
      <PremiumCard>
        {activePlan ? (
          <>
            <SummaryRow label="Training Plan" value={trainingPlanLabel(activePlan)} />
            <SummaryRow label="Training Split" value={trainingSplitLabel(activePlan)} />
            <DetailToggle label="Current setup" compact>
              <SummaryRow label="Goal" value={titleValue(activePlan.goal)} />
              <SummaryRow label="Experience" value={titleValue(activePlan.experienceLevel)} />
              <SummaryRow label="Weekly session budget" value={trainingFrequencySummary(activePlan.daysPerWeek)} />
            </DetailToggle>
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
                Weekly training days
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                Choose the number you can consistently achieve. ASC will use it as your weekly session budget.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                {trainingFrequencyOptions.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => updateTrainingDays(day)}
                    style={{
                      minHeight: 42,
                      minWidth: 54,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: radius.md,
                      borderCurve: "continuous",
                      borderWidth: 1,
                      borderColor: activePlan.daysPerWeek === day ? colors.accent : colors.line,
                      backgroundColor: activePlan.daysPerWeek === day ? colors.accentSoft : colors.surfaceMuted,
                      paddingHorizontal: spacing.md,
                    }}
                  >
                    <Text style={{ color: activePlan.daysPerWeek === day ? colors.accent : colors.textMuted, fontWeight: "900" }}>{day}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              No active plan is set up yet.
            </Text>
            <SecondaryButton label="Set up training plan" onPress={restartSetup} />
          </>
        )}
      </PremiumCard>

      <SectionHeader title="Workout Preferences" />
      <PremiumCard>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {(["kg", "lb"] as UnitSystem[]).map((unit) => (
            <Pressable
              key={unit}
              onPress={() => updateSettings({ unit })}
              style={{
                flex: 1,
                minHeight: 46,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.md,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: settings.unit === unit ? colors.accent : colors.line,
                backgroundColor: settings.unit === unit ? colors.accentSoft : colors.surfaceMuted,
              }}
            >
              <Text style={{ color: settings.unit === unit ? colors.accent : colors.textMuted, fontWeight: "900" }}>{unit.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Coaching Style
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Adaptive coaching is on.
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          The app adjusts load, sets, warm-ups, and recovery guidance from your logged performance.
        </Text>
        <View style={{ gap: spacing.sm }}>
          <CoachingStyleRow label="Stop point" value="Performance-based" />
          <CoachingStyleRow label="Progression" value="Rounded to available load jumps" />
          <CoachingStyleRow label="Recovery" value="Guided by training feedback" />
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Load Jumps
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Used to round progressions to the weights you can actually use.
        </Text>
        <View style={{ gap: spacing.sm }}>
          <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
            Available weight jumps
          </Text>
          <IncrementRow
            label="Barbell / plate-loaded"
            values={[1, 2.5, 5]}
            selected={settings.loadIncrementProfile.barbellPlateLoadedKg}
            onSelect={(barbellPlateLoadedKg) =>
              updateSettings({ loadIncrementProfile: { ...settings.loadIncrementProfile, barbellPlateLoadedKg: barbellPlateLoadedKg as 1 | 2.5 | 5 } })
            }
          />
          <IncrementRow
            label="Dumbbells"
            values={[1, 2, 2.5, 5]}
            selected={settings.loadIncrementProfile.dumbbellKg}
            onSelect={(dumbbellKg) =>
              updateSettings({ loadIncrementProfile: { ...settings.loadIncrementProfile, dumbbellKg: dumbbellKg as 1 | 2 | 2.5 | 5 } })
            }
          />
          <IncrementRow
            label="Cable stack"
            values={[1, 2.5, 5]}
            selected={settings.loadIncrementProfile.cableKg}
            onSelect={(cableKg) =>
              updateSettings({ loadIncrementProfile: { ...settings.loadIncrementProfile, cableKg: cableKg as 1 | 2.5 | 5 } })
            }
          />
          <IncrementRow
            label="Machines"
            values={[1, 2.5, 5]}
            selected={settings.loadIncrementProfile.machineKg}
            onSelect={(machineKg) =>
              updateSettings({ loadIncrementProfile: { ...settings.loadIncrementProfile, machineKg: machineKg as 1 | 2.5 | 5 } })
            }
          />
        </View>
        {activePlan ? <SummaryRow label="Exercise rotation" value={titleValue(activePlan.rotationFrequency)} /> : null}
      </PremiumCard>

      <SectionHeader title="Plan Management" />
      <PremiumCard>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Manage your training plan and restart setup if needed.
        </Text>
        <Link href="/(protected)/(tabs)/programmes" asChild>
          <SecondaryButton label="View active plan" onPress={() => {}} />
        </Link>
        <SecondaryButton label="Restart setup" onPress={restartSetup} />
      </PremiumCard>

      {showDevTools ? (
        <>
          <SectionHeader title="Dev & Staging Tools" />
          <PremiumCard>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Diagnostics and Design QA fixtures are hidden from production builds.
            </Text>
            <SummaryRow label="Environment" value={titleValue(appEnvironment)} />
            <Link href="/(protected)/diagnostics" asChild>
              <SecondaryButton label="Open diagnostics" onPress={() => {}} />
            </Link>
          <Link href="/(protected)/design-qa" asChild>
            <SecondaryButton label="Design QA fixtures" onPress={() => {}} />
          </Link>
            <LockedFeatureCard title="Clear local test data" message="Dev/staging-only cleanup belongs here when the final reset flow is ready." />
          </PremiumCard>
        </>
      ) : null}

      <PrimaryButton label="Logout" onPress={signOut} />
    </Screen>
  );
}

function AccountDataSafetyCard({
  status,
  userEmail,
  onRetrySync,
}: {
  status: ReturnType<typeof buildDataSafetyStatus>;
  userEmail: string | null;
  onRetrySync?: () => void;
}) {
  return (
    <PremiumCard>
      <Text selectable style={{ ...type.section, color: colors.text }}>
        {status.title}
      </Text>
      <SummaryRow label="Status" value={status.status} detail={status.meta} />
      {userEmail ? <SummaryRow label="Account" value={userEmail} /> : null}
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {status.body}
      </Text>
      {status.helper ? (
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {status.helper}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {status.primaryActionLabel && !userEmail ? (
          <Link href="/(auth)" asChild>
            <PrimaryButton label={status.primaryActionLabel} onPress={() => {}} compact />
          </Link>
        ) : null}
        {status.secondaryActionLabel && !userEmail ? (
          <Link href="/(auth)" asChild>
            <SecondaryButton label={status.secondaryActionLabel} onPress={() => {}} compact />
          </Link>
        ) : null}
        {status.retryActionLabel && onRetrySync ? <SecondaryButton label={status.retryActionLabel} onPress={onRetrySync} compact /> : null}
      </View>
    </PremiumCard>
  );
}

function CoachingStyleRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        paddingTop: spacing.sm,
      }}
    >
      <Text selectable style={{ ...type.body, color: colors.textMuted, flex: 1 }}>
        {label}
      </Text>
      <Text selectable style={{ ...type.body, color: colors.text, fontWeight: "800", flex: 1.2, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function trainingPlanLabel(activePlan: NonNullable<ReturnType<typeof activeTrainingPlanRepository.getOptional>>): string {
  const goal = titleValue(activePlan.goal);
  if (activePlan.mode === "recommended_12_month") {
    return goal === "Build Muscle And Strength" ? "12-Month Strength & Physique Plan" : `12-Month ${goal} Plan`;
  }
  if (activePlan.mode === "single_block") return `${goal} Block`;
  if (activePlan.mode === "custom_date_event") return `${goal} Event Plan`;
  if (activePlan.mode === "custom_sequence") return `${goal} Custom Plan`;
  return activePlan.name;
}

function trainingSplitLabel(activePlan: NonNullable<ReturnType<typeof activeTrainingPlanRepository.getOptional>>): string {
  return `${activePlan.daysPerWeek}-Day ${splitLabel(activePlan.preferredSplit)}`;
}

function trainingFrequencySummary(daysPerWeek: number): string {
  if (isTrainingDaysPerWeek(daysPerWeek)) return deriveTrainingFrequency(daysPerWeek).userFacingSummary;
  return `${daysPerWeek} days per week`;
}

function splitLabel(value: string): string {
  if (value === "full_body") return "Full Body";
  if (value === "upper_lower") return "Upper / Lower";
  if (value === "push_pull_legs") return "Push / Pull / Legs";
  if (value === "body_part_split") return "Body Part Split";
  if (value === "bench_squat_deadlift") return "Bench / Squat / Deadlift";
  return titleValue(value);
}

function SummaryRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: "800" }}>
        {value}
      </Text>
      {detail ? (
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

function subscriptionStatusDetail(
  subscription: ReturnType<typeof useSubscription>["subscription"],
  entitlementStatus: ReturnType<typeof useSubscription>["entitlementStatus"],
  revenueCatConfigured: boolean,
  showDeveloperDiagnostics: boolean,
): string {
  if (entitlementStatus === "offline_cached") {
    return "Using recent premium access until your subscription status can refresh.";
  }
  if (!revenueCatConfigured) {
    return showDeveloperDiagnostics
      ? "Mock billing is active until RevenueCat public SDK keys are configured."
      : "Subscription status will refresh automatically when services are available.";
  }
  if (subscription.status === "trial") {
    return subscription.trialEndsAt ? `Trial active until ${formatDate(subscription.trialEndsAt)}.` : "Trial active.";
  }
  if (subscription.status === "active") {
    return subscription.renewsAt ? `Renews ${formatDate(subscription.renewsAt)}.` : "Premium is active.";
  }
  return "Restore purchases or start a trial from the paywall.";
}

function subscriptionPlanValue(
  subscription: ReturnType<typeof useSubscription>["subscription"],
  planLabel: ReturnType<typeof useSubscription>["planLabel"],
): string {
  if (subscription.status === "trial") {
    return subscription.trialEndsAt ? `Trial active until ${formatDate(subscription.trialEndsAt)}` : "Trial active";
  }
  if (subscription.status === "active" || subscription.status === "lifetime") return "Premium active";
  return planLabel;
}

function RestoreFeedback({ status, message }: { status: string; message: string }) {
  const color = status === "restored" ? colors.success : status === "failed" ? colors.danger : colors.textMuted;
  return (
    <Text selectable style={{ ...type.body, color }}>
      {message}
    </Text>
  );
}

function ServiceNotice({ message }: { message: string }) {
  return (
    <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.surfaceMuted, padding: spacing.md }}>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
    </View>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function IncrementRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {values.map((value) => {
          const active = selected === value;
          return (
            <Pressable
              key={`${label}-${value}`}
              onPress={() => onSelect(value)}
              style={{
                minHeight: 38,
                minWidth: 68,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: radius.pill,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.line,
                backgroundColor: active ? colors.accentSoft : colors.surfaceMuted,
                paddingHorizontal: spacing.sm,
              }}
            >
              <Text style={{ color: active ? colors.accent : colors.textMuted, fontWeight: "900" }}>{value}kg</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function titleValue(value: string): string {
  const goalName = displayNameForTrainingSetupGoal(value);
  if (goalName) return goalName;
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
