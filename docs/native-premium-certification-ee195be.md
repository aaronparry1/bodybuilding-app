# Native premium certification — `ee195be`

Status: in progress. This ledger records only rendered native evidence captured during the `ee195be` certification run. It is not a best-in-class claim.

## Reproducible materialised runtime

The canonical repository in macOS Documents was left in place. A detached Git worktree was materialised at `/Users/aaronparry/ASC-Native-QA-ee195be` from the full commit `ee195be74aa39527b76f8e3f771eaaaca508fb98`. No existing `node_modules` was copied.

Recreation:

```sh
git -C "/Users/aaronparry/Documents/Bodybuilding App" worktree add --detach "/Users/aaronparry/ASC-Native-QA-ee195be" ee195be74aa39527b76f8e3f771eaaaca508fb98
cd "/Users/aaronparry/ASC-Native-QA-ee195be"
PATH=/opt/homebrew/opt/node@22/bin:$PATH npm ci --ignore-scripts
PATH=/opt/homebrew/opt/node@22/bin:$PATH npx pod-install ios
```

Node was `22.23.1`; dependency installation materialised 661 packages from the lockfile. `pod install` completed from the materialised checkout. The only local configuration used for this run was non-secret QA configuration supplied to the build/Metro process.

## Development client proof

The source-built `AdaptiveStrengthCoachProfiling` scheme (`DebugProfiling`) produced:

`/Users/aaronparry/ASC-Native-Derived-ee195be/Build/Products/DebugProfiling-iphonesimulator/AdaptiveStrengthCoachProfiling.app`

Installed identity:

- Bundle identifier: `com.aaronparry.adaptivestrengthcoach.profiling`
- Display name: `Adaptive Strength QA`
- Build: `53`
- URL scheme: `ironlogic-profiling`
- QA build identity: `ee195be`
- QA fixture flags: design QA and premium entitlement enabled; live billing disabled

The initial profiling app crash was `No script URL provided` with `unsanitizedScriptURLString = (null)`. `DebugProfiling` did not define the C preprocessor `DEBUG=1`, so React Native's bundle URL provider supplied no development URL. The profiling-only `ASC_QA` compilation condition now sets the development packager location to `localhost:8081`; it does not add a machine IP to production source behaviour. Release continues to use its packaged `main.jsbundle`.

Metro received `iOS node_modules/expo-router/entry.js` from both simulators and served the 1,936-module current bundle. The visible `Premium QA · billing disabled · ee195be` marker independently identifies the current commit and QA-only entitlement.

## Native visual ledger

Screenshots live under `qa-reports/native-premium-certification/screenshots` in the materialised QA checkout.

| State | Device | Fixture | Evidence | Defect / result | Status |
| --- | --- | --- | --- | --- | --- |
| Current bundle identity | iPhone 17 Pro | `train_first_set` | `qa-identity-17pro.png` | QA identity, billing isolation and commit visible | verified |
| Current bundle identity | narrow iPhone SE viewport | `train_first_set` | `qa-identity-small.png` | Same current bundle loaded on smaller simulator | verified |
| Active first work set, baseline | iPhone 17 Pro | `train_first_set` | `baseline-train-first-set-17pro.png` | False 24-hour elapsed time; current exercise not persistent | fixed |
| Active first work set, baseline | narrow iPhone SE viewport | `train_first_set` | `baseline-train-first-set-small.png` | Exercise/rest context scrolled away above primary action | fixed |
| Active first work set, improved | iPhone 17 Pro | `train_first_set` | `improved-train-first-set-17pro.png` | Current exercise, rest state and set/session position remain visible | verified |
| Active first work set, improved | narrow iPhone SE viewport | `train_first_set` | `improved-train-first-set-small.png` | Primary action and current context coexist on narrow viewport | verified |
| Onboarding, baseline | narrow iPhone SE viewport | clean local state | `qa-identity-small.png` | Primary Continue action began below the viewport | fixed |
| Onboarding, improved | narrow iPhone SE viewport | clean local state | `improved-onboarding-small.png` | Continue is pinned above the safe area while choices scroll | verified |
| Genuine PR completion | iPhone 17 Pro | `completion_pr` | `completion-pr-17pro.png` | Calm completion hierarchy with retained totals | inspected |
| Genuine PR completion | narrow iPhone SE viewport | `completion_pr` | `completion-pr-small.png` | Headline is large but untruncated; metrics remain legible | inspected |
| Release launch without Metro | iPhone 17 Pro | production Release | `release-no-metro-17pro.png` | Packaged bundle launches with no QA banner; retained incompatible training fails closed into recovery | verified |

## Interaction-cost observations

Counts are native actions from the rendered QA journeys, not inferred competitor counts. Consequential actions retain confirmation.

| Task | Baseline | Baseline friction | Improved | Result |
| --- | ---: | --- | ---: | --- |
| Start today's workout | 2 | Open Today action, then confirm/start | 2 | Safe consequence retained |
| Log prescribed load and target reps | 3 | Focus load, focus reps, complete | 3 | Numeric inputs remain explicit |
| Complete an unchanged set | 1 | Primary action could lose exercise context on narrow screen | 1 | Context and action now remain together |
| Move to next set | 0 after completion | State transition is automatic | 0 | No extra navigation action |
| Adjust rest | 1 plus adjustment | Timer lived in scroll content | 1 plus adjustment | Rest status persists in header |
| Minimise and resume | 2 | Global context transition | 2 | Saved active state is retained |
| Complete workout | 2 | Complete then confirm | 2 | Destructive/consequential safety retained |
| Understand next prescription | 1 from completion | Explanation depends on persisted decision | 1 | Canonical explanation remains source |

Current official product evidence sets a clear benchmark: Hevy exposes previous values, set types, supersets and an automatic timer in the logger; its timer starts when a set is marked complete and remains adjustable during training. Alpha Progression presents load, rep and intensity recommendations for every set based on performed training. ASC now meets the persistent-context and automatic-transition baseline on the certified active-set states, but its correction, superset and substitution flows have not yet been action-timed natively and are therefore not certified as matching those products.

- [Hevy feature list](https://www.hevyapp.com/features/)
- [Hevy automatic rest timer](https://www.hevyapp.com/features/workout-rest-timer/)
- [Alpha Progression product and logger](https://alphaprogression.com/)

## Verification snapshot

- Static generator: 25 constructed, 5 fail-closed, 0 critical violations.
- Focused closed loop: 7 files / 37 tests passed.
- TypeScript after native UI changes: passed.
- Focused phone UI, QA production boundary and billing flow: 25 tests passed.
- Broad Vitest baseline: 2,478 / 2,486 assertions passed.
- Broad Vitest after deterministic reconciliation: 2,481 / 2,486 assertions passed, with no new failures.
- Mounted continuity/longitudinal focus: 3 files / 32 tests passed.
- Production Expo config with QA public flags forced on: passed; the production boundary test also passed.
- Web export: passed (1,457 modules).
- Native production Release simulator build: passed. The app contains `main.jsbundle`, has bundle identifier `com.aaronparry.adaptivestrengthcoach`, has no `ASC_QA` binary marker and launches with Metro stopped.

Remaining broad-suite failures:

| Test | Classification | Evidence |
| --- | --- | --- |
| app icon Expo/iOS source string | protected pre-existing source-boundary assertion | Expects `ios.icon` to be the first iOS property; rendered/native icon hash passes |
| mounted repeated-miss regression | real mounted-path defect exposed by a stale assertion | The assertion mistakes an incidental reconstructed target decrease for a coached regression; the persisted decision has no matching regression outcome |
| Train brand boundary | protected pre-existing source-boundary assertion | Expects removed `WorkoutStage` source shape |
| onboarding/Home source boundary | protected pre-existing source-boundary assertion | Expects removed `WorkoutMetricStrip` source shape; onboarding layout expectation remains satisfied |
| Settings simplification | protected pre-existing source-boundary assertion | Expects removed `View Progress` source string |

The mounted repeated-miss failure is not being relabelled as harmless generated evidence. A diagnostic predicate requiring the persisted numeric decision, receipt and material delta to agree found no authorised mounted regression after 45 completed sessions. That explanation-to-decision mismatch remains a release-relevant defect.

The numeric-progression aggregate was regenerated to the current deterministic canonical output (14 evidence-backed future-slot deltas), and the specialist-suitability expectation was reconciled to the current fail-closed `unsuitable` result. Both focused suites pass after reconciliation.

This report remains open until the additional fixtures, mounted longitudinal run, export/release build, accessibility pass and final broad-suite reconciliation are complete.
