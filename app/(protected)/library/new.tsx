import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { equipmentOptions, movementPatternOptions, muscleGroups, titleCase } from "@/domain/training/exercise-library";
import type { Equipment, MovementPattern, MuscleGroup } from "@/domain/training/models";
import { useExerciseLibrary } from "@/features/exercise-library/use-exercise-library";
import { AppInput, PrimaryButton, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function NewCustomExerciseScreen() {
  const { saveCustomExercise } = useExerciseLibrary();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MuscleGroup>("chest");
  const [movementPattern, setMovementPattern] = useState<MovementPattern>("isolation");
  const [equipment, setEquipment] = useState<Equipment>("dumbbell");
  const [repMin, setRepMin] = useState("8");
  const [repMax, setRepMax] = useState("12");
  const [loadJump, setLoadJump] = useState("2.5");
  const [notes, setNotes] = useState("");
  const min = Number.parseInt(repMin, 10);
  const max = Number.parseInt(repMax, 10);
  const jump = Number.parseFloat(loadJump);
  const canSave = name.trim().length >= 2 && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min && Number.isFinite(jump) && jump >= 0;

  const save = async () => {
    if (!canSave) return;
    const exercise = await saveCustomExercise({
      name,
      category,
      movementPattern,
      equipment,
      repRange: { min, max },
      loadJump: jump,
      notes,
    });
    router.replace(`/(protected)/library/${exercise.id}`);
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Custom movement"
        title="Add Exercise"
        subtitle="Create the movement your gym invented in a corner and somehow it works."
      />

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
      <PrimaryButton label="Save Custom Exercise" onPress={save} disabled={!canSave} />
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
