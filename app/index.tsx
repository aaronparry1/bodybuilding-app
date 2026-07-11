import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/application/auth/auth-context";
import { colors } from "@/ui/theme";

export default function IndexRoute() {
  const { user, isLoading, isOfflineMode } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <Redirect href={user || isOfflineMode ? "/(protected)" : "/(auth)"} />;
}
