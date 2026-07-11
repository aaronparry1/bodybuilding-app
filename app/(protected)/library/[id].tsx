import { Link, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { formatTargetRange, getExerciseMeasurementType } from "@/domain/training/exercise-metrics";
import { equipmentOptions, findExerciseById, movementPatternOptions, muscleGroups, titleCase } from "@/domain/training/exercise-library";
import { useExerciseLibrary } from "@/features/exercise-library/use-exercise-library";
import type { Equipment, MovementPattern, MuscleGroup } from "@/domain/training/models";
import { AppInput, EmptyState, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, StatTile } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { exercises, selectExerciseForWorkout, updateCustomExercise, deleteCustomExercise } = useExerciseLibrary();
  const exercise = findExerciseById(exercises, id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MuscleGroup>("chest");
  const [movementPattern, setMovementPattern] = useState<MovementPattern>("isolation");
  const [equipment, setEquipment] = useState<Equipment>("dumbbell");
  const [repMin, setRepMin] = useState("8");
  const [repMax, setRepMax] = useState("12");
  const [loadJump, setLoadJump] = useState("2.5");
  const [notes, setNotes] = useState("");

  if (!exercise) {
    return (
      <Screen>
        <EmptyState title="Exercise not found" message="This movement is not available in the current library." />
      </Screen>
    );
  }

  const useInWorkout = () => {
    selectExerciseForWorkout(exercise.id);
    router.replace({ pathname: "/(protected)", params: { exerciseId: exercise.id } });
  };

  const startEditing = () => {
    setName(exercise.name);
    setCategory(exercise.category);
    setMovementPattern(exercise.movementPattern);
    setEquipment(exercise.equipment[0] ?? "dumbbell");
    setRepMin(String(exercise.defaultRepRange.min));
    setRepMax(String(exercise.defaultRepRange.max));
    setLoadJump(String(exercise.defaultLoadJump));
    setNotes(exercise.notes.join("\n"));
    setEditing(true);
  };

  const min = Number.parseInt(repMin, 10);
  const max = Number.parseInt(repMax, 10);
  const jump = Number.parseFloat(loadJump);
  const canSave = name.trim().length >= 2 && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min && Number.isFinite(jump) && jump >= 0;

  const saveEdit = async () => {
    if (!exercise.isCustom || !canSave) return;
    const updated = await updateCustomExercise(exercise.id, {
      name,
      category,
      movementPattern,
      equipment,
      repRange: { min, max },
      loadJump: jump,
      notes,
    });
    if (updated) setEditing(false);
  };

  const confirmDelete = () => {
    if (!exercise.isCustom) return;
    Alert.alert("Delete custom exercise?", "This removes it from future selection. Past completed workouts stay intact.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCustomExercise(exercise.id);
          router.replace("/(protected)/(tabs)/library");
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow={exercise.isCustom ? "Custom exercise" : "Exercise"}
        title={exercise.name}
        subtitle={`${titleCase(exercise.category)} · ${titleCase(exercise.movementPattern)} · ${exercise.equipment.map(titleCase).join(", ")}`}
      />

      <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
        <StatTile label={getExerciseMeasurementType(exercise.defaultSettings) === "duration" ? "Typical duration boundary" : "Typical prescription boundary"} value={formatTargetRange(exercise.defaultRepRange, getExerciseMeasurementType(exercise.defaultSettings))} />
        <StatTile label="Load jump" value={`${exercise.defaultLoadJump}${exercise.defaultSettings.unit}`} />
        <StatTile label="Kind" value={exerciseKindStatValue(exercise.kind)} detail={exerciseKindStatDetail(exercise.kind)} />
      </View>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        This boundary guides safe session construction. Your generated workout uses exact per-set targets, not this as a goal to chase.
      </Text>

      {exercise.isCustom ? (
        <PremiumCard>
          {editing ? (
            <View style={{ gap: spacing.md }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Edit custom exercise
              </Text>
              <AppInput label="Name" value={name} onChangeText={setName} placeholder="Prime Chest Press" />
              <ChoiceRail label="Muscle group" options={muscleGroups} selected={category} onSelect={(value) => setCategory(value as MuscleGroup)} />
              <ChoiceRail label="Movement" options={movementPatternOptions} selected={movementPattern} onSelect={(value) => setMovementPattern(value as MovementPattern)} />
              <ChoiceRail label="Equipment" options={equipmentOptions} selected={equipment} onSelect={(value) => setEquipment(value as Equipment)} />
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <AppInput label="Rep min" value={repMin} onChangeText={(value) => setRepMin(value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInput label="Rep max" value={repMax} onChangeText={(value) => setRepMax(value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInput label="Jump" value={loadJump} onChangeText={(value) => setLoadJump(value.replace(/[^0-9.]/g, ""))} keyboardType="decimal-pad" />
                </View>
              </View>
              <AppInput label="Notes / coaching cues" value={notes} onChangeText={setNotes} placeholder="One cue per line" multiline />
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <SecondaryButton label="Cancel" onPress={() => setEditing(false)} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Save" onPress={saveEdit} disabled={!canSave} />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>
                Custom exercise
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                Edit details for future selection. Past completed workouts keep the exercise record they were logged with.
              </Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <SecondaryButton label="Edit" onPress={startEditing} />
                </View>
                <View style={{ flex: 1 }}>
                  <SecondaryButton label="Delete" onPress={confirmDelete} />
                </View>
              </View>
            </View>
          )}
        </PremiumCard>
      ) : null}

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>Muscles</Text>
        <Text selectable style={{ ...type.body, color: colors.text }}>Primary: {exercise.primaryMuscles.map(titleCase).join(", ")}</Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Secondary: {exercise.secondaryMuscles.length ? exercise.secondaryMuscles.map(titleCase).join(", ") : "None"}
        </Text>
      </PremiumCard>

      <PremiumCard>
        <Text selectable style={{ ...type.section, color: colors.text }}>Coaching cues</Text>
        {exercise.notes.map((note) => (
          <Text key={note} selectable style={{ ...type.body, color: colors.textMuted }}>
            {note}
          </Text>
        ))}
      </PremiumCard>

      <PrimaryButton label="Use in Workout" onPress={useInWorkout} />
      <Link href="/(protected)/(tabs)/library" asChild>
        <SecondaryButton label="Back to Library" onPress={() => {}} />
      </Link>
    </Screen>
  );
}

function ChoiceRail({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect(value: string): void;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.textMuted }}>
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        {options.map((option) => {
          const active = option === selected;
          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={{
                borderRadius: radius.pill,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.line,
                backgroundColor: active ? colors.accentSoft : colors.surfaceMuted,
                paddingHorizontal: spacing.md,
                paddingVertical: 9,
              }}
            >
              <Text style={{ color: active ? colors.accent : colors.textMuted, fontWeight: "800" }}>{titleCase(option)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function exerciseKindStatValue(kind: string): string {
  if (kind === "bodyweight") return "BW";
  return titleCase(kind);
}

function exerciseKindStatDetail(kind: string): string | undefined {
  if (kind === "bodyweight") return "Bodyweight movement";
  return undefined;
}
