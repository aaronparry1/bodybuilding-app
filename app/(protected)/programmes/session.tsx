import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { addExerciseToDay, createOneOffSession } from "@/domain/training/programme-builder";
import { EmptyState, PrimaryButton, RowItem, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, radius, spacing } from "@/ui/theme";

export default function SessionBuilderScreen() {
  const exercises = customExerciseRepository.listAll();
  const [sessionProgramme, setSessionProgramme] = useState(() => createOneOffSession("One-Off Session"));
  const day = sessionProgramme.days[0];

  const startSession = () => {
    const firstExercise = exercises.find((exercise) => exercise.id === day.exerciseSlots[0]?.exerciseId);
    programmeRepository.save(sessionProgramme);
    programmeRepository.selectProgrammeDay({ programmeId: sessionProgramme.id, dayId: day.id });
    router.replace({
      pathname: "/(protected)/session-prep",
      params: {
        workoutName: sessionProgramme.name,
        workoutType: "custom",
        firstExerciseName: firstExercise?.name,
        firstMovementPattern: firstExercise?.movementPattern,
      },
    });
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow="One-off"
        title="Session Builder"
        subtitle="Build today’s lift without committing to a full programme."
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {exercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            onPress={() => setSessionProgramme(addExerciseToDay(sessionProgramme, day.id, exercise))}
            style={({ pressed }) => ({
              borderRadius: radius.pill,
              borderCurve: "continuous",
              backgroundColor: pressed ? colors.accentSoft : colors.surfaceMuted,
              borderWidth: 1,
              borderColor: pressed ? colors.accent : colors.line,
              paddingHorizontal: spacing.md,
              paddingVertical: 9,
            })}
          >
            <Text style={{ color: colors.text, fontWeight: "800" }}>{exercise.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ gap: spacing.md }}>
        {day.exerciseSlots.length === 0 ? (
          <EmptyState title="No exercises yet" message="Add a few movements, then start the session." />
        ) : (
          day.exerciseSlots.map((slot, index) => {
            const exercise = exercises.find((candidate) => candidate.id === slot.exerciseId);
            return <RowItem key={slot.id} title={`${slot.plannedOrder}. ${exercise?.name ?? slot.exerciseId}`} subtitle="Queued for today" index={index} />;
          })
        )}
      </View>

      <PrimaryButton label="Start Session" onPress={startSession} disabled={day.exerciseSlots.length === 0} />
    </Screen>
  );
}
