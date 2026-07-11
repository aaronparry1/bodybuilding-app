import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { AuthProvider } from "@/application/auth/auth-context";
import { SubscriptionProvider } from "@/application/billing/subscription-context";
import { colors, radius, spacing, type } from "@/ui/theme";

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

export default function RootLayout() {
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
}
