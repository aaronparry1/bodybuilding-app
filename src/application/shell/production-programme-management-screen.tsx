import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { availableExerciseCatalogue, editCanonicalExercise, rankExerciseReplacements, type ExerciseEditAction, type ExerciseEditScope } from "@/application/training/canonical-exercise-management";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { exerciseDisplayName } from "@/application/training/display-labels";
import { PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

type Params = Readonly<{ plannedSessionId?: string; recordedSessionId?: string }>;
type Slot = Readonly<Record<string, unknown>>;

export default function ProductionProgrammeManagementScreen() {
  const params = useLocalSearchParams<Params>();
  const [, refresh] = useState(0);
  const [action, setAction] = useState<ExerciseEditAction | null>(null);
  const [scope, setScope] = useState<ExerciseEditScope>(params.recordedSessionId ? "current_session" : "future_programme");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  const plan = canonicalActivePlanState.getReadModel();
  const carrier = canonicalActivePlanV2Repository.get();
  const equipment = carrier.status === "saved" ? carrier.carrier.constraints.equipment : [];
  const aggregate = params.recordedSessionId ? canonicalRecordedSessionLedger.get(String(params.recordedSessionId)) : { status: "not_found" as const };
  const planned = plan?.plannedSessions.find((session) => session.id === params.plannedSessionId)
    ?? plan?.plannedSessions.find((session) => session.id === plan.nextSession?.id);
  const snapshot = aggregate.status === "found" ? aggregate.session.prescriptionSnapshot : planned?.snapshot;
  const slots = useMemo(() => Array.isArray(snapshot?.slots) ? (snapshot.slots as Slot[]).slice().sort((a, b) => Number(a.index) - Number(b.index)) : [], [snapshot]);
  const selectedSlot = slots.find((slot) => String(slot.id) === slotId);
  const replacementOptions = selectedSlot && plan ? rankExerciseReplacements(selectedSlot, equipment) : [];
  const addOptions = plan ? availableExerciseCatalogue().filter((exercise) => exercise.roles.some((role) => ["accessory", "isolation", "corrective", "secondary_compound"].includes(role)) && exercise.equipment.some((item) => equipment.includes(item)) && !slots.some((slot) => slot.exerciseId === exercise.id)).slice().sort((a, b) => a.name.localeCompare(b.name)) : [];
  const options = action === "add" ? addOptions.map((exercise) => ({ exercise, compatibility: "recalibration_required" as const })) : replacementOptions;

  if (!plan || !snapshot) return <View style={styles.screen}><Text style={styles.title}>Manage programme</Text><Text style={styles.muted}>Your programme is still loading. No changes can be made yet.</Text><SecondaryButton label="Go back" onPress={() => router.back()} /></View>;

  const cancel = () => { setAction(null); setSlotId(null); setExerciseId(null); setMessage("No changes were saved."); };
  const confirm = () => {
    if (!action || (action !== "add" && !slotId) || (action !== "remove" && !exerciseId)) return;
    const scopeCopy = scope === "current_session" ? "Only this active workout will change." : "Matching exercises in future planned workouts will change. Completed workouts and performance history will stay unchanged.";
    Alert.alert(action === "remove" ? "Remove this exercise?" : action === "add" ? "Add this exercise?" : "Replace this exercise?", scopeCopy, [
      { text: "Cancel", style: "cancel" },
      { text: "Save change", onPress: apply },
    ]);
  };
  const apply = () => {
    setSaving(true);
    const result = editCanonicalExercise({
      action: action!, scope, planId: plan.planId, expectedPlanRevision: plan.revision,
      operationId: `programme-edit:${action}:${scope}:${slotId ?? exerciseId}:${Date.now()}`,
      occurredAt: new Date().toISOString(), plannedSessionId: planned?.id,
      recordedSessionId: aggregate.status === "found" ? aggregate.session.recordedSessionId : undefined,
      expectedLedgerVersion: aggregate.status === "found" ? aggregate.session.version : undefined,
      slotId: slotId ?? (action === "add" ? "new-optional-slot" : undefined),
      sourceExerciseId: selectedSlot ? String(selectedSlot.exerciseId) : undefined,
      exerciseId: exerciseId ?? undefined,
    });
    setSaving(false);
    setMessage(friendly(result.reason));
    if (result.status === "applied" || result.status === "idempotent") { canonicalActivePlanState.refresh(); setAction(null); setSlotId(null); setExerciseId(null); }
  };

  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>PROGRAMME MANAGEMENT</Text><Text accessibilityRole="header" style={styles.title}>Edit exercises</Text>
    <Text style={styles.muted}>Completed workouts and recorded performance are never changed. Replacement exercises keep their own load history; when loads are not directly comparable, the app asks you to establish a safe starting load.</Text>
    {aggregate.status === "found" ? <View style={styles.scope}><Text style={styles.section}>Apply change to</Text><Choice label="This workout only" selected={scope === "current_session"} onPress={() => setScope("current_session")} /><Choice label="Future planned workouts" selected={scope === "future_programme"} onPress={() => setScope("future_programme")} /></View> : <Text style={styles.scopeNote}>Changes here apply to future planned workouts only.</Text>}
    {!action ? <View style={styles.actions}><PrimaryButton label="Swap or replace an exercise" onPress={() => setAction("replace")} /><SecondaryButton label="Add an optional exercise" onPress={() => setAction("add")} /><SecondaryButton label="Remove an optional exercise" onPress={() => setAction("remove")} /></View> : <>
      <Text style={styles.section}>{action === "add" ? "Choose an exercise to add" : "Choose the exercise to change"}</Text>
      {action !== "add" ? slots.map((slot) => <Choice key={String(slot.id)} label={`${exerciseDisplayName(String(slot.exerciseId))}${slot.constructionRole === "primary" ? " · required" : ""}`} selected={slotId === slot.id} onPress={() => { setSlotId(String(slot.id)); setExerciseId(null); }} />) : null}
      {action !== "remove" && (action === "add" || selectedSlot) ? <><Text style={styles.section}>{action === "add" ? "Available optional exercises" : "Compatible replacements first"}</Text>{options.slice(0, 40).map(({ exercise, compatibility }) => <Choice key={exercise.id} label={`${exercise.name}${compatibility === "equivalent" ? " · compatible" : " · new starting load required"}`} selected={exerciseId === exercise.id} onPress={() => setExerciseId(exercise.id)} />)}</> : null}
      <PrimaryButton label={saving ? "Saving…" : "Review change"} disabled={saving} onPress={confirm} /><SecondaryButton label="Cancel without saving" onPress={cancel} />
    </>}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
  </ScrollView>;
}

function Choice({ label, selected, onPress }: Readonly<{ label: string; selected: boolean; onPress(): void }>) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>; }
function friendly(reason: string): string { return ({ exercise_replaced: "Exercise replaced. Your previous records are unchanged.", exercise_replaced_recalibration_required: "Exercise replaced. Establish a safe starting load before its first working set.", future_exercises_replaced: "Future exercises updated. Completed workouts are unchanged.", optional_exercise_added: "Optional exercise added.", future_exercise_added: "Optional exercise added to the future workout.", optional_exercise_removed: "Optional exercise removed.", future_optional_exercises_removed: "Optional exercise removed from future workouts.", required_exercise_requires_replacement: "Required primary work cannot be removed. Choose a compatible replacement instead.", performed_exercise_cannot_be_changed: "This exercise already has completed sets in the active workout and cannot be changed.", duplicate_exercise_not_allowed: "That exercise is already in this workout.", incompatible_replacement: "That exercise does not meet this slot’s role, muscle target or equipment requirements." } as Record<string, string>)[reason] ?? "The change could not be saved safely. Nothing was modified."; }

const styles = {
  screen: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md } as const,
  eyebrow: { color: colors.accent, fontWeight: "900", letterSpacing: 1.4 } as const,
  title: { ...type.hero, color: colors.text } as const,
  section: { ...type.section, color: colors.text, marginTop: spacing.sm } as const,
  muted: { ...type.body, color: colors.textMuted } as const,
  scope: { gap: spacing.sm } as const, scopeNote: { color: colors.textMuted } as const, actions: { gap: spacing.sm } as const,
  choice: { minHeight: 48, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceMuted } as const,
  choiceSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft } as const,
  choiceText: { color: colors.textMuted, fontWeight: "700" } as const, choiceTextSelected: { color: colors.accent } as const,
  message: { color: colors.textMuted } as const,
};
