import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalCompletionSummary } from "@/application/training/canonical-completion-summary-presentation";
import { canonicalProgressDecisionRepository } from "@/data/local/canonical-progress-decision-repository";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { displayLoadFromBaseKg } from "@/application/training/canonical-workout-presentation";
import { exerciseDisplayName, mesocyclePurposeDisplayName, sessionRoleDisplayName } from "@/application/training/display-labels";
import { useAppSettings } from "@/application/settings/app-settings";
import { buildWorkoutAchievementSharePayload, buildWorkoutSummarySharePayload, type BrandedSharePayload } from "@/domain/training/share-cards";
import { BrandedShareCardPreviewModal } from "@/features/social-sharing/branded-share-card-preview";
import { AppScreen, PremiumCard, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { spacing, type, workoutColors } from "@/ui/theme";
import { WorkoutMetricStrip } from "@/ui/workout-visuals";
import { useReducedMotion } from "@/ui/motion";
import { SupersetAdaptationNotice } from "@/ui/superset-adaptation-notice";

const TRAIN = workoutColors;

export default function CompletionSummaryScreen() {
  const { recordedSessionId } = useLocalSearchParams<{ recordedSessionId?: string }>();
  const { settings } = useAppSettings();
  const [, refresh] = useState(0);
  const [sharePayload, setSharePayload] = useState<BrandedSharePayload | null>(null);
  const reduceMotion = useReducedMotion();

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
  const nextPlanned = plan?.nextSession ? plan.plannedSessions.find((candidate) => candidate.id === plan.nextSession!.id) : undefined;
  const summary = projectCanonicalCompletionSummary({
    session: aggregate.session,
    events: aggregate.events,
    history: canonicalRecordedSessionLedger.exportPlan(aggregate.session.planId),
    decision,
    displayUnit: settings.unit,
    coachingExplanation: decision?.explanation,
    programmePosition: plan ? `${mesocyclePurposeDisplayName(plan.mesocycle.purpose)} · week ${plan.microcycle.sequenceNumber}` : undefined,
    nextWorkoutId: plan?.nextSession?.id,
    nextWorkoutLabel: plan?.nextSession ? sessionRoleDisplayName(plan.nextSession.role) : undefined,
    nextPrescription: nextPlanned ? nextPrescriptionLabel(nextPlanned.snapshot, settings.unit) : undefined,
  });
  const nextWorkout = plan?.nextSession?.role ?? null;
  const displayedVolume = summary.totalVolume === null ? null : displayLoadFromBaseKg(summary.totalVolume, settings.unit);
  const duration = formatDuration(summary.elapsedSeconds);
  const payload = summary.achievements[0]
    ? buildWorkoutAchievementSharePayload(summary.achievements[0], settings.unit)
    : buildWorkoutSummarySharePayload({ workoutName: summary.workoutName, exercisesCompleted: summary.exercisesCompleted, workSetsCompleted: summary.completedWorkingSets, prCount: 0 });

  return <AppScreen>
    <CompletionReveal index={0} reduceMotion={reduceMotion}><View accessibilityRole="summary" style={styles.successHeader}>
      <View style={styles.successMark}><Text style={styles.successGlyph}>✓</Text></View>
      <Text maxFontSizeMultiplier={1.5} style={styles.eyebrow}>{summary.completionLabel.toUpperCase()}</Text>
      <Text maxFontSizeMultiplier={1.05} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.72} style={styles.hero}>{summary.workoutName}</Text>
      <Text maxFontSizeMultiplier={1.2} style={styles.muted}>{summary.completion === "complete" ? "Strong work. Every prescribed exercise was represented in the retained session." : "Your completed work is saved exactly as performed. Unfinished work was not invented."}</Text>
    </View></CompletionReveal>

    <CompletionReveal index={1} reduceMotion={reduceMotion}><WorkoutMetricStrip centered items={[
      { value: String(summary.completedWorkingSets), label: "work sets" },
      { value: String(summary.exercisesCompleted), label: summary.prescribedExercises ? `of ${summary.prescribedExercises} exercises` : "exercises" },
      { value: duration, label: "elapsed" },
    ]} /></CompletionReveal>

    {displayedVolume !== null ? <CompletionReveal index={2} reduceMotion={reduceMotion}><PremiumCard tone="quiet"><Text style={styles.cardLabel}>WORK COMPLETED</Text><Text style={styles.volume}>{formatNumber(displayedVolume)} {settings.unit}</Text><Text style={styles.muted}>Evidence-backed load volume from completed weighted sets.</Text></PremiumCard></CompletionReveal> : null}

    {summary.achievements.length ? <CompletionReveal index={3} reduceMotion={reduceMotion}><PremiumCard tone="success">
      <Text style={styles.cardLabel}>{summary.achievements.length === 1 ? "GENUINE ACHIEVEMENT" : `${summary.achievements.length} GENUINE ACHIEVEMENTS`}</Text>
      {summary.achievements.map((achievement) => <View key={achievement.id} style={styles.achievement}><Text selectable style={styles.cardTitle}>{achievement.title}</Text><Text selectable style={styles.body}>{achievement.exerciseName ? `${achievement.exerciseName} · ` : ""}{achievement.detail}</Text></View>)}
    </PremiumCard></CompletionReveal> : null}

    <CompletionReveal index={4} reduceMotion={reduceMotion}><PremiumCard tone={summary.coachingChange?.status === "applied" ? "success" : "quiet"}>
      <Text style={styles.cardLabel}>{decision ? "COACH REVIEW" : "SESSION SAVED"}</Text>
      <Text style={styles.cardTitle}>{summary.coachingChange?.label ?? (decision ? "Your training evidence was reviewed" : "Your programme state is up to date")}</Text>
      <Text style={styles.body}>{summary.coachingOutcome}</Text>
      {summary.coachingChange?.changes.map((change) => <View key={`${change.exerciseName}:${change.before}:${change.after}`} style={styles.change}><Text selectable style={styles.detail}>{change.exerciseName}</Text><Text selectable style={styles.cardTitle}>{change.before}</Text><Text style={styles.changeArrow}>↓</Text><Text selectable style={styles.cardTitle}>{change.after}</Text><Text selectable style={styles.body}>{change.reason}</Text></View>)}
      {summary.methodsPerformed.length ? <Text style={styles.detail}>Methods performed · {summary.methodsPerformed.join(" · ")}</Text> : null}
    </PremiumCard></CompletionReveal>

    {summary.supersetAdaptation ? <CompletionReveal index={5} reduceMotion={reduceMotion}><SupersetAdaptationNotice presentation={summary.supersetAdaptation} /></CompletionReveal> : null}

    <CompletionReveal index={6} reduceMotion={reduceMotion}><PremiumCard tone="default">
      <Text style={styles.cardLabel}>WHAT’S NEXT</Text>
      {summary.programmePosition ? <Text selectable style={styles.detail}>{summary.programmePosition}</Text> : null}
      <Text style={styles.cardTitle}>{summary.nextWorkoutLabel ? `${summary.nextWorkoutLabel} is next` : nextWorkout ? `${nextWorkout} is next` : "Recovery comes next"}</Text>
      <Text style={styles.body}>{nextWorkout ? "Return home to see the updated programme and start only when the next session is due." : "This block has no immediate next session. Review Progress for the latest coaching outcome."}</Text>
      {summary.nextPrescription ? <Text selectable style={styles.nextPrescription}>{summary.nextPrescription}</Text> : null}
      <PrimaryButton label="Return home" onPress={() => router.replace("/(protected)/(tabs)")} />
      <SecondaryButton label="View progress" onPress={() => router.replace("/(protected)/(tabs)/analytics")} />
    </PremiumCard></CompletionReveal>

    <SecondaryButton testID="completion-share" label={summary.achievements.length ? "Preview achievement share card" : "Preview workout share card"} onPress={() => setSharePayload(payload)} />
    <Text style={styles.privacy}>The share card contains workout totals only—never your name, account, notes, bodyweight or full workout log.</Text>
    <BrandedShareCardPreviewModal payload={sharePayload} onClose={() => setSharePayload(null)} />
  </AppScreen>;
}

function CompletionReveal({ children, index, reduceMotion }: Readonly<{ children: ReactNode; index: number; reduceMotion: boolean }>) {
  if (reduceMotion || Platform.OS === "web") return <View>{children}</View>;
  return <Animated.View entering={FadeInUp.duration(220).delay(index * 55)}>{children}</Animated.View>;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(0, Math.floor(seconds / 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
}

function formatNumber(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1); }

function nextPrescriptionLabel(snapshot: Readonly<Record<string, unknown>>, unit: "kg" | "lb"): string | undefined {
  const slots = Array.isArray(snapshot.slots) ? snapshot.slots as Array<Record<string, unknown>> : [];
  const first = slots[0];
  if (!first) return undefined;
  const settings = first.settings && typeof first.settings === "object" ? first.settings as Record<string, unknown> : {};
  const loadPrescription = first.loadPrescription && typeof first.loadPrescription === "object" ? first.loadPrescription as Record<string, unknown> : {};
  const targets = Array.isArray(first.exactTargets) ? first.exactTargets.map(Number) : [];
  const sets = Number(settings.requiredSets ?? settings.requiredWorkSets ?? targets.length);
  const validSets = Number.isFinite(sets) && sets > 0 ? Math.floor(sets) : targets.length;
  if (!validSets) return `${exerciseDisplayName(String(first.exerciseId))} · View exact prescription`;
  const reps = targets.length && targets.every((value) => value === targets[0]) ? String(targets[0]) : targets.length ? targets.join("/") : String(settings.targetReps ?? "prescribed reps");
  const baseLoad = Number(first.prescribedLoad ?? loadPrescription.prescribedBaseLoad);
  const load = Number.isFinite(baseLoad) && baseLoad > 0 ? `${formatNumber(displayLoadFromBaseKg(baseLoad, unit))} ${unit} · ` : "";
  return `${exerciseDisplayName(String(first.exerciseId))} · ${load}${validSets} × ${reps}`;
}

const styles = StyleSheet.create({
  successHeader: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  successMark: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center", backgroundColor: TRAIN.successSoft, borderWidth: 1, borderColor: TRAIN.success },
  successGlyph: { color: TRAIN.success, fontSize: 34, lineHeight: 38, fontWeight: "900" },
  eyebrow: { color: TRAIN.success, ...type.label, letterSpacing: 0.8 },
  hero: { color: TRAIN.text, ...type.hero, textAlign: "center" },
  muted: { color: TRAIN.muted, ...type.body, textAlign: "center" },
  body: { color: TRAIN.text, ...type.body },
  cardLabel: { color: TRAIN.accent, ...type.label, letterSpacing: 0.7 },
  cardTitle: { color: TRAIN.text, ...type.section },
  volume: { color: TRAIN.text, fontSize: 32, lineHeight: 36, fontWeight: "900", fontVariant: ["tabular-nums"] },
  detail: { color: TRAIN.muted, fontSize: 12, lineHeight: 17, fontWeight: "700" },
  achievement: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: TRAIN.line },
  change: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: TRAIN.line },
  changeArrow: { color: TRAIN.success, fontSize: 18, fontWeight: "900" },
  nextPrescription: { color: TRAIN.text, fontSize: 15, lineHeight: 21, fontWeight: "800", paddingTop: spacing.xs },
  privacy: { color: TRAIN.subtle, fontSize: 11, lineHeight: 16, textAlign: "center", paddingHorizontal: spacing.md },
});
