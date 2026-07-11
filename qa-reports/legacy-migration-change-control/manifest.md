# Legacy migration change-control manifest

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

| File | SHA-256 |
| --- | --- |
| `docs/legacy-planning-coaching-evidence-intervention-audit.md` | `f7543c9ac8f5dcc5f66d477b4c59afa2d8ebe52ccd2beddfd3bc00b2a2e7904c` |
| `baseline-failures.md` | `8b5926580109a15cdba4a1161e0447f048097ef58eaa0f7d27943b29d82e62c5` |

`manifest.md` is self-modifying and therefore its checksum is reported by the final verification command output rather than embedded recursively.
