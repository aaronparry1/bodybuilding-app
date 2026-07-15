import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { customerSafeServiceMessage, shouldShowDeveloperDiagnostics } from "@/application/runtime/customer-facing-errors";

describe("production diagnostics visibility", () => {
  it("keeps developer diagnostics available outside production only", () => {
    expect(shouldShowDeveloperDiagnostics("development")).toBe(true);
    expect(shouldShowDeveloperDiagnostics("staging")).toBe(true);
    expect(shouldShowDeveloperDiagnostics("production")).toBe(false);
  });

  it("does not expose missing env variable names in production messages", () => {
    expect(customerSafeServiceMessage("Missing EXPO_PUBLIC_SUPABASE_URL.", "production")).toBe(
      "We couldn’t connect to online services right now.",
    );
    expect(customerSafeServiceMessage("RevenueCat API key is missing.", "production")).toBe(
      "We couldn’t connect to online services right now.",
    );
    expect(customerSafeServiceMessage("Missing EXPO_PUBLIC_SUPABASE_URL.", "production", "Account backup is unavailable right now. Your workouts stay saved on this device.")).toBe(
      "Account backup is unavailable right now. Your workouts stay saved on this device.",
    );
  });

  it("preserves raw diagnostics in development and staging", () => {
    expect(customerSafeServiceMessage("Missing EXPO_PUBLIC_SUPABASE_URL.", "development")).toBe("Missing EXPO_PUBLIC_SUPABASE_URL.");
    expect(customerSafeServiceMessage("RevenueCat API key is missing.", "staging")).toBe("RevenueCat API key is missing.");
  });

  it("gates production Settings, Account, Paywall, and Diagnostics surfaces", () => {
    const settingsSource = readFileSync("app/(protected)/settings.tsx", "utf8");
    const accountSource = readFileSync("app/(protected)/(tabs)/account.tsx", "utf8");
    const paywallSource = readFileSync("app/(protected)/paywall.tsx", "utf8");
    const diagnosticsSource = readFileSync("app/(protected)/diagnostics.tsx", "utf8");

    expect(settingsSource).toContain("customerSafeServiceMessage");
    expect(settingsSource).toContain("customerSafeServiceMessage");
    expect(settingsSource).toContain("showDevTools");
    expect(settingsSource).not.toContain("<ServiceNotice message={accountError}");
    expect(settingsSource).toContain("canonicalActivePlanState");
    expect(settingsSource).not.toContain("We couldn’t connect to subscription services right now.");
    expect(settingsSource).not.toContain('label="Entitlement"');
    expect(accountSource).toContain("showDiagnostics ? <Pill label={provider}");
    expect(accountSource).toContain("showDiagnostics && !isRevenueCatConfigured");
    expect(accountSource).toContain("Account backup is unavailable right now. Your workouts stay saved on this device.");
    expect(accountSource).toContain("<ServiceNotice message={accountError ?? subscriptionError");
    expect(paywallSource).toContain("customerSafeServiceMessage");
    expect(paywallSource).toContain("showDeveloperDiagnostics");
    expect(paywallSource).not.toContain("Current plan:");
    expect(paywallSource).not.toContain("Billing provider:");
    expect(diagnosticsSource).toContain("if (isProduction)");
    expect(diagnosticsSource).toContain("Diagnostics unavailable");
  });
});
