# Rendered results

## Environment

- platform: Expo web in a real Chromium browser
- Router root: `app-production`
- URL origin: `http://127.0.0.1:8093`
- mode: development server rendering the production route tree
- auth: documented offline/local path
- billing: mock/local
- data: synthetic

## Journey exercised

1. Completed the production onboarding flow.
2. Constructed the canonical five-day hypertrophy plan through the mounted UI.
3. Activated local mock access.
4. Started the first canonical workout.
5. Paused and left it with zero completed sets.
6. Navigated directly to `/onboarding`.
7. Observed the mounted route resolve to `/train`.
8. Reloaded the browser.
9. Observed `/train` and the same paused `Push hypertrophy A` workout again.

## Result

- onboarding rendered over a valid active workout: **no**
- active workout exposed: **yes**
- workout preserved after restart: **yes**
- impossible “finish or discard” warning rendered: **no**
- screenshot: `output/playwright/onboarding-active-workout-production-route.png`
- screenshot SHA-256: `c9cde1d987fad0397db6f82bec635017ce9ec35975104da2c303ecd07b49fe81`

## Limitations

- the browser journey used the local/offline auth path; authenticated account ownership and hydration permutations are covered by production-authority tests;
- actionable unreadable/account-mismatch recovery was not deliberately rendered because browser control cannot safely rewrite local storage;
- the browser console reported a pre-existing nested-button HTML warning in the mock paywall. It did not occur in the routing authority and is retained as a separate P2 finding;
- genuine replacement-iPhone verification is **NOT PROVEN**.
