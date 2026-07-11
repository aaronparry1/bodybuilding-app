import { Tabs } from "expo-router";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTabBarHeight } from "@/ui/layout";
import { colors, radius, spacing } from "@/ui/theme";

type TabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        href?: string | null;
        title?: string;
        tabBarLabel?: string | ((props: { focused: boolean; color: string; position: string; children: string }) => React.ReactNode);
        tabBarAccessibilityLabel?: string;
        tabBarButtonTestID?: string;
      };
    }
  >;
  navigation: {
    emit(event: { type: string; target: string; canPreventDefault: boolean }): { defaultPrevented: boolean };
    navigate(name: string, params?: object): void;
  };
};

export default function MainTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PremiumTabBar {...(props as TabBarProps)} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        headerRight: () => (
          <Link href="/(protected)/settings" asChild>
            <Pressable style={{ paddingHorizontal: 16, minHeight: 40, justifyContent: "center" }}>
              <Text style={{ color: colors.accent, fontWeight: "900" }}>Settings</Text>
            </Pressable>
          </Link>
        ),
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="train" options={{ title: "Train" }} />
      <Tabs.Screen name="programmes" options={{ title: "Plan" }} />
      <Tabs.Screen name="analytics" options={{ title: "Progress" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="account" options={{ href: null, title: "Account" }} />
    </Tabs>
  );
}

function PremiumTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const routes = state.routes.filter((route) => route.name !== "account" && descriptors[route.key]?.options.href !== null);

  return (
    <View
      style={{
        height: tabBarHeight,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.lineSoft,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: radius.xl,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.backgroundElevated,
          padding: 4,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        {routes.map((route) => {
          const routeIndex = state.routes.findIndex((candidate) => candidate.key === route.key);
          const isFocused = state.index === routeIndex;
          const options = descriptors[route.key]?.options;
          const label = getTabLabel(options?.tabBarLabel, options?.title, route.name, isFocused);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? `${label} tab`}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              testID={options?.tabBarButtonTestID}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: 0,
                minHeight: 46,
                borderRadius: radius.lg,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                backgroundColor: isFocused ? colors.accentSoft : pressed ? colors.surfaceSoft : "transparent",
                borderWidth: 1,
                borderColor: isFocused ? "#5a4721" : "transparent",
                opacity: pressed ? 0.86 : 1,
                paddingHorizontal: 2,
              })}
            >
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                numberOfLines={1}
                style={{
                  color: isFocused ? colors.accent : colors.textMuted,
                  fontSize: 11,
                  lineHeight: 14,
                  fontWeight: "900",
                  textAlign: "center",
                  letterSpacing: 0,
                  maxWidth: "100%",
                }}
              >
                {label}
              </Text>
              <View
                style={{
                  width: isFocused ? 18 : 4,
                  height: 3,
                  borderRadius: radius.pill,
                  backgroundColor: isFocused ? colors.accent : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getTabLabel(
  tabBarLabel: TabBarProps["descriptors"][string]["options"]["tabBarLabel"],
  title: string | undefined,
  routeName: string,
  focused: boolean,
): string {
  if (typeof tabBarLabel === "string") return tabBarLabel;
  if (typeof tabBarLabel === "function") {
    const rendered = tabBarLabel({ focused, color: focused ? colors.accent : colors.textMuted, position: "below-icon", children: title ?? routeName });
    return typeof rendered === "string" ? rendered : title ?? routeName;
  }
  return title ?? routeName;
}
