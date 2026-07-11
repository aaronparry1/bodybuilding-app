import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { getExerciseAnalytics } from "@/domain/training/analytics";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { EmptyState, PremiumCard, Screen, ScreenHeader, StatTile } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function ExerciseAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercises = customExerciseRepository.listAll();
  const exercise = exercises.find((candidate) => candidate.id === id);
  const history = useMemo(() => summarizeWorkoutHistory(workoutHistoryRepository.listCompletedSessions()), []);
  const analytics = getExerciseAnalytics(history, id);

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
        title={exercise?.name ?? analytics.exerciseName}
        subtitle="Trend data from actual logged reps. No vibes were harmed."
      />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatTile label="Frequency" value={`${analytics.frequency}`} />
        <StatTile label="Sets" value={`${analytics.totalSets}`} />
        <StatTile label="PR rate" value={`${Math.round(analytics.progressionRate * 100)}%`} />
      </View>
      <PremiumCard tone="locked">
        <Text selectable style={{ ...type.label, color: colors.accent }}>RECOMMENDED LOAD</Text>
        <Text selectable style={{ ...type.metric, color: colors.text }}>
          {analytics.currentRecommendedLoad === null ? "-" : `${analytics.currentRecommendedLoad}`}
        </Text>
      </PremiumCard>

      <Panel title="Load Trend">
        <Sparkline values={analytics.loadTrend} />
      </Panel>
      <Panel title="Best Set Trend">
        <Sparkline values={analytics.bestSetTrend} />
      </Panel>

      <Panel title="Last 5 Sessions">
        {analytics.lastFiveSessions.map((entry) => (
          <View key={entry.exerciseLogId} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <Text selectable style={{ flex: 1, color: colors.textMuted }}>{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : "-"}</Text>
            <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{entry.load}{entry.unit} · best {entry.bestSetReps}</Text>
            <Text selectable style={{ color: entry.progressionEarned ? colors.success : colors.textSubtle, fontWeight: "900" }}>
              {entry.progressionEarned ? "Earned" : "Hold"}
            </Text>
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

function Sparkline({ values }: { values: number[] }) {
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
