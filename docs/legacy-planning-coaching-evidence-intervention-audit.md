# Legacy planning, evidence, and exercise-intervention audit

Audit date: 2026-07-11  
Scope: repository-wide read-only architecture audit. No production behaviour was changed.

## Executive summary

The active-plan start path is correctly narrowed to `buildRecoveryWorkoutSession`, but legacy annual/block structures still influence its inputs and many surrounding screens. The most significant breach is that the active constructor accepts and scores against `TrainingBlock`, and writes `planBlockId`/`planWeekNumber`; it therefore has a mesocycle/microcycle authority path and a second legacy compatibility path at once.

Exact `WorkoutExerciseLog.prescribedSetTargets` are present and displayed on Train/Plan, but `repRange` remains a construction boundary and is still used by legacy post-workout, selection, reporting, Home and ad-hoc paths. It must be separated into boundary metadata rather than retired wholesale.

Exercise-intervention records exist only as recommendation-state records. Session construction never reads them, so they presently cannot prefer, avoid, exclude, or safely substitute an exercise. Their schema also has no explicit severity, region, expiry timestamp, clinician source, or hard-exclusion flag.

The evidence repository exists and the completion loop writes narrow evidence records, but `use-workout-logger.ts` still retains a large commented V2/V3/living-athlete implementation, and the coaching-evidence engine still exposes model-era naming and proposal shapes. The migration is incomplete.

The repository is type-safe but not test-clean: the baseline full test run reports 50 failures in 16 files. It is safe to modify only in small, isolated phases with targeted tests; it is not safe to delete legacy planning modules or claim an end-to-end recovery baseline yet.

## Verified current architecture

| Responsibility | Current runtime owner | Evidence |
| --- | --- | --- |
| Active plan persistence | `activeTrainingPlanRepository` | `src/data/local/active-training-plan-repository.ts` |
| Goal/macro/meso/micro hierarchy | `ActiveTrainingPlan.currentMesocycleId` and `.currentMicrocycle`; macrocycle/mesocycle/microcycle libraries | `src/domain/training/plan-setup.ts`, `macrocycle-engine.ts`, `mesocycle-library.ts`, `microcycle-scheduler.ts` |
| Approved successors | `getApprovedNextMesocycleStates`; mutation via `transitionToApprovedMesocycle` | `src/domain/training/plan-setup.ts` |
| Active planned-workout construction | `buildRecoveryWorkoutSession` | `src/features/workout-logging/use-workout-logger.ts`, `src/domain/training/recovery-workout-constructor.ts` |
| Exact set targets | `WorkoutExerciseLog.prescribedSetTargets` | `src/domain/training/models.ts`, `recovery-workout-constructor.ts` |
| Live completion evidence write | `runFirstShippablePostWorkoutLoop` then `trainingEvidenceRepository.add` | `first-shippable-coaching-loop.ts`, `use-workout-logger.ts` |
| Plan UI context | `buildPlanPageViewModel` | `src/domain/training/plan-page-view-model.ts` |

The active-plan constructor is the only production start path in `createSessionFromActivePlan`; `createSessionFromProgrammeDay` clears a programme selection and returns `null`. This protects planned-workout creation from programme-builder selection, but historical builder code remains in a commented implementation block.

## Conflict inventory

### High-risk active-plan leaks

| File / symbol | Current behaviour | Active-plan path | User-facing | Authority today | Risk | Action |
| --- | --- | ---:| ---:| ---:| ---:| --- |
| `recovery-workout-constructor.ts` / `buildRecoveryWorkoutSession` | Accepts `currentBlock`, stores block identifiers, passes it into selection/settings | Yes | Indirect | Mixed | Critical | Migrate input to a planning-context compatibility adapter; constructor must consume mesocycle/microcycle/session role only. |
| `recovery-workout-constructor.ts` / `constructSessionContract` | Treats active legacy `deload` block as a construction decision | Yes | No | Yes | Critical | Replace with approved mesocycle/microcycle recovery state. |
| `recovery-workout-constructor.ts` / `exerciseScore` | Scores `Exercise.suitableBlocks` against block type | Yes | No | Yes | Critical | Score against mesocycle/session-role eligibility; retain `suitableBlocks` only during record migration. |
| `use-workout-logger.ts` | Reads `useTrainingYear` and passes `currentBlock` into active constructor | Yes | No | Input authority | High | Remove from active-plan creation after compatibility adapter exists. |
| `training-session-selection.ts` | Determines current week using `activeBlockId` and block week | Yes | No | Yes | Critical | Migrate completion/session selection to microcycle sequence and planned session index. |
| `post-workout-review.ts` | Uses block type and top-of-rep-range fallback alongside exact targets | Yes | Possibly | Mixed | High | Preserve only exact-target branch for planned sessions; isolate range logic for calibration/extra sessions. |
| `home-dashboard.ts` | Derives current/next block, block rep focus/drop-off and next-block preview | Yes | Yes | UI/coaching input | High | Replace Home inputs with planning context; do not use roadmap order for transitions. |
| `analytics.tsx` | Imports training-year repository and invokes `startDeloadTrainingYear` | No planned construction, but production screen | Yes | Mutation path | High | Quarantine/rewrite analytics actions before deleting shared recommendation actions. |

### Legacy/compatibility or non-authoritative paths

| File / symbol | Current behaviour | Active-plan path | User-facing | Authority today | Risk | Action |
| --- | --- | ---:| ---:| ---:| ---:| --- |
| `annual-models.ts`, `annual-planner.ts`, `block-display.ts` | Defines and creates annual plans/training blocks | Compatibility and legacy callers | Yes via legacy screens | Legacy | High | Wrap as persisted-record compatibility; delete only after all callers migrate. |
| `training-year-repository.ts`, `use-training-year.ts` | Parallel training-year state | Indirectly injected into Plan/Train/AI | Yes | Competing state | Critical | Remove from active-plan consumers first; retain read migration only. |
| `plan-page-view-model.ts` | Roadmap still derives from legacy blocks but approved successors are mesocycle-only | Plan only | Yes | Informational only by intent | Medium | Rename/mark compatibility roadmap and remove when Home/Plan visual replacement is ready. |
| `programme-skeleton.ts` | Legacy skeleton with `currentBlock` | Onboarding-related tests/old path | Possibly | Old setup path | High | Quarantine; onboarding now saves an active plan directly. |
| `strategic-coaching*.ts`, `block-*`, `rep-range-strategy.ts` | Old block/policy decision systems | Report/test/ad-hoc paths | Mixed | Legacy | High | Inventory consumers and isolate from planned sessions before deletion. |
| `ad-hoc-workout-generator.ts` | Builds programme using block filters and ranges | No authoritative planned path | Extra/preview UI | Authority within its own path | Medium | Reframe as extra/preview-only; prohibit planned session kind. |
| `programme-builder.tsx`, `programme-builder.ts` | Edits range metadata and programme templates | No authoritative planned path | Yes | Builder only | Medium | Relabel ranges as boundaries and prevent selection from becoming planned. |

## Active-plan authority map

```text
ActiveTrainingPlan
  -> currentMesocycleId / currentMicrocycle / sessionRolesForPlan
  -> resolveRecommendedSessionIndex
  -> buildRecoveryWorkoutSession
  -> prescribedSetTargets
  -> local WorkoutSession(sessionKind: planned)
  -> completion loop + canonical load evidence + training evidence records
```

The intended source of truth is sound. The legacy leak enters through `currentBlock` and the block-aware helpers used after the active plan has already been selected.

## Compatibility-only data map

| Concept | Temporary retained field/module | Permitted purpose | Must not do |
| --- | --- | --- | --- |
| Training blocks | `ActiveTrainingPlan.blocks`, `activeBlockId` | Load old plans, label old records, map `planBlockId` history | Choose a new session, deload, successor, or prescription |
| Block session metadata | `WorkoutSession.planBlockId`, `planWeekNumber` | Match historical sessions during migration | Determine current active-plan week |
| `ProgressionSettings.repRange` | Exercise safety/calibration boundary | Build valid exact targets and handle calibration | Be shown as planned-workout progression target |
| Training year | local repository/year models | Restore old data temporarily | Drive Home, Train, Plan, analytics actions, or session selection |
| Programme skeleton | skeleton repository/model | Read/export old drafts | Create or mutate the active plan |

## Non-authoritative path audit

| Path | Can create planned workout? | Modify active plan? | Transition mesocycle? | Supply targets? | Legacy assumptions | Classification / required boundary |
| --- | ---:| ---:| ---:| ---:| --- | --- |
| `app/(protected)/programmes/ai.tsx` + `ad-hoc-workout-generator.ts` | No, should be extra only | No | No | Range-based template settings | Block/current training-year | Production extra preview; enforce non-planned session kind at persistence boundary. |
| `extra-session-generator.ts` | No intended main-plan creation | No | No | Yes, own optional targets | `BlockType`, generator/ranges, equipment filters | Production extra path; needs active-plan context admission but cannot become planned. |
| `programmes/builder.tsx` + `programme-builder.ts` | No current start path | Persists programmes, not active plan | No | Boundary metadata | `repRange`, programme skeleton | Builder-only; explicit preview/draft label and no planned-session selection. |
| `design-qa-fixtures.ts` | Seeds local sessions/plans | Yes, fixture repository writes | Indirectly via legacy actions | Fixture values | Block transitions, deloads, removed goals | Fixture-only; split into current-architecture fixtures and legacy archive fixtures. |
| `advanced-reporting.ts`, analytics screen | No | Legacy deload action can mutate training year | No approved mesocycle transition | Reads historical metrics | Blocks/current block | Reporting; must become read-only and use planning context. |
| Snapshot/architecture tests | N/A | N/A | N/A | N/A | Assert historical UI/models | Test-only | Rewrite only after current user journey assertions exist. |

## Evidence migration map

| Source | Current callers | Runtime effect | Gap / action |
| --- | --- | --- | --- |
| `trainingEvidenceRepository` | workout completion write | Persists narrow adherence/pain records and calibrations | Add read APIs/versioning/deduplication/retention; no remote sync path identified. |
| `TrainingEvidenceRecord` | first shippable loop | Small explicit evidence record | Too narrow to represent exercise-fit/intervention provenance. |
| `coaching-evidence-engine.ts` | first-shippable loop | Processes raw history into proposals | Still uses model-era reason `living_athlete_model_update_proposed`, generic proposal shape, and no repository readback. |
| `livingAthleteModel` references/docs | commented logger implementation, docs/tests | Not an active constructor input | Physically delete commented legacy implementation and migrate docs/tests. |
| Workout history + canonical load evidence | constructor/load selection/review | Runtime prescription evidence | Correct direction, but expose a single explicit read adapter to evidence engine. |

Evidence currently affects completion-loop audit output and stored records, not active session construction or approved plan transitions. Provenance must be retained: proposed migration records need a stable schema version, source session IDs, timestamps, evidence IDs and reason codes. Do not merge content by text matching.

## Exercise-intervention audit and integration design

### Existing schema and semantics

`PlanRecommendationState.exerciseInterventions` stores `ExerciseInterventionRecord` with `exerciseId`, decision (`keep`, `substitute`, `rotate_at_phase_boundary`, `replace`), limited reason, evidence strings, decision date, review exposure count, and optional replacement ID. `exercise-intervention-record.ts` can decide an intervention and assess active status.

It does **not** model explicit avoid/exclude severity, body region, clinician/coach source, user override, equipment restriction, permanent versus temporary restriction, expiry timestamp, movement-pattern scope, or validated substitution constraints. `reason: "unavailable"` exists but equipment is intentionally not a planning limiter.

### Current execution trace

`ActiveTrainingPlan -> buildRecoveryWorkoutSession -> constructSessionContract -> selectSessionExercises -> catalogue filter by pattern/experience -> block-aware score -> createExerciseLog -> exactTargets -> persist planned WorkoutSession`.

No construction function imports `exercise-intervention-record.ts` or reads `recommendationState.exerciseInterventions`. Swaps are later session-local via `exercise-swaps.ts`; no intervention provenance is applied in initial selection.

### Safe integration boundary

Apply interventions inside `selectSessionExercises`, after normal pattern/experience eligibility and before scoring. The boundary must receive a typed `ExerciseInterventionContext` resolved from the active plan and completed workout evidence.

1. Build ordinary candidates from movement intent, session role and experience.
2. Resolve active intervention records deterministically, using current mesocycle and comparable exposure count.
3. Hard-filter only records with a future explicit hard-exclusion semantics. The present schema cannot safely infer this from every `replace` record.
4. Apply soft avoid/prefer/substitute modifiers during scoring.
5. Validate a named replacement: it must preserve required pattern/session role, be eligible for experience, be resolvable in the catalogue, and not itself be excluded.
6. Persist a selection decision record (selected/rejected IDs, intervention IDs/reasons, fallback reason) in the workout notes or a new auditable field.
7. If all candidates are restricted, return a safe construction failure; do not select a contraindicated exercise. A future clinician/pain feature needs its own explicit product and schema decision.

## Ordered implementation phases and deletion gates

1. **Integrity gate.** Fix or retire tests/imports tied to already-removed constructors; remove the commented V2/V3 logger block. Gate: typecheck and focused active-plan/navigation/completion tests pass.
2. **Planning-context boundary.** Create one compatibility adapter from saved legacy block fields to a read-only context. Remove `useTrainingYear`/`currentBlock` from active construction and session selection. Gate: a generated workout uses mesocycle, microcycle and role with no block argument.
3. **Consumer migration.** Migrate Home, Train, Progress and Analytics labels/actions to planning context and exact targets. Gate: no active screen reads training-year or current-block for coaching decisions.
4. **Compatibility isolation.** Move legacy block/year fields to migration adapters; preserve historical rendering only. Gate: constructor, progression, transitions and session selection have no imports from annual modules.
5. **Peripheral path boundaries.** Mark ad-hoc/builder sessions extra/preview at creation and persistence. Update QA fixtures/reporting to current plan context. Gate: tests prove they cannot create `sessionKind: "planned"`, mutate plan or transition mesocycle.
6. **Evidence migration.** Add repository read model, versioned evidence/calibration records and direct history adapter; rename/remodel model-era proposal vocabulary. Gate: completion writes and next-workout reads only explicit evidence/history records.
7. **Intervention integration.** Extend schema only for agreed semantics, apply records at selection boundary, validate replacement/fallback and audit reasons. Gate: tests prove excluded exercises are never chosen and substitutions retain movement intent.
8. **Deletion.** Remove annual planner, training-year repository, old generators/policies/tests/docs only after zero production imports and migration tests. Gate: repository search and full test suite clean.

## File-by-file next change plan

- `recovery-workout-constructor.ts`: remove `TrainingBlock` input/scoring once planning context can express mesocycle/microcycle intent; integrate interventions later.
- `use-workout-logger.ts`: remove training-year dependency and the commented retired V2/V3 code; preserve active-plan start and completion behaviour.
- `training-session-selection.ts`: replace block/week matching with active microcycle/session identity.
- `home-dashboard.ts`, `analytics.tsx`, `advanced-reporting.ts`: consume planning context; remove block preview/annual deload actions.
- `post-workout-review.ts`: make exact-target comparison the only planned-workout progression decision; keep range data only for calibration/extra sessions.
- `plan-setup.ts`: retain legacy fields in a clearly versioned compatibility section; move intervention records out of recommendation state when their lifecycle is implemented.
- `exercise-intervention-record.ts`: add a resolver API and only schema fields approved by product/safety requirements.
- `ad-hoc-workout-generator.ts`, `extra-session-generator.ts`, `programme-builder.ts`: preserve their separate role; remove any ability to label outputs planned.
- `design-qa-fixtures.ts` and legacy architecture tests: divide current fixtures from compatibility fixtures; remove block-transition fixtures after migration.

## Test strategy and rollback

Each phase needs a narrow behavioural suite plus a regression test proving the old path cannot regain authority. Required tests include: active workout construction without block input, mesocycle transition starts microcycle one, exact targets survive persistence, extra/builder output cannot be planned, legacy plan loads safely, intervention hard-exclusion/no-candidate safety, and evidence provenance round-trip.

Rollback is data-first: retain serialized legacy `blocks`, `activeBlockId`, `planBlockId`, and `planWeekNumber` read adapters until migration coverage is complete. Do not retain live decision callers as rollback. Feature work must be reversible through adapters, not parallel engines.

## Baseline verification and known failures

- `npm run typecheck`: passed.
- `npx expo config --type public`: completed when run directly. A wrapper that attempted to parse the command output as JSON failed because Expo emits environment log lines; this was tooling-only, not an Expo configuration failure.
- `npm test`: failed: **16 files / 50 tests failed; 117 files / 1473 tests passed**.

Failures are pre-existing for this audit and largely prove the migration is incomplete: `planned-workout.test.ts` (20), `home-dashboard-view-model.test.ts` (7), `product-flow-architecture.test.ts` (4), `master-architecture.test.ts` (4), `product-positioning.test.ts` (4), `design-qa-fixtures.test.ts` (2), plus one each in paywall, recovery-capacity, simulator QA, progress dashboard, programme skeleton, load selection, workout history, event taper and recommendation actions. `qa-reports/v3-shadow-telemetry-review.test.ts` also fails as a test file. These are not attributed to this audit.

## Open risks

1. The active constructor still has a live block-based selection/deload path.
2. Home and Analytics can present or mutate legacy block/year state as if it were authority.
3. Large commented V2/V3 code in the logger is a future accidental-revival risk.
4. Intervention records can be written but have no selection effect; safety expectations exceed schema capability.
5. Full tests encode conflicting historical product promises, so deleting modules before test migration will increase breakage.
