import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shellTokens, spacing } from "@/ui/theme";

export type AppShellIconName = "home" | "train" | "plan" | "progress" | "library" | "settings";

const glyphs: Record<AppShellIconName, string> = {
  home: "⌂",
  train: "◆",
  plan: "▦",
  progress: "↗",
  library: "≡",
  settings: "⚙",
};

export function AppShellIcon({ name, color = colors.textMuted, size = 20 }: Readonly<{ name: AppShellIconName; color?: string; size?: number }>) {
  return <Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ color, fontSize: size, lineHeight: size + 2, fontWeight: "900", textAlign: "center" }}>{glyphs[name]}</Text>;
}

export function AppShellHeader() {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: Math.max(insets.top, spacing.sm), paddingHorizontal: shellTokens.pageHorizontal, paddingBottom: spacing.sm, minHeight: 52 + insets.top, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
    <View style={{ gap: 1 }}>
      <Text style={{ color: colors.text, fontSize: 14, lineHeight: 18, fontWeight: "900", letterSpacing: 0.2 }}>Adaptive Strength</Text>
      <Text style={{ color: colors.textSubtle, fontSize: 10, lineHeight: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.9 }}>Coach</Text>
    </View>
    <Link href="/(protected)/settings" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="Open settings" hitSlop={8} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pressed ? colors.focus : colors.line, backgroundColor: pressed ? colors.surfaceSoft : colors.surfaceMuted, opacity: pressed ? 0.82 : 1 })}>
        <AppShellIcon name="settings" color={colors.text} size={19} />
      </Pressable>
    </Link>
  </View>;
}
