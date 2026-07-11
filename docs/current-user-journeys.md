# Current user journeys: verified control flow

All routes below are client control flow from current code. Conditions are stated explicitly; remote success is Unknown unless code handles its failure.

## 1. Fresh install to first valid workout

1. Root waits for auth. With no session it sends the user to Auth; with no Supabase client, `AuthProvider` sets an in-memory offline flag and root sends them protected.
2. Protected layout reads `appSettingsStore.get().onboardingCompleted`. False redirects to onboarding regardless of an existing active plan, open workout, or training year.
3. Onboarding `finish()` writes, in order: `activeTrainingPlanRepository`, `programmeSkeletonRepository`, `trainingYearRepository.startBlock`, then `appSettingsStore.patch({ onboardingCompleted: true, ... })`, then `router.replace('/(protected)')`. No transaction/recovery compensates a partial sequence.
4. Home reads local active plan, training year and local workout sessions. It builds a planned programme/day for Today. Start saves it in `programmeRepository`, stores `selectedProgrammeDay`, then opens Session Prep.
5. Session Prep writes a local prep record and replaces Train. Logger initialization: latest open session wins; otherwise `createSessionFromProgrammeDay` consumes selected day. A planned selection calls the V2 production packet pipeline. If it returns invalid/null and the legacy rollback flag is false, it returns null; logger then tries active-plan creation, then selected-movement fallback.
6. “Valid” in this live path only means at least one active exercise, nonempty identity, sensible rep range and positive set bounds (`isValidLiveWorkoutSession`). It does **not** validate session role coverage, a minimum exercise count, or Push/Pull coherence.

Failure risks: selected-day bridge can be absent; V2 pipeline can return null; fallback can create a one-exercise `Selected Movement`; guard can redirect onboarding. Result is not a fail-closed “cannot start” experience.

## 2. Returning user to Today

1. Supabase session restoration decides protected/auth. Subscription context can asynchronously restore cloud data after protected navigation has already evaluated settings.
2. Protected guard reads settings before/while restore may modify it. If false/default it routes onboarding. If true, Home reads independent local active plan/year/session snapshots.
3. Home priority is its dashboard output: selected/open planned workout and completed-week state determine primary CTA. It considers an open workout after an available Today programme branch.

Source of truth is not singular: auth session, local settings flag, active plan, training year and history each provide part of Today.

## 3. Today → inspect workout → start exercise

Home “View Session” invokes the same `startTodayWorkout` action as Start: it saves a generated programme and selected day, then routes to Session Prep. Session Prep’s Continue/Skip replaces Train. Train logs the active session and opens the active exercise when the user taps a card/performance row or passes `exerciseId` search param. No route guard confirms that the requested exercise belongs to Today beyond logger local state.

## 4. Start exercise → every set → live adjustment

For each log:

1. UI validates integer reps ≥0, active status, unfinished session and a known/typed load.
2. `logSetAtIndex` appends local `SetLog`, treats warm-up and work separately, runs `evaluateExerciseProgression` on work sets, may set status `shutdown`, saves whole session to local JSON, and starts a rest timer for work sets.
3. It calculates in-session load-drop from the new work set. UI separately calculates escalation using block, exercise metadata, locally derived history, training gap and throttle input. User accepts/declines; accepted load calls `applyInSessionEscalationToFuturePrescription` and overwrites the session locally.

The persistence point is `workoutSessionRepository`; there is no per-set remote write. Warm-ups are deliberately excluded by `getWorkSets` in most coaching calculations, but not every code path was dynamically proven.

## 5. Complete workout → results → next workout

Train’s confirmation invokes `finishWorkout` with optional review approvals/answers. It stamps `completedAt`, updates selected per-exercise next-load approvals, derives and saves a living-athlete model, locally saves session, and conditionally increments active plan week **only** for matching planned session/block/week. `persistSession` queues completed session and starts best-effort authenticated sync. Home/Progress/History rebuild results from completed local sessions; no separate report persistence exists.

Risk: logged completion has weaker semantics than “all planned work complete”; UI can allow early completion. The logger’s `advanceFromSession` also stamps completed when going beyond final index, independent of post-workout review.

## 6. Abandon, resume, restart

- Resume: latest locally stored session without `completedAt` is selected on logger initialization.
- Abandon: `cancelWorkout` removes only its local session. Home conflict discard also removes it.
- Restart: `resetSession` builds an active-plan session or selected fallback and saves it; it does not mark prior session abandoned/remove it. This can create more than one open session; latest-open selection determines what resumes.

## 7. Sign out → sign in → restore

`signOut` signs out Supabase or clears only in-memory offline mode. It does not clear or namespace local data. On user subscription-context availability, `restoreAndSyncUserData(user.id, subscription)` merges cloud workout history by id/newer timestamp; restores settings only when local settings are default/not onboarded; restores active plan only when no local plan; restores training year based on settings/plan condition. Thus a second account can see or retain the first account’s local plan/history; conflict is intentionally local-first, not account isolation.

## 8. Offline/local-only → reconnect → synchronise

Offline work saves local SQLite KV JSON. On completion an authenticated user triggers sync; subscription context also restore/syncs at user effect and foreground. There is no NetInfo/connectivity event in code. Queue items have owner IDs and flush skips mismatched owner. Sync failure leaves queue; cloud restore failures are caught per repository and return partial results. Deletes have no tombstone flow, so deleted custom content can return from cloud. This is best-effort queued sync, not demonstrated reconnect synchronization.

## Explicit reported-path explanations

### Why an onboarded user can land in onboarding when starting an exercise

This is provable in two ways.

1. Every protected navigation, including Library “Use in Workout” → `/(protected)` and Home Start fallback, is evaluated by the protected layout’s sole onboarding condition: `!settings.onboardingCompleted`. The guard does not check that an active plan exists or that onboarding had previously completed in another local/remote source.
2. The completion flag is written after plan/year/skeleton writes with no transaction. It can be defaulted by a fresh device, local storage reset/QA fixture manipulation, cloud restore timing, or a partial write. Cloud restore only restores settings under `shouldRestoreSettings` (not onboarded or exactly default), and it runs asynchronously after auth/subscription initialization. Therefore the old/local/default flag is authoritative at the time the guard evaluates.

Starting an exercise is not itself coded to reset onboarding. The reproducible mechanism is a guard read of a separate stale/default source of truth, often reached by a start route; any stronger causal claim requires device logs and is Unknown.

### How a one-exercise Push containing a Pull exercise can be produced

The live planned path maps a workout name to `selectedSession='push'`, then `createProductionWorkoutFromCoachingPacketPipeline` uses a matching engine and creates `selectedExercises: [selectedCompositionExercise]` before composing the session. It only requires one `selected_candidate_default`; the logger’s validity check permits one exercise and never validates candidate pattern/category against selected session. The matching metadata/scoring has broad structural/support candidates, so a pull candidate can be the selected default for a Push objective. The pipeline therefore emits a valid one-exercise session whose displayed name/selected session is Push while its only exercise is pull. V3 has explicit quality checks against one-exercise normal sessions, but the normal V2 live path does not apply that V3 check. This is a direct architectural possibility; static audit cannot identify the exact production fixture that triggered it.
