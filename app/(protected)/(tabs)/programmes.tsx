import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalPlan, type CanonicalPlanProjection } from "@/application/training/canonical-plan-projections";
import { AppScreen, EmptyActionState, HeroPanel, PremiumCard, SectionList } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";
import { mesocyclePurposeDisplayName, sessionRoleDisplayName, trainingGoalDisplayName } from "@/application/training/display-labels";

export default function PlanScreen() {
  const [projection, setProjection] = useState<CanonicalPlanProjection | null>(() => {
    const model = canonicalActivePlanState.getReadModel();
    return model ? projectCanonicalPlan(model) : null;
  });

  useEffect(() => {
    const unsubscribe = canonicalActivePlanState.subscribe(() => {
      const model = canonicalActivePlanState.getReadModel();
      setProjection(model ? projectCanonicalPlan(model) : null);
    });
    canonicalActivePlanState.hydrate();
    return unsubscribe;
  }, []);

  return (
    <AppScreen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.lg }}>
        <View style={{ flex: 1 }}><HeroPanel eyebrow="Plan" title="Your programme" subtitle="Your current focus, phase and upcoming workouts." /></View>
        <TrainingSystemGuideButton />
      </View>
      {!projection ? (
        <EmptyActionState title="Set up your training plan" message="Plan is waiting for a canonical active plan." actionLabel="Set up your training plan" onPress={() => router.push("/(protected)/onboarding")} />
      ) : (
        <>
          <PremiumCard>
            <Summary label="Focus" value={trainingGoalDisplayName(projection.macrocycle.goal)} />
            <Summary label="Phase" value={mesocyclePurposeDisplayName(projection.mesocycle.purpose)} />
            <Summary label="This week" value={`${projection.microcycle.trainingDays} training days · week ${projection.microcycle.sequenceNumber}`} />
          </PremiumCard>
          <SectionList title="Planned sessions">
            <Text style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>Mesocycle · Microcycle</Text>
            {projection.plannedSessions.map((session) => <Text key={session.id} selectable style={{ ...type.body, color: colors.text }}>{session.planSessionIndex + 1}. {sessionRoleDisplayName(session.role)}{session.status === "completed" ? " · complete" : ""}</Text>)}
          </SectionList>
          {projection.activeSession ? <SectionList title="Active workout"><Text selectable style={{ ...type.body, color: colors.accent }}>{sessionRoleDisplayName(projection.activeSession.role)} · in progress</Text><Text style={{ ...type.body, color: colors.textMuted }}>Resume this workout from Train.</Text></SectionList> : null}
          <SectionList title="Next actionable session">
            <Text selectable style={{ ...type.body, color: colors.accent }}>{projection.nextActionableSession ? sessionRoleDisplayName(projection.nextActionableSession.role) : "No workout is currently ready."}</Text>
          </SectionList>
        </>
      )}
    </AppScreen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.lg }}><Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text><Text selectable style={{ color: colors.text, fontWeight: "900", flex: 1, textAlign: "right" }}>{value}</Text></View>;
}
