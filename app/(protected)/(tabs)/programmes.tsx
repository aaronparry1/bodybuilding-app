import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { projectCanonicalPlan, type CanonicalPlanProjection } from "@/application/training/canonical-plan-projections";
import { AppScreen, EmptyActionState, HeroPanel, PremiumCard, SectionList } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";
import { TrainingSystemGuideButton } from "@/ui/training-system-guide";

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
        <View style={{ flex: 1 }}><HeroPanel eyebrow="Plan" title="Current Plan" subtitle="Your canonical training route, current phase, and what comes next." /></View>
        <TrainingSystemGuideButton />
      </View>
      {!projection ? (
        <EmptyActionState title="Set up your training plan" message="Plan is waiting for a canonical active plan." actionLabel="Set up your training plan" onPress={() => router.push("/(protected)/onboarding")} />
      ) : (
        <>
          <PremiumCard>
            <Summary label="Macrocycle" value={`${projection.macrocycle.goal}${projection.macrocycle.rolling ? " · rolling" : projection.macrocycle.targetDate ? ` · target ${projection.macrocycle.targetDate}` : ""}`} />
            <Summary label="Mesocycle" value={projection.mesocycle.purpose} />
            <Summary label="Microcycle" value={`${projection.microcycle.trainingDays} days · week ${projection.microcycle.sequenceNumber}`} />
          </PremiumCard>
          <SectionList title="Session roles">
            {projection.microcycle.sessionRoles.map((role, index) => <Text key={`${role}-${index}`} selectable style={{ ...type.body, color: colors.text }}>{index + 1}. {role}</Text>)}
          </SectionList>
          <SectionList title="Planned sessions">
            {projection.plannedSessions.map((session) => <Text key={session.id} selectable style={{ ...type.body, color: colors.text }}>{session.planSessionIndex + 1}. {session.role} · {session.status}</Text>)}
          </SectionList>
          <SectionList title="Next actionable session">
            <Text selectable style={{ ...type.body, color: colors.accent }}>{projection.nextActionableSession?.role ?? "No planned session is currently actionable."}</Text>
          </SectionList>
        </>
      )}
    </AppScreen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.lg }}><Text selectable style={{ ...type.label, color: colors.textSubtle }}>{label}</Text><Text selectable style={{ color: colors.text, fontWeight: "900", flex: 1, textAlign: "right" }}>{value}</Text></View>;
}
