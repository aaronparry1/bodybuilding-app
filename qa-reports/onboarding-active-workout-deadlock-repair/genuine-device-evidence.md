# Genuine-device evidence

## Verdict

**PROVEN defect in Build 48; replacement iPhone verification remains NOT PROVEN.**

The supplied genuine-iPhone screen showed an existing user on the final onboarding screen with:

> Finish or discard your current workout, then return here to create this programme. Your choices are still saved on this screen.

The user could not reach that workout because the mounted production protected layout had already placed onboarding in front of all authenticated tabs. The warning is direct evidence that the onboarding creation guard could see retained training which startup routing had ignored.

The screenshot is authoritative evidence against the earlier source-only claim. No device data was accessed, reset, regenerated, rebound, or modified in this repair.

## Reproduced contradiction

The exact authority split was reproduced from repository state:

- production startup: `app-production/(protected)/_layout.tsx` → `src/application/shell/production-protected-layout.tsx`;
- production onboarding: `app-production/(protected)/onboarding.tsx` → `app/(protected)/onboarding.tsx`;
- the old production startup branch trusted `settings.onboardingCompleted`;
- the onboarding guard independently read the canonical plan and active-session ledger.

This explains how the guard could truthfully detect a workout while startup still routed the same retained installation into first-run setup.

## Scope

This evidence certifies the source defect and its production route. It does not certify a replacement binary on a genuine iPhone. A replacement TestFlight candidate must be built and installed in a separate authorised task.
