# Verification and release decision

Date: 2026-08-08

## Automated evidence

| Gate | Result | Evidence |
|---|---|---|
| Focused release-recovery matrix | pass | 12 files, 70 tests; retained Android data, migration, cloud restore/sync, exercise management, workout lifecycle/discard, timers, navigation, brand boundary and release controls |
| Train active experience | pass | 1 file, 13 tests |
| Full Vitest inventory | conditionally pass | initial run: 393/396 files and 2,407/2,410 tests passed; three 30-second timeouts plus one worker RPC timeout under full load. Isolated rerun with a 120-second ceiling: all 3 files and all 25 tests passed in 1.76 seconds. No assertion failed. |
| Production Expo config | pass | app 1.0.18; Android package `com.aaronparry.adaptivestrengthcoach`, versionCode 111; iOS bundle `com.aaronparry.adaptivestrengthcoach`, build 53 |
| Expo dependency alignment | fail | `expo install --check` reports eight packages below SDK 56 expected patch levels: Expo, build-properties, linking, router, sharing, SQLite, symbols and screens |
| TypeScript | blocked | two fresh `tsc --noEmit` attempts produced no diagnostics or CPU activity and did not exit after 3 and 8 minutes; stopped without claiming success |
| Production web export | blocked | a fresh isolated export produced no output or CPU activity and did not exit after 78 seconds; stopped without claiming success |
| RevenueCat wrapper/native declaration | inspected, artifact gate open | wrappers and lockfile are exactly 10.6.0; installed UI module declares `purchases-hybrid-common-ui:18.28.0`. A resolved native graph/AAB inspection remains required before a new upload. |
| Public privacy and deletion URLs | pass | both canonical URLs returned HTTP 200 on 2026-08-08 |

No test or inspection reproduced a current workout-discard, persistence, migration or workout-colour implementation defect. The validation failures above are toolchain/release-gate findings, not authority to change dependencies or production code in this recovery slice.

## Physical and external gates still missing

- Candidate 111 becoming available to the intended Alpha tester account.
- In-place update of a populated affected Android installation, without uninstall or clear-data.
- Correct user identity, programme, history, next session and active-workout state after update, force-close and reboot.
- Split change, exercise add/swap, start/pause/resume/complete/discard and duplicate-day checks on representative Android and iOS devices.
- Authenticated owner-scoped backup enqueue, verified remote readback, fresh-install/cross-device restore and second-owner isolation.
- Current device screenshots proving mounted workout colours and exact discard interaction outcome.
- Exact Play privacy/data-safety declarations and a resolved native dependency graph for any future artifact.

## Decision

Do not create or upload a new Android or iOS build. Candidate 111 is the only protected retained-device lane and was not queried, installed, promoted, overwritten or discarded. A new artifact would neither supply the missing physical evidence nor cure the current Expo dependency mismatch and stalled typecheck/export gates.

The next owner action is to use the exact Candidate 111 Alpha artifact only after it is available to the intended tester, perform the populated in-place Android upgrade protocol, and return the retained-data, lifecycle, discard and authenticated-backup evidence. If the discard or colour report reproduces, capture the exact route, pre-state, action, result/reason and post-relaunch state before opening a code repair.
