import { Text, View } from "react-native";
import type { CanonicalSupersetAdaptationPresentation } from "@/application/training/canonical-superset-adaptation-presentation";
import { exerciseDisplayName } from "@/application/training/display-labels";
import { colors, radius, spacing, type } from "@/ui/theme";

export function SupersetAdaptationNotice({ presentation, compact = false }: Readonly<{ presentation: CanonicalSupersetAdaptationPresentation; compact?: boolean }>) {
  const applied = presentation.state === "applied";
  const heading = applied ? "Updated for next time" : presentation.state === "held" ? "Pairing held steady" : "No change applied";
  const consequence = presentation.changes.some((item) => item.mutationType === "remove_pairing")
    ? "Both exercises remain in your workout as straight sets."
    : null;
  const accessibilityLabel = [heading, presentation.explanation, ...presentation.changes.map(accessibleChange), consequence].filter(Boolean).join(" ");
  return <View accessibilityRole="summary" accessibilityLabel={accessibilityLabel} style={{ gap: spacing.sm, padding: compact ? spacing.md : spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: applied ? colors.success : colors.lineSoft, backgroundColor: applied ? colors.successSoft : colors.surfaceMuted }}>
    <Text style={{ ...type.label, color: applied ? colors.success : colors.textMuted, textTransform: "uppercase" }}>Coach review · {presentation.state}</Text>
    <Text selectable style={{ ...type.section, color: colors.text }}>{heading}</Text>
    {!compact ? <Text selectable style={{ ...type.body, color: colors.textMuted }}>{presentation.explanation}</Text> : null}
    {presentation.changes.map((change) => <View key={`${change.member}:${change.field}`} style={{ gap: 3, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
      <Text selectable style={{ color: colors.text, fontWeight: "900" }}>{change.exerciseId ? exerciseDisplayName(change.exerciseId) : "Superset pairing"}</Text>
      <Text selectable style={{ color: colors.textMuted, lineHeight: 19 }}>{changeLabel(change)}</Text>
    </View>)}
    {consequence ? <Text selectable style={{ color: colors.text, fontWeight: "800", lineHeight: 20 }}>{consequence}</Text> : null}
  </View>;
}

function changeLabel(change: CanonicalSupersetAdaptationPresentation["changes"][number]): string {
  if (change.mutationType === "remove_pairing") return "Paired rounds → straight sets";
  if (change.mutationType === "increase_round_rest") return `Round recovery: ${String(change.before)} seconds → ${String(change.after)} seconds`;
  const label = change.mutationType.includes("load") ? "Load" : "Repetition target";
  return `${label}: ${formatValue(change.before)} → ${formatValue(change.after)}`;
}

function accessibleChange(change: CanonicalSupersetAdaptationPresentation["changes"][number]): string {
  const exercise = change.exerciseId ? exerciseDisplayName(change.exerciseId) : "The superset";
  return `${exercise}. ${changeLabel(change).replace("→", "changes to")}.`;
}

function formatValue(value: unknown): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
