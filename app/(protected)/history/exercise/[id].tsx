import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { getExerciseHistory } from "@/domain/training/workout-history";
import { EmptyState, Pill, PremiumCard, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function ExerciseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = customExerciseRepository.listAll().find((candidate) => candidate.id === id);
  const history = getExerciseHistory(workoutSessionRepository.list(), id);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Exercise history"
        title={exercise?.name ?? "Exercise"}
        subtitle="Load progression and best-set trend from actual completed sessions."
      />

      {history.length === 0 ? (
        <EmptyState title="No completed history" message="Log this exercise in a completed workout and it will appear here." />
      ) : (
        history.map((entry) => (
          <PremiumCard key={entry.exerciseLogId}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text selectable style={{ ...type.section, color: colors.text }}>{entry.sessionName}</Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : "-"}</Text>
              </View>
              <Pill label={entry.progressionEarned ? "Increase earned" : "Hold load"} tone={entry.progressionEarned ? "success" : "default"} />
            </View>
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Mini label="Load" value={`${entry.load}${entry.unit}`} />
              <Mini label="Best" value={`${entry.bestSetReps}`} />
              <Mini label="Sets" value={`${entry.setsCompleted}`} />
              <Mini label="Next" value={`${entry.nextRecommendedLoad}${entry.unit}`} />
            </View>
            {entry.notes ? <Text selectable style={{ ...type.body, color: colors.textMuted }}>{entry.notes}</Text> : null}
          </PremiumCard>
        ))
      )}
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text>
      <Text selectable style={{ color: colors.text, fontSize: 14, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}
