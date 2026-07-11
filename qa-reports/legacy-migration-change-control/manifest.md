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

## Created-file checksums at last verification

| File | SHA-256 |
| --- | --- |
| `docs/legacy-planning-coaching-evidence-intervention-audit.md` | `f7543c9ac8f5dcc5f66d477b4c59afa2d8ebe52ccd2beddfd3bc00b2a2e7904c` |
| `baseline-failures.md` | `8b5926580109a15cdba4a1161e0447f048097ef58eaa0f7d27943b29d82e62c5` |

`manifest.md` is self-modifying and therefore its checksum is reported by the final verification command output rather than embedded recursively.
