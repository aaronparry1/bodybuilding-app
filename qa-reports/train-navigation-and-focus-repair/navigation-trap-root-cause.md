# Navigation-trap root cause

Verdict: **PROVEN**.

Three mounted behaviors combined to create the trap:

1. `src/application/shell/production-protected-layout.tsx` redirected every authenticated user with a resumable attempt back to Train whenever the current route was not Train. Pausing and navigating away therefore immediately triggered another Train redirect.
2. `app/(protected)/(tabs)/_layout.tsx` deliberately returned no tab bar while Train was focused.
3. `app/(protected)/(tabs)/train.tsx` wired the large X to an ambiguous close modal instead of a direct, durable minimise action.

The correction records the attempt as `paused` before leaving. `shouldAutoEnterCanonicalActiveWorkout` now auto-enters only a genuinely `started` retained attempt. A deliberately paused attempt remains accessible from authenticated tabs and cannot fall through to onboarding. The tab bar stays mounted; every tab departure from active Train must persist the pause first and is cancelled if that write fails.

The hardware/system back handler uses the same coordinator. A running rest timer is stored independently by the canonical rest-timer repository and is not deleted by minimisation.
