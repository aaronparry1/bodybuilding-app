import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { titleCase } from "@/domain/training/exercise-library";
import { useProgrammeLibrary } from "@/features/programme-builder/use-programme-builder";
import { EmptyState, PremiumCard, PrimaryButton, Screen, ScreenHeader, StatTile } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function ProgrammeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { programmes, startProgrammeDay } = useProgrammeLibrary();
  const programme = programmes.find((candidate) => candidate.id === id);
  const exercises = customExerciseRepository.listAll();

  if (!programme) {
    return (
      <Screen>
        <EmptyState title="Programme not found" message="This programme is not available locally." />
      </Screen>
    );
  }

  const startDay = (dayId: string) => {
    startProgrammeDay(programme.id, dayId);
    router.replace("/(protected)");
  };

  return (
    <Screen>
      <ScreenHeader eyebrow={programme.isCustom ? "Custom programme" : "Preset programme"} title={programme.name} subtitle={programme.description} />

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatTile label="Days/week" value={`${programme.daysPerWeek}`} />
        <StatTile label="Level" value={titleCase(programme.experienceLevel)} />
        <StatTile label="Goal" value={titleCase(programme.goal)} />
      </View>

      {programme.days.map((day) => (
        <PremiumCard key={day.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "center" }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              {day.name}
            </Text>
            <PrimaryButton label="Start custom session" onPress={() => startDay(day.id)} compact />
          </View>
          {day.exerciseSlots.map((slot) => {
            const exercise = exercises.find((candidate) => candidate.id === slot.exerciseId);
            return (
              <View key={slot.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                <Text selectable style={{ flex: 1, color: colors.textMuted, fontWeight: "800" }}>
                  {slot.plannedOrder}. {exercise?.name ?? slot.exerciseId}
                </Text>
                <Text selectable style={{ color: colors.textSubtle, fontVariant: ["tabular-nums"] }}>
                  Guide {slot.settings.repRange.min}-{slot.settings.repRange.max}
                </Text>
              </View>
            );
          })}
        </PremiumCard>
      ))}
    </Screen>
  );
}
