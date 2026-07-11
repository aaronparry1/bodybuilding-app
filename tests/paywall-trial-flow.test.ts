import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const paywallSource = () => readFileSync("app/(protected)/paywall.tsx", "utf8");
const trainSource = () => readFileSync("app/(protected)/(tabs)/train.tsx", "utf8");
const homeSource = () => readFileSync("app/(protected)/(tabs)/index.tsx", "utf8");
const progressSource = () => readFileSync("app/(protected)/(tabs)/analytics.tsx", "utf8");
const planSource = () => readFileSync("app/(protected)/(tabs)/programmes.tsx", "utf8");
const settingsSource = () => readFileSync("app/(protected)/settings.tsx", "utf8");
const premiumGateSource = () => readFileSync("src/application/billing/premium-access.tsx", "utf8");
const appConfigSource = () => readFileSync("app.config.ts", "utf8");
const subscriptionSource = () => readFileSync("src/application/billing/subscription.ts", "utf8");
const subscriptionContextSource = () => readFileSync("src/application/billing/subscription-context.tsx", "utf8");

describe("paywall and trial flow", () => {
  it("renders a branded paywall with trial messaging and premium feature bullets", () => {
    const source = paywallSource();

    expect(source).toContain("Adaptive Strength Coach Premium");
    expect(source).toContain("Build More Muscle.");
    expect(source).toContain("Get Stronger.");
    expect(source).toContain("Stop Guessing.");
    expect(source).toContain("14-Day Free Trial");
    expect(source).toContain("Cancel anytime.");
    expect(source).toContain("Build muscle and strength with confidence");
    expect(source).toContain("Know exactly what to do every workout");
    expect(source).toContain("Track progress automatically");
    expect(source).toContain("Recover without losing momentum");
    expect(source).toContain("Powerlifting and strength coaching included");
    expect(source).toContain("BenefitRow");
  });

  it("handles loading, delayed App Store prices, restore, retry, and legal links", () => {
    const source = paywallSource();

    expect(source).toContain("Loading price...");
    expect(source).toContain("Loading secure App Store prices...");
    expect(source).toContain("InlinePlanStatus");
    expect(source).toContain("Price unavailable");
    expect(source).toContain("Prices could not be loaded yet. Check your connection and try again.");
    expect(source).toContain("Retry");
    expect(source).toContain("Restore Purchases");
    expect(source).toContain("Terms");
    expect(source).toContain("Privacy");
    expect(source).toContain("https://adaptivestrengthcoach.com/terms");
    expect(source).toContain("https://adaptivestrengthcoach.com/privacy");
  });

  it("supports monthly and annual plan selection without fake hardcoded prices", () => {
    const source = paywallSource();

    expect(source).toContain("Start 14-Day Free Trial");
    expect(source).not.toContain("Start 7-Day Free Trial");
    expect(source).toContain("Billed monthly");
    expect(source).toContain("Billed annually");
    expect(source).toContain('/ month');
    expect(source).toContain('/ year');
    expect(source).toContain("displayPriceLabel(pack)");
    expect(source).toContain("pricePeriodSuffix(pack.id)");
    expect(source).toContain("Best value");
    expect(source).toContain("Recommended");
    expect(source).toContain("orderPackagesForConversion(packages)");
    expect(source).toContain("accessibilityLabel={`Start 14-Day Free Trial with ${title}`}");
    expect(source).toContain("annualSavingsLabel");
    expect(source).not.toContain("Price shown at checkout");
    expect(source).not.toContain("Price set in store");
    expect(source).not.toContain("$9.99");
    expect(source).not.toContain("$79.99");
  });

  it("keeps the paywall conversion-focused without internal store plumbing copy", () => {
    const source = paywallSource();

    expect(source).not.toContain("Store checkout");
    expect(source).not.toContain("store-backed checkout");
    expect(source).not.toContain("Trial eligibility, purchase state");
    expect(source).not.toContain("RevenueCat");
    expect(source.toLowerCase()).not.toContain("entitlement");
    expect(source).toContain("Managed securely through your App Store or Google Play account.");
    expect(source).toContain("Restore Purchases");
    expect(source).toContain("Not now");
    expect(source).not.toContain('tone="danger"');
  });

  it("renders a stable Train sales page for free users instead of a blank premium gate", () => {
    const source = trainSource();

    expect(source).toContain("useSubscription");
    expect(source).toContain("TrainPremiumSalesPage");
    expect(source).toContain("Build More Muscle.");
    expect(source).toContain("Get Stronger.");
    expect(source).toContain("Stop Guessing.");
    expect(source).toContain("Your adaptive training plan is ready. Start your free trial to unlock coached workouts, progression, and recovery guidance.");
    expect(source).toContain("14-day free trial");
    expect(source).toContain("Cancel anytime.");
    expect(source).toContain("Know exactly what to do every workout");
    expect(source).toContain("Adaptive progression based on your performance");
    expect(source).toContain("Warm-Up Sets and Session Prep included");
    expect(source).toContain("Strength Dashboard, PRs, and e1RM tracking");
    expect(source).toContain("Recovery & Capacity guidance");
    expect(source).toContain("Start 14-Day Free Trial");
    expect(source).toContain("Restore Purchases");
    expect(source).toContain("View Plan");
    expect(source).toContain("Checking your plan access");
    expect(source).toContain("router.push(\"/(protected)/paywall\")");
    expect(source).toContain("router.push(\"/(protected)/(tabs)/programmes\")");
    expect(source).toContain("if (!subscription.isPremium) return <TrainPremiumSalesPage subscription={subscription} />;");
    expect(source).not.toContain("if (!isPremium) return null;");
    expect(source).not.toContain("PremiumRequiredScreen");
    expect(source).not.toContain("Start your first coached workout");
    expect(source).not.toContain("7-Day");
    expect(source).not.toContain("Current entitlement");
  });

  it("keeps Progress behind premium access", () => {
    expect(progressSource()).toContain("usePremiumAccess");
    expect(progressSource()).toContain("Unlock your progress dashboard");
  });

  it("keeps plan preview and settings accessible without premium gates", () => {
    expect(planSource()).not.toContain("usePremiumAccess");
    expect(settingsSource()).not.toContain("usePremiumAccess");
    expect(premiumGateSource()).toContain("Free access includes onboarding, plan preview, the guide, settings, account, and restore purchases.");
  });

  it("keeps premium gate copy customer-facing", () => {
    const source = premiumGateSource();

    expect(source).toContain("useSubscription");
    expect(source).toContain("isPremium");
    expect(source).toContain("Start 14-Day Free Trial");
    expect(source).toContain("Subscriptions are managed securely through your App Store or Google Play account.");
    expect(source).not.toContain("Current entitlement");
  });

  it("does not leave old trial or internal billing copy on customer-facing paywall surfaces", () => {
    const paywall = paywallSource();
    const premiumGate = premiumGateSource();
    const settings = settingsSource();

    expect(`${paywall}\n${premiumGate}`).not.toContain("7-Day Free Trial");
    expect(`${paywall}\n${premiumGate}`).not.toContain("7-day free trial");
    expect(`${paywall}\n${premiumGate}\n${trainSource()}`).not.toContain("7-Day Free Trial");
    expect(`${paywall}\n${premiumGate}\n${trainSource()}`).not.toContain("7-day free trial");
    expect(paywall).not.toContain("Entitlement:");
    expect(paywall.toLowerCase()).not.toContain("entitlement");
    expect(trainSource()).not.toContain("Current entitlement");
    expect(trainSource()).not.toContain("RevenueCat");
    expect(trainSource().toLowerCase()).not.toContain("entitlement");
    expect(paywall).not.toContain("Billing provider:");
    expect(paywall).not.toContain("handled by RevenueCat");
    expect(paywall).not.toContain("RevenueCat");
    expect(paywall).not.toContain("Store checkout");
    expect(paywall).not.toContain("Price shown at checkout");
    expect(paywall).not.toContain("Price set in store");
    expect(paywall).not.toContain("£9.99/month");
    expect(paywall).not.toContain("£99/year");
    expect(subscriptionContextSource()).toContain("chooseBillingPackages(nextPackages, fallbackPackages)");
    expect(settings).not.toContain("Premium entitlement is active.");
  });

  it("uses production Terms and Privacy links by default", () => {
    const config = appConfigSource();
    const paywall = paywallSource();

    expect(config).toContain("https://adaptivestrengthcoach.com/terms");
    expect(config).toContain("https://adaptivestrengthcoach.com/privacy");
    expect(paywall).toContain("https://adaptivestrengthcoach.com/terms");
    expect(paywall).toContain("https://adaptivestrengthcoach.com/privacy");
    expect(config).not.toContain("https://example.com/terms");
    expect(config).not.toContain("https://example.com/privacy");
  });

  it("gates extra-session entry points before creating sessions", () => {
    const source = homeSource();

    expect(source).toContain("useSubscription");
    expect(source).toContain("requirePremiumForExtraSession");
    expect(source).toContain("openExtraSessionPaywall");
    expect(source).toContain("Checking subscription");
    expect(source).toContain("Premium required");
    expect(source).toContain("router.push(\"/(protected)/paywall\")");
    expect(source).toContain("if (!requirePremiumForExtraSession()) return;");
    expect(source).toContain("if (requirePremiumForExtraSession()) setShowExtraSession(true);");
    expect(source.indexOf("if (!requirePremiumForExtraSession()) return;")).toBeLessThan(source.indexOf("programmeRepository.save(programme);"));
  });

  it("keeps paid extra-session creation safe when launched from the modal button", () => {
    const source = homeSource();

    expect(source).toContain("const selectedMode = isExtraSessionMode(modeOverride) ? modeOverride : extraMode;");
    expect(source).toContain("function isExtraSessionMode(value: unknown): value is ExtraSessionMode");
    expect(source).toContain("function extraSessionKindForMode(mode: ExtraSessionMode)");
    expect(source).toContain("const sessionKind = extraSessionKindForMode(selectedMode);");
    expect(source).toContain("Unable to create session");
    expect(source).toContain("That extra session could not be built right now. Try another option.");
    expect(source).toContain('<PrimaryButton label="Create Session" onPress={() => onStart()} />');
    expect(source).not.toContain('<PrimaryButton label="Create Session" onPress={onStart} />');
  });

  it("gates Home Start and Continue Workout before session creation or navigation", () => {
    const source = homeSource();

    expect(source).toContain("requirePremiumForTodayWorkout");
    expect(source).toContain("requirePremiumForCoachedAction");
    expect(source).toContain("Coached workouts are part of Adaptive Strength Coach. Start a trial to unlock them.");
    expect(source).toContain("{ text: \"Start Free Trial\", onPress: openPremiumPaywall }");
    expect(source).toContain("{ text: \"View Premium\", onPress: openPremiumPaywall }");
    expect(source).toContain("if (!requirePremiumForTodayWorkout(\"continue\")) return;");
    expect(source).toContain("if (!requirePremiumForTodayWorkout(\"start\")) return;");
    expect(source.indexOf("if (!requirePremiumForTodayWorkout(\"continue\")) return;")).toBeLessThan(source.indexOf("router.push(\"/(protected)/(tabs)/train\")"));
    expect(source.indexOf("if (!requirePremiumForTodayWorkout(\"start\")) return;")).toBeLessThan(source.indexOf("programmeRepository.save(todayProgramme);"));
    expect(source.indexOf("if (!requirePremiumForTodayWorkout(\"start\")) return;")).toBeLessThan(source.indexOf("programmeRepository.selectProgrammeDay"));
    expect(source).toContain("router.push(\"/(protected)/onboarding\")");
  });
});
