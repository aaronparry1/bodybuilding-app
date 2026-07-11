import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSubscription } from "@/application/billing/subscription-context";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { programmeRepository } from "@/data/local/programme-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { filterWorkoutHistory, summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { AppInput, AppScreen, EmptyActionState, HeroPanel, LockedFeatureCard, RowItem } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function WorkoutHistoryScreen() {
  const [sessions, setSessions] = useState(() => workoutHistoryRepository.listCompletedSessions());
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [programmeId, setProgrammeId] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { entitlement } = useSubscription();
  const exercises = customExerciseRepository.listAll();
  const programmes = programmeRepository.listAll();

  useEffect(
    () =>
      workoutHistoryRepository.subscribe(() => {
        setSessions(workoutHistoryRepository.listCompletedSessions());
      }),
    [],
  );

  const selectedExercise = exercises.find((exercise) => exercise.name.toLowerCase().includes(exerciseQuery.toLowerCase()));
  const summaries = useMemo(
    () =>
      filterWorkoutHistory(summarizeWorkoutHistory(sessions), {
        exerciseId: exerciseQuery ? selectedExercise?.id ?? "__none__" : undefined,
        programmeId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    [exerciseQuery, fromDate, programmeId, selectedExercise?.id, sessions, toDate],
  );
  const historyEntitlement = entitlement("unlimited_history", { historyDaysRequested: fromDate ? 365 : 30 });

  return (
    <AppScreen>
      <HeroPanel eyebrow="History" title="Training memory" subtitle="Completed sessions and the details behind your progress." />

      <AppInput value={exerciseQuery} onChangeText={setExerciseQuery} label="Exercise filter" placeholder="Bench, row, squat..." />
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppInput value={fromDate} onChangeText={setFromDate} label="From" placeholder="YYYY-MM-DD" />
        </View>
        <View style={{ flex: 1 }}>
          <AppInput value={toDate} onChangeText={setToDate} label="To" placeholder="YYYY-MM-DD" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
        <Chip label="All programmes" active={!programmeId} onPress={() => setProgrammeId(undefined)} />
        {programmes.map((programme) => (
          <Chip key={programme.id} label={programme.name} active={programmeId === programme.id} onPress={() => setProgrammeId(programme.id)} />
        ))}
      </ScrollView>

      {!historyEntitlement.allowed ? (
        <Link href="/(protected)/paywall" asChild>
          <Pressable>
            <LockedFeatureCard title="Unlimited history is Pro" message="Free history covers 30 days. Upgrade when your logbook starts needing a warehouse." />
          </Pressable>
        </Link>
      ) : null}

      <View style={{ gap: spacing.md }}>
        {summaries.length === 0 ? (
          <EmptyActionState title="No completed workouts yet" message="Finish a session and the receipts show up here." />
        ) : (
          summaries.map((summary, index) => (
            <Link key={summary.sessionId} href={`/(protected)/history/${summary.sessionId}`} asChild>
              <Pressable>
                <RowItem
                  title={summary.sessionName}
                  subtitle={`${new Date(summary.completedAt).toLocaleDateString()} · ${summary.durationMinutes} min`}
                  meta={`${summary.progressionHighlights.length} wins`}
                  index={index}
                >
                  <View style={{ flexDirection: "row", gap: spacing.md }}>
                    <Mini label="Exercises" value={`${summary.exercisesCompleted}`} />
                    <Mini label="Sets" value={`${summary.setsCompleted}`} />
                    <Mini label="Reps" value={`${summary.repsCompleted}`} />
                  </View>
                </RowItem>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </AppScreen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return (
    <Pressable
      onPress={onPress}
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
      <Text style={{ color: active ? colors.accent : colors.textMuted, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text>
      <Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}
