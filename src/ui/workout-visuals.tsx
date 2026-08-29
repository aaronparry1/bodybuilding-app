import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { colors, radius, shellTokens, spacing, type } from "@/ui/theme";

type WorkoutTone = "accent" | "success" | "neutral";

const toneColor = (tone: WorkoutTone) => tone === "success" ? colors.success : tone === "accent" ? colors.accent : colors.textMuted;

export function WorkoutStage({
  eyebrow,
  title,
  detail,
  tone = "accent",
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  detail?: string;
  tone?: WorkoutTone;
  children?: ReactNode;
}>) {
  const emphasis = toneColor(tone);
  const backgroundColor = tone === "success" ? colors.successSoft : tone === "accent" ? colors.accentSoft : colors.surface;

  return <View style={{ overflow: "hidden", borderRadius: radius.xl, borderCurve: "continuous", borderWidth: 1, borderColor: tone === "neutral" ? colors.line : emphasis, backgroundColor }}>
    <View style={{ height: 3, backgroundColor: emphasis }} />
    <View style={{ padding: shellTokens.cardPadding, gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={{ ...type.label, color: emphasis, textTransform: "uppercase", letterSpacing: 0.8 }}>{eyebrow}</Text>
        <Text accessibilityRole="header" style={{ ...type.section, fontSize: 24, lineHeight: 29, color: colors.text }}>{title}</Text>
        {detail ? <Text style={{ ...type.body, color: colors.textMuted }}>{detail}</Text> : null}
      </View>
      {children}
    </View>
  </View>;
}

export function WorkoutMetricStrip({ items, centered = false, compact = false }: Readonly<{
  items: readonly { label: string; value: string }[];
  centered?: boolean;
  compact?: boolean;
}>) {
  return <View style={{ flexDirection: "row", gap: spacing.sm }}>
    {items.map((item) => <View key={item.label} style={{ flex: 1, minWidth: 0, minHeight: compact ? 48 : 68, justifyContent: "center", alignItems: centered ? "center" : "flex-start", paddingHorizontal: compact ? 0 : spacing.sm, paddingVertical: compact ? 2 : 8, gap: 2, borderRadius: radius.md, backgroundColor: compact ? "transparent" : colors.backgroundElevated, borderWidth: compact ? 0 : 1, borderColor: colors.lineSoft }}>
      <Text maxFontSizeMultiplier={1.5} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={{ color: colors.text, fontSize: compact ? 15 : 20, lineHeight: compact ? 19 : 24, fontWeight: "900", fontVariant: ["tabular-nums"], textAlign: centered ? "center" : "left" }}>{item.value}</Text>
      <Text maxFontSizeMultiplier={1.5} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: colors.textSubtle, fontSize: compact ? 10 : 11, lineHeight: compact ? 13 : 14, fontWeight: "800", textTransform: "uppercase", textAlign: centered ? "center" : "left" }}>{item.label}</Text>
    </View>)}
  </View>;
}
