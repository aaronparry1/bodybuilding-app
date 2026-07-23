import { Tabs, useSegments } from "expo-router";
import { useSyncExternalStore } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { AppShellHeader, AppShellIcon, type AppShellIconName } from "@/ui/app-shell";
import { getTabBarHeight } from "@/ui/layout";
import { colors, radius, spacing } from "@/ui/theme";

type TabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string; params?: object }> };
  descriptors: Record<string, { options: { href?: string | null; title?: string; tabBarLabel?: string | ((props: { focused: boolean; color: string; position: string; children: string }) => React.ReactNode); tabBarAccessibilityLabel?: string; tabBarButtonTestID?: string } }>;
  navigation: { emit(event: { type: string; target: string; canPreventDefault: boolean }): { defaultPrevented: boolean }; navigate(name: string, params?: object): void };
};

const iconByRoute: Record<string, AppShellIconName> = { index: "home", train: "train", programmes: "plan", analytics: "progress", library: "library" };

export default function MainTabsLayout() {
  const segments = useSegments();
  const planState = useSyncExternalStore(canonicalActivePlanState.subscribe, canonicalActivePlanState.getState, canonicalActivePlanState.getState);
  const trainFocused = segments.includes("train");
  const focusedWorkoutActive = trainFocused && Boolean(planState.model?.activeRecordedSession);
  return <Tabs
    tabBar={(props) => focusedWorkoutActive ? null : <CompactTabBar {...(props as TabBarProps)} />}
    screenOptions={{
      header: () => <AppShellHeader />,
      headerShadowVisible: false,
      sceneStyle: { backgroundColor: colors.background },
    }}
  >
    <Tabs.Screen name="index" options={{ title: "Home", tabBarAccessibilityLabel: "Home tab", tabBarButtonTestID: "tab-home" }} />
    <Tabs.Screen name="train" options={{ title: "Train", headerShown: false, tabBarAccessibilityLabel: "Train tab", tabBarButtonTestID: "tab-train" }} />
    <Tabs.Screen name="programmes" options={{ title: "Plan", tabBarAccessibilityLabel: "Plan tab", tabBarButtonTestID: "tab-plan" }} />
    <Tabs.Screen name="analytics" options={{ title: "Progress", tabBarAccessibilityLabel: "Progress tab", tabBarButtonTestID: "tab-progress" }} />
    <Tabs.Screen name="library" options={{ title: "Library", tabBarAccessibilityLabel: "Library tab", tabBarButtonTestID: "tab-library" }} />
    <Tabs.Screen name="account" options={{ href: null, title: "Account" }} />
  </Tabs>;
}

function CompactTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((route) => route.name !== "account" && descriptors[route.key]?.options.href !== null);
  return <View accessibilityRole="tablist" style={{ height: getTabBarHeight(insets.bottom), flexDirection: "row", alignItems: "flex-start", paddingHorizontal: spacing.xs, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 6), backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.line }}>
    {routes.map((route) => {
      const routeIndex = state.routes.findIndex((candidate) => candidate.key === route.key);
      const focused = state.index === routeIndex;
      const options = descriptors[route.key]?.options;
      const label = getTabLabel(options?.tabBarLabel, options?.title, route.name, focused);
      const onPress = () => {
        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
        if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
      };
      return <Pressable
        key={route.key}
        accessibilityLabel={options?.tabBarAccessibilityLabel ?? `${label} tab`}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        onPress={onPress}
        testID={options?.tabBarButtonTestID}
        style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", gap: 2, backgroundColor: pressed ? colors.surfaceSoft : "transparent", opacity: pressed ? 0.82 : 1 })}
      >
        <AppShellIcon name={iconByRoute[route.name] ?? "home"} color={focused ? colors.accent : colors.textMuted} size={19} />
        <Text maxFontSizeMultiplier={1.2} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.76} style={{ maxWidth: "100%", color: focused ? colors.accent : colors.textMuted, fontSize: 10, lineHeight: 13, fontWeight: focused ? "900" : "700", textAlign: "center" }}>{label}</Text>
        <View style={{ width: focused ? 14 : 3, height: 2, borderRadius: radius.pill, backgroundColor: focused ? colors.accent : "transparent" }} />
      </Pressable>;
    })}
  </View>;
}

function getTabLabel(tabBarLabel: TabBarProps["descriptors"][string]["options"]["tabBarLabel"], title: string | undefined, routeName: string, focused: boolean): string {
  if (typeof tabBarLabel === "string") return tabBarLabel;
  if (typeof tabBarLabel === "function") {
    const rendered = tabBarLabel({ focused, color: focused ? colors.accent : colors.textMuted, position: "below-icon", children: title ?? routeName });
    return typeof rendered === "string" ? rendered : title ?? routeName;
  }
  return title ?? routeName;
}
