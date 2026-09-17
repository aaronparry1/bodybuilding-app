import { Link } from "expo-router";
import { Text, View } from "react-native";
import { useSubscription } from "@/application/billing/subscription-context";
import { AppScreen, HeroPanel, PremiumCard, PrimaryButton, SecondaryButton } from "@/ui/primitives";
import { colors, spacing, type } from "@/ui/theme";

export function usePremiumAccess(): boolean {
  const { isPremium } = useSubscription();
  return isPremium;
}

export function PremiumRequiredScreen({
  title = "Start your adaptive strength plan",
  message = "Start a 14-day free trial to unlock target loads that adapt to your lifts, progression, recovery guidance and meet prep.",
}: {
  title?: string;
  message?: string;
}) {
  const { restorePurchases, isLoading, restoreStatus, restoreMessage } = useSubscription();

  return (
    <AppScreen>
      <HeroPanel eyebrow="Premium required" title={title} subtitle={message} />
      <PremiumCard tone="locked">
        <Text selectable style={{ ...type.section, color: colors.text }}>
          Logging and progress are free. Pro adds the coach.
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Free includes your programme, set logging, history, progress and cloud backup. Pro sets each target for you and adjusts it from what you lift.
        </Text>
        <View style={{ gap: spacing.sm }}>
          <Link href="/(protected)/paywall" asChild>
            <PrimaryButton label="Start 14-Day Free Trial" onPress={() => {}} disabled={isLoading} />
          </Link>
          <SecondaryButton label={restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"} onPress={restorePurchases} disabled={isLoading} />
        </View>
      </PremiumCard>
      {restoreMessage ? (
        <Text selectable style={{ ...type.body, color: restoreStatus === "restored" ? colors.success : restoreStatus === "failed" ? colors.danger : colors.textMuted, textAlign: "center" }}>
          {restoreMessage}
        </Text>
      ) : null}
      <Text selectable style={{ ...type.body, color: colors.textSubtle, textAlign: "center" }}>
        Subscriptions are managed securely through your App Store or Google Play account.
      </Text>
    </AppScreen>
  );
}
