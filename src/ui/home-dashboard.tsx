import { Pressable, Text, View } from "react-native";
import type { CanonicalHomeAction, CanonicalHomePrimary, CanonicalHomeProjection } from "@/application/training/canonical-home-projection";
import { colors, livingProgrammeColors as living, radius, shellTokens, spacing, type } from "@/ui/theme";
import { stableUiIdentifier } from "@/ui/primitives";
import { SupersetAdaptationNotice } from "@/ui/superset-adaptation-notice";

type StartupStatus = "idle" | "restoring" | "ready" | "delayed" | "error" | "conflict" | "offline";

export function HomeDashboard({ projection, onAction, startup }: Readonly<{
  projection: CanonicalHomeProjection;
  onAction(action: CanonicalHomeAction): void;
  startup?: Readonly<{ status: StartupStatus; onRetry(): void }>;
}>) {
  const prep = projection.actions.find((action) => action.type === "open_session_prep");
  return <View style={{ gap: spacing.lg, paddingBottom: spacing.xl }}>
    <TodayHeader projection={projection} />
    {startup && startup.status !== "ready" && startup.status !== "idle" ? <StartupNotice status={startup.status} onRetry={startup.onRetry} /> : null}
    {projection.primary ? <Objective primary={projection.primary} projection={projection} onAction={onAction} prep={prep} /> : null}
    {projection.supersetAdaptation ? <SupersetAdaptationNotice presentation={projection.supersetAdaptation} compact /> : null}
    {projection.programme ? <ProgrammePosition projection={projection} /> : null}
    {projection.attention && !projection.primary ? <EvidenceNotice projection={projection} onAction={onAction} /> : null}
    {projection.conditioning ? <FlatSection eyebrow="Next support work" title={projection.conditioning.title} detail={`${projection.conditioning.detail} · ${projection.conditioning.placement}`} /> : null}
    {projection.recent ? <FlatSection eyebrow="Recent work" title={projection.recent.title} detail={projection.recent.detail} /> : null}
    {projection.status === "ready" && projection.progress.reviewAvailable ? <ProgressLink projection={projection} onAction={onAction} /> : null}
  </View>;
}

export function HomeGreeting({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) { return <TodayHeader projection={projection} />; }

function TodayHeader({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  const week = projection.programme?.microcycle;
  return <View style={{ gap: 6, paddingTop: spacing.xs }}>
    <Text style={{ color: living.action, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" }}>{week ? `Today · ${week}` : "Today"}</Text>
    <Text accessibilityRole="header" style={{ color: living.text, fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.5 }}>{projection.greeting.title}</Text>
    <Text style={{ ...type.body, color: living.muted }}>{projection.greeting.subtitle}</Text>
  </View>;
}

function StartupNotice({ status, onRetry }: Readonly<{ status: StartupStatus; onRetry(): void }>) {
  const content = status === "offline"
    ? { eyebrow: "Offline · local-first", title: "Your saved training is available", detail: "New work stays on this device and will sync when you reconnect." }
    : status === "restoring"
      ? { eyebrow: "Restoring in background", title: "Your local programme is ready", detail: "Account history and settings are being checked without blocking Today." }
      : status === "conflict"
        ? { eyebrow: "Account conflict", title: "Remote training is not being merged", detail: "This device contains training owned by another account. Nothing has been overwritten." }
        : { eyebrow: status === "delayed" ? "Restore delayed" : "Cloud restore paused", title: "Your local training remains safe", detail: "The account check did not finish. Continue locally or retry when your connection is stable." };
  const needsRetry = status === "delayed" || status === "error";
  return <View accessibilityRole="summary" style={{ gap: 5, paddingVertical: spacing.sm, paddingLeft: spacing.md, borderLeftWidth: 3, borderLeftColor: status === "conflict" ? living.risk : living.action }}>
    <Text style={{ color: status === "conflict" ? living.risk : living.action, fontSize: 10, lineHeight: 14, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" }}>{content.eyebrow}</Text>
    <Text style={{ color: living.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>{content.title}</Text>
    <Text style={{ color: living.muted, fontSize: 13, lineHeight: 19 }}>{content.detail}</Text>
    {needsRetry ? <Pressable accessibilityRole="button" accessibilityLabel="Retry account restore" onPress={onRetry} style={{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center" }}><Text style={{ color: living.action, fontWeight: "900" }}>Retry account restore →</Text></Pressable> : null}
  </View>;
}

export function HomeNextAction({ primary, onAction }: Readonly<{ primary: CanonicalHomePrimary; onAction(action: CanonicalHomeAction): void }>) {
  return <Objective primary={primary} projection={null} onAction={onAction} />;
}

function Objective({ primary, projection, onAction, prep }: Readonly<{ primary: CanonicalHomePrimary; projection: CanonicalHomeProjection | null; onAction(action: CanonicalHomeAction): void; prep?: CanonicalHomeAction }>) {
  const actionable = primary.kind === "planned" || primary.kind === "active";
  const decision = projection?.supersetAdaptation?.state === "applied"
    ? { title: "Your next prescription was updated", detail: "The applied coaching change is recorded below.", tone: living.complete }
    : projection?.attention && projection.attention.tone === "warning"
    ? { title: projection.attention.title, detail: projection.attention.detail, tone: living.attention }
    : primary.kind === "active"
      ? { title: "Your completed work is preserved", detail: "Continue from the exact saved workout position.", tone: living.action }
      : primary.kind === "completed_today"
        ? { title: "Today’s work is saved", detail: "Review progress or preview what comes next.", tone: living.complete }
        : primary.kind === "rest_day"
          ? { title: "Recovery supports the next session", detail: primary.detail, tone: living.complete }
          : { title: "No coaching change recorded", detail: "Review the prescribed session before you begin.", tone: living.action };
  return <View style={{ padding: spacing.lg, gap: spacing.md, borderRadius: radius.xl, backgroundColor: living.actionSoft, borderWidth: 1, borderColor: "#344232" }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
      <Text style={{ flex: 1, color: living.action, fontSize: 11, lineHeight: 15, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" }}>{primary.eyebrow}</Text>
      {primary.workout?.estimatedDurationMinutes ? <Text style={{ color: living.muted, fontSize: 12 }}>{primary.workout.estimatedDurationMinutes} min</Text> : null}
    </View>
    <View style={{ gap: 6 }}>
      <Text style={{ color: living.text, fontSize: 30, lineHeight: 34, fontWeight: "900", letterSpacing: -0.8 }}>{primary.title}</Text>
      <Text style={{ color: living.text, fontSize: 15, lineHeight: 22 }}>{primary.workout?.purpose ?? primary.detail}</Text>
    </View>
    {primary.workout ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}><Metric label="exercises" value={String(primary.workout.exerciseCount)} /><Metric label="work sets" value={String(primary.workout.workingSetCount)} />{primary.workout.completedSetCount ? <Metric label="complete" value={`${primary.workout.completedSetCount}/${primary.workout.workingSetCount}`} /> : null}</View> : null}
    <View style={{ paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "#354036", gap: 4 }}>
      <Text style={{ color: decision.tone, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>{decision.title}</Text>
      <Text style={{ color: living.muted, fontSize: 13, lineHeight: 19 }}>{decision.detail}</Text>
    </View>
    {primary.action && primary.ctaLabel ? <DominantAction label={primary.ctaLabel} onPress={() => onAction(primary.action!)} emphasized={actionable} /> : null}
    {prep && primary.kind === "planned" ? <Pressable testID="today-session-prep" accessibilityRole="button" accessibilityLabel="Prepare for this session" onPress={() => onAction(prep)} style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}><Text style={{ color: living.action, fontSize: 14, fontWeight: "900" }}>Prepare for this session</Text></Pressable> : null}
  </View>;
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) { return <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, paddingVertical: 5, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: living.surfaceRaised }}><Text style={{ color: living.text, fontWeight: "900" }}>{value}</Text><Text style={{ color: living.muted, fontSize: 11 }}>{label}</Text></View>; }

export function HomeProgrammePosition({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) { return <ProgrammePosition projection={projection} />; }
function ProgrammePosition({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) {
  const programme = projection.programme!;
  const count = Math.max(0, Number(programme.completionLabel.match(/^\d+/)?.[0] ?? 0));
  const total = Math.max(1, count, Number(programme.completionLabel.match(/of (\d+)/)?.[1] ?? 1));
  return <View style={{ gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: living.line }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}><View style={{ flex: 1, gap: 4 }}><Text style={{ color: living.action, fontSize: 10, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" }}>Programme position</Text><Text style={{ color: living.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>{programme.goal}</Text><Text style={{ color: living.muted, fontSize: 13, lineHeight: 19 }}>{programme.phase} · {programme.sessionPosition}</Text></View><Text style={{ color: living.text, fontSize: 28, fontWeight: "900" }}>{programme.microcycle.replace("Week ", "W")}</Text></View>
    <View accessibilityRole="progressbar" accessibilityLabel={programme.completionLabel} style={{ flexDirection: "row", gap: 6 }}>{Array.from({ length: total }, (_, index) => <View key={index} style={{ flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: index < count ? living.complete : index === count ? living.action : living.line }} />)}</View>
    <Text style={{ color: living.muted, fontSize: 12 }}>{programme.completionLabel}</Text>
  </View>;
}

export function HomeAttention({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) { return <EvidenceNotice projection={projection} onAction={onAction} />; }
function EvidenceNotice({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) {
  const attention = projection.attention!;
  return <View style={{ gap: 6, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: living.line }}><Text style={{ color: attention.tone === "warning" ? living.attention : living.action, fontSize: 10, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" }}>Coaching evidence</Text><Text style={{ ...type.section, color: living.text }}>{attention.title}</Text><Text style={{ ...type.body, color: living.muted }}>{attention.detail}</Text>{attention.action ? <Pressable accessibilityRole="button" onPress={() => onAction(attention.action!)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: living.action, fontWeight: "900" }}>Review evidence →</Text></Pressable> : null}</View>;
}

export function HomeProgressSnapshot({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) { return <ProgressLink projection={projection} onAction={onAction} />; }
function ProgressLink({ projection, onAction }: Readonly<{ projection: CanonicalHomeProjection; onAction(action: CanonicalHomeAction): void }>) { const action = projection.actions.find((candidate) => candidate.type === "open_progress"); return <Pressable accessibilityRole="button" accessibilityLabel="View training progress" disabled={!action} onPress={() => action && onAction(action)} style={{ minHeight: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: living.line }}><View style={{ flex: 1, gap: 3 }}><Text style={{ color: living.action, fontSize: 10, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" }}>Progress</Text><Text style={{ color: living.text, fontSize: 15, lineHeight: 21, fontWeight: "800" }}>{projection.progress.headline}</Text></View><Text style={{ color: living.action, fontSize: 22 }}>→</Text></Pressable>; }

export function HomeZeroHistory({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) { return <FlatSection eyebrow="Progress" title="Your training record starts here" detail={projection.progress.headline} />; }
export function HomeRecentWork({ projection }: Readonly<{ projection: CanonicalHomeProjection }>) { return <FlatSection eyebrow="Recent work" title={projection.recent!.title} detail={projection.recent!.detail} />; }
function FlatSection({ eyebrow, title, detail }: Readonly<{ eyebrow: string; title: string; detail: string }>) { return <View style={{ gap: 5, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: living.line }}><Text style={{ color: living.action, fontSize: 10, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" }}>{eyebrow}</Text><Text style={{ color: living.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>{title}</Text><Text style={{ color: living.muted, fontSize: 13, lineHeight: 19 }}>{detail}</Text></View>; }

function DominantAction({ label, onPress, emphasized }: Readonly<{ label: string; onPress(): void; emphasized: boolean }>) { return <Pressable testID={stableUiIdentifier("action", label)} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: radius.lg, backgroundColor: emphasized ? pressed ? living.actionPressed : living.action : living.surfaceRaised, paddingHorizontal: spacing.lg, opacity: pressed ? 0.9 : 1 })}><Text style={{ flex: 1, color: emphasized ? living.canvas : living.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }}>{label}</Text><Text style={{ color: emphasized ? living.canvas : living.action, fontSize: 20 }}>→</Text></Pressable>; }
