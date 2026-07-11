import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import {
  addExerciseToDay,
  addProgrammeDay,
  createCustomProgramme,
  moveExercise,
  removeExerciseFromDay,
  renameProgrammeDay,
  updateDraftExerciseSettings,
} from "@/domain/training/programme-builder";
import { titleCase } from "@/domain/training/exercise-library";
import type { Programme } from "@/domain/training/models";
import { useProgrammeLibrary } from "@/features/programme-builder/use-programme-builder";
import { AppInput, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function ProgrammeBuilderScreen() {
  const { saveProgramme } = useProgrammeLibrary();
  const exercises = customExerciseRepository.listAll();
  const [programme, setProgramme] = useState<Programme>(() =>
    addProgrammeDay(createCustomProgramme({ name: "Custom Hypertrophy Programme", daysPerWeek: 3 }), "Day 1"),
  );

  const save = async () => {
    await saveProgramme(programme);
    router.replace(`/(protected)/programmes/${programme.id}`);
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Custom draft" title="Programme Builder" subtitle="Build a split and save it as a preview. A scheduled workout is created only through your active plan." />

      <AppInput label="Programme name" value={programme.name} onChangeText={(name) => setProgramme({ ...programme, name })} />
      <AppInput
        label="Description"
        value={programme.description}
        onChangeText={(description) => setProgramme({ ...programme, description })}
        multiline
      />

      <SecondaryButton label="Add Day" onPress={() => setProgramme(addProgrammeDay(programme))} />

      {programme.days.map((day) => (
        <PremiumCard key={day.id}>
          <AppInput label="Day name" value={day.name} onChangeText={(name) => setProgramme(renameProgrammeDay(programme, day.id, name))} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {exercises.slice(0, 12).map((exercise) => (
              <Pressable
                key={exercise.id}
                onPress={() => setProgramme(addExerciseToDay(programme, day.id, exercise))}
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

          {day.exerciseSlots.map((slot) => {
            const exercise = exercises.find((candidate) => candidate.id === slot.exerciseId);
            return (
              <View key={slot.id} style={slotPanel}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                  <Text selectable style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: "900" }}>
                    {slot.plannedOrder}. {exercise?.name ?? slot.exerciseId}
                  </Text>
                  <Pressable onPress={() => setProgramme(removeExerciseFromDay(programme, day.id, slot.id))}>
                    <Text style={{ color: colors.danger, fontWeight: "900" }}>Remove</Text>
                  </Pressable>
                </View>
                <Text selectable style={{ color: colors.textSubtle, fontSize: 12 }}>
                  {exercise ? `${titleCase(exercise.category)} • ${exercise.equipment.map(titleCase).join(", ")}` : "Exercise"}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <SmallField
                    label="Guide min"
                    value={`${slot.settings.repRange.min}`}
                    onChangeText={(value) =>
                      setProgramme(
                        updateDraftExerciseSettings(programme, day.id, slot.id, {
                          repRange: { ...slot.settings.repRange, min: Number.parseInt(value, 10) || slot.settings.repRange.min },
                        }),
                      )
                    }
                  />
                  <SmallField
                    label="Guide max"
                    value={`${slot.settings.repRange.max}`}
                    onChangeText={(value) =>
                      setProgramme(
                        updateDraftExerciseSettings(programme, day.id, slot.id, {
                          repRange: { ...slot.settings.repRange, max: Number.parseInt(value, 10) || slot.settings.repRange.max },
                        }),
                      )
                    }
                  />
                  <SmallField
                    label="Drop"
                    value={`${slot.settings.dropOffPercent}`}
                    onChangeText={(value) =>
                      setProgramme(
                        updateDraftExerciseSettings(programme, day.id, slot.id, {
                          dropOffPercent: Number.parseFloat(value) || slot.settings.dropOffPercent,
                        }),
                      )
                    }
                  />
                  <SmallField
                    label="Jump"
                    value={`${slot.settings.loadIncrease}`}
                    onChangeText={(value) =>
                      setProgramme(
                        updateDraftExerciseSettings(programme, day.id, slot.id, {
                          loadIncrease: Number.parseFloat(value) || slot.settings.loadIncrease,
                        }),
                      )
                    }
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <SecondaryButton label="Up" onPress={() => setProgramme(moveExercise(programme, day.id, slot.id, "up"))} compact />
                  <SecondaryButton label="Down" onPress={() => setProgramme(moveExercise(programme, day.id, slot.id, "down"))} compact />
                </View>
              </View>
            );
          })}
        </PremiumCard>
      ))}

      <PrimaryButton label="Save Draft" onPress={save} />
    </Screen>
  );
}

function SmallField({ label, value, onChangeText }: { label: string; value: string; onChangeText(value: string): void }) {
  return (
    <View style={{ flex: 1, gap: 5 }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={(text) => onChangeText(text.replace(/[^0-9.]/g, ""))}
        value={value}
        style={{
          height: 42,
          borderRadius: 8,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.background,
          color: colors.text,
          textAlign: "center",
          fontWeight: "900",
        }}
      />
    </View>
  );
}

const slotPanel = { borderRadius: radius.md, borderCurve: "continuous" as const, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceMuted, padding: spacing.md, gap: spacing.md };
