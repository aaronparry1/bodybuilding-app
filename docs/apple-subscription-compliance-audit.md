# Apple Subscription Compliance Audit

Date: 2026-06-18

Status: paywall polish implemented after audit. No EAS build.

## Executive Summary

Apple requires auto-renewable subscription purchase screens in the app binary to show the subscription title, subscription length, subscription price, and functional Terms of Use and Privacy Policy links.

Adaptive Strength Coach now displays the required subscription information more explicitly on the in-app paywall.

Current verdict after polish: **A) Paywall and metadata are aligned for subscription disclosure, assuming RevenueCat/App Store products load real localized prices successfully.**

Why:

- Terms and Privacy links are visible and point to the correct live pages.
- Monthly and annual plan titles are visible when products load.
- Real store prices are displayed when RevenueCat/App Store products load successfully.
- The paywall does **not** display `Price shown at checkout`.
- Subscription duration is now explicit with `Billed monthly` and `Billed annually`.
- Loaded product prices are now shown with `/ month` or `/ year` appended to the real store price string.
- If products fail to load, the paywall shows `Monthly` and `Annual` fallback cards with `Price unavailable` and a retry path.
- The annual product is rendered as `Annual`, including the RevenueCat package-title mapping.

This is not a product logic problem. It is a disclosure robustness problem.

## Apple Requirement Reference

Apple's App Store Connect subscription reference states that auto-renewable subscription duration and price are configured in App Store Connect.

Apple review rejection language for auto-renewable subscriptions commonly requires all of the following in the app binary:

- Title of auto-renewing subscription
- Length of subscription
- Price of subscription, and price per unit if appropriate
- Functional links to the Privacy Policy and Terms of Use / EULA

The app metadata must also include functional Terms of Use and Privacy Policy links.

Relevant Apple pages:

- Auto-renewable subscriptions overview: `https://developer.apple.com/app-store/subscriptions/`
- Auto-renewable subscription information: `https://developer.apple.com/help/app-store-connect/reference/in-app-purchases-and-subscriptions/auto-renewable-subscription-information/`

## Current Paywall Audit

Primary file:

- `app/(protected)/paywall.tsx`

Billing/product mapping:

- `src/application/billing/revenuecat-gateway.ts`
- `src/application/billing/subscription.ts`

### Subscription Title

Current paywall behavior after polish:

- When products are loading, placeholder cards show:
  - `Monthly`
  - `Annual`
- When RevenueCat products load, titles come from the mapped package:
  - `Monthly`
  - `Annual`

Evidence:

- `PlanLoadingCards()` renders `Monthly` and `Annual`.
- `RevenueCatGateway.mapPackage()` maps annual/yearly package title through `getPackageTitle()`.
- `getPackageTitle("yearly")` returns `Annual`.

Assessment:

- Compliant.
- `Annual` is used consistently because the store product and app copy refer to annual billing.

### Subscription Length / Duration

Current paywall behavior after polish:

- Duration is explicit on each plan card:
  - `Billed monthly`
  - `Billed annually`
- Price display appends a billing unit to the loaded store price:
  - store monthly price + `/ month`
  - store annual price + `/ year`

Assessment:

- Compliant / clearer.
- The paywall now shows subscription title, length, price, and billing unit together.

Implemented disclosure:

- Monthly card:
  - Title: `Monthly`
  - Duration line: `Billed monthly`
  - Price line: store price + `/ month`
- Annual card:
  - Title: `Annual`
  - Duration line: `Billed annually`
  - Price line: store price + `/ year`

### Subscription Price

Current paywall behavior after polish:

- When RevenueCat offerings load, `pack.priceLabel` is rendered on each plan card with `/ month` or `/ year`.
- In production RevenueCat mode, `priceLabel` comes from `pack.product.priceString`, which is the App Store / StoreKit localized price string.
- The paywall no longer contains:
  - `Price shown at checkout`
  - `Price set in store`
- If a package has no usable price string, the plan card shows `Price unavailable`.

Evidence:

- `app/(protected)/paywall.tsx` renders `displayPriceLabel(pack)`.
- `src/application/billing/revenuecat-gateway.ts` maps `priceLabel: pack.product.priceString`.
- Tests assert the paywall does not contain `Price shown at checkout` or `Price set in store`.

Answer:

The paywall displays the real store price **when products load successfully**.

It does **not** display `Price shown at checkout`.

Risk:

- `priceString` usually contains the localized price only, not the billing period.
- If App Store products fail to load, the app cannot truthfully display a real price and now says `Price unavailable` rather than implying price will be shown later at checkout.

Implemented fix:

- Keep using `pack.product.priceString` as source of truth.
- Format display as:
  - `${pack.priceLabel} / month`
  - `${pack.priceLabel} / year`
- Do not hardcode price amounts as production truth.

### Trial Disclosure

Current paywall behavior:

- Shows:
  - `14 days free`
  - `14-day free trial`
  - `Start 14-Day Free Trial`

Assessment:

- Good, assuming App Store Connect intro offer is actually 14 days on the products being reviewed.
- Trial copy is currently hardcoded rather than using RevenueCat `trialLabel`.
- That is acceptable only if store products are guaranteed to remain 14 days.

Recommended fix:

- Prefer deriving the display trial label from RevenueCat/store product metadata when available.
- Keep a safe fallback only if product metadata is missing.

### Terms of Use Link

Current paywall behavior:

- Visible `Terms` link.
- Fallback URL:
  - `https://adaptivestrengthcoach.com/terms`
- App config also contains the production Terms URL.

Assessment:

- Compliant.

### Privacy Policy Link

Current paywall behavior:

- Visible `Privacy` link.
- Fallback URL:
  - `https://adaptivestrengthcoach.com/privacy`
- App config also contains the production Privacy URL.

Assessment:

- Compliant.

## Subscription Screens Audit

### Settings Subscription Card

File:

- `app/(protected)/settings.tsx`

Current behavior:

- Shows plan status:
  - `Plan`
  - Free / Trial active / Premium, depending state
- Shows restore purchases.
- Shows upgrade.
- Shows manage subscription for premium users.
- Does not show subscription product price, product duration, or Terms/Privacy links directly.

Assessment:

- This screen is account/status management, not the purchase screen.
- It does not need to duplicate the full purchase disclosure as long as the purchase/paywall screen does.

### Account Subscription Section

File:

- `app/(protected)/(tabs)/account.tsx`

Current behavior:

- Shows subscription status.
- Shows start trial / view premium.
- Shows restore and manage controls.
- Does not show subscription product price/duration directly.

Assessment:

- Acceptable as a management surface.
- Full subscription purchase disclosure should remain concentrated on the paywall.

## Compliance Verdict

Verdict: **B) Metadata compliant but paywall should be tightened before the next subscription review build.**

### What Is Already Compliant

- Terms link visible in the paywall.
- Privacy link visible in the paywall.
- Terms URL is correct.
- Privacy URL is correct.
- Product titles are visible when products load.
- Real App Store price strings are used when products load.
- No `Price shown at checkout` copy remains.
- No `Price set in store` copy remains.
- No customer-facing RevenueCat/provider/entitlement wording appears on the paywall.

### What Is Not Robust Enough

1. Duration should be explicit on each product card.
   - Current: `Monthly`, `Yearly`
   - Safer: `Billed monthly`, `Billed annually`

2. Price should include the period.
   - Current: `£9.99` or localized store price string
   - Safer: `£9.99 / month`, `£99 / year`

3. Annual copy should be consistent.
   - Current loaded product title may be `Yearly`
   - Recommended: `Annual`

4. Products-unavailable state cannot show required purchase details.
   - This is acceptable as an error state, but a reviewer must be able to reach a loaded-product state.
   - StoreKit/RevenueCat/App Store Connect setup must be correct before submission.

## Exact Code Changes Required

No code was changed in this audit. Recommended next code patch:

### 1. Add explicit billing period metadata

Update `RevenueCatPackage` in `src/application/billing/subscription.ts`:

```ts
billingPeriodLabel?: string;
pricePeriodSuffix?: string;
```

Or derive via helpers from package ID:

```ts
function billingPeriodLabel(packageId: RevenueCatPackage["id"]): string {
  if (packageId === "monthly") return "Billed monthly";
  if (packageId === "yearly" || packageId === "annual") return "Billed annually";
  return "";
}

function pricePeriodSuffix(packageId: RevenueCatPackage["id"]): string {
  if (packageId === "monthly") return "/ month";
  if (packageId === "yearly" || packageId === "annual") return "/ year";
  return "";
}
```

### 2. Render explicit duration and price period on plan cards

Update `app/(protected)/paywall.tsx` plan cards:

```tsx
<Text>{pack.title}</Text>
<Text>{billingPeriodLabel(pack.id)}</Text>
<Text>{pack.priceLabel} {pricePeriodSuffix(pack.id)}</Text>
```

Do not hardcode `£9.99` / `£99` in the paywall. Keep `pack.priceLabel` from StoreKit.

### 3. Rename annual loaded title

Update `getPackageTitle()` in `src/application/billing/revenuecat-gateway.ts`:

```ts
if (id === "yearly" || id === "annual") return "Annual";
```

### 4. Align mock/fallback package titles

Update `subscriptionPackages` and `MockRevenueCatGateway` only for title/duration consistency. These are not production store truth, but should match UI expectations.

### 5. Add/adjust tests

Update paywall/source tests to assert:

- Monthly card has `Billed monthly`.
- Annual card has `Billed annually`.
- Price line appends `/ month` for monthly.
- Price line appends `/ year` for annual.
- Terms URL is `https://adaptivestrengthcoach.com/terms`.
- Privacy URL is `https://adaptivestrengthcoach.com/privacy`.
- Paywall still does not show `Price shown at checkout`.
- Paywall still does not hardcode production prices as source of truth.

## Build / No-Build Recommendation

Do not submit another subscription-review build until the paywall explicitly displays:

- Monthly title
- Monthly duration
- Monthly localized App Store price + period
- Annual title
- Annual duration
- Annual localized App Store price + period
- Terms link
- Privacy link

Recommended next step: **make the small paywall disclosure patch, run verification, then include it in the next iOS patch build.**

No EAS build was started for this audit.
