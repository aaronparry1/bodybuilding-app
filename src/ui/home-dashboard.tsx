import { Pressable, Text, View } from "react-native";
import type { CanonicalHomeAction, CanonicalHomePrimary, CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { colors, radius, shellTokens, spacing, type } from "@/ui/theme";
import { stableUiIdentifier } from "@/ui/primitives";

export function HomeDashboard({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) {
  return <View style={{ gap: shellTokens.sectionGap }}>
    <HomeGreeting projection={projection} />
    {projection.primary ? <HomeNextAction primary={projection.primary} onAction={onAction} /> : null}
    {projection.programme ? <HomeProgrammePosition projection={projection} /> : null}
    {projection.conditioning ? <DashboardSection eyebrow="Conditioning" title={projection.conditioning.title}><Text style={{ ...type.body, color: colors.text }}>{projection.conditioning.detail}</Text><Text style={{ color: colors.textMuted, fontSize: 13 }}>{projection.conditioning.placement}</Text></DashboardSection> : null}
    {projection.status === "ready" && !projection.progress.reviewAvailable ? <HomeZeroHistory projection={projection} /> : null}
    {projection.attention ? <HomeAttention projection={projection} onAction={onAction} /> : null}
    {projection.status === "ready" && projection.progress.reviewAvailable ? <HomeProgressSnapshot projection={projection} onAction={onAction} /> : null}
    {projection.recent ? <HomeRecentWork projection={projection} /> : null}
  </View>;
}

export function HomeGreeting({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  return <View style={{ gap: spacing.xs, paddingTop: spacing.xs }}>
    <Text accessibilityRole="header" style={{ ...type.title, color: colors.text }}>{projection.greeting.title}</Text>
    <Text style={{ ...type.body, color: colors.textMuted }}>{projection.greeting.subtitle}</Text>
  </View>;
}

export function HomeNextAction({ primary, onAction }: Readonly<{ primary: CanonicalHomePrimary; onAction(action: CanonicalHomeAction): void }>) {
  const active = primary.kind === "active";
  const completed = primary.kind === "completed_today";
  return <View style={{ overflow: "hidden", borderRadius: radius.xl, borderCurve: "continuous", borderWidth: 1, borderColor: completed ? colors.success : active ? colors.accent : colors.line, backgroundColor: completed ? colors.successSoft : active ? colors.accentSoft : colors.surface }}>
    <View style={{ height: 3, backgroundColor: completed ? colors.success : colors.accent }} />
    <View style={{ paddingHorizontal: shellTokens.cardPadding, paddingTop: spacing.md, paddingBottom: shellTokens.cardPadding, gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...type.label, color: completed ? colors.success : colors.accent, textTransform: "uppercase", letterSpacing: 0.8 }}>{primary.eyebrow}</Text>
        <Text style={{ ...type.section, fontSize: 22, lineHeight: 27, color: colors.text }}>{primary.title}</Text>
        <Text style={{ ...type.body, color: colors.textMuted }}>{primary.detail}</Text>
      </View>
      {primary.workout ? <WorkoutAtAGlance primary={primary} /> : null}
      {primary.action && primary.ctaLabel ? <DashboardAction label={primary.ctaLabel} onPress={() => onAction(primary.action!)} emphasized={active || primary.kind === "planned"} /> : null}
    </View>
  </View>;
}

function WorkoutAtAGlance({ primary }: Readonly<{ primary: CanonicalHomePrimary }>) {
  const workout = primary.workout!;
  const remainingExercises = Math.max(0, workout.exerciseCount - workout.exercisePreview.length);
  return <View style={{ gap: spacing.md }}>
    {workout.lifecycle === "active" || workout.lifecycle === "paused" ? <View accessibilityRole="progressbar" accessibilityLabel={`${workout.progressPercent}% of working sets complete`} style={{ height: 4, borderRadius: radius.pill, overflow: "hidden", backgroundColor: colors.backgroundElevated }}><View style={{ width: `${workout.progressPercent}%`, height: "100%", backgroundColor: colors.accent }} /></View> : null}
    <View style={{ flexDirection: "row", gap: spacing.sm }}>
      <Metric label="Exercises" value={String(workout.exerciseCount)} />
      <Metric label={workout.completedSetCount ? "Working sets completed" : "Current session working sets"} value={workout.completedSetCount ? `${workout.completedSetCount}/${workout.workingSetCount}` : String(workout.workingSetCount)} />
      <Metric label="Estimate" value={workout.estimatedDurationMinutes ? `${workout.estimatedDurationMinutes}m` : "—"} />
    </View>
    {workout.exercisePreview.length ? <Text numberOfLines={2} style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{workout.exercisePreview.join(" · ")}{remainingExercises ? ` · +${remainingExercises} more` : ""}</Text> : null}
    {workout.methodPreview.length ? <Text numberOfLines={2} style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 18 }}>Methods: {workout.methodPreview.join(" · ")}</Text> : null}
  </View>;
}

export function HomeProgrammePosition({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  const programme = projection.programme!;
  return <DashboardSection eyebrow="Programme position" title={programme.goal}>
    <View style={{ gap: spacing.sm }}>
      <Text style={{ ...type.body, color: colors.text }}>{programme.phase}</Text>
      <View style={{ flexDirection: "row", gap: spacing.sm }}><Pill text={programme.microcycle} /><Pill text={programme.sessionPosition} /></View>
      <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{programme.completionLabel}</Text>
    </View>
  </DashboardSection>;
}

export function HomeZeroHistory({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  return <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
    <View style={{ width: 3, alignSelf: "stretch", borderRadius: radius.pill, backgroundColor: colors.accent }} />
    <Text style={{ flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>{projection.progress.headline}</Text>
  </View>;
}

export function HomeProgressSnapshot({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) {
  const action = projection.actions.find((candidate) => candidate.type === "open_progress");
  return <DashboardSection eyebrow="Progress" title={projection.progress.headline}>
    <View style={{ gap: spacing.md }}>
      <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>Your completed training evidence is ready to review.</Text>
      {action ? <DashboardAction label="View Progress" onPress={() => onAction(action)} /> : null}
    </View>
  </DashboardSection>;
}

export function HomeAttention({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) {
  const attention = projection.attention!;
  return <View style={{ padding: shellTokens.cardPadding, gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: attention.tone === "warning" ? colors.warning : colors.line, backgroundColor: attention.tone === "warning" ? colors.warningSoft : colors.surfaceMuted }}>
    <Text style={{ ...type.section, color: colors.text }}>{attention.title}</Text>
    <Text style={{ ...type.body, color: colors.textMuted }}>{attention.detail}</Text>
    {attention.action ? <DashboardAction label={attention.action.type === "retry_storage" ? "Retry" : attention.action.type === "setup_plan" ? "Set up training" : "Review Progress"} onPress={() => onAction(attention.action!)} /> : null}
  </View>;
}

export function HomeRecentWork({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  const recent = projection.recent!;
  return <DashboardSection eyebrow="Recent work" title={recent.title}>
    <Text style={{ ...type.body, color: colors.textMuted }}>{recent.detail}</Text>
  </DashboardSection>;
}

function DashboardSection({ eyebrow, title, children }: Readonly<{ eyebrow: string; title: string; children: React.ReactNode }>) {
  return <View style={{ paddingTop: spacing.lg, gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
    <View style={{ gap: spacing.xs }}><Text style={{ ...type.label, color: colors.accent, textTransform: "uppercase", letterSpacing: 0.7 }}>{eyebrow}</Text><Text style={{ ...type.section, color: colors.text }}>{title}</Text></View>
    {children}
  </View>;
}

function DashboardAction({ label, onPress, emphasized = false }: Readonly<{ label: string; onPress(): void; emphasized?: boolean }>) {
  return <Pressable testID={stableUiIdentifier("action", label)} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ minHeight: shellTokens.controlMinHeight, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderCurve: "continuous", borderWidth: 1, borderColor: emphasized || pressed ? colors.accent : colors.line, backgroundColor: emphasized ? pressed ? colors.accentPressed : colors.accent : pressed ? colors.accentSoft : colors.surfaceMuted, paddingHorizontal: spacing.lg, opacity: pressed ? 0.86 : 1 })}>
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={{ color: emphasized ? colors.background : colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900" }}>{label}</Text>
  </Pressable>;
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return <View style={{ flex: 1, minWidth: 0, paddingHorizontal: spacing.sm, paddingVertical: 7, gap: 1, borderRadius: radius.md, backgroundColor: colors.backgroundElevated }}><Text numberOfLines={1} style={{ color: colors.text, fontSize: 18, lineHeight: 22, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{value}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={{ color: colors.textSubtle, fontSize: 10, lineHeight: 13, fontWeight: "800", textTransform: "uppercase" }}>{label}</Text></View>;
}

function Pill({ text }: Readonly<{ text: string }>) {
  return <View style={{ flexShrink: 1, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={{ color: colors.textMuted, fontSize: 11, lineHeight: 14, fontWeight: "800" }}>{text}</Text></View>;
}
