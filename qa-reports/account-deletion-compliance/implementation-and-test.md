# Account-deletion implementation and verification

Verification date: 2026-08-03 (Europe/London)

## Implemented boundaries

- Public request route: `POST /api/delete-account/request`
- Public verification page: `/delete-account/verify/`
- Authenticated confirmation route: `POST /api/delete-account/confirm`
- In-app entry: Account → Account controls → Delete account
- Production Settings entry: Settings → Account → Delete account

The request accepts a bounded email address in a POST body, asks Supabase for a passwordless verification link with account creation disabled, and returns a non-enumerating response. The confirmation endpoint derives the owner from the bearer token, deletes the matching RevenueCat customer first, then deletes the matching Supabase auth user and cascade-linked profile. It reports completion only when every configured provider succeeds.

## Verification completed before deployment

| Check | Result |
|---|---|
| Focused account-deletion tests | PASS — 14/14 |
| Selected production/account/cloud boundary tests | PASS — 22/22 |
| Website static validation | PASS |
| TypeScript | PASS |
| Full automated suite | PASS — 390 files, 2,393 tests |
| Production Expo public config | PASS — production route, expected package/bundle IDs, Android permissions `[]` |
| Web export | PASS |
| Production payload scan | PASS — 27 files, 0 findings |

## Pre-deployment limitation

The Railway service has Supabase configuration but does not yet have `REVENUECAT_SECRET_API_KEY`. The source deliberately fails closed before mutation when that credential is absent. Public deployment and request initiation can be verified, but a complete disposable-account deletion cannot be certified until an authorised RevenueCat server secret is configured. No client-public RevenueCat key is accepted for deletion.
