import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { activeTrainingPlanRepository } from "@/data/local/active-training-plan-repository";
import { workoutSessionRepository } from "@/data/local/workout-session-repository";
import { buildPlanPageViewModel } from "@/domain/training/plan-page-view-model";
import { transitionToApprovedMesocycle } from "@/domain/training/plan-setup";
import { AppScreen, DetailToggle, EmptyActionState, HeroPanel, PremiumCard, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";

export default function PlanScreen() {
  const [activePlan, setActivePlan] = useState(() => activeTrainingPlanRepository.getOptional());
  const [workouts, setWorkouts] = useState(() => workoutSessionRepository.list());
  const viewModel = buildPlanPageViewModel({ activePlan, workouts });

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
            <PlanSummaryRow label="Macrocycle" value={viewModel.summary.macrocycle} />
            <DetailToggle label="Plan details" compact>
              <PlanSummaryRow label="Split" value={viewModel.summary.split} />
            </DetailToggle>
          </PremiumCard>

          <SectionList title="Current microcycle">
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {viewModel.thisWeek.map((day, index) => (
                <WeekMarker key={`${day.label}-${index}`} day={day.label} active={day.status === "current"} />
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
                    {viewModel.approvedNextMesocycles.map((mesocycle) => <SecondaryButton key={mesocycle.id} label={mesocycle.purpose} onPress={() => handleChooseMesocycle(mesocycle.id)} compact />)}
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
  const targets = viewModel.exactTargetSummary.map((target) => `${target.exerciseName}: ${target.load}${target.unit} × ${target.targets.join(", ")}`);
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
