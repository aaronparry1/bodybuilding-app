# State and source-of-truth map

## Storage mechanisms

`jsonStore` is synchronous JSON over Expo SQLite KV on native (`local-storage.ts`), with in-process listeners/cache. It is the physical persistence for almost all client concepts. Supabase is a selectively synchronized backup, not the runtime source of truth.

| Concept | Local / provider / persistent state | Remote/derived | Restore/conflict rules | Competing truth risk |
|---|---|---|---|---|
| Authentication | AuthContext session, loading/error/offline Boolean; Supabase secure session | Supabase auth | session restore; offline not persistent | High: session versus ephemeral offline |
| Onboarding | `AppSettings.onboardingCompleted` in `iron-logic.app-settings` | Cloud backup envelope may contain settings | cloud overwrites only default/not-onboarded local settings | High: plan can exist while flag false |
| Profile/preferences | AppSettings unit, goal, experience, increments/cardio; living athlete model separate key | settings cloud blob; athlete model local-only | normalized defaults; selective settings restore | High: goal/experience duplicated in plan/settings/model |
| Equipment | Active plan preset; programme skeleton; exercise metadata; V2 passes all-library equipment | plan backup only | plan normalization/default full gym | Critical: live V2 ignores plan equipment |
| Programme | ActiveTrainingPlan; custom Programmes; programme skeleton; selected programme day | active plan backup; custom programme cloud | plan only restored if absent; custom only additive | Critical: four representations |
| Block | active plan `activeBlockId` and blocks; TrainingYear `currentBlockId` | backup envelope | year restore condition differs from plan | Critical: two independent block timelines |
| Workout/open session | whole `WorkoutSession[]`; React logger session/index/timer | workout Supabase rows, sync queue | newest timestamp by id; open workout partial cloud assurance | High: reset can leave multiple opens |
| Exercise/custom library | static presets + custom repository + selected custom exercise id | custom exercise cloud | restores additive; no deletion tombstone | Medium: static/custom/selection bridge |
| Subscription | SubscriptionContext and cache; RevenueCat/mock gateway | RevenueCat | cache fallback; restore/purchase gateway | High: product configuration/runtime Unknown |
| Reports/progress | none separately persisted | derived from completed local workouts | rebuild each read | Low, but historical edits do not clearly recompute auxiliary model |
| Session prep/capacity/recovery ignores | dedicated local repositories | prep not cloud; recovery ignore in backup | selectively restored | Medium: actions can affect experience but not all sync |
| Sync queue/status | local queue/status | Supabase repositories | queue retained failures; owner-id skips | Medium: no network event / no deletion sync |

## Defaults and migration

Settings normalize against `defaultAppSettings`: onboarding false, kg, hypertrophy/intermediate, 8–12 reps, 15% drop-off. Active plan `get()` silently fabricates a recommended annual plan whereas `getOptional()` returns null. Training year `getActiveYear()` silently fabricates a natural-lifter annual plan. These defaults can make consumers believe state exists even when onboarding created none. Equipment normalization supplies compatibility defaults. Existing values are shape-normalized, not versioned through an explicit migration ledger.

## Restoration detail

Subscription context is the only discovered normal caller of `restoreAndSyncUserData`. It runs only for authenticated users. It loads workouts/programmes/exercises/settings in parallel; individual failures are swallowed into partial restore. Workout merge chooses candidate with newer updated/completed/started time. Plan restores only when no local plan; settings only when unonboarded/default. There is no account-switch local purge, delete tombstone, conflict UI, or reliable active-session cross-device proof.

## Required proposed sources of truth

- Auth: Supabase session or durable guest identity, never ephemeral Boolean alone.
- Onboarding/profile/plan/block/equipment: one versioned `TrainingPlan` aggregate in account-scoped local storage, cloud mirrored.
- Active workout and completed history: a versioned session ledger, one open-session invariant.
- Exercise catalogue: immutable bundled catalogue plus account-scoped custom overlay and deletion tombstones.
- Subscription: RevenueCat entitlement only, with time-bounded cache as explicitly labelled availability fallback.
- Derived analytics/coaching: recompute from plan + session ledger; persist only audited model snapshots with version/inputs.
