import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, shellTokens, spacing } from "@/ui/theme";

export type AppShellIconName = "home" | "train" | "plan" | "progress" | "library" | "settings";

const symbols: Record<AppShellIconName, SymbolViewProps["name"]> = {
  home: { ios: "house", android: "home", web: "home" },
  train: { ios: "dumbbell", android: "fitness_center", web: "fitness_center" },
  plan: { ios: "calendar", android: "calendar_month", web: "calendar_month" },
  progress: { ios: "chart.line.uptrend.xyaxis", android: "monitoring", web: "monitoring" },
  library: { ios: "books.vertical", android: "menu_book", web: "menu_book" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
};

export function AppShellIcon({ name, color = colors.textMuted, size = 20 }: Readonly<{ name: AppShellIconName; color?: string; size?: number }>) {
  return <SymbolView accessibilityElementsHidden importantForAccessibility="no-hide-descendants" name={symbols[name]} size={size} tintColor={color} weight="semibold" />;
}

export function AppShellHeader() {
  const insets = useSafeAreaInsets();
  return <View style={{ paddingTop: Math.max(insets.top, spacing.sm), paddingHorizontal: shellTokens.pageHorizontal, paddingBottom: spacing.xs, minHeight: 48 + insets.top, flexDirection: "row", alignItems: "center", gap: 9, justifyContent: "space-between", backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.lineSoft }}>
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 9 }}>
      <Image source={require("../../assets/icon.png")} style={{ width: 24, height: 24, borderRadius: 12 }} />
      <Text maxFontSizeMultiplier={1.3} numberOfLines={1} adjustsFontSizeToFit style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 18, fontFamily: "Oswald_600SemiBold", letterSpacing: 0.1 }}>Adaptive Strength Coach</Text>
    </View>
    <Link href="/(protected)/settings" asChild>
      <Pressable testID="action-open-settings" accessibilityRole="button" accessibilityLabel="Open settings" hitSlop={8} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pressed ? colors.accent : colors.line, backgroundColor: pressed ? colors.accentSoft : colors.surfaceMuted, opacity: pressed ? 0.82 : 1 })}>
        <AppShellIcon name="settings" color={colors.text} size={19} />
      </Pressable>
    </Link>
  </View>;
}
