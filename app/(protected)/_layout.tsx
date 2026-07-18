import { Redirect, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/application/auth/auth-context";
import { useAppSettings } from "@/application/settings/app-settings";
import { getActiveDesignQaFixture, subscribeDesignQaFixture } from "@/application/design-qa/design-qa-fixtures";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { colors, spacing } from "@/ui/theme";

export default function ProtectedLayout() {
  const insets = useSafeAreaInsets();
  const { user, isLoading, isOfflineMode } = useAuth();
  const { settings } = useAppSettings();
  const segments = useSegments();
  const [activeFixture, setActiveFixture] = useState(() => getActiveDesignQaFixture());
  const isOnboardingRoute = segments.includes("onboarding");

  useEffect(() => subscribeDesignQaFixture(() => setActiveFixture(getActiveDesignQaFixture())), []);
  useEffect(() => { canonicalActivePlanState.hydrate(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user && !isOfflineMode) return <Redirect href="/(auth)" />;
  // The protected tabs are never a substitute for onboarding. A stale carrier from an
  // interrupted setup may exist, but it must not make the old plan visible or startable.
  if (!settings.onboardingCompleted && !isOnboardingRoute && !activeFixture) return <Redirect href="/(protected)/onboarding" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {activeFixture ? (
        <View
          style={{
            backgroundColor: colors.accentSoft,
            borderBottomWidth: 1,
            borderBottomColor: colors.accent,
            paddingHorizontal: spacing.lg,
            paddingTop: Math.max(insets.top, spacing.xs),
            paddingBottom: spacing.xs,
          }}
        >
          <Text selectable adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900", textAlign: "center" }}>
            Design QA fixture active: {activeFixture.label}
          </Text>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="library/[id]" options={{ title: "Exercise" }} />
        <Stack.Screen name="library/new" options={{ title: "Custom Exercise" }} />
        <Stack.Screen name="programmes/[id]" options={{ title: "Programme" }} />
        <Stack.Screen name="programmes/builder" options={{ title: "Programme Builder" }} />
        <Stack.Screen name="programmes/session" options={{ title: "Session Builder" }} />
        <Stack.Screen name="history/index" options={{ title: "History" }} />
        <Stack.Screen name="history/[id]" options={{ title: "Workout Detail" }} />
        <Stack.Screen name="history/exercise/[id]" options={{ title: "Exercise History" }} />
        <Stack.Screen name="analytics/exercise/[id]" options={{ title: "Exercise Analytics" }} />
        <Stack.Screen name="analytics/muscles" options={{ title: "Muscle Analytics" }} />
        <Stack.Screen name="paywall" options={{ title: "Adaptive Strength Coach Premium" }} />
        <Stack.Screen name="session-prep" options={{ title: "Session Prep" }} />
        <Stack.Screen name="completion-summary" options={{ title: "Workout complete", headerBackVisible: false }} />
        <Stack.Screen name="capacity-focus" options={{ title: "Low Back Capacity" }} />
        <Stack.Screen name="onboarding" options={{ title: "Welcome" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="diagnostics" options={{ title: "Diagnostics" }} />
        <Stack.Screen name="design-qa" options={{ title: "Design QA" }} />
        <Stack.Screen name="v2-benchmark-qa" options={{ title: "V2 QA" }} />
      </Stack>
    </View>
  );
}
