# Closed-loop adaptive coach verification

Date: 2026-08-23

## Static and longitudinal results

- Generator: 25 constructed, 5 valid fail-closed, 0 critical violations.
- Longitudinal policy harness: 18 personas/scenarios × 12 weeks = 216 deterministic scenario-weeks.
- Scenario checks: no detected oscillation, runaway prescription, duplicate decision or historical mutation in the harness.
- Important boundary: the harness certifies the explicit policy state machine. It does not yet drive 216 workouts through the complete mounted ledger/orchestrator/reconstruction path; existing production-path tests cover that path in shorter sequences.

## Source verification

- Focused closed-loop suite: 33/33 passing before the longitudinal and presentation additions.
- Longitudinal suite: 3/3 passing.
- Persisted-explanation plus completion/progress presentation: 19/19 passing.
- Clean-runtime TypeScript: passing.
- Web export: passing (Expo 56 Metro export).
- Broad source suite: 393 files passed / 15 failed; 2,457 tests passed / 18 failed. Failures were missing tracked runtime material (`eas.json`, iOS project, architecture doc), protected pre-existing test expectations, and stale generated duration artifacts. None pointed to the closed-loop changes.
- `git diff --check`: passing.

## Native certification blocker

- Available simulators confirmed: iPhone 17 Pro and ASC Narrow iPhone SE.
- Installed staging development client confirmed on iPhone 17 Pro.
- Clean-runtime Metro reached its ready state after a fresh dependency install.
- The installed client continued requesting `localhost:8081` without reaching Metro; Metro received no request.
- A native workspace build with DerivedData in `/tmp` produced no build activity after the initial Xcode invocation and was stopped after a bounded wait, reproducing the File Provider/native source stall.
- Blocker screenshot: `native-blockers/iphone-17-pro-metro-connection-blocker.png`.

No premium screen, before/after visual comparison, interaction count, or smaller-viewport journey is claimed certified from this run.
