import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { formatTargetRange, getExerciseMeasurementType } from "@/domain/training/exercise-metrics";
import { equipmentOptions, muscleGroups, titleCase } from "@/domain/training/exercise-library";
import type { Equipment, MuscleGroup } from "@/domain/training/models";
import { useExerciseLibrary } from "@/features/exercise-library/use-exercise-library";
import { AppInput, DetailToggle, EmptyState, PrimaryButton, RowItem, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function ExerciseLibraryScreen() {
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");
  const filters = useMemo(() => ({ query, muscleGroup, equipment }), [equipment, muscleGroup, query]);
  const { filteredExercises } = useExerciseLibrary(filters);
  const activeSearch = query.trim().length > 0;
  const resultTitle = activeSearch ? `${filteredExercises.length} search result${filteredExercises.length === 1 ? "" : "s"}` : `${filteredExercises.length} movements`;

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Library"
        title="Movements"
        subtitle="Search the exercise base, add your own, and keep every session grounded in real movements."
      />

      <AppInput label="Search" value={query} onChangeText={setQuery} placeholder="Bench, cable row, quads..." />
      {!activeSearch ? (
        <>
          <FilterRail label="Muscle" options={["all", ...muscleGroups]} selected={muscleGroup} onSelect={(value) => setMuscleGroup(value as MuscleGroup | "all")} />
          <FilterRail label="Equipment" options={["all", ...equipmentOptions]} selected={equipment} onSelect={(value) => setEquipment(value as Equipment | "all")} />
        </>
      ) : (
        <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceMuted, padding: spacing.md, gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
            Search mode
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Showing matching exercises only. Clear the search to bring filters and default sections back.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <Text selectable style={{ ...type.section, color: colors.text }}>
          {resultTitle}
        </Text>
        <Link href="/(protected)/library/new" asChild>
          <PrimaryButton label="Add Custom" onPress={() => {}} compact />
        </Link>
      </View>

      <View style={{ gap: spacing.md }}>
        {filteredExercises.length === 0 ? (
          <EmptyState title="No movements found" message={activeSearch ? "No matches yet. Clear the search or add a custom exercise." : "Try a broader muscle group or clear the filters."} />
        ) : (
          filteredExercises.map((exercise, index) => (
            <Link key={exercise.id} href={`/(protected)/library/${exercise.id}`} asChild>
              <Pressable>
                <RowItem
                  title={exercise.name}
                  subtitle={`${titleCase(exercise.category)} · ${exercise.equipment.map(titleCase).join(", ")}`}
                  meta={exercise.isCustom ? "Custom" : undefined}
                  index={index}
                >
                  <DetailToggle label="Details" compact>
                    <View style={{ flexDirection: "row", gap: spacing.md, flexWrap: "wrap" }}>
                      <MiniMetric label="Typical boundary" value={formatTargetRange(exercise.defaultRepRange, getExerciseMeasurementType(exercise.defaultSettings))} />
                      <MiniMetric label="Jump" value={`${exercise.defaultLoadJump}${exercise.defaultSettings.unit}`} />
                      <MiniMetric label="Pattern" value={titleCase(exercise.movementPattern)} />
                    </View>
                  </DetailToggle>
                </RowItem>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </Screen>
  );
}

function FilterRail({
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

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 84, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 13, fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}
