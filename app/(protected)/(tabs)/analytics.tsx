import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { PremiumRequiredScreen, usePremiumAccess } from "@/application/billing/premium-access";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { customExerciseRepository } from "@/data/local/custom-exercise-repository";
import { workoutHistoryRepository } from "@/data/local/workout-history-repository";
import { buildAdvancedReports, type AdvancedReports } from "@/domain/training/advanced-reporting";
import { buildAnalyticsPlanningContext } from "@/domain/training/analytics-planning-context";
import { buildProgressDashboardViewModel } from "@/domain/training/progress-dashboard";
import { buildPowerliftingTotalSharePayload, buildPrSharePayload, buildStrengthProgressSharePayload, type BrandedSharePayload } from "@/domain/training/share-cards";
import { buildStrengthDashboard, type StrengthDashboard, type StrengthLiftDashboardItem, type StrengthPrItem } from "@/domain/training/strength-dashboard";
import { summarizeWorkoutHistory } from "@/domain/training/workout-history";
import { BrandedShareCardPreviewModal } from "@/features/social-sharing/branded-share-card-preview";
import {
  AppScreen,
  DetailToggle,
  EmptyActionState,
  HeroPanel,
  PremiumCard,
  RowItem,
  SectionList,
  SecondaryButton,
} from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function ProgressScreen() {
  const hasPremiumAccess = usePremiumAccess();
  if (!hasPremiumAccess) {
    return (
      <PremiumRequiredScreen
        title="Unlock your progress dashboard"
        message="Start a 14-day free trial to unlock Strength Dashboard, e1RM tracking, PR history, advanced reports, Recovery & Capacity, and share cards."
      />
    );
  }

  return <ProgressContent />;
}

function ProgressContent() {
  const [sessions, setSessions] = useState(() => workoutHistoryRepository.listCompletedSessions());
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const [sharePayload, setSharePayload] = useState<BrandedSharePayload | null>(null);
  const exercises = customExerciseRepository.listAll();

  useEffect(
    () =>
      workoutHistoryRepository.subscribe(() => {
        setSessions(workoutHistoryRepository.listCompletedSessions());
      }),
    [],
  );
  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);

  const history = useMemo(() => summarizeWorkoutHistory(sessions), [sessions]);
  const progress = useMemo(() => buildProgressDashboardViewModel(history, exercises, activePlan), [activePlan, exercises, history]);
  const strengthDashboard = useMemo(() => buildStrengthDashboard({ sessions, goal: activePlan?.goal }), [activePlan?.goal, sessions]);
  const analyticsContext = useMemo(() => buildAnalyticsPlanningContext({ activePlan }), [activePlan]);
  const reports = useMemo(
    () => buildAdvancedReports({ sessions, history, exercises, activePlan }),
    [activePlan, exercises, history, sessions],
  );

  return (
    <AppScreen>
      <HeroPanel
        eyebrow="Progress"
        title="Is training working?"
        subtitle="A simple verdict from your logged workouts."
      />

      <AnalyticsPlanningContextCard context={analyticsContext} />

      <StrengthDashboardSection dashboard={strengthDashboard} onShare={setSharePayload} />

      <AdvancedReportsSection reports={reports} />

      <SectionList title="Coach verdict">
        {!progress.hasEnoughHistory ? (
          <EmptyActionState title="Log 3-5 workouts first" message={progress.emptyMessage} />
        ) : (
          <PremiumCard tone="quiet">
            <View style={{ gap: spacing.sm }}>
              <Text selectable style={{ color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: "900" }}>
                {progress.verdictTitle}
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {progress.verdictMessage}
              </Text>
            </View>
          </PremiumCard>
        )}
      </SectionList>

      <SectionList title="What to do next">
        <PremiumCard tone={progress.hasEnoughHistory ? "locked" : "quiet"}>
          <Text selectable style={{ color: colors.text, fontSize: 21, lineHeight: 26, fontWeight: "900" }}>
            {progress.actionTitle}
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {progress.actionMessage}
          </Text>
          {progress.progressionNote ? (
            <DetailToggle label="Progression note" compact>
              <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                {progress.progressionNote}
              </Text>
            </DetailToggle>
          ) : null}
          {progress.volumeRecommendation ? (
            <DetailToggle label="Volume note" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                {progress.volumeRecommendation}
              </Text>
            </DetailToggle>
          ) : null}
          {progress.recoveryCapacityRecommendation ? (
            <DetailToggle label="Recovery note" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                {progress.recoveryCapacityRecommendation}
              </Text>
            </DetailToggle>
          ) : null}
          {progress.recoveryCapacityTarget ? (
            <DetailToggle label="Recovery target" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                Current target: {progress.recoveryCapacityTarget.targetLabel}
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                Completed: {progress.recoveryCapacityTarget.completedSessions} / {progress.recoveryCapacityTarget.targetSessions}
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                Recommendation: {progress.recoveryCapacityTarget.progressAction.replaceAll("_", " ")}
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                Best: {progress.recoveryCapacityTarget.timingGuidance.bestTimingGuidance.join(", ")}
              </Text>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                Avoid: {progress.recoveryCapacityTarget.timingGuidance.avoidGuidance.join(", ")}
              </Text>
            </DetailToggle>
          ) : null}
          {progress.rotationRecommendation ? (
            <DetailToggle label="Rotation note" compact>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19, fontWeight: "800" }}>
                {progress.rotationRecommendation}
              </Text>
            </DetailToggle>
          ) : null}
          <DetailToggle label="Evidence" compact>
            <EvidenceBlock evidence={progress.recommendationEvidence} />
          </DetailToggle>
          {progress.actionFlow ? (
            <View
              style={{
                gap: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.line,
                paddingTop: spacing.md,
              }}
            >
              <Text selectable style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
                {progress.actionFlow.title}
              </Text>
              <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                {progress.actionFlow.reason}
              </Text>
              <DetailToggle label="Why?" compact>
                <EvidenceBlock evidence={progress.actionFlow.evidence} />
              </DetailToggle>
              {progress.actionFlow.type === "rotation" && progress.actionFlow.replacementExerciseName ? (
                <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
                  Suggested: {progress.actionFlow.replacementExerciseName}
                </Text>
              ) : null}
              {progress.actionFlow.type === "deload" ? (
                <Link href="/(protected)/(tabs)/programmes" asChild>
                  <SecondaryButton label={progress.actionFlow.primaryLabel} onPress={() => {}} compact />
                </Link>
              ) : progress.actionFlow.type === "accepted" ? (
                <Link href="/(protected)/(tabs)/programmes" asChild>
                  <SecondaryButton label={progress.actionFlow.primaryLabel} onPress={() => {}} compact />
                </Link>
              ) : (
                <Link href="/(protected)/(tabs)/programmes" asChild>
                  <SecondaryButton label="View plan" onPress={() => {}} compact />
                </Link>
              )}
            </View>
          ) : null}
          {!progress.actionFlow ? (
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              <Link href={progress.journeyActions.primary.href as never} asChild>
                <SecondaryButton label={progress.journeyActions.primary.label} onPress={() => {}} compact />
              </Link>
              {progress.journeyActions.secondary ? (
                <SecondaryButton
                  label={progress.journeyActions.secondary.label}
                  onPress={() => Alert.alert(progress.journeyActions.secondary!.label, progress.journeyActions.secondary!.message)}
                  compact
                />
              ) : null}
            </View>
          ) : null}
        </PremiumCard>
      </SectionList>

      {progress.hasEnoughHistory && progress.recentProgress.length > 0 ? (
        <SectionList title="Recent progress">
          <PremiumCard tone="quiet">
            <View style={{ gap: spacing.sm }}>
              {progress.recentProgress.slice(0, 2).map((item) => (
                <Text key={item} selectable style={{ ...type.body, color: colors.textMuted }}>
                  {item}
                </Text>
              ))}
              {progress.recentProgress.length > 2 ? (
                <DetailToggle label="More progress" compact>
                  {progress.recentProgress.slice(2).map((item) => (
                    <Text key={item} selectable style={{ ...type.body, color: colors.textMuted }}>
                      {item}
                    </Text>
                  ))}
                </DetailToggle>
              ) : null}
            </View>
          </PremiumCard>
        </SectionList>
      ) : null}

      <SectionList
        title="Recent workouts"
        action={
          <Link href="/(protected)/history" asChild>
            <Pressable>
              <Text style={{ color: colors.accent, fontWeight: "900" }}>All</Text>
            </Pressable>
          </Link>
        }
      >
        {progress.recentWorkouts.length === 0 ? (
          <EmptyActionState title="No completed workouts" message="Finish one workout and this becomes your training memory." />
        ) : (
          progress.recentWorkouts.map((summary, index) => (
            <Link key={summary.sessionId} href={`/(protected)/history/${summary.sessionId}`} asChild>
              <Pressable>
                <RowItem
                  title={summary.name}
                  subtitle={`${summary.dateLabel} · ${summary.durationLabel}`}
                  meta={summary.workSetsLabel}
                  index={index}
                >
                  <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                    {summary.highlight}
                  </Text>
                </RowItem>
              </Pressable>
            </Link>
          ))
        )}
      </SectionList>

       <Link href="/(protected)/history" asChild>
         <SecondaryButton label="Open full history" onPress={() => {}} />
       </Link>
       <BrandedShareCardPreviewModal payload={sharePayload} onClose={() => setSharePayload(null)} />
     </AppScreen>
   );
 }

function AdvancedReportsSection({ reports }: { reports: AdvancedReports }) {
  return (
    <SectionList title="Reports">
      <View style={{ gap: spacing.sm }}>
        <ReportCard title={reports.strength.title} headline={reports.strength.headline} metric={reports.strength.keyMetric} detail={reports.strength.detail} details={[reports.strength.strongestLiftTrend, ...reports.strength.details.slice(0, 2)]} />
        <ReportCard title={reports.volume.title} headline={reports.volume.headline} metric={reports.volume.keyMetric} detail={reports.volume.detail} details={reports.volume.details} />
        <ReportCard title={reports.recovery.title} headline={reports.recovery.headline} metric={reports.recovery.keyMetric} detail={reports.recovery.detail} details={reports.recovery.details} />
        <ReportCard title={reports.consistency.title} headline={reports.consistency.headline} metric={reports.consistency.keyMetric} detail={reports.consistency.detail} details={reports.consistency.details} />
      </View>
    </SectionList>
  );
}

function AnalyticsPlanningContextCard({ context }: { context: ReturnType<typeof buildAnalyticsPlanningContext> }) {
  if (context.status === "no_plan") return null;
  if (context.status === "incomplete") {
    return (
      <SectionList title="Current training context">
        <PremiumCard tone="quiet">
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>Your current plan details are being restored.</Text>
        </PremiumCard>
      </SectionList>
    );
  }
  return (
    <SectionList title="Current training context">
      <PremiumCard tone="quiet">
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>{context.mesocyclePurpose}</Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>Microcycle {context.microcycle.number} · {context.microcycle.priority}</Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>Session role: {context.sessionRole}</Text>
        </View>
      </PremiumCard>
    </SectionList>
  );
}

function ReportCard({ title, headline, metric, detail, details }: { title: string; headline: string; metric: string; detail: string; details: string[] }) {
  return (
    <PremiumCard tone="quiet">
      <View style={{ gap: spacing.sm }}>
        <View style={{ gap: spacing.xs }}>
          <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
            {title}
          </Text>
          <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>
            {headline}
          </Text>
          <Text selectable adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.78} style={{ color: colors.text, fontSize: 26, lineHeight: 31, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
            {metric}
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {detail}
          </Text>
        </View>
        {details.length > 0 ? (
          <DetailToggle label="Details" compact>
            <View style={{ gap: spacing.xs }}>
              {details.slice(0, 5).map((item) => (
                <Text key={item} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
                  - {item}
                </Text>
              ))}
            </View>
          </DetailToggle>
        ) : null}
      </View>
    </PremiumCard>
  );
}

function StrengthDashboardSection({ dashboard, onShare }: { dashboard: StrengthDashboard; onShare(payload: BrandedSharePayload): void }) {
  const bestShareLift = [...dashboard.primaryLifts]
    .filter((lift) => lift.currentE1rm != null)
    .sort((a, b) => (b.change90Day ?? b.change30Day ?? 0) - (a.change90Day ?? a.change30Day ?? 0))[0];
  const shareStrengthProgress = () => {
    if (!bestShareLift) return;
    const payload = buildStrengthProgressSharePayload(bestShareLift);
    if (payload) onShare(payload);
  };

  return (
    <SectionList title="Strength Dashboard">
      <PremiumCard tone="quiet">
        <View style={{ gap: spacing.md }}>
          <View style={{ gap: spacing.xs }}>
            <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 27, fontWeight: "900" }}>
              Am I getting stronger?
            </Text>
            <Text selectable style={{ ...type.body, color: colors.textMuted }}>
              Conservative e1RM from completed work sets. No max testing required.
            </Text>
            {bestShareLift ? <SecondaryButton label="Share progress" onPress={shareStrengthProgress} compact /> : null}
          </View>

          {dashboard.powerliftingTotal ? <PowerliftingTotalCard dashboard={dashboard} onShare={onShare} /> : null}

          <View style={{ gap: spacing.sm }}>
            <Text selectable style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
              Recent PRs
            </Text>
            {dashboard.recentPrs.length === 0 ? (
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                No recent strength PRs yet. Log a few more completed work sets.
              </Text>
            ) : (
              <View style={{ gap: spacing.xs }}>
                {dashboard.recentPrs.map((pr) => (
                  <View key={pr.id} style={{ gap: spacing.xs }}>
                    <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                      {formatPr(pr)}
                    </Text>
                    <SecondaryButton label="Share PR" onPress={() => onShare(buildPrSharePayload(pr))} compact />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ gap: spacing.sm }}>
            {dashboard.primaryLifts.map((lift) => (
              <StrengthLiftRow key={lift.liftId} lift={lift} />
            ))}
          </View>
        </View>
      </PremiumCard>
    </SectionList>
  );
}

function PowerliftingTotalCard({ dashboard, onShare }: { dashboard: StrengthDashboard; onShare(payload: BrandedSharePayload): void }) {
  const total = dashboard.powerliftingTotal;
  if (!total) return null;
  const payload = buildPowerliftingTotalSharePayload(total);
  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm }}>
      <Text selectable style={{ ...type.label, color: colors.accent, textTransform: "uppercase" }}>
        Powerlifting Meet total
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.md, flexWrap: "wrap" }}>
        <StrengthMetric label="Current" value={formatLoadValue(total.currentTotal, total.unit)} />
        <StrengthMetric label="Best" value={formatLoadValue(total.bestTotal, total.unit)} />
        <StrengthMetric label="Change" value={formatSignedLoad(total.changeInTotal, total.unit)} />
      </View>
      {payload ? <SecondaryButton label="Share total" onPress={() => onShare(payload)} compact /> : null}
    </View>
  );
}

function StrengthLiftRow({ lift }: { lift: StrengthLiftDashboardItem }) {
  return (
    <View style={{ borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.sm }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
          <Text selectable numberOfLines={2} style={{ color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: "900", flexShrink: 1 }}>
            {lift.label}
          </Text>
          <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 17, fontWeight: "800" }}>
            Evidence: {lift.evidence}
          </Text>
        </View>
        <TrendPill trend={lift.trend} />
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
        <StrengthMetric label="Current e1RM" value={formatLoadValue(lift.currentE1rm, lift.unit)} />
        <StrengthMetric label="Best e1RM" value={formatLoadValue(lift.bestE1rm, lift.unit)} />
        <StrengthMetric label="30 days" value={formatSignedLoad(lift.change30Day, lift.unit)} />
        <StrengthMetric label="90 days" value={formatSignedLoad(lift.change90Day, lift.unit)} />
      </View>
    </View>
  );
}

function TrendPill({ trend }: { trend: StrengthLiftDashboardItem["trend"] }) {
  const label = trend === "up" ? "Up" : trend === "down" ? "Down" : "Stable";
  const color = trend === "up" ? colors.success : trend === "down" ? colors.danger : colors.textMuted;
  return (
    <View style={{ borderRadius: 999, borderWidth: 1, borderColor: color, paddingHorizontal: spacing.sm, paddingVertical: 5 }}>
      <Text selectable style={{ color, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}

function StrengthMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: 118, flex: 1, gap: 2 }}>
      <Text selectable style={{ color: colors.textSubtle, fontSize: 11, lineHeight: 15, fontWeight: "900", textTransform: "uppercase" }}>
        {label}
      </Text>
      <Text selectable adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.78} style={{ color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

function formatLoadValue(value: number | null, unit: string): string {
  return value == null ? "No data" : `${formatNumber(value)}${unit}`;
}

function formatSignedLoad(value: number | null, unit: string): string {
  if (value == null) return "No data";
  if (value === 0) return `0${unit}`;
  return `${value > 0 ? "+" : ""}${formatNumber(value)}${unit}`;
}

function formatPr(pr: StrengthPrItem): string {
  const date = new Date(pr.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (pr.type === "load") return `${date} · Load PR · ${pr.exerciseName} ${formatNumber(pr.value)}${pr.unit}`;
  if (pr.type === "rep") return `${date} · Rep PR · ${pr.exerciseName} ${pr.reps ?? pr.value} reps`;
  return `${date} · e1RM PR · ${pr.exerciseName} ${formatNumber(pr.value)}${pr.unit}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function EvidenceBlock({
  evidence,
}: {
  evidence: {
    confidence: string;
    source: string;
    summary: string;
    dataPoints: string[];
    reason: string;
    actionAllowed: boolean;
  };
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18, fontWeight: "900" }}>
        Confidence: {evidence.confidence.replaceAll("_", " ")} · Source: {evidence.source === "fixture" ? "Design QA demo data" : evidence.source.replaceAll("_", " ")}
      </Text>
      <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 18 }}>
        {evidence.summary}
      </Text>
      {evidence.dataPoints.slice(0, 4).map((point) => (
        <Text key={point} selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 17 }}>
          - {point}
        </Text>
      ))}
      {!evidence.actionAllowed ? (
        <Text selectable style={{ color: colors.accent, fontSize: 12, lineHeight: 17, fontWeight: "900" }}>
          Action locked until there is enough evidence.
        </Text>
      ) : null}
    </View>
  );
}
