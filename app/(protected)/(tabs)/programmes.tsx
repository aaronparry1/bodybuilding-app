import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { buildPlanPageViewModel } from "@/domain/training/plan-page-view-model";
import { transitionToApprovedMesocycle } from "@/domain/training/plan-setup";
import { useTrainingYear } from "@/features/training-year/use-training-year";
import { AppScreen, DetailToggle, EmptyActionState, HeroPanel, PremiumCard, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";

export default function PlanScreen() {
  const { currentBlock } = useTrainingYear();
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const [workouts, setWorkouts] = useState(() => workoutSessionRepository.list());
  const viewModel = buildPlanPageViewModel({ activePlan, currentBlock, workouts });

  useEffect(() => activeTrainingPlanRepository.subscribe(() => setActivePlan(activeTrainingPlanRepository.getOptional())), []);
  useEffect(() => workoutSessionRepository.subscribe(() => setWorkouts(workoutSessionRepository.list())), []);

  const savePlan = (nextPlan: NonNullable<typeof activePlan>) => {
    activeTrainingPlanRepository.save(nextPlan);
    setActivePlan(nextPlan);
  };

  const handleChooseMesocycle = (mesocycleId: NonNullable<typeof activePlan>["currentMesocycleId"]) => {
    if (!activePlan || !mesocycleId) return;
    const next = transitionToApprovedMesocycle(activePlan, mesocycleId);
    if (next === activePlan) return;
    savePlan(next);
    Alert.alert("Mesocycle started", "Your next approved phase and first microcycle are now active.");
  };

  return (
    <AppScreen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg }}>
        <View style={{ flex: 1 }}>
          <HeroPanel eyebrow="Plan" title="Current Plan" subtitle="What you are following, where you are, and what comes next." />
        </View>
        <TrainingSystemGuideButton />
      </View>

      {!viewModel.hasActivePlan ? (
        <EmptyActionState
          title={viewModel.emptyTitle ?? "Set up your training plan"}
          message={viewModel.emptyMessage ?? "Plan needs your setup before it can show a real structure."}
          actionLabel="Set up your training plan"
          onPress={() => router.push(viewModel.setupHref as never)}
        />
      ) : (
        <>
          <PremiumCard>
            <PlanSummaryRow label="Goal" value={viewModel.summary.goal} />
            <PlanSummaryRow label="Schedule" value={viewModel.summary.schedule} />
            <PlanSummaryRow label="Current phase" value={viewModel.summary.currentPhase} />
            <PlanSummaryRow label="Week" value={viewModel.summary.week} />
            <DetailToggle label="Plan details" compact>
              <PlanSummaryRow label="Plan style" value={viewModel.summary.planStyle} />
              <PlanSummaryRow label="Plan duration" value={viewModel.summary.planDuration} />
              <PlanSummaryRow label="Split" value={viewModel.summary.split} />
            </DetailToggle>
          </PremiumCard>

          <SectionList title="Current training week">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {viewModel.thisWeek.map((day, index) => (
                <WeekMarker key={`${day.label}-${index}`} day={day.label} active={day.status === "current"} />
              ))}
            </View>
          </SectionList>

          <SectionList title="Training Roadmap">
            <View style={{ gap: spacing.md }}>
              <RoadmapSummaryCard summary={viewModel.roadmapSummary} />
              {viewModel.roadmapStages.map((stage) => (
                <RoadmapStageCard key={stage.id} stage={stage} />
              ))}
            </View>
          </SectionList>

          <PlanningContextCard viewModel={viewModel} />

          {activePlan ? (
            <SectionList title="Approved next mesocycle states">
              <PremiumCard tone="quiet">
                <Text selectable style={{ color: colors.text, fontSize: 21, lineHeight: 26, fontWeight: "900" }}>
                  {viewModel.approvedNextMesocycles.length ? "Choose an approved next phase" : "Continue current mesocycle"}
                </Text>
                <Text selectable style={{ ...type.body, color: colors.textMuted }}>
                  {viewModel.approvedNextMesocycles.length ? "Only phase-library next states are available." : "Its minimum/maximum duration and next-state rules remain in control."}
                </Text>
                {viewModel.approvedNextMesocycles.length ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {viewModel.approvedNextMesocycles.map((mesocycle) => <SecondaryButton key={mesocycle.id} label={mesocycle.id.replaceAll("_", " ")} onPress={() => handleChooseMesocycle(mesocycle.id)} compact />)}
                  </View>
                ) : null}
              </PremiumCard>
            </SectionList>
          ) : null}
        </>
      )}

    </AppScreen>
  );
}

function PlanSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.lg, alignItems: "center" }}>
      <Text selectable style={{ ...type.label, color: colors.textSubtle }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: "900", textAlign: "right", flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

function PlanningContextCard({ viewModel }: { viewModel: ReturnType<typeof buildPlanPageViewModel> }) {
  const targets: string[] = (viewModel.openPlannedWorkout?.exercises ?? []).flatMap((exercise): string[] => {
    const exact = exercise.prescribedSetTargets ?? [];
    return exact.length ? [`${exercise.exerciseName}: ${exercise.load}${exercise.settings.unit} × ${exact.join(", ")}`] : [];
  });
  return (
    <SectionList title="Current training context">
      <PremiumCard tone="quiet">
        <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{viewModel.currentMesocyclePurpose ?? "Current training phase"}</Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>{viewModel.currentMicrocycle ? `Microcycle ${viewModel.currentMicrocycle.number} · ${viewModel.currentMicrocycle.priority}` : "Current training week"}</Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>Session role: {viewModel.currentSessionRole ?? "Planned session"}</Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>Exact targets guide each set. Valid completion earns the next approved progression step.</Text>
        <Text selectable style={{ ...type.body, color: colors.accent }}>{targets.length ? `Upcoming exact targets: ${targets.join(" · ")}` : "Exact targets appear when your next workout is generated."}</Text>
      </PremiumCard>
    </SectionList>
  );
}

function titleBlock(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function WeekMarker({ day, active }: { day: string; active: boolean }) {
  return (
    <View
      style={{
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: active ? "#5a4721" : colors.line,
        backgroundColor: active ? colors.accentSoft : colors.surfaceMuted,
        paddingHorizontal: spacing.md,
        paddingVertical: 9,
      }}
    >
      <Text selectable style={{ color: active ? colors.accent : colors.textMuted, fontSize: 13, fontWeight: "900" }}>
        {active ? "▶ " : "○ "}
        {day}
      </Text>
    </View>
  );
}

function RoadmapSummaryCard({ summary }: { summary: ReturnType<typeof buildPlanPageViewModel>["roadmapSummary"] }) {
  return (
    <PremiumCard tone="locked">
      <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 18, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0 }}>
        {summary.title}
      </Text>
      <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: "900" }}>
        {summary.currentPhase}
      </Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {summary.copy}
      </Text>
      <View style={{ gap: spacing.sm, paddingTop: spacing.xs }}>
        <PlanSummaryRow label="Current phase" value={summary.currentPhase} />
        <PlanSummaryRow label="Goal" value={summary.goal} />
      </View>
    </PremiumCard>
  );
}

function RoadmapStageCard({
  stage,
}: {
  stage: ReturnType<typeof buildPlanPageViewModel>["roadmapStages"][number];
}) {
  return (
    <PremiumCard tone={stage.blocks.some((block) => block.status === "current") ? "locked" : "quiet"}>
      <View style={{ gap: spacing.xs }}>
        <Text selectable style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0 }}>
          {stage.title}
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          {stage.focus}
        </Text>
      </View>
      <View style={{ gap: spacing.sm }}>
        {stage.blocks.map((block, index) => (
          <RoadmapRow
            key={block.id}
            label={block.label}
            purpose={block.purpose}
            duration={block.duration}
            status={block.status}
            displayStatus={block.displayStatus}
            connector={index < stage.blocks.length - 1}
          />
        ))}
      </View>
    </PremiumCard>
  );
}

function RoadmapRow({
  label,
  purpose,
  duration,
  status,
  displayStatus,
  connector,
}: {
  label: string;
  purpose: string;
  duration: string;
  status: "done" | "current" | "upcoming";
  displayStatus: string;
  connector: boolean;
}) {
  const color = status === "current" ? colors.accent : status === "done" ? colors.success : colors.textSubtle;

  return (
    <View style={{ borderRadius: radius.md, backgroundColor: status === "current" ? colors.accentSoft : "transparent", padding: spacing.sm }}>
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={{ alignItems: "center", width: 24 }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color, marginTop: 4 }} />
          {connector ? <View style={{ width: 2, flex: 1, minHeight: 38, backgroundColor: colors.line, marginTop: 6 }} /> : null}
        </View>
        <View style={{ flex: 1, gap: spacing.xs, minWidth: 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md, alignItems: "flex-start" }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text selectable style={{ color: status === "current" ? colors.text : colors.textMuted, fontSize: 17, lineHeight: 22, fontWeight: "900" }}>
                {label}
              </Text>
              <Text selectable style={{ color: colors.textSubtle, fontSize: 13, lineHeight: 18 }}>
                {purpose}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
              <Text selectable style={{ color, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
                {displayStatus}
              </Text>
              <Text selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 16, fontWeight: "800" }}>
                {duration}
              </Text>
            </View>
          </View>
          <Text selectable style={{ color: colors.textSubtle, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
            ⓘ
          </Text>
        </View>
      </View>
    </View>
  );
}
