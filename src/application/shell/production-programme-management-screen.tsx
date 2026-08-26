import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { availableExerciseCatalogue, editCanonicalExercise, rankExerciseReplacements, type ExerciseEditAction, type ExerciseEditScope, type ExerciseSubstitutionReason } from "@/application/training/canonical-exercise-management";
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
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState<ExerciseSubstitutionReason>("preference");
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

  const cancel = () => { setAction(null); setSlotId(null); setExerciseId(null); setReviewing(false); setMessage("No changes were saved."); };
  const confirm = () => {
    if (!action || (action !== "add" && !slotId) || (action !== "remove" && !exerciseId)) return;
    setReviewing(true);
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
      reason,
    });
    setSaving(false);
    const resultMessage = friendly(result.reason);
    setMessage(resultMessage);
    if (result.status === "applied" || result.status === "idempotent") {
      canonicalActivePlanState.refresh();
      setAction(null);
      setSlotId(null);
      setExerciseId(null);
      setReviewing(false);
      if (scope === "current_session" && aggregate.status === "found") {
        router.replace({ pathname: "/(protected)/(tabs)/train", params: { planId: plan.planId, planRevision: String(plan.revision), recordedSessionId: aggregate.session.recordedSessionId, exerciseEditMessage: resultMessage } });
      }
    }
  };

  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>PROGRAMME MANAGEMENT</Text><Text accessibilityRole="header" style={styles.title}>Edit exercises</Text>
    <Text style={styles.muted}>Completed workouts and recorded performance are never changed. Replacement exercises keep their own load history; when loads are not directly comparable, the app asks you to establish a safe starting load.</Text>
    {aggregate.status === "found" ? <SecondaryButton label="Return to active workout" onPress={() => router.back()} /> : null}
    {aggregate.status === "found" ? <View style={styles.scope}><Text style={styles.section}>Apply change to</Text><Choice label="This workout only" selected={scope === "current_session"} onPress={() => setScope("current_session")} /><Choice label="Future planned workouts" selected={scope === "future_programme"} onPress={() => setScope("future_programme")} /></View> : <Text style={styles.scopeNote}>Changes here apply to future planned workouts only.</Text>}
    {!action ? <View style={styles.actions}><PrimaryButton label="Swap or replace an exercise" onPress={() => setAction("replace")} /><SecondaryButton label="Add an optional exercise" onPress={() => setAction("add")} /><SecondaryButton label="Remove an optional exercise" onPress={() => setAction("remove")} /></View> : <>
      <Text style={styles.section}>{action === "add" ? "Choose an exercise to add" : "Choose the exercise to change"}</Text>
      {action !== "add" ? slots.map((slot) => <Choice key={String(slot.id)} label={`${exerciseDisplayName(String(slot.exerciseId))}${slot.constructionRole === "primary" ? " · required" : ""}`} selected={slotId === slot.id} onPress={() => { setSlotId(String(slot.id)); setExerciseId(null); setReviewing(false); }} />) : null}
      {action !== "remove" && (action === "add" || selectedSlot) ? <><Text style={styles.section}>{action === "add" ? "Available optional exercises" : "Compatible replacements first"}</Text>{options.slice(0, 40).map(({ exercise, compatibility }) => <Choice key={exercise.id} label={`${exercise.name}${compatibility === "equivalent" ? " · compatible" : " · new starting load required"}`} selected={exerciseId === exercise.id} onPress={() => { setExerciseId(exercise.id); setReviewing(false); }} />)}</> : null}
      {action === "replace" && exerciseId ? <View style={styles.scope}><Text style={styles.section}>Why are you changing it?</Text><Choice label="Equipment unavailable" selected={reason === "equipment_unavailable"} onPress={() => setReason("equipment_unavailable")} /><Choice label="Discomfort or incompatibility" selected={reason === "discomfort"} onPress={() => setReason("discomfort")} /><Choice label="Personal preference" selected={reason === "preference"} onPress={() => setReason("preference")} /></View> : null}
      {!reviewing ? <PrimaryButton label="Review change" disabled={saving || (action !== "add" && !slotId) || (action !== "remove" && !exerciseId)} onPress={confirm} /> : <View testID="exercise-change-review" style={styles.review}>
        <Text accessibilityRole="header" style={styles.section}>{action === "remove" ? "Remove this exercise?" : action === "add" ? "Add this exercise?" : "Replace this exercise?"}</Text>
        <Text style={styles.muted}>{scope === "current_session" ? "Only this active workout will change." : "Matching exercises in future planned workouts will change. Completed workouts and performance history will stay unchanged."}</Text>
        <PrimaryButton label={saving ? "Saving…" : "Save change"} disabled={saving} onPress={apply} />
        <SecondaryButton label="Back to choices" onPress={() => setReviewing(false)} />
      </View>}
      <SecondaryButton label="Cancel without saving" onPress={cancel} />
    </>}
    {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
  </ScrollView>;
}

function Choice({ label, selected, onPress }: Readonly<{ label: string; selected: boolean; onPress(): void }>) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>; }
function friendly(reason: string): string { return ({ exercise_replaced: "Exercise replaced for the remaining sets. Earlier work and each exercise’s history stay separate.", exercise_replaced_recalibration_required: "Exercise replaced for the remaining sets. Earlier work is saved; establish a safe starting load for the replacement.", future_exercises_replaced: "Future exercises updated. Completed workouts are unchanged.", optional_exercise_added: "Optional exercise added.", future_exercise_added: "Optional exercise added to the future workout.", optional_exercise_removed: "Optional exercise removed.", future_optional_exercises_removed: "Optional exercise removed from future workouts.", required_exercise_requires_replacement: "Required primary work cannot be removed. Choose a compatible replacement instead.", duplicate_exercise_not_allowed: "That exercise is already in this workout.", incompatible_replacement: "That exercise does not meet this slot’s role, muscle target, method or equipment requirements." } as Record<string, string>)[reason] ?? "The change could not be saved safely. Nothing was modified."; }

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
  review: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accentSoft } as const,
  message: { color: colors.textMuted } as const,
};
