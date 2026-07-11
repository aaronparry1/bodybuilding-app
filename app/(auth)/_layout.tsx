import { Redirect } from "expo-router";
import { Stack } from "expo-router/stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { colors } from "@/ui/theme";

export default function AuthLayout() {
  const { user, isLoading, isOfflineMode } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (user || isOfflineMode) return <Redirect href="/(protected)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Sign in" }} />
    </Stack>
  );
}
