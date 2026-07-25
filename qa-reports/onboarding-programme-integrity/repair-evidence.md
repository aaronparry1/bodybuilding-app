# Onboarding and initial-state integrity repair

Protected baseline: `c2d1b5b3f3aef31683762115154075bfda712ca5`.

## Root cause

The supplied advanced five-day hypertrophy fixture constructs a valid five-session canonical plan from a clean repository. The reported save message was not caused by programme generation.

The reproducible failure is `active_attempt_must_be_completed_or_discarded`: the commit owner detects an existing started or paused ledger attempt and rejects the replacement before writing. The old screen converted that precise reason into the generic “could not be saved safely” copy. Because the prior carrier remained authoritative, a later Home read could show its old active Push workout. That was stale prior state presented after an opaque failure, not proof that half of the new programme was saved.

The repair keeps the prior carrier byte-for-byte unchanged on that rejection and gives the athlete the real recovery action. Plan persistence and onboarding settings now form one user-visible transaction; a settings write failure restores the exact prior carrier. An identical retry returns the existing successful result without creating another first workout.

## Framework result

For the exact reported facts, full canonical construction succeeds for:

- ASC Recommended → Push/Pull/Legs
- Push/Pull/Legs
- Upper/Lower
- Full Body
- Body-Part Split

The selection screen consumes construction-proven results. It is omitted when only one result remains.

## Setup simplification

The continuous-development flow is reduced from nine screens to eight when several frameworks exist, or seven when the framework is a non-choice. Training days and workout length share one screen. Repeated duration/day explanations were replaced with one instruction per question. Experience, recent consistency and recovery remain distinct planning facts but are collected compactly.

Selecting zero recent days resolves a contradictory `currently_training` state to `short_layoff`; selecting consistent training from zero days establishes a non-zero recent frequency.

## Workload and initial state

The reported Push hypertrophy A snapshot contains six exercises, 22 working sets and a 60-minute estimate. All three values come from the same `canonical_session_snapshot_v3`. The duration estimator includes warm-up/ramp allowance, the exact working sets, prescribed rest, setup/transitions and prescribed method structure.

A fresh five-session programme projects:

- Session 1 of 5
- 0 of 5 sessions completed
- 0 completed working sets
- planned lifecycle
- Start workout

Only an explicit canonical ledger start changes the action to Continue workout.

## Rendered evidence

- Before onboarding: `qa-reports/release-candidate/native-screenshots/narrow/00-onboarding-review.png`
- After onboarding start: `qa-reports/onboarding-programme-integrity/after-onboarding-start-390x844.png`
- After five-day framework choices: `qa-reports/onboarding-programme-integrity/after-five-day-frameworks-390x844.png`
- Before Home: `qa-reports/design-qa/global-shell-home/screenshots/home-planned-390x844.png`
- After Home: `qa-reports/onboarding-programme-integrity/after-home-planned-390x844.png`

The after renders use a 390×844 viewport. Step changes reset the onboarding ScrollView to the top, so the next title starts below the fixed header. The Home metric row uses the same typography for `EXERCISES`, `SETS` and `ESTIMATE`.

## Verification

- Focused integrity/planning/Train regressions: 12 files, 106 tests passed.
- Full suite: 361 files, 2,150 tests passed.
- TypeScript: passed.
- Production Expo public config: passed.
- Web export and production-payload scan: passed.
- No native build, upload, deployment or release-metadata change was performed.
