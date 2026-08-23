import { describe, expect, it } from "vitest";
import { applyQaPremiumFixture, isQaPremiumFixtureEnabled } from "@/application/billing/qa-premium-fixture";
import { canAccess, normalizeSubscriptionState } from "@/application/billing/subscription";

const free = normalizeSubscriptionState({ status: "free", provider: "revenuecat", willRenew: false });

describe("premium QA entitlement fixture", () => {
  it("is impossible to enable in a production runtime", () => {
    expect(isQaPremiumFixtureEnabled("production", true)).toBe(false);
    expect(applyQaPremiumFixture(free, isQaPremiumFixtureEnabled("production", true))).toEqual(free);
  });

  it("grants a local visual entitlement without mutating the source billing state", () => {
    const effective = applyQaPremiumFixture(free, isQaPremiumFixtureEnabled("development", true));
    expect(effective).toMatchObject({ status: "trial", provider: "mock", isPremium: true, willRenew: false, isSandbox: true });
    expect(canAccess(effective, "premium_programmes")).toBe(true);
    expect(free).toMatchObject({ status: "free", provider: "revenuecat", isPremium: false });
  });
});
