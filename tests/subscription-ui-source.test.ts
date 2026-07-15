import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const settingsSource = () => readFileSync("app/(protected)/settings.tsx", "utf8");
const paywallSource = () => readFileSync("app/(protected)/paywall.tsx", "utf8");
const accountSource = () => readFileSync("app/(protected)/(tabs)/account.tsx", "utf8");
const subscriptionSource = () => readFileSync("src/application/billing/subscription.ts", "utf8");

describe("subscription UI surfaces", () => {
  it("shows a customer-facing subscription plan card in Settings", () => {
    const source = settingsSource();

    expect(source).toContain('SectionHeader title="Subscription"');
    expect(source).toContain("planLabel");
    expect(source).toContain('label="Manage Subscription"');
    expect(source).toContain('label="Upgrade"');
    expect(source).toContain('restoreStatus === "restoring" ? "Restoring..." : "Restore Purchases"');
    expect(source).toContain("restoreMessage");
    expect(source).toContain("Restoring...");
    expect(source).toContain("restoreMessage");
    expect(source).toContain("canonicalActivePlanState");
    expect(source).toContain("canonicalActivePlanState");
    expect(source).not.toContain('label="Entitlement"');
    expect(source).not.toContain('label="Refresh Status"');
  });

  it("uses a trial-first store paywall without fake final prices", () => {
    const source = paywallSource();

    expect(source).toContain("Build More Muscle.");
    expect(source).toContain("Get Stronger.");
    expect(source).toContain("Stop Guessing.");
    expect(source).toContain("14-Day Free Trial");
    expect(source).toContain("Cancel anytime.");
    expect(source).toContain("Managed securely through your App Store or Google Play account.");
    expect(source).toContain("Loading price...");
    expect(source).toContain("Loading secure App Store prices...");
    expect(source).toContain("InlinePlanStatus");
    expect(source).toContain("Price unavailable");
    expect(source).toContain("Billed monthly");
    expect(source).toContain("Billed annually");
    expect(source).toContain('/ month');
    expect(source).toContain('/ year');
    expect(subscriptionSource()).toContain("chooseBillingPackages");
    expect(source).toContain("restoreMessage");
    expect(source).toContain("Restoring...");
    expect(source).toContain("RestoreFeedback");
    expect(source).not.toContain("Store checkout");
    expect(source).not.toContain("store-backed checkout");
    expect(source).not.toContain("Trial eligibility, purchase state");
    expect(source).not.toContain("Current plan:");
    expect(source).not.toContain("Entitlement:");
    expect(source.toLowerCase()).not.toContain("entitlement");
    expect(source).not.toContain("Billing provider:");
    expect(source).not.toContain("RevenueCat");
    expect(source).not.toContain("Price shown at checkout");
    expect(source).not.toContain("Price set in store");
    expect(source).not.toContain('tone="danger"');
    expect(source).not.toContain("£9.99/month");
    expect(source).not.toContain("£99/year");
    expect(source).not.toContain("$9.99");
    expect(source).not.toContain("$79.99");
  });

  it("exposes account restore and customer-center management paths", () => {
    const source = accountSource();

    expect(source).toContain("buildDataSafetyStatus");
    expect(source).toContain("dataSafety.status");
    expect(source).toContain("Start Free Trial");
    expect(source).toContain('restoreStatus === "restoring" ? "Restoring..." : "Restore"');
    expect(source).toContain("restoreMessage");
    expect(source).toContain("Restoring...");
    expect(source).toContain('label="Manage"');
    expect(source).toContain("Refresh subscription status");
    expect(source).toContain("Using recent premium access");
    expect(source).not.toContain("Local account");
    expect(source).not.toContain("Local-first training is available anytime.");
    expect(source).not.toContain("Free covers basic logging.");
    expect(source).not.toContain("Pro is active.");
  });

  it("keeps restore purchase outcomes clear and non-silent in the subscription context", () => {
    const source = readFileSync("src/application/billing/subscription-context.tsx", "utf8");

    expect(source).toContain("restoreStatus");
    expect(source).toContain("restoreMessage");
    expect(source).toContain("setRestoreStatus(\"restoring\")");
    expect(source).toContain("buildRestorePurchasesResult");
    expect(source).toContain("buildRestorePurchasesFailureResult");
  });
});
