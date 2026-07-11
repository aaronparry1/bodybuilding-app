# Simplification register

Evidence is source-path evidence from this audit; reachability is static.

| Component/group | Current purpose | Reachability | Conflict / risk | Recommendation | Evidence |
|---|---|---|---|---|---|
| Root/auth/protected layouts | Gate routes | Production | auth/offline/settings independently gate | Consolidate | `app/index.tsx`; layouts |
| Auth offline mode | Local access | Production | memory-only, not user-scoped | Simplify | `auth-context.tsx` |
| Onboarding | create plan | Production | four writes/no transaction; flag dominates guard | Keep then consolidate | `onboarding.tsx:111-145` |
| ActiveTrainingPlan | strategic plan | Production | duplicates TrainingYear/skeleton/programmes | Keep as candidate aggregate | `active-training-plan-repository.ts` |
| TrainingYear | block timeline | Production | independent start/current block | Remove or merge | `training-year-repository.ts` |
| ProgrammeSkeleton | display structure | Production | third plan representation | Merge into plan or remove | repository + Home |
| Custom Programme/selected day | builder/start bridge | Production | separate from active plan; ephemeral selection | Quarantine | `programme-repository.ts` |
| Planned/ad-hoc generator | legacy planned sessions | Production only rollback/ad-hoc | competing factory | Quarantine | `planned-workout.ts`, `programmes/ai.tsx` |
| V2 CoachingPacket pipeline | default live session factory | Production | one candidate, weak session validation | Keep temporarily, harden later | logger `createV2LiveWorkoutSession` |
| V2 QA generator/screens/reports | QA previews | dev/staging route | tests/route protect non-product path | Quarantine | `v2-*`, `run-v2-*` |
| V3 engine | shadow/conditional active factory | Conditional Unknown | duplicates V2, flag-dependent, huge telemetry surface | Quarantine until selected | `coaching-engine-v3.ts` |
| Legacy rollback | recovery fallback | Conditional | allows old factory bypass | Remove after migration proof | `legacy-workout-generation.ts` imports |
| Workout logger | persistence/set logging | Production | mixes construction, tactical coaching, sync, UI state | Keep, split later | `use-workout-logger.ts` |
| Selected-exercise fallback | library-to-train bridge | Production | creates unplanned one-exercise workout | Remove | logger initializer |
| Session prep | optional prep | Production | selected day temporary bridge; local-only record | Simplify | `session-prep.tsx` |
| Live progression/load logic | tactical coaching | Production | V2 initial prescription and multiple adjustment owners | Keep, consolidate owner | logger + `load-selection` |
| Post-workout athlete model | adapt later | Production | update not obviously consumed by all generators | Quarantine model until contract | `first-shippable-coaching-loop` |
| Exercise swaps/preferences | replacements | Production | generator consumption fragmented | Simplify | Train + recommendation actions |
| History editing | correct completed sets | Production | can revise evidence after model decisions | Quarantine | `history/[id].tsx` |
| Analytics/reports | derived feedback | Production | actions may not reach V2 factory | Simplify/read-only until wired | analytics route |
| Extra/capacity/cardio | special sessions | Production | multiple session constructors and plan semantics | Quarantine except one supported type | Home/extra generator |
| Sync system | backup/restore | Production authenticated | account leakage, additive deletes, no connectivity event | Simplify/rebuild after state merge | cloud-data-sync |
| Subscription/paywall | access/payment | Production config Unknown | mock fallback and inconsistent gates | Keep, simplify | subscription context/paywall |
| Design QA fixtures | visual QA state injection | dev/staging conditional | writes real local keys | Quarantine from release | design QA files |
| Diagnostics | staging inspection/clear | dev/staging conditional | destructive test data action | Quarantine from release | diagnostics route |
| Tests | unit/source assertions | Test only | broad unit coverage does not prove route/device/database | Consolidate after architecture decision | `tests/` |

## Existing test assessment

The suite is extensive at module level: V2/V3 contracts, generators, settings, queue, load/progression and source-string UI assertions. It does not prove the critical real journeys because most tests call pure functions with constructed fixtures or inspect source text. In particular, no discovered test runs Expo Router with persistent storage plus auth restoration plus subscription restore; no test proves account switch isolation, mid-onboarding atomicity, real RevenueCat, real Supabase/RLS, network reconnect, or the Home → Session Prep → logger selected-day handoff on a process restart.

Tests specifically protect obsolete/conflicting behaviour: V2 QA screen tests, legacy rollback tests, V3 shadow/activation tests, and many tests that assert current architecture source strings. These can all pass while V2 emits a one-exercise Push/Pull mismatch because its validator accepts it. The V3 tests explicitly reject a one-exercise normal V3 session, but that is not the default generator.

## Ten most serious architectural conflicts

1. Default live V2 generator versus V3 shadow/conditional generator versus legacy/ad-hoc factories.
2. Live V2 session validation permits one exercise and does not enforce session-role coherence.
3. User equipment plan is not the V2 live generation equipment input.
4. Active plan and training year independently own the active block.
5. Onboarding flag alone gates protected access while plan/year can exist independently.
6. Onboarding writes multiple stores without atomicity.
7. One device’s unscoped local data can survive sign-out/account switch.
8. Selected programme day is a transient bridge between Home/Session Prep/Train, not part of a durable start command.
9. Logger combines factory selection, persistence, sync, tactical coaching and UI timer state.
10. Documentation describes a more unified architecture than the actual factory path; docs must not be treated as runtime evidence.

## Phased simplification order

1. Freeze new coaching and builder work; instrument/read-only reproduce only.
2. Choose one plan aggregate; merge/remove TrainingYear, skeleton and selected-day bridge.
3. Choose one session factory; quarantine V3 and legacy/ad-hoc/custom starts behind non-production routes until one passes explicit contracts.
4. Make session contracts enforce role coverage, minimum normal-session content, user equipment and explicit fallback failure.
5. Scope all persisted keys and sync queues to identity; define guest migration and account-switch rules.
6. Move onboarding state into the plan aggregate and make creation atomic/versioned.
7. Retain logger set ledger and derive reports; isolate tactical progression from construction/sync.
8. Reintroduce one extra-session type and one custom-programme path only after they share the factory/ledger.
9. Replace source-string/unit tests with a small route+storage journey suite after the architecture is singular.

