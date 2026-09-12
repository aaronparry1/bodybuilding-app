import { Pressable, Text, View } from "react-native";
import type { CanonicalProgressPresentation, CanonicalProgressPresentationAction } from "@/application/training/canonical-progress-presentation";
import { DetailToggle, EmptyActionState, Pill, PrimaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { WorkoutStage } from "@/ui/workout-visuals";
import { SupersetAdaptationNotice } from "@/ui/superset-adaptation-notice";

export function ProgressDashboard({ projection, onAction }: Readonly<{ projection: CanonicalProgressPresentation; onAction(action: CanonicalProgressPresentationAction): void }>) {
  if (["empty", "recoverable_error", "storage_error"].includes(projection.status)) return <ProgressUnavailable projection={projection} onAction={onAction} />;
  if (projection.status === "zero") return <ZeroProgress projection={projection} onAction={onAction} />;
  return <>
    <View style={{ gap: spacing.xs }}><Text selectable style={{ ...type.title, color: colors.text }}>{projection.title}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{projection.subtitle}</Text></View>
    {projection.overview ? <ProgressOverview projection={projection} /> : null}
    {projection.progressionHighlight ? <ProgressionHighlight projection={projection} onAction={onAction} /> : projection.status === "early" ? <EarlyHistoryNote /> : null}
    {projection.trend ? <TrendPanel projection={projection} /> : null}
    {projection.review ? <AdaptationReview projection={projection} /> : null}
    {projection.supersetAdaptation ? <SupersetAdaptationNotice presentation={projection.supersetAdaptation} /> : null}
    <RecentTraining projection={projection} onAction={onAction} />
  </>;
}

function AdaptationReview({ projection }: Readonly<{ projection: CanonicalProgressPresentation }>) {
  const review = projection.review!;
  const tone = review.applicationStatus === "applied" ? "success" as const : "accent" as const;
  return <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: review.applicationStatus === "applied" ? colors.successSoft : colors.accentSoft, borderWidth: 1, borderColor: review.applicationStatus === "applied" ? colors.success : colors.accent }}>
    <View style={{ gap: spacing.xs }}><Text style={{ ...type.label, color: review.applicationStatus === "applied" ? colors.success : colors.accent,  }}>{review.sourceLabel}</Text><Text selectable style={{ ...type.section, color: colors.text }}>{review.title}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{review.detail}</Text></View>
    <Pill label={review.statusLabel} tone={tone} />
    {review.changes.map((change) => <View key={`${change.exerciseName}:${change.before}:${change.after}`} style={{ gap: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.lineSoft }}><Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{change.exerciseName}</Text><View style={{ gap: spacing.xs }}><ReceiptComparison label="Before" value={change.before} /><Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ color: colors.success, fontWeight: "900" }}>↓</Text><ReceiptComparison label="Next" value={change.after} /></View><Text selectable style={{ color: colors.textMuted, fontSize: 13 }}>{change.reason}</Text></View>)}
    <DetailToggle label="Why this review?" compact><View style={{ gap: spacing.sm }}><Text selectable style={{ ...type.body, color: colors.textMuted }}>{review.evidenceSummary}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{review.sourceDetail}</Text></View></DetailToggle>
  </View>;
}

function ZeroProgress({ projection, onAction }: Readonly<{ projection: CanonicalProgressPresentation; onAction(action: CanonicalProgressPresentationAction): void }>) {
  return <>
    <View style={{ gap: spacing.xs }}><Text selectable style={{ ...type.title, color: colors.text }}>{projection.title}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{projection.subtitle}</Text></View>
    <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.lineSoft }}>
      <Text selectable style={{ ...type.section, color: colors.text }}>Your first completed workout starts the story</Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>Started or incomplete workouts are not counted. Finish valid working sets to build an honest training record.</Text>
      {projection.nextWorkout ? <View style={{ gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.lineSoft }}><Text style={{ ...type.label, color: colors.accent,  }}>Next workout</Text><Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: "900" }}>{projection.nextWorkout.title}</Text><Text selectable style={{ color: colors.textMuted, fontSize: 13 }}>{projection.nextWorkout.detail}</Text><PrimaryButton compact label={projection.nextWorkout.action.label} onPress={() => onAction(projection.nextWorkout!.action)} /></View> : null}
    </View>
  </>;
}

function ProgressOverview({ projection }: Readonly<{ projection: CanonicalProgressPresentation }>) {
  const overview = projection.overview!;
  return <WorkoutStage eyebrow="Training record" title={overview.completedSummary} detail={overview.recentConsistency} tone="neutral">
    <View style={{ gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.lineSoft }}><Text style={{ ...type.label, color: colors.accent,  }}>{overview.phase}</Text><Text selectable style={{ color: colors.text, fontSize: 16, fontWeight: "900" }}>{overview.phaseProgress}</Text></View>
    {overview.statusLabel ? <Pill label={overview.statusLabel} tone="success" /> : null}
    {overview.guidance ? <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{overview.guidance}</Text> : null}
    <DetailToggle label="How this is calculated" compact><Text selectable style={{ ...type.body, color: colors.textMuted }}>{overview.calculationDisclosure}</Text></DetailToggle>
  </WorkoutStage>;
}

function ProgressionHighlight({ projection, onAction }: Readonly<{ projection: CanonicalProgressPresentation; onAction(action: CanonicalProgressPresentationAction): void }>) {
  const highlight = projection.progressionHighlight!;
  return <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success }}>
    <View style={{ gap: spacing.xs }}><Text style={{ ...type.label, color: colors.success,  }}>Progression highlight</Text><Text selectable style={{ ...type.section, color: colors.text }}>{highlight.exerciseName}</Text><Text selectable style={{ color: colors.textMuted, fontSize: 13 }}>{highlight.label}</Text></View>
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}><Comparison label="Previous" value={highlight.previous} /><Text style={{ color: colors.success, fontWeight: "900" }}>→</Text><Comparison label="Current" value={highlight.current} /></View>
    <Text selectable style={{ color: colors.success, fontFamily: "Oswald_600SemiBold", fontSize: 16 }}>{highlight.improvement}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Open completed workout for ${highlight.exerciseName}`} onPress={() => onAction({ type: "open_history", label: "Open completed workout", sessionId: highlight.sessionId })} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.text, fontWeight: "800" }}>View completed workout</Text></Pressable>
  </View>;
}

function TrendPanel({ projection }: Readonly<{ projection: CanonicalProgressPresentation }>) {
  const trend = projection.trend!;
  const min = Math.min(...trend.observations.map((item) => item.value));
  const max = Math.max(...trend.observations.map((item) => item.value));
  const range = Math.max(1, max - min);
  return <View style={{ gap: spacing.md, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}><View style={{ flex: 1, gap: 2 }}><Text style={{ ...type.label, color: colors.accent,  }}>Trend</Text><Text selectable style={{ ...type.section, color: colors.text }}>{trend.exerciseName}</Text></View><View style={{ alignItems: "flex-end", gap: spacing.xs }}><Pill label={trend.metric === "e1rm" ? "Estimated 1RM" : trend.metric === "volume" ? "Load volume" : "Completed reps"} tone="accent" /><Text style={{ color: colors.textSubtle, fontSize: 10 }}>{trend.windowLabel}</Text></View></View>
    {trend.direction === "stable"
      ? <View accessibilityRole="image" accessibilityLabel={trend.summary} style={{ padding: spacing.md, gap: spacing.xs, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}><Text style={{ color: colors.text, fontFamily: "Oswald_600SemiBold", fontSize: 17 }}>Holding steady</Text><Text style={{ color: colors.accent, fontSize: 22, fontWeight: "900" }}>{formatValue(trend.observations[0]!.value)} {trend.unit}{trend.metric === "e1rm" ? " estimated 1RM" : ""}</Text><View style={{ height: 2, marginTop: spacing.sm, backgroundColor: colors.accent }} /></View>
      : <View accessibilityRole="image" accessibilityLabel={trend.summary} style={{ flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, height: 104, paddingTop: spacing.sm }}>{trend.observations.map((item) => <View key={item.sessionId} style={{ flex: 1, minWidth: 0, alignItems: "center", justifyContent: "flex-end", gap: spacing.xs }}><Text numberOfLines={1} style={{ color: colors.text, fontSize: 10, fontWeight: "800" }}>{formatValue(item.value)}</Text><View style={{ width: "100%", minHeight: 8, height: 28 + ((item.value - min) / range) * 44, borderRadius: radius.sm, backgroundColor: colors.accent }} /><Text style={{ color: colors.textSubtle, fontSize: 10 }}>{item.label}</Text></View>)}</View>}
    <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{trend.summary}</Text>
  </View>;
}

function RecentTraining({ projection, onAction }: Readonly<{ projection: CanonicalProgressPresentation; onAction(action: CanonicalProgressPresentationAction): void }>) {
  return <View style={{ gap: spacing.md, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.lineSoft }}><Text style={{ ...type.section, color: colors.text }}>Recent training</Text>{projection.recentTraining.map((session) => <Pressable key={session.id} accessibilityRole="button" accessibilityLabel={`${session.title}, ${session.detail}. ${session.methods.join(", ")}. View workout.`} onPress={() => onAction(session.action)} style={({ pressed }) => ({ minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.lineSoft, opacity: pressed ? 0.7 : 1 })}><View style={{ flex: 1, gap: 2 }}><Text selectable style={{ color: colors.text, fontWeight: "900" }}>{session.title}</Text><Text selectable style={{ color: colors.textMuted, fontSize: 13 }}>{session.detail}</Text>{session.methods.length ? <Text selectable style={{ color: colors.textSubtle, fontSize: 12 }}>{session.methods.join(" · ")}</Text> : null}</View><Text style={{ color: colors.accent, fontWeight: "900" }}>View workout</Text></Pressable>)}</View>;
}

function EarlyHistoryNote() { return <View style={{ padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.lineSoft }}><Text selectable style={{ ...type.section, color: colors.text }}>A useful start</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>Each completed workout adds to your training record.</Text><DetailToggle label="What counts as comparable?" compact><Text selectable style={{ ...type.body, color: colors.textMuted }}>The same exercise and loading mode, recorded in completed workouts with valid working sets.</Text></DetailToggle></View>; }

function ProgressUnavailable({ projection, onAction }: Readonly<{ projection: CanonicalProgressPresentation; onAction(action: CanonicalProgressPresentationAction): void }>) { return <><Text style={{ ...type.title, color: colors.text }}>{projection.title}</Text><EmptyActionState title={projection.attention?.title ?? (projection.status === "empty" ? "No training plan yet" : "Progress unavailable")} message={projection.attention?.detail ?? projection.subtitle} actionLabel={projection.primaryAction?.label ?? "Try again"} onPress={() => projection.primaryAction && onAction(projection.primaryAction)} /></>; }
function Comparison({ label, value }: Readonly<{ label: string; value: string }>) { return <View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.textSubtle, fontSize: 10, fontWeight: "800",  }}>{label}</Text><Text adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={{ color: colors.text, fontFamily: "Oswald_600SemiBold", fontSize: 16 }}>{value}</Text></View>; }
function ReceiptComparison({ label, value }: Readonly<{ label: string; value: string }>) { return <View style={{ gap: 2 }}><Text style={{ color: colors.textSubtle, fontSize: 10, fontWeight: "800",  }}>{label}</Text><Text selectable style={{ color: colors.text, fontFamily: "Oswald_600SemiBold", fontSize: 16 }}>{value}</Text></View>; }
function formatValue(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
