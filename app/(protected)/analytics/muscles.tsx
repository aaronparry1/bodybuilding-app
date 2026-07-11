import { Text, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { calculateSetsPerMuscleGroup, titleMuscle } from "@/domain/training/analytics";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { Pill, PremiumCard, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function MuscleAnalyticsScreen() {
  const history = summarizeWorkoutHistory(workoutHistoryRepository.listCompletedSessions());
  const exercises = customExerciseRepository.listAll();
  const volumes = calculateSetsPerMuscleGroup(history, exercises);
  const maxSets = Math.max(1, ...volumes.map((volume) => volume.sets));

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Volume"
        title="Muscle Analytics"
        subtitle="Weekly sets versus target ranges. Neglected muscles cannot hide here."
      />

      {volumes.map((volume) => (
        <PremiumCard key={volume.muscleGroup}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>{titleMuscle(volume.muscleGroup)}</Text>
            <Pill label={volume.status} tone={volume.status === "productive" ? "success" : volume.status === "excessive" ? "danger" : "accent"} />
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: colors.lineSoft, overflow: "hidden" }}>
            <View style={{ width: `${Math.max(4, Math.min(100, (volume.sets / maxSets) * 100))}%`, height: 8, backgroundColor: statusColor(volume.status) }} />
          </View>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {volume.sets} sets this week · target {volume.target.min}-{volume.target.max}
          </Text>
        </PremiumCard>
      ))}
    </Screen>
  );
}

function statusColor(status: string) {
  if (status === "productive") return colors.success;
  if (status === "excessive") return colors.danger;
  return colors.warning;
}
