import { router } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { useAppSettings } from "@/application/settings/app-settings";
import { listCapacityRoutines, listEnabledCapacityRoutines } from "@/domain/training/capacity-focus";
import { DetailToggle, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, SectionHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function CapacityFocusScreen() {
  const { settings } = useAppSettings();
  const enabledRoutines = useMemo(() => listEnabledCapacityRoutines(settings.capacityFocus), [settings.capacityFocus]);
  const lowBackRoutines = useMemo(() => listCapacityRoutines("low_back"), []);
  const routines = enabledRoutines.length > 0 ? enabledRoutines : lowBackRoutines;
  const exampleExercises = useMemo(() => Array.from(new Set(routines.flatMap((routine) => routine.exercises.map((exercise) => exercise.name)))).slice(0, 8), [routines]);
  const bucketNames = useMemo(() => Array.from(new Set(routines.flatMap((routine) => routine.exercises.map((exercise) => bucketLabel(exercise.bucket))))), [routines]);
  const progressionNotes = useMemo(() => Array.from(new Set(routines.flatMap((routine) => routine.progressionNotes))), [routines]);

  return (
    <Screen>
      <View style={{ alignSelf: "flex-start" }}>
        <SecondaryButton label="Back" onPress={() => router.back()} compact />
      </View>

      <ScreenHeader
        eyebrow="Training support"
        title="Low Back Capacity"
        subtitle="Build trunk control, hip support, and load tolerance for more consistent training."
      />

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Why Low Back Capacity?
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Optional training support for trunk control, hip support, and load tolerance. Capacity sessions are logged through Extra Session so they stay separate from your main plan.
        </Text>
        <PrimaryButton
          label="Start Low Back Capacity Session"
          onPress={() =>
            router.push({
              pathname: "/(protected)/(tabs)",
              params: { extraSession: "capacity" },
            })
          }
        />
      </PremiumCard>

      <SectionHeader title="What it builds" />
      <PremiumCard>
        <View style={{ gap: spacing.sm }}>
          {bucketNames.map((bucket) => (
            <Text key={bucket} selectable style={{ ...type.body, color: colors.text }}>
              {bucket}
            </Text>
          ))}
        </View>
      </PremiumCard>

      <SectionHeader title="How often" />
      <PremiumCard>
        <Text selectable style={{ ...type.body, color: colors.text }}>
          1-2 exposures per week.
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Use it as optional support when it helps your training week, not as a required setting to complete.
        </Text>
      </PremiumCard>

      {enabledRoutines.length === 0 ? (
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Low Back is the active capacity track. Other areas stay hidden until their programming is ready.
        </Text>
      ) : null}

      <SectionHeader title="Example exercises" />
      <PremiumCard>
        <View style={{ gap: spacing.sm }}>
          {exampleExercises.map((exercise) => (
            <Text key={exercise} selectable style={{ ...type.body, color: colors.text }}>
              {exercise}
            </Text>
          ))}
        </View>
      </PremiumCard>

      <SectionHeader title="Progression guidance" />
      <PremiumCard>
        <View style={{ gap: spacing.sm }}>
          {progressionNotes.map((note) => (
            <Text key={note} selectable style={{ ...type.body, color: colors.textMuted }}>
              {note}
            </Text>
          ))}
        </View>
      </PremiumCard>

      <DetailToggle label="Safety note">
        {routines[0]?.safetyCopy.map((line) => (
          <Text key={line} selectable style={{ ...type.body, color: colors.textMuted }}>
            {line}
          </Text>
        ))}
      </DetailToggle>
    </Screen>
  );
}

function bucketLabel(bucket: string): string {
  if (bucket === "bracing_trunk_stiffness") return "Bracing";
  if (bucket === "anti_extension_flexion") return "Anti-extension";
  if (bucket === "anti_rotation_lateral_flexion") return "Anti-rotation";
  if (bucket === "hip_extension_posterior_chain") return "Hip extension";
  if (bucket === "pelvic_single_leg_control") return "Pelvic control";
  if (bucket === "progressive_load_exposure") return "Load exposure";
  return "Capacity";
}
