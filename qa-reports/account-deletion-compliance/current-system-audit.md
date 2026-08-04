# Adaptive Strength Coach account-deletion audit

Audit date: 2026-08-04 (Europe/London)

## Public failure and hosting root cause

- Canonical URL: `https://adaptivestrengthcoach.com/delete-account/`
- Developer/store identity: Adaptive Strength Coach by Arx Algorithms; Android package `com.aaronparry.adaptivestrengthcoach`.
- Hosting: the tracked `website/` Node static site is deployed to Railway project `adaptive-strength-coach-site`, production service `adaptive-strength-coach-site`.
- DNS/custom-domain state: the Railway custom domain remains active, but the service had zero active deployments.
- The latest deployment before this repair was Railway deployment `901ae31b-6e1b-4147-bf55-7f3b5d4470c7`, created 2026-06-25 and later `REMOVED` after remaining crashed for too long. Railway stopped its container on 2026-07-29.
- Consequently Railway served its platform fallback for every website route. Direct checks of `/`, `/privacy/`, `/download/`, `/delete-account` and `/delete-account/` all returned HTTP 404. This was not a missing-directory rewrite alone.

## Existing implementation before repair

- `website/public/delete-account/index.html` existed in source but was an information-only `mailto:` page.
- `website/server.mjs` only served static files and had no deletion request or confirmation handler.
- The production app mounted `app-production`, whose Account tab re-exported `app/(protected)/(tabs)/account.tsx`. Neither that Account screen nor production Settings exposed account deletion; Logout was the only account lifecycle action.
- The privacy policy existed at `website/public/privacy/index.html`, but used conditional/ambiguous retention and analytics language that did not match the live stack precisely.

## Live data authority and processors

The Railway service is configured for Supabase project `xtaavbidbaxsowsqyyxq` (`Strength App`). It had been auto-paused as an inactive free project and was restored without changing schema or user data on 2026-08-03.

Live inspection after restore proved:

- 4 auth users existed before the disposable-account test; no real account was read or modified.
- The only public table is `public.profiles`.
- `profiles.id` references `auth.users.id ON DELETE CASCADE`.
- `public.profiles` contained 0 rows at inspection time.
- Supabase Storage had 0 buckets and 0 objects.
- No Supabase Edge Functions were deployed.
- No auth audit rows were persisted in `auth.audit_log_entries` at inspection time.
- The current free plan has no automatic database backups and one-day platform-log retention.

The repository contains cloud repositories for programmes, exercises, settings and workout history, but their expected live tables are not present in this production project. Signed-in sync requests therefore fail closed and training remains local-first. The code must not be used as evidence that those absent cloud tables currently retain user training records.

RevenueCat is mounted in production. After authentication, `SubscriptionProvider` calls `RevenueCatGateway.identifyUser(user.id)`, and `RevenueCatGateway` calls `Purchases.logIn(user.id)`. RevenueCat therefore stores a customer profile under the Supabase user UUID and must be erased separately. The existing `test_`, `appl_` and `goog_` keys are client-public keys. A synthetic capability probe proved that a public key can create/read a test customer (HTTP 201) but cannot delete it (HTTP 401). A server-side RevenueCat secret is required.

There is no separate analytics, advertising or crash-reporting SDK in `package.json` or the production route. Supabase and RevenueCat process operational/authentication/subscription events. Website hosting processes routine request metadata. The app declares no explicit Android permissions in resolved Expo public config; store billing and network permissions may be supplied by the platform/native dependencies.

## Implemented deletion boundary

The new public flow:

1. accepts only a bounded email address through a POST body, never a URL query;
2. rate-limits hashed IP and email identifiers in process memory and uses a honeypot field;
3. sends a Supabase passwordless email with `create_user: false`, preventing deletion requests from creating accounts;
4. returns the same public response for existing and unknown emails;
5. keeps the one-time access token in the URL fragment, strips it immediately in the browser, and sends it only in an Authorization header;
6. resolves the authenticated owner from Supabase rather than accepting a user ID from the browser;
7. requires successful RevenueCat deletion (or an already-absent RevenueCat customer) before deleting the matching Supabase auth user;
8. relies on the proven `ON DELETE CASCADE` for the live profile;
9. shows a non-sensitive receipt only after every required configured step completes;
10. fails closed before any mutation when `REVENUECAT_SECRET_API_KEY` is absent.

Cross-provider deletion is not a distributed transaction. RevenueCat is deliberately deleted first. If the later Supabase request fails, the auth account remains and the same verified owner can retry; opening the app could recreate the RevenueCat profile before retry. The UI never claims completion without both successful responses.

## Retention and deletion claims supported by evidence

| Category | Actual behavior |
|---|---|
| Supabase auth user, identities and sessions | Permanently removed by the admin user-deletion API after owner-token verification. |
| Live `profiles` row | Deleted by the verified `ON DELETE CASCADE` foreign key. |
| Other cloud training rows | None exist in the inspected live schema. Future account-linked rows are covered only if they retain a verified cascade/explicit deletion contract. |
| Supabase Storage | No buckets or objects exist. |
| RevenueCat customer profile and entitlement/purchase history | Deleted through the RevenueCat server API using the same Supabase user UUID. A disposable production test verified the customer becomes absent. |
| Apple/Google transaction records and subscription | Not deleted or cancelled by app-account deletion; controlled by the relevant store for billing, fraud, tax and legal purposes under its own retention policy. |
| Device-local training state | Not remotely accessible; remains until the user clears app storage or uninstalls. |
| Supabase platform logs | Current free-plan retention is one day; email/token are not written by the application logger. |
| Railway service logs | Application does not log deletion email, token or body. Platform request metadata follows Railway's plan-specific retention. Exact workspace tier was not exposed by the CLI and is an evidence gap. |
| Support mail | Automated flow creates no support mail. Separately initiated support correspondence has no configured fixed deletion schedule; this remains a privacy-policy governance gap. |

## Current truthful status

The source implementation, focused/full verification, Railway deployment, public HTTP checks and mobile-WebKit request initiation are complete. The canonical slash and no-slash URLs return HTTP 200. Railway now contains the required RevenueCat server-key category (the value was never printed or stored in source), and deployment `c41c1cd8-d85a-4a54-b12d-947f84b1a29b` completed successfully.

A synthetic-only production-hosted deletion test then created a disposable Supabase auth user, cascade-linked profile and RevenueCat customer, called the public confirmation endpoint with that owner's valid bearer token, and verified all three were absent afterward. The endpoint returned HTTP 200 with a valid non-sensitive deletion receipt. No real customer data was accessed and no store subscription was created or cancelled. The passwordless request UI was verified separately in mobile WebKit; actual email delivery to a disposable external mailbox was not exercised. Play Console submission has not occurred.
