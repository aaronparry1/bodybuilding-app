import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { generateWorkoutByFocus, type GeneratedWorkoutType } from "@/domain/training/ad-hoc-workout-generator";
import {
  buildCapacityCardioSessionProgramme,
  buildPerformanceConditioningSessionProgramme,
  buildRecoveryCardioSessionProgramme,
  type RecoveryCapacityExtraSessionType,
} from "@/domain/training/extra-session-generator";
import { titleCase } from "@/domain/training/exercise-library";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { AppScreen, HeroPanel, PrimaryButton, RowItem, SectionList, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

type CreateSessionType = GeneratedWorkoutType | RecoveryCapacityExtraSessionType;

const workoutTypes: CreateSessionType[] = ["push", "pull", "legs", "upper", "lower", "full_body", "arms", "recovery_cardio", "capacity_cardio", "performance_conditioning"];

export default function AIWorkoutScreen() {
  const { user } = useAuth();
  const { settings } = useAppSettings();
  const exercises = customExerciseRepository.listAll();
  const history = useMemo(() => summarizeWorkoutHistory(workoutSessionRepository.list()), []);
  const [workoutType, setWorkoutType] = useState<CreateSessionType>("push");
  const [variant, setVariant] = useState(0);
  const generated = useMemo(
    () =>
      workoutType === "recovery_cardio"
        ? buildRecoveryCardioSessionProgramme({
            exercises,
            unit: settings.unit,
            experienceLevel: settings.experienceLevel,
            createdByUserId: user?.id ?? null,
          })
        : workoutType === "capacity_cardio"
          ? buildCapacityCardioSessionProgramme({
              exercises,
              unit: settings.unit,
              experienceLevel: settings.experienceLevel,
              createdByUserId: user?.id ?? null,
            })
          : workoutType === "performance_conditioning"
            ? buildPerformanceConditioningSessionProgramme({
                exercises,
                unit: settings.unit,
                experienceLevel: settings.experienceLevel,
                createdByUserId: user?.id ?? null,
              })
          : generateWorkoutByFocus(workoutType, {
              exercises,
              history,
              createdByUserId: user?.id ?? null,
              variant,
              loadIncrementProfile: settings.loadIncrementProfile,
              unit: settings.unit,
            }),
    [exercises, history, settings.experienceLevel, settings.loadIncrementProfile, settings.unit, user?.id, variant, workoutType],
  );
  const day = generated.days[0];

  const startWorkout = () => {
    if (!day) return;
    programmeRepository.save(generated);
    programmeRepository.selectProgrammeDay({
      programmeId: generated.id,
      dayId: day.id,
      sessionKind: workoutType === "recovery_cardio" || workoutType === "capacity_cardio" || workoutType === "performance_conditioning" ? workoutType : "extra_full",
    });
    if (workoutType === "recovery_cardio" || workoutType === "capacity_cardio" || workoutType === "performance_conditioning") {
      router.replace("/(protected)/(tabs)/train");
      return;
    }
    const firstExercise = exercises.find((exercise) => exercise.id === day.exerciseSlots[0]?.exerciseId);
    router.replace({
      pathname: "/(protected)/session-prep",
      params: {
        workoutName: displayWorkoutName(generated.name),
        workoutType,
        firstExerciseName: firstExercise?.name,
        firstMovementPattern: firstExercise?.movementPattern,
      },
    });
  };

  return (
    <AppScreen>
      <HeroPanel
        eyebrow="Create session"
        title={displayWorkoutName(generated.name)}
        subtitle="Choose the focus. This is a custom session, separate from your scheduled plan."
      />

      <SectionList title="Workout type">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {workoutTypes.map((type) => (
            <Pressable key={type} onPress={() => setWorkoutType(type)} style={({ pressed }) => typeChipStyle(type === workoutType, pressed)}>
              <Text selectable style={{ color: type === workoutType ? colors.background : colors.text, fontWeight: "900" }}>
                {titleCase(type)}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionList>

      <SectionList title="Today's exercises">
        {day?.exerciseSlots.map((slot, index) => {
          const exercise = exercises.find((candidate) => candidate.id === slot.exerciseId);
          return (
            <RowItem
              key={slot.id}
              title={`${slot.plannedOrder}. ${exercise?.name ?? "Unknown exercise"}`}
              subtitle={exercise ? `${titleCase(exercise.category)} · ${titleCase(exercise.role.replaceAll("_", " "))}` : "Exercise"}
              meta={exercise ? titleCase(exercise.category) : undefined}
              index={index}
            >
              {slot.notes ? (
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {slot.notes}
                </Text>
              ) : null}
            </RowItem>
          );
        })}
      </SectionList>

      <View style={{ gap: spacing.sm }}>
        <PrimaryButton label="Start workout" onPress={startWorkout} disabled={!day || day.exerciseSlots.length === 0} />
        <SecondaryButton label="Regenerate" onPress={() => setVariant((value) => value + 1)} />
      </View>

      <Text selectable style={{ ...type.body, color: colors.textSubtle }}>
        Start the session, then let your logged reps decide the work.
      </Text>
    </AppScreen>
  );
}

function displayWorkoutName(name: string): string {
  return name.replace(/^AI\s+/i, "").replace(/\s+•\s+.+$/i, "").trim();
}

function typeChipStyle(active: boolean, pressed: boolean) {
  return {
    borderRadius: radius.pill,
    borderCurve: "continuous" as const,
    backgroundColor: active ? colors.accent : pressed ? colors.surfaceMuted : colors.surface,
    borderWidth: 1,
    borderColor: active ? colors.accent : colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  };
}
