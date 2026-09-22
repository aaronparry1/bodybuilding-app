import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { useFonts, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from "@expo-google-fonts/oswald";
import { useEffect } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { AuthProvider } from "@/application/auth/auth-context";
import { SubscriptionProvider } from "@/application/billing/subscription-context";
import { canonicalActivePlanState } from "@/application/training/canonical-active-plan-state";
import { rescheduleTrainingReminders } from "@/application/notifications/training-reminders";
import { colors, radius, spacing, type } from "@/ui/theme";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://8e2fbe3f7d78fecc167ddcaa39ae39be@o4512130122579968.ingest.de.sentry.io/4512130944794704",

  sendDefaultPii: false,
  enableLogs: false,
});

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", gap: spacing.lg, padding: spacing.xl, backgroundColor: colors.background }}>
      <Text style={{ ...type.title, color: colors.text }}>Adaptive Strength Coach hit a bad rep.</Text>
      <Text style={{ ...type.body, color: colors.textMuted }}>
        The app caught a startup issue and kept the door open. Try once more; if it repeats, the detail below is the useful bit.
      </Text>
      <Text selectable style={{ color: colors.danger, lineHeight: 20 }}>
        {error.message}
      </Text>
      <Pressable
        onPress={retry}
        style={{ height: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderCurve: "continuous", backgroundColor: colors.accent }}
      >
        <Text style={{ color: "#12110d", fontWeight: "900" }}>Try again</Text>
      </Pressable>
    </View>
  );
}

export default Sentry.wrap(function RootLayout() {
  const [fontsLoaded] = useFonts({ Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold });

  useEffect(() => {
    rescheduleTrainingReminders().catch(() => {});
    const unsubscribePlan = canonicalActivePlanState.subscribe(() => {
      rescheduleTrainingReminders().catch(() => {});
    });
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") rescheduleTrainingReminders().catch(() => {});
    });
    return () => {
      unsubscribePlan();
      appStateSub.remove();
    };
  }, []);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "800" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack>
      </SubscriptionProvider>
    </AuthProvider>
  );
});
