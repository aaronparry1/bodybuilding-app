# Build 47 onboarding P0 repair

## Verdict

- Existing-user source and automated routing contract: **PROVEN**
- Atomic onboarding creation contract: **PROVEN**
- Duplicate training-days resolution: **PROVEN**
- Rendered web repair: **PARTIALLY PROVEN**
- Genuine iPhone repair: **NOT PROVEN**
- Build 47 release readiness: **UNSAFE**
- Repository readiness for a new replacement TestFlight candidate: **PROVEN**

Build 47 itself remains rejected as a user-facing candidate. Commit `dfaebe7` repairs the source without changing prescriptions, coaching policy, dependencies, app version, or build number. A new binary and genuine iPhone verification are still required.

## Root causes

The protected router formerly treated `settings.onboardingCompleted === false` as authoritative before canonical-plan and account-data restoration had settled. The release reconciler also returned `onboarding_required` before checking for a saved plan. Missing or stale compatibility metadata could therefore hide a valid programme.

The Create Programme path had three compounding defects: synchronous work prevented the loading label from painting, the successful route replacement targeted `/(protected)` rather than the actual tab destination, and state-only tap guarding was not a synchronous single-flight gate. Generic rejection handling concealed the actionable reason. An existing user incorrectly sent through onboarding could additionally encounter the legitimate active-attempt guard.

The two training-day answers were different facts but were presented as equivalent choices. `daysPerWeek` is the future schedule. `recentTrainingDaysPerWeek` is historical workload evidence used by the starting-volume policy. The latter is now conditional, compact, and explicitly historical.

## Verification

- Full suite: 382 files, 2,334 tests passed.
- TypeScript: passed.
- Production Expo public config: passed; version `1.0.15`, iOS build `47`, bundle `com.aaronparry.adaptivestrengthcoach`.
- Web export: passed.
- Production payload scan: 27 files scanned, zero findings.
- Build/upload/deploy: not performed.
