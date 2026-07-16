import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { constructCanonicalExtraSession } from "@/application/training/canonical-extra-session";
import { AppScreen, HeroPanel, PrimaryButton, SectionList, SecondaryButton } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

const focuses = ["general", "recovery", "capacity", "conditioning"] as const;
type Focus = (typeof focuses)[number];

export default function AIWorkoutScreen() {
  const [focus, setFocus] = useState<Focus>("general");
  const [message, setMessage] = useState<string | null>(null);
  const plan = canonicalActivePlanState.getReadModel();
  const constructed = plan ? constructCanonicalExtraSession({ planId: plan.planId, expectedPlanRevision: plan.revision, requestId: `extra:${focus}`, focus, availableMinutes: 45, occurredAt: new Date().toISOString() }) : null;

  const startWorkout = () => {
    if (!constructed || constructed.status !== "constructed") {
      setMessage(constructed?.reason ?? "canonical_plan_unavailable");
      return;
    }
    setMessage("Extra sessions require the canonical ledger start/link command before they can open in Train.");
  };

  return (
    <AppScreen>
      <HeroPanel eyebrow="Create session" title="Extra session" subtitle="Choose a factual focus. Session Construction owns the prescription." />
      <SectionList title="Session focus">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {focuses.map((option) => <Pressable key={option} onPress={() => setFocus(option)} style={chipStyle(option === focus)}><Text style={{ color: option === focus ? colors.background : colors.text, fontWeight: "900" }}>{option}</Text></Pressable>)}
        </View>
      </SectionList>
      <SectionList title="Canonical status">
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>{constructed?.status === "constructed" ? `Snapshot ready · ${constructed.role}` : constructed?.reason ?? "Canonical plan unavailable"}</Text>
        {message ? <Text selectable style={{ ...type.body, color: colors.textMuted }}>{message}</Text> : null}
      </SectionList>
      <View style={{ gap: spacing.sm }}>
        <PrimaryButton label="Start extra session" onPress={startWorkout} disabled={constructed?.status !== "constructed"} />
        <SecondaryButton label="Back" onPress={() => router.back()} />
      </View>
    </AppScreen>
  );
}

function chipStyle(active: boolean) {
  return { borderRadius: radius.pill, borderWidth: 1, borderColor: active ? colors.accent : colors.line, backgroundColor: active ? colors.accent : colors.surface, paddingHorizontal: spacing.md, paddingVertical: 10 } as const;
}
