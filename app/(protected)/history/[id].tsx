import { Link, router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { canonicalActivePlanV2Repository } from "@/data/local/canonical-active-plan-v2-repository";
import { canonicalRecordedSessionLedger } from "@/data/local/canonical-recorded-session-ledger";
import { projectCanonicalTrainSession } from "@/application/training/canonical-train-session-boundary";
import { projectCanonicalSessionConstructionDisplay } from "@/domain/training/canonical-session-construction-display-projection";
import { exerciseLibrary } from "@/domain/training/presets";
import { EmptyState, Pill, PremiumCard, Screen, ScreenHeader, StatTile } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loaded = canonicalActivePlanV2Repository.get();
  const planId = loaded.status === "saved" ? loaded.carrier.planId : "";
  const result = id && planId ? projectCanonicalTrainSession(planId, id) : { status: "rejected" as const, reason: "canonical_plan_unavailable" };

  if (result.status !== "projected") {
    return <Screen><EmptyState title="Workout not found" message={result.reason === "carrier_reconciliation_required" ? "This workout needs reconciliation before it can be displayed." : "This recorded workout is not available through the canonical history ledger."} /></Screen>;
  }

  const projection = result.projection;
  const aggregate = canonicalRecordedSessionLedger.get(projection.recordedSessionId);
  const display = aggregate.status === "found" ? projectCanonicalSessionConstructionDisplay(aggregate.session.prescriptionSnapshot as never, exerciseLibrary) : { status: "unavailable" as const, reason: "recorded_session_not_found" };

  if (display.status !== "ready") {
    return <Screen><EmptyState title="Workout details unavailable" message="Canonical exercise metadata is unavailable for this recorded session." /></Screen>;
  }

  return (
    <Screen>
      <ScreenHeader eyebrow="Workout history" title={display.projection.sessionName} subtitle={`${projection.lifecycle} · ledger v${projection.ledgerVersion}`} action={<Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}><Text style={{ color: colors.text, fontWeight: "900" }}>Back</Text></Pressable>} />
      <PremiumCard tone="quiet">
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>Canonical recorded-session history is immutable. Corrections and removal are unavailable until an approved ledger command exists.</Text>
        <Pill label="Read-only canonical history" />
      </PremiumCard>
      <View style={{ flexDirection: "row", gap: spacing.sm }}>
        <StatTile label="Status" value={projection.lifecycle} />
        <StatTile label="Exercises" value={`${projection.slots.length}`} />
        <StatTile label="Ledger" value={`v${projection.ledgerVersion}`} />
      </View>
      {display.projection.slots.map((slot) => (
        <PremiumCard key={`${slot.exerciseId}:${slot.index}`}>
          <Text selectable style={{ ...type.section, color: colors.text }}>{slot.exerciseName}</Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>{slot.methodLabel} · {slot.loadStateLabel}</Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>{slot.accessibilityLabel}</Text>
          <Link href={`/(protected)/history/exercise/${slot.exerciseId}`} asChild><Pressable><Text style={{ color: colors.accent, fontWeight: "900" }}>History</Text></Pressable></Link>
        </PremiumCard>
      ))}
    </Screen>
  );
}
