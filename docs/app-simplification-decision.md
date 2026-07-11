# Adaptive Strength Coach simplification decision

Decision date: 2026-07-10. This is a recovery decision, not an implementation. It supersedes product-architecture claims that conflict with the five zero-assumption audit documents. No production code or tests were changed.

## Decision

The recovery product is a local-first strength-training loop:

1. Complete one onboarding transaction.
2. Persist one `TrainingPlan` for the current local identity.
3. Derive one named next session role from that plan.
4. Construct one deterministic, validated workout.
5. Persist at most one active workout; open its first valid exercise.
6. Log warm-up/work sets; coach the next work set from the active session and completed history.
7. Complete the workout; save it as history; advance the plan cursor; use that history for the next construction.

Everything else is subordinate. Custom builders, AI/ad-hoc starts, extra sessions, capacity/cardio, programme skeletons, independent training years, V3, QA fixtures, historical set editing, and advanced strategic recommendations do not participate in production recovery.

## One owner per core responsibility

| Responsibility | Chosen production owner | Competing current owners | Why this owner wins | Delete / quarantine | Migration risk |
|---|---|---|---|---|---|
| Authentication state | `AuthProvider` backed by Supabase session; a persisted guest identity only when deliberately chosen | Root redirects; in-memory `isOfflineMode` | One provider already brackets the app and exposes loading/session | Delete implicit “missing config means offline” access; quarantine Design QA entry | Existing offline users need an explicit guest migration |
| Onboarding completion | `TrainingPlan.status = active`, stored with the plan; no separate Boolean authority | `AppSettings.onboardingCompleted`, plan/year/skeleton existence | A valid active plan is the only meaningful proof of completion | Delete `onboardingCompleted` as a guard; retain only temporary migration read | Existing false flag + plan must migrate safely |
| User training profile | `TrainingPlan.profile` (goal, experience, units, recovery preference) | AppSettings, active plan, programme skeleton, living athlete model | Profile drives plan/construction; one versioned aggregate prevents divergence | Remove duplicate goal/experience from settings/skeleton; quarantine athlete model | Preserve visual settings separately |
| Equipment availability | `TrainingPlan.profile.equipment` as explicit normalized set | hard-coded onboarding full gym, plan preset, library-wide union | It is a declared user constraint and must enter construction directly | Delete library-union inference for construction | Existing presets need deterministic conversion |
| Programme and split | `TrainingPlan.sessionSequence` | custom `Programme`, skeleton, planned programmes | A sequence is all recovery needs; it is direct and serializable | Quarantine custom builder/repository start flow | Custom programmes become unavailable, not silently converted |
| Current training block | `TrainingPlan.currentBlock` | `TrainingYear`, plan activeBlockId, V2 phase inference | Block must travel with the plan used to construct | Delete TrainingYear ownership; migrate its current state once | Conflicting existing blocks require conservative plan-block choice |
| Session-role selection | `selectNextSessionRole(plan, completedSessions)` | Home programme name; selected programme day; name-to-role mapping | Typed role must precede construction, never be inferred from a display name | Delete selected-day bridge and name mapping | Existing open session is resumed unchanged |
| Workout construction | **New deterministic `RecoveryWorkoutConstructor`** | V2 CoachingPacket, V3, legacy, planned/ad-hoc/extra generators | Neither current live engine meets the required contract; a small constructor is easier to prove than repairing three engines | Quarantine all current constructors from production | Requires a bounded new adapter, not a rewrite |
| Exercise classification | immutable `exerciseLibrary` taxonomy, with validated custom overlay later | presets, custom data, name inference | Only canonical metadata may satisfy role/movement rules | Quarantine custom exercise creation/editing during recovery | Existing custom exercises remain visible but not selected |
| Exercise selection | `RecoveryWorkoutConstructor` using typed role slots and canonical metadata | V2 matching, exercise-selection, ad-hoc/extra, swaps | Selection must be validated against role/equipment before output | Quarantine matching/rotation/preference selection | Reduced variety is intentional |
| Sets, reps, starting loads | constructor’s deterministic prescription policy using canonical defaults plus completed-session history | V2 loading, settings resolver, set prescription, adaptive rep/load policies | One policy creates the persisted initial prescription | Quarantine V2/advanced prescription engines from construction | Conservative loads may differ from prior recommendations |
| Active workout | `workoutSessionRepository` with one-open-session invariant | logger React state, selected day, fallback constructors | It is already durable local storage; make it authoritative | Delete “latest of many open” semantics and reset duplication | Old multiple opens need a migration choice |
| Active exercise | `WorkoutSession.activeExerciseId` persisted in the active session | logger `activeExerciseIndex`, URL `exerciseId` | ID survives reorder/reload and cannot point outside the session | Remove URL authority and index-only persistence | Existing open sessions need index-to-id mapping |
| Set logging | `workoutSessionRepository.save()` through one logger command service | screen state, edit helpers | Local write-after-every-command is observable and durable | Quarantine historical set editing | Must preserve existing set ledger data |
| Live coaching | one `LiveSetCoach` called only after a work-set command | progression engine, throttle, load selection, escalation, V2/V3 | Tactical coaching should use only active prescription + completed set evidence | Quarantine adaptive set allocation, strategic/fatigue engines from live UI | Less sophisticated prompts; safer contract |
| Workout completion | one `completeWorkout` command | logger advance behaviour, review flow, Home conflicts | Completion must be explicit, validate state, close one session and advance cursor once | Remove automatic final-index completion; quarantine post-workout review loop | Existing completed session history retained |
| Progression | deterministic next-workout prescription policy, invoked by constructor from completed history | V2 loading, post-review approvals, living athlete model, analytics actions | Progression is a next-workout decision, not a side effect of five surfaces | Quarantine review approvals/volume actions/model | Existing recommendations are not carried forward |
| Persistence and synchronisation | account/guest-scoped local session ledger first; one append/upsert sync adapter second | JSON keys, cloud restore, queue, direct cloud repository saves | Local completion must be reliable without network; remote mirrors it | Quarantine cloud restore/sync until keys are scoped and one plan envelope exists | Existing remote data must be imported conservatively, not merged silently |

## Engine decision

### Production recovery decision: do not run V2, V3, or legacy construction

Use a new, small deterministic `RecoveryWorkoutConstructor` as the only production constructor. It is not a broad rewrite: it constructs a `WorkoutSession` from a typed plan role, canonical exercise library, declared equipment, and completed-session history, then immediately validates it.

| Candidate | Decision | Evidence-based reason |
|---|---|---|
| V2 CoachingPacket | Do not use in recovery | It is the normal live path, but it selects one default candidate, composes from `[selectedCompositionExercise]`, accepts one exercise as valid, does not enforce Push/Pull coverage, and receives equipment inferred from all library exercises. It is neither reliable nor comprehensible enough to be the recovery foundation. |
| V3 | Quarantine completely | V3 has useful quality gates, including rejection of one-exercise normal sessions, but production activation depends on multiple flags, shadow telemetry, readiness comparison, and fallback to V2. Its deployed configuration is Unknown. It violates the single-engine requirement. |
| Legacy rollback | Delete after Phase 0 | It is explicitly rollback-only and restores alternative output shape/pathways. No rollback may produce a workout after recovery begins. |
| New deterministic constructor | Choose | It has a finite input/output contract, no flags, no shadowing, and can fail visibly without creating a session. |

There will be no shadow replacement, conditional swapping, legacy fallback, selected-exercise fallback, or alternate shape of workout. A constructor failure produces a non-dismissable “We could not build today’s workout safely” state with a retry and a route to plan/equipment correction. It creates no active session and advances no plan cursor.

## Non-negotiable workout validity contract

`validateWorkoutForDisplayAndPersistence(workout, plan, catalogue)` must pass before a session is persisted, displayed, or routed to Train.

1. **Identity:** `workout.planId`, block id, planned session ordinal and typed `sessionRole` exactly match the active plan cursor. Display name is derived from role, never the inverse.
2. **Primary:** exactly one resolvable primary exercise with canonical id; its role and movement pattern satisfy the session role.
3. **Coverage:**
   - Push: one horizontal or vertical push primary; optional accessories may be push/arm isolation only. No pull pattern may fulfil required Push coverage.
   - Pull: one horizontal or vertical pull primary; optional accessories may be pull/arm isolation only. No push pattern may fulfil required Pull coverage.
   - Legs/Lower: a lower-body primary plus required knee- or hip-dominant counterpart where the selected template demands it.
   - Upper: at least one push and one pull requirement.
   - Full body: lower, push and pull requirements.
4. **Size:** normal Push/Pull/Upper/Lower/Legs sessions contain 2–5 exercises; Full Body 3–5. A one-exercise session is permitted only for an explicit `single_exercise_recovery` role that the recovery plan does not create in Phase 2.
5. **Uniqueness:** no duplicate exercise IDs, including aliases/variations resolved to the same canonical id.
6. **Equipment:** each selected exercise’s equipment intersects declared plan equipment. Bodyweight is allowed only where canonical metadata says so.
7. **Prescription:** every exercise has integer required work sets 1–6, a bounded positive rep/duration target, non-negative finite load, supported unit, positive rest, and a known/explicitly-calibrating load state. No `NaN`, missing settings or ambiguous reps.
8. **UI resolvability:** every exercise id resolves from the immutable catalogue and has all fields required by Train: name, measurement type, movement pattern, equipment, settings and display metadata.
9. **State:** one active exercise id belongs to the session; the session is open, has no completion timestamp, and does not duplicate another open session.

On failure: return structured validation failures for logs/diagnostics, show the safe failure screen, persist nothing, leave any existing active workout untouched, and never substitute a different engine or a one-exercise fallback.

## One onboarding rule

Onboarding is complete **if and only if** the current identity has exactly one schema-valid `TrainingPlan` with `status: 'active'`, a valid profile/equipment set, valid session sequence, current block and cursor. The plan record is committed atomically before navigation.

Onboarding may appear only when: (a) there is no plan for the current identity; (b) the user explicitly selects “Replace training plan” after confirming loss of the current plan cursor; or (c) the plan fails schema validation and recovery cannot restore a last known good version. An exercise, workout, tab, deep link, missing generated programme, missing selected day, or subscription state must never reinterpret onboarding status. Those routes either resume the active workout, show Today/Plan, or present a safe construction failure.

## Deletion and quarantine lists

### Delete during recovery

- `src/domain/training/legacy-workout-generation.ts` and all production imports (`use-workout-logger.ts`, `app/(protected)/(tabs)/index.tsx`, `recovery-capacity-delivery.ts`). Evidence: explicit rollback-only alternative construction.
- `src/data/local/training-year-repository.ts` after one-time merge into TrainingPlan. Evidence: independent current block.
- `src/data/local/programme-skeleton-repository.ts` after plan migration. Evidence: duplicate split/session display state.
- `src/data/local/programme-repository.ts` selected-programme-day bridge and its use in Home/Session Prep/logger. Evidence: transient start command and parallel programme truth.
- `AppSettings.onboardingCompleted` guard and default-driven fabricated plan/year reads. Evidence: proven redirection conflict.
- selected-exercise construction fallback in `use-workout-logger.ts`. Evidence: unplanned one-exercise workout.
- automatic completion branch in `advanceFromSession` and historical set editing in `app/(protected)/history/[id].tsx`. Evidence: completion/evidence can change without one owner.

### Quarantine outside production

- `src/domain/training/coaching-engine-v3.ts` and V3 flag/telemetry calls; `qa-reports/v3-shadow-telemetry-review.test.ts`. Evidence: conditional replacement/shadow behaviour.
- `src/domain/training/coaching-packet-pipeline.ts`, V2 QA generator/panels (`v2-workout-generator.ts`, `v2-coaching-qa.ts`, `run-v2-qa-preview.ts`, `run-coach-review-dashboard.ts`, `run-benchmark-session-review-pack.ts`, `app/(protected)/v2-benchmark-qa.tsx`). Evidence: V2 production flaw and QA-only variants.
- `app/(protected)/programmes/ai.tsx`, `builder.tsx`, `session.tsx`, and custom-programme authoring/start flow. Evidence: alternate constructors.
- `extra-session-generator.ts`, capacity/cardio routes and Home entrypoints. Evidence: special session pathways outside plan cursor.
- `living-athlete-model*`, `first-shippable-coaching-loop.ts`, strategic coaching/analytics mutation actions, exercise rotation/preference learning. Evidence: not one reachable input contract.
- Design QA fixtures/route and diagnostics route from release build. Evidence: write production local keys/dev testing.

### Keep but simplify

- `app/(auth)`, `app/_layout.tsx`, `app/(protected)/_layout.tsx`: one loading/auth/onboarding decision.
- `app/(protected)/(tabs)/index.tsx`: Today/resume/safe failure only.
- `app/(protected)/(tabs)/train.tsx` and `use-workout-logger.ts`: reduce to one persisted active session, active exercise id, log/undo, set-to-set coach, explicit complete/abandon.
- `active-training-plan-repository.ts`: replace payload with the single versioned TrainingPlan aggregate.
- `workout-session-repository.ts`, `workout-history-repository.ts`, local SQLite JSON layer: scope per identity and enforce one open session.
- `exercise-library.ts`/presets and workout set/progression utilities: canonical catalogue plus narrow recovery prescription/coach.
- `cloud-data-sync.ts`/queue: only mirror the scoped plan/session ledger after local journey is reliable.
- `settings.tsx`, `paywall.tsx`, account: remove duplicated training state; retain account/billing/settings presentation.

### Keep unchanged

- `src/data/local/json-store.ts` and `src/data/local/local-storage.ts` as the storage mechanism, pending identity scoping. Their synchronous local durability is appropriate for recovery.
- `src/domain/training/workout-sets.ts` work/warm-up distinction.
- `src/domain/training/workout-history.ts` as a derived read model, subject to the immutable completed-session ledger.
- `src/domain/training/rest-timer.ts` and UI primitives/theme; neither owns product state.
- Root ErrorBoundary, customer-safe error formatting, and Supabase/RevenueCat client wrappers, pending real configuration verification.

## Phased implementation sequence

Every phase is a runnable application; no phase adds a second constructor.

### Phase 0 — Safety and rollback

Scope: disable production reachability of V2/V3/legacy/ad-hoc/custom/extra constructors; block unknown deep routes; make Train show a safe unavailable state rather than construct a fallback.

Removed: legacy rollback, shadow telemetry, conditional V3 activation, selected-exercise and selected-day fallbacks from production path.

Remains: authentication, existing active-session resume, local history, plan display, current set logger for already-valid active sessions.

Behavioural evidence: an attempted new workout either resumes the sole existing active workout or visibly says construction is temporarily unavailable; it never displays a newly generated invalid/mismatched session.

Exit criteria: manual device navigation cannot reach an alternate constructor and no new session is persisted without a typed constructor result.

### Phase 1 — One source of truth

Scope: introduce one versioned, identity-scoped TrainingPlan aggregate; migrate existing active plan/current block/profile/equipment into it; replace onboarding guard.

Removed: TrainingYear as active authority, programme skeleton authority, onboarding Boolean authority, selected-day start state.

Remains: read-only old records for one migration release; existing completed sessions; one open session resume.

Behavioural evidence: after onboarding or app restart, Home, Plan, Library and Train agree on the same plan/role/block; sign-out then another identity never sees the first identity’s plan.

Exit criteria: an active valid plan is the only onboarding proof and one plan cursor supplies Today.

### Phase 2 — One workout constructor

Scope: implement RecoveryWorkoutConstructor and the validity contract for only plan session roles supported by onboarding; use canonical catalogue and declared equipment.

Removed: V2 pipeline as live factory, all fallback constructors and display-name-to-role mapping.

Remains: a deliberately small set of templates, e.g. Push/Pull/Legs/Upper/Lower/Full Body, conservative prescriptions and safe failure UI.

Behavioural evidence: a Push plan creates 2–5 compatible exercises with a push primary and no pull requirement; machine-only plans contain only compatible movements; invalid catalogue/template input produces no active session.

Exit criteria: every newly created session passes validation before storage and its first exercise opens reliably.

### Phase 3 — One reliable workout journey

Scope: bind Home → validated session creation → Train; persist `activeExerciseId`; preserve one-open invariant; explicit finish/abandon; calculate next prescription from completed sessions.

Removed: Session Prep as a construction dependency, automatic final-index completion, post-workout strategic/model side effects, history edit commands.

Remains: optional prep as non-blocking UI only, warm-up/work logging, rest timer, narrow live set coach, derived history.

Behavioural evidence: force-close/relaunch during any set resumes exactly the same active exercise and logs; completing records the workout once and the next Today role/load reflects that completion.

Exit criteria: the seven-step recovery loop is reliable in offline local use with no duplicated open workout.

### Phase 4 — Real journey verification

Scope: execute documented fresh install, onboarding, resume, start, set logging, abandon, completion, sign-out/sign-in and offline/reconnect journeys on devices against the intended environment.

Removed: assumptions based on source inspection, fixtures or source-string assertions as release proof.

Remains: only the single plan/constructor/logger/ledger path.

Behavioural evidence: recorded device evidence demonstrates each journey; failures identify a state/contract violation rather than an alternative path.

Exit criteria: product owner can observe each required journey without QA mode, manually injected storage, or engine flags.

### Phase 5 — Reintroduce only proven intelligence

Scope: add one capability at a time behind the same plan/session contracts: preference-aware substitutions, conservative volume adaptation, then richer block logic.

Removed: none by default; any feature that requires a second owner is rejected.

Remains: RecoveryWorkoutConstructor remains the sole construction boundary; all intelligence supplies validated inputs, never replaces output.

Behavioural evidence: each addition changes a named input/output of the constructor or LiveSetCoach and cannot create a session that fails the validity contract.

Exit criteria: user-visible improvement is demonstrated without new routes, storage owners, engine flags, or fallback shapes.

## Plain-English verdict (under 500 words)

The app went wrong by allowing several partially overlapping ideas of “the plan,” “today’s workout,” and “the coaching engine” to coexist. Home can create one kind of workout, the logger can create another, V3 can optionally replace V2, and an old rollback can create yet another. The onboarding flag is separate from the actual plan. That is why a user can be routed back to onboarding and why a session named Push can contain a Pull movement: the system accepts output before it has proved that the output matches the role.

The simplified app will do one dependable thing: keep one training plan, choose its next typed role, build one valid workout from declared equipment and canonical exercises, save one active workout, coach each set locally, then use the completed workout to make the next one. It will work offline first; sync becomes a mirror of that ledger, not a second source of truth.

No existing construction engine survives production recovery. V2 is the current live engine but is too permissive and uses the wrong equipment input. V3 is more sophisticated but is flag-driven, conditionally replaces V2, and has not been established as the live product. Legacy rollback is explicitly a second path. All three are removed from the production journey. A small deterministic RecoveryWorkoutConstructor survives as the only new boundary, with a hard validation gate and a visible failure state instead of a silent fallback.

The first safe implementation step is Phase 0: remove alternate construction reachability and prevent any invalid new workout from being persisted or displayed. Existing active workouts can still resume. New workout creation should temporarily fail clearly until the single plan and deterministic constructor are in place. That is safer than continuing to generate workouts whose correctness cannot be established.
