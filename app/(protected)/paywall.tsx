import Constants from "expo-constants";
import { router } from "expo-router";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { useSubscription } from "@/application/billing/subscription-context";
import { customerSafeServiceMessage, shouldShowDeveloperDiagnostics } from "@/application/runtime/customer-facing-errors";
import { normalizeAppEnvironment } from "@/application/runtime/app-environment";
import { AppScreen, GhostButton, PremiumCard, PrimaryButton, SecondaryButton, SectionList } from "@/ui/primitives";
import { colors, radius, spacing, type } from "@/ui/theme";

const STORE_NAME = Platform.OS === "android" ? "Google Play" : "App Store";

const benefits = [
  "Build muscle and strength with confidence",
  "Know exactly what to do every workout",
  "Track progress automatically",
  "Recover without losing momentum",
  "Powerlifting and strength coaching included",
];

export default function PaywallScreen() {
  const {
    purchasePackage,
    restorePurchases,
    isLoading,
    packages,
    error,
    subscription,
    trialEndsAt,
    refreshSubscription,
    restoreStatus,
    restoreMessage,
  } = useSubscription();
  const isPremium = Boolean(subscription.isPremium);
  const extra = Constants.expoConfig?.extra as { privacyPolicyUrl?: string; termsUrl?: string; appEnvironment?: string } | undefined;
  const appEnvironment = normalizeAppEnvironment(extra?.appEnvironment);
  const showDeveloperDiagnostics = shouldShowDeveloperDiagnostics(appEnvironment);
  const safeError = customerSafeServiceMessage(error, appEnvironment);
  const productsUnavailable = packages.length === 0;
  const orderedPackages = orderPackagesForConversion(packages);

  return (
    <AppScreen bottom={56}>
      <PaywallHero />
      <TrialOfferCard />

      {isPremium ? (
        <PremiumCard tone="success">
          <Text selectable style={{ ...type.section, color: colors.text }}>
            Premium is active
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            {subscription.status === "trial" ? "Trial active" : "Premium active"}
            {trialEndsAt ? ` until ${formatDate(trialEndsAt)}` : ""}. You can train now.
          </Text>
          <PrimaryButton label="Continue to app" onPress={() => router.back()} disabled={isLoading} />
        </PremiumCard>
      ) : null}

      <SectionList title="Choose your plan">
        {isLoading && packages.length === 0 ? (
          <PlanLoadingCards />
        ) : productsUnavailable ? (
          <PlanUnavailableCards showDeveloperDiagnostics={showDeveloperDiagnostics} onRetry={refreshSubscription} isLoading={isLoading} />
        ) : (
          orderedPackages.map((pack) => (
            <PlanCard key={pack.id} pack={pack} packages={packages} isLoading={isLoading} onPurchase={() => purchasePackage(pack.id)} />
          ))
        )}
      </SectionList>

      <SectionList title="What you unlock">
        {benefits.map((benefit) => (
          <BenefitRow key={benefit} label={benefit} />
        ))}
      </SectionList>

      {restoreMessage ? <RestoreFeedback status={restoreStatus} message={restoreMessage} /> : null}
      {safeError ? <InlinePlanStatus message={safeError} /> : null}

      <TrustSection />

      <View style={{ gap: spacing.sm }}>
        <SecondaryButton label={restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"} onPress={restorePurchases} disabled={isLoading} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.lg }}>
        <Text onPress={() => openUrl(extra?.termsUrl ?? "https://adaptivestrengthcoach.com/terms")} style={{ color: colors.textMuted, fontWeight: "800" }}>
          Terms
        </Text>
        <Text onPress={() => openUrl(extra?.privacyPolicyUrl ?? "https://adaptivestrengthcoach.com/privacy")} style={{ color: colors.textMuted, fontWeight: "800" }}>
          Privacy
        </Text>
      </View>

      <GhostButton label="Not now" onPress={() => router.back()} />
    </AppScreen>
  );
}

function PaywallHero() {
  return (
    <View style={{ gap: spacing.md }}>
      <Text selectable style={{ ...type.label, color: colors.accent }}>
        Adaptive Strength Coach Premium
      </Text>
      <Text selectable adjustsFontSizeToFit minimumFontScale={0.78} style={{ color: colors.text, fontSize: 38, lineHeight: 42, fontFamily: "Oswald_600SemiBold" }}>
        Build More Muscle.{"\n"}Get Stronger.{"\n"}Stop Guessing.
      </Text>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        Adaptive coaching that adjusts to your performance, recovery, and progress.
      </Text>
    </View>
  );
}

function TrialOfferCard() {
  return (
    <PremiumCard tone="locked">
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text selectable style={{ color: colors.accent, fontSize: 28, lineHeight: 32, fontFamily: "Oswald_600SemiBold" }}>
            14-Day Free Trial
          </Text>
          <Text selectable style={{ ...type.body, color: colors.textMuted }}>
            Cancel anytime.
          </Text>
        </View>
        <View
          style={{
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.accent,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.background,
          }}
        >
          <Text selectable style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
            Start today
          </Text>
        </View>
      </View>
    </PremiumCard>
  );
}

function PlanCard({
  pack,
  packages,
  isLoading,
  onPurchase,
}: {
  pack: { id: string; title: string; priceLabel: string; trialLabel?: string };
  packages: Array<{ id: string; priceLabel: string }>;
  isLoading: boolean;
  onPurchase(): void;
}) {
  const featured = isFeaturedPackage(pack.id);
  const title = planTitle(pack.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Start 14-Day Free Trial with ${title}`}
      onPress={onPurchase}
      disabled={isLoading}
      style={({ pressed }) => ({
        borderRadius: radius.lg,
        borderCurve: "continuous",
        borderWidth: featured ? 2 : 1,
        borderColor: featured ? colors.accent : colors.lineSoft,
        backgroundColor: featured ? colors.accentSoft : colors.surfaceMuted,
        padding: spacing.lg,
        gap: spacing.md,
        opacity: isLoading ? 0.55 : pressed ? 0.86 : 1,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm }}>
            <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontFamily: "Oswald_600SemiBold" }}>
              {title}
            </Text>
            {featured ? <PlanBadge label="Recommended" /> : null}
            {featured ? <PlanBadge label="Best value" /> : null}
          </View>
          <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 17, fontWeight: "800" }}>
            {featured && monthlyEquivalentLabel(pack.priceLabel) ? `${monthlyEquivalentLabel(pack.priceLabel)} · ${billingPeriodLabel(pack.id).toLowerCase()}` : billingPeriodLabel(pack.id)}
          </Text>
          {pack.trialLabel ? (
            <Text selectable style={{ color: colors.accent, fontWeight: "800" }}>
              14-day free trial
            </Text>
          ) : null}
          {featured && annualSavingsLabel(pack.priceLabel, packages) ? (
            <Text selectable style={{ color: colors.accent, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
              {annualSavingsLabel(pack.priceLabel, packages)}
            </Text>
          ) : null}
        </View>
        <Text selectable style={{ color: featured ? colors.accent : colors.text, fontSize: 17, lineHeight: 22, fontFamily: "Oswald_600SemiBold", textAlign: "right" }}>
          {displayPriceLabel(pack)}
        </Text>
      </View>
      <PrimaryButton label="Start 14-Day Free Trial" onPress={onPurchase} disabled={isLoading} compact />
    </Pressable>
  );
}

function PlanBadge({ label }: { label: string }) {
  return (
    <View style={{ borderRadius: radius.pill, backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: 4 }}>
      <Text selectable style={{ color: colors.accent, fontSize: 11, lineHeight: 14, fontWeight: "900" }}>
        {label}
      </Text>
    </View>
  );
}

function PlanLoadingCards() {
  return (
    <>
      {(["annual", "monthly"] as const).map((id) => (
        <PremiumCard key={id} tone={isFeaturedPackage(id) ? "locked" : "quiet"}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm }}>
                <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>
                  {planTitle(id)}
                </Text>
                {isFeaturedPackage(id) ? <PlanBadge label="Recommended" /> : null}
              </View>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 17, fontWeight: "800" }}>
                {billingPeriodLabel(id)}
              </Text>
              <Text selectable style={{ color: colors.accent, fontWeight: "800" }}>
                14-day free trial
              </Text>
            </View>
            <Text selectable style={{ color: colors.textMuted, fontSize: 16, fontWeight: "900" }}>
              Loading price...
            </Text>
          </View>
          <PrimaryButton label="Start 14-Day Free Trial" onPress={() => {}} disabled compact />
        </PremiumCard>
      ))}
      <InlinePlanStatus message={`Loading secure ${STORE_NAME} prices...`} />
    </>
  );
}

function PlanUnavailableCards({ showDeveloperDiagnostics, onRetry, isLoading }: { showDeveloperDiagnostics: boolean; onRetry: () => void; isLoading: boolean }) {
  return (
    <>
      <InlinePlanStatus
        message={
          showDeveloperDiagnostics
            ? `${STORE_NAME} prices could not be loaded yet. Check connection or billing offering setup.`
            : "Prices could not be loaded yet. Check your connection and try again."
        }
        actionLabel="Retry"
        onAction={onRetry}
        disabled={isLoading}
      />
      {(["annual", "monthly"] as const).map((id) => (
        <PremiumCard key={id} tone={isFeaturedPackage(id) ? "locked" : "quiet"}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm }}>
                <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>
                  {planTitle(id)}
                </Text>
                {isFeaturedPackage(id) ? <PlanBadge label="Recommended" /> : null}
              </View>
              <Text selectable style={{ color: colors.textMuted, fontSize: 13, lineHeight: 17, fontWeight: "800" }}>
                {billingPeriodLabel(id)}
              </Text>
              <Text selectable style={{ color: colors.accent, fontWeight: "800" }}>
                14-day free trial
              </Text>
            </View>
            <Text selectable style={{ color: colors.textMuted, fontSize: 16, fontWeight: "900" }}>
              Price unavailable
            </Text>
          </View>
          <SecondaryButton label="Retry to load price" onPress={onRetry} disabled={isLoading} compact />
        </PremiumCard>
      ))}
    </>
  );
}

function InlinePlanStatus({ message, actionLabel, onAction, disabled }: { message: string; actionLabel?: string; onAction?: () => void; disabled?: boolean }) {
  return (
    <View
      style={{
        borderRadius: radius.md,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.lineSoft,
        backgroundColor: colors.surfaceMuted,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
      {actionLabel && onAction ? <SecondaryButton label={actionLabel} onPress={onAction} disabled={disabled} compact /> : null}
    </View>
  );
}

function BenefitRow({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
        <Text selectable style={{ color: colors.accent, fontSize: 13, lineHeight: 17, fontWeight: "900" }}>
          ✓
        </Text>
      </View>
      <Text selectable style={{ ...type.body, color: colors.text, flex: 1 }}>
        {label}
      </Text>
    </View>
  );
}

function isFeaturedPackage(packageId: string): boolean {
  return packageId === "yearly" || packageId === "annual";
}

function orderPackagesForConversion<T extends { id: string }>(packs: T[]): T[] {
  return [...packs].sort((a, b) => (isFeaturedPackage(a.id) === isFeaturedPackage(b.id) ? 0 : isFeaturedPackage(a.id) ? -1 : 1));
}

function planTitle(packageId: string): string {
  if (packageId === "yearly" || packageId === "annual") return "Annual";
  return "Monthly";
}

function billingPeriodLabel(packageId: string): string {
  if (packageId === "yearly" || packageId === "annual") return "Billed annually";
  return "Billed monthly";
}

function pricePeriodSuffix(packageId: string): string {
  if (packageId === "yearly" || packageId === "annual") return "/ year";
  return "/ month";
}

function displayPriceLabel(pack: { id: string; priceLabel?: string }): string {
  const price = pack.priceLabel?.trim();
  if (!price) return "Price unavailable";
  const withoutExistingPeriod = price.replace(/\s*\/\s*(month|monthly|year|yearly|annual|annually)\s*$/i, "");
  return `${withoutExistingPeriod} ${pricePeriodSuffix(pack.id)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function openUrl(url?: string): void {
  if (!url) return;
  Linking.openURL(url).catch(() => {});
}

function RestoreFeedback({ status, message }: { status: string; message: string }) {
  const tone = status === "restored" ? "success" : status === "failed" ? "danger" : "quiet";
  return (
    <PremiumCard tone={tone}>
      <Text selectable style={{ ...type.body, color: colors.textMuted }}>
        {message}
      </Text>
    </PremiumCard>
  );
}

function TrustSection() {
  return (
    <View style={{ gap: spacing.sm, alignItems: "center" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm }}>
        {["14-day free trial", "Cancel anytime"].map((label) => (
          <View key={label} style={{ borderRadius: radius.pill, borderWidth: 1, borderColor: colors.lineSoft, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text selectable style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16, fontWeight: "900" }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      <Text selectable style={{ ...type.body, color: colors.textMuted, textAlign: "center" }}>
        Managed securely through your App Store or Google Play account.
      </Text>
    </View>
  );
}

function annualSavingsLabel(annualPrice: string, packages: Array<{ id: string; priceLabel: string }>): string | null {
  const annual = parsePrice(annualPrice);
  const monthly = parsePrice(packages.find((pack) => pack.id === "monthly")?.priceLabel);
  if (!annual || !monthly) return null;

  const yearlyMonthlyCost = monthly * 12;
  if (annual >= yearlyMonthlyCost) return null;
  const savings = Math.round(((yearlyMonthlyCost - annual) / yearlyMonthlyCost) * 100);
  return savings > 0 ? `Save ${savings}%` : null;
}

// "£99 / year" -> "£8.25 a month". Shown on the featured annual card so the
// comparison with the monthly price is made for the reader, not left to them.
function monthlyEquivalentLabel(annualPrice: string): string | null {
  const annual = parsePrice(annualPrice);
  if (!annual) return null;
  const symbol = (annualPrice.match(/^[^\d]*?([£$€])/) ?? [])[1] ?? "";
  const perMonth = annual / 12;
  const rounded = Number.isInteger(perMonth) ? String(perMonth) : perMonth.toFixed(2);
  return `${symbol}${rounded} a month`;
}

function parsePrice(value?: string): number | null {
  const match = value?.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : null;
}
