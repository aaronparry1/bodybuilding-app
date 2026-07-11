# Adaptive Strength Coach: zero-assumption audit

Audit date: 2026-07-10. Scope: current repository only; production code was not changed. “Reachable” means reachable through an app route in the checked-in client code, not that it has been exercised on a device. “Unknown” means static code cannot prove it.

## Executive finding

The product has a usable local-first workout logger, but it does **not** have one coherent product flow or one coaching authority. The currently constructed live workout normally comes from the V2 CoachingPacket pipeline (`use-workout-logger.ts:114-217`, `550-604`), not from the older planned-workout generator described by much of the documentation. A V3 engine is additionally present as shadow telemetry and can replace V2 only when three build flags and a strict readiness gate pass (`use-workout-logger.ts:217-246`). A legacy generator remains available behind a rollback flag. The result is three generation implementations plus at least two programme/block representations.

Static inspection cannot prove a deployed flag configuration, Supabase/RLS configuration, RevenueCat product configuration, or real-device behaviour. Those are marked Unknown rather than inferred.

## User-facing inventory

| Surface | Purpose / entry | Actual path, state and dependencies | Competing paths / risk | Recommendation |
|---|---|---|---|---|
| Root `/` | Select app area on launch. | Waits for `useAuth().isLoading`; redirects to protected iff Supabase user **or in-memory** offline mode, else auth (`app/index.tsx`). | Offline mode disappears on process restart; no persisted guest identity. | Simplify |
| Auth | Create/login; continue local; Apple/Google; dev/staging Design QA. | `AuthProvider` restores Supabase session or sets offline on missing service; form calls Supabase service (`app/(auth)/index.tsx`, `auth-context.tsx`). | Apple/Google implementation and device success Unknown. Offline is a Boolean, not durable account scope. | Keep, simplify |
| Protected guard | Prevent unauthenticated use and force setup. | `user || isOfflineMode`; then only `appSettings.onboardingCompleted` decides onboarding redirect (`app/(protected)/_layout.tsx:29-30`). | Guard does not require an active plan; settings can disagree with plan/year. | Consolidate |
| Onboarding | Create initial plan. | Writes active plan, programme skeleton, *separate* training year, then settings flag; replaces root (`onboarding.tsx:111-145`). | No transaction; app can crash/write fail between stores. Equipment is hard-coded `full_gym` despite UI claims. | Keep, consolidate |
| Tabs: Home, Train, Plan, Progress, Library | Main navigation. | Five visible tabs; hidden `account`; Settings header is everywhere (`(tabs)/_layout.tsx`). | Account reachable only by deep link; numerous secondary protected routes bypass tab semantics. | Simplify |
| Home / Today | Start/continue planned or extra session. | Builds dashboard from local plan, year, sessions. Planned start stores a generated `Programme` and selected day, then opens Session Prep (`index.tsx:148-199`). | If no generated day/open session, pushes onboarding even when flag says completed (`index.tsx:196-198`). | Keep, repair after audit |
| Session Prep | General preparation, optional skip. | Reads URL params, persists local prep record, replaces Train (`session-prep.tsx`). | Selected programme day is transient local state. Reload/other route can lose it. | Simplify |
| Train / workout logger | Premium-gated session logging, editing, swaps, additions, completion/review. | `useWorkoutLogger` restores latest open local session, else consumes selected programme day, else builds active-plan session, else creates selected fallback. Sets save synchronously to local repository. | Construction has V2, V3, rollback legacy, selected-exercise fallback; `advanceFromSession` can automatically stamp completed when moving past final exercise. | Keep, consolidate |
| Plan | View plan, training week/roadmap, manually select/repeat/advance block. | Reads active plan plus training-year hook; modal modifies active plan. | Current block sometimes comes from active plan, sometimes training year fallback. | Keep, consolidate |
| Progress / analytics | View reports, PRs, actions, share cards. | Purely derived from locally stored completed sessions; action handlers mutate volume/preference data. | Premium gate differs from Home/Plan. Some recommendation actions do not own the live generator’s input. | Simplify |
| Library | Search built-in/custom exercise data; edit/create/delete; “Use in Workout.” | Custom repository plus static exercise library; selected exercise ID creates/replaces an otherwise fallback session (`library/[id].tsx`, logger `selectExercise`). | “Use” path does not prove a plan; it can meet onboarding guard first. Cloud delete explicitly can rehydrate. | Keep, simplify |
| History | Filter completed sessions and edit/delete historical sets. | Local workout repository, derived history; edit modal updates completed session. | Editing historical performance does not visibly rerun living athlete model/reviews or invalidate decisions. | Quarantine edits pending ownership decision |
| Programme detail/builder/session builder | Browse/start custom programme; author custom plans or one session. | `programmeRepository` persists custom programmes plus a selected day which logger consumes. | Parallel to active plan and V2 live generator; builder has no coherent ownership of block/progression. | Quarantine |
| AI workout | Generate an ad-hoc workout by focus. | `generateWorkoutByFocus`, saves/selects programme day, goes Session Prep. | Separate legacy-style generator, not V2 pipeline; same UI label “workout.” | Quarantine |
| Extra/capacity/cardio | Create special sessions from Home. | Extra generators create a programme/day then use same selected-day bridge. | Can affect workout history but largely not plan/week advancement; several coaching concepts. | Simplify |
| Settings/account | Subscription, setup restart, unit/increments, logout, diagnostics. | Settings can set onboarding false then route onboarding; logout is auth-only (`settings.tsx`). | Sign-out does not clear/account-scope local plan/history. Account tab hidden. | Keep, consolidate |
| Paywall | Purchase, restore, package errors. | RevenueCat gateway/context; Train strictly gates premium; other screens vary. | Runtime product availability Unknown; mock fallback is possible (`subscription-context.tsx`). | Keep, simplify |
| Diagnostics/design QA/V2 QA | Staging/dev operational and preview screens. | Environment-gated by screen logic; Design QA writes/restores production local keys; V2 QA is a static preview. | Routes are registered in protected stack; safety depends on environment check. | Quarantine from release build |

### Primary actions, modal/sheet/dropdown inventory

- Auth: Create/Login, Continue offline, Apple, Google, Design QA; form error/configuration states. Buttons are disabled for invalid credentials/configuration.
- Onboarding: option rails for goal, commitment, event, schedule, split, experience, recovery/cardio and unit; Back/Continue/Create Programme. There is no remote write dependency.
- Home: Start/Continue/View Session; extra-session modal; active-workout conflict Alert (continue versus discard); capacity/cardio starts; volume Apply/Ignore; share-card modal; expandable evidence.
- Train: trial/restore/view-plan sales actions when not premium. Premium view has exercise action sheets, performance drawer, add/swap/reason/finish/review/cardio sheets, end confirmation Alerts, rest timer controls, share modal, and detail toggles. Exact labels vary by set/exercise state.
- Plan: per-block explain modal; next-block page-sheet with select/cancel; choose/move/repeat/decide-later actions.
- Library: filter rails; custom exercise choice rails; native delete confirmation; edit/save/cancel; Use in Workout.
- History: filter chips; completed-set edit modal (warm-up/work, save/delete/cancel); native delete confirmation.
- Paywall: package cards, purchase/retry, restore, terms/privacy links, not-now. Error/loading package branches exist.

### Visible state handling

Loading: root/auth/protected guards render spinners; subscription context exposes loading and Train renders sales “checking” card. Empty: plan no-plan, library no matches, history no completed sessions, exercise/programme not found, progress insufficient evidence. Error: root ErrorBoundary; auth config/service message; subscription/paywall/package failure; diagnostics. Offline: auth permits an in-memory offline route and local saves; there is no connectivity observer, queued sync retry is on app foreground only after authenticated subscription context exists. Offline UI is therefore partial, not a state machine.

## Authentication, onboarding and subscription pathways

1. Supabase session is restored asynchronously in `AuthProvider`; no service means it sets offline true. `continueOffline` only changes React state. Sign-up/sign-in service callbacks set session, and the protected guard evaluates the local settings flag.
2. Onboarding completion is not authenticated/account-scoped. It is the single JSON value `iron-logic.app-settings.onboardingCompleted`.
3. Subscription context initializes RevenueCat/mock status, and when `user.id` exists invokes `restoreAndSyncUserData`; foreground triggers `syncLocalDataForUser` (`subscription-context.tsx:178-190`). Purchases/restore are owned by the gateway. Train is hard gated; Plan/Home preview more than Train.

## Critical product conclusion

The smallest defensible current product is: authenticated-or-local entry, one local plan, one selected next workout, one persisted active session, set logging, completion, and local history. It should not currently claim a singular adaptive coaching architecture, durable multi-account restore, or a unified programme builder.

See the companion documents for exact journeys, decision ownership, state conflicts and the simplification register.
