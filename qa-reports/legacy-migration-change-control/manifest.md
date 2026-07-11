# Legacy migration change-control manifest

## Stage 2B completion/recommendation record

| File | Old authority | New authority | Focused tests / Stage 3 condition |
| --- | --- | --- | --- |
| `current-completion-orchestration.ts` | Default-week advancement | Persisted workout → current readiness producer → current writer | Completion architecture; retain until Stage 3 persistence migration. |
| `use-workout-logger.ts` | `advanceCompletedMicrocycle` | Current completion orchestration only | Logger completion regression; no display migration. |
| `current-decision-recommendation.ts` | None; legacy actions remain isolated | Current decision repository + application boundary | Consumer facade; migrate UI consumers in 2C/2D. |

## Stage 2 application-boundary record

| File | Reason | Focused tests | Stage 3 condition |
| --- | --- | --- | --- |
| `current-decision-application.ts` | Sole current decision mutation boundary; no block decision write. | `current-decision-application` | Retain legacy plan fields until persisted active-plan migration. |
| `current-decision-application.test.ts` | Continue/idempotency and legacy-block isolation coverage. | self | Extend with migrated consumer coverage. |

Direct consumer migration remains pending; this commit does not alter recommendation, logger, Progress, volume, or UI authority.

## Phase 11A.2C3 execution record

| File | Reason | Focused tests |
| --- | --- | --- |
| `current-readiness-producer.ts` | Canonical composition of existing evidence boundaries into a persisted snapshot. | readiness production, evidence regressions |
| `current-progression-transition-decision-writer.ts` | Snapshot-first authoritative writer and idempotency. | readiness production |
| `current-readiness-snapshot.ts`, decision record | Persist narrow decision context/reference with defensive copying. | snapshot and decision persistence |

No C3 module applies a transition, creates a microcycle, or invokes legacy block progression. Stage 2 consumer migration remains deferred.

## Phase 11A.2C2 execution record

| File | Pre-edit SHA-256 | Change reason | Post-edit checksum / focused tests |
| --- | --- | --- | --- |
| `src/domain/training/current-mesocycle-readiness-context.ts` | New file | Pure current-snapshot exposure, successor validation, and objective-policy boundary; no writer or transition behaviour. | `8a682ce…873ac7e`; `current-mesocycle-readiness-context` |
| `tests/current-mesocycle-readiness-context.test.ts` | New file | Cover explicit policy, snapshot-only counting, graph candidates and objective-policy honesty. | `e2ac4e…2ae301`; focused pass |
| `docs/current-mesocycle-exposure-successor-objective.md` | New file | Define C2 authority and C3 hand-off. | Documentation review |
| `phase-11a2c2-exposure-successor-objective-map.md` | New file | Map field authorities and missing-policy behaviour. | Documentation review |

Verified C1B baseline before C2: 15 failing files / 43 failing tests / 1,529 passing tests; typecheck, Expo public config, and web export passed. C2 requires C3 to persist/produce new snapshots and integrate the decision writer.

Created: 2026-07-11 (Europe/London)  
Repository root: `/Users/aaronparry/Documents/Bodybuilding App`  
Branch: `main`  
Git condition: `.git` is a directory, but `main` has no commits and every project file is untracked. No parent repository was found. This is an initialized but disconnected/unseeded checkout, not a normal dirty worktree.

## Local Git baseline

- Source baseline commit: `67710ff182ce38952a5cc22b4f05a4608ae1850d`
- Subject: `chore: establish pre-migration repository baseline`
- Date: 2026-07-11 (Europe/London)
- Committed source/configuration file count: 705
- No remote was created, added, or used.
- `.gitignore` was strengthened to exclude credentials, native/generated output, screenshots/QA output, coverage, editor state, and change-control originals while retaining the migration records themselves.
- Sensitive-file audit: no private key, service-role, bearer-token, password, signing credential, or access-token marker was staged. `app.config.ts` contains public client-provider configuration identifiers only.
- Frozen test baseline remains 16 failing files / 50 failing tests; 117 passing files / 1,473 passing tests.
- No production behaviour changed while creating this baseline.

## Baseline commands

| Command | Result |
| --- | --- |
| `git rev-parse --show-toplevel` | `/Users/aaronparry/Documents/Bodybuilding App` |
| `git log -1 --oneline` | failed: branch has no commits |
| `npm run typecheck` | passed |
| `npx expo config --type public` | passed when run directly |
| `npm test` | 16 failing files / 50 failing tests; 117 passing files / 1,473 passing tests |

The complete failure inventory is frozen in `baseline-failures.md`. Any future phase must compare against that inventory; it may not use Git diff as a safety signal.

## Phase ledger

| Phase | Expected files | Pre-change originals/checksums | Post-change checksum | Created | Deleted | Status / reason |
| --- | --- | --- | --- | --- | --- | --- |
| 0A–0B | This manifest, baseline inventory | N/A: change-control records | Record after creation if changed again | `manifest.md`, `baseline-failures.md` | None | Complete. No production files modified. |
| 1 integrity | Import/barrel/dynamic-reference audit only | No production edit required: domain alias scan found no unresolved source imports; typecheck passes | N/A | None | None | Complete as audit-only. Retired V2/V3 names occur in a logger comment and historical documents/tests, not an unresolved executable import. |
| 2 target boundary | `models.ts`, planned constructor/review/progression files only after caller audit | Required per file | Required | Focused tests if added | None | Not started. |
| 3 block compatibility | constructor, logger, selection and tests only after explicit context contract | Required per file | Required | Focused tests if added | None | Not started. |
| 4–9 | Deferred | Required per file | Required | TBD | Deletion only after gates | Not started. |

## Change protocol

Before every production or test edit:

1. Copy the original into `originals/<relative repository path>`.
2. Record `shasum -a 256` for the source and original in this table.
3. Record intended reason and focused acceptance tests.
4. Update the post-change checksum only after typecheck and focused tests.

Do not copy environment files, credentials, build output, caches, generated binaries, or `node_modules`.

## Phase 2 execution record

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/models.ts` | `bddf4a37af3f7968e8ef1703808ca874d931fa62680451b1b2e1afff97398837` | Name stored exact planned targets explicitly. | `1de85039a6be628f9c49a1fc5662fdc87f1216a99c2185a9768bca6d67845e23` | `planned-target-boundary`, `session-construction` |
| `src/domain/training/first-shippable-coaching-loop.ts` | `06d51d95105bc89a34713b6e07d03941379c739590c61a6f977acd0ac18154af` | Read stored exact targets before compatibility range metadata during completion-quality evaluation. | `1d44ca13d4e1d63a7eb82970ad52c35c03b245c7eb704e3cc8edc0681498a9f6` | `planned-target-boundary`, `quality-of-execution-engine` |
| `src/domain/training/planned-target-boundary.ts` | New file | Explicit exact versus compatibility target-resolution contract. | `4f7b24ad276f49567a82b1a3ee809933136e97d1c74e22c9ec984f2b5cd55b4d` | `planned-target-boundary` |
| `tests/planned-target-boundary.test.ts` | New file | Characterize target precedence, persistence stability, compatibility fallback, and constructor determinism. | `d9bf8ea2dfa22471aaadb1376f3611e3bafceffd73a9601014cbdb204ad389fe` | self |
| `docs/exact-planned-target-boundary.md` | New file | Record Phase 2 authority and deferred callers. | `76c28bdd870f834b05f6e7cfdf053c7fcfc250faf6d5c203a85f6198e7f8b62a` | Documentation review |

Original copies for modified existing files are stored below `originals/` and excluded from Git.

## Phase 3 execution record

Current planning authority now resolves before active construction. Original snapshots are retained for every modified existing source file. Phase 3 removes raw `TrainingBlock` from the active constructor and its logger call, introduces mesocycle/microcycle session metadata, and keeps a labelled compatibility adapter for fully legacy plan records.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/models.ts` | `1de85039a6be628f9c49a1fc5662fdc87f1216a99c2185a9768bca6d67845e23` | Persist current mesocycle/microcycle identity with planned sessions and summaries. | `b0c2beea4ec5608ad761fe6b6dcc48e213154c48ab633f6267a68e071a0babad` | constructor authority, session construction |
| `src/domain/training/recovery-workout-constructor.ts` | `0f036da7ea9b8436fda35274d62d30cd86060ee3d86d5e84e148f71a6be286ea` | Require resolved current planning input; remove raw block scoring and block-derived session data. | `291a125626e3a82e616058f2525e1a10c33c3b1335ab87951954f7ac52090b1f` | constructor authority, session construction, planned target boundary |
| `src/domain/training/training-session-selection.ts` | `fa8ef8a97e733bc69cca33a1476bf0e6128fc9f07b47b8b1bc48a6e8cb4d9cff` | Select and advance using mesocycle/microcycle identity; isolate legacy history matching. | `97b6699bcaa97f0dd17ba63071c89d91c5f87afec73ac508480b3d2fc0b8e589` | constructor authority, Home baseline comparison |
| `src/domain/training/workout-history.ts` | `2ce7f9c7aea261450a5c0bab17ef5b97c54d387c862305d555d5905943833c2c` | Retain current planning identity in summaries. | `9125eca4d146b403cfa92f146468d4140e68eb5da2e57aac9b4bd6e3f8a40d36` | workout-history baseline comparison |
| `src/features/workout-logging/use-workout-logger.ts` | `0432d4d50e79a63761cba4cfbec20172ea39f49a601661813a75ae5d899179d5` | Stop passing block to active construction and stop gating microcycle advancement on block/week. | `e3d0e8f47dcb9cd074f24d960df6df61f260bc0aafac1718e1450ffb8e4e5516` | constructor authority, session construction |
| `tests/session-construction.test.ts` | `a8f545c56159c7fdf23a5d392d51507faa598ec916e734ecd3e6b5452b727182` | Use the current planning contract. | `bb81d9c4a256306a90c9add44a6c62ede64205461ec1542ccea0c0bc9972dfd7` | self |
| `tests/planned-target-boundary.test.ts` | `d9bf8ea2dfa22471aaadb1376f3611e3bafceffd73a9601014cbdb204ad389fe` | Remove obsolete constructor block input. | `7881d95c8308ffd778658e9ef112fd1cae7bf6c9f6ebd40c2d5d2703b620533d` | self |
| `src/domain/training/current-planning-input.ts` | New file | Explicit current-versus-legacy compatibility planning boundary. | `c0cf41dcad4447fa2f1ee359802745ccf3bbaf8b8a11f8e885cedef165c5f3b6` | constructor authority |
| `tests/current-planning-constructor-authority.test.ts` | New file | Characterize current authority, compatibility and deterministic selection. | `a44559668b0183e58a9987218d44ad1db362f8444c5d016ea7e30d4173df8500` | self |
| `docs/current-planning-constructor-authority.md` | New file | Record current authority, compatibility and deferred consumers. | `249e350ef9871a0fd2769d79671a89fa20992330e41802c838b35273289093cd` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-3-constructor-authority-map.md` | New file | Record Phase 3 authority audit and deferred paths. | `89cc02d1c661c91c60518e02eb36f08a544a809a68701142ee27b8c548e184ad` | Documentation review |

## Created-file checksums at last verification

## Unexpected untracked file investigation

| Path | SHA-256 | Size | Classification | Resolution |
| --- | --- | --- | --- | --- |
| `tests/plan-page-view-model.test 2.ts` | `ef49f66d5b6549de7d7dfebea947baf21bb2e3b0baa33a7a97c8dfecda37dad6` | 13,169 bytes | Older Phase 4A pre-edit copy; legacy block/roadmap/annual assertions only | Preserve in ignored quarantine, then remove from `tests/`. |

The file's checksum matches the pre-edit checksum recorded for `tests/plan-page-view-model.test.ts` in the Phase 4A ledger. It was not referenced by package scripts or imports, and its `test 2.ts` suffix is outside Vitest's normal `*.test.ts` discovery pattern. Provenance cannot be established from local metadata; Finder/editor duplication is plausible but unproven.

## Phase 4A execution record

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `app/(protected)/(tabs)/index.tsx` | `007dc7a140a976b7aa1403d5aa7229a405f449421c58d234827ef92b62c48701` | Remove training-year and block-derived planned-preview authority from Home. | `0a1a83e66ac54016dd8f56a8e799fcaaa95c10bcc8203bbf141bca44c38bee56` | Home dashboard, navigation UI |
| `app/(protected)/(tabs)/programmes.tsx` | `693e19730094878e82440243b4e26d4ebcc10f75f8fc6151b4bca242ba65a11b` | Remove training-year input and legacy roadmap from Plan. | `b347d164b570abb197dfcc3a852bf23b84039d32560166ae5c9288211f45e131` | Plan view model, navigation UI |
| `src/domain/training/home-dashboard.ts` | `e8a513ff7c2959bb56e7a3def91e4b74fff6d70424299189dd1b3030af8b58a5` | Add current planning context and stop using block/year data as Home display authority. | `aec2ad5a3d3b32f2400d3a7ba0ed74208a2fb8a7bc7054a45091f8533ce367d2` | Home dashboard |
| `src/domain/training/plan-page-view-model.ts` | `d5819ba7bae792175f540706b20c43b6fa08b398f15b39d925081a4666632e22` | Replace block roadmap contract with current planning, exact target, and approved-successor data. | `7147a173bc63c75e623796b3a8e407dd004f3147d6e688a2596dfaa50f1f991a` | Plan view model |
| `tests/home-dashboard-view-model.test.ts` | `d90745b77597db78d6b7f688d5740438d7175bc72008262ff599813872add01e` | Add current-context and exact-target characterisation. | `64fd827fb014a308a97e0a1da0e706dd5973561c548a0cfd89e8be9bd4b2b30d` | self |
| `tests/plan-page-view-model.test.ts` | `ef49f66d5b6549de7d7dfebea947baf21bb2e3b0baa33a7a97c8dfecda37dad6` | Replace obsolete roadmap/block assertions with current-authority assertions. | `f8b83f58194a20eeb9f7b97364cf825b99496a9099ed67526182405b6180f91a` | self |
| `tests/workout-navigation-ui.test.ts` | `c7dde63ba90a1d335ded85c3e59afde7f6e936369c94c207d7dfd0114a9f951b` | Align source-structure assertions with current Home/Plan presentation. | `8b8dc791264c25956ceb55e33660fca0adb3c4f1abe603015d4cdbc6e81c51e4` | self |
| `docs/home-plan-current-planning-context.md` | New file | Record Phase 4A authority and compatibility boundaries. | `78efa74d833e488d07548be0eec4623f2eb091f7105f90ea8ddccbb48303637c` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-4a-home-plan-consumer-map.md` | New file | Record pre-edit Home/Plan consumer map. | `9896577e4324c7f0e7c1f9a95a068e65eae9618b27a748c1f21eb3cd53b605d2` | Documentation review |

## Phase 4B execution record

Phase 4B changes only Train's planned work-set target reader. It does not change planned construction, selection, logging persistence, live coaching, ad-hoc behaviour, or the commented V2/V3 implementation.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `app/(protected)/(tabs)/train.tsx` | `4f331cef8604c02ff5066698eb5e53b349b2e0118032bbf19f6ac389b733c19e` | Resolve planned working-set display/input targets only from the stored per-set exact prescription; make missing planned targets explicit. | `c5722a8d58d28f99ea7aae0552da21402afb42ee6dabbc8041aeaa9096c59a0d` | `train-execution-target`, `planned-target-boundary`, `session-construction`, `active-workout-persistence`, navigation UI |
| `src/domain/training/train-execution-target.ts` | New file | Narrow pure execution resolver separating planned exact targets from non-planned boundary metadata. | `4e9bb87d9423f5cbf00faf812ef7459255f45649bacc326044dc2561b1bf953c` | `train-execution-target` |
| `tests/train-execution-target.test.ts` | New file | Characterize per-set planned target precedence, range isolation, explicit compatibility state, and non-planned separation. | `c2afa61ebf35a800d2b019e1524e6ff4fb9d8f91b70a080cccc123e3693b4c10` | self |
| `tests/workout-navigation-ui.test.ts` | `8b8dc791264c25956ceb55e33660fca0adb3c4f1abe603015d4cdbc6e81c51e4` | Preserve the athlete-facing More-panel assertion after adding the typed session-kind argument and assert Train's planned-target gate. | `a0235d32c1eb30800be2620ed3da7d4ebb72d1527c63c56d77785237e68fb076` | navigation UI |
| `vitest.config.ts` | `083cc95351da8704b361d5f315652fe85edc40358ba68d5facd7edb3c32f4320` | Exclude ignored local original backups so they cannot be discovered as duplicate tests. | `ae3462d709779a5b80c65cc3a7e48a3a5182e0d943ad52ec8254033a7a54f1fc` | full suite |
| `docs/train-exact-planned-execution.md` | New file | Record Train execution authority and deferred scope. | `4120bc50b2b0dd27411c1c4add0bcc94dd29bebf2158d2637643c06801cf276a` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-4b-train-execution-map.md` | New file | Record the pre-edit Train execution authority map. | `10c628ddd69be7a4601400b7ea13c561ef717d19d7bbbbe43804683ae72327ed` | Documentation review |

The pre-edit original of `app/(protected)/(tabs)/train.tsx` is preserved below `originals/` and is Git-ignored. The quarantined obsolete `tests/plan-page-view-model.test 2.ts` remains ignored and untouched.

## Phase 4C execution record

Phase 4C changes completed planned-workout classification only. It does not alter Train execution, logger persistence, Analytics/reporting, evidence, interventions, ad-hoc/custom construction, or the quarantined legacy Plan suite.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/models.ts` | `b0c2beea4ec5608ad761fe6b6dcc48e213154c48ab633f6267a68e071a0babad` | Retain stored exact target arrays and their source classification in history summaries. | `6ea13a242812ddafc70189fceec9167398fe4a39ef97d6de1fb46222a9b25b66` | workout history, Progress authority |
| `src/domain/training/workout-history.ts` | `9125eca4d146b403cfa92f146468d4140e68eb5da2e57aac9b4bd6e3f8a40d36` | Evaluate completed planned sessions from stored exact targets by ordinal before compatibility range rules. | `f9d232f1c7efd7c65b7a77a3beaafd44534d8d6f73ffd37c080e3befd62239c1` | workout history, post-workout review |
| `src/domain/training/post-workout-review.ts` | `5bfd6dc529e565f62b372410b8f33747543b7534ac82a393e6f8f516a055d58f` | Prevent current block/range target-zone and throttle inputs from reclassifying an exact stored prescription. | `c84fcf205e8db6db503e32151fb5b9c8eec86a30b3c9f780be45f464d07d3bbc` | post-workout review |
| `tests/workout-history.test.ts` | `aaefeb7164cc0b8f5d78fe6e6eef2661b35ae5f5daeb4c24f7ed68fa24f682c6` | Characterize stored-target ordinal success and miss handling. | `7ab004a44c08b8401f687ed8af6201f3501d32531c285a670d04c8bc2a82e44d` | self |
| `tests/post-workout-review.test.ts` | `79bb74e0dce27dfe7cfa8e0004cda5d9b24fac88ee11143f4e69ee209315cd30` | Characterize historical review invariance across changed range/block context. | `afc1ab640554b3d7eabc2e0d880be11f3aafd1ded5ef0f70dd39c8592c3e77a1` | self |
| `tests/progress-dashboard.test.ts` | `b4901429efa689ebac605d51b945aeea02ff66a3accc0719594073ab20a647c0` | Characterize immutable stored prescription outcome consumption by Progress. | `1af62aa56e73f79d60c5d9c1d0b711443f434c3ecf6d1bcb9d61d4a2912105be` | Progress dashboard |
| `docs/post-workout-progress-stored-prescription-authority.md` | New file | Record Phase 4C authority and explicit compatibility boundary. | `1fa6a4ba456a678d4a768c237606c8948f820354b22914e39d993faa17c7cdb8` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-4c-review-progress-authority-map.md` | New file | Record Phase 4C pre-edit authority map. | `08dcfa5760097e903ce1a1808a6f9ea10c91e3f053d4079dcc7a39014ec7ac22` | Documentation review |

## Phase 4D execution record

Phase 4D makes Analytics and reporting read-only consumers of current planning context and stored history. It does not alter planning, Train execution, progression authority, evidence, interventions, builder, or ad-hoc paths.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `app/(protected)/(tabs)/analytics.tsx` | `7ca31f2add4b77fc6322c195fbd9b1c709043f2aca1ff71562e81222acf23e92` | Replace raw block context and Analytics plan/training-year writes with read-only current planning context and Plan navigation. | `e8412360551305af99e1d08afe280c83362d5b49069e54f71761b504ec57849d` | analytics context, reporting isolation |
| `src/domain/training/advanced-reporting.ts` | `af9746b781e052bd95a38f2d634f93658c75affbcf954aa00730e24b44ef90e6` | Remove `TrainingBlock` reporting input. | `34e73195ee71b5196a54479bac80c487d8b7b8b055637d718589f5dc76dc9aeb` | advanced reporting, reporting isolation |
| `src/domain/training/analytics-planning-context.ts` | New file | Narrow current Analytics context from current planning authority. | `ef6d7d8e5cabf83f3f3363e30c6031bb822dda90bbf49ce2bacea1c8888abcb2` | analytics planning context |
| `tests/advanced-reporting.test.ts` | `cee65c08884e1a64142158d8ce89041ff137a03e795b946b9cda7bcd0a4b299e` | Snapshot preserved; report outputs remain covered. | Unchanged | advanced reporting |
| `tests/analytics-planning-context.test.ts` | New file | Verify current context ignores legacy block metadata. | `7d93d420f32d842bd1fbf789ac07704cd4e744e5c319f667658afd327d61d383` | self |
| `tests/analytics-reporting-isolation.test.ts` | New file | Verify Analytics/reporting cannot mutate planning or consume TrainingBlock. | `bb030bbfd753b0f8ce21eea9e03b94a7cbd0130192e779c2aa1f09db6ce10d79` | self |
| `tests/product-flow-architecture.test.ts` | `918804f811bcb35fee3ed96ee1b1822eff3398300305ef4ef8e761b0c66117c7` | Replace the obsolete Analytics auto-deload expectation with the stronger read-only Plan-navigation contract. | `b822ebbb595e623d687f025baf89b99889854f5470e28e7a1fe640948c21e627` | product-flow architecture |
| `docs/analytics-reporting-historical-authority.md` | New file | Record Analytics/reporting authority and compatibility grouping. | `7f84b72032dcaee18be0e57db1b020bbe400bddf2393c337f7440428fbb3a9e1` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-4d-analytics-reporting-authority-map.md` | New file | Record Phase 4D authority audit. | `dd53d59c74644bb0e36bbcc55adcd346d63ba60377865af598715090cf24ddfb` | Documentation review |

| File | SHA-256 |
| --- | --- |
| `docs/legacy-planning-coaching-evidence-intervention-audit.md` | `f7543c9ac8f5dcc5f66d477b4c59afa2d8ebe52ccd2beddfd3bc00b2a2e7904c` |
| `baseline-failures.md` | `8b5926580109a15cdba4a1161e0447f048097ef58eaa0f7d27943b29d82e62c5` |

`manifest.md` is self-modifying and therefore its checksum is reported by the final verification command output rather than embedded recursively.

## Phase 5 execution record

Phase 5 isolates non-planned sessions and Programme Builder templates. It does not change active-plan construction, planned Train execution, review/progression/Analytics authority, evidence, interventions, or the quarantined Plan suite.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/models.ts` | `6ea13a242812ddafc70189fceec9167398fe4a39ef97d6de1fb46222a9b25b66` | Add an explicit `custom` non-planned session origin. | `3ed658cb2202aad1c6c13cca46a12016d11078e8c8411683145124923fdc1783` | non-planned authority, typecheck |
| `src/domain/training/workout-origin.ts` | New file | Centralize planned/non-planned predicates and deterministic planned-only selection. | `4db4b6dc907f060fbd5a04c5ca24c9ba76347725d2943f2b84a293f4c1e1f041` | non-planned authority |
| `src/data/local/programme-repository.ts` | `2974486d311a7be7dfcf250582fd7420d7bb38e9fa0350cc923ba2219516a8ba` | Restrict programme-day selection to explicit non-planned origins and adapt old missing-origin selections to custom. | `44d84d6283f6c1db119dbb4df2a393602dfa50f2a266e5a015e7c752f2399462` | non-planned authority, active workout persistence |
| `src/domain/training/session-builder.ts` | `d64c9e9d463acd047e2a929f53689342ef46cc7aa08b9eefcc9a4facb5203a7a` | Remove unused block input and prevent template sessions from receiving planned identity. | `72650766b8d82f7087d75a6daa88737f43615fcf5bfdfe1a08d6b494c743466a` | session builder, extras |
| `src/domain/training/extra-session-generator.ts` | `ab41491a0b7d84db332de55c0265abe86fff794b891ef51a1a6777a03aed79eb` | Remove block-type authority from full-extra generation. | `9226c6bff6d84d1ca9fea7d45709792b74dbee881ed62c80829778f099020ee2` | extra-session generator |
| `src/domain/training/programme-builder.ts` | `68fe7dc0ce64e6565ba78d630301ee4940af3522c16f4773dc72804f2708f904` | Name builder exercise operations as draft operations and add draft-only validation. | `60d264b4262ad6a189fdc14f74c4b5fdcd2dec0afc19f64eeb6e14687f8ae5a5` | programme builder, non-planned authority |
| `src/features/workout-logging/use-workout-logger.ts` | `e3d0e8f47dcb9cd074f24d960df6df61f260bc0aafac1718e1450ffb8e4e5516` | Restore only the explicit non-planned programme-day session bridge; planned construction remains recovery-constructor-only. | `20dcf7946b5928b73d17d9d2ba1bc9ac5a2915e3c09941920b334d7d1f00747b` | navigation UI, active workout persistence |
| `app/(protected)/(tabs)/index.tsx` | `0a1a83e66ac54016dd8f56a8e799fcaaa95c10bcc8203bbf141bca44c38bee56` | Remove block chooser and block input from extra sessions; retain admission only. | `11a3fcc7edd432fac653a7b6a24b2e7f7281ebf371cbbafbe451489f3c179baf` | navigation UI, extras |
| `app/(protected)/programmes/ai.tsx` | `bd7ecc5d0fc81a7d7ec0137c7e726f1969212f617ce06b6e3dbc8da74eb12a65` | Stop reading the training year for custom-session generation. | `f699f298c642e91cd6678ee92e371720adeced3ae9467e8616ff32d018beb2bd` | typecheck, extras |
| `app/(protected)/programmes/builder.tsx`, `app/(protected)/programmes/[id].tsx`, `app/(protected)/programmes/session.tsx`, `src/features/programme-builder/use-programme-builder.ts` | Originals retained below `originals/` | Clarify draft/custom status and pass explicit custom selection kinds. | See final Phase 5 checksums | programme builder, navigation UI |
| `tests/nonplanned-session-authority.test.ts` | New file | Cover planned selection isolation, non-planned identity, draft validation, and progression isolation. | `f92c99579d8c975558e3c12845d82a845af3821b071bc251fdc346db1852e393` | self |
| `tests/active-workout-persistence.test.ts`, `tests/session-builder.test.ts`, `tests/extra-session-generator.test.ts`, `tests/programme-builder.test.ts`, `tests/rep-range-strategy.test.ts`, `tests/end-to-end-simulator-qa.test.ts`, `tests/workout-navigation-ui.test.ts` | Originals retained below `originals/` or earlier phase snapshots | Align direct boundary calls with the non-planned contract without changing unrelated baseline assertions. | See final Phase 5 checksums | focused suite |
| `docs/nonplanned-sessions-programme-builder-authority.md` | New file | Record Phase 5 authority and compatibility boundaries. | `4b6430f13604e92060d5eefb9946cb8cf2d238fa0033cfc6e8d2acb04eb7d608` | Documentation review |
| `qa-reports/legacy-migration-change-control/phase-5-nonplanned-builder-boundary-map.md` | New file | Record the pre-edit boundary audit. | `35cbddb4823ffc2eddbf204efbe1f9da25425f4b8e465e20f853695135791ebf` | Documentation review |

The Phase 5 logger snapshot is additionally preserved at `originals/phase-5/src/features/workout-logging/use-workout-logger.ts`; pre-edit SHA-256: `e3d0e8f47dcb9cd074f24d960df6df61f260bc0aafac1718e1450ffb8e4e5516`.

## Phase 6 execution record

Phase 6 consolidates completed-workout evidence provenance and lookup. It does not change coaching-rule decisions, planned targets, progression, session construction, evidence ingestion policy, interventions, or the V2/V3 runtime policy.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/training-evidence-record.ts` | `a009ed2644a29767f2026fc1e41d5401b320818ba2296f32806a2f5e1e7263b0` | Add stable schema/source/rule provenance to new completed-workout evidence. | `c745e5d04fb7da61ea8c6ac8edb01ecc886191d093a7a6a8f56d101582d9facd` | training evidence repository |
| `src/data/local/training-evidence-repository.ts` | `d9eedbeba58a0265f68ec2c31043ba0bda9548a17178c686b7f3583efb13f73c` | Add deterministic lookup, duplicate rejection, explicit missing IDs, compatibility normalization, and defensive reads. | `6015b318a671e30fe76f2fdf02e618891486fca2a29543559704ca9fded42abc` | training evidence repository |
| `src/domain/training/coaching-evidence-engine.ts` | `a778242bca9fce2dfbf826b84a0f31be94f1f1065d1be6e133b3adeaf1b338f7` | Replace retired living-athlete proposal terminology with training-evidence provenance wording only. | `80abb810efa7cfa36658fd4a9cd49024dc478725a8ee7e502d8abe9a090db3c6` | coaching evidence engine |
| `tests/training-evidence-repository.test.ts`, `tests/coaching-evidence-engine.test.ts` | New files | Characterize lookup, duplicate/missing handling, immutability, provenance, and retired terminology removal. | See current checksums in Phase 6 verification output | self |
| `docs/evidence-repository-runtime-authority.md`, `docs/archive/retired-v2-v3-living-athlete-evidence-reference.md`, `qa-reports/legacy-migration-change-control/phase-6-evidence-repository-authority-map.md` | New files | Record authority, archive review, and deletion gates. | See current checksums in Phase 6 verification output | Documentation review |

The Phase 6 originals are preserved below `originals/phase-6/`. The V2/V3/living-athlete logger comment was classified as deletion-gated: it contains no evidence IDs or repository writes, but it also contains unrelated retired policy/generation material that must be handled in a separate scoped cleanup.

## Phase 7 execution record

| File | Pre-edit SHA-256 | Change reason | Focused tests |
| --- | --- | --- | --- |
| `src/domain/training/recovery-workout-constructor.ts` | `291a125626e3a82e616058f2525e1a10c33c3b1335ab87951954f7ac52090b1f` | Apply active exercise interventions after normal eligibility and before deterministic scoring. | intervention selection, session construction |
| `src/domain/training/exercise-intervention-selection.ts` | New file | Centralize active intervention filtering/modifiers and derived provenance key. | intervention selection |
| `tests/exercise-intervention-selection.test.ts` | New file | Cover hard exclusion, substitute preference, invalid replacement, no-op, determinism, and empty safe outcome. | self |
| `docs/exercise-intervention-session-construction.md`, `qa-reports/legacy-migration-change-control/phase-7-exercise-intervention-integration-map.md` | New files | Record supported schema, precedence, timing boundary, and deferred work. | Documentation review |

## Phase 8 verification record

Final verification introduced an explicit intervention candidate-resolution result (`candidates`, `blocked_by_intervention`, `no_eligible_candidate`) immediately before the nullable recovery-constructor boundary. The public constructor remains nullable for compatibility; this explicit result is the deletion gate for a future constructor-result API migration. Focused authority suites pass; full-suite results are compared to the approved Phase 7 baseline.

| File | Pre-edit SHA-256 (Phase 7) | Post-edit SHA-256 | Reason | Focused proof |
| --- | --- | --- | --- | --- |
| `src/domain/training/exercise-intervention-selection.ts` | `3f67214ed9a3aff5611f1964de07c49ac5db7f9fb7abe2242518557129df143a` | `d13308385379fc44ea0a500757c5221137c2af7eaab398c467566aa02a9a90d6` | Distinguish intervention blocking from ordinary candidate absence. | `tests/exercise-intervention-selection.test.ts` |
| `src/domain/training/recovery-workout-constructor.ts` | `70e131821feb15d539e1eb7f686e94dda6161f47f66bffcc100a4f88e58b73cc` | `2dcb17a6573c2b00cee509eda39564f4bc4ff0115f0549cabd7da53f8108bd46` | Consume the typed resolver without changing the nullable constructor API. | Session-construction and authority suites |
| `tests/exercise-intervention-selection.test.ts` | `dc96573aae7a2f9aa3a4c058353e0f068fee92046046dac19537719c96a2aa55` | `07354518143f746dcd4913815ce788cf8cf4be872214a44f8336ed0bbf32f24f` | Prove blocked versus ordinarily empty candidate states. | Self |

## Phase 9A Home compatibility cleanup

Removed `currentBlock` and `nextBlockPreview` from the default Home contract. The existing Phase 4A originals preserve the pre-migration Home source and test suite; the Phase 8 commit is the immediate pre-edit Git baseline. No current caller required a historical-label adapter. Focused proof: `tests/home-dashboard-view-model.test.ts` and `tests/workout-navigation-ui.test.ts`.

| File | Pre-edit SHA-256 (Phase 8) | Post-edit SHA-256 | Reason | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/home-dashboard.ts` | `aec2ad5a3d3b32f2400d3a7ba0ed74208a2fb8a7bc7054a45091f8533ce367d2` | `efe0aab07e19555e0ea9f775f37e00898d69c7f6c269355bf7069fa0872845e7` | Remove deprecated output fields and internal block-label derivation. | Home view-model, navigation |
| `tests/home-dashboard-view-model.test.ts` | `64fd827fb014a308a97e0a1da0e706dd5973561c548a0cfd89e8be9bd4b2b30d` | `2237ec763ce2ee81a181dd000499059bc99a19a3dbf9c215ddab7f6edee4a010` | Replace seven obsolete block assertions with current-authority coverage. | Home view-model |
| `tests/product-flow-architecture.test.ts` | `b822ebbb595e623d687f025baf89b99889854f5470e28e7a1fe640948c21e627` | `aba17cfec67e2a26262d6b07ab1508386b8359eacff140872e95d384f7bed79c` | Remove now-invalid Home-contract references. | Typecheck; suite remains frozen-baseline failing elsewhere |
| `tests/end-to-end-simulator-qa.test.ts` | `14742b522c4c72c0c29133cc6a620196898ab67bd6215ce86b6214d5e8e5080c` | `5d75ff226818ab13df170b19cc155039767a288122369ac19c713dd8052ae6ff` | Replace Home block fixture assertion with microcycle assertion. | Typecheck; suite remains frozen-baseline failing elsewhere |

## Phase 9B explicit planned-construction outcomes

The Phase 9A Git commit is the pre-edit baseline for the constructor, logger, and direct tests. `buildRecoveryWorkoutSession` now returns a discriminated result rather than `WorkoutSession | null`; the logger narrows success at its existing no-session UI boundary. Focused proof covers constructed, intervention-blocked, no-eligible-candidate, and incomplete-planning outcomes.

| File | Pre-edit SHA-256 (Phase 9A) | Post-edit SHA-256 | Reason | Focused tests |
| --- | --- | --- | --- | --- |
| `src/domain/training/recovery-workout-constructor.ts` | `2dcb17a6573c2b00cee509eda39564f4bc4ff0115f0549cabd7da53f8108bd46` | `28b7bf66fe2bdf20c979d805235fad94dfc09f6b204fdac3bb13a2d6fbe35be5` | Replace ambiguous nullable outcome with a discriminated construction result. | Constructor, exact-target, intervention tests |
| `src/features/workout-logging/use-workout-logger.ts` | `20dcf7946b5928b73d17d9d2ba1bc9ac5a2915e3c09941920b334d7d1f00747b` | `8ff3d5c339344ee70265103ec7d4185439efc59326eed49200624a8d1c284670` | Exhaustively handle construction outcomes at the existing no-session UI boundary. | Navigation architecture |
| `tests/session-construction.test.ts` | `bb81d9c4a256306a90c9add44a6c62ede64205461ec1542ccea0c0bc9972dfd7` | `9c9ef583805407244dd9a30e54c61cabd0ecbd9a22d32d0074e38391bf7297d1` | Cover explicit constructed, blocked, and no-candidate results. | Self |

## Phase 9C deletion audit

No production file was deleted or edited. The repository-wide inventory found current Train/logger, ad-hoc, recommendation, settings, sync, and QA imports of annual/training-year or block modules. They do not meet the deletion gate and are documented in `phase-9c-final-deletion-inventory.md` and the certification document.

## Phase 10A annual authority isolation

Removed `useTrainingYear` from the active workout logger fallback and from Train's unused import. The current active-plan block may still serve non-planned/logging compatibility branches, but no training-year record can supply it. Focused Train, navigation, constructor, and non-planned suites pass.

| File | Pre-edit SHA-256 (Phase 9C) | Post-edit SHA-256 | Reason | Focused tests |
| --- | --- | --- | --- | --- |
| `src/features/workout-logging/use-workout-logger.ts` | `8ff3d5c339344ee70265103ec7d4185439efc59326eed49200624a8d1c284670` | `23c03f018f05e8aa001266cadc2954cf794d5230ca11df0cc35d09c64e1a4ea9` | Prevent training-year state from becoming fallback workout authority. | Train/navigation/constructor/non-planned |
| `app/(protected)/(tabs)/train.tsx` | `c5722a8d58d28f99ea7aae0552da21402afb42ee6dabbc8041aeaa9096c59a0d` | `d69e028da76811a8a0be530be2012c31e562a46f7bb111fe2cb17d046a488567` | Remove unused training-year import. | Typecheck |

## Phase 10B boundary audit

No production file was changed. `ActiveTrainingPlan` still persists `blocks` and `activeBlockId`, and `plan-setup` writes them through `annual-planner`. Reclassifying that executable legacy shape as a preference would be unsafe; the required plan-model/block-utility migration is deferred by scope. Sync retains training-year data as a separate compatibility record and restores an active plan independently.

## Phase 10C active-plan model audit

No production file was changed. The persisted block fields have direct runtime consumers in Train/logger, session selection, Progress/volume/recommendation, and design QA. A versioned current/legacy persistence adapter must migrate those selector and transition consumers atomically; this prompt excludes several of them.

## Phase 11A.2A role evaluability

`current-microcycle-role-evaluability.ts` derives and matches current planned role occurrences without block authority. Focused tests: current decision, persistence and role evaluability. Snapshot/trend/persistence work is intentionally deferred.

## Stage 1 current progression/transition decision persistence bridge

The original evaluator contract remains pure. This bridge adds a separately versioned, current-only persistence repository, a single writer, validation-only hydration, and an isolated temporary legacy-shadow mapper. No existing recommendation, transition, Progress, volume, Train/logger, or block reader was migrated.

| File | Pre-edit SHA-256 | Change reason | Post-edit SHA-256 | Affected callers / focused tests | Persistence / compatibility impact |
| --- | --- | --- | --- | --- | --- |
| `src/domain/training/current-progression-transition-decision-record.ts` | New file | Define schema-v1 current decision identity, lifecycle, outcome payload and structured evidence. | `9795c0738d870d64b4e1ac9ea515ccf4cbc53cd6e08c09cc3ee1212cc5c56418` | decision writer; persistence test | Current-only; contains no block authority. |
| `src/data/local/current-mesocycle-decision-repository.ts` | New file | Persist, validate and hydrate current decision records; retain applied records and supersede unresolved records. | `e1254c2dcca93b6be3ad8eff33edd353d3b0e4dbc5fb9c59e0d268033252a934` | decision writer; persistence test | New storage key only; no legacy record rewrite. |
| `src/domain/training/current-progression-transition-decision-writer.ts` | New file | Make evaluator-to-current-record persistence the sole normal writer. | `af4d1b685984710a68375c9f7eb1118fd7b8484541a94da87d171623c37f650f` | persistence test | Current save precedes optional compatibility shadow. |
| `src/domain/training/current-progression-transition-decision-compatibility-resolver.ts` | New file | Resolve current decision ahead of explicitly supplied compatibility shadow. | `e88a22055a4dc4fbe2f7fd9233adb0a6455144d40179a02fdd05d17913dc5bef` | persistence test | Never merges current and legacy authority. |
| `src/domain/training/current-progression-transition-legacy-shadow.ts` | New file | Map only safe equivalent outcomes to temporary legacy shadow vocabulary and enforce persist-before-shadow ordering. | `e3477077c58e9050696e59a85a2e156dd2baf3109da3cee3730e58559c28808c` | persistence test | `regress`/`review_required` remain explicit unsupported shadows. Delete in Stage 3. |
| `tests/current-mesocycle-decision-persistence.test.ts` | New file | Prove record, lifecycle, hydration, precedence, shadow ordering/failure and no-side-effect contract. | `62df33e8015b7010342539bb6b72bd6ba71b1a6e95687a8181f7d11c5f2b6cf6` | self | No consumer migration. |
| `docs/current-progression-transition-decision-implementation.md`, decision maps and baseline inventory | Originals retained where existing | Record Stage 1 bridge and Stage 2/3 gates. | See final verification checksums | documentation review | No runtime authority change outside new writer/repository. |
