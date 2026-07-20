import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { queryCanonicalExerciseHistory } from "@/application/training/canonical-analytics-queries";
import { EmptyState, PremiumCard, Screen, ScreenHeader, StatTile } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function ExerciseAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = canonicalActivePlanState.getReadModel();
  const analytics = plan ? queryCanonicalExerciseHistory(plan.planId, id) : null;

  if (!analytics) {
    return (
      <Screen>
        <EmptyState title="No analytics yet" message="Complete this exercise in a workout and trend data will appear here." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Exercise analytics"
        title={analytics.exerciseName}
        subtitle="Trend data from actual logged reps. No vibes were harmed."
      />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatTile label="Frequency" value={`${analytics.frequency}`} />
        <StatTile label="Completed working sets" value={`${analytics.totalSets}`} />
        <StatTile label="Recorded sessions" value={`${analytics.frequency}`} />
      </View>
      <PremiumCard tone="locked">
        <Text selectable style={{ ...type.label, color: colors.accent }}>RECOMMENDED LOAD</Text>
        <Text selectable style={{ ...type.metric, color: colors.text }}>
          {analytics.loadTrend.at(-1) ?? "-"}
        </Text>
      </PremiumCard>

      <Panel title="Load Trend">
        <Sparkline values={analytics.loadTrend} />
      </Panel>
      <Panel title="Best Set Trend">
        <Sparkline values={analytics.bestSetTrend} />
      </Panel>

      <Panel title="Last 5 Sessions">
        {analytics.lastFive.map((entry) => (
          <View key={`${entry.sessionId}:${entry.occurredAt}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <Text selectable style={{ flex: 1, color: colors.textMuted }}>{new Date(entry.occurredAt).toLocaleDateString()}</Text>
            <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{entry.load}{entry.unit} · {entry.reps} reps</Text>
            <Text selectable style={{ color: entry.substitution ? colors.warning : colors.textSubtle, fontWeight: "900" }}>{entry.substitution ? "Substituted" : entry.completion}</Text>
          </View>
        ))}
      </Panel>
    </Screen>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <PremiumCard>
      <Text selectable style={{ ...type.section, color: colors.text }}>{title}</Text>
      {children}
    </PremiumCard>
  );
}

function Sparkline({ values }: { values: readonly number[] }) {
  const max = Math.max(1, ...values);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 84 }}>
      {values.map((value, index) => (
        <View key={`${value}-${index}`} style={{ flex: 1, gap: 5, alignItems: "center", justifyContent: "flex-end" }}>
          <View style={{ width: "100%", height: Math.max(6, (value / max) * 70), borderRadius: 6, backgroundColor: colors.success }} />
          <Text selectable style={{ color: colors.textSubtle, fontSize: 10 }}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
