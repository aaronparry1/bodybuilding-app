import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { displayLoadFromBaseKg } from "@/application/training/canonical-workout-presentation";
import { useAppSettings } from "@/application/settings/app-settings";
import { buildWorkoutSummarySharePayload, type BrandedSharePayload } from "@/domain/training/share-cards";
import { BrandedShareCardPreviewModal } from "@/features/social-sharing/branded-share-card-preview";
import { AppScreen, PremiumCard, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { spacing, type, workoutColors } from "@/ui/theme";

const TRAIN = workoutColors;

export default function CompletionSummaryScreen() {
  const { recordedSessionId } = useLocalSearchParams<{ recordedSessionId?: string }>();
  const { settings } = useAppSettings();
  const [, refresh] = useState(0);
  const [sharePayload, setSharePayload] = useState<BrandedSharePayload | null>(null);

  useEffect(() => {
    canonicalActivePlanState.refresh();
    return canonicalActivePlanState.subscribe(() => refresh((value) => value + 1));
  }, []);

  const aggregate = recordedSessionId ? canonicalRecordedSessionLedger.get(String(recordedSessionId)) : { status: "not_found" as const };
  const plan = canonicalActivePlanState.getReadModel();
  if (aggregate.status !== "found") return <AppScreen><Text style={styles.hero}>Workout complete</Text><Text style={styles.muted}>This summary is no longer available, but your retained training history is unchanged.</Text><PrimaryButton label="Return home" onPress={() => router.replace("/(protected)/(tabs)")} /></AppScreen>;

  const decision = canonicalProgressDecisionRepository.list(aggregate.session.planId)
    .filter((candidate) => candidate.phaseOne?.sourceRecordedSessionId === aggregate.session.recordedSessionId)
    .sort((left, right) => left.phaseOne!.decidedAt.localeCompare(right.phaseOne!.decidedAt) || left.decisionId.localeCompare(right.decisionId))
    .at(-1);
  const summary = projectCanonicalCompletionSummary({ session: aggregate.session, events: aggregate.events, coachingExplanation: decision?.explanation, nextWorkoutId: plan?.nextSession?.id });
  const nextWorkout = plan?.nextSession?.role ?? null;
  const displayedVolume = summary.totalVolume === null ? null : displayLoadFromBaseKg(summary.totalVolume, settings.unit);
  const duration = formatDuration(summary.elapsedSeconds);
  const payload = buildWorkoutSummarySharePayload({ workoutName: summary.workoutName, exercisesCompleted: summary.exercisesCompleted, workSetsCompleted: summary.completedWorkingSets, prCount: 0 });

  return <AppScreen>
    <View accessibilityRole="summary" style={styles.successHeader}>
      <View style={styles.successMark}><Text style={styles.successGlyph}>✓</Text></View>
      <Text style={styles.eyebrow}>{summary.completionLabel.toUpperCase()}</Text>
      <Text style={styles.hero}>{summary.workoutName}</Text>
      <Text style={styles.muted}>{summary.completion === "complete" ? "Strong work. Every prescribed exercise was represented in the retained session." : "Your completed work is saved exactly as performed. Unfinished work was not invented."}</Text>
    </View>

    <View style={styles.metrics}>
      <Metric value={String(summary.completedWorkingSets)} label="work sets" />
      <Metric value={String(summary.exercisesCompleted)} label={summary.prescribedExercises ? `of ${summary.prescribedExercises} exercises` : "exercises"} />
      <Metric value={duration} label="elapsed" />
    </View>

    {displayedVolume !== null ? <PremiumCard tone="quiet"><Text style={styles.cardLabel}>WORK COMPLETED</Text><Text style={styles.volume}>{formatNumber(displayedVolume)} {settings.unit}</Text><Text style={styles.muted}>Evidence-backed load volume from completed weighted sets.</Text></PremiumCard> : null}

    <PremiumCard tone={decision ? "success" : "quiet"}>
      <Text style={styles.cardLabel}>{decision ? "COACH REVIEW" : "SESSION SAVED"}</Text>
      <Text style={styles.cardTitle}>{decision ? "Your training evidence was reviewed" : "Your programme state is up to date"}</Text>
      <Text style={styles.body}>{summary.coachingOutcome}</Text>
      {summary.methodsPerformed.length ? <Text style={styles.detail}>Methods performed · {summary.methodsPerformed.join(" · ")}</Text> : null}
    </PremiumCard>

    <PremiumCard tone="default">
      <Text style={styles.cardLabel}>WHAT’S NEXT</Text>
      <Text style={styles.cardTitle}>{nextWorkout ? `${nextWorkout} is next` : "Recovery comes next"}</Text>
      <Text style={styles.body}>{nextWorkout ? "Return home to see the updated programme and start only when the next session is due." : "This block has no immediate next session. Review Progress for the latest coaching outcome."}</Text>
      <PrimaryButton label="Return home" onPress={() => router.replace("/(protected)/(tabs)")} />
      <SecondaryButton label="View progress" onPress={() => router.replace("/(protected)/(tabs)/analytics")} />
    </PremiumCard>

    <SecondaryButton testID="completion-share" label="Share workout summary" onPress={() => setSharePayload(payload)} />
    <Text style={styles.privacy}>The share card contains workout totals only—never your name, account, notes, bodyweight or full workout log.</Text>
    <BrandedShareCardPreviewModal payload={sharePayload} onClose={() => setSharePayload(null)} />
  </AppScreen>;
}

function Metric({ value, label }: Readonly<{ value: string; label: string }>) {
  return <View style={styles.metric}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.metricValue}>{value}</Text><Text numberOfLines={2} style={styles.metricLabel}>{label}</Text></View>;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(0, Math.floor(seconds / 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
}

function formatNumber(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1); }

const styles = StyleSheet.create({
  successHeader: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  successMark: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.successSoft, borderWidth: 1, borderColor: TRAIN.success },
  successGlyph: { color: TRAIN.success, fontSize: 34, lineHeight: 38, fontWeight: "900" },
  eyebrow: { color: TRAIN.success, ...type.label, letterSpacing: 0.8 },
  hero: { color: TRAIN.text, ...type.hero, textAlign: "center" },
  muted: { color: TRAIN.muted, ...type.body, textAlign: "center" },
  body: { color: TRAIN.text, ...type.body },
  metrics: { flexDirection: "row", gap: spacing.sm },
  metric: { flex: 1, minWidth: 0, minHeight: 92, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.sm, borderRadius: 14, backgroundColor: TRAIN.surface, borderWidth: 1, borderColor: TRAIN.line },
  metricValue: { color: TRAIN.text, ...type.metric, fontVariant: ["tabular-nums"] },
  metricLabel: { color: TRAIN.muted, fontSize: 11, lineHeight: 14, fontWeight: "700", textAlign: "center" },
  cardLabel: { color: TRAIN.accent, ...type.label, letterSpacing: 0.7 },
  cardTitle: { color: TRAIN.text, ...type.section },
  volume: { color: TRAIN.text, fontSize: 32, lineHeight: 36, fontWeight: "900", fontVariant: ["tabular-nums"] },
  detail: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  privacy: { color: TRAIN.subtle, fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: spacing.md },
});
