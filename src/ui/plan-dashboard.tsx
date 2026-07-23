import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
import type { CanonicalPlanPresentation, CanonicalPlanPresentationAction, CanonicalPlanSessionPresentation, CanonicalPlanSessionStatus } from "@/application/training/canonical-plan-presentation";
import { DetailToggle, EmptyActionState, Pill, PrimaryButton, stableUiIdentifier } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

export function PlanDashboard({ projection, selectedSessionId, onSelectSession, onAction, guideAction }: Readonly<{
  projection: CanonicalPlanPresentation;
  selectedSessionId: string | null;
  onSelectSession(sessionId: string | null): void;
  onAction(action: CanonicalPlanPresentationAction): void;
  guideAction?: React.ReactNode;
}>) {
  if (projection.status !== "ready") return <PlanUnavailable projection={projection} onAction={onAction} />;
  const selected = projection.schedule.find((session) => session.id === selectedSessionId) ?? null;
  return <>
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text selectable maxFontSizeMultiplier={2} style={{ ...type.title, color: colors.text }}>Plan</Text>
        <Text selectable maxFontSizeMultiplier={2} style={{ ...type.body, color: colors.textMuted }}>{projection.subtitle}</Text>
      </View>
      {guideAction}
    </View>
    {projection.programme ? <ProgrammeContext projection={projection} /> : null}
    {projection.primaryAction ? <PrimaryButton label={projection.primaryAction.label} onPress={() => onAction(projection.primaryAction!)} /> : null}
    <View style={{ gap: spacing.md }}>
      <SectionHeading title="This week" detail={`${projection.schedule.length} sessions`} />
      {projection.schedule.map((session) => <SessionRow key={session.id} session={session} selected={selected?.id === session.id} onPress={() => onSelectSession(selected?.id === session.id ? null : session.id)} />)}
    </View>
    {projection.conditioning.length ? <View style={{ gap: spacing.md }}><SectionHeading title="Cardio & conditioning" detail={`${projection.conditioning.length} planned`} />{projection.conditioning.map((session) => <View key={session.id} style={{ padding: spacing.md, gap: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.lineSoft }}><Text style={{ ...type.label, color: colors.accent }}>{session.dayLabel}</Text><Text style={{ color: colors.text, fontSize: 16, fontWeight: "900" }}>{session.title}</Text><Text style={{ color: colors.textMuted }}>{session.prescription}</Text><Text style={{ color: colors.textSubtle, fontSize: 12 }}>{session.placement}</Text></View>)}</View> : null}
    {selected ? <SessionPreview session={selected} onClose={() => onSelectSession(null)} /> : null}
    <PhaseRoadmap projection={projection} />
  </>;
}

function ProgrammeContext({ projection }: Readonly<{ projection: CanonicalPlanPresentation }>) {
  const programme = projection.programme!;
  return <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.lineSoft }}>
    <View style={{ gap: spacing.xs }}>
      <Text maxFontSizeMultiplier={2} style={{ ...type.label, color: colors.accent, textTransform: "uppercase", letterSpacing: 0.7 }}>{programme.focus}</Text>
      <Text selectable maxFontSizeMultiplier={2} style={{ ...type.display, color: colors.text }}>{programme.phase}</Text>
      <Text selectable maxFontSizeMultiplier={2} style={{ ...type.body, color: colors.textMuted }}>{programme.phasePurpose}</Text>
    </View>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md }}>
      <Pill label={programme.week} tone="accent" />
      <Text selectable maxFontSizeMultiplier={2} style={{ color: colors.textMuted, fontSize: 13, fontWeight: "700", textAlign: "right", flex: 1 }}>{programme.progressLabel}</Text>
    </View>
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: programme.progressPercent }} style={{ height: 4, borderRadius: radius.pill, backgroundColor: colors.lineSoft, overflow: "hidden" }}>
      <View style={{ height: "100%", width: `${programme.progressPercent}%`, borderRadius: radius.pill, backgroundColor: colors.accent }} />
    </View>
  </View>;
}

function SessionRow({ session, selected, onPress }: Readonly<{ session: CanonicalPlanSessionPresentation; selected: boolean; onPress(): void }>) {
  const tone = session.status === "completed" ? colors.success : session.status === "active" || session.status === "paused" || session.status === "next" ? colors.accent : colors.textSubtle;
  return <Pressable testID={stableUiIdentifier("action", `plan-session-${session.programmePosition}`)} accessibilityRole="button" accessibilityLabel={`${session.dayLabel}, ${session.name}, ${session.statusLabel}. Open workout preview.`} accessibilityState={{ expanded: selected }} onPress={onPress} style={({ pressed }) => ({ padding: spacing.md, gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: selected ? tone : colors.lineSoft, backgroundColor: pressed || selected ? colors.surfaceSoft : colors.surfaceMuted, opacity: pressed ? 0.86 : 1 })}>
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
      <View style={{ width: 28, height: 28, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: session.status === "completed" ? colors.successSoft : session.status === "upcoming" ? colors.backgroundElevated : colors.accentSoft }}><StatusIcon status={session.status} color={tone} /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
          <Text selectable maxFontSizeMultiplier={2} style={{ color: colors.textSubtle, fontSize: 11, fontWeight: "800", textTransform: "uppercase" }}>{session.dayLabel}</Text>
          <Text selectable maxFontSizeMultiplier={2} style={{ color: tone, fontSize: 11, fontWeight: "900" }}>{session.statusLabel}</Text>
        </View>
        <Text selectable maxFontSizeMultiplier={2} style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>{session.name}</Text>
        <Text selectable maxFontSizeMultiplier={2} style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{session.purpose}</Text>
      </View>
    </View>
    <Text selectable maxFontSizeMultiplier={2} style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>{session.emphasis}</Text>
    <View style={{ flexDirection: "row", gap: spacing.md }}>
      <SessionMeta value={`${session.exerciseCount}`} label="exercises" />
      <SessionMeta value={`${session.workingSetCount}`} label="work sets" />
      <SessionMeta value={session.estimatedDurationMinutes ? `${session.estimatedDurationMinutes}m` : "—"} label="estimate" />
    </View>
  </Pressable>;
}

function SessionPreview({ session, onClose }: Readonly<{ session: CanonicalPlanSessionPresentation; onClose(): void }>) {
  return <View style={{ gap: spacing.lg, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.md }}>
      <View style={{ flex: 1, gap: spacing.xs }}><Text testID="plan-workout-preview" style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>Workout preview</Text><Text selectable style={{ ...type.section, color: colors.text }}>{session.preview.title}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{session.preview.purpose}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Close workout preview" onPress={onClose} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line }}><SymbolView name={{ ios: "xmark", android: "close", web: "close" }} size={17} tintColor={colors.text} /></Pressable>
    </View>
    {session.preview.exercises.map((exercise) => <View key={exercise.id} style={{ gap: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}><Text style={{ color: colors.accent, fontWeight: "900" }}>{exercise.order}</Text><View style={{ flex: 1, gap: 2 }}><Text selectable style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{exercise.name}</Text><Text selectable style={{ color: colors.textSubtle, fontSize: 12 }}>{exercise.method} · {exercise.loadState}</Text></View></View>
      {exercise.sets.map((set) => <View key={`${exercise.id}:${set.number}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm, paddingLeft: spacing.xl }}><Text selectable style={{ color: colors.textMuted, fontSize: 12 }}>Set {set.number} · {set.target}</Text><Text selectable style={{ color: colors.text, fontSize: 12, fontWeight: "800", textAlign: "right" }}>{set.loadLabel} · {set.restSeconds}s rest</Text></View>)}
    </View>)}
    <Text style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>Preview only. Opening or closing this view does not start the workout.</Text>
  </View>;
}

function PhaseRoadmap({ projection }: Readonly<{ projection: CanonicalPlanPresentation }>) {
  return <View style={{ gap: spacing.md, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
    <SectionHeading title="Programme direction" detail="Reviewed, not guaranteed" />
    {projection.roadmap.map((item) => <View key={`${item.state}:${item.title}`} style={{ flexDirection: "row", gap: spacing.md }}><View style={{ width: 3, borderRadius: radius.pill, backgroundColor: item.state === "completed" ? colors.success : item.state === "current" ? colors.accent : colors.line }} /><View style={{ flex: 1, gap: 3 }}><Text style={{ ...type.label, color: item.state === "completed" ? colors.success : item.state === "current" ? colors.accent : colors.textSubtle, textTransform: "uppercase" }}>{item.label}</Text><Text selectable style={{ color: colors.text, fontWeight: "900" }}>{item.title}</Text><Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>{item.detail}</Text></View></View>)}
    {projection.phaseRationale ? <DetailToggle label="Why this direction?" compact><Text selectable style={{ ...type.body, color: colors.textMuted }}>{projection.phaseRationale}</Text></DetailToggle> : null}
  </View>;
}

function PlanUnavailable({ projection, onAction }: Readonly<{ projection: CanonicalPlanPresentation; onAction(action: CanonicalPlanPresentationAction): void }>) {
  if (projection.status === "empty") return <><Text style={{ ...type.title, color: colors.text }}>{projection.title}</Text><EmptyActionState title="No plan yet" message={projection.subtitle} actionLabel={projection.primaryAction?.label ?? "Set up training"} onPress={() => projection.primaryAction && onAction(projection.primaryAction)} /></>;
  return <><Text style={{ ...type.title, color: colors.text }}>{projection.title}</Text><View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: projection.status === "generating" ? colors.line : colors.warning, backgroundColor: projection.status === "generating" ? colors.surfaceMuted : colors.warningSoft }}><Text selectable style={{ ...type.section, color: colors.text }}>{projection.attention?.title ?? projection.title}</Text><Text selectable style={{ ...type.body, color: colors.textMuted }}>{projection.attention?.detail ?? projection.subtitle}</Text>{projection.primaryAction ? <PrimaryButton label={projection.primaryAction.label} onPress={() => onAction(projection.primaryAction!)} /> : null}</View></>;
}

function StatusIcon({ status, color }: Readonly<{ status: CanonicalPlanSessionStatus; color: string }>) {
  const names: Record<CanonicalPlanSessionStatus, SymbolViewProps["name"]> = {
    completed: { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" },
    active: { ios: "play.circle.fill", android: "play_circle", web: "play_circle" },
    paused: { ios: "pause.circle.fill", android: "pause_circle", web: "pause_circle" },
    next: { ios: "arrow.right.circle.fill", android: "arrow_circle_right", web: "arrow_circle_right" },
    upcoming: { ios: "circle", android: "radio_button_unchecked", web: "radio_button_unchecked" },
  };
  return <SymbolView name={names[status]} size={18} tintColor={color} weight="semibold" />;
}

function SessionMeta({ value, label }: Readonly<{ value: string; label: string }>) { return <View style={{ flex: 1, gap: 1 }}><Text maxFontSizeMultiplier={2} style={{ color: colors.text, fontSize: 14, fontWeight: "900" }}>{value}</Text><Text maxFontSizeMultiplier={2} style={{ color: colors.textSubtle, fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>{label}</Text></View>; }
function SectionHeading({ title, detail }: Readonly<{ title: string; detail: string }>) { return <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: spacing.md }}><Text maxFontSizeMultiplier={2} style={{ ...type.section, color: colors.text }}>{title}</Text><Text maxFontSizeMultiplier={2} style={{ color: colors.textSubtle, fontSize: 11, textAlign: "right" }}>{detail}</Text></View>; }
