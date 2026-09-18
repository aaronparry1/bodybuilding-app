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
  message = "Start a 14-day free trial to unlock coached workouts, logging, reviews, progression, reports, recovery guidance, and sharing.",
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
          See the plan first. Train with the full coach when you are ready.
        </Text>
        <Text selectable style={{ ...type.body, color: colors.textMuted }}>
          Free access includes onboarding, plan preview, the guide, settings, account, and restore purchases.
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
