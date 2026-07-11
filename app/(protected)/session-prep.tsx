import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { sessionPrepRepository } from "@/data/local/session-prep-repository";
import { buildSessionPrepRecord, getSessionPrepRoutine } from "@/domain/training/session-prep";
import { GuideDisclosureRow } from "@/ui/movement-guide";
import { DetailToggle, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function SessionPrepScreen() {
  const params = useLocalSearchParams<{ workoutName?: string; workoutType?: string; firstExerciseName?: string; firstMovementPattern?: string }>();
  const workoutName = typeof params.workoutName === "string" ? params.workoutName : undefined;
  const workoutType = typeof params.workoutType === "string" ? params.workoutType : undefined;
  const firstExerciseName = typeof params.firstExerciseName === "string" ? params.firstExerciseName : undefined;
  const firstMovementPattern = typeof params.firstMovementPattern === "string" ? params.firstMovementPattern : undefined;
  const routine = useMemo(
    () => getSessionPrepRoutine({ workoutName, workoutType, firstExerciseName, firstMovementPattern }),
    [firstExerciseName, firstMovementPattern, workoutName, workoutType],
  );

  const continueToWorkout = (status: "completed" | "skipped") => {
    sessionPrepRepository.save(buildSessionPrepRecord({ routine, workoutName, status }));
    router.replace("/(protected)/(tabs)/train");
  };

  return (
    <Screen>
      <View style={{ alignSelf: "flex-start" }}>
        <SecondaryButton label="Back" onPress={() => router.back()} compact />
      </View>

      <ScreenHeader
        eyebrow="Prepare for session"
        title={routine.name}
        subtitle={routine.purpose}
      />

      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {routine.estimatedMinutes} minutes · {workoutName ?? "Today’s workout"}
      </Text>
      {routine.setupLabel ? (
        <Text selectable style={{ ...type.label, color: colors.accent }}>
          Setup: {routine.setupLabel}
        </Text>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <PrimaryButton label="Continue to Workout" onPress={() => continueToWorkout("completed")} />
        <SecondaryButton label="Skip Prep" onPress={() => continueToWorkout("skipped")} />
        <Text selectable style={{ ...type.body, color: colors.textSubtle, textAlign: "center" }}>
          Optional. This prepares the session and does not affect progression.
        </Text>
      </View>

      <SectionHeader title="Prep list" />
      <View style={{ gap: spacing.sm }}>
        {routine.exercises.map((exercise, index) => (
          <PremiumCard key={`${exercise.name}-${index}`} tone="quiet">
            <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }}>
              {exercise.name}
            </Text>
            {exercise.subtitle ? (
              <Text selectable style={{ ...type.body, color: colors.text }}>
                {exercise.subtitle}
              </Text>
            ) : null}
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              {exercise.dose}
            </Text>
            {exercise.movements?.length ? (
              <View style={{ gap: 7 }}>
                {exercise.movements.map((movement) => (
                  <View
                    key={`${exercise.name}-${movement.name}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.lineSoft,
                      paddingBottom: 7,
                    }}
                  >
                    <Text selectable style={{ ...type.body, color: colors.text, flex: 1 }}>
                      {movement.name}
                    </Text>
                    <Text selectable style={{ ...type.label, color: colors.textMuted, textAlign: "right" }}>
                      {movement.prescription}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {exercise.guidance ? (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {exercise.guidance}
              </Text>
            ) : null}
            <GuideDisclosureRow why={exercise.purpose} guide={exercise.guide} />
          </PremiumCard>
        ))}
      </View>

      <DetailToggle label="Safety note">
        {routine.safetyCopy.map((line) => (
          <Text key={line} selectable style={{ ...type.body, color: colors.textMuted }}>
            {line}
          </Text>
        ))}
      </DetailToggle>

    </Screen>
  );
}
