import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { exerciseLibrary } from "@/domain/training/presets";
import { projectCanonicalExerciseHistory } from "@/domain/training/canonical-exercise-history-projection";
import { EmptyState, Pill, PremiumCard, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
export default function ExerciseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, refresh] = useState(0);
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  const plan = canonicalActivePlanState.getReadModel();
  const result = plan ? projectCanonicalExerciseHistory({ athleteId: plan.planId, planId: plan.planId, exerciseId: String(id), sessions: canonicalRecordedSessionLedger.exportPlan(plan.planId), exercises: exerciseLibrary, unit: "kg" }) : { status: "unavailable" as const, reason: "canonical_plan_unavailable" };
  const name = result.status === "ready" ? result.projection.exerciseName : "Exercise";
  return <Screen><ScreenHeader eyebrow="Exercise history" title={name} subtitle="History from completed canonical recorded sessions." />{result.status !== "ready" ? <EmptyState title="History unavailable" message={result.reason} /> : result.projection.entries.length === 0 ? <EmptyState title="No completed history" message="Log this exercise in a completed canonical session and it will appear here." /> : result.projection.entries.map((entry) => <PremiumCard key={entry.recordedSessionId}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}><View style={{ flex: 1, gap: spacing.xs }}><Text selectable style={{ ...type.section, color: colors.text }}>{entry.role}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{new Date(entry.completedAt).toLocaleDateString()}</Text></View><Pill label="Recorded" tone="success" /></View><View style={{ flexDirection: "row", gap: spacing.md }}><Mini label="Best" value={entry.bestReps == null ? "—" : String(entry.bestReps)} /><Mini label="Sets" value={String(entry.totalWorkSets)} /></View></PremiumCard>)}</Screen>;
}
function Mini({ label, value }: { label: string; value: string }) { return <View style={{ flex: 1, gap: spacing.xs }}><Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text><Text selectable style={{ color: colors.text, fontSize: 14, fontWeight: "900" }}>{value}</Text></View>; }
