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

export function WorkoutMetricStrip({ items, centered = false }: Readonly<{
  items: readonly { label: string; value: string }[];
  centered?: boolean;
}>) {
  return <View style={{ flexDirection: "row", gap: spacing.sm }}>
    {items.map((item) => <View key={item.label} style={{ flex: 1, minWidth: 0, minHeight: 68, justifyContent: "center", alignItems: centered ? "center" : "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 8, gap: 2, borderRadius: radius.md, backgroundColor: colors.backgroundElevated, borderWidth: 1, borderColor: colors.lineSoft }}>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={{ color: colors.text, fontSize: 20, lineHeight: 24, fontWeight: "900", fontVariant: ["tabular-nums"], textAlign: centered ? "center" : "left" }}>{item.value}</Text>
      <Text numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: colors.textSubtle, fontSize: 11, lineHeight: 14, fontWeight: "800", textTransform: "uppercase", textAlign: centered ? "center" : "left" }}>{item.label}</Text>
    </View>)}
  </View>;
}
