import { Text, View } from "react-native";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { queryCanonicalMuscleSummaries } from "@/application/training/canonical-analytics-queries";
import { titleMuscle } from "@/domain/training/analytics";
import { Pill, PremiumCard, Screen, ScreenHeader } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function MuscleAnalyticsScreen() {
  const plan = canonicalActivePlanState.getReadModel();
  const volumes = plan ? queryCanonicalMuscleSummaries(plan.planId) : [];
  const maxSets = Math.max(1, ...volumes.map((volume) => volume.sets));

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Completed work"
        title="Muscle Analytics"
        subtitle="Weekly sets versus target ranges. Neglected muscles cannot hide here."
      />

      {volumes.map((volume) => (
        <PremiumCard key={volume.muscleGroup}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <Text selectable style={{ ...type.section, color: colors.text }}>{titleMuscle(volume.muscleGroup)}</Text>
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: colors.lineSoft, overflow: "hidden" }}>
            <View style={{ width: `${Math.max(4, Math.min(100, (volume.sets / maxSets) * 100))}%`, height: 8, backgroundColor: colors.success }} />
          </View>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {volume.sets} completed working sets this week · canonical ledger
          </Text>
        </PremiumCard>
      ))}
    </Screen>
  );
}

function statusColor(status: string) {
  if (status === "productive") return colors.success;
  if (status === "excessive") return colors.danger;
  return colors.warning;
}
