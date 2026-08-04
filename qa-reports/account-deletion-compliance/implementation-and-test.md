# Account-deletion implementation and verification

Verification date: 2026-08-04 (Europe/London)

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
| Focused account-deletion tests | PASS — 15/15, including mobile WebKit opaque-origin handling |
| Selected production/account/cloud boundary tests | PASS — 22/22 |
| Website static validation | PASS |
| TypeScript | PASS |
| Full automated suite | PASS — 390 files, 2,394 tests after the browser-derived regression |
| Production Expo public config | PASS — production route, expected package/bundle IDs, Android permissions `[]` |
| Web export | PASS |
| Production payload scan | PASS — 27 files, 0 findings |

## Deployed result

The Railway service now has the required RevenueCat server-key category. The value was entered by the owner directly in Railway and was never printed, copied into source or exposed to the client. Deployment `c41c1cd8-d85a-4a54-b12d-947f84b1a29b` succeeded.

A synthetic-only production-hosted test verified the complete configured deletion transaction: RevenueCat customer deletion, Supabase auth deletion and profile cascade all succeeded, and postconditions proved the disposable records absent. Details and the remaining narrow email-delivery evidence limit are recorded in `e2e-deletion-result.md`.
