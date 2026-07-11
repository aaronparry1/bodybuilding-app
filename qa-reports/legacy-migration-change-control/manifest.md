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

| File | SHA-256 |
| --- | --- |
| `docs/legacy-planning-coaching-evidence-intervention-audit.md` | `f7543c9ac8f5dcc5f66d477b4c59afa2d8ebe52ccd2beddfd3bc00b2a2e7904c` |
| `baseline-failures.md` | `8b5926580109a15cdba4a1161e0447f048097ef58eaa0f7d27943b29d82e62c5` |

`manifest.md` is self-modifying and therefore its checksum is reported by the final verification command output rather than embedded recursively.
