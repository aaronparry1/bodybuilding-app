import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalRecordedSessionHistory } from "@/domain/training/canonical-recorded-session-history-projection";
import { useSubscription } from "@/application/billing/subscription-context";
import { AppInput, AppScreen, EmptyActionState, HeroPanel, LockedFeatureCard, RowItem } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
export default function WorkoutHistoryScreen() {
  const [exerciseQuery, setExerciseQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [, refresh] = useState(0);
  const { entitlement } = useSubscription();
  useEffect(() => { canonicalActivePlanState.hydrate(); return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1)); }, []);
  const plan = canonicalActivePlanState.getReadModel();
  const result = plan ? projectCanonicalRecordedSessionHistory({ athleteId: plan.planId, planId: plan.planId, sessions: canonicalRecordedSessionLedger.exportPlan(plan.planId), exerciseQuery, fromDate, toDate }) : { status: "unavailable" as const, reason: "canonical_plan_unavailable" };
  const historyEntitlement = entitlement("unlimited_history", { historyDaysRequested: fromDate ? 365 : 30 });
  return <AppScreen><HeroPanel eyebrow="History" title="Training memory" subtitle="Completed canonical sessions and the details behind your progress." /><AppInput value={exerciseQuery} onChangeText={setExerciseQuery} label="Exercise filter" placeholder="Bench, row, squat..." /><View style={{ flexDirection: "row", gap: spacing.sm }}><View style={{ flex: 1 }}><AppInput value={fromDate} onChangeText={setFromDate} label="From" placeholder="YYYY-MM-DD" /></View><View style={{ flex: 1 }}><AppInput value={toDate} onChangeText={setToDate} label="To" placeholder="YYYY-MM-DD" /></View></View>{!historyEntitlement.allowed ? <Link href="/(protected)/paywall" asChild><Pressable><LockedFeatureCard title="Unlimited history is Pro" message="Free history covers 30 days." /></Pressable></Link> : null}<View style={{ gap: spacing.md }}>{result.status !== "ready" ? <EmptyActionState title="History unavailable" message={result.reason} /> : result.entries.length === 0 ? <EmptyActionState title="No completed workouts yet" message="Finish a canonical session and the receipts show up here." /> : result.entries.map((summary, index) => <Link key={summary.recordedSessionId} href={"/(protected)/history/" + summary.recordedSessionId} asChild><Pressable><RowItem title={summary.role} subtitle={new Date(summary.completedAt).toLocaleDateString()} meta={summary.classification} index={index}><View style={{ flexDirection: "row", gap: spacing.md }}><Mini label="Exercises" value={String(summary.exercisesCompleted)} /><Mini label="Sets" value={String(summary.workSets)} /><Mini label="Reps" value={String(summary.reps)} /></View></RowItem></Pressable></Link>)}</View></AppScreen>;
}
function Mini({ label, value }: { label: string; value: string }) { return <View style={{ flex: 1, gap: spacing.xs }}><Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text><Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{value}</Text></View>; }
