import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { formatMetricValue, getExerciseMeasurementType, metricInputLabel } from "@/domain/training/exercise-metrics";
import { formatLoadDisplay, formatSetLoadDisplay } from "@/domain/training/load-display";
import type { ExerciseMeasurementType, SetLog } from "@/domain/training/models";
import { exerciseLibrary } from "@/domain/training/presets";
import { deleteLoggedSetFromSession, editLoggedSetInSession } from "@/domain/training/session-set-editing";
import { summarizeWorkoutSession } from "@/domain/training/workout-history";
import { EmptyState, Pill, PremiumCard, PrimaryButton, Screen, ScreenHeader, SecondaryButton, StatTile } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessions, setSessions] = useState(() => workoutSessionRepository.list());
  const [editing, setEditing] = useState<{ exerciseIndex: number; set: SetLog } | null>(null);
  const session = sessions.find((candidate) => candidate.id === id);
  const summary = session ? summarizeWorkoutSession(session) : null;
  const editable = Boolean(session?.completedAt && isCurrentWeek(session.completedAt));

  useEffect(() => workoutSessionRepository.subscribe(() => setSessions(workoutSessionRepository.list())), []);

  if (!session || !summary) {
    return (
      <Screen>
        <EmptyState title="Workout not found" message="This completed workout is not available locally." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Workout"
        title={summary.sessionName}
        subtitle={`${new Date(summary.completedAt).toLocaleString()} · ${summary.durationMinutes} min${session.sessionKind && session.sessionKind !== "planned" ? " · Extra" : ""}`}
        action={
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={backButtonStyle}>
            <Text style={{ color: colors.text, fontWeight: "900" }}>Back</Text>
          </Pressable>
        }
      />

      {editable ? (
        <PremiumCard tone="quiet">
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Current-week workout. Tap a set to edit load, reps, or warm-up/work.
          </Text>
        </PremiumCard>
      ) : (
        <PremiumCard tone="quiet">
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Older workouts are read-only for now.
          </Text>
        </PremiumCard>
      )}

      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        {summary.cardioLog ? (
          <>
            <StatTile label="Type" value={cardioLabel(summary.cardioLog.sessionType)} />
            <StatTile label="Duration" value={`${summary.cardioLog.durationMinutes} min`} />
            <StatTile label="Ease" value={summary.cardioLog.perceivedEase ?? "easy"} />
          </>
        ) : (
          <>
            <StatTile label="Exercises" value={`${summary.exercisesCompleted}`} />
            <StatTile label="Sets" value={`${summary.setsCompleted}`} />
            <StatTile label="Logged work" value={`${summary.repsCompleted}`} />
          </>
        )}
      </View>

      {summary.cardioLog ? (
        <PremiumCard>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>
              Cardio session
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              {cardioLabel(summary.cardioLog.modality)} · {summary.cardioLog.durationMinutes} min{summary.cardioLog.distance ? ` · ${summary.cardioLog.distance}` : ""}
            </Text>
            <Pill label="Separate from lifting plan" />
            {summary.cardioLog.notes ? (
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {summary.cardioLog.notes}
              </Text>
            ) : null}
          </View>
        </PremiumCard>
      ) : null}

      {summary.exerciseSummaries.map((exercise) => {
        const sessionExercise = session.exercises.find((candidate) => candidate.id === exercise.exerciseLogId);
        const metadata = exerciseLibrary.find((candidate) => candidate.id === exercise.exerciseId) ?? null;
        const loadDisplay = formatLoadDisplay({
          load: exercise.load,
          unit: exercise.unit,
          known: true,
          bodyweight: sessionExercise?.loadKnown === true && sessionExercise.load === 0 ? true : metadata?.kind === "bodyweight" || metadata?.equipment.includes("bodyweight") === true,
          increment: sessionExercise?.settings.loadIncrease,
        }).label;
        return (
        <PremiumCard key={exercise.exerciseLogId}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text selectable style={{ ...type.section, color: colors.text }}>{exercise.exerciseName}</Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {loadDisplay} · best {formatMetricValue(exercise.bestSetReps, exercise.measurementType)}
              </Text>
            </View>
            <Link href={`/(protected)/history/exercise/${exercise.exerciseId}`} asChild>
              <Pressable>
                <Text style={{ color: colors.accent, fontWeight: "900" }}>History</Text>
              </Pressable>
            </Link>
          </View>

          {sessionExercise
            ?.sets.map((set) => {
              const exerciseIndex = session.exercises.findIndex((candidate) => candidate.id === exercise.exerciseLogId);
              return (
                <Pressable
                  key={set.id}
                  accessibilityRole="button"
                  accessibilityLabel={editable ? `Edit ${set.type ?? "work"} set ${set.setNumber}` : `View ${set.type ?? "work"} set ${set.setNumber}`}
                  disabled={!editable}
                  onPress={() => setEditing({ exerciseIndex, set })}
                  style={({ pressed }) => ({
                    borderRadius: radius.md,
                    backgroundColor: pressed ? colors.surfaceSoft : "transparent",
                    paddingVertical: spacing.xs,
                  })}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                    <Text selectable style={{ color: colors.textMuted }}>
                      {(set.type ?? "work") === "warmup" ? "Warm-up" : "Work"} {set.setNumber}
                    </Text>
                    <Text selectable style={{ color: colors.text, fontWeight: "900" }}>
                      {formatSetLoadDisplay(set, exercise.unit, exercise.unit, { exercise: sessionExercise, metadata })}{editable ? " · Edit" : ""}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

          <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
          <Pill label={exercise.stoppedByDropOff ? "Stopped by drop-off" : "Inside threshold"} tone={exercise.stoppedByDropOff ? "danger" : "success"} />
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Next recommendation: {exercise.nextRecommendedLoad}{exercise.unit}
          </Text>
        </PremiumCard>
        );
      })}

      <EditCompletedSetModal
        visible={Boolean(editing && editable)}
        set={editing?.set ?? null}
        unit={summary.exerciseSummaries.find((exercise) => session.exercises[editing?.exerciseIndex ?? -1]?.id === exercise.exerciseLogId)?.unit ?? "kg"}
        measurementType={getExerciseMeasurementType(session.exercises[editing?.exerciseIndex ?? -1]?.settings)}
        onClose={() => setEditing(null)}
        onSave={(edit) => {
          if (!editing) return;
          const nextSession = editLoggedSetInSession(session, editing.exerciseIndex, editing.set.id, edit, { allowCompleted: true });
          workoutSessionRepository.save(nextSession);
          setEditing(null);
        }}
        onDelete={() => {
          if (!editing) return;
          Alert.alert("Delete set?", "Remove this set from the completed workout?", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                const nextSession = deleteLoggedSetFromSession(session, editing.exerciseIndex, editing.set.id, { allowCompleted: true });
                workoutSessionRepository.save(nextSession);
                setEditing(null);
              },
            },
          ]);
        }}
      />
    </Screen>
  );
}

function cardioLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function EditCompletedSetModal({
  visible,
  set,
  unit,
  measurementType,
  onClose,
  onSave,
  onDelete,
}: {
  visible: boolean;
  set: SetLog | null;
  unit: string;
  measurementType: ExerciseMeasurementType;
  onClose(): void;
  onSave(edit: { load: number; reps: number; type: SetLog["type"] }): void;
  onDelete(): void;
}) {
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("");
  const [setType, setSetType] = useState<SetLog["type"]>("work");
  const metricLabel = metricInputLabel(measurementType);

  useEffect(() => {
    setLoad(set ? String(set.load) : "");
    setReps(set ? String(set.reps) : "");
    setSetType(set?.type ?? "work");
  }, [set]);

  const canSave = Number.isFinite(Number.parseFloat(load)) && Number.isInteger(Number.parseInt(reps, 10));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalBackdropStyle}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={modalSheetStyle}>
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Edit set
          </Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <SecondaryButton label="Warm-up" onPress={() => setSetType("warmup")} compact accessibilityState={{ selected: setType === "warmup" }} />
            <SecondaryButton label="Work" onPress={() => setSetType("work")} compact accessibilityState={{ selected: setType === "work" }} />
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text selectable style={{ ...type.label, color: colors.textMuted }}>Load</Text>
              <View style={inputWithUnitStyle}>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={(value) => setLoad(value.replace(/[^0-9.]/g, ""))}
                  placeholder="Load"
                  placeholderTextColor={colors.textSubtle}
                  value={load}
                  style={editInputStyle}
                />
                <Text selectable style={{ color: colors.textMuted, fontWeight: "900" }}>{unit}</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text selectable style={{ ...type.label, color: colors.textMuted }}>{metricLabel}</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={(value) => setReps(value.replace(/[^0-9]/g, ""))}
                placeholder={metricLabel}
                placeholderTextColor={colors.textSubtle}
                value={reps}
                style={editInputStyle}
              />
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <PrimaryButton
              label="Save set"
              disabled={!canSave}
              onPress={() => onSave({ load: Number.parseFloat(load), reps: Number.parseInt(reps, 10), type: setType })}
            />
            <SecondaryButton label="Delete set" onPress={onDelete} />
            <SecondaryButton label="Cancel" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function isCurrentWeek(completedAt: string, date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const completed = new Date(completedAt);
  return completed >= start && completed < end;
}

const backButtonStyle = {
  minHeight: 38,
  borderRadius: radius.pill,
  borderWidth: 1,
  borderColor: colors.line,
  paddingHorizontal: spacing.md,
  justifyContent: "center" as const,
};

const modalBackdropStyle = {
  flex: 1,
  justifyContent: "flex-end" as const,
  backgroundColor: "rgba(0,0,0,0.58)",
};

const modalSheetStyle = {
  borderTopLeftRadius: radius.xl,
  borderTopRightRadius: radius.xl,
  backgroundColor: colors.background,
  padding: spacing.xl,
  gap: spacing.lg,
};

const inputWithUnitStyle = {
  minHeight: 52,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.line,
  backgroundColor: colors.surfaceMuted,
  paddingHorizontal: spacing.md,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: spacing.sm,
};

const editInputStyle = {
  flex: 1,
  color: colors.text,
  fontSize: 16,
  fontWeight: "900" as const,
};
