import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalRecordedSessionHistory, type CanonicalHistoryListEntry } from "@/domain/training/canonical-recorded-session-history-projection";
import { useSubscription } from "@/application/billing/subscription-context";
import { getTabScreenBottomPadding } from "@/ui/layout";
import {
  AppInput,
  EmptyActionState,
  HeroPanel,
  LockedFeatureCard,
  RowItem,
} from "@/ui/primitives";
import { colors, radius, shellTokens, spacing, type } from "@/ui/theme";

export default function WorkoutHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ledgerVersion, refresh] = useState(0);
  const { entitlement } = useSubscription();
  useEffect(() => {
    canonicalActivePlanState.hydrate();
    return canonicalActivePlanState.subscribe(() =>
      refresh((value) => value + 1),
    );
  }, []);
  const plan = canonicalActivePlanState.getReadModel();
  const exportedSessions = useMemo(
    () => plan ? canonicalRecordedSessionLedger.exportPlan(plan.planId) : [],
    [ledgerVersion, plan?.planId],
  );
  const result = useMemo(() => plan
    ? projectCanonicalRecordedSessionHistory({
        athleteId: plan.planId,
        planId: plan.planId,
        sessions: exportedSessions,
        exerciseQuery,
        fromDate,
        toDate,
      })
    : { status: "unavailable" as const, reason: "canonical_plan_unavailable" }, [exerciseQuery, exportedSessions, fromDate, plan?.planId, toDate]);
  const historyEntitlement = entitlement("unlimited_history", {
    historyDaysRequested: fromDate ? 365 : 30,
  });
  const entries = result.status === "ready" ? result.entries : [];

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: shellTokens.pageHorizontal, paddingTop: spacing.lg, paddingBottom: getTabScreenBottomPadding(insets.bottom), gap: spacing.xxl }}
      data={entries}
      keyExtractor={(summary) => summary.recordedSessionId}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      ListHeaderComponent={
        <View style={{ gap: spacing.xxl, paddingBottom: spacing.md }}>
          <HeroPanel
            eyebrow="History"
            title="Training memory"
            subtitle="Completed canonical sessions and the details behind your progress."
          />
          <AppInput
            value={exerciseQuery}
            onChangeText={setExerciseQuery}
            label="Exercise filter"
            placeholder="Bench, row, squat..."
          />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <AppInput
                value={fromDate}
                onChangeText={setFromDate}
                label="From"
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                value={toDate}
                onChangeText={setToDate}
                label="To"
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          {!historyEntitlement.allowed ? (
            <Link href="/(protected)/paywall" asChild>
              <Pressable>
                <LockedFeatureCard
                  title="Unlimited history is Pro"
                  message="Free history covers 30 days."
                />
              </Pressable>
            </Link>
          ) : null}
          {result.status !== "ready" ? (
            <EmptyActionState
              title="History unavailable"
              message={result.reason}
            />
          ) : entries.length === 0 ? (
            <EmptyActionState
              title="No completed workouts yet"
              message="Finish a canonical session and the receipts show up here."
            />
          ) : null}
        </View>
      }
      renderItem={({ item: summary, index }: { item: CanonicalHistoryListEntry; index: number }) => (
        <Link
          href={"/(protected)/history/" + summary.recordedSessionId}
          asChild
        >
          <Pressable>
            <RowItem
              title={summary.role}
              subtitle={new Date(summary.completedAt).toLocaleDateString()}
              meta={summary.classification}
              index={index}
            >
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <Mini
                  label="Exercises"
                  value={String(summary.exercisesCompleted)}
                />
                <Mini label="Completed working sets" value={String(summary.workSets)} />
                <Mini label="Completed reps" value={String(summary.reps)} />
              </View>
            </RowItem>
          </Pressable>
        </Link>
      )}
    />
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text
        selectable
        style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}
      >
        {value}
      </Text>
    </View>
  );
}
